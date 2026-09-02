/**
 * Session persistence.
 *
 * Layout, one directory per session under `~/.trace/sessions/<id>/`:
 *
 *   meta.json         SessionSummary, rewritten atomically when it changes
 *   transcript.jsonl  settled TranscriptEntry per line, append-only
 *   history.json      the model's own view of the conversation
 *
 * A directory rather than three parallel trees so deleting a session is one `rm -r`
 * and can't half-succeed into a session that lists but won't open.
 *
 * **Why two records of the same conversation.** `transcript.jsonl` is what a human
 * reads; `history.json` is what the model reads. They are close but not
 * interchangeable — the transcript has costs, timings, checkpoints, and truncated
 * result previews, while history has the full tool results and the thinking-block
 * signatures that must be replayed byte-exact for the API to accept them. Deriving
 * either from the other would mean losing something, so both are kept.
 *
 * **Append-only for the transcript, atomic replace for the other two.** A crash while
 * appending loses at most a trailing line, and a truncated final line is skipped on
 * load. A crash during an atomic replace leaves the previous version intact. Neither
 * can produce a session that exists but cannot be opened, which is the failure mode
 * worth engineering against — a user with fifty sessions will not forgive one that
 * takes the list down with it.
 *
 * Copyright (c) 2026 Origin AI
 */

import { appendFile, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { addUsage, emptyUsage } from "../models.js";
import type { SessionSummary, TranscriptEntry, TurnCost } from "@trace/protocol";
import { Logger } from "../logger.js";

const log = new Logger("store");

/**
 * Errors a `rename` can raise on Windows for reasons that go away on their own.
 *
 * All three mean "someone else has this file open right now" rather than anything about
 * the write itself, which is why they are retried and every other code is not.
 */
const TRANSIENT_RENAME_CODES = new Set(["EPERM", "EACCES", "EBUSY"]);
const RENAME_RETRIES = 5;
/** Doubled per attempt: 10, 20, 40, 80, 160ms — 310ms of patience in the worst case. */
const RENAME_BACKOFF_MS = 10;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * On-disk history, wrapped rather than bare.
 *
 * v1 persists provider-native message shapes, because re-encoding them into a neutral
 * form and back is a lossy round trip nobody needs yet — thinking signatures and cache
 * hints have to survive verbatim. The wrapper is the escape hatch: a second provider
 * ships, and this field is what tells a migration which decoder to use.
 */
interface StoredHistory {
  version: 1;
  provider: "anthropic";
  messages: MessageParam[];
}

export interface LoadedSession {
  meta: SessionSummary;
  transcript: TranscriptEntry[];
  history: MessageParam[];
}

export class SessionStore {
  private readonly root: string;
  /**
   * Per-session write chain.
   *
   * Every write goes through here, so two overlapping saves on one session cannot
   * interleave — `appendFile` on a shared handle offers no such guarantee, and an
   * interleaved JSONL line is a permanently corrupt transcript.
   */
  private readonly chains = new Map<string, Promise<void>>();

  constructor(home: string) {
    this.root = path.join(home, "sessions");
  }

  // -----------------------------------------------------------------------
  // Writing
  // -----------------------------------------------------------------------

  async create(meta: SessionSummary): Promise<void> {
    await mkdir(this.dir(meta.id), { recursive: true });
    await this.writeMeta(meta);
  }

  /** Record one settled entry. Serialized per session; never throws. */
  append(sessionId: string, entry: TranscriptEntry): void {
    this.enqueue(sessionId, async () => {
      await appendFile(
        this.file(sessionId, "transcript.jsonl"),
        `${JSON.stringify(entry)}\n`,
        "utf8",
      );
    });
  }

  /**
   * Snapshot the model's conversation.
   *
   * Whole-file rather than incremental. A long session's history is a few hundred KB
   * and this runs once per turn, so the cost is irrelevant next to the property it
   * buys: there is no partially-applied state to reason about after a crash.
   */
  saveHistory(sessionId: string, messages: readonly MessageParam[]): void {
    const payload: StoredHistory = { version: 1, provider: "anthropic", messages: [...messages] };
    this.enqueue(sessionId, async () => {
      await this.writeAtomic(this.file(sessionId, "history.json"), JSON.stringify(payload));
    });
  }

  saveMeta(meta: SessionSummary): void {
    this.enqueue(meta.id, () => this.writeMeta(meta));
  }

  /** Wait for every queued write on a session to land. Called before shutdown. */
  async drain(sessionId?: string): Promise<void> {
    const chains =
      sessionId === undefined ? [...this.chains.values()] : [this.chains.get(sessionId)];
    await Promise.all(chains.map((chain) => chain ?? Promise.resolve()));
  }

  async delete(sessionId: string): Promise<void> {
    await this.drain(sessionId);
    this.chains.delete(sessionId);
    await rm(this.dir(sessionId), { recursive: true, force: true });
  }

  // -----------------------------------------------------------------------
  // Reading
  // -----------------------------------------------------------------------

  /**
   * List every session, newest first.
   *
   * By scanning the directory rather than consulting an index file. An index is faster
   * and is one more thing that can disagree with reality; at the scale of a session
   * list — hundreds, not millions — the scan is imperceptible and cannot go stale.
   */
  async list(): Promise<SessionSummary[]> {
    let names: string[];
    try {
      names = await readdir(this.root);
    } catch {
      return [];
    }

    const metas = await Promise.all(names.map((name) => this.readMeta(name)));
    return metas
      .filter((meta): meta is SessionSummary => meta !== null)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async load(sessionId: string): Promise<LoadedSession | null> {
    const meta = await this.readMeta(sessionId);
    if (!meta) return null;
    const [transcript, history] = await Promise.all([
      this.readTranscript(sessionId),
      this.readHistory(sessionId),
    ]);
    return { meta, transcript, history };
  }

  async readTranscript(sessionId: string): Promise<TranscriptEntry[]> {
    let raw: string;
    try {
      raw = await readFile(this.file(sessionId, "transcript.jsonl"), "utf8");
    } catch {
      return [];
    }

    const entries: TranscriptEntry[] = [];
    for (const line of raw.split("\n")) {
      if (line === "") continue;
      try {
        entries.push(JSON.parse(line) as TranscriptEntry);
      } catch {
        // A torn final line from a crash mid-append. Skipping it is the whole reason
        // the transcript is line-oriented; anything else here would lose the session.
        log.warn(`Skipped an unreadable transcript line in ${sessionId}`);
      }
    }
    return entries;
  }

  async readHistory(sessionId: string): Promise<MessageParam[]> {
    try {
      const raw = await readFile(this.file(sessionId, "history.json"), "utf8");
      const parsed = JSON.parse(raw) as StoredHistory;
      if (parsed.provider !== "anthropic") {
        log.warn(`Session ${sessionId} has history from ${parsed.provider}; starting fresh`);
        return [];
      }
      return parsed.messages ?? [];
    } catch {
      // No history yet, or unreadable. An empty conversation is recoverable; refusing
      // to open the session is not.
      return [];
    }
  }

  // -----------------------------------------------------------------------
  // Internals
  // -----------------------------------------------------------------------

  private dir(sessionId: string): string {
    return path.join(this.root, sessionId);
  }

  private file(sessionId: string, name: string): string {
    return path.join(this.dir(sessionId), name);
  }

  private async readMeta(sessionId: string): Promise<SessionSummary | null> {
    try {
      const raw = await readFile(this.file(sessionId, "meta.json"), "utf8");
      const meta = JSON.parse(raw) as SessionSummary;
      // `isActive` is process state, not durable state. A session left marked active by
      // a crash would show a stop button that stops nothing.
      return { ...meta, isActive: false };
    } catch {
      return null;
    }
  }

  private async writeMeta(meta: SessionSummary): Promise<void> {
    await this.writeAtomic(this.file(meta.id, "meta.json"), JSON.stringify(meta, null, 2));
  }

  /**
   * Replace a file's contents without ever leaving it half-written.
   *
   * Same directory for the temp file, because `rename` is only atomic within a
   * filesystem and `/tmp` is frequently a different one.
   *
   * **The retry is for Windows.** `rename` over an existing file fails there with
   * `EPERM`/`EACCES`/`EBUSY` whenever anything else holds a handle on either path, and
   * something usually does: Defender's real-time scanner opens a file within
   * milliseconds of it being created, which is exactly when this runs — a session is
   * created and then renamed a moment later. Without the retry that rename is dropped,
   * logged, and the user's title is gone after a restart. The backoff is short and
   * bounded because the scanner's handle is transient; a failure that survives all five
   * attempts is a real one and belongs in the log.
   */
  private async writeAtomic(target: string, contents: string): Promise<void> {
    const temp = `${target}.tmp`;
    await writeFile(temp, contents, "utf8");
    for (let attempt = 0; ; attempt++) {
      try {
        await rename(temp, target);
        return;
      } catch (cause) {
        const code = (cause as { code?: string } | null)?.code;
        if (attempt >= RENAME_RETRIES || !TRANSIENT_RENAME_CODES.has(code ?? "")) {
          // Leaving the temp file behind would accumulate one per failed write.
          await rm(temp, { force: true }).catch(() => undefined);
          throw cause;
        }
        await delay(RENAME_BACKOFF_MS << attempt);
      }
    }
  }

  /**
   * Queue a write behind this session's outstanding ones.
   *
   * Failures are logged, not thrown. Persistence is bookkeeping that runs alongside
   * the agent, and a full disk should degrade a session to unsaved rather than kill a
   * turn the user is watching — they would rather finish the work and hear about the
   * disk than lose both.
   */
  private enqueue(sessionId: string, work: () => Promise<void>): void {
    const previous = this.chains.get(sessionId) ?? Promise.resolve();
    const next = previous.then(work).catch((cause: unknown) => {
      log.error(`Could not persist session ${sessionId}`, cause);
    });
    this.chains.set(sessionId, next);
  }
}

/**
 * The title a session has until something better is known.
 *
 * Exported because two places need to agree on it: this module writes it, and `Session`
 * checks for it to decide whether the first prompt should replace it. A literal in both
 * would silently stop matching the day one of them is reworded.
 */
export const DEFAULT_SESSION_TITLE = "New session";

/** A fresh session's metadata. */
export function newSessionMeta(args: {
  id: string;
  workspaceId: string | null;
  model: string;
  now: number;
}): SessionSummary {
  return {
    id: args.id,
    workspaceId: args.workspaceId,
    title: DEFAULT_SESSION_TITLE,
    createdAt: args.now,
    updatedAt: args.now,
    model: args.model,
    turnCount: 0,
    isActive: false,
    cumulativeCost: { usage: emptyUsage(), requests: 0, estimatedUsd: 0 },
  };
}

/**
 * A session title taken from the first thing the user said.
 *
 * Not a model call. Titling is worth a few tokens of somebody else's budget and none of
 * a BYOK user's — they did not add a key to have it spent naming things. The first line
 * of a prompt is what a person would have chosen anyway.
 */
export function titleFromPrompt(text: string): string {
  const firstLine = text
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line !== "");
  if (firstLine === undefined) return DEFAULT_SESSION_TITLE;

  // Strip markdown and @-mentions so a pasted heading or file reference does not
  // become the visible title verbatim.
  const cleaned = firstLine
    .replace(/^#+\s*/, "")
    .replace(/^[-*]\s+/, "")
    .trim();
  if (cleaned === "") return DEFAULT_SESSION_TITLE;
  return cleaned.length <= 60 ? cleaned : `${cleaned.slice(0, 59)}…`;
}

/** Fold a finished turn's cost into the session total. */
export function addCost(total: TurnCost, turn: TurnCost): TurnCost {
  return {
    usage: addUsage(total.usage, turn.usage),
    requests: total.requests + turn.requests,
    estimatedUsd: total.estimatedUsd + turn.estimatedUsd,
  };
}
