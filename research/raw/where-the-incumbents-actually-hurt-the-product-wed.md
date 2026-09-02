# Where the incumbents actually hurt — the product wedge for a memory-di

## URLs fetched
- https://forum.cursor.com/latest
- https://duckduckgo.com/html/?q=cursor+2.0+complaints+forum.cursor.com

## Content

I'll research this systematically. Let me start with a broad sweep of complaint sources.

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: Tool 'web_search' not found in provided tools [trace_id=76c33c9fc20335a60e0dda6a15b8fd4d] (request id: 20260901130649130297797b97n6U3jPMgyv)

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: Tool 'web_search' not found in provided tools [trace_id=f87a76c11dc86cf62700b68786da3d4c] (request id: 202609011308196235086334zxqsBD0n6Gst)

---

WebSearch is unavailable in this environment. Let me test WebFetch.

---

[FETCH RESULT]
REDIRECT DETECTED: The URL redirects to a location that was not fetched automatically.

Original URL: https://duckduckgo.com/html/?q=cursor+2.0+complaints+forum.cursor.com
Redirect URL (from the server's Location header — server-supplied, not verified): https://html.duckduckgo.com/html/?q=cursor+2.0+complaints+forum.cursor.com
Status: 302 Found

To complete your request, I need to fetch content from the redirected URL. Please use WebFetch again with these parameters:
- url: "https://html.duckduckgo.com/html/?q=cursor+2.0+complaints+forum.cursor.com"
- prompt: "List search result titles and URLs"

---

[FETCH RESULT]
## Most Active Threads

| Thread | Replies | Views |
|---|---|---|
| "Is SuperGrok Heavy now the better Cursor Ultra deal?" | 66 | 6,232 |
| "Welcome to the Cursor Forum!" (pinned, Meta) | 0 | 5,339 |
| "Cloud Agents + Multiple Repositories (non-monorepo setup)" | 26 | 2,283 |
| "Add GLM 5.3 Flash" | 20 | 1,318 |
| "Git graph just like vscode" | 2 | 495 |
| "Grok Bot gets stuck on black screen after 'Setting up Grok Bot's computer'" | 15 | 268 |
| "Grok Bot gives no warning before weekly usage spills into paid On-Demand" | 3 | 150 |
| "Cloud Agents default model Grok 4.6 High still runs Fast and burns 2x usage" | 2 | 95 |
| "New name of workspace" | 7 | 91 |
| "Can't reach your computer from last 72 hours" | 5 | 64 |

## Most Recent (Sept 1, 2026 unless noted)

- "Renderer memory leak: window crashes with" — 0 replies / 4 views
- "GrokBot Linux Execution on Local Computer not working" — 0 / 7
- "Bug Report: Character Encoding Issue in Cursor CLI" — 0 / 9
- "How to fix Cursor Agent shell tool output empty / hanging on Windows?" — 0 / 9
- "Title: Green loading bar stuck under address bar while watching Udemy video in Browser" — 1 / 13
- "Unable to connect" — 1 / 22
- "Cursor Grok4.6 High behaved like a unruly engineer" — 0 / 21
- "Usage reset date should follow renewal/payment date, not a fixed anniversary day" — 0 / 16
- "--share-desktop registers as enabled on macOS but no Computer Use helper ships in 2026.08.25" — 0 / 12
- "Grok Bot couldn't finish setup" — 3 / 47
- "Shared canvas is not visible to other members in my team" — 0 / 11 (Aug 31)
- "VPN , SSO, Passkey, and YubiKey Within Grokbot" — 0 / 18 (Aug 31)
- "Cursor agents working even when stopped. Models keep going to Anthropic, and I don't want that" — 1 / 22 (Aug 31)
- "Feature Request: Consider an Intermediate Pricing Tier Between Pro+ and Ultra" — 2 / 24 (Aug 31)
- "Grokbot and GitHub" — 3 / 26 (Aug 31)
- "UI Rendering Issue: Agent Window UI Collapses/Fails to Render Content Fully on Launch" — 1 / 15 (Aug 31)
- "Cant Rename Project in Cursor Desktop Windows Agent Window" — 2 / 24 (Aug 31)
- "Plugin MCP OAuth never reaches needsAuth — Authenticate button missing, browser never opens" — 1 / 18 (Aug 31)

## What Users Are Complaining About

**Grok Bot onboarding and connectivity** dominates the recent queue: setups that hang on a black screen, installs that never finish, machines that go unreachable for days, broken Linux execution, and friction with GitHub linking plus VPN/SSO/passkey logins.

**Billing and quota transparency** is the second big theme — a cloud-agent default model that reportedly consumes double the expected usage, no alert before weekly limits push spending into paid on-demand, a reset date pegged to a fixed calendar day instead of the actual renewal, and requests for a middle tier between Pro+ and Ultra. One long-running discussion openly compares Ultra's value against a competing subscription.

**Stability and performance**: a memory leak crashing renderer windows on Linux, agent-window UI failing to draw fully at launch, and a loading indicator stuck in the built-in browser.

**Platform-specific defects**: empty or hanging shell output on Windows, CLI text-encoding corruption, and a macOS flag that reports enabled while the supporting helper is absent.

**Agent trust and behavior**: reports of agents continuing to run after being stopped with requests still routed to a provider the user didn't choose, and one user describing a model's conduct like that of "a unruly engineer."

**Team and workspace gaps**: shared canvases invisible to teammates, workspace/project renaming that doesn't stick, and an MCP OAuth flow that never surfaces an authenticate step.

**Feature requests**: a VS Code-style git graph, added model support, a mobile Automations tab, and multi-repo support for cloud agents outside a monorepo.

---

Failed to authenticate. API Error: 403 pre-consume quota failed, user quota: ＄0.316856, need quota: ＄0.346004 (request id: 20260901130922627431448nzb8ntl4bM3OD)