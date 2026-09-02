/**
 * The bottom rail: what this conversation is costing, and who is paying.
 *
 * Cost is the number a coding agent's users check most and trust least, so it is on
 * screen permanently rather than behind a menu, and it updates live from `usage_updated`
 * — the figure at the end of a turn should be the same one you watched climb, not a
 * surprise. `cumulativeCost` folds the in-flight turn into the session's persisted
 * total, which is why the reducer deliberately leaves `summary.cumulativeCost` alone
 * mid-turn.
 *
 * 26px, one line, no wrapping. Everything here is glanceable or it does not belong.
 *
 * Copyright (c) 2026 Origin AI
 */

import { CircleDollarSign, Cpu, Loader2, Zap } from "lucide-react";

import { cumulativeCost } from "@trace/client";

import { cn } from "../lib/cn";
import { formatCents, formatTokens, formatUsd } from "../lib/format";
import { useStore } from "../store";

export function StatusBar(): React.JSX.Element {
  const view = useStore((state) =>
    state.activeSessionId === null ? undefined : state.views[state.activeSessionId],
  );
  const models = useStore((state) => state.models);
  const settings = useStore((state) => state.settings);
  const auth = useStore((state) => state.auth);
  const engine = useStore((state) => state.engine);
  const indexing = useStore((state) => state.indexing);
  const activeWorkspaceId = useStore((state) => state.activeWorkspaceId);
  const openSettings = useStore((state) => state.openSettings);
  const signIn = useStore((state) => state.signIn);

  const cost = view === undefined ? null : cumulativeCost(view);
  const live = view?.live ?? null;

  const modelId = live?.model ?? view?.summary.model ?? settings?.defaultModel ?? null;
  const modelName =
    modelId === null
      ? null
      : (models.find((model) => model.id === modelId)?.displayName ?? modelId);

  const progress = activeWorkspaceId === null ? undefined : indexing[activeWorkspaceId];
  const indexBusy = progress !== undefined && progress.phase !== "done";

  return (
    <footer className="flex h-statusbar shrink-0 items-center gap-3 border-t border-line bg-surface-raised px-3 text-2xs text-fg-subtle select-none">
      {/* Left: what is happening right now. */}
      {live !== null ? (
        <span className="flex items-center gap-1.5 text-accent-fg">
          <Loader2 size={10} className="animate-spin" />
          {live.interruptRequested
            ? "Stopping…"
            : `Working · iteration ${String(live.iteration)} · ${String(live.cost.requests)} req`}
        </span>
      ) : engine.phase === "ready" ? (
        <span className="flex items-center gap-1.5">
          <Cpu size={10} />
          Engine {engine.engineVersion}
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <Cpu size={10} />
          {engine.phase === "starting"
            ? "Starting…"
            : engine.phase === "restarting"
              ? "Restarting…"
              : "Offline"}
        </span>
      )}

      {indexBusy && progress !== undefined ? (
        <span className="flex items-center gap-1.5">
          <Loader2 size={10} className="animate-spin" />
          Indexing {progress.filesDone}/{progress.filesTotal}
        </span>
      ) : null}

      <span className="min-w-0 flex-1" />

      {/* Right: the money and the model, in that order — cost is the thing being
          monitored, model is the thing being changed. */}
      {cost === null ? null : (
        <>
          <span
            className="flex items-center gap-1.5 font-mono"
            title="Tokens in / out this session"
          >
            <Zap size={10} />
            {formatTokens(cost.usage.inputTokens)} in · {formatTokens(cost.usage.outputTokens)} out
            {cost.usage.cacheReadInputTokens > 0
              ? ` · ${formatTokens(cost.usage.cacheReadInputTokens)} cached`
              : ""}
          </span>
          <span
            className={cn(
              "flex items-center gap-1 font-mono",
              cost.estimatedUsd > 0 && "text-fg-muted",
            )}
            title="Estimated cost of this session, from the model's published rates"
          >
            <CircleDollarSign size={10} />
            {formatUsd(cost.estimatedUsd)}
          </span>
        </>
      )}

      {modelName === null ? null : (
        <button
          type="button"
          onClick={() => {
            openSettings("models");
          }}
          className="max-w-48 truncate rounded px-1 py-0.5 transition-colors hover:bg-surface-hover hover:text-fg"
          title="Models and keys"
        >
          {modelName}
        </button>
      )}

      {auth.status === "signed_in" ? (
        <button
          type="button"
          onClick={() => {
            openSettings("account");
          }}
          className="flex shrink-0 items-center gap-1.5 rounded px-1 py-0.5 transition-colors hover:bg-surface-hover hover:text-fg"
          title={auth.account.email}
        >
          <span className="rounded bg-accent-muted px-1 font-medium text-accent-fg uppercase">
            {auth.account.plan}
          </span>
          <span className="font-mono">
            {formatCents(auth.account.usageCents)}
            {auth.account.limitCents === null ? "" : ` / ${formatCents(auth.account.limitCents)}`}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void signIn()}
          className="shrink-0 rounded px-1 py-0.5 text-accent-fg transition-colors hover:bg-surface-hover"
        >
          {auth.status === "awaiting_authorization" ? "Waiting for browser…" : "Sign in"}
        </button>
      )}
    </footer>
  );
}
