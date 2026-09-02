/**
 * Tool input validation.
 *
 * The model's tool arguments arrive as JSON assembled from a stream of partial
 * fragments. Most of the time they are exactly right; occasionally a field is
 * missing, a number arrives as a string, or the JSON is truncated by an interrupt.
 * Validating here converts all of that into one clear `is_error` message the model
 * can act on, instead of a `TypeError` deep inside a tool that reads as an engine
 * crash to the user.
 *
 * Unknown keys are stripped rather than rejected: a model that adds a plausible
 * extra field should still get its call executed.
 *
 * Copyright (c) 2026 Origin AI
 */

import type { ToolInputMap, ToolName } from "@trace/protocol";
import { z } from "zod";

const pathField = z.string().min(1, "must not be empty");

const schemas = {
  read_file: z.object({
    path: pathField,
    start_line: z.number().int().positive().optional(),
    end_line: z.number().int().positive().optional(),
  }),
  list_dir: z.object({
    path: pathField,
  }),
  glob: z.object({
    pattern: z.string().min(1),
    path: z.string().optional(),
  }),
  grep: z.object({
    pattern: z.string().min(1),
    path: z.string().optional(),
    include: z.string().optional(),
    case_sensitive: z.boolean().optional(),
  }),
  codebase_search: z.object({
    query: z.string().min(1),
    target_directories: z.array(z.string()).optional(),
  }),
  write_file: z.object({
    path: pathField,
    // Empty content is legal — truncating a file is a real operation.
    content: z.string(),
  }),
  edit_file: z.object({
    path: pathField,
    old_string: z.string(),
    new_string: z.string(),
    replace_all: z.boolean().optional(),
  }),
  delete_file: z.object({
    path: pathField,
  }),
  run_terminal_cmd: z.object({
    command: z.string().min(1),
    cwd: z.string().optional(),
    timeout_ms: z.number().int().positive().optional(),
    is_read_only: z.boolean().optional(),
  }),
  todo_write: z.object({
    todos: z.array(
      z.object({
        id: z.string().min(1),
        content: z.string(),
        status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
      }),
    ),
  }),
  fetch_rules: z.object({
    // `min(1)` on the array, because fetching nothing is a wasted round trip the
    // model should be told about rather than an empty success it may not notice.
    rule_names: z.array(z.string().min(1)).min(1, "name at least one rule"),
  }),
} satisfies { [K in ToolName]: z.ZodType };

export class ToolInputError extends Error {
  constructor(
    readonly tool: ToolName,
    message: string,
  ) {
    super(message);
    this.name = "ToolInputError";
  }
}

/**
 * Parse and coerce a tool's raw input.
 *
 * The cast on return is safe by construction: `schemas` is `satisfies`-checked
 * against every `ToolName`, and each entry mirrors the corresponding interface in
 * `@trace/protocol`. A drift between the two is caught by the tool handlers, which
 * are typed against the protocol interfaces rather than the inferred zod output.
 */
export function validateToolInput<K extends ToolName>(tool: K, raw: unknown): ToolInputMap[K] {
  const schema = schemas[tool];
  const result = schema.safeParse(raw);
  if (result.success) return result.data as ToolInputMap[K];

  const details = result.error.issues
    .map((issue) => {
      const field = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return `${field}: ${issue.message}`;
    })
    .join("; ");

  throw new ToolInputError(
    tool,
    `Invalid arguments for ${tool} — ${details}. Check the tool's schema and call it again.`,
  );
}
