/**
 * The agent loop.
 *
 * One turn: the user's message in, an arbitrary number of model requests and tool
 * calls in between, one `turn_completed` out. This is the file the whole engine
 * exists to support, so it is written to be read top to bottom.
 *
 * The sequence for every tool call is fixed and lives only here:
 *
 *   describe → evaluate → (prompt) → checkpoint → dispatch → report
 *
 * Tools never gate themselves, so there is exactly one place to look when someone
 * asks why the agent did — or didn't — do something.
 *
 * **The invariant that matters most.** The API requires every `tool_use` block to be
 * answered by a `tool_result` in the next user message. Get that wrong and the *next*
 * turn fails with a 400 that looks like it came from nowhere. So every exit path from
 * this file — normal completion, denial, abort, interrupt, crash — leaves `history`
 * with no unanswered `tool_use` block. Each of those paths is marked below.
 *
 * Copyright (c) 2026 Origin AI
 */

import { open } from "node:fs/promises";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import {
  TOOL_EFFECTS,
  TOOL_NAMES,
  type Attachment,
  type FileChangeSummary,
  type PermissionDecision,
  type PermissionRequest,
  type PermissionSettings,
  type PromptParams,
  type SessionEvent,
  type StopReason,
  type TodoItem,
  type ToolEffect,
  type ToolInputMap,
  type ToolName,
  type TokenUsage,
  type TurnCost,
} from "@trace/protocol";
import type { Logger } from "../logger.js";
import { addUsage, emptyUsage, estimateUsd, resolveModel } from "../models.js";
import { resolveInWorkspace, toPosix } from "../paths.js";
import { describeCall, evaluate, ruleForAlwaysAllow, type CallDescription } from "../permissions.js";
import type { AnthropicProvider, AssistantToolCall } from "../providers/anthropic.js";
import type { SettingsStore } from "../settings.js";
import { runTool, toolsForRequest } from "../tools/index.js";
import type { FileStateTracker } from "../file-state.js";
import type { ToolContext, ToolResult } from "../tools/registry.js";
import type { Workspace, WorkspaceRegistry } from "../workspace.js";
import { asSystemReminder, buildSystemPrompt, renderAttachment, todayStamp, turnReminders } from "./prompt.js";

/** Cap on a single inlined @-mention. Past this, tell the model to read it properly. */
const MAX_ATTACHMENT_CHARS = 100_000;

/** Trimmed result text for the transcript. The full text went to the model. */
const MAX_RESULT_PREVIEW_CHARS = 2_000;

const KNOWN_TOOLS = new Set<string>(TOOL_NAMES);

/**
 * Writes a revert point before the turn's first mutating call.
 *
 * An interface rather than a direct dependency on the shadow-git implementation, so
 * the loop is testable without a repo and so a workspace with no git still runs —
 * `null` simply means no checkpoints, not no edits.
 */
export interface CheckpointWriter {
  create(label: string): Promise<{ id: string } | null>;
}

export interface TurnDeps {
  sessionId: string;
  workspaces: WorkspaceRegistry;
  /** Null in the "No Repo" case. */
  workspace: Workspace | null;
  settings: SettingsStore;
  provider: AnthropicProvider;
  files: FileStateTracker;
  /** Session-lived todo list. `todo_write` mutates it; the loop only reads it. */
  todos: { get(): TodoItem[]; set(next: TodoItem[]): void };
  checkpoints: CheckpointWriter | null;
  /**
   * Persisted conversation, in API shape. Appended to in place, so the session's
   * next turn continues from exactly what the model last saw.
   */
  history: MessageParam[];
  emit(event: SessionEvent): void;
  /**
   * Ask the user. Resolves when a client calls `session/resolvePermission`.
   *
   * Rejects if the turn is interrupted while waiting — a pending prompt on an
   * abandoned turn must not keep the loop alive.
   */
  requestPermission(request: PermissionRequest): Promise<PermissionDecision>;
  /** False for headless clients, which get rules-only adjudication. */
  canPrompt: boolean;
  /**
   * Drain anything the user typed while the turn was running.
   *
   * Called once per iteration, and the text rides along with the tool results the
   * model is already about to read. That is what makes steering feel like talking to
   * someone mid-task rather than stopping them: the new instruction lands next to the
   * outcome of what they just did, in the same breath.
   */
  takeSteer?(): string[];
  log: Logger;
}

export class Turn {
  private readonly controller = new AbortController();
  private usage: TokenUsage = emptyUsage();
  private requests = 0;
  private readonly changes: FileChangeSummary[] = [];
  /** Set once per turn, whether or not the snapshot succeeded — see `ensureCheckpoint`. */
  private checkpointAttempted = false;
  /** Set by a `deny_and_abort` decision. Stops the loop without cancelling the turn. */
  private aborted = false;
  private readonly log: Logger;

  constructor(
    readonly turnId: string,
    private readonly deps: TurnDeps,
    private readonly params: PromptParams,
  ) {
    this.log = deps.log.child(`turn:${turnId.slice(0, 8)}`);
  }

  /** Stop as soon as the current await returns. Safe to call more than once. */
  interrupt(): void {
    this.controller.abort(new DOMException("Interrupted by the user", "AbortError"));
  }

  get signal(): AbortSignal {
    return this.controller.signal;
  }

  async run(): Promise<StopReason> {
    const settings = this.deps.settings.get();
    const model = resolveModel(this.params.model ?? settings.defaultModel);

    this.emit({
      type: "turn_started",
      sessionId: this.deps.sessionId,
      turnId: this.turnId,
      startedAt: Date.now(),
      model: model.id,
    });

    let stopReason: StopReason = "error";
    try {
      this.deps.history.push(await this.buildUserMessage(this.permissions()));

      const system = buildSystemPrompt({
        roots: this.roots(),
        isGitRepo: this.deps.workspace?.isGitRepo ?? false,
        hasSemanticIndex: this.deps.workspace?.indexStatus === "ready",
        today: todayStamp(new Date()),
      });
      const tools = toolsForRequest({
        hasSemanticIndex: this.deps.workspace?.indexStatus === "ready",
      });

      stopReason = await this.loop({ model, system, tools, settings });
    } catch (cause) {
      stopReason = this.reportFailure(cause);
    }

    this.emit({
      type: "turn_completed",
      sessionId: this.deps.sessionId,
      turnId: this.turnId,
      completedAt: Date.now(),
      stopReason,
      cost: this.cost(model),
      changes: this.changes,
    });
    return stopReason;
  }

  // -----------------------------------------------------------------------
  // The loop
  // -----------------------------------------------------------------------

  private async loop(cfg: {
    model: ReturnType<typeof resolveModel>;
    system: string;
    tools: ReturnType<typeof toolsForRequest>;
    settings: ReturnType<SettingsStore["get"]>;
  }): Promise<StopReason> {
    const maxIterations = Math.max(1, cfg.settings.maxIterationsPerTurn);

    for (let iteration = 1; iteration <= maxIterations; iteration++) {
      this.signal.throwIfAborted();
      this.emit({
        type: "iteration_started",
        sessionId: this.deps.sessionId,
        turnId: this.turnId,
        iteration,
      });

      // Partial text is captured outside the try so the interrupt path can keep it.
      let partialText = "";

      let result;
      try {
        result = await this.deps.provider.stream(
          {
            model: cfg.model,
            system: cfg.system,
            messages: this.deps.history,
            tools: cfg.tools,
            settings: { effort: cfg.settings.effort, showThinking: cfg.settings.showThinking },
          },
          {
            onText: (blockIndex, text) => {
              partialText += text;
              this.emit({
                type: "text_delta",
                sessionId: this.deps.sessionId,
                turnId: this.turnId,
                blockIndex,
                text,
              });
            },
            onThinking: (blockIndex, text) => {
              // Suppressed rather than never requested: the model reasons either way,
              // and asking for it only when shown would change the cached prefix.
              if (!cfg.settings.showThinking) return;
              this.emit({
                type: "thinking_delta",
                sessionId: this.deps.sessionId,
                turnId: this.turnId,
                blockIndex,
                text,
              });
            },
            onToolStart: (blockIndex, callId, tool) => {
              this.emit({
                type: "tool_call_started",
                sessionId: this.deps.sessionId,
                turnId: this.turnId,
                callId,
                tool: tool as ToolName,
                blockIndex,
              });
            },
            onToolInputDelta: (callId, partialJson) => {
              this.emit({
                type: "tool_call_input_delta",
                sessionId: this.deps.sessionId,
                turnId: this.turnId,
                callId,
                partialJson,
              });
            },
          },
          this.signal,
        );
      } catch (cause) {
        // EXIT PATH: interrupted mid-stream. `finalMessage()` never resolved, so the
        // full assistant turn is unknown. Keep the prose — it is context the user saw
        // and the model can build on — and drop any tool_use blocks, which would be
        // unanswerable. Anything else here would corrupt the next request.
        if (this.isInterrupt(cause)) {
          if (partialText.trim() !== "") {
            this.deps.history.push({ role: "assistant", content: partialText });
            // Without this the model reads its own truncated sentence as a finished
            // answer next turn. Two user messages in a row is fine: the API
            // concatenates consecutive same-role turns.
            this.deps.history.push({
              role: "user",
              content: asSystemReminder("The previous response was interrupted by the user."),
            });
          }
          return "cancelled";
        }
        throw cause;
      }

      this.requests++;
      this.usage = addUsage(this.usage, result.usage);
      this.emit({
        type: "usage_updated",
        sessionId: this.deps.sessionId,
        turnId: this.turnId,
        cost: this.cost(cfg.model),
      });

      this.deps.history.push(result.message);

      if (result.toolCalls.length === 0) {
        // Nothing to run: `end_turn`, `max_tokens`, `refusal`, `context_exceeded`.
        return result.stopReason;
      }

      const results = await this.runToolCalls(result.toolCalls);
      // EXIT PATH: every call is answered here, including the ones skipped after an
      // abort, so the history is valid whatever happened above.
      // Steered text goes in the same message, after the results — `tool_result` blocks
      // have to come first, and a late instruction reads better than an early one.
      const followUp: Array<ToolResultBlock | { type: "text"; text: string }> = [...results];
      for (const text of this.deps.takeSteer?.() ?? []) {
        if (text.trim() === "") continue;
        followUp.push({ type: "text", text });
        this.log.info("Delivered steering text to the model");
      }
      this.deps.history.push({ role: "user", content: followUp as MessageParam["content"] });

      if (this.aborted) return "cancelled";
      if (this.signal.aborted) return "cancelled";
    }

    this.log.warn(`Turn hit the iteration cap (${maxIterations})`);
    return "iteration_limit";
  }

  /**
   * Run a turn's tool calls, in the order the model emitted them.
   *
   * Sequential on purpose. Parallelising the read-only ones would be faster and is a
   * known follow-up, but it changes two things that need care: concurrent permission
   * prompts would stack up on the user, and two edits to the same file would race. In
   * a loop whose failure mode is corrupting someone's working tree, order first.
   *
   * **Never throws, and always returns exactly one block per call.** That is what
   * makes the file's central invariant structural instead of a thing to remember at
   * each `return` — an unexpected failure in one call cannot leave a `tool_use`
   * unanswered and poison every subsequent request in the session.
   */
  private async runToolCalls(calls: readonly AssistantToolCall[]): Promise<ToolResultBlock[]> {
    const blocks: ToolResultBlock[] = [];

    for (const call of calls) {
      if (this.aborted || this.signal.aborted) {
        // Not run, but still answered — see the invariant at the top of the file.
        blocks.push(errorBlock(call.callId, "Not run: the turn was stopped."));
        continue;
      }
      try {
        blocks.push(await this.executeCall(call));
      } catch (cause) {
        if (this.isInterrupt(cause)) {
          blocks.push(errorBlock(call.callId, "Not run: the turn was stopped."));
          continue;
        }
        // `runTool` handles every failure a tool can produce, so reaching here means
        // the gating machinery itself broke. Report it to the model as a failed call
        // and let the turn continue; the log is where the bug gets found.
        this.log.error(`Tool gating failed for ${call.tool}`, cause);
        const detail = cause instanceof Error ? cause.message : String(cause);
        blocks.push(errorBlock(call.callId, `Trace could not run this tool: ${detail}`));
      }
    }
    return blocks;
  }

  private async executeCall(call: AssistantToolCall): Promise<ToolResultBlock> {
    if (!KNOWN_TOOLS.has(call.tool)) {
      // The model invented a tool. Naming the real ones is more useful than a bare
      // rejection, and it recovers on the next iteration.
      const message = `No tool named "${call.tool}". Available tools: ${TOOL_NAMES.join(", ")}.`;
      this.emitCompleted(call.callId, false, 0, message);
      return errorBlock(call.callId, message);
    }
    const tool = call.tool as ToolName;
    const effect = TOOL_EFFECTS[tool];
    const startedAt = Date.now();

    const description = await this.describe(tool, call.input);
    this.emit({
      type: "tool_call_ready",
      sessionId: this.deps.sessionId,
      turnId: this.turnId,
      callId: call.callId,
      tool,
      input: call.input,
      summary: description.summary,
    });

    // Read fresh, not once per turn: an "always allow" answered two calls ago wrote a
    // rule, and the whole point of that answer is that the user isn't asked again.
    const verdict = evaluate(tool, description.subject, this.permissions());

    if (verdict.action === "ask") {
      const decision = await this.adjudicate(call, tool, effect, description, verdict.reason);
      if (decision !== "allow") {
        this.emitCompleted(call.callId, false, Date.now() - startedAt, decision.message);
        return errorBlock(call.callId, decision.message);
      }
    } else if (verdict.action === "deny") {
      const message = `Permission denied. ${verdict.reason}`;
      this.emit({
        type: "permission_resolved",
        sessionId: this.deps.sessionId,
        turnId: this.turnId,
        callId: call.callId,
        allowed: false,
        automatic: true,
      });
      this.emitCompleted(call.callId, false, Date.now() - startedAt, message);
      return errorBlock(call.callId, message);
    } else if (effect === "mutate" || effect === "execute") {
      // Auto-approval is only worth an event when the call *would* normally have
      // prompted. Emitting one for every read would bury the ones that matter.
      this.emit({
        type: "permission_resolved",
        sessionId: this.deps.sessionId,
        turnId: this.turnId,
        callId: call.callId,
        allowed: true,
        automatic: true,
      });
    }

    if (effect === "mutate") await this.ensureCheckpoint();

    const result = await runTool(tool, call.input, this.toolContext(call.callId));
    const durationMs = Date.now() - startedAt;
    const change = changeFrom(tool, result);
    if (change) this.recordChange(change);

    this.emit({
      type: "tool_call_completed",
      sessionId: this.deps.sessionId,
      turnId: this.turnId,
      callId: call.callId,
      ok: result.isError !== true,
      durationMs,
      resultPreview: preview(result.summary || result.content),
      ...(change ? { changes: [change] } : {}),
    });

    return {
      type: "tool_result",
      tool_use_id: call.callId,
      content: result.content,
      ...(result.isError === true ? { is_error: true } : {}),
    };
  }

  /**
   * Describe a call for the user and for the rule engine.
   *
   * Wrapped because the input is raw model output: a malformed call can make
   * `describeCall` throw before validation ever gets a look at it, and that must
   * not take down the turn.
   */
  private async describe(tool: ToolName, input: unknown): Promise<CallDescription> {
    try {
      return await describeCall(tool, input as ToolInputMap[typeof tool], this.roots());
    } catch (cause) {
      this.log.debug(`Could not describe ${tool}`, cause);
      return { summary: `Run ${tool}`, subject: "", unresolvedReason: "Unreadable arguments" };
    }
  }

  /**
   * Ask the user, and turn the answer into an outcome.
   *
   * Two cases skip the prompt, both because prompting would be theatre:
   * an unresolvable path (the tool is about to return a real error, which is a better
   * message than anything a dialog could say) and a client that cannot show prompts.
   */
  private async adjudicate(
    call: AssistantToolCall,
    tool: ToolName,
    effect: ToolEffect,
    description: CallDescription,
    reason: string,
  ): Promise<"allow" | { message: string }> {
    if (description.unresolvedReason !== undefined) {
      return "allow";
    }

    if (!this.deps.canPrompt) {
      return {
        message: `Permission required (${reason}), but this client cannot show a prompt. Add an allow rule in settings to permit this, or ask the user to run it themselves.`,
      };
    }

    const request: PermissionRequest = {
      callId: call.callId,
      tool,
      effect,
      summary: description.summary,
      subject: description.subject,
      input: call.input,
      ...(description.diffPreview === undefined ? {} : { diffPreview: description.diffPreview }),
    };
    this.emit({
      type: "permission_requested",
      sessionId: this.deps.sessionId,
      turnId: this.turnId,
      request,
    });

    let decision: PermissionDecision;
    try {
      decision = await this.deps.requestPermission(request);
    } catch (cause) {
      // Interrupted while the dialog was open, or the client disconnected.
      if (this.isInterrupt(cause)) return { message: "Not run: the turn was stopped." };
      throw cause;
    }

    const allowed = decision.decision === "allow_once" || decision.decision === "allow_always";
    this.emit({
      type: "permission_resolved",
      sessionId: this.deps.sessionId,
      turnId: this.turnId,
      callId: call.callId,
      allowed,
      automatic: false,
    });

    if (decision.decision === "allow_always") {
      await this.persistAllowRule(tool, description.subject);
      return "allow";
    }
    if (decision.decision === "allow_once") return "allow";

    if (decision.decision === "deny_and_abort") this.aborted = true;
    const explanation = decision.reason?.trim();
    return {
      message: explanation
        ? `The user declined: ${explanation}`
        : "The user declined this action. Do not retry it or work around it — continue with what you can do, or explain what you would need.",
    };
  }

  /**
   * Persist an "always allow" as a workspace rule.
   *
   * Prepended, not appended: an existing `ask` rule earlier in the list would
   * otherwise keep winning, and the user would be asked the same question forever.
   */
  private async persistAllowRule(tool: ToolName, subject: string): Promise<void> {
    const current = this.deps.settings.get().permissions;
    await this.deps.settings.update({
      permissions: {
        ...current,
        rules: [ruleForAlwaysAllow(tool, subject), ...current.rules],
      },
    });
    this.log.info(`Added an allow rule for ${tool}`, { subject });
  }

  // -----------------------------------------------------------------------
  // Checkpoints
  // -----------------------------------------------------------------------

  /**
   * Snapshot the working tree before the turn's first mutating call.
   *
   * Lazily, and once per turn: a turn that only reads should not litter the shadow
   * repo with empty commits, and a turn that writes forty files only needs one
   * revert point — the user thinks in terms of "undo what the agent just did".
   */
  private async ensureCheckpoint(): Promise<void> {
    if (this.checkpointAttempted) return;
    if (!this.deps.checkpoints) return;
    if (!this.deps.settings.get().checkpointsEnabled) return;
    this.checkpointAttempted = true;

    try {
      const label = preview(this.params.text, 60) || "Agent turn";
      const created = await this.deps.checkpoints.create(label);
      if (!created) return;
      this.emit({
        type: "checkpoint_created",
        sessionId: this.deps.sessionId,
        turnId: this.turnId,
        checkpointId: created.id,
        label,
      });
    } catch (cause) {
      // A failed checkpoint must not block the edit. Losing undo is bad; refusing to
      // work because undo is unavailable is worse, and the user still has git.
      this.log.warn("Could not create a checkpoint; continuing without one", {
        reason: cause instanceof Error ? cause.message : String(cause),
      });
    }
  }

  // -----------------------------------------------------------------------
  // The user message
  // -----------------------------------------------------------------------

  /**
   * Assemble the user turn: engine reminders, then attachments, then what they typed.
   *
   * Their text goes last. It is the instruction; everything else is context, and the
   * model weights the end of a message most heavily.
   */
  private async buildUserMessage(permissions: PermissionSettings): Promise<MessageParam> {
    const blocks: UserContentBlock[] = [];

    for (const reminder of turnReminders(permissions)) {
      blocks.push({ type: "text", text: asSystemReminder(reminder) });
    }

    for (const attachment of this.params.attachments ?? []) {
      const block = await this.renderAttachmentBlock(attachment);
      if (block) blocks.push(block);
    }

    const text = this.params.text.trim();
    blocks.push({
      type: "text",
      // An empty prompt is legal — "@file.ts" with no words, or a bare screenshot.
      // Something must be in the block, though, or the API rejects it.
      text: text === "" ? "(no message)" : text,
    });

    return { role: "user", content: blocks };
  }

  private async renderAttachmentBlock(attachment: Attachment): Promise<UserContentBlock | null> {
    if (attachment.type === "image") {
      if (!isSupportedImage(attachment.mediaType)) {
        return {
          type: "text",
          text: `[An image of type ${attachment.mediaType} was attached; that format is not supported.]`,
        };
      }
      return {
        type: "image",
        source: { type: "base64", media_type: attachment.mediaType, data: attachment.data },
      };
    }

    if (attachment.type === "selection") {
      return { type: "text", text: renderAttachment(attachment, "") };
    }

    if (attachment.type === "directory") {
      // Listed rather than read: inlining a directory's contents is unbounded, and
      // the model can read what it needs from the listing.
      try {
        const resolved = await resolveInWorkspace(attachment.path, this.roots());
        const workspace = this.deps.workspaces.owning(resolved.absolute) ?? this.deps.workspace;
        if (!workspace) return null;
        const entries = await this.deps.workspaces.listDir(workspace, resolved.absolute);
        const listing = entries
          .map((e) => (e.kind === "directory" ? `${e.name}/` : e.name))
          .join("\n");
        return { type: "text", text: renderAttachment(attachment, listing) };
      } catch (cause) {
        return { type: "text", text: this.attachmentError(attachment.path, cause) };
      }
    }

    try {
      const resolved = await resolveInWorkspace(attachment.path, this.roots());
      // Read and stat through one handle: the stamp then describes exactly the bytes
      // that went into the prompt. Stat-ing the path separately would record whatever
      // is on disk a moment later, which is the very race the stamp exists to catch.
      const handle = await open(resolved.absolute, "r");
      let contents: string;
      let stamp: { mtimeMs: number; size: number };
      try {
        contents = await handle.readFile("utf8");
        const stat = await handle.stat();
        stamp = { mtimeMs: stat.mtimeMs, size: stat.size };
      } finally {
        await handle.close();
      }

      const truncated = contents.length > MAX_ATTACHMENT_CHARS;
      const body = truncated
        ? `${contents.slice(0, MAX_ATTACHMENT_CHARS)}\n[truncated — read the file directly for the rest]`
        : contents;
      // Mentioning a file counts as having seen it, so a later edit isn't blocked by
      // the read-before-write check on something the user themselves supplied. Not for
      // a truncated one: the agent has seen part of that file, which is not grounds to
      // overwrite the whole of it.
      if (!truncated) this.deps.files.markRead(resolved.absolute, stamp);
      return { type: "text", text: renderAttachment(attachment, body) };
    } catch (cause) {
      return { type: "text", text: this.attachmentError(attachment.path, cause) };
    }
  }

  private attachmentError(path: string, cause: unknown): string {
    const reason = cause instanceof Error ? cause.message : String(cause);
    this.log.debug(`Could not attach ${path}`, cause);
    return `[${toPosix(path)} was attached but could not be read: ${reason}]`;
  }

  // -----------------------------------------------------------------------
  // Plumbing
  // -----------------------------------------------------------------------

  /**
   * The permission settings for this turn.
   *
   * A per-turn `permissionMode` overrides the stored one without persisting it —
   * that is what makes "plan this one out" a one-shot rather than a mode the user
   * has to remember to switch back.
   */
  private permissions(): PermissionSettings {
    const stored = this.deps.settings.get().permissions;
    return this.params.permissionMode === undefined
      ? stored
      : { ...stored, mode: this.params.permissionMode };
  }

  /**
   * Roots for path resolution, **session's own workspace first**.
   *
   * Order is priority order in `resolveInWorkspace`: a relative path is lexically
   * inside every open root, so without this a new file would land in whichever repo
   * happened to be listed first.
   */
  private roots(): string[] {
    const own = this.deps.workspace?.root;
    const all = this.deps.workspaces.roots();
    if (!own) return all;
    return [own, ...all.filter((root) => root !== own)];
  }

  private toolContext(callId: string): ToolContext {
    return {
      sessionId: this.deps.sessionId,
      turnId: this.turnId,
      callId,
      workspaces: this.deps.workspaces,
      workspace: this.deps.workspace,
      roots: this.roots(),
      settings: this.deps.settings,
      log: this.log.child(callId.slice(-6)),
      signal: this.signal,
      emit: (event) => this.emit(event),
      files: this.deps.files,
      todos: this.deps.todos,
    };
  }

  private cost(model: ReturnType<typeof resolveModel>): TurnCost {
    return {
      usage: this.usage,
      requests: this.requests,
      estimatedUsd: estimateUsd(this.usage, model),
    };
  }

  /**
   * Merge a file change into the turn's rollup.
   *
   * Merged rather than appended because a turn commonly edits the same file several
   * times, and the review surface wants one entry per file with the totals — not a
   * list the user has to add up.
   */
  private recordChange(change: FileChangeSummary): void {
    const existing = this.changes.find((c) => c.path === change.path);
    if (!existing) {
      // A copy: this object was already handed to `emit`, and a consumer that buffers
      // events before writing them would otherwise see it mutate underneath itself.
      this.changes.push({ ...change });
      return;
    }
    existing.linesAdded += change.linesAdded;
    existing.linesRemoved += change.linesRemoved;
    // A file created and then edited is still "created" from the user's point of
    // view; one edited and then deleted is deleted.
    if (change.changeType === "deleted") existing.changeType = "deleted";
  }

  private emitCompleted(callId: string, ok: boolean, durationMs: number, message: string): void {
    this.emit({
      type: "tool_call_completed",
      sessionId: this.deps.sessionId,
      turnId: this.turnId,
      callId,
      ok,
      durationMs,
      resultPreview: preview(message),
    });
  }

  private reportFailure(cause: unknown): StopReason {
    if (this.isInterrupt(cause)) return "cancelled";

    const code = codeOf(cause);
    const message = cause instanceof Error ? cause.message : String(cause);
    this.log.error("Turn failed", cause);
    this.emit({
      type: "error",
      sessionId: this.deps.sessionId,
      turnId: this.turnId,
      code,
      message,
      fatal: true,
    });
    // Context overflow is reported as its own stop reason so the UI offers "compact"
    // rather than "retry" — retrying is the one thing guaranteed not to work.
    return code === CONTEXT_EXCEEDED_CODE ? "context_exceeded" : "error";
  }

  private isInterrupt(cause: unknown): boolean {
    if (this.signal.aborted) return true;
    return cause instanceof Error && cause.name === "AbortError";
  }

  private emit(event: SessionEvent): void {
    this.deps.emit(event);
  }
}

// ---------------------------------------------------------------------------
// Local shapes
//
// Structural rather than imported from the SDK: they are the only two block types
// this file constructs, and naming them keeps the signatures readable.
// ---------------------------------------------------------------------------

interface ToolResultBlock {
  type: "tool_result";
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

type UserContentBlock =
  | { type: "text"; text: string }
  | {
      type: "image";
      source: { type: "base64"; media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp"; data: string };
    };

const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
type SupportedImageType = (typeof SUPPORTED_IMAGE_TYPES)[number];

function isSupportedImage(mediaType: string): mediaType is SupportedImageType {
  return (SUPPORTED_IMAGE_TYPES as readonly string[]).includes(mediaType);
}

function errorBlock(callId: string, message: string): ToolResultBlock {
  return { type: "tool_result", tool_use_id: callId, content: message, is_error: true };
}

/** Mirrors `ErrorCode.ContextExceeded`, kept local to avoid importing the whole enum. */
const CONTEXT_EXCEEDED_CODE = -31796;

function codeOf(cause: unknown): number {
  if (typeof cause !== "object" || cause === null) return -32603;
  const code = (cause as { code?: unknown }).code;
  return typeof code === "number" ? code : -32603;
}

function preview(text: string, limit = MAX_RESULT_PREVIEW_CHARS): string {
  const flat = text.trim();
  return flat.length <= limit ? flat : `${flat.slice(0, limit - 1)}…`;
}

/**
 * Derive a change summary from a mutating tool's `meta`.
 *
 * The coupling to each tool's meta shape is deliberate and contained here: the
 * alternative is every mutating tool building a `FileChangeSummary` itself, which
 * puts protocol-shaped output in nine places instead of one.
 */
function changeFrom(tool: ToolName, result: ToolResult): FileChangeSummary | null {
  if (result.isError === true) return null;
  const meta = result.meta;
  const path = typeof meta?.["path"] === "string" ? (meta["path"] as string) : null;
  if (!path) return null;

  const added = typeof meta?.["added"] === "number" ? (meta["added"] as number) : 0;
  const removed = typeof meta?.["removed"] === "number" ? (meta["removed"] as number) : 0;

  switch (tool) {
    case "write_file":
      return {
        path,
        changeType: meta?.["created"] === true ? "created" : "modified",
        linesAdded: added,
        linesRemoved: removed,
      };
    case "edit_file":
      return { path, changeType: "modified", linesAdded: added, linesRemoved: removed };
    case "delete_file":
      return { path, changeType: "deleted", linesAdded: 0, linesRemoved: 0 };
    default:
      return null;
  }
}
