/**
 * Review: keeping or discarding the agent's work, one file or one hunk at a time.
 *
 * The panel next door — `DiffPanel` — asks "how does this tree differ from the user's
 * git?". This one asks "how does it differ from the last thing *you* approved in this
 * conversation?", which is a different question with a different answer, and the reason
 * they are two tabs rather than one with a mode switch. Nothing here touches the user's
 * index; the baselines are commits in Trace's shadow repo. See `engine/src/git/review.ts`.
 *
 * Two verbs, and they are not symmetrical. **Keep** is bookkeeping: it moves a pointer so
 * the file stops being asked about, and touches nothing on disk. **Undo** writes — it puts
 * the file, or a few of its lines, back the way the baseline has them. So Undo All is
 * armed before it fires, in the same two-click shape as a checkpoint restore, and per-file
 * Undo is not: one file is a bounded loss the user can see, and a confirmation on every
 * row would make the common case unusable.
 *
 * The store owns the data, not this component. A bar in the chat column needs the same
 * list to know whether to appear at all, and two fetchers would double the git work and
 * disagree with each other for as long as they were out of step.
 *
 * Copyright (c) 2026 Origin AI
 */

import { memo, useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronRight, FileDiff, RotateCcw, Undo2 } from "lucide-react";

import type { ReviewFile, ReviewHunk } from "@trace/protocol";

import { cn } from "../../lib/cn";
import { baseName, formatDiffStat, formatReviewStat, shortenPath } from "../../lib/format";
import { useStore } from "../../store";
import { DiffView } from "../transcript/DiffView";
import { PANEL_BUTTON, PanelBar, PanelBody, PanelMessage, RefreshButton } from "./shell";

/**
 * How many files may be expanded on arrival.
 *
 * Reading the diff is why anyone opens this panel, so the default is open — but a
 * two-hundred-file refactor expanded at once is tens of thousands of DOM rows and a panel
 * that will not scroll. Past the threshold everything starts collapsed and the header rows
 * are the summary.
 */
const AUTO_EXPAND_LIMIT = 8;

/** Rows per hunk before `DiffView` offers its own "show all". */
const HUNK_ROW_CAP = 120;

const STATUS: Readonly<Record<ReviewFile["status"], { letter: string; tint: string }>> = {
  added: { letter: "A", tint: "text-success" },
  modified: { letter: "M", tint: "text-warning" },
  deleted: { letter: "D", tint: "text-danger" },
};

const UNREVIEWABLE: Readonly<Record<"binary" | "too_large", string>> = {
  binary: "Binary file",
  too_large: "Too large to diff",
};

export function ReviewPanel(): React.JSX.Element {
  const review = useStore((state) => state.review);
  const sessionId = useStore((state) => state.activeSessionId);
  const refreshReview = useStore((state) => state.refreshReview);
  const acceptReview = useStore((state) => state.acceptReview);

  /**
   * Per-path expansion, holding only what the user has pressed.
   *
   * The default has to be derived from the list rather than seeded into this map: the list
   * changes under the panel every time a turn ends, and a map pre-filled with today's
   * paths would then be answering for a set of files that no longer matches.
   */
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const [armed, setArmed] = useState(false);

  // First open is the one time nothing has fetched yet. Everything after that arrives on
  // `turn_completed`, so this is not a poll.
  useEffect(() => {
    if (sessionId === null) return;
    if (review.sessionId === sessionId) return;
    void refreshReview();
  }, [sessionId, review.sessionId, refreshReview]);

  // An armed Undo All disarms itself, for the same reason a checkpoint's does: a button
  // that means something different from what it meant when the user last looked is a trap.
  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => {
      setArmed(false);
    }, 4_000);
    return () => {
      clearTimeout(timer);
    };
  }, [armed]);

  const totals = useMemo(() => formatReviewStat(review.files), [review.files]);

  const openByDefault = review.files.length <= AUTO_EXPAND_LIMIT;
  const anyBusy = review.busy.length > 0;
  const count = review.files.length;

  return (
    <>
      <PanelBar>
        <span className="min-w-0 flex-1 truncate px-1 text-2xs text-fg-subtle">
          {count === 0
            ? "Nothing to review"
            : `${String(count)} file${count === 1 ? "" : "s"} · ${totals}`}
          {review.truncated ? " · more not shown" : ""}
        </span>

        {count === 0 ? null : (
          <>
            <button
              type="button"
              className={PANEL_BUTTON}
              disabled={anyBusy}
              title="Stop asking about every file below. Nothing on disk changes."
              onClick={() => {
                void acceptReview();
              }}
            >
              <Check size={11} />
              Keep all
            </button>
            <UndoAllButton
              armed={armed}
              disabled={anyBusy}
              onArm={() => {
                setArmed(true);
              }}
              onFire={() => {
                setArmed(false);
              }}
            />
          </>
        )}

        <RefreshButton
          busy={review.loading}
          onClick={() => {
            void refreshReview();
          }}
        />
      </PanelBar>

      {review.error !== null ? (
        <PanelMessage Icon={FileDiff} title="Could not list the changes" detail={review.error} />
      ) : count === 0 ? (
        <PanelMessage
          Icon={FileDiff}
          title={review.loading ? "Looking…" : "Nothing to review"}
          detail={
            review.loading
              ? undefined
              : review.baselineId === null
                ? "Once the agent changes a file in this session, what it changed shows up here to keep or undo."
                : "Everything the agent has changed in this session has been kept."
          }
        />
      ) : (
        <PanelBody>
          {review.files.map((file) => (
            <FileRow
              key={file.path}
              file={file}
              busy={review.busy.includes(file.path)}
              open={toggled[file.path] ?? openByDefault}
              onToggle={() => {
                setToggled((current) => ({
                  ...current,
                  [file.path]: !(current[file.path] ?? openByDefault),
                }));
              }}
            />
          ))}
        </PanelBody>
      )}
    </>
  );
}

/**
 * Undo All, armed then fired.
 *
 * Its own component so the confirmation lives with the button rather than as a third
 * boolean in the panel's state, and so the disarm timer cannot outlive it.
 */
function UndoAllButton(props: {
  armed: boolean;
  disabled: boolean;
  onArm: () => void;
  onFire: () => void;
}): React.JSX.Element {
  const files = useStore((state) => state.review.files);
  const revertReview = useStore((state) => state.revertReview);

  if (!props.armed) {
    return (
      <button
        type="button"
        className={PANEL_BUTTON}
        disabled={props.disabled}
        title="Put every file below back the way it was before this session"
        onClick={props.onArm}
      >
        <Undo2 size={11} />
        Undo all
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={props.disabled}
      className="flex items-center gap-1 rounded border border-warning/50 bg-warning-muted/40 px-1.5 py-0.5 text-2xs font-medium text-fg transition-colors hover:bg-warning-muted/70 disabled:opacity-40"
      onClick={() => {
        props.onFire();
        // One request per file rather than a bulk method, because `review/revert` returns
        // the file's remaining state and a bulk call could only return "some of it worked".
        // Sequential: each one writes the work tree, and eight concurrent writers make a
        // failure halfway through impossible to describe.
        void (async () => {
          for (const file of files) await revertReview(file.path);
        })();
      }}
    >
      <RotateCcw size={11} />
      Discard {files.length} file{files.length === 1 ? "" : "s"}
    </button>
  );
}

const FileRow = memo(function FileRow(props: {
  file: ReviewFile;
  busy: boolean;
  open: boolean;
  onToggle: () => void;
}): React.JSX.Element {
  const { file } = props;
  const acceptReview = useStore((state) => state.acceptReview);
  const revertReview = useStore((state) => state.revertReview);
  const status = STATUS[file.status];
  const Chevron = props.open ? ChevronDown : ChevronRight;

  return (
    <div className="border-b border-line/60 last:border-b-0">
      <div
        className={cn(
          "group flex items-center gap-1.5 px-1.5 py-1",
          props.busy ? "opacity-50" : "hover:bg-surface-hover",
        )}
      >
        <button
          type="button"
          onClick={props.onToggle}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
          title={file.path}
        >
          <Chevron size={11} className="shrink-0 text-fg-subtle" />
          <span className={cn("w-2.5 shrink-0 text-center font-mono text-2xs", status.tint)}>
            {status.letter}
          </span>
          <span className="min-w-0 truncate text-2xs text-fg">{baseName(file.path)}</span>
          <span className="min-w-0 shrink truncate text-2xs text-fg-subtle">
            {shortenPath(dirOf(file.path), 2)}
          </span>
        </button>

        <span className="shrink-0 font-mono text-2xs text-fg-subtle">
          {file.unreviewable === null
            ? formatDiffStat(file.added, file.removed)
            : UNREVIEWABLE[file.unreviewable]}
        </span>

        {/* Always laid out, revealed on hover. Appearing on hover *and* taking space would
            shift the stat column sideways under the cursor. */}
        <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <button
            type="button"
            className={PANEL_BUTTON}
            disabled={props.busy}
            title="Keep this file"
            aria-label={`Keep ${file.path}`}
            onClick={() => {
              void acceptReview([file.path]);
            }}
          >
            <Check size={11} />
          </button>
          <button
            type="button"
            className={PANEL_BUTTON}
            disabled={props.busy}
            title="Undo this file"
            aria-label={`Undo ${file.path}`}
            onClick={() => {
              void revertReview(file.path);
            }}
          >
            <Undo2 size={11} />
          </button>
        </span>
      </div>

      {props.open && file.hunks.length > 0 ? (
        <div className="space-y-1 px-1.5 pb-1.5">
          {file.hunks.map((hunk) => (
            <HunkBlock
              key={`${String(hunk.index)}:${hunk.header}`}
              path={file.path}
              hunk={hunk}
              busy={props.busy}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
});

/**
 * One hunk, with the button that discards just it.
 *
 * The `@@` header goes through `DiffView` rather than being drawn here, because that is
 * where line numbers come from — a hunk starting at line 400 numbered from 1 is worse than
 * no numbers. The button floats over that row instead of taking one of its own.
 */
function HunkBlock(props: { path: string; hunk: ReviewHunk; busy: boolean }): React.JSX.Element {
  const revertReview = useStore((state) => state.revertReview);
  const { hunk } = props;
  const diff = useMemo(() => [hunk.header, ...hunk.lines].join("\n"), [hunk]);

  return (
    <div className="group/hunk relative">
      <DiffView diff={diff} maxRows={HUNK_ROW_CAP} />
      <button
        type="button"
        disabled={props.busy}
        className="absolute top-0 right-0 flex items-center gap-1 rounded-tr-md rounded-bl border-b border-l border-line bg-surface-raised px-1.5 py-0.5 text-2xs text-fg-subtle opacity-0 transition-opacity group-focus-within/hunk:opacity-100 group-hover/hunk:opacity-100 hover:text-fg disabled:opacity-40"
        title={`Undo these lines (${formatDiffStat(hunk.added, hunk.removed)})`}
        onClick={() => {
          // `header` goes back with the index. The engine recomputes the hunk at that index
          // and refuses if the header no longer matches, which is what stops a click on a
          // list that has moved from reverting whichever lines are now in that position.
          void revertReview(props.path, { index: hunk.index, header: hunk.header });
        }}
      >
        <Undo2 size={9} />
        Undo
      </button>
    </div>
  );
}

/** Everything but the filename, `""` for a file at the root. */
function dirOf(path: string): string {
  const cut = path.lastIndexOf("/");
  return cut === -1 ? "" : path.slice(0, cut);
}
