/**
 * @trace/client — the surface-agnostic half of a Trace UI.
 *
 * The view model, the event reducer that maintains it, and the engine client every
 * surface talks through. Nothing in here knows whether it is running in an Electron
 * renderer, a terminal, or a browser tab; that is the point, and it is enforced by
 * `types: []` in this package's tsconfig.
 *
 * Import from here, never from a deep path — the subfile layout is an implementation
 * detail and will move.
 *
 * Copyright (c) 2026 Origin AI
 */

export { TOOL_OUTPUT_CAP_CHARS, DEFAULT_REVIEW, DEFAULT_WORK_PANEL } from "./types.js";
export type {
  AccountInfo,
  AppState,
  AuthState,
  EngineClient,
  EngineNotification,
  EngineStatus,
  HydrationState,
  IndexProgress,
  ItemOf,
  LiveTurn,
  Notice,
  Plan,
  ReviewState,
  SessionView,
  SessionViewInit,
  ToolCallStatus,
  TranscriptItem,
  TranscriptItemKind,
  Unsubscribe,
  WorkPanelState,
} from "./types.js";

export {
  appendUserMessage,
  applyEvent,
  emptySessionView,
  hydrateFromHistory,
  initialAppState,
  itemIdFor,
} from "./reducer.js";

export {
  PROVIDER_LABELS,
  PROVIDER_ORDER,
  accessFor,
  cumulativeCost,
  isModelUsable,
  modelsByProvider,
  pendingPermission,
  visibleItems,
} from "./selectors.js";
export type { ModelAccess, ProviderGroup } from "./selectors.js";

export { RpcEngineClient } from "./client.js";
export type { RpcEngineClientOptions } from "./client.js";
