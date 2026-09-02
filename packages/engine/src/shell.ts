/**
 * Shell resolution.
 *
 * Which shell the agent gets is a correctness issue, not a preference. An agent
 * told nothing will write POSIX pipelines, and on Windows `cmd.exe` those fail in
 * ways that look like the *command* was wrong rather than the shell. So this module
 * resolves one shell, and the system prompt states which one it is — the model
 * needs to know whether `$VAR` or `%VAR%` is correct before it writes the command.
 *
 * Order on Windows: Git Bash, then PowerShell, then cmd. Git Bash first because
 * essentially every Windows developer running a coding agent has it (it ships with
 * Git), and it makes one instruction set work on all three platforms.
 *
 * Copyright (c) 2026 Origin AI
 */

import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

export interface ShellSpec {
  /** Absolute path to the shell executable. */
  bin: string;
  /** Build the argv that runs `command` and exits. */
  argsFor(command: string): string[];
  /** What to tell the model, e.g. "Git Bash (POSIX sh)". */
  label: string;
  /** True for bash/zsh/sh. Drives which syntax the system prompt describes. */
  posix: boolean;
}

const WINDOWS_BASH_CANDIDATES = [
  "C:\\Program Files\\Git\\bin\\bash.exe",
  "C:\\Program Files (x86)\\Git\\bin\\bash.exe",
  "C:\\Program Files\\Git\\usr\\bin\\bash.exe",
];

/**
 * `-lc` rather than `-c`: a login shell sources the user's profile, which is where
 * nvm, pyenv, rbenv, and asdf put their shims. Without it, `node` and `python` are
 * frequently just missing, and the agent concludes the project is broken.
 *
 * The cost is that a profile which prints a banner pollutes stdout. That is the
 * better trade for now; the real fix is one persistent shell per session, which is
 * on the list but needs sentinel-based exit-code capture to be reliable.
 */
function posixArgs(command: string): string[] {
  return ["-lc", command];
}

function resolveWindows(): ShellSpec {
  const override = process.env["TRACE_SHELL"];
  if (override && existsSync(override)) {
    return { bin: override, argsFor: posixArgs, label: path.basename(override), posix: true };
  }

  const programFiles = process.env["ProgramFiles"];
  const candidates = [
    ...WINDOWS_BASH_CANDIDATES,
    ...(programFiles ? [path.join(programFiles, "Git", "bin", "bash.exe")] : []),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return { bin: candidate, argsFor: posixArgs, label: "Git Bash (POSIX sh)", posix: true };
    }
  }

  const pwsh = process.env["SystemRoot"]
    ? path.join(
        process.env["SystemRoot"],
        "System32",
        "WindowsPowerShell",
        "v1.0",
        "powershell.exe",
      )
    : "powershell.exe";
  if (existsSync(pwsh)) {
    return {
      bin: pwsh,
      // -NoProfile: PowerShell profiles are slow and frequently write to stdout.
      argsFor: (command) => ["-NoProfile", "-NonInteractive", "-Command", command],
      label: "Windows PowerShell",
      posix: false,
    };
  }

  const comspec = process.env["ComSpec"] ?? "cmd.exe";
  return {
    // /d skips AutoRun registry commands, /s makes quoting behave, /c runs and exits.
    bin: comspec,
    argsFor: (command) => ["/d", "/s", "/c", command],
    label: "cmd.exe",
    posix: false,
  };
}

function resolvePosix(): ShellSpec {
  const override = process.env["TRACE_SHELL"];
  const fromEnv = process.env["SHELL"];
  const candidates = [
    ...(override ? [override] : []),
    // The user's own shell first: it is the one whose profile has their PATH.
    ...(fromEnv ? [fromEnv] : []),
    "/bin/bash",
    "/usr/bin/bash",
    "/bin/zsh",
    "/bin/sh",
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return {
        bin: candidate,
        argsFor: posixArgs,
        label: `${path.basename(candidate)} (POSIX)`,
        posix: true,
      };
    }
  }
  return { bin: "/bin/sh", argsFor: posixArgs, label: "sh (POSIX)", posix: true };
}

let cached: ShellSpec | undefined;

/** Resolved once — the filesystem is not going to grow a shell mid-session. */
export function resolveShell(): ShellSpec {
  cached ??= process.platform === "win32" ? resolveWindows() : resolvePosix();
  return cached;
}

/** Test seam. Also lets a client force a shell without restarting the engine. */
export function setShellForTesting(spec: ShellSpec | undefined): void {
  cached = spec;
}
