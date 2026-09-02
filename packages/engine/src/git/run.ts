/**
 * Running git.
 *
 * Every git call in the engine goes through here, for three reasons that only become
 * obvious once something breaks:
 *
 * **`execFile`, never a shell.** Paths contain spaces, branch names contain `$`, and a
 * commit message is arbitrary user text. Passing an argv array means none of that is ever
 * parsed by anything.
 *
 * **The environment is pinned.** Git reads a dozen environment variables that change its
 * output — `GIT_DIR` from an ancestor process, locale settings that translate the words in
 * `git status`, pagers and editors that block waiting for a human. A command that works in
 * one terminal and hangs in another is almost always one of these.
 *
 * **Failure carries stderr.** Git's exit codes are nearly uninformative; the reason is
 * always on stderr, so it travels with the error rather than being logged and dropped.
 *
 * Copyright (c) 2026 Origin AI
 */

import { execFile } from "node:child_process";
import { Logger } from "../logger.js";

const log = new Logger("git");

/** Long enough for a big `add -A`, short enough that a hung git is not forever. */
const GIT_TIMEOUT_MS = 120_000;
/** A `git diff` of a large change can be tens of megabytes; truncation is the caller's job. */
const MAX_GIT_OUTPUT = 64 * 1024 * 1024;

export interface GitRunOptions {
  cwd: string;
  /** Operate on this git dir instead of discovering one from `cwd`. Shadow checkpoints use it. */
  gitDir?: string;
  /** Work tree for a detached git dir. Required whenever `gitDir` is not inside it. */
  workTree?: string;
  signal?: AbortSignal;
  /** Extra `-c key=value` overrides, applied after the pinned ones. */
  config?: Record<string, string>;
}

export interface GitResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class GitError extends Error {
  constructor(
    readonly args: readonly string[],
    readonly exitCode: number,
    readonly stderr: string,
  ) {
    super(stderr.trim() || `git ${args[0] ?? ""} failed with exit code ${exitCode}`);
    this.name = "GitError";
  }
}

/**
 * Config applied to every invocation.
 *
 * `-c` rather than environment variables so it survives into the exact process being run
 * and cannot be inherited by anything else.
 */
const PINNED_CONFIG: Record<string, string> = {
  // A pager blocks forever waiting for a terminal that does not exist.
  "core.pager": "cat",
  // Windows-only, but harmless elsewhere: keeps git from rewriting line endings under us.
  "core.autocrlf": "false",
  // A repo with `core.fsmonitor` set can start a daemon per invocation.
  "core.fsmonitor": "false",
  // Colour codes in output we are about to parse.
  "color.ui": "false",
};

/**
 * Environment applied to every invocation.
 *
 * Cleared rather than set: an inherited `GIT_DIR` or `GIT_WORK_TREE` — which any process
 * launched from a git hook has — would silently redirect every command in this file at the
 * wrong repository.
 */
function gitEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    GIT_DIR: undefined,
    GIT_WORK_TREE: undefined,
    GIT_INDEX_FILE: undefined,
    GIT_OBJECT_DIRECTORY: undefined,
    GIT_ALTERNATE_OBJECT_DIRECTORIES: undefined,
    GIT_CONFIG_PARAMETERS: undefined,
    // Nothing here is interactive. Without these, a repo needing credentials or a
    // signing passphrase waits for input that will never come.
    GIT_TERMINAL_PROMPT: "0",
    GIT_ASKPASS: "",
    SSH_ASKPASS: "",
    GIT_EDITOR: "true",
    GIT_PAGER: "cat",
    // Machine-readable output. `git status` translates its own words otherwise.
    LC_ALL: "C",
    LANG: "C",
  };
}

/**
 * Run git and return its output.
 *
 * Resolves for any exit code; inspect `exitCode` when a non-zero one is meaningful (`git
 * diff --quiet`, `git status` in a non-repo). Use {@link git} when non-zero is a failure.
 */
export function runGit(args: readonly string[], options: GitRunOptions): Promise<GitResult> {
  return new Promise((resolve, reject) => {
    execFile("git", gitArgv(args, options), execOptions(options), (error, stdout, stderr) => {
      if (error === null) {
        resolve({ stdout, stderr, exitCode: 0 });
        return;
      }
      const code = exitCodeOf(error);
      if (code === null) reject(error);
      else resolve({ stdout, stderr, exitCode: code });
    });
  });
}

/**
 * Like {@link runGit}, but the output is bytes.
 *
 * For blob contents, which are not text however much a `.ts` file looks like it: a file
 * that is valid Latin-1 and invalid UTF-8 survives `looksBinary`, and decoding it to a
 * string would silently replace the bytes it could not read. Anything that then writes
 * that string back to disk has corrupted the user's file. Callers that need the *text* of
 * a blob decode here and verify the round trip.
 *
 * No `stderr`: the callers are content reads, where a non-zero exit means "no such blob"
 * and there is nothing useful to report beyond that.
 */
export function runGitBytes(
  args: readonly string[],
  options: GitRunOptions,
): Promise<{ stdout: Buffer; exitCode: number }> {
  return new Promise((resolve, reject) => {
    execFile(
      "git",
      gitArgv(args, options),
      { ...execOptions(options), encoding: "buffer" },
      (error, stdout) => {
        if (error === null) {
          resolve({ stdout, exitCode: 0 });
          return;
        }
        const code = exitCodeOf(error);
        if (code === null) reject(error);
        else resolve({ stdout, exitCode: code });
      },
    );
  });
}

/** `-c` overrides and repo redirection, ahead of the subcommand. */
function gitArgv(args: readonly string[], options: GitRunOptions): string[] {
  const prefix: string[] = [];
  if (options.gitDir !== undefined) prefix.push(`--git-dir=${options.gitDir}`);
  if (options.workTree !== undefined) prefix.push(`--work-tree=${options.workTree}`);
  for (const [key, value] of Object.entries({ ...PINNED_CONFIG, ...options.config })) {
    prefix.push("-c", `${key}=${value}`);
  }
  return [...prefix, ...args];
}

function execOptions(options: GitRunOptions): {
  cwd: string;
  env: NodeJS.ProcessEnv;
  signal?: AbortSignal;
  timeout: number;
  maxBuffer: number;
  windowsHide: boolean;
} {
  return {
    cwd: options.cwd,
    env: gitEnv(),
    ...(options.signal ? { signal: options.signal } : {}),
    timeout: GIT_TIMEOUT_MS,
    maxBuffer: MAX_GIT_OUTPUT,
    windowsHide: true,
  };
}

/**
 * Git's exit status, or null when git never really ran.
 *
 * A numeric `code` is an answer, even when non-zero. A string code (ENOENT, ETIMEDOUT) or
 * a kill means the command did not complete, which is a different kind of failure and has
 * to reach the caller as a rejection rather than as an exit code it might branch on.
 */
function exitCodeOf(error: Error): number | null {
  const failure = error as Error & { code?: number | string; killed?: boolean };
  return typeof failure.code === "number" && failure.killed !== true ? failure.code : null;
}

/** Run git, or throw {@link GitError} carrying stderr. */
export async function git(args: readonly string[], options: GitRunOptions): Promise<string> {
  const result = await runGit(args, options);
  if (result.exitCode !== 0) throw new GitError(args, result.exitCode, result.stderr);
  return result.stdout;
}

let available: boolean | undefined;

/**
 * Whether git is on PATH at all.
 *
 * Cached after the first check. Git appearing mid-session is not a case worth re-probing
 * for on every checkpoint, and the alternative — one `git --version` per mutating turn —
 * is a process spawn on the hot path.
 */
export async function gitAvailable(): Promise<boolean> {
  if (available !== undefined) return available;
  try {
    await git(["--version"], { cwd: process.cwd() });
    available = true;
  } catch (cause) {
    log.warn("git is not available; checkpoints and git status are disabled", cause);
    available = false;
  }
  return available;
}
