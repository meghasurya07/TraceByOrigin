/**
 * One store for the whole window.
 *
 * Not four smaller ones, because almost nothing here changes alone. A single
 * `tool_call_completed` event updates the transcript, the session's cumulative cost,
 * the status bar's live figure, and — if the tool touched files — the work panel's
 * diff target. Splitting that across stores means either cross-store subscriptions or
 * a render where half the UI has seen the event and half has not.
 *
 * ## The division of labour with `@trace/client`
 *
 * `applyEvent` is a pure reducer over one `SessionView` and is where all transcript
 * logic lives. This file is the *impure* half: it owns the engine calls, the
 * subscriptions, and the app-level events the reducer deliberately ignores —
 * `work_panel_requested` and `index/progress`, both of which are about the window
 * rather than the conversation.
 *
 * ## Why actions and not reducers
 *
 * Every mutation here is a method on the store. There is no dispatch and no action
 * union, because the actions are not serializable anyway: they await the engine. The
 * thing that *is* replayable — the transcript — already has a pure reducer, and that
 * is the part worth testing.
 *
 * ## Error policy
 *
 * No action rejects. A failed engine call becomes a `Notice`, because a rejected
 * promise from a click handler is an unhandled rejection in the console and nothing on
 * screen. The one exception is `boot`, whose failure means the app has no data at all;
 * it records the failure as a notice too, but also leaves `engine.phase` alone so the
 * banner that main pushes stays authoritative.
 *
 * Copyright (c) 2026 Origin AI
 */

import { create } from "zustand";

import {
  applyEvent,
  appendUserMessage,
  emptySessionView,
  hydrateFromHistory,
  initialAppState,
  type AppState,
  type EngineClient,
  type Notice,
  type SessionView,
} from "@trace/client";
import { ErrorCode } from "@trace/protocol";
import type {
  Attachment,
  CreateSessionParams,
  EngineSettings,
  PermissionDecision,
  SessionSummary,
  WorkPanelTarget,
} from "@trace/protocol";

import type { HostInfo, UiCommand, WindowStatePayload } from "../shared/ipc";
import { TraceRequestError } from "../shared/ipc";
import { bridge } from "./lib/bridge";
import { BridgeEngineClient } from "./lib/engine-client";

// ---------------------------------------------------------------------------
// Shape
// ---------------------------------------------------------------------------

/**
 * What the *window* knows, on top of what a surface knows.
 *
 * `AppState` is shared with the CLI and a future web tab, so platform facts do not
 * belong in it. These do: a custom title bar cannot draw a maximize button without
 * knowing whether it is currently a maximize or a restore.
 */
export interface HostState {
  info: HostInfo | null;
  window: WindowStatePayload;
  /** Sidebar and work panel are window furniture, not session state. */
  sidebarOpen: boolean;
  /** Set while a `session/prompt` is in flight, before `turn_started` lands. */
  sending: boolean;
  /** Which settings section the dialog is on, or null when it is closed. */
  settingsSection: "account" | "models" | "permissions" | "advanced" | null;
  /** Open state of the ⌘P session switcher. */
  searchOpen: boolean;
}

export interface TraceStore extends AppState {
  host: HostState;

  // -- lifecycle
  boot: () => Promise<void>;

  // -- workspaces
  openWorkspace: (root?: string) => Promise<void>;
  closeWorkspace: (workspaceId: string) => Promise<void>;
  reindexWorkspace: (workspaceId: string) => Promise<void>;
  selectWorkspace: (workspaceId: string | null) => void;

  // -- sessions
  createSession: (params?: CreateSessionParams) => Promise<string | null>;
  selectSession: (sessionId: string) => Promise<void>;
  renameSession: (sessionId: string, title: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;

  // -- the turn
  sendPrompt: (input: {
    text: string;
    attachments?: Attachment[];
    model?: string;
  }) => Promise<void>;
  interrupt: () => Promise<void>;
  steer: (text: string) => Promise<void>;
  resolvePermission: (callId: string, decision: PermissionDecision) => Promise<void>;

  // -- settings
  updateSettings: (patch: Partial<EngineSettings>) => Promise<void>;
  setProviderKey: (provider: string, apiKey: string) => Promise<void>;
  deleteProviderKey: (provider: string) => Promise<void>;

  // -- auth (host-owned; these are thin forwards)
  signIn: () => Promise<void>;
  cancelSignIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshAccount: () => Promise<void>;
  restartEngine: () => Promise<void>;

  // -- window furniture
  toggleSidebar: () => void;
  toggleWorkPanel: () => void;
  openWorkPanel: (target: WorkPanelTarget, ref?: string) => void;
  closeWorkPanel: () => void;
  openSettings: (section?: HostState["settingsSection"]) => void;
  closeSettings: () => void;
  setSearchOpen: (open: boolean) => void;

  // -- notices
  pushNotice: (notice: Omit<Notice, "id">) => void;
  dismissNotice: (id: string) => void;
}

/**
 * The engine client, module-scoped.
 *
 * Deliberately not in the store: it is neither serializable nor state, and a React
 * devtools snapshot containing a live IPC object is noise. `boot` is the only thing
 * that assigns it, and every action reads it through `engine()`, which throws a
 * legible error rather than dereferencing null if an action somehow beats boot.
 */
let client: EngineClient | null = null;

function engine(): EngineClient {
  if (client === null) throw new Error("The store was used before `boot()` ran.");
  return client;
}

/** Notices need ids and nothing in the payload provides one. */
let noticeSeq = 0;

export const useStore = create<TraceStore>()((set, get) => {
  // -- helpers ---------------------------------------------------------------

  /**
   * Replace one session's view, leaving every other reference untouched.
   *
   * Returns the same `views` object when the reducer returned the same view, so a
   * `text_delta` for a background session costs no re-render in the foreground one.
   */
  const patchView = (sessionId: string, next: (view: SessionView) => SessionView): void => {
    const state = get();
    const current = state.views[sessionId];
    if (current === undefined) return;
    const updated = next(current);
    if (updated === current) return;
    set({ views: { ...state.views, [sessionId]: updated } });
  };

  const notice = (level: Notice["level"], message: string, action?: Notice["action"]): void => {
    noticeSeq += 1;
    const entry: Notice =
      action === undefined
        ? { id: `n${String(noticeSeq)}`, level, message }
        : { id: `n${String(noticeSeq)}`, level, message, action };
    set((state) => ({ notices: [...state.notices, entry] }));
  };

  /**
   * Turn a thrown engine error into a notice, with the action the code implies.
   *
   * This is the whole reason `IpcResult` carries a numeric `code` through three
   * process boundaries: `MissingApiKey` should put a sign-in button on screen, and
   * `ContextExceeded` should offer to compact, rather than both showing the same
   * "something went wrong".
   */
  const report = (cause: unknown, context: string): void => {
    const code = cause instanceof TraceRequestError ? cause.code : undefined;
    const message = cause instanceof Error ? cause.message : String(cause);

    if (code === ErrorCode.MissingApiKey || code === ErrorCode.ProviderAuthFailed) {
      notice("warn", message, { label: "Sign in", kind: "sign_in" });
      return;
    }
    if (code === ErrorCode.ContextExceeded) {
      // Labelled for what the button actually does. The protocol has no
      // `session/compact` yet, so the available remedy is the other one `StopReason`
      // names — branch into a fresh session — and promising "compact" would be a lie
      // the click could not keep.
      notice("warn", message, { label: "Start a fresh session", kind: "compact_session" });
      return;
    }
    if (code === ErrorCode.EngineUnavailable) {
      notice("error", message, { label: "Restart engine", kind: "restart_engine" });
      return;
    }
    // A cancelled turn is the user's own stop button arriving as a rejection. Nothing
    // to report; the transcript already shows the turn ended.
    if (code === ErrorCode.TurnCancelled) return;
    notice("error", `${context}: ${message}`);
  };

  /** Refresh the sidebar's ordering after anything that changes `updatedAt`. */
  const refreshSessions = async (): Promise<void> => {
    try {
      const { sessions } = await engine().request("session/list", {});
      set({ sessions });
    } catch (cause) {
      report(cause, "Could not list sessions");
    }
  };

  /** Re-read the workspace list, whose `indexStatus` changes without a request. */
  const refreshWorkspaces = async (): Promise<void> => {
    try {
      const { workspaces } = await engine().request("workspace/list", {});
      set((state) => ({
        workspaces,
        activeWorkspaceId:
          state.activeWorkspaceId !== null &&
          workspaces.some((w) => w.id === state.activeWorkspaceId)
            ? state.activeWorkspaceId
            : (workspaces[0]?.id ?? null),
      }));
    } catch (cause) {
      report(cause, "Could not list workspaces");
    }
  };

  return {
    ...initialAppState(),

    host: {
      info: null,
      window: { maximized: false, fullScreen: false, focused: true },
      sidebarOpen: true,
      sending: false,
      settingsSection: null,
      searchOpen: false,
    },

    // ---- lifecycle --------------------------------------------------------

    /**
     * Wire every subscription, then load. In that order.
     *
     * Subscriptions first because the engine may already be mid-turn — another window,
     * or a session that was active when the app was killed and has since resumed. An
     * event that arrives between `session/list` and the first `onEngineNotify` is an
     * event that never reaches the transcript, and the symptom is a turn that appears
     * to hang until the next token.
     *
     * Called once, from `main.tsx`. Idempotent only in the sense that calling it twice
     * would double-subscribe — React's strict mode does not, because it runs in an
     * effect whose cleanup returns the unsubscribers.
     */
    boot: async () => {
      const bridgeClient = new BridgeEngineClient(bridge);
      client = bridgeClient;

      set({ engine: bridgeClient.status() });
      bridgeClient.onStatusChange((status) => {
        set({ engine: status });
      });

      // --- session events: the reducer, plus the two it deliberately ignores
      bridgeClient.on("session/event", (event) => {
        patchView(event.sessionId, (view) => applyEvent(view, event));

        switch (event.type) {
          case "work_panel_requested":
            // Only for the session the user is looking at. An agent working in a
            // background session must not be able to yank the panel out from under a
            // conversation the user is reading.
            if (event.sessionId === get().activeSessionId) {
              get().openWorkPanel(event.target, event.ref);
            }
            return;
          case "turn_started":
            set((state) => ({
              host: { ...state.host, sending: false },
              sessions: withPatch(state.sessions, event.sessionId, { isActive: true }),
            }));
            return;
          case "turn_completed":
            set((state) => {
              const previous = state.sessions.find((s) => s.id === event.sessionId);
              return {
                sessions: withPatch(state.sessions, event.sessionId, {
                  isActive: false,
                  turnCount: (previous?.turnCount ?? 0) + 1,
                  updatedAt: event.completedAt,
                  cumulativeCost: event.cost,
                }),
              };
            });
            // Usage moved, so the account's spend did too. Cheap, and it keeps the
            // status bar's remaining-credit figure from going stale for an hour.
            void get().refreshAccount();
            return;
          case "title_updated":
            set((state) => ({
              sessions: withPatch(state.sessions, event.sessionId, { title: event.title }),
            }));
            return;
          default:
            return;
        }
      });

      bridgeClient.on("index/progress", (progress) => {
        set((state) => ({ indexing: { ...state.indexing, [progress.workspaceId]: progress } }));
        // The workspace's own `indexStatus` moved with it; re-read rather than guessing,
        // since the engine may have landed on `failed` rather than `ready`.
        if (progress.phase === "done") void refreshWorkspaces();
      });

      bridgeClient.on("log", (entry) => {
        // Engine logs belong in the terminal, not the UI — except `error`, which is how
        // an engine-side failure with no request to attach to reaches a human.
        if (entry.level === "error") notice("error", entry.message);
      });

      // --- host pushes
      bridge.onAuthState((auth) => {
        set({ auth });
      });
      bridge.onWindowState((windowState) => {
        set((state) => ({ host: { ...state.host, window: windowState } }));
      });
      bridge.onUiCommand((command) => {
        applyUiCommand(get, command);
      });

      // --- load
      try {
        const [info, workspaces, sessions, settings, models, keys] = await Promise.all([
          bridge.hostInfo(),
          bridgeClient.request("workspace/list", {}),
          bridgeClient.request("session/list", {}),
          bridgeClient.request("settings/get", {}),
          bridgeClient.request("models/list", {}),
          bridgeClient.request("settings/providerKeys", {}),
        ]);

        set((state) => ({
          host: { ...state.host, info },
          workspaces: workspaces.workspaces,
          activeWorkspaceId: workspaces.workspaces[0]?.id ?? null,
          sessions: sessions.sessions,
          settings,
          models: models.models,
          providerKeys: keys.keys,
        }));

        // Land on the most recent session rather than an empty pane. `session/list` is
        // ordered most-recently-updated first, which is also the sidebar's order.
        const first = sessions.sessions[0];
        if (first !== undefined) await get().selectSession(first.id);
      } catch (cause) {
        report(cause, "Trace could not load");
      }
    },

    // ---- workspaces -------------------------------------------------------

    /**
     * Open a folder as a workspace. With no argument, asks the OS for one first.
     *
     * The engine is told before the picker's result is stored, so a root that fails to
     * open — deleted between the dialog and the call, a permission error — never appears
     * in the sidebar.
     */
    openWorkspace: async (root) => {
      let target = root;
      if (target === undefined) {
        const picked = await bridge.pickDirectory({ title: "Open folder" });
        if (picked === null) return;
        target = picked;
      }

      try {
        const workspace = await engine().request("workspace/open", { root: target });
        set((state) => ({
          workspaces: state.workspaces.some((w) => w.id === workspace.id)
            ? state.workspaces.map((w) => (w.id === workspace.id ? workspace : w))
            : [...state.workspaces, workspace],
          activeWorkspaceId: workspace.id,
        }));
        get().openWorkPanel("files");
      } catch (cause) {
        report(cause, "Could not open that folder");
      }
    },

    closeWorkspace: async (workspaceId) => {
      try {
        await engine().request("workspace/close", { workspaceId });
      } catch (cause) {
        report(cause, "Could not close that workspace");
        return;
      }
      set((state) => {
        const workspaces = state.workspaces.filter((w) => w.id !== workspaceId);
        const { [workspaceId]: _dropped, ...indexing } = state.indexing;
        return {
          workspaces,
          indexing,
          activeWorkspaceId:
            state.activeWorkspaceId === workspaceId
              ? (workspaces[0]?.id ?? null)
              : state.activeWorkspaceId,
        };
      });
    },

    reindexWorkspace: async (workspaceId) => {
      try {
        await engine().request("workspace/index", { workspaceId, force: true });
      } catch (cause) {
        report(cause, "Could not rebuild the index");
      }
    },

    selectWorkspace: (workspaceId) => {
      set({ activeWorkspaceId: workspaceId });
    },

    // ---- sessions ---------------------------------------------------------

    createSession: async (params) => {
      const workspaceId = get().activeWorkspaceId;
      try {
        const summary = await engine().request("session/create", {
          ...(workspaceId === null ? {} : { workspaceId }),
          ...params,
        });
        // A brand-new session has no history, so it is `ready` immediately rather than
        // going through `hydrate` and flashing a loading state for an empty transcript.
        set((state) => ({
          sessions: [summary, ...state.sessions],
          views: {
            ...state.views,
            [summary.id]: { ...emptySessionView(summary), hydration: "ready" },
          },
          activeSessionId: summary.id,
        }));
        window.dispatchEvent(new CustomEvent("trace:focus-prompt"));
        return summary.id;
      } catch (cause) {
        report(cause, "Could not create a session");
        return null;
      }
    },

    /**
     * Switch sessions, loading the transcript on first visit.
     *
     * The active id is set *before* the history request resolves, so the pane swaps
     * instantly and shows its own loading state. Waiting for the fetch would make the
     * sidebar feel unresponsive on a long transcript, and the view already models
     * `hydration` precisely so it does not have to.
     */
    selectSession: async (sessionId) => {
      const state = get();
      const summary = state.sessions.find((s) => s.id === sessionId);
      if (summary === undefined) {
        report(new Error("That session no longer exists."), "Could not open the session");
        return;
      }

      const existing = state.views[sessionId];
      set({
        activeSessionId: sessionId,
        views:
          existing === undefined
            ? {
                ...state.views,
                [sessionId]: { ...emptySessionView(summary), hydration: "loading" },
              }
            : state.views,
      });

      // Already loaded, or loading. Re-fetching would discard live items the engine
      // will never resend.
      if (existing !== undefined && existing.hydration !== "unloaded") return;
      if (existing !== undefined) {
        patchView(sessionId, (view) => ({ ...view, hydration: "loading" }));
      }

      try {
        const { entries } = await engine().request("session/history", { sessionId });
        set((current) => ({
          views: { ...current.views, [sessionId]: hydrateFromHistory(summary, entries) },
        }));
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : String(cause);
        patchView(sessionId, (view) => ({
          ...view,
          hydration: "failed",
          hydrationError: message,
        }));
      }
    },

    renameSession: async (sessionId, title) => {
      const trimmed = title.trim();
      if (trimmed === "") return;
      // Optimistic: the engine cannot refuse a rename for any reason the user could
      // act on, and a title that lags a keystroke behind reads as a stutter.
      set((state) => ({ sessions: withPatch(state.sessions, sessionId, { title: trimmed }) }));
      patchView(sessionId, (view) => ({ ...view, summary: { ...view.summary, title: trimmed } }));
      try {
        await engine().request("session/rename", { sessionId, title: trimmed });
      } catch (cause) {
        report(cause, "Could not rename the session");
        await refreshSessions();
      }
    },

    deleteSession: async (sessionId) => {
      try {
        await engine().request("session/delete", { sessionId });
      } catch (cause) {
        report(cause, "Could not delete the session");
        return;
      }
      const state = get();
      const remaining = state.sessions.filter((s) => s.id !== sessionId);
      const { [sessionId]: _dropped, ...views } = state.views;
      set({ sessions: remaining, views });

      if (state.activeSessionId !== sessionId) return;
      const next = remaining[0];
      if (next === undefined) set({ activeSessionId: null });
      else await get().selectSession(next.id);
    },

    // ---- the turn ---------------------------------------------------------

    /**
     * Send a prompt.
     *
     * `sending` goes true here and false on `turn_started`, not on the resolve of this
     * request: the gap between the two is where the engine is building context, and a
     * send button that re-enables during it invites a second prompt into a session that
     * already has one in flight (`TurnAlreadyActive`).
     */
    sendPrompt: async ({ text, attachments, model }) => {
      const sessionId = get().activeSessionId ?? (await get().createSession());
      if (sessionId === null) return;
      if (text.trim() === "" && (attachments === undefined || attachments.length === 0)) return;

      set((state) => ({ host: { ...state.host, sending: true } }));
      try {
        const { turnId } = await engine().request("session/prompt", {
          sessionId,
          text,
          ...(attachments === undefined || attachments.length === 0 ? {} : { attachments }),
          ...(model === undefined ? {} : { model }),
        });
        patchView(sessionId, (view) =>
          appendUserMessage(view, {
            turnId,
            at: Date.now(),
            text,
            ...(attachments === undefined ? {} : { attachments }),
          }),
        );
      } catch (cause) {
        set((state) => ({ host: { ...state.host, sending: false } }));
        report(cause, "The prompt did not go through");
      }
    },

    interrupt: async () => {
      const sessionId = get().activeSessionId;
      if (sessionId === null) return;
      // Flip the flag before the request so the stop button dies on the first click.
      // The engine takes a moment to unwind, and a button that stays live through it
      // gets pressed again and read as a hang.
      patchView(sessionId, (view) =>
        view.live === null ? view : { ...view, live: { ...view.live, interruptRequested: true } },
      );
      try {
        await engine().request("session/interrupt", { sessionId });
      } catch (cause) {
        report(cause, "Could not stop the turn");
      }
    },

    steer: async (text) => {
      const sessionId = get().activeSessionId;
      if (sessionId === null || text.trim() === "") return;
      try {
        await engine().request("session/steer", { sessionId, text });
      } catch (cause) {
        report(cause, "Could not send that");
      }
    },

    resolvePermission: async (callId, decision) => {
      const sessionId = get().activeSessionId;
      if (sessionId === null) return;
      try {
        await engine().request("session/resolvePermission", { sessionId, callId, decision });
      } catch (cause) {
        report(cause, "Could not answer the prompt");
      }
      // No optimistic update: the engine echoes `permission_resolved`, and guessing
      // here would show "allowed" for a call the engine had already timed out.
    },

    // ---- settings ---------------------------------------------------------

    updateSettings: async (patch) => {
      try {
        const settings = await engine().request("settings/update", { patch });
        set({ settings });
      } catch (cause) {
        report(cause, "Could not save that setting");
      }
    },

    setProviderKey: async (provider, apiKey) => {
      try {
        const status = await engine().request("settings/setProviderKey", { provider, apiKey });
        set((state) => ({
          providerKeys: state.providerKeys.some((k) => k.provider === provider)
            ? state.providerKeys.map((k) => (k.provider === provider ? status : k))
            : [...state.providerKeys, status],
        }));
        if (status.validated === false) {
          notice("warn", `That ${provider} key was saved, but the provider rejected it.`);
        }
      } catch (cause) {
        report(cause, "Could not save the key");
      }
    },

    deleteProviderKey: async (provider) => {
      try {
        await engine().request("settings/deleteProviderKey", { provider });
        set((state) => ({
          providerKeys: state.providerKeys.filter((k) => k.provider !== provider),
        }));
      } catch (cause) {
        report(cause, "Could not remove the key");
      }
    },

    // ---- auth -------------------------------------------------------------
    //
    // Thin forwards. Main owns the flow and the keychain; the outcome of every one of
    // these arrives on `authState`, not as a return value, which is why they are void.

    signIn: async () => {
      try {
        await bridge.signIn();
      } catch (cause) {
        report(cause, "Could not start sign-in");
      }
    },

    cancelSignIn: async () => {
      await bridge.cancelSignIn().catch(() => undefined);
    },

    signOut: async () => {
      try {
        await bridge.signOut();
      } catch (cause) {
        report(cause, "Could not sign out");
      }
    },

    refreshAccount: async () => {
      try {
        const account = await bridge.refreshAccount();
        if (account === null) return;
        set((state) =>
          state.auth.status === "signed_in" ? { auth: { status: "signed_in", account } } : state,
        );
      } catch {
        // Usage figures going stale is not worth a banner.
      }
    },

    restartEngine: async () => {
      try {
        await bridge.restartEngine();
      } catch (cause) {
        report(cause, "Could not restart the engine");
      }
    },

    // ---- window furniture -------------------------------------------------

    toggleSidebar: () => {
      set((state) => ({ host: { ...state.host, sidebarOpen: !state.host.sidebarOpen } }));
    },

    toggleWorkPanel: () => {
      set((state) => ({ workPanel: { ...state.workPanel, open: !state.workPanel.open } }));
    },

    /**
     * Show a target, remembering the ref per-target.
     *
     * Asking for the target that is already showing closes the panel, which is what
     * makes `⌘1` a toggle rather than a no-op on the second press.
     */
    openWorkPanel: (target, ref) => {
      set((state) => {
        const sameTarget = state.workPanel.target === target;
        const refs =
          ref === undefined ? state.workPanel.refs : { ...state.workPanel.refs, [target]: ref };
        return {
          workPanel: {
            open: ref !== undefined || !sameTarget ? true : !state.workPanel.open,
            target,
            refs,
          },
        };
      });
    },

    closeWorkPanel: () => {
      set((state) => ({ workPanel: { ...state.workPanel, open: false } }));
    },

    openSettings: (section) => {
      set((state) => ({ host: { ...state.host, settingsSection: section ?? "account" } }));
    },

    closeSettings: () => {
      set((state) => ({ host: { ...state.host, settingsSection: null } }));
    },

    setSearchOpen: (open) => {
      set((state) => ({ host: { ...state.host, searchOpen: open } }));
    },

    // ---- notices ----------------------------------------------------------

    pushNotice: (entry) => {
      notice(entry.level, entry.message, entry.action);
    },

    dismissNotice: (id) => {
      set((state) => ({ notices: state.notices.filter((n) => n.id !== id) }));
    },
  };
});

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/**
 * Patch one summary in the list, in place, preserving order.
 *
 * The sidebar's order is the engine's (`session/list` returns most-recent-first) and
 * re-sorting locally on every turn would make a session jump under the cursor
 * mid-click. Order changes only when the list is re-fetched.
 */
function withPatch(
  sessions: readonly SessionSummary[],
  sessionId: string,
  patch: Partial<SessionSummary>,
): SessionSummary[] {
  let found = false;
  const next = sessions.map((summary) => {
    if (summary.id !== sessionId) return summary;
    found = true;
    return { ...summary, ...patch };
  });
  return found ? next : [...sessions];
}

/**
 * Menu items and native accelerators, applied to the store.
 *
 * Lives here rather than in a component so that `⌘N` works with no particular thing
 * focused — and so the menu and the in-app buttons run the same code, which is the
 * whole reason `menu.ts` sends commands instead of acting.
 */
function applyUiCommand(get: () => TraceStore, command: UiCommand): void {
  const store = get();
  switch (command.kind) {
    case "new_session":
      void store.createSession();
      return;
    case "new_side_chat": {
      const parent = store.activeSessionId;
      if (parent === null) {
        void store.createSession();
        return;
      }
      void store.createSession({ parentSessionId: parent, inheritContext: true });
      return;
    }
    case "focus_prompt":
      // The prompt bar owns its own DOM node; a store flag would have to be cleared
      // again afterwards. A custom event is the honest mechanism for "move focus".
      window.dispatchEvent(new CustomEvent("trace:focus-prompt"));
      return;
    case "toggle_sidebar":
      store.toggleSidebar();
      return;
    case "toggle_work_panel":
      store.toggleWorkPanel();
      return;
    case "open_work_panel":
      store.openWorkPanel(command.target);
      return;
    case "open_settings":
      store.openSettings(command.section ?? "account");
      return;
    case "open_session_search":
      store.setSearchOpen(true);
      return;
    case "interrupt_turn":
      void store.interrupt();
      return;
    case "open_session":
      void store.selectSession(command.sessionId);
      return;
    default: {
      const unhandled: never = command;
      void unhandled;
      return;
    }
  }
}
