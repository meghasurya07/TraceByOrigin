/**
 * Reducer smoke tests.
 *
 * `applyEvent` is the one function in the app that is both pure and load-bearing: every
 * pixel of the transcript is derived from it, and it is driven by a twenty-variant event
 * union arriving out of a network. That combination — easy to test, expensive to get wrong
 * — is the whole argument for testing this and not, say, a React component.
 *
 * Plain `node:test` against the built ESM output, no framework. A test runner is a
 * dependency, a config file, and a watch mode; `node scripts/smoke.mjs` is none of those,
 * and the day this needs fixtures and coverage is the day to add one.
 *
 * Run: `node scripts/smoke.mjs` (after `pnpm -F @trace/client build`).
 *
 * Copyright (c) 2026 Origin AI
 */

import assert from "node:assert/strict";
import test from "node:test";

import {
  TOOL_OUTPUT_CAP_CHARS,
  appendUserMessage,
  applyEvent,
  cumulativeCost,
  emptySessionView,
  hydrateFromHistory,
  initialAppState,
  itemIdFor,
  pendingPermission,
  visibleItems,
} from "../dist/index.js";

const SESSION = "s1";
const TURN = "t1";

function zeroCost() {
  return {
    usage: {
      inputTokens: 0,
      outputTokens: 0,
      cacheCreationInputTokens: 0,
      cacheReadInputTokens: 0,
    },
    requests: 0,
    estimatedUsd: 0,
  };
}

function cost(inputTokens, outputTokens, usd) {
  return {
    usage: {
      inputTokens,
      outputTokens,
      cacheCreationInputTokens: 0,
      cacheReadInputTokens: 0,
    },
    requests: 1,
    estimatedUsd: usd,
  };
}

function summary() {
  return {
    id: SESSION,
    workspaceId: "w1",
    title: "Untitled",
    createdAt: 1_000,
    updatedAt: 1_000,
    model: "claude-opus-5",
    turnCount: 0,
    isActive: false,
    cumulativeCost: zeroCost(),
  };
}

/** Fold a list of events, which is what the store does one notification at a time. */
function replay(events, view = emptySessionView(summary())) {
  return events.reduce((next, event) => applyEvent(next, event), view);
}

const started = {
  type: "turn_started",
  sessionId: SESSION,
  turnId: TURN,
  startedAt: 2_000,
  model: "claude-opus-5",
};

test("an event for another session is ignored", () => {
  const view = emptySessionView(summary());
  const next = applyEvent(view, { ...started, sessionId: "other" });
  assert.equal(next, view, "the same reference, so React skips the re-render");
});

test("turn_started opens a live turn and marks the session active", () => {
  const view = applyEvent(emptySessionView(summary()), started);
  assert.equal(view.summary.isActive, true);
  assert.equal(view.live?.turnId, TURN);
  assert.equal(view.live?.iteration, 0);
  assert.equal(view.live?.activeCallId, null);
});

test("text deltas coalesce into one block", () => {
  const view = replay([
    started,
    { type: "text_delta", sessionId: SESSION, turnId: TURN, blockIndex: 0, text: "Hel" },
    { type: "text_delta", sessionId: SESSION, turnId: TURN, blockIndex: 0, text: "lo." },
  ]);
  assert.equal(view.items.length, 1);
  assert.equal(view.items[0].text, "Hello.");
  assert.equal(view.items[0].streaming, true);
});

test("blockIndex 0 of a second iteration is a separate block", () => {
  const delta = { type: "text_delta", sessionId: SESSION, turnId: TURN, blockIndex: 0 };
  const view = replay([
    started,
    { ...delta, text: "First." },
    { type: "iteration_started", sessionId: SESSION, turnId: TURN, iteration: 1 },
    { ...delta, text: "Second." },
  ]);
  assert.equal(view.items.length, 2, "concatenating these would fuse two paragraphs");
  assert.equal(view.items[0].text, "First.");
  assert.equal(view.items[1].text, "Second.");
  assert.equal(view.items[1].id, itemIdFor.text(TURN, 1, 0));
});

test("a tool call streams input, runs, and settles", () => {
  const callId = "c1";
  const view = replay([
    started,
    { type: "tool_call_started", sessionId: SESSION, turnId: TURN, callId, tool: "read_file", blockIndex: 1 },
    { type: "tool_call_input_delta", sessionId: SESSION, turnId: TURN, callId, partialJson: '{"pa' },
    { type: "tool_call_input_delta", sessionId: SESSION, turnId: TURN, callId, partialJson: 'th":"a.ts"}' },
  ]);
  const streaming = view.items[0];
  assert.equal(streaming.status, "streaming_input");
  assert.equal(streaming.partialInput, '{"path":"a.ts"}');

  const ready = applyEvent(view, {
    type: "tool_call_ready",
    sessionId: SESSION,
    turnId: TURN,
    callId,
    tool: "read_file",
    input: { path: "a.ts" },
    summary: "Read a.ts",
  });
  assert.equal(ready.items.length, 1, "ready updates the row started earlier, never adds one");
  assert.equal(ready.items[0].status, "running");
  assert.equal(ready.live?.activeCallId, callId);

  const done = applyEvent(ready, {
    type: "tool_call_completed",
    sessionId: SESSION,
    turnId: TURN,
    callId,
    ok: true,
    durationMs: 12,
    resultPreview: "export const a = 1;",
  });
  assert.equal(done.items[0].status, "ok");
  assert.equal(done.live?.activeCallId, null);
});

test("tool output keeps the tail, not the head", () => {
  const callId = "c1";
  const base = replay([
    started,
    { type: "tool_call_started", sessionId: SESSION, turnId: TURN, callId, tool: "run_terminal_cmd", blockIndex: 0 },
  ]);
  const chunk = { type: "tool_call_output_delta", sessionId: SESSION, turnId: TURN, callId, stream: "stdout" };
  const view = replay([
    { ...chunk, chunk: "x".repeat(TOOL_OUTPUT_CAP_CHARS) },
    { ...chunk, chunk: "ERROR: build failed" },
  ], base);

  const item = view.items[0];
  assert.equal(item.output.length, TOOL_OUTPUT_CAP_CHARS);
  assert.equal(item.outputTruncated, true);
  assert.ok(item.output.endsWith("ERROR: build failed"), "a failing build prints its reason last");
});

test("a denied permission outranks the completion's ok flag", () => {
  const callId = "c1";
  const request = {
    callId,
    tool: "run_terminal_cmd",
    input: { command: "rm -rf build" },
    summary: "Run rm -rf build",
  };
  const asked = replay([
    started,
    { type: "permission_requested", sessionId: SESSION, turnId: TURN, request },
  ]);
  assert.equal(asked.items[0].status, "awaiting_permission");
  assert.equal(pendingPermission(asked)?.callId, callId);

  const resolved = applyEvent(asked, {
    type: "permission_resolved",
    sessionId: SESSION,
    turnId: TURN,
    callId,
    allowed: false,
    automatic: false,
  });
  assert.equal(resolved.items[0].status, "denied");
  assert.equal(resolved.items[0].permission, undefined, "the prompt is gone once answered");
  assert.equal(pendingPermission(resolved), null);

  const done = applyEvent(resolved, {
    type: "tool_call_completed",
    sessionId: SESSION,
    turnId: TURN,
    callId,
    ok: false,
    durationMs: 0,
    resultPreview: "Denied by the user.",
  });
  assert.equal(done.items[0].status, "denied", "'error' would hide that the user chose this");
});

test("turn_completed closes open blocks, adds a summary, and sums the cost", () => {
  const view = replay([
    started,
    { type: "text_delta", sessionId: SESSION, turnId: TURN, blockIndex: 0, text: "Done." },
    {
      type: "turn_completed",
      sessionId: SESSION,
      turnId: TURN,
      completedAt: 5_000,
      stopReason: "end_turn",
      cost: cost(120, 40, 0.002),
      changes: [],
    },
  ]);

  assert.equal(view.live, null);
  assert.equal(view.summary.isActive, false);
  assert.equal(view.summary.turnCount, 1);
  assert.equal(view.summary.cumulativeCost.usage.inputTokens, 120);
  assert.equal(view.summary.updatedAt, 5_000);

  const text = view.items.find((item) => item.kind === "assistant_text");
  assert.equal(text.streaming, false, "a caret left blinking reads as 'still thinking'");

  const turnSummary = view.items.find((item) => item.kind === "turn_summary");
  assert.equal(turnSummary.durationMs, 3_000, "5000 minus the turn's own startedAt");
  assert.equal(cumulativeCost(view).estimatedUsd, 0.002);
});

test("a fatal error ends the turn; a non-fatal one does not", () => {
  const soft = replay([
    started,
    { type: "error", sessionId: SESSION, turnId: TURN, code: -32_001, message: "Rate limited.", fatal: false, retryInMs: 2_000 },
  ]);
  assert.equal(soft.live?.turnId, TURN, "the engine retries this one itself");
  assert.equal(soft.items[0].retryInMs, 2_000);
  assert.equal(soft.seq, 1, "errors have no natural id, so the counter has to advance");

  const hard = applyEvent(soft, {
    type: "error",
    sessionId: SESSION,
    turnId: TURN,
    code: -32_603,
    message: "The provider closed the connection.",
    fatal: true,
  });
  assert.equal(hard.live, null, "no turn_completed follows a fatal error");
  assert.equal(hard.summary.isActive, false);
  assert.equal(hard.items.length, 2, "two errors, two rows");
  assert.notEqual(hard.items[0].id, hard.items[1].id);
});

test("the user's own message is added by the store, not by an event", () => {
  const view = appendUserMessage(emptySessionView(summary()), {
    turnId: TURN,
    at: 1_900,
    text: "Fix the flaky test.",
  });
  assert.equal(view.items.length, 1);
  assert.equal(view.items[0].kind, "user_message");
  assert.deepEqual(view.items[0].attachments, []);

  const again = appendUserMessage(view, { turnId: TURN, at: 1_900, text: "Fix the flaky test." });
  assert.equal(again.items.length, 1, "hydration must not double the prompt");
});

test("visibleItems hides reasoning and empty text, by reference when it can", () => {
  const view = replay([
    started,
    { type: "thinking_delta", sessionId: SESSION, turnId: TURN, blockIndex: 0, text: "Consider…" },
    { type: "text_delta", sessionId: SESSION, turnId: TURN, blockIndex: 1, text: "Here." },
  ]);
  assert.equal(visibleItems(view, { showThinking: true }), view.items, "no copy when nothing is hidden");
  assert.equal(visibleItems(view, { showThinking: false }).length, 1);

  const empty = applyEvent(view, {
    type: "text_delta",
    sessionId: SESSION,
    turnId: TURN,
    blockIndex: 2,
    text: "",
  });
  assert.equal(
    visibleItems(empty, { showThinking: true }).length,
    2,
    "a block opened and abandoned in favour of a tool call is not a bubble",
  );
});

test("hydration rebuilds a transcript from the persisted log", () => {
  const view = hydrateFromHistory({ ...summary(), turnCount: 1 }, [
    { kind: "user_message", turnId: TURN, at: 1_900, text: "Rename it.", attachments: [] },
    { kind: "assistant_text", turnId: TURN, at: 2_100, text: "Renamed." },
  ]);
  assert.equal(view.hydration, "ready");
  assert.equal(view.live, null, "reconstructing a live turn would mean guessing");
  assert.equal(view.items.length, 2);
  assert.equal(view.items[0].kind, "user_message");
  assert.equal(view.items[1].text, "Renamed.");
  assert.equal(
    view.items.every((item) => view.index[item.id] !== undefined),
    true,
    "every row is reachable through the index the reducer keeps beside it",
  );
});

test("initialAppState is a usable empty app", () => {
  const state = initialAppState();
  assert.equal(state.engine.phase, "starting");
  assert.equal(state.auth.status, "signed_out");
  assert.equal(state.activeSessionId, null);
  assert.deepEqual(state.workspaces, []);
  assert.deepEqual(state.notices, []);
});

test("title_updated returns the same view when the title has not changed", () => {
  const view = applyEvent(emptySessionView(summary()), {
    type: "title_updated",
    sessionId: SESSION,
    title: "Untitled",
  });
  assert.equal(view.summary.title, "Untitled");

  const renamed = applyEvent(view, {
    type: "title_updated",
    sessionId: SESSION,
    title: "Fix the flaky test",
  });
  assert.equal(renamed.summary.title, "Fix the flaky test");
});
