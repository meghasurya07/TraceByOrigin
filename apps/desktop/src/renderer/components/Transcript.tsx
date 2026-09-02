/**
 * The transcript.
 *
 * Virtualized, because a long coding session is thousands of rows and a `text_delta`
 * arrives sixty times a second: mounting the whole history means React reconciles all of
 * it on every token. `@tanstack/react-virtual` measures rows as they mount rather than
 * being told their height, which is the only workable option here — a tool card is 28px
 * and an assistant message with a code block is 600px, and neither is knowable up front.
 *
 * The hard part is not the virtualization, it is the scroll. Three rules, in order:
 *
 *   1. If the user is at the bottom, stay at the bottom as content streams in.
 *   2. If the user has scrolled up, never move them. Not for a token, not for a new
 *      tool call, not for the turn ending.
 *   3. Switching sessions starts at the bottom, with no visible travel.
 *
 * Rule 2 is the one that products get wrong, and it is the one that matters: scrolling
 * up in a transcript is a deliberate act — the user is reading something — and yanking
 * them back down is the interface overriding a decision they just made. When they are
 * away from the bottom, a "jump to latest" button appears instead, so the pull is an
 * offer rather than an action.
 *
 * Copyright (c) 2026 Origin AI
 */

import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, CircleAlert, MessageSquarePlus } from "lucide-react";

import type { SessionView, TranscriptItem } from "@trace/client";
import { visibleItems } from "@trace/client";

import { useStore } from "../store";
import { CheckpointRow } from "./transcript/CheckpointRow";
import { ErrorItem } from "./transcript/ErrorItem";
import { Markdown } from "./transcript/Markdown";
import { Caret, ThinkingBlock } from "./transcript/ThinkingBlock";
import { TodoList } from "./transcript/TodoList";
import { ToolCallCard } from "./transcript/ToolCallCard";
import { TurnSummary } from "./transcript/TurnSummary";
import { UserMessage } from "./transcript/UserMessage";

/** Distance from the bottom still counted as "at the bottom", in px. */
const STICK_THRESHOLD = 64;

/**
 * Starting guess for a row's height.
 *
 * Deliberately on the low side. Over-estimating makes the scrollbar shrink as rows
 * measure, which reads as the page growing under your hand; under-estimating makes it
 * grow, which is what a transcript does anyway.
 */
const ESTIMATED_ROW = 64;

export function Transcript(): React.JSX.Element {
  const sessionId = useStore((state) => state.activeSessionId);
  const view = useStore((state) =>
    state.activeSessionId === null ? undefined : state.views[state.activeSessionId],
  );
  const showThinking = useStore((state) => state.settings?.showThinking ?? true);

  if (sessionId === null || view === undefined) return <NoSession />;
  if (view.hydration === "loading" || view.hydration === "unloaded") {
    return <Skeleton />;
  }
  if (view.hydration === "failed") {
    return <HydrationFailed sessionId={sessionId} message={view.hydrationError} />;
  }

  // Keyed on the session so switching sessions remounts: scroll position, disclosure
  // state, and the virtualizer's measurement cache all belong to one session's list and
  // none of them are meaningful in another's.
  return <List key={sessionId} view={view} showThinking={showThinking} />;
}

const List = memo(function List(props: {
  view: SessionView;
  showThinking: boolean;
}): React.JSX.Element {
  const { view, showThinking } = props;
  const items = useMemo(() => visibleItems(view, { showThinking }), [view, showThinking]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_ROW,
    getItemKey: (index) => items[index]?.id ?? index,
    overscan: 8,
  });

  const onScroll = useCallback((): void => {
    const node = scrollRef.current;
    if (node === null) return;
    const distance = node.scrollHeight - node.scrollTop - node.clientHeight;
    setAtBottom(distance <= STICK_THRESHOLD);
  }, []);

  // First paint of a session lands at the bottom with no animation. `scrollToIndex`
  // would tween through the whole history; assigning `scrollTop` does not.
  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (node !== null) node.scrollTop = node.scrollHeight;
  }, []);

  /**
   * The stick.
   *
   * `tail` changes on every delta — it is the last row's identity plus its length —
   * which is exactly the cadence at which the scroll needs to follow. `virtualizer` is
   * a stable instance across renders, so it is intentionally not a dependency.
   */
  const tail = tailSignature(items);
  useEffect(() => {
    if (!atBottom || items.length === 0) return;
    virtualizer.scrollToIndex(items.length - 1, { align: "end" });
  }, [tail, atBottom, items.length]);

  const jump = (): void => {
    setAtBottom(true);
    const node = scrollRef.current;
    if (node !== null) node.scrollTop = node.scrollHeight;
  };

  if (items.length === 0) return <Empty />;

  const rows = virtualizer.getVirtualItems();

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={scrollRef} onScroll={onScroll} className="h-full overflow-y-auto overflow-x-hidden">
        <div className="mx-auto w-full max-w-3xl px-4 py-3">
          <div
            className="relative w-full"
            style={{ height: `${String(virtualizer.getTotalSize())}px` }}
          >
            {rows.map((row) => {
              const item = items[row.index];
              if (item === undefined) return null;
              return (
                <div
                  key={row.key}
                  data-index={row.index}
                  ref={virtualizer.measureElement}
                  className="absolute top-0 left-0 w-full"
                  style={{ transform: `translateY(${String(row.start)}px)` }}
                >
                  <Row item={item} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {atBottom ? null : (
        <button
          type="button"
          onClick={jump}
          className="animate-fade-in absolute right-4 bottom-3 flex items-center gap-1.5 rounded-full border border-line-strong bg-surface-overlay px-2.5 py-1.5 text-2xs text-fg-muted shadow-lg transition-colors hover:text-fg"
        >
          <ArrowDown size={11} />
          Jump to latest
        </button>
      )}
    </div>
  );
});

/**
 * One row, dispatched by kind.
 *
 * `memo` on the row is what makes the streaming case cheap: a token appended to the
 * last assistant message produces a new object for that item only, so every other
 * mounted row bails out of reconciliation on a reference check.
 */
const Row = memo(function Row({ item }: { item: TranscriptItem }): React.JSX.Element | null {
  switch (item.kind) {
    case "user_message":
      return <UserMessage item={item} />;
    case "assistant_text":
      return (
        <div className="my-1 text-sm leading-relaxed">
          <Markdown text={item.text} />
          {item.streaming ? <Caret /> : null}
        </div>
      );
    case "thinking":
      return <ThinkingBlock item={item} />;
    case "tool_call":
      return <ToolCallCard item={item} />;
    case "todos":
      return <TodoList item={item} />;
    case "checkpoint":
      return <CheckpointRow item={item} />;
    case "turn_summary":
      return <TurnSummary item={item} />;
    case "error":
      return <ErrorItem item={item} />;
    default: {
      const never: never = item;
      void never;
      return null;
    }
  }
});

/**
 * What the stick effect watches.
 *
 * Identity plus size of the last row, which is the cheapest value that changes on every
 * event that ought to move the scroll — a delta, a new row, a status flip — and on
 * nothing else. Hashing the whole list would cost more per token than the render does.
 */
function tailSignature(items: readonly TranscriptItem[]): string {
  const last = items[items.length - 1];
  if (last === undefined) return "";
  const size =
    last.kind === "assistant_text" || last.kind === "thinking"
      ? last.text.length
      : last.kind === "tool_call"
        ? last.output.length + last.partialInput.length + last.status.length
        : 0;
  return `${String(items.length)}:${last.id}:${String(size)}`;
}

function Frame({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-6">
      <div className="max-w-sm text-center">{children}</div>
    </div>
  );
}

function NoSession(): React.JSX.Element {
  const createSession = useStore((state) => state.createSession);
  const workspace = useStore((state) => state.activeWorkspaceId);
  const openWorkspace = useStore((state) => state.openWorkspace);

  return (
    <Frame>
      <MessageSquarePlus size={22} className="mx-auto mb-3 text-fg-subtle" />
      {workspace === null ? (
        <>
          <p className="text-sm text-fg-muted">Open a folder to get started.</p>
          <p className="mt-1 text-2xs text-fg-subtle">
            Trace indexes it locally so the agent can search it.
          </p>
          <Cta
            label="Open a folder"
            onClick={() => {
              void openWorkspace();
            }}
          />
        </>
      ) : (
        <>
          <p className="text-sm text-fg-muted">No session selected.</p>
          <Cta
            label="New session"
            onClick={() => {
              void createSession();
            }}
          />
        </>
      )}
    </Frame>
  );
}

function Empty(): React.JSX.Element {
  return (
    <div className="flex min-h-0 flex-1 items-end justify-center overflow-hidden px-6 pb-6">
      <p className="max-w-md text-center text-xs leading-relaxed text-fg-subtle">
        Describe what you want changed. Trace reads the code it needs, and asks before it writes or
        runs anything.
      </p>
    </div>
  );
}

/**
 * Hydration placeholder.
 *
 * Bars rather than a spinner, and at the bottom rather than the centre, because the
 * transcript that is about to appear is bottom-anchored: a centred spinner would be
 * replaced by content somewhere else on screen, which reads as a jump.
 */
function Skeleton(): React.JSX.Element {
  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col justify-end gap-3 px-4 py-3">
        {[70, 92, 45, 82, 60].map((width, index) => (
          <div
            key={`s${String(index)}`}
            className="h-3 animate-pulse rounded bg-surface-raised"
            style={{ width: `${String(width)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function HydrationFailed(props: { sessionId: string; message?: string }): React.JSX.Element {
  const selectSession = useStore((state) => state.selectSession);
  return (
    <Frame>
      <CircleAlert size={22} className="mx-auto mb-3 text-danger" />
      <p className="text-sm text-fg-muted">This session&rsquo;s history could not be loaded.</p>
      {props.message === undefined ? null : (
        <p className="selectable mt-1 font-mono text-2xs text-fg-subtle">{props.message}</p>
      )}
      <Cta
        label="Try again"
        onClick={() => {
          void selectSession(props.sessionId);
        }}
      />
    </Frame>
  );
}

function Cta(props: { label: string; onClick: () => void }): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="mt-3 rounded border border-line-strong bg-surface-raised px-2.5 py-1 text-2xs font-medium text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
    >
      {props.label}
    </button>
  );
}
