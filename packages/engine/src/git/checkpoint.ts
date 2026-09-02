/**
 * Checkpoints: a shadow git repository the user's git never sees.
 *
 * Before the first mutating tool call of a turn, the whole work tree is committed into a
 * git directory that lives under `~/.trace/checkpoints/<workspaceId>/` rather than in the
 * project. The project's own `.git` is not touched: no staged files appear, HEAD does not
 * move, the reflog is unchanged, `git stash list` stays empty. An agent product that
 * quietly commits to the user's branch is one they stop trusting the first time they run
 * `git log`.
 *
 * **Why a real git repo and not a file copy.** Content-addressed storage means fifty
 * checkpoints of a repo where one file changed cost one file's worth of disk. It also means
 * restore is `git checkout <sha> -- <paths>`, which is code that has been correct for
 * twenty years, rather than a tree-walking copy written here.
 *
 * **Why the metadata lives in commit messages.** `checkpoint/list` needs a label, a time,
 * and the turn a checkpoint belongs to. Those go in the commit message as trailers, so the
 * list is derived from `git log` and cannot disagree with what is actually restorable — a
 * sidecar index would eventually list checkpoints whose commits are gone, or miss ones that
 * are there.
 *
 * **Two known limits, both deliberate.** A nested git repository is recorded as a gitlink,
 * so its *contents* are neither checkpointed nor restored — the alternative is reaching
 * into a repo the user manages separately. And anything matched by `.gitignore` is not
 * captured, which is what makes this cheap: build output and `node_modules` are
 * regenerable, and the one thing worse than a slow checkpoint is a 2 GB one.
 *
 * Copyright (c) 2026 Origin AI
 */

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { ALWAYS_IGNORED_DIRS, toPosix } from "../paths.js";
import { Logger } from "../logger.js";
import type { Workspace } from "../workspace.js";
import { git, gitAvailable, runGit } from "./run.js";
import { operationInProgress } from "./status.js";

const log = new Logger("checkpoint");

/** Identity for shadow commits. A user with no configured git identity must still work. */
const COMMIT_IDENTITY = {
  "user.name": "Trace",
  "user.email": "checkpoints@trace.local",
  // A repo configured to sign every commit would otherwise prompt for a passphrase that
  // nobody is there to type.
  "commit.gpgsign": "false",
  "tag.gpgsign": "false",
};

const SESSION_TRAILER = "Trace-Session";
const TURN_TRAILER = "Trace-Turn";

/** Argv length is capped on every platform; Windows is the tightest at ~32k. */
const MAX_PATHSPEC_BATCH_CHARS = 6_000;

export interface CheckpointRecord {
  /** The shadow commit sha. Opaque to clients. */
  id: string;
  label: string;
  at: number;
  turnId: string;
  sessionId: string;
}

export interface RestoreResult {
  restoredFiles: string[];
  /** The checkpoint taken just before restoring, so the restore itself is undoable. */
  safetyCheckpointId: string | null;
}

export class CheckpointManager {
  private readonly gitDir: string;
  /**
   * Serializes every shadow-git call for this workspace.
   *
   * One index file, and `add -A` writes it. Two sessions in the same folder checkpointing
   * at the same moment would interleave into `index.lock` errors, or worse, a commit
   * holding half of each turn's work.
   */
  private queue: Promise<unknown> = Promise.resolve();
  private initialized = false;

  constructor(
    private readonly workspace: Workspace,
    home: string,
  ) {
    this.gitDir = path.join(home, "checkpoints", workspace.id);
  }

  /**
   * Snapshot the work tree.
   *
   * Returns null rather than throwing when the snapshot cannot be taken — git missing, a
   * locked index, a full disk. The caller is a turn about to edit a file, and losing undo
   * is a worse outcome than refusing to do the work the user asked for.
   */
  async create(args: {
    sessionId: string;
    turnId: string;
    label: string;
  }): Promise<{ id: string } | null> {
    if (!(await gitAvailable())) return null;
    return this.serialize(async () => {
      try {
        await this.ensureRepo();
        await git(["add", "-A"], this.opts());

        const message = [
          args.label.replace(/\s+/g, " ").trim() || "Agent turn",
          "",
          `${SESSION_TRAILER}: ${args.sessionId}`,
          `${TURN_TRAILER}: ${args.turnId}`,
        ].join("\n");

        // `--allow-empty` because a turn that changes nothing should still leave a marker:
        // the user's mental model is one checkpoint per turn, and a missing one reads as a
        // bug. `--no-verify` because the user's hooks belong to their commits, not ours.
        await git(
          ["commit", "--allow-empty", "--no-verify", "--quiet", "-m", message],
          this.opts({ config: COMMIT_IDENTITY }),
        );
        const id = (await git(["rev-parse", "HEAD"], this.opts())).trim();
        log.debug(`Checkpoint ${id.slice(0, 8)} — ${args.label}`);
        return { id };
      } catch (cause) {
        log.warn("Could not write a checkpoint", cause);
        return null;
      }
    });
  }

  /** Every checkpoint for a session, newest first. */
  async list(sessionId: string): Promise<CheckpointRecord[]> {
    if (!(await gitAvailable())) return [];
    return this.serialize(async () => {
      // Records are separated by \x01 and fields by \0, because a commit message is
      // multi-line and arbitrary user text — any printable delimiter can appear in a label.
      const format = "%x01%H%x00%at%x00%s%x00%(trailers:key=Trace-Session,valueonly)%x00%(trailers:key=Trace-Turn,valueonly)";
      const raw = await runGit(["log", `--format=${format}`, "--no-decorate"], this.opts());
      if (raw.exitCode !== 0) return [];

      const records: CheckpointRecord[] = [];
      for (const chunk of raw.stdout.split("\x01")) {
        if (chunk.trim() === "") continue;
        const [sha, at, subject, session, turn] = chunk.split("\0");
        if (!sha || !session) continue;
        if (session.trim() !== sessionId) continue;
        records.push({
          id: sha.trim(),
          label: subject?.trim() ?? "Checkpoint",
          at: Number(at ?? 0) * 1000,
          turnId: turn?.trim() ?? "",
          sessionId: session.trim(),
        });
      }
      return records;
    });
  }

  /**
   * Put the work tree back the way it was at `checkpointId`.
   *
   * The destructive part of the engine, so it is spelled out rather than delegated to
   * `reset --hard`: compute exactly which files differ, restore those, delete the ones the
   * checkpoint does not have, and touch nothing else. A `reset --hard` against a shadow
   * index would be one line and would also, on a bad day, delete a file the checkpoint
   * never knew about.
   */
  async restore(checkpointId: string): Promise<RestoreResult> {
    if (!(await gitAvailable())) {
      throw new Error("git is not available, so checkpoints cannot be restored.");
    }
    if (await operationInProgress(this.workspace)) {
      throw new Error(
        "A rebase, merge, or cherry-pick is in progress. Finish or abort it before restoring a checkpoint.",
      );
    }

    // Taken outside the serialized block below because `create` takes the lock itself.
    const safety = await this.create({
      sessionId: "restore",
      turnId: "restore",
      label: `Before restoring ${checkpointId.slice(0, 8)}`,
    });

    return this.serialize(async () => {
      await this.ensureRepo();
      // Verify before doing anything destructive: a sha from a stale UI would otherwise
      // fail halfway through, having already deleted files.
      const kind = await runGit(["cat-file", "-t", checkpointId], this.opts());
      if (kind.exitCode !== 0 || kind.stdout.trim() !== "commit") {
        throw new Error(`No such checkpoint: ${checkpointId}`);
      }

      // Sync the index to the work tree so the diff below compares the checkpoint against
      // what is on disk right now, not against whatever the last checkpoint captured.
      await git(["add", "-A"], this.opts());

      const changes = parseRawDiff(
        await git(
          ["diff", "--cached", "--raw", "-z", "--no-renames", checkpointId],
          this.opts(),
        ),
      );

      const toRestore: string[] = [];
      const toDelete: string[] = [];
      for (const change of changes) {
        // A gitlink is a nested repository's HEAD, not a file. Restoring one would rewind
        // a repo the user manages themselves.
        if (change.srcMode === "160000" || change.dstMode === "160000") continue;
        if (change.status === "A") toDelete.push(change.path);
        else toRestore.push(change.path);
      }

      for (const batch of batchPathspecs(toRestore)) {
        await git(["checkout", checkpointId, "--", ...batch], this.opts());
      }
      for (const relative of toDelete) {
        // Files only. An empty directory left behind is harmless; recursively removing one
        // could take an ignored sibling with it.
        await rm(path.resolve(this.workspace.root, relative), { force: true });
      }

      // The index still describes the pre-restore tree. Left as-is it would make the next
      // restore's diff wrong; resyncing costs one command.
      await runGit(["add", "-A"], this.opts());

      const restoredFiles = [...toRestore, ...toDelete].map(toPosix).sort();
      log.info(`Restored ${restoredFiles.length} file(s) from ${checkpointId.slice(0, 8)}`);
      return { restoredFiles, safetyCheckpointId: safety?.id ?? null };
    });
  }

  // -----------------------------------------------------------------------
  // Internals
  // -----------------------------------------------------------------------

  private opts(extra: { config?: Record<string, string> } = {}): {
    cwd: string;
    gitDir: string;
    workTree: string;
    config?: Record<string, string>;
  } {
    return {
      cwd: this.workspace.root,
      gitDir: this.gitDir,
      workTree: this.workspace.root,
      ...extra,
    };
  }

  private async ensureRepo(): Promise<void> {
    if (this.initialized) return;
    await mkdir(this.gitDir, { recursive: true });

    const head = await runGit(["rev-parse", "--git-dir"], { cwd: this.gitDir, gitDir: this.gitDir });
    if (head.exitCode !== 0) {
      // `--bare`, then unset it: a bare repo is the only kind git will create in a
      // directory that is not a work tree, but `core.bare` must be false for
      // `--work-tree` to be accepted afterwards.
      await git(["init", "--bare", "--quiet", this.gitDir], { cwd: path.dirname(this.gitDir) });
      await git(["config", "core.bare", "false"], { cwd: this.gitDir, gitDir: this.gitDir });
      log.info(`Initialized checkpoint store for ${this.workspace.name}`, { gitDir: this.gitDir });
    }

    await this.writeExcludes();
    this.initialized = true;
  }

  /**
   * The shadow repo's own ignore rules, on top of the project's `.gitignore`.
   *
   * A repo that commits its `node_modules` is unusual but real, and it should not turn
   * every checkpoint into a gigabyte. `.trace` is excluded for a sharper reason: someone
   * who opens their home directory as a workspace would otherwise have the checkpoint
   * store try to checkpoint itself.
   */
  private async writeExcludes(): Promise<void> {
    const lines = [
      "# Written by Trace. Applies only to checkpoints, never to the project's git.",
      ".trace/",
      ...[...ALWAYS_IGNORED_DIRS].map((dir) => `${dir}/`),
      "",
    ];
    await mkdir(path.join(this.gitDir, "info"), { recursive: true });
    await writeFile(path.join(this.gitDir, "info", "exclude"), lines.join("\n"), "utf8");
  }

  private serialize<T>(work: () => Promise<T>): Promise<T> {
    const result = this.queue.then(work, work);
    // Swallowed on the chain only: the returned promise still rejects for the caller.
    // Without this a single failure would reject every later checkpoint in the session.
    this.queue = result.catch(() => undefined);
    return result;
  }
}

interface RawChange {
  srcMode: string;
  dstMode: string;
  status: string;
  path: string;
}

/**
 * Parse `git diff --raw -z`.
 *
 * Each record is `:<srcMode> <dstMode> <srcSha> <dstSha> <status>\0<path>\0`. The modes are
 * the reason for using `--raw` over `--name-status`: `160000` marks a gitlink, and a
 * restore has to leave those alone.
 */
export function parseRawDiff(raw: string): RawChange[] {
  const fields = raw.split("\0");
  const changes: RawChange[] = [];
  for (let i = 0; i < fields.length; i++) {
    const meta = fields[i];
    if (meta === undefined || !meta.startsWith(":")) continue;
    const parts = meta.slice(1).split(" ");
    const filePath = fields[i + 1];
    if (parts.length < 5 || filePath === undefined || filePath === "") continue;
    i++;
    changes.push({
      srcMode: parts[0] ?? "",
      dstMode: parts[1] ?? "",
      status: (parts[4] ?? "").charAt(0),
      path: filePath,
    });
  }
  return changes;
}

/** Split pathspecs into command lines that fit. */
export function batchPathspecs(paths: readonly string[]): string[][] {
  const batches: string[][] = [];
  let current: string[] = [];
  let size = 0;
  for (const item of paths) {
    if (current.length > 0 && size + item.length > MAX_PATHSPEC_BATCH_CHARS) {
      batches.push(current);
      current = [];
      size = 0;
    }
    current.push(item);
    size += item.length + 1;
  }
  if (current.length > 0) batches.push(current);
  return batches;
}
