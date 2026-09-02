/**
 * Reading a repository's state: `git/status` and `git/diff`.
 *
 * Both are read-only. Nothing in this file writes to the index, moves HEAD, or creates a
 * commit — the user's git is theirs, and an agent product that quietly stages things is one
 * nobody trusts twice. Checkpointing, which does commit, does it in a shadow repo that the
 * user's git never sees; see `checkpoint.ts`.
 *
 * **Why `--porcelain=v2 -z`.** The human-readable output of `git status` is explicitly not
 * a stable interface, and the v1 porcelain format cannot distinguish a rename's two paths
 * from a filename containing a tab. v2 is versioned, and `-z` means no path is ever
 * C-quoted, so a file called `"weird name".txt` parses like any other.
 *
 * Copyright (c) 2026 Origin AI
 */

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { ErrorCode, RpcError, type GitFileStatus, type GitStatusResult } from "@trace/protocol";
import { unifiedDiff } from "../diff.js";
import { Logger } from "../logger.js";
import { looksBinary, toPosix } from "../paths.js";
import type { Workspace } from "../workspace.js";
import { git, runGit } from "./run.js";

const log = new Logger("git:status");

/**
 * Files whose presence means a multi-step git operation is half-finished.
 *
 * Checked because a checkpoint restore during a rebase would drop the user into a state
 * git itself cannot reason about — the UI needs to be able to grey the button out.
 */
const IN_PROGRESS_MARKERS = [
  "rebase-merge",
  "rebase-apply",
  "MERGE_HEAD",
  "CHERRY_PICK_HEAD",
  "REVERT_HEAD",
  "BISECT_LOG",
];

export async function gitStatus(workspace: Workspace): Promise<GitStatusResult> {
  if (!workspace.isGitRepo) {
    throw new RpcError(ErrorCode.InvalidParams, `"${workspace.name}" is not a git repository.`);
  }

  // `--untracked-files=all` rather than the default `normal`: the default collapses a new
  // directory into one entry, which is exactly wrong when the agent has just scaffolded
  // one and the user wants to review the files inside it.
  const raw = await git(["status", "--porcelain=v2", "--branch", "--untracked-files=all", "-z"], {
    cwd: workspace.root,
  });

  const parsed = parseStatus(raw);
  return {
    branch: parsed.branch ?? workspace.currentBranch ?? "(unknown)",
    ahead: parsed.ahead,
    behind: parsed.behind,
    files: parsed.files,
    operationInProgress: await operationInProgress(workspace),
  };
}

interface ParsedStatus {
  branch: string | undefined;
  ahead: number;
  behind: number;
  files: GitFileStatus[];
}

/**
 * Parse `--porcelain=v2 -z`.
 *
 * Records are NUL-terminated, except that a rename record's original path is a *second*
 * NUL-terminated field immediately after it — the one place the format needs lookahead,
 * and the reason this is a hand-rolled loop rather than a `map` over split output.
 */
export function parseStatus(raw: string): ParsedStatus {
  const records = raw.split("\0");
  const result: ParsedStatus = { branch: undefined, ahead: 0, behind: 0, files: [] };

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (record === undefined || record === "") continue;

    if (record.startsWith("# ")) {
      readHeader(record.slice(2), result);
      continue;
    }

    const kind = record[0];
    if (kind === "?") {
      result.files.push({ path: record.slice(2), staged: false, status: "untracked" });
      continue;
    }
    // `!` is an ignored file. Only reported with `--ignored`, which we do not pass, but
    // skipped explicitly so turning that on later cannot flood the review surface.
    if (kind === "!") continue;

    if (kind === "u") {
      // A conflict is neither staged nor unstaged; it is a state the user has to resolve.
      const filePath = record.split(" ").slice(10).join(" ");
      if (filePath !== "") {
        result.files.push({ path: filePath, staged: false, status: "conflicted" });
      }
      continue;
    }

    if (kind !== "1" && kind !== "2") continue;

    // Fields are space-separated and fixed in count, so the path — which may itself
    // contain spaces — is everything after the last one.
    const fieldCount = kind === "1" ? 8 : 9;
    const fields = record.split(" ");
    const filePath = fields.slice(fieldCount).join(" ");
    if (kind === "2") {
      // Consume the original path. Recorded nowhere yet: the protocol's GitFileStatus has
      // one path, and "renamed" plus the new name is what a review list shows.
      i++;
    }
    if (filePath === "") continue;

    const xy = fields[1] ?? "..";
    const staged = xy[0] ?? ".";
    const unstaged = xy[1] ?? ".";
    if (staged !== ".") {
      result.files.push({ path: filePath, staged: true, status: statusFromCode(staged, kind) });
    }
    if (unstaged !== ".") {
      result.files.push({ path: filePath, staged: false, status: statusFromCode(unstaged, kind) });
    }
  }

  return result;
}

function readHeader(header: string, into: ParsedStatus): void {
  if (header.startsWith("branch.head ")) {
    const name = header.slice("branch.head ".length).trim();
    // Git writes the literal `(detached)`; leaving it as-is is what the user sees in
    // their own terminal, so it needs no translation here.
    into.branch = name;
    return;
  }
  if (header.startsWith("branch.ab ")) {
    const match = /\+(\d+)\s+-(\d+)/.exec(header);
    into.ahead = Number(match?.[1] ?? 0);
    into.behind = Number(match?.[2] ?? 0);
  }
}

/**
 * One porcelain status letter to the protocol's vocabulary.
 *
 * `C` (copied) reports as added and `T` (typechange) as modified: both are real git states
 * with no protocol equivalent, and inventing one for a case the UI has no design for would
 * be worse than the nearest honest answer.
 */
function statusFromCode(code: string, kind: string): GitFileStatus["status"] {
  if (kind === "2") return "renamed";
  switch (code) {
    case "A":
      return "added";
    case "D":
      return "deleted";
    case "R":
      return "renamed";
    case "C":
      return "added";
    case "U":
      return "conflicted";
    default:
      return "modified";
  }
}

/**
 * Whether a rebase, merge, cherry-pick, revert, or bisect is half-finished.
 *
 * Exported because `checkpoint.ts` refuses to restore in that state: putting files back
 * underneath an in-progress rebase leaves the user in a position git itself cannot explain.
 */
export async function operationInProgress(workspace: Workspace): Promise<boolean> {
  const gitDir = workspace.gitDir;
  if (gitDir === null) return false;
  const checks = await Promise.all(
    IN_PROGRESS_MARKERS.map(async (marker) => {
      try {
        await stat(path.join(gitDir, marker));
        return true;
      } catch {
        return false;
      }
    }),
  );
  return checks.includes(true);
}

// ---------------------------------------------------------------------------
// git/diff
// ---------------------------------------------------------------------------

export interface DiffRequest {
  /** Workspace-relative. Omitted for the whole repository. */
  path?: string;
  /** Diff the index against HEAD instead of the work tree against the index. */
  staged?: boolean;
}

/**
 * A unified diff of the current changes.
 *
 * With one wrinkle worth the code: git has nothing to say about an untracked file, so a
 * brand-new file would show an empty diff. Since "the agent just created this, show me
 * what is in it" is the single most common thing a reviewer wants, the diff for that case
 * is synthesized locally against an empty original — the same renderer the agent's own
 * edit previews use, so the two look alike.
 */
export async function gitDiff(workspace: Workspace, request: DiffRequest): Promise<string> {
  if (!workspace.isGitRepo) {
    throw new RpcError(ErrorCode.InvalidParams, `"${workspace.name}" is not a git repository.`);
  }

  const args = ["diff", "--no-color", "--no-ext-diff"];
  if (request.staged === true) args.push("--cached");
  // `--` so a path that looks like a revision (a file called `main`) is unambiguous.
  if (request.path !== undefined) args.push("--", request.path);

  const result = await runGit(args, { cwd: workspace.root });
  if (result.exitCode !== 0 && result.stdout === "") {
    log.warn(`git diff exited ${result.exitCode}`, { stderr: result.stderr.trim() });
  }
  if (result.stdout !== "" || request.path === undefined || request.staged === true) {
    return result.stdout;
  }
  return (await untrackedDiff(workspace, request.path)) ?? result.stdout;
}

/** Largest new file worth rendering inline. Beyond this the UI should open the file. */
const MAX_SYNTHETIC_DIFF_BYTES = 512 * 1024;

async function untrackedDiff(workspace: Workspace, relative: string): Promise<string | null> {
  // `ls-files --error-unmatch` exits non-zero for a path git does not track, which is the
  // cheapest way to ask without parsing a full status.
  const tracked = await runGit(["ls-files", "--error-unmatch", "--", relative], {
    cwd: workspace.root,
  });
  if (tracked.exitCode === 0) return null;

  const absolute = path.resolve(workspace.root, relative);
  try {
    const info = await stat(absolute);
    if (!info.isFile()) return null;
    if (info.size > MAX_SYNTHETIC_DIFF_BYTES) {
      return `--- /dev/null\n+++ b/${toPosix(relative)}\n@@ new file, ${info.size} bytes — too large to render @@\n`;
    }
    const buffer = await readFile(absolute);
    if (looksBinary(buffer)) {
      return `--- /dev/null\n+++ b/${toPosix(relative)}\n@@ new binary file, ${info.size} bytes @@\n`;
    }
    const posix = toPosix(relative);
    const body = unifiedDiff("", buffer.toString("utf8"), posix);
    // git names the missing original side `/dev/null`, and diff viewers key off that to
    // render a file as new rather than as one whose every line changed.
    return body.replace(`--- a/${posix}\n`, "--- /dev/null\n");
  } catch {
    // Deleted between the status and now. An empty diff is the truthful answer.
    return null;
  }
}
