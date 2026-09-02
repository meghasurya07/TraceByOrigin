/**
 * The application menu.
 *
 * Every item that acts on the app sends a `UiCommand` rather than doing the work here.
 * Main has no idea what a session is; the renderer holds all of that. The menu's job
 * is to own the accelerators — which it must, because a `⌘N` typed while the prompt bar
 * has focus should still create a session, and only a native menu accelerator reliably
 * fires before the focused text field sees the keystroke.
 *
 * The two exceptions are the platform items Electron already implements correctly —
 * clipboard roles, window roles, the macOS app menu — which are left as `role` entries.
 * Reimplementing Cut/Copy/Paste over IPC would break `document.execCommand` semantics
 * in text fields for no gain.
 *
 * Copyright (c) 2026 Origin AI
 */

import { Menu, app, shell, type BrowserWindow, type MenuItemConstructorOptions } from "electron";

import { IPC, type UiCommand } from "../shared/ipc.js";

const isMac = process.platform === "darwin";

export interface MenuOptions {
  /** Resolves the window a command should go to. Null when every window is closed. */
  targetWindow: () => BrowserWindow | null;
  onOpenFolder: () => void;
  onSignIn: () => void;
  docsUrl: string;
  issuesUrl: string;
}

export function installApplicationMenu(options: MenuOptions): void {
  const send = (command: UiCommand): void => {
    const window = options.targetWindow();
    if (window === null || window.isDestroyed()) return;
    window.webContents.send(IPC.uiCommand, command);
  };

  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" as const },
              { type: "separator" as const },
              {
                label: "Settings…",
                accelerator: "Command+,",
                click: () => send({ kind: "open_settings" }),
              },
              {
                label: "Sign In…",
                click: options.onSignIn,
              },
              { type: "separator" as const },
              { role: "services" as const },
              { type: "separator" as const },
              { role: "hide" as const },
              { role: "hideOthers" as const },
              { role: "unhide" as const },
              { type: "separator" as const },
              { role: "quit" as const },
            ],
          },
        ]
      : []),

    {
      label: "&File",
      submenu: [
        {
          label: "New Session",
          accelerator: "CmdOrCtrl+N",
          click: () => send({ kind: "new_session" }),
        },
        {
          // A second agent on the same workspace, for the "ask about this while the
          // first one works" case. Cursor calls these tabs; we keep the chat singular
          // and let side chats be transient.
          label: "New Side Chat",
          accelerator: "CmdOrCtrl+Shift+N",
          click: () => send({ kind: "new_side_chat" }),
        },
        { type: "separator" },
        {
          label: "Open Folder…",
          accelerator: "CmdOrCtrl+O",
          click: options.onOpenFolder,
        },
        { type: "separator" },
        {
          label: "Find Session…",
          accelerator: "CmdOrCtrl+P",
          click: () => send({ kind: "open_session_search" }),
        },
        ...(isMac
          ? [{ role: "close" as const }]
          : [
              {
                label: "Settings…",
                accelerator: "Ctrl+,",
                click: () => send({ kind: "open_settings" }),
              },
              { type: "separator" as const },
              { role: "quit" as const },
            ]),
      ],
    },

    {
      label: "&Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        ...(isMac
          ? [
              { role: "pasteAndMatchStyle" as const },
              { role: "delete" as const },
              { role: "selectAll" as const },
            ]
          : [
              { role: "delete" as const },
              { type: "separator" as const },
              { role: "selectAll" as const },
            ]),
      ],
    },

    {
      label: "&View",
      submenu: [
        {
          label: "Toggle Sidebar",
          accelerator: "CmdOrCtrl+B",
          click: () => send({ kind: "toggle_sidebar" }),
        },
        {
          // The single most-used shortcut in the app: it is what makes the work panel
          // "summonable" rather than a second pane you have to live with.
          label: "Toggle Work Panel",
          accelerator: "CmdOrCtrl+Shift+M",
          click: () => send({ kind: "toggle_work_panel" }),
        },
        {
          label: "Work Panel",
          submenu: [
            { label: "Files", accelerator: "CmdOrCtrl+1", target: "files" },
            { label: "Diff", accelerator: "CmdOrCtrl+2", target: "diff" },
            { label: "Canvas", accelerator: "CmdOrCtrl+3", target: "canvas" },
            { label: "Pull Request", accelerator: "CmdOrCtrl+4", target: "pr" },
            { label: "Browser", accelerator: "CmdOrCtrl+5", target: "browser" },
            { label: "Terminal", accelerator: "CmdOrCtrl+6", target: "terminal" },
          ].map(({ label, accelerator, target }): MenuItemConstructorOptions => ({
            label,
            accelerator,
            click: () =>
              send({
                kind: "open_work_panel",
                target: target as "files" | "diff" | "canvas" | "pr" | "browser" | "terminal",
              }),
          })),
        },
        { type: "separator" },
        {
          label: "Focus Prompt",
          accelerator: "CmdOrCtrl+L",
          click: () => send({ kind: "focus_prompt" }),
        },
        {
          label: "Interrupt Turn",
          accelerator: "CmdOrCtrl+Escape",
          click: () => send({ kind: "interrupt_turn" }),
        },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
        // Reload and DevTools stay available in packaged builds on purpose: the fastest
        // way out of a wedged renderer is a reload, and a bug report with a console log
        // attached is worth more than the hypothetical harm of an open inspector.
        { role: "reload" },
        { role: "toggleDevTools" },
      ],
    },

    {
      label: "&Window",
      submenu: isMac
        ? [
            { role: "minimize" },
            { role: "zoom" },
            { type: "separator" },
            { role: "front" },
            { type: "separator" },
            { role: "window" },
          ]
        : [{ role: "minimize" }, { role: "zoom" }, { type: "separator" }, { role: "close" }],
    },

    {
      role: "help",
      submenu: [
        {
          label: "Documentation",
          click: () => {
            void shell.openExternal(options.docsUrl);
          },
        },
        {
          label: "Report an Issue",
          click: () => {
            void shell.openExternal(options.issuesUrl);
          },
        },
        { type: "separator" },
        {
          label: "Settings…",
          click: () => send({ kind: "open_settings" }),
        },
        ...(isMac ? [] : [{ role: "about" as const }]),
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
