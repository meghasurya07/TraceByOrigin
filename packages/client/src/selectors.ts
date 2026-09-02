/**
 * Derived reads over `AppState` and `SessionView`.
 *
 * Kept out of the reducer because none of it is state: recomputing "can the user
 * pick this model" from auth plus the key list is cheaper and less wrong than
 * storing a flag that has to be invalidated whenever either input changes. The rule
 * this file follows is that a selector never allocates when nothing changed — a
 * filter that returns a fresh array on every render defeats `React.memo` on the one
 * component that most needs it.
 *
 * Copyright (c) 2026 Origin AI
 */

import type {
  ModelInfo,
  PermissionRequest,
  ProviderKeyStatus,
  TurnCost,
} from "@trace/protocol";

import type { AuthState, SessionView, TranscriptItem } from "./types.js";

// ---------------------------------------------------------------------------
// Model availability
// ---------------------------------------------------------------------------

/**
 * Display order for the picker's provider groups. Anthropic first because it is the
 * only one that works before sign-in, so a cold-start user sees something usable at
 * the top rather than four greyed rows.
 */
export const PROVIDER_ORDER: readonly string[] = ["anthropic", "openai", "google", "xai"];

export const PROVIDER_LABELS: Readonly<Record<string, string>> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  google: "Google",
  xai: "xAI",
};

export interface ModelAccess {
  /** Can the user select this right now. */
  usable: boolean;
  /** Reachable through the signed-in account. */
  account: boolean;
  /** Reachable with a provider key the user has already configured. */
  byok: boolean;
  /**
   * Why not, when `usable` is false. Drives the one-line hint under a greyed row.
   *
   * Greyed rather than hidden on purpose: a model that vanishes reads as a missing
   * feature, while a model you cannot click yet reads as an invitation to sign in.
   */
  blockedReason?: "sign_in_required" | "api_key_required" | "sign_in_or_api_key";
}

export function accessFor(
  model: ModelInfo,
  auth: AuthState,
  providerKeys: readonly ProviderKeyStatus[],
): ModelAccess {
  const signedIn = auth.status === "signed_in";
  const hasKey = providerKeys.some((k) => k.provider === model.provider && k.configured);

  const account = model.access.includes("account") && signedIn;
  const byok = model.access.includes("byok") && hasKey;
  if (account || byok) return { usable: true, account, byok };

  const couldAccount = model.access.includes("account");
  const couldByok = model.access.includes("byok");
  const blockedReason: NonNullable<ModelAccess["blockedReason"]> =
    couldAccount && couldByok
      ? "sign_in_or_api_key"
      : couldAccount
        ? "sign_in_required"
        : "api_key_required";

  return { usable: false, account: false, byok: false, blockedReason };
}

export function isModelUsable(
  model: ModelInfo,
  auth: AuthState,
  providerKeys: readonly ProviderKeyStatus[],
): boolean {
  return accessFor(model, auth, providerKeys).usable;
}

export interface ProviderGroup {
  provider: string;
  label: string;
  models: ModelInfo[];
}

/**
 * Group the catalog for the picker.
 *
 * Order *within* a group is the catalog's own, not sorted by price or name: the
 * engine's table already lists each provider's flagship first, and that hand-chosen
 * order is more useful than any mechanical one.
 */
export function modelsByProvider(models: readonly ModelInfo[]): ProviderGroup[] {
  const groups = new Map<string, ModelInfo[]>();
  for (const model of models) {
    const existing = groups.get(model.provider);
    if (existing === undefined) groups.set(model.provider, [model]);
    else existing.push(model);
  }

  const rank = (provider: string): number => {
    const i = PROVIDER_ORDER.indexOf(provider);
    return i === -1 ? PROVIDER_ORDER.length : i;
  };

  return [...groups.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([provider, grouped]) => ({
      provider,
      label: PROVIDER_LABELS[provider] ?? provider,
      models: grouped,
    }));
}

// ---------------------------------------------------------------------------
// Session reads
// ---------------------------------------------------------------------------

/**
 * Everything this session has cost, including the turn still running.
 *
 * The live turn's cost is deliberately not folded into `summary.cumulativeCost` by
 * the reducer — that field is the engine's persisted number, and adding to it
 * mid-turn would double-count when `turn_completed` lands.
 */
export function cumulativeCost(view: SessionView): TurnCost {
  const base = view.summary.cumulativeCost;
  const live = view.live?.cost;
  if (live === undefined) return base;

  return {
    usage: {
      inputTokens: base.usage.inputTokens + live.usage.inputTokens,
      outputTokens: base.usage.outputTokens + live.usage.outputTokens,
      cacheCreationInputTokens:
        base.usage.cacheCreationInputTokens + live.usage.cacheCreationInputTokens,
      cacheReadInputTokens: base.usage.cacheReadInputTokens + live.usage.cacheReadInputTokens,
    },
    requests: base.requests + live.requests,
    estimatedUsd: base.estimatedUsd + live.estimatedUsd,
  };
}

export function pendingPermission(view: SessionView): PermissionRequest | null {
  return view.live?.pendingPermission ?? null;
}

/**
 * What the transcript should actually render.
 *
 * Hides reasoning when the user has turned it off, and drops text blocks that never
 * received a delta — the model opens a content block before it decides to call a
 * tool instead of writing, which would otherwise leave an empty bubble above every
 * tool card.
 *
 * Returns `view.items` by reference when nothing is hidden, so the common case costs
 * no allocation and downstream memoization holds.
 */
export function visibleItems(
  view: SessionView,
  options: { showThinking: boolean },
): TranscriptItem[] {
  const hidden = (item: TranscriptItem): boolean =>
    (item.kind === "thinking" && !options.showThinking) ||
    (item.kind === "assistant_text" && item.text.length === 0);

  return view.items.some(hidden) ? view.items.filter((item) => !hidden(item)) : view.items;
}
