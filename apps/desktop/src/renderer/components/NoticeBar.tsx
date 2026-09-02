/**
 * App-level banners.
 *
 * Distinct from a transcript `error` item, and the distinction is worth keeping: an
 * error inside a turn belongs to the conversation and stays in the history, while these
 * are about the *application* — a failed sign-in, an engine that will not start, a
 * setting that would not save — and are dismissible.
 *
 * Every notice may carry exactly one action, from a closed set. Closed because the
 * store has to stay serializable (a callback in state cannot be snapshotted into a bug
 * report), and one because a banner with two buttons is a dialog wearing a disguise.
 *
 * Copyright (c) 2026 Origin AI
 */

import { AlertTriangle, Info, TriangleAlert, X } from "lucide-react";

import type { Notice } from "@trace/client";

import { cn } from "../lib/cn";
import { useStore } from "../store";

const LEVEL_STYLE: Readonly<Record<Notice["level"], string>> = {
  info: "border-line bg-surface-raised text-fg-muted",
  warn: "border-warning/30 bg-warning-muted text-warning",
  error: "border-danger/40 bg-danger-muted text-danger",
};

export function NoticeBar(): React.JSX.Element | null {
  const notices = useStore((state) => state.notices);
  if (notices.length === 0) return null;

  return (
    <div className="shrink-0">
      {notices.map((notice) => (
        <NoticeRow key={notice.id} notice={notice} />
      ))}
    </div>
  );
}

function NoticeRow({ notice }: { notice: Notice }): React.JSX.Element {
  const dismissNotice = useStore((state) => state.dismissNotice);
  const signIn = useStore((state) => state.signIn);
  const openSettings = useStore((state) => state.openSettings);
  const restartEngine = useStore((state) => state.restartEngine);
  const createSession = useStore((state) => state.createSession);

  const Icon = notice.level === "error" ? AlertTriangle : notice.level === "warn" ? TriangleAlert : Info;
  // Pulled into a local so the narrowing survives into the click handler — TypeScript
  // discards a property-access narrowing at a function boundary.
  const action = notice.action;

  const run = (kind: NonNullable<Notice["action"]>["kind"]): void => {
    switch (kind) {
      case "sign_in":
        void signIn();
        break;
      case "open_settings":
        openSettings("models");
        break;
      case "restart_engine":
        void restartEngine();
        break;
      case "compact_session":
        // See `report()` in the store: branching is the remedy the protocol supports.
        void createSession();
        break;
      case "retry":
        // Nothing generic to retry — the notice is the record of what failed, and the
        // action that produced it is a click away. Dismissing is the honest behaviour.
        break;
      default: {
        const unhandled: never = kind;
        void unhandled;
        break;
      }
    }
    dismissNotice(notice.id);
  };

  return (
    <div
      role={notice.level === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-2 border-b px-3 py-1.5 text-xs", LEVEL_STYLE[notice.level])}
    >
      <Icon size={13} className="mt-px shrink-0" />
      <span className="selectable min-w-0 flex-1 leading-relaxed break-words">{notice.message}</span>

      {action === undefined ? null : (
        <button
          type="button"
          onClick={() => {
            run(action.kind);
          }}
          className="shrink-0 rounded border border-current/40 px-2 py-0.5 font-medium transition-colors hover:bg-current/10"
        >
          {action.label}
        </button>
      )}

      <button
        type="button"
        aria-label="Dismiss"
        title="Dismiss"
        onClick={() => {
          dismissNotice(notice.id);
        }}
        className="shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
      >
        <X size={12} />
      </button>
    </div>
  );
}
