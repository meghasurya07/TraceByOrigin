/**
 * The `@`/`/` popover.
 *
 * Presentational: it renders what `useTriggerMenu` decided and reports clicks back. No
 * fetching, no ranking, no key handling — those live in the hook, because the prompt bar's
 * textarea has to see the same keys first and there must be exactly one place that decides
 * whether ↓ moved a highlight or moved the caret.
 *
 * Two-line rows, matching the session switcher and the model picker rather than the
 * single-line dense list this kind of menu usually has. A path is the thing being chosen and
 * a basename is how it is recognised, so both are shown at their own weight instead of one
 * being truncated into a dim suffix.
 *
 * `onMouseDown` is prevented on every row. A click would otherwise blur the textarea before
 * `onClick` fires, which closes the menu and then commits a row from a menu that is gone —
 * and, worse, loses the caret the insertion is measured from.
 *
 * Copyright (c) 2026 Origin AI
 */

import { useEffect, useRef } from "react";
import { FileText, FolderOpen, Zap } from "lucide-react";

import { cn } from "../../lib/cn";
import type { TriggerItem, TriggerMenuState } from "./useTriggerMenu";

/** Shared with the prompt bar, which sets `aria-activedescendant` to the active one. */
export function triggerRowId(index: number): string {
  return `trigger-row-${String(index)}`;
}

/** The listbox's id, referenced by the textarea's `aria-controls` while it is open. */
export const TRIGGER_MENU_ID = "trigger-menu";

export function TriggerMenu({ menu }: { menu: TriggerMenuState }): React.JSX.Element | null {
  const rows = useRef<(HTMLButtonElement | null)[]>([]);

  // Keyboard movement has to drag the viewport with it, or ↓ walks the highlight off the
  // bottom of a scrolled list and appears to do nothing.
  useEffect(() => {
    rows.current[menu.activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [menu.activeIndex, menu.items]);

  if (!menu.open) return null;

  return (
    <div
      role="listbox"
      id={TRIGGER_MENU_ID}
      aria-label={menu.kind === "command" ? "Commands" : "Files"}
      className="absolute bottom-full left-0 z-30 mb-2 max-h-64 w-full overflow-y-auto rounded-lg border border-line-strong bg-surface-overlay p-1 shadow-xl shadow-black/40"
    >
      {menu.items.length === 0 ? (
        <p className="px-2 py-3 text-center text-2xs text-fg-subtle">
          {menu.loading
            ? "Looking…"
            : menu.kind === "command"
              ? "No command matched."
              : "No file matched."}
        </p>
      ) : (
        menu.items.map((item, index) => (
          <button
            key={keyFor(item)}
            ref={(node) => {
              rows.current[index] = node;
            }}
            id={triggerRowId(index)}
            type="button"
            role="option"
            aria-selected={index === menu.activeIndex}
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onMouseEnter={() => {
              menu.setActiveIndex(index);
            }}
            onClick={() => {
              menu.choose(index);
            }}
            className={cn(
              "flex w-full items-start gap-2 rounded px-2 py-1.5 text-left",
              index === menu.activeIndex ? "bg-surface-hover" : "",
            )}
          >
            <Row item={item} />
          </button>
        ))
      )}
    </div>
  );
}

/**
 * Keyed by identity rather than index, so a response that reorders the list re-renders rows
 * in place instead of rewriting every one of them. A directory and a file can share a path
 * in principle, so the kind is part of the key.
 */
function keyFor(item: TriggerItem): string {
  if (item.kind === "file") return `f:${item.candidate.kind}:${item.candidate.path}`;
  return `c:${item.kind}:${item.command.name}`;
}

function Row({ item }: { item: TriggerItem }): React.JSX.Element {
  if (item.kind === "file") {
    const { candidate } = item;
    const directory = candidate.path.slice(
      0,
      Math.max(0, candidate.path.length - candidate.name.length - 1),
    );
    return (
      <>
        {candidate.kind === "directory" ? (
          <FolderOpen size={12} className="mt-0.5 shrink-0 text-fg-subtle" />
        ) : (
          <FileText size={12} className="mt-0.5 shrink-0 text-fg-subtle" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-xs text-fg">{candidate.name}</span>
          {directory === "" ? null : (
            <span className="block truncate text-2xs text-fg-subtle">{directory}</span>
          )}
        </span>
      </>
    );
  }

  const isFile = item.kind === "command";
  const { command } = item;
  return (
    <>
      {isFile ? (
        <FileText size={12} className="mt-0.5 shrink-0 text-fg-subtle" />
      ) : (
        <Zap size={12} className="mt-0.5 shrink-0 text-fg-subtle" />
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-1.5">
          <span className="truncate font-mono text-xs text-fg">/{command.name}</span>
          {item.kind === "command" && item.command.argumentHint !== undefined ? (
            <span className="truncate font-mono text-2xs text-fg-subtle">
              {item.command.argumentHint}
            </span>
          ) : null}
        </span>
        {command.description === "" ? null : (
          <span className="block truncate text-2xs text-fg-subtle">{command.description}</span>
        )}
      </span>
      {item.kind === "command" ? (
        <span className="mt-0.5 shrink-0 rounded border border-line px-1 text-2xs text-fg-subtle">
          {item.command.source}
        </span>
      ) : null}
    </>
  );
}
