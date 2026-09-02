/**
 * Syntax highlighting, assembled by hand.
 *
 * Three decisions here, each one load-bearing:
 *
 * 1. **`createHighlighterCore` with static imports**, not `createHighlighter` from the
 *    full bundle. The full bundle references ~700 grammars through dynamic imports, so
 *    Vite emits ~700 chunks and electron-builder ships all of them. This lists the
 *    languages a coding agent actually produces and bundles exactly those.
 *
 * 2. **The JavaScript regex engine, not Oniguruma.** No WASM to load, no
 *    `wasm-unsafe-eval` dependency at runtime, and no async initialisation race on the
 *    first code block. `forgiving: true` degrades a grammar the JS engine cannot compile
 *    into plain text rather than throwing — the transcript must never lose a code block
 *    to a highlighter.
 *
 * 3. **One highlighter, created once, awaited by every caller.** The promise itself is
 *    the cache, so twenty code blocks mounting in the same frame produce one load.
 *
 * The theme's own background is discarded; `CodeBlock` paints `--color-surface` behind
 * it so a code block sits in the app's palette instead of GitHub's.
 *
 * Copyright (c) 2026 Origin AI
 */

import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

import theme from "shiki/themes/github-dark-default.mjs";

import bash from "shiki/langs/bash.mjs";
import c from "shiki/langs/c.mjs";
import cpp from "shiki/langs/cpp.mjs";
import csharp from "shiki/langs/csharp.mjs";
import css from "shiki/langs/css.mjs";
import diff from "shiki/langs/diff.mjs";
import dockerfile from "shiki/langs/dockerfile.mjs";
import go from "shiki/langs/go.mjs";
import graphql from "shiki/langs/graphql.mjs";
import html from "shiki/langs/html.mjs";
import ini from "shiki/langs/ini.mjs";
import java from "shiki/langs/java.mjs";
import javascript from "shiki/langs/javascript.mjs";
import json from "shiki/langs/json.mjs";
import jsonc from "shiki/langs/jsonc.mjs";
import jsx from "shiki/langs/jsx.mjs";
import kotlin from "shiki/langs/kotlin.mjs";
import lua from "shiki/langs/lua.mjs";
import markdown from "shiki/langs/markdown.mjs";
import php from "shiki/langs/php.mjs";
import powershell from "shiki/langs/powershell.mjs";
import prisma from "shiki/langs/prisma.mjs";
import python from "shiki/langs/python.mjs";
import ruby from "shiki/langs/ruby.mjs";
import rust from "shiki/langs/rust.mjs";
import scss from "shiki/langs/scss.mjs";
import shellscript from "shiki/langs/shellscript.mjs";
import sql from "shiki/langs/sql.mjs";
import svelte from "shiki/langs/svelte.mjs";
import swift from "shiki/langs/swift.mjs";
import toml from "shiki/langs/toml.mjs";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";
import vue from "shiki/langs/vue.mjs";
import xml from "shiki/langs/xml.mjs";
import yaml from "shiki/langs/yaml.mjs";

/** The theme id, needed by `codeToHtml`. Read from the registration so it cannot drift. */
export const THEME_NAME = "github-dark-default";

const LANGUAGES = [
  bash,
  c,
  cpp,
  csharp,
  css,
  diff,
  dockerfile,
  go,
  graphql,
  html,
  ini,
  java,
  javascript,
  json,
  jsonc,
  jsx,
  kotlin,
  lua,
  markdown,
  php,
  powershell,
  prisma,
  python,
  ruby,
  rust,
  scss,
  shellscript,
  sql,
  svelte,
  swift,
  toml,
  tsx,
  typescript,
  vue,
  xml,
  yaml,
];

/**
 * Fence info string / file extension → a grammar we actually loaded.
 *
 * Everything unlisted falls through to `text`, which shiki renders as a single
 * unstyled token. That is the correct outcome: a wrong grammar colours code
 * confidently and incorrectly, which is worse than no colour at all.
 */
const ALIASES: Readonly<Record<string, string>> = {
  ts: "typescript",
  mts: "typescript",
  cts: "typescript",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  py: "python",
  rb: "ruby",
  rs: "rust",
  kt: "kotlin",
  kts: "kotlin",
  cs: "csharp",
  "c++": "cpp",
  cc: "cpp",
  hpp: "cpp",
  h: "c",
  sh: "bash",
  zsh: "bash",
  shell: "bash",
  console: "bash",
  ps1: "powershell",
  pwsh: "powershell",
  yml: "yaml",
  md: "markdown",
  mdown: "markdown",
  htm: "html",
  gql: "graphql",
  patch: "diff",
  docker: "dockerfile",
  makefile: "text",
  conf: "ini",
  cfg: "ini",
  env: "ini",
  plaintext: "text",
  txt: "text",
  log: "text",
};

const LOADED = new Set(
  LANGUAGES.flatMap((registrations) =>
    registrations.flatMap((registration) => [registration.name, ...(registration.aliases ?? [])]),
  ),
);

/** Normalise a fence tag or a file extension to a grammar id, or `"text"`. */
export function resolveLang(hint: string | undefined): string {
  if (hint === undefined) return "text";
  const key = hint.trim().toLowerCase().replace(/^\./, "");
  if (key === "") return "text";
  const mapped = ALIASES[key] ?? key;
  return LOADED.has(mapped) ? mapped : "text";
}

/** Grammar id for a path, from its extension. */
export function langForPath(path: string): string {
  const name = path.split(/[\\/]/).pop() ?? path;
  if (name.toLowerCase() === "dockerfile") return "dockerfile";
  const dot = name.lastIndexOf(".");
  return resolveLang(dot === -1 ? name : name.slice(dot + 1));
}

let pending: Promise<HighlighterCore> | null = null;

function highlighter(): Promise<HighlighterCore> {
  pending ??= createHighlighterCore({
    themes: [theme],
    langs: LANGUAGES,
    engine: createJavaScriptRegexEngine({ forgiving: true }),
  });
  return pending;
}

/**
 * Highlight to HTML.
 *
 * Returns `null` rather than throwing when highlighting fails — the caller renders the
 * raw text, which is what the user came for. A syntax highlighter is the last thing in
 * this app that should be able to blank a transcript.
 */
export async function highlight(code: string, lang: string): Promise<string | null> {
  try {
    const shiki = await highlighter();
    return shiki.codeToHtml(code, {
      lang,
      theme: THEME_NAME,
      // The wrapper elements come from `CodeBlock`; shiki's own `<pre>` would fight it
      // for padding and background.
      structure: "inline",
    });
  } catch (cause) {
    console.warn("[renderer] highlight failed", lang, cause);
    return null;
  }
}
