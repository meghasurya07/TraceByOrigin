/**
 * Extended thinking, collapsed by default.
 *
 * Reasoning is the highest-volume, lowest-density content in a transcript: it can be
 * thousands of tokens that the user, most of the time, does not want to read. So it is
 * a one-line disclosure — except while it is streaming, when it is the *only* thing
 * happening and a closed box would look like a stall. It auto-opens during the stream
 * and closes itself when the stream ends, unless the user touched it, in which case
 * their choice wins for the rest of the session.
 *
 * `settings.showThinking` decides whether these items reach the transcript at all;
 * that filtering happens in `visibleItems`, not here.
 *
 * Copyright (c) 2026 Origin AI
 */

import { memo, useEffect, useState } from "react";
import { Brain, ChevronDown, ChevronRight } from "lucide-react";

import type { ItemOf } from "@trace/client";

import { cn } from "../../lib/cn";

export const ThinkingBlock = memo(function ThinkingBlock(props: {
  item: ItemOf<"thinking">;
}): React.JSX.Element {
  const { item } = props;
  const [open, setOpen] = useState(item.streaming);
  /** Once the user clicks, streaming stops driving the disclosure. */
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!pinned) setOpen(item.streaming);
  }, [item.streaming, pinned]);

  return (
    <div className="my-1.5">
      <button
        type="button"
        onClick={() => {
          setPinned(true);
          setOpen(!open);
        }}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded px-1 py-0.5 text-2xs text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg-muted"
      >
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        <Brain size={11} className={cn(item.streaming && "animate-pulse text-accent-fg")} />
        <span>{item.streaming ? "Thinking…" : "Thought process"}</span>
      </button>

      {open ? (
        <div className="selectable mt-1 ml-2 border-l border-line pl-3 text-xs leading-relaxed whitespace-pre-wrap text-fg-subtle italic">
          {item.text}
          {item.streaming ? <Caret /> : null}
        </div>
      ) : null}
    </div>
  );
});

/**
 * The streaming caret.
 *
 * Also used by `assistant_text`. A block cursor rather than an ellipsis because it
 * marks a *position* — where the next token will land — which is what makes streaming
 * legible. The geometry and the blink live in the `.caret` utility in `index.css`, so
 * it is sized in `em` against whatever text it trails.
 */
export function Caret(): React.JSX.Element {
  return <span aria-hidden className="caret" />;
}
