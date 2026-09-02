/**
 * Tool registry: the schemas the model sees, and the context tools run in.
 *
 * The schemas here are **frozen literals**. Prompt caching is a prefix match over
 * `tools` → `system` → `messages`, so a `tools` block assembled from live state —
 * "add a lint tool if there's an eslint config" — silently invalidates the cache on
 * every request and multiplies the bill. Building them once, as constants, is not a
 * micro-optimization; on a 200k-token context it is the difference between $0.06
 * and $0.60 per turn.
 *
 * The one sanctioned variation is `codebase_search`, which is omitted until a
 * semantic index exists, and `fetch_rules`, which is omitted until the workspace has
 * rules worth fetching. Each flips once per workspace, not once per turn.
 *
 * Copyright (c) 2026 Origin AI
 */

import type { SessionEvent, TodoItem, ToolInputMap, ToolName } from "@trace/protocol";
import type { FileStateTracker } from "../file-state.js";
import type { Logger } from "../logger.js";
import type { RuleSet } from "../rules.js";
import type { SettingsStore } from "../settings.js";
import type { Workspace, WorkspaceRegistry } from "../workspace.js";

/**
 * Anthropic tool-definition shape. Declared locally rather than imported from the
 * SDK so this module stays a plain data file with no runtime dependency.
 */
export interface ToolDefinition {
  name: ToolName;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * Result of running a tool.
 *
 * The split between `content` and `meta` is the important part: `content` is what
 * the model reads and pays for, `meta` is what the UI renders for free. A file
 * edit's unified diff belongs in `meta` — the model already knows what it wrote,
 * and re-feeding it the diff is pure token waste.
 */
export interface ToolResult {
  /** Text handed to the model as `tool_result` content. */
  content: string;
  /** Sets `is_error` on the tool_result block. The model sees the message and retries. */
  isError?: boolean;
  /** One line for the transcript: "Read src/app.ts (120 lines)". */
  summary: string;
  /** Structured extras for the UI only. Never sent to the model. */
  meta?: Record<string, unknown>;
}

/**
 * Everything a tool is allowed to touch. Passed fresh per call.
 *
 * Note what is *absent*: there is no permission callback here. Tools do not gate
 * themselves — the turn loop adjudicates every call before dispatch, so approval
 * logic lives in exactly one file and cannot be forgotten when a tool is added.
 */
export interface ToolContext {
  readonly sessionId: string;
  readonly turnId: string;
  /** The model's `tool_use.id`. Correlates permission prompts with calls. */
  readonly callId: string;
  readonly workspaces: WorkspaceRegistry;
  /** Null in the "No Repo" case — file tools then resolve against `roots`. */
  readonly workspace: Workspace | null;
  /** Roots for path containment. Always non-empty when file tools are reachable. */
  readonly roots: readonly string[];
  readonly settings: SettingsStore;
  readonly log: Logger;
  /** Aborts on user interrupt. Long-running tools must honour it. */
  readonly signal: AbortSignal;
  /** Emit a mid-call event (progress, a requested work panel). */
  readonly emit: (event: SessionEvent) => void;
  /** Read-before-write bookkeeping, shared across the session. */
  readonly files: FileStateTracker;
  /** Live todo list for this session, owned by the turn and mutated by `todo_write`. */
  readonly todos: { get(): TodoItem[]; set(next: TodoItem[]): void };
  /**
   * The rule set this turn was assembled with.
   *
   * A snapshot, not a loader: `fetch_rules` must hand back the same text the prompt's
   * rule index advertised, and a mid-turn edit to a rule file changing what a name
   * resolves to would make the model's own citation wrong.
   */
  readonly rules: RuleSet;
}

export type ToolHandler<K extends ToolName> = (
  input: ToolInputMap[K],
  ctx: ToolContext,
) => Promise<ToolResult>;

export type ToolHandlerMap = { [K in ToolName]: ToolHandler<K> };

// ---------------------------------------------------------------------------
// Output limits
// ---------------------------------------------------------------------------

/**
 * Roughly 15k tokens. Past this a tool result stops informing the model and starts
 * crowding out the conversation, so truncating with an explicit marker — which the
 * model can act on by narrowing its query — beats silently blowing the context.
 */
export const MAX_TOOL_RESULT_CHARS = 60_000;

/** Default cap for a whole-file read. Larger files require explicit line ranges. */
export const DEFAULT_READ_LINE_LIMIT = 2_000;

export function truncateForModel(
  text: string,
  limit = MAX_TOOL_RESULT_CHARS,
): { text: string; truncated: boolean } {
  if (text.length <= limit) return { text, truncated: false };
  const head = text.slice(0, limit);
  // Cut at the last newline so we never hand the model half a line.
  const lastNewline = head.lastIndexOf("\n");
  const body = lastNewline > limit * 0.8 ? head.slice(0, lastNewline) : head;
  const omitted = text.length - body.length;
  return {
    text: `${body}\n\n[truncated: ${omitted.toLocaleString()} more characters. Narrow the range or filter to see the rest.]`,
    truncated: true,
  };
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const readFile: ToolDefinition = {
  name: "read_file",
  description:
    "Read a file from the workspace. Returns contents with 1-indexed line numbers prefixed. " +
    "Prefer reading a whole file over guessing at ranges — partial context is the most common cause of a bad edit. " +
    "Use start_line/end_line only for files too large to read at once.",
  input_schema: {
    type: "object",
    properties: {
      path: { type: "string", description: "Workspace-relative path to the file." },
      start_line: { type: "integer", description: "1-indexed first line to read, inclusive." },
      end_line: { type: "integer", description: "1-indexed last line to read, inclusive." },
    },
    required: ["path"],
  },
};

const listDir: ToolDefinition = {
  name: "list_dir",
  description:
    "List the immediate contents of a directory. Respects .gitignore. " +
    "Use this to orient in an unfamiliar tree before searching.",
  input_schema: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: 'Workspace-relative directory path. Use "." for the workspace root.',
      },
    },
    required: ["path"],
  },
};

const glob: ToolDefinition = {
  name: "glob",
  description:
    "Find files by path pattern. Supports * (within a segment) and ** (any depth). " +
    "Returns paths sorted by most-recently-modified first, which usually surfaces the relevant file. " +
    "Use this when you know roughly what a file is called; use grep when you know what is in it.",
  input_schema: {
    type: "object",
    properties: {
      pattern: { type: "string", description: 'Glob pattern, e.g. "src/**/*.tsx".' },
      path: { type: "string", description: "Workspace-relative directory to search under." },
    },
    required: ["pattern"],
  },
};

const grep: ToolDefinition = {
  name: "grep",
  description:
    "Search file contents by regular expression (Rust regex syntax, ripgrep-backed). " +
    "Respects .gitignore and skips binary files. Escape literal braces: `interface\\{\\}`. " +
    "Returns file:line:text matches. Prefer this over reading many files speculatively.",
  input_schema: {
    type: "object",
    properties: {
      pattern: { type: "string", description: "Regular expression to search for." },
      path: { type: "string", description: "Workspace-relative file or directory to search." },
      include: { type: "string", description: 'Glob filter on filenames, e.g. "*.ts".' },
      case_sensitive: {
        type: "boolean",
        description:
          "Default false (smart-case: case-insensitive unless the pattern has uppercase).",
      },
    },
    required: ["pattern"],
  },
};

const codebaseSearch: ToolDefinition = {
  name: "codebase_search",
  description:
    "Semantic search over the indexed codebase. Ask in natural language — " +
    '"where is the retry logic for failed uploads" — and get the most relevant code back. ' +
    "Use this when you do not know the exact identifier to grep for. Complements grep, not a replacement: " +
    "grep is exact and complete, this is fuzzy and ranked.",
  input_schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Natural-language description of what to find." },
      target_directories: {
        type: "array",
        items: { type: "string" },
        description: "Optional workspace-relative directories to restrict the search to.",
      },
    },
    required: ["query"],
  },
};

const writeFile: ToolDefinition = {
  name: "write_file",
  description:
    "Create a new file, or fully replace an existing one. " +
    "To change part of a file, use edit_file — write_file discards anything you did not include. " +
    "Overwriting a file you have not read will be rejected.",
  input_schema: {
    type: "object",
    properties: {
      path: { type: "string", description: "Workspace-relative path." },
      content: { type: "string", description: "Complete file contents." },
    },
    required: ["path", "content"],
  },
};

const editFile: ToolDefinition = {
  name: "edit_file",
  description:
    "Replace an exact string in a file. old_string must appear exactly once, including whitespace " +
    "and indentation, or the call fails rather than guessing — include surrounding lines to disambiguate. " +
    "Strip any line-number prefix added by read_file before matching. Set replace_all to change every occurrence.",
  input_schema: {
    type: "object",
    properties: {
      path: { type: "string", description: "Workspace-relative path." },
      old_string: { type: "string", description: "Exact text to replace." },
      new_string: { type: "string", description: "Replacement text." },
      replace_all: {
        type: "boolean",
        description: "Replace every occurrence instead of requiring uniqueness.",
      },
    },
    required: ["path", "old_string", "new_string"],
  },
};

const deleteFile: ToolDefinition = {
  name: "delete_file",
  description: "Delete a file. Does not delete directories. Reversible via the turn's checkpoint.",
  input_schema: {
    type: "object",
    properties: {
      path: { type: "string", description: "Workspace-relative path." },
    },
    required: ["path"],
  },
};

const runTerminalCmd: ToolDefinition = {
  name: "run_terminal_cmd",
  description:
    "Run a shell command in the workspace. Returns combined stdout and stderr plus the exit code. " +
    "Non-interactive: commands that wait for input will hit the timeout, so pass non-interactive flags " +
    "(--yes, --no-pager) and never launch an editor or pager. Prefer the dedicated file and search tools " +
    "over cat/ls/grep — they are faster and their output is rendered properly.",
  input_schema: {
    type: "object",
    properties: {
      command: { type: "string", description: "The command to run." },
      cwd: {
        type: "string",
        description: "Workspace-relative working directory. Defaults to the root.",
      },
      timeout_ms: {
        type: "integer",
        description: "Kill after this many ms. Default 120000, max 600000.",
      },
      is_read_only: {
        type: "boolean",
        description:
          "Set true when the command only inspects state. Advisory — it does not bypass the permission gate.",
      },
    },
    required: ["command"],
  },
};

const todoWrite: ToolDefinition = {
  name: "todo_write",
  description:
    "Record or update the task list for the current work. Send the full list every time — it replaces the previous one. " +
    "Use it for multi-step work so progress is visible; skip it for anything you can finish in one or two steps. " +
    "Keep exactly one item in_progress at a time and mark items completed as you finish them, not in a batch at the end.",
  input_schema: {
    type: "object",
    properties: {
      todos: {
        type: "array",
        description: "The complete task list, in order.",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "Stable identifier, reused across updates." },
            content: { type: "string", description: "Imperative description of the task." },
            status: {
              type: "string",
              enum: ["pending", "in_progress", "completed", "cancelled"],
            },
          },
          required: ["id", "content", "status"],
        },
      },
    },
    required: ["todos"],
  },
};

const fetchRules: ToolDefinition = {
  name: "fetch_rules",
  description:
    "Retrieve the full text of project rules listed by name in the system prompt's rule index. " +
    "Fetch a rule when its description suggests it governs what you are about to do — conventions, " +
    "review criteria, deployment steps — and do it before writing code rather than after. " +
    "Rules already included in the system prompt are not listed and cannot be fetched.",
  input_schema: {
    type: "object",
    properties: {
      rule_names: {
        type: "array",
        items: { type: "string" },
        description:
          'Rule names exactly as listed in the index, e.g. ["testing", "review:security"].',
      },
    },
    required: ["rule_names"],
  },
};

/**
 * The full set, in a fixed order. Order is part of the cache key, so this array is
 * append-only in practice: reordering it invalidates every cached prefix in flight.
 */
export const TOOL_DEFINITIONS: readonly ToolDefinition[] = Object.freeze([
  readFile,
  listDir,
  glob,
  grep,
  codebaseSearch,
  writeFile,
  editFile,
  deleteFile,
  runTerminalCmd,
  todoWrite,
  fetchRules,
]);

const DEFINITIONS_BY_NAME = new Map(TOOL_DEFINITIONS.map((d) => [d.name, d]));

export function toolDefinition(name: ToolName): ToolDefinition | undefined {
  return DEFINITIONS_BY_NAME.get(name);
}

/**
 * The `tools` array for a request.
 *
 * Filtering happens here and nowhere else, so there is exactly one place to audit
 * when a cache hit rate looks wrong. Both flags describe a workspace's capabilities
 * rather than a turn's, which is what makes them safe to vary: they settle early and
 * then hold for the life of the session.
 */
export function toolsForRequest(options: {
  hasSemanticIndex: boolean;
  hasRules: boolean;
}): ToolDefinition[] {
  return TOOL_DEFINITIONS.filter((definition) => {
    if (definition.name === "codebase_search") return options.hasSemanticIndex;
    if (definition.name === "fetch_rules") return options.hasRules;
    return true;
  });
}
