/**
 * The title bar we draw ourselves.
 *
 * `frame: false` in `window.ts` means this row is the OS chrome, and that is deliberate:
 * the workspace picker, the session title, and the work-panel toggle are worth 36px of
 * vertical space that a native title bar would spend on nothing.
 *
 * Two platform facts shape the layout:
 *
 * - **macOS** keeps its real traffic lights (`titleBarStyle: "hidden"`), positioned at
 *   x:16 y:14 by `window.ts`. We leave a 70px gutter for them and draw no buttons.
 * - **Windows and Linux** get our own minimize/maximize/close on the right, sized to
 *   the platform convention (46×36) so muscle memory works.
 *
 * `-webkit-app-region: drag` makes the row draggable; every interactive child has to opt
 * out with `app-no-drag` or the click is swallowed by the drag handler.
 *
 * Copyright (c) 2026 Origin AI
 */

import { Maximize2, Minus, PanelRight, Sidebar, Square, X } from "lucide-react";

import { cn } from "../lib/cn";
import { bridge } from "../lib/bridge";
import { useStore } from "../store";
import { WorkspacePicker } from "./WorkspacePicker";

export function TitleBar(): React.JSX.Element {
  const platform = useStore((state) => state.host.info?.platform ?? null);
  const isPackaged = useStore((state) => state.host.info?.isPackaged ?? true);
  const maximized = useStore((state) => state.host.window.maximized);
  const focused = useStore((state) => state.host.window.focused);
  const fullScreen = useStore((state) => state.host.window.fullScreen);

  const sidebarOpen = useStore((state) => state.host.sidebarOpen);
  const panelOpen = useStore((state) => state.workPanel.open);
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const toggleWorkPanel = useStore((state) => state.toggleWorkPanel);

  const title = useStore((state) => {
    const id = state.activeSessionId;
    if (id === null) return "Trace";
    return state.sessions.find((session) => session.id === id)?.title ?? "Trace";
  });

  // Not full screen: in full screen macOS hides the traffic lights, so the gutter would
  // be 70px of nothing.
  const macGutter = platform === "darwin" && !fullScreen;

  return (
    <header
      className={cn(
        "app-drag flex h-titlebar shrink-0 items-center gap-1 border-b border-line bg-surface-raised pr-0 pl-2 select-none",
        !focused && "text-fg-muted",
      )}
    >
      {macGutter ? <div className="w-[70px] shrink-0" aria-hidden /> : null}

      <IconButton
        label={sidebarOpen ? "Hide sessions" : "Show sessions"}
        active={sidebarOpen}
        onClick={toggleSidebar}
      >
        <Sidebar size={14} />
      </IconButton>

      <WorkspacePicker />

      {/* The session name. Centred visually by being the only flexible child, which
          keeps it centred as the two shoulders change width — a fixed `left: 50%` would
          drift the moment the workspace name got longer. */}
      <div className="flex min-w-0 flex-1 items-center justify-center px-3">
        <span className="truncate text-xs font-medium text-fg-muted" title={title}>
          {title}
        </span>
        {isPackaged ? null : (
          <span className="ml-2 shrink-0 rounded border border-warning/40 bg-warning-muted px-1.5 py-px font-mono text-2xs text-warning">
            dev
          </span>
        )}
      </div>

      <IconButton
        label={panelOpen ? "Hide work panel" : "Show work panel"}
        active={panelOpen}
        onClick={toggleWorkPanel}
      >
        <PanelRight size={14} />
      </IconButton>

      {platform === "darwin" ? (
        <div className="w-2 shrink-0" aria-hidden />
      ) : (
        <div className="app-no-drag ml-1 flex shrink-0 self-stretch">
          <WindowButton label="Minimize" onClick={() => void bridge.windowControl("minimize")}>
            <Minus size={13} strokeWidth={1.5} />
          </WindowButton>
          <WindowButton
            label={maximized ? "Restore" : "Maximize"}
            onClick={() => void bridge.windowControl("toggle_maximize")}
          >
            {maximized ? <Maximize2 size={11} strokeWidth={1.5} /> : <Square size={11} strokeWidth={1.5} />}
          </WindowButton>
          <WindowButton
            label="Close"
            danger
            onClick={() => void bridge.windowControl("close")}
          >
            <X size={14} strokeWidth={1.5} />
          </WindowButton>
        </div>
      )}
    </header>
  );
}

function IconButton(props: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <button
      type="button"
      title={props.label}
      aria-label={props.label}
      aria-pressed={props.active ?? false}
      onClick={props.onClick}
      className={cn(
        "app-no-drag flex size-7 shrink-0 items-center justify-center rounded transition-colors",
        props.active === true
          ? "bg-surface-active text-fg"
          : "text-fg-subtle hover:bg-surface-hover hover:text-fg",
      )}
    >
      {props.children}
    </button>
  );
}

/**
 * A Windows/Linux caption button.
 *
 * 46×36 and square-cornered on purpose — it is the Fluent metric, and a rounded 28px
 * button in the corner of a maximized window reads as a web page's idea of a title bar.
 * Close goes red on hover, which is the one colour affordance users actively look for.
 */
function WindowButton(props: {
  label: string;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <button
      type="button"
      title={props.label}
      aria-label={props.label}
      onClick={props.onClick}
      className={cn(
        "flex h-full w-[46px] items-center justify-center text-fg-muted transition-colors",
        props.danger === true ? "hover:bg-danger hover:text-white" : "hover:bg-surface-hover hover:text-fg",
      )}
    >
      {props.children}
    </button>
  );
}
