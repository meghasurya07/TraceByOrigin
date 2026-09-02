/**
 * Path resolution and containment.
 *
 * This is the engine's security boundary, and it is small on purpose: every path
 * that arrives from the model or from a client passes through `resolveInWorkspace`
 * before any syscall touches it. An agent that can be talked into writing outside
 * the workspace is an agent that can rewrite the user's SSH config, so the checks
 * here are deliberately strict and deliberately boring.
 *
 * Three attacks this closes:
 *   1. `../../../etc/passwd`            — traversal
 *   2. `/etc/passwd`, `C:\Windows\...`  — absolute escape
 *   3. a symlink inside the workspace pointing out of it
 *
 * (3) is why containment is re-checked against the *realpath* and not just the
 * lexically-normalized string.
 *
 * Copyright (c) 2026 Origin AI
 */

import { realpath } from "node:fs/promises";
import path from "node:path";
import { ErrorCode, RpcError } from "@trace/protocol";

/** Directories never worth reading, indexing, or walking into. */
export const ALWAYS_IGNORED_DIRS: ReadonlySet<string> = new Set([
  ".git",
  "node_modules",
  ".pnpm-store",
  "dist",
  "build",
  "out",
  "target",
  ".next",
  ".nuxt",
  ".turbo",
  ".cache",
  ".venv",
  "venv",
  "__pycache__",
  ".pytest_cache",
  ".mypy_cache",
  ".gradle",
  ".idea",
  ".DS_Store",
  "coverage",
  ".trace",
]);

/**
 * Files whose contents are secrets. The agent may learn that these *exist* —
 * hiding that is unhelpful and it can infer it anyway — but reading them requires
 * an explicit human decision, enforced in `permissions.ts`.
 */
export const SENSITIVE_FILE_PATTERNS: readonly RegExp[] = [
  /(^|[/\\])\.env(\..+)?$/i,
  /(^|[/\\])\.npmrc$/i,
  /(^|[/\\])\.netrc$/i,
  /(^|[/\\])id_(rsa|dsa|ecdsa|ed25519)$/i,
  /\.pem$/i,
  /\.p12$/i,
  /\.pfx$/i,
  /(^|[/\\])credentials(\.json)?$/i,
  /(^|[/\\])\.aws[/\\]/i,
  /(^|[/\\])\.ssh[/\\]/i,
];

export function isSensitivePath(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, "/");
  return SENSITIVE_FILE_PATTERNS.some((pattern) => pattern.test(normalized));
}

/**
 * True when `child` is `parent` or lives beneath it.
 *
 * Uses `path.relative` rather than a `startsWith` prefix test, because
 * `startsWith` says `/home/user-secrets` is inside `/home/user`.
 */
export function isContained(parent: string, child: string): boolean {
  const rel = path.relative(parent, child);
  if (rel === "") return true;
  if (rel.startsWith("..")) return false;
  return !path.isAbsolute(rel);
}

export interface ResolvedPath {
  /** Absolute, normalized, verified to be inside a workspace root. */
  absolute: string;
  /** Forward-slashed and workspace-relative — the form shown to the model and the user. */
  relative: string;
  /** The root that contained it. */
  root: string;
}

/**
 * Resolve an untrusted path against one or more workspace roots.
 *
 * `input` may be workspace-relative (the normal case, and what tool schemas ask
 * for) or absolute (clients legitimately send absolute paths from a file picker).
 * Either way it must land inside a root.
 *
 * **Root order is priority order**, and callers must put the session's own
 * workspace first. With several roots open, `src/app.ts` is lexically contained by
 * every one of them, so without a priority rule a relative path would silently
 * resolve into whichever repo happens to be listed first — the wrong repo, most of
 * the time. Two passes make that behave:
 *
 *   1. prefer a candidate that actually exists on disk;
 *   2. fall back to the first containing root, so creating a new file still works.
 *
 * Security checks are identical in both passes; this only decides *which* legal
 * candidate wins.
 *
 * Containment itself is checked twice:
 *   - lexically, always — rejects traversal and absolute escapes with a clear error.
 *   - via realpath, when the path exists — rejects symlinks that point outside.
 *
 * A non-existent path passes the realpath stage by design: writing a new file is a
 * legitimate operation, and its *parent* directory is what gets checked.
 */
export async function resolveInWorkspace(
  input: string,
  roots: readonly string[],
): Promise<ResolvedPath> {
  if (roots.length === 0) {
    throw new RpcError(
      ErrorCode.WorkspaceNotFound,
      "No workspace is open, so file paths cannot be resolved",
    );
  }
  if (input.trim() === "") {
    throw new RpcError(ErrorCode.InvalidParams, "Path must not be empty");
  }
  // A NUL byte truncates the path at the syscall layer, letting `a.txt\0.png`
  // pass an extension check and then open `a.txt`.
  if (input.includes("\0")) {
    throw new RpcError(ErrorCode.InvalidParams, "Path must not contain NUL bytes");
  }

  const candidates = path.isAbsolute(input)
    ? [path.resolve(input)]
    : roots.map((root) => path.resolve(root, input));

  const legal: ResolvedPath[] = [];
  for (const candidate of candidates) {
    const root = roots.find((r) => isContained(path.resolve(r), candidate));
    if (!root) continue;

    const resolvedRoot = path.resolve(root);
    const verdict = await verifyRealPath(candidate, resolvedRoot);
    if (verdict === "outside") continue;

    const resolved: ResolvedPath = {
      absolute: candidate,
      relative: toPosix(path.relative(resolvedRoot, candidate)),
      root: resolvedRoot,
    };
    // An existing candidate wins outright — no need to consider the other roots.
    if (verdict === "exists") return resolved;
    legal.push(resolved);
  }

  const fallback = legal[0];
  if (fallback) return fallback;

  throw new RpcError(
    ErrorCode.PathOutsideWorkspace,
    `Path "${input}" resolves outside every open workspace root`,
    { roots: [...roots] },
  );
}

/**
 * `exists`  — inside `root`, and something is there now.
 * `missing` — inside `root`, nothing there yet, but its nearest existing ancestor
 *             is inside too, so creating it is legal.
 * `outside` — reachable only by leaving `root`, or unreadable.
 */
type Containment = "exists" | "missing" | "outside";

/**
 * Confirm that following symlinks keeps us inside `root`.
 *
 * Walks up to the nearest existing ancestor so a to-be-created file is checked
 * against the directory it would be created in. The walk doubles as the existence
 * probe `resolveInWorkspace` needs for root priority: if the very first `realpath`
 * succeeds, the candidate itself is on disk.
 */
async function verifyRealPath(candidate: string, root: string): Promise<Containment> {
  let realRoot: string;
  try {
    realRoot = await realpath(root);
  } catch {
    // Root itself vanished — treat as uncontainable rather than silently allowing.
    return "outside";
  }

  let probe = candidate;
  let isCandidate = true;
  for (;;) {
    try {
      const real = await realpath(probe);
      if (!isContained(realRoot, real)) return "outside";
      return isCandidate ? "exists" : "missing";
    } catch (cause) {
      const code = (cause as NodeJS.ErrnoException).code;
      if (code !== "ENOENT") return "outside";
      const parent = path.dirname(probe);
      // `dirname("/") === "/"` and `dirname("C:\\") === "C:\\"` — bail on the fixpoint.
      if (parent === probe) return "outside";
      probe = parent;
      isCandidate = false;
    }
  }
}

/** Normalize to forward slashes. Every path crossing the protocol uses this form. */
export function toPosix(p: string): string {
  return p.replace(/\\/g, "/");
}

/** True when the path has a component we never walk into. */
export function hasIgnoredComponent(relativePath: string): boolean {
  return toPosix(relativePath)
    .split("/")
    .some((segment) => ALWAYS_IGNORED_DIRS.has(segment));
}

/**
 * Cheap binary sniff: a NUL byte in the first 8 KiB.
 *
 * Used to keep the agent from spending 40k tokens on a PNG. Matches what git and
 * ripgrep do, and is wrong about the same rare files they are wrong about.
 */
export function looksBinary(buffer: Buffer): boolean {
  const limit = Math.min(buffer.length, 8192);
  for (let i = 0; i < limit; i++) {
    if (buffer[i] === 0) return true;
  }
  return false;
}
