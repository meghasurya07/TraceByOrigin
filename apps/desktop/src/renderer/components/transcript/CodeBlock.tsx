/**
 * A fenced code block.
 *
 * Highlighting is asynchronous — the grammars are real TextMate grammars and tokenising
 * a 400-line file is not free — so this renders the plain text first and swaps in the
 * highlighted markup when it arrives. The alternative, blocking on the highlighter,
 * would make a streaming code block appear in visible chunks after each token.
 *
 * That swap is also why the raw text is what gets copied: `navigator.clipboard` gets
 * `props.code`, never the DOM's `textContent`, so a copy taken mid-highlight is still
 * exactly the source.
 *
 * `dangerouslySetInnerHTML` is unavoidable — shiki's output *is* HTML — and is safe for
 * one specific reason: shiki escapes the text it tokenises, and the only tags in its
 * output are `<span>` with inline `style`. The CSP's `script-src 'self'` is the second
 * line of defence.
 *
 * Copyright (c) 2026 Origin AI
 */

import { memo, useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "../../lib/cn";
import { highlight, resolveLang } from "../../lib/highlight";

export const CodeBlock = memo(function CodeBlock(props: {
  code: string;
  lang?: string;
  /** Shown in the header instead of the language, for a diff or a file preview. */
  label?: string;
  /** Suppresses the header entirely, for inline use inside a tool card. */
  bare?: boolean;
  className?: string;
}): React.JSX.Element {
  const lang = resolveLang(props.lang);
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    // `cancelled` rather than an AbortController: the work is CPU-bound in a promise
    // and cannot be aborted, only ignored. What must not happen is a late result from
    // a previous `code` landing on the current one.
    let cancelled = false;
    if (lang === "text") {
      setHtml(null);
      return;
    }
    void highlight(props.code, lang).then((result) => {
      if (!cancelled) setHtml(result);
    });
    return () => {
      cancelled = true;
    };
  }, [props.code, lang]);

  const body = (
    <pre
      className={cn(
        "selectable overflow-x-auto px-3 py-2.5 font-mono text-2xs leading-relaxed",
        props.className,
      )}
    >
      {html === null ? (
        <code>{props.code}</code>
      ) : (
        <code dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </pre>
  );

  if (props.bare === true) return body;

  return (
    <div className="group/code my-2 overflow-hidden rounded-md border border-line bg-surface">
      <div className="flex h-7 items-center gap-2 border-b border-line bg-surface-raised px-2.5">
        <span className="min-w-0 flex-1 truncate font-mono text-2xs text-fg-subtle">
          {props.label ?? (lang === "text" ? "" : lang)}
        </span>
        <CopyButton text={props.code} />
      </div>
      {body}
    </div>
  );
});

export function CopyButton(props: { text: string; className?: string }): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => {
      setCopied(false);
    }, 1_400);
    return () => {
      window.clearTimeout(timer);
    };
  }, [copied]);

  return (
    <button
      type="button"
      title="Copy"
      aria-label="Copy"
      onClick={() => {
        void navigator.clipboard.writeText(props.text).then(
          () => {
            setCopied(true);
          },
          () => {
            // A clipboard the OS refused is not worth a banner; the button simply
            // does not confirm.
          },
        );
      }}
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg",
        props.className,
      )}
    >
      {copied ? <Check size={11} className="text-success" /> : <Copy size={11} />}
    </button>
  );
}
