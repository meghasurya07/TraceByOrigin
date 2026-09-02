/**
 * Line-based unified diff.
 *
 * Hand-rolled rather than pulled from npm because diffs show up in three places
 * that all need the *same* output — the permission prompt, the transcript entry,
 * and the diff panel — and a dependency whose formatting drifts between versions
 * would make those three disagree. It is also small enough that owning it is
 * cheaper than auditing someone else's.
 *
 * Copyright (c) 2026 Origin AI
 */

/**
 * Cap on the LCS table after common prefix/suffix trimming.
 *
 * The table is O(n·m) Int32, so 1500² ≈ 9 MB. Real edits trim down to a handful of
 * lines; this ceiling only catches the pathological case (a reformatted 20k-line
 * file), where a precise diff would be unreadable anyway.
 */
const MAX_LCS_LINES = 1_500;

export interface DiffStats {
  added: number;
  removed: number;
}

type Op = { kind: "eq" | "del" | "ins"; line: string };

function splitLines(text: string): string[] {
  if (text === "") return [];
  return text.split("\n");
}

/**
 * Count lines the way `git diff --stat` does.
 *
 * Not `splitLines().length`. That keeps a phantom empty element for the trailing
 * newline every well-formed text file ends with, which is deliberate there — it makes
 * a gained or lost final newline show up as a real change instead of vanishing — but
 * it means a two-line file counts as three. Since this number is shown to the user and
 * added up into the turn's `+N`, it has to match what git would say about the same
 * file, or the two disagree in the one place a user is most likely to compare them.
 */
export function countLines(text: string): number {
  if (text === "") return 0;
  let lines = 0;
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 10) lines++;
  }
  return text.endsWith("\n") ? lines : lines + 1;
}

/**
 * Produce a unified diff. Returns `""` when the texts are identical.
 *
 * `context` is lines of unchanged text around each hunk — 3 matches git, and is
 * enough for a reviewer to see what a change is attached to.
 */
export function unifiedDiff(
  oldText: string,
  newText: string,
  path: string,
  options: { context?: number } = {},
): string {
  if (oldText === newText) return "";
  const context = options.context ?? 3;
  const ops = diffOps(...diffLines(oldText, newText));
  const hunks = buildHunks(ops, context);
  if (hunks.length === 0) return "";

  const header = `--- a/${path}\n+++ b/${path}\n`;
  return header + hunks.join("");
}

export function diffStats(oldText: string, newText: string): DiffStats {
  if (oldText === newText) return { added: 0, removed: 0 };
  const ops = diffOps(...diffLines(oldText, newText));
  let added = 0;
  let removed = 0;
  for (const op of ops) {
    if (op.kind === "ins") added++;
    else if (op.kind === "del") removed++;
  }
  return { added, removed };
}

/**
 * The two line arrays a diff compares, with one asymmetry corrected.
 *
 * `splitLines` deliberately keeps a phantom empty element for the trailing newline a
 * well-formed text file ends with, which is what makes gaining or losing that newline show
 * up as a real change. But an empty side has no phantom — `splitLines("")` is `[]` — so
 * comparing against one leaves the other's phantom unmatched, and it renders as a spurious
 * blank line added at the end of every newly created file (and removed from every deleted
 * one). A file that does not exist has no trailing-newline state to compare, so the phantom
 * is dropped in exactly that case.
 *
 * Shared by both callers so the rendered diff and the `+N/-N` counts can never disagree
 * about how many lines a new file has.
 */
function diffLines(oldText: string, newText: string): [string[], string[]] {
  const before = splitLines(oldText);
  const after = splitLines(newText);
  if (oldText === "" && newText.endsWith("\n")) after.pop();
  if (newText === "" && oldText.endsWith("\n")) before.pop();
  return [before, after];
}

function diffOps(a: string[], b: string[]): Op[] {
  // Trim the common prefix and suffix first. This is what makes a one-line change
  // in a 5000-line file cost almost nothing.
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;

  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }

  const prefix: Op[] = a.slice(0, start).map((line) => ({ kind: "eq" as const, line }));
  const suffix: Op[] = a.slice(endA).map((line) => ({ kind: "eq" as const, line }));
  const midA = a.slice(start, endA);
  const midB = b.slice(start, endB);

  const middle =
    midA.length > MAX_LCS_LINES || midB.length > MAX_LCS_LINES
      ? // Too large to align precisely: report it as a wholesale replacement. Still
        // a valid diff, just a coarse one.
        [
          ...midA.map((line) => ({ kind: "del" as const, line })),
          ...midB.map((line) => ({ kind: "ins" as const, line })),
        ]
      : lcsOps(midA, midB);

  return [...prefix, ...middle, ...suffix];
}

function lcsOps(a: string[], b: string[]): Op[] {
  const n = a.length;
  const m = b.length;
  if (n === 0) return b.map((line) => ({ kind: "ins" as const, line }));
  if (m === 0) return a.map((line) => ({ kind: "del" as const, line }));

  // rows[i][j] = LCS length of a[i..] and b[j..]
  const rows: Int32Array[] = [];
  for (let i = 0; i <= n; i++) rows.push(new Int32Array(m + 1));

  for (let i = n - 1; i >= 0; i--) {
    const cur = rows[i]!;
    const next = rows[i + 1]!;
    for (let j = m - 1; j >= 0; j--) {
      cur[j] = a[i] === b[j] ? next[j + 1]! + 1 : Math.max(next[j]!, cur[j + 1]!);
    }
  }

  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ kind: "eq", line: a[i]! });
      i++;
      j++;
    } else if (rows[i + 1]![j]! >= rows[i]![j + 1]!) {
      ops.push({ kind: "del", line: a[i]! });
      i++;
    } else {
      ops.push({ kind: "ins", line: b[j]! });
      j++;
    }
  }
  while (i < n) ops.push({ kind: "del", line: a[i++]! });
  while (j < m) ops.push({ kind: "ins", line: b[j++]! });
  return ops;
}

/** Group changed ops into hunks, padding each with `context` unchanged lines. */
function buildHunks(ops: Op[], context: number): string[] {
  // Annotate every op with its 1-indexed position in each side.
  const positioned: { op: Op; oldLine: number; newLine: number }[] = [];
  let oldLine = 1;
  let newLine = 1;
  for (const op of ops) {
    positioned.push({ op, oldLine, newLine });
    if (op.kind !== "ins") oldLine++;
    if (op.kind !== "del") newLine++;
  }

  const changedIndexes = positioned
    .map((entry, index) => (entry.op.kind === "eq" ? -1 : index))
    .filter((index) => index >= 0);
  if (changedIndexes.length === 0) return [];

  // Merge changes closer than 2·context together, so adjacent edits share a hunk
  // instead of emitting overlapping context.
  const groups: { from: number; to: number }[] = [];
  for (const index of changedIndexes) {
    const last = groups[groups.length - 1];
    if (last && index - last.to <= context * 2) {
      last.to = index;
    } else {
      groups.push({ from: index, to: index });
    }
  }

  return groups.map((group) => {
    const from = Math.max(0, group.from - context);
    const to = Math.min(positioned.length - 1, group.to + context);
    const slice = positioned.slice(from, to + 1);

    let oldCount = 0;
    let newCount = 0;
    const body: string[] = [];
    for (const { op } of slice) {
      if (op.kind === "eq") {
        oldCount++;
        newCount++;
        body.push(` ${op.line}`);
      } else if (op.kind === "del") {
        oldCount++;
        body.push(`-${op.line}`);
      } else {
        newCount++;
        body.push(`+${op.line}`);
      }
    }

    const first = slice[0]!;
    // A zero-length side is reported at the line *before* the insertion point,
    // which is what git does and what patch(1) expects.
    const oldStart = oldCount === 0 ? Math.max(0, first.oldLine - 1) : first.oldLine;
    const newStart = newCount === 0 ? Math.max(0, first.newLine - 1) : first.newLine;

    return `@@ -${oldStart},${oldCount} +${newStart},${newCount} @@\n${body.join("\n")}\n`;
  });
}

/**
 * Shorten a diff for a permission prompt.
 *
 * A prompt the user scrolls is a prompt the user approves without reading, so the
 * preview is capped hard and says so.
 */
export function previewDiff(diff: string, maxLines = 40): string {
  const lines = diff.split("\n");
  if (lines.length <= maxLines) return diff;
  const kept = lines.slice(0, maxLines).join("\n");
  return `${kept}\n… ${lines.length - maxLines} more diff lines`;
}
