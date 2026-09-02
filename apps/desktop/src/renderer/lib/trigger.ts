/**
 * Finding the `@` or `/` the user is currently typing.
 *
 * Pure string work, deliberately: the interesting part of a completion menu is not the
 * popover, it is the question "is the caret inside a trigger token right now", and that
 * question has enough edge cases — email addresses, dates, paths, multi-line prompts,
 * pasted blocks — that it is worth being able to answer it without a DOM.
 *
 * ## The two rules, and why they differ
 *
 * **`@` needs a word boundary before it.** `foo@bar.com` is an email and
 * `read@line` is a typo, neither is a mention. Anything after whitespace or an opening
 * bracket is.
 *
 * **`/` needs a line start.** This is the rule that matters, because `/` is the most
 * common character in the thing `@` is used to find. `src/renderer/lib` must not open a
 * command menu three times, and `and/or` must not open one at all — so a slash only counts
 * when nothing precedes it on its line. That also matches the muscle memory: a slash
 * command is the first thing you type, not the fourth.
 *
 * The backward scan stops at whitespace, so both triggers are single tokens. A file whose
 * name contains a space cannot be `@`-mentioned by typing; it can still be attached from
 * the picker button, and the alternative — a scan that crosses spaces — makes every
 * sentence containing an `@` an open menu.
 *
 * Copyright (c) 2026 Origin AI
 */

export type TriggerKind = "file" | "command";

export interface Trigger {
  kind: TriggerKind;
  /** Text between the trigger character and the caret. May be empty. */
  query: string;
  /** Index of the trigger character itself — the start of the replaceable range. */
  start: number;
  /** The caret, and the end of the replaceable range. */
  end: number;
}

/**
 * How far back the scan looks.
 *
 * A guard against a pasted wall of text, not a real limit: no filename anyone types is
 * anywhere near this long, and without a bound every keystroke after a large paste would
 * re-scan the whole thing looking for a trigger that is not there.
 */
const MAX_TOKEN_CHARS = 200;

/** Characters an `@` may follow. Anything else means it is part of a word. */
const OPENERS = new Set(["(", "[", "{", "<", '"', "'", "`", ",", ":", ";"]);

/** The trigger token the caret sits inside, or null. */
export function detectTrigger(text: string, caret: number): Trigger | null {
  const stop = Math.max(0, caret - MAX_TOKEN_CHARS);

  for (let index = caret - 1; index >= stop; index--) {
    const char = text[index];
    if (char === undefined) return null;
    // Whitespace ends the token. Reached without finding a trigger, there is none.
    if (char === " " || char === "\t" || char === "\n" || char === "\r") return null;

    if (char === "@" && follows(text, index, isMentionBoundary)) {
      return { kind: "file", query: text.slice(index + 1, caret), start: index, end: caret };
    }
    // Not an early return when the check fails: `@src/foo` has a slash the scan must walk
    // straight past to reach the `@` that actually opened the token.
    if (char === "/" && follows(text, index, isLineBreak)) {
      return { kind: "command", query: text.slice(index + 1, caret), start: index, end: caret };
    }
  }
  return null;
}

/**
 * Replace a trigger token with `insertion`, and report where the caret lands.
 *
 * Returns the caret because the DOM does not: assigning `value` on a textarea collapses
 * the selection to the end of the text, which after splicing a command body into the
 * middle of a prompt is the wrong place by however much followed it.
 */
export function applyTrigger(
  text: string,
  trigger: Trigger,
  insertion: string,
): { text: string; caret: number } {
  const before = text.slice(0, trigger.start);
  const after = text.slice(trigger.end);
  return { text: `${before}${insertion}${after}`, caret: before.length + insertion.length };
}

function follows(text: string, index: number, predicate: (previous: string) => boolean): boolean {
  if (index === 0) return true;
  const previous = text[index - 1];
  return previous !== undefined && predicate(previous);
}

function isMentionBoundary(previous: string): boolean {
  return previous === " " || previous === "\t" || isLineBreak(previous) || OPENERS.has(previous);
}

function isLineBreak(previous: string): boolean {
  return previous === "\n" || previous === "\r";
}
