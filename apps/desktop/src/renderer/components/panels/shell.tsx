/**
 * The furniture every work-panel target shares.
 *
 * Extracted because six panels with six hand-rolled header rows drift within a week: one
 * gets a 6px gap, another a 8px one, and the tab strip above them stops looking like it
 * belongs to the thing below it. One bar, one empty state, one button.
 *
 * Copyright (c) 2026 Origin AI
 */

import { RefreshCw } from "lucide-react";

import { cn } from "../../lib/cn";

export const PANEL_BUTTON =
  "flex items-center gap-1 rounded px-1.5 py-0.5 text-2xs text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg disabled:opacity-40";

export const PANEL_INPUT =
  "selectable min-w-0 rounded border border-line-strong bg-surface px-2 py-1 font-mono text-2xs text-fg outline-none focus:border-accent placeholder:text-fg-subtle";

/** A single row of controls under the tab strip. Fixed height, never wraps. */
export function PanelBar(props: { children: React.ReactNode; className?: string }): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex h-7 shrink-0 items-center gap-1.5 border-b border-line px-1.5",
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}

/**
 * The centred message a panel shows when it has nothing.
 *
 * Takes a `detail` because "Nothing to show" on its own is the least useful sentence in
 * software — every empty state here says what would put something in it.
 *
 * `h-full` *and* `flex-1`, deliberately: as a panel's whole body it needs the height of
 * its block parent, and as the last child under a `PanelBar` it needs the space the bar
 * left over. `flex-basis: 0` wins over `height` inside a flex column, so one class list
 * gets both right and no caller has to know which case they are in.
 */
export function PanelMessage(props: {
  Icon?: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  detail?: string;
  children?: React.ReactNode;
}): React.JSX.Element {
  const { Icon } = props;
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-1.5 px-6 text-center">
      {Icon === undefined ? null : <Icon size={16} className="text-fg-subtle" />}
      <p className="text-xs text-fg-muted">{props.title}</p>
      {props.detail === undefined ? null : (
        <p className="max-w-72 text-2xs leading-relaxed text-fg-subtle">{props.detail}</p>
      )}
      {props.children}
    </div>
  );
}

/** Wraps a panel body so it scrolls without the panel itself scrolling. */
export function PanelBody(props: { children: React.ReactNode; className?: string }): React.JSX.Element {
  return <div className={cn("min-h-0 flex-1 overflow-auto", props.className)}>{props.children}</div>;
}

/**
 * The message from a failed request, shown as the engine wrote it.
 *
 * The engine's refusals are already sentences aimed at a person — `"main.bin" is a binary
 * file.`, `"vendor" is not a git repository.` — and replacing them with "Something went
 * wrong" would throw away the only part the user can act on.
 */
export function messageOf(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

/**
 * Re-run whatever the panel last fetched.
 *
 * Every panel needs one because none of `fs/list`, `fs/read`, or `git/status` pushes a
 * notification when the thing underneath changes. Disabled while the request is in flight,
 * so a held click cannot queue four of them.
 */
export function RefreshButton(props: { busy: boolean; onClick: () => void }): React.JSX.Element {
  return (
    <button
      type="button"
      className={PANEL_BUTTON}
      title="Refresh"
      aria-label="Refresh"
      disabled={props.busy}
      onClick={props.onClick}
    >
      <RefreshCw size={11} className={props.busy ? "animate-spin" : undefined} />
    </button>
  );
}
