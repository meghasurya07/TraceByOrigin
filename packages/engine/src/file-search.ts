/**
 * Fuzzy path matching for the `@` context picker.
 *
 * A typeahead, not a search. `search/text` answers "which files contain this string" and
 * the `glob` tool answers "which files match this pattern"; this answers the different
 * question of "which file did the user mean by these seven characters", which is a
 * ranking problem rather than a filtering one. That is why the engine owns the ordering
 * and hands surfaces an opaque `score`: it is the only side that knows the ignore rules,
 * and two surfaces disagreeing about the best match would be worse than either ordering.
 *
 * ## The two costs, and what is done about them
 *
 * **Walking.** A full `walkFiles` on a large repo is tens of thousands of `stat`-free
 * dirents and takes long enough that doing it per keystroke would make the menu useless.
 * So a walk produces a *snapshot* that is reused for `CACHE_TTL_MS`, and `invalidate`
 * exists for the cases where staleness would be visible (a file the agent just wrote).
 *
 * **Scoring.** Every keystroke scores every candidate. That is a linear scan over up to
 * `MAX_CACHED_ENTRIES` strings, so the inner loop is written to allocate nothing: the
 * lowercase form of each path is precomputed at snapshot time, matching runs on
 * `charCodeAt`, and the basename offset is stored rather than recomputed with `split`.
 *
 * ## Ranking
 *
 * Two alignments are scored per candidate — one over the whole path and one restricted to
 * the basename — and the better wins. Full dynamic programming (what fzy does) would be
 * more accurate and roughly fifty times slower; the two-pass approximation gets the case
 * that actually matters, which is that typing `prombar` should find
 * `apps/desktop/src/renderer/components/PromptBar.tsx` and rank it above any file whose
 * *directories* happen to spell the same letters.
 *
 * Copyright (c) 2026 Origin AI
 */

import type { FileCandidate } from "@trace/protocol";
import { Logger } from "./logger.js";
import type { Workspace, WorkspaceRegistry } from "./workspace.js";

const log = new Logger("file-search");

/**
 * How long a walk is trusted.
 *
 * Long enough that a burst of typing costs one walk, short enough that a file created in
 * another window shows up without the user wondering why it does not. `invalidate` covers
 * the writes this process knows about, so this only has to cover the ones it does not.
 */
const CACHE_TTL_MS = 10_000;

/**
 * Cap on entries held per workspace.
 *
 * `walkFiles` already stops at 200k, but this cache keeps two strings and an object per
 * entry, so the memory ceiling has to be lower than the walk ceiling. 50k paths is around
 * 15 MB and is well past any repo where a fuzzy picker is still the right affordance.
 */
const MAX_CACHED_ENTRIES = 50_000;

const DEFAULT_LIMIT = 40;
const MAX_LIMIT = 200;

/**
 * Queries longer than this are truncated rather than rejected.
 *
 * Someone has pasted a paragraph after an `@`. Scoring 50k candidates against 4 KB of
 * text is pure waste, and the first 128 characters already decide the answer.
 */
const MAX_QUERY_CHARS = 128;

// Scoring weights. Tuned by hand against this repo's own file list; the absolute values
// are meaningless, only their ratios matter.
const BONUS_CONSECUTIVE = 8;
/** A match right after a separator or at a camelCase hump — where a human would start. */
const BONUS_BOUNDARY = 10;
const BONUS_FIRST_CHAR = 12;
/** Per matched character that lands in the basename rather than a directory. */
const BONUS_IN_BASENAME = 6;
/** Applied once when the entire query fits inside the basename. */
const BONUS_BASENAME_ONLY = 15;
/** The query appears verbatim somewhere in the path. */
const BONUS_SUBSTRING = 12;
/** The basename *starts* with the query — the strongest signal there is. */
const BONUS_BASENAME_PREFIX = 26;
const PENALTY_GAP_FIRST = 3;
const PENALTY_GAP_EXTRA = 1;
/**
 * Shorter paths win ties.
 *
 * Small enough that it never overrides a real match-quality difference, large enough that
 * `src/index.ts` beats `packages/x/src/deeply/nested/index.ts` when both match equally.
 */
const PENALTY_PER_CHAR = 0.05;

/**
 * One candidate, pre-chewed.
 *
 * `lower` is stored rather than computed because `toLowerCase()` allocates, and allocating
 * once per candidate per keystroke is the difference between a menu that feels instant and
 * one that stutters on a monorepo.
 */
interface Entry {
  /** Workspace-relative, posix-slashed. */
  readonly path: string;
  readonly lower: string;
  /** Index in `path` where the basename begins. */
  readonly nameStart: number;
  /** Separator count. Only used for the pre-typing ordering, and cheaper stored. */
  readonly depth: number;
  readonly kind: "file" | "directory";
}

interface Snapshot {
  readonly files: Entry[];
  readonly dirs: Entry[];
  readonly at: number;
  /** True when the walk hit `MAX_CACHED_ENTRIES`, so results can say so. */
  readonly capped: boolean;
}

export interface FileSearchParams {
  query: string;
  limit?: number;
  workspaceId?: string;
  includeDirectories?: boolean;
}

export class FileSearch {
  private readonly snapshots = new Map<string, Snapshot>();
  /**
   * Walks in flight, keyed by workspace id.
   *
   * The picker fires a request per keystroke, so without this a fast typist starts five
   * concurrent walks of the same tree and the first four are thrown away. Sharing the
   * promise makes the second through fifth requests free.
   */
  private readonly walking = new Map<string, Promise<Snapshot>>();

  constructor(private readonly workspaces: WorkspaceRegistry) {}

  /** Drop cached paths. No argument drops everything. */
  invalidate(workspaceId?: string): void {
    if (workspaceId === undefined) {
      this.snapshots.clear();
      return;
    }
    this.snapshots.delete(workspaceId);
  }

  async search(params: FileSearchParams): Promise<{
    candidates: FileCandidate[];
    truncated: boolean;
  }> {
    const limit = Math.max(1, Math.min(MAX_LIMIT, params.limit ?? DEFAULT_LIMIT));
    const targets =
      params.workspaceId === undefined
        ? this.workspaces.list()
        : [this.workspaces.get(params.workspaceId)];
    if (targets.length === 0) return { candidates: [], truncated: false };

    // Trimmed, not just lowercased: a trailing space in an `@` token means the user has
    // moved on, and a leading one is a paste artefact.
    const query = params.query.trim().slice(0, MAX_QUERY_CHARS).toLowerCase();
    const withDirs = params.includeDirectories === true;

    // The instant `@` is typed there is nothing to rank, and scoring every entry against
    // an empty query to sort by nothing would allocate a 50k-element array to throw away.
    if (query === "") return this.head(targets, limit, withDirs);

    const scored: { candidate: FileCandidate; entry: Entry }[] = [];
    let capped = false;

    for (const workspace of targets) {
      const snapshot = await this.snapshotFor(workspace);
      capped = capped || snapshot.capped;
      const entries = withDirs ? [...snapshot.files, ...snapshot.dirs] : snapshot.files;

      for (const entry of entries) {
        const score = scoreEntry(query, entry);
        if (score === null) continue;
        scored.push({
          entry,
          candidate: {
            path: entry.path,
            name: entry.path.slice(entry.nameStart),
            kind: entry.kind,
            workspaceId: workspace.id,
            score,
          },
        });
      }
    }

    // Ties are broken by path length and then lexically, so the same query always returns
    // the same order — a picker whose rows reshuffle between identical keystrokes reads as
    // a bug even when every row is correct.
    scored.sort((a, b) => {
      if (a.candidate.score !== b.candidate.score) return b.candidate.score - a.candidate.score;
      if (a.entry.path.length !== b.entry.path.length) {
        return a.entry.path.length - b.entry.path.length;
      }
      return a.entry.path < b.entry.path ? -1 : a.entry.path > b.entry.path ? 1 : 0;
    });

    return {
      candidates: scored.slice(0, limit).map((row) => row.candidate),
      truncated: capped || scored.length > limit,
    };
  }

  /**
   * What the menu shows before anything is typed.
   *
   * Ordered shallowest-first, which the snapshot already is. Recency would be the better
   * answer — it is what a person means by "the files I care about" — but the engine has no
   * open-file history and mtime is a poor stand-in (a `pnpm install` touches every
   * `package.json`), so the honest default is a stable, predictable list. When session
   * history grows a recently-touched set, this is the one function that changes.
   */
  private async head(
    targets: readonly Workspace[],
    limit: number,
    withDirs: boolean,
  ): Promise<{ candidates: FileCandidate[]; truncated: boolean }> {
    const candidates: FileCandidate[] = [];
    let truncated = false;

    // Round-robin rather than concatenated, so opening two folders does not mean the
    // second one's files are all below the fold.
    const lists: { workspace: Workspace; entries: Entry[] }[] = [];
    for (const workspace of targets) {
      const snapshot = await this.snapshotFor(workspace);
      truncated = truncated || snapshot.capped;
      lists.push({
        workspace,
        entries: withDirs ? [...snapshot.dirs, ...snapshot.files] : snapshot.files,
      });
    }

    for (let index = 0; candidates.length < limit; index++) {
      let progressed = false;
      for (const { workspace, entries } of lists) {
        const entry = entries[index];
        if (entry === undefined) continue;
        progressed = true;
        candidates.push({
          path: entry.path,
          name: entry.path.slice(entry.nameStart),
          kind: entry.kind,
          workspaceId: workspace.id,
          score: 0,
        });
        if (candidates.length >= limit) break;
      }
      if (!progressed) return { candidates, truncated };
    }
    return { candidates, truncated: true };
  }

  /**
   * A snapshot, walking only if the cached one has aged out.
   *
   * The in-flight map matters more than the cache does: a keystroke arrives every ~80 ms
   * and a cold walk of a large repo takes longer than that, so without deduplication the
   * first four requests of a session each start their own traversal.
   */
  private async snapshotFor(workspace: Workspace): Promise<Snapshot> {
    const cached = this.snapshots.get(workspace.id);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached;

    const inflight = this.walking.get(workspace.id);
    if (inflight) return inflight;

    const walk = this.walk(workspace)
      .then((snapshot) => {
        this.snapshots.set(workspace.id, snapshot);
        return snapshot;
      })
      .finally(() => {
        this.walking.delete(workspace.id);
      });
    this.walking.set(workspace.id, walk);
    return walk;
  }

  private async walk(workspace: Workspace): Promise<Snapshot> {
    const started = Date.now();
    const files: Entry[] = [];
    const dirNames = new Set<string>();
    let capped = false;

    for await (const relative of this.workspaces.walkFiles(workspace)) {
      if (files.length >= MAX_CACHED_ENTRIES) {
        capped = true;
        break;
      }
      files.push(makeEntry(relative, "file"));

      // Every parent of a non-ignored file is itself non-ignored, so the directory list
      // falls out of the file walk for one `lastIndexOf` per level instead of a second
      // traversal. The only thing it misses is an empty directory, and nobody @-mentions
      // one of those. The `break` is safe because this loop always inserts a full
      // ancestor chain, so a hit means every shorter prefix is already present.
      let cut = relative.lastIndexOf("/");
      while (cut > 0) {
        const dir = relative.slice(0, cut);
        if (dirNames.has(dir)) break;
        dirNames.add(dir);
        cut = dir.lastIndexOf("/");
      }
    }

    const dirs = [...dirNames].map((dir) => makeEntry(dir, "directory"));
    files.sort(byDepthThenPath);
    dirs.sort(byDepthThenPath);

    log.debug(`Indexed ${workspace.name} for the picker`, {
      files: files.length,
      dirs: dirs.length,
      ms: Date.now() - started,
      capped,
    });
    return { files, dirs, at: Date.now(), capped };
  }
}

function makeEntry(relative: string, kind: Entry["kind"]): Entry {
  const cut = relative.lastIndexOf("/");
  let depth = 0;
  for (let index = 0; index < relative.length; index++) {
    if (relative.charCodeAt(index) === 47) depth++;
  }
  return { path: relative, lower: relative.toLowerCase(), nameStart: cut + 1, depth, kind };
}

function byDepthThenPath(a: Entry, b: Entry): number {
  if (a.depth !== b.depth) return a.depth - b.depth;
  return a.lower < b.lower ? -1 : a.lower > b.lower ? 1 : 0;
}

/**
 * Best score for `query` against one entry, or `null` when it does not match at all.
 *
 * Two alignments are tried: the whole path, and the basename alone. The second exists
 * because the first is biased towards long paths — `packages/protocol/src/methods.ts`
 * contains the letters of `pro`, `sr`, and `met` several times over in its directories,
 * and a single left-to-right alignment will happily spell a query out of them and rank
 * that above a file actually *named* for the query.
 */
function scoreEntry(query: string, entry: Entry): number | null {
  const whole = alignAndScore(query, entry, 0);
  const inName =
    entry.nameStart === 0 ? null : alignAndScore(query, entry, entry.nameStart);

  let best: number;
  if (inName === null) {
    if (whole === null) return null;
    best = whole;
  } else {
    const promoted = inName + BONUS_BASENAME_ONLY;
    best = whole === null ? promoted : Math.max(whole, promoted);
  }

  // Contiguity bonuses, applied once rather than per character. `indexOf` on an already
  // lowercased string is a memchr in the engine and cheaper than it looks.
  if (entry.lower.startsWith(query, entry.nameStart)) best += BONUS_BASENAME_PREFIX;
  else if (entry.lower.includes(query)) best += BONUS_SUBSTRING;

  return best - entry.path.length * PENALTY_PER_CHAR;
}

/**
 * Score one alignment of `query` into `entry.lower` at or after `from`, or `null` when it
 * is not a subsequence there.
 *
 * The forward pass finds the earliest position the query can finish at; the scoring pass
 * then walks *backwards* from there, which pulls every character as late as it will go and
 * so rewards the tightest cluster rather than the leftmost one. `abc` against
 * `a-b-c/abc.ts` scores the trailing run, which is what a person means by it.
 *
 * Walking backwards also removes the position array entirely: consecutiveness and gap size
 * are symmetric, so each character can be scored against the one *after* it as easily as
 * the one before, and the whole function allocates nothing.
 */
function alignAndScore(query: string, entry: Entry, from: number): number | null {
  const lower = entry.lower;
  const length = query.length;

  let matched = 0;
  let end = -1;
  for (let index = from; index < lower.length && matched < length; index++) {
    if (lower.charCodeAt(index) === query.charCodeAt(matched)) {
      matched++;
      end = index;
    }
  }
  if (matched < length) return null;

  let score = 0;
  /** Position of the character matched one step later, or -1 for the last one. */
  let next = -1;
  let cursor = end;

  for (let q = length - 1; q >= 0; q--) {
    while (cursor >= from && lower.charCodeAt(cursor) !== query.charCodeAt(q)) cursor--;
    // Unreachable: the forward pass proved an alignment exists inside `[from, end]`.
    if (cursor < from) return null;

    score += 1;
    if (next >= 0) {
      const skipped = next - cursor - 1;
      if (skipped === 0) score += BONUS_CONSECUTIVE;
      else score -= PENALTY_GAP_FIRST + (skipped - 1) * PENALTY_GAP_EXTRA;
    }
    if (cursor === 0) score += BONUS_FIRST_CHAR;
    else if (isBoundary(entry.path, cursor)) score += BONUS_BOUNDARY;
    if (cursor >= entry.nameStart) score += BONUS_IN_BASENAME;

    next = cursor;
    cursor--;
  }
  return score;
}

/**
 * True when `index` begins a word a human would type from.
 *
 * Reads the original-case path rather than the lowercased one, because the camelCase hump
 * in `PromptBar` is the whole point and lowercasing destroys it.
 */
function isBoundary(target: string, index: number): boolean {
  const previous = target.charCodeAt(index - 1);
  // `/` `\` `-` `_` `.` space — every separator a path or an identifier uses.
  if (
    previous === 47 ||
    previous === 92 ||
    previous === 45 ||
    previous === 95 ||
    previous === 46 ||
    previous === 32
  ) {
    return true;
  }
  const wasLowerOrDigit =
    (previous >= 97 && previous <= 122) || (previous >= 48 && previous <= 57);
  const current = target.charCodeAt(index);
  return wasLowerOrDigit && current >= 65 && current <= 90;
}
