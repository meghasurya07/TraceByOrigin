/**
 * The `---` frontmatter dialect used by everything under `.trace/`.
 *
 * Commands and rules are both markdown files with a small header, and they must agree on
 * how that header is read. Two parsers would mean `globs: "*.ts"` working in one file and
 * not the other, which is the kind of inconsistency that gets reported as "rules are
 * broken" rather than as a parser bug.
 *
 * ## Deliberately not YAML
 *
 * A rule file needs three keys. Pulling in a YAML parser would mean a rule failing to
 * load because of an indentation mistake in a block it does not use, and a config file
 * that silently stops applying is worse than one that ignores a key it does not
 * understand. So: `key: value` lines, three ways of writing a list, and everything else
 * ignored.
 *
 * ```
 * description: When to apply this      → get("description")
 * globs: *.ts, *.tsx                   → list("globs")   ["*.ts", "*.tsx"]
 * globs: ["*.ts", "*.tsx"]             → list("globs")   ["*.ts", "*.tsx"]
 * globs:                               → list("globs")   ["*.ts", "*.tsx"]
 *   - "*.ts"
 *   - "*.tsx"
 * alwaysApply: true                    → bool("alwaysApply")
 * ```
 *
 * ## Keys are matched loosely
 *
 * `alwaysApply`, `always-apply` and `always_apply` are the same key. Cursor's `.mdc` files
 * use camelCase, ours document camelCase, and half of everyone will type a hyphen anyway;
 * refusing them buys nothing. Case, hyphens and underscores are therefore stripped before
 * lookup, so a caller asks once instead of guessing spellings.
 *
 * Copyright (c) 2026 Origin AI
 */

/** A parsed header. Absent keys answer `undefined` / `[]` rather than throwing. */
export interface Frontmatter {
  has(key: string): boolean;
  /** The whole value, quotes stripped. Commas are not significant here. */
  get(key: string): string | undefined;
  /** The value as a list: comma-separated, `[a, b]`, or `- item` lines. */
  list(key: string): readonly string[];
  /** `true`/`yes`/`on`/`1` and their negations. `undefined` if the key is absent or junk. */
  bool(key: string): boolean | undefined;
}

interface Field {
  readonly raw: string;
  readonly items: readonly string[];
}

/** A line that opens or continues a sequence, a comment, or nothing at all. */
const NOT_A_KEY = /^\s*(?:[#-]|$)/;
const SEQUENCE_ITEM = /^\s*-\s+(.*)$/;
const FENCE = /^---[ \t]*\r?\n([\s\S]*?)\r?\n?---[ \t]*(?:\r?\n|$)/;

/**
 * Split leading frontmatter off the body.
 *
 * A file with no frontmatter is not an error — it is the common case for `AGENTS.md` and
 * for a command that is just a prompt — so the body comes back whole and the header comes
 * back empty.
 */
export function splitFrontmatter(raw: string): { meta: Frontmatter; body: string } {
  // A BOM before the opening `---` would hide the delimiter, and editors do write them.
  const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;

  const match = FENCE.exec(text);
  if (match === null) return { meta: new Fields(new Map()), body: text.trim() };

  return {
    meta: new Fields(parseFields(match[1] ?? "")),
    body: text.slice(match[0].length).trim(),
  };
}

class Fields implements Frontmatter {
  constructor(private readonly fields: Map<string, Field>) {}

  has(key: string): boolean {
    return this.fields.has(normalizeKey(key));
  }

  get(key: string): string | undefined {
    const field = this.fields.get(normalizeKey(key));
    return field === undefined || field.raw === "" ? undefined : field.raw;
  }

  list(key: string): readonly string[] {
    return this.fields.get(normalizeKey(key))?.items ?? [];
  }

  bool(key: string): boolean | undefined {
    const value = this.get(key)?.toLowerCase();
    if (value === "true" || value === "yes" || value === "on" || value === "1") return true;
    if (value === "false" || value === "no" || value === "off" || value === "0") return false;
    return undefined;
  }
}

function parseFields(block: string): Map<string, Field> {
  const fields = new Map<string, Field>();
  const lines = block.split(/\r?\n/);

  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? "";
    index += 1;

    if (NOT_A_KEY.test(line)) continue;
    const colon = line.indexOf(":");
    if (colon <= 0) continue;

    const key = normalizeKey(line.slice(0, colon));
    if (key === "") continue;

    const inline = line.slice(colon + 1).trim();
    if (inline !== "") {
      fields.set(key, { raw: unquote(inline), items: splitInline(inline) });
      continue;
    }

    // `key:` with nothing after it introduces a block sequence. Every following `- item`
    // line belongs to it; the first line that is not one ends it without consuming it.
    const items: string[] = [];
    for (;;) {
      const item = SEQUENCE_ITEM.exec(lines[index] ?? "");
      if (item === null) break;
      const value = unquote((item[1] ?? "").trim());
      if (value !== "") items.push(value);
      index += 1;
    }
    if (items.length > 0) fields.set(key, { raw: items.join(", "), items });
  }

  return fields;
}

/**
 * `[a, b]` or `a, b` or `a`.
 *
 * A single value with no comma stays whole, which is what keeps `description: Read this,
 * then that` from becoming two descriptions — `get` returns the raw string and only
 * `list` ever sees this split.
 */
function splitInline(value: string): readonly string[] {
  const flow = /^\[(.*)\]$/.exec(value);
  const inner = flow === null ? value : (flow[1] ?? "");
  return inner
    .split(",")
    .map((part) => unquote(part.trim()))
    .filter((part) => part !== "");
}

function unquote(value: string): string {
  const first = value[0];
  if (value.length >= 2 && (first === '"' || first === "'") && value.endsWith(first)) {
    return value.slice(1, -1);
  }
  return value;
}

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[-_]/g, "");
}
