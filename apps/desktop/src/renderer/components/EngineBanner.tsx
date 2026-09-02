/**
 * The engine's health, when it is not healthy.
 *
 * Renders nothing at all in the `ready` case, which is the whole point: an "engine
 * connected" indicator is noise 99.9% of the time and trains the user to ignore the
 * one place that will eventually have something urgent to say.
 *
 * The three unhealthy phases get visibly different treatment because they need
 * different things from the user:
 *
 * - `starting` — a thin progress hairline, no text. The engine spawns in well under a
 *   second; a full banner would flash on every launch and read as a fault.
 * - `restarting` — a spinner and the reason. Supervision is already handling it; the
 *   user's job is to wait, and the message exists so they know why the turn stopped.
 * - `failed` — the app is dead. This is the only one with a button.
 *
 * Copyright (c) 2026 Origin AI
 */

import { AlertTriangle, Loader2, RotateCw } from "lucide-react";

import { useStore } from "../store";

export function EngineBanner(): React.JSX.Element | null {
  const engine = useStore((state) => state.engine);
  const restartEngine = useStore((state) => state.restartEngine);

  if (engine.phase === "ready") return null;

  if (engine.phase === "starting") {
    return (
      <div className="h-0.5 shrink-0 overflow-hidden bg-surface-raised" role="status" aria-label="Starting the engine">
        <div className="h-full w-1/3 animate-pulse bg-accent" />
      </div>
    );
  }

  if (engine.phase === "restarting") {
    return (
      <div
        role="status"
        className="flex shrink-0 items-center gap-2 border-b border-warning/30 bg-warning-muted px-3 py-1.5 text-xs text-warning"
      >
        <Loader2 size={13} className="shrink-0 animate-spin" />
        <span className="min-w-0 flex-1 truncate">
          The engine stopped and is restarting (attempt {engine.attempt}). {engine.lastError}
        </span>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="flex shrink-0 items-center gap-2 border-b border-danger/40 bg-danger-muted px-3 py-1.5 text-xs text-danger"
    >
      <AlertTriangle size={13} className="shrink-0" />
      <span className="min-w-0 flex-1">
        The engine could not start, so Trace cannot run a turn. {engine.error}
      </span>
      <button
        type="button"
        onClick={() => void restartEngine()}
        className="flex shrink-0 items-center gap-1 rounded border border-danger/50 px-2 py-0.5 text-danger transition-colors hover:bg-danger hover:text-white"
      >
        <RotateCw size={11} />
        Try again
      </button>
    </div>
  );
}
