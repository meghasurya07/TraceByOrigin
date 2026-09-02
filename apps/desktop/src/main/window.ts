/**
 * The window.
 *
 * Frameless, because the title bar is part of the product: Trace puts the workspace
 * picker, the session name, and the work-panel toggle where the OS chrome would be.
 * That means we own the traffic lights on macOS (`titleBarStyle: "hidden"` keeps the
 * real ones and just removes the bar) and draw our own on Windows and Linux, which is
 * why `windowState` is pushed to the renderer at all — a custom maximize button has to
 * know whether it is currently a maximize or a restore.
 *
 * Everything here that touches the filesystem goes through `StateStore`. Nothing here
 * knows about the engine.
 *
 * Copyright (c) 2026 Origin AI
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { BrowserWindow, shell, type BrowserWindowConstructorOptions } from "electron";

import { IPC, type WindowStatePayload } from "../shared/ipc.js";
import type { StateStore } from "./state.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Below this the layout has nothing left to give — the prompt bar stops being usable
 * and the work panel cannot be opened at all.
 */
const MIN_WIDTH = 720;
const MIN_HEIGHT = 480;

/** Matches the renderer's `--color-surface`. Prevents a white flash before first paint. */
const BACKGROUND = "#0c0c0b";

export interface WindowHostOptions {
  state: StateStore;
  /** Dev-server URL from electron-vite, absent in a packaged build. */
  rendererUrl: string | undefined;
  onLog?: (line: string) => void;
}

export function createWindow(options: WindowHostOptions): BrowserWindow {
  const persisted = options.state.get();

  const config: BrowserWindowConstructorOptions = {
    ...persisted.bounds,
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    backgroundColor: BACKGROUND,
    // Held back until the renderer says it has painted. An Electron window shown at
    // construction time is visibly empty for a few hundred milliseconds, and that
    // flash is most of the difference between an app that feels native and one that
    // feels like a web page in a frame.
    show: false,
    frame: false,
    ...(process.platform === "darwin"
      ? { titleBarStyle: "hidden" as const, trafficLightPosition: { x: 16, y: 14 } }
      : {}),
    webPreferences: {
      preload: path.join(dirname, "../preload/index.cjs"),
      // The three that matter, spelled out rather than left to defaults, because a
      // future Electron changing a default silently is not a risk worth taking.
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // Our own bundle over `file://` needs no web security relaxations.
      webviewTag: false,
      spellcheck: true,
    },
  };

  const window = new BrowserWindow(config);
  if (persisted.maximized) window.maximize();

  attachStatePersistence(window, options.state);
  attachStatePush(window);
  attachNavigationGuards(window, options.onLog);

  window.once("ready-to-show", () => {
    window.show();
  });

  if (options.rendererUrl !== undefined) {
    void window.loadURL(options.rendererUrl);
  } else {
    void window.loadFile(path.join(dirname, "../renderer/index.html"));
  }

  return window;
}

/**
 * Persist bounds, but only the unmaximized ones.
 *
 * `getBounds()` on a maximized window returns the screen, so saving it means the next
 * launch opens a window that fills the display and cannot be un-maximized back to
 * anything sensible. `getNormalBounds()` is the restore rectangle, which is what the
 * user actually chose.
 */
function attachStatePersistence(window: BrowserWindow, state: StateStore): void {
  const save = (): void => {
    if (window.isDestroyed()) return;
    const maximized = window.isMaximized();
    state.update({
      maximized,
      ...(maximized || window.isMinimized() || window.isFullScreen()
        ? {}
        : { bounds: window.getNormalBounds() }),
    });
  };

  // `update` debounces, so a drag firing sixty times a second still writes once.
  window.on("resize", save);
  window.on("move", save);
  window.on("maximize", save);
  window.on("unmaximize", save);
  window.on("close", save);
}

function attachStatePush(window: BrowserWindow): void {
  const push = (): void => {
    if (window.isDestroyed() || window.webContents.isDestroyed()) return;
    const payload: WindowStatePayload = {
      maximized: window.isMaximized(),
      fullScreen: window.isFullScreen(),
      focused: window.isFocused(),
    };
    window.webContents.send(IPC.windowState, payload);
  };

  // Listed individually rather than looped: Electron's `on` overloads are keyed on the
  // literal event name, and a union of names matches none of them.
  window.on("maximize", push);
  window.on("unmaximize", push);
  window.on("enter-full-screen", push);
  window.on("leave-full-screen", push);
  window.on("focus", push);
  window.on("blur", push);

  // Also on load, so a reloaded renderer does not start out with a stale button.
  window.webContents.on("did-finish-load", push);
}

/**
 * The renderer never navigates and never opens a window.
 *
 * Every link in the transcript is model-generated or comes from a repository, so
 * "click a link, replace the app with a web page" is a real failure mode, not a
 * theoretical one. External links go to the system browser; nothing else happens.
 */
function attachNavigationGuards(window: BrowserWindow, onLog?: (line: string) => void): void {
  const isSafeExternal = (url: string): boolean => {
    try {
      const protocol = new URL(url).protocol;
      return protocol === "https:" || protocol === "http:";
    } catch {
      return false;
    }
  };

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (isSafeExternal(url)) void shell.openExternal(url);
    else onLog?.(`[window] refused to open ${url}`);
    return { action: "deny" };
  });

  window.webContents.on("will-navigate", (event, url) => {
    // The dev server's own HMR navigations are same-origin and must be allowed.
    if (url === window.webContents.getURL()) return;
    event.preventDefault();
    if (isSafeExternal(url)) void shell.openExternal(url);
    else onLog?.(`[window] blocked navigation to ${url}`);
  });

  window.webContents.on("will-attach-webview", (event) => {
    event.preventDefault();
  });
}
