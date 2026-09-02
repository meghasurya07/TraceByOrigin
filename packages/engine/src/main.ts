/**
 * The engine as a process: JSON-RPC over stdio.
 *
 * This is what the desktop app spawns, and what `trace-engine` runs when a CLI or the
 * future VS Code fork wants an out-of-process engine. It is deliberately thin — every
 * decision worth making lives in `Engine`; this file is a transport and a lifecycle.
 *
 * Four things here are not obvious, and each of them is a bug that bit someone else
 * first:
 *
 * **stdout is claimed, then taken away.** The protocol lives on stdout, so a single
 * stray `console.log` — ours, or a dependency's, or a deprecation warning Node decides
 * to print — corrupts the stream and the client sees a parse failure it cannot explain.
 * So the real `stdout.write` is captured on the first line and then `process.stdout` is
 * pointed at stderr. After that, the only thing on stdout is frames, by construction
 * rather than by discipline.
 *
 * **`process.exit()` is never called on the happy path.** On Windows a pipe-backed
 * stdout is asynchronous, and exiting truncates whatever is still buffered — which is
 * usually the response to `shutdown`, the one frame the client is waiting for. Setting
 * `process.exitCode` and letting the event loop drain is the difference between a clean
 * disconnect and a client that reports the engine crashed.
 *
 * **stdin closing is the parent dying.** A desktop app that is force-quit does not get
 * to send `shutdown`. The engine has to notice its input has gone and wind down itself,
 * or it becomes an orphan holding ptys and a git lock.
 *
 * **An uncaught exception is not survivable, and an unhandled rejection is.** The first
 * means unknown state, so it shuts down and exits non-zero. The second is almost always
 * a background write that nobody awaited — killing the user's session over it would be
 * the worse outcome, so it is logged and the engine keeps working.
 *
 * Copyright (c) 2026 Origin AI
 */

import { RpcPeer, type Transport } from "@trace/protocol";
import { ENGINE_VERSION, Engine } from "./engine.js";
import { Logger, type LogLevel } from "./logger.js";

/**
 * The real stdout, captured before anything else can be imported that might write to it.
 *
 * Bound, because the reassignment below replaces the property and an unbound reference
 * would call the replacement. Two callers: the transport, which writes protocol frames,
 * and `--help`/`--version`, which return before any protocol exists and so are free to
 * behave like every other CLI.
 */
const writeStdout = process.stdout.write.bind(process.stdout);

/**
 * Everything that thinks it is writing to stdout now writes to stderr.
 *
 * The cast is unavoidable: `write` is overloaded three ways and the replacement has to
 * satisfy all of them. Forwarding to `stderr.write` rather than dropping the output
 * keeps a stray `console.log` visible to whoever is debugging, which is the whole point
 * of not silencing it.
 */
process.stdout.write = ((
  chunk: string | Uint8Array,
  encoding?: unknown,
  callback?: unknown,
): boolean =>
  (process.stderr.write as (c: unknown, e?: unknown, cb?: unknown) => boolean)(
    chunk,
    encoding,
    callback,
  )) as typeof process.stdout.write;

const log = new Logger("main");

const LOG_LEVELS: readonly LogLevel[] = ["debug", "info", "warn", "error"];

/**
 * How long the engine waits for a disconnect after answering a `shutdown` request.
 *
 * Long enough that the response has certainly been written and the client has had its
 * turn to close the pipe; short enough that a client which never does leaves an orphan
 * for two seconds rather than forever.
 */
const SHUTDOWN_GRACE_MS = 2000;

interface Args {
  home?: string;
  logLevel?: LogLevel;
}

const USAGE = `trace-engine ${ENGINE_VERSION}

The Trace engine, speaking JSON-RPC 2.0 over newline-delimited JSON on stdio.
Normally started by the Trace app rather than by hand.

  --home <path>        State directory. Defaults to $TRACE_HOME or ~/.trace
  --log-level <level>  debug | info | warn | error. Defaults to info
  --version            Print the version and exit
  --help               Print this and exit

stdout carries protocol frames only. Logs and diagnostics go to stderr.
`;

/**
 * Parse argv, or explain what went wrong and stop.
 *
 * Hand-rolled rather than a dependency: four flags is not worth a parser, and the
 * engine's startup path is one place where a transitive dependency writing to stdout
 * would be especially expensive to debug.
 */
function parseArgs(argv: readonly string[]): Args | null {
  const args: Args = {};
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    switch (flag) {
      case "--help":
      case "-h":
        // The real stdout, not the redirected one: nothing after this speaks the
        // protocol, and `trace-engine --help | less` should work.
        writeStdout(USAGE);
        return null;
      case "--version":
      case "-v":
        writeStdout(`${ENGINE_VERSION}\n`);
        return null;
      case "--home": {
        const value = argv[++i];
        if (value === undefined) {
          process.stderr.write("--home needs a path\n");
          process.exitCode = 2;
          return null;
        }
        args.home = value;
        break;
      }
      case "--log-level": {
        const value = argv[++i];
        if (value === undefined || !LOG_LEVELS.includes(value as LogLevel)) {
          process.stderr.write(`--log-level must be one of: ${LOG_LEVELS.join(", ")}\n`);
          process.exitCode = 2;
          return null;
        }
        args.logLevel = value as LogLevel;
        break;
      }
      default:
        process.stderr.write(`Unknown argument "${flag}"\n\n${USAGE}`);
        process.exitCode = 2;
        return null;
    }
  }
  return args;
}

/**
 * stdio as a `Transport`.
 *
 * No outbound queue. `stdout.write` already buffers when the pipe is full, and a second
 * buffer in front of Node's own would double the memory a streaming turn costs while
 * adding a place for frames to be reordered. Writes are therefore fire-and-forget, with
 * `EPIPE` treated as the client having gone rather than as an error worth reporting —
 * a parent that exits mid-turn is normal, not exceptional.
 */
function stdioTransport(): Transport {
  // An array, not a single slot. `RpcPeer` registers its own close handler in its
  // constructor — the one that rejects every in-flight request — and the lifecycle below
  // registers another. A single-listener transport would silently drop whichever came
  // first, leaving pending requests hanging forever on a closed pipe.
  const closeListeners: ((reason?: Error) => void)[] = [];
  let closed = false;

  const fireClose = (reason?: Error): void => {
    if (closed) return;
    closed = true;
    for (const listener of closeListeners) listener(reason);
  };

  return {
    send(frame) {
      if (closed) return;
      try {
        writeStdout(frame);
      } catch (cause) {
        const code = (cause as { code?: string } | null)?.code;
        if (code === "EPIPE") {
          fireClose();
          return;
        }
        throw cause;
      }
    },
    onData(listener) {
      // No `setEncoding`: the decoder takes bytes, and decoding here would split a
      // multi-byte character across two chunks and corrupt the frame.
      process.stdin.on("data", (chunk: Buffer) => listener(chunk));
      process.stdin.on("end", () => fireClose());
      process.stdin.on("close", () => fireClose());
      process.stdin.on("error", (cause: Error) => fireClose(cause));
      process.stdin.resume();
    },
    onClose(listener) {
      closeListeners.push(listener);
    },
    close() {
      fireClose();
      // Paused rather than destroyed. Destroying stdin can surface as an error on the
      // *parent's* write end, which turns our clean shutdown into their crash report.
      process.stdin.pause();
    },
  };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args === null) return;

  Logger.setLevel(args.logLevel ?? "info");

  const transport = stdioTransport();
  const peer = new RpcPeer(transport, {
    name: "engine",
    onParseFailure: (failure) => {
      // Logged, not fatal. A frame we cannot parse means one request is lost; tearing
      // the connection down would lose every other session on it too.
      log.warn("Discarded an unparseable frame", {
        raw: failure.raw,
        error: failure.error.message,
      });
    },
    onInternalError: (error, context) => {
      log.error(`Peer error in ${context}`, error);
    },
  });

  /**
   * Resolves when the process should exit, and not before.
   *
   * A promise rather than a `process.exit()` from inside each handler, because exiting
   * from a handler is what truncates the last frame on a Windows pipe. Everything below
   * settles this instead, and the process ends by running out of work.
   */
  let release: () => void = () => undefined;
  const exited = new Promise<void>((resolve) => {
    release = resolve;
  });

  /** Wind down once, from whichever of the five exits fires first. */
  let stopping: Promise<void> | null = null;
  const stop = (reason: string, exitCode?: number): Promise<void> => {
    stopping ??= (async () => {
      log.info(`Stopping: ${reason}`);
      try {
        await engine.shutdown();
      } catch (cause) {
        log.error("Shutdown did not complete cleanly", cause);
      }
      peer.close();
      if (exitCode !== undefined) process.exitCode = exitCode;
      release();
    })();
    return stopping;
  };

  const engine = new Engine(peer, {
    ...(args.home === undefined ? {} : { home: args.home }),
    /**
     * The `shutdown` *request* also ends the process.
     *
     * A client that asks the engine to stop and then holds the pipe open would otherwise
     * leave an orphan behind — the whole reason `stdin` closing is treated as an exit.
     * The grace period exists because that request still has a response to deliver: the
     * client normally closes the pipe the moment it arrives, which fires `stop` first
     * and makes this timer moot. It is the backstop for the client that does not.
     */
    onShutdown: () => {
      const timer = setTimeout(() => {
        void stop("the shutdown request was not followed by a disconnect");
      }, SHUTDOWN_GRACE_MS);
      // Otherwise this timer alone keeps the event loop alive for its full duration on
      // the ordinary path, turning a clean exit into a two-second pause.
      timer.unref();
    },
  });

  transport.onClose((cause) => {
    void stop(cause ? `stdin failed: ${cause.message}` : "stdin closed", cause ? 1 : undefined);
  });

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
      void stop(signal);
    });
  }

  process.on("uncaughtException", (cause) => {
    log.error("Uncaught exception; the engine cannot vouch for its state", cause);
    void stop("uncaught exception", 1);
  });

  process.on("unhandledRejection", (cause) => {
    // Survivable on purpose — see the header. Almost always a background persistence
    // write, and losing the running turn over one would be the worse trade.
    log.error("Unhandled promise rejection", cause);
  });

  log.info(`Trace engine ${ENGINE_VERSION} ready on stdio`, { pid: process.pid });
  await exited;
}

await main();
