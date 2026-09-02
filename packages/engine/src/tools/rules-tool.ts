/**
 * fetch_rules — pull the text of a rule the model was shown only by name.
 *
 * The system prompt carries always-applied rules in full and everything else as a
 * one-line index. This tool closes that gap. It exists because the alternative —
 * inlining every rule a repository has — is what turns a 3k-token system prompt into
 * a 40k-token one that the user pays for on every request of every session, most of
 * them about something the rule does not govern.
 *
 * ## Why it is not `read_file`
 *
 * The model *could* read `.trace/rules/testing.md` directly, and that is exactly the
 * problem: it would have to know the path, `.trace` is ignored by the walker so
 * `glob` will not reveal it, and a user-global rule lives outside the workspace
 * entirely and would be refused by path containment. A rule is addressed by name, and
 * only this tool knows how a name resolves.
 *
 * Copyright (c) 2026 Origin AI
 */

import { findRule, type Rule } from "../rules.js";
import { renderRule } from "../session/prompt.js";
import { truncateForModel, type ToolHandler, type ToolResult } from "./registry.js";

/** Enough for several substantial rules; a stop on someone fetching the whole set. */
const MAX_RULES_PER_CALL = 10;

function failure(summary: string, content: string): ToolResult {
  return { content, isError: true, summary };
}

/**
 * A fetched rule, rendered exactly as an always-applied one is.
 *
 * `prompt.ts` owns the rendering so the two cannot drift. The globs ride along because a
 * rule fetched by name is more useful with its trigger visible — that is how the model
 * learns this rule will also arrive unasked the next time it opens a matching file.
 */
function render(rule: Rule): string {
  const globs = rule.globs.length > 0 ? rule.globs.join(", ") : undefined;
  return renderRule({
    name: rule.name,
    source: rule.source,
    body: rule.body,
    ...(globs === undefined ? {} : { globs }),
  });
}

export const fetchRulesTool: ToolHandler<"fetch_rules"> = async (input, ctx) => {
  const available = ctx.rules.fetchable;
  if (available.length === 0) {
    // Reachable despite the tool being filtered out of `tools` when there are no
    // rules: a cached prefix from earlier in the session still advertises it.
    return failure("No fetchable rules", "This workspace has no fetchable rules.");
  }

  // Deduped because a model asking for the same rule twice in one call is asking for
  // it once, and the trim makes `[" testing"]` work rather than mysteriously not.
  const wanted = [...new Set(input.rule_names.map((name) => name.trim()).filter((n) => n !== ""))];
  if (wanted.length === 0) {
    return failure("No rule named", "Name at least one rule from the index in the system prompt.");
  }
  if (wanted.length > MAX_RULES_PER_CALL) {
    return failure(
      "Too many rules requested",
      `Requested ${wanted.length} rules; the limit is ${MAX_RULES_PER_CALL} per call. Fetch the ones that govern the current task.`,
    );
  }

  const found: Rule[] = [];
  const missing: string[] = [];
  const alreadyInPrompt: string[] = [];

  for (const name of wanted) {
    const match = findRule(available, name);
    if (match !== undefined) {
      found.push(match);
      continue;
    }
    // Distinguished from "no such rule", because an always-applied rule is not missing
    // — it is above, and telling the model to look for it beats a bare failure.
    if (findRule(ctx.rules.all, name) !== undefined) alreadyInPrompt.push(name);
    else missing.push(name);
  }

  if (found.length === 0) {
    const names = available.map((rule) => rule.name).join(", ");
    if (alreadyInPrompt.length > 0 && missing.length === 0) {
      return failure(
        "Rules already in the prompt",
        `${alreadyInPrompt.join(", ")} ${alreadyInPrompt.length === 1 ? "is" : "are"} always applied and already in your system prompt — read it there.`,
      );
    }
    return failure(
      `No rule named ${missing[0] ?? wanted[0]}`,
      `No rule matched ${missing.join(", ")}. Fetchable rules: ${names}.`,
    );
  }

  const notes: string[] = [];
  if (missing.length > 0) notes.push(`Not found: ${missing.join(", ")}.`);
  if (alreadyInPrompt.length > 0) {
    notes.push(`Already in your system prompt: ${alreadyInPrompt.join(", ")}.`);
  }

  const body = found.map(render).join("\n\n");
  const { text } = truncateForModel(notes.length === 0 ? body : `${body}\n\n${notes.join(" ")}`);

  ctx.log.debug("Fetched rules", { names: found.map((rule) => rule.name), missing });

  return {
    content: text,
    summary:
      found.length === 1
        ? `Read rule ${found[0]?.name}`
        : `Read ${found.length} rules: ${found.map((rule) => rule.name).join(", ")}`,
    meta: { rules: found.map((rule) => ({ name: rule.name, path: rule.path })) },
  };
};
