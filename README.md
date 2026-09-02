# Trace

An agent-first coding application, by **Origin AI**.

Chat is the frame. A summonable work panel — files, diff, canvas, PR, browser, terminal — is
the viewport onto what the agent is doing. An IDE is one option inside that panel rather than
the thing the product is built around.

> **Status: pre-alpha, and not usable as a daily driver yet.** It builds, typechecks, runs, and
> holds a real conversation with a real model against a real repository. The gaps are listed at
> the bottom, honestly.

## Shape

A **headless engine** does the work; **thin surfaces** display it.

```
packages/protocol   The wire. JSON-RPC 2.0 over NDJSON, types only, no runtime deps.
packages/engine     Sessions, turns, tools, permissions, checkpoints, search. Plain Node.
packages/client     Framework-free state reducer over the event stream. Surfaces reuse it.
apps/desktop        Electron. Main owns the engine process; the renderer never sees stdio.
```

Dependency direction is one-way and enforced by project references:
`protocol ← client ← desktop` and `protocol ← engine`. The engine never imports the desktop.

The engine is spawned as ordinary Node (`ELECTRON_RUN_AS_NODE=1`), not as a renderer, which is
what makes a second surface — a CLI, a web client, an editor extension — a matter of speaking
the protocol rather than of extracting the logic first.

`EngineRequestHandlers` is declared as `{ [M in RequestMethod]: RequestHandler<M> }` with no
`Partial`. Adding a method to the protocol is therefore a compile error until it is
implemented. That is deliberate: the protocol is the specification, and it is checked.

## Running it

```bash
pnpm install
pnpm dev
```

`pnpm install` downloads Electron's 367 MB runtime via an allow-listed postinstall — see the
comments in `pnpm-workspace.yaml` for why each one is on or off. Then bring your own API key:
**Settings → Models**. Keys are held in the OS keychain by the main process and never cross
the protocol boundary or reach disk in plaintext.

| Command | |
|---|---|
| `pnpm dev` | Run the desktop app against the local engine |
| `pnpm typecheck` | `tsc -b` across all four projects |
| `pnpm test` | Per-package test scripts |
| `pnpm format` | Prettier |
| `pnpm --filter @trace/desktop package` | Build an installer for the host platform |

## What works

Multi-workspace sessions with a persisted transcript · streaming turns with visible reasoning ·
read/write/edit, glob, ripgrep-backed text search, terminal (node-pty) and todo tools ·
per-tool permission prompts with an allow/ask/deny rule engine · git checkpoints and rollback ·
per-file diff review · `@` file mentions and `/` commands, including markdown-file commands
from `.trace/commands/` · steering a turn while it runs · six work panels.

## What does not work yet

No semantic index — `codebase_search` is a placeholder and `indexStatus` is hard-coded
`absent`. Anthropic is the only provider wired. No MCP client, no rules files, no
worktree-isolated parallel agents, no subagents, no hooks, no tab completion, no accounts,
no hosted model catalog, no billing, no IDE. Lint is declared but its toolchain is not
installed, and test coverage is one smoke suite over the client reducer.

---

Copyright (c) 2026 Origin AI. All rights reserved.
