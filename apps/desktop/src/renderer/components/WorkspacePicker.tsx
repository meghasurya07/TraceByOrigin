/**
 * The workspace picker in the title bar.
 *
 * Trace supports the "No Repo" case — you can hold a conversation with no folder open
 * at all — so this has three states, not two: no workspace (an invitation), one
 * workspace (a label), and several (a switcher). The dropdown carries the per-workspace
 * actions too, because a workspace row is the only place "rebuild index" and "close"
 * have anywhere sensible to live.
 *
 * The index status is surfaced here rather than in the status bar because it is a
 * property *of a workspace*, and the moment there are two of them a single global
 * "indexing…" line stops meaning anything.
 *
 * Copyright (c) 2026 Origin AI
 */

import { Check, ChevronDown, FolderOpen, FolderPlus, RefreshCw, X } from "lucide-react";
import { DropdownMenu } from "radix-ui";

import { cn } from "../lib/cn";
import { baseName } from "../lib/format";
import { useStore } from "../store";

const MENU_SURFACE =
  "z-50 min-w-56 rounded-md border border-line-strong bg-surface-overlay p-1 shadow-xl shadow-black/40";
const MENU_ITEM =
  "flex cursor-default items-center gap-2 rounded px-2 py-1.5 text-xs outline-none select-none data-highlighted:bg-surface-hover";

export function WorkspacePicker(): React.JSX.Element {
  const workspaces = useStore((state) => state.workspaces);
  const activeWorkspaceId = useStore((state) => state.activeWorkspaceId);
  const indexing = useStore((state) => state.indexing);

  const openWorkspace = useStore((state) => state.openWorkspace);
  const closeWorkspace = useStore((state) => state.closeWorkspace);
  const reindexWorkspace = useStore((state) => state.reindexWorkspace);
  const selectWorkspace = useStore((state) => state.selectWorkspace);

  const active = workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? null;
  const progress = active === null ? undefined : indexing[active.id];

  if (workspaces.length === 0) {
    return (
      <button
        type="button"
        onClick={() => void openWorkspace()}
        className="app-no-drag flex h-7 shrink-0 items-center gap-1.5 rounded px-2 text-xs text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
      >
        <FolderPlus size={13} />
        Open folder
      </button>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          "app-no-drag flex h-7 max-w-56 shrink-0 items-center gap-1.5 rounded px-2 text-xs transition-colors",
          "text-fg-muted hover:bg-surface-hover hover:text-fg data-[state=open]:bg-surface-active data-[state=open]:text-fg",
        )}
        title={active?.root ?? "Workspaces"}
      >
        <FolderOpen size={13} className="shrink-0" />
        <span className="truncate">{active?.name ?? "Workspaces"}</span>
        {active?.currentBranch === undefined ? null : (
          <span className="shrink-0 font-mono text-2xs text-fg-subtle">{active.currentBranch}</span>
        )}
        <IndexDot
          status={active?.indexStatus ?? "absent"}
          busy={progress !== undefined && progress.phase !== "done"}
        />
        <ChevronDown size={12} className="shrink-0 text-fg-subtle" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" sideOffset={4} className={MENU_SURFACE}>
          {workspaces.map((workspace) => {
            const workspaceProgress = indexing[workspace.id];
            const busy = workspaceProgress !== undefined && workspaceProgress.phase !== "done";
            return (
              <DropdownMenu.Item
                key={workspace.id}
                className={cn(MENU_ITEM, "group")}
                onSelect={() => {
                  selectWorkspace(workspace.id);
                }}
              >
                <Check
                  size={12}
                  className={cn(
                    "shrink-0",
                    workspace.id === activeWorkspaceId ? "text-accent-fg" : "opacity-0",
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-fg">{workspace.name}</span>
                  <span className="block truncate font-mono text-2xs text-fg-subtle">
                    {busy && workspaceProgress !== undefined
                      ? `${workspaceProgress.phase} ${String(workspaceProgress.filesDone)}/${String(workspaceProgress.filesTotal)}`
                      : baseName(workspace.root)}
                  </span>
                </span>

                {/* Row actions. `onClick` stops propagation so pressing "close" does not
                    also select the workspace on its way out. */}
                <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-data-highlighted:opacity-100">
                  <RowAction
                    label="Rebuild index"
                    onClick={() => void reindexWorkspace(workspace.id)}
                  >
                    <RefreshCw size={11} className={busy ? "animate-spin" : undefined} />
                  </RowAction>
                  <RowAction
                    label="Close workspace"
                    onClick={() => void closeWorkspace(workspace.id)}
                  >
                    <X size={11} />
                  </RowAction>
                </span>
              </DropdownMenu.Item>
            );
          })}

          <DropdownMenu.Separator className="my-1 h-px bg-line" />

          <DropdownMenu.Item
            className={cn(MENU_ITEM, "text-fg-muted")}
            onSelect={() => void openWorkspace()}
          >
            <FolderPlus size={12} className="shrink-0" />
            Open folder…
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function RowAction(props: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <button
      type="button"
      title={props.label}
      aria-label={props.label}
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        props.onClick();
      }}
      className="flex size-5 items-center justify-center rounded text-fg-subtle hover:bg-surface-active hover:text-fg"
    >
      {props.children}
    </button>
  );
}

/**
 * Four pixels that say whether `codebase_search` will work.
 *
 * A dot rather than a word because it sits inside a 36px title bar next to a folder
 * name, and "stale" spelled out is wider than the name it qualifies. The tooltip does
 * the explaining.
 */
function IndexDot(props: {
  status: "absent" | "building" | "ready" | "stale" | "failed";
  busy: boolean;
}): React.JSX.Element | null {
  if (props.status === "ready" && !props.busy) return null;

  const { colour, title } = props.busy
    ? { colour: "bg-accent-fg animate-pulse", title: "Building the semantic index…" }
    : props.status === "building"
      ? { colour: "bg-accent-fg animate-pulse", title: "Building the semantic index…" }
      : props.status === "stale"
        ? {
            colour: "bg-warning",
            title: "The index is out of date — codebase search may miss recent edits.",
          }
        : props.status === "failed"
          ? {
              colour: "bg-danger",
              title: "The index failed to build. Codebase search is unavailable.",
            }
          : {
              colour: "bg-fg-subtle",
              title: "No semantic index yet. Codebase search is unavailable.",
            };

  return <span className={cn("size-1.5 shrink-0 rounded-full", colour)} title={title} />;
}
