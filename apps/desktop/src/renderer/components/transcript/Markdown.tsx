/**
 * Markdown, rendered without a markdown library.
 *
 * Three reasons this is hand-written rather than `react-markdown` + `remark-gfm` +
 * `rehype-sanitize`:
 *
 * 1. **Streaming.** A transcript re-renders this component on every token, against a
 *    document whose last block is always unfinished. A CommonMark parser is correct
 *    about closed documents; the thing it gets wrong is exactly our common case — an
 *    unterminated ``` fence, which CommonMark treats as literal backticks until the
 *    closer arrives, so a code block would appear as prose and then flip. Here an open
 *    fence is a code block that runs to the end of the input.
 *
 * 2. **No HTML.** The pipeline above renders raw HTML in the source unless a sanitizer
 *    is bolted on, and that sanitizer becomes the thing standing between model output
 *    and the DOM. This renderer has no HTML path at all: every node below is a React
 *    element built from parsed text, so a `<script>` in a model's reply is text.
 *
 * 3. **The subset is small.** Agents emit fences, headings, lists, tables, links,
 *    inline code and emphasis. That is this file.
 *
 * Anything unrecognised falls through to a paragraph, which is the useful failure: the
 * words still arrive.
 *
 * Copyright (c) 2026 Origin AI
 */

import { memo } from "react";
import { Check } from "lucide-react";

import { bridge } from "../../lib/bridge";
import { cn } from "../../lib/cn";
import { CodeBlock } from "./CodeBlock";

// ---------------------------------------------------------------------------
// Block model
// ---------------------------------------------------------------------------

interface ListItem {
  text: string;
  /** Nesting level, derived from leading whitespace and capped at 4. */
  depth: number;
  ordered: boolean;
  /** The rendered marker for an ordered item: its own number, not a recount. */
  number: number;
  /** Present only for `- [ ]` / `- [x]` task items. */
  checked?: boolean;
}

type Block =
  | { kind: "code"; lang: string | undefined; code: string }
  | { kind: "heading"; level: number; text: string }
  | { kind: "rule" }
  | { kind: "quote"; source: string }
  | { kind: "list"; items: ListItem[] }
  | { kind: "table"; header: string[]; rows: string[][] }
  | { kind: "para"; text: string };

// ---------------------------------------------------------------------------
// Block parsing
// ---------------------------------------------------------------------------

const FENCE = /^ {0,3}(`{3,}|~{3,})[ \t]*([^\s`]*)/;
const HEADING = /^ {0,3}(#{1,6})[ \t]+(.*?)[ \t]*#*[ \t]*$/;
/** Tested before `BULLET`, because `- - -` matches both and the rule wins. */
const RULE = /^ {0,3}([-*_])[ \t]*(?:\1[ \t]*){2,}$/;
const QUOTE = /^ {0,3}> ?/;
const BULLET = /^([ \t]*)[-*+][ \t]+(.*)$/;
const ORDERED = /^([ \t]*)(\d{1,9})[.)][ \t]+(.*)$/;
const TASK = /^\[([ xX])\][ \t]+/;
/** A table's second line: `|---|:--:|`. Without it, a line with pipes is prose. */
const DELIMITER = /^[ \t]*\|?[ \t]*:?-+:?[ \t]*(\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/;

function isBlank(line: string): boolean {
  return line.trim() === "";
}

function opensBlock(line: string): boolean {
  return (
    FENCE.test(line) ||
    HEADING.test(line) ||
    RULE.test(line) ||
    QUOTE.test(line) ||
    BULLET.test(line) ||
    ORDERED.test(line)
  );
}

/** Leading whitespace → nesting level. Two spaces or one tab per level, capped. */
function depthOf(indent: string): number {
  const columns = indent.replace(/\t/g, "  ").length;
  return Math.min(4, Math.floor(columns / 2));
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replace(/\\\|/g, "|"));
}

function itemFor(body: string, depth: number, ordered: boolean, number: number): ListItem {
  const task = TASK.exec(body);
  if (task === null) return { text: body, depth, ordered, number };
  return {
    text: body.slice(task[0].length),
    depth,
    ordered,
    number,
    checked: (task[1] ?? " ").toLowerCase() === "x",
  };
}

function parseBlocks(source: string): Block[] {
  const lines = source.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (isBlank(line)) {
      i += 1;
      continue;
    }

    const fence = FENCE.exec(line);
    if (fence !== null) {
      const marker = fence[1] ?? "```";
      const info = fence[2] ?? "";
      const closer = new RegExp(
        "^ {0,3}" +
          (marker.startsWith("~") ? "~" : "`") +
          "{" +
          String(marker.length) +
          ",}[ \t]*$",
      );
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !closer.test(lines[i] ?? "")) {
        body.push(lines[i] ?? "");
        i += 1;
      }
      // One past the closing fence — or one past the end, when the closer never came
      // because the model is still typing. Either way the block is a code block.
      i += 1;
      blocks.push({ kind: "code", lang: info === "" ? undefined : info, code: body.join("\n") });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading !== null) {
      blocks.push({ kind: "heading", level: (heading[1] ?? "#").length, text: heading[2] ?? "" });
      i += 1;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push({ kind: "rule" });
      i += 1;
      continue;
    }

    if (QUOTE.test(line)) {
      const quoted: string[] = [];
      while (i < lines.length && QUOTE.test(lines[i] ?? "")) {
        quoted.push((lines[i] ?? "").replace(QUOTE, ""));
        i += 1;
      }
      blocks.push({ kind: "quote", source: quoted.join("\n") });
      continue;
    }

    if (line.includes("|") && DELIMITER.test(lines[i + 1] ?? "")) {
      const header = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length) {
        const row = lines[i] ?? "";
        if (isBlank(row) || !row.includes("|")) break;
        rows.push(splitRow(row));
        i += 1;
      }
      blocks.push({ kind: "table", header, rows });
      continue;
    }

    if (BULLET.test(line) || ORDERED.test(line)) {
      const items: ListItem[] = [];
      while (i < lines.length) {
        const current = lines[i] ?? "";

        if (isBlank(current)) {
          // A loose list survives one blank line, if an item follows it.
          const next = lines[i + 1] ?? "";
          if (BULLET.test(next) || ORDERED.test(next)) {
            i += 1;
            continue;
          }
          break;
        }

        const ordered = ORDERED.exec(current);
        if (ordered !== null) {
          items.push(
            itemFor(
              ordered[3] ?? "",
              depthOf(ordered[1] ?? ""),
              true,
              Number.parseInt(ordered[2] ?? "1", 10),
            ),
          );
          i += 1;
          continue;
        }

        const bullet = BULLET.exec(current);
        if (bullet !== null) {
          items.push(itemFor(bullet[2] ?? "", depthOf(bullet[1] ?? ""), false, 0));
          i += 1;
          continue;
        }

        // An indented line that is not itself an item continues the one above it.
        const last = items[items.length - 1];
        if (last !== undefined && /^[ \t]/.test(current) && !opensBlock(current)) {
          last.text = `${last.text}\n${current.trim()}`;
          i += 1;
          continue;
        }
        break;
      }
      blocks.push({ kind: "list", items });
      continue;
    }

    const paragraph: string[] = [line];
    i += 1;
    while (i < lines.length) {
      const next = lines[i] ?? "";
      if (isBlank(next) || opensBlock(next)) break;
      if (next.includes("|") && DELIMITER.test(lines[i + 1] ?? "")) break;
      paragraph.push(next);
      i += 1;
    }
    blocks.push({ kind: "para", text: paragraph.join("\n") });
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// Inline parsing
// ---------------------------------------------------------------------------

/**
 * Characters that can begin an inline construct.
 *
 * Everything else is copied straight into the current text run, which is what keeps
 * this cheap enough to re-run on every token of a streaming reply. `h` is here for
 * bare URLs, and is the only entry that fails far more often than it matches.
 */
const SPECIAL: ReadonlySet<string> = new Set(["\\", "`", "*", "_", "~", "[", "!", "<", "h"]);

const ESCAPE = /\\([\\`*_~[\]()#+\-.!<>|])/y;
const CODE = /(`+)([\s\S]+?)\1(?!`)/y;
const STRONG = /(\*\*|__)(?=\S)([\s\S]*?\S)\1/y;
const EMPH = /([*_])(?=[^\s*_])([\s\S]*?[^\s*_])\1/y;
const STRIKE = /~~(?=\S)([\s\S]*?\S)~~/y;
const LINK = /!?\[([^\]]*)\]\([ \t]*<?([^\s)>]*)>?(?:[ \t]+"([^"]*)")?[ \t]*\)/y;
const AUTOLINK = /<(https?:\/\/[^>\s]+)>/y;
const BARE_URL = /https?:\/\/[^\s<>()[\]{}"'`]+/y;

/**
 * Matched against every link target before it is rendered as a link.
 *
 * Deliberately the same allow-list `hostOpenExternal` enforces in main, so a link this
 * renderer draws is a link the host will actually open — no `mailto:`, no `file:`, and
 * nothing a model invented. A target that fails this renders as plain text.
 */
const SAFE_HREF = /^https?:\/\//i;

interface Token {
  length: number;
  render: (key: string) => React.ReactNode;
}

/** Run a sticky pattern at exactly `index`. */
function at(source: string, pattern: RegExp, index: number): RegExpExecArray | null {
  pattern.lastIndex = index;
  return pattern.exec(source);
}

function matchToken(source: string, index: number, before: string): Token | null {
  const char = source[index] ?? "";

  if (char === "\\") {
    const escape = at(source, ESCAPE, index);
    if (escape === null) return null;
    const literal = escape[1] ?? "";
    return { length: escape[0].length, render: () => literal };
  }

  if (char === "`") {
    const code = at(source, CODE, index);
    if (code === null) return null;
    // CommonMark strips one space on each side, so `` ` `` can be written as `` ` ``.
    const text = (code[2] ?? "").replace(/^ ([\s\S]*) $/, "$1");
    return {
      length: code[0].length,
      render: (key) => (
        <code
          key={key}
          className="rounded border border-line bg-surface-raised px-1 py-px font-mono text-[0.9em] text-fg"
        >
          {text}
        </code>
      ),
    };
  }

  if (char === "*" || char === "_") {
    // `snake_case_names` are not emphasis: a `_` preceded by a word character cannot
    // open one. `*` needs no such rule — nothing writes `word*word`.
    if (char === "_" && /\w/.test(before)) return null;
    const strong = at(source, STRONG, index);
    if (strong !== null) {
      const inner = strong[2] ?? "";
      return {
        length: strong[0].length,
        render: (key) => (
          <strong key={key} className="font-semibold text-fg">
            {renderInline(inner, key)}
          </strong>
        ),
      };
    }
    const emph = at(source, EMPH, index);
    if (emph === null) return null;
    const inner = emph[2] ?? "";
    return {
      length: emph[0].length,
      render: (key) => (
        <em key={key} className="italic">
          {renderInline(inner, key)}
        </em>
      ),
    };
  }

  if (char === "~") {
    const strike = at(source, STRIKE, index);
    if (strike === null) return null;
    const inner = strike[1] ?? "";
    return {
      length: strike[0].length,
      render: (key) => (
        <s key={key} className="text-fg-muted">
          {renderInline(inner, key)}
        </s>
      ),
    };
  }

  if (char === "[" || char === "!") {
    const link = at(source, LINK, index);
    if (link === null) return null;
    const label = link[1] ?? "";
    const href = link[2] ?? "";
    const title = link[3];
    // `![alt](url)` renders as a link too: `img-src` allows only `self`, `data:` and
    // `blob:`, so a remote `<img>` would be a broken icon and a console violation.
    return {
      length: link[0].length,
      render: (key) => (
        <Link key={key} href={href} title={title}>
          {renderInline(label === "" ? href : label, key)}
        </Link>
      ),
    };
  }

  if (char === "<") {
    const auto = at(source, AUTOLINK, index);
    if (auto === null) return null;
    const href = auto[1] ?? "";
    return {
      length: auto[0].length,
      render: (key) => (
        <Link key={key} href={href}>
          {href}
        </Link>
      ),
    };
  }

  const bare = at(source, BARE_URL, index);
  if (bare === null) return null;
  // Trailing punctuation belongs to the sentence, not to the URL.
  const url = bare[0].replace(/[.,;:!?]+$/, "");
  return {
    length: url.length,
    render: (key) => (
      <Link key={key} href={url}>
        {url}
      </Link>
    ),
  };
}

/**
 * A newline inside a paragraph becomes a line break.
 *
 * CommonMark would collapse it to a space and require two trailing spaces for a break.
 * That rule exists for hand-written prose reflowed by an editor; a model that wrote a
 * newline meant one, and swallowing it turns a list of considerations into a wall.
 */
function softBreaks(text: string, key: string): React.ReactNode[] {
  const parts = text.split("\n");
  const out: React.ReactNode[] = [];
  parts.forEach((part, index) => {
    if (index > 0) out.push(<br key={`${key}br${String(index)}`} />);
    if (part !== "") out.push(part);
  });
  return out;
}

function renderInline(source: string, key: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let run = "";
  let index = 0;
  let counter = 0;

  const flush = (): void => {
    if (run === "") return;
    out.push(...softBreaks(run, `${key}.${String(counter++)}`));
    run = "";
  };

  while (index < source.length) {
    const char = source[index] ?? "";
    if (!SPECIAL.has(char)) {
      run += char;
      index += 1;
      continue;
    }
    const token = matchToken(source, index, index === 0 ? "" : (source[index - 1] ?? ""));
    if (token === null) {
      run += char;
      index += 1;
      continue;
    }
    flush();
    out.push(token.render(`${key}.${String(counter++)}`));
    index += token.length;
  }

  flush();
  return out;
}

function Link(props: {
  href: string;
  title?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  if (!SAFE_HREF.test(props.href)) return <>{props.children}</>;
  return (
    <a
      href={props.href}
      title={props.title ?? props.href}
      onClick={(event) => {
        // Never navigate the renderer. There is one window and it holds the app; a
        // link that replaced it would take the session with it.
        event.preventDefault();
        void bridge.openExternal(props.href).catch((cause: unknown) => {
          console.warn("[renderer] openExternal refused", props.href, cause);
        });
      }}
      className="text-accent-fg underline decoration-accent-fg/30 underline-offset-2 transition-colors hover:decoration-accent-fg"
    >
      {props.children}
    </a>
  );
}

// ---------------------------------------------------------------------------
// Block rendering
// ---------------------------------------------------------------------------

const HEADING_CLASS: Readonly<Record<number, string>> = {
  1: "mt-4 mb-2 text-base font-semibold text-fg",
  2: "mt-4 mb-2 text-[0.95rem] font-semibold text-fg",
  3: "mt-3 mb-1.5 text-sm font-semibold text-fg",
  4: "mt-3 mb-1 text-sm font-semibold text-fg-muted",
  5: "mt-2 mb-1 text-xs font-semibold tracking-wide text-fg-muted uppercase",
  6: "mt-2 mb-1 text-xs font-semibold tracking-wide text-fg-subtle uppercase",
};

/**
 * Static classes, one per nesting level.
 *
 * A computed `pl-${depth * 4}` would be invisible to Tailwind's scanner — it reads the
 * source as text and never runs it — so the class would simply not exist in the bundle.
 */
const INDENT: readonly string[] = ["", "pl-4", "pl-8", "pl-12", "pl-16"];

/** How deep a `>` may nest before its contents render as plain text. */
const MAX_QUOTE_DEPTH = 3;

function renderBlocks(source: string, depth: number): React.ReactNode[] {
  return parseBlocks(source).map((block, index) => {
    const key = `b${String(index)}`;

    switch (block.kind) {
      case "code":
        return <CodeBlock key={key} code={block.code} lang={block.lang} />;

      case "heading": {
        const level = Math.min(6, Math.max(1, block.level));
        const Tag = `h${String(level)}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
        return (
          <Tag key={key} className={cn(HEADING_CLASS[level], "first:mt-0")}>
            {renderInline(block.text, key)}
          </Tag>
        );
      }

      case "rule":
        return <hr key={key} className="my-3 border-t border-line" />;

      case "quote":
        return (
          <blockquote
            key={key}
            className="my-2 border-l-2 border-line-strong pl-3 text-fg-muted italic"
          >
            {depth >= MAX_QUOTE_DEPTH ? block.source : renderBlocks(block.source, depth + 1)}
          </blockquote>
        );

      case "list":
        return (
          <ul key={key} className="my-1.5 flex flex-col gap-1">
            {block.items.map((item, row) => {
              const itemKey = `${key}i${String(row)}`;
              return (
                <li
                  key={itemKey}
                  className={cn("flex items-start gap-2", INDENT[item.depth] ?? INDENT[4])}
                >
                  {item.checked === undefined ? (
                    <span
                      aria-hidden
                      className="mt-[0.4em] shrink-0 font-mono text-2xs text-fg-subtle"
                    >
                      {item.ordered ? `${String(item.number)}.` : "•"}
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "mt-[0.3em] flex size-3 shrink-0 items-center justify-center rounded-sm border",
                        item.checked
                          ? "border-success bg-success/15 text-success"
                          : "border-line-strong",
                      )}
                    >
                      {item.checked ? <Check size={9} strokeWidth={3} /> : null}
                    </span>
                  )}
                  <span
                    className={cn(
                      "min-w-0 flex-1",
                      item.checked === true && "text-fg-subtle line-through",
                    )}
                  >
                    {renderInline(item.text, itemKey)}
                  </span>
                </li>
              );
            })}
          </ul>
        );

      case "table":
        return (
          <div key={key} className="my-2 overflow-x-auto rounded-md border border-line">
            <table className="w-full border-collapse text-2xs">
              <thead>
                <tr className="bg-surface-raised">
                  {block.header.map((cell, column) => (
                    <th
                      key={`${key}h${String(column)}`}
                      className="border-b border-line px-2 py-1.5 text-left font-semibold text-fg-muted"
                    >
                      {renderInline(cell, `${key}h${String(column)}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={`${key}r${String(r)}`} className="border-b border-line/60 last:border-0">
                    {row.map((cell, c) => (
                      <td
                        key={`${key}r${String(r)}c${String(c)}`}
                        className="px-2 py-1.5 align-top text-fg-muted"
                      >
                        {renderInline(cell, `${key}r${String(r)}c${String(c)}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "para":
        return (
          <p key={key} className="my-1.5 first:mt-0 last:mb-0">
            {renderInline(block.text, key)}
          </p>
        );

      default: {
        const unhandled: never = block;
        void unhandled;
        return null;
      }
    }
  });
}

/**
 * Rendered agent prose.
 *
 * `memo` matters here: during a stream the store hands every subscriber a new state
 * object on each token, and re-parsing the earlier messages of a long transcript on
 * every one of those is exactly the work that makes a chat UI stutter. The props are
 * a string and a class name, so the default shallow comparison is the right one.
 */
export const Markdown = memo(function Markdown(props: {
  text: string;
  className?: string;
}): React.JSX.Element {
  return (
    <div className={cn("selectable text-sm leading-relaxed break-words text-fg", props.className)}>
      {renderBlocks(props.text, 0)}
    </div>
  );
});
