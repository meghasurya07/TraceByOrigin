/**
 * The session switcher.
 *
 * ⌘P/Ctrl+P, and it does two jobs at once: it lists recent sessions, and it full-text
 * searches every session's transcript. Those are the same control because they are the
 * same question — "take me back to the thing where I…" — answered by title when the user
 * remembers it and by content when they do not.
 *
 * With an empty query it is a recency list, so the most common case (jump back one
 * session) is open-then-Enter with nothing typed. Typing switches to `session/search`,
 * debounced, and the hit's snippet is shown because a title generated from the first
 * prompt is often not the part the user is looking for.
 *
 * Keyboard-only by construction: ↑/↓ move, Enter opens, Escape closes. The mouse works
 * because Radix gives it to us, but nothing here was designed for it.
 *
 * Copyright (c) 2026 Origin AI
 */

import { useEffect, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { MessageSquare, Search } from "lucide-react";

import { bridge } from "../lib/bridge";
import { cn } from "../lib/cn";
import { formatRelative } from "../lib/format";
import { useStore } from "../store";

interface Hit {
  sessionId: string;
  title: string;
  snippet: string;
  at: number;
}

/** Long enough that a fast typist makes one request, short enough to feel live. */
const DEBOUNCE_MS = 130;

export function SessionSearch(): React.JSX.Element {
  const open = useStore((state) => state.host.searchOpen);
  const setSearchOpen = useStore((state) => state.setSearchOpen);

  return (
    <Dialog.Root open={open} onOpenChange={setSearchOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content
          aria-label="Find a session"
          className="animate-fade-in fixed top-[15vh] left-1/2 z-50 w-[min(38rem,90vw)] -translate-x-1/2 overflow-hidden rounded-lg border border-line-strong bg-surface-overlay shadow-2xl shadow-black/50 outline-none"
        >
          {open ? (
            <Body
              onClose={() => {
                setSearchOpen(false);
              }}
            />
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Split from the dialog so that closing it unmounts the query state.
 *
 * Reopening with the previous search still in the box, cursor at the end, is a small
 * thing that consistently feels wrong: the switcher is a place you pass through, not a
 * view with state to return to.
 */
function Body({ onClose }: { onClose: () => void }): React.JSX.Element {
  const sessions = useStore((state) => state.sessions);
  const activeSessionId = useStore((state) => state.activeSessionId);
  const selectSession = useStore((state) => state.selectSession);

  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [cursor, setCursor] = useState(0);
  const [failed, setFailed] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
  }, []);

  // Debounced search. The generation counter drops responses that arrive after a newer
  // query has been typed — with a local index those come back out of order often.
  const generation = useRef(0);
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === "") {
      setHits(null);
      setFailed(false);
      return;
    }
    const mine = ++generation.current;
    const timer = setTimeout(() => {
      void bridge
        .request("session/search", { query: trimmed, limit: 30 })
        .then((result) => {
          if (generation.current !== mine) return;
          setHits(result.hits);
          setFailed(false);
        })
        .catch(() => {
          if (generation.current !== mine) return;
          setHits([]);
          setFailed(true);
        });
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  const rows: Hit[] =
    hits ??
    sessions.map((session) => ({
      sessionId: session.id,
      title: session.title,
      snippet:
        session.turnCount === 0
          ? "Empty session"
          : `${String(session.turnCount)} turn${session.turnCount === 1 ? "" : "s"}`,
      at: session.updatedAt,
    }));

  const clamped = rows.length === 0 ? 0 : Math.min(cursor, rows.length - 1);

  const choose = (sessionId: string): void => {
    onClose();
    void selectSession(sessionId);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor(rows.length === 0 ? 0 : (clamped + 1) % rows.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor(rows.length === 0 ? 0 : (clamped - 1 + rows.length) % rows.length);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const row = rows[clamped];
      if (row !== undefined) choose(row.sessionId);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
        <Search size={13} className="shrink-0 text-fg-subtle" />
        <input
          ref={input}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setCursor(0);
          }}
          onKeyDown={onKeyDown}
          spellCheck={false}
          placeholder="Search sessions, or press Enter for the most recent"
          className="selectable w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
        />
      </div>

      <div className="max-h-[50vh] overflow-y-auto p-1">
        {rows.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-fg-subtle">
            {failed
              ? "Search is unavailable — the session index could not be read."
              : query.trim() === ""
                ? "No sessions yet."
                : "Nothing matched."}
          </p>
        ) : (
          rows.map((row, index) => (
            <button
              key={`${row.sessionId}:${String(index)}`}
              type="button"
              onMouseEnter={() => {
                setCursor(index);
              }}
              onClick={() => {
                choose(row.sessionId);
              }}
              className={cn(
                "flex w-full items-start gap-2 rounded px-2 py-1.5 text-left",
                index === clamped ? "bg-surface-hover" : "",
              )}
            >
              <MessageSquare
                size={12}
                className={cn(
                  "mt-0.5 shrink-0",
                  row.sessionId === activeSessionId ? "text-accent-fg" : "text-fg-subtle",
                )}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs text-fg">{row.title}</span>
                <span className="block truncate text-2xs text-fg-subtle">{row.snippet}</span>
              </span>
              <span className="shrink-0 text-2xs text-fg-subtle">{formatRelative(row.at)}</span>
            </button>
          ))
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3 py-1.5 text-2xs text-fg-subtle">
        <span>↑↓ to move</span>
        <span>Enter to open</span>
        <span>Esc to close</span>
      </div>
    </>
  );
}
