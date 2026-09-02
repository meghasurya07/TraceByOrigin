/**
 * The token vault.
 *
 * One job: keep the account token somewhere the next launch can find it and a text
 * editor cannot. `safeStorage` gives us the OS keychain — Keychain on macOS, DPAPI on
 * Windows, libsecret on Linux — and we store only the ciphertext it returns.
 *
 * **When the OS cannot encrypt, we do not persist.** A Linux box with no keyring
 * unlocked is the common case, and `safeStorage.encryptString` there either throws or
 * silently uses a hardcoded key depending on version. Writing a plaintext token to
 * `~/.config` as a fallback would be worse than making the user sign in again, so the
 * vault degrades to memory-only and says so. The UI shows a one-line notice rather
 * than pretending it worked.
 *
 * Nothing here reaches the renderer. Main reads the token and hands it to the engine
 * as a provider key; the renderer only ever learns whether someone is signed in.
 *
 * Copyright (c) 2026 Origin AI
 */

import { readFileSync, writeFileSync, mkdirSync, unlinkSync } from "node:fs";
import path from "node:path";
import { safeStorage } from "electron";

/** Keys are namespaced so a future second credential does not collide. */
export const VAULT_KEYS = {
  accountToken: "account.token",
  accountRefreshToken: "account.refreshToken",
  /**
   * Expiry as a decimal ms-since-epoch string.
   *
   * Not a secret, but it is stored here anyway: keeping it beside the token means one
   * write, and a token whose expiry was lost in a partial write would be refreshed on
   * every launch. Encrypting a timestamp costs nothing.
   */
  accountTokenExpiresAt: "account.expiresAt",
} as const;

export interface Vault {
  /**
   * False when the OS declined to provide encryption. Values still work for the
   * lifetime of the process; they just will not survive a restart.
   */
  readonly persistent: boolean;
  get(key: string): string | null;
  set(key: string, value: string): void;
  delete(key: string): void;
  clear(): void;
}

/**
 * Must be called after `app.whenReady()`.
 *
 * `safeStorage.isEncryptionAvailable()` returns false before the app is ready on
 * Linux, and a vault opened too early would silently decide it is not persistent for
 * the rest of the session.
 */
export function openVault(userDataDir: string): Vault {
  const file = path.join(userDataDir, "vault.json");
  const persistent = safeStorage.isEncryptionAvailable();
  const memory = new Map<string, string>();

  /** key → base64 ciphertext. Read fresh on open, rewritten in full on every change. */
  let stored: Record<string, string> = {};
  if (persistent) {
    try {
      const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
      if (typeof parsed === "object" && parsed !== null) {
        stored = Object.fromEntries(
          Object.entries(parsed as Record<string, unknown>).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
          ),
        );
      }
    } catch {
      // Absent or unreadable. Either way there is no credential, which is a valid state.
    }
  }

  const persist = (): void => {
    if (!persistent) return;
    try {
      mkdirSync(path.dirname(file), { recursive: true });
      // Written synchronously and in full. It is a handful of bytes, and the one
      // caller that matters runs during sign-out, where an async write racing a quit
      // would leave the token on disk after the user asked us to forget it.
      writeFileSync(file, `${JSON.stringify(stored, null, 2)}\n`, {
        encoding: "utf8",
        mode: 0o600,
      });
    } catch {
      // Nothing useful to do. The token stays in memory for this session.
    }
  };

  return {
    persistent,

    get(key) {
      const live = memory.get(key);
      if (live !== undefined) return live;
      if (!persistent) return null;

      const ciphertext = stored[key];
      if (ciphertext === undefined) return null;
      try {
        const value = safeStorage.decryptString(Buffer.from(ciphertext, "base64"));
        memory.set(key, value);
        return value;
      } catch {
        // Encrypted under a different OS user, machine, or keychain. Not recoverable;
        // drop it so the next sign-in has a clean slate instead of failing forever.
        delete stored[key];
        persist();
        return null;
      }
    },

    set(key, value) {
      memory.set(key, value);
      if (!persistent) return;
      try {
        stored[key] = safeStorage.encryptString(value).toString("base64");
        persist();
      } catch {
        // Encryption was advertised and then failed. Keep the in-memory value.
      }
    },

    delete(key) {
      memory.delete(key);
      if (!persistent) return;
      delete stored[key];
      persist();
    },

    clear() {
      memory.clear();
      stored = {};
      if (!persistent) return;
      try {
        unlinkSync(file);
      } catch {
        // Already gone.
      }
    },
  };
}
