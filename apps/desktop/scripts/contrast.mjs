/**
 * The palette's contrast, recomputed from `index.css` and enforced.
 *
 * `index.css` documents a table of ratios. A comment cannot fail, so this does: it parses
 * the hex out of the `@theme` block, computes WCAG 2.1 contrast for every pairing the
 * components actually use, and exits non-zero if one slips. The pairings are the point —
 * a token in isolation has no contrast, and the bug this catches is the one where a
 * plausible-looking tweak to `surface-overlay` quietly drops the tool cards' timestamps
 * under AA.
 *
 * Text is measured against the *lightest* surface it can land on rather than the window,
 * because that is the worst case and it is the one nobody checks: a dialog and a tool
 * card are both several steps up the ramp from `surface`.
 *
 * Hairlines are held to 1.35:1, not 3:1. WCAG's 3:1 floor is for controls and meaningful
 * graphics; a divider is neither, and every dark UI worth copying draws them at about
 * 1.4:1 — GitHub's dark border on its dark canvas is 1.5:1. Demanding 3:1 here would
 * produce an interface fenced into boxes.
 *
 * Copyright (c) 2026 Origin AI
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.join(here, "..", "src", "renderer", "index.css");

/**
 * Every pairing, with the floor it has to clear.
 *
 * `4.5` is AA for body text, which is all of ours — the app's smallest type is 11px, and
 * AA's large-text exemption starts at 18.66px bold or 24px.
 */
const PAIRS = [
  // Text, against the lightest surface it can land on.
  ["fg", "surface-overlay", 4.5],
  ["fg-muted", "surface-overlay", 4.5],
  ["fg-subtle", "surface-overlay", 4.5],
  ["accent-fg", "surface-overlay", 4.5],
  ["accent-fg", "accent-muted", 4.5],
  ["success", "surface-overlay", 4.5],
  ["warning", "surface-overlay", 4.5],
  ["danger", "surface-overlay", 4.5],
  ["success", "success-muted", 4.5],
  ["warning", "warning-muted", 4.5],
  ["danger", "danger-muted", 4.5],
  ["diff-add-fg", "diff-add", 4.5],
  ["diff-remove-fg", "diff-remove", 4.5],
  // Text on a fill, which is the inversion: dark type on the bright accent.
  ["fg-inverse", "accent", 4.5],
  ["fg-inverse", "accent-hover", 4.5],
  // Controls and focus indicators: WCAG 1.4.11 and 2.4.13 both want 3:1.
  ["accent", "surface", 3],
  ["accent", "surface-raised", 3],
  ["accent-fg", "surface-overlay", 3],
  // Structure. Visible, not fenced.
  ["line-strong", "surface", 1.9],
  ["line", "surface-raised", 1.35],
  ["line", "surface", 1.35],
  ["surface-active", "surface-raised", 1.35],
];

/** Where `fg-subtle` is dimmed further for a decorative hint. Reported, not enforced. */
const DECORATIVE = ["surface", "surface-raised", "surface-overlay"];
const DECORATIVE_ALPHA = 0.7;

const channel = (hex, index) => parseInt(hex.slice(index, index + 2), 16);
const linear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/** WCAG relative luminance. */
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => linear(channel(hex, i) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** `a` composited over `b` at `alpha`, which is what a Tailwind `/70` suffix produces. */
function over(a, b, alpha) {
  const mix = [1, 3, 5].map((i) =>
    Math.round(alpha * channel(a, i) + (1 - alpha) * channel(b, i))
      .toString(16)
      .padStart(2, "0"),
  );
  return `#${mix.join("")}`;
}

const css = await readFile(cssPath, "utf8");
const tokens = new Map(
  [...css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)].map(([, name, hex]) => [
    name,
    hex.toLowerCase(),
  ]),
);

if (tokens.size === 0) {
  console.error("No --color-* tokens found. Has the @theme block moved?");
  process.exit(1);
}

let failed = 0;
for (const [fore, back, floor] of PAIRS) {
  const [a, b] = [tokens.get(fore), tokens.get(back)];
  if (a === undefined || b === undefined) {
    console.error(`MISSING  ${a === undefined ? fore : back} is not declared in index.css`);
    failed += 1;
    continue;
  }
  const ratio = contrast(a, b);
  const ok = ratio >= floor;
  if (!ok) failed += 1;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${`${fore} on ${back}`.padEnd(34)} ` +
      `${ratio.toFixed(2)}:1${ok ? "" : `  — needs ${floor.toFixed(2)}:1`}`,
  );
}

const subtle = tokens.get("fg-subtle");
if (subtle !== undefined) {
  for (const name of DECORATIVE) {
    const back = tokens.get(name);
    if (back === undefined) continue;
    const ratio = contrast(over(subtle, back, DECORATIVE_ALPHA), back);
    console.log(`     ${`fg-subtle/70 on ${name}`.padEnd(34)} ${ratio.toFixed(2)}:1  decorative`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} pairing(s) below floor. Retune the tokens, not this file.`);
  process.exit(1);
}
console.log(`\nAll ${PAIRS.length} pairings pass.`);
