# Trace by Origin AI — Research Dossier v1

**Date:** 2026-09-01
**Status:** Partial. Research was interrupted by API quota exhaustion (see §9). All facts below are recovered from primary-source fetches; certainty is labelled.

---

## 1. The headline: your reframe is correct, and it's bigger than you said

Cursor's own tagline is now **"AI Coding Agent for Building Ambitious Software."** Not "AI Code Editor." The pivot is real and complete.

`[confirmed]` Cursor 2.0 (Oct 29, 2025) was the turn: *"designed from the ground up to be centered around agents rather than files."* It shipped a "new editor, with a sidebar for your agents and plans," and kept an explicit escape hatch — *"switch back to the classic IDE."*

`[confirmed]` Cursor 3.x (2026) finished the job. The primary surface is now called the **Agents Window**. Version 3.4 describes it precisely:

> A maximized right panel lets files, diffs, canvases, PRs, browsers, and terminals fill the work area, **swapping the chat for a floating prompt bar**. Toggle via the panel header button, command palette, or `Cmd/Ctrl+Shift+M`.

So: chat/agent is the frame; the editor is one of *six* things that can occupy a summonable work panel. That matches what you described, and it generalises it — it isn't just "IDE in the top right," it's a **work-surface panel** that can be an editor, a diff, a canvas, a PR, a browser, or a terminal.

**Consequence for us:** the editor is no longer the product's centre of gravity. It is a viewport. This substantially *reduces* the cost of v1 (we don't need to beat VS Code at editing on day one) and *raises* the cost of parity (we need agent orchestration, cloud execution, review surfaces, and a plugin ecosystem).

---

## 2. Cursor's evolution — verified timeline

| When | What | Certainty |
|---|---|---|
| Oct 7, 2025 | Plan Mode | confirmed |
| **Oct 29, 2025** | **2.0** — agent-centric redesign; Composer model; up to **8 parallel agents** on one prompt via **git worktrees or remote machines**; Browser GA (element select + DOM forwarding); Sandboxed Terminals GA; Improved Code Review; Team Commands; Voice Mode; Plan Mode in Background. Background Agents → **Cloud Agents**. **Notepads deprecated.** `@Definitions`, `@Web`, `@Link`, `@Recent Changes`, `@Linter Errors` **removed** — "the agent gathers context itself." Files/dirs render as inline **pills**. | confirmed |
| Feb–Mar 2026 | Press coverage (TechCrunch, Bloomberg, CNBC, The New Stack) describes "a new kind of agentic coding tool" | confirmed |
| **May 7, 2026** | **3.3** — PR Review surface (Reviews / Commits / Changes tabs); **Build in Parallel** (fans plan steps to async subagents while preserving dependencies); **Split PRs** with backup snapshot; skills pinned as quick-action pills | confirmed |
| **May 13, 2026** | **3.4** — Full-screen Tabs (the panel behaviour quoted above); chat density Compact/Balanced/Detailed; multi-repo cloud environments; Dockerfile config with build-step-scoped secrets; layer caching ("cache hits run 70% faster") | confirmed |
| Jun 3–4, 2026 | Organizations for Enterprise (orgs → teams → groups, "most permissive setting wins"); **Cursor SDK**: `local.customTools` via an MCP server named `custom-user-tools`, `local.autoReview` with allow/block in `permissions.json`, JSONL + pluggable stores, arbitrarily nested subagents, `requestId` correlation, **bundled ripgrep** | confirmed |
| Jun 4–5, 2026 | **3.7** — Canvas Design Mode; interactive **context usage report** with "Debug with Agent"; full-screen shared canvases; agent-embedded prompt buttons; multi-select in Design Mode | confirmed |
| Jun 10, 2026 | Bugbot: ~90 s per review (from ~5 min), 0.62 bugs/review, −22 % cost, credited to **Composer 2.5**; `/review`, `/review-bugbot`, `/review-security` | confirmed |
| Jun 17–18, 2026 | **3.7/3.8** — cloud env setup in <10 min captured as a snapshot in `.cursor/environment.json`; `/in-cloud` and `/babysit` cloud subagents on their own VM + branch; local↔cloud session handoff; Automations (`/automate`, Slack emoji trigger, 5 GitHub triggers, computer use on by default) | confirmed |
| Jun 22, 2026 | **3.9** — **Customize page** consolidating plugins, skills, MCPs, subagents, rules, commands, hooks; popularity leaderboard; prebuilt canvases; team marketplace import from GitLab/BitBucket/Azure DevOps | confirmed |
| Jun 29, 2026 | **3.9** — **iOS app** (beta, paid plans): cloud agents on phone, **Remote Control of a desktop agent**, lock-screen Live Activities, push, artifact/diff review, PR merging | confirmed |
| Jun 30, 2026 | **3.10** — team MCP servers pushed "across **cloud agents, the agents window, IDE, and CLI**" ← four surfaces, named by Cursor | confirmed |
| **Jul 10, 2026** | **3.11** — **Side chats** (`/side`, `/btw`, plus button) inheriting parent context, durable and @-mentionable; **conversation search** via `Cmd+K` in the Agents Window, backed by a **local index built for thousands of chats**; `Cmd+F` in-conversation; repo pickers scoped **This Computer / Cloud / remote machine**; "Run on" picker; **No Repo** option; Select Multiple for multi-repo; cloud-agent hooks `beforeSubmitPrompt`, `afterAgentResponse`, `afterAgentThought`, `stop`, `subagentStart` | confirmed |
| Jul 20, 2026 | Blog: "Agent swarms and the new model economics" | confirmed |
| Jul 22, 2026 | **Cursor Router** — model routing per task | confirmed |
| Jul 28–29, 2026 | **Cursor Start**; **Cursor on iPad** | confirmed |
| Aug 3, 2026 | Google Workspace plugins (Gmail / Drive / Calendar) | confirmed |
| Aug 4, 2026 | "Mixture-of-Kittens: our open-source MoE megakernel for NVL72s" — they write their own GPU kernels | confirmed |
| Aug 12, 2026 | **"Introducing Grok 4.6"** — published *by Cursor* | confirmed |
| Aug 13, 2026 | **Builds** (prewarmed env copies; "10× faster boot, 3× faster time to first token"); **AIUC-1 certification**; Firetiger acquisition | confirmed |
| **Aug 14, 2026** | **"Cursor is now a part of SpaceX"** | confirmed |
| **Aug 17, 2026** | **Origin Code Hosting** — Cursor hosts your code. Repos, PRs, browsing, GitHub two-way sync. New **Codebase** tab. URLs `cursor.com/codebase/<name>`. Apps tab: Vercel, Depot, Buildkite | confirmed |
| Aug 18, 2026 | Blog: "Git at any scale" (Vicent Martí — ex-GitHub/libgit2) | confirmed |
| Aug 19, 2026 | **Subscriptions** (agents wake on PR/Slack/schedule events, auto-follow their own PRs, fix CI, answer bot comments); **Custom modes** (skill pinned as "always on", `⌥⏎`); **subagents on their own VMs**; **`/goal`**; **steering** that queues until the next tool call | confirmed |
| Aug 27, 2026 | Start with no repo at all; port-forwarded live preview; publish via Vercel | confirmed |

**Certifications:** SOC 2, ISO 27001, ISO 42001, AIUC-1. **Corporate:** Anysphere, Inc., now part of SpaceX; default cloud model Grok 4.6; nav carries "Models → Grok" and a "Grok Bot" product.

---

## 3. What "exactly like Cursor" now costs

This is the part I need to flag before we write code. Cursor 3.x is no longer an editor with a chat panel. Full parity today means **all** of:

**Client surfaces (5):** Agents Window desktop app · IDE · CLI · Web · iOS + iPad
**Execution:** local agents · git-worktree parallelism · sandboxed terminals · cloud agent VMs · prewarmed Builds · port-forwarded previews
**Agent harness:** plan mode · subagents (nested, own VMs) · side chats · `/goal` · `/loop` · steering · custom modes · skills · hooks (incl. cloud-distributed) · automations · subscriptions/event triggers · computer use
**Context:** semantic index · conversation search index · canvases · context usage report
**Review:** PR review surface · Bugbot (`/review`, `/review-security`) · split PRs · auto-review with `permissions.json`
**Platform:** Origin code hosting · marketplace (plugins/skills/MCPs/subagents/rules/commands/hooks) · team marketplaces · SDK · Slack/Teams/GitHub integrations · Google Workspace plugins · enterprise orgs/teams/groups + SCIM + audit log
**Models:** in-house Composer 2.5 · Cursor Router · own MoE GPU kernels

Anysphere has hundreds of engineers, a SpaceX balance sheet, and their own inference stack. **A 1:1 clone of 3.x is not a realistic v1 for any small team.** That is not a reason to abandon the goal — it's a reason to sequence it deliberately, which is what most of my questions below are about.

---

## 4. The convergent architecture — and it's the one you want

All three serious agent-first products have landed on the *same* shape: **one headless engine, many thin surfaces.**

`[confirmed]` **Claude Code** states it outright:
> Each surface connects to the same underlying Claude Code engine, so your repo's CLAUDE.md files, settings, and MCP servers work across all of them.

Surfaces: Terminal CLI · VS Code ext · JetBrains plugin · Desktop app (macOS, Win x64, Win ARM64, Linux beta — *"the app includes Claude Code, so you don't need to install the CLI separately"*) · Web · iOS/Android.
Session portability is a first-class feature: `--teleport`, `--cloud`, `/desktop` handoff, Remote Control, Dispatch, Channels (Telegram/Discord/iMessage/webhooks).

`[confirmed]` **OpenAI Codex** — Apache-2.0, ~121 k stars, 10 072 commits. `codex-rs/` is the **Rust** core; `codex-cli/` + `sdk/` are TS in a **pnpm workspace**; built with **Bazel** (incl. remote build execution) plus a Nix flake. Surfaces: CLI · IDE extension (VS Code/Cursor/Windsurf) · `codex app` desktop · Codex Web. **This repo is our single best open reference — permissive licence, real production code, same architecture.**

`[confirmed]` **Google Antigravity** — "agentic development platform… build in the agent-first era." Antigravity **2.0** is a *"command center to manage multiple local agents in parallel,"* with Projects grouping, multi-workspace, scheduled messages. Separate surfaces: CLI (terminal-first) · SDK (Python) · **IDE** ("agent manager, artifacts, codebase understanding") · Extensions · web Remote Control. Free for developers. Downloads shown for Apple Silicon + Intel only. Gemini 3.7 Flash / 3.6 Flash.

**The pattern to copy:** a headless engine process owning fs/git/pty/index/agent-loop, addressed over a stable local protocol, with the desktop app, CLI, web, and (later) the VS Code fork all as clients. This is also exactly what makes your phase-3 fork cheap: the fork becomes *one more client*, not a rewrite.

---

## 5. Where the incumbents actually hurt

From `forum.cursor.com/latest`, captured 2026-09-01. I'm reporting this straight, including the part that doesn't flatter our thesis.

**Actual top complaint clusters, by volume:**
1. **Grok Bot onboarding/connectivity** — setups hanging on black screens, installs never finishing, machines unreachable for days, broken Linux execution, VPN/SSO/passkey friction
2. **Billing & quota opacity** — "Cloud Agents default model Grok 4.6 High still runs Fast and burns 2x usage"; "Grok Bot gives no warning before weekly usage spills into paid On-Demand"; reset date pegged to a fixed anniversary rather than renewal; open demand for a tier between Pro+ and Ultra; a 66-reply/6 232-view thread titled *"Is SuperGrok Heavy now the better Cursor Ultra deal?"*
3. **Stability** — renderer memory leak crashing windows; *"Agent Window UI Collapses/Fails to Render Content Fully on Launch"*
4. **Platform defects** — Windows shell tool output empty/hanging; CLI character-encoding corruption
5. **Agent trust & model routing control** — *"Cursor agents working even when stopped. Models keep going to Anthropic, and I don't want that"*
6. **Team/collab gaps** — shared canvas invisible to teammates; project rename doesn't persist; MCP OAuth never reaches `needsAuth`
7. **Requests** — VS Code-style git graph; multi-repo cloud agents outside a monorepo

> ⚠️ **Honest finding that affects your positioning:** "it forgets things" is **not** the dominant complaint in the current queue. The loudest pain is *billing transparency, stability, and control over model routing*. Memory is table-stakes-shaped, not scream-shaped.
>
> It's also **already contested**: Claude Code ships **auto memory** — *"Claude also builds auto memory as it works, saving learnings across sessions without you writing anything"* — plus CLAUDE.md. Cursor has Rules + Memories + AGENTS.md. So "we have memory" is not a differentiator by itself. **"Memory that is inspectable, editable, portable, team-shared, and provably reduces repeat mistakes"** could be. That's a real product, but it needs to be built as a measurable claim, not a feature bullet.

I have not yet verified this against Reddit/HN/GitHub issues — WebSearch is unavailable (§9), so this rests on one forum snapshot. Treat the ranking as directional, not settled.

---

## 6. ⚠️ Name collision — needs a decision now

**Cursor's code-hosting product is called Origin.** Shipped Aug 17, 2026. Repos live at `cursor.com/codebase/<name>`; docs say *"For Origin-hosted repos, Origin is the source of truth."*

"Trace **by Origin** AI" competing against Cursor, whose flagship new platform is named **Origin**, is a direct collision in the same product category. That's a trademark-opposition and SEO problem, not just an aesthetic one. Worth resolving before we put the name in a package scope, a binary name, a URL protocol handler, and a signing certificate.

---

## 7. Recommended technical stack (provisional)

Pending your answers, and consistent with what Codex/Claude Code actually do:

- **Monorepo:** pnpm workspaces + Turborepo, TS project references
- **Engine:** TypeScript, runs as its own process (`utilityProcess` under Electron, plain node elsewhere), owns fs/git/pty/index/agent-loop/memory
- **Protocol:** JSON-RPC over stdio to the engine (same channel the CLI uses) — makes every surface a client and keeps the fork cheap
- **Desktop:** Electron (forced anyway by the phase-3 VS Code fork; also gives us node-pty, better-sqlite3, ripgrep)
- **UI:** React + Vite + Tailwind + Radix; xterm.js for terminals; Monaco for the summonable editor panel; virtualized transcript
- **Retrieval:** tree-sitter chunking, local SQLite (sqlite-vec) first, server-side vector store later
- **Agent loop:** written by us, on the Claude API with prompt caching — not a heavyweight framework
- **Models:** Claude for the agent loop; a separate cheap/fast model for apply and for Tab

Rationale and alternatives are in `research/raw/single-codebase-cross-platform-strategy-for-a-curs.md` and `.../the-ai-provider-inference-layer-and-unit-economics.md`.

---

## 8. Salvaged research index

1.27 M characters recovered into `research/raw/`:

| File | Chars |
|---|---|
| `exhaustive-cursor-feature-ux-inventory-what-we-mus.md` | 298 533 |
| `the-ai-provider-inference-layer-and-unit-economics.md` | 189 154 |
| `cursor-s-agent-loop-tool-schema-edit-application-a.md` | 188 391 |
| `the-protocol-and-integration-layer-for-agent-first.md` | 135 762 |
| `mechanics-cost-and-legal-reality-of-shipping-a-vs-.md` | 90 298 |
| `cursor-s-technical-architecture-and-tech-stack-end.md` | 58 447 |
| `cursor-s-codebase-indexing-embedding-and-retrieval.md` | 54 280 |
| `supermemory-and-the-ai-memory-landscape-the-founda.md` | 54 114 |
| `open-source-reference-implementations-we-can-study.md` | 50 629 |
| `single-codebase-cross-platform-strategy-for-a-curs.md` | 42 227 |
| `cursor-tab-autocomplete-edit-prediction-architectu.md` | 40 746 |
| `cursor-3-0-and-the-2-0-to-3-0-transition-exactly-w.md` | 31 558 |
| `claude-code-and-openai-codex-as-agent-first-produc.md` | 22 758 |
| `designing-and-building-the-agent-first-ui-shell-co.md` | 8 822 |
| `where-the-incumbents-actually-hurt-the-product-wed.md` | 5 454 |
| `google-antigravity-and-the-rest-of-the-agent-first.md` | 3 722 |

---

## 9. Blockers

1. **API quota exhausted.** 9 of 15 research agents died on `403 pre-consume quota failed` (remaining $0.09–$0.61 against requests needing $0.26–$0.67). Large parallel fan-out is impossible until the account is topped up. Single-threaded work still runs.
2. **`WebSearch` is not registered in this session.** Three more agents died on `Tool 'web_search' not found`. Only `WebFetch` works, so research is limited to URLs we can guess or discover by crawling. This is why §5 rests on one forum page.
3. **Toolchain gaps:** no `pnpm`, no Rust. Node 24.15.0, npm 11.12.1, git 2.54.0, Docker 29.7.2 present.

## 10. Not yet researched (needs quota)

- Supermemory's actual API surface and pricing (partial data only)
- Cursor 3.0's own release note — pagination only reached back to 3.3 (May 2026)
- Reddit/HN/GitHub complaint corpus to validate §5
- VS Code fork mechanics detail, Open VSX coverage, signing costs
- Model pricing verification for 2026 (Grok 4.6, Composer 2.5, Gemini 3.7, current Claude/OpenAI tiers)
