/**
 * Interactive terminals.
 *
 * Distinct from `run_terminal_cmd`, which is the *agent's* one-shot command runner and
 * deliberately has no tty. These are the terminals a *person* uses in the work panel:
 * an xterm.js front end, a real pty behind it, and a byte stream in both directions.
 *
 * **Why a pty and not a pipe.** Almost everything a developer types into a terminal
 * checks whether it is talking to one. Without a pty there is no prompt redraw, no
 * `Ctrl+C`, no line editing, no colour, no progress bars, and no `git commit` opening an
 * editor — and every one of those failures looks like a broken shell rather than a
 * missing feature. `cols`/`rows` are in the protocol for the same reason: a program that
 * cannot ask how wide the window is will wrap its output wrongly forever.
 *
 * **Why `node-pty` is optional.** It is a native module, so it is the one dependency
 * that can fail to load for reasons unrelated to this code — a mismatched Electron ABI
 * after an upgrade, a platform with no prebuild. It is therefore imported lazily and the
 * failure is reported as itself: `terminal/create` refuses with a message naming the
 * cause, and the rest of the engine — agent loop included — keeps working. A pipe-backed
 * imitation was the alternative and is worse: it would look like a terminal and behave
 * like a broken one.
 *
 * **Output is coalesced.** A build that prints 50k lines would otherwise become 50k
 * JSON-RPC frames, and the renderer spends longer parsing them than the compiler spent
 * producing them. Chunks are batched on a short timer instead, which is also how VS
 * Code's terminal survives the same input.
 *
 * Copyright (c) 2026 Origin AI
 */

import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { ErrorCode, RpcError } from "@trace/protocol";
import { Logger } from "./logger.js";
import { resolveShell } from "./shell.js";

const log = new Logger("terminal");

/**
 * How long output is allowed to accumulate before it is flushed.
 *
 * 16ms is one frame at 60Hz: below the threshold where a human perceives typing lag,
 * and high enough that a screenful of output arrives as one frame rather than fifty.
 */
const FLUSH_INTERVAL_MS = 16;

/**
 * Flush early once a batch reaches this size.
 *
 * Without it, a process emitting megabytes in a single tick would buffer the whole lot
 * into one frame and blow the protocol's frame limit.
 */
const MAX_BATCH_BYTES = 64 * 1024;

/** Guardrail on how many ptys one client can open. Each is a real OS process. */
const MAX_TERMINALS = 32;

/**
 * The slice of `node-pty` used here.
 *
 * Declared locally rather than imported as a type, because the module is loaded through
 * `createRequire` at runtime and a static type import would make the build depend on an
 * optional dependency being installed.
 */
interface PtyProcess {
  readonly pid: number;
  onData(listener: (data: string) => void): void;
  onExit(listener: (event: { exitCode: number; signal?: number }) => void): void;
  write(data: string): void;
  resize(cols: number, rows: number): void;
  kill(signal?: string): void;
}

interface PtyModule {
  spawn(
    file: string,
    args: string[] | string,
    options: {
      name?: string;
      cols: number;
      rows: number;
      cwd: string;
      env: Record<string, string>;
    },
  ): PtyProcess;
}

export interface TerminalCallbacks {
  onOutput(terminalId: string, data: string): void;
  onExit(terminalId: string, exitCode: number | null, signal?: string): void;
}

export interface CreateTerminalOptions {
  cwd: string;
  cols: number;
  rows: number;
  /** Override the resolved shell. Comes straight from the client, so it is validated. */
  shell?: string;
}

interface TerminalEntry {
  id: string;
  pty: PtyProcess;
  pending: string[];
  pendingBytes: number;
  timer: ReturnType<typeof setTimeout> | null;
  exited: boolean;
}

export class TerminalManager {
  private readonly terminals = new Map<string, TerminalEntry>();
  private ptyModule: PtyModule | null = null;
  /** The reason `node-pty` could not be loaded, kept so every refusal can name it. */
  private loadFailure: string | null = null;

  constructor(private readonly callbacks: TerminalCallbacks) {}

  /** Whether interactive terminals are available at all. Surfaced in the handshake. */
  get available(): boolean {
    return this.load() !== null;
  }

  create(options: CreateTerminalOptions): { terminalId: string } {
    const pty = this.load();
    if (!pty) {
      throw new RpcError(
        ErrorCode.InternalError,
        `Interactive terminals are unavailable: ${this.loadFailure ?? "node-pty did not load"}`,
      );
    }
    if (this.terminals.size >= MAX_TERMINALS) {
      throw new RpcError(
        ErrorCode.InvalidParams,
        `Too many open terminals (${MAX_TERMINALS}). Close one before opening another.`,
      );
    }

    const shell = resolveShell();
    const file = options.shell ?? shell.bin;
    // An interactive shell, not `-c <command>`: `-l` sources the user's profile, which is
    // where nvm, pyenv, and asdf put the shims that make `node` and `python` resolve.
    const args = options.shell === undefined && shell.posix ? ["-l"] : [];

    const id = randomUUID();
    let child: PtyProcess;
    try {
      child = pty.spawn(file, args, {
        // The value programs read from `$TERM`. `xterm-256color` matches what xterm.js
        // actually renders, so colour output is neither missing nor wrong.
        name: "xterm-256color",
        cols: clampDimension(options.cols, 80),
        rows: clampDimension(options.rows, 24),
        cwd: options.cwd,
        env: ptyEnv(),
      });
    } catch (cause) {
      throw new RpcError(
        ErrorCode.InternalError,
        `Could not start a terminal with "${file}": ${cause instanceof Error ? cause.message : String(cause)}`,
      );
    }

    const entry: TerminalEntry = {
      id,
      pty: child,
      pending: [],
      pendingBytes: 0,
      timer: null,
      exited: false,
    };
    this.terminals.set(id, entry);

    child.onData((data) => this.enqueue(entry, data));
    child.onExit(({ exitCode, signal }) => {
      entry.exited = true;
      // Flushed before the exit notification so the last line of output — usually the
      // one explaining *why* it exited — arrives before the "closed" state does.
      this.flush(entry);
      this.terminals.delete(id);
      this.callbacks.onExit(id, exitCode, signal === undefined ? undefined : String(signal));
      log.debug(`Terminal ${id.slice(0, 8)} exited`, { exitCode, signal });
    });

    log.info(`Opened terminal ${id.slice(0, 8)}`, { shell: file, pid: child.pid, cwd: options.cwd });
    return { terminalId: id };
  }

  write(terminalId: string, data: string): void {
    this.require(terminalId).pty.write(data);
  }

  resize(terminalId: string, cols: number, rows: number): void {
    const entry = this.require(terminalId);
    try {
      entry.pty.resize(clampDimension(cols, 80), clampDimension(rows, 24));
    } catch (cause) {
      // A resize racing the shell's exit throws on some platforms. The terminal is
      // already gone, so there is nothing for the client to do about it.
      log.debug(`Could not resize terminal ${terminalId.slice(0, 8)}`, cause);
    }
  }

  /**
   * Close a terminal.
   *
   * Idempotent: a client that closes its panel and then disconnects will send this
   * twice, and the second one is not an error.
   */
  close(terminalId: string): void {
    const entry = this.terminals.get(terminalId);
    if (!entry) return;
    this.terminals.delete(terminalId);
    if (entry.timer) clearTimeout(entry.timer);
    if (entry.exited) return;
    try {
      entry.pty.kill();
    } catch (cause) {
      log.debug(`Could not kill terminal ${terminalId.slice(0, 8)}`, cause);
    }
  }

  /** Tear every terminal down. Called on shutdown. */
  closeAll(): void {
    for (const id of [...this.terminals.keys()]) this.close(id);
  }

  // -----------------------------------------------------------------------
  // Internals
  // -----------------------------------------------------------------------

  private require(terminalId: string): TerminalEntry {
    const entry = this.terminals.get(terminalId);
    if (!entry) {
      throw new RpcError(ErrorCode.TerminalNotFound, `No terminal with id "${terminalId}"`);
    }
    return entry;
  }

  private enqueue(entry: TerminalEntry, data: string): void {
    entry.pending.push(data);
    entry.pendingBytes += data.length;
    if (entry.pendingBytes >= MAX_BATCH_BYTES) {
      this.flush(entry);
      return;
    }
    entry.timer ??= setTimeout(() => this.flush(entry), FLUSH_INTERVAL_MS);
  }

  private flush(entry: TerminalEntry): void {
    if (entry.timer) {
      clearTimeout(entry.timer);
      entry.timer = null;
    }
    if (entry.pending.length === 0) return;
    const data = entry.pending.join("");
    entry.pending.length = 0;
    entry.pendingBytes = 0;
    this.callbacks.onOutput(entry.id, data);
  }

  /**
   * Load `node-pty`, once, and remember the failure if it does not.
   *
   * `createRequire` rather than a dynamic `import()` so this stays synchronous — the
   * alternative is making `terminal/create` await a module load on every call, or
   * kicking off a load at boot that nothing waits for.
   */
  private load(): PtyModule | null {
    if (this.ptyModule) return this.ptyModule;
    if (this.loadFailure !== null) return null;
    try {
      const require = createRequire(import.meta.url);
      this.ptyModule = require("node-pty") as PtyModule;
      return this.ptyModule;
    } catch (cause) {
      this.loadFailure = cause instanceof Error ? cause.message : String(cause);
      log.warn("node-pty is unavailable; interactive terminals are disabled", cause);
      return null;
    }
  }
}

/** Terminals are square-ish and finite. A zero or a million would both break the pty. */
function clampDimension(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.min(1000, Math.floor(value)));
}

/**
 * The environment a terminal inherits.
 *
 * `node-pty` requires string values, so `undefined` entries — which `process.env` has on
 * Windows — are dropped rather than stringified into the literal `"undefined"`.
 */
function ptyEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string") env[key] = value;
  }
  // Tells programs that ask what the terminal can do. Set here rather than trusted from
  // the parent, whose own TERM describes wherever the engine was launched from.
  env["TERM"] = "xterm-256color";
  env["COLORTERM"] = "truecolor";
  return env;
}
