/**
 * NDJSON framing for the engine protocol.
 *
 * One JSON value per line, `\n`-terminated, UTF-8. Chosen over LSP-style
 * `Content-Length` headers because it stays human-readable in a log tail and
 * `pnpm engine < script.ndjson` becomes a usable debugging tool.
 *
 * Deliberately free of Node built-ins — `TextDecoder`/`TextEncoder` exist in Node,
 * browsers, and Electron renderers alike, so the web surface reuses this file
 * verbatim over a WebSocket.
 *
 * Copyright (c) 2026 Origin AI
 */

import type { JsonRpcMessage } from "./jsonrpc.js";

/** Guard against a malformed peer streaming an unbounded line and exhausting memory. */
export const MAX_FRAME_BYTES = 64 * 1024 * 1024; // 64 MiB

export class FrameTooLargeError extends Error {
  constructor(readonly bytes: number) {
    super(`Frame exceeded ${MAX_FRAME_BYTES} bytes (got at least ${bytes}); connection is unsafe`);
    this.name = "FrameTooLargeError";
  }
}

/** Encode one message as a single NDJSON frame, newline included. */
export function encodeFrame(message: JsonRpcMessage): string {
  // Guaranteed newline-free: JSON.stringify escapes literal newlines inside strings.
  return JSON.stringify(message) + "\n";
}

export interface DecodedFrame {
  /** Parsed JSON. Shape is unvalidated — run it through the `isJsonRpc*` guards. */
  value: unknown;
}

export interface FrameParseFailure {
  /** The raw line that would not parse, truncated for logging. */
  raw: string;
  error: Error;
}

/**
 * Incremental NDJSON decoder.
 *
 * Handles the two things a naive `chunk.split("\n")` gets wrong: a JSON value
 * split across chunks, and a multi-byte UTF-8 character split across chunks
 * (`TextDecoder` with `stream: true` buffers the partial code point for us).
 *
 * Unparseable lines are *reported*, not thrown, so one bad frame from a peer
 * cannot kill an otherwise healthy connection.
 */
export class FrameDecoder {
  private buffer = "";
  private readonly decoder = new TextDecoder("utf-8");

  constructor(private readonly onParseFailure?: (failure: FrameParseFailure) => void) {}

  /** Feed raw bytes (stdio) or a string (WebSocket); get back whole frames. */
  push(chunk: Uint8Array | string): DecodedFrame[] {
    this.buffer +=
      typeof chunk === "string" ? chunk : this.decoder.decode(chunk, { stream: true });

    const frames: DecodedFrame[] = [];
    let newlineIndex: number;

    while ((newlineIndex = this.buffer.indexOf("\n")) !== -1) {
      const line = this.buffer.slice(0, newlineIndex);
      this.buffer = this.buffer.slice(newlineIndex + 1);

      // Tolerate CRLF and blank keep-alive lines.
      const trimmed = line.endsWith("\r") ? line.slice(0, -1) : line;
      if (trimmed.trim() === "") continue;

      try {
        frames.push({ value: JSON.parse(trimmed) as unknown });
      } catch (cause) {
        this.onParseFailure?.({
          raw: trimmed.length > 512 ? `${trimmed.slice(0, 512)}…` : trimmed,
          error: cause instanceof Error ? cause : new Error(String(cause)),
        });
      }
    }

    // Check *after* draining: a large buffer with no newline is the dangerous case.
    if (this.buffer.length > MAX_FRAME_BYTES) {
      const bytes = this.buffer.length;
      this.buffer = "";
      throw new FrameTooLargeError(bytes);
    }

    return frames;
  }

  /** Bytes buffered awaiting a newline. Useful in tests and health checks. */
  get pending(): number {
    return this.buffer.length;
  }

  reset(): void {
    this.buffer = "";
  }
}
