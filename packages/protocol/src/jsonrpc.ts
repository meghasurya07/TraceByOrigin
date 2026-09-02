/**
 * JSON-RPC 2.0 envelope types for the Trace engine protocol.
 *
 * Trace follows the same architecture every serious agent-first product landed on:
 * one headless engine, many thin surfaces. The engine owns fs/git/pty/index/agent-loop;
 * the desktop app, CLI, web app, and (later) the IDE fork are all *clients* speaking
 * this protocol. Keeping the contract narrow and versioned is what makes adding a
 * surface cheap instead of a rewrite.
 *
 * Transport is deliberately not specified here — see `framing.ts`. Today the desktop
 * app speaks NDJSON over stdio to a child process; the web surface will speak the
 * identical message shapes over a WebSocket.
 *
 * Copyright (c) 2026 Origin AI
 */

/** Bumped on any breaking change to methods, params, results, or events. */
export const PROTOCOL_VERSION = 1;

export type JsonRpcId = number | string;

export interface JsonRpcRequest<TMethod extends string = string, TParams = unknown> {
  jsonrpc: "2.0";
  id: JsonRpcId;
  method: TMethod;
  params: TParams;
}

export interface JsonRpcNotification<TMethod extends string = string, TParams = unknown> {
  jsonrpc: "2.0";
  method: TMethod;
  params: TParams;
  /** Notifications never carry an id. Present as `never` to make misuse a type error. */
  id?: never;
}

export interface JsonRpcSuccessResponse<TResult = unknown> {
  jsonrpc: "2.0";
  id: JsonRpcId;
  result: TResult;
}

export interface JsonRpcErrorPayload {
  code: number;
  message: string;
  data?: unknown;
}

export interface JsonRpcErrorResponse {
  jsonrpc: "2.0";
  /** null when the request could not be parsed well enough to recover an id. */
  id: JsonRpcId | null;
  error: JsonRpcErrorPayload;
}

export type JsonRpcResponse<TResult = unknown> =
  | JsonRpcSuccessResponse<TResult>
  | JsonRpcErrorResponse;

export type JsonRpcMessage =
  | JsonRpcRequest
  | JsonRpcNotification
  | JsonRpcSuccessResponse
  | JsonRpcErrorResponse;

/**
 * Error codes. -32768..-32000 is reserved by the JSON-RPC spec; everything Trace
 * defines lives at or above -31999 so it can never collide with a spec addition.
 */
export const ErrorCode = {
  // --- JSON-RPC 2.0 reserved
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,

  // --- Trace: lifecycle
  /** A request other than `initialize` arrived before the handshake completed. */
  NotInitialized: -31999,
  /** `initialize` was called twice on one connection. */
  AlreadyInitialized: -31998,
  /** The client's PROTOCOL_VERSION is not supported by this engine. */
  ProtocolVersionMismatch: -31997,
  /** The engine is shutting down and will not accept new work. */
  ShuttingDown: -31996,
  /**
   * There is no live engine connection — it crashed and is being respawned, or
   * respawning gave up.
   *
   * Raised client-side rather than by the engine, for the obvious reason. It earns a
   * code because the UI's response is completely different from a failed request:
   * no turn error, no retry button, just the engine banner. Without it, a dead
   * engine is indistinguishable from a bad prompt.
   */
  EngineUnavailable: -31995,

  // --- Trace: resources
  SessionNotFound: -31899,
  WorkspaceNotFound: -31898,
  TerminalNotFound: -31897,
  FileNotFound: -31896,
  /** Path escaped every open workspace root. Always a bug or an attack; never retried. */
  PathOutsideWorkspace: -31895,

  // --- Trace: agent turn
  /** A prompt arrived while the session already had a turn in flight. */
  TurnAlreadyActive: -31799,
  /** The turn was cancelled by `session/interrupt` or client disconnect. */
  TurnCancelled: -31798,
  /** The user denied a tool call and the agent could not proceed. */
  PermissionDenied: -31797,
  /**
   * The conversation no longer fits in the model's context window.
   *
   * Separate from `ProviderError` because the remedy is specific and the UI should
   * offer it: compact the session or branch from a checkpoint. A "retry" button
   * here would fail identically every time.
   */
  ContextExceeded: -31796,

  // --- Trace: credentials / provider
  /**
   * No credential for the requested provider.
   *
   * Either the user's own key is missing (`anthropic`) or they are not signed in, so
   * the gateway has no account token to send (`trace`). The UI's remedy differs, which
   * is why the message is engine-authored and the code is not.
   */
  MissingApiKey: -31699,
  /** Provider rejected our credentials. */
  ProviderAuthFailed: -31698,
  /** Provider rate-limited or quota-exhausted us. Retryable with backoff. */
  ProviderRateLimited: -31697,
  /** Any other non-2xx from the model provider. `data` carries status + body. */
  ProviderError: -31696,
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

/** An error the engine raises deliberately, carrying a protocol code across the wire. */
export class RpcError extends Error {
  readonly code: ErrorCodeValue | number;
  readonly data?: unknown;

  constructor(code: ErrorCodeValue | number, message: string, data?: unknown) {
    super(message);
    this.name = "RpcError";
    this.code = code;
    if (data !== undefined) this.data = data;
  }

  toPayload(): JsonRpcErrorPayload {
    return this.data === undefined
      ? { code: this.code, message: this.message }
      : { code: this.code, message: this.message, data: this.data };
  }
}

// --- Narrowing helpers. Used on both ends of every transport, so they must be
// --- total and must not throw on hostile input.

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isJsonRpcRequest(value: unknown): value is JsonRpcRequest {
  return (
    isObject(value) &&
    value["jsonrpc"] === "2.0" &&
    typeof value["method"] === "string" &&
    (typeof value["id"] === "number" || typeof value["id"] === "string")
  );
}

export function isJsonRpcNotification(value: unknown): value is JsonRpcNotification {
  return (
    isObject(value) &&
    value["jsonrpc"] === "2.0" &&
    typeof value["method"] === "string" &&
    value["id"] === undefined
  );
}

export function isJsonRpcResponse(value: unknown): value is JsonRpcResponse {
  if (!isObject(value) || value["jsonrpc"] !== "2.0") return false;
  if (typeof value["method"] === "string") return false;
  return "result" in value || "error" in value;
}

export function isJsonRpcErrorResponse(value: unknown): value is JsonRpcErrorResponse {
  return isJsonRpcResponse(value) && "error" in value && isObject(value.error);
}
