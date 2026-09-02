/**
 * Tool dispatch.
 *
 * One entry point, `runTool`, which validates input, routes to a handler, and
 * guarantees a `ToolResult` comes back even when the handler throws. That last part
 * matters more than it looks: an unhandled rejection here does not just fail a tool
 * call, it kills the turn and strands the user watching a spinner. A thrown error
 * becomes an `is_error` tool_result the model can read and route around.
 *
 * Copyright (c) 2026 Origin AI
 */

import { RpcError, type ToolInputMap, type ToolName } from "@trace/protocol";
import {
  deleteFileTool,
  editFileTool,
  listDirTool,
  readFileTool,
  writeFileTool,
} from "./fs-tools.js";
import type { ToolContext, ToolHandlerMap, ToolResult } from "./registry.js";
import { fetchRulesTool } from "./rules-tool.js";
import { codebaseSearchTool, globTool, grepTool } from "./search-tools.js";
import { runTerminalCmdTool } from "./terminal-tool.js";
import { todoWriteTool } from "./todo-tool.js";
import { ToolInputError, validateToolInput } from "./validate.js";

export const TOOL_HANDLERS: ToolHandlerMap = {
  read_file: readFileTool,
  list_dir: listDirTool,
  glob: globTool,
  grep: grepTool,
  codebase_search: codebaseSearchTool,
  write_file: writeFileTool,
  edit_file: editFileTool,
  delete_file: deleteFileTool,
  run_terminal_cmd: runTerminalCmdTool,
  todo_write: todoWriteTool,
  fetch_rules: fetchRulesTool,
};

/**
 * Validate, dispatch, and normalize failures.
 *
 * Never throws. Every outcome — bad arguments, a path outside the workspace, an
 * ENOENT, a bug in a handler — comes back as a `ToolResult`, because the agent loop's
 * job is to keep going and the model is perfectly capable of recovering from a
 * clearly-worded error.
 */
export async function runTool(
  tool: ToolName,
  rawInput: unknown,
  ctx: ToolContext,
): Promise<ToolResult> {
  let input: ToolInputMap[ToolName];
  try {
    input = validateToolInput(tool, rawInput);
  } catch (cause) {
    if (cause instanceof ToolInputError) {
      return { content: cause.message, isError: true, summary: `Invalid ${tool} arguments` };
    }
    throw cause;
  }

  const handler = TOOL_HANDLERS[tool];
  try {
    // The handler union is resolved per-tool at the type level; erasing here is the
    // one place the mapped-type dispatch cannot be expressed without a cast.
    return await (handler as (i: unknown, c: ToolContext) => Promise<ToolResult>)(input, ctx);
  } catch (cause) {
    if (cause instanceof RpcError) {
      // Path-containment and workspace errors land here. The message is already
      // written for a human, and it reads fine to the model too.
      return { content: cause.message, isError: true, summary: `${tool} failed` };
    }

    const err = cause as NodeJS.ErrnoException;
    if (err?.code === "EACCES" || err?.code === "EPERM") {
      return {
        content: `Permission denied by the operating system. Trace cannot access that path with its current privileges.`,
        isError: true,
        summary: `${tool}: permission denied`,
      };
    }
    if (err?.code === "ENOSPC") {
      return { content: "No space left on device.", isError: true, summary: `${tool}: disk full` };
    }
    if (err?.name === "AbortError") {
      return { content: "Interrupted by the user.", isError: true, summary: `${tool} interrupted` };
    }

    // Genuinely unexpected. Log with the stack for us, return the message for the model.
    ctx.log.error(`Tool ${tool} threw`, cause);
    const message = cause instanceof Error ? cause.message : String(cause);
    return { content: `${tool} failed: ${message}`, isError: true, summary: `${tool} failed` };
  }
}

export { TOOL_DEFINITIONS, toolsForRequest, toolDefinition } from "./registry.js";
export type { ToolContext, ToolDefinition, ToolResult } from "./registry.js";
