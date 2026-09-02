/**
 * Display formatting.
 *
 * Every number the user sees passes through here, for one reason: consistency is a
 * feature. A cost shown as `$0.0123` in the status bar and `1.2¢` in the turn footer
 * reads as two different numbers.
 *
 * Copyright (c) 2026 Origin AI
 */

/**
 * USD, at the precision the magnitude deserves.
 *
 * Sub-cent amounts get four decimals because a single cheap turn genuinely costs
 * $0.0031 and rounding it to `$0.00` makes the cost display look broken. Above a
 * dollar, two decimals — nobody needs tenths of a cent on a $4 session.
 */
export function formatUsd(amount: number): string {
  if (!Number.isFinite(amount)) return "$0.00";
  if (amount === 0) return "$0.00";
  if (amount < 0.01) return `$${amount.toFixed(4)}`;
  if (amount < 1) return `$${amount.toFixed(3)}`;
  return `$${amount.toFixed(2)}`;
}

/** Integer cents → dollars. The account's usage figures are cents by contract. */
export function formatCents(cents: number): string {
  return formatUsd(cents / 100);
}

/**
 * Token counts, abbreviated.
 *
 * `128.4k` rather than `128,431`: the exact figure is never actionable, and the
 * abbreviated one fits in a status bar that also has to hold a model name.
 */
export function formatTokens(count: number): string {
  if (!Number.isFinite(count) || count <= 0) return "0";
  if (count < 1_000) return String(Math.round(count));
  if (count < 1_000_000) return `${(count / 1_000).toFixed(count < 10_000 ? 1 : 0)}k`;
  return `${(count / 1_000_000).toFixed(1)}M`;
}

/** A context window, for the picker: `200k`, `1M`. */
export function formatContext(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 === 0 ? 0 : 1)}M`;
  return `${Math.round(tokens / 1_000)}k`;
}

/** Wall-clock duration. Milliseconds below a second, then `1.4s`, then `2m 05s`. */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "0ms";
  if (ms < 1_000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${(ms / 1_000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.round((ms % 60_000) / 1_000);
  return `${String(minutes)}m ${String(seconds).padStart(2, "0")}s`;
}

/**
 * Relative time, for the session list.
 *
 * `Intl.RelativeTimeFormat` gets the language right for free, which matters more than
 * it looks: this is the only user-visible string in the app that is not English source
 * text, so it is the one place a locale is cheap to honour.
 */
const relative = new Intl.RelativeTimeFormat(undefined, { numeric: "auto", style: "narrow" });

export function formatRelative(at: number, now = Date.now()): string {
  const seconds = Math.round((at - now) / 1_000);
  const magnitude = Math.abs(seconds);
  if (magnitude < 45) return "just now";
  if (magnitude < 3_600) return relative.format(Math.round(seconds / 60), "minute");
  if (magnitude < 86_400) return relative.format(Math.round(seconds / 3_600), "hour");
  if (magnitude < 2_592_000) return relative.format(Math.round(seconds / 86_400), "day");
  return new Date(at).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Clock time, for a transcript timestamp on hover. */
export function formatClock(at: number): string {
  return new Date(at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/**
 * A path, shortened from the left.
 *
 * The tail is what identifies a file, so an elided path must keep it —
 * `…/renderer/components/Transcript.tsx`. Truncating from the right, which is what CSS
 * `text-overflow` does, produces a column of identical `packages/engine/src/…` rows.
 */
export function shortenPath(path: string, maxSegments = 3): string {
  const parts = path.split(/[\\/]/).filter((part) => part !== "");
  if (parts.length <= maxSegments) return parts.join("/");
  return `…/${parts.slice(-maxSegments).join("/")}`;
}

/** Just the filename. */
export function baseName(path: string): string {
  const parts = path.split(/[\\/]/).filter((part) => part !== "");
  return parts[parts.length - 1] ?? path;
}

/** `+12 −4`, using real minus signs so the columns line up in a proportional font. */
export function formatDiffStat(added: number, removed: number): string {
  return `+${String(added)} −${String(removed)}`;
}
