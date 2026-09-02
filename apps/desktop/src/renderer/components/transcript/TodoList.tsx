/**
 * The agent's plan.
 *
 * One card per turn, replaced in place — not a log. The reducer overwrites the same
 * item on every `todos_updated`, so what the user sees is the plan *now*, which is the
 * only version that answers "what is it doing and how much is left".
 *
 * Completed items stay visible rather than disappearing, because the value of a plan
 * mid-turn is the ratio: four ticks and two blanks reads as progress, while a list that
 * shrinks to its remainder reads as a list that never ends.
 *
 * Copyright (c) 2026 Origin AI
 */

import { memo } from "react";
import { Check, CircleDashed, CircleSlash, LoaderCircle } from "lucide-react";

import type { TodoItem, TodoStatus } from "@trace/protocol";
import type { ItemOf } from "@trace/client";

import { cn } from "../../lib/cn";

const TEXT_STYLE: Readonly<Record<TodoStatus, string>> = {
  pending: "text-fg-muted",
  in_progress: "text-fg",
  completed: "text-fg-subtle line-through decoration-fg-subtle/50",
  cancelled: "text-fg-subtle line-through decoration-fg-subtle/50",
};

export const TodoList = memo(function TodoList(props: {
  item: ItemOf<"todos">;
}): React.JSX.Element | null {
  const { todos } = props.item;
  if (todos.length === 0) return null;

  const done = todos.filter((todo) => todo.status === "completed").length;

  return (
    <div className="my-1.5 rounded-md border border-line bg-surface-raised/40 px-2 py-1.5">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-2xs font-medium text-fg-subtle">Plan</span>
        <span className="font-mono text-2xs text-fg-subtle">
          {done}/{todos.length}
        </span>
      </div>
      <ul className="space-y-0.5">
        {todos.map((todo) => (
          <Row key={todo.id} todo={todo} />
        ))}
      </ul>
    </div>
  );
});

function Row({ todo }: { todo: TodoItem }): React.JSX.Element {
  return (
    <li className="flex items-start gap-1.5">
      <span className="mt-0.5 shrink-0">
        <Mark status={todo.status} />
      </span>
      <span
        className={cn("selectable min-w-0 flex-1 text-xs leading-relaxed", TEXT_STYLE[todo.status])}
      >
        {todo.content}
      </span>
    </li>
  );
}

function Mark({ status }: { status: TodoStatus }): React.JSX.Element {
  if (status === "completed") return <Check size={11} className="text-success" />;
  if (status === "in_progress") {
    return <LoaderCircle size={11} className="animate-spin text-accent-fg" />;
  }
  if (status === "cancelled") return <CircleSlash size={11} className="text-fg-subtle/60" />;
  return <CircleDashed size={11} className="text-fg-subtle/60" />;
}
