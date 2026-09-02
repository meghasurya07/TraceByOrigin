/**
 * The model picker.
 *
 * Grouped by provider, and every model in the catalog is listed — including the ones the
 * user cannot use yet, greyed with the one-line reason from `lib/model-hints.ts`.
 *
 * Selecting writes `defaultModel` to settings rather than holding a per-turn override.
 * A model choice is sticky in every tool of this kind, and a picker that silently reverts
 * after one message is a bug report waiting to happen.
 *
 * Copyright (c) 2026 Origin AI
 */

import { Check, ChevronsUpDown, Sparkles } from "lucide-react";
import { DropdownMenu } from "radix-ui";

import type { ModelInfo } from "@trace/protocol";
import type { ModelAccess } from "@trace/client";
import { accessFor, modelsByProvider } from "@trace/client";

import { cn } from "../../lib/cn";
import { formatContext } from "../../lib/format";
import { hintFor } from "../../lib/model-hints";
import { useStore } from "../../store";

const MENU_SURFACE =
  "z-50 max-h-[60vh] w-80 overflow-y-auto rounded-md border border-line-strong bg-surface-overlay p-1 shadow-xl shadow-black/40";

export function ModelPicker(): React.JSX.Element | null {
  const models = useStore((state) => state.models);
  const auth = useStore((state) => state.auth);
  const providerKeys = useStore((state) => state.providerKeys);
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  const openSettings = useStore((state) => state.openSettings);

  if (settings === null) return null;

  const selectedId = settings.defaultModel;
  const selected = models.find((model) => model.id === selectedId);
  const groups = modelsByProvider(models);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="flex h-6 min-w-0 shrink items-center gap-1 rounded px-1.5 text-2xs text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg data-[state=open]:bg-surface-active"
        title="Model"
      >
        <span className="truncate">{selected?.displayName ?? selectedId}</span>
        <ChevronsUpDown size={9} className="shrink-0 opacity-60" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" side="top" sideOffset={6} className={MENU_SURFACE}>
          {models.length === 0 ? (
            <p className="px-2 py-3 text-center text-2xs text-fg-subtle">
              The engine has not reported a model catalog yet.
            </p>
          ) : (
            groups.map((group) => (
              <DropdownMenu.Group key={group.provider}>
                <DropdownMenu.Label className="px-2 pt-2 pb-1 text-2xs font-medium text-fg-subtle">
                  {group.label}
                </DropdownMenu.Label>
                {group.models.map((model) => (
                  <ModelRow
                    key={model.id}
                    model={model}
                    access={accessFor(model, auth, providerKeys)}
                    selected={model.id === selectedId}
                    onSelect={() => {
                      void updateSettings({ defaultModel: model.id });
                    }}
                    onFix={() => {
                      openSettings("models");
                    }}
                  />
                ))}
              </DropdownMenu.Group>
            ))
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/**
 * One row.
 *
 * A blocked row is still a button — it opens model settings, which is where both of its
 * remedies live. A disabled row that swallows the click would leave the user with a
 * reason and no way to act on it.
 */
function ModelRow(props: {
  model: ModelInfo;
  access: ModelAccess;
  selected: boolean;
  onSelect: () => void;
  onFix: () => void;
}): React.JSX.Element {
  const { model, access } = props;
  const hint = hintFor(access);

  return (
    <DropdownMenu.Item
      className={cn(
        "flex cursor-default items-start gap-2 rounded px-2 py-1.5 text-xs outline-none select-none data-highlighted:bg-surface-hover",
        !access.usable && "opacity-60",
      )}
      onSelect={() => {
        if (access.usable) props.onSelect();
        else props.onFix();
      }}
    >
      <Check
        size={12}
        className={cn("mt-0.5 shrink-0", props.selected ? "text-accent-fg" : "opacity-0")}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-fg">{model.displayName}</span>
          {model.recommended === true ? (
            <span title="Recommended" className="flex shrink-0">
              <Sparkles size={9} className="text-accent-fg" />
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block truncate font-mono text-2xs text-fg-subtle">
          {hint ??
            `${formatContext(model.contextWindow)} ctx · $${model.inputUsdPerMTok.toFixed(2)}/$${model.outputUsdPerMTok.toFixed(2)} per Mtok`}
        </span>
      </span>
    </DropdownMenu.Item>
  );
}
