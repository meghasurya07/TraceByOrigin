/**
 * The `@`/`/` menu's state.
 *
 * One hook for both triggers, because they are the same interaction — a token being typed, a
 * ranked list under it, a key that commits it — and differ only in where the rows come from.
 * Keeping them together means ↑, ↓, Enter, Tab and Escape are implemented once instead of
 * twice with a subtle difference nobody notices until it is muscle memory.
 *
 * ## The two fetches differ, and that is not an inconsistency
 *
 * **Files** re-request on every keystroke, debounced, with a generation counter. Ranking is
 * the engine's job — it is the only side that knows the ignore rules — so there is no local
 * filtering to fall back on while a response is in flight, and responses that arrive after a
 * newer query has been typed are dropped rather than rendered. With a warm snapshot they
 * routinely come back out of order.
 *
 * **Commands** are fetched once per opening and filtered locally. The list is a few dozen
 * items, so a round trip per keystroke would buy nothing, and `commands/list` re-reads the
 * directory on every call precisely so that one fetch per open is already fresh.
 *
 * ## Dismissal has to be remembered
 *
 * Escape closes the menu without touching the text, so the menu cannot be a pure function of
 * the caret — it would reopen on the very next render. The dismissal is therefore remembered
 * against the token's start index: typing more of the same token keeps it closed, and
 * deleting the trigger character clears the memory so the next `@` opens normally.
 *
 * Copyright (c) 2026 Origin AI
 */

import { useEffect, useMemo, useRef, useState } from "react";

import type { Attachment, FileCandidate, PromptCommand, WorkspaceInfo } from "@trace/protocol";

import { bridge } from "../../lib/bridge";
import { builtinCommands, type BuiltinCommand } from "../../lib/builtin-commands";
import { detectTrigger, type Trigger, type TriggerKind } from "../../lib/trigger";
import { useStore } from "../../store";

/** Long enough that a fast typist makes one request, short enough to feel live. */
const DEBOUNCE_MS = 80;
/** More than fits on screen at once, so the list scrolls rather than lies. */
const FILE_LIMIT = 12;
const COMMAND_LIMIT = 12;

export type TriggerItem =
  | { kind: "file"; candidate: FileCandidate }
  | { kind: "command"; command: PromptCommand }
  | { kind: "builtin"; command: BuiltinCommand };

/**
 * What choosing a row does to the prompt.
 *
 * The menu decides and the prompt bar applies, because the bar owns the text, the staged
 * attachments and the textarea node whose caret has to be restored afterwards. Handing back
 * a description of the edit keeps all three in one place instead of reaching into two.
 */
export interface TriggerPick {
  /** The range being replaced. */
  trigger: Trigger;
  /** Replaces the trigger token. Empty removes it. */
  insertion: string;
  /**
   * Staged for the next turn, for `@` picks.
   *
   * Narrowed to the two path-carrying kinds rather than left as `Attachment`, so the prompt
   * bar can compare it against what is already staged without re-proving that a file
   * mention is not a pasted screenshot.
   */
  attachment?: Extract<Attachment, { type: "file" | "directory" }>;
  /** Performed after the edit lands, for builtins. */
  run?: () => void;
}

export interface TriggerMenuState {
  open: boolean;
  /** Null when closed. Drives the wording of the hint line. */
  kind: TriggerKind | null;
  items: readonly TriggerItem[];
  activeIndex: number;
  /** True while the first response for this token is outstanding. */
  loading: boolean;
  setActiveIndex: (index: number) => void;
  choose: (index: number) => void;
  dismiss: () => void;
  /** True when the menu consumed the key and the prompt bar must not act on it too. */
  handleKeyDown: (event: React.KeyboardEvent) => boolean;
}

export function useTriggerMenu(input: {
  text: string;
  caret: number;
  onPick: (pick: TriggerPick) => void;
}): TriggerMenuState {
  const workspaces = useStore((state) => state.workspaces);
  const activeWorkspaceId = useStore((state) => state.activeWorkspaceId);
  const createSession = useStore((state) => state.createSession);
  const setSearchOpen = useStore((state) => state.setSearchOpen);
  const openWorkPanel = useStore((state) => state.openWorkPanel);
  const openSettings = useStore((state) => state.openSettings);
  const openWorkspace = useStore((state) => state.openWorkspace);
  const reindexWorkspace = useStore((state) => state.reindexWorkspace);

  const trigger = useMemo(() => detectTrigger(input.text, input.caret), [input.text, input.caret]);
  /** Identity of the token, not of the query — typing inside it must not reopen it. */
  const token = trigger === null ? null : `${trigger.kind}:${String(trigger.start)}`;
  const kind = trigger?.kind ?? null;
  const query = trigger?.query ?? "";

  const [dismissed, setDismissed] = useState<string | null>(null);
  const [files, setFiles] = useState<readonly FileCandidate[]>([]);
  const [commands, setCommands] = useState<readonly PromptCommand[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const open = token !== null && token !== dismissed;

  // The token is gone, so an Escape aimed at it should not silence the next one.
  useEffect(() => {
    if (token === null) setDismissed(null);
  }, [token]);

  // A new token, or a new query within one, starts at the top. Without this, opening a
  // second `@` would land on whatever row the first one had been left on.
  useEffect(() => {
    setActiveIndex(0);
  }, [token, query]);

  const generation = useRef(0);
  useEffect(() => {
    if (!open || kind !== "file") return;
    const mine = ++generation.current;
    setLoading(true);

    const fire = (): void => {
      void bridge
        .request("search/files", { query, limit: FILE_LIMIT, includeDirectories: true })
        .then((result) => {
          if (generation.current !== mine) return;
          setFiles(result.candidates);
          setLoading(false);
        })
        .catch(() => {
          if (generation.current !== mine) return;
          setFiles([]);
          setLoading(false);
        });
    };

    // No debounce on the empty query: that list comes straight from the engine's snapshot,
    // and making the menu wait 80 ms to show anything at all is a visible stutter.
    if (query === "") {
      fire();
      return;
    }
    const timer = setTimeout(fire, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [open, kind, query]);

  // Once per opening, keyed on the token rather than the query. `commands/list` re-scans the
  // directory on every call, which is what makes one fetch per open the right amount.
  useEffect(() => {
    if (!open || kind !== "command") return;
    let live = true;
    setLoading(true);
    void bridge
      .request("commands/list", {})
      .then((result) => {
        if (!live) return;
        setCommands(result.commands);
        setLoading(false);
      })
      .catch(() => {
        if (!live) return;
        setCommands([]);
        setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [open, kind, token]);

  const builtins = useMemo(
    () =>
      builtinCommands({
        newSession: () => {
          void createSession();
        },
        findSession: () => {
          setSearchOpen(true);
        },
        openWorkPanel,
        openSettings,
        openWorkspace: () => {
          void openWorkspace();
        },
        reindex:
          activeWorkspaceId === null
            ? null
            : () => {
                void reindexWorkspace(activeWorkspaceId);
              },
      }),
    [
      activeWorkspaceId,
      createSession,
      openSettings,
      openWorkPanel,
      openWorkspace,
      reindexWorkspace,
      setSearchOpen,
    ],
  );

  const items = useMemo<readonly TriggerItem[]>(() => {
    if (!open || trigger === null) return [];
    if (trigger.kind === "file") {
      return files.map((candidate) => ({ kind: "file" as const, candidate }));
    }
    return commandItems(trigger.query, commands, builtins);
  }, [open, trigger, files, commands, builtins]);

  // Clamped rather than corrected in an effect: a response with fewer rows than the last one
  // would otherwise render a highlight on nothing for one frame.
  const active = items.length === 0 ? 0 : Math.min(activeIndex, items.length - 1);

  const choose = (index: number): void => {
    const item = items[index];
    if (item === undefined || trigger === null) return;
    // Closed on commit, and left closed while the user edits what was just inserted —
    // reopening over the text they are correcting is noise, and deleting the whole token
    // clears the memory anyway.
    setDismissed(token);
    input.onPick(pickFor(item, trigger, workspaces));
  };

  const handleKeyDown = (event: React.KeyboardEvent): boolean => {
    if (!open) return false;

    if (event.key === "Escape") {
      event.preventDefault();
      setDismissed(token);
      return true;
    }
    // With nothing to choose, every other key belongs to the prompt bar. Enter in
    // particular must still send.
    if (items.length === 0) return false;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((active + 1) % items.length);
      return true;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((active - 1 + items.length) % items.length);
      return true;
    }
    // Shift+Enter stays a newline even here: the menu is open because a token is being
    // typed, not because the user has stopped writing a paragraph.
    if ((event.key === "Enter" && !event.shiftKey) || event.key === "Tab") {
      if (event.nativeEvent.isComposing) return false;
      event.preventDefault();
      choose(active);
      return true;
    }
    return false;
  };

  return {
    open,
    kind: open ? kind : null,
    items,
    activeIndex: active,
    loading: loading && items.length === 0,
    setActiveIndex,
    choose,
    dismiss: () => {
      setDismissed(token);
    },
    handleKeyDown,
  };
}

/**
 * Turn a chosen row into an edit.
 *
 * The `@` token stays in the text *as well as* becoming an attachment. Stripping it — which
 * is what an inline-pill design does — turns "compare @a.ts with @b.ts" into "compare  with",
 * and the sentence was the point. The chip in the tray is the visible confirmation instead.
 */
function pickFor(
  item: TriggerItem,
  trigger: Trigger,
  workspaces: readonly WorkspaceInfo[],
): TriggerPick {
  if (item.kind === "file") {
    const { candidate } = item;
    return {
      trigger,
      insertion: `@${candidate.path} `,
      attachment: {
        type: candidate.kind === "directory" ? "directory" : "file",
        path: absolutePath(candidate, workspaces),
      },
    };
  }
  if (item.kind === "builtin") {
    // The token goes; the action is the whole content of the command.
    return { trigger, insertion: "", run: item.command.run };
  }
  const { command } = item;
  // A hint means the command expects an argument, so the caret is left past a space with the
  // body above it rather than making the user find the end of what was just inserted.
  return {
    trigger,
    insertion: command.argumentHint === undefined ? command.body : `${command.body} `,
  };
}

/**
 * Workspace-relative → absolute, so the engine cannot resolve it against the wrong root.
 *
 * `search/files` reports which workspace each hit came from, but an `Attachment` carries only
 * a path, and the engine's resolver tries a relative one against every open root and takes
 * the first that exists — for two checkouts of the same repo that is a coin flip. Posix
 * separators throughout: the engine calls `path.resolve`, to which `C:/x/y` is also absolute.
 */
function absolutePath(candidate: FileCandidate, workspaces: readonly WorkspaceInfo[]): string {
  const root = workspaces.find((workspace) => workspace.id === candidate.workspaceId)?.root;
  if (root === undefined) return candidate.path;
  return `${root.replace(/\\/g, "/").replace(/\/+$/, "")}/${candidate.path}`;
}

/**
 * Builtins and file-backed commands, ranked together.
 *
 * Prefix beats substring beats subsequence, and equal scores keep their authored order. A
 * twenty-item list does not need the engine's scorer, and predictability is worth more here
 * than cleverness: `/d` should always offer `/diff` first, whatever else it also matches.
 *
 * File-backed commands are listed before builtins and shadow them by name — they are the
 * thing that is specific to this repo, and the builtins are all reachable elsewhere.
 */
function commandItems(
  query: string,
  commands: readonly PromptCommand[],
  builtins: readonly BuiltinCommand[],
): TriggerItem[] {
  const shadowed = new Set(commands.map((command) => command.name.toLowerCase()));
  const rows: { item: TriggerItem; name: string }[] = [
    ...commands.map((command) => ({
      item: { kind: "command" as const, command },
      name: command.name.toLowerCase(),
    })),
    ...builtins
      .filter((command) => !shadowed.has(command.name))
      .map((command) => ({ item: { kind: "builtin" as const, command }, name: command.name })),
  ];

  const needle = query.toLowerCase();
  const scored: { item: TriggerItem; order: number; score: number }[] = [];
  rows.forEach((row, order) => {
    const score = rankName(needle, row.name);
    if (score !== null) scored.push({ item: row.item, order, score });
  });
  scored.sort((a, b) => (a.score === b.score ? a.order - b.order : b.score - a.score));

  return scored.slice(0, COMMAND_LIMIT).map((row) => row.item);
}

/** Both arguments lowercased by the caller. */
function rankName(needle: string, name: string): number | null {
  if (needle === "") return 0;
  if (name.startsWith(needle)) return 3;
  if (name.includes(needle)) return 2;
  return isSubsequence(needle, name) ? 1 : null;
}

function isSubsequence(needle: string, name: string): boolean {
  let at = 0;
  for (let index = 0; index < name.length && at < needle.length; index++) {
    if (name.charCodeAt(index) === needle.charCodeAt(at)) at++;
  }
  return at === needle.length;
}
