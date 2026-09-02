/**
 * @trace/engine — the headless core, as a library.
 *
 * Two consumers, and the difference between them is why this file exists at all:
 *
 * **Out of process.** The desktop app spawns `dist/main.js` and talks JSON-RPC over a
 * pipe. It imports nothing from here — the protocol package is the whole contract.
 *
 * **In process.** The CLI, and eventually the VS Code fork, construct an `Engine`
 * directly over an in-memory transport, because paying a pipe and a JSON round-trip to
 * talk to code in the same process would be absurd. Those surfaces need the class, and
 * they need the handful of subsystems that are useful without it — a `Logger` to
 * configure, `MODELS` to render a picker from, `traceHome` to find state on disk.
 *
 * Nothing here is exported "just in case". Everything below is either the engine, its
 * options, or something a surface has to reach in order to be a surface; the tools, the
 * turn loop, the permission evaluator, and the session internals stay private, because
 * an embedder reaching into those is an embedder reimplementing the engine.
 *
 * Copyright (c) 2026 Origin AI
 */

export { ENGINE_VERSION, Engine } from "./engine.js";
export type { EngineOptions } from "./engine.js";

export { Logger, rootLogger } from "./logger.js";
export type { LogLevel, LogSink } from "./logger.js";

export {
  DEFAULT_MODEL,
  MODELS,
  UTILITY_MODEL,
  cacheHitRate,
  estimateUsd,
  getModel,
  resolveModel,
} from "./models.js";

export { DEFAULT_SETTINGS, KNOWN_PROVIDERS, SettingsStore, traceHome } from "./settings.js";
export type { KnownProvider } from "./settings.js";

export { workspaceIdFor } from "./workspace.js";
export type { Workspace } from "./workspace.js";

/**
 * Re-exported because a client cannot render the permission UI without it.
 *
 * The rules a *user* writes are settings and travel over the protocol. These are the
 * ones nobody can turn off, and a settings screen that does not show them invites the
 * question "why did it refuse when my rule said allow" — which is exactly the confusion
 * this export exists to prevent.
 */
export { HARD_DENY_RULES } from "./permissions.js";

/**
 * Exported for a surface that wants to show *why* a path was refused.
 *
 * `resolveInWorkspace` already enforces the boundary, so nothing needs these to be
 * safe. They are here so a file picker can grey out `.env` before the user clicks it,
 * rather than letting them click and then explaining.
 */
export { SENSITIVE_FILE_PATTERNS, isSensitivePath } from "./paths.js";
