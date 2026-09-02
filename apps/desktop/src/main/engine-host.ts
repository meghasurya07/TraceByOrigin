/**
 * The engine as a supervised child process.
 *
 * Main owns this, not the renderer. That is the load-bearing decision of the desktop
 * architecture and it is worth restating where the code lives:
 *
 * - `shutdown` must be sent on `before-quit`, when the renderer may already be
 *   destroyed. A renderer-owned connection orphans an engine on every quit — one
 *   holding ptys, a git index lock, and a sqlite handle.
 * - The account token must reach the engine before the first paint, so the model
 *   picker is never briefly wrong. Main reads the keychain; the renderer never sees a
 *   token.
 * - Respawn-with-backoff is lifecycle work, and the renderer is the process most
 *   likely to be reloaded in the middle of it.
 *
 * The engine is spawned as plain Node — Electron's own binary with
 * `ELECTRON_RUN_AS_NODE`, not `utilityProcess`, because `utilityProcess` gives a
 * child no stdin and stdin *is* half the protocol.
 *
 * Copyright (c) 2026 Origin AI
 */

import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { app } from "electron";

import { PROTOCOL_VERSION, RpcPeer, type Transport } from "@trace/protocol";
import type { InitializeResult, NotificationMethod } from "@trace/protocol";
import { RpcEngineClient } from "@trace/client";
import type { EngineNotification, EngineStatus } from "@trace/client";

export type EngineLogLevel = "debug" | "info" | "warn" | "error";

export interface EngineHostOptions {
  /** `--home`. Where sessions, settings, and the index live. */
  homeDir: string;
  logLevel: EngineLogLevel;
  /** Every lifecycle transition, for the renderer's engine banner. */
  onStatus: (status: EngineStatus) => void;
  /** Every engine notification, forwarded to the renderer verbatim. */
  onNotify: (notification: EngineNotification) => void;
  /**
   * Run after each successful handshake, including after a respawn.
   *
   * This is where the account token gets pushed back in. A restart that forgot to
   * re-seed it would leave the app signed in with an engine that cannot reach a
   * model — a state whose only symptom is every prompt failing.
   */
  onReady?: (result: InitializeResult) => void | Promise<void>;
  /** Engine stderr, line by line. */
  onLog?: (line: string) => void;
}

/**
 * Every notification the engine can send. Enumerated rather than derived because
 * there is no runtime value for a type union — and being explicit means adding a
 * notification to the protocol without forwarding it is a visible omission here
 * rather than an event the renderer never receives.
 */
const FORWARDED: readonly NotificationMethod[] = [
  "session/event",
  "terminal/output",
  "terminal/exited",
  "index/progress",
  "log",
  "workPanel/open",
];

/** Delay before each respawn attempt. Running off the end means giving up. */
const BACKOFF_MS: readonly number[] = [500, 1_000, 2_000, 4_000, 8_000];

/**
 * How long an engine must survive before its crash budget resets.
 *
 * Without this, five crashes spread over a week eventually exhaust the budget and the
 * app declares the engine dead on the sixth — having been working fine all along.
 */
const HEALTHY_AFTER_MS = 30_000;

/** `shutdown` is a courtesy; a wedged engine must not be able to block quit. */
const SHUTDOWN_TIMEOUT_MS = 2_000;
const KILL_GRACE_MS = 1_000;

function engineEntry(): string {
  const packaged = path.join(process.resourcesPath, "engine", "dist", "main.js");
  if (app.isPackaged) return packaged;

  // Dev: `app.getAppPath()` is apps/desktop, so the engine is two levels up.
  const local = path.join(app.getAppPath(), "..", "..", "packages", "engine", "dist", "main.js");
  if (existsSync(local)) return local;
  throw new Error(
    `Engine build not found at ${local}. Run \`pnpm -F @trace/engine build\` before starting the app.`,
  );
}

function childTransport(child: ChildProcessWithoutNullStreams): Transport {
  // An array, for the same reason the engine's own transport uses one: `RpcPeer`
  // registers a close listener in its constructor to reject in-flight requests, and
  // the supervisor below registers another.
  const closeListeners: ((reason?: Error) => void)[] = [];
  let closed = false;

  const fireClose = (reason?: Error): void => {
    if (closed) return;
    closed = true;
    for (const listener of closeListeners) listener(reason);
  };

  return {
    send(frame) {
      if (closed || child.stdin.destroyed) return;
      try {
        child.stdin.write(frame);
      } catch (cause) {
        if ((cause as { code?: string } | null)?.code === "EPIPE") {
          fireClose();
          return;
        }
        throw cause;
      }
    },
    onData(listener) {
      // Bytes, not strings: `setEncoding` would split a multi-byte character across
      // two chunks and corrupt the frame that contained it.
      child.stdout.on("data", (chunk: Buffer) => listener(chunk));
      child.stdout.on("end", () => fireClose());
      child.stdout.on("error", (cause: Error) => fireClose(cause));
    },
    onClose(listener) {
      closeListeners.push(listener);
    },
    close() {
      fireClose();
      child.stdin.end();
    },
  };
}

export class EngineHost {
  readonly client: RpcEngineClient;

  #child: ChildProcessWithoutNullStreams | null = null;
  #roots: string[] = [];
  #attempt = 0;
  #stopping = false;
  #healthyTimer: NodeJS.Timeout | null = null;
  #restartTimer: NodeJS.Timeout | null = null;

  constructor(private readonly options: EngineHostOptions) {
    // Constructed against a placeholder peer that is replaced by the first spawn.
    // The alternative — an `RpcEngineClient | null` — would put a null check in front
    // of every call site for the sake of the first fifty milliseconds of the process.
    this.client = new RpcEngineClient({
      peer: new RpcPeer(deadTransport()),
      status: { phase: "starting" },
      onHandlerError: (error, method) => {
        this.options.onLog?.(`[main] notification handler for ${method} threw: ${String(error)}`);
      },
    });

    for (const method of FORWARDED) {
      this.client.on(method, (params) => {
        this.options.onNotify({ method, params } as EngineNotification);
      });
    }
  }

  /** Spawn, handshake, and open the given roots. Throws if the first attempt fails. */
  async start(roots: readonly string[]): Promise<void> {
    this.#roots = [...roots];
    this.#stopping = false;
    await this.#spawn();
  }

  /** Manual recovery from `failed`. Resets the crash budget — the user asked. */
  async restart(): Promise<void> {
    this.#attempt = 0;
    await this.#teardown();
    this.#stopping = false;
    this.#setStatus({ phase: "starting" });
    await this.#spawn();
  }

  /**
   * Ask the engine to stop, then make sure it did.
   *
   * Called from `before-quit`. The sequence matters: `shutdown` lets the engine flush
   * sessions and release the git lock, but a hung engine must not be able to keep the
   * app alive, so every wait has a ceiling and the last resort is SIGKILL.
   */
  async stop(): Promise<void> {
    this.#stopping = true;
    if (this.#restartTimer !== null) clearTimeout(this.#restartTimer);
    if (this.#healthyTimer !== null) clearTimeout(this.#healthyTimer);

    const child = this.#child;
    if (child === null) return;

    await this.client
      .request("shutdown", {}, { timeoutMs: SHUTDOWN_TIMEOUT_MS })
      .catch(() => undefined);

    await new Promise<void>((resolve) => {
      if (child.exitCode !== null || child.signalCode !== null) {
        resolve();
        return;
      }
      const timer = setTimeout(() => {
        child.kill("SIGKILL");
        resolve();
      }, KILL_GRACE_MS);
      child.once("exit", () => {
        clearTimeout(timer);
        resolve();
      });
      child.stdin.end();
    });

    this.#child = null;
  }

  // -- internals -------------------------------------------------------------

  async #spawn(): Promise<void> {
    const entry = engineEntry();
    const child = spawn(
      process.execPath,
      [entry, "--home", this.options.homeDir, "--log-level", this.options.logLevel],
      {
        // `ELECTRON_RUN_AS_NODE` turns Electron's binary into plain Node, so the
        // engine ships as JavaScript with no second runtime to sign or notarize.
        env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true,
      },
    ) as ChildProcessWithoutNullStreams;

    this.#child = child;
    this.#pipeStderr(child);

    const peer = new RpcPeer(childTransport(child), {
      name: "engine",
      onParseFailure: (failure) => {
        this.options.onLog?.(
          `[main] unparseable frame from engine: ${failure.error.message} — ${failure.raw}`,
        );
      },
      onInternalError: (error, context) => {
        this.options.onLog?.(`[main] peer error in ${context}: ${error.message}`);
      },
    });
    this.client.replacePeer(peer);

    child.once("exit", (code, signal) => {
      if (this.#child !== child) return;
      this.#child = null;
      this.#onExit(code, signal);
    });
    child.once("error", (error) => {
      if (this.#child !== child) return;
      this.#child = null;
      this.#onExit(null, null, error.message);
    });

    const result = await this.client.request(
      "initialize",
      {
        protocolVersion: PROTOCOL_VERSION,
        client: {
          name: "trace-desktop",
          version: app.getVersion(),
          capabilities: { permissionPrompts: true, workPanel: true, terminals: true },
        },
        workspaceRoots: this.#roots,
      },
      { timeoutMs: 15_000 },
    );

    this.#setStatus({
      phase: "ready",
      engineVersion: result.engineVersion,
      protocolVersion: result.protocolVersion,
      defaultModel: result.defaultModel,
    });

    this.#healthyTimer = setTimeout(() => {
      this.#attempt = 0;
    }, HEALTHY_AFTER_MS);
    this.#healthyTimer.unref();

    await this.options.onReady?.(result);
  }

  #onExit(code: number | null, signal: string | null, message?: string): void {
    if (this.#healthyTimer !== null) {
      clearTimeout(this.#healthyTimer);
      this.#healthyTimer = null;
    }
    if (this.#stopping) return;

    const reason =
      message ?? (signal !== null ? `killed by ${signal}` : `exited with code ${String(code)}`);
    const delay = BACKOFF_MS[this.#attempt];

    if (delay === undefined) {
      this.#setStatus({
        phase: "failed",
        error: `The engine stopped ${BACKOFF_MS.length} times in a row (${reason}).`,
      });
      return;
    }

    this.#attempt += 1;
    this.#setStatus({ phase: "restarting", attempt: this.#attempt, lastError: reason });

    this.#restartTimer = setTimeout(() => {
      void this.#spawn().catch((error: unknown) => {
        // A spawn that fails synchronously — a deleted build, a handshake rejection —
        // goes back through the same path, so the backoff and the give-up rule apply
        // to it too rather than being a separate silent failure mode.
        this.#onExit(null, null, error instanceof Error ? error.message : String(error));
      });
    }, delay);
    this.#restartTimer.unref();
  }

  #pipeStderr(child: ChildProcessWithoutNullStreams): void {
    let buffer = "";
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => {
      buffer += chunk;
      let newline = buffer.indexOf("\n");
      while (newline !== -1) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (line.length > 0) this.options.onLog?.(line);
        newline = buffer.indexOf("\n");
      }
      // A runaway line with no newline would grow without bound; the engine's logger
      // always terminates, so this only guards against a dependency that does not.
      if (buffer.length > 64 * 1024) {
        this.options.onLog?.(buffer);
        buffer = "";
      }
    });
  }

  async #teardown(): Promise<void> {
    this.#stopping = true;
    await this.stop();
  }

  #setStatus(status: EngineStatus): void {
    this.client.setStatus(status);
    this.options.onStatus(status);
  }
}

/**
 * A transport that is already closed.
 *
 * Exists so `RpcEngineClient` can be constructed before the first child. Requests
 * against it reject rather than hang, which is the correct behaviour for the window
 * between `new EngineHost()` and `start()`.
 */
function deadTransport(): Transport {
  return {
    send() {},
    onData() {},
    onClose(listener) {
      // Immediately, so `RpcPeer` treats itself as closed from the start.
      queueMicrotask(() => listener());
    },
    close() {},
  };
}
