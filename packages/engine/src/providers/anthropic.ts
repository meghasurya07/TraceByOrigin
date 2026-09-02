/**
 * The Anthropic provider.
 *
 * Everything that knows about `@anthropic-ai/sdk` lives here, so the agent loop in
 * `session/turn.ts` deals only in Trace's own types. Three jobs:
 *
 *   1. **Assemble a cache-stable request.** Prompt caching is a prefix match over
 *      `tools` → `system` → `messages`, and the difference between getting it right
 *      and getting it wrong is roughly 10x on a long coding session. Every decision
 *      in `buildRequest` exists to keep that prefix byte-identical between
 *      iterations.
 *   2. **Stream, with block indices intact.** We iterate the raw stream events
 *      rather than using the `text`/`thinking` convenience callbacks, because the UI
 *      needs to know *which* content block a delta belongs to in order to render
 *      interleaved thinking, prose, and tool calls in the right order.
 *   3. **Classify failures into something actionable.** "Request failed" is not a
 *      useful thing to show someone paying for their own tokens.
 *
 * A deliberate non-goal: this file does not implement the agent loop. The SDK's
 * `tool_runner` would do that, and it is genuinely good, but it cannot give us
 * mid-turn interruption, per-call permission gating, and checkpointing on the same
 * event bus. So we drive `messages.stream()` ourselves.
 *
 * Copyright (c) 2026 Origin AI
 */

import Anthropic, {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIUserAbortError,
  AuthenticationError,
  BadRequestError,
  InternalServerError,
  NotFoundError,
  PermissionDeniedError,
  RateLimitError,
  RetryableError,
} from "@anthropic-ai/sdk";
import type {
  MessageCreateParamsStreaming,
  MessageParam,
  Model,
  TextBlockParam,
  Tool,
  Usage,
} from "@anthropic-ai/sdk/resources/messages";
import {
  ErrorCode,
  RpcError,
  type EngineSettings,
  type ModelInfo,
  type StopReason,
  type TokenUsage,
} from "@trace/protocol";
import type { Logger } from "../logger.js";
import { emptyUsage } from "../models.js";
import type { ToolDefinition } from "../tools/registry.js";

/** Streaming keeps us clear of the 10-minute non-streaming request ceiling. */
const DEFAULT_MAX_TOKENS = 64_000;

/**
 * Retries for transient failures only. Deliberately few: a coding agent that
 * silently retries for a minute reads as a hang, and the turn loop can always
 * present a "retry" affordance the user controls.
 */
const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 1_000;

/**
 * Cache-control breakpoints, and where they go.
 *
 * The API allows four. We spend them like this:
 *
 *   1. The last `system` block — which caches `tools` too, since tools precede
 *      system in the prefix. This one never moves, so after the first request of a
 *      session it is a guaranteed hit.
 *   2 & 3. Two rolling breakpoints near the end of `messages`. Two rather than one
 *      because a cache entry has a ~5 minute TTL: keeping the previous position
 *      addressable means the second iteration of a turn still hits, instead of
 *      re-writing the whole conversation.
 *
 * The fourth is left unspent, as headroom for the memory layer's retrieved-context
 * block — which is the one thing we know is going to want its own breakpoint.
 */
const ROLLING_BREAKPOINTS = 2;

export interface StreamCallbacks {
  /** A prose delta, with the index of the content block it belongs to. */
  onText(blockIndex: number, text: string): void;
  /** A reasoning delta. Rendered behind a disclosure, or dropped if showThinking is off. */
  onThinking(blockIndex: number, text: string): void;
  /** A tool call has begun. Fires before its arguments are known. */
  onToolStart(blockIndex: number, callId: string, tool: string): void;
  /** Partial argument JSON, so the UI can say "editing src/app.ts…" mid-stream. */
  onToolInputDelta(callId: string, partialJson: string): void;
}

export interface AssistantToolCall {
  callId: string;
  tool: string;
  input: unknown;
  blockIndex: number;
}

export interface StreamResult {
  /** The assistant turn exactly as the API returned it — push this into history unmodified. */
  message: MessageParam;
  /** Concatenated prose, for the transcript. */
  text: string;
  /** Tool calls to adjudicate and run, in the order the model emitted them. */
  toolCalls: AssistantToolCall[];
  stopReason: StopReason;
  usage: TokenUsage;
}

export interface RequestSpec {
  model: ModelInfo;
  system: string;
  messages: MessageParam[];
  tools: readonly ToolDefinition[];
  settings: Pick<EngineSettings, "effort" | "showThinking">;
  /** Hard ceiling on this response. Defaults to the smaller of 64k and the model's max. */
  maxTokens?: number;
}

export class AnthropicProvider {
  private client: Anthropic | null = null;
  private clientKey: string | null = null;

  constructor(
    private readonly getKey: () => string | undefined,
    private readonly log: Logger,
  ) {}

  /**
   * Build (or reuse) the SDK client.
   *
   * Rebuilt when the key changes so a user who fixes a bad key does not have to
   * restart the engine. `maxRetries: 0` because retry policy lives in `stream()`,
   * where it can be reported to the user instead of hidden inside the SDK.
   */
  private clientFor(key: string): Anthropic {
    if (this.client && this.clientKey === key) return this.client;
    this.client = new Anthropic({ apiKey: key, maxRetries: 0 });
    this.clientKey = key;
    return this.client;
  }

  private requireKey(): string {
    const key = this.getKey();
    if (!key) {
      throw new RpcError(
        ErrorCode.MissingApiKey,
        "No Anthropic API key is configured. Trace is bring-your-own-key: add one in Settings to start a turn.",
      );
    }
    return key;
  }

  /**
   * One request, streamed.
   *
   * Returns the assistant message verbatim so the caller can append it to history
   * without reconstructing it. Reconstruction is where thinking-block signatures get
   * lost, and a modified thinking block is a 400 on the next request.
   */
  async stream(
    spec: RequestSpec,
    callbacks: StreamCallbacks,
    signal: AbortSignal,
  ): Promise<StreamResult> {
    const key = this.requireKey();
    const client = this.clientFor(key);
    const params = buildRequest(spec);

    let lastError: unknown;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      signal.throwIfAborted();
      try {
        return await this.streamOnce(client, params, callbacks, signal);
      } catch (cause) {
        lastError = cause;
        const classified = classify(cause);
        if (!classified.retryable || attempt === MAX_ATTEMPTS) throw classified.error;

        const delay = backoffMs(attempt, cause);
        this.log.warn(
          `Provider request failed (attempt ${attempt}/${MAX_ATTEMPTS}), retrying in ${delay}ms`,
          { reason: classified.error.message },
        );
        await sleep(delay, signal);
      }
    }
    // Unreachable: the loop either returns or throws. Present for exhaustiveness.
    throw classify(lastError).error;
  }

  private async streamOnce(
    client: Anthropic,
    params: MessageCreateParamsStreaming,
    callbacks: StreamCallbacks,
    signal: AbortSignal,
  ): Promise<StreamResult> {
    const stream = client.messages.stream(params, { signal });

    // Tool-call ids by block index. The SDK gives us `content_block_start` with the
    // id and name, then a run of `input_json_delta` events carrying only the index —
    // so the index is the only thing tying a delta back to its call.
    const callIdByBlock = new Map<number, string>();

    try {
      for await (const event of stream) {
        switch (event.type) {
          case "content_block_start": {
            const block = event.content_block;
            if (block.type === "tool_use") {
              callIdByBlock.set(event.index, block.id);
              callbacks.onToolStart(event.index, block.id, block.name);
            }
            break;
          }
          case "content_block_delta": {
            const delta = event.delta;
            if (delta.type === "text_delta") {
              callbacks.onText(event.index, delta.text);
            } else if (delta.type === "thinking_delta") {
              callbacks.onThinking(event.index, delta.thinking);
            } else if (delta.type === "input_json_delta") {
              const callId = callIdByBlock.get(event.index);
              if (callId) callbacks.onToolInputDelta(callId, delta.partial_json);
            }
            // `signature_delta` and `citations_delta` are intentionally ignored:
            // both are carried inside the final message, which is what we persist.
            break;
          }
          default:
            break;
        }
      }

      const final = await stream.finalMessage();
      const toolCalls: AssistantToolCall[] = [];
      let text = "";

      final.content.forEach((block, index) => {
        if (block.type === "text") {
          text += block.text;
        } else if (block.type === "tool_use") {
          toolCalls.push({
            callId: block.id,
            tool: block.name,
            input: block.input,
            blockIndex: index,
          });
        }
      });

      return {
        // `content` verbatim — thinking blocks and their signatures included.
        message: { role: "assistant", content: final.content },
        text,
        toolCalls,
        stopReason: mapStopReason(final.stop_reason),
        usage: mapUsage(final.usage),
      };
    } catch (cause) {
      // Make sure an abort mid-iteration actually tears the socket down rather than
      // leaving a request billing in the background.
      if (!stream.ended) stream.abort();
      throw cause;
    }
  }

  /**
   * Validate a key with the cheapest possible real request.
   *
   * A real call rather than a `/v1/models` fetch, because the failure users hit is
   * a key that lists models fine but has no credit or no Messages access.
   */
  async validateKey(model: string): Promise<{ ok: true } | { ok: false; message: string }> {
    const key = this.requireKey();
    try {
      await this.clientFor(key).messages.create({
        model: model as Model,
        max_tokens: 1,
        messages: [{ role: "user", content: "." }],
      });
      return { ok: true };
    } catch (cause) {
      return { ok: false, message: classify(cause).error.message };
    }
  }

  /** Drop the cached client, e.g. after the key is deleted. */
  reset(): void {
    this.client = null;
    this.clientKey = null;
  }
}

// ---------------------------------------------------------------------------
// Request assembly
// ---------------------------------------------------------------------------

/**
 * Turn a `RequestSpec` into API parameters.
 *
 * Exported for the smoke test: the cache-breakpoint placement is the single
 * highest-leverage detail in the engine's cost profile and the easiest to break
 * without noticing, since a destroyed cache is invisible except in the bill.
 */
export function buildRequest(spec: RequestSpec): MessageCreateParamsStreaming {
  const maxTokens = Math.min(
    spec.maxTokens ?? DEFAULT_MAX_TOKENS,
    spec.model.maxOutputTokens,
  );

  // Breakpoint 1: end of system, which covers tools as well.
  const system: TextBlockParam[] = [
    { type: "text", text: spec.system, cache_control: { type: "ephemeral" } },
  ];

  const params: MessageCreateParamsStreaming = {
    model: spec.model.id as Model,
    max_tokens: maxTokens,
    system,
    // Tools carry no cache_control of their own: the system breakpoint already
    // caches everything before it, and spending a second breakpoint on a nearly
    // identical prefix would waste one of four.
    tools: spec.tools.map(toApiTool),
    messages: withRollingBreakpoints(spec.messages),
    stream: true,
  };

  if (spec.model.supportsThinking) {
    // `adaptive` rather than a `budget_tokens` figure: on Opus 5 and Sonnet 5 the
    // budget form is rejected outright with a 400, and letting the model size its
    // own reasoning is better than any constant we could pick anyway.
    params.thinking = {
      type: "adaptive",
      display: spec.settings.showThinking ? "summarized" : "omitted",
    };
  }

  // `effort` is where the cost/quality dial actually lives. `xhigh` is the right
  // default for coding; the setting exists so a user watching their own bill can
  // trade it down without switching models.
  params.output_config = { effort: spec.settings.effort };

  return params;
}

function toApiTool(def: ToolDefinition): Tool {
  return {
    name: def.name,
    description: def.description,
    input_schema: def.input_schema as Tool["input_schema"],
  };
}

/**
 * Place the rolling cache breakpoints.
 *
 * Existing `cache_control` marks are stripped first, so breakpoints cannot
 * accumulate past the API's limit of four across a long turn. The chosen positions
 * are message boundaries that will never be rewritten — an assistant turn and its
 * tool results are append-only — which is what makes them safe to cache against.
 *
 * Nothing the caller owns is mutated. `messages` is the session's live history and
 * also what gets persisted to the event log; a `cache_control` field is a detail of
 * this transport and has no business ending up in either.
 */
function withRollingBreakpoints(messages: readonly MessageParam[]): MessageParam[] {
  const copy = messages.map(stripCacheControl);

  // Walk backwards, marking the last N messages that can carry a breakpoint. One
  // step back per breakpoint lands them roughly a request apart, which is the
  // spacing that keeps the previous entry alive inside its TTL.
  let marked = 0;
  for (let i = copy.length - 1; i >= 0 && marked < ROLLING_BREAKPOINTS; i--) {
    const message = copy[i] as MessageParam;
    const withMark = markLastBlock(message);
    if (!withMark) continue;
    copy[i] = withMark;
    marked++;
  }
  return copy;
}

function stripCacheControl(message: MessageParam): MessageParam {
  if (typeof message.content === "string") return message;
  return {
    ...message,
    content: message.content.map((block) => {
      if (!("cache_control" in block) || block.cache_control == null) return block;
      const { cache_control: _dropped, ...rest } = block;
      return rest as typeof block;
    }),
  };
}

/**
 * Copy a message with a breakpoint on its final block, or return null if it cannot
 * carry one — in which case the caller tries the next message back.
 */
function markLastBlock(message: MessageParam): MessageParam | null {
  // A string-content message cannot carry cache_control without being rewritten
  // into a block array, and rewriting it would change the bytes we are trying to
  // keep stable. Skip it and use the next candidate instead.
  if (typeof message.content === "string") return null;
  const last = message.content.at(-1);
  if (!last) return null;
  // Thinking blocks must be passed back byte-identical; adding a field to one is a
  // 400. Text, tool_use, tool_result, image, and document blocks all accept it.
  if (last.type === "thinking" || last.type === "redacted_thinking") return null;

  const content = [...message.content];
  content[content.length - 1] = { ...last, cache_control: { type: "ephemeral" } };
  return { ...message, content };
}

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

function mapStopReason(reason: string | null): StopReason {
  switch (reason) {
    case "end_turn":
    case "max_tokens":
    case "stop_sequence":
    case "tool_use":
    case "pause_turn":
    case "refusal":
      return reason;
    case "model_context_window_exceeded":
      return "context_exceeded";
    default:
      // `null` means the stream ended without a stop reason, which in practice means
      // it was cut off. Reporting `end_turn` there would tell the user the agent
      // finished when it did not.
      return reason === null ? "cancelled" : "error";
  }
}

/**
 * Normalize the SDK's usage record.
 *
 * The cache fields are nullable on the wire and their absence means zero, not
 * unknown — but `undefined` propagating into the cost rollup would render the
 * user's spend as `NaN`, so they are coerced here rather than at three call sites.
 */
export function mapUsage(usage: Usage | undefined): TokenUsage {
  if (!usage) return emptyUsage();
  return {
    inputTokens: usage.input_tokens ?? 0,
    outputTokens: usage.output_tokens ?? 0,
    cacheCreationInputTokens: usage.cache_creation_input_tokens ?? 0,
    cacheReadInputTokens: usage.cache_read_input_tokens ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Error classification
// ---------------------------------------------------------------------------

interface Classified {
  error: RpcError;
  retryable: boolean;
}

/**
 * Turn an SDK failure into an `RpcError` a user can act on.
 *
 * The messages here get read by someone whose turn just died, so each one names
 * the thing they should do next. Retryability is decided by class, not by string
 * matching: a 400 will fail identically forever and retrying it just burns time.
 */
export function classify(cause: unknown): Classified {
  if (cause instanceof APIUserAbortError) {
    return { error: new RpcError(ErrorCode.TurnCancelled, "Interrupted."), retryable: false };
  }

  if (cause instanceof AuthenticationError) {
    return {
      error: new RpcError(
        ErrorCode.ProviderAuthFailed,
        "The Anthropic API key was rejected. Check it in Settings — a key that used to work can be revoked or rotated.",
      ),
      retryable: false,
    };
  }

  if (cause instanceof PermissionDeniedError) {
    return {
      error: new RpcError(
        ErrorCode.ProviderAuthFailed,
        "The API key is valid but not permitted to make this request. This usually means the workspace is out of credit or the model is not enabled for it.",
      ),
      retryable: false,
    };
  }

  if (cause instanceof RateLimitError) {
    return {
      error: new RpcError(
        ErrorCode.ProviderRateLimited,
        "Rate limited by the Anthropic API. Trace will back off and retry.",
      ),
      retryable: true,
    };
  }

  if (cause instanceof NotFoundError) {
    return {
      error: new RpcError(
        ErrorCode.ProviderError,
        "The model was not found. It may have been retired, or your key may not have access to it — pick another in the model selector.",
      ),
      retryable: false,
    };
  }

  if (cause instanceof BadRequestError) {
    const detail = apiDetail(cause);
    // Context overflow arrives as a 400 rather than a stop reason when the *request*
    // is already too large to process. It needs its own remedy, not "try again".
    if (/prompt is too long|exceed.*context|too many tokens/i.test(detail)) {
      return {
        error: new RpcError(
          ErrorCode.ContextExceeded,
          "This conversation no longer fits in the model's context window. Compact it or start a new session from a checkpoint.",
        ),
        retryable: false,
      };
    }
    return {
      error: new RpcError(
        ErrorCode.ProviderError,
        `The Anthropic API rejected the request: ${detail}`,
      ),
      retryable: false,
    };
  }

  if (cause instanceof InternalServerError) {
    // 529 `overloaded_error` lands here too — `InternalServerError` covers every
    // status at or above 500 — and it is the one server-side failure that reliably
    // clears on its own.
    return {
      error: new RpcError(
        ErrorCode.ProviderError,
        "The Anthropic API is overloaded or erroring. Retrying.",
      ),
      retryable: true,
    };
  }

  if (cause instanceof APIConnectionTimeoutError || cause instanceof APIConnectionError) {
    return {
      error: new RpcError(
        ErrorCode.ProviderError,
        "Could not reach the Anthropic API. Check your network connection or proxy settings.",
      ),
      retryable: true,
    };
  }

  // Not an `APIError`: the SDK's own "retry this" signal, raised from middleware.
  // We set `maxRetries: 0`, so honouring it is our job.
  if (cause instanceof RetryableError) {
    return {
      error: new RpcError(ErrorCode.ProviderError, messageOf(cause)),
      retryable: true,
    };
  }

  if (cause instanceof RpcError) return { error: cause, retryable: false };

  if (isAbort(cause)) {
    return { error: new RpcError(ErrorCode.TurnCancelled, "Interrupted."), retryable: false };
  }

  return {
    error: new RpcError(ErrorCode.ProviderError, messageOf(cause)),
    retryable: false,
  };
}

function isAbort(cause: unknown): boolean {
  return (
    cause instanceof Error && (cause.name === "AbortError" || cause.name === "APIUserAbortError")
  );
}

function messageOf(cause: unknown): string {
  if (cause instanceof Error) return cause.message;
  return String(cause);
}

/**
 * The API's own explanation of a rejection.
 *
 * `APIError.message` is built by JSON-stringifying the whole response body, so it
 * reads `400 {"type":"error","error":{...}}` — which is the sort of thing this file
 * exists to avoid putting in front of a user. The body's `error.message` is the
 * sentence a person can act on, so prefer it and fall back only if it is absent.
 */
function apiDetail(cause: { error?: unknown; message: string }): string {
  const body = cause.error;
  if (body && typeof body === "object" && "error" in body) {
    const inner = (body as { error?: unknown }).error;
    if (inner && typeof inner === "object" && "message" in inner) {
      const text = (inner as { message?: unknown }).message;
      if (typeof text === "string" && text !== "") return text;
    }
  }
  return cause.message;
}

/**
 * Exponential backoff, deferring to the server's own `retry-after` when it sends one.
 * Jitter matters here: without it, several concurrent agents rate-limited by the same
 * account retry in lockstep and stay rate-limited.
 */
function backoffMs(attempt: number, cause: unknown): number {
  const retryAfter = retryAfterMs(cause);
  if (retryAfter !== null) return retryAfter;
  const exponential = BASE_BACKOFF_MS * 2 ** (attempt - 1);
  return Math.round(exponential * (0.75 + Math.random() * 0.5));
}

function retryAfterMs(cause: unknown): number | null {
  const headers = (cause as { headers?: Headers }).headers;
  const raw = headers?.get?.("retry-after");
  if (!raw) return null;
  const seconds = Number(raw);
  // Cap it: an hour-long `retry-after` is not something to sit and wait through.
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return Math.min(seconds * 1000, 60_000);
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      reject(signal.reason ?? new Error("Aborted"));
    }
    signal.addEventListener("abort", onAbort, { once: true });
  });
}
