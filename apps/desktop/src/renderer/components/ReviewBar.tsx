/**
 * The row that says the agent changed something.
 *
 * The Review panel can already do everything this bar can, which is exactly why the bar
 * exists: a panel behind a tab behind `⌘⇧M` is a feature only the person who built it knows
 * about. The end of a turn is when "do I keep this?" is a live question, so the answer gets a
 * row directly between the transcript and the prompt — the one place in this layout a user
 * on their way to typing the next message cannot miss.
 *
 * It offers the cheap verb and defers the expensive one. **Keep all** is bookkeeping: it
 * moves a baseline pointer and touches nothing on disk, so it is safe one click from the
 * prompt bar. Undo writes to the work tree, so it stays in the panel, where the diff being
 * thrown away is on screen beside the button and where the two-click confirmation lives.
 *
 * Copyright (c) 2026 Origin AI
 */

import { Check, ListChecks } from "lucide-react";

import { formatReviewStat } from "../lib/format";
import { useStore } from "../store";

export function ReviewBar(): React.JSX.Element | null {
  const files = useStore((state) => state.review.files);
  const listedFor = useStore((state) => state.review.sessionId);
  const truncated = useStore((state) => state.review.truncated);
  const busy = useStore((state) => state.review.busy.length > 0);
  const sessionId = useStore((state) => state.activeSessionId);
  const panelOpen = useStore((state) => state.workPanel.open);
  const panelTarget = useStore((state) => state.workPanel.target);
  const openWorkPanel = useStore((state) => state.openWorkPanel);
  const acceptReview = useStore((state) => state.acceptReview);

  if (files.length === 0) return null;

  // `review.sessionId` describes the list, not the selection. The two differ for the moment
  // between switching sessions and the next listing landing, and a count belonging to the
  // session the user just left is worse than no count at all.
  if (listedFor !== sessionId) return null;

  // Redundant once the panel is showing the same thing. The identical three numbers stated
  // twice, a few inches apart, reads as two different measurements.
  if (panelOpen && panelTarget === "review") return null;

  const count = files.length;

  return (
    <div className="flex shrink-0 items-center gap-2 border-t border-line bg-surface-raised px-3 py-1.5 text-2xs">
      <ListChecks size={12} className="shrink-0 text-accent" />

      <span className="min-w-0 flex-1 truncate text-fg-muted">
        <span className="font-medium text-fg">
          {String(count)} file{count === 1 ? "" : "s"}
        </span>{" "}
        changed · {formatReviewStat(files)}
        {truncated ? " · more not shown" : ""}
      </span>

      <button
        type="button"
        disabled={busy}
        title="Stop asking about these files. Nothing on disk changes."
        onClick={() => {
          void acceptReview();
        }}
        className="flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg disabled:opacity-40"
      >
        <Check size={11} />
        Keep all
      </button>

      <button
        type="button"
        title="Open the review panel (⌘2)"
        onClick={() => {
          openWorkPanel("review");
        }}
        className="shrink-0 rounded border border-line-strong bg-surface px-2 py-0.5 font-medium text-fg transition-colors hover:border-accent hover:bg-surface-hover"
      >
        Review
      </button>
    </div>
  );
}
