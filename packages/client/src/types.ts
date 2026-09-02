/**
 * The client-side data model: what a surface holds in memory, and the one interface
 * it uses to reach the engine.
 *
 * This package sits between the protocol and every UI. The protocol describes what
 * crosses the wire; this describes what a surface *keeps* — a flat, virtualizable
 * transcript, the ephemeral state of an in-flight turn, and the store that hangs
 * off both. The desktop renderer, the CLI, and eventually a browser tab all consume
 * these same types, which is the only reason a second surface is cheap to build.
 *
 * Two rules hold this file together:
 *
 * 1. **No Node, no DOM.** `tsconfig.json` sets `types: []` deliberately. Anything
 *    here that reaches for `process`, `window`, `Buffer`, or `setTimeout`'s Node
 *    overload is a bug that only shows up on the surface that lacks it.
 *
 * 2. **Deterministic identity.** Every `TranscriptItem.id` is derived from data the
 *    engine sent, never from a clock or a random source. `SessionEvent` promises
 *    replayability; that promise is only worth something if replaying the same
 *    events twice produces byte-identical ids, because those ids are React keys and
 *    scroll anchors. A `Math.random()` in the reducer would make session resume
 *    jump the scroll position for no visible reason.
 *
 * Copyright (c) 2026 Origin AI
 */

import type {
  Attachment,
  EngineSettings,
  ModelInfo,
  NotificationMap,
  NotificationMethod,
  NotificationParamsOf,
  ParamsOf,
  PermissionRequest,
  ProviderKeyStatus,
  RequestMethod,
  ResultOf,
  ReviewFile,
  SessionSummary,
  StopReason,
  TodoItem,
  ToolName,
  TurnCost,
  WorkPanelTarget,
  WorkspaceInfo,
  FileChangeSummary,
} from "@trace/protocol";

/** Returned by every subscribe call. Calling it twice must be harmless. */
export type Unsubscribe = () => void;

// ---------------------------------------------------------------------------
// Transcript
// ---------------------------------------------------------------------------

/**
 * How far along a tool call is. Drives the icon, the spinner, and whether the card
 * is expanded by default.
 *
 * The transitions the reducer implements, in event order:
 *
 *   tool_call_started    → "streaming_input"
 *   tool_call_ready      → "running"
 *   permission_requested → "awaiting_permission"   (overrides "running")
 *   permission_resolved  → "running" | "denied"
 *   tool_call_completed  → "ok" | "error"
 *
 * A call that is auto-approved by a rule never passes through
 * "awaiting_permission" — it goes straight from "running" to a terminal state, and
 * the transcript shows no prompt. That is the intended behaviour of `auto_edit`.
 */
export type ToolCallStatus =
  "streaming_input" | "running" | "awaiting_permission" | "ok" | "error" | "denied";

/**
 * One row in the transcript.
 *
 * Flat rather than nested-by-turn because the list is virtualized: the renderer
 * measures and mounts individual rows, and a tree would force it to reason about
 * partially-visible parents. Turn membership survives as `turnId`, which is what
 * the "revert to here" affordance and the per-turn summary card key off.
 *
 * `at` is milliseconds since epoch. For live items it is the containing turn's
 * `startedAt` — the engine's own timestamp, not the client's clock — because most
 * `SessionEvent` variants carry no time of their own and inventing one per token
 * would break replay determinism. For hydrated items it is the persisted
 * `TranscriptEntry.at`. Either way it is accurate to the turn, not the token, which
 * is the granularity the UI actually displays.
 */
export type TranscriptItem =
  | {
      kind: "user_message";
      id: string;
      turnId: string;
      at: number;
      text: string;
      attachments: Attachment[];
    }
  | {
      kind: "assistant_text";
      id: string;
      turnId: string;
      at: number;
      text: string;
      /** True while deltas are still arriving for this block. Drives the caret. */
      streaming: boolean;
    }
  | {
      kind: "thinking";
      id: string;
      turnId: string;
      at: number;
      text: string;
      streaming: boolean;
    }
  | {
      kind: "tool_call";
      id: string;
      turnId: string;
      at: number;
      callId: string;
      tool: ToolName;
      /**
       * Parsed input, once `tool_call_ready` lands. Before that the model is still
       * emitting partial JSON, so only `partialInput` is populated.
       */
      input?: unknown;
      /** Raw `input_json_delta` accumulation. Unparseable by design while streaming. */
      partialInput: string;
      /** Engine-authored one-liner. Empty until `tool_call_ready`. */
      summary: string;
      status: ToolCallStatus;
      /** Live stdout/stderr, capped. See `TOOL_OUTPUT_CAP_CHARS`. */
      output: string;
      outputTruncated: boolean;
      /** Set on completion. */
      durationMs?: number;
      resultPreview?: string;
      changes?: FileChangeSummary[];
      /** Populated while `status === "awaiting_permission"`, for the inline prompt. */
      permission?: PermissionRequest;
      /** Why it was denied, when the user gave a reason. */
      denialReason?: string;
    }
  /** Replaced in place on every `todos_updated` — one card per turn, not a log. */
  | { kind: "todos"; id: string; turnId: string; at: number; todos: TodoItem[] }
  | {
      kind: "checkpoint";
      id: string;
      turnId: string;
      at: number;
      checkpointId: string;
      label: string;
    }
  /** Emitted on `turn_completed`. The cost/diff footer under each exchange. */
  | {
      kind: "turn_summary";
      id: string;
      turnId: string;
      at: number;
      stopReason: StopReason;
      cost: TurnCost;
      changes: FileChangeSummary[];
      durationMs: number;
    }
  | {
      kind: "error";
      id: string;
      turnId?: string;
      at: number;
      code: number;
      message: string;
      fatal: boolean;
      retryInMs?: number;
    };

export type TranscriptItemKind = TranscriptItem["kind"];

/** Extract one variant by its `kind`, e.g. `ItemOf<"tool_call">`. */
export type ItemOf<K extends TranscriptItemKind> = Extract<TranscriptItem, { kind: K }>;

/**
 * Ceiling on the live output we retain per tool call.
 *
 * `pnpm install` can emit megabytes, and every chunk of it would otherwise land in
 * React state and be re-rendered. We keep the **tail**, because that is where the
 * error is — a build that fails prints its reason last. The model receives the
 * engine's own truncated result and is unaffected by this number.
 */
export const TOOL_OUTPUT_CAP_CHARS = 64 * 1024;

// ---------------------------------------------------------------------------
// Turn in flight
// ---------------------------------------------------------------------------

/**
 * State that exists only while a turn is running, and is discarded on
 * `turn_completed`. Kept out of `TranscriptItem` so that "is anything happening"
 * is one null check rather than a scan of the tail of the list.
 */
export interface LiveTurn {
  turnId: string;
  /** Engine's clock, from `turn_started`. Also the `at` of every item in the turn. */
  startedAt: number;
  model: string;
  /** Agent-loop iteration, from `iteration_started`. Part of every block id. */
  iteration: number;
  /**
   * The one prompt awaiting an answer, or null.
   *
   * Singular because the engine executes tool calls serially within a turn. If that
   * ever changes this becomes a map — but the UI would need redesigning anyway,
   * since two simultaneous modal prompts is not a coherent thing to show.
   */
  pendingPermission: PermissionRequest | null;
  /** Rolling total from `usage_updated`. Displayed live in the status bar. */
  cost: TurnCost;
  /** The tool currently executing, for the "running `pnpm test`…" line. */
  activeCallId: string | null;
  /**
   * True from the moment the user hits stop until `turn_completed` arrives.
   *
   * The button must go dead immediately even though the engine takes a moment to
   * unwind, or the user presses it again and reads the lack of response as a hang.
   */
  interruptRequested: boolean;
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export type HydrationState = "unloaded" | "loading" | "ready" | "failed";

/**
 * Everything a surface holds for one session.
 *
 * `applyEvent(view, event) → view` is the only way this changes during a turn, and
 * it is pure: no clocks, no I/O, no randomness. That is what makes the reducer
 * testable against a recorded event log, which is how the transcript gets tested
 * without spending money on a provider call.
 */
export interface SessionView {
  summary: SessionSummary;
  items: TranscriptItem[];
  live: LiveTurn | null;
  hydration: HydrationState;
  /** Set when `hydration === "failed"`, so the UI can offer a retry with a reason. */
  hydrationError?: string;
  /**
   * Item id → index in `items`.
   *
   * Not a convenience. A streaming turn applies tens of deltas per second, and each
   * one has to find its block; a linear scan over a thousand-item transcript turns
   * an O(n) lookup into the frame budget's largest line item. The reducer maintains
   * this on every insert and must keep it exact — a stale index silently appends
   * duplicate blocks instead of updating them.
   */
  index: Readonly<Record<string, number>>;
  /**
   * Monotonic counter for items with no natural key.
   *
   * Only errors need it: two provider failures in one turn are distinct rows, and
   * nothing in the event carries a discriminator. Incremented by the reducer, so it
   * stays deterministic under replay.
   */
  seq: number;
}

/** A fresh, empty view. The reducer's identity element. */
export interface SessionViewInit {
  summary: SessionSummary;
}

// ---------------------------------------------------------------------------
// Engine lifecycle
// ---------------------------------------------------------------------------

/**
 * What the surface knows about its engine.
 *
 * Modelled as a union rather than a boolean because "restarting" has to be visually
 * distinct from "failed": the first is a spinner the user waits through, the second
 * is a dead app that needs an action. Supervision itself lives in the desktop main
 * process — see `EngineClient` — and this is the projection of it.
 */
export type EngineStatus =
  | { phase: "starting" }
  | { phase: "ready"; engineVersion: string; protocolVersion: number; defaultModel: string }
  /** The engine died and is being respawned. Requests in flight were lost. */
  | { phase: "restarting"; attempt: number; lastError: string }
  /** Respawn gave up. The app is unusable until the user retries or reinstalls. */
  | { phase: "failed"; error: string };

/**
 * The single seam between a UI and the engine.
 *
 * The desktop implementation forwards over Electron IPC to the main process, which
 * owns the real `RpcPeer`; the CLI implementation wraps an `RpcPeer` directly. Both
 * satisfy this, so nothing above this line knows which it has.
 *
 * Deliberately **request-only plus a notification listener**, mirroring the
 * protocol: the engine never sends a *request* to a client. Permission prompts
 * arrive as `session/event` → `permission_requested` and are answered with
 * `session/resolvePermission`, which means a surface that cannot prompt (CI, a
 * headless run) needs no special handling — it just never answers, and rules decide.
 *
 * There is no `close()`. A surface does not own the engine's lifetime; on the
 * desktop, main spawns it, supervises it, and shuts it down on `before-quit` when
 * the renderer may already be gone.
 */
export interface EngineClient {
  request<M extends RequestMethod>(
    method: M,
    params: ParamsOf<M>,
    options?: { timeoutMs?: number },
  ): Promise<ResultOf<M>>;

  on<M extends NotificationMethod>(
    method: M,
    handler: (params: NotificationParamsOf<M>) => void,
  ): Unsubscribe;

  status(): EngineStatus;
  onStatusChange(handler: (status: EngineStatus) => void): Unsubscribe;
}

/** Convenience alias for the notification payloads, used by the store's wiring. */
export type EngineNotification = {
  [M in NotificationMethod]: { method: M; params: NotificationMap[M] };
}[NotificationMethod];

// ---------------------------------------------------------------------------
// Account
// ---------------------------------------------------------------------------

export type Plan = "free" | "pro" | "business" | "enterprise";

export interface AccountInfo {
  email: string;
  displayName?: string;
  plan: Plan;
  /**
   * Money in **cents**, integer. Never a float: `0.1 + 0.2` is a support ticket,
   * and this number gets summed and compared against a limit.
   */
  usageCents: number;
  /** null for invoiced plans with no hard cap. */
  limitCents: number | null;
  /** When the current billing period rolls over, ms since epoch. */
  periodEndsAt: number;
}

/**
 * Sign-in state, owned by the host (the desktop main process) and mirrored here.
 *
 * The token itself is **never** part of this type. It lives in the OS keychain and
 * is handed to the engine as a provider key by main; the renderer holds only the
 * fact of being signed in. A field here called `token` would end up in a React
 * devtools snapshot, a crash report, and eventually a screenshot in a bug report.
 *
 * `awaiting_authorization` is the middle of the browser flow: the system browser is
 * open on the gateway's sign-in page, and we are waiting for it to hand a code back.
 * It carries the URL so the app can offer "open again" and "copy link" — the single
 * most common sign-in failure is a browser that never came to the front — and an
 * optional confirmation code that the browser page displays, so the user can check
 * that the tab in front of them belongs to this copy of Trace.
 */
export type AuthState =
  | { status: "signed_out" }
  | {
      status: "awaiting_authorization";
      verificationUri: string;
      /** Shown next to the same code in the browser. Absent if the gateway omits it. */
      confirmationCode?: string;
      /** Absolute deadline, ms since epoch. The UI counts down against it. */
      expiresAt: number;
    }
  | { status: "signed_in"; account: AccountInfo }
  | { status: "error"; message: string };

// ---------------------------------------------------------------------------
// Work panel
// ---------------------------------------------------------------------------

export interface WorkPanelState {
  open: boolean;
  target: WorkPanelTarget;
  /**
   * Last ref per target, not one global ref.
   *
   * Switching from the diff back to files and then to the diff again should return
   * to the diff you were reading. One shared slot loses that, and the panel starts
   * feeling like it forgets things — which is a bad look for a product whose pitch
   * is memory.
   */
  refs: Partial<Record<WorkPanelTarget, string>>;
}

export const DEFAULT_WORK_PANEL: WorkPanelState = {
  open: false,
  target: "files",
  refs: {},
};

// ---------------------------------------------------------------------------
// Review
// ---------------------------------------------------------------------------

/**
 * The agent's uncommitted work, as the user is being asked to judge it.
 *
 * Held at app level rather than inside the review panel, for one reason: two surfaces
 * read it. The panel renders the hunks, and a bar in the chat column has to know whether
 * there is anything to review at all — a feature nobody can find is a feature that isn't
 * there. Two independent fetchers would double the git work and disagree about the count
 * for as long as they were out of step.
 *
 * `sessionId` is what the rest of the fields describe, not the session that is currently
 * selected. They differ for the moment between switching sessions and the next fetch
 * landing, and a client that ignores the difference shows one session's changes over
 * another's.
 */
export interface ReviewState {
  sessionId: string | null;
  files: ReviewFile[];
  /** The shadow commit unaccepted paths are compared against. Null when there is none. */
  baselineId: string | null;
  /** More files differ than the engine will enumerate. */
  truncated: boolean;
  loading: boolean;
  /**
   * Paths with an accept or a revert in flight.
   *
   * A list rather than a single flag because accepting one file while reverting another
   * is a normal thing to do quickly, and a shared flag would grey out both rows.
   */
  busy: string[];
  error: string | null;
}

export const DEFAULT_REVIEW: ReviewState = {
  sessionId: null,
  files: [],
  baselineId: null,
  truncated: false,
  loading: false,
  busy: [],
  error: null,
};

// ---------------------------------------------------------------------------
// Notices
// ---------------------------------------------------------------------------

/**
 * A banner. Distinct from a transcript `error` item: those belong to a turn and
 * stay in the history; these are about the app and are dismissible.
 */
export interface Notice {
  id: string;
  level: "info" | "warn" | "error";
  message: string;
  /** Rendered as a single button. Kept as a closed set so the store stays serializable. */
  action?: {
    label: string;
    kind: "sign_in" | "retry" | "open_settings" | "compact_session" | "restart_engine";
  };
}

export interface IndexProgress {
  workspaceId: string;
  phase: "scanning" | "chunking" | "embedding" | "writing" | "done";
  filesDone: number;
  filesTotal: number;
}

// ---------------------------------------------------------------------------
// The store
// ---------------------------------------------------------------------------

/**
 * The whole client state.
 *
 * Flat and serializable on purpose: it is the thing a bug report can dump, a test
 * can snapshot, and a future web surface can hydrate from the server.
 *
 * Note `noUncheckedIndexedAccess` is on across the repo, so `views[id]` is
 * `SessionView | undefined`. That is not friction to work around — an id for a
 * session that has been deleted in another window is a real case.
 */
export interface AppState {
  engine: EngineStatus;
  auth: AuthState;

  workspaces: WorkspaceInfo[];
  activeWorkspaceId: string | null;

  /** Most-recently-updated first. The sidebar renders this order verbatim. */
  sessions: SessionSummary[];
  views: Record<string, SessionView>;
  activeSessionId: string | null;

  /** null until `settings/get` resolves. The UI shows skeletons rather than defaults. */
  settings: EngineSettings | null;
  models: ModelInfo[];
  providerKeys: ProviderKeyStatus[];

  workPanel: WorkPanelState;
  review: ReviewState;
  indexing: Record<string, IndexProgress>;
  notices: Notice[];
}
