/**
 * The agent's tool surface, and the permission model that gates it.
 *
 * Two rules drove this design, both learned from how the incumbents behave:
 *
 * 1. **The tool set must be byte-stable across a session.** Prompt caching is a
 *    prefix match over `tools` → `system` → `messages`. A tool list that varies
 *    per turn silently destroys the cache and multiplies cost. So tool *names* and
 *    *schemas* are frozen constants here, never built per-request from live state.
 *
 * 2. **Every side effect is classified before it runs.** Read-only tools stream
 *    freely; anything that writes to disk or spawns a process passes through
 *    `PermissionDecision`. This is the mechanism behind auto-approve rules,
 *    the deny-list, and YOLO mode — one gate, not scattered `if` statements.
 *
 * Copyright (c) 2026 Origin AI
 */

/**
 * v1 tool set. Intentionally small: these ten cover essentially everything a
 * coding agent does, and each one added past this point is a permanent tax on
 * every request's cached prefix.
 *
 * `codebase_search` is declared here but gated behind the semantic index landing —
 * the engine omits it from `tools` until an index exists for the workspace, which
 * is the one sanctioned cache-prefix variation (it changes once, at index-ready).
 */
export const TOOL_NAMES = [
  "read_file",
  "list_dir",
  "glob",
  "grep",
  "codebase_search",
  "write_file",
  "edit_file",
  "delete_file",
  "run_terminal_cmd",
  "todo_write",
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

export function isToolName(value: string): value is ToolName {
  return (TOOL_NAMES as readonly string[]).includes(value);
}

/**
 * What a tool can do to the world. Drives both the permission gate and the
 * checkpoint system — `mutate` calls are what a checkpoint has to be able to undo.
 */
export type ToolEffect =
  /** Reads workspace state. No side effects. Never prompts. */
  | "read"
  /** Creates, modifies, or deletes files. Checkpointed and reversible. */
  | "mutate"
  /** Spawns a process. Arbitrary effects, not reversible. Strictest gate. */
  | "execute"
  /** Changes only agent-internal state (e.g. the todo list). Never prompts. */
  | "meta";

export const TOOL_EFFECTS: Readonly<Record<ToolName, ToolEffect>> = {
  read_file: "read",
  list_dir: "read",
  glob: "read",
  grep: "read",
  codebase_search: "read",
  write_file: "mutate",
  edit_file: "mutate",
  delete_file: "mutate",
  run_terminal_cmd: "execute",
  todo_write: "meta",
};

// ---------------------------------------------------------------------------
// Tool inputs
//
// These mirror the JSON Schemas the engine sends to the model. They exist so the
// UI can render a typed, human-readable summary of a pending call ("write 41 lines
// to src/app.ts") instead of dumping raw JSON at the user — which is the difference
// between a permission prompt someone can actually judge and one they rubber-stamp.
// ---------------------------------------------------------------------------

export interface ReadFileInput {
  /** Workspace-relative path. Absolute paths and `..` escapes are rejected. */
  path: string;
  /** 1-indexed, inclusive. Omit both to read the whole file. */
  start_line?: number;
  end_line?: number;
}

export interface ListDirInput {
  path: string;
}

export interface GlobInput {
  /** e.g. `src/**\/*.tsx` */
  pattern: string;
  path?: string;
}

export interface GrepInput {
  /** Rust regex syntax — the engine shells out to bundled ripgrep. */
  pattern: string;
  path?: string;
  /** Ripgrep `--glob` filter, e.g. `*.ts`. */
  include?: string;
  case_sensitive?: boolean;
}

export interface CodebaseSearchInput {
  /** Natural-language query resolved against the local semantic index. */
  query: string;
  target_directories?: string[];
}

export interface WriteFileInput {
  path: string;
  content: string;
}

export interface EditFileInput {
  path: string;
  /** Must match the file exactly once, or the call fails rather than guessing. */
  old_string: string;
  new_string: string;
  replace_all?: boolean;
}

export interface DeleteFileInput {
  path: string;
}

export interface RunTerminalCmdInput {
  command: string;
  /** Workspace-relative. Defaults to the workspace root. */
  cwd?: string;
  /** Hard kill after this many ms. Engine clamps to a ceiling. */
  timeout_ms?: number;
  /** Agent's own claim about reversibility — advisory input to the gate, never trusted alone. */
  is_read_only?: boolean;
}

export type TodoStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface TodoItem {
  id: string;
  content: string;
  status: TodoStatus;
}

export interface TodoWriteInput {
  todos: TodoItem[];
}

/** Maps each tool name to its input type, for exhaustive typed dispatch. */
export interface ToolInputMap {
  read_file: ReadFileInput;
  list_dir: ListDirInput;
  glob: GlobInput;
  grep: GrepInput;
  codebase_search: CodebaseSearchInput;
  write_file: WriteFileInput;
  edit_file: EditFileInput;
  delete_file: DeleteFileInput;
  run_terminal_cmd: RunTerminalCmdInput;
  todo_write: TodoWriteInput;
}

// ---------------------------------------------------------------------------
// Permission model
// ---------------------------------------------------------------------------

export type PermissionMode =
  /** Prompt for every `mutate` and `execute` call not covered by an allow rule. */
  | "ask"
  /** Auto-approve `mutate`; still prompt for `execute`. The practical default. */
  | "auto_edit"
  /** Auto-approve everything except explicit deny rules. Sandbox use only. */
  | "yolo"
  /** Refuse all `mutate` and `execute`. Read-only exploration and planning. */
  | "plan";

/**
 * A single rule. `pattern` is matched against a tool-specific subject:
 * a workspace-relative glob for file tools, the raw command string for
 * `run_terminal_cmd`. Deny always beats allow.
 */
export interface PermissionRule {
  tool: ToolName | "*";
  pattern?: string;
  action: "allow" | "deny" | "ask";
}

export interface PermissionSettings {
  mode: PermissionMode;
  /** Evaluated in order; first match wins, except that any `deny` match short-circuits. */
  rules: PermissionRule[];
}

/**
 * Ships as the default because it is the setting a careful engineer would pick:
 * edits are cheap to review and trivially revertible via checkpoints, while
 * shell commands are neither.
 */
export const DEFAULT_PERMISSION_SETTINGS: PermissionSettings = {
  mode: "auto_edit",
  rules: [
    // Non-negotiable guardrails. These sit above user config so that a
    // permissive allow-rule can never unlock them.
    { tool: "run_terminal_cmd", pattern: "rm -rf /*", action: "deny" },
    { tool: "run_terminal_cmd", pattern: "*git push --force*", action: "deny" },
    { tool: "run_terminal_cmd", pattern: "*git reset --hard*", action: "deny" },
    { tool: "write_file", pattern: "**/.env", action: "ask" },
    { tool: "write_file", pattern: "**/.env.*", action: "ask" },
    { tool: "delete_file", pattern: "**/.git/**", action: "deny" },

    // Common, obviously-safe commands. Prompting for these is what trains
    // users to stop reading prompts, which is worse than not prompting.
    { tool: "run_terminal_cmd", pattern: "git status*", action: "allow" },
    { tool: "run_terminal_cmd", pattern: "git diff*", action: "allow" },
    { tool: "run_terminal_cmd", pattern: "git log*", action: "allow" },
    { tool: "run_terminal_cmd", pattern: "ls*", action: "allow" },
    { tool: "run_terminal_cmd", pattern: "pwd", action: "allow" },
  ],
};

/** What the engine asks the user when a call needs adjudication. */
export interface PermissionRequest {
  /** Correlates with the model's `tool_use.id`. */
  callId: string;
  tool: ToolName;
  effect: ToolEffect;
  /** One line the user can judge at a glance: "Run `pnpm test` in ./packages/engine". */
  summary: string;
  /** The subject the rule engine matched on — path or command. */
  subject: string;
  /** Raw model-supplied input, for the "show details" disclosure. */
  input: unknown;
  /** For `mutate` calls: a unified diff preview, so approval is informed. */
  diffPreview?: string;
}

export type PermissionDecision =
  | { decision: "allow_once" }
  /** Persists an allow rule for this exact subject into workspace settings. */
  | { decision: "allow_always" }
  | { decision: "deny"; reason?: string }
  /** Deny, and stop the turn entirely rather than letting the agent route around it. */
  | { decision: "deny_and_abort"; reason?: string };
