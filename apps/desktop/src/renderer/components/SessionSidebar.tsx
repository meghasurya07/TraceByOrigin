/**
 * The session list.
 *
 * This is the agent-first shape's answer to a file tree: the thing you navigate between
 * is a *conversation*, not a document. Cursor 3.x calls them agents and lists them here;
 * so do we, and a running one is marked so you can leave a long turn to work and come
 * back to it.
 *
 * Order is the engine's — `session/list` returns most-recently-updated first — and is
 * never re-sorted locally. A list that re-sorts as a turn completes moves the row out
 * from under the cursor mid-click.
 *
 * Copyright (c) 2026 Origin AI
 */

import { useEffect, useRef, useState } from "react";
import { MessageSquarePlus, Search } from "lucide-react";

import type { SessionSummary } from "@trace/protocol";

import { cn } from "../lib/cn";
import { formatRelative, formatUsd } from "../lib/format";
import { useStore } from "../store";

export function SessionSidebar(): React.JSX.Element {
  const sessions = useStore((state) => state.sessions);
  const activeSessionId = useStore((state) => state.activeSessionId);
  const createSession = useStore((state) => state.createSession);
  const setSearchOpen = useStore((state) => state.setSearchOpen);

  return (
    <aside className="flex w-sidebar shrink-0 flex-col border-r border-line bg-surface-raised">
      <div className="flex h-9 shrink-0 items-center gap-1 border-b border-line px-2">
        <button
          type="button"
          onClick={() => void createSession()}
          className="flex h-7 min-w-0 flex-1 items-center gap-1.5 rounded px-2 text-xs text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
        >
          <MessageSquarePlus size={13} className="shrink-0" />
          <span className="truncate">New session</span>
        </button>
        <button
          type="button"
          title="Find a session"
          aria-label="Find a session"
          onClick={() => {
            setSearchOpen(true);
          }}
          className="flex size-7 shrink-0 items-center justify-center rounded text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
        >
          <Search size={13} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        {sessions.length === 0 ? (
          <p className="px-3 py-6 text-center text-2xs leading-relaxed text-fg-subtle">
            No sessions yet.
            <br />
            Ask something below to start one.
          </p>
        ) : (
          sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              active={session.id === activeSessionId}
            />
          ))
        )}
      </div>
    </aside>
  );
}

function SessionRow(props: { session: SessionSummary; active: boolean }): React.JSX.Element {
  const { session, active } = props;
  const selectSession = useStore((state) => state.selectSession);
  const renameSession = useStore((state) => state.renameSession);
  const deleteSession = useStore((state) => state.deleteSession);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(session.title);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) input.current?.select();
  }, [editing]);

  const commit = (): void => {
    setEditing(false);
    if (draft.trim() !== session.title) void renameSession(session.id, draft);
  };

  if (editing) {
    return (
      <div className="px-1.5 py-0.5">
        <input
          ref={input}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
          }}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit();
            if (event.key === "Escape") {
              setDraft(session.title);
              setEditing(false);
            }
          }}
          className="w-full rounded border border-accent bg-surface px-2 py-1 text-xs text-fg outline-none"
        />
      </div>
    );
  }

  return (
    <div className="group relative px-1.5 py-0.5">
      <button
        type="button"
        onClick={() => void selectSession(session.id)}
        onDoubleClick={() => {
          setDraft(session.title);
          setEditing(true);
        }}
        className={cn(
          "flex w-full flex-col items-start gap-0.5 rounded px-2 py-1.5 text-left transition-colors",
          active ? "bg-surface-active" : "hover:bg-surface-hover",
        )}
      >
        <span className="flex w-full min-w-0 items-center gap-1.5">
          {/* A running turn. Two pixels of pulse is enough — this row may be one of
              eight, and eight spinners is a slot machine. */}
          {session.isActive ? (
            <span
              className="size-1.5 shrink-0 animate-pulse rounded-full bg-accent-fg"
              title="A turn is running"
            />
          ) : null}
          <span
            className={cn("min-w-0 flex-1 truncate text-xs", active ? "text-fg" : "text-fg-muted")}
          >
            {session.title}
          </span>
        </span>
        <span className="flex w-full items-center gap-1.5 text-2xs text-fg-subtle">
          <span>{formatRelative(session.updatedAt)}</span>
          {session.turnCount > 0 ? <span>· {session.turnCount} turns</span> : null}
          {session.cumulativeCost.estimatedUsd > 0 ? (
            <span className="ml-auto font-mono">
              {formatUsd(session.cumulativeCost.estimatedUsd)}
            </span>
          ) : null}
        </span>
      </button>

      {/* Delete sits outside the row button rather than inside it: a `<button>` inside a
          `<button>` is invalid HTML and Chrome resolves it by dropping the inner one. */}
      <button
        type="button"
        title="Delete session"
        aria-label={`Delete ${session.title}`}
        onClick={() => void deleteSession(session.id)}
        className="absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded p-1 text-fg-subtle group-hover:block hover:bg-surface-overlay hover:text-danger"
      >
        <TrashGlyph />
      </button>
    </div>
  );
}

/**
 * An inline 12px trash glyph.
 *
 * Hand-written rather than imported so the delete affordance keeps the same optical
 * weight as the 1.5-stroke icons around it at this size — lucide's `Trash2` is drawn
 * for 16px and reads heavy at 12.
 */
function TrashGlyph(): React.JSX.Element {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M4 6h16M9 6V4h6v2M6 6l1 14h10l1-14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
