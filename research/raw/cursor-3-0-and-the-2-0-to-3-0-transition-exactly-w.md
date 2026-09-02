# Cursor 3.0 (and the 2.0 to 3.0 transition) — exactly what it is.

## URLs fetched
- https://cursor.com/changelog
- https://cursor.com/changelog?page=2
- https://cursor.com/blog

## Content

I'll research this thoroughly. Let me start with the primary sources.

---

[FETCH RESULT]
## Important caveat first

This changelog page has **no version numbers** — no 3.0, 2.x, 2.0, or 1.x entries appear anywhere in the content. Cursor's entries here are date-titled posts only. Below is what's actually present, newest to oldest.

---

**Aug 27, 2026 — "Start from scratch, without a repo"**
- Cloud Agents can begin without a linked GitHub/third-party SCM; pick "Start from scratch" in the repo picker and Cursor quietly provisions an Origin repo.
- A "Create repo" button converts the work into a named, private-or-internal Origin repo later.
- Browser port-forwarding of the agent's live environment enables preview and design mode.
- Publishing to a live URL requires a connected Vercel account.

**Aug 19, 2026 — "Cloud Agents and Cursor Harness Improvements"**
- *Subscriptions:* agents wake on events — PRs, Slack threads, scheduled tasks — and auto-follow PRs they open, "fixing CI and addressing bot comments." Cloud-only for now.
- *Custom modes:* pin any skill to the chat via ⌥⏎ / Alt+Enter, described as "always on" skills.
- *Subagents on their own machines:* each gets an isolated project copy and clean context in its own cloud environment.
- *`/goal`:* assigns a long-lived objective the agent pursues to completion; pairs with `/loop`.
- *Steering:* follow-ups "wait for the next tool call instead of cutting the agent off mid-action."

**Aug 17, 2026 — "Origin Code Hosting"**
- Cursor-hosted code, in "early beta on all paid plans," covering repos, pull requests, code browsing, and GitHub sync.
- New **Codebase** tab; codebase name becomes part of repo URLs (e.g. `cursor.com/codebase/acme-corp`).
- Origin-hosted repos treat Origin as source of truth; synced GitHub repos keep GitHub authoritative and mirror into Origin in real time.
- Two-way PR sync (comments/replies propagate within seconds); review and merge GitHub-assigned reviews from Cursor.
- Agents available in every repo; app extensions for Vercel, Depot, and Buildkite; per-repo settings for sync, access, and apps.
- Enterprise orgs whose admins opt out are excluded.

**Aug 13, 2026 — "Cloud Agents Start 3x Faster with Builds"**
- **Builds** = prepared copies of your dev environment so agents skip setup; included at no extra cost.
- Claimed gains: environments "boot 10x faster, with 3x faster time to first token."
- Resilience: a broken build never goes active — agents fall back to the last good one while you debug.
- **Builds** tab exposes status, logs, commit SHAs, and which build each run used; manual triggers and a configurable staleness threshold.
- Existing environments migrate via "Enable Builds" or "Run setup agent."

**Aug 3, 2026 — "Google Workspace Plugins"**
- Gmail, Google Drive, and Google Calendar plugins for coding agents.
- Drive: "search files and folders, open and download content, create and organize files."
- Gmail: search/read mail, compose and send, labels and thread management.
- Calendar: read schedules, create and update events, locate open slots.
- Installable from the Cursor Marketplace or the in-app Customize page.

---

A "Older posts" link points to page 2 of the changelog, so earlier entries — potentially including any numbered releases — exist beyond what was provided here.

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: Tool 'web_search' not found in provided tools [trace_id=5d07f34308bd4bb0f227ae8cd1016ee7] (request id: 2026090113064348285570v4n2f639RoNfV)

---

WebSearch is unavailable in this environment, so I'll drive everything through WebFetch on primary sources. Let me page through the changelog.

---

[FETCH RESULT]
## Changelog Entries (newest → oldest)

**1. Start from scratch, without a repo** — Aug 27, 2026
- Cloud Agents can begin without a linked GitHub or other third-party SCM connection; work is later saved to a Cursor Origin repo
- Pick "Start from scratch" in the repo picker and an Origin repo is generated behind the scenes
- A **Create repo** button converts the session into a scaffolded repo with a custom or suggested name, set to private or internal
- Live environment is port-forwarded to the browser for previewing and design mode
- Publishing to a live URL is possible after linking Vercel ("A Vercel account is required to use the publish feature.")

**2. Cloud Agents and Cursor Harness Improvements** — Aug 19, 2026
- *Subscriptions:* agents watch PRs, Slack threads, or scheduled tasks and wake on events (cloud agents only for now); they auto-follow PRs they open, "fixing CI and addressing bot comments"
- *Custom modes:* a skill pinned in chat, described as "always on" skills — from `/`, use ⌥⏎ (Mac) / Alt+Enter (Windows) or **Use as Mode**
- *Subagents on their own machines:* each subagent gets an isolated project copy and clean context in its own cloud environment
- *`/goal`:* assigns "a long-lived objective to work towards until it's fully complete"
- *Steering:* follow-up messages queue until the next tool call rather than interrupting; hit Send now or press ⏎ twice

**3. Origin Code Hosting** — Aug 17, 2026
- Cursor now hosts code; early beta on all paid plans (enterprise orgs can opt out), covering "repos, pull requests, code browsing, and GitHub sync"
- New **Codebase** tab; **+New** creates a repo, with CLI instructions for cloning or pushing. Origin is authoritative for Origin-hosted repos
- Codebase naming appears in repo URLs (e.g. cursor.com/codebase/`acme-corp`)
- GitHub repos can be synced alongside, updating in real time, with GitHub remaining the source of truth; icons distinguish origin of each repo
- PRs show timeline, commits, checks, and diffs; comments and reactions sync bidirectionally with GitHub "within seconds"
- Agents work inside every repo — answering questions, editing, updating PRs, pushing branches
- App extensions: Vercel (PR preview deployments), plus Depot and Buildkite for CI running existing GitHub Actions workflows
- Per-repo settings for sync status, access, and connected apps

**4. Cloud Agents Start 3x Faster with Builds** — Aug 13, 2026
- Introduces **builds**: "ready-to-use copies of your development environment that Cursor prepares in the background," at no extra cost
- Rebuilt regularly; successful builds become the starting point, with warm copies kept ready — internally "10x faster" boots and "3x faster time to first token"
- Install command handles pre-work; start command covers services needing freshness each session
- Broken builds never go active — agents fall back to the last good build while you debug
- **Builds** tab in the Cloud Agents dashboard exposes status, logs, commit SHAs, and which build a run used
- New environments enable Builds automatically; existing ones use **Enable Builds** or **Run setup agent**, plus manual triggers and a staleness threshold

**5. Google Workspace Plugins** — Aug 3, 2026
- Coding agents gain direct Gmail, Drive, and Calendar access
- Drive: file/folder search, opening and downloading, creating and organizing
- Gmail: searching and reading, drafting and sending, labels and thread management
- Calendar: reading schedules, creating/updating events, finding free time
- Available via the Cursor Marketplace or the Customize page in-app

**Version numbers:** none referenced — no 2.0, 2.x, or 3.0 mentions appear in these entries. Additional entries exist on page 2 ("Older posts"), which isn't included here.

---

[FETCH RESULT]
## Blog posts, newest → oldest

| Date | Title | Topic |
|---|---|---|
| Aug 27, 2026 | "Start from scratch, without a repo" | changelog entry, not a blog post |
| Aug 25, 2026 | "IMDEX uses Cursor to build integrated subsurface data and analytics platform in months, not years" | customer story |
| Aug 19, 2026 | "Cloud Agents and Cursor Harness Improvements" | changelog entry |
| Aug 18, 2026 | "Git at any scale" (Vicent Martí, 27m) | research |
| Aug 17, 2026 | "Origin Code Hosting" | changelog entry |
| Aug 14, 2026 | "Cursor is now a part of SpaceX" (2m) | company |
| Aug 13, 2026 | "Firetiger joins Cursor" (Maxime Prades, 2m) | company |
| Aug 13, 2026 | "Cursor earns AIUC-1 certification for agent security and reliability" (Kenneth Moras, 4m) | company |
| Aug 13, 2026 | "Cloud agents start 3x faster with builds" (4m) | product |
| Aug 12, 2026 | "Introducing Grok 4.6" (3m) | research |
| Aug 6, 2026 | "How Cursor Router chooses the right model for the task" (Connor & Yuri, 6m) | research |
| Aug 4, 2026 | "Mixture-of-Kittens: our open-source MoE megakernel for NVL72s" (28m) | research |
| Jul 30, 2026 | "How we set up our cloud agent environment" (Mathew & Arvind, 7m) | research |
| Jul 28, 2026 | "Introducing Cursor Start" (3m) | product |
| Jul 28, 2026 | "How Vercel used Cursor to build Queues" | customer story |
| Jul 22, 2026 | "Introducing Cursor Router" (8m) | product |
| Jul 20, 2026 | "Agent swarms and the new model economics" (Wilson Lin, 17m) | research |
| Jun 23, 2026 | "Coinbase reduces time from idea to production by 90% with Cursor" | customer story |
| Jun 15, 2026 | "How Wayfair cut ML model costs by 90% (twice!) with Cursor" | customer story |

Undated: a post referenced only by its quote pull-out, "Towards self-driving codebases."

## Version releases, Composer, or rewrites

Nothing in the visible content matches those categories:

- **No numbered version-release posts** (nothing like 2.0 or 3.0). The only versioned announcement is a model, not the app: "Introducing Grok 4.6."
- **No Composer posts.** Composer appears once on the page, and only as a footer product link, not as a blog entry.
- **No app-rewrite posts.** The closest infrastructure-flavored items are the Git scaling piece, the cloud agent environment write-up, and the megakernel post — none framed as a rewrite of the application.

Two caveats: the listing is truncated by a "View more ↓" control, so older posts covering these topics may exist below the fold. Also, the four press items (The New Stack, TechCrunch, Bloomberg, CNBC — Feb–Mar 2026) are third-party coverage rather than blog posts, so I left them out of the list above; one describes a "new kind of agentic coding tool," but no version number is given.

---

The changelog page seems paginated client-side and one blog item looks suspicious. Let me get raw HTML directly so I'm reading actual source text, not a summarizer's rendering.

---

[FETCH RESULT]
EXIT=0
-rw-r--r-- 1 bodep 197609 199144 Sep  1 10:37 cursor_changelog.html
199144 cursor_changelog.html

---

Network works from Bash. That gives me ground truth.

---

[FETCH RESULT]
Traceback (most recent call last):
  File "<string>", line 12, in <module>
    print(out[:6000])
    ~~~~~^^^^^^^^^^^^
  File "C:/msys64/ucrt64/lib/python3.14/encodings/cp1252.py", line 19, in encode
    return codecs.charmap_encode(input,self.errors,encoding_table)[0]
           ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
UnicodeEncodeError: 'charmap' codec can't encode character '\u2193' in position 88: character maps to <undefined>

---

[FETCH RESULT]
563 cl.txt
What's New in Cursor — Latest Updates & Release Notes
Skip to content
Cursor
Models
↓
Grok
Evals
Product
↓
Agents
Cloud
Grok Bot
↗
Mobile
Automations
CLI
Marketplace
↗
Review
Enterprise
Pricing
Resources
↓
Changelog
Blog
Docs
Community
Help
↗
Workshops
Forum
↗
Careers
Models
→
Product
→
Enterprise
Pricing
Resources
→
Sign in
Contact
Contact sales
Download
Changelog
Aug 27, 2026
·
Changelog
Start from scratch, without a repo
Cloud Agents no longer require a connected GitHub or other third-party SCM provider to get started. Prompt from the get-go, then save your work to a Cursor Origin repo.
#
Get started
Select
Start from scratch
in the repo picker, then prompt the agent. In the background, Cursor creates an Origin repo for you.
#
Turn it into a real repo, whenever you want
Once the agent's build is to your liking, click the
Create repo
button to save your work in an Origin repo. Choose a custom name or pick one of the suggested ones, then set the visibility to private or internal. You'll get a fully scaffolded Origin repo, ready to share or keep building on. Navigate to the Codebase tab to find your repo and access your project.
#
A live preview, right in the browser
Cursor now port-forwards your cloud agent's live environment straight to your browser, so you can preview it and use tools like design mode.
#
Publish your work
Connect a Vercel account and hit publish to get a live URL for what you built.
A Vercel account is required to use the publish feature.
Get started today
.
Aug 19, 2026
·
Changelog
Cloud Agents and Cursor Harness Improvements
We're continuing to improve cloud agents and the Cursor harness so always-on agents can operate as a system, building and shipping software on their own without the need for intervention at each loop.
With this release, cloud agents can automatically pick up work in response to events, hold a goal until it's met, and stay on course through long-running sessions.
#
Subscriptions
Cursor can now monitor your PRs, watch a Slack thread, or run scheduled tasks. Cursor Agent subscribes to an event source (a thread or conversation) and wakes when something happens. Subscriptions are available for cloud agents only, for now.
Cloud agents automatically subscribe to PRs they create and drive them to completion, fixing CI and addressing bot comments. In Slack, ask
@cursor check back in an hour and keep going until that feedback is in
.
#
Custom modes
Use any skill as a Custom Mode: a skill that stays pinned in the chat. Custom modes keep agents focused on a skill - you can think about it like "always on" skills.
From
/
, pick a skill and press ⌥⏎ (Mac) or Alt+Enter (Windows), or choose
Use as Mode
.
#
Subagents on their own machines
Subagents can now run on their own virtual machines. Each gets an isolated copy of the project with clean context in its own cloud environment.
Have subagents test the parent agent's changes in fresh environments or swarm independent fixes without collisions. Try
run a swarm of subagents to test my app for bugs, each in its own environment
.
#
/goal
Use
/goal
to give the agent a long-lived objective to work towards until it's fully complete.
Try
/goal fix all flaky tests and make CI green
in a new chat. Pair it with a custom mode to follow a playbook, or
/loop
for recurring check-ins.
#
Steering improvements
You can now send a message to steer the agent while it's working without interruption. Follow-ups wait for the next tool call instead of cutting the agent off mid-action.
Type a follow-up and hit Send now, or press ⏎ twice.
Aug 17, 2026
·
Changelog
Origin Code Hosting
Cursor can now host your code.
Origin begins rolling out today in early beta on all paid plans. We're starting with the essentials, designed for agent scale: repos, pull requests, code browsing, and GitHub sync. Agent-native features ship soon.
#
Origin Repos
The new
Codebase
tab is home for Origin repos.
Click
+New
to create a new repo and name it. Once you do, a page shows you how to install the CLI, with commands for how to clone a repo or push a local project. Push, and your code is hosted on Origin.
For Origin-hosted repos, Origin is the source of truth. Pushes land on Origin, and GitHub is not in the path.
Name your codebase when you create your first repo. That name becomes part of every repo's URL: cursor.com/codebase/
acme-corp
.
#
Bring your GitHub repos
Your GitHub repos can sit alongside the ones Cursor hosts. Connect GitHub to Cursor, pick your org, and you'll see the repos you can sync. Select one and Cursor pulls it in. You choose what gets synced and can disconnect a repo at any time. Anyone with read or write access to a synced repo can view it in Cursor too.
Synced repos update in real time. Browse, search, and pull from the copy in Origin. For synced repos, GitHub stays the source of truth: pushes keep going to GitHub, and Origin mirrors the result. Icons next to each repo name tell you which ones Cursor hosts and which came from GitHub.
#
Pull requests
Every repo has pull requests. Open one to see the timeline, commits, checks, and files changed. Review the diff, leave comments, and merge.
Pull requests on synced repos sync both ways: comment in Cursor and it posts to GitHub, react or reply on GitHub and it shows up in Cursor within seconds. Got a review assigned to you on GitHub? Review and merge it from Cursor.
#
Agents in every repo
Your code, PRs, and agents are now in the same place. Ask Cursor questions about code you're browsing. It can answer, make changes, update PRs, or push a branch.
#
App extensions for Cursor repos
We're building an app ecosystem so your whole stack works seamlessly with Origin. Integrations with Vercel, Depot, and Buildkite are already available, with more coming soon.
Connect Vercel from a repo's
Apps
tab and every PR gets a preview deployment where you can test and make comments. Merge, and it ships to production. For CI, connect Depot or Buildkite. Both run your existing GitHub Actions workflows and Buildkite also runs its native pipelines.
#
Settings
Every repo has settings. Check sync status for GitHub repos, manage who has access, and see which apps are connected.
Origin is rolling out in early beta to all paid plan users starting today, except enterprise orgs whose admins opt out. Name your codebase and create your first repo.
Learn more in our

---

[FETCH RESULT]
Learn more in our
docs
or
get started
today.
Aug 13, 2026
·
Changelog
Cloud Agents Start 3x Faster with Builds
Agents do their best work when they start in a ready environment: repos cloned, dependencies installed, and your install script already run.
This release introduces
builds
: ready-to-use copies of your development environment that Cursor prepares in the background. Agents boot into a ready environment instead of setting up from scratch each session. Builds are included with Cloud Agents at no additional cost.
#
Faster starts
Cursor runs a new build of your environment regularly. When a build succeeds, it becomes the environment future agents start from. Cursor keeps warm copies ready so the next agent does not wait. Internally, our environments now boot 10x faster, with 3x faster time to first token.
Use your
install command
for anything that can be prepared ahead of time. The start command still runs when you first prompt an agent and should focus on services that need to be fresh in the session.
#
More resilient agent runs
When a bad commit or dependency update breaks your environment, agents keep using the last successful build. The broken build never becomes active, you are notified of the issue, and your agents keep working while you debug in the background.
#
Build history and debugging
Each environment has a
Builds
tab in the Cloud Agents dashboard. You can inspect build status, logs, commit SHAs, and which build each agent run used. Agents can also inspect and manage builds using built-in tools.
#
Getting started
New environments use Builds automatically. For an existing environment, open it in the
Cloud Agents dashboard
, go to the
Builds
tab, and click
Enable Builds
. Or click
Run setup agent
first to test the migration and review any proposed config changes.
You can also trigger a Build manually, debug a failing Build with an agent, and control how stale Builds refresh with a configurable threshold.
Learn more in our
announcement post
and
docs
.
Aug 3, 2026
·
Changelog
Google Workspace Plugins
Cursor can now read, write, and act across your Google Workspace.
New plugins give coding agents direct access to Gmail, Google Drive, and Calendar, so you can pull context, draft and update files, and manage your inbox and calendar without leaving Cursor.
Install plugins to connect:
Google Drive
:
search files and folders, open and download content, create and organize files
Gmail
:
search and read mail, draft and send messages, apply labels and manage threads
Google Calendar
:
read schedules, create and update events, find free time
Browse the new plugins in the
Cursor Marketplace
or install them from the Customize page in Cursor. Learn more in our
docs
.
Next →
Older posts
Product
Agents
Teams
Enterprise
Pricing
Code Review
CLI
Cloud Agents
Composer
Marketplace
↗
Resources
Download
Changelog
Docs
Learn
↗
Value Calculator
Forum
↗
Help
↗
Workshops
Status
↗
Company
Careers
Blog
Community
Students
Brand
Future
Anysphere
↗
Legal
Terms of Service
Acceptable Use Policy
Privacy Policy
Data Use
Security
Connect
X
↗
LinkedIn
↗
YouTube
↗
©
2026
Anysphere, Inc.
🛡
SOC 2 | ISO27001 | ISO42001 | AIUC-1 Certified
🌐
English
↓
English
✓
简体中文
日本語
繁體中文
Español
Français
Português
한국어
Deutsch
हिन्दी
Skip to content
Cursor
Models
↓
Grok
Evals
Product
↓
Agents
Cloud
Grok Bot
↗
Mobile
Automations
CLI
Marketplace
↗
Review
Enterprise
Pricing
Resources
↓
Changelog
Blog
Docs
Community
Help
↗
Workshops
Forum
↗
Careers
Models
→
Product
→
Enterprise
Pricing
Resources
→
Sign in
Contact
Contact sales
Download
Changelog
Aug 27, 2026
·
Changelog
Start from scratch, without a repo
Cloud Agents no longer require a connected GitHub or other third-party SCM provider to get started. Prompt from the get-go, then save your work to a Cursor Origin repo.
#
Get started
Select
Start from scratch
in the repo picker, then prompt the agent. In the background, Cursor creates an Origin repo for you.
#
Turn it into a real repo, whenever you want
Once the agent's build is to your liking, click the
Create repo
button to save your work in an Origin repo. Choose a custom name or pick one of the suggested ones, then set the visibility to private or internal. You'll get a fully scaffolded Origin repo, ready to share or keep building on. Navigate to the Codebase tab to find your repo and access your project.
#
A live preview, right in the browser
Cursor now port-forwards your cloud agent's live environment straight to your browser, so you can preview it and use tools like design mode.
#
Publish your work
Connect a Vercel account and hit publish to get a live URL for what you built.
A Vercel account is required to use the publish feature.
Get started today
.
Aug 19, 2026
·
Changelog
Cloud Agents and Cursor Harness Improvements
We're continuing to improve cloud agents and the Cursor harness so always-on agents can operate as a system, building and shipping software on their own without the need for intervention at each loop.
With this release, cloud agents can automatically pick up work in response to events, hold a goal until it's met, and stay on course through long-running sessions.
#
Subscriptions
Cursor can now monitor your PRs, watch a Slack thread, or run scheduled tasks. Cursor Agent subscribes to an event source (a thread or conversation) and wakes when something happens. Subscriptions are available for cloud agents only, for now.
Cloud agents automatically subscribe to PRs they create and drive them to completion, fixing CI and addressing bot comments. In Slack, ask
@cursor check back in an hour and keep going until that feedback is in
.
#
Custom modes
Use any skill as a Custom Mode: a skill that stays pinned in the chat. Custom modes keep agents focused on a skill - you can think about it like "always on" skills.
From
/
, pick a skill and press ⌥⏎ (Mac) or Alt+Enter (Windows), or choose
Use as Mode
.
#
Subagents on their own machines
Subagents can now run on their own virtual machines. Each gets an isolated copy of the project with clean context in its own cloud environment.
Have subagents test the parent agent's changes in fresh environments or swarm independent fixes without collisions. Try
run a swarm of subagents to test my app for bugs, each in its own environment
.
#
/goal
Use
/goal
to give the agent a long-lived objective to work towards until it's fully complete.
Try
/goal fix all flaky tests and make CI green
in a new chat. Pair it with a custom mode to follow a playbook, or
/loop
for recurring check-ins.
#
Steering improvements
You can now send a message to steer the agent while it's working without interruption. Follow-ups wait for the next tool call instead of cutting the agent off mid-action.
Type a follow-up and hit Send now, or press ⏎ twice.
Aug 17, 2026
·
Changelog
Origin Code Hosting
Cursor can now host your code.
Origin begins rolling out today in early beta on all paid plans. We're starting with the essentials, designed for agent scale: repos, pull requests, code browsing, and GitHub sync. Agent-native features ship soon.
#
Origin Repos
The new
Codebase
tab is home for Origin repos.
Click
+New
to create a new repo and name it. Once you do, a page shows you how to install the CLI, with commands for how to clone a repo or push a local project. Push, and your code is hosted on Origin.
For Origin-hosted repos, Origin is the source of truth. Pushes land on Origin, and GitHub is not in the path.
Name your codebase when you create your first repo. That name becomes part of every repo's URL: cursor.com/codebase/
acme-corp
.
#
Bring your GitHub repos
Your GitHub repos can sit alongside the ones Cursor hosts. Connect GitHub to Cursor, pick your org, and you'll see the repos you can sync. Select one and Cursor pulls it in. You choose what gets synced and can disconnect a repo at any time. Anyone with read or write access to a synced repo can view it in Cursor too.
Synced repos update in real time. Browse, search, and pull from the copy in Origin. For synced repos, GitHub stays the source of truth: pushes keep going to GitHub, and Origin mirrors the result. Icons next to each repo name tell you which ones Cursor hosts and which came from GitHub.
#
Pull requests
Every repo has pull requests. Open one to see the timeline, commits, checks, and files changed. Review the diff, leave comments, and merge.
Pull requests on synced repos sync both ways: comment in Cursor and it posts to GitHub, react or reply on GitHub and it shows up in Cursor within seconds. Got a review assigned to you on GitHub? Review and merge it from Cursor.
#
Agents in every repo
Your code, PRs, and agents are now in the same place. Ask Cursor questions about code you're browsing. It can answer, make changes, update PRs, or push a branch.
#
App extensions for Cursor repos
We're building an app ecosystem so your whole stack works seamlessly with Origin. Integrations with Vercel, Depot, and Buildkite are already available, with more coming soon.
Connect Vercel from a repo's
Apps
tab and every PR gets a preview deployment where you can test and make comments. Merge, and it ships to production. For CI, connect Depot or Buildkite. Both run your existing GitHub Actions workflows and Buildkite also runs its native pipelines.
#
Settings
Every repo has settings. Check sync status for GitHub repos, manage who has access, and see which apps are connected.
Origin is rolling out in early beta to all paid plan users starting today, except enterprise orgs whose admins opt out. Name your codebase and create your first repo.
Learn more in our
docs
or
get started
today.
Aug 13, 2026
·
Changelog
Cloud Agents Start 3x Faster with Builds
Agents do their best work when they start in a ready environment: repos cloned, dependencies installed, and your install script already run.
This release introduces
builds
: ready-to-use copies of your development environment that Cursor prepares in the background. Agents boot into a ready environment instead of setting up from scratch each session. Builds are included with Cloud Agents at no additional cost.
#
Faster starts
Cursor runs a new build of your environment regularly. When a build succeeds, it becomes the environment future agents start from. Cursor keeps warm copies ready so the next agent does not wait. Internally, our environments now boot 10x faster, with 3x faster time to first token.
Use your
install command
for anything that can be prepared ahead of time. The start command still runs when you first prompt an agent and should focus on services that need to be fresh in the session.
#
More resilient agent runs
When a bad commit or dependency update breaks your environment, agents keep using the last successful build. The broken build never becomes active, you are notified of the issue, and your agents keep working while you debug in the background.
#
Build history and debugging
Each environment has a
Builds
tab in the Cloud Agents dashboard. You can inspect build status, logs, commit SHAs, and which build each agent run used. Agents can also inspect and manage builds using built-in tools.
#
Getting started
New environments use Builds automatically. For an existing environment, open it in the
Cloud Agents dashboard
, go to the
Builds
tab, and click
Enable Builds
. Or click
Run setup agent
first to test the migration and review any proposed config changes.
You can also trigger a Build manually, debug a failing Build with an agent, and control how stale Builds refresh with a configurable threshold.
Learn more in our
announcement post
and
docs
.
Aug 3, 2026
·
Changelog
Google Workspace Plugins
Cursor can now read, write, and act across your Google Workspace.
New plugins give coding agents direct access to Gmail, Google Drive, and Calendar, so you can pull context, draft and update files, and manage your inbox and calendar without leaving Cursor.
Install plugins to connect:
Google Drive
:
search files and folders, open and download content, create and organize files
Gmail
:
search and read mail, draft and send messages, apply labels and manage threads
Google Calendar
:
read schedules, create and update events, find free time
Browse the new plugins in the
Cursor Marketplace
or install them from the Customize page in Cursor. Learn more in our
docs
.
Next →
Older posts
Product
Agents
Teams
Enterprise
Pricing
Code Review
CLI
Cloud Agents
Composer
Marketplace
↗
Resources
Download
Changelog
Docs
Learn
↗
Value Calculator
Forum
↗
Help
↗
Workshops
Status
↗
Company
Careers
Blog
Community
Students
Brand
Future
Anysphere
↗
Legal
Terms of Service
Acceptable Use Policy
Privacy Policy
Data Use
Security
Connect
X
↗
LinkedIn
↗
YouTube
↗
©
2026
Anysphere, Inc.
🛡
SOC 2 | ISO27001 | ISO42001 | AIUC-1 Certified
🌐
English
↓
English
✓
简体中文
日本語
繁體中文
Español
Français
Português
한국어
Deutsch
हिन्दी

---

Two big signals: the nav says "Models > Grok" and there's a "Cursor is now a part of SpaceX" post. Let me find the changelog pagination URLs and verify that acquisition claim.

---

[FETCH RESULT]
/changelog
/changelog/08-13-26
/changelog/08-19-26
/changelog/google-workspace-plugins
/changelog/origin-code-hosting
/changelog/page/2
/changelog/start-from-scratch
/en-US/changelog
https://cursor.com/changelog
https://cursor.com/cn/changelog
https://cursor.com/de/changelog
https://cursor.com/es/changelog
https://cursor.com/fr/changelog
https://cursor.com/hi/changelog
https://cursor.com/ja/changelog
https://cursor.com/ko/changelog
https://cursor.com/pt-BR/changelog
https://cursor.com/zh-Hant/changelog

---

[FETCH RESULT]
AI Coding Agent for Building Ambitious Software | Cursor

---

Failed to authenticate. API Error: 403 pre-consume quota failed, user quota: ＄0.113272, need quota: ＄0.377056 (request id: 20260901130821529518902nmgghfwO5dXTs)