/**
 * The event reducer — the only thing that mutates a `SessionView`.
 *
 * Pure, in the strict sense: no clocks, no randomness, no I/O. Every timestamp comes
 * from the engine and every item id is derived from event data. That is not
 * fastidiousness — it is what makes the transcript testable. The alternative is
 * asserting on a live agent turn, which costs money, takes fifteen seconds, and
 * fails for reasons unrelated to the code under test.
 *
 * The other property worth stating plainly: **every write is an upsert keyed on a
 * derived id.** Applying the same event twice is a no-op rather than a duplicate
 * row. This buys three things at once — the optimistic user message converges with
 * whatever the engine later persists, a reconnect that replays a few events it
 * already sent does not corrupt the view, and out-of-order deltas assemble correctly
 * because `blockIndex` is part of the key rather than a position in an array.
 *
 * Copyright (c) 2026 Origin AI
 */

import type {
  Attachment,
  SessionEvent,
  SessionSummary,
  TranscriptEntry,
  TurnCost,
} from "@trace/protocol";

import type { AppState, ItemOf, SessionView, TranscriptItem, TranscriptItemKind } from "./types.js";
import { DEFAULT_WORK_PANEL, TOOL_OUTPUT_CAP_CHARS } from "./types.js";

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

/**
 * How every item id is built.
 *
 * Exported because the tests, the scroll-anchoring code, and the "revert to here"
 * affordance all need to name an item they did not create. A string template
 * duplicated across four files is a bug waiting for someone to change one of them.
 *
 * `iteration` is part of the text and thinking keys because `blockIndex` restarts at
 * zero on every agent-loop iteration — one turn that calls three tools produces four
 * provider requests, each with its own block 0. Keying on `blockIndex` alone would
 * concatenate four unrelated paragraphs into one.
 */
export const itemIdFor = {
  userMessage: (turnId: string): string => `${turnId}:user`,
  text: (turnId: string, iteration: number, blockIndex: number): string =>
    `${turnId}:${iteration}:text:${blockIndex}`,
  thinking: (turnId: string, iteration: number, blockIndex: number): string =>
    `${turnId}:${iteration}:think:${blockIndex}`,
  /** `callId` is the model's own `tool_use.id` — unique within a session. */
  toolCall: (turnId: string, callId: string): string => `${turnId}:tool:${callId}`,
  todos: (turnId: string): string => `${turnId}:todos`,
  checkpoint: (turnId: string, checkpointId: string): string => `${turnId}:ckpt:${checkpointId}`,
  turnSummary: (turnId: string): string => `${turnId}:summary`,
  /** Errors have no natural key; `seq` comes from the view's own counter. */
  error: (turnId: string | undefined, seq: number): string => `${turnId ?? "session"}:error:${seq}`,
  /** Hydrated entries are positional — the persisted log has no block indices. */
  historical: (turnId: string, ordinal: number): string => `${turnId}:hist:${ordinal}`,
} as const;

// ---------------------------------------------------------------------------
// Small pure helpers
// ---------------------------------------------------------------------------

function zeroCost(): TurnCost {
  return {
    usage: {
      inputTokens: 0,
      outputTokens: 0,
      cacheCreationInputTokens: 0,
      cacheReadInputTokens: 0,
    },
    requests: 0,
    estimatedUsd: 0,
  };
}

function addCost(a: TurnCost, b: TurnCost): TurnCost {
  return {
    usage: {
      inputTokens: a.usage.inputTokens + b.usage.inputTokens,
      outputTokens: a.usage.outputTokens + b.usage.outputTokens,
      cacheCreationInputTokens:
        a.usage.cacheCreationInputTokens + b.usage.cacheCreationInputTokens,
      cacheReadInputTokens: a.usage.cacheReadInputTokens + b.usage.cacheReadInputTokens,
    },
    requests: a.requests + b.requests,
    estimatedUsd: a.estimatedUsd + b.estimatedUsd,
  };
}

/**
 * Keep the **tail** of a tool's output, up to the cap.
 *
 * The tail, not the head, because a failing build prints its reason last. Truncating
 * from the front is what a terminal does when you scroll, and it is the behaviour
 * that makes a 200 MB `pnpm install` log harmless to stream into React state.
 */
function appendCapped(existing: string, chunk: string): { text: string; truncated: boolean } {
  const combined = existing + chunk;
  if (combined.length <= TOOL_OUTPUT_CAP_CHARS) return { text: combined, truncated: false };
  return { text: combined.slice(combined.length - TOOL_OUTPUT_CAP_CHARS), truncated: true };
}

function appendItem(view: SessionView, item: TranscriptItem): SessionView {
  const items = [...view.items, item];
  return { ...view, items, index: { ...view.index, [item.id]: items.length - 1 } };
}

/** Index is unchanged by a replace, so the same record reference is reused. */
function replaceItem(view: SessionView, at: number, item: TranscriptItem): SessionView {
  const items = view.items.slice();
  items[at] = item;
  return { ...view, items };
}

function locate<K extends TranscriptItemKind>(
  view: SessionView,
  id: string,
  kind: K,
): { at: number; item: ItemOf<K> } | null {
  const at = view.index[id];
  if (at === undefined) return null;
  const item = view.items[at];
  // A kind mismatch means the index is stale, which is a reducer bug rather than a
  // data condition. Treating it as "not found" degrades to a duplicate row instead
  // of a crash mid-turn, which is the failure the user can at least work around.
  if (item === undefined || item.kind !== kind) return null;
  return { at, item: item as ItemOf<K> };
}

/**
 * Create-or-update in one step.
 *
 * `make` runs when the id is absent, `update` when it is present. Both must return
 * an item whose `id` is the one passed in — swapping ids here would desynchronise
 * `index` from `items` silently.
 */
function upsert<K extends TranscriptItemKind>(
  view: SessionView,
  id: string,
  kind: K,
  make: () => ItemOf<K>,
  update: (item: ItemOf<K>) => ItemOf<K>,
): SessionView {
  const found = locate(view, id, kind);
  return found === null
    ? appendItem(view, make())
    : replaceItem(view, found.at, update(found.item));
}

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

export function emptySessionView(summary: SessionSummary): SessionView {
  return {
    summary,
    items: [],
    live: null,
    hydration: "unloaded",
    index: {},
    seq: 0,
  };
}

export function initialAppState(): AppState {
  return {
    engine: { phase: "starting" },
    auth: { status: "signed_out" },
    workspaces: [],
    activeWorkspaceId: null,
    sessions: [],
    views: {},
    activeSessionId: null,
    settings: null,
    models: [],
    providerKeys: [],
    workPanel: DEFAULT_WORK_PANEL,
    indexing: {},
    notices: [],
  };
}

/**
 * Put the user's own message on screen.
 *
 * Called by the store the moment `session/prompt` resolves with a `turnId` — one IPC
 * round trip after the keypress, which is imperceptible, and far simpler than
 * inventing a provisional id and reconciling it later.
 *
 * Not an event handler because the engine deliberately does not echo the prompt
 * back: a surface that just sent it already has it, and re-broadcasting a base64
 * image attachment to every connected client to tell it something it knows would be
 * the largest message in the protocol. The persisted transcript does record it, so
 * `hydrateFromHistory` covers reload.
 */
export function appendUserMessage(
  view: SessionView,
  message: { turnId: string; at: number; text: string; attachments?: Attachment[] },
): SessionView {
  const id = itemIdFor.userMessage(message.turnId);
  return upsert(
    view,
    id,
    "user_message",
    () => ({
      kind: "user_message",
      id,
      turnId: message.turnId,
      at: message.at,
      text: message.text,
      attachments: message.attachments ?? [],
    }),
    (item) => ({ ...item, text: message.text, attachments: message.attachments ?? [] }),
  );
}

// ---------------------------------------------------------------------------
// The reducer
// ---------------------------------------------------------------------------

/**
 * Apply one engine event.
 *
 * Returns `view` unchanged — the same reference, so React bails out of rendering —
 * when the event is for another session or carries nothing this view tracks.
 * `work_panel_requested` and `index/progress` are deliberately in that category:
 * they are app-level, not transcript-level, and the store handles them.
 */
export function applyEvent(view: SessionView, event: SessionEvent): SessionView {
  // One connection multiplexes every session, so this is a routing check, not a
  // paranoia check — Cursor runs up to eight agents at once and so will we.
  if (event.sessionId !== view.summary.id) return view;

  switch (event.type) {
    case "turn_started":
      return {
        ...view,
        summary: { ...view.summary, isActive: true, model: event.model },
        live: {
          turnId: event.turnId,
          startedAt: event.startedAt,
          model: event.model,
          iteration: 0,
          pendingPermission: null,
          cost: zeroCost(),
          activeCallId: null,
          interruptRequested: false,
        },
      };

    case "iteration_started":
      if (view.live === null || view.live.turnId !== event.turnId) return view;
      return { ...view, live: { ...view.live, iteration: event.iteration } };

    case "text_delta": {
      const iteration = view.live?.iteration ?? 0;
      const id = itemIdFor.text(event.turnId, iteration, event.blockIndex);
      return upsert(
        view,
        id,
        "assistant_text",
        () => ({
          kind: "assistant_text",
          id,
          turnId: event.turnId,
          at: view.live?.startedAt ?? 0,
          text: event.text,
          streaming: true,
        }),
        (item) => ({ ...item, text: item.text + event.text, streaming: true }),
      );
    }

    case "thinking_delta": {
      const iteration = view.live?.iteration ?? 0;
      const id = itemIdFor.thinking(event.turnId, iteration, event.blockIndex);
      return upsert(
        view,
        id,
        "thinking",
        () => ({
          kind: "thinking",
          id,
          turnId: event.turnId,
          at: view.live?.startedAt ?? 0,
          text: event.text,
          streaming: true,
        }),
        (item) => ({ ...item, text: item.text + event.text, streaming: true }),
      );
    }

    case "tool_call_started": {
      const id = itemIdFor.toolCall(event.turnId, event.callId);
      return upsert(
        view,
        id,
        "tool_call",
        () => ({
          kind: "tool_call",
          id,
          turnId: event.turnId,
          at: view.live?.startedAt ?? 0,
          callId: event.callId,
          partialInput: "",
          summary: "",
          status: "streaming_input",
          output: "",
          outputTruncated: false,
          tool: event.tool,
        }),
        (item) => item,
      );
    }

    case "tool_call_input_delta": {
      const id = itemIdFor.toolCall(event.turnId, event.callId);
      const found = locate(view, id, "tool_call");
      if (found === null) return view;
      return replaceItem(view, found.at, {
        ...found.item,
        partialInput: found.item.partialInput + event.partialJson,
      });
    }

    case "tool_call_ready": {
      const id = itemIdFor.toolCall(event.turnId, event.callId);
      const next = upsert(
        view,
        id,
        "tool_call",
        () => ({
          kind: "tool_call",
          id,
          turnId: event.turnId,
          at: view.live?.startedAt ?? 0,
          callId: event.callId,
          tool: event.tool,
          input: event.input,
          partialInput: "",
          summary: event.summary,
          status: "running",
          output: "",
          outputTruncated: false,
        }),
        (item) => ({
          ...item,
          tool: event.tool,
          input: event.input,
          summary: event.summary,
          // A permission prompt can land before `ready` is processed; do not
          // overwrite a state the user is currently looking at.
          status: item.status === "awaiting_permission" ? item.status : "running",
        }),
      );
      if (next.live === null || next.live.turnId !== event.turnId) return next;
      return { ...next, live: { ...next.live, activeCallId: event.callId } };
    }

    case "tool_call_output_delta": {
      const id = itemIdFor.toolCall(event.turnId, event.callId);
      const found = locate(view, id, "tool_call");
      if (found === null) return view;
      const appended = appendCapped(found.item.output, event.chunk);
      return replaceItem(view, found.at, {
        ...found.item,
        output: appended.text,
        outputTruncated: found.item.outputTruncated || appended.truncated,
      });
    }

    case "tool_call_completed": {
      const id = itemIdFor.toolCall(event.turnId, event.callId);
      const found = locate(view, id, "tool_call");
      if (found === null) return view;
      const next = replaceItem(view, found.at, {
        ...found.item,
        // "denied" outranks "error": both mean the tool did not run, but only one
        // tells the user why, and the why was their own decision.
        status: found.item.status === "denied" ? "denied" : event.ok ? "ok" : "error",
        durationMs: event.durationMs,
        resultPreview: event.resultPreview,
        ...(event.changes === undefined ? {} : { changes: event.changes }),
      });
      if (next.live === null || next.live.activeCallId !== event.callId) return next;
      return { ...next, live: { ...next.live, activeCallId: null } };
    }

    case "permission_requested": {
      const id = itemIdFor.toolCall(event.turnId, event.request.callId);
      const next = upsert(
        view,
        id,
        "tool_call",
        () => ({
          kind: "tool_call",
          id,
          turnId: event.turnId,
          at: view.live?.startedAt ?? 0,
          callId: event.request.callId,
          tool: event.request.tool,
          input: event.request.input,
          partialInput: "",
          summary: event.request.summary,
          status: "awaiting_permission",
          output: "",
          outputTruncated: false,
          permission: event.request,
        }),
        (item) => ({ ...item, status: "awaiting_permission", permission: event.request }),
      );
      if (next.live === null || next.live.turnId !== event.turnId) return next;
      return { ...next, live: { ...next.live, pendingPermission: event.request } };
    }

    case "permission_resolved": {
      const id = itemIdFor.toolCall(event.turnId, event.callId);
      const found = locate(view, id, "tool_call");
      let next = view;
      if (found !== null) {
        const { permission: _dropped, ...rest } = found.item;
        next = replaceItem(next, found.at, {
          ...rest,
          status: event.allowed ? "running" : "denied",
        });
      }
      if (next.live === null || next.live.pendingPermission?.callId !== event.callId) return next;
      return { ...next, live: { ...next.live, pendingPermission: null } };
    }

    case "todos_updated": {
      const id = itemIdFor.todos(event.turnId);
      return upsert(
        view,
        id,
        "todos",
        () => ({
          kind: "todos",
          id,
          turnId: event.turnId,
          at: view.live?.startedAt ?? 0,
          todos: event.todos,
        }),
        (item) => ({ ...item, todos: event.todos }),
      );
    }

    case "checkpoint_created": {
      const id = itemIdFor.checkpoint(event.turnId, event.checkpointId);
      return upsert(
        view,
        id,
        "checkpoint",
        () => ({
          kind: "checkpoint",
          id,
          turnId: event.turnId,
          at: view.live?.startedAt ?? 0,
          checkpointId: event.checkpointId,
          label: event.label,
        }),
        (item) => ({ ...item, label: event.label }),
      );
    }

    case "title_updated":
      if (view.summary.title === event.title) return view;
      return { ...view, summary: { ...view.summary, title: event.title } };

    case "usage_updated": {
      if (view.live === null || view.live.turnId !== event.turnId) return view;
      return { ...view, live: { ...view.live, cost: event.cost } };
    }

    case "turn_completed": {
      const id = itemIdFor.turnSummary(event.turnId);
      const startedAt = view.live?.turnId === event.turnId ? view.live.startedAt : event.completedAt;

      // Close every open block in one pass. A stream that ends without its final
      // delta would otherwise leave a caret blinking forever under the last
      // paragraph, which reads as "still thinking" long after the turn is over.
      let items = view.items;
      let mutated = false;
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        if (item === undefined) continue;
        const isOpen =
          (item.kind === "assistant_text" || item.kind === "thinking") &&
          item.turnId === event.turnId &&
          item.streaming;
        if (!isOpen) continue;
        if (!mutated) {
          items = items.slice();
          mutated = true;
        }
        items[i] = { ...(item as ItemOf<"assistant_text"> | ItemOf<"thinking">), streaming: false };
      }

      const closed: SessionView = mutated ? { ...view, items } : view;
      const summarised = upsert(
        closed,
        id,
        "turn_summary",
        () => ({
          kind: "turn_summary",
          id,
          turnId: event.turnId,
          at: event.completedAt,
          stopReason: event.stopReason,
          cost: event.cost,
          changes: event.changes,
          durationMs: Math.max(0, event.completedAt - startedAt),
        }),
        (item) => ({
          ...item,
          stopReason: event.stopReason,
          cost: event.cost,
          changes: event.changes,
        }),
      );

      return {
        ...summarised,
        live: null,
        summary: {
          ...summarised.summary,
          isActive: false,
          updatedAt: event.completedAt,
          turnCount: summarised.summary.turnCount + 1,
          cumulativeCost: addCost(summarised.summary.cumulativeCost, event.cost),
        },
      };
    }

    case "error": {
      const id = itemIdFor.error(event.turnId, view.seq);
      const withItem = appendItem(view, {
        kind: "error",
        id,
        at: view.live?.startedAt ?? 0,
        code: event.code,
        message: event.message,
        fatal: event.fatal,
        ...(event.turnId === undefined ? {} : { turnId: event.turnId }),
        ...(event.retryInMs === undefined ? {} : { retryInMs: event.retryInMs }),
      });
      const bumped: SessionView = { ...withItem, seq: withItem.seq + 1 };
      // A fatal error ends the turn without a `turn_completed`, so the spinner has
      // to be cleared here or it spins until the next prompt.
      if (!event.fatal || bumped.live === null) return bumped;
      return {
        ...bumped,
        live: null,
        summary: { ...bumped.summary, isActive: false },
      };
    }

    // App-level, not transcript-level. The store routes these; see `applyEvent`'s doc.
    case "work_panel_requested":
      return view;

    default: {
      // Exhaustiveness: adding a variant to `SessionEvent` without handling it here
      // is a compile error, not a silently ignored event.
      const unhandled: never = event;
      void unhandled;
      return view;
    }
  }
}

// ---------------------------------------------------------------------------
// Hydration
// ---------------------------------------------------------------------------

/**
 * Rebuild a view from the persisted transcript.
 *
 * Two things the live path has that this does not, both accepted deliberately:
 *
 * - **No `turn_summary` rows.** `TranscriptEntry` carries no per-turn cost, so
 *   reloading a session shows the exchanges without their cost footers. The
 *   cumulative figure on `SessionSummary` is still exact, which is the number people
 *   actually look at. Adding per-turn cost to the persisted log is the fix, and it is
 *   a protocol change worth making before launch rather than during this build.
 * - **No live turn.** If `summary.isActive` is true — the app was killed mid-turn, or
 *   another window is driving it — `live` stays null until the next event arrives, so
 *   the spinner appears a beat late. Reconstructing it would mean guessing at state
 *   the engine has and we do not.
 */
export function hydrateFromHistory(
  summary: SessionSummary,
  entries: readonly TranscriptEntry[],
): SessionView {
  let view: SessionView = { ...emptySessionView(summary), hydration: "ready" };
  let ordinal = 0;

  for (const entry of entries) {
    ordinal += 1;
    switch (entry.kind) {
      case "user_message":
        view = appendItem(view, {
          kind: "user_message",
          id: itemIdFor.userMessage(entry.turnId),
          turnId: entry.turnId,
          at: entry.at,
          text: entry.text,
          attachments: entry.attachments,
        });
        break;

      case "assistant_text":
        view = appendItem(view, {
          kind: "assistant_text",
          id: itemIdFor.historical(entry.turnId, ordinal),
          turnId: entry.turnId,
          at: entry.at,
          text: entry.text,
          streaming: false,
        });
        break;

      case "assistant_thinking":
        view = appendItem(view, {
          kind: "thinking",
          id: itemIdFor.historical(entry.turnId, ordinal),
          turnId: entry.turnId,
          at: entry.at,
          text: entry.text,
          streaming: false,
        });
        break;

      case "tool_call":
        view = appendItem(view, {
          kind: "tool_call",
          id: itemIdFor.toolCall(entry.turnId, entry.callId),
          turnId: entry.turnId,
          at: entry.at,
          callId: entry.callId,
          tool: entry.tool,
          input: entry.input,
          partialInput: "",
          summary: entry.summary,
          status: entry.ok ? "ok" : "error",
          output: "",
          outputTruncated: false,
          durationMs: entry.durationMs,
          resultPreview: entry.resultPreview,
        });
        break;

      case "todos":
        view = appendItem(view, {
          kind: "todos",
          id: itemIdFor.todos(entry.turnId),
          turnId: entry.turnId,
          at: entry.at,
          todos: entry.todos,
        });
        break;

      case "checkpoint":
        view = appendItem(view, {
          kind: "checkpoint",
          id: itemIdFor.checkpoint(entry.turnId, entry.checkpointId),
          turnId: entry.turnId,
          at: entry.at,
          checkpointId: entry.checkpointId,
          label: entry.label,
        });
        break;

      case "error":
        view = appendItem(view, {
          kind: "error",
          id: itemIdFor.error(entry.turnId, view.seq),
          at: entry.at,
          code: entry.code,
          message: entry.message,
          fatal: false,
          ...(entry.turnId === undefined ? {} : { turnId: entry.turnId }),
        });
        view = { ...view, seq: view.seq + 1 };
        break;

      default: {
        const unhandled: never = entry;
        void unhandled;
        break;
      }
    }
  }

  return view;
}
