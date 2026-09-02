/**
 * A turn that went wrong.
 *
 * The one place in the transcript that is allowed to be loud, and the one place where a
 * message alone is not enough. "Provider rejected our credentials" is a true sentence
 * that leaves the user with nothing to do; the remedy has to be attached to it. So each
 * code that has a known fix renders that fix as a button, and every code that does not
 * renders no button at all rather than a hopeful "Retry".
 *
 * `fatal` distinguishes "this turn died" from "something went wrong but the loop
 * continued" — a rate-limit the engine backed off from, for instance. A non-fatal error
 * is a note, and gets warning colouring; a fatal one gets danger colouring and the
 * remedy.
 *
 * Copyright (c) 2026 Origin AI
 */

import { memo, useEffect, useState } from "react";
import { CircleAlert, TriangleAlert } from "lucide-react";

import { ErrorCode } from "@trace/protocol";
import type { ItemOf } from "@trace/client";

import { cn } from "../../lib/cn";
import { useStore } from "../../store";
import { formatDuration } from "../../lib/format";

export const ErrorItem = memo(function ErrorItem(props: {
  item: ItemOf<"error">;
}): React.JSX.Element {
  const { item } = props;
  const openSettings = useStore((state) => state.openSettings);
  const restartEngine = useStore((state) => state.restartEngine);
  const createSession = useStore((state) => state.createSession);

  const Icon = item.fatal ? CircleAlert : TriangleAlert;

  return (
    <div
      className={cn(
        "animate-fade-in my-2 rounded-md border px-3 py-2",
        item.fatal ? "border-danger/40 bg-danger-muted/30" : "border-warning/40 bg-warning-muted/30",
      )}
    >
      <div className="flex items-start gap-2">
        <Icon size={13} className={cn("mt-0.5 shrink-0", item.fatal ? "text-danger" : "text-warning")} />
        <div className="min-w-0 flex-1">
          <p className="selectable text-xs leading-relaxed text-fg">{item.message}</p>
          <p className="mt-0.5 font-mono text-2xs text-fg-subtle">
            {codeName(item.code)}
            {item.retryInMs === undefined ? null : (
              <>
                {" · "}
                <Countdown ms={item.retryInMs} />
              </>
            )}
          </p>
        </div>
      </div>

      <Remedy
        code={item.code}
        onSettings={(section) => {
          openSettings(section);
        }}
        onRestart={() => {
          void restartEngine();
        }}
        onNewSession={() => {
          void createSession();
        }}
      />
    </div>
  );
});

/**
 * The fix, when there is one.
 *
 * Deliberately not exhaustive over `ErrorCode`: most codes are engine bugs or transport
 * faults with no user-side action, and inventing a button for them would be worse than
 * silence. The switch returns `null` and the card is just the message.
 */
function Remedy(props: {
  code: number;
  onSettings: (section: "account" | "models" | "permissions" | "advanced") => void;
  onRestart: () => void;
  onNewSession: () => void;
}): React.JSX.Element | null {
  const { code } = props;

  if (code === ErrorCode.MissingApiKey || code === ErrorCode.ProviderAuthFailed) {
    return (
      <Row>
        <Button
          label="Open model settings"
          onClick={() => {
            props.onSettings("models");
          }}
        />
        <Hint>Add your own API key, or sign in to use Trace's models.</Hint>
      </Row>
    );
  }

  if (code === ErrorCode.EngineUnavailable || code === ErrorCode.ShuttingDown) {
    return (
      <Row>
        <Button label="Restart the engine" onClick={props.onRestart} />
        <Hint>Open sessions are on disk and will still be there.</Hint>
      </Row>
    );
  }

  if (code === ErrorCode.ContextExceeded) {
    return (
      <Row>
        <Button label="Start a new session" onClick={props.onNewSession} />
        <Hint>Or restore an earlier checkpoint and take a shorter path.</Hint>
      </Row>
    );
  }

  if (code === ErrorCode.PermissionDenied) {
    return (
      <Row>
        <Button
          label="Permission settings"
          onClick={() => {
            props.onSettings("permissions");
          }}
        />
      </Row>
    );
  }

  return null;
}

function Row({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <div className="mt-2 flex flex-wrap items-center gap-2 pl-[21px]">{children}</div>;
}

function Hint({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <span className="text-2xs text-fg-subtle">{children}</span>;
}

function Button(props: { label: string; onClick: () => void }): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="rounded border border-line-strong bg-surface-raised px-2 py-1 text-2xs font-medium text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
    >
      {props.label}
    </button>
  );
}

/**
 * A live countdown to the engine's next attempt.
 *
 * Ticks once a second and stops at zero. The point is not precision — it is that a
 * frozen "retrying in 30s" looks like the same stall it is trying to explain.
 */
function Countdown({ ms }: { ms: number }): React.JSX.Element {
  const [remaining, setRemaining] = useState(ms);

  useEffect(() => {
    setRemaining(ms);
    if (ms <= 0) return;
    const started = Date.now();
    const timer = setInterval(() => {
      const left = ms - (Date.now() - started);
      setRemaining(left > 0 ? left : 0);
      if (left <= 0) clearInterval(timer);
    }, 1_000);
    return () => {
      clearInterval(timer);
    };
  }, [ms]);

  return <>{remaining <= 0 ? "retrying" : `retrying in ${formatDuration(remaining)}`}</>;
}

/**
 * The code's name, for the one line of small print.
 *
 * Built by reversing `ErrorCode` rather than by a hand-written map, so a code added to
 * the protocol shows up here without a matching edit. Unknown numbers print as numbers,
 * which is still more useful to a bug report than nothing.
 */
const CODE_NAMES: ReadonlyMap<number, string> = new Map(
  Object.entries(ErrorCode).map(([name, value]) => [value, name]),
);

function codeName(code: number): string {
  const name = CODE_NAMES.get(code);
  return name === undefined ? `error ${String(code)}` : name;
}
