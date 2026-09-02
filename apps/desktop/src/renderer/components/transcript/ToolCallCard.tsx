/**
 * One tool call, as a card.
 *
 * This is the densest row in the transcript and the one that decides whether the app
 * feels legible or feels like a log file. The governing rule: a *successful* call is
 * one line. `read_file` on a file that exists tells the user nothing they need — it is
 * the agent breathing. So `ok` collapses to its summary, and the body is a disclosure.
 *
 * Everything that is not routine opens itself: `error` and `denied`, because those are
 * the rows the user is scrolling to find, and `run_terminal_cmd` while it runs, because
 * live stdout is the only thing on screen that proves the app is not wedged.
 *
 * Once the user clicks the header, their choice is pinned and status stops driving the
 * disclosure — the same contract as `ThinkingBlock`. A card that re-collapses under
 * your cursor because an event landed is worse than one that shows too much.
 *
 * The output pane keeps the *tail*. A build that fails prints 300 lines and the error
 * is in the last 5; the engine's cap (`TOOL_OUTPUT_CAP_CHARS`) already drops from the
 * head, and this scrolls to the bottom for the same reason.
 *
 * Copyright (c) 2026 Origin AI
 */

import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Ban,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  FilePen,
  FileSearch,
  FileX,
  FilePlus,
  FolderOpen,
  Hourglass,
  ListTodo,
  LoaderCircle,
  Scroll,
  Search,
  SearchCode,
  ShieldQuestionMark,
  SquareTerminal,
} from "lucide-react";

import type { FileChangeSummary, ToolName } from "@trace/protocol";
import type { ItemOf, ToolCallStatus } from "@trace/client";

import { cn } from "../../lib/cn";
import { formatDiffStat, formatDuration, shortenPath } from "../../lib/format";
import { CodeBlock } from "./CodeBlock";
import { DiffView } from "./DiffView";
import { PermissionPrompt } from "./PermissionPrompt";

/** Per-tool icon. Effect alone is too coarse — five tools share `read`. */
const TOOL_ICON: Readonly<Record<ToolName, typeof FileSearch>> = {
  read_file: FileSearch,
  list_dir: FolderOpen,
  glob: Search,
  grep: Search,
  codebase_search: SearchCode,
  write_file: FilePlus,
  edit_file: FilePen,
  delete_file: FileX,
  run_terminal_cmd: SquareTerminal,
  todo_write: ListTodo,
  fetch_rules: Scroll,
};

/** Shown when `summary` is still empty, i.e. the input is mid-stream. */
const TOOL_VERB: Readonly<Record<ToolName, string>> = {
  read_file: "Reading",
  list_dir: "Listing",
  glob: "Finding files",
  grep: "Searching",
  codebase_search: "Searching the codebase",
  write_file: "Writing",
  edit_file: "Editing",
  delete_file: "Deleting",
  run_terminal_cmd: "Running a command",
  todo_write: "Updating the plan",
  fetch_rules: "Reading project rules",
};

/** Terminal-state accent for the icon and the left edge. */
const STATUS_TINT: Readonly<Record<ToolCallStatus, string>> = {
  streaming_input: "text-fg-subtle",
  running: "text-accent-fg",
  awaiting_permission: "text-warning",
  ok: "text-fg-subtle",
  error: "text-danger",
  denied: "text-fg-subtle",
};

function shouldOpen(item: ItemOf<"tool_call">): boolean {
  if (item.status === "error" || item.status === "denied") return true;
  if (item.status === "awaiting_permission") return true;
  if (item.status === "running" && item.tool === "run_terminal_cmd") return true;
  return false;
}

export const ToolCallCard = memo(function ToolCallCard(props: {
  item: ItemOf<"tool_call">;
}): React.JSX.Element {
  const { item } = props;
  const wantOpen = shouldOpen(item);
  const [open, setOpen] = useState(wantOpen);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!pinned) setOpen(wantOpen);
  }, [wantOpen, pinned]);

  const Icon = TOOL_ICON[item.tool];
  const busy = item.status === "streaming_input" || item.status === "running";
  const diff = diffOf(item);
  const stat = totalStat(item.changes);

  return (
    <div
      className={cn(
        "my-1 overflow-hidden rounded-md border bg-surface-raised/40",
        item.status === "error"
          ? "border-danger/40"
          : item.status === "awaiting_permission"
            ? "border-warning/40"
            : "border-line",
      )}
    >
      <button
        type="button"
        onClick={() => {
          setPinned(true);
          setOpen(!open);
        }}
        aria-expanded={open}
        className="flex w-full items-center gap-1.5 px-2 py-1.5 text-left transition-colors hover:bg-surface-hover"
      >
        <span className="shrink-0 text-fg-subtle">
          {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        </span>
        <StatusIcon status={item.status} Fallback={Icon} />
        <span className="min-w-0 flex-1 truncate text-xs text-fg-muted">
          {item.summary === "" ? (
            <span className="text-fg-subtle italic">{TOOL_VERB[item.tool]}…</span>
          ) : (
            item.summary
          )}
        </span>
        {stat === null ? null : (
          <span className="shrink-0 font-mono text-2xs text-fg-subtle">
            {formatDiffStat(stat.added, stat.removed)}
          </span>
        )}
        {item.durationMs === undefined || item.durationMs < 1_000 ? null : (
          <span className="shrink-0 font-mono text-2xs text-fg-subtle">
            {formatDuration(item.durationMs)}
          </span>
        )}
      </button>

      {open ? (
        <div className="border-t border-line px-2 py-1.5">
          {item.status === "streaming_input" ? (
            <PartialInput text={item.partialInput} />
          ) : (
            <Input tool={item.tool} input={item.input} />
          )}

          {diff === null ? null : <DiffView diff={diff} maxRows={200} className="mt-1.5" />}

          {item.changes === undefined || item.changes.length === 0 ? null : (
            <Changes changes={item.changes} />
          )}

          {item.output === "" ? null : (
            <Output text={item.output} truncated={item.outputTruncated} live={busy} />
          )}

          {item.resultPreview === undefined || item.resultPreview === "" ? null : (
            <p className="selectable mt-1.5 font-mono text-2xs whitespace-pre-wrap text-fg-subtle">
              {item.resultPreview}
            </p>
          )}

          {item.denialReason === undefined || item.denialReason === "" ? null : (
            <p className="mt-1.5 flex items-start gap-1.5 text-2xs text-fg-subtle">
              <Ban size={10} className="mt-0.5 shrink-0" />
              <span className="selectable">{item.denialReason}</span>
            </p>
          )}
        </div>
      ) : null}

      {item.permission === undefined ? null : (
        <div className="px-2 pb-1.5">
          <PermissionPrompt request={item.permission} />
        </div>
      )}
    </div>
  );
});

function StatusIcon(props: {
  status: ToolCallStatus;
  Fallback: typeof FileSearch;
}): React.JSX.Element {
  const tint = STATUS_TINT[props.status];
  if (props.status === "running") {
    return <LoaderCircle size={12} className={cn("shrink-0 animate-spin", tint)} />;
  }
  if (props.status === "streaming_input") {
    return <Hourglass size={12} className={cn("shrink-0", tint)} />;
  }
  if (props.status === "awaiting_permission") {
    return <ShieldQuestionMark size={12} className={cn("shrink-0", tint)} />;
  }
  if (props.status === "error") {
    return <CircleAlert size={12} className={cn("shrink-0", tint)} />;
  }
  if (props.status === "denied") {
    return <Ban size={12} className={cn("shrink-0", tint)} />;
  }
  return <props.Fallback size={12} className={cn("shrink-0", tint)} />;
}

/**
 * Partial JSON, shown raw.
 *
 * It is unparseable by definition — half a string literal, an unclosed brace — so any
 * attempt to pretty-print it would either throw or lie. Raw and monospaced is honest,
 * and it makes the *shape* of what the model is about to do visible a second early,
 * which is the only reason to show it at all.
 */
function PartialInput({ text }: { text: string }): React.JSX.Element {
  return (
    <pre className="selectable overflow-x-auto font-mono text-2xs leading-relaxed text-fg-subtle">
      {text === "" ? "…" : text}
      <span aria-hidden className="caret" />
    </pre>
  );
}

/**
 * Parsed input.
 *
 * The common case is one field the user actually cares about — a path, a command, a
 * pattern — so that is rendered as a line of text rather than a JSON block. Anything
 * unrecognised falls through to pretty-printed JSON, which is also what happens if the
 * engine ever adds a tool this switch has not learned.
 */
function Input(props: { tool: ToolName; input: unknown }): React.JSX.Element | null {
  const { input } = props;
  if (input === undefined || input === null) return null;
  const record = typeof input === "object" ? (input as Record<string, unknown>) : null;
  if (record === null) return <CodeBlock code={String(input)} lang="text" bare />;

  const path = typeof record["path"] === "string" ? record["path"] : null;
  const pattern = typeof record["pattern"] === "string" ? record["pattern"] : null;
  const query = typeof record["query"] === "string" ? record["query"] : null;
  const command = typeof record["command"] === "string" ? record["command"] : null;

  if (props.tool === "run_terminal_cmd" && command !== null) {
    const cwd = typeof record["cwd"] === "string" ? record["cwd"] : null;
    return (
      <div>
        <CodeBlock code={command} lang="bash" bare />
        {cwd === null ? null : (
          <p className="mt-1 font-mono text-2xs text-fg-subtle">in {shortenPath(cwd, 4)}</p>
        )}
      </div>
    );
  }

  if (props.tool === "write_file" && typeof record["content"] === "string") {
    return (
      <div>
        <Field label="path" value={path ?? "—"} />
        <CodeBlock code={record["content"]} lang={langOf(path)} className="mt-1" />
      </div>
    );
  }

  if (pattern !== null || query !== null) {
    return (
      <div>
        <Field label={query !== null ? "query" : "pattern"} value={query ?? pattern ?? ""} />
        {path === null ? null : <Field label="in" value={shortenPath(path, 4)} />}
      </div>
    );
  }

  if (path !== null && Object.keys(record).length <= 3) {
    return <Field label="path" value={shortenPath(path, 5)} />;
  }

  return <CodeBlock code={stringify(input)} lang="json" bare />;
}

function Field(props: { label: string; value: string }): React.JSX.Element {
  return (
    <p className="flex gap-1.5 font-mono text-2xs">
      <span className="shrink-0 text-fg-subtle/70">{props.label}</span>
      <span className="selectable min-w-0 break-all text-fg-muted">{props.value}</span>
    </p>
  );
}

/**
 * Live output.
 *
 * Pinned to the bottom while the call runs, using a layout effect so the jump happens
 * in the same frame as the new text — a visible scroll would be a distraction on every
 * chunk. Once the call ends the user is left in control; a finished log is something
 * you read from wherever you were.
 */
function Output(props: { text: string; truncated: boolean; live: boolean }): React.JSX.Element {
  const ref = useRef<HTMLPreElement>(null);

  useLayoutEffect(() => {
    if (!props.live) return;
    const node = ref.current;
    if (node !== null) node.scrollTop = node.scrollHeight;
  }, [props.text, props.live]);

  return (
    <div className="mt-1.5">
      {props.truncated ? (
        <p className="mb-0.5 text-2xs text-fg-subtle/70">
          Earlier output dropped — showing the tail.
        </p>
      ) : null}
      <pre
        ref={ref}
        className="selectable max-h-64 overflow-auto rounded border border-line bg-surface px-2 py-1 font-mono text-2xs leading-[1.5] whitespace-pre-wrap text-fg-muted"
      >
        {props.text}
        {props.live ? <span aria-hidden className="caret" /> : null}
      </pre>
    </div>
  );
}

function Changes({ changes }: { changes: readonly FileChangeSummary[] }): React.JSX.Element {
  return (
    <ul className="mt-1.5 space-y-0.5">
      {changes.map((change) => (
        <li key={change.path} className="flex items-center gap-1.5 font-mono text-2xs">
          <ChangeIcon type={change.changeType} />
          <span className="selectable min-w-0 flex-1 truncate text-fg-muted" title={change.path}>
            {shortenPath(change.path, 4)}
          </span>
          <span className="shrink-0 text-fg-subtle">
            {formatDiffStat(change.linesAdded, change.linesRemoved)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ChangeIcon({ type }: { type: FileChangeSummary["changeType"] }): React.JSX.Element {
  if (type === "created") return <FilePlus size={10} className="shrink-0 text-success" />;
  if (type === "deleted") return <FileX size={10} className="shrink-0 text-danger" />;
  return <FilePen size={10} className="shrink-0 text-fg-subtle" />;
}

/**
 * The diff to show inside a completed edit.
 *
 * `resultPreview` is a free-form string on the wire, so it is only treated as a diff
 * when it looks like one. A false positive here would render an error message as a
 * unified diff, which is worse than showing it as text.
 */
function diffOf(item: ItemOf<"tool_call">): string | null {
  if (item.permission?.diffPreview !== undefined) return null; // The prompt already shows it.
  const preview = item.resultPreview;
  if (preview === undefined || preview === "") return null;
  if (item.tool !== "edit_file" && item.tool !== "write_file") return null;
  return /^(?:diff --git |@@ |--- )/m.test(preview) ? preview : null;
}

function totalStat(
  changes: readonly FileChangeSummary[] | undefined,
): { added: number; removed: number } | null {
  if (changes === undefined || changes.length === 0) return null;
  let added = 0;
  let removed = 0;
  for (const change of changes) {
    added += change.linesAdded;
    removed += change.linesRemoved;
  }
  return added === 0 && removed === 0 ? null : { added, removed };
}

/** Best-effort grammar from an extension, for a `write_file` body. */
function langOf(path: string | null): string {
  if (path === null) return "text";
  const ext = /\.([a-z0-9]+)$/i.exec(path)?.[1]?.toLowerCase();
  if (ext === undefined) return "text";
  return EXT_LANG[ext] ?? ext;
}

const EXT_LANG: Readonly<Record<string, string>> = {
  cjs: "javascript",
  mjs: "javascript",
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  py: "python",
  rb: "ruby",
  rs: "rust",
  kt: "kotlin",
  md: "markdown",
  yml: "yaml",
  sh: "bash",
  h: "c",
  hpp: "cpp",
  cc: "cpp",
};

function stringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}
