/**
 * The permission gate.
 *
 * One file, one decision function. Tools do not gate themselves — the turn loop
 * calls `evaluate` before every dispatch, which means approval logic cannot be
 * forgotten when a tool is added, and there is exactly one place to read when
 * someone asks "why did it do that without asking me?".
 *
 * Order of adjudication, strictest first:
 *
 *   1. **Hard guardrails.** A tiny hardcoded set of catastrophic, unrecoverable
 *      actions. Not in settings, so no rule edit and no `yolo` mode can unlock them.
 *   2. **Plan mode.** If the turn is planning, every `mutate` and `execute` is
 *      refused. An allow-rule punching through plan mode would make plan mode a lie.
 *   3. **Rules.** A `deny` match anywhere wins outright; otherwise the first match
 *      decides. This is what `allow_always` writes into.
 *   4. **Mode + effect defaults.** What happens when nothing matched.
 *
 * `deny` never prompts. There is no point asking a human to confirm something the
 * engine has already decided to refuse, and a prompt the user cannot approve is
 * just a worse error message.
 *
 * Copyright (c) 2026 Origin AI
 */

import { readFile, stat } from "node:fs/promises";
import {
  TOOL_EFFECTS,
  type PermissionRule,
  type PermissionSettings,
  type ToolEffect,
  type ToolInputMap,
  type ToolName,
} from "@trace/protocol";
import picomatch from "picomatch";
import { previewDiff, unifiedDiff } from "./diff.js";
import { isSensitivePath, resolveInWorkspace, toPosix } from "./paths.js";

export type PermissionAction = "allow" | "deny" | "ask";

export interface PermissionVerdict {
  action: PermissionAction;
  /**
   * Why, in words a user can act on — shown next to an auto-approval in the
   * transcript and used as the refusal text the model reads on a deny.
   */
  reason: string;
  /**
   * True when a hard guardrail or plan mode decided. The client must not offer
   * "allow always" for these: persisting a rule would have no effect, and offering
   * a button that silently does nothing is worse than not offering it.
   */
  locked?: boolean;
}

/**
 * Catastrophic actions, refused regardless of settings.
 *
 * Deliberately short, and deliberately *narrow*. This list is a speed bump for the
 * obvious case — the payload a prompt injection reaches for, the paste that goes
 * wrong — not a security boundary. Any determined injection can obfuscate past it
 * (`$(echo cm0gLXJmIC8= | base64 -d)`), and the real protection is that `execute`
 * always asks outside `yolo`, which is documented sandbox-only.
 *
 * Because these cannot be overridden, precision beats coverage: a false positive
 * permanently blocks legitimate work, while a missed obfuscated variant still hits
 * the ordinary prompt. So `rm -rf /` is here and `rm -rf /home/me/build` is not,
 * even though one glob would have caught both.
 *
 * Things that are dangerous but legitimate — `git push --force` after a rebase,
 * `git reset --hard` to drop local work, a fork bomb a reboot clears — live in
 * `DEFAULT_PERMISSION_SETTINGS` instead, where an expert can remove them. Locking
 * those would be paternalistic and would teach users to disable the whole system.
 */
export const HARD_DENY_RULES: readonly PermissionRule[] = Object.freeze([
  // Recursive-force delete whose *target* is the filesystem root or the home
  // directory itself. `\*` is a literal asterisk, so `/` and `/*` are caught while
  // `/usr/local/share` is not.
  { tool: "run_terminal_cmd", pattern: "*rm -[rf][rf]* /", action: "deny" },
  { tool: "run_terminal_cmd", pattern: "*rm -[rf][rf]* / *", action: "deny" },
  { tool: "run_terminal_cmd", pattern: "*rm -[rf][rf]* /\\**", action: "deny" },
  { tool: "run_terminal_cmd", pattern: "*rm -[rf][rf]* ~", action: "deny" },
  { tool: "run_terminal_cmd", pattern: "*rm -[rf][rf]* ~ *", action: "deny" },
  { tool: "run_terminal_cmd", pattern: "*rm -[rf][rf]* ~/\\**", action: "deny" },
  { tool: "run_terminal_cmd", pattern: "*rm -[rf][rf]* $HOME", action: "deny" },
  { tool: "run_terminal_cmd", pattern: "*rm -[rf][rf]* $HOME *", action: "deny" },

  // Whole-device operations. A coding agent has no legitimate reason to reach for
  // any of these, so breadth costs nothing here.
  { tool: "run_terminal_cmd", pattern: "*mkfs*", action: "deny" },
  { tool: "run_terminal_cmd", pattern: "*format [a-z]:*", action: "deny" },
  { tool: "run_terminal_cmd", pattern: "*dd if=* of=/dev/[sh]d*", action: "deny" },

  // Shadow-git checkpoints can restore working-tree state; they cannot restore the
  // user's real object database, and `.git` deletion takes their history with it.
  { tool: "delete_file", pattern: "**/.git", action: "deny" },
  { tool: "delete_file", pattern: "**/.git/**", action: "deny" },
]);

/** Effects that never reach a prompt on their own merits. */
const SILENT_EFFECTS: ReadonlySet<ToolEffect> = new Set<ToolEffect>(["meta"]);

// Compiled matchers are cached: the gate runs on every tool call, and a long rule
// list recompiled per call would show up in latency for no reason.
const pathMatchers = new Map<string, (subject: string) => boolean>();
const commandMatchers = new Map<string, RegExp>();

/**
 * Match a rule pattern against a path.
 *
 * `dot: true` so `**\/.env` actually matches — without it picomatch skips dotfiles
 * and every rule protecting a dotfile would silently never fire. `basename` stays
 * off: rules are anchored, so `.env` does not match `sub/.env`.
 */
function pathMatches(pattern: string, subject: string): boolean {
  let matcher = pathMatchers.get(pattern);
  if (!matcher) {
    matcher = picomatch(pattern, { dot: true, nocase: process.platform === "win32" });
    pathMatchers.set(pattern, matcher);
  }
  return matcher(subject);
}

/**
 * Match a rule pattern against a shell command.
 *
 * Not picomatch, and not an oversight. picomatch implements *path* globbing, where
 * `*` stops at a `/` — so `git diff*` would fail to match `git diff src/app.ts`, and
 * a deny rule for `*rm -rf /*` would be dodged by writing `/bin/rm -rf /`. Commands
 * are not paths, so `*` here means "any run of characters, `/` included".
 *
 * Matching is case-insensitive on every platform: a deny rule must not be evadable
 * by typing `RM -RF /`, and command names are case-insensitive on Windows anyway.
 */
function commandMatches(pattern: string, command: string): boolean {
  let regex = commandMatchers.get(pattern);
  if (!regex) {
    regex = new RegExp(`^${globToRegexSource(pattern)}$`, "is");
    commandMatchers.set(pattern, regex);
  }
  return regex.test(command);
}

/** Translate `*`, `?`, and `[...]` to regex; everything else is literal. */
function globToRegexSource(pattern: string): string {
  let out = "";
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i] as string;
    if (ch === "*") {
      out += ".*";
    } else if (ch === "?") {
      out += ".";
    } else if (ch === "[") {
      const close = pattern.indexOf("]", i + 1);
      if (close === -1) {
        out += "\\[";
      } else {
        // Pass the class body through, escaping only backslashes so a stray one
        // cannot start an escape sequence the author did not intend.
        const body = pattern.slice(i + 1, close).replace(/\\/g, "\\\\");
        out += `[${body}]`;
        i = close;
      }
    } else if (ch === "\\") {
      // An escape: the next character is literal.
      const next = pattern[i + 1];
      if (next !== undefined) {
        out += escapeRegex(next);
        i++;
      } else {
        out += "\\\\";
      }
    } else {
      out += escapeRegex(ch);
    }
  }
  return out;
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matches(rule: PermissionRule, tool: ToolName, subject: string): boolean {
  if (rule.tool !== "*" && rule.tool !== tool) return false;
  // A rule with no pattern covers every use of the tool.
  if (rule.pattern === undefined || rule.pattern === "") return true;
  return tool === "run_terminal_cmd"
    ? commandMatches(rule.pattern, subject)
    : pathMatches(rule.pattern, subject);
}

/**
 * Decide whether a call may run.
 *
 * `subject` is what rules match against: the workspace-relative, forward-slashed
 * path for file tools, the raw command string for `run_terminal_cmd`. Produce it
 * with `describeCall` rather than by hand, so the string the user was shown is the
 * same string the rules were tested against.
 */
export function evaluate(
  tool: ToolName,
  subject: string,
  settings: PermissionSettings,
): PermissionVerdict {
  const effect = TOOL_EFFECTS[tool];

  // 1. Hard guardrails.
  for (const rule of HARD_DENY_RULES) {
    if (matches(rule, tool, subject)) {
      return {
        action: "deny",
        reason: `Blocked by a built-in safety rule (${rule.pattern}). This cannot be overridden from settings.`,
        locked: true,
      };
    }
  }

  // Agent-internal bookkeeping. Nothing to adjudicate, and prompting for it would
  // be pure noise — this is checked before rules on purpose, because a `*` deny rule
  // meant for the filesystem should not brick the agent's own todo list.
  if (SILENT_EFFECTS.has(effect)) {
    return { action: "allow", reason: "Agent-internal state change" };
  }

  // 2. Plan mode.
  if (settings.mode === "plan" && (effect === "mutate" || effect === "execute")) {
    return {
      action: "deny",
      reason:
        "Plan mode is on, so nothing may be written or executed this turn. Describe the change you would make instead.",
      locked: true,
    };
  }

  // 3. Rules — deny anywhere beats allow, then first match wins.
  let firstMatch: PermissionRule | undefined;
  for (const rule of settings.rules) {
    if (!matches(rule, tool, subject)) continue;
    if (rule.action === "deny") {
      return { action: "deny", reason: denyReason(rule, subject) };
    }
    firstMatch ??= rule;
  }
  if (firstMatch) {
    return {
      action: firstMatch.action,
      reason:
        firstMatch.action === "allow"
          ? `Allowed by rule ${describeRule(firstMatch)}`
          : `Rule ${describeRule(firstMatch)} requires confirmation`,
    };
  }

  // 4. Defaults by mode and effect.
  if (settings.mode === "yolo") {
    return { action: "allow", reason: "YOLO mode — everything except built-in guardrails" };
  }

  if (effect === "read") {
    // The agent may learn that a secret file exists; reading its contents is a
    // decision for a human. Hiding the file would be both unhelpful and futile.
    if (isSensitivePath(subject)) {
      return { action: "ask", reason: "This file usually holds credentials" };
    }
    return { action: "allow", reason: "Read-only" };
  }

  if (effect === "mutate") {
    return settings.mode === "auto_edit"
      ? { action: "allow", reason: "Auto-approved edit — revertible from the checkpoint" }
      : { action: "ask", reason: "Writes to disk" };
  }

  // `execute`. Never auto-approved outside yolo: a shell command's effects are
  // unbounded and no checkpoint can undo them.
  return { action: "ask", reason: "Runs a shell command" };
}

function describeRule(rule: PermissionRule): string {
  return rule.pattern ? `${rule.tool} ${rule.pattern}` : `${rule.tool} (all)`;
}

function denyReason(rule: PermissionRule, subject: string): string {
  return `Denied by rule ${describeRule(rule)} — ${subject} is off limits in this workspace. Ask the user to change it if this is wrong.`;
}

/**
 * Build the allow rule that `allow_always` should persist.
 *
 * Scoped to the exact subject rather than widened to a directory or a command
 * prefix. "Allow always" said about one file must not quietly become "allow always"
 * about its siblings — a user approving `write_file src/app.ts` has not approved
 * `write_file src/.env`. Widening is the user's call, in settings, deliberately.
 */
export function ruleForAlwaysAllow(tool: ToolName, subject: string): PermissionRule {
  return { tool, pattern: escapeGlob(subject), action: "allow" };
}

/** Neutralize glob metacharacters so a literal subject matches only itself. */
function escapeGlob(subject: string): string {
  // Backslash is in the class so a Windows path inside a command string cannot
  // start an escape sequence. The replacement is not re-scanned, so one pass is safe.
  return subject.replace(/[\\*?[\]{}()!+@|^$]/g, (ch) => `\\${ch}`);
}

// ---------------------------------------------------------------------------
// Describing a call
// ---------------------------------------------------------------------------

export interface CallDescription {
  /** One line a user can judge at a glance. */
  summary: string;
  /** The string rules match against. */
  subject: string;
  /** For `mutate` calls: a truncated unified diff, so approval is informed. */
  diffPreview?: string;
  /**
   * Set when the path could not be resolved into the workspace at all. The turn
   * loop skips the prompt in that case and lets the tool return the real error —
   * asking a human to approve an operation that is about to fail is theatre.
   */
  unresolvedReason?: string;
}

const MAX_DIFF_PREVIEW_LINES = 40;
/** A write big enough that diffing it costs more than the prompt is worth. */
const MAX_DIFF_PREVIEW_BYTES = 512 * 1024;

/**
 * Turn raw model input into something a human can adjudicate.
 *
 * Runs *before* the tool does, so it duplicates a little of the tool's path
 * resolution. That is deliberate: the alternative is prompting on the raw model
 * string, which means the user approves `foo/../.env` without realising what it is.
 */
export async function describeCall<K extends ToolName>(
  tool: K,
  input: ToolInputMap[K],
  roots: readonly string[],
): Promise<CallDescription> {
  switch (tool) {
    case "run_terminal_cmd": {
      const cmd = input as ToolInputMap["run_terminal_cmd"];
      const where = cmd.cwd ? ` in ${toPosix(cmd.cwd)}` : "";
      return {
        // The command is the subject verbatim. Normalizing it — collapsing
        // whitespace, stripping quotes — would let a deny rule be dodged by
        // reformatting, so rules match exactly what will be handed to the shell.
        subject: cmd.command,
        summary: `Run \`${oneLine(cmd.command, 120)}\`${where}`,
      };
    }

    case "todo_write": {
      const todos = input as ToolInputMap["todo_write"];
      return { subject: "todos", summary: `Update the task list (${todos.todos.length} items)` };
    }

    case "grep": {
      const g = input as ToolInputMap["grep"];
      const scope = g.path ? ` under ${toPosix(g.path)}` : "";
      const filter = g.include ? ` in ${g.include} files` : "";
      return { subject: g.path ?? ".", summary: `Search for /${g.pattern}/${filter}${scope}` };
    }

    case "glob": {
      const g = input as ToolInputMap["glob"];
      const scope = g.path ? ` under ${toPosix(g.path)}` : "";
      return { subject: g.path ?? ".", summary: `Find files matching ${g.pattern}${scope}` };
    }

    case "codebase_search": {
      const c = input as ToolInputMap["codebase_search"];
      return { subject: ".", summary: `Search the codebase for "${oneLine(c.query, 80)}"` };
    }

    default:
      return describeFileCall(tool, input, roots);
  }
}

async function describeFileCall<K extends ToolName>(
  tool: K,
  input: ToolInputMap[K],
  roots: readonly string[],
): Promise<CallDescription> {
  const raw = (input as { path: string }).path;

  let relative: string;
  let absolute: string | null = null;
  try {
    const resolved = await resolveInWorkspace(raw, roots);
    relative = resolved.relative;
    absolute = resolved.absolute;
  } catch (cause) {
    // Keep the raw string as the subject so a deny rule still gets a chance at it,
    // and flag it so the turn loop can skip a pointless prompt.
    return {
      subject: toPosix(raw),
      summary: `${verbFor(tool)} ${toPosix(raw)}`,
      unresolvedReason: cause instanceof Error ? cause.message : String(cause),
    };
  }

  switch (tool) {
    case "read_file": {
      const r = input as ToolInputMap["read_file"];
      const range =
        r.start_line !== undefined || r.end_line !== undefined
          ? ` (lines ${r.start_line ?? 1}–${r.end_line ?? "end"})`
          : "";
      return { subject: relative, summary: `Read ${relative}${range}` };
    }

    case "list_dir":
      return { subject: relative, summary: `List ${relative || "."}` };

    case "delete_file": {
      const size = await fileSize(absolute);
      return {
        subject: relative,
        summary: `Delete ${relative}${size === null ? "" : ` (${formatBytes(size)})`}`,
      };
    }

    case "write_file": {
      const w = input as ToolInputMap["write_file"];
      const existing = await readForPreview(absolute);
      const lines = countLines(w.content);
      if (existing === null) {
        return {
          subject: relative,
          summary: `Create ${relative} (${lines} line${lines === 1 ? "" : "s"})`,
          diffPreview: previewDiff(unifiedDiff("", w.content, relative), MAX_DIFF_PREVIEW_LINES),
        };
      }
      const diff = unifiedDiff(existing, w.content, relative);
      return {
        subject: relative,
        summary: diff === "" ? `Rewrite ${relative} (no change)` : `Overwrite ${relative}`,
        diffPreview: previewDiff(diff, MAX_DIFF_PREVIEW_LINES),
      };
    }

    case "edit_file": {
      const e = input as ToolInputMap["edit_file"];
      // Diffed as old_string → new_string rather than by applying the edit to the
      // file. The question the prompt asks is "may the agent make this change", and
      // that *is* the change. Re-implementing the match here would risk showing a
      // diff that disagrees with what edit_file goes on to do.
      const scope = e.replace_all ? " (all occurrences)" : "";
      return {
        subject: relative,
        summary: `Edit ${relative}${scope}`,
        diffPreview: previewDiff(
          unifiedDiff(e.old_string, e.new_string, relative, { context: 1 }),
          MAX_DIFF_PREVIEW_LINES,
        ),
      };
    }

    default:
      return { subject: relative, summary: `${verbFor(tool)} ${relative}` };
  }
}

function verbFor(tool: ToolName): string {
  switch (tool) {
    case "read_file":
      return "Read";
    case "list_dir":
      return "List";
    case "write_file":
      return "Write";
    case "edit_file":
      return "Edit";
    case "delete_file":
      return "Delete";
    default:
      return tool;
  }
}

async function readForPreview(absolute: string | null): Promise<string | null> {
  if (absolute === null) return null;
  try {
    const info = await stat(absolute);
    if (!info.isFile() || info.size > MAX_DIFF_PREVIEW_BYTES) return null;
    return await readFile(absolute, "utf8");
  } catch {
    // Missing is the common case (a create), and unreadable is the tool's problem
    // to report. Either way, no preview.
    return null;
  }
}

async function fileSize(absolute: string | null): Promise<number | null> {
  if (absolute === null) return null;
  try {
    return (await stat(absolute)).size;
  } catch {
    return null;
  }
}

function countLines(text: string): number {
  if (text === "") return 0;
  const n = text.split("\n").length;
  // A trailing newline is a terminator, not an empty final line.
  return text.endsWith("\n") ? n - 1 : n;
}

function oneLine(text: string, limit: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= limit ? flat : `${flat.slice(0, limit - 1)}…`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
