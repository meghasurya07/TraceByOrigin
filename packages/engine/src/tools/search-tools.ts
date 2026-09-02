/**
 * Search tools: glob, grep, codebase_search.
 *
 * `grep` shells out to the ripgrep binary that ships with `@vscode/ripgrep` — the
 * same one VS Code uses. That is not laziness: a JS regex scan over a monorepo is
 * two orders of magnitude slower, and search latency is the single most visible
 * quality signal in an agent's tool loop. The agent that can afford to search
 * three times is the agent that finds the right file.
 *
 * `glob` walks the workspace ourselves rather than adding a second search binary,
 * because it needs the same gitignore semantics as the file tree and the indexer.
 *
 * Copyright (c) 2026 Origin AI
 */

import { execFile } from "node:child_process";
import { stat } from "node:fs/promises";
import path from "node:path";
import { rgPath } from "@vscode/ripgrep";
import picomatch from "picomatch";
import type { SearchMatch } from "@trace/protocol";
import { toPosix } from "../paths.js";
import { truncateForModel, type ToolHandler, type ToolResult } from "./registry.js";

const MAX_GLOB_RESULTS = 500;
const MAX_GREP_MATCHES = 300;
const SEARCH_TIMEOUT_MS = 30_000;

function failure(summary: string, content: string): ToolResult {
  return { content, isError: true, summary };
}

/**
 * Resolve the ripgrep binary, correcting for Electron's asar packaging.
 *
 * Inside a packaged app the module path lands in `app.asar`, which is a virtual
 * archive — `spawn` cannot execute a file inside it. Electron unpacks native and
 * binary assets to a sibling `app.asar.unpacked`, so the path needs rewriting.
 * Computed once: it cannot change at runtime.
 */
const RIPGREP_BIN = rgPath.includes(`app.asar${path.sep}`)
  ? rgPath.replace(`app.asar${path.sep}`, `app.asar.unpacked${path.sep}`)
  : rgPath;

// ---------------------------------------------------------------------------
// glob
// ---------------------------------------------------------------------------

export const globTool: ToolHandler<"glob"> = async (input, ctx) => {
  const workspace = ctx.workspace ?? ctx.workspaces.list()[0];
  if (!workspace) {
    return failure("No workspace", "No workspace is open, so there is nothing to search.");
  }

  const from = input.path ? toPosix(input.path).replace(/^\.\/?/, "") : undefined;
  const pattern = toPosix(input.pattern);

  // A pattern with no `/` is matched against the basename, so `*.ts` finds files at
  // any depth — which is what people mean, and what fd and VS Code both do.
  const basenameOnly = !pattern.includes("/");
  const isMatch = picomatch(basenameOnly ? `**/${pattern}` : pattern, { dot: true });

  const matches: { path: string; modifiedAt: number }[] = [];
  let scanned = 0;

  for await (const relative of ctx.workspaces.walkFiles(
    workspace,
    from === undefined ? {} : { from },
  )) {
    if (ctx.signal.aborted) break;
    scanned++;
    // Patterns are written relative to the search root, not the workspace root.
    const subject = from === undefined ? relative : toPosix(path.relative(from, relative));
    if (subject.startsWith("..")) continue;
    if (!isMatch(subject)) continue;

    let modifiedAt = 0;
    try {
      const info = await stat(path.join(workspace.root, relative));
      modifiedAt = info.mtimeMs;
    } catch {
      // Raced with a delete. Rank it last rather than dropping it.
    }
    matches.push({ path: relative, modifiedAt });
    if (matches.length >= MAX_GLOB_RESULTS * 2) break;
  }

  if (matches.length === 0) {
    return {
      content: `No files match "${input.pattern}"${from ? ` under ${from}` : ""}. Scanned ${scanned} files. Check the pattern, or use list_dir to see what is actually there.`,
      summary: `No matches for ${input.pattern}`,
      meta: { pattern: input.pattern, matched: 0, scanned },
    };
  }

  // Most-recently-modified first: in an active repo the file you want is almost
  // always one someone touched recently.
  matches.sort((a, b) => b.modifiedAt - a.modifiedAt);
  const shown = matches.slice(0, MAX_GLOB_RESULTS);
  const suffix =
    matches.length > shown.length
      ? `\n\n[${matches.length - shown.length} more matches not shown. Narrow the pattern.]`
      : "";

  return {
    content: shown.map((m) => m.path).join("\n") + suffix,
    summary: `Found ${matches.length} file${matches.length === 1 ? "" : "s"} matching ${input.pattern}`,
    meta: { pattern: input.pattern, matched: matches.length, scanned },
  };
};

// ---------------------------------------------------------------------------
// grep
// ---------------------------------------------------------------------------

export interface TextSearchOptions {
  pattern: string;
  /** Workspace-relative subdirectory. Omitted searches the whole workspace. */
  path?: string;
  /** ripgrep glob, e.g. `*.ts`. */
  include?: string;
  /** Default is smart-case: insensitive until the pattern itself has an uppercase letter. */
  caseSensitive?: boolean;
  /** False searches for the pattern literally. Default is a Rust regex. */
  isRegex?: boolean;
  limit?: number;
  signal?: AbortSignal;
}

export interface TextSearchOutcome {
  matches: SearchMatch[];
  /** True when the cap was reached, so the caller can say the list is partial. */
  truncated: boolean;
}

/**
 * Run ripgrep and return structured matches.
 *
 * Shared by the `grep` tool and the `search/text` method, which need the same search and
 * differ only in how they present it: the tool renders `path:line:text` for the model,
 * while the search panel wants columns and a truncation flag. Splitting here rather than
 * at the tool boundary means the agent and the user's own search find the same things —
 * a discrepancy there is the kind of bug nobody thinks to look for.
 *
 * Throws on a ripgrep failure. Exit code 1 (no matches) is not one.
 */
export async function textSearch(
  workspace: { root: string },
  options: TextSearchOptions,
): Promise<TextSearchOutcome> {
  const limit = Math.max(1, Math.min(options.limit ?? MAX_GREP_MATCHES, MAX_GREP_MATCHES));
  const searchRoot = options.path
    ? path.resolve(workspace.root, toPosix(options.path).replace(/^\.\/?/, ""))
    : workspace.root;

  const args = [
    "--json",
    "--hidden",
    // ripgrep honours .gitignore by default; these are the dirs we skip regardless.
    "--glob",
    "!.git/**",
    "--glob",
    "!node_modules/**",
    "--max-count",
    String(limit),
    "--max-filesize",
    "10M",
  ];
  // Smart-case: case-insensitive until the pattern itself contains uppercase. Gives
  // the forgiving default without making an intentional `TODO` search noisy.
  args.push(options.caseSensitive === true ? "--case-sensitive" : "--smart-case");
  if (options.include) args.push("--glob", options.include);
  args.push(
    options.isRegex === false ? "--fixed-strings" : "--regexp",
    options.pattern,
    searchRoot,
  );

  const stdout = await runRipgrep(args, workspace.root, options.signal);

  const matches: SearchMatch[] = [];
  let truncated = false;
  for (const raw of stdout.split("\n")) {
    if (raw === "") continue;
    let event: RipgrepEvent;
    try {
      event = JSON.parse(raw) as RipgrepEvent;
    } catch {
      continue;
    }
    if (event.type !== "match") continue;

    const absolute = event.data.path.text;
    if (absolute === undefined) continue;
    if (matches.length >= limit) {
      truncated = true;
      break;
    }
    matches.push({
      path: toPosix(path.relative(workspace.root, absolute)),
      line: event.data.line_number ?? 0,
      column: (event.data.submatches[0]?.start ?? 0) + 1,
      // Long minified lines would blow the budget on a single match.
      text: (event.data.lines.text ?? "").replace(/\r?\n$/, "").slice(0, 400),
    });
  }
  return { matches, truncated };
}

export const grepTool: ToolHandler<"grep"> = async (input, ctx) => {
  const workspace = ctx.workspace ?? ctx.workspaces.list()[0];
  if (!workspace) {
    return failure("No workspace", "No workspace is open, so there is nothing to search.");
  }

  let matches: SearchMatch[];
  try {
    ({ matches } = await textSearch(workspace, {
      pattern: input.pattern,
      ...(input.path === undefined ? {} : { path: input.path }),
      ...(input.include === undefined ? {} : { include: input.include }),
      ...(input.case_sensitive === undefined ? {} : { caseSensitive: input.case_sensitive }),
      signal: ctx.signal,
    }));
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    if (/regex parse error|unclosed|repetition/i.test(message)) {
      return failure(
        `Invalid regex`,
        `Invalid regular expression: ${message.trim()}\n\nripgrep uses Rust regex syntax — escape literal braces as \\{ \\} and note that lookarounds are unsupported.`,
      );
    }
    return failure("Search failed", `Search failed: ${message}`);
  }

  if (matches.length === 0) {
    return {
      content: `No matches for /${input.pattern}/${input.include ? ` in ${input.include} files` : ""}.`,
      summary: `No matches for ${input.pattern}`,
      meta: { pattern: input.pattern, matched: 0 },
    };
  }

  const rendered = matches.map((m) => `${m.path}:${m.line}:${m.text}`).join("\n");
  const { text, truncated } = truncateForModel(rendered);
  const files = new Set(matches.map((m) => m.path)).size;

  return {
    content: text,
    summary: `${matches.length} match${matches.length === 1 ? "" : "es"} in ${files} file${files === 1 ? "" : "s"}`,
    meta: { pattern: input.pattern, matched: matches.length, files, truncated, matches },
  };
};

interface RipgrepEvent {
  type: "begin" | "match" | "end" | "summary";
  data: {
    path: { text?: string };
    lines: { text?: string };
    line_number?: number;
    submatches: { start: number; end: number }[];
  };
}

function runRipgrep(args: string[], cwd: string, signal?: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      RIPGREP_BIN,
      args,
      {
        cwd,
        ...(signal ? { signal } : {}),
        timeout: SEARCH_TIMEOUT_MS,
        // A wide search can legitimately produce megabytes before we truncate.
        maxBuffer: 64 * 1024 * 1024,
        windowsHide: true,
      },
      (error, stdout, stderr) => {
        // ripgrep exits 1 for "no matches", which is not an error condition.
        const code = (error as (Error & { code?: number }) | null)?.code;
        if (error && code !== 1) {
          reject(new Error(stderr.trim() || error.message));
          return;
        }
        resolve(stdout);
      },
    );
  });
}

// ---------------------------------------------------------------------------
// codebase_search
// ---------------------------------------------------------------------------

/**
 * Placeholder until the semantic index lands.
 *
 * `toolsForRequest` omits this tool when no index exists, so the model should never
 * reach here. It stays implemented anyway: a tool_use block replayed from a cached
 * prefix can arrive after the index is dropped, and answering with a usable
 * redirect is better than a protocol error.
 */
export const codebaseSearchTool: ToolHandler<"codebase_search"> = async (input) => {
  return failure(
    "Semantic search unavailable",
    `Semantic search is not available for this workspace (no index has been built). ` +
      `Use grep for exact text and glob for filenames instead — for "${input.query}", ` +
      `pick the most distinctive identifier you would expect in that code and grep for it.`,
  );
};
