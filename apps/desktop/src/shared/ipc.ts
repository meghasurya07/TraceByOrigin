/**
 * The main ↔ renderer contract.
 *
 * Compiled by **both** desktop TypeScript projects (`tsconfig.node.json` and
 * `tsconfig.web.json`), which is what makes it a contract rather than a convention:
 * a channel added on one side that the other does not know about will not compile.
 *
 * Three consequences of being compiled twice, all of them constraints on this file:
 *
 * 1. **No Node types and no DOM types.** The node project has `types: ["node"]` and
 *    no `DOM` lib; the web project has the reverse. Anything only one of them
 *    provides — `Buffer`, `NodeJS.Timeout`, `Window`, `Event` — breaks the other
 *    build. That includes the `declare global { interface Window }` augmentation for
 *    `window.trace`: it needs `lib.dom` and therefore lives in
 *    `src/renderer/global.d.ts`, not here.
 *
 * 2. **Relative imports would need `.js` here and no extension in the renderer.**
 *    The two projects disagree on module resolution (NodeNext vs bundler), so this
 *    file imports only from bare package specifiers, which both resolve identically.
 *
 * 3. **Everything crossing a channel must be structured-cloneable.** Electron's IPC
 *    serializes with the structured clone algorithm — no functions, no class
 *    instances, no `Error` objects with their prototype intact. That last one is why
 *    `IpcResult` exists; see below.
 *
 * ## Why main owns the engine connection
 *
 * The renderer does not hold the `RpcPeer`. Main does, and the renderer reaches it
 * through `IPC.engineRequest`. Four reasons, each of which independently rules out
 * the simpler design:
 *
 * - `shutdown` has to be sent on `before-quit`, when the renderer may already be
 *   destroyed. A renderer-owned peer means every quit orphans an engine process.
 * - The account token has to reach the engine before the first UI paint, so the
 *   model picker is not briefly wrong. Main reads the keychain; the renderer never
 *   sees a token.
 * - Crash supervision — respawn, backoff, giving up — is lifecycle work, and the
 *   renderer is the thing most likely to be reloaded during it.
 * - One engine, several windows, eventually.
 *
 * Copyright (c) 2026 Origin AI
 */

import type { AccountInfo, AuthState, EngineNotification, EngineStatus } from "@trace/client";
import type { ParamsOf, RequestMethod, ResultOf } from "@trace/protocol";

// ---------------------------------------------------------------------------
// Channels
// ---------------------------------------------------------------------------

/**
 * Every channel name, in one place, prefixed so they can never collide with a
 * library's own IPC traffic.
 *
 * `invoke` channels are request/response and appear in `IpcInvokeMap`. `push`
 * channels are main → renderer only and appear in `IpcPushMap`. Nothing goes
 * renderer → main fire-and-forget: a send with no reply is a call whose failure
 * nobody notices.
 */
export const IPC = {
  // invoke
  engineRequest: "trace:engine:request",
  engineRestart: "trace:engine:restart",
  authSignIn: "trace:auth:signIn",
  authCancelSignIn: "trace:auth:cancelSignIn",
  authSignOut: "trace:auth:signOut",
  authRefreshAccount: "trace:auth:refreshAccount",
  hostInfo: "trace:host:info",
  hostOpenExternal: "trace:host:openExternal",
  hostPickDirectory: "trace:host:pickDirectory",
  hostRevealPath: "trace:host:revealPath",
  windowControl: "trace:window:control",

  // push
  engineNotify: "trace:engine:notify",
  engineStatus: "trace:engine:status",
  authState: "trace:auth:state",
  windowState: "trace:window:state",
  uiCommand: "trace:ui:command",
} as const;

export type IpcChannel = (typeof IPC)[keyof typeof IPC];

// ---------------------------------------------------------------------------
// Error transport
// ---------------------------------------------------------------------------

/**
 * A failure, flattened so structured clone survives it.
 *
 * Rejecting from `ipcMain.handle` loses the prototype and rewrites the message —
 * Electron prefixes it with `Error invoking remote method '…':`. The UI branches on
 * JSON-RPC codes (`ErrorCode.MissingApiKey` puts a sign-in button on screen,
 * `ContextExceeded` offers to compact the session), so the code has to arrive
 * intact. Every handler therefore resolves an `IpcResult` and never rejects; the
 * preload turns a failure back into a thrown error carrying `code`.
 */
export interface IpcFailure {
  /** A `ErrorCode` from `@trace/protocol` where one applies, else `-32603`. */
  code: number;
  message: string;
  data?: unknown;
}

export type IpcResult<T> = { ok: true; value: T } | { ok: false; error: IpcFailure };

export function ipcOk<T>(value: T): IpcResult<T> {
  return { ok: true, value };
}

export function ipcErr(code: number, message: string, data?: unknown): IpcResult<never> {
  return data === undefined
    ? { ok: false, error: { code, message } }
    : { ok: false, error: { code, message, data } };
}

// ---------------------------------------------------------------------------
// Payloads
// ---------------------------------------------------------------------------

/**
 * An engine call, forwarded verbatim.
 *
 * Untyped at the channel boundary — `method` is a string and `params` is `unknown`
 * — because a generic cannot survive structured clone. The type safety is restored
 * at both ends: `TraceBridge.request` is generic over `RequestMethod`, and main
 * hands the pair straight to `RpcPeer.request`, which is also generic. The
 * unchecked middle is three lines of forwarding.
 */
export interface EngineRequestPayload {
  method: string;
  params: unknown;
  timeoutMs?: number;
}

export interface HostInfo {
  platform: "darwin" | "win32" | "linux";
  /** Drives the traffic-light side of the title bar and `⌘` vs `Ctrl` in shortcuts. */
  appVersion: string;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
  /** False under `electron-vite dev`. The UI shows a dev badge. */
  isPackaged: boolean;
  /** `~/.trace`, or wherever `--home` pointed. Shown in settings. */
  homeDir: string;
}

/** Frameless-window controls, since the renderer draws its own title bar. */
export type WindowControl =
  "minimize" | "toggle_maximize" | "close" | "toggle_full_screen" | "toggle_dev_tools";

export interface WindowStatePayload {
  maximized: boolean;
  fullScreen: boolean;
  focused: boolean;
}

/**
 * Menu and accelerator actions, pushed from main.
 *
 * The native menu lives in main because that is where `Menu.setApplicationMenu` is,
 * but every one of these items acts on renderer state. Sending a command rather
 * than duplicating logic keeps the menu and the in-app buttons on one code path —
 * "New Session" must do exactly the same thing whether it came from `⌘N` or a click.
 */
export type UiCommand =
  | { kind: "new_session" }
  | { kind: "new_side_chat" }
  | { kind: "focus_prompt" }
  | { kind: "toggle_sidebar" }
  | { kind: "toggle_work_panel" }
  | { kind: "open_work_panel"; target: "files" | "diff" | "canvas" | "pr" | "browser" | "terminal" }
  | { kind: "open_settings"; section?: "account" | "models" | "permissions" | "advanced" }
  | { kind: "open_session_search" }
  | { kind: "interrupt_turn" }
  /** From a `trace://` deep link that named a session. */
  | { kind: "open_session"; sessionId: string };

export interface PickDirectoryParams {
  /** Window title, e.g. "Open folder". */
  title?: string;
  /** Where the dialog starts. Omit for the OS default. */
  defaultPath?: string;
}

// ---------------------------------------------------------------------------
// The maps
// ---------------------------------------------------------------------------

/** Renderer → main, request/response. Handlers resolve `IpcResult`, never reject. */
export interface IpcInvokeMap {
  [IPC.engineRequest]: { params: EngineRequestPayload; result: unknown };
  /** Manual recovery after `EngineStatus.phase === "failed"`. */
  [IPC.engineRestart]: { params: void; result: null };

  /**
   * Begins the browser sign-in: main mints a PKCE verifier, opens the system
   * browser on the gateway's authorize URL, and waits for a `trace://` callback.
   * Resolves immediately — the *outcome* arrives later on `authState`, because the
   * user may take a minute and an invoke that waits that long looks like a hang.
   */
  [IPC.authSignIn]: { params: void; result: null };
  [IPC.authCancelSignIn]: { params: void; result: null };
  /** Clears the keychain entry and drops the engine's `trace` provider key. */
  [IPC.authSignOut]: { params: void; result: null };
  /** Re-reads plan and usage. Called on window focus, and after a turn completes. */
  [IPC.authRefreshAccount]: { params: void; result: AccountInfo | null };

  [IPC.hostInfo]: { params: void; result: HostInfo };
  /**
   * `shell.openExternal`. Main validates the scheme against an allow-list of
   * http/https before handing a renderer-supplied string to the OS — the renderer is
   * the one part of the app that renders model output, so a URL that reached it
   * cannot be assumed to have come from us.
   */
  [IPC.hostOpenExternal]: { params: { url: string }; result: null };
  /** Native folder picker. Resolves the chosen absolute path, or null on cancel. */
  [IPC.hostPickDirectory]: { params: PickDirectoryParams; result: string | null };
  /** `shell.showItemInFolder`. Main rejects anything outside a known workspace. */
  [IPC.hostRevealPath]: { params: { path: string }; result: null };

  [IPC.windowControl]: { params: { control: WindowControl }; result: null };
}

export type IpcInvokeChannel = keyof IpcInvokeMap;

/** Main → renderer, fire-and-forget. */
export interface IpcPushMap {
  [IPC.engineNotify]: EngineNotification;
  [IPC.engineStatus]: EngineStatus;
  [IPC.authState]: AuthState;
  [IPC.windowState]: WindowStatePayload;
  [IPC.uiCommand]: UiCommand;
}

export type IpcPushChannel = keyof IpcPushMap;

// ---------------------------------------------------------------------------
// The preload bridge
// ---------------------------------------------------------------------------

/**
 * What `contextBridge` exposes as `window.trace`. The renderer's entire view of the
 * outside world — `nodeIntegration` is off, `contextIsolation` is on, and the CSP
 * sets `connect-src 'none'`, so there is no second path.
 *
 * `request` is generic over `RequestMethod`, so the renderer keeps full protocol
 * typing despite the untyped channel underneath, and throws a real error carrying
 * the JSON-RPC `code` on failure.
 *
 * Every `on*` returns its own unsubscriber. React effects mount and unmount
 * constantly; a bridge that only supported "remove all listeners for this channel"
 * would have two components fighting over one subscription.
 */
export interface TraceBridge {
  request<M extends RequestMethod>(
    method: M,
    params: ParamsOf<M>,
    options?: { timeoutMs?: number },
  ): Promise<ResultOf<M>>;

  onEngineNotify(handler: (notification: EngineNotification) => void): () => void;
  onEngineStatus(handler: (status: EngineStatus) => void): () => void;
  restartEngine(): Promise<void>;

  onAuthState(handler: (state: AuthState) => void): () => void;
  signIn(): Promise<void>;
  cancelSignIn(): Promise<void>;
  signOut(): Promise<void>;
  refreshAccount(): Promise<AccountInfo | null>;

  hostInfo(): Promise<HostInfo>;
  openExternal(url: string): Promise<void>;
  pickDirectory(params?: PickDirectoryParams): Promise<string | null>;
  revealPath(path: string): Promise<void>;

  onWindowState(handler: (state: WindowStatePayload) => void): () => void;
  windowControl(control: WindowControl): Promise<void>;

  onUiCommand(handler: (command: UiCommand) => void): () => void;
}

/**
 * Error thrown by `TraceBridge.request` when the engine — or main — refused.
 *
 * Declared here rather than in the preload so the renderer can `instanceof` it.
 * Extending `Error` is safe in both projects: `Error` is in `lib.es5`, not in
 * `@types/node` or `lib.dom`.
 */
export class TraceRequestError extends Error {
  readonly code: number;
  readonly data?: unknown;

  constructor(failure: IpcFailure) {
    super(failure.message);
    this.name = "TraceRequestError";
    this.code = failure.code;
    if (failure.data !== undefined) this.data = failure.data;
  }
}
