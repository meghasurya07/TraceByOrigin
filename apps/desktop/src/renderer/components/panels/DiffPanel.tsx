/**
 * Diff.
 *
 * Review, not staging. `git/status` and `git/diff` are the only git methods the protocol
 * has, and that is deliberate: the engine never touches the user's index. So this panel
 * answers "what did it change" and stops — committing stays in the user's own terminal
 * until the PR panel exists to do it properly.
 *
 * The file list stays on screen while a diff is open, capped to a fixed height. Reviewing
 * is moving between files, and a panel that demanded a Back press between each one would
 * turn a ten-file review into forty clicks.
 *
 * A path appears twice when it has both staged and unstaged changes. That is not a bug in
 * the list — it is what git means — so the two rows are separate, and each fetches its own
 * diff.
 *
 * Copyright (c) 2026 Origin AI
 */

import { useEffect, useMemo, useState } from "react";
import { GitBranch, GitCompare, TriangleAlert } from "lucide-react";

import type { GitFileStatus, GitStatusResult } from "@trace/protocol";

import { bridge } from "../../lib/bridge";
import { cn } from "../../lib/cn";
import { baseName, formatDiffStat, shortenPath } from "../../lib/format";
import { useStore } from "../../store";
import { DiffView, diffStats, parseDiff } from "../transcript/DiffView";
import { PanelBar, PanelBody, PanelMessage, RefreshButton, messageOf } from "./shell";

/** A row's identity: the path alone is not unique across the staged/unstaged split. */
interface Selection {
  path: string;
  staged: boolean;
}

/**
 * The porcelain letters, kept rather than translated to icons.
 *
 * Anyone who reads a diff panel already reads `M` and `D` in their terminal, and a letter
 * costs one glyph where an icon costs twelve pixels of a 400px-wide row.
 */
const STATUS: Readonly<
  Record<GitFileStatus["status"], { letter: string; tint: string; label: string }>
> = {
  added: { letter: "A", tint: "text-success", label: "Added" },
  modified: { letter: "M", tint: "text-warning", label: "Modified" },
  deleted: { letter: "D", tint: "text-danger", label: "Deleted" },
  renamed: { letter: "R", tint: "text-accent-fg", label: "Renamed" },
  untracked: { letter: "?", tint: "text-success", label: "Untracked" },
  conflicted: { letter: "!", tint: "text-danger", label: "Conflicted" },
};

export function DiffPanel(props: { openRef: string | undefined }): React.JSX.Element {
  const workspaces = useStore((state) => state.workspaces);
  const activeWorkspaceId = useStore((state) => state.activeWorkspaceId);
  const workspace = workspaces.find((entry) => entry.id === activeWorkspaceId);
  const workspaceId = workspace?.id;
  const isRepo = workspace?.isGitRepo === true;

  const [status, setStatus] = useState<GitStatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [nonce, setNonce] = useState(0);

  // Tagged with the workspace, so a selection made in one folder cannot survive a switch
  // into another that happens to have a file by the same name.
  const [picked, setPicked] = useState<{ workspaceId: string; selection: Selection } | null>(null);
  const selection = picked !== null && picked.workspaceId === workspaceId ? picked.selection : null;
  const pickedPath = selection?.path;
  const pickedStaged = selection?.staged ?? false;

  const [diff, setDiff] = useState<string | null>(null);
  const [diffError, setDiffError] = useState<string | null>(null);

  useEffect(() => {
    if (workspaceId === undefined || !isRepo) {
      setStatus(null);
      setError(null);
      return;
    }
    let live = true;
    setBusy(true);
    void bridge.request("git/status", { workspaceId }).then(
      (next) => {
        if (!live) return;
        setStatus(next);
        setError(null);
        setBusy(false);
      },
      (cause: unknown) => {
        if (!live) return;
        setStatus(null);
        setError(messageOf(cause));
        setBusy(false);
      },
    );
    return () => {
      live = false;
    };
  }, [workspaceId, isRepo, nonce]);

  useEffect(() => {
    if (workspaceId === undefined || pickedPath === undefined) {
      setDiff(null);
      setDiffError(null);
      return;
    }
    let live = true;
    void bridge.request("git/diff", { workspaceId, path: pickedPath, staged: pickedStaged }).then(
      (result) => {
        if (!live) return;
        setDiff(result.diff);
        setDiffError(null);
      },
      (cause: unknown) => {
        if (!live) return;
        setDiff(null);
        setDiffError(messageOf(cause));
      },
    );
    return () => {
      live = false;
    };
  }, [workspaceId, pickedPath, pickedStaged, nonce]);

  // Memoised because `DiffView` parses the same string for itself: without this, every
  // unrelated re-render of the panel would walk a 5,000-line diff twice.
  const stats = useMemo(() => diffStats(parseDiff(diff ?? "")), [diff]);

  // A ref names a path and nothing else, and may be absolute while git speaks in
  // workspace-relative POSIX. Match on the tail, and prefer the unstaged copy: that is the
  // one the agent just wrote, and the one the user was shown a moment ago in the
  // transcript.
  useEffect(() => {
    const ref = props.openRef;
    if (ref === undefined || workspaceId === undefined || status === null) return;
    const wanted = ref.replace(/\\/g, "/");
    const hit =
      status.files.find((file) => !file.staged && sameFile(file.path, wanted)) ??
      status.files.find((file) => sameFile(file.path, wanted));
    if (hit === undefined) return;
    setPicked({ workspaceId, selection: { path: hit.path, staged: hit.staged } });
  }, [props.openRef, workspaceId, status]);

  if (workspace === undefined) {
    return (
      <PanelMessage
        Icon={GitCompare}
        title="No folder is open"
        detail="Open a folder (⌘O) to review its changes."
      />
    );
  }
  if (!isRepo) {
    return (
      <PanelMessage
        Icon={GitCompare}
        title="Not a git repository"
        detail={`${workspace.name} has no git history, so there is nothing to compare against.`}
      />
    );
  }

  const refresh = (): void => {
    setNonce((value) => value + 1);
  };
  const staged = status?.files.filter((file) => file.staged) ?? [];
  const unstaged = status?.files.filter((file) => !file.staged) ?? [];

  return (
    <div className="flex h-full flex-col">
      <PanelBar>
        <GitBranch size={11} className="shrink-0 text-fg-subtle" />
        <span className="min-w-0 flex-1 truncate text-2xs text-fg-muted">
          {status?.branch ?? workspace.currentBranch ?? "…"}
        </span>
        {status !== null && (status.ahead > 0 || status.behind > 0) ? (
          <span
            className="shrink-0 font-mono text-2xs text-fg-subtle"
            title={`${String(status.ahead)} ahead, ${String(status.behind)} behind the upstream branch`}
          >
            {`↑${String(status.ahead)} ↓${String(status.behind)}`}
          </span>
        ) : null}
        <RefreshButton busy={busy} onClick={refresh} />
      </PanelBar>

      {status?.operationInProgress === true ? (
        <div className="flex shrink-0 items-center gap-1.5 border-b border-line bg-warning-muted px-2 py-1">
          <TriangleAlert size={11} className="shrink-0 text-warning" />
          <span className="text-2xs text-fg-muted">
            A merge, rebase, or cherry-pick is half-finished in this repository.
          </span>
        </div>
      ) : null}

      {error !== null ? (
        <PanelMessage Icon={TriangleAlert} title="Could not read the repository" detail={error} />
      ) : status === null ? (
        <PanelMessage title="Reading the repository…" />
      ) : status.files.length === 0 ? (
        <PanelMessage
          Icon={GitCompare}
          title="No changes"
          detail="The work tree matches the index and HEAD."
        />
      ) : (
        <>
          <div
            className={cn(
              "shrink-0 overflow-auto border-b border-line py-1",
              selection === null ? "max-h-none flex-1" : "max-h-48",
            )}
          >
            {staged.length === 0 ? null : (
              <Section
                title="Staged"
                files={staged}
                selection={selection}
                onPick={(next) => {
                  if (workspaceId !== undefined) setPicked({ workspaceId, selection: next });
                }}
              />
            )}
            {unstaged.length === 0 ? null : (
              <Section
                title={staged.length === 0 ? "Changes" : "Not staged"}
                files={unstaged}
                selection={selection}
                onPick={(next) => {
                  if (workspaceId !== undefined) setPicked({ workspaceId, selection: next });
                }}
              />
            )}
          </div>

          {selection === null ? null : diffError !== null ? (
            <PanelMessage
              Icon={TriangleAlert}
              title="Could not diff that file"
              detail={diffError}
            />
          ) : diff === null ? (
            <PanelMessage title="Reading the diff…" />
          ) : diff.trim() === "" ? (
            <PanelMessage
              Icon={GitCompare}
              title="Nothing to show"
              detail={`git reports no textual change for ${baseName(selection.path)}. A mode change or a binary file will look like this.`}
            />
          ) : (
            <>
              <div className="flex h-6 shrink-0 items-center gap-2 border-b border-line bg-surface-raised px-2">
                <span
                  className="min-w-0 flex-1 truncate font-mono text-2xs text-fg-subtle"
                  title={selection.path}
                >
                  {shortenPath(selection.path, 3)}
                </span>
                <span className="shrink-0 font-mono text-2xs text-fg-subtle">
                  {formatDiffStat(stats.added, stats.removed)}
                </span>
              </div>
              <PanelBody>
                <DiffView diff={diff} maxRows={1_500} />
              </PanelBody>
            </>
          )}
        </>
      )}
    </div>
  );
}

/** Whether a ref, possibly absolute, names this workspace-relative path. */
function sameFile(relative: string, ref: string): boolean {
  return ref === relative || ref.endsWith(`/${relative}`);
}

function Section(props: {
  title: string;
  files: readonly GitFileStatus[];
  selection: Selection | null;
  onPick: (selection: Selection) => void;
}): React.JSX.Element {
  return (
    <>
      <p className="px-2 pt-1.5 pb-0.5 text-2xs font-medium text-fg-subtle">{props.title}</p>
      {props.files.map((file) => (
        <FileRow
          key={`${file.path}:${String(file.staged)}`}
          file={file}
          active={
            props.selection !== null &&
            props.selection.path === file.path &&
            props.selection.staged === file.staged
          }
          onPick={() => {
            props.onPick({ path: file.path, staged: file.staged });
          }}
        />
      ))}
    </>
  );
}

/**
 * One changed file.
 *
 * Name first, then the directory in a dimmer colour — a list of `src/components/…` paths
 * sorted by directory buries the one word the reader is looking for.
 */
function FileRow(props: {
  file: GitFileStatus;
  active: boolean;
  onPick: () => void;
}): React.JSX.Element {
  const meta = STATUS[props.file.status];
  const name = baseName(props.file.path);
  const dir = props.file.path.slice(0, Math.max(0, props.file.path.length - name.length - 1));

  return (
    <button
      type="button"
      onClick={props.onPick}
      title={`${meta.label} · ${props.file.path}`}
      className={cn(
        "flex w-full items-center gap-1.5 px-2 py-1 text-left text-xs transition-colors",
        props.active
          ? "bg-surface-active text-fg"
          : "text-fg-muted hover:bg-surface-hover hover:text-fg",
      )}
    >
      <span className={cn("w-2.5 shrink-0 text-center font-mono text-2xs", meta.tint)}>
        {meta.letter}
      </span>
      <span className="min-w-0 truncate">{name}</span>
      {dir === "" ? null : (
        <span className="min-w-0 flex-1 truncate text-2xs text-fg-subtle">
          {shortenPath(dir, 2)}
        </span>
      )}
    </button>
  );
}
