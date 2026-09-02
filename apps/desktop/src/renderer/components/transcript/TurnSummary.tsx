/**
 * The end-of-turn footer.
 *
 * A hairline with numbers on it, not a card. The turn's *content* is what the user came
 * for; this is the receipt. It gets one line, right-aligned, in the quietest colour the
 * theme has — and it is still worth rendering, because "what did that cost" and "why
 * did it stop" are the two questions a coding agent's users ask most.
 *
 * `end_turn` is the normal ending and so has no label at all: labelling it would train
 * the eye to skip the row, and then the one turn that ended on `context_exceeded` would
 * be skipped too. Only abnormal reasons get a word, and only `error` and
 * `context_exceeded` get a colour.
 *
 * Copyright (c) 2026 Origin AI
 */

import { memo } from "react";
import { Coins, Flag, Timer } from "lucide-react";

import type { StopReason } from "@trace/protocol";
import type { ItemOf } from "@trace/client";

import { cn } from "../../lib/cn";
import { formatDiffStat, formatDuration, formatTokens, formatUsd } from "../../lib/format";

/**
 * Why the turn ended, in the user's words.
 *
 * `null` means "unremarkable — say nothing". `tool_use` is in that group because a turn
 * that stops on `tool_use` and then continues is the agent loop working: the user only
 * ever sees this reason on the *final* summary if the loop was cut short, and
 * `iteration_limit` covers that case with a clearer word.
 */
const REASON_LABEL: Readonly<Record<StopReason, string | null>> = {
  end_turn: null,
  tool_use: null,
  stop_sequence: null,
  pause_turn: "paused",
  max_tokens: "hit the output limit",
  refusal: "declined",
  context_exceeded: "ran out of context",
  cancelled: "stopped",
  iteration_limit: "hit the step limit",
  error: "failed",
};

const REASON_TINT: Readonly<Partial<Record<StopReason, string>>> = {
  error: "text-danger",
  context_exceeded: "text-warning",
  max_tokens: "text-warning",
};

export const TurnSummary = memo(function TurnSummary(props: {
  item: ItemOf<"turn_summary">;
}): React.JSX.Element {
  const { item } = props;
  const label = REASON_LABEL[item.stopReason];
  const tint = REASON_TINT[item.stopReason];
  const tokens = item.cost.usage.inputTokens + item.cost.usage.outputTokens;
  const cached = item.cost.usage.cacheReadInputTokens;
  const stat = totalStat(item.changes);

  return (
    <div className="mt-1 mb-3 flex items-center gap-2 border-t border-line/60 pt-1 text-2xs text-fg-subtle">
      {label === null ? null : (
        <span className={cn("flex shrink-0 items-center gap-1 font-medium", tint)}>
          <Flag size={9} />
          {label}
        </span>
      )}

      {stat === null ? null : (
        <span className="shrink-0 font-mono" title={`${String(item.changes.length)} file(s) changed`}>
          {formatDiffStat(stat.added, stat.removed)}
        </span>
      )}

      <span className="flex-1" />

      {item.durationMs <= 0 ? null : (
        <span className="flex shrink-0 items-center gap-1 font-mono">
          <Timer size={9} />
          {formatDuration(item.durationMs)}
        </span>
      )}

      <span
        className="shrink-0 font-mono"
        title={
          `${formatTokens(item.cost.usage.inputTokens)} in · ` +
          `${formatTokens(item.cost.usage.outputTokens)} out · ` +
          `${formatTokens(cached)} cached · ` +
          `${String(item.cost.requests)} request${item.cost.requests === 1 ? "" : "s"}`
        }
      >
        {formatTokens(tokens)} tok
      </span>

      {item.cost.estimatedUsd <= 0 ? null : (
        <span
          className="flex shrink-0 items-center gap-1 font-mono"
          title="Estimated from the model's list price"
        >
          <Coins size={9} />
          {formatUsd(item.cost.estimatedUsd)}
        </span>
      )}
    </div>
  );
});

function totalStat(
  changes: readonly { linesAdded: number; linesRemoved: number }[],
): { added: number; removed: number } | null {
  if (changes.length === 0) return null;
  let added = 0;
  let removed = 0;
  for (const change of changes) {
    added += change.linesAdded;
    removed += change.linesRemoved;
  }
  return added === 0 && removed === 0 ? null : { added, removed };
}
