/**
 * A session: one conversation, its history, and at most one turn in flight.
 *
 * Everything with a lifetime longer than a turn lives here — the message history, the
 * read-before-write tracker, the todo list, the accumulated cost — so `Turn` can stay a
 * thing that runs once and is thrown away.
 *
 * Two responsibilities are worth calling out because they are the ones a naive version
 * gets wrong:
 *
 * **Permission round-trips.** A tool call that needs approval blocks the turn on a
 * promise that only a later, unrelated JSON-RPC request can settle. Owning that map
 * here — rather than in the turn loop, which would then need to know about the
 * transport — is what keeps `turn.ts` free of RPC plumbing.
 *
 * **Nothing may outlive the turn it belongs to.** A pending prompt whose turn was
 * interrupted has to be rejected, not left dangling; a session being closed has to
 * reject the lot. An abandoned deferred is an agent that never finishes and a UI that
 * never re-enables its input.
 *
 * Copyright (c) 2026 Origin AI
 */

import { randomUUID } from "node:crypto";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import {
  ErrorCode,
  RpcError,
  type PermissionDecision,
  type PromptParams,
  type PromptResult,
  type SessionEvent,
  type SessionSummary,
  type TodoItem,
  type TranscriptEntry,
} from "@trace/protocol";
import { FileStateTracker } from "../file-state.js";
import type { Logger } from "../logger.js";
import type { AnthropicProvider } from "../providers/anthropic.js";
import type { RulesLoader } from "../rules.js";
import type { SettingsStore } from "../settings.js";
import type { Workspace, WorkspaceRegistry } from "../workspace.js";
import { addCost, titleFromPrompt, DEFAULT_SESSION_TITLE, type SessionStore } from "./store.js";
import { TranscriptBuilder } from "./transcript.js";
import { Turn, type CheckpointWriter } from "./turn.js";

export interface SessionDeps {
  workspaces: WorkspaceRegistry;
  settings: SettingsStore;
  provider: AnthropicProvider;
  store: SessionStore;
  /**
   * Builds the turn-scoped checkpoint writer.
   *
   * A factory rather than a fixed writer because a checkpoint is labelled with the turn
   * it belongs to, and the turn id does not exist until the prompt arrives. Null when
   * checkpoints are unavailable — which means git is not on PATH, or the session has no
   * workspace to snapshot. Notably *not* the same as "the folder is not a git repo": the
   * shadow repo is created by Trace, so any folder can be checkpointed.
   */
  checkpoints: ((turnId: string) => CheckpointWriter) | null;
  /**
   * Reads the rules visible to this session, fresh on every turn.
   *
   * A loader rather than a snapshot because rules are files the user edits while the
   * session is open, and the alternative — caching them at session start — produces the
   * bug where someone fixes a rule, sends another message, and sees the old behaviour.
   */
  rules: RulesLoader;
  /** Fan events out to every subscribed client. */
  emit(event: SessionEvent): void;
  /** False for clients that cannot render a permission dialog. */
  canPrompt: boolean;
  log: Logger;
}

interface Deferred {
  resolve(decision: PermissionDecision): void;
  reject(cause: unknown): void;
}

export class Session {
  private readonly history: MessageParam[];
  private readonly transcript: TranscriptEntry[];
  private readonly files = new FileStateTracker();
  private readonly builder: TranscriptBuilder;
  private readonly pending = new Map<string, Deferred>();
  private readonly steerQueue: string[] = [];
  /**
   * Auto-attached rules already delivered, by name.
   *
   * Session-scoped rather than turn-scoped, because the dedupe is only worth anything
   * across turns: the agent touches the same kinds of file on nearly every turn of a
   * task, and re-sending the rule each time pays for the same instruction repeatedly.
   */
  private readonly attachedRules = new Set<string>();
  /**
   * `path` → the shadow commit the user last accepted that path at.
   *
   * Session state rather than workspace state, because "reviewed" is a fact about this
   * conversation: two sessions in one folder are answerable for their own edits, and an
   * accept in one has no business hiding the other's work. Persisted through
   * `SessionStore` — see `StoredReview` for why forgetting it is data loss.
   */
  private reviewBaselines: Record<string, string> = {};
  private todos: TodoItem[] = [];
  private activeTurn: Turn | null = null;
  /** The in-flight turn's promise, so `close` can wait for its last write. */
  private running: Promise<void> | null = null;
  private meta: SessionSummary;

  private constructor(
    private readonly deps: SessionDeps,
    meta: SessionSummary,
    private readonly workspace: Workspace | null,
    history: MessageParam[],
    transcript: TranscriptEntry[],
  ) {
    this.meta = meta;
    this.history = history;
    this.transcript = transcript;
    this.builder = new TranscriptBuilder((entry) => {
      this.transcript.push(entry);
      this.deps.store.append(this.meta.id, entry);
    });
  }

  static create(deps: SessionDeps, meta: SessionSummary, workspace: Workspace | null): Session {
    return new Session(deps, meta, workspace, [], []);
  }

  /** Reopen a persisted session, with the model's view of it intact. */
  static restore(
    deps: SessionDeps,
    meta: SessionSummary,
    workspace: Workspace | null,
    history: MessageParam[],
    transcript: TranscriptEntry[],
    reviewBaselines: Record<string, string> = {},
  ): Session {
    const session = new Session(deps, meta, workspace, history, transcript);
    // Recovered from the transcript rather than stored separately. The todo list is
    // derived state — the last `todos` entry *is* the current list — and a second copy
    // on disk is a second thing that can disagree with it.
    session.todos = lastTodos(transcript);
    session.reviewBaselines = reviewBaselines;
    return session;
  }

  get id(): string {
    return this.meta.id;
  }

  get isActive(): boolean {
    return this.activeTurn !== null;
  }

  summary(): SessionSummary {
    return { ...this.meta, isActive: this.isActive };
  }

  entries(): TranscriptEntry[] {
    return [...this.transcript];
  }

  /** The workspace this session works in, or null in the "No Repo" case. */
  get root(): Workspace | null {
    return this.workspace;
  }

  /**
   * Everything a child session needs to carry this conversation forward.
   *
   * Deep-copied, not shared. A side chat diverges from its parent the moment either one
   * takes a turn, and a shared array would have each one's messages turning up in the
   * other's request to the model — which is both wrong and, since history is the bulk of
   * a request, expensive.
   */
  inheritableContext(): { history: MessageParam[]; transcript: TranscriptEntry[] } {
    return { history: structuredClone(this.history), transcript: this.entries() };
  }

  /**
   * Discard the read-before-write record.
   *
   * Called after a checkpoint restore. Every stamp the tracker holds describes a file as
   * it was on a timeline that no longer exists, so leaving them would make the agent's
   * next edit fail with "the file changed on disk" — true, but a misleading account of
   * what happened. Cleared, the agent is told it has not read the file in this session,
   * which is both accurate and actionable.
   */
  forgetFileState(): void {
    this.files.clear();
  }

  /** What each path is currently compared against for review. */
  get reviewed(): Readonly<Record<string, string>> {
    return this.reviewBaselines;
  }

  /**
   * Point `paths` at `commit`: their contents there are what future diffs compare against.
   *
   * Advancing a pointer rather than setting a flag is the whole review model — see
   * `git/review.ts`. Returns the paths recorded, which is every path given: the caller has
   * already made the commit, so there is nothing here that can partly fail.
   */
  acceptReview(paths: readonly string[], commit: string): string[] {
    for (const relativePath of paths) this.reviewBaselines[relativePath] = commit;
    this.deps.store.saveReviewBaselines(this.meta.id, this.reviewBaselines);
    return [...paths];
  }

  /**
   * Discard every review baseline.
   *
   * Called after a checkpoint restore, for the same reason as {@link forgetFileState} and a
   * sharper one. A restore rewinds the work tree, so a baseline recorded afterwards can be
   * *newer* than the file it describes — and a diff computed in that direction reads
   * backwards, offering to "revert" the agent's work by re-applying it. No baselines means
   * everything is compared against the session's start, which is always a coherent answer.
   */
  forgetReview(): void {
    this.reviewBaselines = {};
    this.deps.store.saveReviewBaselines(this.meta.id, this.reviewBaselines);
  }

  // -----------------------------------------------------------------------
  // Turns
  // -----------------------------------------------------------------------

  /**
   * Start a turn and return its id immediately.
   *
   * The turn is deliberately not awaited. A prompt is a request to *begin* work that
   * may run for minutes; blocking the JSON-RPC response on it would stall the client's
   * whole connection behind one agent.
   */
  prompt(params: PromptParams): PromptResult {
    if (this.activeTurn) {
      throw new RpcError(
        ErrorCode.TurnAlreadyActive,
        "This session already has a turn running. Interrupt it or send the message as steering text.",
      );
    }

    const turnId = randomUUID();
    if (this.meta.title === DEFAULT_SESSION_TITLE && params.text.trim() !== "") {
      this.setTitle(titleFromPrompt(params.text));
    }
    // Recorded before the turn starts: if the process dies mid-turn, the transcript
    // should still show what was asked.
    this.builder.userMessage(turnId, params.text, params.attachments ?? []);

    // The session's model is the fallback for a turn without an explicit one — not the
    // global default, which would ignore a session deliberately pinned to something
    // else. Resolved here so the turn is handed a complete request.
    const turnParams: PromptParams = { ...params, model: params.model ?? this.meta.model };

    const turn = new Turn(
      turnId,
      {
        sessionId: this.meta.id,
        workspaces: this.deps.workspaces,
        workspace: this.workspace,
        settings: this.deps.settings,
        provider: this.deps.provider,
        files: this.files,
        todos: {
          get: () => this.todos,
          set: (next) => {
            this.todos = next;
          },
        },
        checkpoints: this.deps.checkpoints?.(turnId) ?? null,
        rules: this.deps.rules,
        attachedRules: this.attachedRules,
        history: this.history,
        emit: (event) => this.observe(event),
        requestPermission: (request) => this.awaitDecision(request.callId),
        canPrompt: this.deps.canPrompt,
        takeSteer: () => this.steerQueue.splice(0, this.steerQueue.length),
        log: this.deps.log,
      },
      turnParams,
    );
    this.activeTurn = turn;

    this.running = this.runTurn(turn);
    return { turnId };
  }

  private async runTurn(turn: Turn): Promise<void> {
    try {
      await turn.run();
    } catch (cause) {
      // `Turn.run` handles its own failures, so this is a bug rather than a turn that
      // went wrong. Reported to the client so a broken engine does not look like a
      // hung one.
      this.deps.log.error("Turn escaped its own error handling", cause);
      this.observe({
        type: "error",
        sessionId: this.meta.id,
        turnId: turn.turnId,
        code: ErrorCode.InternalError,
        message: cause instanceof Error ? cause.message : String(cause),
        fatal: true,
      });
    } finally {
      this.activeTurn = null;
      this.builder.flush();
      // Anything left waiting belongs to a turn that is over.
      this.rejectPending(new RpcError(ErrorCode.TurnCancelled, "The turn ended."));
      this.steerQueue.length = 0;

      // `meta.model` is deliberately not touched. A per-turn override is a one-shot;
      // writing it back here would make "just this once, use the cheap model" stick for
      // the rest of the conversation.
      this.meta = {
        ...this.meta,
        updatedAt: Date.now(),
        turnCount: this.meta.turnCount + 1,
      };
      this.deps.store.saveHistory(this.meta.id, this.history);
      this.deps.store.saveMeta(this.meta);
    }
  }

  /**
   * Stop the running turn.
   *
   * Idempotent, and safe with no turn in flight — a stop button the user can press
   * twice is not a bug worth reporting to them.
   *
   * Order matters: aborting the turn first means a tool call blocked on a permission
   * dialog sees an already-aborted signal when its promise rejects, so the turn loop
   * recognises the rejection as an interrupt rather than as a tool that failed.
   */
  interrupt(): void {
    this.activeTurn?.interrupt();
    this.rejectPending(new RpcError(ErrorCode.TurnCancelled, "Interrupted."));
  }

  /**
   * Add to what the agent is working on without stopping it.
   *
   * Held until the current model request finishes, then delivered alongside the tool
   * results — see `TurnDeps.takeSteer`. Injecting it any earlier would mean editing a
   * request already in flight.
   */
  steer(text: string): void {
    if (!this.activeTurn) {
      throw new RpcError(
        ErrorCode.InvalidParams,
        "Nothing is running to steer. Send this with session/prompt instead.",
      );
    }
    if (text.trim() === "") return;
    this.steerQueue.push(text);
  }

  // -----------------------------------------------------------------------
  // Permissions
  // -----------------------------------------------------------------------

  private awaitDecision(callId: string): Promise<PermissionDecision> {
    return new Promise<PermissionDecision>((resolve, reject) => {
      this.pending.set(callId, { resolve, reject });
    });
  }

  /**
   * Settle a permission prompt from a client.
   *
   * A callId with nothing waiting is not an error worth raising: the turn may have been
   * interrupted between the dialog appearing and the user clicking, and two clients
   * subscribed to one session will both answer. First answer wins, quietly.
   */
  resolvePermission(callId: string, decision: PermissionDecision): void {
    const deferred = this.pending.get(callId);
    if (!deferred) {
      this.deps.log.debug(`No call waiting on permission ${callId}`);
      return;
    }
    this.pending.delete(callId);
    deferred.resolve(decision);
  }

  private rejectPending(cause: unknown): void {
    if (this.pending.size === 0) return;
    const waiting = [...this.pending.values()];
    this.pending.clear();
    for (const deferred of waiting) deferred.reject(cause);
  }

  // -----------------------------------------------------------------------
  // Metadata
  // -----------------------------------------------------------------------

  setTitle(title: string): void {
    const trimmed = title.trim();
    if (trimmed === "" || trimmed === this.meta.title) return;
    this.meta = { ...this.meta, title: trimmed, updatedAt: Date.now() };
    this.deps.store.saveMeta(this.meta);
    this.deps.emit({ type: "title_updated", sessionId: this.meta.id, title: trimmed });
  }

  /**
   * Wind the session down.
   *
   * The in-flight turn is interrupted and then *waited for*, because its own teardown is
   * what writes the final history. Draining without that wait would flush the queue
   * before the last save had joined it, losing the turn the user just watched happen.
   */
  async close(): Promise<void> {
    this.interrupt();
    await this.running?.catch(() => undefined);
    this.deps.store.saveHistory(this.meta.id, this.history);
    this.deps.store.saveMeta(this.meta);
    await this.deps.store.drain(this.meta.id);
  }

  /**
   * Everything the engine emits passes through here.
   *
   * One funnel for the two things that have to happen to every event — settle it into
   * the transcript, then fan it out — so a new event type cannot be added and end up
   * displayed but never saved.
   */
  private observe(event: SessionEvent): void {
    this.builder.observe(event);

    if (event.type === "turn_completed") {
      this.meta = {
        ...this.meta,
        cumulativeCost: addCost(this.meta.cumulativeCost, event.cost),
      };
    }
    this.deps.emit(event);
  }
}

/**
 * The todo list as of the end of a transcript.
 *
 * Backwards, and stopping at the first hit: each `todos` entry is a whole snapshot of the
 * list rather than a delta, so the last one is the answer and everything before it is
 * history.
 */
function lastTodos(transcript: readonly TranscriptEntry[]): TodoItem[] {
  for (let i = transcript.length - 1; i >= 0; i--) {
    const entry = transcript[i];
    if (entry?.kind === "todos") return [...entry.todos];
  }
  return [];
}
