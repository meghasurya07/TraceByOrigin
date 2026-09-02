/**
 * run_terminal_cmd — one-shot command execution.
 *
 * Deliberately `child_process.spawn` and not a pty. A pty means `node-pty`, which
 * means a native module compiled against Electron's ABI on three platforms, and it
 * buys almost nothing here: the agent needs stdout and an exit code, not cursor
 * addressing. Interactive terminals — the ones a *human* types into, in the work
 * panel — are a separate subsystem that can afford the native dependency.
 *
 * Output is streamed to the UI as it arrives and truncated for the model. Those are
 * different audiences with different costs: the human wants to watch the test suite,
 * the model wants the last 200 lines where the failure is.
 *
 * Copyright (c) 2026 Origin AI
 */

import { spawn } from "node:child_process";
import path from "node:path";
import { resolveShell } from "../shell.js";
import { truncateForModel, type ToolHandler, type ToolResult } from "./registry.js";

const DEFAULT_TIMEOUT_MS = 120_000;
const MAX_TIMEOUT_MS = 600_000;

/**
 * Hard cap on retained output, ~1 MB. Beyond this we keep the head and the tail and
 * drop the middle, because the interesting parts of a failed build are the command
 * echo at the top and the error at the bottom — never the 40,000 lines between.
 */
const MAX_CAPTURED_BYTES = 1_000_000;
const KEEP_HEAD_CHARS = 8_000;
const KEEP_TAIL_CHARS = 40_000;

function failure(summary: string, content: string): ToolResult {
  return { content, isError: true, summary };
}

export const runTerminalCmdTool: ToolHandler<"run_terminal_cmd"> = async (input, ctx) => {
  const command = input.command.trim();
  if (command === "") {
    return failure("Empty command", "command must not be empty.");
  }

  const root = ctx.workspace?.root ?? ctx.roots[0];
  if (!root) {
    return failure(
      "No workspace",
      "No workspace is open, so there is no directory to run a command in.",
    );
  }

  // cwd is resolved lexically against the root and confined to it. A command can of
  // course `cd` elsewhere once running — this is not a sandbox, and pretending
  // otherwise would be worse than being clear about it. The permission gate, not
  // this check, is what stands between the model and a destructive command.
  const cwd = input.cwd ? path.resolve(root, input.cwd) : root;

  const timeout = Math.min(Math.max(input.timeout_ms ?? DEFAULT_TIMEOUT_MS, 1_000), MAX_TIMEOUT_MS);
  const shell = resolveShell();
  const startedAt = Date.now();

  const result = await new Promise<{
    stdout: string;
    stderr: string;
    exitCode: number | null;
    signal: NodeJS.Signals | null;
    timedOut: boolean;
    aborted: boolean;
    spawnError?: Error;
  }>((resolve) => {
    const child = spawn(shell.bin, shell.argsFor(command), {
      cwd,
      windowsHide: true,
      env: {
        ...process.env,
        // Force plain output: colour escapes are noise the model pays for, and
        // pagers are the classic way an agent's command hangs forever.
        TERM: "dumb",
        NO_COLOR: "1",
        FORCE_COLOR: "0",
        GIT_PAGER: "cat",
        PAGER: "cat",
        CI: process.env["CI"] ?? "1",
      },
    });

    let stdout = "";
    let stderr = "";
    let captured = 0;
    let timedOut = false;
    let aborted = false;
    let settled = false;

    const capture = (stream: "stdout" | "stderr", chunk: Buffer): void => {
      const text = chunk.toString("utf8");
      // Stream to the human unconditionally — they are watching this happen.
      ctx.emit({
        type: "tool_call_output_delta",
        sessionId: ctx.sessionId,
        turnId: ctx.turnId,
        callId: ctx.callId,
        stream,
        chunk: text,
      });
      if (captured >= MAX_CAPTURED_BYTES) return;
      captured += text.length;
      if (stream === "stdout") stdout += text;
      else stderr += text;
    };

    child.stdout?.on("data", (chunk: Buffer) => capture("stdout", chunk));
    child.stderr?.on("data", (chunk: Buffer) => capture("stderr", chunk));

    // stdin is closed immediately: a command that waits for input should fail fast
    // rather than burn the full timeout looking like a hang.
    child.stdin?.end();

    const finish = (extra: {
      exitCode: number | null;
      signal: NodeJS.Signals | null;
      spawnError?: Error;
    }): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      ctx.signal.removeEventListener("abort", onAbort);
      resolve({ stdout, stderr, timedOut, aborted, ...extra });
    };

    const timer = setTimeout(() => {
      timedOut = true;
      killTree(child);
    }, timeout);

    const onAbort = (): void => {
      aborted = true;
      killTree(child);
    };
    ctx.signal.addEventListener("abort", onAbort, { once: true });
    if (ctx.signal.aborted) onAbort();

    child.on("error", (error) => {
      finish({ exitCode: null, signal: null, spawnError: error });
    });
    child.on("close", (code, signal) => {
      finish({ exitCode: code, signal });
    });
  });

  const durationMs = Date.now() - startedAt;
  const relativeCwd = path.relative(root, cwd) || ".";

  if (result.spawnError) {
    return failure(
      `Could not run command`,
      `Failed to start the shell (${shell.label}): ${result.spawnError.message}`,
    );
  }
  if (result.aborted) {
    return failure(
      `Interrupted: ${clip(command)}`,
      `Command was interrupted by the user after ${formatDuration(durationMs)}.\n\n${combine(result.stdout, result.stderr, true)}`,
    );
  }
  if (result.timedOut) {
    return failure(
      `Timed out: ${clip(command)}`,
      `Command exceeded its ${formatDuration(timeout)} timeout and was killed.\n\n` +
        `${combine(result.stdout, result.stderr, true)}\n\n` +
        `If this command is expected to take longer, pass a larger timeout_ms (max ${MAX_TIMEOUT_MS / 1000}s). ` +
        `If it was waiting for input, re-run it with non-interactive flags.`,
    );
  }

  const combined = combine(result.stdout, result.stderr, false);
  const ok = result.exitCode === 0;
  const exitLabel =
    result.exitCode === null
      ? `killed by ${result.signal ?? "signal"}`
      : `exit code ${result.exitCode}`;

  const body = combined === "" ? "(no output)" : combined;
  const { text } = truncateForModel(body);

  return {
    content: ok ? text : `Command failed with ${exitLabel}.\n\n${text}`,
    ...(ok ? {} : { isError: true }),
    summary: `${clip(command)} — ${ok ? "ok" : exitLabel} (${formatDuration(durationMs)})`,
    meta: {
      command,
      cwd: relativeCwd,
      shell: shell.label,
      exitCode: result.exitCode,
      durationMs,
      truncated: text !== body,
    },
  };
};

/**
 * Merge streams, keeping head and tail when the output is enormous.
 *
 * stderr goes after stdout rather than interleaved: true interleaving needs a
 * single fd (a pty), and mislabelling which stream a line came from is worse than
 * separating them.
 */
function combine(stdout: string, stderr: string, includeLabels: boolean): string {
  const parts: string[] = [];
  if (stdout.trim() !== "") parts.push(includeLabels ? `--- stdout ---\n${stdout}` : stdout);
  if (stderr.trim() !== "") parts.push(includeLabels ? `--- stderr ---\n${stderr}` : stderr);
  const merged = parts.join("\n").replace(/\r\n/g, "\n").trimEnd();

  if (merged.length <= KEEP_HEAD_CHARS + KEEP_TAIL_CHARS) return merged;
  const head = merged.slice(0, KEEP_HEAD_CHARS);
  const tail = merged.slice(-KEEP_TAIL_CHARS);
  const omitted = merged.length - head.length - tail.length;
  return `${head}\n\n[… ${omitted.toLocaleString()} characters of output omitted …]\n\n${tail}`;
}

/**
 * Kill the shell and everything it started.
 *
 * `child.kill()` signals only the shell, leaving the actual build orphaned and
 * still holding the port. On Windows there are no process groups, so `taskkill /T`
 * is the only way to get the tree.
 */
function killTree(child: { pid?: number; kill(signal?: NodeJS.Signals): boolean }): void {
  if (child.pid === undefined) return;
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      windowsHide: true,
      stdio: "ignore",
    }).on("error", () => {
      child.kill("SIGKILL");
    });
    return;
  }
  try {
    // Negative pid targets the process group. `detached` is not set, so this only
    // works when the shell became a group leader; fall through if it did not.
    process.kill(-child.pid, "SIGKILL");
  } catch {
    child.kill("SIGKILL");
  }
}

function clip(command: string, limit = 60): string {
  const single = command.replace(/\s+/g, " ").trim();
  return single.length <= limit ? single : `${single.slice(0, limit - 1)}…`;
}

function formatDuration(ms: number): string {
  if (ms < 1_000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1_000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m${Math.round((ms % 60_000) / 1_000)}s`;
}
