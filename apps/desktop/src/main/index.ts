/**
 * Main entry.
 *
 * The only file that knows the whole shape of the app: it owns the boot order, and boot
 * order is the one thing here that cannot be recovered from if it is wrong.
 *
 *   app ready
 *     → single-instance lock          (a second launch must hand its deep link over, not
 *                                      start a second engine on the same session store)
 *     → state store                   (window bounds are needed before the window)
 *     → vault                         (`safeStorage` is only truthful after ready)
 *     → engine spawn + handshake      (in parallel with the window: the renderer boots
 *                                      against a status stream and handles `starting`)
 *     → auth restore → engine token   (before first paint, so the model picker is never
 *                                      briefly wrong)
 *     → window
 *
 * Quit runs the same list backwards, and `before-quit` is where the engine's `shutdown`
 * is sent — which is the reason main owns the engine connection at all.
 *
 * Copyright (c) 2026 Origin AI
 */

import path from "node:path";
import { BrowserWindow, app, dialog, shell } from "electron";

import { IPC } from "../shared/ipc.js";
import { AuthController } from "./auth.js";
import { EngineHost, type EngineLogLevel } from "./engine-host.js";
import { registerIpc, unregisterIpc } from "./ipc.js";
import { installApplicationMenu } from "./menu.js";
import { StateStore } from "./state.js";
import { openVault } from "./vault.js";
import { createWindow } from "./window.js";

const PROTOCOL = "trace";
const DOCS_URL = "https://docs.trace.origin.ai";
const ISSUES_URL = "https://github.com/origin-ai/trace/issues";

/**
 * Keep a dev run and an installed Trace out of each other's way.
 *
 * Both builds read their name from the same app manifest, so both resolve the same
 * `userData` *and* the same single-instance lock — and losing that lock is silent: the
 * second app launched calls `app.quit()`, shuts its engine down cleanly, and never opens
 * a window. (Observed while verifying the packaged build: with `pnpm dev` running,
 * `Trace.exe` exited with status 0 and printed nothing, which looks like a broken
 * installer and is not one.)
 *
 * Renaming the dev app is what separates them, and it has to come before anything reads a
 * path: `userData` is derived from the name on first use, and the lock from the name. The
 * explicit `setPath` is not redundant — it pins the directory to the new name even if
 * something in Electron's startup has already resolved the old one.
 *
 * What this buys, beyond not being confusing: an installed Trace and `pnpm dev` can run
 * side by side, and a schema change in one cannot corrupt the other's state.
 */
if (!app.isPackaged) {
  app.setName(`${app.getName()} (dev)`);
  app.setPath("userData", path.join(app.getPath("appData"), app.getName()));
}

/**
 * `~/.trace` unless overridden. The engine's `--home`, and where sessions live.
 *
 * Separated in dev for the same reason as `userData`, and more urgently: two engines
 * against one home directory means two writers on one sqlite index.
 */
const HOME_DIR =
  process.env["TRACE_HOME"] ??
  path.join(app.getPath("home"), app.isPackaged ? ".trace" : ".trace-dev");

const LOG_LEVEL: EngineLogLevel = app.isPackaged
  ? ((process.env["TRACE_LOG_LEVEL"] as EngineLogLevel | undefined) ?? "info")
  : "debug";

// ---------------------------------------------------------------------------
// Process-wide setup, before `ready`
// ---------------------------------------------------------------------------

/**
 * One instance, always.
 *
 * Two processes would open the same sqlite index and the same session store with two
 * engines, and the loser of that race is the user's history. A second launch forwards
 * its argv — which is where a Windows/Linux `trace://` link arrives — and exits.
 */
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

// Registered before `ready` so the OS association is in place even on first run. In dev
// the executable is Electron itself, so the path and an argv marker have to be passed
// explicitly or the OS would hand the link to a bare Electron with no app.
if (process.defaultApp && process.argv.length >= 2) {
  const entry = process.argv[1];
  if (entry !== undefined) {
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(entry)]);
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL);
}

// ---------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------

let mainWindow: BrowserWindow | null = null;
let engine: EngineHost | null = null;
let auth: AuthController | null = null;
let stateStore: StateStore | null = null;
let quitting = false;

/** Anything pushed before the window exists is dropped — the renderer replays on boot. */
function push<T>(channel: string, payload: T): void {
  if (mainWindow === null || mainWindow.isDestroyed()) return;
  if (mainWindow.webContents.isDestroyed()) return;
  mainWindow.webContents.send(channel, payload);
}

function log(line: string): void {
  // stderr, not stdout: on Windows a packaged GUI app has no console, and stdout is
  // reserved by convention across this codebase for protocol traffic.
  process.stderr.write(`${line}\n`);
}

async function boot(): Promise<void> {
  stateStore = await StateStore.open(app.getPath("userData"));
  const vault = openVault(app.getPath("userData"));
  if (!vault.persistent) {
    log("[main] the OS provided no encryption; the account token will not be remembered");
  }

  const persisted = stateStore.get();

  engine = new EngineHost({
    homeDir: HOME_DIR,
    logLevel: LOG_LEVEL,
    onStatus: (status) => {
      push(IPC.engineStatus, status);
      if (status.phase === "failed") log(`[main] engine failed: ${status.error}`);
    },
    onNotify: (notification) => {
      push(IPC.engineNotify, notification);
    },
    onReady: async () => {
      // Every respawn lands here, which is what keeps a restarted engine from being
      // signed in on our side and credential-less on its own.
      await auth?.reapplyToken();
    },
    onLog: log,
  });

  auth = new AuthController({
    vault,
    onState: (state) => {
      push(IPC.authState, state);
    },
    openBrowser: async (url) => {
      await shell.openExternal(url);
    },
    applyToken: async (token) => {
      const client = engine?.client;
      if (client === undefined) return;
      try {
        if (token === null) await client.request("settings/deleteProviderKey", { provider: "trace" });
        else await client.request("settings/setProviderKey", { provider: "trace", apiKey: token });
      } catch (cause) {
        // A dead or restarting engine. `onReady` will re-seed it, so this is worth a log
        // line and nothing more.
        log(`[main] could not hand the account token to the engine: ${String(cause)}`);
      }
    },
    onLog: log,
  });

  registerIpc({
    engine,
    auth,
    homeDir: HOME_DIR,
    workspaceRoots: () => stateStore?.get().workspaceRoots ?? [],
    onLog: log,
  });

  installApplicationMenu({
    targetWindow: () => mainWindow,
    onOpenFolder: () => {
      void openFolder();
    },
    onSignIn: () => {
      void auth?.signIn();
    },
    docsUrl: DOCS_URL,
    issuesUrl: ISSUES_URL,
  });

  // The window is created without waiting for the engine. The renderer's first paint is
  // driven by `EngineStatus`, so it can render the shell — title bar, sidebar, an empty
  // transcript — while the handshake is still in flight. Serialising these would add the
  // engine's whole startup to time-to-first-pixel for no benefit.
  mainWindow = createWindow({
    state: stateStore,
    rendererUrl: process.env["ELECTRON_RENDERER_URL"],
    onLog: log,
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  const started = engine
    .start(persisted.workspaceRoots)
    .catch((cause: unknown) => {
      log(`[main] the engine did not start: ${String(cause)}`);
    })
    // Restore auth only once the engine exists, so `applyToken` has somewhere to put the
    // token. `restore` never rejects.
    .then(() => auth?.restore());

  // Deliberately not awaited before the window shows; awaited here only so an unhandled
  // rejection cannot escape.
  void started;
}

async function openFolder(): Promise<void> {
  const result = await dialog.showOpenDialog({
    title: "Open folder",
    properties: ["openDirectory", "createDirectory"],
  });
  const chosen = result.canceled ? undefined : result.filePaths[0];
  if (chosen === undefined || engine === null || stateStore === null) return;

  try {
    await engine.client.request("workspace/open", { root: chosen });
    const roots = stateStore.get().workspaceRoots;
    if (!roots.includes(chosen)) {
      stateStore.update({ workspaceRoots: [...roots, chosen] });
    }
    push(IPC.uiCommand, { kind: "open_work_panel", target: "files" });
  } catch (cause) {
    log(`[main] could not open ${chosen}: ${String(cause)}`);
    await dialog.showMessageBox({
      type: "error",
      message: "Trace could not open that folder.",
      detail: cause instanceof Error ? cause.message : String(cause),
    });
  }
}

/**
 * Deep links, from every platform's different mechanism.
 *
 * Windows and Linux deliver them in the argv of a second launch; macOS delivers them as
 * `open-url` on the running process. Both funnel here.
 */
function handleDeepLink(rawUrl: string): void {
  if (auth?.handleCallback(rawUrl)) {
    mainWindow?.show();
    mainWindow?.focus();
    return;
  }

  // `trace://session/<id>` — the shareable link a teammate sends you.
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== `${PROTOCOL}:`) return;
    if (url.host === "session") {
      const sessionId = url.pathname.replace(/^\//, "");
      if (sessionId !== "") {
        push(IPC.uiCommand, { kind: "open_session", sessionId });
        mainWindow?.show();
        mainWindow?.focus();
        return;
      }
    }
    log(`[main] unrecognised deep link: ${rawUrl}`);
  } catch {
    log(`[main] unparseable deep link: ${rawUrl}`);
  }
}

function deepLinkFromArgv(argv: readonly string[]): string | undefined {
  return argv.find((arg) => arg.startsWith(`${PROTOCOL}://`));
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

app.on("second-instance", (_event, argv) => {
  const link = deepLinkFromArgv(argv);
  if (link !== undefined) handleDeepLink(link);

  if (mainWindow === null) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
});

app.on("open-url", (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

app.whenReady().then(
  async () => {
    await boot();
    // A cold-start deep link: the app was launched *by* the link, so it is already in
    // our own argv and no `second-instance` will ever fire for it.
    const link = deepLinkFromArgv(process.argv);
    if (link !== undefined) handleDeepLink(link);
  },
  (cause: unknown) => {
    log(`[main] boot failed: ${String(cause)}`);
    void dialog
      .showMessageBox({
        type: "error",
        message: "Trace could not start.",
        detail: cause instanceof Error ? cause.message : String(cause),
      })
      .finally(() => {
        app.exit(1);
      });
  },
);

app.on("activate", () => {
  // macOS: the dock icon was clicked with no windows open.
  if (BrowserWindow.getAllWindows().length > 0 || stateStore === null) return;
  mainWindow = createWindow({
    state: stateStore,
    rendererUrl: process.env["ELECTRON_RENDERER_URL"],
    onLog: log,
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});

app.on("window-all-closed", () => {
  // macOS keeps the app alive with no windows; every other platform quits.
  if (process.platform !== "darwin") app.quit();
});

/**
 * The quit path, and the reason for most of this file's structure.
 *
 * `before-quit` is preventable, so this is the last point at which we can hold the app
 * open long enough to flush. The engine has sessions to persist and a git lock to drop;
 * `stateStore` has a debounced write that may not have fired. Both get awaited, and both
 * have their own internal ceilings so a wedged one cannot make quitting impossible.
 */
app.on("before-quit", (event) => {
  if (quitting) return;
  quitting = true;
  event.preventDefault();

  void (async () => {
    try {
      auth?.dispose();
      unregisterIpc();
      await Promise.all([engine?.stop(), stateStore?.settle()]);
    } catch (cause) {
      log(`[main] shutdown was not clean: ${String(cause)}`);
    } finally {
      app.exit(0);
    }
  })();
});

// The renderer never navigates and never spawns a window; `window.ts` enforces that
// per-window. This is the process-wide net for any `webContents` we did not create —
// a devtools extension, a future `WebContentsView` in the browser panel.
app.on("web-contents-created", (_event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) void shell.openExternal(url);
    return { action: "deny" };
  });
});
