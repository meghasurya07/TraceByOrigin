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

import type { WorkPanelTarget } from "@trace/protocol";

import { IPC, type UiCommand } from "../shared/ipc.js";

const isMac = process.platform === "darwin";

/**
 * The work panel's targets, in the order they appear in the panel's tab strip.
 *
 * Typed as `WorkPanelTarget` rather than as strings, so adding a target to the protocol and
 * forgetting it here is the only kind of mistake left: a wrong name will not compile.
 */
const WORK_PANELS: readonly { label: string; target: WorkPanelTarget }[] = [
  { label: "Files", target: "files" },
  { label: "Review", target: "review" },
  { label: "Diff", target: "diff" },
  { label: "Terminal", target: "terminal" },
  { label: "Browser", target: "browser" },
  { label: "Canvas", target: "canvas" },
  { label: "Pull Request", target: "pr" },
];

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
          // The accelerator is the position, computed rather than written down, so the
          // numbering cannot drift from the order. This list must stay in the same order as
          // `WorkPanel.tsx`'s `TABS`: the number a user presses should match what they see
          // left to right, and nothing but agreement between these two makes that true.
          submenu: WORK_PANELS.map(({ label, target }, index): MenuItemConstructorOptions => ({
            label,
            accelerator: `CmdOrCtrl+${String(index + 1)}`,
            click: () => send({ kind: "open_work_panel", target }),
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
