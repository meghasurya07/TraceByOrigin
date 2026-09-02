/**
 * Structured logging.
 *
 * The engine has no terminal of its own — stdout is the protocol channel, so a
 * stray `console.log` there corrupts the stream and hangs the client. Every log
 * therefore goes to stderr *and* out as a `log` notification, which is how the
 * desktop app shows engine internals without asking the user to find a file.
 *
 * Copyright (c) 2026 Origin AI
 */

import type { NotificationMap } from "@trace/protocol";

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export type LogSink = (entry: NotificationMap["log"]) => void;

export class Logger {
  private static minLevel: LogLevel =
    (process.env["TRACE_LOG_LEVEL"] as LogLevel | undefined) ?? "info";
  private static sinks: LogSink[] = [];

  constructor(private readonly scope: string) {}

  static setLevel(level: LogLevel): void {
    Logger.minLevel = level;
  }

  /** Attach a sink (the RPC peer). Returns a detach function. */
  static addSink(sink: LogSink): () => void {
    Logger.sinks.push(sink);
    return () => {
      Logger.sinks = Logger.sinks.filter((s) => s !== sink);
    };
  }

  child(suffix: string): Logger {
    return new Logger(`${this.scope}:${suffix}`);
  }

  debug(message: string, detail?: unknown): void {
    this.emit("debug", message, detail);
  }
  info(message: string, detail?: unknown): void {
    this.emit("info", message, detail);
  }
  warn(message: string, detail?: unknown): void {
    this.emit("warn", message, detail);
  }

  /** Accepts an `unknown` catch binding directly — the common call shape. */
  error(message: string, cause?: unknown): void {
    this.emit("error", message, serializeCause(cause));
  }

  private emit(level: LogLevel, message: string, detail?: unknown): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[Logger.minLevel]) return;

    const entry: NotificationMap["log"] = {
      level,
      scope: this.scope,
      message,
      at: Date.now(),
      ...(detail === undefined ? {} : { detail }),
    };

    // stderr, never stdout: stdout is the protocol.
    const suffix = detail === undefined ? "" : ` ${safeStringify(detail)}`;
    process.stderr.write(`[${level}] ${this.scope}: ${message}${suffix}\n`);

    for (const sink of Logger.sinks) {
      try {
        sink(entry);
      } catch {
        // A failing sink must never take down the thing being logged about.
      }
    }
  }
}

function serializeCause(cause: unknown): unknown {
  if (cause === undefined) return undefined;
  if (cause instanceof Error) {
    return {
      name: cause.name,
      message: cause.message,
      stack: cause.stack,
      ...("code" in cause ? { code: (cause as { code: unknown }).code } : {}),
    };
  }
  return cause;
}

function safeStringify(value: unknown): string {
  try {
    return typeof value === "string" ? value : JSON.stringify(value);
  } catch {
    return "[unserializable]";
  }
}

export const rootLogger = new Logger("engine");
