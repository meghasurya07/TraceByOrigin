/**
 * Workspace registry.
 *
 * A workspace is a root directory plus the metadata every other subsystem needs:
 * its git state, its ignore rules, and a stable id. Almost everything else in the
 * engine is workspace-scoped, so this file is deliberately the only place that
 * knows how to turn a directory path into something the rest of the code can use.
 *
 * Two decisions worth stating:
 *
 * **Ids are derived, not random.** A workspace id is a hash of its realpath, so
 * closing Trace and reopening the same folder produces the same id. Random ids
 * would orphan every persisted session on restart.
 *
 * **Ignore rules are layered like git's.** `.gitignore` files compose down the
 * tree — a nested `.gitignore` applies only beneath its own directory — and
 * `ALWAYS_IGNORED_DIRS` is applied unconditionally on top, because a repo that
 * commits its `node_modules` should still not have it walked.
 *
 * Copyright (c) 2026 Origin AI
 */

import { createHash } from "node:crypto";
import { readFile, readdir, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { ErrorCode, RpcError, type DirEntry, type WorkspaceInfo } from "@trace/protocol";
import ignore, { type Ignore } from "ignore";
import { Logger } from "./logger.js";
import { ALWAYS_IGNORED_DIRS, isContained, toPosix } from "./paths.js";

const log = new Logger("workspace");

/**
 * Walk limits.
 *
 * A monorepo with a stale `dist/` can hold a million files. These caps are not
 * about correctness — they exist so a mistyped glob degrades into a truncated
 * result instead of a hung engine.
 */
const MAX_WALK_ENTRIES = 200_000;
const MAX_WALK_DEPTH = 32;

export interface Workspace {
  readonly id: string;
  /** Absolute, realpath-resolved. Every containment check uses this. */
  readonly root: string;
  readonly name: string;
  isGitRepo: boolean;
  gitDir: string | null;
  currentBranch: string | undefined;
  indexStatus: WorkspaceInfo["indexStatus"];
}

export function workspaceIdFor(root: string): string {
  // 12 hex chars ≈ 48 bits. Collision risk across one user's folder list is nil,
  // and short ids keep logs and event payloads readable.
  return createHash("sha256").update(toPosix(root).toLowerCase()).digest("hex").slice(0, 12);
}

export class WorkspaceRegistry {
  private readonly byId = new Map<string, Workspace>();
  /** Ignore matchers, keyed by the directory whose `.gitignore` produced them. */
  private readonly ignoreCache = new Map<string, Ignore | null>();

  async open(root: string): Promise<Workspace> {
    let resolved: string;
    try {
      resolved = await realpath(path.resolve(root));
    } catch (cause) {
      throw new RpcError(ErrorCode.WorkspaceNotFound, `Cannot open "${root}"`, {
        reason: (cause as NodeJS.ErrnoException).code ?? "unknown",
      });
    }

    const info = await stat(resolved);
    if (!info.isDirectory()) {
      throw new RpcError(ErrorCode.InvalidParams, `"${root}" is not a directory`);
    }

    const id = workspaceIdFor(resolved);
    const existing = this.byId.get(id);
    if (existing) {
      // Re-opening is idempotent, but git state may have moved since last time.
      await this.refreshGit(existing);
      return existing;
    }

    const git = await detectGit(resolved);
    const workspace: Workspace = {
      id,
      root: resolved,
      name: path.basename(resolved) || resolved,
      isGitRepo: git.gitDir !== null,
      gitDir: git.gitDir,
      currentBranch: git.branch,
      indexStatus: "absent",
    };
    this.byId.set(id, workspace);
    log.info(`Opened workspace ${workspace.name}`, {
      id,
      root: resolved,
      git: workspace.isGitRepo,
      branch: git.branch,
    });
    return workspace;
  }

  close(workspaceId: string): void {
    const workspace = this.byId.get(workspaceId);
    if (!workspace) return;
    this.byId.delete(workspaceId);
    // Ignore matchers are keyed by directory, so drop everything under this root.
    for (const key of [...this.ignoreCache.keys()]) {
      if (isContained(workspace.root, key)) this.ignoreCache.delete(key);
    }
    log.info(`Closed workspace ${workspace.name}`, { id: workspaceId });
  }

  get(workspaceId: string): Workspace {
    const workspace = this.byId.get(workspaceId);
    if (!workspace) {
      throw new RpcError(ErrorCode.WorkspaceNotFound, `No workspace with id "${workspaceId}"`);
    }
    return workspace;
  }

  find(workspaceId: string | null | undefined): Workspace | undefined {
    return workspaceId ? this.byId.get(workspaceId) : undefined;
  }

  list(): Workspace[] {
    return [...this.byId.values()];
  }

  /** The roots every path resolution is checked against. */
  roots(): string[] {
    return [...this.byId.values()].map((w) => w.root);
  }

  /**
   * The root that contains `absolutePath`, if any.
   *
   * Longest match wins, so a nested workspace beats its parent — otherwise
   * opening both `~/code` and `~/code/app` would attribute every file to `~/code`.
   */
  owning(absolutePath: string): Workspace | undefined {
    let best: Workspace | undefined;
    for (const workspace of this.byId.values()) {
      if (!isContained(workspace.root, absolutePath)) continue;
      if (!best || workspace.root.length > best.root.length) best = workspace;
    }
    return best;
  }

  async toInfo(workspace: Workspace): Promise<WorkspaceInfo> {
    await this.refreshGit(workspace);
    return {
      id: workspace.id,
      root: workspace.root,
      name: workspace.name,
      isGitRepo: workspace.isGitRepo,
      ...(workspace.currentBranch === undefined ? {} : { currentBranch: workspace.currentBranch }),
      indexStatus: workspace.indexStatus,
    };
  }

  private async refreshGit(workspace: Workspace): Promise<void> {
    const git = await detectGit(workspace.root);
    workspace.isGitRepo = git.gitDir !== null;
    workspace.gitDir = git.gitDir;
    workspace.currentBranch = git.branch;
  }

  // -----------------------------------------------------------------------
  // Ignore rules
  // -----------------------------------------------------------------------

  /**
   * True when `absolutePath` should be skipped.
   *
   * Checks the unconditional deny-list first (cheap, no I/O) and only then walks
   * the `.gitignore` chain from the workspace root down to the file's directory.
   */
  async isIgnored(
    workspace: Workspace,
    absolutePath: string,
    isDirectory: boolean,
  ): Promise<boolean> {
    const relative = toPosix(path.relative(workspace.root, absolutePath));
    if (relative === "" || relative.startsWith("..")) return false;

    for (const segment of relative.split("/")) {
      if (ALWAYS_IGNORED_DIRS.has(segment)) return true;
    }

    const dirs = ancestorDirs(workspace.root, path.dirname(absolutePath));
    for (const dir of dirs) {
      const matcher = await this.matcherFor(dir);
      if (!matcher) continue;
      // A `.gitignore` pattern is relative to its own directory.
      const scoped = toPosix(path.relative(dir, absolutePath));
      if (scoped === "" || scoped.startsWith("..")) continue;
      // `ignore` needs a trailing slash to apply directory-only patterns (`build/`).
      const probe = isDirectory ? `${scoped}/` : scoped;
      if (matcher.ignores(probe)) return true;
    }
    return false;
  }

  private async matcherFor(dir: string): Promise<Ignore | null> {
    const cached = this.ignoreCache.get(dir);
    if (cached !== undefined) return cached;

    let matcher: Ignore | null = null;
    try {
      const contents = await readFile(path.join(dir, ".gitignore"), "utf8");
      matcher = ignore().add(contents);
    } catch (cause) {
      if ((cause as NodeJS.ErrnoException).code !== "ENOENT") {
        log.debug("Could not read .gitignore", { dir });
      }
    }
    this.ignoreCache.set(dir, matcher);
    return matcher;
  }

  /** Drop cached ignore rules. Called when a `.gitignore` is edited. */
  invalidateIgnores(dir?: string): void {
    if (dir === undefined) {
      this.ignoreCache.clear();
      return;
    }
    this.ignoreCache.delete(path.resolve(dir));
  }

  // -----------------------------------------------------------------------
  // Walking
  // -----------------------------------------------------------------------

  /** One directory level, ignore-filtered, directories first then alphabetical. */
  async listDir(workspace: Workspace, absoluteDir: string): Promise<DirEntry[]> {
    const dirents = await readdir(absoluteDir, { withFileTypes: true });
    const entries: DirEntry[] = [];

    for (const dirent of dirents) {
      const absolute = path.join(absoluteDir, dirent.name);
      const isDirectory = dirent.isDirectory();
      if (await this.isIgnored(workspace, absolute, isDirectory)) continue;

      const kind: DirEntry["kind"] = dirent.isSymbolicLink()
        ? "symlink"
        : isDirectory
          ? "directory"
          : "file";

      const entry: DirEntry = {
        name: dirent.name,
        path: toPosix(path.relative(workspace.root, absolute)),
        kind,
      };

      if (kind === "file") {
        try {
          const info = await stat(absolute);
          entry.sizeBytes = info.size;
          entry.modifiedAt = info.mtimeMs;
        } catch {
          // Raced with a delete, or a broken symlink. Listing it without a size
          // is more useful than dropping it.
        }
      }
      entries.push(entry);
    }

    entries.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return entries;
  }

  /**
   * Recursively yield every non-ignored file, workspace-relative and posix-slashed.
   *
   * A generator rather than an array: callers that only need the first 50 matches
   * (glob with a limit, the file picker) shouldn't pay for a full traversal, and
   * the indexer wants to stream rather than buffer a monorepo in memory.
   */
  async *walkFiles(
    workspace: Workspace,
    options: { from?: string; maxDepth?: number } = {},
  ): AsyncGenerator<string> {
    const start = options.from ? path.resolve(workspace.root, options.from) : workspace.root;
    const maxDepth = options.maxDepth ?? MAX_WALK_DEPTH;
    let yielded = 0;

    const stack: { dir: string; depth: number }[] = [{ dir: start, depth: 0 }];
    while (stack.length > 0) {
      const frame = stack.pop();
      if (!frame) break;
      if (frame.depth > maxDepth) continue;

      let dirents;
      try {
        dirents = await readdir(frame.dir, { withFileTypes: true });
      } catch {
        // Permission denied or removed mid-walk. Skipping one directory is the
        // right failure mode for a best-effort traversal.
        continue;
      }

      for (const dirent of dirents) {
        const absolute = path.join(frame.dir, dirent.name);
        const isDirectory = dirent.isDirectory();

        // Symlinked directories are not followed: a link to `/` turns the walk
        // into an infinite loop, and a link to a sibling repo silently doubles it.
        if (dirent.isSymbolicLink()) continue;
        if (await this.isIgnored(workspace, absolute, isDirectory)) continue;

        if (isDirectory) {
          stack.push({ dir: absolute, depth: frame.depth + 1 });
        } else if (dirent.isFile()) {
          yield toPosix(path.relative(workspace.root, absolute));
          if (++yielded >= MAX_WALK_ENTRIES) {
            log.warn("Walk hit entry cap; results truncated", {
              root: workspace.root,
              cap: MAX_WALK_ENTRIES,
            });
            return;
          }
        }
      }
    }
  }
}

/** Root-to-leaf list of directories, so outer `.gitignore` rules apply first. */
function ancestorDirs(root: string, leaf: string): string[] {
  const chain: string[] = [];
  let current = path.resolve(leaf);
  const stop = path.resolve(root);
  for (;;) {
    chain.push(current);
    if (current === stop) break;
    const parent = path.dirname(current);
    if (parent === current || !isContained(stop, parent)) break;
    current = parent;
  }
  return chain.reverse();
}

/**
 * Find the git dir and current branch without shelling out.
 *
 * Reading `.git/HEAD` costs one syscall and works when git isn't on PATH — worth
 * it because this runs on every `workspace/list`, which the UI polls. Handles the
 * `gitdir:` pointer file that worktrees and submodules use, and the detached-HEAD
 * case where HEAD holds a bare sha.
 */
async function detectGit(root: string): Promise<{ gitDir: string | null; branch?: string }> {
  const dotGit = path.join(root, ".git");
  let gitDir: string;

  try {
    const info = await stat(dotGit);
    if (info.isDirectory()) {
      gitDir = dotGit;
    } else {
      const pointer = await readFile(dotGit, "utf8");
      const match = /^gitdir:\s*(.+)$/m.exec(pointer.trim());
      if (!match?.[1]) return { gitDir: null };
      const target = match[1].trim();
      gitDir = path.isAbsolute(target) ? target : path.resolve(root, target);
    }
  } catch {
    return { gitDir: null };
  }

  try {
    const head = (await readFile(path.join(gitDir, "HEAD"), "utf8")).trim();
    const ref = /^ref:\s*refs\/heads\/(.+)$/.exec(head);
    if (ref?.[1]) return { gitDir, branch: ref[1] };
    // Detached HEAD: show an abbreviated sha, which is what git itself does.
    if (/^[0-9a-f]{7,40}$/i.test(head)) return { gitDir, branch: `detached@${head.slice(0, 7)}` };
    return { gitDir };
  } catch {
    // A repo with no commits yet has no readable HEAD ref target. Still a repo.
    return { gitDir };
  }
}
