/**
 * Settings and BYOK credentials.
 *
 * **Credential design.** v1 is bring-your-own-key, so the single most important
 * property is that a user's API key never ends up somewhere they didn't put it.
 * The engine therefore treats keys as *runtime state it is lent*, not state it
 * owns:
 *
 *   - keys live in memory for the life of the process, never in `settings.json`;
 *   - durable encrypted storage is the *client's* job — the desktop app uses
 *     Electron's `safeStorage` (OS keychain / DPAPI / libsecret) and re-sends the
 *     key over `settings/setProviderKey` on every engine start;
 *   - the CLI, which has no keychain, falls back to `ANTHROPIC_API_KEY` or a
 *     0600-mode `~/.trace/auth.json`;
 *   - nothing here ever returns a key over the protocol or writes one to a log.
 *     `ProviderKeyStatus` carries a 4-character tail and nothing more.
 *
 * That split keeps the OS-specific crypto in the one process that already has to
 * be platform-aware, and means a compromised engine log leaks nothing.
 *
 * Copyright (c) 2026 Origin AI
 */

import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  DEFAULT_PERMISSION_SETTINGS,
  type EngineSettings,
  type PermissionSettings,
  type ProviderKeyStatus,
} from "@trace/protocol";
import { Logger } from "./logger.js";
import { DEFAULT_MODEL } from "./models.js";

const log = new Logger("settings");

/** `~/.trace` — user-global engine state. Overridable for tests and portable installs. */
export function traceHome(): string {
  return process.env["TRACE_HOME"] ?? path.join(os.homedir(), ".trace");
}

export const DEFAULT_SETTINGS: EngineSettings = {
  defaultModel: DEFAULT_MODEL,
  permissions: DEFAULT_PERMISSION_SETTINGS,
  // 60 is far above what a healthy turn needs (most finish in 3-15) and far below
  // what a runaway loop would burn unbounded. A backstop, not a budget.
  maxIterationsPerTurn: 60,
  effort: "xhigh",
  showThinking: true,
  checkpointsEnabled: true,
};

/**
 * Providers the engine holds a credential for.
 *
 * Two, and there will only ever be two, because the engine speaks one wire format:
 *
 * - `anthropic` — the user's own key, sent straight to `api.anthropic.com`.
 * - `trace` — an account token for the Trace gateway, which speaks the same wire
 *   format and fans out to OpenAI, Google, and xAI server-side.
 *
 * Adding a fourth model vendor therefore adds nothing here. That is the point of the
 * arrangement: see the header of `models.ts`.
 */
export const KNOWN_PROVIDERS = ["anthropic", "trace"] as const;
export type KnownProvider = (typeof KNOWN_PROVIDERS)[number];

const ENV_VAR_BY_PROVIDER: Record<string, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  // For the CLI and CI, which have no keychain and no browser to run a device flow in.
  trace: "TRACE_ACCOUNT_TOKEN",
};

export class SettingsStore {
  private settings: EngineSettings = structuredClone(DEFAULT_SETTINGS);
  /** In-memory only. Never serialized by this class. */
  private readonly keys = new Map<string, string>();
  private readonly settingsPath: string;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(home: string = traceHome()) {
    this.settingsPath = path.join(home, "settings.json");
  }

  async load(): Promise<void> {
    await this.loadSettings();
    await this.loadFallbackCredentials();
  }

  get(): EngineSettings {
    return structuredClone(this.settings);
  }

  get permissions(): PermissionSettings {
    return this.settings.permissions;
  }

  /**
   * Shallow-merge a patch and persist.
   *
   * Shallow is correct here: `permissions` is replaced wholesale rather than
   * deep-merged, because silently merging rule arrays would make it impossible
   * to *remove* a rule.
   */
  async update(patch: Partial<EngineSettings>): Promise<EngineSettings> {
    this.settings = { ...this.settings, ...patch };
    await this.persist();
    return this.get();
  }

  // -----------------------------------------------------------------------
  // Credentials
  // -----------------------------------------------------------------------

  setKey(provider: string, apiKey: string): ProviderKeyStatus {
    const trimmed = apiKey.trim();
    if (trimmed === "") {
      this.keys.delete(provider);
      log.info(`Cleared API key for ${provider}`);
      return { provider, configured: false };
    }
    this.keys.set(provider, trimmed);
    // Length only — never the value, never a prefix long enough to be useful.
    log.info(`Stored API key for ${provider} in memory`, { length: trimmed.length });
    return this.status(provider);
  }

  deleteKey(provider: string): void {
    this.keys.delete(provider);
  }

  /** The actual secret. Only the provider client calls this. */
  getKey(provider: string): string | undefined {
    return this.keys.get(provider);
  }

  hasKey(provider: string): boolean {
    return this.keys.has(provider);
  }

  status(provider: string): ProviderKeyStatus {
    const key = this.keys.get(provider);
    if (!key) return { provider, configured: false };
    return { provider, configured: true, hint: key.slice(-4) };
  }

  allStatuses(): ProviderKeyStatus[] {
    return KNOWN_PROVIDERS.map((provider) => this.status(provider));
  }

  configuredProviders(): string[] {
    return [...this.keys.keys()];
  }

  // -----------------------------------------------------------------------
  // Persistence
  // -----------------------------------------------------------------------

  private async loadSettings(): Promise<void> {
    try {
      const raw = await readFile(this.settingsPath, "utf8");
      const parsed = JSON.parse(raw) as Partial<EngineSettings>;
      // Merge over defaults so a settings file written by an older build stays
      // valid when we add a field.
      this.settings = {
        ...DEFAULT_SETTINGS,
        ...parsed,
        permissions: parsed.permissions ?? DEFAULT_SETTINGS.permissions,
      };
      log.debug("Loaded settings", { path: this.settingsPath });
    } catch (cause) {
      if ((cause as NodeJS.ErrnoException).code !== "ENOENT") {
        // Corrupt settings should not brick the engine. Warn and run on defaults.
        log.warn("Could not read settings; using defaults", cause);
      }
      this.settings = structuredClone(DEFAULT_SETTINGS);
    }
  }

  /**
   * Pick up credentials for surfaces without a keychain.
   *
   * Precedence: env var wins over the file, because an explicitly exported
   * variable is the more deliberate act. A key later supplied by a client over
   * `settings/setProviderKey` overrides both.
   */
  private async loadFallbackCredentials(): Promise<void> {
    for (const provider of KNOWN_PROVIDERS) {
      const envVar = ENV_VAR_BY_PROVIDER[provider];
      const fromEnv = envVar ? process.env[envVar]?.trim() : undefined;
      if (fromEnv) {
        this.keys.set(provider, fromEnv);
        log.info(`Using ${provider} key from ${envVar}`);
      }
    }

    const authPath = path.join(path.dirname(this.settingsPath), "auth.json");
    try {
      const raw = await readFile(authPath, "utf8");
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      for (const [provider, value] of Object.entries(parsed)) {
        if (typeof value === "string" && value.trim() !== "" && !this.keys.has(provider)) {
          this.keys.set(provider, value.trim());
          log.info(`Using ${provider} key from auth.json`);
        }
      }
    } catch (cause) {
      if ((cause as NodeJS.ErrnoException).code !== "ENOENT") {
        log.warn("Could not read auth.json", cause);
      }
    }
  }

  /**
   * Serialize `settings.json`.
   *
   * Writes are serialized through a promise chain rather than fired in parallel:
   * two concurrent `update()` calls racing on the same file is how you get a
   * truncated JSON document and a user who loses their configuration.
   */
  private persist(): Promise<void> {
    const snapshot = structuredClone(this.settings);
    this.writeQueue = this.writeQueue.then(async () => {
      try {
        await mkdir(path.dirname(this.settingsPath), { recursive: true });
        await writeFile(this.settingsPath, JSON.stringify(snapshot, null, 2) + "\n", "utf8");
        // Settings hold no secrets, but they do encode the permission rules that
        // gate shell execution — not world-readable.
        await chmod(this.settingsPath, 0o600).catch(() => {
          // No-op on Windows; ACLs already restrict %USERPROFILE%.
        });
      } catch (cause) {
        log.error("Failed to persist settings", cause);
      }
    });
    return this.writeQueue;
  }
}
