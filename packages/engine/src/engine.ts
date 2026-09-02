/**
 * The engine: everything the protocol exposes, wired together.
 *
 * This is the only file that knows both the JSON-RPC surface and the subsystems behind
 * it. Every other module in the engine is deliberately ignorant of the protocol — tools
 * take a `ToolContext`, the turn loop takes a `TurnDeps`, git takes a `Workspace` — which
 * is what lets them be tested without a transport and reused by the future in-process
 * surfaces (the CLI, the VS Code fork) without a second implementation of any of it.
 *
 * Three things are worth reading before the handlers:
 *
 * **`EngineRequestHandlers` is a proof, not a type annotation.** It is
 * `{ [M in RequestMethod]: RequestHandler<M> }` — a mapped type over the whole method
 * map with no `Partial`. Declaring the handler table as that type means adding a method
 * to the protocol is a compile error here until it is implemented, and a typo in a
 * method name is a compile error rather than a `MethodNotFound` a user discovers.
 *
 * **Sessions are loaded on demand, not held open.** A user with two hundred sessions
 * should pay for the two they have open, so the live map holds only sessions someone has
 * touched this run; the rest are a directory on disk. `session/list` is a scan, and any
 * method naming a session id will restore it first. The cost of that decision is that
 * `isActive` has to be overlaid from the live map onto the scanned metadata, which is
 * done in exactly one place below.
 *
 * **One gate before the handshake, not thirty-five.** Every method except `initialize`
 * is wrapped once with a guard, rather than each handler opening with the same `if`. The
 * wrapper is also where the settings-load race is closed: handlers are registered
 * synchronously in the constructor, before any frame can arrive, and the asynchronous
 * load they depend on is awaited by `initialize`.
 *
 * Copyright (c) 2026 Origin AI
 */

import { randomUUID } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import {
  ErrorCode,
  PROTOCOL_VERSION,
  RpcError,
  type ClientInfo,
  type EngineRequestHandlers,
  type EngineSettings,
  type InitializeResult,
  type PermissionSettings,
  type RequestMethod,
  type RpcPeer,
  type SessionEvent,
  type SessionSummary,
  type TranscriptEntry,
  type WorkspaceInfo,
} from "@trace/protocol";
import { discoverCommands } from "./commands.js";
import { countLines } from "./diff.js";
import { FileSearch } from "./file-search.js";
import { CheckpointManager } from "./git/checkpoint.js";
import { gitAvailable } from "./git/run.js";
import { gitDiff, gitStatus } from "./git/status.js";
import { Logger } from "./logger.js";
import { MODELS, resolveModel } from "./models.js";
import { looksBinary, resolveInWorkspace } from "./paths.js";
import { AnthropicProvider } from "./providers/anthropic.js";
import { discoverRules } from "./rules.js";
import { Session } from "./session/session.js";
import { SessionStore, newSessionMeta } from "./session/store.js";
import { KNOWN_PROVIDERS, SettingsStore, traceHome } from "./settings.js";
import { TerminalManager } from "./terminal.js";
import { textSearch } from "./tools/search-tools.js";
import { WorkspaceRegistry, type Workspace } from "./workspace.js";

const log = new Logger("engine");

/**
 * Read from the package rather than duplicated as a constant.
 *
 * A hand-maintained version string drifts from `package.json` the first time someone
 * bumps one and not the other, and the client uses this to decide whether it is talking
 * to an engine it understands.
 */
const ENGINE_VERSION = ((): string => {
  try {
    const pkg = createRequire(import.meta.url)("../package.json") as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
})();

/** Largest file `fs/read` will return whole. Past this the client should page it. */
const MAX_FS_READ_BYTES = 20 * 1024 * 1024;

/** Cap on `session/search` results and on how much of a transcript is scanned per hit. */
const SEARCH_SNIPPET_RADIUS = 80;

/**
 * A handler with its parameter type erased.
 *
 * Only used at the registration boundary, where the handler table is iterated as a
 * union-keyed object. Erasing there is what lets `guard` be written once instead of
 * thirty-four times; the precise types are still enforced where the handlers are
 * *declared*, which is the place a mistake would be made.
 */
type ErasedHandler = (params: never) => unknown;

export interface EngineOptions {
  /** Defaults to `~/.trace`. Overridden by tests and portable installs. */
  home?: string;
  /**
   * Called once, after the engine has finished winding down.
   *
   * Exists because `shutdown` can arrive as a *request*, and the engine has no opinion
   * about whether the process it lives in should then exit — an out-of-process engine
   * should, an in-process one embedded in the desktop app must not. Fired after the
   * final drain so a host acting on it cannot race a pending write.
   */
  onShutdown?: () => void;
}

export class Engine {
  private readonly workspaces = new WorkspaceRegistry();
  private readonly settings: SettingsStore;
  private readonly provider: AnthropicProvider;
  private readonly store: SessionStore;
  private readonly terminals: TerminalManager;
  private readonly files: FileSearch;
  private readonly home: string;

  /** Sessions someone has touched this run. The rest are on disk until asked for. */
  private readonly live = new Map<string, Session>();
  /** One checkpoint store per workspace, created on first use. */
  private readonly checkpoints = new Map<string, CheckpointManager>();

  private client: ClientInfo | null = null;
  private readonly loaded: Promise<void>;
  private shuttingDown = false;
  private detachLogSink: (() => void) | null = null;
  private readonly onShutdown: (() => void) | null;

  constructor(
    private readonly peer: RpcPeer,
    options: EngineOptions = {},
  ) {
    this.home = options.home ?? traceHome();
    this.onShutdown = options.onShutdown ?? null;
    this.settings = new SettingsStore(this.home);
    this.store = new SessionStore(this.home);
    this.files = new FileSearch(this.workspaces);
    this.provider = new AnthropicProvider(
      () => this.settings.getKey("anthropic"),
      log.child("anthropic"),
    );
    this.terminals = new TerminalManager({
      onOutput: (terminalId, data) => this.peer.notify("terminal/output", { terminalId, data }),
      onExit: (terminalId, exitCode, signal) =>
        this.peer.notify("terminal/exited", {
          terminalId,
          exitCode,
          ...(signal === undefined ? {} : { signal }),
        }),
    });

    // Registered synchronously, before the first frame can be decoded. The load it
    // depends on is awaited by `initialize`, which every other method requires.
    this.register();
    this.loaded = this.settings.load().catch((cause: unknown) => {
      log.error("Could not load settings; running on defaults", cause);
    });

    // Engine logs become `log` notifications, so the desktop app can show internals
    // without asking the user to find a file on disk.
    this.detachLogSink = Logger.addSink((entry) => this.peer.notify("log", entry));
  }

  // -----------------------------------------------------------------------
  // Registration
  // -----------------------------------------------------------------------

  /**
   * Bind every method.
   *
   * The table is declared as `EngineRequestHandlers` so the compiler checks it against
   * the protocol; `guard` then wraps everything but `initialize` with the handshake and
   * shutdown checks. Wrapping after the fact rather than inside each handler means the
   * gate cannot be forgotten when a method is added.
   */
  private register(): void {
    const handlers: EngineRequestHandlers = {
      initialize: async (params) => {
        if (this.client) {
          throw new RpcError(
            ErrorCode.AlreadyInitialized,
            "This connection has already been initialized.",
          );
        }
        if (params.protocolVersion !== PROTOCOL_VERSION) {
          throw new RpcError(
            ErrorCode.ProtocolVersionMismatch,
            `This engine speaks protocol version ${PROTOCOL_VERSION}; the client asked for ${params.protocolVersion}.`,
            { engine: PROTOCOL_VERSION, client: params.protocolVersion },
          );
        }
        await this.loaded;
        this.client = params.client;

        // Opened before the response, so a client that renders its workspace list from
        // the handshake has one. A root that cannot be opened is logged and skipped
        // rather than failing the handshake: one stale folder in a restored window
        // layout should not stop the app from starting.
        for (const root of params.workspaceRoots) {
          try {
            await this.workspaces.open(root);
          } catch (cause) {
            log.warn(`Could not open workspace root "${root}"`, cause);
          }
        }

        const result: InitializeResult = {
          protocolVersion: PROTOCOL_VERSION,
          engineVersion: ENGINE_VERSION,
          configuredProviders: this.settings.configuredProviders(),
          defaultModel: this.settings.get().defaultModel,
        };
        log.info(`Initialized for ${params.client.name} ${params.client.version}`, {
          workspaces: this.workspaces.list().length,
          providers: result.configuredProviders,
          terminals: this.terminals.available,
        });
        return result;
      },

      shutdown: async () => {
        await this.shutdown();
        return null;
      },

      // ---- workspace ----

      "workspace/open": async (params) => {
        const workspace = await this.workspaces.open(params.root);
        return this.workspaces.toInfo(workspace);
      },

      "workspace/list": async () => {
        const workspaces: WorkspaceInfo[] = [];
        for (const workspace of this.workspaces.list()) {
          workspaces.push(await this.workspaces.toInfo(workspace));
        }
        return { workspaces };
      },

      "workspace/close": (params) => {
        this.workspaces.close(params.workspaceId);
        this.checkpoints.delete(params.workspaceId);
        this.files.invalidate(params.workspaceId);
        return null;
      },

      /**
       * Semantic indexing is not built yet.
       *
       * The honest response is to leave `indexStatus` at `absent` and say so. Emitting
       * an `index/progress` run that ends in `done` would make the UI show a ready index
       * and make `codebase_search` look broken rather than absent.
       */
      "workspace/index": (params) => {
        const workspace = this.workspaces.get(params.workspaceId);
        log.warn(`Semantic indexing is not implemented; ${workspace.name} stays unindexed`);
        return null;
      },

      // ---- session ----

      "session/create": async (params) => {
        const session = await this.createSession(params);
        return session.summary();
      },

      "session/list": async (params) => {
        const stored = await this.store.list();
        const sessions = stored
          .map((meta) => this.overlayLive(meta))
          .filter((meta) =>
            params.workspaceId === undefined ? true : meta.workspaceId === params.workspaceId,
          );
        return { sessions };
      },

      "session/get": async (params) => (await this.requireSession(params.sessionId)).summary(),

      "session/rename": async (params) => {
        (await this.requireSession(params.sessionId)).setTitle(params.title);
        return null;
      },

      "session/delete": async (params) => {
        const session = this.live.get(params.sessionId);
        if (session) {
          await session.close();
          this.live.delete(params.sessionId);
        }
        await this.store.delete(params.sessionId);
        log.info(`Deleted session ${params.sessionId}`);
        return null;
      },

      "session/history": async (params) => {
        const session = await this.requireSession(params.sessionId);
        return { entries: pageHistory(session.entries(), params.limit, params.before) };
      },

      "session/prompt": async (params) => {
        const session = await this.requireSession(params.sessionId);
        return session.prompt(params);
      },

      "session/interrupt": async (params) => {
        (await this.requireSession(params.sessionId)).interrupt();
        return null;
      },

      "session/resolvePermission": async (params) => {
        (await this.requireSession(params.sessionId)).resolvePermission(
          params.callId,
          params.decision,
        );
        return null;
      },

      "session/steer": async (params) => {
        (await this.requireSession(params.sessionId)).steer(params.text);
        return null;
      },

      "session/search": async (params) => ({
        hits: await this.searchSessions(params.query, params.limit),
      }),

      // ---- checkpoints ----

      "checkpoint/list": async (params) => {
        const session = await this.requireSession(params.sessionId);
        const manager = await this.checkpointManager(session.root);
        if (!manager) return { checkpoints: [] };
        const records = await manager.list(params.sessionId);
        return {
          checkpoints: records.map(({ id, label, at, turnId }) => ({ id, label, at, turnId })),
        };
      },

      "checkpoint/restore": async (params) => {
        const session = await this.requireSession(params.sessionId);
        const manager = await this.checkpointManager(session.root);
        if (!manager) {
          throw new RpcError(
            ErrorCode.InvalidParams,
            "This session has no checkpoint store, so there is nothing to restore.",
          );
        }
        // A restore mid-turn would put files back underneath a tool call that is
        // reading them. Stopping the turn first is the only coherent order.
        session.interrupt();
        const result = await manager.restore(params.checkpointId);
        session.forgetFileState();
        return { restoredFiles: result.restoredFiles };
      },

      // ---- filesystem ----

      "fs/read": async (params) => {
        const resolved = await resolveInWorkspace(params.path, this.workspaces.roots());
        const info = await this.statFile(resolved.absolute, params.path);
        if (info.size > MAX_FS_READ_BYTES) {
          throw new RpcError(
            ErrorCode.InvalidParams,
            `"${resolved.relative}" is ${formatBytes(info.size)}, larger than this method returns.`,
          );
        }

        const buffer = await readFile(resolved.absolute);
        if (looksBinary(buffer)) {
          throw new RpcError(ErrorCode.InvalidParams, `"${resolved.relative}" is a binary file.`, {
            sizeBytes: info.size,
          });
        }

        const content = buffer.toString("utf8");
        const totalLines = countLines(content);
        if (params.startLine === undefined && params.endLine === undefined) {
          return { content, totalLines, truncated: false };
        }

        // 1-indexed and inclusive, matching every editor the client could be.
        const from = Math.max(1, params.startLine ?? 1);
        const to = Math.min(totalLines, params.endLine ?? totalLines);
        const lines = content.split("\n").slice(from - 1, to);
        return {
          content: lines.join("\n"),
          totalLines,
          truncated: from > 1 || to < totalLines,
        };
      },

      /**
       * Write a file on the user's behalf.
       *
       * Not permission-gated, and that is deliberate: this is the *user* saving an edit
       * from the work panel, not the agent writing. The permission system exists to
       * adjudicate what the model does; asking someone to approve their own keystrokes
       * would be theatre.
       */
      "fs/write": async (params) => {
        const resolved = await resolveInWorkspace(params.path, this.workspaces.roots());
        await mkdir(path.dirname(resolved.absolute), { recursive: true });
        await writeFile(resolved.absolute, params.content, "utf8");
        if (path.basename(resolved.absolute) === ".gitignore") {
          this.workspaces.invalidateIgnores(path.dirname(resolved.absolute));
        }
        // A file the user just created should be `@`-mentionable now, not once the
        // picker's snapshot ages out.
        this.files.invalidate(this.workspaces.owning(resolved.absolute)?.id);
        log.debug(`Wrote ${resolved.relative}`, { bytes: params.content.length });
        return null;
      },

      "fs/list": async (params) => {
        const resolved = await resolveInWorkspace(params.path, this.workspaces.roots());
        const workspace = this.workspaces.owning(resolved.absolute);
        if (!workspace) {
          throw new RpcError(
            ErrorCode.PathOutsideWorkspace,
            `"${params.path}" is not inside an open workspace.`,
          );
        }
        return { entries: await this.workspaces.listDir(workspace, resolved.absolute) };
      },

      "search/text": async (params) => {
        const workspace = this.searchRoot(params.path);
        if (!workspace) return { matches: [], truncated: false };
        try {
          return await textSearch(workspace, {
            pattern: params.query,
            ...(params.path === undefined ? {} : { path: params.path }),
            ...(params.include === undefined ? {} : { include: params.include }),
            ...(params.isRegex === undefined ? {} : { isRegex: params.isRegex }),
            ...(params.limit === undefined ? {} : { limit: params.limit }),
          });
        } catch (cause) {
          // A malformed regex is the user still typing, not a broken engine.
          throw new RpcError(
            ErrorCode.InvalidParams,
            cause instanceof Error ? cause.message : String(cause),
          );
        }
      },

      "search/files": (params) =>
        this.files.search({
          query: params.query,
          ...(params.limit === undefined ? {} : { limit: params.limit }),
          ...(params.workspaceId === undefined ? {} : { workspaceId: params.workspaceId }),
          ...(params.includeDirectories === undefined
            ? {}
            : { includeDirectories: params.includeDirectories }),
        }),

      // ---- git ----

      "git/status": (params) => gitStatus(this.workspaces.get(params.workspaceId)),

      "git/diff": async (params) => ({
        diff: await gitDiff(this.workspaces.get(params.workspaceId), {
          ...(params.path === undefined ? {} : { path: params.path }),
          ...(params.staged === undefined ? {} : { staged: params.staged }),
        }),
      }),

      // ---- terminals ----

      "terminal/create": (params) => {
        const workspace = this.workspaces.find(params.workspaceId);
        // Priority: an explicit cwd, then the named workspace, then the first open one.
        // A terminal that opens in the engine's own working directory is never what the
        // user meant, so falling through to `process.cwd()` is not an option.
        const cwd = params.cwd ?? workspace?.root ?? this.workspaces.roots()[0];
        if (cwd === undefined) {
          throw new RpcError(
            ErrorCode.WorkspaceNotFound,
            "Open a folder before opening a terminal.",
          );
        }
        return this.terminals.create({
          cwd,
          cols: params.cols,
          rows: params.rows,
          ...(params.shell === undefined ? {} : { shell: params.shell }),
        });
      },

      "terminal/input": (params) => {
        this.terminals.write(params.terminalId, params.data);
        return null;
      },

      "terminal/resize": (params) => {
        this.terminals.resize(params.terminalId, params.cols, params.rows);
        return null;
      },

      "terminal/close": (params) => {
        this.terminals.close(params.terminalId);
        return null;
      },

      // ---- settings ----

      "settings/get": () => this.settings.get(),

      "settings/update": async (params) => {
        const patch = sanitizeSettings(params.patch);
        const updated = await this.settings.update(patch);
        log.info("Settings updated", { fields: Object.keys(patch) });
        return updated;
      },

      "settings/setProviderKey": async (params) => {
        requireKnownProvider(params.provider);
        const changed = this.settings.getKey(params.provider) !== params.apiKey.trim();
        const status = this.settings.setKey(params.provider, params.apiKey);
        // The cached SDK client holds the old key.
        this.provider.reset();
        if (!status.configured || !changed) return status;

        // Probed only when the key actually changed. The desktop app re-sends the same
        // key on every engine start — probing that would put a network round-trip on
        // the boot path for no information.
        const validated = await this.probeKey(params.provider);
        return validated === undefined ? status : { ...status, validated };
      },

      "settings/deleteProviderKey": (params) => {
        requireKnownProvider(params.provider);
        this.settings.deleteKey(params.provider);
        this.provider.reset();
        return null;
      },

      "settings/providerKeys": () => ({ keys: this.settings.allStatuses() }),

      // ---- models ----

      "models/list": () => ({ models: [...MODELS] }),

      // ---- prompt commands ----

      /**
       * Only the file-backed ones. Builtins that drive a surface (`/model`, `/terminal`)
       * are that surface's business, and an engine listing commands it cannot run would
       * make every client filter the list back down to what it recognises.
       */
      "commands/list": (params) =>
        discoverCommands({
          workspaces:
            params.workspaceId === undefined
              ? this.workspaces.list()
              : [this.workspaces.get(params.workspaceId)],
          home: this.home,
        }).then((commands) => ({ commands })),

      // ---- rules ----

      "rules/list": (params) =>
        this.loadRules(params.workspaceId).then((rules) => ({
          rules: rules.map((rule) => ({
            name: rule.name,
            description: rule.description,
            activation: rule.activation,
            source: rule.source,
            // Copied because the protocol type is mutable and the rule's is readonly;
            // handing the client an alias of engine state is how it ends up mutated.
            globs: [...rule.globs],
            path: rule.path,
            workspaceId: rule.workspaceId,
            body: rule.body,
          })),
        })),
    };

    // `handleAll` accepts a `Partial`, so the completeness guarantee comes from the
    // `EngineRequestHandlers` annotation above rather than from this call. The erasure
    // below is the same one `RpcPeer` performs internally, and for the same reason: a
    // table keyed by the *union* of methods cannot hold per-method handlers, because
    // `RequestHandler<M>` is contravariant in its parameter.
    const guarded: Record<string, ErasedHandler> = {};
    for (const [method, handler] of Object.entries(handlers) as [RequestMethod, ErasedHandler][]) {
      guarded[method] = method === "initialize" ? handler : this.guard(method, handler);
    }
    this.peer.handleAll(guarded as Parameters<RpcPeer["handleAll"]>[0]);
  }

  /**
   * The one gate every method but `initialize` passes through.
   *
   * `shutdown` is exempt from both checks: a client that never completed the handshake
   * should still be able to ask the engine to stop, and asking twice is a no-op rather
   * than an error.
   */
  private guard(method: RequestMethod, handler: ErasedHandler): ErasedHandler {
    return (params) => {
      if (method !== "shutdown") {
        if (this.shuttingDown) {
          throw new RpcError(
            ErrorCode.ShuttingDown,
            `The engine is shutting down; "${method}" was refused.`,
          );
        }
        if (this.client === null) {
          throw new RpcError(
            ErrorCode.NotInitialized,
            `"${method}" arrived before the handshake. Call initialize first.`,
          );
        }
      }
      return handler(params);
    };
  }

  // -----------------------------------------------------------------------
  // Sessions
  // -----------------------------------------------------------------------

  /**
   * The dependency bundle every session shares.
   *
   * Built per session rather than once, because `checkpoints` closes over the session's
   * own id and workspace — a checkpoint has to be attributable to the session that took
   * it, or `checkpoint/list` shows another agent's snapshots.
   */
  private async depsFor(sessionId: string, workspace: Workspace | null) {
    const manager = await this.checkpointManager(workspace);
    return {
      workspaces: this.workspaces,
      settings: this.settings,
      provider: this.provider,
      store: this.store,
      checkpoints: manager
        ? (turnId: string) => ({
            create: (label: string) => manager.create({ sessionId, turnId, label }),
          })
        : null,
      // Scoped to the session's own workspace, not every open root: a session works in
      // one repository, and a multi-root window should not apply the other project's
      // conventions to it. Null workspace still gets user-global rules, which is right —
      // "always use conventional commits" does not need a repository to be true.
      rules: () => this.loadRules(workspace?.id),
      emit: (event: SessionEvent) => this.peer.notify("session/event", event),
      // Rules-only adjudication for a client that cannot show a dialog: prompting one
      // would hang the turn on a question nobody can see.
      canPrompt: this.client?.capabilities.permissionPrompts ?? false,
      log: log.child(`session:${sessionId.slice(0, 8)}`),
    };
  }

  /**
   * Discover rules, for a single workspace or for all of them.
   *
   * Shared by `rules/list` and by every session's loader so the settings surface and the
   * agent cannot disagree about what is in effect — the first thing a user does when a
   * rule appears not to work is open that list and check.
   */
  private loadRules(workspaceId: string | undefined) {
    return discoverRules({
      workspaces:
        workspaceId === undefined ? this.workspaces.list() : [this.workspaces.get(workspaceId)],
      home: this.home,
    });
  }

  private async createSession(params: {
    workspaceId?: string | null;
    model?: string;
    parentSessionId?: string;
    inheritContext?: boolean;
  }): Promise<Session> {
    const parent =
      params.parentSessionId === undefined
        ? null
        : await this.requireSession(params.parentSessionId);

    // A side chat defaults to its parent's workspace: a chat about the code should be
    // able to read the code without the client having to restate where it is.
    const workspaceId = params.workspaceId ?? parent?.summary().workspaceId ?? null;
    const workspace = this.workspaces.find(workspaceId) ?? null;
    if (workspaceId !== null && workspace === null) {
      throw new RpcError(ErrorCode.WorkspaceNotFound, `No workspace with id "${workspaceId}"`);
    }

    const meta = newSessionMeta({
      id: randomUUID(),
      workspaceId: workspace?.id ?? null,
      model: resolveModel(params.model ?? this.settings.get().defaultModel).id,
      now: Date.now(),
    });
    await this.store.create(meta);

    const deps = await this.depsFor(meta.id, workspace);
    let session: Session;
    if (parent && params.inheritContext === true) {
      const { history, transcript } = parent.inheritableContext();
      session = Session.restore(deps, meta, workspace, history, transcript);
      this.store.saveHistory(meta.id, history);
      // The store serializes appends per session, so these land in order.
      for (const entry of transcript) this.store.append(meta.id, entry);
    } else {
      session = Session.create(deps, meta, workspace);
    }

    this.live.set(meta.id, session);
    log.info(`Created session ${meta.id.slice(0, 8)}`, {
      workspace: workspace?.name ?? null,
      model: meta.model,
      inherited: parent !== null && params.inheritContext === true,
    });
    return session;
  }

  /**
   * The live session for an id, restoring it from disk if nobody has opened it yet.
   *
   * The restore is what makes every session-scoped method work after a restart without
   * the client having to re-open anything: it sends the id it has, and the engine
   * reconstitutes the conversation the model was having.
   */
  private async requireSession(sessionId: string): Promise<Session> {
    const existing = this.live.get(sessionId);
    if (existing) return existing;

    const loaded = await this.store.load(sessionId);
    if (!loaded) {
      throw new RpcError(ErrorCode.SessionNotFound, `No session with id "${sessionId}"`);
    }
    const workspace = this.workspaces.find(loaded.meta.workspaceId) ?? null;
    const deps = await this.depsFor(loaded.meta.id, workspace);
    const session = Session.restore(
      deps,
      loaded.meta,
      workspace,
      loaded.history,
      loaded.transcript,
    );
    this.live.set(sessionId, session);
    log.debug(`Restored session ${sessionId.slice(0, 8)} from disk`, {
      entries: loaded.transcript.length,
      messages: loaded.history.length,
    });
    return session;
  }

  /**
   * Stored metadata with the live session's runtime state layered on.
   *
   * `isActive` is the field that matters: it is process state, and the store
   * deliberately reads it back as false. Overlaying here, in the one place the two
   * views meet, is what keeps a stop button from appearing on a session that is not
   * running — and from *not* appearing on one that is.
   */
  private overlayLive(meta: SessionSummary): SessionSummary {
    return this.live.get(meta.id)?.summary() ?? meta;
  }

  /**
   * Full-text search over every session's transcript.
   *
   * A scan, not an index, for the same reason `session/list` is a scan: an index is a
   * second copy of the truth that can disagree with it, and at the scale of one user's
   * session history the difference is imperceptible. Each session contributes at most
   * one hit — its first — because the result list is a way to *find a conversation*,
   * not to enumerate every mention inside one.
   */
  private async searchSessions(
    query: string,
    limit?: number,
  ): Promise<{ sessionId: string; title: string; snippet: string; at: number }[]> {
    const needle = query.trim().toLowerCase();
    if (needle === "") return [];
    const cap = Math.max(1, Math.min(limit ?? 50, 200));

    const hits: { sessionId: string; title: string; snippet: string; at: number }[] = [];
    for (const stored of await this.store.list()) {
      if (hits.length >= cap) break;
      // Overlaid for the same reason `session/list` is: a rename is queued to disk, so
      // the scan can still be holding the old title. Searching for what the user just
      // typed into the rename box and not finding it is the worst kind of wrong.
      const meta = this.overlayLive(stored);

      // The title is matched first and without reading the transcript: it is the thing
      // the user is most likely to be searching for, and it is already in hand.
      if (meta.title.toLowerCase().includes(needle)) {
        hits.push({
          sessionId: meta.id,
          title: meta.title,
          snippet: meta.title,
          at: meta.updatedAt,
        });
        continue;
      }

      const transcript =
        this.live.get(meta.id)?.entries() ?? (await this.store.readTranscript(meta.id));
      for (const entry of transcript) {
        const text = searchableText(entry);
        const at = text.toLowerCase().indexOf(needle);
        if (at < 0) continue;
        hits.push({
          sessionId: meta.id,
          title: meta.title,
          snippet: snippetAround(text, at, needle.length),
          at: entry.at,
        });
        break;
      }
    }
    return hits;
  }

  // -----------------------------------------------------------------------
  // Checkpoints
  // -----------------------------------------------------------------------

  /**
   * The checkpoint store for a workspace, or null when there can't be one.
   *
   * Null means one of two things: the session has no workspace to snapshot, or git is
   * not on PATH. Notably *not* "the folder is not a git repo" — the shadow repository is
   * created by Trace under `~/.trace`, so a plain directory checkpoints exactly as well
   * as a cloned one.
   */
  private async checkpointManager(workspace: Workspace | null): Promise<CheckpointManager | null> {
    if (!workspace) return null;
    const existing = this.checkpoints.get(workspace.id);
    if (existing) return existing;
    if (!(await gitAvailable())) return null;
    const manager = new CheckpointManager(workspace, this.home);
    this.checkpoints.set(workspace.id, manager);
    return manager;
  }

  // -----------------------------------------------------------------------
  // Odds and ends
  // -----------------------------------------------------------------------

  /**
   * Which workspace `search/text` searches.
   *
   * A relative path is relative to *a* workspace, and with several open there is no way
   * to tell which from the path alone — so the first one wins, matching what the search
   * panel shows. An absolute path names its workspace unambiguously, so that case is
   * resolved properly rather than guessed.
   */
  private searchRoot(relativePath: string | undefined): Workspace | undefined {
    const open = this.workspaces.list();
    if (relativePath === undefined || !path.isAbsolute(relativePath)) return open[0];
    return this.workspaces.owning(path.resolve(relativePath)) ?? open[0];
  }

  private async statFile(absolute: string, requested: string) {
    try {
      const info = await stat(absolute);
      if (!info.isFile()) {
        throw new RpcError(ErrorCode.InvalidParams, `"${requested}" is not a file.`);
      }
      return info;
    } catch (cause) {
      if (cause instanceof RpcError) throw cause;
      throw new RpcError(ErrorCode.FileNotFound, `Cannot read "${requested}"`, {
        reason: (cause as NodeJS.ErrnoException).code ?? "unknown",
      });
    }
  }

  /** One-token probe, reported as a boolean. The reason is logged, never returned. */
  /**
   * A one-token live call, to tell "wrong key" from "wrong prompt" at the moment the
   * key is entered rather than three seconds into the user's first turn.
   *
   * `undefined` means *no verdict*, not "invalid". Only the direct Anthropic path can
   * be probed from here; a gateway account token is minted by an authenticated sign-in
   * that already proved it works, and reporting `validated: false` for it would put a
   * red mark next to a credential that is perfectly good.
   */
  private async probeKey(provider: string): Promise<boolean | undefined> {
    if (provider !== "anthropic") return undefined;
    const verdict = await this.provider.validateKey(resolveModel(undefined).id);
    if (!verdict.ok) log.warn(`The ${provider} key did not validate`, { reason: verdict.message });
    return verdict.ok;
  }

  /**
   * Stop cleanly.
   *
   * Order is the whole content of this method: refuse new work, then let the in-flight
   * turns write their last state, then kill the terminals, then drain the disk queue.
   * Draining first would flush a queue that the session teardown is about to add to.
   */
  async shutdown(): Promise<void> {
    if (this.shuttingDown) return;
    this.shuttingDown = true;
    log.info("Shutting down");

    await Promise.all(
      [...this.live.values()].map((session) =>
        session.close().catch((cause: unknown) => {
          log.error(`Could not close session ${session.id.slice(0, 8)}`, cause);
        }),
      ),
    );
    this.live.clear();
    this.terminals.closeAll();
    await this.store.drain();

    // Detached last: everything above is worth logging, and a sink that outlives the
    // peer would try to write to a closed transport.
    this.detachLogSink?.();
    this.detachLogSink = null;

    // After the drain, so a host that exits the process on this signal cannot truncate
    // a write that was still in flight. Its own failure is not this method's problem —
    // shutdown has already succeeded by the time it runs.
    try {
      this.onShutdown?.();
    } catch (cause) {
      log.error("The shutdown hook threw", cause);
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * The tail of a transcript, oldest-first.
 *
 * `before` is exclusive and `limit` counts backwards from it, because the client is a
 * chat view scrolling up: it asks for "the 50 entries before the oldest one I have".
 * Returning them in reverse would make every caller re-sort.
 */
function pageHistory(
  entries: TranscriptEntry[],
  limit?: number,
  before?: number,
): TranscriptEntry[] {
  const window = before === undefined ? entries : entries.filter((entry) => entry.at < before);
  if (limit === undefined) return window;
  return window.slice(Math.max(0, window.length - Math.max(0, limit)));
}

/** The part of an entry a person would search for. */
function searchableText(entry: TranscriptEntry): string {
  switch (entry.kind) {
    case "user_message":
    case "assistant_text":
    case "assistant_thinking":
      return entry.text;
    case "tool_call":
      return `${entry.tool} ${entry.summary}`;
    case "todos":
      return entry.todos.map((todo) => todo.content).join("\n");
    case "checkpoint":
      return entry.label;
    case "error":
      return entry.message;
  }
}

/** A window of text around a match, with ellipses where it was cut. */
function snippetAround(text: string, at: number, length: number): string {
  const from = Math.max(0, at - SEARCH_SNIPPET_RADIUS);
  const to = Math.min(text.length, at + length + SEARCH_SNIPPET_RADIUS);
  const body = text.slice(from, to).replace(/\s+/g, " ").trim();
  return `${from > 0 ? "…" : ""}${body}${to < text.length ? "…" : ""}`;
}

/**
 * Drop settings fields a client should not be able to set, and clamp the rest.
 *
 * `settings/update` takes a `Partial<EngineSettings>` straight off the wire, and the
 * types on it are a compile-time claim about a well-behaved client, not a runtime fact.
 * A client that sends `maxIterationsPerTurn: 100000` — or a string where a number belongs
 * — would otherwise have it persisted and then read back by the turn loop.
 *
 * Fields are enumerated rather than filtered by a deny-list, so a field added to
 * `EngineSettings` is inert here until it is deliberately allowed. That is the failure
 * this shape is chosen for: a new setting that silently becomes client-writable is much
 * harder to notice than one that does not work yet.
 */
function sanitizeSettings(patch: Partial<EngineSettings>): Partial<EngineSettings> {
  const clean: Partial<EngineSettings> = {};

  if (typeof patch.defaultModel === "string")
    clean.defaultModel = resolveModel(patch.defaultModel).id;

  if (
    typeof patch.maxIterationsPerTurn === "number" &&
    Number.isFinite(patch.maxIterationsPerTurn)
  ) {
    clean.maxIterationsPerTurn = Math.max(1, Math.min(500, Math.floor(patch.maxIterationsPerTurn)));
  }
  if (typeof patch.effort === "string" && (EFFORTS as readonly string[]).includes(patch.effort)) {
    clean.effort = patch.effort;
  }
  if (typeof patch.showThinking === "boolean") clean.showThinking = patch.showThinking;
  if (typeof patch.checkpointsEnabled === "boolean") {
    clean.checkpointsEnabled = patch.checkpointsEnabled;
  }

  const permissions = sanitizePermissions(patch.permissions);
  if (permissions) clean.permissions = permissions;
  return clean;
}

const EFFORTS = ["low", "medium", "high", "xhigh", "max"] as const;
const MODES = ["ask", "auto_edit", "yolo", "plan"] as const;
const ACTIONS = ["allow", "deny", "ask"] as const;

/**
 * Validate a permission block, or reject it whole.
 *
 * Rejected whole rather than repaired, because a half-applied permission set is the
 * worst outcome available here: the user would be told their rules were saved while
 * running under a different set than the one they wrote. `HARD_DENY_RULES` sit above
 * whatever survives this, so a malformed rule cannot widen anything — but a *dropped*
 * deny rule would narrow the user's own protections without saying so.
 */
function sanitizePermissions(
  value: PermissionSettings | undefined,
): PermissionSettings | undefined {
  if (value === undefined || typeof value !== "object") return undefined;
  if (!(MODES as readonly string[]).includes(value.mode)) return undefined;
  if (!Array.isArray(value.rules)) return undefined;

  for (const rule of value.rules) {
    if (typeof rule !== "object" || rule === null) return undefined;
    if (typeof rule.tool !== "string") return undefined;
    if (!(ACTIONS as readonly string[]).includes(rule.action)) return undefined;
    if (rule.pattern !== undefined && typeof rule.pattern !== "string") return undefined;
  }
  return { mode: value.mode, rules: value.rules };
}

function requireKnownProvider(provider: string): void {
  if (!(KNOWN_PROVIDERS as readonly string[]).includes(provider)) {
    throw new RpcError(
      ErrorCode.InvalidParams,
      `Unknown provider "${provider}". This engine knows: ${KNOWN_PROVIDERS.join(", ")}.`,
    );
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export { ENGINE_VERSION };
