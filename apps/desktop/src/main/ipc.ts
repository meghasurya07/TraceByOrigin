/**
 * Every IPC handler, in one place.
 *
 * Two rules, both of which the type system cannot enforce for us:
 *
 * 1. **No handler rejects.** They all resolve an `IpcResult`. Rejecting from
 *    `ipcMain.handle` destroys the error's prototype and rewrites its message, and the
 *    renderer branches on JSON-RPC codes — `MissingApiKey` puts a sign-in button on
 *    screen, `ContextExceeded` offers to compact. See the `IpcFailure` comment in
 *    `shared/ipc.ts`.
 *
 * 2. **Anything the renderer hands us is untrusted input.** Not because the renderer is
 *    hostile, but because it is the one part of the app that renders model output: a
 *    path or URL that reached it may have been written by an LLM reading an untrusted
 *    repository. `openExternal` and `revealPath` are the two handlers where that turns
 *    into an OS-level action, and both validate before acting.
 *
 * Copyright (c) 2026 Origin AI
 */

import path from "node:path";
import { BrowserWindow, app, dialog, ipcMain, shell } from "electron";

import { ErrorCode, RpcError } from "@trace/protocol";
import type { ParamsOf, RequestMethod } from "@trace/protocol";

import {
  IPC,
  ipcErr,
  ipcOk,
  type EngineRequestPayload,
  type HostInfo,
  type IpcResult,
  type PickDirectoryParams,
  type WindowControl,
} from "../shared/ipc.js";
import type { AuthController } from "./auth.js";
import type { EngineHost } from "./engine-host.js";

export interface IpcContext {
  engine: EngineHost;
  auth: AuthController;
  homeDir: string;
  /** Current roots, for `revealPath`'s containment check. */
  workspaceRoots: () => readonly string[];
  /** The window a renderer-originated call came from, resolved per-invocation. */
  onLog?: (line: string) => void;
}

/** Schemes we are willing to hand to the OS. Everything else is refused and logged. */
const OPENABLE_PROTOCOLS = new Set(["https:", "http:", "mailto:"]);

export function registerIpc(context: IpcContext): void {
  handle(IPC.engineRequest, async (_event, payload: EngineRequestPayload) => {
    // The generic is restored on both sides of this call; the cast is the three-line
    // untyped middle documented on `EngineRequestPayload`.
    return context.engine.client.request(
      payload.method as RequestMethod,
      payload.params as ParamsOf<RequestMethod>,
      payload.timeoutMs === undefined ? undefined : { timeoutMs: payload.timeoutMs },
    );
  });

  handle(IPC.engineRestart, async () => {
    await context.engine.restart();
    return null;
  });

  // ---- auth ----

  handle(IPC.authSignIn, async () => {
    // Not awaited. The flow finishes when the user finishes in their browser, which can
    // be a minute away, and an `invoke` pending that long is indistinguishable from a
    // hang. The outcome — success, failure, cancellation — arrives on `authState`.
    void context.auth.signIn();
    return null;
  });

  handle(IPC.authCancelSignIn, async () => {
    context.auth.cancelSignIn();
    return null;
  });

  handle(IPC.authSignOut, async () => {
    await context.auth.signOut();
    return null;
  });

  handle(IPC.authRefreshAccount, async () => context.auth.refreshAccount());

  // ---- host ----

  handle(IPC.hostInfo, async (): Promise<HostInfo> => {
    return {
      platform: process.platform === "darwin" ? "darwin" : process.platform === "win32" ? "win32" : "linux",
      appVersion: app.getVersion(),
      electronVersion: process.versions.electron ?? "",
      chromeVersion: process.versions.chrome ?? "",
      nodeVersion: process.versions.node,
      isPackaged: app.isPackaged,
      homeDir: context.homeDir,
    };
  });

  handle(IPC.hostOpenExternal, async (_event, params: { url: string }) => {
    let parsed: URL;
    try {
      parsed = new URL(params.url);
    } catch {
      throw new RpcError(ErrorCode.InvalidParams, "That is not a valid link.");
    }
    if (!OPENABLE_PROTOCOLS.has(parsed.protocol)) {
      // The interesting refusals are `file:` (opens anything on disk) and any custom
      // scheme a hostile repository could have registered a handler for.
      context.onLog?.(`[ipc] refused to open ${parsed.protocol} link`);
      throw new RpcError(
        ErrorCode.InvalidParams,
        `Trace will not open ${parsed.protocol} links.`,
      );
    }
    await shell.openExternal(parsed.toString());
    return null;
  });

  handle(IPC.hostPickDirectory, async (event, params: PickDirectoryParams) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    const options = {
      title: params.title ?? "Open folder",
      properties: ["openDirectory", "createDirectory"] as const,
      ...(params.defaultPath === undefined ? {} : { defaultPath: params.defaultPath }),
    };
    // Modal to the calling window where we have one, so the dialog cannot end up behind
    // the app on Windows.
    const result =
      window === null
        ? await dialog.showOpenDialog({ ...options, properties: [...options.properties] })
        : await dialog.showOpenDialog(window, { ...options, properties: [...options.properties] });

    return result.canceled ? null : result.filePaths[0] ?? null;
  });

  handle(IPC.hostRevealPath, async (_event, params: { path: string }) => {
    const target = path.resolve(params.path);
    if (!isInsideAnyRoot(target, context.workspaceRoots())) {
      context.onLog?.(`[ipc] refused to reveal a path outside every workspace`);
      throw new RpcError(
        ErrorCode.PathOutsideWorkspace,
        "That path is outside every open workspace.",
      );
    }
    shell.showItemInFolder(target);
    return null;
  });

  handle(IPC.windowControl, async (event, params: { control: WindowControl }) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window === null) return null;
    applyWindowControl(window, params.control);
    return null;
  });
}

/** Remove every handler. Called before quit so a reload cannot double-register. */
export function unregisterIpc(): void {
  for (const channel of Object.values(IPC)) ipcMain.removeHandler(channel);
}

// ---------------------------------------------------------------------------
// Plumbing
// ---------------------------------------------------------------------------

type Handler = (event: Electron.IpcMainInvokeEvent, params: never) => Promise<unknown>;

/**
 * Register a handler that cannot reject.
 *
 * Every throw is flattened into an `IpcFailure` with a JSON-RPC code: `RpcError`s keep
 * theirs, everything else becomes `InternalError`. The renderer's preload turns it back
 * into a `TraceRequestError`, so the code survives a boundary that would otherwise
 * reduce it to a string.
 */
function handle(channel: string, handler: Handler): void {
  ipcMain.handle(channel, async (event, params: unknown): Promise<IpcResult<unknown>> => {
    try {
      // `params` arrives as whatever the renderer sent — structured-clone output, so
      // `unknown` is the honest type. Each handler declares the shape it expects; the
      // guarantee comes from `IpcInvokeMap` typing the preload's call site.
      return ipcOk(await handler(event, params as never));
    } catch (cause) {
      if (cause instanceof RpcError) {
        return ipcErr(cause.code, cause.message, cause.data);
      }
      return ipcErr(
        ErrorCode.InternalError,
        cause instanceof Error ? cause.message : String(cause),
      );
    }
  });
}

function applyWindowControl(window: BrowserWindow, control: WindowControl): void {
  switch (control) {
    case "minimize":
      window.minimize();
      return;
    case "toggle_maximize":
      if (window.isMaximized()) window.unmaximize();
      else window.maximize();
      return;
    case "close":
      window.close();
      return;
    case "toggle_full_screen":
      window.setFullScreen(!window.isFullScreen());
      return;
    case "toggle_dev_tools":
      window.webContents.toggleDevTools();
      return;
    default: {
      const unhandled: never = control;
      throw new RpcError(ErrorCode.InvalidParams, `Unknown window control: ${String(unhandled)}`);
    }
  }
}

/**
 * Containment, done on resolved paths with a separator check.
 *
 * `startsWith(root)` alone is the classic bug: `/home/me/work-secrets` starts with
 * `/home/me/work`. Comparing case-insensitively on Windows and macOS matches how those
 * filesystems actually behave — a check that says no to `C:\Repo` because the root was
 * recorded as `C:\repo` is a bug report, not security.
 */
function isInsideAnyRoot(target: string, roots: readonly string[]): boolean {
  const insensitive = process.platform === "win32" || process.platform === "darwin";
  const normalize = (value: string): string => (insensitive ? value.toLowerCase() : value);
  const candidate = normalize(target);

  return roots.some((root) => {
    const base = normalize(path.resolve(root));
    if (candidate === base) return true;
    return candidate.startsWith(base.endsWith(path.sep) ? base : base + path.sep);
  });
}
