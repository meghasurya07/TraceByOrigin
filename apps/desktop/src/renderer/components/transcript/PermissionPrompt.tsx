/**
 * The inline permission prompt.
 *
 * Inline rather than a modal dialog, and that is the important decision. A modal steals
 * focus, hides the transcript behind it, and — worst — trains the user to dismiss it,
 * because the fastest way back to the thing you were reading is to press the button
 * nearest the mouse. Here the prompt is a card in the flow, directly under the tool
 * call it belongs to, with the diff or the command it is asking about visible in the
 * same glance. The turn is already blocked; there is no need for the UI to shout.
 *
 * Nothing is auto-focused, for the same reason: a keystroke aimed at the prompt bar
 * must never be able to approve a shell command.
 *
 * `allow_always` writes a rule into workspace settings, so it is deliberately the
 * quieter of the two approvals — the wide-blast-radius button should not be the
 * prettiest one on screen.
 *
 * Copyright (c) 2026 Origin AI
 */

import { memo, useState } from "react";
import { ChevronDown, ChevronRight, FilePen, ShieldQuestionMark, SquareTerminal } from "lucide-react";

import type { PermissionDecision, PermissionRequest } from "@trace/protocol";

import { cn } from "../../lib/cn";
import { useStore } from "../../store";
import { CodeBlock } from "./CodeBlock";
import { DiffView } from "./DiffView";

export const PermissionPrompt = memo(function PermissionPrompt(props: {
  request: PermissionRequest;
}): React.JSX.Element {
  const { request } = props;
  const resolvePermission = useStore((state) => state.resolvePermission);
  const [busy, setBusy] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const decide = (decision: PermissionDecision): void => {
    if (busy) return;
    setBusy(true);
    // No `finally` that clears `busy`: on success this card is replaced by the
    // resolved tool call, and re-enabling the buttons for the frame before that
    // happens is an invitation to double-approve.
    void resolvePermission(request.callId, decision).catch(() => {
      setBusy(false);
    });
  };

  const Icon =
    request.effect === "execute"
      ? SquareTerminal
      : request.effect === "mutate"
        ? FilePen
        : ShieldQuestionMark;

  return (
    <div className="animate-fade-in my-2 overflow-hidden rounded-md border border-warning/40 bg-warning-muted/40">
      <div className="flex items-start gap-2 px-3 py-2">
        <Icon size={13} className="mt-0.5 shrink-0 text-warning" />
        <div className="min-w-0 flex-1">
          <p className="selectable text-xs font-medium text-fg">{request.summary}</p>
          <p className="selectable mt-0.5 truncate font-mono text-2xs text-fg-muted" title={request.subject}>
            {request.subject}
          </p>
        </div>
      </div>

      {request.diffPreview === undefined ? null : (
        <div className="px-3 pb-2">
          <DiffView diff={request.diffPreview} maxRows={120} />
        </div>
      )}

      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={() => {
            setShowInput(!showInput);
          }}
          aria-expanded={showInput}
          className="flex items-center gap-1 text-2xs text-fg-subtle transition-colors hover:text-fg-muted"
        >
          {showInput ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          {showInput ? "Hide input" : "Show input"}
        </button>
        {showInput ? (
          <CodeBlock code={stringify(request.input)} lang="json" className="mt-1" />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-warning/25 px-3 py-2">
        <Action
          label="Allow once"
          primary
          disabled={busy}
          onClick={() => {
            decide({ decision: "allow_once" });
          }}
        />
        <Action
          label="Always allow"
          disabled={busy}
          title={`Adds an allow rule for ${request.tool} · ${request.subject}`}
          onClick={() => {
            decide({ decision: "allow_always" });
          }}
        />
        <Action
          label="Deny"
          disabled={busy}
          onClick={() => {
            decide({ decision: "deny" });
          }}
        />
        <span className="flex-1" />
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            decide({ decision: "deny_and_abort" });
          }}
          className="rounded px-1.5 py-1 text-2xs text-fg-subtle transition-colors hover:text-danger disabled:opacity-50"
        >
          Deny and stop the turn
        </button>
      </div>
    </div>
  );
});

function Action(props: {
  label: string;
  primary?: boolean;
  disabled?: boolean;
  title?: string;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      title={props.title}
      className={cn(
        "rounded border px-2 py-1 text-2xs font-medium transition-colors disabled:opacity-50",
        props.primary === true
          ? "border-accent bg-accent text-fg hover:bg-accent-hover"
          : "border-line-strong bg-surface-raised text-fg-muted hover:bg-surface-hover hover:text-fg",
      )}
    >
      {props.label}
    </button>
  );
}

/** Model input is `unknown` and can contain a cycle if the engine ever proxies it. */
function stringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}
