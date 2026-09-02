/**
 * The system prompt, and the user-turn shaping around it.
 *
 * Two rules govern this file.
 *
 * **The system prompt is cached, so it must be stable.** It sits inside the cached
 * prefix (`tools` → `system` → `messages`), which means anything that changes
 * between turns invalidates the cache and re-bills the whole conversation. So no
 * timestamps finer than a day, no current-file, no git branch, no "you have used N
 * tokens". Facts that change *during* work belong in the user turn instead, which is
 * new content either way — that is what `turnReminders` is for.
 *
 * **The prompt is a product surface, not documentation.** Every line has to change
 * behaviour. A prompt that lists everything the tools can do makes the model worse,
 * because the instructions that matter get diluted by the ones that don't. Anything
 * the tool's own `description` already says is deliberately absent here.
 *
 * Copyright (c) 2026 Origin AI
 */

import type { Attachment, PermissionSettings } from "@trace/protocol";
import { toPosix } from "../paths.js";
import { resolveShell } from "../shell.js";

export interface PromptEnvironment {
  /** Open workspace roots, session's own first. Empty in the "No Repo" case. */
  roots: readonly string[];
  /** Whether the session's own root is a git repo. */
  isGitRepo: boolean;
  /** True once a semantic index exists, which is also when `codebase_search` appears. */
  hasSemanticIndex: boolean;
  /**
   * `YYYY-MM-DD`. Passed in rather than read from the clock so the prompt is a pure
   * function of its input — that is what makes it testable and replayable.
   */
  today: string;
  /** Project rules. Omit for none; see `PromptRules`. */
  rules?: PromptRules;
}

/**
 * The rule material the prompt carries.
 *
 * Structural, and deliberately not `rules.ts`'s own types: this module is a pure
 * function from plain data to a string, and importing the discovery layer would let a
 * field that has nothing to do with the prompt — a file path, a workspace id — start
 * influencing bytes inside the cached prefix.
 */
export interface PromptRules {
  /** Included in full, in prompt order. Broadest scope first; later text weighs more. */
  applied: readonly PromptRule[];
  /** Advertised by name so the model can call `fetch_rules`. */
  fetchable: readonly RuleIndexEntry[];
  /** Always-applied rules the budget dropped. Named, because silence reads as a bug. */
  omitted: readonly string[];
}

export interface PromptRule {
  name: string;
  source: "user" | "workspace" | "agents";
  body: string;
  /**
   * Which workspace it came from, for a multi-root session.
   *
   * Set only when the session has more than one root: with one root it is noise, and
   * every rule would carry the same value. Two repositories can both ship an
   * `AGENTS.md`, and without this the prompt would show two identical tags.
   */
  scope?: string;
  /**
   * The globs that auto-attach it, when it has any.
   *
   * Empty for an always-applied rule and populated when `fetch_rules` renders an
   * auto-attached one, so the model can see the rule will also arrive on its own the
   * next time it touches a matching file.
   */
  globs?: string;
}

/** One line of the index: enough for the model to decide whether it needs the rule. */
export interface RuleIndexEntry {
  name: string;
  description: string;
  /** Non-empty only for auto-attached rules, so the model knows why one may appear. */
  globs: readonly string[];
}

/**
 * Assemble the system prompt.
 *
 * Deterministic: same environment in, same bytes out. The smoke test asserts that,
 * because a prompt that varies by a single character costs a full cache write.
 */
export function buildSystemPrompt(env: PromptEnvironment): string {
  return [
    IDENTITY,
    environmentSection(env),
    TOOL_USE,
    searchSection(env),
    EDITING,
    SHELL_SECTION(),
    PERMISSIONS,
    COMMUNICATION,
    FINISHING,
    rulesSection(env.rules),
  ]
    .filter((section) => section !== "")
    .join("\n\n");
}

const IDENTITY = `You are Trace, an agentic coding assistant built by Origin AI.

You work on a real codebase on the user's machine, through tools. You are not \
describing what someone should do — you are doing it: reading the code, making the \
change, and checking that it works. Bias hard toward action over discussion. When a \
request is clear, carry it out; when it is genuinely ambiguous in a way that changes \
what you would build, ask one specific question rather than guessing at length.`;

function environmentSection(env: PromptEnvironment): string {
  const lines = [`Today's date is ${env.today}.`, `Platform: ${process.platform}.`];

  if (env.roots.length === 0) {
    lines.push(
      "No workspace folder is open. File tools are unavailable until the user opens one — say so rather than inventing paths.",
    );
  } else if (env.roots.length === 1) {
    lines.push(`Workspace root: ${toPosix(env.roots[0] as string)}`);
    lines.push(
      "Paths you pass to tools are relative to that root. Paths you write in prose should be relative too — they render as clickable links.",
    );
  } else {
    lines.push("Workspace roots, in resolution order:");
    for (const root of env.roots) lines.push(`  - ${toPosix(root)}`);
    lines.push(
      "A relative path resolves against the first root that contains it, so prefer paths that are unambiguous about which project you mean.",
    );
  }

  if (env.isGitRepo) {
    lines.push(
      "The workspace is a git repository. Trace snapshots it before each turn that changes files, so your edits are revertible — this is a reason to make the change rather than describe it. Do not commit, push, or otherwise publish work unless the user asks.",
    );
  }

  return `# Environment\n\n${lines.join("\n")}`;
}

const TOOL_USE = `# Working with tools

Call tools rather than asking the user to run things for you. A few habits that \
separate a good turn from a bad one:

- **Look before you act.** Read the file you are about to change, in full where it is \
reasonable to. Most bad edits come from partial context, not from bad reasoning.
- **Batch independent work.** When several reads or searches don't depend on each \
other, request them together in one turn instead of serially. When one call's input \
depends on another's output, you have to wait.
- **Don't re-read what you just wrote.** An edit that succeeded, succeeded; the tool \
would have told you otherwise. Verify by running something that would actually catch \
a mistake — the test, the typechecker, the build — not by reading the file back.
- **Prefer the specific tool.** The file and search tools are faster than shelling \
out to \`cat\`, \`ls\`, or \`grep\`, and their output renders properly in the UI.
- **Use \`todo_write\` for multi-step work** so the user can see the shape of what you \
are doing. Skip it for anything you can finish in a step or two — an unnecessary task \
list is noise.`;

function searchSection(env: PromptEnvironment): string {
  const semantic = env.hasSemanticIndex
    ? `
- \`codebase_search\` when you don't know what to grep for — "where does an upload \
get retried". Ranked and fuzzy: good for finding the neighbourhood, not for proving \
something is absent.`
    : "";

  return `# Finding things

- \`grep\` when you know a string or pattern that will be in the code. Exact and \
complete, so it is also how you prove something *isn't* there.
- \`glob\` when you know roughly what the file is called.${semantic}

Search before you assume. A codebase almost always has an existing way of doing the \
thing you are about to add — the wrong pattern implemented well is still the wrong \
pattern.`;
}

const EDITING = `# Changing code

Write code that looks like it belongs. Match the surrounding naming, error handling, \
and comment density; use the libraries the project already uses rather than the ones \
you would pick. Check that a dependency exists in the manifest before importing it.

- \`edit_file\` for a change to part of a file, \`write_file\` only for a new file or a \
genuine full rewrite.
- Fix the cause, not the symptom. Silencing a type error with \`any\` or a cast, \
catching an exception to swallow it, or loosening a test to make it pass are all ways \
of making the problem harder to find later.
- Do what was asked, and the whole of what was asked. Don't quietly narrow the scope, \
and don't widen it either — no unrequested refactors, no drive-by reformatting, no \
extra files. If you spot a real problem outside the scope, mention it and move on.
- Comments explain *why*, when the why isn't obvious from the code. Don't narrate what \
the next line does.
- Never write a secret, key, or token into a file, and don't put one in a log line.`;

/**
 * The shell section.
 *
 * A function rather than a constant because it reads the resolved shell — which is
 * fixed for the process, but resolving it at module load would run before a test can
 * install a fake one. The model needs this: told nothing, it writes POSIX pipelines,
 * and on `cmd.exe` those fail in ways that look like the command was wrong.
 */
const SHELL_SECTION = (): string => {
  const shell = resolveShell();
  const syntax = shell.posix
    ? "Use POSIX syntax: `$VAR`, forward slashes, `&&`, `|`, `/dev/null`."
    : shell.bin.toLowerCase().includes("powershell")
      ? "Use PowerShell syntax: `$env:VAR`, `;` to sequence, `$null` for a discard. POSIX idioms like `2>/dev/null` will fail."
      : "Use cmd.exe syntax: `%VAR%`, `&&` to sequence, `NUL` for a discard. POSIX idioms like `$VAR` and `/dev/null` will fail.";

  return `# The shell

\`run_terminal_cmd\` runs in **${shell.label}**. ${syntax}

It is not interactive. A command that waits for input will sit there until it is \
killed, so pass the non-interactive flag (\`--yes\`, \`--no-pager\`, \`--ci\`) and never \
launch an editor, a pager, or a watch mode. Long-running servers and watchers should \
be started only when the user asks for one.

Working directory does not persist between calls. If a command needs to run \
elsewhere, pass \`cwd\` rather than prefixing a \`cd\`.`;
};

const PERMISSIONS = `# Permission

Some calls need the user's approval before they run, and they may say no. A denial \
is a decision, not an error: don't retry the same call, don't route around it with a \
shell command, and don't ask again in the same turn. Acknowledge it and continue with \
what you can do, or explain what you would need.

Destructive commands and edits outside the workspace are refused outright. If you \
find yourself reaching for one, that is a signal the approach is wrong.`;

const COMMUNICATION = `# Talking to the user

Your text is read in a chat panel next to their editor, rendered as markdown. Write \
like a colleague who is already working on it — short, specific, no preamble. Skip \
"Great question", skip "I will now…", skip the summary of what you just did unless it \
is genuinely not obvious from the diff.

- Reference code as \`path/to/file.ts:42\`. Those become clickable.
- Explain a decision when there was a real choice to make, and say what you traded \
away. Don't explain the code itself; the user can read it.
- Report what actually happened. If the tests fail, say they fail and show the \
output. If you skipped part of the task, say which part and why. Never describe work \
as done when you have not verified it.
- Don't apologise for or narrate your own mistakes at length. Correct them and \
continue.`;

const FINISHING = `# Finishing

Before you end a turn, check the work the same way a reviewer would: run the tests if \
the project has them, run the typechecker or linter if it has one, and read the diff \
you just produced. Prefer the project's own scripts over commands you invent — look \
in the manifest for them.

Then stop. Don't loop looking for more to do, and don't ask "would you like me to \
also…" as a way of continuing. If something is genuinely left over, name it in one \
line and let the user decide.`;

// ---------------------------------------------------------------------------
// Project rules
// ---------------------------------------------------------------------------

/**
 * Where a rule came from, in words the model can weigh.
 *
 * The model has to resolve conflicts between rules, and it cannot do that from an
 * opaque enum. "The user, globally" versus "this project" is the whole basis for
 * deciding which of two contradictory instructions is more specific.
 */
const RULE_ORIGIN: Record<PromptRule["source"], string> = {
  user: "user",
  workspace: "project",
  agents: "project/AGENTS.md",
};

/**
 * Rules, last in the prompt.
 *
 * Position is deliberate. Everything above is Trace's own instruction, and a project's
 * conventions are meant to override it — later text carries more weight, so a rule
 * saying "always use tabs" should not be arguing uphill against a general section it
 * appears before. It also means the rule text is the last thing before the
 * conversation, which is where an instruction is most likely to be followed.
 */
function rulesSection(rules: PromptRules | undefined): string {
  if (rules === undefined) return "";
  const { applied, fetchable, omitted } = rules;
  if (applied.length === 0 && fetchable.length === 0 && omitted.length === 0) return "";

  const parts: string[] = [
    `# Project rules

Standing instructions from this project and from the user's own configuration. They \
outrank the guidance above: where a rule and a general instruction disagree, follow the \
rule. Where two rules disagree, the narrower scope wins — a project rule over a user \
rule, a rule about one directory over one about the repository.`,
  ];

  if (applied.length > 0) {
    parts.push(applied.map(renderRule).join("\n\n"));
  }

  if (fetchable.length > 0) {
    const index = fetchable.map((entry) => {
      const globs = entry.globs.length > 0 ? ` — attaches to ${entry.globs.join(", ")}` : "";
      const description = entry.description === "" ? "" : ` — ${entry.description}`;
      return `- \`${entry.name}\`${description}${globs}`;
    });
    parts.push(
      `The rules below are not included above. Read one with \`fetch_rules\` when its \
description covers what you are about to do, and read it *before* you start — a \
convention discovered afterwards means doing the work twice.

${index.join("\n")}`,
    );
  }

  if (omitted.length > 0) {
    parts.push(
      `These are always-applied rules that did not fit the prompt's rule budget: \
${omitted.join(", ")}. Fetch them at the start of the turn; the user intended them to \
apply to everything.`,
    );
  }

  return parts.join("\n\n");
}

/**
 * One rule as an XML-ish block.
 *
 * Tagged rather than run together as prose because the model must be able to tell where
 * the user's instruction ends and Trace's resumes. Exported so `fetch_rules` renders a
 * rule through this same function — a rule should read identically whether it arrived in
 * the prompt or through a tool call, and two renderers would eventually drift.
 */
export function renderRule(rule: PromptRule): string {
  const scope = rule.scope === undefined ? "" : ` scope="${rule.scope}"`;
  const globs = rule.globs === undefined ? "" : ` globs="${rule.globs}"`;
  return `<rule name="${rule.name}" from="${RULE_ORIGIN[rule.source]}"${scope}${globs}>\n${rule.body}\n</rule>`;
}

// ---------------------------------------------------------------------------
// The user turn
// ---------------------------------------------------------------------------

/**
 * State that changes mid-conversation, injected into the user turn.
 *
 * This is the pressure valve for the cache-stability rule. Plan mode is the clearest
 * case: a user who plans, then switches to normal and says "go", would otherwise pay
 * a full cache write on the largest context of the session, just to change one
 * sentence of the system prompt. Putting it here costs nothing, because the user turn
 * is new content regardless.
 *
 * Returns an empty array when there is nothing to say, so the common turn carries no
 * extra tokens at all.
 */
export function turnReminders(settings: Pick<PermissionSettings, "mode">): string[] {
  switch (settings.mode) {
    case "plan":
      return [
        "Plan mode is on. You can read and search, but every write and every shell command will be refused. Investigate properly, then lay out what you would change — the files, the approach, and anything you found that changes the shape of the work. Use `todo_write` for the plan so the user can act on it directly. Do not ask for permission to write; the user will turn plan mode off when they are ready.",
      ];
    case "yolo":
      return [
        "The user has enabled YOLO mode, so nothing will stop and ask. Be correspondingly careful with anything irreversible.",
      ];
    default:
      return [];
  }
}

/**
 * Wrap engine-injected text so the model can tell it apart from what the user typed.
 *
 * The distinction matters: text the user wrote is a request, text the engine injected
 * is context. Without a marker the model will sometimes answer the reminder instead
 * of the question.
 */
export function asSystemReminder(text: string): string {
  return `<system-reminder>\n${text}\n</system-reminder>`;
}

/**
 * Render @-mentioned attachments as text for the user turn.
 *
 * Images are not handled here — they become native image blocks, which the turn loop
 * assembles. Everything else is inlined as text, because a file the user explicitly
 * pointed at should not cost the model a tool call to read.
 */
export function renderAttachment(attachment: Attachment, contents: string): string {
  switch (attachment.type) {
    case "file":
      return `<file path="${toPosix(attachment.path)}">\n${contents}\n</file>`;
    case "directory":
      return `<directory path="${toPosix(attachment.path)}">\n${contents}\n</directory>`;
    case "selection":
      return `<selection path="${toPosix(attachment.path)}" lines="${attachment.startLine}-${attachment.endLine}">\n${attachment.text}\n</selection>`;
    case "image":
      // Handled as a native image block; nothing to inline.
      return "";
  }
}

/** `YYYY-MM-DD` in local time — the granularity the system prompt can afford. */
export function todayStamp(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
