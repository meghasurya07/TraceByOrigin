/**
 * Why a model is not selectable, in one line.
 *
 * Shared by the prompt bar's picker and the settings dialog. Both list every model in the
 * catalog — including the ones the user cannot use yet — because a model that is *absent*
 * reads as a product limitation while a model that is greyed reads as an invitation:
 * "sign in to use this" is a sentence the user can act on.
 *
 * Copyright (c) 2026 Origin AI
 */

import type { ModelAccess } from "@trace/client";

export const BLOCKED_HINT: Readonly<Record<NonNullable<ModelAccess["blockedReason"]>, string>> = {
  sign_in_required: "Sign in to use this model",
  api_key_required: "Needs your own API key",
  sign_in_or_api_key: "Sign in, or add your own API key",
};

export function hintFor(access: ModelAccess): string | null {
  return access.blockedReason === undefined ? null : BLOCKED_HINT[access.blockedReason];
}
