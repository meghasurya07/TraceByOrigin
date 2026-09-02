/**
 * Tool smoke test.
 *
 * Not a unit-test suite — it is the "does any of this actually work against a real
 * filesystem" check, run against the Trace repo itself. Plain .mjs against dist so
 * it exercises exactly the code that ships, with no transpile step in between.
 *
 * Run: node packages/engine/scripts/smoke.mjs
 */

import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  APIConnectionError,
  APIUserAbortError,
  AuthenticationError,
  BadRequestError,
  InternalServerError,
  RateLimitError,
} from "@anthropic-ai/sdk";

import {
  DEFAULT_PERMISSION_SETTINGS,
  ErrorCode,
  PROTOCOL_VERSION,
  RpcPeer,
} from "../../protocol/dist/index.js";
import { countLines, diffHunks, revertHunk } from "../dist/diff.js";
import { Engine } from "../dist/engine.js";
import { FileStateTracker } from "../dist/file-state.js";
import { CheckpointManager, batchPathspecs, parseRawDiff } from "../dist/git/checkpoint.js";
import { acceptBaseline, listReview, revertInReview } from "../dist/git/review.js";
import { gitAvailable } from "../dist/git/run.js";
import { gitDiff, gitStatus, parseStatus } from "../dist/git/status.js";
import { Logger } from "../dist/logger.js";
import { DEFAULT_MODEL, UTILITY_MODEL, resolveModel } from "../dist/models.js";
import { describeCall, evaluate, ruleForAlwaysAllow } from "../dist/permissions.js";
import { buildRequest, classify } from "../dist/providers/anthropic.js";
import {
  EMPTY_RULE_SET,
  buildRuleSet,
  discoverRules,
  fetchableRules,
  findRule,
  matchAutoRules,
  selectAlwaysApplied,
} from "../dist/rules.js";
import {
  asSystemReminder,
  buildSystemPrompt,
  renderRule,
  todayStamp,
  turnReminders,
} from "../dist/session/prompt.js";
import { SettingsStore } from "../dist/settings.js";
import { Turn } from "../dist/session/turn.js";
import { resolveShell } from "../dist/shell.js";
import { runTool, toolsForRequest } from "../dist/tools/index.js";
import { WorkspaceRegistry } from "../dist/workspace.js";

const repoRoot = path.resolve(fileURLToPath(import.meta.url), "../../../..");

let failures = 0;
const events = [];

function check(label, condition, detail) {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures++;
    console.log(`  FAIL ${label}${detail === undefined ? "" : ` — ${detail}`}`);
  }
}

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

/** The response body shape the API actually returns on an error. */
function apiBody(message) {
  return { type: "error", error: { type: "invalid_request_error", message } };
}

async function main() {
  Logger.setLevel("error");

  const workspaces = new WorkspaceRegistry();
  const workspace = await workspaces.open(repoRoot);
  const settings = new SettingsStore(await mkdtemp(path.join(os.tmpdir(), "trace-smoke-home-")));
  await settings.load();

  const files = new FileStateTracker();
  const todoState = { items: [] };

  const ctx = {
    sessionId: "smoke",
    turnId: "turn-1",
    callId: "call-1",
    workspaces,
    workspace,
    roots: workspaces.roots(),
    settings,
    log: new Logger("smoke"),
    signal: new AbortController().signal,
    emit: (event) => events.push(event),
    files,
    todos: {
      get: () => todoState.items,
      set: (next) => {
        todoState.items = next;
      },
    },
    rules: EMPTY_RULE_SET,
  };

  const run = (tool, input) => runTool(tool, input, ctx);

  // -- registry ------------------------------------------------------------
  console.log("\nregistry");
  const everything = toolsForRequest({ hasSemanticIndex: true, hasRules: true });
  const withIndex = toolsForRequest({ hasSemanticIndex: true, hasRules: false });
  const withRules = toolsForRequest({ hasSemanticIndex: false, hasRules: true });
  const neither = toolsForRequest({ hasSemanticIndex: false, hasRules: false });
  check(
    "all 11 tools when both are available",
    everything.length === 11,
    `got ${everything.length}`,
  );
  check(
    "codebase_search omitted without an index",
    withRules.length === 10 && !withRules.some((t) => t.name === "codebase_search"),
  );
  check(
    "fetch_rules omitted without rules",
    withIndex.length === 10 && !withIndex.some((t) => t.name === "fetch_rules"),
  );
  check("both omitted together", neither.length === 9, `got ${neither.length}`);
  // Order is part of the cache key, so filtering must never reorder what survives.
  check(
    "filtering preserves definition order",
    neither.map((t) => t.name).join() ===
      everything
        .filter((t) => t.name !== "codebase_search" && t.name !== "fetch_rules")
        .map((t) => t.name)
        .join(),
  );

  // -- workspace -----------------------------------------------------------
  console.log("\nworkspace");
  check("detected git repo", workspace.isGitRepo === true);
  check("resolved a branch", typeof workspace.currentBranch === "string", workspace.currentBranch);
  check(
    "node_modules is ignored",
    await workspaces.isIgnored(workspace, path.join(repoRoot, "node_modules"), true),
  );
  check(
    "src is not ignored",
    !(await workspaces.isIgnored(workspace, path.join(repoRoot, "packages/engine/src"), true)),
  );
  check(
    "dist is ignored",
    await workspaces.isIgnored(workspace, path.join(repoRoot, "packages/engine/dist"), true),
  );

  // -- path containment ----------------------------------------------------
  console.log("\ncontainment");
  const escape = await run("read_file", { path: "../../../Windows/System32/drivers/etc/hosts" });
  check("rejects traversal escape", escape.isError === true, escape.content.slice(0, 80));
  const absolute = await run("read_file", { path: "C:\\Windows\\win.ini" });
  check("rejects absolute escape", absolute.isError === true, absolute.content.slice(0, 80));
  const nul = await run("read_file", { path: "package.json\u0000.png" });
  check("rejects NUL byte", nul.isError === true, nul.content.slice(0, 80));

  // -- validation ----------------------------------------------------------
  console.log("\nvalidation");
  const badArgs = await run("read_file", { path: 42 });
  check("rejects wrong-typed argument", badArgs.isError === true, badArgs.content.slice(0, 90));
  const missing = await run("edit_file", { path: "package.json", old_string: "x" });
  check("rejects missing required field", missing.isError === true);

  // -- glob ----------------------------------------------------------------
  console.log("\nglob");
  const tsFiles = await run("glob", { pattern: "**/*.ts" });
  const tsCount = tsFiles.meta?.matched ?? 0;
  check("finds .ts sources", tsCount >= 12, `matched ${tsCount}`);
  check("excludes dist output", !tsFiles.content.includes("dist/"), "dist leaked into results");
  const bare = await run("glob", { pattern: "*.json" });
  check(
    "bare pattern matches at any depth",
    bare.content.includes("packages/engine/package.json"),
    bare.content.split("\n").slice(0, 3).join(" | "),
  );
  const scoped = await run("glob", { pattern: "src/*.ts", path: "packages/engine" });
  check(
    "scoped glob is relative to path",
    scoped.content.includes("packages/engine/src/paths.ts"),
    scoped.content.split("\n").slice(0, 3).join(" | "),
  );

  // -- grep ----------------------------------------------------------------
  console.log("\ngrep");
  const grepHit = await run("grep", { pattern: "resolveInWorkspace", include: "*.ts" });
  check("finds a known identifier", (grepHit.meta?.matched ?? 0) > 0, grepHit.summary);
  check(
    "reports file:line",
    /packages\/engine\/src\/paths\.ts:\d+:/.test(grepHit.content),
    grepHit.content.split("\n")[0],
  );
  const grepMiss = await run("grep", { pattern: "zzzNoSuchIdentifierAnywhere" });
  check("no-match is not an error", grepMiss.isError !== true, grepMiss.content);
  const badRegex = await run("grep", { pattern: "foo(" });
  check("invalid regex is reported clearly", badRegex.isError === true, badRegex.summary);

  // -- read_file -----------------------------------------------------------
  console.log("\nread_file");
  const readWhole = await run("read_file", { path: "packages/engine/src/paths.ts" });
  check(
    "reads with line numbers",
    /^\s*1\tw?/.test(readWhole.content.split("\n")[0]) || readWhole.content.includes("1\t/**"),
  );
  check("reports total lines", (readWhole.meta?.totalLines ?? 0) > 100, readWhole.summary);
  const readRange = await run("read_file", {
    path: "packages/engine/src/paths.ts",
    start_line: 20,
    end_line: 24,
  });
  check(
    "honours a line range",
    readRange.meta?.startLine === 20 && readRange.meta?.endLine === 24,
    `${readRange.meta?.startLine}-${readRange.meta?.endLine}`,
  );
  check("range starts at the right line", readRange.content.trimStart().startsWith("20\t"));
  check(
    "tells the model how to read further",
    readRange.content.includes("Read further with start_line: 25."),
    readRange.content.split("\n").at(-1),
  );
  const readDir = await run("read_file", { path: "packages/engine/src" });
  check("directory read redirects to list_dir", readDir.isError === true);

  // -- list_dir ------------------------------------------------------------
  console.log("\nlist_dir");
  const listed = await run("list_dir", { path: "." });
  check("lists the root", listed.content.includes("packages/"), listed.summary);
  check("hides node_modules", !listed.content.includes("node_modules"), "node_modules leaked");

  // -- mutation ------------------------------------------------------------
  console.log("\nwrite/edit/delete");
  const scratchDir = await mkdtemp(path.join(os.tmpdir(), "trace-smoke-ws-"));
  const scratch = await workspaces.open(scratchDir);
  // Scoped to this one root on purpose. A session's roots are its own workspace
  // first — handing a tool every open root lets a new file land in whichever repo
  // happens to be listed first.
  const scratchCtx = { ...ctx, workspace: scratch, roots: [scratch.root] };
  const runScratch = (tool, input) => runTool(tool, input, scratchCtx);

  const created = await runScratch("write_file", {
    path: "src/greet.ts",
    content: "export function greet(name: string) {\n  return `hi ${name}`;\n}\n",
  });
  check("creates a file in a new subdirectory", created.isError !== true, created.content);
  check("reports creation", created.meta?.created === true);

  // Blind-overwrite protection needs a file the session has never touched, written
  // behind the engine's back. write_file's own creation counts as read-equivalent
  // knowledge — an agent that just authored a file may rewrite it freely.
  await writeFile(path.join(scratchDir, "foreign.txt"), "written by another editor\n", "utf8");
  const blind = await runScratch("write_file", { path: "foreign.txt", content: "clobbered\n" });
  check("blocks overwrite without a read", blind.isError === true, blind.content.slice(0, 80));
  check(
    "does not clobber the file it blocked",
    (await readFile(path.join(scratchDir, "foreign.txt"), "utf8")) ===
      "written by another editor\n",
  );
  const selfOverwrite = await runScratch("write_file", {
    path: "src/greet.ts",
    content: "export function greet(name: string) {\n  return `hi, ${name}`;\n}\n",
  });
  check(
    "allows rewriting a file it just wrote",
    selfOverwrite.isError !== true,
    selfOverwrite.content,
  );

  await runScratch("read_file", { path: "src/greet.ts" });
  const overwrite = await runScratch("write_file", {
    path: "src/greet.ts",
    content: "export function greet(name: string) {\n  return `hello ${name}`;\n}\n",
  });
  check("allows overwrite after a read", overwrite.isError !== true, overwrite.content);
  check("produces a diff", String(overwrite.meta?.diff ?? "").includes("+  return `hello"));

  const ambiguous = await runScratch("edit_file", {
    path: "src/greet.ts",
    old_string: "name",
    new_string: "who",
  });
  check("rejects an ambiguous edit", ambiguous.isError === true, ambiguous.content.slice(0, 90));

  const edited = await runScratch("edit_file", {
    path: "src/greet.ts",
    old_string: "return `hello ${name}`;",
    new_string: "return `hey ${name}`;",
  });
  check("applies a unique edit", edited.isError !== true, edited.content);

  const noMatch = await runScratch("edit_file", {
    path: "src/greet.ts",
    old_string: "        return `hey ${name}`;",
    new_string: "x",
  });
  check(
    "diagnoses a whitespace near-miss",
    /whitespace|indentation/i.test(noMatch.content),
    noMatch.content.slice(0, 120),
  );

  // CRLF preservation — the edit failure mode that only shows up on Windows.
  await runScratch("write_file", { path: "crlf.txt", content: "alpha\r\nbeta\r\ngamma\r\n" });
  await runScratch("read_file", { path: "crlf.txt" });
  const crlfEdit = await runScratch("edit_file", {
    path: "crlf.txt",
    old_string: "beta",
    new_string: "BETA",
  });
  check("matches LF old_string against a CRLF file", crlfEdit.isError !== true, crlfEdit.content);
  const crlfAfter = await readFile(path.join(scratchDir, "crlf.txt"), "utf8");
  check(
    "preserves CRLF endings",
    crlfAfter === "alpha\r\nBETA\r\ngamma\r\n",
    JSON.stringify(crlfAfter),
  );

  const numbered = await runScratch("edit_file", {
    path: "crlf.txt",
    old_string: "  1\talpha",
    new_string: "  1\tALPHA",
  });
  check("strips line-number prefixes from old_string", numbered.isError !== true, numbered.content);

  const deleted = await runScratch("delete_file", { path: "crlf.txt" });
  check("deletes a file", deleted.isError !== true, deleted.content);
  const deleteDir = await runScratch("delete_file", { path: "src" });
  check("refuses to delete a directory", deleteDir.isError === true);

  // -- multi-root resolution -----------------------------------------------
  // Regression: with several roots open, a relative path is lexically contained by
  // every one of them. Resolution used to take the first containing root, so a write
  // meant for the session's workspace landed in whichever repo was listed first.
  console.log("\nmulti-root");
  await writeFile(path.join(scratchDir, "only-here.txt"), "scratch\n", "utf8");
  const secondRoot = {
    ...ctx,
    workspace: scratch,
    roots: [repoRoot, scratch.root], // scratch deliberately last
  };
  const foundLast = await runTool("read_file", { path: "only-here.txt" }, secondRoot);
  check(
    "finds an existing file in a later root",
    foundLast.isError !== true && foundLast.meta?.path === "only-here.txt",
    foundLast.content.slice(0, 90),
  );
  const sessionFirst = { ...ctx, workspace: scratch, roots: [scratch.root, repoRoot] };
  const newFile = await runTool(
    "write_file",
    { path: "resolves-to-session.txt", content: "ok\n" },
    sessionFirst,
  );
  check("new file lands in the session's own root", newFile.isError !== true, newFile.content);
  check(
    "and not in another open root",
    (await exists(path.join(scratchDir, "resolves-to-session.txt"))) &&
      !(await exists(path.join(repoRoot, "resolves-to-session.txt"))),
    "leaked into the repo root",
  );

  // -- permissions ---------------------------------------------------------
  console.log("\npermissions");
  const settingsWith = (mode, rules = []) => ({ mode, rules });
  const act = (tool, subject, mode, rules) => evaluate(tool, subject, settingsWith(mode, rules));

  // Hard guardrails sit above every mode and every rule.
  const rmYolo = act("run_terminal_cmd", "rm -rf /", "yolo");
  check("hard deny beats yolo", rmYolo.action === "deny" && rmYolo.locked === true, rmYolo.reason);
  const rmAllowed = act("run_terminal_cmd", "sudo rm -rf /*", "auto_edit", [
    { tool: "run_terminal_cmd", pattern: "*", action: "allow" },
  ]);
  check("hard deny beats an explicit allow rule", rmAllowed.action === "deny", rmAllowed.reason);
  check(
    "hard deny is not evadable by an absolute path",
    act("run_terminal_cmd", "/bin/rm -rf /", "yolo").action === "deny",
  );
  check(
    "git internals cannot be deleted",
    act("delete_file", ".git/config", "yolo").action === "deny",
  );
  check(
    "an ordinary rm is not caught",
    act("run_terminal_cmd", "rm -rf node_modules", "auto_edit").action === "ask",
  );
  // The guardrail must not swallow legitimate absolute-path deletes. A hard deny
  // has no override, so a false positive here is unfixable by the user.
  check(
    "an absolute path inside a project is not caught",
    act("run_terminal_cmd", "rm -rf /home/me/project/dist", "yolo").action === "allow",
  );
  check(
    "a home-relative subdirectory is not caught",
    act("run_terminal_cmd", "rm -rf ~/project/build", "yolo").action === "allow",
  );
  check(
    "a trailing slash is not mistaken for root",
    act("run_terminal_cmd", "rm -rf ./packages/engine/dist/", "yolo").action === "allow",
  );
  check(
    "root with trailing arguments is still caught",
    act("run_terminal_cmd", "rm -rf / --no-preserve-root", "yolo").action === "deny",
  );
  check("bare home wipe is caught", act("run_terminal_cmd", "rm -rf ~", "yolo").action === "deny");

  // Regression: command patterns are not path globs. picomatch's `*` stops at `/`,
  // so glob-on-path semantics would fail to match any command with a path argument.
  const gitDiff = act("run_terminal_cmd", "git diff packages/engine/src/paths.ts", "ask", [
    { tool: "run_terminal_cmd", pattern: "git diff*", action: "allow" },
  ]);
  check("a command pattern's * crosses slashes", gitDiff.action === "allow", gitDiff.reason);

  // Deny wins wherever it appears in the list, not just when it appears first.
  const denyLast = act("write_file", "src/secret.ts", "auto_edit", [
    { tool: "write_file", pattern: "src/**", action: "allow" },
    { tool: "write_file", pattern: "**/secret.ts", action: "deny" },
  ]);
  check("deny beats an earlier allow", denyLast.action === "deny", denyLast.reason);

  // Plan mode is a contract, not a preference.
  const planWrite = act("write_file", "README.md", "plan", [
    { tool: "*", pattern: "**", action: "allow" },
  ]);
  check(
    "plan mode refuses writes despite an allow rule",
    planWrite.action === "deny" && planWrite.locked === true,
    planWrite.reason,
  );
  check("plan mode still reads", act("read_file", "src/app.ts", "plan").action === "allow");
  check("plan mode still tracks todos", act("todo_write", "todos", "plan").action === "allow");
  check(
    "a blanket deny cannot brick the todo list",
    act("todo_write", "todos", "ask", [{ tool: "*", action: "deny" }]).action === "allow",
  );

  // Mode defaults.
  check(
    "auto_edit writes without asking",
    act("write_file", "a.ts", "auto_edit").action === "allow",
  );
  check(
    "auto_edit still asks before a shell",
    act("run_terminal_cmd", "pnpm test", "auto_edit").action === "ask",
  );
  check("ask mode asks before writing", act("write_file", "a.ts", "ask").action === "ask");
  check("yolo runs anything else", act("run_terminal_cmd", "pnpm test", "yolo").action === "allow");

  // Secrets: readable only on purpose.
  check("reading .env asks first", act("read_file", ".env", "auto_edit").action === "ask");
  check(
    "reading a nested .env asks first",
    act("read_file", "apps/web/.env.local", "auto_edit").action === "ask",
  );
  check(
    "reading ordinary source does not ask",
    act("read_file", "src/app.ts", "auto_edit").action === "allow",
  );
  check(
    "an explicit allow rule unlocks a secret",
    act("read_file", ".env", "auto_edit", [{ tool: "read_file", pattern: ".env", action: "allow" }])
      .action === "allow",
  );
  check("yolo reads secrets", act("read_file", ".env", "yolo").action === "allow");

  // Shipped defaults behave.
  check(
    "default settings allow git status",
    evaluate("run_terminal_cmd", "git status --short", DEFAULT_PERMISSION_SETTINGS).action ===
      "allow",
  );
  check(
    "default settings ask before writing .env",
    evaluate("write_file", ".env", DEFAULT_PERMISSION_SETTINGS).action === "ask",
  );
  check(
    "default settings deny a force push",
    evaluate("run_terminal_cmd", "git push --force origin main", DEFAULT_PERMISSION_SETTINGS)
      .action === "deny",
  );

  // "Allow always" must not widen.
  const always = ruleForAlwaysAllow("write_file", "src/app.ts");
  check(
    "allow_always covers the approved file",
    evaluate("write_file", "src/app.ts", settingsWith("ask", [always])).action === "allow",
  );
  check(
    "allow_always does not cover a sibling",
    evaluate("write_file", "src/.env", settingsWith("ask", [always])).action === "ask",
  );
  const globby = ruleForAlwaysAllow("run_terminal_cmd", "echo *");
  check(
    "allow_always escapes metacharacters",
    evaluate("run_terminal_cmd", "echo *", settingsWith("ask", [globby])).action === "allow" &&
      evaluate("run_terminal_cmd", "echo secrets", settingsWith("ask", [globby])).action === "ask",
  );

  // -- describeCall --------------------------------------------------------
  console.log("\ndescribeCall");
  const scratchRoots = [scratch.root];
  const cmdDesc = await describeCall(
    "run_terminal_cmd",
    { command: "pnpm  test   --watch" },
    scratchRoots,
  );
  check(
    "command subject is verbatim",
    cmdDesc.subject === "pnpm  test   --watch",
    JSON.stringify(cmdDesc.subject),
  );
  check(
    "command summary collapses whitespace",
    cmdDesc.summary === "Run `pnpm test --watch`",
    cmdDesc.summary,
  );

  const createDesc = await describeCall(
    "write_file",
    { path: "new/file.ts", content: "const a = 1;\nconst b = 2;\n" },
    scratchRoots,
  );
  check(
    "create is summarised as a create",
    createDesc.summary === "Create new/file.ts (2 lines)",
    createDesc.summary,
  );
  check(
    "create shows added lines",
    createDesc.diffPreview?.includes("+const a = 1;") === true,
    createDesc.diffPreview,
  );

  await writeFile(path.join(scratchDir, "existing.ts"), "one\ntwo\nthree\n", "utf8");
  const overwriteDesc = await describeCall(
    "write_file",
    { path: "existing.ts", content: "one\nTWO\nthree\n" },
    scratchRoots,
  );
  check(
    "overwrite is summarised as an overwrite",
    overwriteDesc.summary === "Overwrite existing.ts",
    overwriteDesc.summary,
  );
  check(
    "overwrite diffs against what is on disk",
    overwriteDesc.diffPreview?.includes("-two") === true &&
      overwriteDesc.diffPreview?.includes("+TWO") === true,
    overwriteDesc.diffPreview,
  );

  const editDesc = await describeCall(
    "edit_file",
    { path: "existing.ts", old_string: "two", new_string: "TWO", replace_all: true },
    scratchRoots,
  );
  check(
    "edit summary notes replace_all",
    editDesc.summary === "Edit existing.ts (all occurrences)",
    editDesc.summary,
  );
  check(
    "edit previews old → new",
    editDesc.diffPreview?.includes("+TWO") === true,
    editDesc.diffPreview,
  );

  const escapedDesc = await describeCall(
    "write_file",
    { path: "../escape.ts", content: "" },
    scratchRoots,
  );
  check(
    "an unresolvable path is flagged rather than prompted",
    typeof escapedDesc.unresolvedReason === "string",
    escapedDesc.unresolvedReason,
  );
  check(
    "and its raw subject is still rule-matchable",
    escapedDesc.subject === "../escape.ts",
    escapedDesc.subject,
  );

  const secretDesc = await describeCall("read_file", { path: ".env" }, scratchRoots);
  check(
    "describe → evaluate round-trips on a secret",
    evaluate("read_file", secretDesc.subject, DEFAULT_PERMISSION_SETTINGS).action === "ask",
    secretDesc.subject,
  );

  // -- run_terminal_cmd ----------------------------------------------------
  console.log("\nrun_terminal_cmd");
  const echoed = await runScratch("run_terminal_cmd", { command: "echo trace-smoke-ok" });
  check("captures stdout", echoed.content.includes("trace-smoke-ok"), echoed.content.slice(0, 120));
  check("reports the shell", typeof echoed.meta?.shell === "string", String(echoed.meta?.shell));
  check(
    "streamed output to the UI",
    events.some((e) => e.type === "tool_call_output_delta" && e.chunk.includes("trace-smoke-ok")),
  );
  const failed = await runScratch("run_terminal_cmd", { command: "exit 3" });
  check(
    "surfaces a non-zero exit",
    failed.isError === true && failed.meta?.exitCode === 3,
    failed.summary,
  );
  const timedOut = await runScratch("run_terminal_cmd", {
    command: "sleep 5",
    timeout_ms: 1000,
  });
  check(
    "kills on timeout",
    timedOut.isError === true && /timeout/i.test(timedOut.content),
    timedOut.summary,
  );

  // -- todo_write ----------------------------------------------------------
  console.log("\ntodo_write");
  const todos = await run("todo_write", {
    todos: [
      { id: "1", content: "Write the agent loop", status: "in_progress" },
      { id: "2", content: "Wire the desktop app", status: "pending" },
    ],
  });
  check("accepts a valid list", todos.isError !== true, todos.content);
  check("stores it in session state", todoState.items.length === 2);
  check(
    "emits todos_updated",
    events.some((e) => e.type === "todos_updated"),
  );
  const twoActive = await run("todo_write", {
    todos: [
      { id: "1", content: "a", status: "in_progress" },
      { id: "2", content: "b", status: "in_progress" },
    ],
  });
  check("rejects two in_progress", twoActive.isError === true);

  // -- provider request assembly -------------------------------------------
  // The cache prefix is the engine's whole cost profile and it fails silently:
  // a destroyed cache looks identical to a working one except in the bill.
  console.log("\nbuildRequest");
  const spec = {
    model: resolveModel(undefined),
    system: "You are Trace.",
    messages: [
      { role: "user", content: "hello" },
      {
        role: "assistant",
        content: [
          { type: "thinking", thinking: "hmm", signature: "sig" },
          { type: "tool_use", id: "call_1", name: "read_file", input: { path: "a.ts" } },
        ],
      },
      {
        role: "user",
        content: [{ type: "tool_result", tool_use_id: "call_1", content: "contents" }],
      },
    ],
    tools: toolsForRequest({ hasSemanticIndex: false, hasRules: false }),
    settings: { effort: "xhigh", showThinking: true },
  };
  const req = buildRequest(spec);

  check("targets the default model", req.model === "claude-opus-5", req.model);
  check("streams", req.stream === true);
  check(
    "caps output below the model's max",
    req.max_tokens <= spec.model.maxOutputTokens,
    String(req.max_tokens),
  );
  check(
    "puts one breakpoint at the end of system",
    req.system.length === 1 && req.system[0].cache_control?.type === "ephemeral",
  );
  check(
    "leaves tools unmarked",
    req.tools.every((t) => t.cache_control === undefined),
  );
  check(
    "omits codebase_search without an index",
    !req.tools.some((t) => t.name === "codebase_search"),
  );
  check(
    "passes effort through",
    req.output_config?.effort === "xhigh",
    JSON.stringify(req.output_config),
  );
  check("uses adaptive thinking", req.thinking?.type === "adaptive", JSON.stringify(req.thinking));
  check("never sends budget_tokens", req.thinking?.budget_tokens === undefined);

  const marks = req.messages.flatMap((m, i) =>
    typeof m.content === "string"
      ? []
      : m.content.flatMap((b, j) => (b.cache_control ? [`${i}.${j}`] : [])),
  );
  check("places exactly two rolling breakpoints", marks.length === 2, marks.join(", "));
  check("marks the last message", marks.includes("2.0"), marks.join(", "));
  check(
    "skips a trailing thinking block and marks the tool_use instead",
    marks.includes("1.1"),
    marks.join(", "),
  );
  check(
    "never marks a thinking block",
    req.messages.every(
      (m) =>
        typeof m.content === "string" ||
        m.content.every((b) => b.type !== "thinking" || b.cache_control === undefined),
    ),
  );
  check(
    "does not mutate the caller's history",
    spec.messages.every(
      (m) => typeof m.content === "string" || m.content.every((b) => b.cache_control === undefined),
    ),
  );

  // Stale marks must not survive into the next request, or a long turn blows the
  // four-breakpoint limit and gets a 400.
  const restamped = buildRequest({ ...spec, messages: req.messages });
  const restampedMarks = restamped.messages.flatMap((m) =>
    typeof m.content === "string" ? [] : m.content.filter((b) => b.cache_control),
  );
  check(
    "strips old breakpoints before re-marking",
    restampedMarks.length === 2,
    String(restampedMarks.length),
  );

  const noThinking = buildRequest({
    ...spec,
    settings: { effort: "low", showThinking: false },
  });
  check("omits reasoning display when asked", noThinking.thinking?.display === "omitted");

  const emptyHistory = buildRequest({ ...spec, messages: [] });
  check("survives an empty history", emptyHistory.messages.length === 0);

  // -- provider error classification ---------------------------------------
  console.log("\nclassify");
  check(
    "a bad key is not retried",
    classify(new AuthenticationError(401, {}, "bad key", new Headers())).retryable === false,
  );
  check(
    "a rate limit is retried",
    classify(new RateLimitError(429, {}, "slow down", new Headers())).retryable === true,
  );
  check(
    "a 529 overload is retried",
    classify(new InternalServerError(529, {}, "overloaded", new Headers())).retryable === true,
  );
  check(
    "a malformed request is not retried",
    classify(new BadRequestError(400, apiBody("bad shape"), undefined, new Headers())).retryable ===
      false,
  );
  check(
    "surfaces the API's own sentence, not the JSON body",
    classify(new BadRequestError(400, apiBody("bad shape"), undefined, new Headers())).error
      .message === "The Anthropic API rejected the request: bad shape",
    classify(new BadRequestError(400, apiBody("bad shape"), undefined, new Headers())).error
      .message,
  );
  const overflow = classify(
    new BadRequestError(
      400,
      apiBody("prompt is too long: 250000 tokens > 200000 maximum"),
      undefined,
      new Headers(),
    ),
  );
  check(
    "context overflow gets its own code",
    overflow.error.code === ErrorCode.ContextExceeded && overflow.retryable === false,
    String(overflow.error.code),
  );
  check(
    "an abort reads as cancelled",
    classify(new APIUserAbortError()).error.code === ErrorCode.TurnCancelled,
  );
  check(
    "a connection failure is retried",
    classify(new APIConnectionError({ message: "offline" })).retryable === true,
  );

  // -- system prompt -------------------------------------------------------
  console.log("\nsystem prompt");
  const promptEnv = {
    roots: [repoRoot],
    isGitRepo: true,
    hasSemanticIndex: false,
    today: "2026-09-01",
  };
  const prompt = buildSystemPrompt(promptEnv);
  check(
    "is byte-identical for the same environment",
    buildSystemPrompt(promptEnv) === prompt,
    "a prompt that varies costs a full cache write every turn",
  );
  check("states the resolved shell", prompt.includes(resolveShell().label));
  check("names the workspace root", prompt.includes(repoRoot.replace(/\\/g, "/")));
  check("mentions git only when there is a repo", prompt.includes("git repository"));
  check(
    "omits git for a non-repo",
    !buildSystemPrompt({ ...promptEnv, isGitRepo: false }).includes("git repository"),
  );
  check("omits codebase_search without an index", !prompt.includes("codebase_search"));
  check(
    "documents codebase_search once indexed",
    buildSystemPrompt({ ...promptEnv, hasSemanticIndex: true }).includes("codebase_search"),
  );
  check("costs nothing when there are no rules", !prompt.includes("# Project rules"));
  check(
    "and nothing for an empty rule set either",
    !buildSystemPrompt({
      ...promptEnv,
      rules: { applied: [], fetchable: [], omitted: [] },
    }).includes("# Project rules"),
  );
  check(
    "says so when no folder is open",
    buildSystemPrompt({ ...promptEnv, roots: [] }).includes("No workspace folder is open"),
  );
  const multiRoot = buildSystemPrompt({ ...promptEnv, roots: [repoRoot, scratchDir] });
  check(
    "warns about ambiguity with several roots",
    multiRoot.includes("resolution order") && multiRoot.includes(scratchDir.replace(/\\/g, "/")),
  );
  check("costs nothing in the default mode", turnReminders({ mode: "auto_edit" }).length === 0);
  check("warns the model in plan mode", turnReminders({ mode: "plan" })[0]?.includes("Plan mode"));
  check("warns the model in yolo mode", turnReminders({ mode: "yolo" }).length === 1);
  check(
    "keeps mode out of the cached prefix",
    !prompt.includes("Plan mode") && !prompt.includes("YOLO"),
    "mode belongs in the user turn, not the system prompt",
  );
  check(
    "marks injected text",
    asSystemReminder("x") === "<system-reminder>\nx\n</system-reminder>",
  );
  check("stamps the date as YYYY-MM-DD", /^\d{4}-\d{2}-\d{2}$/.test(todayStamp(new Date())));

  // -- turn loop -----------------------------------------------------------
  console.log("\nline counting");
  check("no lines in an empty file", countLines("") === 0);
  check("counts a file with no trailing newline", countLines("a\nb") === 2);
  check("does not count the trailing newline as a line", countLines("a\nb\n") === 2);
  check("counts a genuine blank final line", countLines("a\n\n") === 2);
  check("handles CRLF", countLines("a\r\nb\r\n") === 2);

  await turnSection({ workspaces, scratch, scratchDir });
  await rulesSection();
  await gitSection();
  await reviewSection();
  await engineSection();
  await processSection();

  await rm(scratchDir, { recursive: true, force: true });

  console.log(`\n${failures === 0 ? "PASS" : `FAIL — ${failures} check(s) failed`}`);
  process.exit(failures === 0 ? 0 : 1);
}

/**
 * A provider that replays a scripted conversation.
 *
 * Each step is either a description of an assistant turn or a function, which receives
 * the stream callbacks and may throw — that is how the interrupt path gets exercised
 * without a network or an API key.
 */
function fakeProvider(script) {
  const requests = [];
  let index = 0;
  return {
    requests,
    async stream(spec, callbacks) {
      // Cloned: `spec.messages` is the live history, and asserting on it later would
      // otherwise see whatever the turn appended after this call.
      requests.push(structuredClone(spec.messages));
      const step = script[index++];
      if (!step) throw new Error(`fake provider: nothing scripted for request ${index}`);
      if (typeof step === "function") return await step(callbacks);

      const content = [];
      if (step.text) {
        callbacks.onText(0, step.text);
        content.push({ type: "text", text: step.text });
      }
      const toolCalls = [];
      for (const [i, call] of (step.toolCalls ?? []).entries()) {
        const callId = `toolu_${index}_${i}`;
        const blockIndex = content.length;
        callbacks.onToolStart(blockIndex, callId, call.tool);
        callbacks.onToolInputDelta(callId, JSON.stringify(call.input));
        content.push({ type: "tool_use", id: callId, name: call.tool, input: call.input });
        toolCalls.push({ callId, tool: call.tool, input: call.input, blockIndex });
      }
      return {
        message: { role: "assistant", content },
        text: step.text ?? "",
        toolCalls,
        stopReason: step.stopReason ?? (toolCalls.length > 0 ? "tool_use" : "end_turn"),
        usage: {
          inputTokens: 40,
          outputTokens: 12,
          cacheCreationInputTokens: 0,
          cacheReadInputTokens: 1_200,
        },
      };
    },
  };
}

/**
 * Tool_use blocks with no matching tool_result.
 *
 * The invariant the turn loop is built around. Worth asserting on every scenario
 * rather than one: the API rejects the *next* request, so a break here shows up as a
 * mystery 400 long after the turn that caused it.
 */
function unansweredToolUses(history) {
  const answered = new Set();
  for (const message of history) {
    if (message.role !== "user" || typeof message.content === "string") continue;
    for (const block of message.content) {
      if (block.type === "tool_result") answered.add(block.tool_use_id);
    }
  }
  const orphans = [];
  for (const message of history) {
    if (message.role !== "assistant" || typeof message.content === "string") continue;
    for (const block of message.content) {
      if (block.type === "tool_use" && !answered.has(block.id)) orphans.push(block.name);
    }
  }
  return orphans;
}

function toolResults(history) {
  const results = [];
  for (const message of history) {
    if (message.role !== "user" || typeof message.content === "string") continue;
    for (const block of message.content) {
      if (block.type === "tool_result") results.push(block);
    }
  }
  return results;
}

async function turnSection({ workspaces, scratch, scratchDir }) {
  console.log("\nturn loop");
  const homes = [];

  async function newSettings(patch) {
    const home = await mkdtemp(path.join(os.tmpdir(), "trace-smoke-home-"));
    homes.push(home);
    const store = new SettingsStore(home);
    await store.load();
    if (patch) await store.update(patch);
    return store;
  }

  /**
   * One session's worth of state, so two `drive` calls can be two turns of the same
   * conversation. The rule dedupe is session-scoped, so proving it needs exactly that.
   */
  function newTurnSession() {
    return { files: new FileStateTracker(), attachedRules: new Set(), history: [] };
  }

  /** Drive one turn end to end and hand back everything worth asserting on. */
  async function drive({ script, params, settingsPatch, decide, holder, rules, session }) {
    const store = await newSettings(settingsPatch);
    const provider = fakeProvider(script);
    const events = [];
    const state = session ?? newTurnSession();
    const history = state.history;
    const prompts = [];
    const todos = { items: [] };

    const turn = new Turn(
      "turn-loop",
      {
        sessionId: "smoke",
        workspaces,
        workspace: scratch,
        settings: store,
        provider,
        files: state.files,
        todos: {
          get: () => todos.items,
          set: (next) => {
            todos.items = next;
          },
        },
        checkpoints: null,
        rules: rules ?? (async () => []),
        attachedRules: state.attachedRules,
        history,
        emit: (event) => events.push(event),
        requestPermission: async (request) => {
          prompts.push(request);
          return decide(request);
        },
        canPrompt: decide !== undefined,
        log: new Logger("turn"),
      },
      { text: "do the thing", ...params },
    );
    if (holder) holder.turn = turn;

    const stopReason = await turn.run();
    return { stopReason, events, history, prompts, provider, settings: store, session: state };
  }

  const typeOf = (events, type) => events.filter((event) => event.type === type);

  // -- a plain conversational turn
  const plain = await drive({ script: [{ text: "Nothing to change here." }] });
  check("ends a text-only turn cleanly", plain.stopReason === "end_turn", plain.stopReason);
  check("history is user then assistant", plain.history.length === 2);
  check(
    "the user's own text goes last in their message",
    plain.history[0].content.at(-1).text === "do the thing",
  );
  check("emits turn_started once", typeOf(plain.events, "turn_started").length === 1);
  check("streams text through", typeOf(plain.events, "text_delta").length === 1);
  check("reports usage during the turn", typeOf(plain.events, "usage_updated").length === 1);
  const completed = typeOf(plain.events, "turn_completed")[0];
  check("emits turn_completed with a cost", completed?.cost.requests === 1);
  check("prices the turn", completed.cost.estimatedUsd > 0, String(completed.cost.estimatedUsd));
  check("reports no changes for a read-only turn", completed.changes.length === 0);
  check("asks for no permission when nothing was called", plain.prompts.length === 0);

  // -- a tool call that needs no approval
  const readOnly = await drive({
    script: [
      { text: "Looking.", toolCalls: [{ tool: "list_dir", input: { path: "." } }] },
      { text: "Done." },
    ],
  });
  check("runs a read-only call and continues", readOnly.stopReason === "end_turn");
  check("history is user/assistant/results/assistant", readOnly.history.length === 4);
  check("answers the call", toolResults(readOnly.history).length === 1);
  check("the result is not an error", toolResults(readOnly.history)[0].is_error === undefined);
  check("feeds the result back to the model", readOnly.provider.requests.length === 2);
  check(
    "the second request carries the tool_result",
    readOnly.provider.requests[1].at(-1).content[0].type === "tool_result",
  );
  check("never prompts for a read", readOnly.prompts.length === 0);
  check(
    "emits no permission_resolved for a read",
    typeOf(readOnly.events, "permission_resolved").length === 0,
  );

  // -- plan mode
  const planned = await drive({
    params: { permissionMode: "plan" },
    script: [
      { toolCalls: [{ tool: "write_file", input: { path: "must-not-exist.txt", content: "x" } }] },
      { text: "Here is what I would change." },
    ],
  });
  const planResult = toolResults(planned.history)[0];
  check("plan mode refuses a write", planResult?.is_error === true, planResult?.content);
  check("says it was a permission decision", planResult.content.includes("Permission denied"));
  check(
    "plan mode writes nothing to disk",
    !(await exists(path.join(scratchDir, "must-not-exist.txt"))),
  );
  check("does not prompt for a rule-based denial", planned.prompts.length === 0);
  check(
    "records the automatic denial",
    typeOf(planned.events, "permission_resolved")[0]?.automatic === true,
  );
  check("a denied turn still finishes", planned.stopReason === "end_turn");
  check("no unanswered call after a denial", unansweredToolUses(planned.history).length === 0);

  // -- a headless client cannot be asked
  const headless = await drive({
    script: [
      { toolCalls: [{ tool: "run_terminal_cmd", input: { command: "echo hi" } }] },
      { text: "ok" },
    ],
  });
  check(
    "explains itself when no prompt is possible",
    toolResults(headless.history)[0]?.content.includes("cannot show a prompt"),
    toolResults(headless.history)[0]?.content,
  );

  // -- allow_always must hold for the rest of the same turn
  const remembered = await drive({
    script: [
      {
        toolCalls: [
          { tool: "run_terminal_cmd", input: { command: "node --version" } },
          { tool: "run_terminal_cmd", input: { command: "node --version" } },
        ],
      },
      { text: "Both ran." },
    ],
    decide: () => ({ decision: "allow_always" }),
  });
  check(
    "allow_always is not asked twice in one turn",
    remembered.prompts.length === 1,
    `prompted ${remembered.prompts.length}x`,
  );
  check(
    "both calls ran",
    toolResults(remembered.history).length === 2 &&
      toolResults(remembered.history).every((r) => r.is_error === undefined),
  );
  check(
    "persists the rule",
    remembered.settings.get().permissions.rules.some((r) => r.pattern === "node --version"),
  );

  // -- deny_and_abort stops the turn without orphaning anything
  const aborted = await drive({
    script: [
      {
        toolCalls: [
          { tool: "run_terminal_cmd", input: { command: "echo one" } },
          { tool: "run_terminal_cmd", input: { command: "echo two" } },
        ],
      },
    ],
    decide: () => ({ decision: "deny_and_abort", reason: "not now" }),
  });
  check("deny_and_abort cancels the turn", aborted.stopReason === "cancelled", aborted.stopReason);
  check("only the first call is adjudicated", aborted.prompts.length === 1);
  check("both calls are still answered", toolResults(aborted.history).length === 2);
  check(
    "passes the user's reason to the model",
    toolResults(aborted.history)[0].content.includes("not now"),
  );
  check(
    "marks the skipped call as not run",
    toolResults(aborted.history)[1].content.includes("Not run"),
  );
  check("no unanswered call after an abort", unansweredToolUses(aborted.history).length === 0);
  check("still emits turn_completed", typeOf(aborted.events, "turn_completed").length === 1);

  // -- a tool the model invented
  const unknown = await drive({
    script: [{ toolCalls: [{ tool: "make_coffee", input: {} }] }, { text: "Sorry." }],
  });
  const unknownResult = toolResults(unknown.history)[0];
  check("rejects an unknown tool", unknownResult?.is_error === true);
  check("names the real tools", unknownResult.content.includes("read_file"), unknownResult.content);
  check("recovers on the next iteration", unknown.stopReason === "end_turn");

  // -- the runaway backstop
  const looping = await drive({
    settingsPatch: { maxIterationsPerTurn: 2 },
    script: [
      { toolCalls: [{ tool: "list_dir", input: { path: "." } }] },
      { toolCalls: [{ tool: "list_dir", input: { path: "." } }] },
      { toolCalls: [{ tool: "list_dir", input: { path: "." } }] },
    ],
  });
  check("stops at the iteration cap", looping.stopReason === "iteration_limit", looping.stopReason);
  check("does not exceed the cap", looping.provider.requests.length === 2);
  check("leaves valid history at the cap", unansweredToolUses(looping.history).length === 0);

  // -- interruption mid-stream
  const holder = {};
  const interrupted = await drive({
    holder,
    script: [
      async (callbacks) => {
        callbacks.onText(0, "Starting to look at the");
        holder.turn.interrupt();
        const abort = new Error("aborted");
        abort.name = "AbortError";
        throw abort;
      },
    ],
  });
  check("an interrupt reads as cancelled", interrupted.stopReason === "cancelled");
  check(
    "keeps the text the user already saw",
    interrupted.history[1]?.content === "Starting to look at the",
  );
  check(
    "tells the model it was cut off",
    interrupted.history[2]?.role === "user" &&
      interrupted.history[2].content.includes("interrupted"),
  );
  check(
    "emits turn_completed after an interrupt",
    typeOf(interrupted.events, "turn_completed").length === 1,
  );

  // -- change rollup
  const edited = await drive({
    script: [
      {
        toolCalls: [
          { tool: "write_file", input: { path: "rollup.txt", content: "one\ntwo\n" } },
          { tool: "write_file", input: { path: "rollup.txt", content: "one\ntwo\nthree\nfour\n" } },
        ],
      },
      { text: "Written." },
    ],
  });
  const rollup = typeOf(edited.events, "turn_completed")[0].changes;
  check("auto_edit needs no approval", edited.prompts.length === 0);
  check("rolls two writes to one file into one entry", rollup.length === 1, JSON.stringify(rollup));
  check("keeps the file as created, not modified", rollup[0]?.changeType === "created");
  check(
    "sums the lines across both writes",
    rollup[0]?.linesAdded === 4,
    String(rollup[0]?.linesAdded),
  );
  check(
    "reports the change on the call that made it",
    typeOf(edited.events, "tool_call_completed")[0]?.changes?.length === 1,
  );

  // -- an auto-attached rule rides in the user turn, once per session
  await writeFile(path.join(scratchDir, "Widget.tsx"), "export const Widget = () => null;\n");
  const frontendRule = {
    name: "frontend",
    description: "React conventions",
    globs: ["*.tsx"],
    activation: "auto",
    source: "workspace",
    path: path.join(scratchDir, ".trace", "rules", "frontend.md"),
    workspaceId: scratch.id,
    body: "Prefer function components.",
  };
  const rulesFor = async () => [frontendRule];
  const ruleSession = newTurnSession();

  const attachedTurn = await drive({
    session: ruleSession,
    rules: rulesFor,
    params: { attachments: [{ type: "file", path: "Widget.tsx" }] },
    script: [{ text: "Noted." }],
  });
  const firstUser = userText(attachedTurn.history[0]);
  check(
    "an @-mentioned .tsx attaches its rule on the same turn",
    firstUser.includes('<rule name="frontend"') &&
      firstUser.includes("Prefer function components."),
  );
  check(
    "delivers it as a system reminder, not as the user's own words",
    /<system-reminder>[\s\S]*<rule name="frontend"/.test(firstUser),
  );
  check(
    "names the repository it came from when more than one is open",
    firstUser.includes(`scope="${scratch.name}"`),
    firstUser,
  );
  check("records it as attached for the session", ruleSession.attachedRules.has("frontend"));

  const secondTurnStart = ruleSession.history.length;
  await drive({
    session: ruleSession,
    rules: rulesFor,
    params: { attachments: [{ type: "file", path: "Widget.tsx" }] },
    script: [{ text: "Still noted." }],
  });
  check(
    "does not re-send it on the next turn of the same session",
    !userText(ruleSession.history[secondTurnStart]).includes('<rule name="frontend"'),
  );

  const unmatched = await drive({
    rules: rulesFor,
    params: { attachments: [{ type: "file", path: "rollup.txt" }] },
    script: [{ text: "Nothing to attach." }],
  });
  check(
    "a file the globs do not match attaches nothing",
    !userText(unmatched.history[0]).includes('<rule name="frontend"'),
  );

  await Promise.all(homes.map((home) => rm(home, { recursive: true, force: true })));
}

/** Flatten a message's content down to the text the model would read. */
function userText(message) {
  if (message === undefined) return "";
  if (typeof message.content === "string") return message.content;
  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

/**
 * Rules: discovery, activation, glob attachment, the prompt budget, and `fetch_rules`.
 *
 * Against real files, because every failure mode in this layer is a property of the
 * filesystem and of the frontmatter parser rather than of the pure functions: a
 * hyphenated key, a `.mdc` extension, a name derived from a nested directory, an empty
 * body, a filename that cannot be a name. Hand-built `Rule` objects would assert my
 * beliefs about discovery instead of exercising discovery. The budget functions are the
 * exception and take synthetic input — there the arithmetic *is* the subject.
 */
async function rulesSection() {
  console.log("\nrules");

  const home = await mkdtemp(path.join(os.tmpdir(), "trace-smoke-rules-home-"));
  const rootA = await mkdtemp(path.join(os.tmpdir(), "trace-smoke-rules-a-"));
  const rootB = await mkdtemp(path.join(os.tmpdir(), "trace-smoke-rules-b-"));
  const registry = new WorkspaceRegistry();
  const wsA = await registry.open(rootA);
  const wsB = await registry.open(rootB);

  const put = async (base, relative, contents) => {
    const target = path.join(base, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, contents);
  };

  // -- user-global: shadowed by name, a hyphenated key, and a scope-free auto rule
  await put(home, "rules/testing.md", "---\ndescription: How the user tests\n---\nUser testing.\n");
  await put(home, "rules/style.md", "---\nalways-apply: true\n---\nTwo spaces.\n");
  await put(home, "rules/anywhere.md", "---\nglobs: *.tsx\n---\nAny React file, any repo.\n");

  // -- root A: the interesting cases
  await put(rootA, "AGENTS.md", "# Repo A\n\nRun the build before you claim it works.\n");
  await put(rootA, ".trace/rules/testing.md", "---\ndescription: How A tests\n---\nA testing.\n");
  await put(
    rootA,
    ".trace/rules/review/security.mdc",
    "---\ndescription: Security review\n---\nCheck authz.\n",
  );
  await put(
    rootA,
    ".trace/rules/frontend.md",
    '---\nglobs: ["*.tsx", "src/**"]\nalwaysApply: false\n---\nFunction components only.\n',
  );
  await put(rootA, ".trace/rules/manual.md", "# Release checklist\n\nTag, then publish.\n");
  await put(
    rootA,
    ".trace/rules/pinned.md",
    "---\nalwaysApply: true\nglobs: *.ts\n---\nAlways this.\n",
  );
  await put(rootA, ".trace/rules/ci.md", "---\nglobs: .github/**\n---\nPin action SHAs.\n");
  await put(rootA, ".trace/rules/empty.md", "---\ndescription: Nothing at all\n---\n");
  await put(rootA, ".trace/rules/not a name.md", "---\ndescription: Unusable\n---\nNope.\n");
  await put(rootA, ".trace/rules/notes.txt", "Not a rule file.\n");

  // -- root B: the one override of the AGENTS.md default, and a scoped auto rule
  await put(rootB, "AGENTS.md", "---\nalwaysApply: false\n---\nOnly when asked.\n");
  await put(rootB, ".trace/rules/backend.md", "---\nglobs: *.py\n---\nType hints everywhere.\n");

  const discovered = await discoverRules({ workspaces: [wsA, wsB], home });
  const byName = new Map(discovered.map((rule) => [rule.name, rule]));
  const named = (name) => byName.get(name);
  // `AGENTS.md` is the one name two rules can share, so it is looked up by root.
  const agentsFor = (workspaceId) =>
    discovered.find((rule) => rule.source === "agents" && rule.workspaceId === workspaceId);
  const countBySource = (source) => discovered.filter((rule) => rule.source === source).length;
  const order = { user: 0, agents: 1, workspace: 2 };
  const sequence = discovered.map((rule) => order[rule.source]);

  check(
    "orders user rules before AGENTS.md before workspace rules",
    sequence.every((value, index) => index === 0 || sequence[index - 1] <= value),
    discovered.map((rule) => `${rule.source}:${rule.name}`).join(" "),
  );
  check(
    "and sorts by name within a source",
    discovered.every(
      (rule, index) =>
        index === 0 ||
        discovered[index - 1].source !== rule.source ||
        discovered[index - 1].name <= rule.name,
    ),
  );
  check(
    "finds every rule and no more",
    countBySource("user") === 2 &&
      countBySource("agents") === 2 &&
      countBySource("workspace") === 7,
    `${countBySource("user")} user, ${countBySource("agents")} agents, ${countBySource("workspace")} workspace`,
  );
  check("both roots' AGENTS.md survive side by side", countBySource("agents") === 2);
  check("skips a rule with no body", named("empty") === undefined);
  check("skips a filename that cannot be a name", !discovered.some((r) => r.name.includes(" ")));
  check("skips a file that is not .md or .mdc", named("notes") === undefined);
  check(
    "reads .mdc and namespaces a nested rule",
    named("review:security")?.body.includes("authz") === true,
  );

  // -- activation, derived rather than declared
  check("description only means agent", named("testing")?.activation === "agent");
  check("alwaysApply, however spelled, means always", named("style")?.activation === "always");
  check("globs mean auto", named("frontend")?.activation === "auto");
  check("no frontmatter means manual", named("manual")?.activation === "manual");
  check("AGENTS.md is always applied by default", agentsFor(wsA.id)?.activation === "always");
  check(
    "and honours an explicit alwaysApply: false",
    agentsFor(wsB.id)?.activation === "manual",
    agentsFor(wsB.id)?.activation,
  );
  check("alwaysApply wins over globs", named("pinned")?.activation === "always");
  check("and drops the globs it would not use", named("pinned")?.globs.length === 0);
  check(
    "derives a description from the first line",
    named("manual")?.description === "Release checklist",
  );
  check(
    "a workspace rule shadows a user rule of the same name",
    named("testing")?.source === "workspace",
  );
  check(
    "and it is the workspace body that survives",
    named("testing")?.body.includes("A testing") === true,
  );

  // -- glob attachment
  const matchedTsx = matchAutoRules(discovered, [
    { relative: "src/app/Button.tsx", workspaceId: wsA.id },
  ]);
  check(
    "a bare *.tsx matches a nested path, and only auto rules match",
    matchedTsx.map((rule) => rule.name).join() === "anywhere,frontend",
    matchedTsx.map((rule) => rule.name).join(),
  );
  check(
    "and at the root, where a strict path glob would also have matched",
    matchAutoRules(discovered, [{ relative: "Button.tsx", workspaceId: wsA.id }])
      .map((rule) => rule.name)
      .join() === "anywhere,frontend",
  );
  check(
    "a slash-bearing pattern stays anchored",
    matchAutoRules(discovered, [{ relative: "src/a/b.ts", workspaceId: wsA.id }]).some(
      (rule) => rule.name === "frontend",
    ) &&
      !matchAutoRules(discovered, [{ relative: "app/src/b.ts", workspaceId: wsA.id }]).some(
        (rule) => rule.name === "frontend",
      ),
  );
  check(
    "matches inside a dot directory",
    matchAutoRules(discovered, [{ relative: ".github/workflows/ci.yml", workspaceId: wsA.id }])
      .map((rule) => rule.name)
      .join() === "ci",
  );
  check(
    "a workspace rule does not reach into another workspace",
    matchAutoRules(discovered, [{ relative: "main.py", workspaceId: wsA.id }]).length === 0,
  );
  check(
    "and does match in its own",
    matchAutoRules(discovered, [{ relative: "main.py", workspaceId: wsB.id }])
      .map((rule) => rule.name)
      .join() === "backend",
  );
  check("no targets, no rules", matchAutoRules(discovered, []).length === 0);

  // -- the always-applied budget, on synthetic rules: the arithmetic is the subject
  const synthetic = (name, body, activation = "always") => ({
    name,
    description: name,
    globs: [],
    activation,
    source: "workspace",
    path: `/synthetic/${name}.md`,
    workspaceId: null,
    body,
  });
  const budgetSet = [
    synthetic("first", "a".repeat(30)),
    synthetic("second", "b".repeat(30)),
    synthetic("third", "c".repeat(30), "agent"),
  ];
  const budgeted = selectAlwaysApplied(budgetSet, 50);
  check("fills the budget in order", budgeted.rules.map((r) => r.name).join() === "first");
  check("reports what did not fit", budgeted.omitted.join() === "second");
  check("never considers a rule that is not always-applied", !budgeted.omitted.includes("third"));
  check(
    "keeps a single oversized rule rather than applying none",
    selectAlwaysApplied([synthetic("huge", "x".repeat(100))], 50).rules.length === 1,
  );

  // The bug this suite exists for: a rule the budget dropped must stay reachable.
  check(
    "a budget-dropped always rule becomes fetchable",
    fetchableRules(budgetSet, ["second"])
      .map((r) => r.name)
      .join() === "second,third",
    fetchableRules(budgetSet, ["second"])
      .map((r) => r.name)
      .join(),
  );
  check(
    "an in-prompt always rule does not",
    !fetchableRules(budgetSet, []).some((rule) => rule.name === "first"),
  );

  const built = buildRuleSet(budgetSet, 50);
  check(
    "buildRuleSet ties the four views together",
    built.all.length === 3 &&
      built.applied.map((r) => r.name).join() === "first" &&
      built.fetchable.map((r) => r.name).join() === "second,third" &&
      built.omitted.join() === "second",
  );
  check(
    "an empty rule set is empty and frozen",
    EMPTY_RULE_SET.all.length === 0 &&
      EMPTY_RULE_SET.applied.length === 0 &&
      EMPTY_RULE_SET.fetchable.length === 0 &&
      EMPTY_RULE_SET.omitted.length === 0 &&
      Object.isFrozen(EMPTY_RULE_SET),
  );
  check(
    "manual rules stay fetchable",
    fetchableRules(discovered).some((r) => r.name === "manual"),
  );

  // -- findRule
  check(
    "finds a rule case-insensitively",
    findRule(discovered, "REVIEW:Security")?.name === "review:security",
  );
  check("and tolerates surrounding space", findRule(discovered, " testing ")?.name === "testing");
  check("returns nothing for a name that is not there", findRule(discovered, "nope") === undefined);

  // -- fetch_rules, through the same dispatch the turn loop uses
  const ruleSet = buildRuleSet(discovered);
  const ruleSettings = new SettingsStore(home);
  await ruleSettings.load();
  const fetchCtx = (rules) => ({
    sessionId: "smoke",
    turnId: "turn-rules",
    callId: "call-rules",
    workspaces: registry,
    workspace: wsA,
    roots: registry.roots(),
    settings: ruleSettings,
    log: new Logger("rules"),
    signal: new AbortController().signal,
    emit: () => {},
    files: new FileStateTracker(),
    todos: { get: () => [], set: () => {} },
    rules,
  });

  const fetched = await runTool("fetch_rules", { rule_names: ["testing"] }, fetchCtx(ruleSet));
  check(
    "fetches a rule by name",
    fetched.isError === undefined &&
      fetched.content.includes('<rule name="testing"') &&
      fetched.content.includes("A testing"),
    fetched.content,
  );
  check("summarises a single fetch", fetched.summary === "Read rule testing", fetched.summary);
  check(
    "hands the UI the file it came from",
    fetched.meta?.rules?.[0]?.path?.endsWith("testing.md") === true,
  );

  const withGlobs = await runTool("fetch_rules", { rule_names: ["frontend"] }, fetchCtx(ruleSet));
  check(
    "shows an auto rule's trigger so the model knows it will return",
    withGlobs.content.includes('globs="*.tsx, src/**"'),
    withGlobs.content,
  );

  const several = await runTool(
    "fetch_rules",
    { rule_names: ["testing", " testing ", "manual"] },
    fetchCtx(ruleSet),
  );
  check(
    "trims and dedupes names",
    several.summary === "Read 2 rules: testing, manual",
    several.summary,
  );

  const inPrompt = await runTool("fetch_rules", { rule_names: ["pinned"] }, fetchCtx(ruleSet));
  check(
    "points at the prompt for an always-applied rule",
    inPrompt.isError === true && inPrompt.content.includes("already in your system prompt"),
    inPrompt.content,
  );

  const noSuchRule = await runTool("fetch_rules", { rule_names: ["nope"] }, fetchCtx(ruleSet));
  check(
    "lists what is fetchable when nothing matches",
    noSuchRule.isError === true &&
      noSuchRule.content.includes("No rule matched nope") &&
      noSuchRule.content.includes("manual"),
    noSuchRule.content,
  );

  const partial = await runTool(
    "fetch_rules",
    { rule_names: ["testing", "nope"] },
    fetchCtx(ruleSet),
  );
  check(
    "a partial hit still succeeds, with a note",
    partial.isError === undefined && partial.content.includes("Not found: nope."),
    partial.content,
  );

  const tooMany = await runTool(
    "fetch_rules",
    { rule_names: Array.from({ length: 11 }, (_, i) => `rule-${i}`) },
    fetchCtx(ruleSet),
  );
  check(
    "caps one call at ten rules",
    tooMany.isError === true && tooMany.content.includes("the limit is 10 per call"),
    tooMany.content,
  );

  const noneFetchable = await runTool(
    "fetch_rules",
    { rule_names: ["testing"] },
    fetchCtx(EMPTY_RULE_SET),
  );
  check(
    "says so when a stale cached prefix offers the tool with no rules behind it",
    noneFetchable.isError === true &&
      noneFetchable.content === "This workspace has no fetchable rules.",
  );

  const blank = await runTool("fetch_rules", { rule_names: ["   "] }, fetchCtx(ruleSet));
  check(
    "rejects a name that is only whitespace",
    blank.isError === true && blank.content.includes("Name at least one rule"),
  );
  const emptyList = await runTool("fetch_rules", { rule_names: [] }, fetchCtx(ruleSet));
  check(
    "rejects an empty list at the schema",
    emptyList.isError === true && emptyList.summary === "Invalid fetch_rules arguments",
  );

  // -- what the prompt does with a rule set
  const promptWithRules = buildSystemPrompt({
    roots: [rootA],
    isGitRepo: false,
    hasSemanticIndex: false,
    today: "2026-09-02",
    rules: {
      applied: [{ name: "style", source: "user", body: "Two spaces." }],
      fetchable: [
        { name: "frontend", description: "React conventions", globs: ["*.tsx"] },
        { name: "manual", description: "", globs: [] },
      ],
      omitted: ["huge"],
    },
  });
  check("renders a rules section", promptWithRules.includes("# Project rules"));
  check("inlines an applied rule in full", promptWithRules.includes("Two spaces."));
  check(
    "indexes a fetchable rule with its description",
    promptWithRules.includes("- `frontend` — React conventions — attaches to *.tsx"),
  );
  check("indexes one with no description too", promptWithRules.includes("- `manual`"));
  check(
    "names the always-applied rules the budget dropped",
    promptWithRules.includes("did not fit the prompt's rule budget: huge"),
  );
  check(
    "renders AGENTS.md as coming from the project",
    renderRule({ name: "AGENTS.md", source: "agents", body: "b" }).includes(
      'from="project/AGENTS.md"',
    ),
  );
  check(
    "carries scope and globs when they are known",
    renderRule({
      name: "frontend",
      source: "workspace",
      body: "b",
      scope: "app",
      globs: "*.tsx",
    }) === '<rule name="frontend" from="project" scope="app" globs="*.tsx">\nb\n</rule>',
  );

  await removeTemp(home);
  await removeTemp(rootA);
  await removeTemp(rootB);
}

/**
 * Git status, diff, and shadow-git checkpoints against a real repository.
 *
 * Real, because every interesting property here is a property of git's behaviour rather
 * than of this code: that `add -A` skips the project's own `.git`, that a shadow commit
 * leaves the user's reflog alone, that restore deletes what the checkpoint does not have.
 * A mock would assert my beliefs about git instead of git.
 */
async function gitSection() {
  console.log("\ngit");
  if (!(await gitAvailable())) {
    check("git is available", false, "install git to run this section");
    return;
  }

  const root = await mkdtemp(path.join(os.tmpdir(), "trace-git-"));
  const repo = path.join(root, "repo");
  const home = path.join(root, "home");
  await mkdir(repo, { recursive: true });
  await mkdir(home, { recursive: true });

  const run = (...args) =>
    execFileSync("git", args, { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  run("init", "-q", ".");
  run("config", "user.email", "smoke@trace.local");
  run("config", "user.name", "Smoke");
  await writeFile(path.join(repo, ".gitignore"), "node_modules/\n");
  await writeFile(path.join(repo, "keep.txt"), "one\ntwo\n");
  await writeFile(path.join(repo, "gone.txt"), "bye\n");
  await mkdir(path.join(repo, "node_modules"), { recursive: true });
  await writeFile(path.join(repo, "node_modules", "big.js"), "x".repeat(2048));
  run("add", ".");
  run("commit", "-qm", "init");

  const workspaces = new WorkspaceRegistry();
  const workspace = await workspaces.open(repo);

  // -- status --------------------------------------------------------------
  // A space in the filename on purpose: porcelain v1 would C-quote it, and half the
  // status parsers in the world get this wrong.
  await writeFile(path.join(repo, "keep.txt"), "one\nTWO\n");
  await writeFile(path.join(repo, "brand new.txt"), "fresh\n");
  await rm(path.join(repo, "gone.txt"));

  const status = await gitStatus(workspace);
  const byPath = (p) => status.files.filter((f) => f.path === p);
  check(
    "reports the branch",
    status.branch === "master" || status.branch === "main",
    status.branch,
  );
  check("sees a modified file", byPath("keep.txt")[0]?.status === "modified");
  check("sees a deleted file", byPath("gone.txt")[0]?.status === "deleted");
  check(
    "sees an untracked file with a space in its name",
    byPath("brand new.txt")[0]?.status === "untracked",
  );
  check(
    "does not quote the path",
    byPath("brand new.txt").length === 1,
    JSON.stringify(status.files),
  );
  check("leaves ignored files out", byPath("node_modules/big.js").length === 0);
  check("reports nothing in progress", status.operationInProgress === false);
  check(
    "reports zero ahead and behind with no upstream",
    status.ahead === 0 && status.behind === 0,
  );

  const staged = await gitStatus(workspace).then(() => {
    run("add", "keep.txt");
    return gitStatus(workspace);
  });
  check(
    "separates a staged change",
    staged.files.some((f) => f.path === "keep.txt" && f.staged),
    JSON.stringify(staged.files),
  );
  run("reset", "-q");

  // -- diff ----------------------------------------------------------------
  const trackedDiff = await gitDiff(workspace, { path: "keep.txt" });
  check("diffs a tracked change", trackedDiff.includes("-two") && trackedDiff.includes("+TWO"));

  const newDiff = await gitDiff(workspace, { path: "brand new.txt" });
  check(
    "synthesizes a diff for an untracked file",
    newDiff.includes("+fresh"),
    JSON.stringify(newDiff),
  );
  check(
    "names the missing side /dev/null",
    newDiff.startsWith("--- /dev/null\n"),
    JSON.stringify(newDiff.slice(0, 40)),
  );
  check(
    "does not invent a trailing blank line",
    newDiff.includes("@@ -0,0 +1,1 @@") && !/\+\n$/.test(newDiff),
    JSON.stringify(newDiff),
  );
  check(
    "empty diff for an unchanged file",
    (await gitDiff(workspace, { path: ".gitignore" })) === "",
  );

  // -- checkpoints ---------------------------------------------------------
  // Snapshotted rather than asserted absolutely: the setup above ran `git reset`, which
  // legitimately writes a reflog entry. What matters is that nothing below adds one.
  const reflogBefore = run("reflog").trim();
  const checkpoints = new CheckpointManager(workspace, home);
  const first = await checkpoints.create({
    sessionId: "s1",
    turnId: "t1",
    label: "Before the edit",
  });
  check(
    "writes a checkpoint",
    typeof first?.id === "string" && first.id.length === 40,
    JSON.stringify(first),
  );

  await writeFile(path.join(repo, "keep.txt"), "totally\ndifferent\n");
  await rm(path.join(repo, "brand new.txt"));
  await writeFile(path.join(repo, "agent-made.txt"), "the agent wrote this\n");
  await checkpoints.create({ sessionId: "s1", turnId: "t2", label: "Second turn" });
  await checkpoints.create({ sessionId: "s2", turnId: "t9", label: "Another session" });

  const listed = await checkpoints.list("s1");
  check("lists both checkpoints for the session", listed.length === 2, JSON.stringify(listed));
  check(
    "newest first",
    listed[0]?.label === "Second turn",
    JSON.stringify(listed.map((c) => c.label)),
  );
  check("carries the label through the commit message", listed[1]?.label === "Before the edit");
  check("carries the turn id", listed[0]?.turnId === "t2", listed[0]?.turnId);
  check("filters by session", (await checkpoints.list("s2")).length === 1);
  check("no checkpoints for an unknown session", (await checkpoints.list("nope")).length === 0);

  const restored = await checkpoints.restore(first.id);
  check(
    "restores the modified file",
    (await readFile(path.join(repo, "keep.txt"), "utf8")) === "one\nTWO\n",
  );
  check(
    "brings back a file deleted since the checkpoint",
    await exists(path.join(repo, "brand new.txt")),
  );
  check(
    "deletes a file created since the checkpoint",
    !(await exists(path.join(repo, "agent-made.txt"))),
  );
  check("leaves ignored files alone", await exists(path.join(repo, "node_modules", "big.js")));
  check(
    "reports every file it touched",
    restored.restoredFiles.length === 3,
    JSON.stringify(restored.restoredFiles),
  );
  check("makes the restore itself undoable", typeof restored.safetyCheckpointId === "string");

  // The whole premise: the user's own git is untouched by any of the above.
  check("does not move HEAD", run("log", "--format=%s", "-1").trim() === "init");
  check("does not add to the reflog", run("reflog").trim() === reflogBefore);
  check("does not stage anything", run("diff", "--cached", "--name-only").trim() === "");
  check("does not stash anything", run("stash", "list").trim() === "");
  check(
    "leaves the user's own uncommitted work in place",
    run("status", "--porcelain").includes("gone.txt"),
    run("status", "--porcelain"),
  );

  const missing = await checkpoints.restore("0000000000000000000000000000000000000000").then(
    () => null,
    (cause) => cause,
  );
  check(
    "refuses an unknown checkpoint",
    missing !== null && /No such checkpoint/.test(missing.message),
  );

  // -- pure parsers --------------------------------------------------------
  check("parses an empty status", parseStatus("").files.length === 0);
  check(
    "reads modes out of a raw diff",
    parseRawDiff(":100644 100644 aa bb M\0a.txt\0").every(
      (c) => c.srcMode === "100644" && c.status === "M",
    ),
  );
  check(
    "skips a gitlink in a raw diff",
    parseRawDiff(":160000 160000 aa bb M\0sub\0")[0]?.srcMode === "160000",
  );
  check("batches nothing into nothing", batchPathspecs([]).length === 0);
  check("keeps a small pathspec list in one batch", batchPathspecs(["a", "b", "c"]).length === 1);
  check("splits a long pathspec list", batchPathspecs(Array(4000).fill("x".repeat(10))).length > 1);

  await rm(root, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------
// review
// ---------------------------------------------------------------------------

/** 16 numbered lines, far enough apart that two edits make two hunks at context 3. */
const MULTI = Array.from({ length: 16 }, (_, i) => `l${String(i + 1).padStart(2, "0")}`).join("\n");

async function reviewSection() {
  console.log("\nreview");
  if (!(await gitAvailable())) {
    check("git is available", false, "install git to run this section");
    return;
  }

  // -- pure hunk machinery -------------------------------------------------
  // Ahead of the git setup because these are the invariants everything below relies on,
  // and a failure here explains a failure there.
  const twoHunks = diffHunks(
    `${MULTI}\n`,
    `${MULTI}\n`.replace("l02", "L02").replace("l14", "L14"),
  );
  check("splits distant edits into two hunks", twoHunks.length === 2, JSON.stringify(twoHunks));
  check(
    "numbers hunks from zero",
    twoHunks[0]?.index === 0 && twoHunks[1]?.index === 1,
    JSON.stringify(twoHunks.map((h) => h.index)),
  );
  check(
    "counts one line each way per hunk",
    twoHunks.every((h) => h.added === 1 && h.removed === 1),
    JSON.stringify(twoHunks.map((h) => [h.added, h.removed])),
  );

  const merged = diffHunks("a\nb\nc\n", "A\nb\nC\n");
  check("merges nearby edits into one hunk", merged.length === 1, JSON.stringify(merged));
  check("no hunks for identical text", diffHunks("same\n", "same\n").length === 0);

  const onlyFirst = revertHunk(
    `${MULTI}\n`,
    `${MULTI}\n`.replace("l02", "L02").replace("l14", "L14"),
    0,
    {
      expectHeader: twoHunks[0].header,
    },
  );
  check(
    "reverts one hunk and leaves the other",
    onlyFirst === `${MULTI}\n`.replace("l14", "L14"),
    JSON.stringify(onlyFirst?.slice(0, 24)),
  );
  check(
    "refuses a hunk whose header has moved",
    revertHunk("a\nb\n", "A\nb\n", 0, { expectHeader: "@@ -9,9 +9,9 @@" }) === null,
  );
  check("refuses an out-of-range hunk", revertHunk("a\n", "A\n", 7) === null);
  check(
    "keeps the trailing newline when reverting a whole-file deletion",
    revertHunk("a\nb\n", "", 0) === "a\nb\n",
    JSON.stringify(revertHunk("a\nb\n", "", 0)),
  );
  check("reverts a whole-file creation to nothing", revertHunk("", "a\nb\n", 0) === "");

  // -- a repo with a baseline ----------------------------------------------
  const root = await mkdtemp(path.join(os.tmpdir(), "trace-review-"));
  const repo = path.join(root, "repo");
  const home = path.join(root, "home");
  await mkdir(repo, { recursive: true });
  await mkdir(home, { recursive: true });

  const run = (...args) =>
    execFileSync("git", args, { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  run("init", "-q", ".");
  run("config", "user.email", "smoke@trace.local");
  run("config", "user.name", "Smoke");
  await writeFile(path.join(repo, "multi.txt"), `${MULTI}\n`);
  await writeFile(path.join(repo, "doomed.txt"), "delete me\n");
  run("add", ".");
  run("commit", "-qm", "init");

  const workspaces = new WorkspaceRegistry();
  const workspace = await workspaces.open(repo);
  const manager = new CheckpointManager(workspace, home);
  const baseline = await manager.create({ sessionId: "rev", turnId: "t1", label: "Baseline" });
  const context = { manager, workspace, defaultBaseline: baseline.id, baselines: {} };

  check(
    "nothing to review before anything changes",
    (await listReview(context)).files.length === 0,
  );

  // -- what the agent did --------------------------------------------------
  await writeFile(
    path.join(repo, "multi.txt"),
    `${MULTI}\n`.replace("l02", "L02").replace("l14", "L14"),
  );
  await writeFile(path.join(repo, "added.txt"), "brand new\n");
  await rm(path.join(repo, "doomed.txt"));
  await writeFile(path.join(repo, "blob.bin"), Buffer.from([0x00, 0x01, 0x02, 0x03]));
  // No NUL, so `looksBinary` says text; invalid UTF-8, so the round-trip check says
  // otherwise. This is the file a naive implementation corrupts.
  await writeFile(path.join(repo, "latin1.txt"), Buffer.from([0x68, 0x69, 0xe9, 0x0a]));
  await writeFile(path.join(repo, "huge.txt"), "a\n".repeat(1_100_000));

  const listed = await listReview(context);
  const file = (p) => listed.files.find((f) => f.path === p);
  check(
    "lists every changed path",
    listed.files.length === 6,
    JSON.stringify(listed.files.map((f) => f.path)),
  );
  check(
    "sorts by path",
    listed.files[0]?.path === "added.txt",
    JSON.stringify(listed.files[0]?.path),
  );
  check("does not claim to be truncated", listed.truncated === false);
  check("calls a new file added", file("added.txt")?.status === "added");
  check("calls a removed file deleted", file("doomed.txt")?.status === "deleted");
  check("calls an edited file modified", file("multi.txt")?.status === "modified");

  check(
    "counts lines the same way the transcript does",
    file("multi.txt")?.added === 2 && file("multi.txt")?.removed === 2,
    JSON.stringify([file("multi.txt")?.added, file("multi.txt")?.removed]),
  );
  check("offers both hunks of the edited file", file("multi.txt")?.hunks.length === 2);
  check(
    "does not invent a blank line at the end of a new file",
    file("added.txt")?.added === 1 && file("added.txt")?.removed === 0,
    JSON.stringify([file("added.txt")?.added, file("added.txt")?.removed]),
  );
  check(
    "counts a deleted file's lines as removed",
    file("doomed.txt")?.added === 0 && file("doomed.txt")?.removed === 1,
    JSON.stringify([file("doomed.txt")?.added, file("doomed.txt")?.removed]),
  );

  check("marks a NUL-bearing file binary", file("blob.bin")?.unreviewable === "binary");
  check(
    "marks a non-UTF-8 text file binary rather than corrupting it",
    file("latin1.txt")?.unreviewable === "binary",
    JSON.stringify(file("latin1.txt")),
  );
  check("marks an oversized file too_large", file("huge.txt")?.unreviewable === "too_large");
  check(
    "reports no hunks or counts for an unreviewable file",
    ["blob.bin", "latin1.txt", "huge.txt"].every((p) => {
      const entry = file(p);
      return entry?.hunks.length === 0 && entry.added === 0 && entry.removed === 0;
    }),
  );
  check("leaves reviewable files unflagged", file("multi.txt")?.unreviewable === null);

  // -- reverting one hunk --------------------------------------------------
  const hunks = file("multi.txt").hunks;
  const afterHunk = await revertInReview(context, "multi.txt", {
    index: 0,
    header: hunks[0].header,
  });
  check(
    "puts only the reverted hunk back",
    (await readFile(path.join(repo, "multi.txt"), "utf8")) === `${MULTI}\n`.replace("l14", "L14"),
  );
  check(
    "returns the file's remaining state",
    afterHunk?.hunks.length === 1 && afterHunk.added === 1 && afterHunk.removed === 1,
    JSON.stringify(afterHunk),
  );
  check("renumbers the remaining hunk", afterHunk?.hunks[0]?.index === 0);

  const stale = await revertInReview(context, "multi.txt", {
    index: 0,
    header: "@@ -99,3 +99,3 @@",
  }).then(
    () => null,
    (cause) => cause,
  );
  check(
    "refuses a hunk from a stale listing",
    stale !== null && /changed since it was listed/.test(stale.message),
    stale?.message,
  );
  check(
    "changes nothing when it refuses",
    (await readFile(path.join(repo, "multi.txt"), "utf8")) === `${MULTI}\n`.replace("l14", "L14"),
  );

  const binaryHunk = await revertInReview(context, "blob.bin", { index: 0, header: "@@ @@" }).then(
    () => null,
    (cause) => cause,
  );
  check(
    "refuses to revert a binary file hunk by hunk",
    binaryHunk !== null && /hunk by hunk/.test(binaryHunk.message),
    binaryHunk?.message,
  );

  // -- reverting whole files -----------------------------------------------
  check(
    "deletes a file the baseline never had",
    (await revertInReview(context, "added.txt")) === null,
  );
  check("and it is gone from disk", !(await exists(path.join(repo, "added.txt"))));

  check("restores a deleted file", (await revertInReview(context, "doomed.txt")) === null);
  check(
    "with its original contents",
    (await readFile(path.join(repo, "doomed.txt"), "utf8")) === "delete me\n",
  );

  check(
    "reverts a binary file wholesale",
    (await revertInReview(context, "blob.bin")) === null &&
      !(await exists(path.join(repo, "blob.bin"))),
  );

  // -- accepting advances the baseline -------------------------------------
  const accepted = await acceptBaseline(manager);
  check("records an accept baseline", typeof accepted === "string" && accepted.length === 40);
  check(
    "keeps the accept commit out of the session's checkpoint list",
    (await manager.list("rev")).length === 1,
    JSON.stringify((await manager.list("rev")).map((c) => c.label)),
  );
  context.baselines = { "multi.txt": accepted };

  check(
    "an accepted file drops out of review",
    (await listReview(context)).files.every((f) => f.path !== "multi.txt"),
    JSON.stringify((await listReview(context)).files.map((f) => f.path)),
  );

  // The whole point of a pointer rather than a flag: this second edit is one line, and it
  // must be reported as one line against what was approved — not as three against the
  // start of the session.
  await writeFile(
    path.join(repo, "multi.txt"),
    `${MULTI}\n`.replace("l14", "L14").replace("l06", "L06"),
  );
  const second = (await listReview(context)).files.find((f) => f.path === "multi.txt");
  check(
    "a later edit diffs against what was accepted",
    second?.added === 1 && second.removed === 1 && second.hunks.length === 1,
    JSON.stringify([second?.added, second?.removed, second?.hunks.length]),
  );
  check(
    "and reverts to the accepted contents, not the session's start",
    (await revertInReview(context, "multi.txt")) === null &&
      (await readFile(path.join(repo, "multi.txt"), "utf8")) === `${MULTI}\n`.replace("l14", "L14"),
  );

  // An accepted path that has since been put back exactly as the session found it differs
  // from its own baseline while matching the session's, so the diff alone cannot see it.
  await writeFile(path.join(repo, "multi.txt"), `${MULTI}\n`);
  check(
    "still reviews an accepted file returned to its original contents",
    (await listReview(context)).files.some((f) => f.path === "multi.txt"),
    JSON.stringify((await listReview(context)).files.map((f) => f.path)),
  );

  // -- the user's own git, again untouched ---------------------------------
  check("does not move HEAD", run("log", "--format=%s", "-1").trim() === "init");
  check("does not stage anything", run("diff", "--cached", "--name-only").trim() === "");
  check("does not stash anything", run("stash", "list").trim() === "");

  await rm(root, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------
// engine
// ---------------------------------------------------------------------------

/**
 * Two transports wired to each other, in memory.
 *
 * Delivery goes through `queueMicrotask` rather than a direct call, which matters: a
 * synchronous hand-off would let a response arrive before `request()` had finished
 * registering its pending entry. No real transport behaves that way, so a harness that
 * did would pass code that hangs over a pipe.
 */
function transportPair() {
  const sink = { a: null, b: null };
  const closed = { a: [], b: [] };
  const make = (self, peer) => ({
    send(frame) {
      queueMicrotask(() => sink[peer]?.(frame));
    },
    onData(listener) {
      sink[self] = listener;
    },
    onClose(listener) {
      closed[self].push(listener);
    },
    close() {
      for (const listener of [...closed.a, ...closed.b]) listener();
    },
  });
  return { client: make("a", "b"), engine: make("b", "a") };
}

/** Poll until `probe` returns something truthy. Returns undefined if it never does. */
async function waitFor(probe, timeoutMs = 4000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const found = probe();
    if (found) return found;
    if (Date.now() > deadline) return undefined;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

/**
 * The whole JSON-RPC surface, driven the way a client drives it.
 *
 * Deliberately through the protocol rather than by calling `Engine`'s methods: the
 * handler table is the part most likely to be wrong — a method registered under the
 * wrong name, a result shaped differently from `RequestMap`, a gate that lets something
 * through — and none of those are visible from inside the class.
 *
 * This section must never make a paid API call. The one turn it runs has the API key
 * explicitly cleared first, because a developer with `ANTHROPIC_API_KEY` exported would
 * otherwise have this spend their money on every run.
 */
async function engineSection() {
  console.log("\nengine");

  const home = await mkdtemp(path.join(os.tmpdir(), "trace-engine-home-"));
  const root = await mkdtemp(path.join(os.tmpdir(), "trace-engine-ws-"));
  await writeFile(
    path.join(root, "hello.ts"),
    'export const greeting = "hello";\nexport const other = 1;\n',
    "utf8",
  );

  const pair = transportPair();
  const client = new RpcPeer(pair.client, { name: "smoke-client" });
  const engine = new Engine(new RpcPeer(pair.engine, { name: "smoke-engine" }), { home });

  const logs = [];
  const turnEvents = [];
  const output = [];
  client.on("log", (entry) => logs.push(entry));
  client.on("session/event", (event) => turnEvents.push(event));
  client.on("terminal/output", (chunk) => output.push(chunk));

  /** Hand back the RpcError instead of throwing, so a code can be asserted on. */
  const fails = (method, params) =>
    client.request(method, params).then(
      () => null,
      (cause) => cause,
    );

  const identity = {
    name: "smoke",
    version: "0.0.0",
    capabilities: { permissionPrompts: true, workPanel: true, terminals: true },
  };

  // -- the gate ------------------------------------------------------------
  const early = await fails("session/list", {});
  check(
    "refuses a method before the handshake",
    early?.code === ErrorCode.NotInitialized,
    `got ${early?.code}`,
  );

  const hello = await client.request("initialize", {
    protocolVersion: PROTOCOL_VERSION,
    client: identity,
    workspaceRoots: [root],
  });
  check("handshake agrees on the protocol version", hello.protocolVersion === PROTOCOL_VERSION);
  check(
    "handshake reports a real engine version",
    /^\d+\.\d+\.\d+/.test(hello.engineVersion),
    hello.engineVersion,
  );
  check(
    "handshake names a default model",
    resolveModel(hello.defaultModel).id === hello.defaultModel,
  );

  const twice = await fails("initialize", {
    protocolVersion: PROTOCOL_VERSION,
    client: identity,
    workspaceRoots: [],
  });
  check(
    "refuses a second handshake",
    twice?.code === ErrorCode.AlreadyInitialized,
    `got ${twice?.code}`,
  );

  // -- workspaces ----------------------------------------------------------
  const opened = await client.request("workspace/list", {});
  check("the handshake opened the workspace roots", opened.workspaces.length === 1);
  const workspaceId = opened.workspaces[0]?.id;
  check("a plain folder is honestly not a git repo", opened.workspaces[0]?.isGitRepo === false);
  check("a folder with no index says so", opened.workspaces[0]?.indexStatus === "absent");

  // Idempotent by design, like `terminal/close`: a client that closes a folder it has
  // already closed is not making a mistake worth reporting. `workspace/index` is the one
  // that names an unknown id, because there it changes what the caller should do.
  const closedTwice = await fails("workspace/close", { workspaceId: "nope" });
  check(
    "closing a workspace that is not open is a no-op",
    closedTwice === null,
    `got ${closedTwice?.code}`,
  );
  const noWorkspace = await fails("workspace/index", { workspaceId: "nope" });
  check(
    "names an unknown workspace",
    noWorkspace?.code === ErrorCode.WorkspaceNotFound,
    `got ${noWorkspace?.code}`,
  );

  // Raised so the sink has something to carry — `main` runs at `error`.
  Logger.setLevel("warn");
  await client.request("workspace/index", { workspaceId });
  const warned = await waitFor(() =>
    logs.find((entry) => /indexing is not implemented/i.test(entry.message)),
  );
  check("workspace/index refuses to fake progress", warned !== undefined);
  check("engine logs reach the client as notifications", warned?.scope === "engine", warned?.scope);
  const reListed = await client.request("workspace/list", {});
  check(
    "index status stays absent after an index request",
    reListed.workspaces[0]?.indexStatus === "absent",
  );
  Logger.setLevel("error");

  // -- models --------------------------------------------------------------
  // The catalog is hand-maintained, so its invariants are asserted here rather than
  // trusted to review. Every one of these has a visible failure mode in the picker.
  const models = await client.request("models/list", {});
  check("lists models", models.models.length > 0);
  check(
    "offers opus 5",
    models.models.some((model) => model.id === "claude-opus-5"),
  );
  check(
    "every model carries a price",
    models.models.every((model) => model.inputUsdPerMTok > 0),
  );
  check(
    "every model carries an output price",
    models.models.every((m) => m.outputUsdPerMTok > 0),
  );
  check("ids are unique", new Set(models.models.map((m) => m.id)).size === models.models.length);

  // An empty `access` array is a model nobody can select — it would render as a
  // permanently greyed row with no way to un-grey it.
  check(
    "every model is reachable somehow",
    models.models.every((m) => m.access.length > 0),
  );
  check(
    "access modes are only account or byok",
    models.models.every((m) => m.access.every((a) => a === "account" || a === "byok")),
  );

  // BYOK means "the engine talks to this provider directly", and it only speaks the
  // Anthropic wire format. A non-Anthropic model marked byok would offer the user a
  // key field for a code path that does not exist.
  check(
    "only anthropic models are byok-capable",
    models.models.filter((m) => m.access.includes("byok")).every((m) => m.provider === "anthropic"),
  );
  // The converse: every model must at least be reachable through the gateway,
  // because that is the only route a signed-in user has.
  check(
    "every model is reachable by account",
    models.models.every((m) => m.access.includes("account")),
  );

  // One badge per provider. Two would make the picker look like it cannot decide.
  const recommendedPerProvider = new Map();
  for (const m of models.models.filter((m) => m.recommended === true)) {
    recommendedPerProvider.set(m.provider, (recommendedPerProvider.get(m.provider) ?? 0) + 1);
  }
  check(
    "at most one recommended model per provider",
    [...recommendedPerProvider.values()].every((n) => n === 1),
    JSON.stringify([...recommendedPerProvider]),
  );
  check(
    "every provider recommends something",
    new Set(models.models.map((m) => m.provider)).size === recommendedPerProvider.size,
  );

  // Both internal defaults must exist, and both must work before sign-in — the
  // engine falls back to them on a cold start with only a BYOK key present.
  for (const [label, id] of [
    ["default", DEFAULT_MODEL],
    ["utility", UTILITY_MODEL],
  ]) {
    const found = models.models.find((m) => m.id === id);
    check(`the ${label} model is in the catalog`, found !== undefined, id);
    check(`the ${label} model works with a BYOK key`, found?.access.includes("byok") === true, id);
  }

  check(
    "output ceilings fit inside the context window",
    models.models.every((m) => m.maxOutputTokens < m.contextWindow),
  );
  check("a stale model id falls back to the default", resolveModel("gpt-2").id === DEFAULT_MODEL);

  // -- settings ------------------------------------------------------------
  const before = await client.request("settings/get", {});
  check("settings arrive with a permission mode", typeof before.permissions.mode === "string");

  const clamped = await client.request("settings/update", {
    patch: {
      maxIterationsPerTurn: 100000,
      effort: "ludicrous",
      showThinking: true,
      nonsense: true,
    },
  });
  check(
    "clamps a runaway iteration cap",
    clamped.maxIterationsPerTurn === 500,
    `${clamped.maxIterationsPerTurn}`,
  );
  check("drops an invalid effort", clamped.effort === before.effort, clamped.effort);
  check("keeps a valid field alongside a rejected one", clamped.showThinking === true);
  check("does not persist an unknown field", !("nonsense" in clamped));

  const badRules = await client.request("settings/update", {
    patch: {
      permissions: { mode: "auto_edit", rules: [{ tool: "write_file", action: "sideways" }] },
    },
  });
  check(
    "rejects a malformed permission set whole rather than in part",
    badRules.permissions.rules.length === before.permissions.rules.length,
  );
  const goodRules = await client.request("settings/update", {
    patch: { permissions: { mode: "plan", rules: [{ tool: "*", action: "deny" }] } },
  });
  check(
    "accepts a well-formed permission set",
    goodRules.permissions.mode === "plan" && goodRules.permissions.rules.length === 1,
  );
  await client.request("settings/update", { patch: { permissions: before.permissions } });

  const unknownProvider = await fails("settings/setProviderKey", {
    provider: "openai",
    apiKey: "x",
  });
  check(
    "refuses an unknown provider",
    unknownProvider?.code === ErrorCode.InvalidParams,
    `got ${unknownProvider?.code}`,
  );
  // Only the clearing path is exercised: storing a key would trigger the live probe,
  // and this harness does not talk to the network.
  const cleared = await client.request("settings/setProviderKey", {
    provider: "anthropic",
    apiKey: "   ",
  });
  check("a blank key clears rather than stores", cleared.configured === false);
  const keys = await client.request("settings/providerKeys", {});
  check("reports a status per known provider", keys.keys.length >= 1);
  check(
    "never echoes a secret back",
    keys.keys.every((status) => !("apiKey" in status)),
  );

  // -- filesystem ----------------------------------------------------------
  await client.request("fs/write", { path: "nested/deep/note.md", content: "one\ntwo\nthree\n" });
  const whole = await client.request("fs/read", { path: "nested/deep/note.md" });
  check("fs/write creates missing parents", whole.content === "one\ntwo\nthree\n");
  check("counts lines the way git would", whole.totalLines === 3, `${whole.totalLines}`);
  check("a whole-file read is not truncated", whole.truncated === false);

  const slice = await client.request("fs/read", {
    path: "nested/deep/note.md",
    startLine: 2,
    endLine: 2,
  });
  check(
    "reads an inclusive 1-indexed range",
    slice.content === "two",
    JSON.stringify(slice.content),
  );
  check("says a partial read is truncated", slice.truncated === true);
  check("still reports the real total", slice.totalLines === 3);

  const entries = await client.request("fs/list", { path: "." });
  check(
    "lists the workspace root",
    entries.entries.some((entry) => entry.name === "hello.ts"),
  );
  check(
    "marks a directory as one",
    entries.entries.find((entry) => entry.name === "nested")?.kind === "directory",
  );

  const asFile = await fails("fs/read", { path: "nested" });
  check(
    "refuses to read a directory as a file",
    asFile?.code === ErrorCode.InvalidParams,
    `got ${asFile?.code}`,
  );
  const absent = await fails("fs/read", { path: "nope.txt" });
  check("names a missing file", absent?.code === ErrorCode.FileNotFound, `got ${absent?.code}`);
  const escaped = await fails("fs/read", { path: "../outside.txt" });
  check(
    "refuses to escape the workspace",
    escaped?.code === ErrorCode.PathOutsideWorkspace,
    `got ${escaped?.code}`,
  );

  // -- search --------------------------------------------------------------
  const found = await client.request("search/text", { query: "greeting" });
  check(
    "search/text finds what the agent's grep would",
    found.matches.some((match) => match.path === "hello.ts"),
  );
  check(
    "search/text reports 1-indexed columns",
    found.matches.every((match) => match.column >= 1),
  );
  const nothing = await client.request("search/text", {
    query: "definitely-not-in-this-workspace",
  });
  check(
    "an empty search is not an error",
    nothing.matches.length === 0 && nothing.truncated === false,
  );
  const badRegex = await fails("search/text", { query: "a(", isRegex: true });
  check(
    "a half-typed regex is reported, not crashed on",
    badRegex?.code === ErrorCode.InvalidParams,
    `got ${badRegex?.code}`,
  );

  // -- sessions ------------------------------------------------------------
  const session = await client.request("session/create", { workspaceId });
  check("a new session starts idle", session.isActive === false);
  check("a new session has spent nothing", session.cumulativeCost.requests === 0);
  check("a new session takes the workspace it was given", session.workspaceId === workspaceId);

  const idleSteer = await fails("session/steer", { sessionId: session.id, text: "hi" });
  check(
    "refuses to steer an idle session",
    idleSteer?.code === ErrorCode.InvalidParams,
    `got ${idleSteer?.code}`,
  );
  await client.request("session/interrupt", { sessionId: session.id });
  check("interrupting an idle session does not throw", true);
  await client.request("session/resolvePermission", {
    sessionId: session.id,
    callId: "nobody",
    decision: { decision: "allow_once" },
  });
  check("answering a permission nobody asked for is quiet", true);

  await client.request("session/rename", { sessionId: session.id, title: "Renamed by smoke" });
  check(
    "rename sticks",
    (await client.request("session/get", { sessionId: session.id })).title === "Renamed by smoke",
  );
  const byTitle = await client.request("session/search", { query: "renamed BY" });
  check(
    "session/search matches a title case-insensitively",
    byTitle.hits.some((hit) => hit.sessionId === session.id),
    JSON.stringify(byTitle.hits),
  );

  const child = await client.request("session/create", {
    parentSessionId: session.id,
    inheritContext: true,
  });
  check("a side chat inherits its parent's workspace", child.workspaceId === workspaceId);
  check("a side chat is its own session", child.id !== session.id);

  const unknownSession = await fails("session/get", { sessionId: "nope" });
  check(
    "names an unknown session",
    unknownSession?.code === ErrorCode.SessionNotFound,
    `got ${unknownSession?.code}`,
  );

  const all = await client.request("session/list", {});
  check(
    "lists both sessions",
    all.sessions.filter((s) => s.id === session.id || s.id === child.id).length === 2,
  );
  check(
    "filters by workspace",
    (await client.request("session/list", { workspaceId: "other" })).sessions.length === 0,
  );

  check(
    "a session with no turns has no transcript",
    (await client.request("session/history", { sessionId: session.id })).entries.length === 0,
  );
  check(
    "a fresh session has no checkpoints",
    (await client.request("checkpoint/list", { sessionId: session.id })).checkpoints.length === 0,
  );
  const badRestore = await fails("checkpoint/restore", {
    sessionId: session.id,
    checkpointId: "0".repeat(40),
  });
  check("refuses to restore a checkpoint that does not exist", badRestore !== null);

  // -- one turn, with the key deliberately absent ---------------------------
  await client.request("settings/deleteProviderKey", { provider: "anthropic" });
  const titled = await client.request("session/create", { workspaceId });
  const { turnId } = await client.request("session/prompt", {
    sessionId: titled.id,
    text: "# Fix the parser\nplease",
  });
  check(
    "prompt returns a turn id without waiting for the turn",
    typeof turnId === "string" && turnId.length > 0,
  );

  const failed = await waitFor(() =>
    turnEvents.find((event) => event.type === "error" && event.turnId === turnId),
  );
  check(
    "a keyless turn fails with MissingApiKey",
    failed?.code === ErrorCode.MissingApiKey,
    `got ${failed?.code}`,
  );
  check("that failure is fatal to the turn", failed?.fatal === true);

  const recorded = await client.request("session/history", { sessionId: titled.id });
  check(
    "the prompt is transcribed before the turn runs",
    recorded.entries.some(
      (entry) => entry.kind === "user_message" && entry.text.startsWith("# Fix the parser"),
    ),
  );
  check(
    "a session titles itself from its first prompt",
    (await client.request("session/get", { sessionId: titled.id })).title === "Fix the parser",
  );

  await client.request("session/delete", { sessionId: child.id });
  const deleted = await fails("session/get", { sessionId: child.id });
  check(
    "a deleted session is gone",
    deleted?.code === ErrorCode.SessionNotFound,
    `got ${deleted?.code}`,
  );

  // -- git -----------------------------------------------------------------
  // The positive paths live in `gitSection`, against a real repo. What matters here is
  // that a folder git knows nothing about produces an error rather than a hang.
  const notARepo = await fails("git/status", { workspaceId });
  check(
    "git/status on a plain folder fails rather than lying",
    notARepo?.code === ErrorCode.InvalidParams,
    `got ${notARepo?.code}`,
  );

  // -- terminals -----------------------------------------------------------
  const noTerminal = await fails("terminal/input", { terminalId: "nope", data: "x" });
  check(
    "names an unknown terminal",
    noTerminal?.code === ErrorCode.TerminalNotFound,
    `got ${noTerminal?.code}`,
  );

  const terminal = await client
    .request("terminal/create", { workspaceId, cols: 80, rows: 24 })
    .then(
      (r) => r,
      (cause) => cause,
    );
  if (terminal instanceof Error) {
    check(
      "an unavailable pty is reported as itself",
      /unavailable/i.test(terminal.message),
      terminal.message,
    );
  } else {
    await client.request("terminal/input", {
      terminalId: terminal.terminalId,
      data: "echo trace-smoke-marker\r",
    });
    const echoed = await waitFor(
      () => output.find((chunk) => chunk.data.includes("trace-smoke-marker")),
      15000,
    );
    check("a terminal echoes what is typed into it", echoed !== undefined);
    check("output is tagged with its terminal", echoed?.terminalId === terminal.terminalId);
    await client.request("terminal/resize", {
      terminalId: terminal.terminalId,
      cols: 100,
      rows: 30,
    });
    check("resizing a live terminal does not throw", true);
    await client.request("terminal/close", { terminalId: terminal.terminalId });
    await client.request("terminal/close", { terminalId: terminal.terminalId });
    check("closing a terminal twice is not an error", true);
  }

  // -- shutdown ------------------------------------------------------------
  await client.request("shutdown", {});
  const late = await fails("session/list", {});
  check("refuses work after shutdown", late?.code === ErrorCode.ShuttingDown, `got ${late?.code}`);
  await client.request("shutdown", {});
  check("shutting down twice is not an error", true);
  await engine.shutdown();

  // -- a client from a different era ---------------------------------------
  const other = transportPair();
  const oldClient = new RpcPeer(other.client, { name: "smoke-old-client" });
  const otherEngine = new Engine(new RpcPeer(other.engine, { name: "smoke-engine-2" }), { home });
  const mismatch = await oldClient
    .request("initialize", {
      protocolVersion: PROTOCOL_VERSION + 1,
      client: identity,
      workspaceRoots: [],
    })
    .then(
      () => null,
      (cause) => cause,
    );
  check(
    "refuses a client speaking another protocol version",
    mismatch?.code === ErrorCode.ProtocolVersionMismatch,
    `got ${mismatch?.code}`,
  );
  await otherEngine.shutdown();

  await removeTemp(home);
  await removeTemp(root);
}

/**
 * Delete a temp directory, and do not fail the run if the OS is not ready to let go.
 *
 * On Windows a directory that is some process's working directory cannot be removed, and
 * a pty's shell holds the workspace root as its cwd for a moment after it is killed. This
 * is harness cleanup — a leftover directory under %TEMP% is not a test result — so it
 * retries briefly and then says so rather than crashing after every check has passed.
 */
async function removeTemp(dir) {
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      await rm(dir, { recursive: true, force: true });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 50 << attempt));
    }
  }
  console.log(`  note left ${dir} behind; the OS still had it open`);
}

// ---------------------------------------------------------------------------
// the engine as a process
// ---------------------------------------------------------------------------

const MAIN_JS = path.join(repoRoot, "packages/engine/dist/main.js");

/**
 * Spawn `dist/main.js` and return a client peer talking to it over the real pipes.
 *
 * The point of this section is everything `engineSection` cannot see: argv, the stdout
 * hijack, signal handling, and whether the process actually exits. A `main.js` that has
 * only ever been compiled is a `main.js` that has never been a process.
 */
function spawnEngine(args = []) {
  const child = spawn(process.execPath, [MAIN_JS, ...args], {
    stdio: ["pipe", "pipe", "pipe"],
    // A clean env so the developer's own ANTHROPIC_API_KEY cannot reach the child. This
    // harness must not be able to make a paid API call, and the settings store seeds its
    // keys from the environment.
    env: { ...process.env, ANTHROPIC_API_KEY: "", TRACE_HOME: "" },
  });

  let stderr = "";
  let stdoutBytes = 0;
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });
  child.stdout.on("data", (chunk) => {
    stdoutBytes += chunk.length;
  });

  const closeListeners = [];
  let closed = false;
  const fireClose = (reason) => {
    if (closed) return;
    closed = true;
    for (const listener of closeListeners) listener(reason);
  };

  const transport = {
    send(frame) {
      if (!child.stdin.destroyed) child.stdin.write(frame);
    },
    onData(listener) {
      child.stdout.on("data", (chunk) => listener(chunk));
      child.stdout.on("end", () => fireClose());
    },
    onClose(listener) {
      closeListeners.push(listener);
    },
    close() {
      fireClose();
      child.stdin.end();
    },
  };

  const exit = new Promise((resolve) => {
    child.on("exit", (code, signal) => {
      fireClose();
      resolve({ code, signal });
    });
  });

  return {
    child,
    peer: new RpcPeer(transport, { name: "spawn-client" }),
    exit,
    stderr: () => stderr,
    stdoutBytes: () => stdoutBytes,
    /** Close the pipe the way a desktop app quitting does. */
    disconnect: () => child.stdin.end(),
  };
}

/** Run the binary to completion with no protocol traffic, and collect its streams. */
function runEngineOnce(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [MAIN_JS, ...args], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("exit", (code) => resolve({ code, stdout, stderr }));
  });
}

/** Resolve to the exit result, or to a marker if the process outlives the deadline. */
async function exitWithin(exit, ms) {
  return Promise.race([exit, new Promise((resolve) => setTimeout(() => resolve("timeout"), ms))]);
}

async function processSection() {
  console.log("\nengine process");

  // -- argv ----------------------------------------------------------------
  const version = await runEngineOnce(["--version"]);
  check("--version exits 0", version.code === 0, `code ${version.code}`);
  check(
    "--version prints a version on stdout",
    /^\d+\.\d+\.\d+/.test(version.stdout.trim()),
    JSON.stringify(version.stdout),
  );

  const help = await runEngineOnce(["--help"]);
  check("--help exits 0", help.code === 0, `code ${help.code}`);
  check(
    "--help explains what stdout is for",
    /stdout carries protocol frames only/.test(help.stdout),
  );

  const bogus = await runEngineOnce(["--frobnicate"]);
  check("an unknown flag exits non-zero", bogus.code === 2, `code ${bogus.code}`);
  check(
    "an unknown flag complains on stderr, not stdout",
    bogus.stdout === "" && /Unknown argument/.test(bogus.stderr),
  );

  const badLevel = await runEngineOnce(["--log-level", "chatty"]);
  check("an invalid log level exits non-zero", badLevel.code === 2, `code ${badLevel.code}`);
  const noValue = await runEngineOnce(["--home"]);
  check("a flag missing its value exits non-zero", noValue.code === 2, `code ${noValue.code}`);

  // -- a real session over a real pipe --------------------------------------
  const home = await mkdtemp(path.join(os.tmpdir(), "trace-proc-home-"));
  const root = await mkdtemp(path.join(os.tmpdir(), "trace-proc-ws-"));
  await writeFile(path.join(root, "readme.md"), "# spawned\n", "utf8");

  const engine = spawnEngine(["--home", home, "--log-level", "debug"]);
  const identity = {
    name: "smoke-spawn",
    version: "0.0.0",
    capabilities: { permissionPrompts: false, workPanel: false, terminals: false },
  };

  const hello = await engine.peer.request(
    "initialize",
    { protocolVersion: PROTOCOL_VERSION, client: identity, workspaceRoots: [root] },
    { timeoutMs: 20000 },
  );
  check("handshakes over a real pipe", hello.protocolVersion === PROTOCOL_VERSION);

  // The whole reason `main.ts` hijacks stdout. At `--log-level debug` the engine has
  // certainly logged by now; if any of it had reached stdout the frame above would not
  // have decoded, so this asserts the *positive* half: the logs exist, elsewhere.
  check(
    "logs go to stderr",
    /Trace engine .* ready on stdio/.test(engine.stderr()),
    engine.stderr().slice(0, 200),
  );

  const list = await engine.peer.request("workspace/list", {}, { timeoutMs: 10000 });
  check("the spawned engine opened the root it was given", list.workspaces.length === 1);

  // A write, because `--log-level debug` has to be shown to reach the *subsystems* and not
  // just the startup banner. `fs/write` is the cheapest method that logs at debug level;
  // asserting on the banner alone would pass even if `Logger.setLevel` were never called.
  // It doubles as the only coverage `fs/write` gets through a process boundary.
  await engine.peer.request(
    "fs/write",
    { path: "spawned/note.txt", content: "over a pipe\n" },
    { timeoutMs: 10000 },
  );
  const wrote = await readFile(path.join(root, "spawned", "note.txt"), "utf8").catch(() => null);
  check("fs/write lands on disk across a pipe", wrote === "over a pipe\n", JSON.stringify(wrote));
  check(
    "debug logging is actually on",
    /\[debug\]/.test(engine.stderr()),
    engine.stderr().slice(-300),
  );

  // A `--home` that was ignored would put sessions in the developer's real ~/.trace.
  const spawned = await engine.peer.request(
    "session/create",
    { workspaceId: list.workspaces[0]?.id },
    { timeoutMs: 10000 },
  );
  const onDisk = await stat(path.join(home, "sessions", spawned.id, "meta.json")).then(
    () => true,
    () => false,
  );
  check("--home is where state actually lands", onDisk, path.join(home, "sessions"));

  // -- a frame it cannot parse ---------------------------------------------
  // Logged and dropped, never fatal: one bad frame must not take down the sessions
  // sharing the connection. Sent raw, since a well-behaved peer cannot produce it.
  engine.child.stdin.write("this is not json\n");
  engine.child.stdin.write('{"jsonrpc":"2.0","id":9,"method":\n');
  const survived = await engine.peer.request("models/list", {}, { timeoutMs: 10000 }).then(
    (r) => r,
    () => null,
  );
  check("an unparseable frame does not kill the connection", survived !== null);
  check("an unparseable frame is reported on stderr", /unparseable frame/i.test(engine.stderr()));

  const unknownMethod = await engine.peer.request("nonsense/method", {}, { timeoutMs: 10000 }).then(
    () => null,
    (cause) => cause,
  );
  check(
    "an unknown method is MethodNotFound",
    unknownMethod?.code === ErrorCode.MethodNotFound,
    `got ${unknownMethod?.code}`,
  );

  // -- shutdown, then disconnect -------------------------------------------
  await engine.peer.request("shutdown", {}, { timeoutMs: 20000 });
  check("shutdown answers over the pipe", true);
  engine.disconnect();
  const exited = await exitWithin(engine.exit, 20000);
  check("closing stdin ends the process", exited !== "timeout", "still running after 20s");
  check(
    "a clean shutdown exits 0",
    exited !== "timeout" && exited.code === 0,
    `code ${exited === "timeout" ? "none" : exited.code}`,
  );
  check("stdout carried only frames", engine.stdoutBytes() > 0);

  // -- the parent that never says goodbye ----------------------------------
  // A force-quit desktop app does not get to send `shutdown`. The engine has to notice
  // its stdin has gone, or it becomes an orphan holding ptys and a git lock.
  const orphan = spawnEngine(["--home", home]);
  await orphan.peer.request(
    "initialize",
    { protocolVersion: PROTOCOL_VERSION, client: identity, workspaceRoots: [] },
    { timeoutMs: 20000 },
  );
  orphan.disconnect();
  const orphanExit = await exitWithin(orphan.exit, 20000);
  check(
    "a disconnect with no shutdown still ends the process",
    orphanExit !== "timeout",
    "orphaned",
  );
  check(
    "an unrequested disconnect is not an error",
    orphanExit !== "timeout" && orphanExit.code === 0,
    `code ${orphanExit === "timeout" ? "none" : orphanExit.code}`,
  );

  // -- shutdown with the pipe held open ------------------------------------
  // The backstop in `onShutdown`. A client that asks the engine to stop and then keeps
  // the pipe open would otherwise leave it running forever.
  const held = spawnEngine(["--home", home]);
  await held.peer.request(
    "initialize",
    { protocolVersion: PROTOCOL_VERSION, client: identity, workspaceRoots: [] },
    { timeoutMs: 20000 },
  );
  await held.peer.request("shutdown", {}, { timeoutMs: 20000 });
  const heldExit = await exitWithin(held.exit, 20000);
  check(
    "shutdown alone eventually ends the process",
    heldExit !== "timeout",
    "held open past the grace period",
  );
  if (heldExit === "timeout") held.child.kill();

  // -- signals -------------------------------------------------------------
  // SIGTERM is what a process manager sends. Windows has no real signals, so `kill`
  // there is a terminate — the check is that the process goes away either way.
  const signalled = spawnEngine(["--home", home]);
  await signalled.peer.request(
    "initialize",
    { protocolVersion: PROTOCOL_VERSION, client: identity, workspaceRoots: [] },
    { timeoutMs: 20000 },
  );
  signalled.child.kill("SIGTERM");
  const signalExit = await exitWithin(signalled.exit, 20000);
  check("SIGTERM ends the process", signalExit !== "timeout", "survived SIGTERM");
  if (process.platform !== "win32") {
    check(
      "a signalled shutdown is still clean",
      signalExit !== "timeout" && signalExit.code === 0,
      `code ${signalExit === "timeout" ? "none" : signalExit.code}`,
    );
  }

  await removeTemp(home);
  await removeTemp(root);
}

main().catch((cause) => {
  console.error("\nsmoke test crashed:", cause);
  process.exit(1);
});
