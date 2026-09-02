/**
 * The permission mode picker.
 *
 * The four modes and their wording live in `lib/modes.ts`, shared with the settings
 * dialog so the two places that describe them cannot drift apart.
 *
 * Writing straight to settings rather than holding a per-turn override, because the mode
 * is a standing posture, not a property of one message: a user who switches to Plan
 * expects the next three prompts to plan too.
 *
 * Copyright (c) 2026 Origin AI
 */

import { Check, ChevronsUpDown } from "lucide-react";
import { DropdownMenu } from "radix-ui";

import { cn } from "../../lib/cn";
import { describeMode, PERMISSION_MODES } from "../../lib/modes";
import { useStore } from "../../store";

const MENU_SURFACE =
  "z-50 min-w-64 rounded-md border border-line-strong bg-surface-overlay p-1 shadow-xl shadow-black/40";
const MENU_ITEM =
  "flex cursor-default items-start gap-2 rounded px-2 py-1.5 text-xs outline-none select-none data-highlighted:bg-surface-hover";

export function ModePicker(): React.JSX.Element | null {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);

  if (settings === null) return null;

  const current = describeMode(settings.permissions.mode);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="flex h-6 shrink-0 items-center gap-1 rounded px-1.5 text-2xs text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg-muted data-[state=open]:bg-surface-active"
        title="What the agent may do without asking"
      >
        <current.Icon size={11} className="shrink-0" />
        <span>{current.label}</span>
        <ChevronsUpDown size={9} className="shrink-0 opacity-60" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" side="top" sideOffset={6} className={MENU_SURFACE}>
          {PERMISSION_MODES.map((entry) => (
            <DropdownMenu.Item
              key={entry.mode}
              className={MENU_ITEM}
              onSelect={() => {
                if (entry.mode === settings.permissions.mode) return;
                void updateSettings({
                  permissions: { ...settings.permissions, mode: entry.mode },
                });
              }}
            >
              <Check
                size={12}
                className={cn(
                  "mt-0.5 shrink-0",
                  entry.mode === settings.permissions.mode ? "text-accent-fg" : "opacity-0",
                )}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-fg">
                  <entry.Icon size={11} className="shrink-0 text-fg-subtle" />
                  {entry.label}
                </span>
                <span className="mt-0.5 block text-2xs leading-relaxed text-fg-subtle">
                  {entry.detail}
                </span>
              </span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
