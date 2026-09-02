/**
 * Settling the event stream into a transcript.
 *
 * The engine emits events for a *live* UI: hundreds of `text_delta`s, a `tool_call`
 * split across three events as it starts, resolves, and finishes. That is the right
 * shape for something rendering token by token and the wrong shape for anything else —
 * persisting it verbatim would mean every reader of a session (reopening it, searching
 * it, exporting it) had to re-implement the coalescing.
 *
 * So this is a reducer: events in, one settled `TranscriptEntry` per thing that
 * actually happened out. Pure apart from the clock, which is injected.
 *
 * **Ordering is the only subtle part.** Entries must come out in the order a reader
 * would expect to see them, which is not the order the events complete in: a
 * `tool_call` entry is only emitted once the call finishes, by which time the text the
 * model wrote *before* the call has been sitting in a buffer. Buffered text is
 * therefore flushed when a tool call starts, not when the iteration ends.
 *
 * Copyright (c) 2026 Origin AI
 */

import type { Attachment, SessionEvent, ToolName, TranscriptEntry } from "@trace/protocol";

interface PendingCall {
  tool: ToolName;
  startedAt: number;
  input: unknown;
  summary: string;
}

export class TranscriptBuilder {
  /** Buffered prose and reasoning, keyed by the block index that owns it. */
  private readonly blocks = new Map<number, { kind: "text" | "thinking"; text: string }>();
  private readonly pending = new Map<string, PendingCall>();
  private turnId = "";

  constructor(
    private readonly onEntry: (entry: TranscriptEntry) => void,
    private readonly now: () => number = Date.now,
  ) {}

  /**
   * Record what the user asked.
   *
   * Explicit rather than derived from `turn_started`, which does not carry the prompt —
   * events are for surfaces that already have it on screen.
   */
  userMessage(turnId: string, text: string, attachments: readonly Attachment[] = []): void {
    this.turnId = turnId;
    this.emit({
      kind: "user_message",
      turnId,
      at: this.now(),
      text,
      attachments: [...attachments],
    });
  }

  observe(event: SessionEvent): void {
    switch (event.type) {
      case "turn_started":
        this.turnId = event.turnId;
        break;

      case "text_delta":
        this.append(event.blockIndex, "text", event.text);
        break;

      case "thinking_delta":
        this.append(event.blockIndex, "thinking", event.text);
        break;

      case "tool_call_started":
        // Whatever the model said before reaching for a tool belongs above the call.
        this.flushBlocks();
        this.pending.set(event.callId, {
          tool: event.tool,
          startedAt: this.now(),
          input: undefined,
          summary: `Run ${event.tool}`,
        });
        break;

      case "tool_call_ready": {
        const call = this.pending.get(event.callId);
        if (call) {
          call.input = event.input;
          call.summary = event.summary;
        }
        break;
      }

      case "tool_call_completed": {
        const call = this.pending.get(event.callId);
        this.pending.delete(event.callId);
        this.emit({
          kind: "tool_call",
          turnId: event.turnId,
          at: this.now(),
          callId: event.callId,
          // A completion with no matching start means the call was rejected before it
          // ever reached a tool — an unknown tool name. Still worth recording.
          tool: call?.tool ?? ("unknown" as ToolName),
          input: call?.input,
          summary: call?.summary ?? "Rejected call",
          ok: event.ok,
          durationMs: event.durationMs,
          resultPreview: event.resultPreview,
        });
        break;
      }

      case "todos_updated":
        this.flushBlocks();
        this.emit({ kind: "todos", turnId: event.turnId, at: this.now(), todos: event.todos });
        break;

      case "checkpoint_created":
        this.emit({
          kind: "checkpoint",
          turnId: event.turnId,
          at: this.now(),
          checkpointId: event.checkpointId,
          label: event.label,
        });
        break;

      case "error":
        this.flushBlocks();
        this.emit({
          kind: "error",
          at: this.now(),
          code: event.code,
          message: event.message,
          ...(event.turnId === undefined ? {} : { turnId: event.turnId }),
        });
        break;

      case "iteration_started":
      case "turn_completed":
        this.flushBlocks();
        break;

      // Live-only: input/output deltas are redundant with the settled call, permission
      // events are redundant with its `ok`, and usage, titles, and panel requests are
      // session metadata rather than transcript.
      default:
        break;
    }
  }

  /** Settle anything still buffered. Call when a turn ends by any route. */
  flush(): void {
    this.flushBlocks();
    // A call that started but never completed means the turn died mid-dispatch. Left
    // in the transcript as a failure, because silently dropping it would show the user
    // a tool that was never called.
    for (const [callId, call] of this.pending) {
      this.emit({
        kind: "tool_call",
        turnId: this.turnId,
        at: this.now(),
        callId,
        tool: call.tool,
        input: call.input,
        summary: call.summary,
        ok: false,
        durationMs: this.now() - call.startedAt,
        resultPreview: "Did not finish.",
      });
    }
    this.pending.clear();
  }

  private append(blockIndex: number, kind: "text" | "thinking", text: string): void {
    const existing = this.blocks.get(blockIndex);
    if (existing) existing.text += text;
    else this.blocks.set(blockIndex, { kind, text });
  }

  /** Emit buffered blocks in block order, which is the order the model wrote them. */
  private flushBlocks(): void {
    if (this.blocks.size === 0) return;
    const indices = [...this.blocks.keys()].sort((a, b) => a - b);
    const at = this.now();
    for (const index of indices) {
      const block = this.blocks.get(index);
      if (!block || block.text.trim() === "") continue;
      this.emit({
        kind: block.kind === "text" ? "assistant_text" : "assistant_thinking",
        turnId: this.turnId,
        at,
        text: block.text,
      });
    }
    this.blocks.clear();
  }

  private emit(entry: TranscriptEntry): void {
    this.onEntry(entry);
  }
}
