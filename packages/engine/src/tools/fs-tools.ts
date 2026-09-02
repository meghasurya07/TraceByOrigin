/**
 * Filesystem tools: read_file, list_dir, write_file, edit_file, delete_file.
 *
 * Every one of these resolves its path through `resolveInWorkspace` first. That is
 * the only containment check in the engine, and skipping it in a single handler
 * would be enough to hand an agent the user's `~/.ssh`.
 *
 * Line endings: `edit_file` preserves whatever convention the file already uses,
 * because a surgical change should not rewrite 400 unrelated lines on Windows.
 * `write_file` writes exactly what it is given — it is a full replacement, so the
 * model's content is the intent.
 *
 * Copyright (c) 2026 Origin AI
 */

import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { ErrorCode, RpcError } from "@trace/protocol";
import { countLines, diffStats, unifiedDiff } from "../diff.js";
import { looksBinary, resolveInWorkspace, toPosix } from "../paths.js";
import {
  DEFAULT_READ_LINE_LIMIT,
  truncateForModel,
  type ToolHandler,
  type ToolResult,
} from "./registry.js";

/** Anything larger is not source code, and reading it helps nobody. */
const MAX_READ_BYTES = 10 * 1024 * 1024;

function failure(summary: string, content: string): ToolResult {
  return { content, isError: true, summary };
}

function stamp(info: { mtimeMs: number; size: number }): { mtimeMs: number; size: number } {
  return { mtimeMs: info.mtimeMs, size: info.size };
}

function withLineNumbers(lines: string[], startLine: number): string {
  const width = String(startLine + Math.max(lines.length - 1, 0)).length;
  return lines
    .map((line, index) => `${String(startLine + index).padStart(width, " ")}\t${line}`)
    .join("\n");
}

/** Drop the `   42\t` prefix `read_file` adds, if the model forgot to. */
function stripLineNumberPrefixes(text: string): string {
  const lines = text.split("\n");
  if (lines.length === 0) return text;
  const prefixed = lines.every((line) => line === "" || /^\s*\d+\t/.test(line));
  if (!prefixed) return text;
  return lines.map((line) => line.replace(/^\s*\d+\t/, "")).join("\n");
}

// ---------------------------------------------------------------------------
// read_file
// ---------------------------------------------------------------------------

export const readFileTool: ToolHandler<"read_file"> = async (input, ctx) => {
  const resolved = await resolveInWorkspace(input.path, ctx.roots);

  let info;
  try {
    info = await stat(resolved.absolute);
  } catch {
    return failure(
      `Missing ${resolved.relative}`,
      `File not found: ${resolved.relative}. Use list_dir or glob to find the correct path.`,
    );
  }

  if (info.isDirectory()) {
    return failure(
      `${resolved.relative} is a directory`,
      `${resolved.relative} is a directory, not a file. Use list_dir to see its contents.`,
    );
  }
  if (info.size > MAX_READ_BYTES) {
    return failure(
      `${resolved.relative} too large`,
      `${resolved.relative} is ${(info.size / 1_048_576).toFixed(1)} MB, over the ${MAX_READ_BYTES / 1_048_576} MB read limit. ` +
        `Use grep to find what you need, or read_file with start_line/end_line.`,
    );
  }

  const buffer = await readFile(resolved.absolute);
  if (looksBinary(buffer)) {
    return failure(
      `${resolved.relative} is binary`,
      `${resolved.relative} appears to be a binary file (${info.size.toLocaleString()} bytes) and cannot be read as text.`,
    );
  }

  // Record the stamp *before* any early return, so an empty-file read still counts
  // as having read it — otherwise write_file would reject creating content there.
  ctx.files.markRead(resolved.absolute, stamp(info));

  const content = buffer.toString("utf8");
  if (content === "") {
    return {
      content: `${resolved.relative} exists but is empty.`,
      summary: `Read ${resolved.relative} (empty)`,
      meta: { path: resolved.relative, totalLines: 0 },
    };
  }

  const allLines = content.split("\n");
  const totalLines = allLines.length;

  const requestedStart = input.start_line ?? 1;
  const start = Math.max(1, Math.min(requestedStart, totalLines));
  const rangeGiven = input.start_line !== undefined || input.end_line !== undefined;
  const end = Math.min(
    input.end_line ?? (rangeGiven ? totalLines : start + DEFAULT_READ_LINE_LIMIT - 1),
    totalLines,
  );

  if (end < start) {
    return failure(
      `Bad range for ${resolved.relative}`,
      `Invalid line range: start_line ${requestedStart} is after end_line ${input.end_line}. The file has ${totalLines} lines.`,
    );
  }

  const slice = allLines.slice(start - 1, end);
  const numbered = withLineNumbers(slice, start);
  const { text, truncated } = truncateForModel(numbered);

  const notes: string[] = [];
  if (end < totalLines) {
    notes.push(
      `Showing lines ${start}-${end} of ${totalLines}. Read further with start_line: ${end + 1}.`,
    );
  }

  return {
    content: notes.length > 0 ? `${text}\n\n[${notes.join(" ")}]` : text,
    summary: `Read ${resolved.relative} (${slice.length} line${slice.length === 1 ? "" : "s"})`,
    meta: {
      path: resolved.relative,
      totalLines,
      startLine: start,
      endLine: end,
      truncated,
    },
  };
};

// ---------------------------------------------------------------------------
// list_dir
// ---------------------------------------------------------------------------

export const listDirTool: ToolHandler<"list_dir"> = async (input, ctx) => {
  const resolved = await resolveInWorkspace(input.path, ctx.roots);

  let info;
  try {
    info = await stat(resolved.absolute);
  } catch {
    return failure(`Missing ${resolved.relative || "."}`, `Directory not found: ${input.path}.`);
  }
  if (!info.isDirectory()) {
    return failure(
      `${resolved.relative} is a file`,
      `${resolved.relative} is a file, not a directory. Use read_file instead.`,
    );
  }

  // The path already passed containment, so a root necessarily contains it.
  const workspace = ctx.workspaces.owning(resolved.absolute) ?? ctx.workspace;
  if (!workspace) {
    throw new RpcError(ErrorCode.WorkspaceNotFound, "No workspace owns this path");
  }

  const entries = await ctx.workspaces.listDir(workspace, resolved.absolute);
  if (entries.length === 0) {
    return {
      content: `${resolved.relative || "."} is empty (or everything in it is ignored).`,
      summary: `Listed ${resolved.relative || "."} (empty)`,
      meta: { path: resolved.relative, entries: [] },
    };
  }

  const lines = entries.map((entry) => {
    if (entry.kind === "directory") return `${entry.name}/`;
    if (entry.kind === "symlink") return `${entry.name} -> (symlink)`;
    const size = entry.sizeBytes === undefined ? "" : ` (${formatBytes(entry.sizeBytes)})`;
    return `${entry.name}${size}`;
  });

  const { text } = truncateForModel(lines.join("\n"));
  const dirCount = entries.filter((e) => e.kind === "directory").length;

  return {
    content: `${resolved.relative || "."}:\n${text}`,
    summary: `Listed ${resolved.relative || "."} (${dirCount} dir${dirCount === 1 ? "" : "s"}, ${entries.length - dirCount} file${entries.length - dirCount === 1 ? "" : "s"})`,
    meta: { path: resolved.relative, entries },
  };
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// write_file
// ---------------------------------------------------------------------------

export const writeFileTool: ToolHandler<"write_file"> = async (input, ctx) => {
  const resolved = await resolveInWorkspace(input.path, ctx.roots);

  let existing: string | null = null;
  let existingInfo: { mtimeMs: number; size: number } | null = null;
  try {
    const info = await stat(resolved.absolute);
    if (info.isDirectory()) {
      return failure(
        `${resolved.relative} is a directory`,
        `Cannot write to ${resolved.relative}: it is a directory.`,
      );
    }
    existingInfo = stamp(info);
    const buffer = await readFile(resolved.absolute);
    existing = looksBinary(buffer) ? null : buffer.toString("utf8");
  } catch (cause) {
    if ((cause as NodeJS.ErrnoException).code !== "ENOENT") throw cause;
  }

  if (existingInfo) {
    const stale = ctx.files.staleReason(resolved.absolute, existingInfo);
    if (stale) {
      return failure(
        `Blocked overwrite of ${resolved.relative}`,
        `Refusing to overwrite ${resolved.relative} because ${stale}. Read it first, then write.`,
      );
    }
  }

  await mkdir(path.dirname(resolved.absolute), { recursive: true });
  await writeFile(resolved.absolute, input.content, "utf8");

  const info = await stat(resolved.absolute);
  ctx.files.markWritten(resolved.absolute, stamp(info));
  invalidateIgnoresIfNeeded(ctx, resolved.absolute);

  const created = existingInfo === null;
  const lineCount = countLines(input.content);
  const diff = created ? "" : unifiedDiff(existing ?? "", input.content, resolved.relative);
  const stats = created
    ? { added: lineCount, removed: 0 }
    : diffStats(existing ?? "", input.content);

  return {
    content: created
      ? `Created ${resolved.relative} (${lineCount} lines).`
      : `Updated ${resolved.relative} (+${stats.added} -${stats.removed}).`,
    summary: created
      ? `Created ${resolved.relative}`
      : `Wrote ${resolved.relative} (+${stats.added} -${stats.removed})`,
    meta: { path: resolved.relative, created, diff, ...stats },
  };
};

// ---------------------------------------------------------------------------
// edit_file
// ---------------------------------------------------------------------------

export const editFileTool: ToolHandler<"edit_file"> = async (input, ctx) => {
  const resolved = await resolveInWorkspace(input.path, ctx.roots);

  let info;
  try {
    info = await stat(resolved.absolute);
  } catch {
    return failure(
      `Missing ${resolved.relative}`,
      `Cannot edit ${resolved.relative}: file not found. Use write_file to create it.`,
    );
  }
  if (info.isDirectory()) {
    return failure(
      `${resolved.relative} is a directory`,
      `Cannot edit ${resolved.relative}: it is a directory.`,
    );
  }

  const stale = ctx.files.staleReason(resolved.absolute, stamp(info));
  if (stale) {
    return failure(
      `Stale edit to ${resolved.relative}`,
      `Refusing to edit ${resolved.relative} because ${stale}. Read the current contents, then edit.`,
    );
  }

  const buffer = await readFile(resolved.absolute);
  if (looksBinary(buffer)) {
    return failure(
      `${resolved.relative} is binary`,
      `Cannot edit ${resolved.relative}: it is a binary file.`,
    );
  }
  const original = buffer.toString("utf8");

  // Normalize to LF for matching so a CRLF file does not silently fail to match an
  // LF-authored old_string — the single most confusing edit failure on Windows.
  const usesCrlf = original.includes("\r\n");
  const source = usesCrlf ? original.replace(/\r\n/g, "\n") : original;
  const target = normalizeForMatch(input.old_string);
  const replacement = normalizeForMatch(input.new_string);

  if (target === "") {
    return failure(
      `Empty match for ${resolved.relative}`,
      "old_string must not be empty. To create a file, use write_file.",
    );
  }
  if (target === replacement) {
    return failure(
      `No-op edit to ${resolved.relative}`,
      "old_string and new_string are identical, so this edit would change nothing.",
    );
  }

  const occurrences = countOccurrences(source, target);
  if (occurrences === 0) {
    const hint = suggestMatchFailure(source, target);
    return failure(
      `No match in ${resolved.relative}`,
      `old_string was not found in ${resolved.relative}.${hint} Read the file and copy the exact text, including indentation.`,
    );
  }
  if (occurrences > 1 && input.replace_all !== true) {
    return failure(
      `Ambiguous edit to ${resolved.relative}`,
      `old_string appears ${occurrences} times in ${resolved.relative}. Add surrounding lines to make it unique, or pass replace_all: true to change all ${occurrences}.`,
    );
  }

  const updated =
    input.replace_all === true
      ? source.split(target).join(replacement)
      : source.replace(target, replacement);

  const finalText = usesCrlf ? updated.replace(/\n/g, "\r\n") : updated;
  await writeFile(resolved.absolute, finalText, "utf8");

  const after = await stat(resolved.absolute);
  ctx.files.markWritten(resolved.absolute, stamp(after));
  invalidateIgnoresIfNeeded(ctx, resolved.absolute);

  const stats = diffStats(source, updated);
  const diff = unifiedDiff(source, updated, resolved.relative);
  const replaced = input.replace_all === true ? occurrences : 1;

  return {
    content: `Edited ${resolved.relative}: ${replaced} replacement${replaced === 1 ? "" : "s"} (+${stats.added} -${stats.removed}).`,
    summary: `Edited ${resolved.relative} (+${stats.added} -${stats.removed})`,
    meta: { path: resolved.relative, diff, replaced, ...stats },
  };
};

function normalizeForMatch(text: string): string {
  return stripLineNumberPrefixes(text.replace(/\r\n/g, "\n"));
}

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count++;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

/**
 * Explain a near-miss.
 *
 * Whitespace is behind most match failures, and "not found" with no diagnosis sends
 * the agent into a re-read/retry loop. Naming the likely cause usually gets it right
 * on the second attempt instead of the fourth.
 */
function suggestMatchFailure(source: string, target: string): string {
  const collapse = (text: string) => text.replace(/[ \t]+/g, " ").trim();
  if (source.includes(target.trim()) && target.trim() !== target) {
    return " A match exists ignoring leading/trailing whitespace.";
  }
  const collapsedSource = collapse(source);
  if (collapsedSource.includes(collapse(target))) {
    return " A match exists if indentation is ignored — the file's whitespace differs from what you sent.";
  }
  const firstLine = target.split("\n")[0]?.trim();
  if (firstLine && firstLine.length > 8 && source.includes(firstLine)) {
    return ` The first line of old_string ("${firstLine.slice(0, 60)}") is present, so the mismatch is in a later line.`;
  }
  return "";
}

// ---------------------------------------------------------------------------
// delete_file
// ---------------------------------------------------------------------------

export const deleteFileTool: ToolHandler<"delete_file"> = async (input, ctx) => {
  const resolved = await resolveInWorkspace(input.path, ctx.roots);

  let info;
  try {
    info = await stat(resolved.absolute);
  } catch {
    return failure(
      `Missing ${resolved.relative}`,
      `Cannot delete ${resolved.relative}: file not found.`,
    );
  }
  if (info.isDirectory()) {
    return failure(
      `${resolved.relative} is a directory`,
      `Cannot delete ${resolved.relative}: it is a directory. delete_file only removes files.`,
    );
  }

  await unlink(resolved.absolute);
  ctx.files.forget(resolved.absolute);
  invalidateIgnoresIfNeeded(ctx, resolved.absolute);

  return {
    content: `Deleted ${resolved.relative}.`,
    summary: `Deleted ${resolved.relative}`,
    meta: { path: resolved.relative, sizeBytes: info.size },
  };
};

/** A touched `.gitignore` changes what every later walk sees. */
function invalidateIgnoresIfNeeded(
  ctx: { workspaces: { invalidateIgnores(dir?: string): void } },
  absolutePath: string,
): void {
  if (toPosix(absolutePath).endsWith("/.gitignore")) {
    ctx.workspaces.invalidateIgnores(path.dirname(absolutePath));
  }
}
