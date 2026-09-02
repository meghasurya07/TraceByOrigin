/**
 * File-backed slash commands.
 *
 * A command is a markdown file whose body is a prompt. `.trace/commands/deploy.md` in a
 * workspace becomes `/deploy`; `~/.trace/commands/deploy.md` becomes the same command
 * everywhere, and the workspace one shadows it. Nested directories namespace with a colon,
 * so `.trace/commands/review/security.md` is `/review:security` — a separator that cannot
 * appear in a filename, unlike the `/` a path would suggest, which would make the command
 * name ambiguous with the trigger character that introduced it.
 *
 * ## Why this is not `walkFiles`
 *
 * `.trace` is in `ALWAYS_IGNORED_DIRS`, so the workspace walker will never yield these
 * files, and that is correct: the agent should not be reading its own configuration as if
 * it were source. This module therefore does its own small, hard-bounded traversal.
 *
 * ## Why there is no cache
 *
 * The menu re-reads on open. A command tree is a handful of files of a few kilobytes, so a
 * scan costs less than a frame, and the alternative — a cache plus a watcher, or a cache
 * plus staleness — buys nothing except the bug where someone edits a command, sees the old
 * text, and concludes the feature is broken.
 *
 * Copyright (c) 2026 Origin AI
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { PromptCommand } from "@trace/protocol";
import { splitFrontmatter } from "./frontmatter.js";
import { Logger } from "./logger.js";
import { toPosix } from "./paths.js";
import type { Workspace } from "./workspace.js";

const log = new Logger("commands");

/** Enough for a large team's shared library; a stop on a misconfigured directory. */
const MAX_COMMANDS = 300;
/** `commands/review/security/deep.md` is already more namespacing than anyone wants. */
const MAX_DEPTH = 4;
/**
 * A command longer than this is a document, not a prompt.
 *
 * The whole body is sent to the surface with the menu, so this is the per-file share of
 * what a keystroke-latency payload can afford.
 */
const MAX_BODY_BYTES = 64 * 1024;
/** Truncation point for a description derived from the body rather than declared. */
const MAX_DERIVED_DESCRIPTION = 120;

/** Where commands live, relative to a workspace root and to `~/.trace`. */
const WORKSPACE_SUBDIR = path.join(".trace", "commands");
const HOME_SUBDIR = "commands";

export interface DiscoverCommandsOptions {
  /** Scanned in order; later roots do not override earlier ones, names do. */
  workspaces: readonly Workspace[];
  /** `~/.trace`, or wherever the engine keeps user-global state. */
  home: string;
}

/**
 * Every command visible right now, workspace ones shadowing user ones.
 *
 * User commands are read first and workspace commands overwrite them by name, which is the
 * only precedence that makes sense: a repo that ships a `/review` has an opinion about
 * reviewing *that* repo, and it should win over the general one without the user having to
 * remember they wrote a general one.
 */
export async function discoverCommands(
  options: DiscoverCommandsOptions,
): Promise<PromptCommand[]> {
  const byName = new Map<string, PromptCommand>();

  await collect(path.join(options.home, HOME_SUBDIR), "user", byName);
  for (const workspace of options.workspaces) {
    await collect(path.join(workspace.root, WORKSPACE_SUBDIR), "workspace", byName);
  }

  return [...byName.values()].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

async function collect(
  dir: string,
  source: PromptCommand["source"],
  into: Map<string, PromptCommand>,
): Promise<void> {
  const files = await listMarkdown(dir, 0);
  for (const absolute of files) {
    if (into.size >= MAX_COMMANDS) {
      log.warn(`Stopped at ${MAX_COMMANDS} commands`, { dir });
      return;
    }
    const command = await readCommand(dir, absolute, source);
    if (command !== null) into.set(command.name, command);
  }
}

async function listMarkdown(dir: string, depth: number): Promise<string[]> {
  if (depth > MAX_DEPTH) return [];

  let dirents;
  try {
    dirents = await readdir(dir, { withFileTypes: true });
  } catch (cause) {
    const code = (cause as NodeJS.ErrnoException).code;
    // Having no commands directory is the overwhelmingly common case, not a fault.
    if (code !== "ENOENT" && code !== "ENOTDIR") {
      log.debug("Could not read a commands directory", { dir, code });
    }
    return [];
  }

  const found: string[] = [];
  // Sorted because `readdir` order is filesystem-dependent, and two machines disagreeing
  // about which of two same-named commands won would be a memorable afternoon.
  dirents.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

  for (const dirent of dirents) {
    const absolute = path.join(dir, dirent.name);
    // Not followed, for the reason the workspace walker gives: a link to an ancestor
    // turns a bounded scan into an unbounded one.
    if (dirent.isSymbolicLink()) continue;
    if (dirent.isDirectory()) {
      found.push(...(await listMarkdown(absolute, depth + 1)));
    } else if (dirent.isFile() && dirent.name.toLowerCase().endsWith(".md")) {
      found.push(absolute);
    }
  }
  return found;
}

async function readCommand(
  baseDir: string,
  absolute: string,
  source: PromptCommand["source"],
): Promise<PromptCommand | null> {
  const name = commandName(baseDir, absolute);
  if (name === null) return null;

  let raw: string;
  try {
    const buffer = await readFile(absolute);
    if (buffer.byteLength > MAX_BODY_BYTES) {
      log.warn("Skipped an oversized command file", { path: absolute, bytes: buffer.byteLength });
      return null;
    }
    raw = buffer.toString("utf8");
  } catch (cause) {
    log.debug("Could not read a command file", { path: absolute, cause: String(cause) });
    return null;
  }

  const { meta, body } = splitFrontmatter(raw);
  // One lookup, not two: `frontmatter.ts` folds case and separators, so `argument-hint`
  // and `argumentHint` arrive at the same key.
  const hint = meta.get("argumentHint");
  return {
    name,
    description: meta.get("description") ?? deriveDescription(body),
    source,
    path: absolute,
    body,
    ...(hint === undefined ? {} : { argumentHint: hint }),
  };
}

/**
 * `<baseDir>/review/security.md` → `review:security`.
 *
 * A colon rather than the `/` the path suggests, because `/review/security` would read as
 * two commands and could not be typed as one token after the trigger character. Anything
 * outside the allowed character set is skipped rather than sanitized: a command whose name
 * silently differs from its filename is worse than one that does not appear.
 */
function commandName(baseDir: string, absolute: string): string | null {
  const relative = toPosix(path.relative(baseDir, absolute));
  if (relative === "" || relative.startsWith("..")) return null;

  const name = relative.slice(0, -".md".length).replace(/\//g, ":");
  if (!/^[A-Za-z0-9][A-Za-z0-9_.:-]*$/.test(name)) {
    log.debug("Skipped a command whose filename is not a usable name", { path: absolute });
    return null;
  }
  return name;
}

/** First meaningful line, heading markers stripped. Used when frontmatter declares none. */
function deriveDescription(body: string): string {
  for (const line of body.split(/\r?\n/)) {
    const text = line.replace(/^#+\s*/, "").trim();
    if (text === "") continue;
    return text.length > MAX_DERIVED_DESCRIPTION
      ? `${text.slice(0, MAX_DERIVED_DESCRIPTION - 1).trimEnd()}…`
      : text;
  }
  return "";
}
