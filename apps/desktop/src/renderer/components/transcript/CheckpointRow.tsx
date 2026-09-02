/**
 * A checkpoint marker, and the way back to it.
 *
 * The engine snapshots the workspace before each turn's first mutation, so this row is
 * the "undo" a coding agent actually needs — not per-edit undo, which is the editor's
 * job, but "put the tree back the way it was before you started".
 *
 * Restore is two clicks, and the second one says what it will do. There is no
 * confirmation dialog: the row is small, the action is scoped to files the agent itself
 * wrote, and a modal for it would be the third dialog in a flow that is already about
 * regaining control. But it is emphatically not one click, because overwriting the
 * user's edits on a mis-click is not recoverable from inside this app.
 *
 * This calls `checkpoint/restore` through the bridge rather than a store action, because
 * the store holds no checkpoint state. It does re-read the review list afterwards: a
 * restore rewinds the work tree and drops the session's review baselines engine-side, so
 * every row in that panel is describing a file that no longer looks like that.
 *
 * Copyright (c) 2026 Origin AI
 */

import { memo, useEffect, useState } from "react";
import { RotateCcw, Undo2 } from "lucide-react";

import type { ItemOf } from "@trace/client";

import { bridge } from "../../lib/bridge";
import { useStore } from "../../store";
import { formatClock } from "../../lib/format";

type Phase = "idle" | "confirm" | "restoring";

export const CheckpointRow = memo(function CheckpointRow(props: {
  item: ItemOf<"checkpoint">;
}): React.JSX.Element {
  const { item } = props;
  const sessionId = useStore((state) => state.activeSessionId);
  const pushNotice = useStore((state) => state.pushNotice);
  const refreshReview = useStore((state) => state.refreshReview);
  const [phase, setPhase] = useState<Phase>("idle");

  // An armed confirmation disarms itself. A button that means something different from
  // what it meant when the user last looked at it is a trap.
  useEffect(() => {
    if (phase !== "confirm") return;
    const timer = setTimeout(() => {
      setPhase("idle");
    }, 4_000);
    return () => {
      clearTimeout(timer);
    };
  }, [phase]);

  const restore = (): void => {
    if (sessionId === null) return;
    setPhase("restoring");
    void bridge
      .request("checkpoint/restore", { sessionId, checkpointId: item.checkpointId })
      .then((result) => {
        const count = result.restoredFiles.length;
        pushNotice({
          level: "info",
          message:
            count === 0
              ? `Restored to “${item.label}” — nothing had changed since.`
              : `Restored ${String(count)} file${count === 1 ? "" : "s"} to “${item.label}”.`,
        });
        void refreshReview();
      })
      .catch((error: unknown) => {
        pushNotice({
          level: "error",
          message:
            error instanceof Error
              ? `Could not restore: ${error.message}`
              : "Could not restore this checkpoint.",
        });
      })
      .finally(() => {
        setPhase("idle");
      });
  };

  return (
    <div className="group my-1 flex items-center gap-2 py-0.5">
      <span className="h-px flex-1 bg-line/70" />
      <span className="flex shrink-0 items-center gap-1.5 text-2xs text-fg-subtle">
        <Undo2 size={9} />
        <span className="selectable max-w-64 truncate" title={formatClock(item.at)}>
          {item.label}
        </span>
      </span>

      {sessionId === null ? null : phase === "restoring" ? (
        <span className="shrink-0 text-2xs text-fg-subtle">Restoring…</span>
      ) : phase === "confirm" ? (
        <button
          type="button"
          onClick={restore}
          className="flex shrink-0 items-center gap-1 rounded border border-warning/50 bg-warning-muted/40 px-1.5 py-0.5 text-2xs font-medium text-fg transition-colors hover:bg-warning-muted/70"
        >
          <RotateCcw size={9} />
          Overwrite files with this snapshot
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setPhase("confirm");
          }}
          className="shrink-0 rounded px-1.5 py-0.5 text-2xs text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100 hover:text-fg-muted focus-visible:opacity-100"
        >
          Restore
        </button>
      )}

      <span className="h-px w-4 bg-line/70" />
    </div>
  );
});
