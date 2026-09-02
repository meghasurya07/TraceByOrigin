/**
 * Model catalog.
 *
 * Hardcoded rather than fetched because the engine must be able to price a turn
 * and pick a default while completely offline, and because `/v1/models` does not
 * return pricing. Rates are USD per million tokens.
 *
 * **Two ways to reach a model, and only one wire format.** In *account* mode the call
 * goes to the Trace gateway with the user's account token, and the gateway fans out to
 * OpenAI, Google, or xAI on our side. In *BYOK* mode it goes straight to the provider
 * with the user's own key. The engine implements exactly two providers — `anthropic`
 * and `gateway` — because teaching it four SDKs would mean four streaming parsers, four
 * tool-call encodings, and four places for a bug to hide. Adding a model is a row in
 * this table plus a mapping in the gateway; the desktop app never changes.
 *
 * That is also why `access` is `["account"]` for everything non-Anthropic. It is not a
 * commercial gate — it is a statement about which code path exists.
 *
 * Showing accurate per-turn cost is a feature, not a nicety: it is the direct answer to
 * the loudest complaint about the incumbents, which is not "it forgets things" but
 * "I cannot tell what I am being charged for."
 *
 * Copyright (c) 2026 Origin AI
 */

import type { ModelInfo, TokenUsage } from "@trace/protocol";

export const DEFAULT_MODEL = "claude-opus-5";

/**
 * The agent loop's default. Kept separate from `DEFAULT_MODEL` so cheap
 * background work (title generation, commit messages) can be routed to a small
 * model without touching the user's choice for actual coding.
 */
export const UTILITY_MODEL = "claude-haiku-4-5";

/**
 * `maxOutputTokens` on non-Anthropic entries is deliberately conservative.
 *
 * The engine sends it as the request's output ceiling, and the gateway clamps to the
 * provider's real limit anyway. Guessing low costs at most a shorter reply on an unusual
 * turn; guessing high is a hard 400 that the user reads as "Trace is broken".
 */
export const MODELS: readonly ModelInfo[] = [
  // --- Anthropic. The only provider reachable with the user's own key, because it is
  //     the one whose wire format the engine speaks natively.
  {
    id: "claude-opus-5",
    provider: "anthropic",
    displayName: "Claude Opus 5",
    contextWindow: 1_000_000,
    maxOutputTokens: 128_000,
    inputUsdPerMTok: 5,
    outputUsdPerMTok: 25,
    supportsThinking: true,
    supportsVision: true,
    access: ["account", "byok"],
    recommended: true,
  },
  {
    id: "claude-sonnet-5",
    provider: "anthropic",
    displayName: "Claude Sonnet 5",
    contextWindow: 1_000_000,
    maxOutputTokens: 128_000,
    inputUsdPerMTok: 2,
    outputUsdPerMTok: 10,
    supportsThinking: true,
    supportsVision: true,
    access: ["account", "byok"],
  },
  {
    id: "claude-opus-4-8",
    provider: "anthropic",
    displayName: "Claude Opus 4.8",
    contextWindow: 1_000_000,
    maxOutputTokens: 128_000,
    inputUsdPerMTok: 5,
    outputUsdPerMTok: 25,
    supportsThinking: true,
    supportsVision: true,
    access: ["account", "byok"],
  },
  {
    id: "claude-haiku-4-5",
    provider: "anthropic",
    displayName: "Claude Haiku 4.5",
    contextWindow: 200_000,
    maxOutputTokens: 64_000,
    inputUsdPerMTok: 1,
    outputUsdPerMTok: 5,
    supportsThinking: false,
    supportsVision: true,
    access: ["account", "byok"],
  },

  // --- OpenAI, via the gateway. Prices are the ≤200k-prompt standard tier.
  {
    id: "gpt-5.6-sol",
    provider: "openai",
    displayName: "GPT-5.6 Sol",
    contextWindow: 1_050_000,
    maxOutputTokens: 128_000,
    inputUsdPerMTok: 4,
    outputUsdPerMTok: 20,
    supportsThinking: true,
    supportsVision: true,
    access: ["account"],
    recommended: true,
  },
  {
    id: "gpt-5.6-terra",
    provider: "openai",
    displayName: "GPT-5.6 Terra",
    contextWindow: 1_050_000,
    maxOutputTokens: 128_000,
    inputUsdPerMTok: 2,
    outputUsdPerMTok: 12,
    supportsThinking: true,
    supportsVision: true,
    access: ["account"],
  },
  {
    id: "gpt-5.6-luna",
    provider: "openai",
    displayName: "GPT-5.6 Luna",
    contextWindow: 1_050_000,
    maxOutputTokens: 128_000,
    inputUsdPerMTok: 0.2,
    outputUsdPerMTok: 1.2,
    supportsThinking: true,
    supportsVision: true,
    access: ["account"],
  },

  // --- Google, via the gateway. Flash pricing is promotional through 2026-12-31 and
  //     doubles on 2027-01-01; revisit this table then rather than surprising anyone.
  {
    id: "gemini-3.1-pro-preview",
    provider: "google",
    displayName: "Gemini 3.1 Pro",
    contextWindow: 1_000_000,
    maxOutputTokens: 65_536,
    inputUsdPerMTok: 2,
    outputUsdPerMTok: 12,
    supportsThinking: true,
    supportsVision: true,
    access: ["account"],
    recommended: true,
  },
  {
    id: "gemini-3.7-flash",
    provider: "google",
    displayName: "Gemini 3.7 Flash",
    contextWindow: 1_000_000,
    maxOutputTokens: 65_536,
    inputUsdPerMTok: 0.75,
    outputUsdPerMTok: 3.75,
    supportsThinking: true,
    supportsVision: true,
    access: ["account"],
  },

  // --- xAI, via the gateway. Both rates double at or above a 200k-token prompt, which
  //     the gateway meters; this table prices the common case.
  {
    id: "grok-4.6",
    provider: "xai",
    displayName: "Grok 4.6",
    contextWindow: 500_000,
    maxOutputTokens: 32_768,
    inputUsdPerMTok: 2,
    outputUsdPerMTok: 6,
    supportsThinking: true,
    supportsVision: true,
    access: ["account"],
    recommended: true,
  },
];

const BY_ID = new Map(MODELS.map((m) => [m.id, m]));

export function getModel(id: string): ModelInfo | undefined {
  return BY_ID.get(id);
}

/**
 * Resolve a caller-supplied id to a real model, falling back to the default.
 *
 * Never throws: a stale model id in a persisted session should degrade to the
 * default, not make the session unopenable.
 */
export function resolveModel(id: string | undefined): ModelInfo {
  if (id) {
    const found = BY_ID.get(id);
    if (found) return found;
  }
  // Non-null: DEFAULT_MODEL is an entry in MODELS, enforced by the test suite.
  return BY_ID.get(DEFAULT_MODEL)!;
}

export function emptyUsage(): TokenUsage {
  return {
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationInputTokens: 0,
    cacheReadInputTokens: 0,
  };
}

export function addUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cacheCreationInputTokens: a.cacheCreationInputTokens + b.cacheCreationInputTokens,
    cacheReadInputTokens: a.cacheReadInputTokens + b.cacheReadInputTokens,
  };
}

/**
 * Price a usage record.
 *
 * The cache multipliers are the published ones: a cache *write* costs 1.25x the
 * base input rate, a cache *read* costs 0.1x. Surfacing this split is the point —
 * it is what makes "your prompt cache is working" legible instead of a mystery.
 */
export function estimateUsd(usage: TokenUsage, model: ModelInfo): number {
  const inRate = model.inputUsdPerMTok / 1_000_000;
  const outRate = model.outputUsdPerMTok / 1_000_000;

  return (
    usage.inputTokens * inRate +
    usage.cacheCreationInputTokens * inRate * 1.25 +
    usage.cacheReadInputTokens * inRate * 0.1 +
    usage.outputTokens * outRate
  );
}

/** Fraction of billable input that came from cache. The number to watch in the UI. */
export function cacheHitRate(usage: TokenUsage): number {
  const total = usage.inputTokens + usage.cacheCreationInputTokens + usage.cacheReadInputTokens;
  return total === 0 ? 0 : usage.cacheReadInputTokens / total;
}
