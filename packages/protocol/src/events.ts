/**
 * Session events — the engine's outbound stream to every surface.
 *
 * Emitted as `session/event` notifications. This union is the single thing a new
 * surface has to learn to render a live agent transcript, so it is written to be
 * *replayable*: applying the events for a turn in order, from empty state, must
 * reproduce exactly what the user saw live. That property is what lets us
 * persist a session as an event log, resume it after a crash, hand it off between
 * desktop and CLI, and write UI tests without touching the network.
 *
 * Copyright (c) 2026 Origin AI
 */

import type { PermissionRequest, TodoItem, ToolName } from "./tools.js";

/**
 * What the maximized panel can hold.
 *
 * Six of these mirror Cursor 3.4's set, which we match deliberately — it is a
 * well-chosen decomposition of "what a coding agent produces that a human needs to look
 * at" — and the engine names a target when it has something worth surfacing (a diff to
 * review, a preview URL to open).
 *
 * `review` is the seventh and ours. `diff` compares the work tree with the user's git;
 * `review` compares it with the last thing the user approved in *this session*, which is
 * a different question with a different answer and its own Keep/Undo verbs. Folding the
 * two into one tab would mean one surface whose meaning changed depending on which
 * button you pressed.
 *
 * The chat is the frame; this panel is the viewport. The editor is one option in
 * it, not the centre of the product.
 */
export type WorkPanelTarget =
  "files" | "review" | "diff" | "canvas" | "pr" | "browser" | "terminal";

export type StopReason =
  | "end_turn"
  | "max_tokens"
  | "tool_use"
  | "stop_sequence"
  | "pause_turn"
  | "refusal"
  /**
   * The conversation outgrew the model's context window.
   *
   * Distinct from `error` on purpose: it is not a failure the user can retry out
   * of, it is a state with exactly one remedy — compact or branch the session — and
   * the UI should offer that rather than a "try again" button.
   */
  | "context_exceeded"
  /** Trace-specific: `session/interrupt`, client disconnect, or a deny_and_abort. */
  | "cancelled"
  /** Trace-specific: the turn hit `maxIterations` without the model ending its turn. */
  | "iteration_limit"
  /** Trace-specific: provider or engine failure. Pair with an `error` event. */
  | "error";

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  /** Written to cache this request — billed at ~1.25x. */
  cacheCreationInputTokens: number;
  /** Served from cache — billed at ~0.1x. The number to watch. */
  cacheReadInputTokens: number;
}

/** Rolled up across every request in a turn, so the UI can show real spend. */
export interface TurnCost {
  usage: TokenUsage;
  /** Requests issued to the provider this turn (one per agent-loop iteration). */
  requests: number;
  /** USD, computed engine-side from the model's published rates. */
  estimatedUsd: number;
}

export interface FileChangeSummary {
  path: string;
  changeType: "created" | "modified" | "deleted";
  linesAdded: number;
  linesRemoved: number;
}

/**
 * A discriminated union keyed on `type`. Every variant carries `sessionId` and,
 * where it belongs to a turn, `turnId` — so a surface can multiplex many
 * concurrent agents (Cursor runs up to 8) through one connection without
 * threading extra routing state.
 */
export type SessionEvent =
  // --- Turn lifecycle
  | {
      type: "turn_started";
      sessionId: string;
      turnId: string;
      /** Wall-clock ms since epoch. Set by the engine so replay is deterministic. */
      startedAt: number;
      model: string;
    }
  | {
      type: "turn_completed";
      sessionId: string;
      turnId: string;
      completedAt: number;
      stopReason: StopReason;
      cost: TurnCost;
      /** Every file the turn touched, for the review surface. */
      changes: FileChangeSummary[];
    }
  /** One agent-loop iteration began — i.e. one request to the provider. */
  | {
      type: "iteration_started";
      sessionId: string;
      turnId: string;
      iteration: number;
    }

  // --- Model output
  | {
      type: "text_delta";
      sessionId: string;
      turnId: string;
      /** Index of the content block, so out-of-order deltas can still be assembled. */
      blockIndex: number;
      text: string;
    }
  | {
      type: "thinking_delta";
      sessionId: string;
      turnId: string;
      blockIndex: number;
      text: string;
    }

  // --- Tool calls
  | {
      type: "tool_call_started";
      sessionId: string;
      turnId: string;
      callId: string;
      tool: ToolName;
      blockIndex: number;
    }
  /**
   * Partial JSON for a tool's arguments, straight from `input_json_delta`.
   * Lets the UI show "editing src/app.ts…" before the model finishes emitting
   * the call — the difference between a UI that feels live and one that stalls.
   */
  | {
      type: "tool_call_input_delta";
      sessionId: string;
      turnId: string;
      callId: string;
      partialJson: string;
    }
  | {
      type: "tool_call_ready";
      sessionId: string;
      turnId: string;
      callId: string;
      tool: ToolName;
      input: unknown;
      /** Human-readable one-liner for the transcript. */
      summary: string;
    }
  /**
   * Live output from a running tool — in practice, `run_terminal_cmd`.
   *
   * Streamed rather than batched because a two-minute test run that shows nothing
   * until it exits is indistinguishable from a hang. The *model* still receives
   * only the final truncated result; this exists for the human watching, and is
   * the reason a long build feels like progress instead of a frozen UI.
   */
  | {
      type: "tool_call_output_delta";
      sessionId: string;
      turnId: string;
      callId: string;
      stream: "stdout" | "stderr";
      chunk: string;
    }
  | {
      type: "tool_call_completed";
      sessionId: string;
      turnId: string;
      callId: string;
      ok: boolean;
      durationMs: number;
      /** Truncated for display; the full result went to the model, not here. */
      resultPreview: string;
      /** Present when this call changed files, for inline diff rendering. */
      changes?: FileChangeSummary[];
    }

  // --- Human in the loop
  | {
      type: "permission_requested";
      sessionId: string;
      turnId: string;
      request: PermissionRequest;
    }
  | {
      type: "permission_resolved";
      sessionId: string;
      turnId: string;
      callId: string;
      allowed: boolean;
      /** True when resolved by a stored rule rather than a live human. */
      automatic: boolean;
    }

  // --- Plan mode
  | {
      type: "todos_updated";
      sessionId: string;
      turnId: string;
      todos: TodoItem[];
    }

  // --- Checkpoints (shadow-git; every mutating turn is revertible)
  | {
      type: "checkpoint_created";
      sessionId: string;
      turnId: string;
      checkpointId: string;
      label: string;
    }

  // --- Panel choreography: the engine asking a surface to show something
  | {
      type: "work_panel_requested";
      sessionId: string;
      turnId?: string;
      target: WorkPanelTarget;
      /** File path, PR URL, preview URL, or terminal id, depending on `target`. */
      ref?: string;
    }

  // --- Session metadata
  | {
      type: "title_updated";
      sessionId: string;
      title: string;
    }
  | {
      type: "usage_updated";
      sessionId: string;
      turnId: string;
      cost: TurnCost;
    }

  // --- Failures. Non-fatal by default; `fatal` means the turn is over.
  | {
      type: "error";
      sessionId: string;
      turnId?: string;
      code: number;
      message: string;
      fatal: boolean;
      /** Set when the engine will retry on its own (e.g. provider rate limit). */
      retryInMs?: number;
    };

export type SessionEventType = SessionEvent["type"];

/** Extract one variant by its `type`, e.g. `EventOf<"text_delta">`. */
export type EventOf<T extends SessionEventType> = Extract<SessionEvent, { type: T }>;
