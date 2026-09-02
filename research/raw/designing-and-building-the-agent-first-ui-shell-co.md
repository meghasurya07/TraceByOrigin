# Designing and building the agent-first UI shell — concrete implementat

## URLs fetched
- https://cursor.com/blog/2-0
- https://cursor.com/changelog/2-0
- https://cursor.com/changelog

## Content

I'll research this thoroughly. Let me start with parallel searches on the reference layouts.

---

[FETCH RESULT]
<tool_use_error>InputValidationError: WebSearch failed due to the following issue:
An unexpected parameter `command` was provided</tool_use_error>

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: Tool 'web_search' not found in provided tools [trace_id=e82b80798056b6154dcadcb9ffd8b082] (request id: 202609011307277445857702c9x9kjgBhmau)

---

WebSearch appears unavailable in this environment. Let me test both tools.

---

[FETCH RESULT]
## Short answer: the page doesn't contain that level of detail

This blog post is a high-level announcement (Oct 29, 2025, ~3 min read). It never names panels, rails, a bottom bar, or any keyboard shortcuts, and it doesn't say where an agent list is placed on screen. Anything I told you about a "left rail" or a keybinding would be invented. For a component-by-component breakdown, the post points to the full changelog at `cursor.com/changelog/2-0`.

**What the post actually claims about the interface:**

- The redesign is the first thing you see on launch, and it is described as "more focused and designed from the ground up to be centered around agents rather than files."
- The stated intent: you concentrate on results "while agents take care of the details."
- Files are still reachable — you can open them in the new layout, or "switch back to the classic IDE." No summoning gesture or shortcut is specified.
- Running many agents simultaneously without collisions is supported, "powered by git worktrees or remote machines."
- Multiple models can tackle one problem so you pick the winner, which they say "significantly improves the final output, especially for harder tasks."

**On review and testing** — the two frictions they identify as emerging bottlenecks are "reviewing code and testing the changes." Their response is described only in general terms: quicker inspection of what an agent modified, with the option to go deeper into code. There is no mention of inline vs. side-by-side diffs, per-file staging, or accept/reject controls. For verification they add "a native browser tool," letting Cursor exercise its own work and loop until the result is right.

**Named features present on the page:** Composer (their first coding model, "a frontier model that is 4x faster than similarly intelligent models," most turns finishing "in under 30 seconds," trained with tools including codebase-wide semantic search) and Cursor 2.0 itself. Related posts reference Plan Mode, but that's a separate October 7 article, not part of this layout description.

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: Tool 'web_search' not found in provided tools [trace_id=40c11688aff80134418fa1205ef16aad] (request id: 202609011308136674382027drhbq0CPWXjI)

---

WebSearch is down; WebFetch works. I'll go directly at primary source URLs, aggressively and in parallel.

---

[FETCH RESULT]
Failed to authenticate. API Error: 403 pre-consume quota failed, user quota: ＄0.203200, need quota: ＄0.274908 (request id: 202609011308535593390cp46cfa9xNqPc)

---

[FETCH RESULT]
## Recent changelog entries (no version numbers listed)

The page is dated by release, not by version — none of these five entries reference a numbered release:

| Date | Entry |
|---|---|
| Aug 27, 2026 | "Start from scratch, without a repo" |
| Aug 19, 2026 | "Cloud Agents and Cursor Harness Improvements" |
| Aug 17, 2026 | "Origin Code Hosting" |
| Aug 13, 2026 | "Cloud Agents Start 3x Faster with Builds" |
| Aug 3, 2026 | "Google Workspace Plugins" |

## Is there a Cursor 3.0?

Nothing on this page mentions a 3.0 release, or any version number at all. Older entries sit behind a link to page 2 of the changelog, so I can't confirm or rule it out from this content alone.

## UI and layout changes

- **New Codebase tab** — described as "home for Origin repos," with a **+New** button for repo creation. Repo URLs follow the pattern `cursor.com/codebase/acme-corp`.
- **Repo picker** gained a "Start from scratch" option, plus a **Create repo** button to persist an agent's work, with private/internal visibility choices.
- **In-browser live preview** — Cursor "port-forwards your cloud agent's live environment straight to your browser," enabling design mode.
- **Publish** control appears alongside it, gated on a connected Vercel account.
- **Apps tab** per repo for Vercel, Depot, and Buildkite integrations; a per-repo **Settings** area shows sync status, access, and connected apps.
- **Builds tab** in the Cloud Agents dashboard surfaces "build status, logs, commit SHAs," and which build each run consumed. Existing environments get an **Enable Builds** button and a **Run setup agent** option.

## Agent panel changes

- **Custom modes** pin a skill into the chat itself — the entry frames them as "always on" skills. Invoke via `/`, then ⌥⏎ on Mac or Alt+Enter on Windows, or select **Use as Mode**.
- **Steering** no longer interrupts: messages sent mid-run "wait for the next tool call instead of cutting the agent off mid-action." Use the **Send now** button or hit ⏎ twice.
- **`/goal`** assigns a persistent objective the agent pursues to completion; pairs with `/loop` for check-ins.
- **Subscriptions** let agents wake on events (PRs, Slack threads, schedules), cloud-only for now.
- **Subagents** can each occupy a separate VM with "an isolated copy of the project with clean context."

## Review UI changes

Every Origin repo carries pull requests. Opening one exposes "the timeline, commits, checks, and files changed," where you can read the diff, comment, and merge. On synced repos, review activity moves bidirectionally — comments posted in Cursor reach GitHub, and GitHub-side replies or reactions surface "in Cursor within seconds." GitHub-assigned reviews can be completed and merged from Cursor. Vercel-connected repos attach a preview deployment to each PR for testing and commenting.

---

[FETCH RESULT]
## What the page actually documents

The 2.0 changelog describes features, not interface geometry. It does not state which panel sits on a left rail, in the center, on the right, or along the bottom, and it lists **no keybindings at all**. Anything I said about panel positions or shortcuts would be invented.

### Agent list
The only positional detail given is that 2.0 ships a "new editor, with a sidebar for your agents and plans." The side (left vs. right) is unspecified. Parallelism: "Run up to eight agents in parallel on a single prompt," backed by "git worktrees or remote machines to prevent file conflicts," with each agent in an isolated copy of the codebase.

### Diff review
Under "Improved Code Review": "It's now easier to view all changes from Agent across multiple files without needing to jump between individual files." No mention of a specific diff viewer name, split/inline toggle, or accept/reject controls. Related notes appear under "Improved Performance" — LSP loading was sped up, "particularly noticeable when working with agent and viewing diffs."

### Opening / dismissing the editor
Not covered. No launch, focus, or close behavior is described.

### Named UI elements and features (exact section titles)
- "Multi-Agents", "Composer", "Browser (GA)", "Improved Code Review", "Sandboxed Terminals (GA)"
- "Team Commands", "Voice Mode", "Improved Performance", "Plan Mode in Background"
- "Shareable Team Commands", "Improved Prompt UI", "Improved Agent Harness", "Cloud Agents"
- Enterprise subsections: "Sandboxed Terminals: Admin Controls", "Hooks: Cloud Distribution", "Audit Log"

### Prompt input details
"Files and directories are now shown inline as pills." Several context-menu entries were removed — @Definitions, @Web, @Link, @Recent Changes, @Linter Errors — since the agent gathers context itself. Voice Mode supports user-defined submit keywords configured in settings.

### Other specifics worth noting
- Browser is now embeddable in-editor, with element selection and DOM forwarding to the agent.
- Sandboxed terminals default on macOS; non-allowlisted shell commands get workspace read/write and no network.
- Cloud agents claim 99.9% reliability and instant startup, with a new UI described as forthcoming.
- "Background Agents have been renamed to Cloud Agents." Notepads were deprecated.

For panel layout and shortcuts, the Cursor docs or in-app keyboard shortcuts reference would be the place to check.

---

Failed to authenticate. API Error: 403 pre-consume quota failed, user quota: ＄0.310254, need quota: ＄0.351224 (request id: 20260901130938595206174lds7ruE1gUeaZ)