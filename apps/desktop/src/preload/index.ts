/**
 * The bridge.
 *
 * Sixty lines, and the only thing the renderer can see of the outside world. Compiled to
 * CommonJS so the window can keep `sandbox: true` — Electron only loads an ESM preload
 * with the sandbox off, and Chromium's renderer sandbox is worth more than module-syntax
 * consistency in a file this small.
 *
 * Two jobs:
 *
 * 1. **Un-flatten failures.** Main resolves an `IpcResult` and never rejects, because a
 *    rejection from `ipcMain.handle` loses the error's prototype and has its message
 *    rewritten. Here the envelope becomes a real thrown `TraceRequestError` carrying the
 *    JSON-RPC `code`, which is what the renderer branches on.
 *
 * 2. **Hand back individual unsubscribers.** `ipcRenderer.removeAllListeners` is the
 *    obvious API and the wrong one: React mounts and unmounts effects constantly, and
 *    two components sharing a channel would keep tearing down each other's listener.
 *
 * It exposes no `ipcRenderer`, no `require`, and no way to reach a channel that is not
 * on this object. Adding a capability means adding a method here, deliberately.
 *
 * Copyright (c) 2026 Origin AI
 */

import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";

import {
  IPC,
  TraceRequestError,
  type HostInfo,
  type IpcResult,
  type PickDirectoryParams,
  type TraceBridge,
  type UiCommand,
  type WindowControl,
  type WindowStatePayload,
} from "../shared/ipc.js";
import type { AccountInfo, AuthState, EngineNotification, EngineStatus } from "@trace/client";
import type { ParamsOf, RequestMethod, ResultOf } from "@trace/protocol";

/** Every call goes through here, so there is exactly one place failures are unwrapped. */
async function invoke<T>(channel: string, params?: unknown): Promise<T> {
  const result = (await ipcRenderer.invoke(channel, params)) as IpcResult<T> | undefined;

  // A handler that was never registered resolves `undefined` rather than failing, which
  // would otherwise surface as a confusing "cannot read property ok of undefined".
  if (result === undefined) {
    throw new TraceRequestError({
      code: -32603,
      message: `No handler is registered for ${channel}.`,
    });
  }

  if (!result.ok) throw new TraceRequestError(result.error);
  return result.value;
}

/** Subscribe, and hand back the teardown for exactly this listener. */
function subscribe<T>(channel: string, handler: (payload: T) => void): () => void {
  const listener = (_event: IpcRendererEvent, payload: T): void => {
    handler(payload);
  };
  ipcRenderer.on(channel, listener);
  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
}

const bridge: TraceBridge = {
  request<M extends RequestMethod>(
    method: M,
    params: ParamsOf<M>,
    options?: { timeoutMs?: number },
  ): Promise<ResultOf<M>> {
    return invoke<ResultOf<M>>(IPC.engineRequest, {
      method,
      params,
      ...(options?.timeoutMs === undefined ? {} : { timeoutMs: options.timeoutMs }),
    });
  },

  onEngineNotify: (handler) => subscribe<EngineNotification>(IPC.engineNotify, handler),
  onEngineStatus: (handler) => subscribe<EngineStatus>(IPC.engineStatus, handler),
  restartEngine: async () => {
    await invoke<null>(IPC.engineRestart);
  },

  onAuthState: (handler) => subscribe<AuthState>(IPC.authState, handler),
  signIn: async () => {
    await invoke<null>(IPC.authSignIn);
  },
  cancelSignIn: async () => {
    await invoke<null>(IPC.authCancelSignIn);
  },
  signOut: async () => {
    await invoke<null>(IPC.authSignOut);
  },
  refreshAccount: () => invoke<AccountInfo | null>(IPC.authRefreshAccount),

  hostInfo: () => invoke<HostInfo>(IPC.hostInfo),
  openExternal: async (url) => {
    await invoke<null>(IPC.hostOpenExternal, { url });
  },
  pickDirectory: (params) =>
    invoke<string | null>(IPC.hostPickDirectory, params ?? ({} satisfies PickDirectoryParams)),
  revealPath: async (path) => {
    await invoke<null>(IPC.hostRevealPath, { path });
  },

  onWindowState: (handler) => subscribe<WindowStatePayload>(IPC.windowState, handler),
  windowControl: async (control: WindowControl) => {
    await invoke<null>(IPC.windowControl, { control });
  },

  onUiCommand: (handler) => subscribe<UiCommand>(IPC.uiCommand, handler),
};

contextBridge.exposeInMainWorld("trace", bridge);
