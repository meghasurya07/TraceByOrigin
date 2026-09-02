/**
 * Sign-in, and the account token's whole life.
 *
 * ## The flow
 *
 * OAuth 2.0 authorization code with PKCE (RFC 7636), initiated in the system browser
 * and returned through the `trace://` protocol handler. This is what Cursor, the GitHub
 * CLI, the Vercel CLI, and the Stripe CLI all do, and it is the flow the OAuth working
 * group recommends for native apps (RFC 8252). Concretely:
 *
 * 1. Generate a verifier, its S256 challenge, and a single-use `state`.
 * 2. Open the system browser at the gateway's `/auth/desktop` with the challenge.
 * 3. The gateway hands off to **WorkOS AuthKit** — Google, GitHub, email OTP now;
 *    SAML/OIDC SSO and SCIM directory sync for teams later, with no client change.
 * 4. AuthKit returns to the gateway, which resolves the WorkOS user, upserts our own
 *    user row, mints a Trace access/refresh pair, and redirects to
 *    `trace://auth/callback?code=…&state=…`.
 * 5. We verify `state`, exchange the code with the verifier, and store the pair.
 *
 * The browser is the system browser, never an embedded window. An in-app `BrowserWindow`
 * pointed at an identity provider is the pattern that makes password managers useless
 * and makes it impossible for the user to check the address bar; it is also explicitly
 * called out against in RFC 8252 §8.12.
 *
 * A **polling fallback** exists for the case where the OS never delivers the deep link:
 * a Linux install whose `.desktop` file was not registered, or a Windows machine where
 * another app claimed `trace://`. Without it, sign-in on those machines simply hangs
 * forever with no diagnosis.
 *
 * ## The three rules
 *
 * 1. **The renderer never sees a token.** It gets `AuthState`, which by construction
 *    cannot carry one. Main reads the keychain and hands the token to the engine.
 * 2. **The token is re-seeded on every engine start.** The engine keeps credentials in
 *    memory only, so a respawn starts with none. `EngineHost.onReady` calls back here.
 * 3. **Refresh happens before expiry, not after a failure.** A 401 mid-turn has already
 *    cost the user the turn, so we refresh on a timer at 80% of the token's lifetime and
 *    treat reactive refresh as the backstop.
 *
 * Copyright (c) 2026 Origin AI
 */

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { AccountInfo, AuthState, Plan } from "@trace/client";

import { VAULT_KEYS, type Vault } from "./vault.js";

/**
 * Where the gateway lives.
 *
 * `TRACE_GATEWAY_URL` overrides it, which is how you point the app at a gateway on
 * localhost. The default host is a placeholder until the domain is registered — it is
 * the one string in this file that is not yet real.
 */
export const GATEWAY_URL = normalizeBase(
  process.env["TRACE_GATEWAY_URL"] ?? "https://api.trace.origin.ai",
);

/** Our protocol handler. Registered in `index.ts` and in `electron-builder.yml`. */
export const CALLBACK_URL = "trace://auth/callback";

/**
 * A public client id, and there is no secret to go with it.
 *
 * A desktop binary cannot keep a secret — `strings` finds it — so PKCE is what proves
 * the token request came from the same process that started the flow.
 */
const CLIENT_ID = "trace-desktop";

const SCOPE = "account models usage memory";

/** How long the browser has. Matches the gateway's own authorization-request TTL. */
const AUTHORIZE_TTL_MS = 10 * 60_000;

/** Fallback poll cadence, used only until the deep link arrives. */
const POLL_INTERVAL_MS = 2_000;

/** Refresh at this fraction of the token's lifetime. */
const REFRESH_AT = 0.8;
/** Never schedule a refresh sooner than this, whatever the server claims. */
const MIN_REFRESH_MS = 30_000;

const FETCH_TIMEOUT_MS = 20_000;

// ---------------------------------------------------------------------------
// Wire shapes
// ---------------------------------------------------------------------------

/** `POST /auth/desktop/start` — registers the challenge, returns where to send the user. */
interface AuthorizeResponse {
  authorizationUrl: string;
  /** Echoed on the browser page so the user can confirm the tab is ours. */
  confirmationCode?: string;
  expiresIn?: number;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

interface OAuthErrorResponse {
  error: string;
  error_description?: string;
}

/** A token plus everything needed to decide when to replace it. */
interface Credential {
  accessToken: string;
  refreshToken: string | null;
  /** ms since epoch, or null when the server declined to say. */
  expiresAt: number | null;
}

/** The half of a sign-in attempt that must not leave this process. */
interface PendingAuthorization {
  state: string;
  verifier: string;
  expiresAt: number;
  settle: (outcome: { code: string } | { error: Error }) => void;
}

export interface AuthControllerOptions {
  vault: Vault;
  /** Push the token into the engine, or clear it. `null` means signed out. */
  applyToken: (token: string | null) => Promise<void>;
  /** Every state transition, for the renderer. */
  onState: (state: AuthState) => void;
  /** Hand a URL to the system browser. Injected so this file never imports `shell`. */
  openBrowser: (url: string) => Promise<void>;
  onLog?: (line: string) => void;
  gatewayUrl?: string;
}

/**
 * Thrown for anything the user should read. Everything else is logged and surfaced as a
 * generic failure — a stack trace in a sign-in dialog helps nobody.
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class AuthController {
  #state: AuthState = { status: "signed_out" };
  #credential: Credential | null = null;
  #account: AccountInfo | null = null;
  #refreshTimer: NodeJS.Timeout | null = null;
  #pending: PendingAuthorization | null = null;
  #pollTimer: NodeJS.Timeout | null = null;
  /** Deduplicates concurrent refreshes — the timer and a 401 can fire together. */
  #refreshing: Promise<Credential | null> | null = null;
  readonly #base: string;

  constructor(private readonly options: AuthControllerOptions) {
    this.#base = normalizeBase(options.gatewayUrl ?? GATEWAY_URL);
  }

  state(): AuthState {
    return this.#state;
  }

  /** The live access token, for seeding a freshly spawned engine. */
  token(): string | null {
    return this.#credential?.accessToken ?? null;
  }

  /**
   * Read the keychain and come back signed in if we can.
   *
   * Deliberately forgiving. Every failure here — no stored token, an expired one whose
   * refresh was rejected, a gateway that is down — resolves to `signed_out` rather than
   * `error`. Trace is fully usable with a BYOK key and no account, so a launch that
   * cannot reach the gateway must not open on a red banner.
   */
  async restore(): Promise<void> {
    const accessToken = this.options.vault.get(VAULT_KEYS.accountToken);
    if (accessToken === null) {
      this.#publish({ status: "signed_out" });
      return;
    }

    const expiresRaw = this.options.vault.get(VAULT_KEYS.accountTokenExpiresAt);
    const parsedExpiry = expiresRaw === null ? Number.NaN : Number.parseInt(expiresRaw, 10);
    this.#credential = {
      accessToken,
      refreshToken: this.options.vault.get(VAULT_KEYS.accountRefreshToken),
      expiresAt: Number.isFinite(parsedExpiry) ? parsedExpiry : null,
    };

    // Refresh before announcing anything, so the renderer never sees `signed_in`
    // holding a token that is about to stop working.
    if (this.#isStale() && (await this.#refresh()) === null) {
      await this.#forget();
      this.#publish({ status: "signed_out" });
      return;
    }

    await this.options.applyToken(this.#credential.accessToken);
    this.#scheduleRefresh();

    const account = await this.#fetchAccount().catch(() => null);
    if (account === null) {
      // The token restored and the engine has it; only the *metadata* is missing. Show
      // signed-in with what we last knew rather than signing the user out over a flaky
      // network — `refreshAccount` fills it in on the next window focus.
      this.#publish({ status: "signed_in", account: this.#placeholderAccount() });
      return;
    }
    this.#account = account;
    this.#publish({ status: "signed_in", account });
  }

  /**
   * Open the browser and wait for the callback.
   *
   * Resolves when the account is signed in, or when the attempt fails or is cancelled.
   * The intermediate state is published as soon as the URL is known, so the UI can
   * render the "waiting for your browser" panel while this promise is still pending.
   */
  async signIn(): Promise<AuthState> {
    this.cancelSignIn();

    try {
      const verifier = base64Url(randomBytes(32));
      const state = base64Url(randomBytes(16));
      const challenge = base64Url(createHash("sha256").update(verifier).digest());

      const authorize = await this.#post<AuthorizeResponse>("/auth/desktop/start", {
        client_id: CLIENT_ID,
        scope: SCOPE,
        state,
        code_challenge: challenge,
        code_challenge_method: "S256",
        redirect_uri: CALLBACK_URL,
      });

      const expiresAt = Date.now() + (authorize.expiresIn ?? AUTHORIZE_TTL_MS / 1_000) * 1_000;

      const codePromise = new Promise<string>((resolve, reject) => {
        this.#pending = {
          state,
          verifier,
          expiresAt,
          settle: (outcome) => {
            this.#pending = null;
            this.#stopPolling();
            if ("code" in outcome) resolve(outcome.code);
            else reject(outcome.error);
          },
        };
      });

      this.#publish({
        status: "awaiting_authorization",
        verificationUri: authorize.authorizationUrl,
        ...(authorize.confirmationCode === undefined
          ? {}
          : { confirmationCode: authorize.confirmationCode }),
        expiresAt,
      });

      await this.options.openBrowser(authorize.authorizationUrl);
      this.#startPolling(state, verifier, expiresAt);

      const code = await codePromise;
      const token = await this.#exchange(code, verifier);

      this.#credential = credentialFrom(token, null);
      this.#persist();
      await this.options.applyToken(this.#credential.accessToken);
      this.#scheduleRefresh();

      const account = await this.#fetchAccount().catch(() => this.#placeholderAccount());
      this.#account = account;
      return this.#publish({ status: "signed_in", account });
    } catch (cause) {
      if (cause instanceof CancelledError) return this.#publish({ status: "signed_out" });
      const message =
        cause instanceof AuthError ? cause.message : "Could not reach the Trace account service.";
      if (!(cause instanceof AuthError)) {
        this.options.onLog?.(`[auth] sign-in failed: ${String(cause)}`);
      }
      return this.#publish({ status: "error", message });
    }
  }

  /**
   * Consume a `trace://auth/callback` URL.
   *
   * Called from the single-instance `second-instance` handler and from macOS's
   * `open-url`. Returns whether the URL was ours to handle, so the caller can log an
   * unrecognised deep link rather than swallowing it.
   */
  handleCallback(rawUrl: string): boolean {
    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      return false;
    }
    if (url.protocol !== "trace:") return false;
    // `trace://auth/callback` parses with host "auth" and pathname "/callback".
    if (`${url.host}${url.pathname}`.replace(/\/$/, "") !== "auth/callback") return false;

    const pending = this.#pending;
    if (pending === null) {
      // A stale link — the user clicked the browser's "return to app" twice, or an old
      // tab. Not an error worth showing; the app is very likely already signed in.
      this.options.onLog?.("[auth] callback arrived with no sign-in in flight");
      return true;
    }

    const state = url.searchParams.get("state") ?? "";
    if (!constantTimeEqual(state, pending.state)) {
      // The one check that makes PKCE's `state` worth carrying: a callback we did not
      // start. Fail the attempt rather than exchanging a code of unknown origin.
      pending.settle({ error: new AuthError("The sign-in response did not match this request.") });
      return true;
    }

    const error = url.searchParams.get("error");
    if (error !== null) {
      pending.settle({
        error: new AuthError(
          url.searchParams.get("error_description") ?? describeOAuthError(error),
        ),
      });
      return true;
    }

    const code = url.searchParams.get("code");
    if (code === null || code === "") {
      pending.settle({ error: new AuthError("The sign-in response carried no code.") });
      return true;
    }

    pending.settle({ code });
    return true;
  }

  /** Abandon the flow. Any pending `signIn` resolves to `signed_out`. */
  cancelSignIn(): void {
    this.#pending?.settle({ error: new CancelledError() });
    this.#pending = null;
    this.#stopPolling();
  }

  /**
   * Forget the token locally, then tell the gateway to revoke it.
   *
   * Local first, and unconditionally. If revocation fails because the network is down
   * the user still asked to be signed out and must be — a sign-out that leaves a live
   * token in the keychain because of a failed HTTP call is the wrong way to fail.
   */
  async signOut(): Promise<AuthState> {
    this.cancelSignIn();
    const token = this.#credential?.accessToken ?? null;
    const refreshToken = this.#credential?.refreshToken ?? null;
    await this.#forget();
    this.#publish({ status: "signed_out" });

    if (token !== null) {
      // Both tokens: revoking only the access token leaves a refresh token that can
      // mint more of them, which is not what "sign out" means.
      await Promise.all([
        this.#revoke(token, "access_token"),
        refreshToken === null ? Promise.resolve() : this.#revoke(refreshToken, "refresh_token"),
      ]);
    }
    return this.#state;
  }

  /** Re-read plan and usage. Called on window focus and after a turn completes. */
  async refreshAccount(): Promise<AccountInfo | null> {
    if (this.#credential === null) return null;
    try {
      const account = await this.#fetchAccount();
      this.#account = account;
      this.#publish({ status: "signed_in", account });
      return account;
    } catch (cause) {
      this.options.onLog?.(`[auth] account refresh failed: ${String(cause)}`);
      return this.#account;
    }
  }

  /** Re-seed a freshly spawned engine. Called from `EngineHost.onReady`. */
  async reapplyToken(): Promise<void> {
    if (this.#credential === null) return;
    if (this.#isStale()) await this.#refresh();
    await this.options.applyToken(this.#credential?.accessToken ?? null);
  }

  dispose(): void {
    this.cancelSignIn();
    if (this.#refreshTimer !== null) clearTimeout(this.#refreshTimer);
    this.#refreshTimer = null;
  }

  // -- the fallback poll -----------------------------------------------------

  /**
   * Ask the gateway whether the browser finished, in case the deep link never lands.
   *
   * Keyed on `state` and authenticated by the verifier, so this endpoint is no weaker
   * than the code exchange itself: knowing a `state` without the verifier gets nothing.
   */
  #startPolling(state: string, verifier: string, expiresAt: number): void {
    this.#stopPolling();
    this.#pollTimer = setInterval(() => {
      void (async () => {
        if (this.#pending === null) {
          this.#stopPolling();
          return;
        }
        if (Date.now() > expiresAt) {
          this.#pending.settle({ error: new AuthError("Sign-in timed out. Try again.") });
          return;
        }

        const response = await this.#raw("/auth/desktop/poll", {
          client_id: CLIENT_ID,
          state,
          code_verifier: verifier,
        }).catch(() => null);
        if (response === null || this.#pending === null) return;

        // 202 is the documented "not yet" — the browser is still open. Anything else
        // that is not ok ends the attempt, because it means the gateway has an opinion.
        if (response.status === 202) return;
        if (!response.ok) {
          const failure = await readOAuthError(response);
          if (failure.error === "authorization_pending") return;
          this.#pending.settle({
            error: new AuthError(failure.error_description ?? describeOAuthError(failure.error)),
          });
          return;
        }

        const token = (await response.json()) as TokenResponse;
        // The poll returns the token pair directly — there is no code left to exchange,
        // so short-circuit by completing the flow here.
        this.#pending.settle({ code: "" });
        this.#credential = credentialFrom(token, null);
        this.#persist();
        await this.options.applyToken(this.#credential.accessToken);
        this.#scheduleRefresh();
        const account = await this.#fetchAccount().catch(() => this.#placeholderAccount());
        this.#account = account;
        this.#publish({ status: "signed_in", account });
      })();
    }, POLL_INTERVAL_MS);
    this.#pollTimer.unref();
  }

  #stopPolling(): void {
    if (this.#pollTimer !== null) clearInterval(this.#pollTimer);
    this.#pollTimer = null;
  }

  // -- token lifecycle -------------------------------------------------------

  async #exchange(code: string, verifier: string): Promise<TokenResponse> {
    // An empty code means the poll already completed the flow and stored a credential.
    if (code === "") {
      const credential = this.#credential;
      if (credential === null) throw new AuthError("Sign-in did not complete.");
      return {
        access_token: credential.accessToken,
        ...(credential.refreshToken === null ? {} : { refresh_token: credential.refreshToken }),
      };
    }

    return this.#post<TokenResponse>("/auth/desktop/token", {
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      code,
      code_verifier: verifier,
      redirect_uri: CALLBACK_URL,
    });
  }

  #isStale(): boolean {
    const expiresAt = this.#credential?.expiresAt;
    // No expiry means a non-expiring token; treat it as fresh rather than refreshing on
    // every launch.
    if (expiresAt === null || expiresAt === undefined) return false;
    return Date.now() >= expiresAt - MIN_REFRESH_MS;
  }

  async #refresh(): Promise<Credential | null> {
    this.#refreshing ??= this.#refreshOnce().finally(() => {
      this.#refreshing = null;
    });
    return this.#refreshing;
  }

  async #refreshOnce(): Promise<Credential | null> {
    const refreshToken = this.#credential?.refreshToken ?? null;
    if (refreshToken === null) return null;

    try {
      const token = await this.#post<TokenResponse>("/auth/desktop/token", {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
      });
      // A gateway that rotates refresh tokens returns a new one; one that does not omits
      // it and the old one stays valid. WorkOS rotates, so this path is the live one.
      this.#credential = credentialFrom(token, refreshToken);
      this.#persist();
      await this.options.applyToken(this.#credential.accessToken);
      this.#scheduleRefresh();
      return this.#credential;
    } catch (cause) {
      this.options.onLog?.(`[auth] token refresh failed: ${String(cause)}`);
      return null;
    }
  }

  #scheduleRefresh(): void {
    if (this.#refreshTimer !== null) clearTimeout(this.#refreshTimer);
    this.#refreshTimer = null;

    const expiresAt = this.#credential?.expiresAt;
    if (expiresAt === null || expiresAt === undefined) return;

    const delay = Math.max(MIN_REFRESH_MS, (expiresAt - Date.now()) * REFRESH_AT);
    this.#refreshTimer = setTimeout(() => {
      void this.#refresh().then(async (credential) => {
        if (credential !== null) return;
        // Refresh failed and there is no way back without the browser.
        await this.#forget();
        this.#publish({ status: "error", message: "Your Trace session expired. Sign in again." });
      });
    }, delay);
    // Unrefed so a pending refresh is never the reason the process stays alive.
    this.#refreshTimer.unref();
  }

  #persist(): void {
    const credential = this.#credential;
    if (credential === null) return;
    const { vault } = this.options;
    vault.set(VAULT_KEYS.accountToken, credential.accessToken);
    if (credential.refreshToken !== null) {
      vault.set(VAULT_KEYS.accountRefreshToken, credential.refreshToken);
    }
    if (credential.expiresAt !== null) {
      vault.set(VAULT_KEYS.accountTokenExpiresAt, String(credential.expiresAt));
    } else {
      vault.delete(VAULT_KEYS.accountTokenExpiresAt);
    }
  }

  async #forget(): Promise<void> {
    if (this.#refreshTimer !== null) clearTimeout(this.#refreshTimer);
    this.#refreshTimer = null;
    this.#credential = null;
    this.#account = null;
    const { vault } = this.options;
    vault.delete(VAULT_KEYS.accountToken);
    vault.delete(VAULT_KEYS.accountRefreshToken);
    vault.delete(VAULT_KEYS.accountTokenExpiresAt);
    await this.options.applyToken(null);
  }

  async #revoke(token: string, hint: "access_token" | "refresh_token"): Promise<void> {
    await this.#raw("/auth/revoke", {
      client_id: CLIENT_ID,
      token,
      token_type_hint: hint,
    }).catch((cause: unknown) => {
      this.options.onLog?.(`[auth] revoking the ${hint} failed: ${String(cause)}`);
    });
  }

  // -- account ---------------------------------------------------------------

  async #fetchAccount(depth = 0): Promise<AccountInfo> {
    const token = this.#credential?.accessToken;
    if (token === undefined) throw new AuthError("Not signed in.");

    const response = await withTimeout((signal) =>
      fetch(`${this.#base}/v1/account`, {
        headers: { authorization: `Bearer ${token}`, accept: "application/json" },
        signal,
      }),
    );

    if (response.status === 401) {
      // The token is gone server-side — revoked from the dashboard, or a password
      // change. `depth` bounds the recursion: a gateway that 401s a token it just
      // minted would otherwise loop.
      if (depth > 0) throw new AuthError("Your Trace session is no longer valid.");
      const refreshed = await this.#refresh();
      if (refreshed === null) throw new AuthError("Your Trace session is no longer valid.");
      return this.#fetchAccount(depth + 1);
    }
    if (!response.ok) throw new Error(`GET /v1/account → ${String(response.status)}`);

    return coerceAccount(await response.json());
  }

  /**
   * What we show when the token is good but the metadata call failed.
   *
   * A `limitCents` of null reads as "no cap" in the UI, which is the safe direction to
   * be wrong in: the alternative is drawing a usage bar from invented numbers.
   */
  #placeholderAccount(): AccountInfo {
    return (
      this.#account ?? {
        email: "",
        plan: "free",
        usageCents: 0,
        limitCents: null,
        periodEndsAt: 0,
      }
    );
  }

  // -- HTTP ------------------------------------------------------------------

  async #post<T>(path: string, body: Record<string, string>): Promise<T> {
    const response = await this.#raw(path, body);
    if (!response.ok) {
      const failure = await readOAuthError(response);
      throw new AuthError(failure.error_description ?? describeOAuthError(failure.error));
    }
    return (await response.json()) as T;
  }

  /**
   * `application/x-www-form-urlencoded`, per RFC 6749 §4 — not JSON, even though both
   * ends are ours. Standard encoding means the gateway's token endpoint can be fronted
   * by any off-the-shelf OAuth implementation without a second wire format to keep.
   */
  #raw(path: string, body: Record<string, string>): Promise<Response> {
    return withTimeout((signal) =>
      fetch(`${this.#base}${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          accept: "application/json",
        },
        body: new URLSearchParams(body).toString(),
        signal,
      }),
    );
  }

  #publish(state: AuthState): AuthState {
    this.#state = state;
    this.options.onState(state);
    return state;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Distinguishes "the user cancelled" from "it broke", which render very differently. */
class CancelledError extends Error {
  constructor() {
    super("Sign-in cancelled.");
    this.name = "CancelledError";
  }
}

function normalizeBase(url: string): string {
  return url.replace(/\/+$/, "");
}

function base64Url(bytes: Buffer): string {
  return bytes.toString("base64url");
}

function credentialFrom(token: TokenResponse, previousRefresh: string | null): Credential {
  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token ?? previousRefresh,
    expiresAt: token.expires_in === undefined ? null : Date.now() + token.expires_in * 1_000,
  };
}

/**
 * Compare without leaking length or position through timing.
 *
 * `timingSafeEqual` throws on a length mismatch, so both sides are hashed to a fixed
 * width first. Overkill for a value the attacker would have to guess in ten minutes,
 * and still the right habit for anything that gates a credential.
 */
function constantTimeEqual(a: string, b: string): boolean {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

/** A request timeout, applied uniformly so no call can hang a sign-in forever. */
async function withTimeout(run: (signal: AbortSignal) => Promise<Response>): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await run(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

async function readOAuthError(response: Response): Promise<OAuthErrorResponse> {
  try {
    const parsed: unknown = await response.json();
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as OAuthErrorResponse).error === "string"
    ) {
      return parsed as OAuthErrorResponse;
    }
  } catch {
    // Not JSON. An HTML error page from a proxy, most likely.
  }
  return { error: `http_${String(response.status)}` };
}

/** RFC 6749 §5.2 codes, in words a user can act on. */
function describeOAuthError(code: string): string {
  switch (code) {
    case "access_denied":
      return "Sign-in was declined in the browser.";
    case "expired_token":
    case "invalid_grant":
      return "That sign-in link has expired. Try again.";
    case "invalid_client":
    case "unauthorized_client":
      return "This copy of Trace was rejected by the account service. Try updating.";
    case "invalid_scope":
      return "Your account does not have access to this feature.";
    case "server_error":
    case "temporarily_unavailable":
      return "The account service is having trouble. Try again in a moment.";
    default:
      return `The account service rejected the sign-in (${code}).`;
  }
}

const PLANS: readonly Plan[] = ["free", "pro", "business", "enterprise"];

/**
 * Trust nothing from the wire.
 *
 * This shape drives a usage meter and a paywall, and a `usageCents` of `undefined`
 * renders as `NaN%`. An unknown plan degrades to `free`, which errs in the right
 * direction: it offers fewer features than the user has rather than more.
 */
function coerceAccount(raw: unknown): AccountInfo {
  const value = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const plan = value["plan"];
  const displayName = value["displayName"];
  const limit = value["limitCents"];

  return {
    email: typeof value["email"] === "string" ? value["email"] : "",
    ...(typeof displayName === "string" && displayName !== "" ? { displayName } : {}),
    plan: PLANS.includes(plan as Plan) ? (plan as Plan) : "free",
    usageCents: Math.max(0, Math.round(toNumber(value["usageCents"], 0))),
    limitCents: typeof limit === "number" && Number.isFinite(limit) ? Math.round(limit) : null,
    periodEndsAt: Math.round(toNumber(value["periodEndsAt"], 0)),
  };
}

function toNumber(raw: unknown, fallback: number): number {
  return typeof raw === "number" && Number.isFinite(raw) ? raw : fallback;
}
