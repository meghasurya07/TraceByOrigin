/**
 * Slash commands the surface performs itself.
 *
 * `commands/list` returns the other kind: markdown files whose body becomes a prompt. The
 * split follows capability rather than taste — `/model` does not send anything to a model,
 * it opens a dialog, and an engine that listed it would be advertising something it cannot
 * do, forcing every client to filter the list back down to what it recognises.
 *
 * Every entry here is a thin alias for a store action that already exists, which is the
 * constraint that keeps this file honest: a slash command is a second way to reach
 * something, never the only way. A command that needs behaviour of its own means that
 * behaviour belongs in the store, next to the menu item and the accelerator that will also
 * want it.
 *
 * A file-backed command **shadows** a builtin of the same name. The user wrote the file, so
 * they meant it; and every builtin is also reachable from the menu bar or a shortcut, while
 * a `/deploy` they authored is reachable only here.
 *
 * Copyright (c) 2026 Origin AI
 */

import type { WorkPanelTarget } from "@trace/protocol";

import type { SettingsSection } from "../../shared/ipc";

export interface BuiltinCommand {
  /** Without the leading slash, so it compares directly with `PromptCommand.name`. */
  name: string;
  description: string;
  run: () => void;
}

/**
 * The store actions the builtins stand for.
 *
 * Passed in rather than imported, so this stays a pure function of its dependencies and the
 * list is the same value in a test as it is in the prompt bar.
 */
export interface BuiltinCommandDeps {
  newSession: () => void;
  findSession: () => void;
  openWorkPanel: (target: WorkPanelTarget) => void;
  openSettings: (section?: SettingsSection) => void;
  openWorkspace: () => void;
  /**
   * Null when no folder is open.
   *
   * `/reindex` is then left out of the list rather than listed and inert — a command that
   * does nothing when chosen is indistinguishable from a broken one.
   */
  reindex: (() => void) | null;
}

/**
 * The builtins, in the order they should be offered.
 *
 * Authored order is meaningful: the menu keeps it for equally good matches, so this is the
 * list someone sees when they type `/` and nothing else. Sessions first, then the panels in
 * their `⌘1…⌘6` order, then settings, then the workspace.
 */
export function builtinCommands(deps: BuiltinCommandDeps): BuiltinCommand[] {
  const commands: BuiltinCommand[] = [
    { name: "new", description: "Start a new session", run: deps.newSession },
    { name: "sessions", description: "Find a session by title or content", run: deps.findSession },

    {
      name: "files",
      description: "Open the file tree",
      run: () => {
        deps.openWorkPanel("files");
      },
    },
    {
      name: "diff",
      description: "Review this session's changes",
      run: () => {
        deps.openWorkPanel("diff");
      },
    },
    {
      name: "canvas",
      description: "Open the canvas",
      run: () => {
        deps.openWorkPanel("canvas");
      },
    },
    {
      name: "pr",
      description: "Open the pull request panel",
      run: () => {
        deps.openWorkPanel("pr");
      },
    },
    {
      name: "browser",
      description: "Open the browser",
      run: () => {
        deps.openWorkPanel("browser");
      },
    },
    {
      name: "terminal",
      description: "Open a terminal",
      run: () => {
        deps.openWorkPanel("terminal");
      },
    },

    {
      name: "model",
      description: "Choose the model",
      run: () => {
        deps.openSettings("models");
      },
    },
    {
      name: "rules",
      description: "See the standing instructions in effect",
      run: () => {
        deps.openSettings("rules");
      },
    },
    {
      name: "permissions",
      description: "Change what the agent may do unasked",
      run: () => {
        deps.openSettings("permissions");
      },
    },
    {
      name: "settings",
      description: "Open settings",
      run: () => {
        deps.openSettings();
      },
    },
    { name: "open", description: "Open a folder", run: deps.openWorkspace },
  ];

  if (deps.reindex !== null) {
    commands.push({
      name: "reindex",
      description: "Rebuild this folder's index",
      run: deps.reindex,
    });
  }
  return commands;
}
