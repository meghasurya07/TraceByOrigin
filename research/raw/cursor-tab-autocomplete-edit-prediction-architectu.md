# Cursor Tab (autocomplete / edit-prediction) — architecture and how to 

## URLs fetched
- https://cursor.com/blog/tab-rl
- https://cursor.com/blog
- https://cursor.com/blog/topic/research
- https://cursor.com/changelog
- https://cursor.com/docs/tab/overview
- https://cursor.com/docs
- https://cursor.com/llms.txt
- https://cursor.com/docs/models-and-pricing.md
- https://cursor.com/help/ai-features/tab.md
- https://cursor.com/help/troubleshooting/tab-issues.md
- https://cursor.com/help/ai-features/tab
- https://cursor.com/help/troubleshooting/tab-issues
- https://cursor.com/blog/instant-apply
- https://cursor.com/blog/shadow-workspace
- https://cursor.com/blog/tab-update
- https://cursor.com/blog/page/4
- https://supermaven.com/blog/introducing-supermaven
- https://cursor.com/changelog/page/6

## Content

I'll research Cursor Tab's architecture thoroughly. Let me start with a broad sweep of primary sources.

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: InvokeModelWithResponseStream: operation error Bedrock Runtime: InvokeModelWithResponseStream, https response error StatusCode: 400, RequestID: 180d5676-9b0b-4e6e-967a-f5050a34b2b4, ValidationException: Tool 'web_search' not found in provided tools (request id: 8528a556d689ca7c7945030062574dac) [trace_id=7c20d92568c515defdb5337d783ff4a9] (request id: 202609011302239963435534zxqsqgDDF6yo)

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: InvokeModelWithResponseStream: operation error Bedrock Runtime: InvokeModelWithResponseStream, https response error StatusCode: 400, RequestID: 23529a07-4f46-402a-b56b-f1832d665826, ValidationException: Tool 'web_search' not found in provided tools (request id: 162ad02d46a27d9c40783660eed10c56) [trace_id=ca044423bbdff38d511c742e56d54438] (request id: 20260901130423539592192nzb8n7F14vju7)

---

WebSearch seems unavailable. Let me try WebFetch on primary sources directly.

---

[FETCH RESULT]
## Training method

- Approach: online reinforcement learning on real usage data, using **policy gradient methods** rather than a separate accept-prediction filter. The team wanted to "alter the Tab model to avoid producing bad suggestions in the first place."
- Unusual cadence: models are rolled out to users "frequently throughout the day," with that traffic feeding training — contrasted with competitors training on static datasets or paid labelers.

## Reward design

- Illustrative scheme targeting a 25% accept threshold: reward of **0.75** for an accepted suggestion, **-0.25** for a rejected one, and **0** when nothing is shown. Expected reward is positive exactly when p > 0.25, so the policy only suggests above that estimated probability.
- Production reward is more complex, accounting for "the size of the suggestion as well as the possibility of jumping to other locations in the code."
- No explicit accept-rate head is trained: "rather than explicitly modeling the accept rate, we learn a policy that targets a particular accept rate."

## Math / tooling

- Relies on the Policy Gradient Theorem: ∇θJ(θ) = E[∇θ log π(a|s,θ) · R(s,a)], with states s∼P(s) as codebase state and θ the parameters.
- π(a|s,θ) is computed "using a framework like PyTorch"; R(s,a) comes from observed accept/reject.
- On-policy requirement is the key constraint — stale samples come from the prior policy, so new checkpoints must ship to users to gather fresh data.

## Data, throughput, deployment

- Request volume: the model runs on every keystroke/cursor move, "handling over 400 million requests per day."
- Rollout loop: "it takes us 1.5 to 2 hours to roll out a checkpoint and collect the data for the next step," described as fast for the industry but with room to improve.

## Results (new default Tab model, Sep 12, 2025)

- "**21% fewer suggestions**" than the prior model.
- "**28% higher accept rate**" on the suggestions it does make.

## Baseline comparison (GitHub Copilot, per Parth Thakkar, 2022)

- A "contextual filter score" from a logistic regression model over **11 features**, including programming language, whether the prior suggestion was accepted, and trailing characters before the cursor.
- "When the score is lower than 15%, the suggestion is skipped and nothing is shown."

## Not disclosed

The post contains **no** information on model size/parameter count, architecture, mixture-of-experts, GPU counts, tokens/sec or serving throughput, inference latency per request, or training cluster details. Authors: Jacob Jackson, Phillip Kravtsov, Shomil Jain.

---

[FETCH RESULT]
## Model / inference-related posts (closest to your topics)

Nothing on the page covers Tab, autocomplete, edit prediction, speculative edits, or latency specifically. The nearest matches:

| Date | Title | URL |
|---|---|---|
| Aug 12, 2026 | "Introducing Grok 4.6" | /blog/grok-4-6 |
| Aug 6, 2026 | "How Cursor Router chooses the right model for the task" | /blog/how-cursor-router-works |
| Aug 4, 2026 | "Mixture-of-Kittens: our open-source MoE megakernel for NVL72s" | /blog/mixture-of-kittens |
| Jul 22, 2026 | "Introducing Cursor Router" | /blog/router |
| Jul 20, 2026 | "Agent swarms and the new model economics" | /blog/agent-swarm-model-economics |

The Grok 4.6 post is described as "Built for long-running agents and more ambitious interactive and visual work."

## All other listed blog posts

| Date | Title | URL |
|---|---|---|
| Aug 25, 2026 | IMDEX subsurface data/analytics platform story | /blog/imdex |
| Aug 18, 2026 | "Git at any scale" | /blog/git-at-any-scale |
| Aug 14, 2026 | "Cursor is now a part of SpaceX" | /blog/joining-spacex |
| Aug 13, 2026 | "Firetiger joins Cursor" | /blog/firetiger |
| Aug 13, 2026 | "Cursor earns AIUC-1 certification for agent security and reliability" | /blog/aiuc-1 |
| Aug 13, 2026 | "Cloud agents start 3x faster with builds" | /blog/builds |
| Jul 30, 2026 | "How we set up our cloud agent environment" | /blog/cloud-agent-environment |
| Jul 28, 2026 | "Introducing Cursor Start" | /blog/cursor-start-india |
| Jul 28, 2026 | "How Vercel used Cursor to build Queues" | /blog/vercel |
| Jun 23, 2026 | "Coinbase reduces time from idea to production by 90% with Cursor" | /blog/coinbase |
| Jun 15, 2026 | "How Wayfair cut ML model costs by 90% (twice!) with Cursor" | /blog/wayfair |
| (undated) | "Towards self-driving codebases" | /blog/self-driving-codebases |

Note: the index has a "View more" control, so this is only the visible portion of the archive — Tab/autocomplete posts may exist deeper in the list. Topic filters available: /blog/topic/product, /research, /company, /ideas, /customers, /press.

---

[FETCH RESULT]
Twelve posts are listed on the Research topic page (a "View more" control suggests additional posts are not shown in this capture):

| Date | Title | URL |
|---|---|---|
| Aug 18, 2026 | "Git at any scale" | /blog/git-at-any-scale |
| Aug 12, 2026 | "Introducing Grok 4.6" | /blog/grok-4-6 |
| Aug 6, 2026 | "How Cursor Router chooses the right model for the task" | /blog/how-cursor-router-works |
| Aug 4, 2026 | "Mixture-of-Kittens: our open-source MoE megakernel for NVL72s" | /blog/mixture-of-kittens |
| Jul 30, 2026 | "How we set up our cloud agent environment" | /blog/cloud-agent-environment |
| Jul 20, 2026 | "Agent swarms and the new model economics" | /blog/agent-swarm-model-economics |
| Jul 14, 2026 | "Grok 4.5 Model Card" | /blog/grok-4-5-model-card |
| Jul 8, 2026 | "Introducing Grok 4.5" | /blog/grok-4-5 |
| Jun 25, 2026 | "Reward hacking is swamping model intelligence gains" | /blog/reward-hacking-coding-benchmarks |
| Jun 11, 2026 | "Governing agent autonomy with Auto-review" | /blog/agent-autonomy-auto-review |
| Jun 2, 2026 | "What we've learned building cloud agents" | /blog/cloud-agent-lessons |
| May 18, 2026 | "Introducing Composer 2.5" | /blog/composer-2-5 |

Bylines and read times accompany each entry — for example, Vicent Martí (27m) on the Git piece, Wilson Lin (17m) on the agent swarms piece, and several credited to the Cursor Team.

---

[FETCH RESULT]
**No Tab-related content is present on this page.** The changelog excerpt contains nothing about Tab, autocomplete, edit prediction, Tab model versions, or cursor prediction / tab-to-jump. No Tab version numbers appear.

**Entries actually covered (dates verbatim):**
- "Aug 27, 2026" — Start from scratch, without a repo (Cloud Agents, no SCM required)
- "Aug 19, 2026" — Cloud Agents and Cursor Harness Improvements (subscriptions, custom modes, subagents, `/goal`, steering)
- "Aug 17, 2026" — Origin Code Hosting
- "Aug 13, 2026" — Cloud Agents Start 3x Faster with Builds
- "Aug 3, 2026" — Google Workspace Plugins

**Only latency/performance figures on the page** (about cloud agent environments, not Tab): the Aug 13, 2026 Builds entry states environments "now boot 10x faster, with 3x faster time to first token," and describes builds as "ready-to-use copies of your development environment" prepared in the background, so agents skip per-session setup. It also mentions a configurable staleness threshold and a **Builds** tab exposing "build status, logs, commit SHAs."

One editor-adjacent item: the Aug 27, 2026 entry notes browser port-forwarding of a cloud agent's live environment, enabling preview and "design mode" — but this is a preview feature, not edit prediction.

For Tab specifics, you'd need older changelog pages (linked as "Older posts" / page 2) or the Tab documentation.

---

[FETCH RESULT]
## Cursor Tab — Technical Summary

**What it does**
Tab is the editor's AI autocomplete, offering code as you type. Its inputs are described as: "based on your recent edits, surrounding code, and linter errors."

**Suggested-edits UI**
Proposals render inline as "grayed-out text ahead of your cursor."

**Multi-line edits**
Tab isn't limited to single lines — it "can modify multiple lines, add missing import statements, and suggest coordinated edits across related code."

**Accept / reject / partial accept**

| Action | Binding |
|---|---|
| Accept whole suggestion | Tab |
| Reject | Escape, or continue typing |
| Accept one word at a time (macOS) | Cmd + Arrow Right |
| Accept one word at a time (Windows/Linux) | Ctrl + Arrow Right |

**Jump-in-file (cursor prediction)**
Once a suggestion is taken, hitting Tab a second time makes it "predict your next editing location and jump there," removing the need to scroll or navigate by hand.

**Cross-file jumps**
Tab also anticipates edits spanning files "when changes in one file need updates in another." If a jump targets a different file, "a portal window appears at the bottom of the editor."

**Enabling / disabling**
Use the Tab status indicator at the editor's bottom-right. Available options:
- **Snooze** — temporarily switch Tab off for a duration you pick
- **Disable globally** — off across every file
- **Disable for specific extensions** — off for chosen file types, e.g. markdown or JSON

Further configuration lives under Cursor Settings → Tab.

**Remapping the keybinding**
Editable via Keyboard Shortcuts; look up the command `Accept Cursor Tab Suggestions`.

**Not addressed in this material**
The page says nothing about conditions under which Tab withholds suggestions, the full context-gathering pipeline beyond the three inputs listed, privacy mode behavior, or any underlying model names.

---

[FETCH RESULT]
## What's actually available in the provided content

The page I was given is the Cursor docs landing page. It does **not** contain a full navigation tree or sidebar table of contents, so I can't reconstruct one. Only three internal URLs appear:

| Link text | URL |
|---|---|
| Models & Pricing | `https://cursor.com/docs/models-and-pricing.md` |
| Sitemap — "Overview of all docs pages" | `/llms.txt` |
| Hero image | `/docs-static/images/agent/homepage-hero.png` |

## Section headings on the landing page (no URLs attached)

**Start here:** Get started, Models & Pricing, Changelog

**What you can do with Cursor:**
- Understand your code — "Trace how a repo fits together and find the right places to start"
- Plan and build features — mentions scoping changes and "Plan Mode"
- Find and fix bugs
- Review changes
- Customize Cursor — described as adding "plugins, skills, MCPs, and rules from one place"
- Connect your workflow — integrations named include GitHub, GitLab, Azure DevOps, Bitbucket, JetBrains, Slack, and Linear

**Models** — a table of ~45 entries with provider, default/max context, and capabilities

**More resources:** Downloads, Help

## On your specific topics

- **Models** — covered, but only via the one URL above; individual models link out to vendor sites (Anthropic, OpenAI, Google, Z.ai, Moonshot), not to Cursor docs pages.
- **Tab, autocomplete, and context** — no navigation entries, headings, or URLs for these topics exist anywhere in the supplied text. The word "context" appears only as a table column describing token windows (e.g. several models listed at 200k default and 1M max).

To get the complete navigation with URLs, the `/llms.txt` sitemap referenced at the bottom of the page would be the place to look.

---

[FETCH RESULT]
The server returned HTTP 404 Not Found.

The response body was not retrieved. If this URL requires authentication, use an authenticated tool (e.g. `gh` for GitHub, or an MCP-provided fetch tool) instead of WebFetch.

---

[FETCH RESULT]
```
https://cursor.com/help/ai-features/tab.md
https://cursor.com/help/troubleshooting/tab-issues.md
https://cursor.com/docs/account/teams/analytics-api.md#tab-usage
https://cursor.com/help/ai-features/inline-edit.md
https://cursor.com/help/customization/context.md
https://cursor.com/docs/models-and-pricing.md
https://cursor.com/docs/cursor-router.md
https://cursor.com/docs/models/claude-sonnet-5.md
https://cursor.com/docs/models/claude-opus-5.md
https://cursor.com/docs/models/claude-fable-5.md
https://cursor.com/docs/models/gemini-3-1-pro.md
https://cursor.com/docs/models/gemini-3-7-flash.md
https://cursor.com/docs/models/gpt-5-6-sol.md
https://cursor.com/docs/models/gpt-5-6-terra.md
https://cursor.com/docs/models/gpt-5-6-luna.md
https://cursor.com/docs/models/grok-4-6.md
https://cursor.com/docs/models/grok-4-5.md
https://cursor.com/docs/models/cursor-composer-2-5.md
https://cursor.com/docs/enterprise/model-and-integration-management.md
https://cursor.com/docs/cloud-agent/api/endpoints.md#list-models
https://cursor.com/docs/account/organizations/organization-admin-api.md#model-access
https://cursor.com/docs/account/teams/admin-api.md#model-access
https://cursor.com/docs/account/teams/analytics-api.md#model-usage
https://cursor.com/help/models-and-usage/available-models.md
https://cursor.com/help/models-and-usage/cursor-router.md
https://cursor.com/help/models-and-usage/grok-4-6.md
https://cursor.com/help/models-and-usage/grok-4-5.md
https://cursor.com/help/models-and-usage/api-keys.md
https://cursor.com/help/models-and-usage/usage-limits.md
https://cursor.com/help/models-and-usage/token-rate.md
https://cursor.com/help/ai-features/max-mode.md
```

Notes: no page is titled "autocomplete" — that capability maps to the Tab entries. Closely related context pages you may also want: `https://cursor.com/help/customization/rules.md`, `https://cursor.com/docs/rules.md`, and `https://cursor.com/help/customization/ignore-files.md`. Any of these can be localized by inserting a language code, e.g. "`https://cursor.com/es/docs/bugbot.md`".

---

[FETCH RESULT]
The server returned HTTP 404 Not Found.

The response body was not retrieved. If this URL requires authentication, use an authenticated tool (e.g. `gh` for GitHub, or an MCP-provided fetch tool) instead of WebFetch.

---

[FETCH RESULT]
The server returned HTTP 404 Not Found.

The response body was not retrieved. If this URL requires authentication, use an authenticated tool (e.g. `gh` for GitHub, or an MCP-provided fetch tool) instead of WebFetch.

---

[FETCH RESULT]
## Why Tab may stop suggesting

Four causes are listed:

1. **Quota exhaustion** — free-tier accounts get a capped monthly amount; when spent, "suggestions pause until the next billing cycle."
2. **HTTP/2 blocked by the network** — see below.
3. **Stale client** — update via **Cmd/Ctrl+Shift+P** → "Cursor: Attempt Update".
4. **Offline** — "Tab requires a connection to work."

## HTTP/2 and the one documented config flag

The only toggle named is **HTTP Compatibility Mode**, reachable by searching that phrase in **Cursor Settings**. Since "Some networks block HTTP/2," enabling it downgrades the transport "to fall back to HTTP/1.1," and Cursor must be restarted afterward.

## Latency

Three contributors to sluggish completions: connection throughput, unused extensions left enabled, and middleboxes — "VPNs and proxies can add latency."

## Network requirements

Only a general one: an internet connection is mandatory, plus the HTTP/2-vs-HTTP/1.1 consideration above.

## Suggestion quality

Tab draws on "your recent edits and the code around your cursor," so a blank or brand-new file starves it of signal. Remedies: perform some manual edits to establish intent, and rule out conflicting extensions.

## Disabling per file type

The **Tab** indicator in Cursor's bottom-right corner opens controls for turning Tab off by file extension, e.g. markdown or JSON.

## Not covered

The page names **no hostnames, endpoints, or domains to allowlist**, gives **no timeout values or retry settings**, and mentions **no config flags besides HTTP Compatibility Mode**. For those specifics you'd need Cursor's networking/firewall documentation rather than this troubleshooting article. Linked follow-ups here are the Tab completion overview and the extension-conflicts guide.

---

[FETCH RESULT]
## What Tab is and how it works

Cursor's Tab is described as its "AI-powered autocomplete." It offers code as you type, drawing on three inputs: your recent edits, the code around your cursor, and linter errors. Proposed completions render as "grayed-out text ahead of your cursor."

## Accepting and rejecting

| Action | Keys |
|---|---|
| Take the whole suggestion | Tab |
| Dismiss it | Escape, or simply continue typing |
| Take one word at a time (Mac) | Cmd + Arrow Right |
| Take one word at a time (Windows/Linux) | Ctrl + Arrow Right |

## Multi-line and multi-file edits

Tab isn't limited to a single line — it can rewrite several lines, insert import statements that are missing, and propose "coordinated edits across related code."

Cross-file behavior is also supported: Tab anticipates edits in other files "when changes in one file need updates in another." If such a jump exists, the editor surfaces "a portal window" along its bottom edge.

## Jump-in-file

Pressing Tab a second time after accepting a suggestion triggers a jump. Tab guesses where you'll edit next and moves the cursor there, removing the need to scroll or navigate by hand.

## Enabling, disabling, and configuration

The **Tab** status indicator sits in the lower-right corner of the window; clicking it exposes three controls:

- **Snooze** — a temporary shutoff for a duration you pick
- **Disable globally** — off everywhere
- **Disable for specific extensions** — off for chosen file types, with markdown and JSON given as examples

Broader options live under **Cursor Settings** > **Tab**.

## Rebinding the shortcut

The accept binding is remappable. In Keyboard Shortcuts settings, look up the command `Accept Cursor Tab Suggestions` and reassign it.

## Not covered by this page

You asked about several areas the document simply doesn't address, so I can't report on them from this source:

- Model names or architecture behind Tab
- Latency figures
- Request quotas, rate limits, or pricing/billing details
- Conditions under which Tab declines to suggest anything
- Any signals beyond the three named (recent edits, surrounding code, linter errors)

The page links to a full documentation index at `/llms.txt`, which may carry those specifics.

---

[FETCH RESULT]
# Fast Apply / Speculative Edits — Technical Summary

Source: Cursor blog, "Editing Files at 1000 Tokens per Second," Aman Sanger, May 14, 2024.

## The task and why it exists
- Cursor splits hard code edits into two stages: "**planning**, and **applying**." Planning happens in chat with a frontier model; the apply step is meant to be "straightforward and _instant_."
- Motivation: frontier models of the era showed "laziness, inaccuracy, and high-latency" on large edits, sometimes leaving an agent stuck looping.
- The apply model is conditioned on three inputs — the current file, the conversation history, and the current code block — and emits the "**fully rewritten file**" rather than a patch.

## Headline latency / throughput numbers
| Metric | Value |
|---|---|
| Throughput (70B model, speculative edits) | ~1000 tokens/s, "around 3500 char/s" |
| Speedup vs. vanilla Llama-3-70B inference | "~13x" |
| Speedup vs. prior GPT-4 speculative-edits deployment | ~9x |
| Speculative edits vs. plain full-file rewrite | "up to 9x faster" |
| Lead over next-fastest model | "4-5x speedup over the next fastest model" |
| gpt-4o-diff median speed | 2476 char/s (but scored below claude-3-haiku's 4.18 avg eval score) |

## Speed metric definition
Speed = rewritten characters ÷ end-to-end rewrite latency (seconds). Stated benefits: it normalizes across tokenizers; collapses TTFT and generation rate into one figure; and yields a conservative floor, because latency includes time-to-first-token. Their conversion heuristic: a token is roughly 3–4 characters, so char/s ÷ 4 approximates a tokens/s lower bound.

## Speculative edits algorithm
- A custom speculative-decoding variant, output-equivalent to a full-file rewrite.
- Core insight: during an apply, most upcoming output is already known from the original file — "we have a strong prior on the draft tokens at any point in time."
- Consequence: drafts come from "a deterministic algorithm rather than a draft model" — no separate small draft network is needed.
- Deployment partner was Fireworks, which "built out api support for our custom speculation logic."
- The gain is described as larger on Llama-3 than on GPT-4.
- Not implementable on Anthropic-hosted models, and not yet available for gpt-4o at the time (they note gpt-4o-spec "would be the speed frontrunner").

*Note: the post does not describe the client-side streaming/diff-rendering mechanics beyond the parsing rules below.*

## Why full rewrite instead of diffs
Three arguments given:
1. **Token budget for reasoning** — fewer output tokens means fewer forward passes; "Diffs force the model to think in fewer tokens."
2. **Distribution mismatch** — pretraining and post-training contain far more whole files than diffs.
3. **Line numbers** — a tokenizer may encode a number like 123 as one token, forcing the model to commit to a line number in a single early token; models are also "notoriously bad at counting line numbers."

Diff format actually used (inspired by Aider's unified-diff work) drops line numbers in favor of search/replace hunks under an `@@ ... @@` marker, with `-` lines then `+` lines. Redundant `-`/`+` markers are intentional so that "the diff-parsing system is robust to minor model failures." Only Claude Opus produced reliably accurate diffs; claude-3-opus-diff beat gpt-4-turbo-spec on both axes but remained "**too slow**."

## Evaluation setup
- ~450 full-file edits, all files under 400 lines.
- Grader: Claude-3 Opus, chosen because it agreed with human ratings more than GPT-4-Turbo or GPT-4o on tens of curated examples. Grading guidelines were built as a Priompt component.
- Acknowledged caveat: scores "likely bias towards outputs of Claude models."
- Findings: claude-3-sonnet beat gpt-4-turbo; gpt-4o ≈ gpt-4-turbo. Hypothesis for Claude's edge is post-training — Claude emits thousands of LOC, while GPT-4 elides regions with "`...`" or comments. GPT-4 also made unrelated edits (stripping commented-out code and blank lines), a habit to "fix/clean up" untouched code.

## Model sizes and training
- Base families finetuned: Deepseek Coder Instruct and Llama 3. Named checkpoints: finetuned deepseek-33b and llama-3-70b-ft (the 70B is the production model).
- **Synthetic data pipeline:** start from a scarce set of real fast-apply prompts plus plentiful cmd-k prompts (each cmd-k example already carries an edit instruction plus a selected region). For every instruction, GPT-4 writes a chat response given the file, then another model applies it. The small real-apply set generates additional higher-quality points. Final finetuning mix is 80/20.
- Known weakness: purely synthetic data is lower quality, partly because the selection range is discarded even when it is decisive for a correct edit.
- **Dataset cleanup:** downsample files under ~100 LOC (over-represented), cap examples per filename, and downsample examples whose result was a no-op.
- **Results:** llama-3-70b-ft nearly matches claude-3-opus-diff and beats gpt-4-turbo and gpt-4o; it also beats gpt-4-turbo-spec. All three finetunes beat gpt-4-turbo on evals, but qualitatively only the 70B felt clearly useful — the smaller ones were described as "not-quite-useful enough."

## Stated future work
- **Long context:** targeting rewrites of files up to 2500 lines. Naively scaling RoPE position ids linearly performed poorly, as did existing community long-context Llama-3-70B finetunes.
- **Distillation:** compress fast-apply ability into llama-3-8b, since latency savings compound on bigger files.
- **Accuracy:** on-policy RL using traffic from the deployed model.

---

[FETCH RESULT]
## What the shadow workspace is

Cursor's mechanism for letting AI iterate on code in the background without disturbing the user. The post (Arvid Lunnemark, Sep 1, 2024, ~20 min read) describes it as a "1-week, 1-person project." Currently ships as a hidden Electron window and is opt-in via a hidden setting; the long-term plan is a "kernel-level folder proxy."

Motivation: naive AI access to your folder "results in chaos" — an AI could overwrite work or insert non-compiling code, so "the AI iteration needs to happen in the background, without affecting your coding experience."

## Goals and requirements

Two goals:
1. **LSP-usability** — AIs see lints, use go-to-definition, and interact with the full [language server protocol](https://microsoft.github.io/language-server-protocol/).
2. **Runnability** — AIs "should be able to run their code and see the output."

Six constraints: independence ("the user's coding experience must be unaffected"), privacy (keep code local), concurrency (many AIs at once), universality (all languages/workspace setups), maintainability (minimal, isolatable code), and speed — no "minute-long delays" plus throughput for "hundreds of branches of AIs."

## LSP usage and the linter feedback loop

Getting lints to the AI is called "one of the most impactful ways to improve code generation performance when holding the underlying language model fixed." Two benefits cited: pushing "90% working code to 100% working code," and helping in context-constrained cases where the model guesses which method or service to call — lints then flag "places where the AI needs to ask for more information." Figure 3 shows an AI implementing a function by looping on lints.

LSP-usability was tackled first because most language servers can operate on files never written to disk.

### The rejected simple approach

VS Code represents each open file as a `TextModel` held in memory; language servers read those rather than disk, enabling as-you-type lints. The ~6-line attempt: clone the `TextModel` via `modelService.createModel`, apply the AI edit with `applyEdits`, sleep ~2 seconds for language servers to process, then read diagnostics from `markerService.read` and dispose the model.

Great on maintainability, universality, concurrency, privacy — but it breaks independence, because the copy is registered with "the same language server that the user is using." Concrete failures: copied files polluting go-to-references results, Go reporting duplicate declarations across the multi-file namespace, and Rust surfacing no errors at all since unimported files are excluded. Independence is treated as non-negotiable: degrading normal editing even slightly would make the team itself abandon Cursor.

Other discarded ideas: running standalone `tsc` / `gopls` / `rust-analyzer` outside VS Code infrastructure, duplicating the extension host to run two copies of each language server extension, and forking popular language servers for multi-version file support.

### The shipped hidden-window design

A hidden window is spawned for the current workspace when lints are needed, and reused across requests, giving "(almost*) full LSP-usability."

- The AI runs in the normal window's renderer, which asks the main process to open a hidden window in the same folder.
- Electron sandboxing blocks renderer-to-renderer talk. Rather than rebuild VS Code's message-port logic, they route renderer → its extension host → shadow extension host → shadow renderer, described openly as "a hack," using a separate IPC connection.
- That hop let them swap VS Code's "custom and somewhat brittle JSON serialization logic" for gRPC plus [buf](https://buf.build/).
- Hiding the window needs essentially one line: Electron's `show: false`.
- Flow (Figure 4): edit proposed → relayed to shadow window → applied there → lints returned → AI decides how to iterate.
- Result: [a small Protobuf API](https://gist.github.com/arvid220u/b976c87c7ec9f6f66595dc0ebc0f07d6) for background AIs.

**Memory and concurrency:** the extra window implies roughly doubled memory. Mitigations: restrict which extensions load in it, kill it after 15 minutes idle, keep it opt-in. Instead of one window per AI, edits are interleaved — reset folder state to A1, return lints to A; reset to B1, return to B; then A2, B2. The insight is that "AIs can be paused an indefinite amount of time without even noticing," making them more like CPU-scheduled processes than humans.

**Cold start (Figure 5):** the first request in 15 minutes launches the window and confirms the language server is alive by inserting deliberately broken code ("THIS SHOULD BE A LINTER ERROR") and waiting for the error to appear; later requests are much faster.

**The asterisk — Rust:** some servers require code on disk. `rust-analyzer` runs a project-level `cargo check` and doesn't integrate with the VS Code virtual file system ([issue 6591](https://github.com/rust-lang/rust-analyzer/issues/6591#issuecomment-1544023553)), so Rust LSP-usability isn't supported unless the user runs the deprecated `RLS` extension.

## Runnability (not yet implemented)

Cursor was focused on "short-time-scale AIs" — background function implementation rather than whole PRs. Running code means saving to disk and tolerating side effects like build caches and logs, so the shadow window can't share the user's folder. Disk isolation is the near-term target; network isolation is acknowledged as also necessary eventually.

**`cp -r`:** too slow, because `node_modules`, `venv`, and `target` must come along — huge even in medium projects.

**Symlinks / hardlinks / copy-on-write:** [bun](https://bun.sh/package-manager) proves fast folder creation is possible (Linux hardlinks; macOS [clonefile](https://opensource.apple.com/source/xnu/xnu-3789.21.4/bsd/man/man2/clonefile.2.auto.html)). But on their monorepo a `cp -c` clone still "takes 45 seconds to finish." Hardlinks risk mutating real repo files; symlinks share that risk and aren't transparent (e.g. Node's `--preserve-symlinks`). A change-journaling scheme (undo shadow-side edits, replay user-side edits, occasionally re-copy) could work but is judged "bug prone, brittle, and, frankly, a bit ugly."

**Kernel-level folder proxy (the desired design):** a shadow folder A′ indistinguishable from folder A to normal filesystem APIs, with a quickly configurable in-memory override table; writes to A′ land in the override store, not disk. Kernel support is required so existing `read`/`write` syscalls keep working unchanged. Resetting overrides to one AI's edits per lint request is instant; overrides could spill to disk to avoid memory blowup.

On Linux, [FUSE](https://en.wikipedia.org/wiki/Filesystem_in_Userspace) suffices. The illustrative C++ sketch defines a target folder string and an `unordered_map<string, vector<char>> overrides`; `proxy_read` returns override bytes when the path is present and otherwise `open`/`pread`s from the target; `proxy_write` always appends into the overrides map; `main` registers both in `fuse_operations` and calls `fuse_main`. A real version would need the whole API — `readdir`, `getattr`, `lock`. A native kernel module would avoid FUSE's user-kernel context-switch overhead.

**Walled gardens:** macOS and Windows lack built-in FUSE. Kernel extensions are "Unshippable!" on Apple Silicon, requiring a recovery-mode reboot and "Reduced Security" — which also sinks [macFUSE](https://macfuse.github.io/). NFS/SMB-backed workarounds exist: [xetdata/nfsserve](https://github.com/xetdata/nfsserve) (open source, NFSv3) and closed-source [fuse-t](https://github.com/macos-fuse-t/fuse-t) (NFS + SMB). Figure 6 shows Cargo failing because NFSv3 lacks file locking. fuse-t uses NFSv4 (locking works) but its repo holds only Attributions.txt, License.txt, README.md under a single-purpose account, so shipping it isn't viable; issues also point to Apple kernel bugs. Remaining hope: Apple's move toward user-level APIs like [DriverKit](https://developer.apple.com/documentation/driverkit) and user-land legacy filesystems, plus the private `FSKit` framework referenced in Apple's open-source msdosfs — possibly releasable to third parties.

## Open questions listed

1. A proxy folder without kernel extensions or FUSE — maybe obscure macOS/Windows APIs suffice for this narrower problem.
2. Windows story: would [WinFsp](https://github.com/winfsp/winfsp) just work, or bring install/performance/security issues?
3. Could DriverKit simulate a fake USB device as the proxy folder? Doubted but unverified.
4. Network-level independence, e.g. debugging an integration test spanning three microservices; may require something VM-like.
5. A near-zero-setup identical remote workspace — cloud FUSE works freely, no extra local memory, full independence, worse privacy; possibly an auto-inferred Docker container built by probing the machine and having a language model write a Dockerfile.

Contact given: arvid@cursor.com, plus a [hiring](https://cursor.com/careers) note.

## Tab and background diagnostics

**No mention of "Tab"** (Cursor's autocomplete/next-edit feature) anywhere in this page — the closest related idea is language servers giving "completions and lints as you type." Background diagnostics are exactly what the shadow workspace delivers: lints and other LSP results computed in a hidden, independent window and returned to the AI, invisible to the user.

---

[FETCH RESULT]
## Fusion — Cursor's next-gen Tab model

**Dates & attribution**
- Blog post dated Jan 13, 2025, by Phillip Kravtsov and Jacob Jackson (product category, ~3 min read).
- The first Tab model was "trained and shipped in March 2024"; Fusion is measured against that baseline.

**Architecture / training**
- Model size and parameter counts are not disclosed anywhere in the post.
- On the original: Tab ran on "a custom sparse language model trained to predict edits on billions of tokens," refined across dozens of model and infra updates.
- Fusion handles two prediction types: edits near the cursor plus next-location "jumps."
- Quality gains attributed to: cleaner and larger volumes of data; longer context holding "much more editor state and file content in the prompt"; deliberate training on larger edits (producing the linked "Bigger Edits model"); synthetic data aimed at instruction following; plus improved training recipe and base model.
- Latency gains attributed to inference work, performance engineering, and better base models.

**Benchmark table (Original → Fusion)**
| Metric | Original | Fusion |
|---|---|---|
| Server latency (p50) | 475ms | 260ms |
| Cursor jumps | None | "Instant, accurate" |
| Context length | 5,500 tokens | 13,000 tokens |

**Quality deltas**
- Accurately predicts "over 25% more difficult edits per line" than the March model.
- Proposes "over 10x longer stretches of changes."
- No accept-rate percentages and no per-user suggestion counts appear in the article.

**Usage scale**
- Tab now generates "over a billion edited characters per day."
- Request volume is up roughly 100x since the original launch; the authors claim it writes more code than nearly any LLM globally.

**Rollout & roadmap**
- Shipped to all users with client version 0.45.0.
- Planned next: stronger codebase context, improved "tab-tab-tab sequences," and deeper Supermaven integration, toward the longer-term "Next Action Prediction" goal.
- Recruiting contact listed: hiring@cursor.com.

---

[FETCH RESULT]
## Main blog feed (posts listed on this page)

| Date | Topic | Title | URL |
|---|---|---|---|
| Aug 18, 2026 | research | "Git at any scale" | /blog/git-at-any-scale |
| Aug 14, 2026 | company | "Cursor is now a part of SpaceX" | /blog/joining-spacex |
| Aug 13, 2026 | company | "Firetiger joins Cursor" | /blog/firetiger |
| Aug 13, 2026 | company | "Cursor earns AIUC-1 certification for agent security and reliability" | /blog/aiuc-1 |
| Aug 13, 2026 | product | "Cloud agents start 3x faster with builds" | /blog/builds |
| Aug 12, 2026 | research | "Introducing Grok 4.6" | /blog/grok-4-6 |
| Aug 6, 2026 | research | "How Cursor Router chooses the right model for the task" | /blog/how-cursor-router-works |
| Aug 4, 2026 | research | "Mixture-of-Kittens: our open-source MoE megakernel for NVL72s" | /blog/mixture-of-kittens |
| Jul 30, 2026 | research | "How we set up our cloud agent environment" | /blog/cloud-agent-environment |
| Jul 28, 2026 | product | "Introducing Cursor Start" | /blog/cursor-start-india |
| Jul 22, 2026 | product | "Introducing Cursor Router" | /blog/router |
| Jul 20, 2026 | research | "Agent swarms and the new model economics" | /blog/agent-swarm-model-economics |

## Customer stories section

| Date | Title | URL |
|---|---|---|
| Aug 25, 2026 | "IMDEX uses Cursor to build integrated subsurface data and analytics platform in months, not years" | /blog/imdex |
| Jul 28, 2026 | "How Vercel used Cursor to build Queues" | /blog/vercel |
| Jun 23, 2026 | "Coinbase reduces time from idea to production by 90% with Cursor" | /blog/coinbase |
| Jun 15, 2026 | "How Wayfair cut ML model costs by 90% (twice!) with Cursor" | /blog/wayfair |

## Also linked (no date shown)
- "Towards self-driving codebases" — /blog/self-driving-codebases (quoted in a pull-quote block)

Note: the listing includes a "View more" control, so additional posts likely exist beyond what this page displays. Press items and changelog entries are separate sections and were excluded.

---

[FETCH RESULT]
Failed to authenticate. API Error: 403 pre-consume quota failed, user quota: ＄0.113272, need quota: ＄0.263884 (request id: 20260901130821929014097vxl4tu3rF8pZD)

---

[FETCH RESULT]
**No Tab-model (autocomplete) entries appear on this page.** Nothing here covers tab-to-jump, Fusion, Tab in the terminal, auto-import, partial accept, snooze, or Tab latency — those would be on other changelog pages (this is page 6 of the archive, covering May 7–13, 2026).

The only "tab" references on this page concern UI panels, not the Tab suggestion model:

**3.4 — May 13, 2026** ("Full-screen Tabs and Compact Chats")
- Full screen expands the right panel to focus on one tab; per the entry, "Files, changes, canvases, PRs, browsers, and terminals can expand to fill the entire working area."
- It swaps out the chat for "a floating prompt bar," toggled via the panel header button, command palette, or `Cmd/Ctrl+Shift+M`.
- Improvements list: "Improved PR tabs by adding clearer review states, better reviewer/thread visibility, and more predictable PR tab actions."
- Bug fixes list: "Fixed PR tab bugs affecting branch lookup, header state, and diff loading."

**3.3 — May 7, 2026** ("PR Review, Build Plan in Parallel, and Split PRs")
- "The Reviews tab now shows inline review threads and top-level PR comments."
- "The Commits tab gives you a focused view of commit history for the PR."
- "The Changes tab makes it easier to navigate larger PRs with a file tree and changes picker."

---

Failed to authenticate. API Error: 403 pre-consume quota failed, user quota: ＄0.260692, need quota: ＄0.388364 (request id: 20260901130836329472930twxjwoH1art9i)