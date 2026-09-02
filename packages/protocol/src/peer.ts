/**
 * A transport-agnostic, fully-typed JSON-RPC peer.
 *
 * Both ends of every Trace connection use this same class. The engine registers
 * request handlers and emits notifications; the desktop app issues requests and
 * subscribes to notifications. Symmetry matters: it means request correlation,
 * timeouts, cancellation, and error mapping are implemented and debugged exactly
 * once, instead of once per surface.
 *
 * The peer knows nothing about stdio, WebSockets, or Electron IPC — it takes a
 * `Transport`. That is what lets the CLI (child process), the desktop app
 * (utilityProcess), and the future web client (WebSocket) share this file.
 *
 * Copyright (c) 2026 Origin AI
 */

import { FrameDecoder, encodeFrame, type FrameParseFailure } from "./framing.js";
import {
  ErrorCode,
  PROTOCOL_VERSION,
  RpcError,
  isJsonRpcErrorResponse,
  isJsonRpcNotification,
  isJsonRpcRequest,
  isJsonRpcResponse,
  type JsonRpcId,
  type JsonRpcMessage,
} from "./jsonrpc.js";
import type {
  NotificationMap,
  NotificationMethod,
  NotificationParamsOf,
  ParamsOf,
  RequestMethod,
  RequestMap,
  ResultOf,
} from "./methods.js";

export interface Transport {
  send(frame: string): void;
  /** Register the data sink. Called once, by the peer constructor. */
  onData(listener: (chunk: Uint8Array | string) => void): void;
  onClose(listener: (reason?: Error) => void): void;
  close(): void;
}

export interface RequestOptions {
  /** Reject after this long. Omit for no timeout — correct for agent turns. */
  timeoutMs?: number;
  /** Abort the wait early. Does not cancel work already running on the peer. */
  signal?: AbortSignal;
}

export type RequestHandler<M extends RequestMethod> = (
  params: ParamsOf<M>,
) => ResultOf<M> | Promise<ResultOf<M>>;

export type NotificationHandler<M extends NotificationMethod> = (
  params: NotificationParamsOf<M>,
) => void;

export interface RpcPeerOptions {
  /** Tagged into log output so a mixed transcript stays readable. */
  name?: string;
  onParseFailure?: (failure: FrameParseFailure) => void;
  /** Surfaced instead of thrown — a peer must survive a handler that misbehaves. */
  onInternalError?: (error: Error, context: string) => void;
}

/**
 * Type-erased handler shape used inside the routing table.
 *
 * `RequestHandler<M>` is contravariant in its parameter, so a `Map` keyed by the
 * union of methods cannot store the per-method handlers directly. Erasing at the
 * storage boundary keeps the *public* API precisely typed while letting the
 * dispatcher stay a simple string lookup.
 */
type ErasedRequestHandler = (params: unknown) => unknown;

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  method: string;
  timer?: ReturnType<typeof setTimeout>;
  cleanup?: () => void;
}

export class RpcPeer {
  readonly protocolVersion = PROTOCOL_VERSION;

  private nextId = 1;
  private readonly pending = new Map<JsonRpcId, PendingRequest>();
  private readonly requestHandlers = new Map<string, ErasedRequestHandler>();
  private readonly notificationHandlers = new Map<string, Set<(params: unknown) => void>>();
  private readonly decoder: FrameDecoder;
  private closed = false;

  constructor(
    private readonly transport: Transport,
    private readonly options: RpcPeerOptions = {},
  ) {
    this.decoder = new FrameDecoder(options.onParseFailure);
    transport.onData((chunk) => this.handleChunk(chunk));
    transport.onClose((reason) => this.handleClose(reason));
  }

  // -------------------------------------------------------------------------
  // Outbound
  // -------------------------------------------------------------------------

  request<M extends RequestMethod>(
    method: M,
    params: ParamsOf<M>,
    options: RequestOptions = {},
  ): Promise<ResultOf<M>> {
    if (this.closed) {
      return Promise.reject(
        new RpcError(ErrorCode.ShuttingDown, `Peer is closed; cannot send "${method}"`),
      );
    }

    const id = this.nextId++;

    return new Promise<ResultOf<M>>((resolve, reject) => {
      const entry: PendingRequest = {
        resolve: resolve as (value: unknown) => void,
        reject,
        method,
      };

      if (options.timeoutMs !== undefined) {
        entry.timer = setTimeout(() => {
          this.pending.delete(id);
          reject(
            new RpcError(
              ErrorCode.InternalError,
              `Request "${method}" timed out after ${options.timeoutMs}ms`,
            ),
          );
        }, options.timeoutMs);
      }

      const { signal } = options;
      if (signal) {
        if (signal.aborted) {
          if (entry.timer) clearTimeout(entry.timer);
          reject(new RpcError(ErrorCode.TurnCancelled, `Request "${method}" aborted`));
          return;
        }
        const onAbort = () => {
          this.settle(id, () =>
            reject(new RpcError(ErrorCode.TurnCancelled, `Request "${method}" aborted`)),
          );
        };
        signal.addEventListener("abort", onAbort, { once: true });
        entry.cleanup = () => signal.removeEventListener("abort", onAbort);
      }

      this.pending.set(id, entry);
      this.write({ jsonrpc: "2.0", id, method, params });
    });
  }

  notify<M extends NotificationMethod>(method: M, params: NotificationParamsOf<M>): void {
    if (this.closed) return;
    this.write({ jsonrpc: "2.0", method, params });
  }

  // -------------------------------------------------------------------------
  // Inbound registration
  // -------------------------------------------------------------------------

  /** Register the handler for one method. Replaces any previous handler. */
  handle<M extends RequestMethod>(method: M, handler: RequestHandler<M>): void {
    this.requestHandlers.set(method, handler as unknown as ErasedRequestHandler);
  }

  /** Bulk-register. Ergonomic for the engine, which registers ~35 methods at boot. */
  handleAll(handlers: Partial<{ [M in RequestMethod]: RequestHandler<M> }>): void {
    for (const [method, handler] of Object.entries(handlers)) {
      if (handler) {
        this.requestHandlers.set(method, handler as unknown as ErasedRequestHandler);
      }
    }
  }

  /** Subscribe to a notification. Returns an unsubscribe function. */
  on<M extends NotificationMethod>(method: M, handler: NotificationHandler<M>): () => void {
    let set = this.notificationHandlers.get(method);
    if (!set) {
      set = new Set();
      this.notificationHandlers.set(method, set);
    }
    const erased = handler as (params: unknown) => void;
    set.add(erased);
    return () => {
      set?.delete(erased);
    };
  }

  // -------------------------------------------------------------------------
  // Wire handling
  // -------------------------------------------------------------------------

  private write(message: JsonRpcMessage): void {
    try {
      this.transport.send(encodeFrame(message));
    } catch (cause) {
      this.reportInternal(cause, "transport.send");
    }
  }

  private handleChunk(chunk: Uint8Array | string): void {
    let frames;
    try {
      frames = this.decoder.push(chunk);
    } catch (cause) {
      // Frame-size violation: the stream is no longer trustworthy. Tear down
      // rather than continue parsing whatever the peer sends next.
      this.reportInternal(cause, "decoder.push");
      this.close();
      return;
    }
    for (const frame of frames) {
      void this.dispatch(frame.value);
    }
  }

  private async dispatch(value: unknown): Promise<void> {
    if (isJsonRpcRequest(value)) {
      await this.dispatchRequest(value.id, value.method, value.params);
      return;
    }

    if (isJsonRpcNotification(value)) {
      const handlers = this.notificationHandlers.get(value.method);
      if (!handlers) return;
      // Snapshot: a handler may unsubscribe itself while we're iterating.
      for (const handler of [...handlers]) {
        try {
          handler(value.params);
        } catch (cause) {
          this.reportInternal(cause, `notification:${value.method}`);
        }
      }
      return;
    }

    if (isJsonRpcResponse(value)) {
      const entry = this.pending.get(value.id!);
      if (!entry) return; // Late reply to a timed-out or aborted request. Ignore.
      this.settle(value.id!, () => {
        if (isJsonRpcErrorResponse(value)) {
          entry.reject(new RpcError(value.error.code, value.error.message, value.error.data));
        } else {
          entry.resolve((value as { result: unknown }).result);
        }
      });
      return;
    }

    this.options.onParseFailure?.({
      raw: JSON.stringify(value).slice(0, 512),
      error: new Error("Frame is valid JSON but not a JSON-RPC 2.0 message"),
    });
  }

  private async dispatchRequest(id: JsonRpcId, method: string, params: unknown): Promise<void> {
    const handler = this.requestHandlers.get(method);
    if (!handler) {
      this.write({
        jsonrpc: "2.0",
        id,
        error: { code: ErrorCode.MethodNotFound, message: `Unknown method "${method}"` },
      });
      return;
    }

    try {
      const result = await handler(params);
      this.write({ jsonrpc: "2.0", id, result: result ?? null });
    } catch (cause) {
      const error =
        cause instanceof RpcError
          ? cause.toPayload()
          : {
              code: ErrorCode.InternalError,
              message: cause instanceof Error ? cause.message : String(cause),
              data: cause instanceof Error ? { stack: cause.stack } : undefined,
            };
      this.write({ jsonrpc: "2.0", id, error });
    }
  }

  /** Remove a pending entry, clear its timer/listener, then run the settlement. */
  private settle(id: JsonRpcId, run: () => void): void {
    const entry = this.pending.get(id);
    if (!entry) return;
    this.pending.delete(id);
    if (entry.timer) clearTimeout(entry.timer);
    entry.cleanup?.();
    run();
  }

  private handleClose(reason?: Error): void {
    if (this.closed) return;
    this.closed = true;

    const failure =
      reason ??
      new RpcError(ErrorCode.ShuttingDown, "Peer connection closed before the response arrived");

    // Snapshot and clear first: `settle()` deletes before it runs its callback,
    // so going through it here would look up an already-removed entry and never
    // reject. Every in-flight caller must be failed, or a surface hangs forever
    // on a dead engine.
    const orphaned = [...this.pending.values()];
    this.pending.clear();
    for (const entry of orphaned) {
      if (entry.timer) clearTimeout(entry.timer);
      entry.cleanup?.();
      try {
        entry.reject(failure);
      } catch (cause) {
        this.reportInternal(cause, `close:reject:${entry.method}`);
      }
    }
  }

  private reportInternal(cause: unknown, context: string): void {
    const error = cause instanceof Error ? cause : new Error(String(cause));
    if (this.options.onInternalError) this.options.onInternalError(error, context);
    else
      console.error(
        `[RpcPeer${this.options.name ? `:${this.options.name}` : ""}] ${context}`,
        error,
      );
  }

  close(): void {
    if (this.closed) return;
    this.handleClose();
    try {
      this.transport.close();
    } catch (cause) {
      this.reportInternal(cause, "transport.close");
    }
  }

  get isClosed(): boolean {
    return this.closed;
  }
}

/** Compile-time assurance that the maps stay in sync with the peer's generics. */
export type EngineRequestHandlers = { [M in keyof RequestMap]: RequestHandler<M> };
export type EngineNotifications = NotificationMap;
