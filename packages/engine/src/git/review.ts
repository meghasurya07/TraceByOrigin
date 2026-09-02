/**
 * Review: keeping or discarding the agent's work, one file or one hunk at a time.
 *
 * A checkpoint restores a whole turn. That is the right granularity for "undo that", and
 * the wrong one for the far more common "three of these four edits are good". Review is
 * the finer operation, built on the same shadow-git store so the two can never hold
 * different opinions about what changed.
 *
 * The whole design is one idea: **a baseline is a pointer, and accepting advances it.**
 *
 * Per session, per path, the baseline names the shadow commit whose contents the user last
 * signed off on; unset paths fall back to the session's oldest checkpoint, which is the
 * work tree as it stood before the agent touched anything. "What needs review" is then
 * just "what differs from that", and accepting a file re-points it at a fresh commit of
 * the file as it is now. The alternative — a `reviewed: true` flag per path — looks
 * equivalent and breaks on the second edit: the agent changes an accepted file again, and
 * the flag has no way to show a diff against what was approved rather than against the
 * start of the session.
 *
 * Two deliberate asymmetries with the rest of the engine:
 *
 * **The set is not filtered to files the edit tools touched.** `FileStateTracker` knows
 * about `write_file` and `edit_file`; it knows nothing about an agent that ran
 * `npm run format` or `sed -i` through the terminal, which is exactly the change a user
 * most wants to see before it lands. So the question answered here is "what is different
 * from the last thing you approved", which cannot under-report. The price is that the
 * user's own hand-edit between turns shows up too — the safe direction to be wrong in.
 *
 * **Counts and hunks come from `diff.ts`, never from git.** `git diff --numstat` would be
 * one process instead of a read per file, and its numbers would disagree with the `+N/-M`
 * already shown on the transcript entry and in the permission prompt. One diff
 * implementation, one set of numbers, one hunk numbering that `revertHunk` can honour.
 *
 * Copyright (c) 2026 Origin AI
 */

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ReviewFile } from "@trace/protocol";

import { diffHunks, diffStats, revertHunk } from "../diff.js";
import { Logger } from "../logger.js";
import { looksBinary, toPosix } from "../paths.js";
import type { Workspace } from "../workspace.js";
import type { CheckpointManager } from "./checkpoint.js";
import { operationInProgress } from "./status.js";

const log = new Logger("review");

/**
 * Context lines in a reviewed hunk. Fixed, not a parameter.
 *
 * `diff.ts` merges changes closer together than `2·context` into one hunk, so the number
 * decides how many hunks a file has and therefore what index 2 means. A client that listed
 * at 3 and reverted at 1 would revert the wrong lines. Pinning it here means the round trip
 * cannot be mismatched.
 */
export const REVIEW_CONTEXT = 3;

/**
 * Per-side byte cap for a line-by-line diff.
 *
 * Above this the file is still listed and still revertible wholesale — the operation that
 * matters — but no hunks are computed. The LCS table in `diff.ts` is already bounded by
 * line count; this bounds the work before that, since reading and splitting a 200 MB blob
 * to discover it is too large to align is the expensive part.
 */
const MAX_REVIEW_BYTES = 2 * 1024 * 1024;

/**
 * Cap on files enumerated in one listing.
 *
 * Each one costs a git read, and a review drawer showing four hundred files is not a
 * review surface anyway. Past the cap the response says `truncated` rather than quietly
 * showing a prefix as if it were everything.
 */
const MAX_REVIEW_FILES = 200;

/** Concurrent baseline reads. Each is a process spawn; the pool keeps a big diff from being a fork bomb. */
const READ_CONCURRENCY = 8;

/** `path` → shadow commit the user last signed off on. Absent means "use the session baseline". */
export type ReviewBaselines = Readonly<Record<string, string>>;

export interface ReviewContext {
  manager: CheckpointManager;
  workspace: Workspace;
  /** Where a path with no entry in `baselines` is compared against. */
  defaultBaseline: string;
  baselines: ReviewBaselines;
}

/**
 * Every path that differs from its baseline.
 *
 * Sorted by path, capped at {@link MAX_REVIEW_FILES}. `truncated` means there were more.
 */
export async function listReview(
  context: ReviewContext,
): Promise<{ files: ReviewFile[]; truncated: boolean }> {
  const candidates = await candidatePaths(context);
  const capped = candidates.slice(0, MAX_REVIEW_FILES);
  const described = await mapLimit(capped, READ_CONCURRENCY, (relativePath) =>
    describeFile(context, relativePath),
  );
  return {
    files: described.filter((file): file is ReviewFile => file !== null),
    truncated: candidates.length > capped.length,
  };
}

/**
 * The union of "differs from the session baseline" and "has been accepted before".
 *
 * The second half looks redundant and is not. An accepted path's baseline is *newer* than
 * the session's, so a file the agent edited, the user accepted, and the agent then reverted
 * to its original contents matches the session baseline exactly — invisible to the diff —
 * while differing from what was approved. That is a change the user needs to see.
 */
async function candidatePaths(context: ReviewContext): Promise<string[]> {
  const changed = await context.manager.changedSince(context.defaultBaseline);
  const paths = new Set(changed.map((change) => change.path));
  for (const accepted of Object.keys(context.baselines)) paths.add(accepted);
  return [...paths].sort((a, b) => a.localeCompare(b));
}

/** One file's review state, or null when it matches its baseline after all. */
async function describeFile(
  context: ReviewContext,
  relativePath: string,
): Promise<ReviewFile | null> {
  const baseline = context.baselines[relativePath] ?? context.defaultBaseline;
  const [before, after] = await Promise.all([
    context.manager.fileAt(baseline, relativePath),
    readCurrent(context.workspace, relativePath),
  ]);

  // Neither side exists: an accepted path whose file was since deleted, and the deletion
  // itself was accepted. Nothing to review.
  if (before === null && after === null) return null;
  if (before !== null && after !== null && before.equals(after)) return null;

  const status = before === null ? "added" : after === null ? "deleted" : "modified";
  const unreviewable = classify(before, after);
  if (unreviewable !== null) {
    // No counts: `added`/`removed` are line counts, and neither a binary file nor one too
    // large to align has a meaningful line delta to report. The client branches on
    // `unreviewable` and shows the reason instead of a number.
    return { path: relativePath, status, added: 0, removed: 0, hunks: [], unreviewable };
  }

  const oldText = before === null ? "" : before.toString("utf8");
  const newText = after === null ? "" : after.toString("utf8");
  const stats = diffStats(oldText, newText);
  return {
    path: relativePath,
    status,
    added: stats.added,
    removed: stats.removed,
    hunks: diffHunks(oldText, newText, { context: REVIEW_CONTEXT }),
    unreviewable: null,
  };
}

/**
 * Why a file cannot be shown line-by-line, or null when it can.
 *
 * `looksBinary` is the only binary verdict in the engine — `fs/read`, the edit tools, and
 * `git/status` all use it — so review agrees with them by construction. The round-trip
 * check catches what a NUL sniff cannot: a file that is valid Latin-1 and invalid UTF-8
 * has no NUL bytes, decodes to replacement characters, and re-encodes to *different bytes*.
 * Diffing that is harmless; a hunk revert then writing it back is silent corruption of the
 * user's file, so the check happens here, once, ahead of both.
 */
function classify(before: Buffer | null, after: Buffer | null): ReviewFile["unreviewable"] {
  for (const side of [before, after]) {
    if (side === null) continue;
    if (side.byteLength > MAX_REVIEW_BYTES) return "too_large";
  }
  for (const side of [before, after]) {
    if (side === null) continue;
    if (looksBinary(side)) return "binary";
    if (!Buffer.from(side.toString("utf8"), "utf8").equals(side)) return "binary";
  }
  return null;
}

/**
 * Put a path — or one hunk of it — back the way its baseline has it.
 *
 * Returns the path's remaining review state, so a client never has to guess and never has
 * to re-list: null once the file matches its baseline again, otherwise a fresh hunk list
 * with re-numbered indexes.
 */
export async function revertInReview(
  context: ReviewContext,
  relativePath: string,
  hunk?: { index: number; header: string },
): Promise<ReviewFile | null> {
  // The same refusal `restore` makes, for the same reason: writing files underneath a
  // half-finished rebase leaves the user somewhere git itself cannot explain.
  if (await operationInProgress(context.workspace)) {
    throw new Error(
      "A rebase, merge, or cherry-pick is in progress. Finish or abort it before reverting.",
    );
  }

  const posix = toPosix(relativePath);
  const baseline = context.baselines[posix] ?? context.defaultBaseline;
  if (hunk === undefined) {
    await context.manager.restorePath(baseline, posix);
    log.debug(`Reverted ${posix} to ${baseline.slice(0, 8)}`);
  } else {
    await revertOneHunk(context, posix, baseline, hunk);
  }
  return describeFile(context, posix);
}

async function revertOneHunk(
  context: ReviewContext,
  posix: string,
  baseline: string,
  hunk: { index: number; header: string },
): Promise<void> {
  const [before, after] = await Promise.all([
    context.manager.fileAt(baseline, posix),
    readCurrent(context.workspace, posix),
  ]);
  if (classify(before, after) !== null) {
    throw new Error(`${posix} cannot be reverted hunk by hunk. Revert the whole file instead.`);
  }

  const oldText = before === null ? "" : before.toString("utf8");
  const newText = after === null ? "" : after.toString("utf8");
  const next = revertHunk(oldText, newText, hunk.index, {
    context: REVIEW_CONTEXT,
    expectHeader: hunk.header,
  });
  if (next === null) {
    // Either the index is gone or the header no longer matches. Both mean the same thing
    // to the user, and the honest answer is to say so rather than revert lines they did
    // not point at.
    throw new Error(`${posix} has changed since it was listed. Refresh and try again.`);
  }

  const absolute = path.resolve(context.workspace.root, posix);
  if (next === "" && before === null) {
    // The file did not exist in the baseline and reverting its only hunk emptied it. An
    // empty file where there was none is not what the baseline says; no file is.
    await rm(absolute, { force: true });
  } else {
    // The directory can be missing when the reverted hunk is the deletion of the last file
    // in it — `restorePath`'s `rm` leaves an empty tree behind, and git prunes those.
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, next, "utf8");
  }
  log.debug(`Reverted hunk ${hunk.index} of ${posix}`);
}

/**
 * A commit of the work tree that accepted paths can be re-pointed at.
 *
 * Labelled under a `review` session id so it stays out of the real session's
 * `checkpoint/list` — the same trick `restore` uses for its safety snapshot. Returns null
 * when the commit could not be written, in which case nothing is accepted: a baseline
 * pointing at a commit that does not exist would make every later diff fail.
 */
export async function acceptBaseline(manager: CheckpointManager): Promise<string | null> {
  const created = await manager.create({
    sessionId: "review",
    turnId: "accept",
    label: "Reviewed",
  });
  return created?.id ?? null;
}

/** Read a work-tree file, or null when it is not there. */
async function readCurrent(workspace: Workspace, relativePath: string): Promise<Buffer | null> {
  try {
    return await readFile(path.resolve(workspace.root, relativePath));
  } catch {
    // ENOENT for a deleted file, EISDIR for a path replaced by a directory, EACCES for one
    // the user cannot read. All three mean "no reviewable content here".
    return null;
  }
}

/** Map with at most `limit` promises in flight, preserving input order. */
async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  work: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await work(items[index]!);
    }
  });
  await Promise.all(workers);
  return results;
}
