/**
 * The four permission modes, described once.
 *
 * Both the prompt bar's picker and the settings dialog present this list, and they must
 * agree: a user who reads "still asks before running commands" in settings and then sees
 * a different sentence in the picker has been given two contradictory promises about what
 * the agent is allowed to do to their machine. One array, imported twice.
 *
 * The wording is the important part. `yolo` is the honest internal name and a terrible
 * thing to put in a menu the user clicks by accident, so it reads as "Full access" with
 * the consequence spelled out. Every `detail` answers exactly one question — what the
 * agent may do *without asking* — because that is the only question this control answers.
 *
 * Copyright (c) 2026 Origin AI
 */

import { Map, ShieldCheck, SquarePen, Zap } from "lucide-react";

import type { PermissionMode } from "@trace/protocol";

export interface ModeDescriptor {
  mode: PermissionMode;
  label: string;
  detail: string;
  Icon: typeof ShieldCheck;
}

export const PERMISSION_MODES: readonly ModeDescriptor[] = [
  {
    mode: "plan",
    label: "Plan",
    detail: "Reads and researches. Will not edit or run anything.",
    Icon: Map,
  },
  {
    mode: "ask",
    label: "Ask",
    detail: "Asks before every edit and every command.",
    Icon: ShieldCheck,
  },
  {
    mode: "auto_edit",
    label: "Agent",
    detail: "Edits files on its own. Still asks before running commands.",
    Icon: SquarePen,
  },
  {
    mode: "yolo",
    label: "Full access",
    detail:
      "Edits and runs commands without asking. Guardrails still block secrets and destructive commands.",
    Icon: Zap,
  },
];

/** The mode a malformed or unknown setting falls back to. Never the permissive one. */
export const FALLBACK_MODE: ModeDescriptor = PERMISSION_MODES[1] ?? {
  mode: "ask",
  label: "Ask",
  detail: "Asks before every edit and every command.",
  Icon: ShieldCheck,
};

export function describeMode(mode: PermissionMode): ModeDescriptor {
  return PERMISSION_MODES.find((entry) => entry.mode === mode) ?? FALLBACK_MODE;
}
