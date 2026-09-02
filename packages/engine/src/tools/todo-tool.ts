/**
 * todo_write — the agent's own task list.
 *
 * Cheap, and disproportionately useful. On multi-step work the list is what stops
 * the model from losing the thread halfway through, and it is the only honest
 * progress indicator a human has while a long turn runs. It touches no files and
 * spawns nothing, so it never prompts.
 *
 * Copyright (c) 2026 Origin AI
 */

import type { TodoItem } from "@trace/protocol";
import type { ToolHandler, ToolResult } from "./registry.js";

const STATUS_MARK: Record<TodoItem["status"], string> = {
  pending: "[ ]",
  in_progress: "[~]",
  completed: "[x]",
  cancelled: "[-]",
};

function failure(summary: string, content: string): ToolResult {
  return { content, isError: true, summary };
}

export const todoWriteTool: ToolHandler<"todo_write"> = async (input, ctx) => {
  const todos = input.todos;

  const seen = new Set<string>();
  for (const todo of todos) {
    if (todo.content.trim() === "") {
      return failure("Empty todo", "Every todo needs non-empty content.");
    }
    if (seen.has(todo.id)) {
      return failure(
        "Duplicate todo id",
        `Duplicate todo id "${todo.id}". Ids must be unique so status updates map to the right task.`,
      );
    }
    seen.add(todo.id);
  }

  const active = todos.filter((t) => t.status === "in_progress");
  if (active.length > 1) {
    return failure(
      "Multiple tasks in progress",
      `${active.length} todos are marked in_progress. Keep exactly one — a list where everything is "in progress" tells the user nothing.`,
    );
  }

  ctx.todos.set(todos);
  ctx.emit({
    type: "todos_updated",
    sessionId: ctx.sessionId,
    turnId: ctx.turnId,
    todos,
  });

  const done = todos.filter((t) => t.status === "completed").length;
  const rendered = todos.map((t) => `${STATUS_MARK[t.status]} ${t.content}`).join("\n");

  return {
    // Echoing the list back is not redundant: it is what the model reads on the next
    // iteration to remember where it is, without re-deriving it from the transcript.
    content: todos.length === 0 ? "Task list cleared." : rendered,
    summary:
      todos.length === 0
        ? "Cleared the task list"
        : `Task list: ${done}/${todos.length} done${active[0] ? ` — ${active[0].content}` : ""}`,
    meta: { todos },
  };
};
