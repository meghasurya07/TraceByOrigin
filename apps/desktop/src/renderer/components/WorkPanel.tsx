/**
 * The work panel.
 *
 * The second half of the app's thesis. Chat is the frame; this is the viewport the frame
 * can point at something — files, a diff, a terminal, a page — and it is *summoned*, not
 * permanent. That is the whole difference between this shape and an IDE with a chat
 * sidebar: here the conversation owns the window and the tools appear when the
 * conversation needs them, so the default state of the app is one column of text.
 *
 * Seven targets, one at a time. Tabs rather than a split, because the panel is 30–40% of a
 * laptop screen and two things sharing that space are both unusable. `⌘1…⌘7` jump
 * straight to a target and `⌘⇧M` toggles the panel, all handled in the store — pressing
 * the target that is already showing closes the panel, which is what makes those keys
 * toggles instead of no-ops. `TABS` below is in the same order as `menu.ts`'s
 * `WORK_PANELS`, which is what makes the number a user presses match what they see.
 *
 * The splitter is a real drag, clamped so neither side can be squeezed out of existence.
 * The width is remembered in a module-level variable rather than in the store: it is not
 * application state, nothing else reads it, and a store write per mousemove is 60 writes
 * a second through every subscriber in the tree.
 *
 * Copyright (c) 2026 Origin AI
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FolderTree,
  GitCompare,
  GitPullRequest,
  Globe,
  ListChecks,
  PanelRightClose,
  PenTool,
  SquareTerminal,
} from "lucide-react";

import type { WorkPanelTarget } from "@trace/protocol";

import { cn } from "../lib/cn";
import { useStore } from "../store";
import { BrowserPanel } from "./panels/BrowserPanel";
import { CanvasPanel } from "./panels/CanvasPanel";
import { DiffPanel } from "./panels/DiffPanel";
import { FilesPanel } from "./panels/FilesPanel";
import { PrPanel } from "./panels/PrPanel";
import { ReviewPanel } from "./panels/ReviewPanel";
import { TerminalPanel } from "./panels/TerminalPanel";

const TABS: readonly { target: WorkPanelTarget; label: string; Icon: typeof FolderTree }[] = [
  { target: "files", label: "Files", Icon: FolderTree },
  { target: "review", label: "Review", Icon: ListChecks },
  { target: "diff", label: "Diff", Icon: GitCompare },
  { target: "terminal", label: "Terminal", Icon: SquareTerminal },
  { target: "browser", label: "Browser", Icon: Globe },
  { target: "canvas", label: "Canvas", Icon: PenTool },
  { target: "pr", label: "PR", Icon: GitPullRequest },
];

const MIN_WIDTH = 320;
/** Left for the transcript no matter how far the splitter is dragged. */
const MIN_CHAT = 420;
const DEFAULT_WIDTH = 520;

let rememberedWidth = DEFAULT_WIDTH;

export function WorkPanel(): React.JSX.Element {
  const target = useStore((state) => state.workPanel.target);
  const refs = useStore((state) => state.workPanel.refs);
  const openWorkPanel = useStore((state) => state.openWorkPanel);
  const closeWorkPanel = useStore((state) => state.closeWorkPanel);

  const [width, setWidth] = useState(rememberedWidth);
  useEffect(() => {
    rememberedWidth = width;
  }, [width]);

  const dragging = useRef(false);

  // Bound to `window`, not to the handle: a pointer moving faster than React can
  // re-render leaves the handle behind, and a splitter that stops following the cursor
  // when you drag quickly is the most common way this control is got wrong.
  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragging.current = true;

    const onMove = (move: PointerEvent): void => {
      if (!dragging.current) return;
      const next = window.innerWidth - move.clientX;
      setWidth(Math.max(MIN_WIDTH, Math.min(next, window.innerWidth - MIN_CHAT)));
    };
    const onUp = (): void => {
      dragging.current = false;
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    document.body.style.cursor = "col-resize";
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  return (
    <div
      className="flex shrink-0 border-l border-line bg-surface-raised"
      style={{ width: `${String(width)}px` }}
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize the work panel"
        onPointerDown={onPointerDown}
        onDoubleClick={() => {
          setWidth(DEFAULT_WIDTH);
        }}
        className="w-1 shrink-0 cursor-col-resize bg-transparent transition-colors hover:bg-accent/40"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-0.5 border-b border-line px-1.5 py-1">
          {TABS.map((tab) => (
            <button
              key={tab.target}
              type="button"
              title={tab.label}
              onClick={() => {
                openWorkPanel(tab.target);
              }}
              className={cn(
                "flex items-center gap-1.5 rounded px-1.5 py-1 text-2xs transition-colors",
                tab.target === target
                  ? "bg-surface-active text-fg"
                  : "text-fg-subtle hover:bg-surface-hover hover:text-fg-muted",
              )}
            >
              <tab.Icon size={11} className="shrink-0" />
              <span className={tab.target === target ? "" : "sr-only"}>{tab.label}</span>
            </button>
          ))}
          <span className="flex-1" />
          <button
            type="button"
            title="Close the panel (⌘⇧M)"
            aria-label="Close the work panel"
            onClick={closeWorkPanel}
            className="flex size-6 items-center justify-center rounded text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
          >
            <PanelRightClose size={12} />
          </button>
        </div>

        <div className="min-h-0 flex-1">
          {target === "files" ? <FilesPanel openRef={refs.files} /> : null}
          {target === "review" ? <ReviewPanel /> : null}
          {target === "diff" ? <DiffPanel openRef={refs.diff} /> : null}
          {target === "terminal" ? <TerminalPanel /> : null}
          {target === "browser" ? <BrowserPanel openRef={refs.browser} /> : null}
          {target === "canvas" ? <CanvasPanel /> : null}
          {target === "pr" ? <PrPanel /> : null}
        </div>
      </div>
    </div>
  );
}
