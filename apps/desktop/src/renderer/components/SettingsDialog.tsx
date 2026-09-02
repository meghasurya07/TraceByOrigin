/**
 * Settings.
 *
 * Four sections, and the split is by *what the user came here to change*, not by which
 * process owns the value: Account (who you are and what it costs), Models (which brain
 * and whose key), Permissions (what it may do without asking), Advanced (everything that
 * is a number, a path, or a version string).
 *
 * Every control writes immediately. There is no Save button and no dirty state, because a
 * settings dialog with an unsaved buffer has to answer "what happens if I close it?" and
 * every possible answer is bad. `settings/update` is a merge patch, so a write here is a
 * one-field statement and never clobbers a field this dialog does not render.
 *
 * The dialog is not the owner of any of this — `host.settingsSection` is, which is why
 * `openSettings("models")` from a blocked model row lands on the right page. That link
 * matters more than it looks: an error whose remedy lives four clicks away is not a
 * remedy.
 *
 * Copyright (c) 2026 Origin AI
 */

import { useEffect, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import {
  Boxes,
  Check,
  CircleAlert,
  ExternalLink,
  Eye,
  EyeOff,
  FolderOpen,
  KeyRound,
  LoaderCircle,
  LogOut,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";

import type {
  EngineSettings,
  ModelInfo,
  PermissionRule,
  ProviderKeyStatus,
  ToolName,
} from "@trace/protocol";
import { TOOL_NAMES } from "@trace/protocol";
import type { Plan } from "@trace/client";
import { accessFor, modelsByProvider, PROVIDER_LABELS, PROVIDER_ORDER } from "@trace/client";

import type { HostState } from "../store";
import { bridge } from "../lib/bridge";
import { cn } from "../lib/cn";
import { formatCents, formatContext, formatRelative } from "../lib/format";
import { hintFor } from "../lib/model-hints";
import { PERMISSION_MODES } from "../lib/modes";
import { useStore } from "../store";

type Section = NonNullable<HostState["settingsSection"]>;

const SECTIONS: readonly { id: Section; label: string; Icon: typeof User }[] = [
  { id: "account", label: "Account", Icon: User },
  { id: "models", label: "Models", Icon: Boxes },
  { id: "permissions", label: "Permissions", Icon: ShieldCheck },
  { id: "advanced", label: "Advanced", Icon: SlidersHorizontal },
];

export function SettingsDialog(): React.JSX.Element {
  const section = useStore((state) => state.host.settingsSection);
  const closeSettings = useStore((state) => state.closeSettings);
  const openSettings = useStore((state) => state.openSettings);

  return (
    <Dialog.Root
      open={section !== null}
      onOpenChange={(next) => {
        if (!next) closeSettings();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content
          aria-label="Settings"
          className="animate-fade-in fixed top-1/2 left-1/2 z-50 flex h-[min(38rem,86vh)] w-[min(52rem,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-line-strong bg-surface-overlay shadow-2xl shadow-black/50 outline-none"
        >
          <nav className="flex w-44 shrink-0 flex-col gap-0.5 border-r border-line bg-surface p-2">
            <Dialog.Title className="px-2 py-1.5 text-xs font-medium text-fg">Settings</Dialog.Title>
            {SECTIONS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => {
                  openSettings(entry.id);
                }}
                className={cn(
                  "flex items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors",
                  entry.id === section
                    ? "bg-surface-active text-fg"
                    : "text-fg-muted hover:bg-surface-hover hover:text-fg",
                )}
              >
                <entry.Icon size={12} className="shrink-0" />
                {entry.label}
              </button>
            ))}
          </nav>

          <div className="min-w-0 flex-1 overflow-y-auto p-5">
            {section === "account" ? <AccountSection /> : null}
            {section === "models" ? <ModelsSection /> : null}
            {section === "permissions" ? <PermissionsSection /> : null}
            {section === "advanced" ? <AdvancedSection /> : null}
          </div>

          <Dialog.Close
            aria-label="Close settings"
            className="absolute top-2 right-2 flex size-6 items-center justify-center rounded text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
          >
            <X size={12} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

const BUTTON =
  "flex items-center gap-1.5 rounded border border-line-strong bg-surface px-2 py-1 text-2xs text-fg-muted transition-colors hover:border-line-strong hover:bg-surface-hover hover:text-fg disabled:opacity-50";
const PRIMARY =
  "flex items-center gap-1.5 rounded bg-accent px-2.5 py-1 text-2xs text-fg transition-colors hover:bg-accent-hover disabled:opacity-50";
const INPUT =
  "selectable min-w-0 rounded border border-line-strong bg-surface px-2 py-1 font-mono text-2xs text-fg outline-none focus:border-accent placeholder:text-fg-subtle";

function Group(props: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <section className="mb-6">
      <h3 className="text-xs font-medium text-fg">{props.title}</h3>
      {props.hint === undefined ? null : (
        <p className="mt-0.5 text-2xs leading-relaxed text-fg-subtle">{props.hint}</p>
      )}
      <div className="mt-2.5">{props.children}</div>
    </section>
  );
}

/** Label on the left, control on the right, hint under the label. */
function Row(props: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-2 last:border-b-0">
      <span className="min-w-0">
        <span className="block text-xs text-fg">{props.label}</span>
        {props.hint === undefined ? null : (
          <span className="mt-0.5 block text-2xs leading-relaxed text-fg-subtle">{props.hint}</span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-2">{props.children}</span>
    </div>
  );
}

function Toggle(props: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}): React.JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.checked}
      aria-label={props.label}
      onClick={() => {
        props.onChange(!props.checked);
      }}
      className={cn(
        "relative h-4 w-7 shrink-0 rounded-full transition-colors",
        props.checked ? "bg-accent" : "bg-surface-active",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-3 rounded-full bg-fg transition-all",
          props.checked ? "left-3.5" : "left-0.5",
        )}
      />
    </button>
  );
}

/** A tiny segmented control. Used where the set is small and every option is a word. */
function Segmented<T extends string>(props: {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (next: T) => void;
}): React.JSX.Element {
  return (
    <span className="flex overflow-hidden rounded border border-line-strong">
      {props.options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => {
            if (option.value !== props.value) props.onChange(option.value);
          }}
          className={cn(
            "px-2 py-1 text-2xs transition-colors",
            option.value === props.value
              ? "bg-surface-active text-fg"
              : "bg-surface text-fg-subtle hover:bg-surface-hover hover:text-fg-muted",
          )}
        >
          {option.label}
        </button>
      ))}
    </span>
  );
}

/** Re-renders once a second while `active`. Only mounted where a countdown is showing. */
function useTick(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1_000);
    return () => {
      clearInterval(timer);
    };
  }, [active]);
  return now;
}

// ---------------------------------------------------------------------------
// Account
// ---------------------------------------------------------------------------

const PLAN_LABEL: Readonly<Record<Plan, string>> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
  enterprise: "Enterprise",
};

/**
 * Who you are, and what it has cost.
 *
 * The signed-out copy names both paths — an account or your own key — because a wall that
 * only offers "Sign in" reads as a paywall on a tool the user has already installed.
 *
 * `awaiting_authorization` gets the most space of any state here, which is deliberate: the
 * single most common sign-in failure is a browser tab that never came to the front, so the
 * remedy for it ("Open the page again") has to be visible without scrolling, next to the
 * confirmation code that proves the tab belongs to this copy of Trace.
 */
function AccountSection(): React.JSX.Element {
  const auth = useStore((state) => state.auth);
  const signIn = useStore((state) => state.signIn);
  const cancelSignIn = useStore((state) => state.cancelSignIn);
  const signOut = useStore((state) => state.signOut);
  const refreshAccount = useStore((state) => state.refreshAccount);
  const openSettings = useStore((state) => state.openSettings);

  const [busy, setBusy] = useState(false);
  const run = (action: () => Promise<void>): void => {
    setBusy(true);
    void action().finally(() => {
      setBusy(false);
    });
  };

  const now = useTick(auth.status === "awaiting_authorization");

  if (auth.status === "awaiting_authorization") {
    const remaining = Math.max(0, auth.expiresAt - now);
    return (
      <Group
        title="Waiting for your browser"
        hint="Finish signing in on the page that just opened. This window will update on its own."
      >
        {auth.confirmationCode === undefined ? null : (
          <p className="mb-3 text-2xs text-fg-subtle">
            The page should show this code:{" "}
            <span className="selectable font-mono text-sm tracking-widest text-fg">
              {auth.confirmationCode}
            </span>
          </p>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={PRIMARY}
            onClick={() => {
              void bridge.openExternal(auth.verificationUri);
            }}
          >
            <ExternalLink size={11} />
            Open the page again
          </button>
          <button
            type="button"
            className={BUTTON}
            onClick={() => {
              run(cancelSignIn);
            }}
            disabled={busy}
          >
            Cancel
          </button>
          <span className="text-2xs text-fg-subtle">
            {remaining === 0
              ? "This request expired — cancel and try again."
              : `Expires in ${String(Math.ceil(remaining / 1_000))}s`}
          </span>
        </div>
      </Group>
    );
  }

  if (auth.status === "signed_in") {
    const { account } = auth;
    const fraction =
      account.limitCents === null || account.limitCents === 0
        ? null
        : Math.min(1, account.usageCents / account.limitCents);

    return (
      <>
        <Group title="Signed in">
          <Row label={account.displayName ?? account.email} hint={account.displayName === undefined ? undefined : account.email}>
            <span className="rounded border border-line-strong px-1.5 py-0.5 text-2xs text-fg-muted">
              {PLAN_LABEL[account.plan]}
            </span>
          </Row>
          <Row label="Usage this period" hint={`Resets ${formatRelative(account.periodEndsAt)}`}>
            <span className="font-mono text-2xs text-fg-muted">
              {formatCents(account.usageCents)}
              {account.limitCents === null ? "" : ` of ${formatCents(account.limitCents)}`}
            </span>
          </Row>
          {fraction === null ? null : (
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-active">
              <div
                className={cn("h-full rounded-full", fraction > 0.9 ? "bg-danger" : "bg-accent")}
                style={{ width: `${String(Math.round(fraction * 100))}%` }}
              />
            </div>
          )}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              className={BUTTON}
              onClick={() => {
                run(refreshAccount);
              }}
              disabled={busy}
            >
              <RefreshCw size={11} className={busy ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              className={BUTTON}
              onClick={() => {
                run(signOut);
              }}
              disabled={busy}
            >
              <LogOut size={11} />
              Sign out
            </button>
          </div>
        </Group>

        <Group
          title="Your own keys"
          hint="Signing in is not the only way to run a model. Keys you add yourself are used directly, and never counted against the usage above."
        >
          <button
            type="button"
            className={BUTTON}
            onClick={() => {
              openSettings("models");
            }}
          >
            <KeyRound size={11} />
            Manage API keys
          </button>
        </Group>
      </>
    );
  }

  return (
    <>
      {auth.status === "error" ? (
        <p className="mb-4 flex items-start gap-1.5 rounded border border-danger/40 bg-danger/10 px-2.5 py-2 text-2xs leading-relaxed text-danger">
          <CircleAlert size={11} className="mt-px shrink-0" />
          <span className="selectable min-w-0">{auth.message}</span>
        </p>
      ) : null}

      <Group
        title="Sign in to Trace"
        hint="An account gives you the hosted model catalog with usage billed per token — nothing to configure, and the same models on every machine you sign in on."
      >
        <button
          type="button"
          className={PRIMARY}
          onClick={() => {
            run(signIn);
          }}
          disabled={busy}
        >
          {busy ? <LoaderCircle size={11} className="animate-spin" /> : <User size={11} />}
          {auth.status === "error" ? "Try again" : "Sign in"}
        </button>
        <p className="mt-2 text-2xs text-fg-subtle">
          Opens your browser. Trace never sees your password, and the token it gets back is
          stored in your operating system&rsquo;s keychain.
        </p>
      </Group>

      <Group
        title="Or bring your own key"
        hint="Paste a provider key instead and Trace calls that provider directly, with no account and no gateway in the middle."
      >
        <button
          type="button"
          className={BUTTON}
          onClick={() => {
            openSettings("models");
          }}
        >
          <KeyRound size={11} />
          Add an API key
        </button>
      </Group>
    </>
  );
}

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

const EFFORTS: readonly { value: EngineSettings["effort"]; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "xhigh", label: "Higher" },
  { value: "max", label: "Max" },
];

/**
 * Which brain, and whose key.
 *
 * The model list here is the same list the prompt bar shows, gated the same way, because
 * two lists of models that disagree about what is available is the kind of bug users
 * report as "it forgot my model".
 */
function ModelsSection(): React.JSX.Element {
  const models = useStore((state) => state.models);
  const auth = useStore((state) => state.auth);
  const providerKeys = useStore((state) => state.providerKeys);
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);

  if (settings === null) return <Loading />;

  const groups = modelsByProvider(models);

  return (
    <>
      <Group
        title="Default model"
        hint="Used for every new turn. The picker in the prompt bar changes the same setting."
      >
        {groups.length === 0 ? (
          <p className="text-2xs text-fg-subtle">The engine has not reported a model catalog yet.</p>
        ) : (
          groups.map((group) => (
            <div key={group.provider} className="mb-3 last:mb-0">
              <p className="mb-1 text-2xs font-medium text-fg-subtle">{group.label}</p>
              {group.models.map((model) => (
                <ModelRow
                  key={model.id}
                  model={model}
                  hint={hintFor(accessFor(model, auth, providerKeys))}
                  selected={model.id === settings.defaultModel}
                  onSelect={() => {
                    void updateSettings({ defaultModel: model.id });
                  }}
                />
              ))}
            </div>
          ))
        )}
      </Group>

      <Group
        title="Reasoning effort"
        hint="How long the model is allowed to think before it answers. Higher settings cost more and are worth it for debugging and design work; Low is right for edits you have already decided on."
      >
        <Segmented
          value={settings.effort}
          options={EFFORTS}
          onChange={(effort) => {
            void updateSettings({ effort });
          }}
        />
      </Group>

      <Group
        title="API keys"
        hint="Stored in your operating system's keychain, held by the app and handed to the engine on your machine. A key is sent to the provider it belongs to and nowhere else."
      >
        {PROVIDER_ORDER.map((provider) => (
          <KeyRow
            key={provider}
            provider={provider}
            status={providerKeys.find((entry) => entry.provider === provider)}
          />
        ))}
      </Group>
    </>
  );
}

function Loading(): React.JSX.Element {
  return (
    <p className="flex items-center gap-2 text-2xs text-fg-subtle">
      <LoaderCircle size={11} className="animate-spin" />
      Reading settings from the engine…
    </p>
  );
}

/**
 * One model.
 *
 * A row the user cannot pick is disabled rather than clickable, because both of its
 * remedies are already on screen — the key fields are further down this page, and Account
 * is one item away in the rail.
 */
function ModelRow(props: {
  model: ModelInfo;
  hint: string | null;
  selected: boolean;
  onSelect: () => void;
}): React.JSX.Element {
  const { model } = props;
  return (
    <button
      type="button"
      disabled={props.hint !== null}
      onClick={props.onSelect}
      className={cn(
        "flex w-full items-start gap-2 rounded px-2 py-1.5 text-left transition-colors",
        props.hint === null ? "hover:bg-surface-hover" : "opacity-60",
      )}
    >
      <Check
        size={12}
        className={cn("mt-0.5 shrink-0", props.selected ? "text-accent-fg" : "opacity-0")}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-xs text-fg">{model.displayName}</span>
          {model.recommended === true ? (
            <span title="Recommended" className="flex shrink-0">
              <Sparkles size={9} className="text-accent-fg" />
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block truncate font-mono text-2xs text-fg-subtle">
          {props.hint ??
            `${formatContext(model.contextWindow)} ctx · $${model.inputUsdPerMTok.toFixed(2)}/$${model.outputUsdPerMTok.toFixed(2)} per Mtok`}
        </span>
      </span>
    </button>
  );
}

/**
 * One provider's key.
 *
 * A configured key shows its last four characters and nothing else — enough to tell two
 * keys apart, useless to anyone reading over a shoulder. The reveal toggle applies only to
 * what the user is typing right now, because there is nothing to reveal afterwards: the
 * key is in the keychain and the renderer never gets it back.
 */
function KeyRow(props: { provider: string; status?: ProviderKeyStatus }): React.JSX.Element {
  const setProviderKey = useStore((state) => state.setProviderKey);
  const deleteProviderKey = useStore((state) => state.deleteProviderKey);

  const [value, setValue] = useState("");
  const [editing, setEditing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);

  const label = PROVIDER_LABELS[props.provider] ?? props.provider;
  const configured = props.status?.configured === true;

  const save = (): void => {
    const key = value.trim();
    if (key === "") return;
    setBusy(true);
    void setProviderKey(props.provider, key).finally(() => {
      setValue("");
      setEditing(false);
      setRevealed(false);
      setBusy(false);
    });
  };

  if (configured && !editing) {
    return (
      <Row label={label} hint={props.status?.validated === false ? "This key was rejected by the provider." : undefined}>
        <span className="font-mono text-2xs text-fg-subtle">
          ••••{props.status?.hint ?? ""}
        </span>
        <button
          type="button"
          className={BUTTON}
          onClick={() => {
            setEditing(true);
          }}
        >
          Replace
        </button>
        <button
          type="button"
          aria-label={`Remove the ${label} key`}
          title="Remove"
          className={BUTTON}
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void deleteProviderKey(props.provider).finally(() => {
              setBusy(false);
            });
          }}
        >
          <Trash2 size={11} />
        </button>
      </Row>
    );
  }

  return (
    <Row label={label}>
      <input
        value={value}
        type={revealed ? "text" : "password"}
        spellCheck={false}
        autoComplete="off"
        placeholder="Paste a key"
        onChange={(event) => {
          setValue(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            save();
          }
          if (event.key === "Escape" && configured) {
            event.preventDefault();
            setEditing(false);
            setValue("");
          }
        }}
        className={cn(INPUT, "w-56")}
      />
      <button
        type="button"
        aria-label={revealed ? "Hide the key" : "Show the key"}
        title={revealed ? "Hide" : "Show"}
        className={BUTTON}
        onClick={() => {
          setRevealed(!revealed);
        }}
      >
        {revealed ? <EyeOff size={11} /> : <Eye size={11} />}
      </button>
      <button type="button" className={PRIMARY} onClick={save} disabled={busy || value.trim() === ""}>
        {busy ? <LoaderCircle size={11} className="animate-spin" /> : null}
        Save
      </button>
    </Row>
  );
}

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

const ACTION_TINT: Readonly<Record<PermissionRule["action"], string>> = {
  allow: "text-success",
  ask: "text-warning",
  deny: "text-danger",
};

/**
 * What the agent may do without asking.
 *
 * Two controls that answer the same question at different resolutions: the mode is the
 * standing posture, the rules are the exceptions. Rules are shown in evaluation order
 * because that is what decides the outcome, and a list sorted by anything else would be a
 * lie about how it behaves.
 */
function PermissionsSection(): React.JSX.Element {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);

  if (settings === null) return <Loading />;

  const { permissions } = settings;
  const write = (rules: PermissionRule[]): void => {
    void updateSettings({ permissions: { ...permissions, rules } });
  };

  return (
    <>
      <Group title="Mode">
        {PERMISSION_MODES.map((entry) => (
          <button
            key={entry.mode}
            type="button"
            onClick={() => {
              if (entry.mode === permissions.mode) return;
              void updateSettings({ permissions: { ...permissions, mode: entry.mode } });
            }}
            className="flex w-full items-start gap-2 rounded px-2 py-1.5 text-left transition-colors hover:bg-surface-hover"
          >
            <Check
              size={12}
              className={cn(
                "mt-0.5 shrink-0",
                entry.mode === permissions.mode ? "text-accent-fg" : "opacity-0",
              )}
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-xs text-fg">
                <entry.Icon size={11} className="shrink-0 text-fg-subtle" />
                {entry.label}
              </span>
              <span className="mt-0.5 block text-2xs leading-relaxed text-fg-subtle">
                {entry.detail}
              </span>
            </span>
          </button>
        ))}
      </Group>

      <Group
        title="Rules"
        hint="Checked in order, first match wins — except that any deny match wins outright. The pattern is a workspace-relative glob for file tools, and the command string for the terminal."
      >
        {permissions.rules.length === 0 ? (
          <p className="text-2xs text-fg-subtle">No rules. The mode above decides everything.</p>
        ) : (
          <ul className="mb-2">
            {permissions.rules.map((rule, index) => (
              <li
                key={`${rule.tool}:${rule.pattern ?? ""}:${rule.action}:${String(index)}`}
                className="flex items-center gap-2 border-b border-line py-1 last:border-b-0"
              >
                <span className={cn("w-12 shrink-0 text-2xs font-medium", ACTION_TINT[rule.action])}>
                  {rule.action}
                </span>
                <span className="w-32 shrink-0 truncate font-mono text-2xs text-fg-muted">
                  {rule.tool}
                </span>
                <span className="selectable min-w-0 flex-1 truncate font-mono text-2xs text-fg-subtle">
                  {rule.pattern ?? "(any)"}
                </span>
                <button
                  type="button"
                  aria-label="Remove this rule"
                  title="Remove"
                  className="flex size-5 shrink-0 items-center justify-center rounded text-fg-subtle transition-colors hover:bg-surface-hover hover:text-danger"
                  onClick={() => {
                    write(permissions.rules.filter((_, i) => i !== index));
                  }}
                >
                  <Trash2 size={10} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <RuleForm
          onAdd={(rule) => {
            write([...permissions.rules, rule]);
          }}
        />

        <p className="mt-3 text-2xs leading-relaxed text-fg-subtle">
          A handful of commands are refused no matter what these rules say — deleting the
          filesystem root or your home directory, and rewriting Git history. Those are not
          configurable, in any mode.
        </p>
      </Group>
    </>
  );
}

/**
 * The add-a-rule row.
 *
 * `deny` is not the default action here. The default is `allow`, because that is why people
 * come to this list: the agent asked about `pnpm test` for the fourth time and they want it
 * to stop. Defaulting to `deny` would make the common case a two-step.
 */
function RuleForm(props: { onAdd: (rule: PermissionRule) => void }): React.JSX.Element {
  const [action, setAction] = useState<PermissionRule["action"]>("allow");
  const [tool, setTool] = useState<ToolName | "*">("run_terminal_cmd");
  const [pattern, setPattern] = useState("");

  const add = (): void => {
    const trimmed = pattern.trim();
    props.onAdd({ tool, action, ...(trimmed === "" ? {} : { pattern: trimmed }) });
    setPattern("");
  };

  return (
    <div className="flex items-center gap-1.5">
      <select
        aria-label="Action"
        value={action}
        onChange={(event) => {
          setAction(event.target.value as PermissionRule["action"]);
        }}
        className={cn(INPUT, "w-16")}
      >
        <option value="allow">allow</option>
        <option value="ask">ask</option>
        <option value="deny">deny</option>
      </select>
      <select
        aria-label="Tool"
        value={tool}
        onChange={(event) => {
          setTool(event.target.value as ToolName | "*");
        }}
        className={cn(INPUT, "w-36")}
      >
        <option value="*">* (any tool)</option>
        {TOOL_NAMES.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <input
        value={pattern}
        spellCheck={false}
        placeholder="pattern, e.g. pnpm test*"
        onChange={(event) => {
          setPattern(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            add();
          }
        }}
        className={cn(INPUT, "flex-1")}
      />
      <button type="button" className={BUTTON} onClick={add}>
        <Plus size={11} />
        Add
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Advanced
// ---------------------------------------------------------------------------

/**
 * Everything that is a number, a path, or a version string.
 *
 * The version block is here rather than in an About dialog because the only reason anyone
 * reads it is to paste it into a bug report, and a bug report is not a moment to go
 * hunting through menus.
 */
function AdvancedSection(): React.JSX.Element {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  const info = useStore((state) => state.host.info);
  const engine = useStore((state) => state.engine);
  const restartEngine = useStore((state) => state.restartEngine);

  if (settings === null) return <Loading />;

  return (
    <>
      <Group title="The turn">
        <Row
          label="Show thinking"
          hint="Reasoning blocks appear in the transcript, collapsed. Turning this off hides them; it does not stop the model from thinking."
        >
          <Toggle
            label="Show thinking"
            checked={settings.showThinking}
            onChange={(showThinking) => {
              void updateSettings({ showThinking });
            }}
          />
        </Row>
        <Row
          label="Checkpoints"
          hint="Snapshot changed files before each edit so a turn can be undone. Costs a little disk and nothing else."
        >
          <Toggle
            label="Checkpoints"
            checked={settings.checkpointsEnabled}
            onChange={(checkpointsEnabled) => {
              void updateSettings({ checkpointsEnabled });
            }}
          />
        </Row>
        <Row
          label="Steps per turn"
          hint="How many tool calls the agent may make before it has to stop and report. A runaway loop hits this instead of your bill."
        >
          <NumberField
            value={settings.maxIterationsPerTurn}
            min={1}
            max={500}
            onCommit={(maxIterationsPerTurn) => {
              void updateSettings({ maxIterationsPerTurn });
            }}
          />
        </Row>
      </Group>

      <Group
        title="Engine"
        hint="Trace runs a local engine process that owns your files, Git, terminals, and the index. Restarting it drops any turn in flight and keeps your sessions."
      >
        <Row
          label="Status"
          hint={
            engine.phase === "ready"
              ? `Engine ${engine.engineVersion}, protocol ${String(engine.protocolVersion)}`
              : engine.phase === "restarting"
                ? engine.lastError
                : engine.phase === "failed"
                  ? engine.error
                  : undefined
          }
        >
          <span
            className={cn(
              "text-2xs",
              engine.phase === "ready"
                ? "text-success"
                : engine.phase === "failed"
                  ? "text-danger"
                  : "text-warning",
            )}
          >
            {engine.phase}
          </span>
          <button
            type="button"
            className={BUTTON}
            onClick={() => {
              void restartEngine();
            }}
          >
            <RotateCcw size={11} />
            Restart
          </button>
        </Row>
        {info === null ? null : (
          <Row label="Data folder" hint={info.homeDir}>
            <button
              type="button"
              className={BUTTON}
              onClick={() => {
                void bridge.revealPath(info.homeDir);
              }}
            >
              <FolderOpen size={11} />
              Reveal
            </button>
          </Row>
        )}
      </Group>

      {info === null ? null : (
        <Group title="About" hint="Worth pasting into a bug report.">
          <dl className="grid grid-cols-[8rem_1fr] gap-y-1 text-2xs">
            <Fact label="Trace" value={`${info.appVersion}${info.isPackaged ? "" : " (dev)"}`} />
            <Fact label="Platform" value={info.platform} />
            <Fact label="Electron" value={info.electronVersion} />
            <Fact label="Chromium" value={info.chromeVersion} />
            <Fact label="Node" value={info.nodeVersion} />
          </dl>
        </Group>
      )}
    </>
  );
}

function Fact(props: { label: string; value: string }): React.JSX.Element {
  return (
    <>
      <dt className="text-fg-subtle">{props.label}</dt>
      <dd className="selectable font-mono text-fg-muted">{props.value}</dd>
    </>
  );
}

/**
 * A number that is only written when the user is done typing.
 *
 * Committing on every keystroke would send `settings/update` for the intermediate `2` on
 * the way from `20` to `25`, and for the empty string in between — one of which is a real
 * setting the engine would honour for a moment.
 */
function NumberField(props: {
  value: number;
  min: number;
  max: number;
  onCommit: (next: number) => void;
}): React.JSX.Element {
  const [draft, setDraft] = useState(() => String(props.value));

  // Follows the store when the value changes underneath us — another window, or a failed
  // write that rolled back — but only while the field is not being edited.
  const editing = useRef(false);
  useEffect(() => {
    if (!editing.current) setDraft(String(props.value));
  }, [props.value]);

  const commit = (): void => {
    editing.current = false;
    const parsed = Number.parseInt(draft, 10);
    if (Number.isNaN(parsed)) {
      setDraft(String(props.value));
      return;
    }
    const clamped = Math.min(props.max, Math.max(props.min, parsed));
    setDraft(String(clamped));
    if (clamped !== props.value) props.onCommit(clamped);
  };

  return (
    <input
      value={draft}
      inputMode="numeric"
      aria-label="Steps per turn"
      onFocus={() => {
        editing.current = true;
      }}
      onChange={(event) => {
        setDraft(event.target.value);
      }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      className={cn(INPUT, "w-16 text-right")}
    />
  );
}
