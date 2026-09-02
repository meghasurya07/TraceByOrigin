/**
 * A unified diff, rendered.
 *
 * Shared by three callers with three different reasons to want it: the permission
 * prompt (deciding whether to allow an edit), a completed `edit_file` card (checking
 * what an edit actually did), and the work panel's diff target (reviewing a whole
 * branch). They differ only in how many rows they are willing to show, which is the
 * `maxRows` prop.
 *
 * The cap is not cosmetic. A generated lockfile is a 40,000-line diff, and mounting
 * 40,000 DOM rows inside a permission prompt — a prompt whose entire purpose is to be
 * answered in two seconds — is how a UI stops responding to the button that dismisses
 * it. Past the cap the rest is one line of text and a button.
 *
 * Line numbers come from the `@@` hunk headers rather than being counted from the top,
 * because a diff preview usually starts at line 400 of the file and numbering it from 1
 * would be actively misleading.
 *
 * Copyright (c) 2026 Origin AI
 */

import { memo, useState } from "react";

import { cn } from "../../lib/cn";

type RowKind = "add" | "del" | "context" | "hunk" | "file" | "meta";

export interface DiffRow {
  kind: RowKind;
  text: string;
  oldLine?: number;
  newLine?: number;
}

const HUNK = /^@@+ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/;

/**
 * Parse a unified diff into flat rows.
 *
 * Tolerant by design: anything unrecognised becomes a `meta` row and is shown as-is.
 * A diff that came from `git diff` with colour codes, or from a model's approximation
 * of one, still has to render — this is a viewer, not a validator.
 */
export function parseDiff(diff: string): DiffRow[] {
  const rows: DiffRow[] = [];
  let oldLine = 0;
  let newLine = 0;

  for (const raw of diff.split("\n")) {
    const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;

    const hunk = HUNK.exec(line);
    if (hunk !== null) {
      oldLine = Number.parseInt(hunk[1] ?? "1", 10);
      newLine = Number.parseInt(hunk[2] ?? "1", 10);
      rows.push({ kind: "hunk", text: line });
      continue;
    }

    if (line.startsWith("diff --git ") || line.startsWith("+++ ") || line.startsWith("--- ")) {
      rows.push({ kind: "file", text: line });
      continue;
    }

    if (
      line.startsWith("index ") ||
      line.startsWith("similarity index") ||
      line.startsWith("rename ") ||
      line.startsWith("new file mode") ||
      line.startsWith("deleted file mode") ||
      line.startsWith("old mode") ||
      line.startsWith("new mode") ||
      line.startsWith("Binary files") ||
      line.startsWith("\\ No newline")
    ) {
      rows.push({ kind: "meta", text: line });
      continue;
    }

    if (line.startsWith("+")) {
      rows.push({ kind: "add", text: line.slice(1), newLine });
      newLine += 1;
      continue;
    }
    if (line.startsWith("-")) {
      rows.push({ kind: "del", text: line.slice(1), oldLine });
      oldLine += 1;
      continue;
    }

    // A context line, whose leading space `git` guarantees but a hand-made diff may
    // not. Either way it counts against both sides.
    rows.push({
      kind: "context",
      text: line.startsWith(" ") ? line.slice(1) : line,
      oldLine,
      newLine,
    });
    oldLine += 1;
    newLine += 1;
  }

  // A trailing newline in the source produces one empty context row that is not part
  // of the diff.
  const last = rows[rows.length - 1];
  if (last !== undefined && last.kind === "context" && last.text === "") rows.pop();

  return rows;
}

export function diffStats(rows: readonly DiffRow[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const row of rows) {
    if (row.kind === "add") added += 1;
    if (row.kind === "del") removed += 1;
  }
  return { added, removed };
}

const ROW_STYLE: Readonly<Record<RowKind, string>> = {
  add: "bg-diff-add text-diff-add-fg",
  del: "bg-diff-remove text-diff-remove-fg",
  context: "text-fg-muted",
  hunk: "bg-surface-raised text-fg-subtle",
  file: "bg-surface-raised font-medium text-fg-muted",
  meta: "text-fg-subtle",
};

const SIGN: Readonly<Record<RowKind, string>> = {
  add: "+",
  del: "−",
  context: " ",
  hunk: "",
  file: "",
  meta: "",
};

export const DiffView = memo(function DiffView(props: {
  diff: string;
  /** Rows rendered before the "show the rest" cut. */
  maxRows?: number;
  className?: string;
}): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const rows = parseDiff(props.diff);
  const cap = props.maxRows ?? 400;
  const shown = expanded ? rows : rows.slice(0, cap);
  const hidden = rows.length - shown.length;

  return (
    <div
      className={cn("overflow-hidden rounded-md border border-line bg-surface", props.className)}
    >
      <div className="overflow-x-auto font-mono text-2xs leading-[1.5]">
        {shown.map((row, index) => (
          <div key={`r${String(index)}`} className={cn("flex whitespace-pre", ROW_STYLE[row.kind])}>
            <span className="w-9 shrink-0 pr-1 text-right text-fg-subtle/70 select-none">
              {row.oldLine === undefined ? "" : String(row.oldLine)}
            </span>
            <span className="w-9 shrink-0 pr-1 text-right text-fg-subtle/70 select-none">
              {row.newLine === undefined ? "" : String(row.newLine)}
            </span>
            <span className="w-3 shrink-0 select-none">{SIGN[row.kind]}</span>
            <span className="selectable min-w-0 flex-1 pr-3">{row.text}</span>
          </div>
        ))}
      </div>

      {hidden > 0 ? (
        <button
          type="button"
          onClick={() => {
            setExpanded(true);
          }}
          className="w-full border-t border-line bg-surface-raised px-3 py-1 text-left text-2xs text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
        >
          {hidden} more {hidden === 1 ? "line" : "lines"} — show all
        </button>
      ) : null}
    </div>
  );
});
