/**
 * Terminal.
 *
 * A real pty, over three notifications and four requests. The engine owns the process;
 * this owns the screen.
 *
 * ## Why the session lives outside the component
 *
 * `WorkPanel` renders one target at a time, so switching to Files and back unmounts this
 * component. If the pty were owned by the component, that tab switch would kill a running
 * `pnpm dev` and orphan its output — and re-mounting would spawn a *second* shell. So the
 * session, its subscription, and a capped replay buffer are module-level: output keeps
 * arriving and accumulating while the panel is closed, and a fresh xterm replays it. A
 * terminal is a process, not a view, and it outlives the view the way it does in every
 * editor that has one.
 *
 * The buffer is capped by characters and trimmed from the front, so a very long-running
 * process replays the recent tail rather than the whole day. That tail can begin in the
 * middle of an escape sequence; xterm tolerates it, and the alternative — keeping every
 * byte of a build log in renderer memory forever — is worse.
 *
 * Nothing here closes the pty on unmount. It is closed when the user asks, or when the
 * engine shuts down and takes its children with it.
 *
 * Copyright (c) 2026 Origin AI
 */

import { useEffect, useRef, useState } from "react";
import { CircleAlert, Plus, SquareTerminal, Trash2, TriangleAlert } from "lucide-react";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal, type ITheme } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";

import { bridge } from "../../lib/bridge";
import { useStore } from "../../store";
import { PANEL_BUTTON, PanelBar, PanelMessage, messageOf } from "./shell";

/** Replay buffer ceiling, in characters. About a thousand lines of dense output. */
const MAX_REPLAY = 256_000;

interface Live {
  terminalId: string;
  /** The workspace it was started in, which the active one may no longer be. */
  workspaceId: string | undefined;
  label: string;
  text: string;
  exit: { exitCode: number | null; signal?: string } | null;
}

let live: Live | null = null;
/** In flight, so StrictMode's double-invoked effect cannot spawn two shells. */
let pending: Promise<Live> | null = null;
let routed = false;

const sinks = new Set<(chunk: string) => void>();
const watchers = new Set<() => void>();

/**
 * Append, trimming from the front.
 *
 * A 50k-line build log would otherwise grow the renderer's heap for the rest of the
 * session, and the useful part of a long log is always its tail.
 */
function append(text: string, chunk: string): string {
  const next = text + chunk;
  return next.length <= MAX_REPLAY ? next : next.slice(next.length - MAX_REPLAY);
}

function announce(): void {
  for (const watcher of watchers) watcher();
}

/**
 * Route `terminal/*` into the buffer, once per renderer.
 *
 * Never unsubscribed, and that is the point: subscribing from the component would stop
 * collecting output the moment the user switches to the Files tab, so a `pnpm build` that
 * finished while the panel was closed would come back blank.
 */
function route(): void {
  if (routed) return;
  routed = true;
  bridge.onEngineNotify((notification) => {
    if (notification.method === "terminal/output") {
      const { terminalId, data } = notification.params;
      if (live === null || live.terminalId !== terminalId) return;
      live.text = append(live.text, data);
      for (const sink of sinks) sink(data);
      return;
    }
    if (notification.method === "terminal/exited") {
      const { terminalId, exitCode, signal } = notification.params;
      if (live === null || live.terminalId !== terminalId) return;
      // The engine emits this for an explicit `terminal/close` too, so the panel has one
      // code path for "the shell is gone" whether the user asked or the shell decided.
      live.exit = { exitCode, signal };
      announce();
    }
  });
}

/** Drop the session without touching a process. Only for one the engine already reaped. */
function forget(): void {
  live = null;
  announce();
}

/**
 * The session, created if there is none.
 *
 * `pending` is what makes this safe to call from an effect React invokes twice in
 * development: the second call joins the first request instead of spawning a second shell.
 * The engine refuses with "Open a folder before opening a terminal." when there is nowhere
 * to put the cwd, which is a sentence the panel can show as-is.
 */
async function ensure(cols: number, rows: number): Promise<Live> {
  if (live !== null) return live;
  if (pending !== null) return pending;
  route();
  const state = useStore.getState();
  const workspace = state.workspaces.find((entry) => entry.id === state.activeWorkspaceId);
  pending = bridge
    .request("terminal/create", {
      ...(workspace === undefined ? {} : { workspaceId: workspace.id }),
      cols,
      rows,
    })
    .then(
      (result) => {
        const session: Live = {
          terminalId: result.terminalId,
          workspaceId: workspace?.id,
          label: workspace?.name ?? "Shell",
          text: "",
          exit: null,
        };
        live = session;
        pending = null;
        announce();
        return session;
      },
      (cause: unknown) => {
        // Cleared rather than kept: the retry button has to be able to ask again, and a
        // rejected promise parked here would refuse for the rest of the session.
        pending = null;
        throw cause;
      },
    );
  return pending;
}

/**
 * The palette, read from the design tokens where they exist.
 *
 * `@theme` in `index.css` emits plain hex into `:root`, which is the reason it is plain hex
 * — xterm parses colour strings itself and has never heard of `oklch()`. Six of the sixteen
 * ANSI slots already have a token and are read from it, so a change to the app's red
 * changes the terminal's red. The other ten do not exist as tokens because nothing else in
 * the UI has an opinion about ANSI cyan, and inventing tokens for them would put ten
 * unused variables in the stylesheet.
 */
function themeOf(): ITheme {
  const css = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string): string => {
    const value = css.getPropertyValue(name).trim();
    return value === "" ? fallback : value;
  };
  const fg = read("--color-fg", "#ededf0");
  const bg = read("--color-surface", "#0b0b0d");
  return {
    background: bg,
    foreground: fg,
    cursor: read("--color-accent-fg", "#b9a9f5"),
    cursorAccent: bg,
    selectionBackground: read("--color-surface-active", "#2a2a32"),
    // Not `#000`: on a #0b0b0d surface, ANSI black is a hole in the output.
    black: "#3b3b45",
    red: read("--color-danger", "#e5484d"),
    green: read("--color-success", "#46a758"),
    yellow: read("--color-warning", "#ffb224"),
    blue: "#5b9dff",
    magenta: read("--color-accent-fg", "#b9a9f5"),
    cyan: "#4cc3d4",
    white: fg,
    brightBlack: read("--color-fg-subtle", "#64646f"),
    brightRed: read("--color-diff-remove-fg", "#ff9592"),
    brightGreen: read("--color-diff-add-fg", "#7ee2a0"),
    brightYellow: "#ffd074",
    brightBlue: "#8ebeff",
    brightMagenta: "#d3c6ff",
    brightCyan: "#86e0eb",
    brightWhite: "#ffffff",
  };
}

/**
 * How the exit reads in the strip.
 *
 * The code is shown even when it is zero. "Exited" alone leaves the reader wondering
 * whether the command worked, which is the one thing they wanted to know.
 */
function describe(exit: NonNullable<Live["exit"]>): string {
  if (exit.signal !== undefined) return `was killed by ${exit.signal}`;
  if (exit.exitCode === null) return "exited";
  return `exited with code ${String(exit.exitCode)}`;
}

export function TerminalPanel(): React.JSX.Element {
  const workspaces = useStore((state) => state.workspaces);
  const activeWorkspaceId = useStore((state) => state.activeWorkspaceId);
  const workspace = workspaces.find((entry) => entry.id === activeWorkspaceId);

  const host = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Bumped to tear the xterm down and ask for a fresh pty. `term.reset()` would clear the
  // screen but leave the same dead session behind it.
  const [nonce, setNonce] = useState(0);
  const [, bump] = useState(0);

  // The module state above is not React state, so a change to it — an exit arriving while
  // the panel is open — has to be pushed in.
  useEffect(() => {
    const watcher = (): void => {
      bump((value) => value + 1);
    };
    watchers.add(watcher);
    return () => {
      watchers.delete(watcher);
    };
  }, []);

  useEffect(() => {
    const parent = host.current;
    if (parent === null) return;

    const term = new Terminal({
      allowProposedApi: true,
      cursorBlink: true,
      cursorStyle: "bar",
      fontFamily: getComputedStyle(document.documentElement).getPropertyValue("--font-mono"),
      fontSize: 12,
      lineHeight: 1.25,
      // The engine's own buffer is the replay cap; this is how far the user can scroll
      // within the session they are looking at.
      scrollback: 5_000,
      // Beyond this ratio xterm lifts a dim colour towards the foreground. Left at 1 —
      // a build that prints grey secondary text means it, and "helpfully" brightening
      // it makes the important lines stop standing out.
      minimumContrastRatio: 1,
      theme: themeOf(),
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(parent);
    fit.fit();

    // Subscribed before the replay and in the same synchronous block: a chunk arriving
    // between the two statements would land in the buffer and never on the screen.
    const sink = (chunk: string): void => {
      term.write(chunk);
    };
    sinks.add(sink);
    const resumed = live;
    if (resumed !== null) term.write(resumed.text);

    const typed = term.onData((data) => {
      const current = live;
      if (current === null || current.exit !== null) return;
      // Ignored on failure. The only way this rejects is a shell that died between the
      // keystroke and the request, and the exit strip is about to say so more clearly
      // than an error banner would.
      void bridge.request("terminal/input", { terminalId: current.terminalId, data }).catch(() => {
        /* the exit strip explains it */
      });
    });

    const resized = term.onResize(({ cols, rows }) => {
      const current = live;
      if (current === null || current.exit !== null) return;
      void bridge
        .request("terminal/resize", { terminalId: current.terminalId, cols, rows })
        .catch(() => {
          /* same race, same reason */
        });
    });

    // `fit()` reads the host's computed height, so this fires for the splitter, the window,
    // and the strips that appear above the terminal — all three change the row count.
    const observer = new ResizeObserver(() => {
      fit.fit();
    });
    observer.observe(parent);

    let alive = true;
    void ensure(term.cols, term.rows).then(
      (created) => {
        if (!alive) return;
        setError(null);
        term.focus();
        // A resumed session was sized for whatever the panel's width was when it started.
        if (resumed !== null && created.exit === null) {
          void bridge
            .request("terminal/resize", {
              terminalId: created.terminalId,
              cols: term.cols,
              rows: term.rows,
            })
            .catch(() => {
              /* as above */
            });
        }
      },
      (cause: unknown) => {
        if (alive) setError(messageOf(cause));
      },
    );

    return () => {
      alive = false;
      observer.disconnect();
      typed.dispose();
      resized.dispose();
      sinks.delete(sink);
      // Disposes the screen, not the shell. Nothing in this cleanup calls `terminal/close`.
      term.dispose();
    };
  }, [nonce]);

  const session = live;
  const exit = session?.exit ?? null;
  // The shell's cwd is fixed at creation, so switching folders in the sidebar leaves it
  // pointing at the old one. Saying so is cheaper than silently running the user's next
  // command in the wrong repository.
  const stale =
    session !== null &&
    session.workspaceId !== undefined &&
    session.workspaceId !== activeWorkspaceId;

  /** Kill this shell, if it is still running, and open a fresh one in the active folder. */
  const restart = (): void => {
    setError(null);
    const current = live;
    if (current === null || current.exit !== null) {
      forget();
      setNonce((value) => value + 1);
      return;
    }
    setBusy(true);
    void bridge.request("terminal/close", { terminalId: current.terminalId }).then(
      () => {
        forget();
        setBusy(false);
        setNonce((value) => value + 1);
      },
      (cause: unknown) => {
        setBusy(false);
        setError(messageOf(cause));
      },
    );
  };

  /**
   * Kill this shell and leave its output on screen.
   *
   * No `forget()` here: the engine answers an explicit close with `terminal/exited`, so
   * letting that notification do the work means a killed shell and a crashed one land in
   * exactly the same state.
   */
  const kill = (): void => {
    const current = live;
    if (current === null || current.exit !== null) return;
    setBusy(true);
    void bridge.request("terminal/close", { terminalId: current.terminalId }).then(
      () => {
        setBusy(false);
      },
      (cause: unknown) => {
        setBusy(false);
        setError(messageOf(cause));
      },
    );
  };

  return (
    <div className="flex h-full flex-col">
      <PanelBar>
        <SquareTerminal size={11} className="shrink-0 text-fg-subtle" />
        <span className="min-w-0 flex-1 truncate text-2xs text-fg-muted">
          {session?.label ?? workspace?.name ?? "Terminal"}
        </span>
        <button
          type="button"
          className={PANEL_BUTTON}
          title="New terminal"
          aria-label="New terminal"
          disabled={busy}
          onClick={restart}
        >
          <Plus size={11} />
        </button>
        <button
          type="button"
          className={PANEL_BUTTON}
          title="Close this terminal"
          aria-label="Close this terminal"
          disabled={busy || session === null || exit !== null}
          onClick={kill}
        >
          <Trash2 size={11} />
        </button>
      </PanelBar>

      {stale ? (
        <div className="flex shrink-0 items-center gap-1.5 border-b border-line bg-surface-raised px-2 py-1">
          <span className="min-w-0 flex-1 text-2xs text-fg-subtle">
            {`This shell is still in ${session?.label ?? ""} — a new one (+) opens in ${workspace?.name ?? "the open folder"}.`}
          </span>
        </div>
      ) : null}

      {error !== null && session !== null ? (
        <div className="flex shrink-0 items-center gap-1.5 border-b border-line bg-danger-muted px-2 py-1">
          <TriangleAlert size={11} className="shrink-0 text-danger" />
          <span className="min-w-0 flex-1 text-2xs text-fg-muted">{error}</span>
        </div>
      ) : null}

      {exit === null ? null : (
        <div className="flex shrink-0 items-center gap-1.5 border-b border-line bg-surface-raised px-2 py-1">
          <CircleAlert size={11} className="shrink-0 text-fg-subtle" />
          <span className="min-w-0 flex-1 text-2xs text-fg-muted">
            {`The shell ${describe(exit)}. Its output is still above.`}
          </span>
          <button
            type="button"
            className={PANEL_BUTTON}
            disabled={busy}
            onClick={restart}
          >
            New terminal
          </button>
        </div>
      )}

      {/* `relative` so the host keeps a definite box while a message covers it: `fit()`
          measures the host's computed height, and a host that unmounted to make room for
          the message would take the xterm with it and never come back. */}
      <div className="relative min-h-0 flex-1">
        <div ref={host} className="absolute inset-0 p-1.5" />
        {error !== null && session === null ? (
          <div className="absolute inset-0 flex flex-col bg-surface">
            <PanelMessage Icon={TriangleAlert} title="Could not open a terminal" detail={error}>
              <button
                type="button"
                className={`${PANEL_BUTTON} mt-1 border border-line`}
                onClick={restart}
              >
                Try again
              </button>
            </PanelMessage>
          </div>
        ) : null}
      </div>
    </div>
  );
}

