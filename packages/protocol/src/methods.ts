/**
 * The engine's method surface.
 *
 * `RequestMap` and `NotificationMap` are the whole API. Both ends import them, so
 * a method rename is a compile error in every surface rather than a runtime 404 —
 * that is the entire reason this package exists as a separate build target.
 *
 * Naming: `namespace/verb`, lowerCamelCase verbs. Namespaces mirror the engine's
 * internal subsystems (workspace, session, fs, git, terminal, settings), which
 * keeps the routing table a flat switch instead of a parser.
 *
 * Copyright (c) 2026 Origin AI
 */

import type { SessionEvent, TurnCost, WorkPanelTarget } from "./events.js";
import type { PermissionDecision, PermissionSettings, TodoItem, ToolName } from "./tools.js";

// ---------------------------------------------------------------------------
// Handshake
// ---------------------------------------------------------------------------

export interface ClientInfo {
  /** e.g. "trace-desktop", "trace-cli", "trace-vscode". */
  name: string;
  version: string;
  /** Surfaces advertise what they can render so the engine can skip work. */
  capabilities: {
    /** Can show a permission prompt. False for headless/CI clients → rules only. */
    permissionPrompts: boolean;
    /** Can host the six-target work panel. */
    workPanel: boolean;
    /** Can host an interactive pty. */
    terminals: boolean;
  };
}

export interface InitializeParams {
  protocolVersion: number;
  client: ClientInfo;
  /** Absolute paths. May be empty — Trace supports the "No Repo" case. */
  workspaceRoots: string[];
}

export interface InitializeResult {
  protocolVersion: number;
  engineVersion: string;
  /** Which providers have a usable key. v1 is BYOK, so this can be all-false. */
  configuredProviders: string[];
  defaultModel: string;
}

// ---------------------------------------------------------------------------
// Workspace
// ---------------------------------------------------------------------------

export interface WorkspaceInfo {
  id: string;
  root: string;
  name: string;
  isGitRepo: boolean;
  currentBranch?: string;
  /** Semantic-index state, surfaced so the UI can show a progress affordance. */
  indexStatus: "absent" | "building" | "ready" | "stale" | "failed";
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export interface SessionSummary {
  id: string;
  workspaceId: string | null;
  title: string;
  createdAt: number;
  updatedAt: number;
  model: string;
  turnCount: number;
  /** True while a turn is in flight — drives the stop button and the agent list. */
  isActive: boolean;
  cumulativeCost: TurnCost;
}

/** One persisted entry in a session transcript. Mirrors the event stream, settled. */
export type TranscriptEntry =
  | { kind: "user_message"; turnId: string; at: number; text: string; attachments: Attachment[] }
  | { kind: "assistant_text"; turnId: string; at: number; text: string }
  | { kind: "assistant_thinking"; turnId: string; at: number; text: string }
  | {
      kind: "tool_call";
      turnId: string;
      at: number;
      callId: string;
      tool: ToolName;
      input: unknown;
      summary: string;
      ok: boolean;
      durationMs: number;
      resultPreview: string;
    }
  | { kind: "todos"; turnId: string; at: number; todos: TodoItem[] }
  | { kind: "checkpoint"; turnId: string; at: number; checkpointId: string; label: string }
  | { kind: "error"; turnId?: string; at: number; code: number; message: string };

export type Attachment =
  /** An @-mentioned file. Engine reads it and inlines the contents. */
  | { type: "file"; path: string }
  | { type: "directory"; path: string }
  /** Pasted or dropped image, base64. Enables screenshot-driven work. */
  | { type: "image"; mediaType: string; data: string }
  /** Explicit line range selection from the editor panel. */
  | { type: "selection"; path: string; startLine: number; endLine: number; text: string };

export interface CreateSessionParams {
  workspaceId?: string | null;
  model?: string;
  /** Seeds the session as a child of another — the "side chat" primitive. */
  parentSessionId?: string;
  /** For side chats: copy the parent's transcript so context carries over. */
  inheritContext?: boolean;
}

export interface PromptParams {
  sessionId: string;
  text: string;
  attachments?: Attachment[];
  /** Per-turn override; falls back to the session's model. */
  model?: string;
  /** Per-turn override of the permission mode (e.g. one-shot plan mode). */
  permissionMode?: PermissionSettings["mode"];
}

export interface PromptResult {
  /** Returned immediately; progress arrives as `session/event` notifications. */
  turnId: string;
}

// ---------------------------------------------------------------------------
// Filesystem / search / git
// ---------------------------------------------------------------------------

export interface DirEntry {
  name: string;
  path: string;
  kind: "file" | "directory" | "symlink";
  sizeBytes?: number;
  modifiedAt?: number;
}

export interface SearchMatch {
  path: string;
  line: number;
  column: number;
  text: string;
}

/**
 * One row in the `@` context picker.
 *
 * `name` is carried alongside `path` even though it is derivable from it, because the
 * picker renders the basename large and the directory small, and re-splitting a path in
 * a render function that runs for every row on every keystroke is work the engine has
 * already done.
 *
 * `score` is deliberately opaque. Ranking is the engine's job — it is the only side that
 * knows the ignore rules, the walk order, and the match positions — and a surface that
 * re-sorts on its own would disagree with the CLI about what the best match is.
 */
export interface FileCandidate {
  /** Workspace-relative, posix-slashed. What goes into an `Attachment`. */
  path: string;
  /** Basename, so the UI need not re-split. */
  name: string;
  kind: "file" | "directory";
  workspaceId: string;
  score: number;
}

export interface GitFileStatus {
  path: string;
  staged: boolean;
  status: "added" | "modified" | "deleted" | "renamed" | "untracked" | "conflicted";
}

export interface GitStatusResult {
  branch: string;
  ahead: number;
  behind: number;
  files: GitFileStatus[];
  /** True when a rebase/merge is in progress — the UI must not offer checkpoints then. */
  operationInProgress: boolean;
}

// ---------------------------------------------------------------------------
// Settings / BYOK
// ---------------------------------------------------------------------------

export interface EngineSettings {
  defaultModel: string;
  permissions: PermissionSettings;
  /** Hard ceiling on agent-loop iterations per turn. Backstop against runaway loops. */
  maxIterationsPerTurn: number;
  /** `output_config.effort`. `xhigh` is the right default for coding work. */
  effort: "low" | "medium" | "high" | "xhigh" | "max";
  /** Show the model's reasoning in the transcript. */
  showThinking: boolean;
  /** Write a shadow-git checkpoint before each mutating turn. */
  checkpointsEnabled: boolean;
}

/**
 * Keys are written to the OS credential store (Keychain / Credential Manager /
 * libsecret), never to disk in plaintext and never echoed back over the protocol.
 * `hasProviderKey` returns only a masked hint so a surface can render
 * "sk-ant-…4f2a" without ever holding the secret.
 */
export interface SetProviderKeyParams {
  provider: string;
  apiKey: string;
}

export interface ProviderKeyStatus {
  provider: string;
  configured: boolean;
  /** Last 4 characters, or undefined when not configured. */
  hint?: string;
  /** Result of a live 1-token probe, when one has been run. */
  validated?: boolean;
}

export interface ModelInfo {
  id: string;
  provider: string;
  displayName: string;
  contextWindow: number;
  maxOutputTokens: number;
  inputUsdPerMTok: number;
  outputUsdPerMTok: number;
  supportsThinking: boolean;
  supportsVision: boolean;
  /**
   * How this model can be reached, and therefore whether the user can pick it.
   *
   * `account` means the call routes through the Trace gateway against a signed-in
   * account — the Cursor-style path, and the only way to reach a non-Anthropic model,
   * because the engine deliberately speaks one wire format and the gateway does the
   * fan-out. `byok` means the user's own provider key, sent direct.
   *
   * A model with both is usable either way; the picker greys out anything whose modes
   * the user has not satisfied, rather than hiding it — a hidden model reads as a
   * missing feature, a greyed one reads as an invitation to sign in.
   */
  access: ("account" | "byok")[];
  /** Surfaces one badge in the picker. Exactly one model per provider should set it. */
  recommended?: boolean;
}

// ---------------------------------------------------------------------------
// Prompt commands
// ---------------------------------------------------------------------------

/**
 * A file-backed slash command: a saved prompt the user can invoke by name.
 *
 * **Only file-backed commands travel over this method.** The engine is headless and
 * knows nothing about panels, sidebars, or dialogs, so surface-level builtins (`/clear`,
 * `/model`, `/terminal`) stay in the surface that can actually perform them and are
 * merged into the same menu client-side. Putting them here would mean the engine
 * shipping a list of commands it cannot execute, and every surface having to filter that
 * list down to the ones it recognises — which is the same knowledge, held in one more
 * place.
 *
 * `body` is the full markdown, frontmatter stripped. It is sent up front rather than
 * fetched on selection, because the menu is a keystroke-latency surface and these files
 * are a handful of kilobytes in total.
 */
export interface PromptCommand {
  /** `review`, or `review:security` for `.trace/commands/review/security.md`. */
  name: string;
  /** From frontmatter, or the first non-empty line of the body. */
  description: string;
  /** Workspace commands shadow user commands of the same name. */
  source: "workspace" | "user";
  /** Absolute path, so a surface can offer "edit this command". */
  path: string;
  /** The prompt text, frontmatter removed. */
  body: string;
  /** From frontmatter `argument-hint`. Rendered as a placeholder, e.g. `<pr-number>`. */
  argumentHint?: string;
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

/**
 * How a rule earns its way into a request.
 *
 * Derived by the engine from the file's frontmatter rather than declared, so a rule cannot
 * claim an activation its fields do not support. A surface displays this; it does not
 * compute it.
 *
 * - `always` — in the system prompt on every turn.
 * - `auto` — added when a file matching its globs enters the turn.
 * - `agent` — advertised by name and description; the model fetches it if relevant.
 * - `manual` — inert until something names it.
 */
export type RuleActivation = "always" | "auto" | "agent" | "manual";

/**
 * A standing instruction the agent is given before the user says anything.
 *
 * `source` distinguishes the three places one can come from: `user` is `~/.trace/rules`,
 * `workspace` is `.trace/rules` in a repository, and `agents` is a repository's
 * `AGENTS.md` — kept separate because it is the one file the user did not put in a Trace
 * directory, and a surface offering "delete this rule" should say so differently.
 *
 * `body` travels with the summary for the same reason `PromptCommand.body` does: these are
 * a handful of kilobytes, and the surface that lists them is the surface that wants to
 * show one.
 */
export interface RuleSummary {
  /** `testing`, or `review:security` for `.trace/rules/review/security.md`. */
  name: string;
  /** From frontmatter, or the first non-empty line of the body. */
  description: string;
  activation: RuleActivation;
  source: "user" | "workspace" | "agents";
  /** From frontmatter `globs`. Empty unless `activation` is `auto`. */
  globs: string[];
  /** Absolute path, so a surface can offer "edit this rule". */
  path: string;
  /** `null` for a user-global rule. */
  workspaceId: string | null;
  /** The instruction text, frontmatter removed. */
  body: string;
}

// ---------------------------------------------------------------------------
// The maps
// ---------------------------------------------------------------------------

/** Client → engine. Every entry is request/response with a typed result. */
export interface RequestMap {
  initialize: { params: InitializeParams; result: InitializeResult };
  shutdown: { params: Record<string, never>; result: null };

  "workspace/open": { params: { root: string }; result: WorkspaceInfo };
  "workspace/list": { params: Record<string, never>; result: { workspaces: WorkspaceInfo[] } };
  "workspace/close": { params: { workspaceId: string }; result: null };
  /** Kick off (or rebuild) the semantic index. Progress via `index/progress`. */
  "workspace/index": { params: { workspaceId: string; force?: boolean }; result: null };

  "session/create": { params: CreateSessionParams; result: SessionSummary };
  "session/list": { params: { workspaceId?: string }; result: { sessions: SessionSummary[] } };
  "session/get": { params: { sessionId: string }; result: SessionSummary };
  "session/rename": { params: { sessionId: string; title: string }; result: null };
  "session/delete": { params: { sessionId: string }; result: null };
  "session/history": {
    params: { sessionId: string; limit?: number; before?: number };
    result: { entries: TranscriptEntry[] };
  };
  "session/prompt": { params: PromptParams; result: PromptResult };
  "session/interrupt": { params: { sessionId: string }; result: null };
  "session/resolvePermission": {
    params: { sessionId: string; callId: string; decision: PermissionDecision };
    result: null;
  };
  /** Queued steering: injected at the next tool-call boundary, not mid-stream. */
  "session/steer": { params: { sessionId: string; text: string }; result: null };
  /** Full-text search across all sessions, backed by a local index. */
  "session/search": {
    params: { query: string; limit?: number };
    result: { hits: { sessionId: string; title: string; snippet: string; at: number }[] };
  };

  "checkpoint/list": {
    params: { sessionId: string };
    result: { checkpoints: { id: string; label: string; at: number; turnId: string }[] };
  };
  "checkpoint/restore": {
    params: { sessionId: string; checkpointId: string };
    result: { restoredFiles: string[] };
  };

  "fs/read": {
    params: { path: string; startLine?: number; endLine?: number };
    result: { content: string; totalLines: number; truncated: boolean };
  };
  "fs/write": { params: { path: string; content: string }; result: null };
  "fs/list": { params: { path: string }; result: { entries: DirEntry[] } };
  "search/text": {
    params: { query: string; path?: string; include?: string; isRegex?: boolean; limit?: number };
    result: { matches: SearchMatch[]; truncated: boolean };
  };
  /**
   * Rank paths for the `@` picker. Fuzzy, not glob — this is a typeahead.
   *
   * Separate from `search/text` (contents) and from the `glob` tool (patterns) because it
   * answers a different question: not "which files match this expression" but "which file
   * did the user mean by these seven characters". An empty query is legal and returns the
   * head of the candidate list, which is what the menu shows the instant `@` is typed.
   */
  "search/files": {
    params: {
      query: string;
      limit?: number;
      /** Restrict to one workspace. Omitted means every open root, best matches first. */
      workspaceId?: string;
      includeDirectories?: boolean;
    };
    result: { candidates: FileCandidate[]; truncated: boolean };
  };

  "git/status": { params: { workspaceId: string }; result: GitStatusResult };
  "git/diff": {
    params: { workspaceId: string; path?: string; staged?: boolean };
    result: { diff: string };
  };

  "terminal/create": {
    params: { workspaceId?: string; cwd?: string; cols: number; rows: number; shell?: string };
    result: { terminalId: string };
  };
  "terminal/input": { params: { terminalId: string; data: string }; result: null };
  "terminal/resize": { params: { terminalId: string; cols: number; rows: number }; result: null };
  "terminal/close": { params: { terminalId: string }; result: null };

  "settings/get": { params: Record<string, never>; result: EngineSettings };
  "settings/update": { params: { patch: Partial<EngineSettings> }; result: EngineSettings };
  "settings/setProviderKey": { params: SetProviderKeyParams; result: ProviderKeyStatus };
  "settings/deleteProviderKey": { params: { provider: string }; result: null };
  "settings/providerKeys": { params: Record<string, never>; result: { keys: ProviderKeyStatus[] } };

  "models/list": { params: Record<string, never>; result: { models: ModelInfo[] } };

  /** File-backed slash commands, re-scanned on each call so an edit shows up at once. */
  "commands/list": { params: { workspaceId?: string }; result: { commands: PromptCommand[] } };

  /**
   * Rules currently in effect, re-scanned on each call.
   *
   * Read-only on purpose. A rule is a file the user owns, so editing one is the file
   * editor's job, not a protocol method's — and a surface that could write rules would
   * have to decide what to do about the ones it did not create.
   */
  "rules/list": { params: { workspaceId?: string }; result: { rules: RuleSummary[] } };
}

export type RequestMethod = keyof RequestMap;
export type ParamsOf<M extends RequestMethod> = RequestMap[M]["params"];
export type ResultOf<M extends RequestMethod> = RequestMap[M]["result"];

/** Engine → client. Fire-and-forget; no response is expected or permitted. */
export interface NotificationMap {
  "session/event": SessionEvent;
  "terminal/output": { terminalId: string; data: string };
  "terminal/exited": { terminalId: string; exitCode: number | null; signal?: string };
  "index/progress": {
    workspaceId: string;
    phase: "scanning" | "chunking" | "embedding" | "writing" | "done";
    filesDone: number;
    filesTotal: number;
  };
  /** Structured engine logs, so the desktop app can show them without a log file. */
  log: {
    level: "debug" | "info" | "warn" | "error";
    scope: string;
    message: string;
    at: number;
    detail?: unknown;
  };
  /** Surfaces may also *receive* panel requests outside a turn (e.g. deep links). */
  "workPanel/open": { target: WorkPanelTarget; ref?: string };
}

export type NotificationMethod = keyof NotificationMap;
export type NotificationParamsOf<M extends NotificationMethod> = NotificationMap[M];
