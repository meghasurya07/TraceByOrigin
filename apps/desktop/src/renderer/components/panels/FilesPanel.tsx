/**
 * Files.
 *
 * A browser, not an editor. Nothing here writes — `fs/write` exists in the protocol and is
 * deliberately not called: the agent edits files and the transcript shows the diff, and a
 * second, hand-editable copy of the file inside the chat window would immediately raise
 * the question of which one is authoritative when both change. Reading is a different
 * need, and this covers it: "what is actually in the file it just rewrote".
 *
 * One column, two modes. A directory listing, or a file. Panels are 400–600px wide and a
 * tree plus a preview side by side gives neither of them enough room, so opening a file
 * takes over the panel and the header keeps a way back.
 *
 * Copyright (c) 2026 Origin AI
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  CornerUpLeft,
  File as FileIcon,
  Folder,
  FolderOpen,
  House,
  Link,
  TriangleAlert,
} from "lucide-react";

import type { DirEntry } from "@trace/protocol";

import { bridge } from "../../lib/bridge";
import { cn } from "../../lib/cn";
import { langForPath } from "../../lib/highlight";
import { baseName, shortenPath } from "../../lib/format";
import { useStore } from "../../store";
import { CodeBlock } from "../transcript/CodeBlock";
import { PANEL_BUTTON, PanelBar, PanelBody, PanelMessage, RefreshButton, messageOf } from "./shell";

interface FileState {
  path: string;
  content: string;
  totalLines: number;
  truncated: boolean;
}

type View = { kind: "dir"; path: string; entries: DirEntry[] } | { kind: "file"; file: FileState };

/** What the panel has been pointed at. `"unknown"` is a ref from a notification. */
interface Target {
  path: string;
  kind: "directory" | "file" | "unknown";
}

/**
 * How much of a file is fetched before the user asks for the rest.
 *
 * `fs/read` returns whole files up to its own byte cap, and a 30,000-line one handed
 * straight to shiki would tokenise on the main thread and freeze the window. A bounded
 * range costs the engine nothing extra — it reads the file either way — and makes
 * `truncated` mean something the header can say out loud.
 */
const PREVIEW_LINES = 1_200;

/**
 * A symlink resolves to `"unknown"` on purpose: `DirEntry` describes the link, not its
 * target, so whether opening it means a listing or a read is not knowable from here.
 */
function kindOf(entry: DirEntry): Target["kind"] {
  if (entry.kind === "directory") return "directory";
  return entry.kind === "symlink" ? "unknown" : "file";
}

/** Directories first, then case-insensitively by name. Symlinks sort with files. */
function compare(a: DirEntry, b: DirEntry): number {
  const rank = (entry: DirEntry): number => (entry.kind === "directory" ? 0 : 1);
  return rank(a) - rank(b) || a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

async function listDir(path: string): Promise<View> {
  const { entries } = await bridge.request("fs/list", { path });
  return { kind: "dir", path, entries: [...entries].sort(compare) };
}

async function readFile(path: string, whole: boolean): Promise<View> {
  const read = await bridge.request("fs/read", {
    path,
    ...(whole ? {} : { startLine: 1, endLine: PREVIEW_LINES }),
  });
  return { kind: "file", file: { path, ...read } };
}

/**
 * Resolve a target into a view, in one round trip when the kind is known.
 *
 * `workPanel/open` carries a bare path and the protocol has no `fs/stat`, so an
 * unknown target has to be probed. `fs/read` goes first because a ref for this panel
 * is nearly always the file the agent just touched — the second call happens on the
 * rare directory ref, not on every file.
 */
async function fetchView(target: Target, whole = false): Promise<View> {
  if (target.kind === "directory") return listDir(target.path);
  if (target.kind === "file") return readFile(target.path, whole);
  try {
    return await readFile(target.path, whole);
  } catch {
    return listDir(target.path);
  }
}

/** The containing directory, or the path itself once there is nothing left to trim. */
function parentOf(path: string): string {
  const cut = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  return cut <= 0 ? path : path.slice(0, cut);
}

export function FilesPanel(props: { openRef: string | undefined }): React.JSX.Element {
  const workspaces = useStore((state) => state.workspaces);
  const activeWorkspaceId = useStore((state) => state.activeWorkspaceId);
  const workspace = workspaces.find((entry) => entry.id === activeWorkspaceId);
  const root = workspace?.root;

  // Where the user has navigated, tagged with the workspace it belongs to. Tagging is
  // what replaces a reset effect: a path from the previous workspace stops matching and
  // the derivation below falls back to the new root, with no ordering hazard against the
  // effect that consumes `openRef`.
  const [pointed, setPointed] = useState<{
    root: string;
    path: string;
    kind: Target["kind"];
  } | null>(null);
  const [view, setView] = useState<View | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [whole, setWhole] = useState(false);
  const [nonce, setNonce] = useState(0);
  const generation = useRef(0);

  const own = pointed !== null && pointed.root === root;
  const path = own ? pointed.path : root;
  const kind: Target["kind"] = own ? pointed.kind : "directory";

  const go = useCallback(
    (next: string, nextKind: Target["kind"]): void => {
      if (root === undefined) return;
      setWhole(false);
      setPointed({ root, path: next, kind: nextKind });
    },
    [root],
  );

  // Keyed on the ref itself, so re-opening the panel on a file it already shows does not
  // refetch, and a ref for a *different* file while one is open does.
  useEffect(() => {
    if (props.openRef === undefined || root === undefined) return;
    setWhole(false);
    setPointed({ root, path: props.openRef, kind: "unknown" });
  }, [props.openRef, root]);

  useEffect(() => {
    if (path === undefined) {
      setView(null);
      setError(null);
      return;
    }
    // A generation counter rather than an AbortController: an in-flight `fs/read` cannot
    // be cancelled, only ignored, and clicking down a tree faster than the engine
    // answers is normal.
    const seq = ++generation.current;
    setBusy(true);
    void fetchView({ path, kind }, whole).then(
      (next) => {
        if (generation.current !== seq) return;
        setView(next);
        setError(null);
        setBusy(false);
      },
      (cause: unknown) => {
        if (generation.current !== seq) return;
        setView(null);
        setError(messageOf(cause));
        setBusy(false);
      },
    );
  }, [path, kind, whole, nonce]);

  if (root === undefined || workspace === undefined) {
    return (
      <PanelMessage
        Icon={FolderOpen}
        title="No folder is open"
        detail="Open a folder (⌘O) and its contents show up here."
      />
    );
  }

  const refresh = (): void => {
    setNonce((value) => value + 1);
  };
  const here = path ?? root;
  const atRoot = here === root;
  const tail = here.startsWith(root)
    ? here.slice(root.length).replace(/^[\\/]+/, "")
    : shortenPath(here, 3);

  return (
    <div className="flex h-full flex-col">
      {view?.kind === "file" ? (
        <PanelBar>
          <button
            type="button"
            className={PANEL_BUTTON}
            title="Back to the folder"
            onClick={() => {
              go(parentOf(view.file.path), "directory");
            }}
          >
            <ChevronLeft size={11} />
            Back
          </button>
          <span className="min-w-0 flex-1 truncate text-2xs text-fg-muted" title={view.file.path}>
            {baseName(view.file.path)}
          </span>
          <button
            type="button"
            className={PANEL_BUTTON}
            title="Show in the file manager"
            onClick={() => {
              void bridge.revealPath(view.file.path);
            }}
          >
            <FolderOpen size={11} />
          </button>
          <RefreshButton busy={busy} onClick={refresh} />
        </PanelBar>
      ) : (
        <PanelBar>
          <button
            type="button"
            className={PANEL_BUTTON}
            title="Workspace root"
            disabled={atRoot}
            onClick={() => {
              go(root, "directory");
            }}
          >
            <House size={11} />
          </button>
          <button
            type="button"
            className={PANEL_BUTTON}
            title="Up one level"
            disabled={atRoot}
            onClick={() => {
              go(parentOf(here), "directory");
            }}
          >
            <CornerUpLeft size={11} />
          </button>
          <span className="min-w-0 flex-1 truncate text-2xs text-fg-muted" title={here}>
            {atRoot ? workspace.name : shortenPath(tail, 3)}
          </span>
          <RefreshButton busy={busy} onClick={refresh} />
        </PanelBar>
      )}

      {error !== null ? (
        <PanelMessage Icon={TriangleAlert} title="Could not open that" detail={error}>
          <button
            type="button"
            className={cn(PANEL_BUTTON, "mt-1")}
            onClick={() => {
              go(root, "directory");
            }}
          >
            <House size={11} />
            Back to the folder
          </button>
        </PanelMessage>
      ) : view === null ? (
        <PanelMessage title="Reading…" />
      ) : view.kind === "file" ? (
        <PanelBody className="px-2 pb-2">
          {view.file.truncated ? (
            <div className="mt-2 flex items-center gap-2 rounded border border-line bg-surface px-2 py-1.5">
              <span className="min-w-0 flex-1 text-2xs text-fg-subtle">
                {`Showing the first ${String(PREVIEW_LINES)} of ${String(view.file.totalLines)} lines.`}
              </span>
              <button
                type="button"
                className={PANEL_BUTTON}
                onClick={() => {
                  setWhole(true);
                }}
              >
                Load all
              </button>
            </div>
          ) : null}
          <CodeBlock
            code={view.file.content}
            lang={langForPath(view.file.path)}
            label={shortenPath(view.file.path, 3)}
          />
        </PanelBody>
      ) : view.entries.length === 0 ? (
        <PanelMessage Icon={Folder} title="This folder is empty" />
      ) : (
        <PanelBody className="py-1">
          {view.entries.map((entry) => (
            <EntryRow
              key={entry.path}
              entry={entry}
              onOpen={() => {
                go(entry.path, kindOf(entry));
              }}
            />
          ))}
        </PanelBody>
      )}
    </div>
  );
}

/**
 * One entry.
 *
 * Name only, no size column. `DirEntry` carries `sizeBytes` and it would be free to
 * render, but `fs/read` already reports sizes in its own refusals ("…is 42.1 MB, larger
 * than this method returns") and the two would have to agree byte-for-byte forever.
 */
function EntryRow(props: { entry: DirEntry; onOpen: () => void }): React.JSX.Element {
  const { entry } = props;
  const Icon = entry.kind === "directory" ? Folder : entry.kind === "symlink" ? Link : FileIcon;

  return (
    <button
      type="button"
      onClick={props.onOpen}
      title={entry.path}
      className="flex w-full items-center gap-1.5 px-2 py-1 text-left text-xs text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
    >
      <Icon
        size={12}
        className={cn("shrink-0", entry.kind === "directory" ? "text-accent-fg" : "text-fg-subtle")}
      />
      <span className="min-w-0 flex-1 truncate">{entry.name}</span>
    </button>
  );
}
