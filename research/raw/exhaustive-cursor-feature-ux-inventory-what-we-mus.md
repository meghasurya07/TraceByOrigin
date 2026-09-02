# Exhaustive Cursor feature + UX inventory (what we must clone).

## URLs fetched
- https://cursor.com/docs
- https://cursor.com/llms.txt
- https://cursor.com/changelog

## Content

I'll research this comprehensively. Let me start with a broad sweep of primary sources.

---

[FETCH RESULT]
total 16
drwxr-xr-x 1 bodep 197609 0 Aug 31 11:47 .
drwxr-xr-x 1 bodep 197609 0 Aug 31 11:47 ..

---

[FETCH RESULT]
## What's available

The content provided is only the docs **landing page** — it doesn't contain the site's full navigation tree or per-page URLs. So an exhaustive map can't be built from it. The page does point to a sitemap: "[Overview of all docs pages](/llms.txt)" — that file is where the complete page listing lives.

## Structure visible on the landing page

**Start here**
- Get started — described as going "from install to your first useful change in Cursor"
- Models & Pricing — `https://cursor.com/docs/models-and-pricing.md`
- Changelog — release notes for "the latest features and improvements"

**What you can do with Cursor** (six cards, no URLs given)
- Understand your code
- Plan and build features — mentions "Plan Mode"
- Find and fix bugs
- Review changes
- Customize Cursor — "plugins, skills, MCPs, and rules from one place"
- Connect your workflow — integrations listed include "GitHub, GitLab, Azure DevOps, Bitbucket, JetBrains, Slack, Linear, and more"

**Models** — a single reference table (~46 rows) spanning Anthropic, OpenAI, Google, Cursor, Moonshot, and Z.ai entries; detail lives on the Models & Pricing page.

**More resources**
- Downloads — "Get Cursor for your computer"
- Help — troubleshooting and FAQ; billing/account issues go to the support team

**Other links present:** `/llms.txt` (sitemap) and the hero image at `/docs-static/images/agent/homepage-hero.png`. Every other hyperlink in the table points offsite to model providers (anthropic.com, openai.com, ai.google.dev, z.ai, moonshot.ai, cursor.com/blog).

To get the exhaustive map you asked for, fetch `/llms.txt`.

---

[FETCH RESULT]
I can't reproduce this document in full verbatim — I'm limited to short quoted excerpts (under 125 characters each). Here's a structured overview instead, with the full list available at the source (`cursor.com/llms.txt`).

**Four top-level collections:**

1. **"Cursor Documentation"** — sections: Get Started (docs root, quickstart, models & pricing, router, plus ~11 model pages, changelog), Agent (overview, agents window, review, plan/debug/design modes, prompting, tools for terminal/browser/search/canvas, worktrees, security & run modes), grok-bot, customizing (plugins, rules, skills, subagents, hooks, MCP), cloud-agents (setup, builds, capabilities, bugbot, security/approval agents, mobile, security & networking, self-hosted runtime guides, settings, API), origin (CLI, repos, git, GitHub mirroring, PRs, settings), Integrations (Slack, Teams, Jira, Linear, Notion, GitHub, GitLab, Azure DevOps, Bitbucket, JetBrains, Xcode, deeplinks), SDK (TypeScript, Python, bridge, changelog), cli, and Account (teams setup/pricing/members/SSO/dashboard/analytics, plus an extensive enterprise set covering IAM, SCIM, privacy, networking, compliance, OpenTelemetry, BAA, service accounts, billing groups, hardening).

2. **"CLI Documentation"** — Get Started (overview, installation, using, changelog, shell mode, ACP), Headless (headless, GitHub Actions), Reference (slash commands, parameters, authentication, permissions, configuration, output format, terminal setup).

3. **"API Documentation"** — API Overview (auth, rate limits, best practices), Cloud Agents API (~28 anchored endpoints for agents, runs, artifacts, workers, pools, models, repos, plus webhooks), Admin API (team and organization endpoints for members, audit logs, usage, spend, blocklists, billing groups, model access), Analytics API (~15 anchors including tab usage, DAU, MCP/skills adoption, leaderboard, bugbot), AI Code Tracking API (4 commit/code-change metric endpoints).

4. **"Help Center"** — Getting started, AI features (~22 pages), Customization, Models and usage, Security and privacy, Account and billing (~21 pages), Integrations, Grok Bot, Troubleshooting.

**Localization:** language codes are prefixed to the path; the available set is listed as "cn, ru, ja, pt-BR, es", e.g. `https://cursor.com/es/docs/bugbot.md`.

---

[FETCH RESULT]
## Scope note first

This page carries **no version numbers** — Cursor's changelog entries here are titled and dated, not versioned. It also contains **no late-2025 content**; only five August 2026 posts appear. Older material sits behind "Older posts" (`/changelog/page/2`).

---

### Aug 27, 2026 — "Start from scratch, without a repo"
Cloud Agents can now begin without a linked GitHub or other third-party SCM.
- **"Get started"** — pick "Start from scratch" in the repo picker; an Origin repo is created behind the scenes.
- **"Turn it into a real repo, whenever you want"** — a "Create repo" button saves work; custom or suggested name; visibility set to "private or internal"; find it in the Codebase tab.
- **"A live preview, right in the browser"** — port-forwards the agent's live environment, enabling tools like design mode.
- **"Publish your work"** — link Vercel and publish for a live URL. "A Vercel account is required to use the publish feature."

### Aug 19, 2026 — "Cloud Agents and Cursor Harness Improvements"
- **"Subscriptions"** — agents watch PRs, Slack threads, or scheduled tasks and wake on events; cloud-agents-only for now. They auto-subscribe to PRs they open, "fixing CI and addressing bot comments."
- **"Custom modes"** — any skill pinned in chat, described as "always on" skills; from `/`, press ⌥⏎ (Mac) / Alt+Enter (Windows), or select "Use as Mode."
- **"Subagents on their own machines"** — each subagent gets its own VM, isolated project copy, and "clean context."
- **"/goal"** — assigns a long-lived objective; pairs with custom modes or `/loop`.
- **"Steering improvements"** — mid-run messages queue until "the next tool call" instead of interrupting; use Send now or double-⏎.

### Aug 17, 2026 — "Origin Code Hosting"
Early beta across paid plans (enterprise admins may opt out), covering "repos, pull requests, code browsing, and GitHub sync."
- **"Origin Repos"** — new Codebase tab; "+New" to create; CLI clone/push instructions; Origin is authoritative and "GitHub is not in the path"; codebase name becomes part of repo URLs.
- **"Bring your GitHub repos"** — connect, choose org, select repos to sync, disconnect anytime; real-time mirroring with GitHub remaining source of truth; icons distinguish hosted vs. synced.
- **"Pull requests"** — timeline, commits, checks, files changed, comments, merge; two-way sync with GitHub "within seconds."
- **"Agents in every repo"** — ask questions, make changes, update PRs, push branches.
- **"App extensions for Cursor repos"** — Vercel, Depot, and Buildkite via the Apps tab; Vercel gives per-PR preview deployments; Depot/Buildkite run existing GitHub Actions, plus Buildkite's native pipelines.
- **"Settings"** — sync status, access management, connected apps.

### Aug 13, 2026 — "Cloud Agents Start 3x Faster with Builds"
Builds are prebaked environment copies, "included with Cloud Agents at no additional cost."
- **"Faster starts"** — periodic rebuilds become the default start point; warm copies kept ready; environments "boot 10x faster, with 3x faster time to first token." Install command handles prep work; start command handles session-fresh services.
- **"More resilient agent runs"** — a broken build never activates; agents fall back to the last good one and you're notified.
- **"Build history and debugging"** — Builds tab exposes status, logs, commit SHAs, and which build a run used; agents can manage builds too.
- **"Getting started"** — automatic for new environments; existing ones use "Enable Builds" or "Run setup agent" first; manual triggers, agent-assisted debugging, and a configurable staleness threshold.

### Aug 3, 2026 — "Google Workspace Plugins"
Agents gain direct Workspace access via three plugins:
- **Google Drive** — "search files and folders, open and download content, create and organize files"
- **Gmail** — "search and read mail, draft and send messages, apply labels and manage threads"
- **Google Calendar** — "read schedules, create and update events, find free time"

Available through the Cursor Marketplace or the in-app Customize page.

---

Interesting — the docs have evolved substantially. Let me get the raw llms.txt and key pages.

---

[FETCH RESULT]
422 /tmp/llms.txt
# Cursor Documentation

## Get Started

- https://cursor.com/docs.md
- https://cursor.com/docs/get-started/quickstart.md
- https://cursor.com/docs/models-and-pricing.md
  - https://cursor.com/docs/cursor-router.md
  - https://cursor.com/docs/models/claude-sonnet-5.md
  - https://cursor.com/docs/models/claude-opus-5.md
  - https://cursor.com/docs/models/claude-fable-5.md
  - https://cursor.com/docs/models/gemini-3-1-pro.md
  - https://cursor.com/docs/models/gemini-3-7-flash.md
  - https://cursor.com/docs/models/gpt-5-6-sol.md
  - https://cursor.com/docs/models/gpt-5-6-terra.md
  - https://cursor.com/docs/models/gpt-5-6-luna.md
  - https://cursor.com/docs/models/grok-4-6.md
  - https://cursor.com/docs/models/grok-4-5.md
  - https://cursor.com/docs/models/cursor-composer-2-5.md
- https://cursor.comhttps://cursor.com/changelog.md

## Agent

- https://cursor.com/docs/agent/overview.md
- https://cursor.com/docs/agent/agents-window.md
- https://cursor.com/docs/agent/agent-review.md
- https://cursor.com/docs/agent/plan-mode.md
- https://cursor.com/docs/agent/prompting.md
- https://cursor.com/docs/agent/debug-mode.md
- https://cursor.com/docs/agent/design-mode.md
- https://cursor.com/docs/agent/tools/terminal.md
  - https://cursor.com/docs/agent/tools/browser.md
  - https://cursor.com/docs/agent/tools/search.md
  - https://cursor.com/docs/agent/tools/canvas.md
  - https://cursor.com/docs/configuration/worktrees.md
- https://cursor.com/docs/agent/security.md
  - https://cursor.com/docs/agent/security/run-modes.md

## grok-bot

- https://cursor.com/docs/grok-bot.md
- https://cursor.com/docs/grok-bot/get-started.md
- https://cursor.com/docs/grok-bot/use-cases.md
- https://cursor.com/docs/grok-bot/work.md
- https://cursor.com/docs/grok-bot/settings.md
- https://cursor.com/docs/grok-bot/teams.md
  - https://cursor.com/docs/grok-bot/identity.md

## customizing

- https://cursor.com/docs/customize-cursor.md
- https://cursor.com/docs/plugins.md
- https://cursor.com/docs/rules.md
- https://cursor.com/docs/skills.md
- https://cursor.com/docs/subagents.md
- https://cursor.com/docs/hooks.md
- https://cursor.com/docs/mcp.md

## cloud-agents

- https://cursor.com/docs/cloud-agent.md
- https://cursor.com/docs/cloud-agent/setup.md
- https://cursor.com/docs/cloud-agent/builds.md
- https://cursor.com/docs/cloud-agent/capabilities.md
  - https://cursor.com/docs/cloud-agent/metadata.md
- https://cursor.com/docs/cloud-agent/best-practices.md
- https://cursor.com/docs/cloud-agent/automations.md
- https://cursor.com/docs/bugbot.md
- https://cursor.com/docs/security-agents.md
- https://cursor.com/docs/approval-agents.md
- https://cursor.com/docs/cloud-agent/mobile.md
- https://cursor.com/docs/cloud-agent/security.md
  - https://cursor.com/docs/cloud-agent/security-network.md
  - https://cursor.com/docs/cloud-agent/private-connectivity.md
  - https://cursor.com/docs/cloud-agent/identity.md
- https://cursor.com/docs/cloud-agent/self-hosted.md
  - https://cursor.com/docs/cloud-agent/self-hosted-guides/choose-runtime.md
  - https://cursor.com/docs/cloud-agent/self-hosted-guides/pool.md
  - https://cursor.com/docs/cloud-agent/self-hosted-guides/my-machines.md
  - https://cursor.com/docs/cloud-agent/self-hosted-guides/kubernetes.md
  - https://cursor.com/docs/cloud-agent/self-hosted-guides/cloud-run.md
- https://cursor.com/docs/cloud-agent/settings.md
- https://cursor.com/docs/cloud-agent/api/endpoints.md

## origin

- https://cursor.com/docs/origin.md
- https://cursor.com/docs/origin/cli.md
  - https://cursor.com/docs/origin/cli/reference/commands.md
  - https://cursor.com/docs/origin/cli/reference/pull-requests.md
- https://cursor.com/docs/origin/create-repository.md
- https://cursor.com/docs/origin/git.md
- https://cursor.com/docs/origin/mirror-github.md
- https://cursor.com/docs/origin/pull-requests.md
- https://cursor.com/docs/origin/browse.md
- https://cursor.com/docs/origin/settings.md
- https://cursor.com/docs/origin/codebase-settings.md
- https://cursor.com/docs/origin/integrations.md

## Integrations

- https://cursor.com/docs/integrations/slack.md
- https://cursor.com/docs/integrations/microsoft-teams.md
- https://cursor.com/docs/integrations/jira.md
- https://cursor.com/docs/integrations/linear.md
- https://cursor.com/docs/integrations/notion.md
- https://cursor.com/docs/integrations/github.md
- https://cursor.com/docs/integrations/gitlab.md
- https://cursor.com/docs/integrations/azure-devops.md
- https://cursor.com/docs/integrations/bitbucket.md
- https://cursor.com/docs/integrations/jetbrains.md
- https://cursor.com/docs/integrations/xcode.md
- https://cursor.com/docs/reference/deeplinks.md

## SDK

- https://cursor.com/docs/sdk/typescript.md
- https://cursor.com/docs/sdk/python.md
- https://cursor.com/docs/sdk/bridge.md
- https://cursor.com/docs/sdk/changelog.md

## cli

- https://cursor.com/docs/cli/overview.md
- https://cursor.com/docs/cli/installation.md
- https://cursor.com/docs/cli/using.md
- https://cursor.com/docs/cli/changelog.md
- https://cursor.com/docs/cli/shell-mode.md
- https://cursor.com/docs/cli/acp.md
- https://cursor.com/docs/cli/headless.md
- https://cursor.com/docs/cli/reference/slash-commands.md
  - https://cursor.com/docs/cli/reference/parameters.md
  - https://cursor.com/docs/cli/reference/authentication.md
  - https://cursor.com/docs/cli/reference/permissions.md
  - https://cursor.com/docs/cli/reference/configuration.md

## Account

- https://cursor.com/docs/account/teams/setup.md
  - https://cursor.com/docs/account/teams/pricing.md
  - https://cursor.com/docs/account/teams/members.md
  - https://cursor.com/docs/account/teams/sso.md
  - https://cursor.com/docs/account/teams/dashboard.md
  - https://cursor.com/docs/account/teams/analytics.md
- https://cursor.com/docs/enterprise.md
  - https://cursor.com/docs/enterprise/admin-setup-guide.md
  - https://cursor.com/docs/enterprise/organizations.md
  - https://cursor.com/docs/enterprise/organization-groups.md
  - https://cursor.com/docs/enterprise/identity-and-access-management.md
    - https://cursor.com/docs/account/teams/scim.md
  - https://cursor.com/docs/enterprise/privacy-and-data-governance.md
  - https://cursor.com/docs/enterprise/network-configuration.md
  - https://cursor.com/docs/enterprise/endpoint-security.md
  - https://cursor.com/docs/enterprise/llm-safety-and-controls.md
  - https://cursor.com/docs/enterprise/model-and-integration-management.md
  - https://cursor.com/docs/account/enterprise/cyber-safeguards.md
  - https://cursor.com/docs/enterprise/pooled-usage.md
  - https://cursor.com/docs/enterprise/compliance-and-monitoring.md
  - https://cursor.com/docs/enterprise/opentelemetry-export.md
    - https://cursor.com/docs/enterprise/opentelemetry-export/wire.md
  - https://cursor.com/docs/enterprise/baa.md
  - https://cursor.com/docs/enterprise/deployment-patterns.md
  - https://cursor.com/docs/account/enterprise/service-accounts.md
  - https://cursor.com/docs/account/enterprise/billing-groups.md
  - https://cursor.com/docs/enterprise/security-hardening.md
  - https://cursor.com/docs/integrations/cursor-blame.md

# CLI Documentation

## Get Started

- https://cursor.com/docs/cli/overview.md
- https://cursor.com/docs/cli/installation.md
- https://cursor.com/docs/cli/using.md
- https://cursor.com/docs/cli/changelog.md
- https://cursor.com/docs/cli/shell-mode.md
- https://cursor.com/docs/cli/acp.md

## Headless

- https://cursor.com/docs/cli/headless.md
- https://cursor.com/docs/cli/github-actions.md

## Reference

- https://cursor.com/docs/cli/reference/slash-commands.md
- https://cursor.com/docs/cli/reference/parameters.md
- https://cursor.com/docs/cli/reference/authentication.md
- https://cursor.com/docs/cli/reference/permissions.md
- https://cursor.com/docs/cli/reference/configuration.md
- https://cursor.com/docs/cli/reference/output-format.md
- https://cursor.com/docs/cli/reference/terminal-setup.md

# API Documentation

## API Overview

- https://cursor.com/docs/api.md
- https://cursor.com/docs/api.md#authentication
- https://cursor.com/docs/api.md#rate-limits

---

Curl works on the `.md` endpoints — much better. Let me see the rest of llms.txt then bulk-fetch key pages.

---

[FETCH RESULT]
- https://cursor.com/docs/api.md#rate-limits
- https://cursor.com/docs/api.md#best-practices

## Cloud Agents API

- https://cursor.com/docs/cloud-agent/api/endpoints.md
- https://cursor.com/docs/cloud-agent/api/endpoints.md#create-an-agent
- https://cursor.com/docs/cloud-agent/api/endpoints.md#list-agents
- https://cursor.com/docs/cloud-agent/api/endpoints.md#get-an-agent
- https://cursor.com/docs/cloud-agent/api/endpoints.md#create-a-run
- https://cursor.com/docs/cloud-agent/api/endpoints.md#list-runs
- https://cursor.com/docs/cloud-agent/api/endpoints.md#get-a-run
- https://cursor.com/docs/cloud-agent/api/endpoints.md#stream-a-run
- https://cursor.com/docs/cloud-agent/api/endpoints.md#cancel-a-run
- https://cursor.com/docs/cloud-agent/api/endpoints.md#list-artifacts
- https://cursor.com/docs/cloud-agent/api/endpoints.md#download-an-artifact
- https://cursor.com/docs/cloud-agent/api/endpoints.md#archive-an-agent
- https://cursor.com/docs/cloud-agent/api/endpoints.md#unarchive-an-agent
- https://cursor.com/docs/cloud-agent/api/endpoints.md#delete-an-agent-permanently
- https://cursor.com/docs/cloud-agent/api/endpoints.md#worker-tokens
- https://cursor.com/docs/cloud-agent/api/endpoints.md#list-workers
- https://cursor.com/docs/cloud-agent/api/endpoints.md#get-worker-summary
- https://cursor.com/docs/cloud-agent/api/endpoints.md#get-worker-by-id
- https://cursor.com/docs/cloud-agent/api/endpoints.md#list-pools
- https://cursor.com/docs/cloud-agent/api/endpoints.md#register-a-pool
- https://cursor.com/docs/cloud-agent/api/endpoints.md#deregister-a-pool
- https://cursor.com/docs/cloud-agent/api/endpoints.md#list-pending-pool-requests
- https://cursor.com/docs/cloud-agent/api/endpoints.md#watch-pending-pool-requests
- https://cursor.com/docs/cloud-agent/api/endpoints.md#claim-a-pending-request
- https://cursor.com/docs/cloud-agent/api/endpoints.md#release-a-claim
- https://cursor.com/docs/cloud-agent/api/endpoints.md#api-key-info
- https://cursor.com/docs/cloud-agent/api/endpoints.md#list-models
- https://cursor.com/docs/cloud-agent/api/endpoints.md#list-github-repositories
- https://cursor.com/docs/cloud-agent/api/webhooks.md

## Admin API

- https://cursor.com/docs/account/teams/admin-api.md
- https://cursor.com/docs/account/organizations/organization-admin-api.md
- https://cursor.com/docs/account/organizations/organization-admin-api.md#list-organization-members
- https://cursor.com/docs/account/organizations/organization-admin-api.md#organization-groups
- https://cursor.com/docs/account/organizations/organization-admin-api.md#get-pooled-usage
- https://cursor.com/docs/account/organizations/organization-admin-api.md#get-usage-events
- https://cursor.com/docs/account/organizations/organization-admin-api.md#get-daily-usage-data
- https://cursor.com/docs/account/organizations/organization-admin-api.md#get-spending-data
- https://cursor.com/docs/account/organizations/organization-admin-api.md#model-access
- https://cursor.com/docs/account/teams/admin-api.md#get-team-members
- https://cursor.com/docs/account/teams/admin-api.md#get-audit-logs
- https://cursor.com/docs/account/teams/admin-api.md#get-daily-usage-data
- https://cursor.com/docs/account/teams/admin-api.md#get-spending-data
- https://cursor.com/docs/account/teams/admin-api.md#get-usage-events-data
- https://cursor.com/docs/account/teams/admin-api.md#set-user-spend-limit
- https://cursor.com/docs/account/teams/admin-api.md#remove-team-member
- https://cursor.com/docs/account/teams/admin-api.md#get-team-repo-blocklists
- https://cursor.com/docs/account/teams/admin-api.md#upsert-repo-blocklists
- https://cursor.com/docs/account/teams/admin-api.md#delete-repo-blocklist
- https://cursor.com/docs/account/teams/admin-api.md#billing-groups
- https://cursor.com/docs/account/teams/admin-api.md#list-groups
- https://cursor.com/docs/account/teams/admin-api.md#get-group
- https://cursor.com/docs/account/teams/admin-api.md#create-group
- https://cursor.com/docs/account/teams/admin-api.md#update-group
- https://cursor.com/docs/account/teams/admin-api.md#delete-group
- https://cursor.com/docs/account/teams/admin-api.md#add-members-to-group
- https://cursor.com/docs/account/teams/admin-api.md#remove-members-from-group
- https://cursor.com/docs/account/teams/admin-api.md#model-access

## Analytics API

- https://cursor.com/docs/account/teams/analytics-api.md
- https://cursor.com/docs/account/teams/analytics-api.md#agent-edits
- https://cursor.com/docs/account/teams/analytics-api.md#tab-usage
- https://cursor.com/docs/account/teams/analytics-api.md#daily-active-users-dau
- https://cursor.com/docs/account/teams/analytics-api.md#client-versions
- https://cursor.com/docs/account/teams/analytics-api.md#model-usage
- https://cursor.com/docs/account/teams/analytics-api.md#top-file-extensions
- https://cursor.com/docs/account/teams/analytics-api.md#mcp-adoption
- https://cursor.com/docs/account/teams/analytics-api.md#commands-adoption
- https://cursor.com/docs/account/teams/analytics-api.md#plans-adoption
- https://cursor.com/docs/account/teams/analytics-api.md#skills-adoption
- https://cursor.com/docs/account/teams/analytics-api.md#ask-mode-adoption
- https://cursor.com/docs/account/teams/analytics-api.md#conversation-insights
- https://cursor.com/docs/account/teams/analytics-api.md#leaderboard
- https://cursor.com/docs/account/teams/analytics-api.md#bugbot-analytics
- https://cursor.com/docs/account/teams/analytics-api.md#by-user-endpoints

## AI Code Tracking API

- https://cursor.com/docs/account/teams/ai-code-tracking-api.md
- https://cursor.com/docs/account/teams/ai-code-tracking-api.md#get-ai-commit-metrics-json-paginated
- https://cursor.com/docs/account/teams/ai-code-tracking-api.md#download-ai-commit-metrics-csv-streaming
- https://cursor.com/docs/account/teams/ai-code-tracking-api.md#get-ai-code-change-metrics-json-paginated
- https://cursor.com/docs/account/teams/ai-code-tracking-api.md#download-ai-code-change-metrics-csv-streaming

# Help Center

## Getting started

- https://cursor.com/help/getting-started/install.md
- https://cursor.com/help/getting-started/first-project.md
- https://cursor.com/help/getting-started/build-ai-coding-agent.md
- https://cursor.com/help/getting-started/migrate-vscode.md
- https://cursor.com/help/getting-started/migrate-jetbrains.md

## AI features

- https://cursor.com/help/ai-features/agent.md
- https://cursor.com/help/ai-features/coding-agents.md
- https://cursor.com/help/ai-features/agentic-coding.md
- https://cursor.com/help/ai-features/ai-pair-programming.md
- https://cursor.com/help/ai-features/multi-agent.md
- https://cursor.com/help/ai-features/side-chats.md
- https://cursor.com/help/ai-features/conversation-search.md
- https://cursor.com/help/ai-features/vibe-coding.md
- https://cursor.com/help/ai-features/plan-mode.md
- https://cursor.com/help/ai-features/ask-mode.md
- https://cursor.com/help/ai-features/debug-mode.md
- https://cursor.com/help/ai-features/tab.md
- https://cursor.com/help/ai-features/inline-edit.md
- https://cursor.com/help/ai-features/max-mode.md
- https://cursor.com/help/ai-features/terminal.md
- https://cursor.com/help/ai-features/browser.md
- https://cursor.com/help/ai-features/cloud-agents.md
- https://cursor.com/help/ai-features/background-agents.md
- https://cursor.com/help/ai-features/mobile-app.md
- https://cursor.com/help/ai-features/automations.md
- https://cursor.com/help/ai-features/shared-transcripts.md
- https://cursor.com/help/ai-features/bugbot.md

## Customization

- https://cursor.com/help/customization/rules.md
- https://cursor.com/help/customization/context.md
- https://cursor.com/help/customization/mcp.md
- https://cursor.com/help/customization/skills.md
- https://cursor.com/help/customization/ignore-files.md
- https://cursor.com/help/customization/extensions.md
- https://cursor.com/help/customization/plugins.md
- https://cursor.com/help/customization/keyboard-shortcuts.md
- https://cursor.com/help/customization/themes.md

## Models and usage

- https://cursor.com/help/models-and-usage/available-models.md
- https://cursor.com/help/models-and-usage/cursor-router.md
- https://cursor.com/help/models-and-usage/grok-4-6.md
- https://cursor.com/help/models-and-usage/grok-4-5.md
- https://cursor.com/help/models-and-usage/api-keys.md
- https://cursor.com/help/models-and-usage/usage-limits.md
- https://cursor.com/help/models-and-usage/token-rate.md

## Security and privacy

- https://cursor.com/help/security-and-privacy/privacy.md
- https://cursor.com/help/security-and-privacy/regions.md
- https://cursor.com/help/security-and-privacy/compliance.md
- https://cursor.com/help/security-and-privacy/sso.md
- https://cursor.com/help/security-and-privacy/account-compromised.md
- https://cursor.com/help/security-and-privacy/marketplace-security.md

## Account and billing

- https://cursor.com/help/account-and-billing/pricing.md
- https://cursor.com/help/account-and-billing/billing.md
- https://cursor.com/help/account-and-billing/cursor-start.md
- https://cursor.com/help/account-and-billing/app-store-subscription.md
- https://cursor.com/help/account-and-billing/teams-setup.md
- https://cursor.com/help/account-and-billing/teams-management.md
- https://cursor.com/help/account-and-billing/invoices.md
- https://cursor.com/help/account-and-billing/overages.md
- https://cursor.com/help/account-and-billing/bugbot-usage-based-billing.md
- https://cursor.com/help/account-and-billing/spend-alerts.md
- https://cursor.com/help/account-and-billing/spend-limits.md
- https://cursor.com/help/account-and-billing/enterprise.md
- https://cursor.com/help/account-and-billing/profiles.md
- https://cursor.com/help/account-and-billing/change-email.md
- https://cursor.com/help/account-and-billing/payment-issues.md
- https://cursor.com/help/account-and-billing/payment-not-applied.md
- https://cursor.com/help/account-and-billing/cancel.md
- https://cursor.com/help/account-and-billing/refunds.md
- https://cursor.com/help/account-and-billing/delete-account.md
- https://cursor.com/help/account-and-billing/referral-program.md
- https://cursor.com/help/account-and-billing/student-discount.md

## Integrations

- https://cursor.com/help/integrations/git.md
- https://cursor.com/help/integrations/github-gitlab.md
- https://cursor.com/help/integrations/cli.md
- https://cursor.com/help/integrations/third-party.md

## Grok Bot

- https://cursor.com/help/grok-bot/getting-started.md
- https://cursor.com/help/grok-bot/sign-in.md
- https://cursor.com/help/grok-bot/mobile.md
- https://cursor.com/help/grok-bot/plans.md
- https://cursor.com/help/grok-bot/supergrok.md
- https://cursor.com/help/grok-bot/mobile-purchase.md
- https://cursor.com/help/grok-bot/delete-account.md
- https://cursor.com/help/grok-bot/connect-plugins.md
- https://cursor.com/help/grok-bot/computer-recovery.md
- https://cursor.com/help/grok-bot/secrets.md
- https://cursor.com/help/grok-bot/get-help.md

## Troubleshooting

- https://cursor.com/help/troubleshooting/agent-issues.md
- https://cursor.com/help/troubleshooting/tab-issues.md
- https://cursor.com/help/troubleshooting/install-issues.md
- https://cursor.com/help/troubleshooting/network.md
- https://cursor.com/help/troubleshooting/extensions.md
- https://cursor.com/help/troubleshooting/performance.md
- https://cursor.com/help/troubleshooting/reporting-bugs.md

## Internationalization

All documentation is available in multiple languages. To access a specific language version, prepend the language code to the path. For example:

- Spanish: `https://cursor.com/es/docs/bugbot.md`
- Japanese: `https://cursor.com/ja/docs/bugbot.md`
- Simplified Chinese: `https://cursor.com/cn/docs/bugbot.md`

Available languages: cn, ru, ja, pt-BR, es

---

Let me bulk-download the core feature docs.

---

[FETCH RESULT]
docs_agent_overview.md 6334
docs_agent_agents-window.md 2985
docs_agent_agent-review.md 1673
docs_agent_plan-mode.md 2002
docs_agent_debug-mode.md 2639
docs_agent_design-mode.md 3577
docs_agent_tools_terminal.md 1474
docs_agent_tools_browser.md 10388
docs_agent_tools_search.md 1977
docs_agent_tools_canvas.md 3694
docs_agent_security.md 2967
docs_agent_security_run-modes.md 18010
docs_rules.md 16712
docs_skills.md 15841
docs_subagents.md 25883
docs_hooks.md 64429
docs_mcp.md 16819
docs_plugins.md 14997
docs_customize-cursor.md 5200
help_ai-features_tab.md 1639
help_ai-features_inline-edit.md 1217
help_ai-features_ask-mode.md 916
help_ai-features_max-mode.md 1134
help_customization_context.md 1315
help_customization_ignore-files.md 1287
help_customization_keyboard-shortcuts.md 1204
docs_models-and-pricing.md 33165
docs_cursor-router.md 4764
help_ai-features_side-chats.md 4060
help_ai-features_multi-agent.md 2551

---

[FETCH RESULT]
File does not exist. Note: your current working directory is C:\Trace by Origin.

---

[FETCH RESULT]
File does not exist. Note: your current working directory is C:\Trace by Origin.

---

[FETCH RESULT]
C:/Users/bodep/AppData/Local/Temp/cur

---

[FETCH RESULT]
1	# Cursor Agent
2	
3	Agent is Cursor's assistant that can complete complex coding tasks independently, run terminal commands, and edit code. Access in sidepane with Cmd+I.
4	
5	Learn more about [how agents work](https://cursor.com/learn/agents.md) and help you build faster.
6	
7	## How Agent works
8	
9	An agent is built on three components:
10	
11	1. **Instructions**: The system prompt and [rules](https://cursor.com/docs/rules.md) that guide agent behavior
12	2. **Tools**: File editing, codebase search, terminal execution, and more
13	3. **Model**: The agent model you pick for the task
14	
15	Cursor's agent orchestrates these components for each model we support, tuning instructions and tools specifically for every frontier model. As new models are released, you can focus on building software while Cursor handles the model-specific optimizations.
16	
17	## Tools
18	
19	Tools are the building blocks of Agent. They are used to search your codebase and the web to find relevant information, make edits to your files, run terminal commands, and more.
20	
21	To understand how tool calling works under the hood, see our [tool calling fundamentals](https://cursor.com/learn/tool-calling.md).
22	
23	There is no limit on the number of tool calls Agent can make during a task.
24	
25	### Search files and folders
26	
27	Search for files by name, read directory structures, and find exact keywords or patterns within files.
28	
29	### Web
30	
31	Generate search queries and perform web searches.
32	
33	### Fetch Rules
34	
35	Retrieve specific [rules](https://cursor.com/docs/rules.md) based on type and description.
36	
37	### Read files
38	
39	Intelligently read the content of a file. Also supports image files (.png, .jpg, .gif, .webp, .svg) and includes them in the conversation context for analysis by vision-capable models.
40	
41	### Edit files
42	
43	Suggest edits to files and apply them automatically.
44	
45	### Run shell commands
46	
47	Execute terminal commands and monitor output. By default, Cursor uses the first terminal profile available.
48	
49	To set your preferred terminal profile:
50	
51	1. Open Command Palette (`Cmd/Ctrl+Shift+P`)
52	2. Search for "Terminal: Select Default Profile"
53	3. Choose your desired profile
54	
55	### Browser
56	
57	Control a browser to take screenshots, test applications, and verify visual changes. Agent can navigate pages, interact with elements, and capture the current state for analysis. See the [Browser documentation](https://cursor.com/docs/agent/tools/browser.md) for details.
58	
59	### Image generation
60	
61	Generate images from text descriptions or reference images. Useful for creating UI mockups, product assets, and visualizing architecture diagrams. Images are saved to your project's `assets/` folder by default and shown inline in chat.
62	
63	### Ask questions
64	
65	Ask clarifying questions during a task. While waiting for your response, the agent continues reading files, making edits, or running commands. Your answer is incorporated as soon as it arrives.
66	
67	## Checkpoints
68	
69	Checkpoints save snapshots of your codebase during an Agent session. Agent automatically creates them before making significant changes, capturing the state of all modified files.
70	
71	If Agent takes a wrong turn, click any checkpoint in the chat timeline to preview your files at that point, then restore to revert all files to that state. You can also restore from the `Restore Checkpoint` button on previous requests or the + button when hovering over a message. Restoring a checkpoint reverts files only; it does not remove messages from the conversation.
72	
73	Checkpoints are useful for exploratory work, complex refactoring, and iterative development where you want safe rollback points.
74	
75	Checkpoints are stored locally and separate from Git. Only use them for undoing Agent changes; use Git for permanent version control.
76	
77	## Queued messages
78	
79	You have two ways to talk to an agent while it works. Queue a message and it waits for the current task to finish. [Send a follow-up now](https://cursor.com/docs/agent/overview.md#steer-a-running-agent) and it steers the active turn at the agent's next tool call.
80	
81	[Media](/docs-static/images/agent/planning/agent-queue.mp4)
82	
83	### Using the queue
84	
85	1. While Agent is working, type your next instruction
86	2. Press Enter to add it to the queue
87	3. Messages appear in order below the active task
88	4. Drag to reorder queued messages as needed
89	5. Agent processes them sequentially after finishing
90	
91	### Keyboard shortcuts
92	
93	While Agent is working:
94	
95	- Press Enter to queue your message (it waits until Agent finishes the current task)
96	- Press Cmd+Enter to send immediately, bypassing the queue
97	
98	### Immediate messaging
99	
100	When you use Cmd+Enter to send immediately, your message is appended to the most recent user message in the chat and processed right away without waiting in the queue.
101	
102	- Your message attaches to tool results and sends immediately
103	- This creates a more responsive experience for urgent follow-ups
104	- Use this when you need to interrupt or redirect Agent's current work
105	
106	### Steer a running agent
107	
108	You can send a follow-up to steer the agent while it's working, without interrupting it. Type a follow-up and hit **Send now**, or press Enter twice. The message is delivered at the agent's next tool call instead of cutting off work mid-action, which preserves in-flight work and keeps the agent on task.
109	
110	This is available on [cursor.com/agents](https://cursor.com/agents) now and rolling out in the [Agents Window](https://cursor.com/docs/agent/agents-window.md). Press Tab to queue the message for after the turn instead.
111	
112	In the [CLI](https://cursor.com/docs/cli/overview.md), pressing Enter while the agent works steers the active run at a safe boundary, and pressing Enter again interrupts the turn.
113	
114	## Goals with /goal
115	
116	Agent reads each message as a new job. Use `/goal` to give the agent a long-lived objective to work towards until it's fully complete:
117	
118	```text
119	/goal fix all flaky tests and make CI green
120	```
121	
122	In the [CLI](https://cursor.com/docs/cli/overview.md), Ctrl+C pauses the goal. Pair a goal with a [Custom Mode](https://cursor.com/docs/agent/prompting.md#custom-modes) when you want the agent to follow a playbook, or with the built-in [`/loop`](https://cursor.com/docs/skills.md#built-in-cursor-skills) skill for recurring check-ins while it pursues the objective.
123	
124	`/goal` is rolling out. If you don't see it, try it in a new chat.
125	
126	
127	---
128	
129	## Sitemap
130	
131	[Overview of all docs pages](/llms.txt)
132	

---

[FETCH RESULT]
1	# Tab completion
2	
3	Tab is Cursor's AI-powered autocomplete. It suggests code as you type, based on your recent edits, surrounding code, and linter errors.
4	
5	## How do I accept or reject suggestions?
6	
7	- **Accept the full suggestion**: Press Tab
8	- **Reject**: Press Escape or keep typing
9	- **Accept word-by-word**:
10	  - **Mac**: Press Cmd + Arrow Right
11	  - **Windows/Linux**: Press Ctrl + Arrow Right
12	
13	Suggestions appear as grayed-out text ahead of your cursor.
14	
15	## Can Tab edit multiple lines at once?
16	
17	Yes. Tab can modify multiple lines, add missing import statements, and suggest coordinated edits across related code.
18	
19	## What is jump-in-file?
20	
21	After you accept a Tab suggestion, press Tab again. Tab predicts your next editing location and jumps there. This saves you from scrolling or navigating manually.
22	
23	## Can Tab suggest edits in other files?
24	
25	Yes. Tab predicts cross-file edits when changes in one file need updates in another. When a jump to another file is available, a portal window appears at the bottom of the editor.
26	
27	## How do I turn Tab on or off?
28	
29	Click the **Tab** status indicator in the bottom-right corner of Cursor. From there you can:
30	
31	- **Snooze**: Disable Tab temporarily for a chosen duration
32	- **Disable globally**: Turn Tab off for all files
33	- **Disable for specific extensions**: Turn Tab off for certain file types (like markdown or JSON)
34	
35	You can also configure Tab settings in **Cursor Settings** > **Tab**.
36	
37	## Can I change the Tab keyboard shortcut?
38	
39	Yes. Search for `Accept Cursor Tab Suggestions` in **Keyboard Shortcuts** settings to remap it.
40	
41	
42	---
43	
44	## Sitemap
45	
46	[Overview of all docs pages](/llms.txt)
47	

---

[FETCH RESULT]
docs/tab -> 404 389
docs/tab/overview -> 404 389
docs/tab/auto-import -> 404 389
docs/inline-edit -> 404 389
docs/chat -> 404 389
docs/context -> 404 389
docs/configuration/kbd -> 404 389
docs/memories -> 404 389
docs/agent/modes -> 404 389
docs/agent/chat/overview -> 404 389
docs/get-started/quickstart -> 200 3907
docs/agent/prompting -> 200 4485
docs/agent/apply -> 404 389
docs/agent/inline-edit -> 404 389
docs/editor/tab -> 404 389

---

[FETCH RESULT]
1	# Quickstart
2	
3	This guide gets you from install to your first useful change in Cursor. You'll sign in, ask Cursor to explain your codebase, make a small edit, and review the result.
4	
5	### Install Cursor and sign in
6	
7	Download Cursor. Open the app and sign in. Then pick a folder and start with a small task.
8	
9	### macOS
10	
11	- macOS 12 (Monterey) and later
12	- Native installer (.dmg)
13	- Apple Silicon and Intel support
14	
15	### Windows
16	
17	- Windows 10 and later
18	- Native installer (.exe)
19	
20	### Linux
21	
22	**Debian/Ubuntu (recommended)**
23	
24	```bash
25	# Add Cursor's GPG key
26	curl -fsSL https://downloads.cursor.com/keys/anysphere.asc | gpg --dearmor | sudo tee /etc/apt/keyrings/cursor.gpg > /dev/null
27	
28	# Add the Cursor repository
29	echo "deb [arch=amd64,arm64 signed-by=/etc/apt/keyrings/cursor.gpg] https://downloads.cursor.com/aptrepo stable main" | sudo tee /etc/apt/sources.list.d/cursor.list > /dev/null
30	
31	# Update and install
32	sudo apt update
33	sudo apt install cursor
34	```
35	
36	**RHEL/Fedora**
37	
38	```bash
39	# Add Cursor's repository
40	sudo tee /etc/yum.repos.d/cursor.repo << 'EOF'
41	[cursor]
42	name=Cursor
43	baseurl=https://downloads.cursor.com/yumrepo
44	enabled=1
45	gpgcheck=1
46	gpgkey=https://downloads.cursor.com/keys/anysphere.asc
47	EOF
48	
49	# Install Cursor
50	sudo dnf install cursor
51	```
52	
53	**AppImage (portable)**
54	
55	Download the `.AppImage` file from [cursor.com/downloads](https://cursor.com/downloads), then:
56	
57	```bash
58	chmod +x Cursor-*.AppImage
59	./Cursor-*.AppImage
60	```
61	
62	The apt and yum packages are preferred over AppImage. They provide desktop icons, automatic updates, and CLI tools.
63	
64	### Ask Cursor to explain your codebase
65	
66	After you pick a folder, open Agent with Cmd I. Ask Cursor to explain the codebase and point out the main areas to read first.
67	
68	Explain this codebase. Point me to the main entry points, key modules, and anything I should read before making changes.
69	
70	Cursor will search your repo, read relevant files, and summarize how the project fits together. This is one of the fastest ways to get oriented in an unfamiliar codebase.
71	
72	Want a deeper walkthrough? See [Understand your codebase](https://cursor.com/learn/understanding-your-codebase.md).
73	
74	### Make one small change
75	
76	Once you understand the project, ask Cursor to suggest a few safe improvements. Pick one and ask it to make the change.
77	
78	Suggest three small, safe improvements in this codebase. Explain the tradeoffs and wait for me to choose one.
79	
80	Good first tasks are low risk, like improving some copywriting or fixing small UI issues.
81	
82	If you already know what you want to change, ask for it directly and describe the result you want.
83	
84	### Review the diff and verify the result
85	
86	Now you can watch Cursor work. The diff view shows changes made by the agent.
87	
88	When it finishes, review the diff and ask Cursor to run the checks your project already uses. That can mean tests, the type checker, linting, or a local build.
89	
90	Want a stronger review workflow? See [Reviewing and testing code](https://cursor.com/learn/reviewing-testing.md).
91	
92	### Use Plan Mode for bigger changes
93	
94	Now that you know the basics, use Plan Mode for bigger changes. It works well when the task spans multiple files, needs research, or needs approval before coding.
95	
96	Press Shift+Tab in the agent input to toggle **Plan Mode**. Instead of writing code right away, Cursor will:
97	
98	1. Research your codebase to find relevant files
99	2. Ask clarifying questions about your requirements
100	3. Create a detailed implementation plan
101	4. Wait for your approval before building
102	
103	For a deeper walkthrough, see [Build new features](https://cursor.com/learn/creating-features.md).
104	
105	## Next steps
106	
107	### Agent Overview
108	
109	Learn about Agent's tools and capabilities
110	
111	### Rules
112	
113	Create persistent instructions for your project
114	
115	### Understand your code
116	
117	Learn how to get oriented in an unfamiliar repo
118	
119	### Build new features
120	
121	See a full workflow for shipping larger changes
122	
123	
124	---
125	
126	## Sitemap
127	
128	[Overview of all docs pages](/llms.txt)
129	

---

[FETCH RESULT]
1	# Prompting agents
2	
3	Direct Agent with text prompts in the chat input. You can attach context, images, and voice, and switch models at any point.
4	
5	## @ mentions
6	
7	Type `@` in the chat input to attach specific context to your prompt. Start typing after `@` and Cursor shows matching suggestions.
8	
9	- **Files & Folders**: `@auth.ts` or `@src/components/` to include files or folders (type `/` after selecting a folder to navigate deeper)
10	- **Terminals**: `@Terminals` to include terminal output as context
11	- **Chats**: `@Chats` to reference context from a previous conversation
12	- **Git diffs**: `@Commit (Diff of Working State)` for uncommitted changes, or `@Branch (Diff with Main)` for your full branch diff
13	- **Browser**: `@Browser` to attach context from the built-in browser
14	
15	Use @ mentions when you know which files are relevant. If you're not sure which files matter, skip it — Agent finds relevant files through its own search.
16	
17	## Custom Modes
18	
19	Type `/` in the chat input to invoke a [skill](https://cursor.com/docs/skills.md). Pressing Enter attaches the skill to one message, and it fades as the conversation moves on. Use any skill as a Custom Mode to keep the agent focused on it while it works.
20	
21	Pick the skill from the `/` menu and press Option+Enter (Mac) or Alt+Enter (Windows) instead. You can also select **Use as Mode** from the skill entry. Inside a mode, the skill stays in context on every turn, even as the agent works for hours, until you exit the mode.
22	
23	Custom Modes work well for skills that describe how to work rather than a one-shot task. Keep a code-review checklist active while you move through several files, or hold a team playbook like `/tdd` on for an entire feature.
24	
25	Custom Modes are available in the [Agents Window](https://cursor.com/docs/agent/agents-window.md) and the [CLI](https://cursor.com/docs/cli/overview.md). Any skill with a valid frontmatter block can back a mode, and the optional `icon` and `color` frontmatter fields style the mode's badge. See [Using a skill as a Custom Mode](https://cursor.com/docs/skills.md#using-a-skill-as-a-custom-mode).
26	
27	## Image input
28	
29	Attach images to your prompt to provide visual context for UI work, debugging, and design implementation.
30	
31	- **Drag and drop** an image file into the chat input
32	- **Paste from clipboard** with Cmd+V, including screenshots
33	
34	This is useful for implementing design mockups, debugging visual issues, and referencing error messages or stack traces without manual transcription.
35	
36	## Voice input
37	
38	Click the microphone icon in the chat input to dictate your prompt instead of typing. Speak naturally, include technical details like file and function names, and review the transcription before sending.
39	
40	## Context usage
41	
42	Every chat shares a fixed context window with the model. As you add files, run tools, and exchange messages, those tokens fill up. When the window gets close to full, Cursor compresses older parts of the conversation into a summary to leave more room for new conversation.
43	
44	The context ring next to your prompt input shows how full the window is at a glance. Click the ring to open the breakdown tray, which shows the total tokens used split by category:
45	
46	- **System prompt**: Cursor's built-in instructions for the model
47	- **Tools**: definitions of every tool available to the agent
48	- **Rules**: project and user rules included in the prompt
49	- **Skills**: skill descriptions injected into the system context
50	- **MCP**: instructions and catalog from connected MCP servers
51	- **Subagents**: documentation for subagent types the agent can launch
52	- **Summarized conversation**: compressed summaries of earlier turns
53	- **Conversation**: your messages, the agent's replies, and tool results
54	
55	Hover a segment in the bar or a row in the list to highlight that category.
56	
57	## Changing models
58	
59	Use the model picker dropdown at the top of the chat input to switch models, or press Cmd / to cycle through models. The change applies to the current conversation going forward. Set a default model in **Cursor Settings > Models**.
60	
61	- **Faster models** work well for quick edits and routine tasks
62	- **More capable models** are better for complex reasoning and multi-file refactoring
63	
64	You can switch models mid-conversation, for example when a faster model handled exploration but you need deeper reasoning for implementation. See [Models & Pricing](https://cursor.com/docs/models-and-pricing.md) for the full list.
65	
66	
67	---
68	
69	## Sitemap
70	
71	[Overview of all docs pages](/llms.txt)
72	

---

[FETCH RESULT]
1	# @ mentions and context
2	
3	Type `@` in the chat input to attach specific context to your conversation. This helps Agent focus on the right files and information.
4	
5	## What can I reference with @?
6	
7	- **Files & Folders**: `@auth.ts` or `@src/components/` to include files or folders (type `/` after selecting a folder to navigate deeper)
8	- **Terminals**: `@Terminals` to include terminal output as context
9	- **Chats**: `@Chats` to reference context from a previous conversation
10	- **Git diffs**: `@Commit (Diff of Working State)` for uncommitted changes, or `@Branch (Diff with Main)` for your full branch diff
11	- **Browser**: `@Browser` to attach context from the built-in browser
12	
13	## When should I use @ mentions?
14	
15	Use them when you know which files are relevant. For example, if you want Agent to update a component and its tests, mention both files.
16	
17	If you're not sure which files matter, skip it — Agent finds relevant files through its own search.
18	
19	## Can I attach multiple items?
20	
21	Yes. Type `@` multiple times to attach several files, folders, or other context items. Each one gets added to the conversation.
22	
23	## Related
24	
25	- [Rules](https://cursor.com/help/customization/rules.md)
26	- [Ignore files](https://cursor.com/help/customization/ignore-files.md)
27	
28	
29	---
30	
31	## Sitemap
32	
33	[Overview of all docs pages](/llms.txt)
34	

---

[FETCH RESULT]
1	# Inline edit
2	
3	Inline edit lets you make quick, targeted code changes without opening the chat panel. Select code, describe what you want, and Cursor applies the edit in place.
4	
5	## How do I use inline edit?
6	
7	1. Select the code you want to change
8	2. Press Cmd + K on Mac or Ctrl + K on Windows/Linux
9	3. Type your instructions. For example: "Convert this to an async function."
10	4. Press Return. Cursor applies the edit to your selected code.
11	5. To refine, add follow-up instructions and press Return again.
12	
13	## How do I ask a quick question with inline edit?
14	
15	1. Select the code you want to ask about
16	2. Press Cmd + K on Mac or Ctrl + K on Windows/Linux
17	3. Switch to question mode:
18	   - **Mac**: Press Opt + Return
19	   - **Windows/Linux**: Press Alt + Return
20	4. Type your question. If you want to apply a suggested change, type "do it" and press Return.
21	
22	## Can I switch from inline edit to Agent?
23	
24	For multi-file edits or more complex changes, select code and press Cmd + L on Mac (Ctrl + L on Windows/Linux). This opens Agent with your selected code as context.
25	
26	## Related
27	
28	- [Agent mode](https://cursor.com/help/ai-features/agent.md) for multi-file editing
29	
30	
31	---
32	
33	## Sitemap
34	
35	[Overview of all docs pages](/llms.txt)
36	

---

[FETCH RESULT]
1	# Ask mode
2	
3	Ask mode is a read-only mode for understanding your codebase. Agent answers questions and explores code without making any edits.
4	
5	## How do I use Ask mode?
6	
7	1. Open the Agent panel (Cmd + I on Mac, Ctrl + I on Windows/Linux)
8	2. Switch to Ask mode by pressing Shift + Tab to cycle modes, or use the mode picker dropdown
9	3. Type your question and press Return
10	
11	## When should I use Ask mode?
12	
13	Use Ask mode when you want to understand code without changing it:
14	
15	- "How does the authentication flow work?"
16	- "What does this function do?"
17	- "Where is the database connection configured?"
18	- "Explain the relationship between these two modules"
19	
20	For questions that lead to code changes, switch back to Agent mode.
21	
22	## Related
23	
24	- [Agent mode](https://cursor.com/help/ai-features/agent.md)
25	- [Agent reference](https://cursor.com/docs/agent/overview.md)
26	
27	
28	---
29	
30	## Sitemap
31	
32	[Overview of all docs pages](/llms.txt)
33	

---

[FETCH RESULT]
1	# Max Mode on legacy plans
2	
3	Max Mode is available only on legacy request-based plans. It extends a model's context window beyond the default limit.
4	
5	## How do I enable Max Mode?
6	
7	If you're on a legacy request-based plan, open the model selector in your chat or agent panel and toggle Max Mode on. The setting stays on across conversations. Models that require Max Mode enable it automatically when selected.
8	
9	## How does Max Mode affect my usage?
10	
11	On legacy request-based plans, Max Mode is billed at the model's API rate plus 20%. A larger context window can increase the tokens used by a request.
12	
13	## When should I use Max Mode?
14	
15	On a legacy request-based plan, use Max Mode when a task needs more context than the model's default window. The default context window works well for most coding tasks.
16	
17	## Related
18	
19	- [Legacy request-based pricing](https://cursor.com/docs/account/pricing/request-based-legacy.md)
20	- [Usage and limits](https://cursor.com/help/models-and-usage/usage-limits.md)
21	- [Available models](https://cursor.com/help/models-and-usage/available-models.md)
22	
23	
24	---
25	
26	## Sitemap
27	
28	[Overview of all docs pages](/llms.txt)
29	

---

[FETCH RESULT]
1	# Rules
2	
3	Rules provide system-level instructions to Agent. They bundle prompts, scripts, and more together, making it easy to manage and share workflows across your team.
4	
5	Cursor supports four types of rules:
6	
7	### Project Rules
8	
9	Stored in `.cursor/rules`, version-controlled and scoped to your codebase.
10	
11	### User Rules
12	
13	Global to your Cursor environment. Used by Agent (Chat).
14	
15	### Team Rules
16	
17	Team-wide rules managed from the dashboard. Available on Team and [Enterprise](https://cursor.com/docs/enterprise.md) plans.
18	
19	### AGENTS.md
20	
21	Agent instructions in markdown format. Simple alternative to
22	`.cursor/rules`.
23	
24	## How rules work
25	
26	Large language models don't retain memory between completions. Rules provide persistent, reusable context at the prompt level.
27	
28	When applied, rule contents are included at the start of the model context. This gives the AI consistent guidance for generating code, interpreting edits, or helping with workflows.
29	
30	## Project rules
31	
32	Project rules live in `.cursor/rules` as `.mdc` files and are version-controlled. They are scoped using path patterns, invoked manually, or included based on relevance.
33	
34	Use project rules to:
35	
36	- Encode domain-specific knowledge about your codebase
37	- Automate project-specific workflows or templates
38	- Standardize style or architecture decisions
39	
40	### Rule file structure
41	
42	Each rule is an `.mdc` file that you can name anything you want. Project rules must use the `.mdc` extension. A plain `.md` file in `.cursor/rules` is ignored by the rules system because it has no frontmatter to specify `description`, `globs`, and `alwaysApply`. If you prefer plain markdown, use [AGENTS.md](https://cursor.com/docs/rules.md#agentsmd) instead.
43	
44	```bash
45	.cursor/rules/
46	  react-patterns.mdc       # Recognized as a project rule
47	  api-guidelines.md        # Ignored (wrong extension)
48	  frontend/                # Organize rules in folders
49	    components.mdc
50	```
51	
52	### Rule anatomy
53	
54	Each rule is a markdown file with frontmatter metadata and content. Control how rules are applied from the type dropdown which changes properties `description`, `globs`, `alwaysApply`.
55	
56	| Rule Type                 | Description                                           |
57	| :------------------------ | :---------------------------------------------------- |
58	| `Always Apply`            | Apply to every chat session                           |
59	| `Apply Intelligently`     | When Agent decides it's relevant based on description |
60	| `Apply to Specific Files` | When file matches a specified pattern                 |
61	| `Apply Manually`          | When @-mentioned in chat (e.g., `@my-rule`)           |
62	
63	Under the hood, the three frontmatter fields interact to determine when a rule is included:
64	
65	| `alwaysApply` | `description` | `globs`  | Behavior                                                         |
66	| :------------ | :------------ | :------- | :--------------------------------------------------------------- |
67	| `true`        | —             | —        | Always included. Globs and description are ignored.              |
68	| `false`       | —             | provided | Auto-attached when a matching file is in context.                |
69	| `false`       | provided      | omitted  | Agent reads the description and pulls the rule in when relevant. |
70	| `false`       | omitted       | omitted  | Included only when you `@`-mention the rule in chat.             |
71	
72	```md title="Always applied"
73	---
74	alwaysApply: true
75	---
76	
77	- All source files must include the company copyright header
78	- When you are unsure about implementation details, read the relevant
79	  source files before proposing changes
80	- Never modify generated files in the `dist/` or `build/` directories
81	```
82	
83	```md title="Auto-attached by file pattern"
84	---
85	globs: src/components/**/*.tsx
86	alwaysApply: false
87	---
88	
89	- Use named exports, not default exports
90	- Co-locate styles in a module CSS file next to the component
91	- Keep components under 200 lines. Extract subcomponents into the same
92	  directory when a file grows beyond that
93	- Prefer composition over prop drilling. Pass children or render props
94	  instead of threading data through multiple layers
95	```
96	
97	```md title="Agent-selected based on description"
98	---
99	description: RPC service conventions and patterns for the backend
100	alwaysApply: false
101	---
102	
103	- Define each service in its own file under `src/services/`
104	- Always validate inputs at the service boundary before passing data
105	  to internal functions
106	- Return structured error objects with a `code` and `message` field,
107	  never throw raw strings
108	- Add a `@service-template.ts` reference file when creating a new
109	  service for the standard boilerplate
110	```
111	
112	```md title="Manual — only via @-mention"
113	---
114	alwaysApply: false
115	---
116	
117	- Every database migration must have both `up` and `down` functions
118	  so it can be fully reversed
119	- Never alter a column type in-place. Add a new column, backfill,
120	  then drop the old one in a separate migration
121	- Reference the template for the expected file structure
122	
123	@migration-template.sql
124	```
125	
126	### Glob pattern examples
127	
128	Use `globs` to scope a rule to specific files or directories. Separate multiple patterns with commas.
129	
130	| Pattern                       | Matches                                                |
131	| :---------------------------- | :----------------------------------------------------- |
132	| `*`                           | Any single file name segment                           |
133	| `**`                          | Any number of directories (recursive)                  |
134	| `*.ts`                        | All `.ts` files in the root                            |
135	| `**/*.ts`                     | All `.ts` files in any directory                       |
136	| `src/**`                      | All files anywhere under `src/`                        |
137	| `src/**/*.tsx`                | All `.tsx` files anywhere under `src/`                 |
138	| `docs/**/*.md, docs/**/*.mdx` | `.md` and `.mdx` files under `docs/` (comma-separated) |
139	| `tailwind.config.*`           | `tailwind.config` with any extension                   |
140	
141	### Creating a rule
142	
143	There are two ways to create rules:
144	
145	- **`/create-rule` in chat**: Type `/create-rule` in Agent and describe what you want. Agent generates the rule file with proper frontmatter and saves it to `.cursor/rules`.
146	- **From Customize**: Open **Customize** in the sidebar, go to **Rules**, and click **Add Rule**. This creates a new rule file in `.cursor/rules`. From Customize you can see all rules and their status.
147	
148	## Best practices
149	
150	Good rules are focused, actionable, and scoped.
151	
152	- Keep rules under 500 lines
153	- Split large rules into multiple, composable rules
154	- Provide concrete examples or referenced files
155	- Avoid vague guidance. Write rules like clear internal docs
156	- Reuse rules when repeating prompts in chat
157	- Reference files instead of copying their contents—this keeps rules short and prevents them from becoming stale as code changes
158	
159	### What to avoid in rules
160	
161	- **Copying entire style guides**: Use a linter instead. Agent already knows common style conventions.
162	- **Documenting every possible command**: Agent knows common tools like npm, git, and pytest.
163	- **Adding instructions for edge cases that rarely apply**: Keep rules focused on patterns you use frequently.
164	- **Duplicating what's already in your codebase**: Point to canonical examples instead of copying code.
165	
166	Start simple. Add rules only when you notice Agent making the same mistake repeatedly. Don't over-optimize before you understand your patterns.
167	
168	Check your rules into git so your whole team benefits. When you see Agent make a mistake, update the rule. You can even tag `@cursor` on a GitHub issue or PR to have Agent update the rule for you.
169	
170	## Rule file format
171	
172	Each rule is a markdown file with frontmatter metadata and content. The frontmatter metadata is used to control how the rule is applied. The content is the rule itself.
173	
174	```markdown
175	---
176	description: "This rule provides standards for frontend components and API validation"
177	alwaysApply: false
178	---
179	
180	...rest of the rule content
181	```
182	
183	If alwaysApply is true, the rule will be applied to every chat session. Otherwise, the description of the rule will be presented to the Cursor Agent to decide if it should be applied.
184	
185	## Examples
186	
187	### Standards for frontend components and API validation
188	
189	This rule provides standards for frontend components:
190	
191	When working in components directory:
192	
193	- Always use Tailwind for styling
194	- Use Framer Motion for animations
195	- Follow component naming conventions
196	
197	This rule enforces validation for API endpoints:
198	
199	In API directory:
200	
201	- Use zod for all validation
202	- Define return types with zod schemas
203	- Export types generated from schemas
204	
205	### Templates for Express services and React components
206	
207	This rule provides a template for Express services:
208	
209	Use this template when creating Express service:
210	
211	- Follow RESTful principles
212	- Include error handling middleware
213	- Set up proper logging
214	
215	@express-service-template.ts
216	
217	This rule defines React component structure:
218	
219	React components should follow this layout:
220	
221	- Props interface at top
222	- Component as named export
223	- Styles at bottom
224	
225	@component-template.tsx
226	
227	### Automating development workflows and documentation generation
228	
229	This rule automates app analysis:
230	
231	When asked to analyze the app:
232	
233	1. Run dev server with `npm run dev`
234	2. Fetch logs from console
235	3. Suggest performance improvements
236	
237	This rule helps generate documentation:
238	
239	Help draft documentation by:
240	
241	- Extracting code comments
242	- Analyzing README.md
243	- Generating markdown documentation
244	
245	### Adding a new setting in Cursor
246	
247	First create a property to toggle in `@reactiveStorageTypes.ts`.
248	
249	Add default value in `INIT_APPLICATION_USER_PERSISTENT_STORAGE` in `@reactiveStorageService.tsx`.
250	
251	For beta features, add toggle in `@settingsBetaTab.tsx`, otherwise add in `@settingsGeneralTab.tsx`. Toggles can be added as `<SettingsSubSection>` for general checkboxes. Look at the rest of the file for examples.
252	
253	```jsx
254	<SettingsSubSection
255	  label="Your feature name"
256	  description="Your feature description"
257	  value={
258	    vsContext.reactiveStorageService.applicationUserPersistentStorage
259	      .myNewProperty ?? false
260	  }
261	  onChange={(newVal) => {
262	    vsContext.reactiveStorageService.setApplicationUserPersistentStorage(
263	      "myNewProperty",
264	      newVal,
265	    );
266	  }}
267	/>
268	```
269	
270	To use in the app, import reactiveStorageService and use the property:
271	
272	```js
273	const flagIsEnabled =
274	  vsContext.reactiveStorageService.applicationUserPersistentStorage
275	    .myNewProperty;
276	```
277	
278	Examples are available from providers and frameworks. Community-contributed rules are found across crowdsourced collections and repositories online.
279	
280	## Team Rules
281	
282	Team and [Enterprise](https://cursor.com/docs/enterprise.md) plans can create and enforce rules across their entire organization from the [Cursor dashboard](https://cursor.com/dashboard/team-content). Admins can configure whether or not each rule is required for team members.
283	
284	Team Rules work alongside other rule types and take precedence to ensure organizational standards are maintained across all projects. They provide a powerful way to ensure consistent coding standards, practices, and workflows across your entire team without requiring individual setup or configuration.
285	
286	### Managing Team Rules
287	
288	Team administrators can create and manage rules directly from the Cursor dashboard:
289	
290	![Empty team rules dashboard where team administrators can add new rules](/docs-static/images/context/rules/team-rules-empty.png)
291	
292	Once team rules are created, they automatically apply to all team members and are visible in the dashboard:
293	
294	![Team rules dashboard showing a single team rule that will be enforced for all team members](/docs-static/images/context/rules/team-rules-1.png)
295	
296	### Activation and enforcement
297	
298	- **Enable this rule immediately**: When checked, the rule is active as soon as you create it. When unchecked, the rule is saved as a draft and does not apply until you enable it later.
299	- **Enforce this rule**: When enabled, the rule is required for all team members and cannot be disabled in Customize. When not enforced, team members can toggle the rule off under **Team Rules** in Customize.
300	
301	By default, non‑enforced Team Rules can be disabled by users. Use Enforce this rule to prevent that.
302	
303	### Format and how Team Rules are applied
304	
305	- **Content**: Team Rules are free‑form text. They do not use the folder structure of Project Rules.
306	- **Glob patterns**: Team Rules support glob patterns for file-scoped application. When a glob pattern is set (e.g., `**/*.py`), the rule only applies when matching files are in context. Rules without a glob pattern apply to every conversation.
307	- **Where they apply**: When a Team Rule is enabled (and not disabled by the user, unless enforced), it is included in the model context for Agent (Chat) across all repositories and projects for that team.
308	- **Precedence**: Rules are applied in this order: **Team Rules → Project Rules → User Rules**. All applicable rules are merged; earlier sources take precedence when guidance conflicts.
309	
310	Some teams use enforced rules as part of internal compliance workflows. While this is supported, AI guidance should not be your only security control.
311	
312	## Importing Rules
313	
314	You can import rules from external sources to reuse existing configurations or bring in rules from other tools.
315	
316	### Remote rules (via GitHub)
317	
318	Import rules directly from any GitHub repository you have access to—public or private.
319	
320	1. Open **Customize** in the sidebar
321	2. Go to **Rules** and click **Add Rule**
322	3. Select **Remote Rule (Github)**
323	4. Paste the GitHub repository URL containing the rules. Cursor will scan for all `.mdc` files in the repo.
324	5. Cursor will pull and sync the rule(s) into your project
325	
326	Rules will be placed in `.cursor/rules/imported/<repoName>`. Rules will also keep their relative paths, so `dir/rule.mdc` will be imported as `.cursor/rule/imported/<repoName>/dir/rule.mdc`.
327	
328	## AGENTS.md
329	
330	`AGENTS.md` is a simple markdown file for defining agent instructions. Place it in your project root as an alternative to `.cursor/rules` for straightforward use cases.
331	
332	Unlike Project Rules, `AGENTS.md` is a plain markdown file without metadata or complex configurations. It's perfect for projects that need simple, readable instructions without the overhead of structured rules.
333	
334	Cursor supports AGENTS.md in the project root and subdirectories.
335	
336	```markdown
337	# Project Instructions
338	
339	## Code Style
340	
341	- Use TypeScript for all new files
342	- Prefer functional components in React
343	- Use snake_case for database columns
344	
345	## Architecture
346	
347	- Follow the repository pattern
348	- Keep business logic in service layers
349	```
350	
351	### Improvements
352	
353	### Nested AGENTS.md support
354	
355	Nested `AGENTS.md` support in subdirectories is now available. You can place `AGENTS.md` files in any subdirectory of your project, and they will be automatically applied when working with files in that directory or its children.
356	
357	This allows for more granular control of agent instructions based on the area of your codebase you're working in:
358	
359	```bash
360	project/
361	  AGENTS.md              # Global instructions
362	  frontend/
363	    AGENTS.md            # Frontend-specific instructions
364	    components/
365	      AGENTS.md          # Component-specific instructions
366	  backend/
367	    AGENTS.md            # Backend-specific instructions
368	```
369	
370	Instructions from nested `AGENTS.md` files are combined with parent directories, with more specific instructions taking precedence.
371	
372	## User Rules
373	
374	User Rules are global preferences defined in **Customize → Rules** that apply across all projects. They are used by Agent (Chat) and are perfect for setting preferred communication style or coding conventions:
375	
376	```md
377	Please reply in a concise style. Avoid unnecessary repetition or filler language.
378	```
379	
380	## FAQ
381	
382	### Why isn't my rule being applied?
383	
384	Check the rule type. For `Apply Intelligently`, ensure a description is defined. For `Apply to Specific Files`, ensure the file pattern matches referenced files.
385	
386	### Can rules reference other rules or files?
387	
388	Yes. Use `@filename.ts` to include files in your rule's context. You can also @mention rules in chat to apply them manually.
389	
390	### Can I create a rule from chat?
391	
392	Yes, you can ask the agent to create a new rule for you.
393	
394	### Do rules impact Cursor Tab or other AI features?
395	
396	No. Rules do not impact Cursor Tab or other AI features.
397	
398	### Do User Rules apply to Inline Edit (Cmd/Ctrl+K)?
399	
400	No. User Rules are not applied to Inline Edit (Cmd/Ctrl+K). They are only
401	used by Agent (Chat).
402	
403	## Related
404	
405	- [Rules help](https://cursor.com/help/customization/rules.md)
406	
407	
408	---
409	
410	## Sitemap
411	
412	[Overview of all docs pages](/llms.txt)
413	

---

[FETCH RESULT]
1	# Agent Skills
2	
3	Agent Skills is an open standard for extending AI agents with specialized capabilities. Skills package domain-specific knowledge and workflows that agents can use to perform specific tasks.
4	
5	## What are skills?
6	
7	A skill is a portable, version-controlled package that teaches agents how to perform domain-specific tasks. Skills can include scripts, templates, and references that agents may act on using their tools.
8	
9	### Portable
10	
11	Skills work across any agent that supports the Agent Skills standard.
12	
13	### Version-controlled
14	
15	Skills are stored as files and can be tracked in your repository, or installed via GitHub repository links.
16	
17	### Actionable
18	
19	Skills can include scripts, templates, and references that agents act on using their tools.
20	
21	### Progressive
22	
23	Skills load resources on demand, keeping context usage efficient.
24	
25	## How skills work
26	
27	When Cursor starts, it automatically discovers skills from skill directories and makes them available to Agent. The agent is presented with available skills and decides when they are relevant based on context.
28	
29	Skills can also be manually invoked by typing `/` in Agent chat and searching for the skill name. A skill invoked this way attaches to one message. To keep a skill on for the whole session, use it as a Custom Mode with Option+Enter (Mac) or Alt+Enter (Windows). See [Custom Modes](https://cursor.com/docs/agent/prompting.md#custom-modes).
30	
31	## Built-in Cursor skills
32	
33	Cursor includes a small set of built in skills to improve your general workflows. These skills are managed by Cursor and appear alongside the skills you add yourself.
34	
35	| Skill                     | What it does                                                                                         |
36	| ------------------------- | ---------------------------------------------------------------------------------------------------- |
37	| `/automate`               | Creates Cursor Automations triggered by schedules, Slack messages, GitHub events, and other sources. |
38	| `/autopilot`              | Monitors a pull request and addresses feedback, conflicts, failing checks, and follow-up work.       |
39	| `/canvas`                 | Creates interactive React artifacts that render alongside the conversation.                          |
40	| `/create-hook`            | Creates Cursor hooks and updates `hooks.json` for agent lifecycle events.                            |
41	| `/create-rule`            | Creates Cursor rules with the appropriate scope and instructions.                                    |
42	| `/create-skill`           | Creates Agent Skills, including their structure and `SKILL.md` files.                                |
43	| `/create-subagent`        | Creates custom subagents with focused roles and delegation instructions.                             |
44	| `/cursor-blame`           | Investigates AI-authored changes and the prompts that produced them.                                 |
45	| `/loop`                   | Runs a prompt or skill repeatedly at a specified interval.                                           |
46	| `/migrate-to-skills`      | Converts eligible dynamic rules and slash commands into Agent Skills.                                |
47	| `/review`                 | Selects and runs the appropriate code-review agent.                                                  |
48	| `/review-bugbot`          | Reviews code for likely bugs and regressions with Bugbot.                                            |
49	| `/review-security`        | Reviews code for security vulnerabilities with Security Review.                                      |
50	| `/sdk`                    | Helps you build applications and integrations with the Cursor SDK.                                   |
51	| `/shell`                  | Runs the provided text as a literal shell command.                                                   |
52	| `/split-to-prs`           | Splits large changes into smaller pull requests.                                                     |
53	| `/statusline`             | Configures the Cursor CLI status line.                                                               |
54	| `/update-cli-config`      | Updates Cursor CLI settings in `~/.cursor/cli-config.json`.                                          |
55	| `/update-cursor-settings` | Finds and updates the appropriate Cursor or VS Code setting.                                         |
56	
57	You can run any built-in skill by typing `/` in Agent chat and selecting its name. Agent may also use some built-in skills automatically when your request clearly matches their purpose.
58	
59	## Skill directories
60	
61	Skills are automatically loaded from these locations:
62	
63	| Location            | Scope                                    |
64	| ------------------- | ---------------------------------------- |
65	| `.agents/skills/`   | Project-level                            |
66	| `.cursor/skills/`   | Project-level                            |
67	| `~/.agents/skills/` | User-level (global) on the local machine |
68	| `~/.cursor/skills/` | User-level (global) on the local machine |
69	
70	Cursor loads user-level skills from the machine where the agent runs. Cursor
71	does not copy your local `~/.cursor/skills/` and `~/.agents/skills/` folders
72	to Cloud Agents, Agents Window remote SSH sessions, or [workers on machines
73	you manage](https://cursor.com/docs/cloud-agent/bring-your-own-machine.md). In those environments,
74	use project skills from the repo or bake skills into the worker image.
75	
76	For compatibility, Cursor also loads skills from Claude and Codex directories: `.claude/skills/`, `.codex/skills/`, `~/.claude/skills/`, and `~/.codex/skills/`.
77	
78	Each skill should be a folder containing a `SKILL.md` file:
79	
80	```text
81	.agents/
82	└── skills/
83	    └── my-skill/
84	        └── SKILL.md
85	```
86	
87	Skills can also include optional directories for scripts, references, and assets:
88	
89	```text
90	.agents/
91	└── skills/
92	    └── deploy-app/
93	        ├── SKILL.md
94	        ├── scripts/
95	        │   ├── deploy.sh
96	        │   └── validate.py
97	        ├── references/
98	        │   └── REFERENCE.md
99	        └── assets/
100	            └── config-template.json
101	```
102	
103	### Nested skill directories
104	
105	Skill directories can be organized into subdirectories. This is useful for grouping related skills by category, team, or domain. Cursor walks the skills root recursively and picks up any `SKILL.md` it finds:
106	
107	```text
108	.cursor/
109	└── skills/
110	    ├── shipping/
111	    │   ├── land-it/
112	    │   │   └── SKILL.md
113	    │   └── careful-merge-conflicts/
114	    │       └── SKILL.md
115	    ├── debugging/
116	    │   └── using-datadog-mcp/
117	    │       └── SKILL.md
118	    └── workflow/
119	        └── tdd/
120	            └── SKILL.md
121	```
122	
123	The category folder is purely organizational. The skill's identity comes from the folder containing `SKILL.md` (here `land-it`, `tdd`, etc.), not the parent category.
124	
125	Cursor also discovers skills inside nested project subdirectories. A `.cursor/skills/` (or `.agents/skills/`) folder anywhere inside your repository is picked up, so monorepos can colocate skills with the package they apply to:
126	
127	```text
128	my-monorepo/
129	├── .cursor/skills/         # repo-wide skills
130	│   └── land-it/SKILL.md
131	└── apps/
132	    └── web/
133	        └── .cursor/skills/  # app-specific skills
134	            └── deploy-web/SKILL.md
135	```
136	
137	Skills in nested project directories are automatically scoped to files inside that directory. In the example above, `deploy-web` is only surfaced when the agent works with files under `apps/web/`, while skills in the repo-wide `.cursor/skills/` are available everywhere. This is similar to the [`paths` frontmatter field](https://cursor.com/docs/skills.md#scoping-a-skill-to-specific-files) — you don't need to set `paths` on a nested skill to scope it to its directory.
138	
139	## SKILL.md file format
140	
141	Each skill is defined in a `SKILL.md` file with YAML frontmatter:
142	
143	```markdown
144	---
145	name: my-skill
146	description: Short description of what this skill does and when to use it.
147	---
148	
149	# My Skill
150	
151	Detailed instructions for the agent.
152	
153	## When to Use
154	
155	- Use this skill when...
156	- This skill is helpful for...
157	
158	## Instructions
159	
160	- Step-by-step guidance for the agent
161	- Domain-specific conventions
162	- Best practices and patterns
163	- Use the ask questions tool if you need to clarify requirements with the user
164	```
165	
166	### Frontmatter fields
167	
168	| Field                      | Required | Description                                                                                                                                                                        |
169	| -------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
170	| `name`                     | Yes      | Skill identifier. Lowercase letters, numbers, and hyphens only. Must match the parent folder name.                                                                                 |
171	| `description`              | Yes      | Describes what the skill does and when to use it. Used by the agent to determine relevance.                                                                                        |
172	| `paths`                    | No       | Glob patterns that scope the skill to matching files. Accepts a comma-separated string or a list. When set, the skill is only surfaced when the agent works with files that match. |
173	| `disable-model-invocation` | No       | When `true`, the skill is only included when explicitly invoked via `/skill-name`. The agent will not automatically apply it based on context.                                     |
174	| `icon`                     | No       | Icon shown on the badge when the skill is used as a [Custom Mode](https://cursor.com/docs/agent/prompting.md#custom-modes). Defaults to a lightning icon.                          |
175	| `color`                    | No       | Badge color when the skill is used as a Custom Mode. One of `default`, `green`, `cyan`, `blue`, `purple`, `magenta`, `orange`, `yellow`, `red`, or `brand`.                        |
176	| `metadata`                 | No       | Arbitrary key-value mapping for additional metadata.                                                                                                                               |
177	
178	## Scoping a skill to specific files
179	
180	Use the `paths` field to limit a skill to files that match one or more glob patterns. The skill is then only surfaced to the agent when it is reading or editing matching files. This keeps file-specific guidance out of context for unrelated work.
181	
182	```markdown
183	---
184	name: react-component-patterns
185	description: Conventions for writing React components in this codebase.
186	paths:
187	  - "**/*.tsx"
188	  - "packages/ui/**/*.ts"
189	---
190	
191	# React component patterns
192	
193	...
194	```
195	
196	You can also pass a single comma-separated string:
197	
198	```markdown
199	---
200	name: python-style
201	description: Style rules for Python files.
202	paths: "**/*.py, scripts/**/*.py"
203	---
204	```
205	
206	Patterns follow standard glob syntax. Leave `paths` unset for a skill that should be available regardless of which files are open.
207	
208	The legacy `globs` field is still accepted as a fallback for older skills, but new skills should use `paths`.
209	
210	## Disabling automatic invocation
211	
212	By default, skills are automatically applied when the agent determines they are relevant. Set `disable-model-invocation: true` to make a skill behave like a traditional slash command, where it is only included in context when you explicitly type `/skill-name` in chat.
213	
214	## Using a skill as a Custom Mode
215	
216	Any skill with a valid frontmatter block can back a [Custom Mode](https://cursor.com/docs/agent/prompting.md#custom-modes), which keeps the skill in context for the whole session. An active mode shows a badge in the chat input. Style it with the optional `icon` and `color` frontmatter fields:
217	
218	```markdown
219	---
220	name: tdd
221	description: Test-driven development playbook for this repo.
222	icon: beaker
223	color: green
224	---
225	```
226	
227	Icons come from Cursor's icon set, with names like `code`, `terminal`, `bug`, `git-branch`, `book-open`, `beaker`, `shield`, and `rocket`. Unrecognized icons or colors fall back to the default badge, a lightning icon.
228	
229	## Including scripts in skills
230	
231	Skills can include a `scripts/` directory containing executable code that agents can run. Reference scripts in your `SKILL.md` using relative paths from the skill root.
232	
233	```markdown
234	---
235	name: deploy-app
236	description: Deploy the application to staging or production environments. Use when deploying code or when the user mentions deployment, releases, or environments.
237	---
238	
239	# Deploy App
240	
241	Deploy the application using the provided scripts.
242	
243	## Usage
244	
245	Run the deployment script: `scripts/deploy.sh <environment>`
246	
247	Where `<environment>` is either `staging` or `production`.
248	
249	## Pre-deployment Validation
250	
251	Before deploying, run the validation script: `python scripts/validate.py`
252	```
253	
254	The agent reads these instructions and executes the referenced scripts when the skill is invoked. Scripts can be written in any language—Bash, Python, JavaScript, or any other executable format supported by the agent implementation.
255	
256	Scripts should be self-contained, include helpful error messages, and handle edge cases gracefully.
257	
258	## Optional directories
259	
260	Skills support these optional directories:
261	
262	| Directory     | Purpose                                                |
263	| ------------- | ------------------------------------------------------ |
264	| `scripts/`    | Executable code that agents can run                    |
265	| `references/` | Additional documentation loaded on demand              |
266	| `assets/`     | Static resources like templates, images, or data files |
267	
268	Keep your main `SKILL.md` focused and move detailed reference material to separate files. This keeps context usage efficient since agents load resources progressively—only when needed.
269	
270	## Viewing skills
271	
272	To view discovered skills, open **Customize** in the sidebar and go to **Skills**. Skills installed from plugins or your project appear alongside rules in the **Agent Decides** section.
273	
274	## Installing skills from GitHub
275	
276	You can import skills from GitHub repositories:
277	
278	1. Open **Customize** in the sidebar
279	2. Go to **Rules** and click **Add Rule**
280	3. Select **Remote Rule (Github)**
281	4. Enter the GitHub repository URL
282	
283	## Migrating rules and commands to skills
284	
285	Cursor includes a built-in `/migrate-to-skills` skill in 2.4 that helps you convert existing dynamic rules and slash commands to skills.
286	
287	The migration skill converts:
288	
289	- **Dynamic rules**: Rules that use the "Apply Intelligently" configuration—rules with `alwaysApply: false` (or undefined) and no `globs` patterns defined. These are converted to standard skills.
290	- **Slash commands**: Both user-level and workspace-level commands are converted to skills with `disable-model-invocation: true`, preserving their explicit invocation behavior.
291	
292	To migrate:
293	
294	1. Type `/migrate-to-skills` in Agent chat
295	2. The agent will identify eligible rules and commands and convert them to skills
296	3. Review the generated skills in `.cursor/skills/`
297	
298	Rules with `alwaysApply: true` or specific `globs` patterns are not migrated, as they have explicit triggering conditions that differ from skill behavior. User rules are also not migrated since they are not stored on the file system.
299	
300	## Learn more
301	
302	Agent Skills is an open standard. Learn more at [agentskills.io](https://agentskills.io).
303	
304	## Related
305	
306	- [Skills help](https://cursor.com/help/customization/skills.md)
307	- [Bring your own machine](https://cursor.com/docs/cloud-agent/bring-your-own-machine.md)
308	
309	
310	---
311	
312	## Sitemap
313	
314	[Overview of all docs pages](/llms.txt)
315	

---

[FETCH RESULT]
1	# Model Context Protocol (MCP)
2	
3	## What is MCP?
4	
5	[Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction) enables Cursor to connect to external tools and data sources. Install and manage MCP servers from the [Customize](https://cursor.com/docs/customize-cursor.md) page or configure them in `mcp.json`.
6	
7	### Why use MCP?
8	
9	MCP connects Cursor to external systems and data. Instead of explaining your project structure repeatedly, integrate directly with your tools.
10	
11	Write MCP servers in any language that can print to `stdout` or serve an HTTP endpoint - Python, JavaScript, Go, etc.
12	
13	Browse official plugins in the [Cursor Marketplace](/marketplace). For community plugins and MCP servers, browse [cursor.directory](https://cursor.directory).
14	
15	### How it works
16	
17	MCP servers expose capabilities through the protocol, connecting Cursor to external tools or data sources.
18	
19	Cursor supports three transport methods:
20	
21	| Transport             | Execution environment | Deployment       | Users          | Input                   | Auth   |
22	| :-------------------- | :-------------------- | :--------------- | :------------- | :---------------------- | :----- |
23	| **`stdio`**           | Local                 | Cursor manages   | Single user    | shell command           | Manual |
24	| **`SSE`**             | Local/Remote          | Deploy as server | Multiple users | URL to an SSE endpoint  | OAuth  |
25	| **`Streamable HTTP`** | Local/Remote          | Deploy as server | Multiple users | URL to an HTTP endpoint | OAuth  |
26	
27	### Protocol and extension support
28	
29	Cursor supports these MCP protocol capabilities and extensions:
30	
31	| Feature              | Support   | Description                                                     |
32	| :------------------- | :-------- | :-------------------------------------------------------------- |
33	| **Tools**            | Supported | Functions for the AI model to execute                           |
34	| **Prompts**          | Supported | Templated messages and workflows for users                      |
35	| **Resources**        | Supported | Structured data sources that can be read and referenced         |
36	| **Roots**            | Supported | Server-initiated inquiries into URI or filesystem boundaries    |
37	| **Elicitation**      | Supported | Server-initiated requests for additional information from users |
38	| **Apps (extension)** | Supported | Interactive UI views returned by MCP tools                      |
39	
40	### MCP apps
41	
42	Cursor supports the [MCP Apps extension](https://modelcontextprotocol.io/extensions/apps/overview). MCP tools can return interactive UI along with standard tool output.
43	
44	MCP Apps follow progressive enhancement. If a host cannot render app UI, the same tool still works through normal MCP responses.
45	
46	## Installing MCP servers
47	
48	### One-click installation
49	
50	Browse the [Cursor Marketplace](/marketplace) for official plugins with one-click install from **Customize**, or configure custom servers with `mcp.json`. For community plugins and MCP servers, browse [cursor.directory](https://cursor.directory). Click "Add to Cursor" on a marketplace entry to install it and authenticate with OAuth.
51	
52	Team admins can also distribute MCP servers through a [team marketplace](https://cursor.com/docs/plugins.md#team-marketplaces). Team-distributed servers appear in Customize alongside personal and workspace MCP servers.
53	
54	### Using `mcp.json`
55	
56	Configure custom MCP servers with a JSON file:
57	
58	```json title="CLI Server - Node.js"
59	{
60	  "mcpServers": {
61	    "server-name": {
62	      "command": "npx",
63	      "args": ["-y", "mcp-server"],
64	      "env": {
65	        "API_KEY": "value"
66	      }
67	    }
68	  }
69	}
70	```
71	
72	```json title="CLI Server - Python"
73	{
74	  "mcpServers": {
75	    "server-name": {
76	      "command": "python",
77	      "args": ["mcp-server.py"],
78	      "env": {
79	        "API_KEY": "value"
80	      }
81	    }
82	  }
83	}
84	```
85	
86	```json title="Remote Server"
87	// MCP server using HTTP or SSE - runs on a server
88	{
89	  "mcpServers": {
90	    "server-name": {
91	      "url": "http://localhost:3000/mcp",
92	      "headers": {
93	        "API_KEY": "value"
94	      }
95	    }
96	  }
97	}
98	```
99	
100	### Static OAuth for remote servers
101	
102	For MCP servers that use OAuth, you can provide **static OAuth client credentials** in `mcp.json` instead of dynamic client registration. Use this when:
103	
104	- The MCP provider gives you a fixed **Client ID** (and optionally **Client Secret**)
105	- The provider requires **whitelisting a redirect URL** (e.g. Figma, Linear)
106	- The provider does not support OAuth 2.0 Dynamic Client Registration
107	
108	Add an `auth` object to remote server entries that use `url`:
109	
110	```json title="Remote Server with Static OAuth"
111	{
112	  "mcpServers": {
113	    "oauth-server": {
114	      "url": "https://api.example.com/mcp",
115	      "auth": {
116	        "CLIENT_ID": "your-oauth-client-id",
117	        "CLIENT_SECRET": "your-client-secret",
118	        "scopes": ["read", "write"]
119	      }
120	    }
121	  }
122	}
123	```
124	
125	| Field              | Required | Description                                                                                                                   |
126	| :----------------- | :------- | :---------------------------------------------------------------------------------------------------------------------------- |
127	| **CLIENT\_ID**     | Yes      | OAuth 2.0 Client ID from the MCP provider                                                                                     |
128	| **CLIENT\_SECRET** | No       | OAuth 2.0 Client Secret (if the provider uses confidential clients)                                                           |
129	| **scopes**         | No       | OAuth scopes to request. If omitted, Cursor will use `/.well-known/oauth-authorization-server` to discover `scopes_supported` |
130	
131	#### Static redirect URL
132	
133	Cursor uses fixed OAuth redirect URLs for MCP servers. Register the callback for each surface your users authenticate from:
134	
135	```text
136	https://www.cursor.com/agents/mcp/oauth/callback
137	http://localhost:8787/callback
138	```
139	
140	- **Web and Cursor Agents**: `https://www.cursor.com/agents/mcp/oauth/callback`
141	- **Desktop app**: `http://localhost:8787/callback`
142	
143	When configuring the MCP provider's OAuth app, register both URLs as allowed redirect URIs if users authenticate from both web and desktop. The server is identified via the OAuth `state` parameter, so these redirect URLs work for all MCP servers.
144	
145	#### Combining with config interpolation
146	
147	`auth` values support the same interpolation as other fields:
148	
149	```json
150	{
151	  "mcpServers": {
152	    "oauth-server": {
153	      "url": "https://api.example.com/mcp",
154	      "auth": {
155	        "CLIENT_ID": "${env:MCP_CLIENT_ID}",
156	        "CLIENT_SECRET": "${env:MCP_CLIENT_SECRET}"
157	      }
158	    }
159	  }
160	}
161	```
162	
163	Use environment variables for Client ID and Client Secret instead of hardcoding them.
164	
165	### STDIO server configuration
166	
167	For STDIO servers (local command-line servers), configure these fields in your `mcp.json`:
168	
169	| Field       | Required | Description                                                                                             | Examples                                  |
170	| :---------- | :------- | :------------------------------------------------------------------------------------------------------ | :---------------------------------------- |
171	| **type**    | Yes      | Server connection type                                                                                  | `"stdio"`                                 |
172	| **command** | Yes      | Command to start the server executable. Must be available on your system path or contain its full path. | `"npx"`, `"node"`, `"python"`, `"docker"` |
173	| **args**    | No       | Array of arguments passed to the command                                                                | `["server.py", "--port", "3000"]`         |
174	| **env**     | No       | Environment variables for the server                                                                    | `{"API_KEY": "${env:api-key}"}`           |
175	| **envFile** | No       | Path to an environment file to load more variables                                                      | `".env"`, `"${workspaceFolder}/.env"`     |
176	
177	The `envFile` option is only available for STDIO servers. Remote servers (HTTP/SSE) do not support `envFile`. For remote servers, use [config interpolation](https://cursor.com/docs/mcp.md#config-interpolation) with environment variables set in your shell profile or system environment instead.
178	
179	### Using the Extension API
180	
181	For programmatic MCP server registration, Cursor provides an extension API that allows dynamic configuration without modifying `mcp.json` files. This is particularly useful for enterprise environments and automated setup workflows.
182	
183	### Extension API reference
184	
185	Register MCP servers programmatically using
186	`vscode.cursor.mcp.registerServer()`
187	
188	### Configuration locations
189	
190	### Project Configuration
191	
192	Create `.cursor/mcp.json` in your project for project-specific tools.
193	
194	### Global Configuration
195	
196	Create `~/.cursor/mcp.json` in your home directory for tools available everywhere.
197	
198	### Config interpolation
199	
200	Use variables in `mcp.json` values. Cursor resolves variables in these fields: `command`, `args`, `env`, `url`, and `headers`.
201	
202	Supported syntax:
203	
204	- `${env:NAME}` environment variables
205	- `${userHome}` path to your home folder
206	- `${workspaceFolder}` project root (the folder that contains `.cursor/mcp.json`)
207	- `${workspaceFolderBasename}` name of the project root
208	- `${pathSeparator}` and `${/}` OS path separator
209	
210	Examples
211	
212	```json
213	{
214	  "mcpServers": {
215	    "local-server": {
216	      "command": "python",
217	      "args": ["${workspaceFolder}/tools/mcp_server.py"],
218	      "env": {
219	        "API_KEY": "${env:API_KEY}"
220	      }
221	    }
222	  }
223	}
224	```
225	
226	```json
227	{
228	  "mcpServers": {
229	    "remote-server": {
230	      "url": "https://api.example.com/mcp",
231	      "headers": {
232	        "Authorization": "Bearer ${env:MY_SERVICE_TOKEN}"
233	      }
234	    }
235	  }
236	}
237	```
238	
239	### Authentication
240	
241	MCP servers use environment variables for authentication. Pass API keys and tokens through the config.
242	
243	Cursor supports OAuth for servers that require it.
244	
245	## Enterprise admin controls
246	
247	MCP distribution and MCP policy are configured separately. Team admins can distribute shared MCP servers. Enterprise admins can configure MCP policy.
248	
249	### Team MCP distribution
250	
251	Configure shared Team MCP servers under **Dashboard > Integrations & MCP**. These servers are available to Cloud Agents.
252	
253	To make an existing standalone Team MCP server available in the Agent Window, IDE, and CLI, select **Add to Team Marketplace** under **Team MCP Servers**. Cursor links the server to the Default team marketplace without interrupting Cloud Agent access. Teammates can then install and configure it from Customize.
254	
255	Linking an MCP server to a marketplace does not install or enable it for everyone. Configure **Marketplace Access** and plugin installation modes under **Dashboard > Plugins**. See [Migrate existing Team MCPs](https://cursor.com/docs/plugins.md#migrate-existing-team-mcps) for the full flow.
256	
257	### MCP Allowlist
258	
259	Enterprise admins can control which MCP servers users may run from the Cursor dashboard. Open [Team Settings > MCP Configuration](https://cursor.com/dashboard/team-settings#mcp-configuration) to configure which servers and tools the team may run. Allowlisting approves an MCP configuration. It does not distribute or install the server.
260	
261	Use the MCP Allowlist to define approved servers:
262	
263	- **Command entries** approve local `stdio` MCP servers by command pattern.
264	- **URL entries** approve remote HTTP/SSE MCP servers by URL entry pattern.
265	- **Tool allowlists** restrict which tools from an approved server can run automatically. Leave a tool allowlist empty to allow all tools from that server.
266	
267	### Network controls
268	
269	Remote MCP URLs are restricted to the configured URL entry pattern.
270	
271	Local command-based MCP servers use their per-server network mode:
272	
273	- **Allow all**: allow outbound network access.
274	- **Allowlist**: allow only listed destinations.
275	- **Deny all**: block outbound network access.
276	- **No sandbox**: run without command or network sandboxing.
277	
278	### User MCP extensions
279	
280	Admins can allow users to configure their own MCP servers outside admin-defined command or URL patterns. For user MCPs that do not match an admin-defined pattern, the User MCP Network Denylist can block matching network destinations.
281	
282	## Using MCP in chat
283	
284	Cursor automatically uses MCP tools listed under `Available Tools` when relevant. This includes [Plan Mode](https://cursor.com/docs/agent/plan-mode.md). Ask for a specific tool by name or describe what you need. Enable or disable MCP servers from **Customize** in the sidebar.
285	
286	### Tool approval
287	
288	Cursor asks for approval before using MCP tools by default. Click the arrow next to the tool name to see arguments.
289	
290	![Tool confirmation prompt](/docs-static/images/context/mcp/tool-confirm.png)
291	
292	#### Run Mode
293	
294	MCP [follows the same Run Modes as terminal commands](https://cursor.com/docs/agent/security/run-modes.md#run-mode). For example, in **Auto-review** mode, allowlisted MCP tools run immediately and everything else is routed through the classifier.
295	
296	### Tool response
297	
298	Cursor shows the response in chat with expandable views of arguments and responses:
299	
300	![MCP tool call result](/docs-static/images/context/mcp/tool-call.png)
301	
302	### Images as context
303	
304	MCP servers can return images - screenshots, diagrams, etc. Return them as base64 encoded strings:
305	
306	```js
307	const RED_CIRCLE_BASE64 = "/9j/4AAQSkZJRgABAgEASABIAAD/2w...";
308	// ^ full base64 clipped for readability
309	
310	server.tool("generate_image", async (params) => {
311	  return {
312	    content: [
313	      {
314	        type: "image",
315	        data: RED_CIRCLE_BASE64,
316	        mimeType: "image/jpeg",
317	      },
318	    ],
319	  };
320	});
321	```
322	
323	See this [example server](https://github.com/msfeldstein/mcp-test-servers/blob/main/src/image-server.js) for implementation details. Cursor attaches returned images to the chat. If the model supports images, it analyzes them.
324	
325	## Security considerations
326	
327	When installing MCP servers, consider these security practices:
328	
329	- **Verify the source**: Only install MCP servers from trusted developers and repositories
330	- **Review permissions**: Check what data and APIs the server will access
331	- **Limit API keys**: Use restricted API keys with minimal required permissions
332	- **Audit code**: For critical integrations, review the server's source code
333	
334	Remember that MCP servers can access external services and execute code on your behalf. Always understand what a server does before installation.
335	
336	## Real-world examples
337	
338	For practical examples of MCP in action:
339	
340	- **[Xcode integration](https://cursor.com/docs/integrations/xcode.md)** — Connect Cursor to Xcode 26.3+ for builds, tests, SwiftUI previews, and Apple documentation search
341	- **[Web Development guide](https://cursor.com/for/web-development.md)** — Integrate Linear, Figma, and browser tools into your development workflow
342	
343	## FAQ
344	
345	### What's the point of MCP servers?
346	
347	MCP servers connect Cursor to external tools like Google Drive, Notion, and
348	other services to bring docs and requirements into your coding workflow.
349	
350	### How do I debug MCP server issues?
351	
352	View MCP logs by:
353	
354	1. Open the Output panel in Cursor (Cmd+Shift+U)
355	2. Select "MCP Logs" from the dropdown
356	3. Check for connection errors, authentication issues, or server crashes
357	
358	The logs show server initialization, tool calls, and error messages.
359	
360	### Can I temporarily disable an MCP server?
361	
362	Yes! Toggle servers on/off without removing them:
363	
364	1. Open **Customize** in the sidebar
365	2. Find the MCP server you want to change
366	3. Use the toggle to enable or disable it
367	
368	Disabled servers won't load or appear in chat. This is useful for troubleshooting or reducing tool clutter.
369	
370	### What happens if an MCP server crashes or times out?
371	
372	If an MCP server fails:
373	
374	- Cursor shows an error message in chat
375	- The tool call is marked as failed
376	- You can retry the operation or check logs for details
377	- Other MCP servers continue working normally
378	
379	Cursor isolates server failures to prevent one server from affecting others.
380	
381	### How do I update an MCP server?
382	
383	For npm-based servers:
384	
385	1. Remove the server from **Customize**
386	2. Clear npm cache: `npm cache clean --force`
387	3. Re-add the server to get the latest version
388	
389	For custom servers, update your local files and restart Cursor.
390	
391	### Can I use MCP servers with sensitive data?
392	
393	Yes, but follow security best practices:
394	
395	- Use environment variables for secrets, never hardcode them
396	- Run sensitive servers locally with `stdio` transport
397	- Limit API key permissions to minimum required
398	- Review server code before connecting to sensitive systems
399	- Consider running servers in isolated environments
400	
401	## Related
402	
403	- [MCP help](https://cursor.com/help/customization/mcp.md)
404	
405	
406	---
407	
408	## Sitemap
409	
410	[Overview of all docs pages](/llms.txt)
411	

---

[FETCH RESULT]
1	# Run Modes
2	
3	Run Modes control how the Cursor agent runs tool calls, and when Cursor interrupts you for approval.
4	
5	Use them to decide how much autonomy the agent gets for shell commands, MCP tools, and Fetch calls. The safest useful setup for most people is **Auto-review**. It runs known-safe calls, sandboxes shell commands when it can, and asks a classifier to review anything else.
6	
7	## Pick a mode
8	
9	In the desktop application, go to **Settings > Agents > Approvals & Execution**.
10	
11	| Mode               | What runs without asking                                                                                                                                      | Sandbox                      | Classifier | Use it when                                                                 |
12	| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------- | :--------- | :-------------------------------------------------------------------------- |
13	| **Auto-review**    | Allowlisted calls run immediately. Other shell commands run in the sandbox when possible. Calls that do not use the sandbox go to the Auto-review classifier. | Yes, for shell commands      | Yes        | You want fewer prompts with a safety review before higher-risk calls run.   |
14	| **Allowlist**      | Actions in your allowlist run without approval. With sandboxing enabled, supported shell commands can run in the sandbox.                                     | Optional, for shell commands | No         | You want deterministic behavior with a small set of trusted repeat actions. |
15	| **Run Everything** | Every tool call runs automatically.                                                                                                                           | No                           | No         | You accept the risk and want zero prompts.                                  |
16	
17	## How Auto-review works
18	
19	Auto-review applies to shell, MCP, and Fetch tool calls. Cursor checks each call in this order:
20	
21	![The execution lifecycle of agent actions on Auto-review mode. Allowlisted calls run immediately, other shell commands run in the sandbox when possible, and anything else goes to the classifier, which can allow the call, ask the agent to take a different approach, or ask you to approve.](https://ptht05hbb1ssoooe.public.blob.vercel-storage.com/assets/uploads/kreview-auto-review-light.svg)
22	
23	A shell command "can run in the sandbox" when it works under the sandbox's file and network limits. Commands that need full system access, like writes outside the workspace or privileged operations, can't be sandboxed, so they go to the classifier instead.
24	
25	Sandboxing is a layer on top of Run Modes for shell commands. It controls where a supported terminal command runs, not whether the mode uses the Auto-review classifier.
26	
27	When the classifier blocks a call, Cursor can try another approach. If the agent decides that the action makes sense despite what the classifier said, Cursor will show you an approval prompt.
28	
29	### Auto-review is not a security boundary
30	
31	The classifier can make mistakes. It can allow a call you would have blocked, or block a call you would have allowed.
32	
33	### Auto-review classifier requirements
34	
35	Auto-review's classifier runs on a small Cursor-managed model. Today that is [Claude 4.5 Haiku](https://cursor.com/docs/models/claude-4-5-haiku.md) or [GPT-5.4 Mini](https://cursor.com/docs/models/gpt-5-4-mini.md).
36	
37	Enterprise [model access controls](https://cursor.com/docs/enterprise/model-and-integration-management.md#model-access-control) apply. Auto-review is available when at least one of those models is allowed for the team. Blocking all of them disables Auto-review in **Settings > Agents > Approvals & Execution**, even when team Run Modes includes it. Members then use Allowlist instead.
38	
39	If Auto-review is grayed out, enable those models in [Team Settings → Models](https://cursor.com/dashboard/team-settings/models), fully quit and reopen Cursor, then check Approvals & Execution again.
40	
41	### Configuring Auto-review
42	
43	Configuration is not required for Auto-review to work well. If there are specific actions you always want to review manually, describe them in plain English.
44	
45	The easiest way to set this up is to ask the Cursor agent to do it. Tell it something like "I want every AWS CLI command to go through approval first," and it edits your `permissions.json` for you.
46	
47	You can also edit the file yourself. Auto-review reads `permissions.json` from two locations:
48	
49	| Location                                 | Scope                                                                                        |
50	| :--------------------------------------- | :------------------------------------------------------------------------------------------- |
51	| `~/.cursor/permissions.json`             | Applies to all project directories on your machine.                                          |
52	| `<project-dir>/.cursor/permissions.json` | Applies to one project directory. Commit it when the project should share the same guidance. |
53	
54	If both files exist, Cursor merges them. Your personal instructions and the project instructions both apply.
55	
56	Teams can also define a global Auto-review configuration in the dashboard. When a team configuration is defined, it takes priority and Cursor ignores the user-level and project-level files.
57	
58	Both local files use the same schema. Each instruction is a plain-English sentence, so a request like "I want every AWS CLI command to go through approval first" maps straight onto `block_instructions`:
59	
60	```json
61	{
62	  "autoRun": {
63	    "allow_instructions": [],
64	    "block_instructions": [
65	      "Every AWS CLI command should go through approval first.",
66	      "Every command that modifies Kubernetes resources should go through approval first."
67	    ]
68	  }
69	}
70	```
71	
72	- `allow_instructions` describe actions Auto-review should lean toward allowing.
73	- `block_instructions` describe actions Auto-review should lean toward blocking so the agent can choose another path or ask you to approve.
74	
75	For more on policy design, read [Governing agent autonomy with Auto-review](https://cursor.com/blog/agent-autonomy-auto-review).
76	
77	## Sandboxing
78	
79	Sandboxing lets Cursor run terminal commands without giving them full machine access. A sandboxed command can work in your project, but it cannot freely read protected files, write outside approved paths, or contact arbitrary network destinations.
80	
81	For the engineering deep dive, read [Implementing a secure sandbox for local agents](https://cursor.com/blog/agent-sandboxing).
82	
83	### permissions.json and sandbox.json do different jobs
84	
85	`permissions.json` steers which calls Auto-review runs automatically and which it reviews. `sandbox.json` controls what a sandboxed command can reach, like network domains and extra readable or writable paths. You don't need either file to get started.
86	
87	| Access              | Default sandbox behavior for terminal commands                                                                           |
88	| :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
89	| **Workspace files** | Read and write access inside the workspace. `.cursorignore` can hide files from the agent.                               |
90	| **Protected paths** | Cursor protects paths like `.git/config`, `.git/hooks`, `.vscode`, `.cursorignore`, and sensitive Cursor config files.   |
91	| **Network**         | Blocked by default, then opened by your network mode and [`sandbox.json`](https://cursor.com/docs/reference/sandbox.md). |
92	| **Temporary files** | `/tmp` and platform temp directories are writable unless disabled in `sandbox.json`.                                     |
93	
94	Some commands need full system access and bypass the sandbox. Cursor will indicate when a command runs outside the sandbox and ask for your approval.
95	
96	### Sandbox configuration
97	
98	Customize sandbox behavior with a `sandbox.json` file:
99	
100	| Location                             | Scope                                                                                             |
101	| :----------------------------------- | :------------------------------------------------------------------------------------------------ |
102	| `~/.cursor/sandbox.json`             | Applies to all project directories on your machine.                                               |
103	| `<project-dir>/.cursor/sandbox.json` | Applies to one project directory. Commit it when the project should share the same sandbox rules. |
104	
105	If both files exist, Cursor merges them with the project-level file taking priority. Team-admin policies and Cursor's hardcoded security rules layer on top, so local files cannot weaken those protections.
106	
107	Use `sandbox.json` to control network policy, extra readable or writable paths, temporary directory writes, and shared build caches. See the [`sandbox.json` reference](https://cursor.com/docs/reference/sandbox.md) for the full schema.
108	
109	### How sandboxing works on your platform
110	
111	### macOS
112	
113	Cursor uses Seatbelt through `sandbox-exec`. A generated sandbox profile limits file access, network access, and other process behavior for the full subprocess tree.
114	
115	**Requirements**
116	
117	- Cursor v2.0 or later
118	- No extra setup needed
119	
120	### Linux
121	
122	Cursor uses Landlock and seccomp. Landlock applies filesystem restrictions. Seccomp blocks unsafe syscalls.
123	
124	**Requirements**
125	
126	- **Kernel 6.2 or later** with Landlock v3 support (`CONFIG_SECURITY_LANDLOCK=y`)
127	- **Unprivileged user namespaces** enabled
128	
129	If your kernel does not meet these requirements, Cursor falls back to asking for approval before running commands.
130	
131	### AppArmor setup (remote environments and CLI only)
132	
133	Local desktop installations need no setup. The Cursor desktop package ships with the required AppArmor profile.
134	
135	Some distributions restrict user namespaces through AppArmor, and remote environments and the standalone [CLI](https://cursor.com/docs/cli/overview.md) do not ship the profile. If sandbox creation fails there with a user-namespace permissions error, install the AppArmor package for your distribution.
136	
137	Debian / Ubuntu:
138	
139	```bash
140	curl -fsSL https://downloads.cursor.com/lab/enterprise/cursor-sandbox-apparmor_0.6.0_all.deb -o cursor-sandbox-apparmor.deb
141	sudo dpkg -i cursor-sandbox-apparmor.deb
142	```
143	
144	RHEL / Fedora:
145	
146	```bash
147	curl -fsSL https://downloads.cursor.com/lab/enterprise/cursor-sandbox-apparmor-0.6.0-1.noarch.rpm -o cursor-sandbox-apparmor.rpm
148	sudo rpm -i cursor-sandbox-apparmor.rpm
149	```
150	
151	After installing, restart Cursor or your CLI session for the sandbox to work.
152	
153	### Environment variables
154	
155	Cursor injects environment variables into every sandboxed child process. These are available to your scripts, build tools, and automation running inside the sandbox.
156	
157	| Variable                         | Platforms    | Description                                                                                                                  |
158	| :------------------------------- | :----------- | :--------------------------------------------------------------------------------------------------------------------------- |
159	| `CURSOR_SANDBOX`                 | macOS, Linux | Set to `"seatbelt"` (macOS) or `"native"` (Linux) when the process is running inside the sandbox.                            |
160	| `CURSOR_ORIG_UID`                | macOS, Linux | The UID of the user who launched Cursor, captured before the sandbox applies any namespace or identity changes.              |
161	| `CURSOR_ORIG_GID`                | macOS, Linux | The GID of the user who launched Cursor, captured before sandbox identity changes.                                           |
162	| `CURSOR_SANDBOX_LANDLOCK_STATUS` | Linux        | Reports the active sandbox backend: `fully_enforced` (Landlock), `bubblewrap` (Bubblewrap fallback). Useful for diagnostics. |
163	
164	### Linux: UID inside the sandbox may not match your real user
165	
166	On Linux, the sandbox creates a user namespace and remaps the process to UID 0
167	(root) inside that namespace. This means `id -u` and `$UID` inside a sandboxed
168	command return 0, not your host user ID. If your scripts or automation need
169	the host user ID, for example, to set file ownership or pass `--user` to
170	Docker, read `CURSOR_ORIG_UID` and `CURSOR_ORIG_GID` instead.
171	
172	#### Docker and container automation
173	
174	A common pattern in automation rules and scripts is running Docker containers that need to match the host user's identity. Because the sandbox remaps the UID on Linux, relying on `$(id -u)` produces the wrong value. Use the `CURSOR_ORIG_*` variables instead:
175	
176	```bash
177	docker run --rm \
178	  --user "${CURSOR_ORIG_UID:-$(id -u)}:${CURSOR_ORIG_GID:-$(id -g)}" \
179	  -v "$PWD:/work" -w /work \
180	  my-image build
181	```
182	
183	The `${CURSOR_ORIG_UID:-$(id -u)}` fallback ensures the command also works outside the sandbox, where the variables are not set.
184	
185	### Network access
186	
187	Choose how sandboxed terminal commands access the network:
188	
189	| Mode                        | Behavior                                                                                                            |
190	| :-------------------------- | :------------------------------------------------------------------------------------------------------------------ |
191	| **sandbox.json Only**       | Network is limited to domains in your `sandbox.json` allowlist. Cursor defaults are not added.                      |
192	| **sandbox.json + Defaults** | Your allowlist plus Cursor's built-in defaults for common package managers and language tools. This is the default. |
193	| **Allow All**               | All network access is allowed in the sandbox, regardless of `sandbox.json`.                                         |
194	
195	### View default allowed domains
196	
197	```text
198	*.cloudflarestorage.com
199	*.docker.com
200	*.docker.io
201	*.googleapis.com
202	*.githubusercontent.com
203	*.gvt1.com
204	*.public.blob.vercel-storage.com
205	*.yarnpkg.com
206	alpinelinux.org
207	anaconda.com
208	apache.org
209	apt.llvm.org
210	archive.ubuntu.com
211	archlinux.org
212	awscli.amazonaws.com
213	azure.com
214	binaries.prisma.sh
215	bitbucket.org
216	centos.org
217	cloudflarestorage.com
218	cocoapods.org
219	codeload.github.com
220	cpan.org
221	crates.io
222	debian.org
223	dl.google.com
224	docker.com
225	docker.io
226	dot.net
227	dotnet.microsoft.com
228	eclipse.org
229	fedoraproject.org
230	files.pythonhosted.org
231	fonts.gstatic.com
232	gcr.io
233	ghcr.io
234	github.com
235	gitlab.com
236	golang.org
237	google.com
238	goproxy.io
239	gradle.org
240	haskell.org
241	hashicorp.com
242	hex.pm
243	index.crates.io
244	java.com
245	java.net
246	json-schema.org
247	json.schemastore.org
248	k8s.io
249	launchpad.net
250	maven.org
251	mcr.microsoft.com
252	metacpan.org
253	microsoft.com
254	mise.run
255	nodejs.org
256	npm.duckdb.org
257	npmjs.com
258	npmjs.org
259	nuget.org
260	oracle.com
261	packagecloud.io
262	packages.microsoft.com
263	packagist.org
264	pkg.go.dev
265	playwright.azureedge.net
266	ppa.launchpad.net
267	proxy.golang.org
268	pub.dev
269	public.blob.vercel-storage.com
270	public.ecr.aws
271	pypa.io
272	pypi.org
273	pypi.python.org
274	pythonhosted.org
275	quay.io
276	registry.npmjs.org
277	registry.yarnpkg.com
278	repo.maven.apache.org
279	ruby-lang.org
280	rubygems.org
281	rubyonrails.org
282	rustup.rs
283	rvm.io
284	security.ubuntu.com
285	sh.rustup.rs
286	sourceforge.net
287	spring.io
288	static.crates.io
289	static.rust-lang.org
290	sum.golang.org
291	swift.org
292	ubuntu.com
293	visualstudio.com
294	yarnpkg.com
295	ziglang.org
296	```
297	
298	## Other protections
299	
300	Run Modes and sandboxing are not the only safety controls. These protections can require approval even when a mode would otherwise run automatically:
301	
302	| Protection                   | What it does                                                                                       |
303	| :--------------------------- | :------------------------------------------------------------------------------------------------- |
304	| **Browser Protection**       | Prevents the agent from automatically running Browser tools.                                       |
305	| **File-Deletion Protection** | Prevents the agent from automatically deleting files, including `rm` commands.                     |
306	| **External-File Protection** | Prevents the agent from automatically creating, modifying or deleting files outside the workspace. |
307	
308	## Team controls
309	
310	Admins can override which modes are available for their users, as well as configure the sandbox networking rules for terminal commands, and more. All of these settings are available in the web dashboard.
311	
312	Team settings take precedence over individual and project configuration. Use them when you want a consistent baseline for everyone. If you enable Auto-review for the team, keep one of the [models the classifier needs](https://cursor.com/docs/agent/security/run-modes.md#auto-review-model-requirements) allowed under [model access control](https://cursor.com/docs/enterprise/model-and-integration-management.md#model-access-control).
313	
314	## Changelog
315	
316	| Cursor version | Date         | Change                                                                                                                                                                                                    |
317	| :------------- | :----------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
318	| **3.6**        | May 29, 2026 | [Auto-review](/changelog/auto-review) shipped as the recommended default.                                                                                                                                 |
319	| **3.5**        | May 22, 2026 | **Ask Every Time** was deprecated. New users cannot choose it. Use **Allowlist** with an empty allowlist for the same behavior. **Run in Sandbox** was folded into **Allowlist** with sandboxing enabled. |
320	
321	### Cloud Agents do not use Run Modes
322	
323	Run Modes apply to local agents. Cloud Agents run inside their own dedicated machine, so the agent never asks you to approve an action.
324	
325	
326	---
327	
328	## Sitemap
329	
330	[Overview of all docs pages](/llms.txt)
331	

---

[FETCH RESULT]
1	# Agent Review
2	
3	Agent Review runs a dedicated code review on your local changes from inside Cursor.
4	
5	## Setup
6	
7	To configure Agent Review:
8	
9	1. Open **Cursor Settings**
10	2. Go to **Agents**
11	3. Find **Agent Review** and configure your preferences
12	
13	Starting in Cursor 3.11, this setting moves to **Git & PRs** > **Pull Requests**.
14	
15	Agent Review also reads repository rules from `BUGBOT.md` files. To set up these rule files, see [BugBot docs](https://cursor.com/docs/bugbot.md).
16	
17	You can set it to run automatically after every agent task, or leave it manual and trigger it yourself.
18	
19	## Running a review
20	
21	There are three ways to start a review:
22	
23	- **Automatic**: When enabled in settings, Agent Review runs after every commit is made.
24	- **Slash command**: Type `/agent-review` in the agent window input to trigger a review on demand.
25	- **Source Control tab**: Open the Source Control tab and run Agent Review to compare all local changes against your main branch. This catches issues across your full set of changes, not only the latest edit.
26	
27	[Media](https://ptht05hbb1ssoooe.public.blob.vercel-storage.com/assets/changelog/changelog-2-1-1.mp4)
28	
29	## Review depth
30	
31	Agent Review supports two depth levels. Choose based on the thoroughness of review you need.
32	
33	| Depth     | Speed | Cost | Best for                                                   |
34	| :-------- | :---- | :--- | :--------------------------------------------------------- |
35	| **Quick** | Fast  | Low  | Small diffs, formatting changes, or a fast sanity check    |
36	| **Deep**  | Slow  | High | Complex logic, security-sensitive code, or large refactors |
37	
38	
39	---
40	
41	## Sitemap
42	
43	[Overview of all docs pages](/llms.txt)
44	

---

[FETCH RESULT]
1	# Agents Window
2	
3	The Agents Window is Cursor's agent-first interface. It provides a unified workspace to build with agents across repos and environments, including local, cloud, remote SSH, and more. It combines the power of parallel agents with the depth and control of a development environment.
4	
5	You can switch back to the editor anytime, or have both open simultaneously.
6	
7	## Open the Agents Window
8	
9	If you're in the editor, type Cmd+Shift+P → Open Agents Window to open the Agents Window.
10	
11	![Command Palette showing the Open Agents Window command](/docs-static/images/agent/open-agents-window-final.png)
12	
13	## Switch Back to the IDE
14	
15	To return to the classic Cursor IDE, type Cmd+Shift+P → Open IDE. This opens the current workspace in the editor.
16	
17	![Actions menu showing the Open IDE command](/docs-static/images/agent/open-editor-window-final.png)
18	
19	If you want to view or edit files without leaving the Agents Window, you can type Cmd+P to search files, or Cmd+Shift+F to search all files.
20	
21	![Agents Window showing file search and file viewing](/docs-static/images/agent/file-agents-window-final.png)
22	
23	## Features Available Only in the Agents Window
24	
25	The following features are available in the Agents Window:
26	
27	- **Multi-workspace:** work with agents across all your projects from one place.
28	- **New diffs view:** review and commit changes, and manage PRs without leaving Cursor.
29	- **Parallel agents:** run many parallel agents in the cloud (and work with them from your phone, web, Slack, GitHub, and Linear).
30	- **Easier handoff between local and cloud:** quickly move an agent from cloud to local to iterate quickly, and move it back to the cloud so it keeps working on its own.
31	- **Cloud subagents:** hand off a task to a [cloud subagent](https://cursor.com/docs/subagents.md#cloud-subagents) with `/in-cloud`, or put a PR on `/autopilot`, so long-running work runs on its own VM and branch while you keep working locally.
32	- **Worktrees:** [run agents in isolated Git checkouts](https://cursor.com/docs/configuration/worktrees.md) so each task has its own files and changes.
33	
34	## Choosing Between Agents Window and Editor
35	
36	The Agents Window works well when you want to run and manage many agents in parallel. If you are using agents to write most of your code, the Agents Window helps pull you up to a higher level of abstraction.
37	
38	The editor works well when you want the classic IDE with VS Code extensions and flexible screen splitting to see many files at once.
39	
40	You can move between the two interfaces, and we will continue to support and improve both experiences.
41	
42	## Enterprise access
43	
44	Agents Window is generally available with Cursor 3, released on April 2, 2026. For the two weeks following launch, Enterprise Admins can control rollout within their organizations by giving access to their entire team or to specific users via Team settings. After the rollout period, all users will have access by default.
45	
46	
47	---
48	
49	## Sitemap
50	
51	[Overview of all docs pages](/llms.txt)
52	

---

[FETCH RESULT]
1	# Plan Mode
2	
3	Plan Mode creates detailed implementation plans before writing any code. Agent researches your codebase, asks clarifying questions, and generates a reviewable plan you can edit before building.
4	
5	Press Shift+Tab from the chat input to rotate to Plan Mode. Cursor also suggests it automatically when you type keywords that indicate complex tasks.
6	
7	## How it works
8	
9	1. Agent asks clarifying questions to understand your requirements
10	2. Researches your codebase to gather relevant context
11	3. Creates a comprehensive implementation plan
12	4. You review and edit the plan through chat or markdown files
13	5. Click to build the plan when ready
14	
15	Plans are saved by default in your home directory. Click "Save to workspace" to move it to your workspace for future reference, team sharing, and documentation.
16	
17	## When to use Plan Mode
18	
19	Plan Mode works best for:
20	
21	- Complex features with multiple valid approaches
22	- Tasks that touch many files or systems
23	- Unclear requirements where you need to explore before understanding scope
24	- Architectural decisions where you want to review the approach first
25	
26	For quick changes or tasks you've done many times before, jumping straight to Agent mode is fine.
27	
28	## Starting over from a plan
29	
30	Sometimes Agent builds something that doesn't match what you wanted. Instead of trying to fix it through follow-up prompts, go back to the plan.
31	
32	Revert the changes, refine the plan to be more specific about what you need, and run it again. This is often faster than fixing an in-progress agent, and produces cleaner results.
33	
34	For larger changes, spend extra time creating a precise, well-scoped plan. The hard part is often figuring out **what** change should be made. With the right instructions, delegate implementation to Agent.
35	
36	## Switching modes
37	
38	- Use the mode picker dropdown in Agent
39	- Press Shift+Tab for quick switching
40	
41	## Related
42	
43	- [Plan mode help](https://cursor.com/help/ai-features/plan-mode.md)
44	
45	
46	---
47	
48	## Sitemap
49	
50	[Overview of all docs pages](/llms.txt)
51	

---

[FETCH RESULT]
1	# Debug Mode
2	
3	Debug Mode helps you find root causes and fix tricky bugs that are hard to reproduce or understand. Instead of immediately writing code, the agent generates hypotheses, adds log statements, and uses runtime information to pinpoint the exact issue before making a targeted fix.
4	
5	## When to use Debug Mode
6	
7	Debug Mode works best for:
8	
9	- **Bugs you can reproduce but can't figure out**: When you know something is wrong but the cause isn't obvious from reading the code
10	- **Race conditions and timing issues**: Problems that depend on execution order or async behavior
11	- **Performance problems and memory leaks**: Issues that require runtime profiling to understand
12	- **Regressions where something used to work**: When you need to trace what changed
13	
14	When standard Agent interactions struggle with a bug, Debug Mode provides a different approach using runtime evidence rather than guessing at fixes.
15	
16	## How it works
17	
18	1. **Explore and hypothesize**: The agent explores relevant files, builds context, and generates multiple hypotheses about potential root causes.
19	
20	2. **Add instrumentation**: The agent adds log statements that send data to a local debug server running in a Cursor extension.
21	
22	3. **Reproduce the bug**: Debug Mode asks you to reproduce the bug and provides specific steps. This keeps you in the loop and ensures the agent captures real runtime behavior.
23	
24	4. **Analyze logs**: After reproduction, the agent reviews the collected logs to identify the actual root cause based on runtime evidence.
25	
26	5. **Make targeted fix**: The agent makes a focused fix that directly addresses the root cause, often just a few lines of code.
27	
28	6. **Verify and clean up**: You can re-run the reproduction steps to verify the fix. Once confirmed, the agent removes all instrumentation.
29	
30	## Tips for Debug Mode
31	
32	- **Provide detailed context**: The more you describe the bug and how to reproduce it, the better the agent's instrumentation will be. Include error messages, stack traces, and specific steps.
33	- **Follow reproduction steps exactly**: Execute the steps the agent provides to ensure logs capture the actual issue.
34	- **Reproduce multiple times if needed**: Reproducing the bug multiple times may help the agent identify tricky problems like race conditions.
35	- **Be specific about expected vs. actual behavior**: Help the agent understand what should happen versus what is happening.
36	
37	## Switching modes
38	
39	- Use the mode picker dropdown in Agent
40	- Press Shift+Tab for quick switching
41	
42	## Related
43	
44	- [Debug mode help](https://cursor.com/help/ai-features/debug-mode.md)
45	
46	
47	---
48	
49	## Sitemap
50	
51	[Overview of all docs pages](/llms.txt)
52	

---

[FETCH RESULT]
1	# Design Mode
2	
3	Design Mode lets you direct agents with visual prompts. From the browser in the [Agents Window](https://cursor.com/docs/agent/agents-window.md), you can click an element, draw on the page, or describe a change by voice. Cursor captures the context it needs and edits the code while you move on to the next change.
4	
5	UI work tends to be spatial. Instead of describing a change in a sentence, your instruction can include the selected element, the code behind it, the surrounding layout, and the visual relationships on the page. This tightens the loop between noticing something and fixing it.
6	
7	Click an element in the running app, prompt against that selected element, and let the agent edit the code.
8	
9	## Open Design Mode
10	
11	Design Mode lives in the browser inside the Agents Window. Open the browser, then toggle Design Mode with Cmd + Shift + D. Toggle it off with the same shortcut to return to normal browsing.
12	
13	## Ways to direct the agent
14	
15	Design Mode gives you several ways to convey intent.
16	
17	### Select an element
18	
19	Click any element in the running product to target it. The agent gets the element and its code, so you can prompt against the exact thing you see without leaving the app.
20	
21	### Select multiple elements
22	
23	Multi-select helps when the change depends on a relationship between elements. Reference two components and ask the agent to make one match the other, remove repeated content, or adjust a group together.
24	
25	Select multiple elements and describe how they should change together.
26	
27	### Draw on the page
28	
29	Drawing tells the agent which area of the page your instruction applies to. Circle a crowded section, box in a region, or mark part of an animated page. The annotation sits over a frozen frame of the viewport, so the agent sees the exact page state you were responding to.
30	
31	### Narrate by voice
32	
33	You can narrate instructions with your voice instead of typing. The mic stays available while agents run, so you can queue the next change without waiting.
34	
35	Use voice input and drawing together to describe a change.
36	
37	## Keyboard shortcuts
38	
39	| Action               | Shortcut        |
40	| :------------------- | :-------------- |
41	| Toggle Design Mode   | Cmd + Shift + D |
42	| Select an area       | Shift + drag    |
43	| Add element to chat  | Cmd + L         |
44	| Add element to input | Option + click  |
45	
46	## What the agent sees
47	
48	Picking an element adds two complementary signals to context:
49	
50	- **Element identity**: the xpath, the component, attributes, computed styles, and props from the fiber tree. This helps the agent find the source and edit the right code.
51	- **A screenshot**: the layout, surrounding elements, and the exact page state. This gives the agent spatial context for the change.
52	
53	## Work in flow
54	
55	When you refine an interface, one edit usually leads to the next. You adjust a component, notice the spacing around it, then see how another component should match.
56	
57	Design Mode lets you send those edits away as you notice them. Point at one element, describe the change, move to another part of the page, and send another edit before the first one finishes. This makes it easy to multitask and manage several subagents at once. As agents finish, the app hot reloads and your changes appear in the running product.
58	
59	This flow works best with a fast model that is strong at interface work. We recommend [Composer 2.5](/blog/composer-2-5).
60	
61	## Related
62	
63	- [Agents Window](https://cursor.com/docs/agent/agents-window.md)
64	- [Browser](https://cursor.com/docs/agent/tools/browser.md)
65	
66	
67	---
68	
69	## Sitemap
70	
71	[Overview of all docs pages](/llms.txt)
72	

---

[FETCH RESULT]
1	# Canvases
2	
3	Canvases let Cursor create interactive artifacts that render next to the chat. Instead of scrolling through a long markdown table or code block, you get a standalone view, laid out with sections, stats, and tables, that you can reopen, edit, and iterate on.
4	
5	Ask agents for a dashboard, analysis, audit, or report, and Cursor opens the result in a canvas when that is a better fit.
6	
7	## How it works
8	
9	1. Cursor decides that your task benefits from a visual or interactive view, or you ask for one directly.
10	2. Cursor builds the canvas and inserts a reference to it in your chat.
11	3. You review the rendered view, switch to the source to tweak it, or ask Cursor to change it.
12	4. Cursor saves the canvas so you can reopen and rerun it later with fresh data.
13	
14	Each canvas appears in your workspace's canvas list, so you can jump back to past ones without rerunning them.
15	
16	## Opening a canvas
17	
18	- **From Cursor**: when Cursor creates a canvas, a card appears at the end of the response. Click it to open.
19	- **Command Palette**: run **Open Canvas** from the palette, listed under View.
20	- **Agents Window**: open a canvas tab directly from the new tab menu in the [Agents Window](https://cursor.com/docs/agent/agents-window.md).
21	
22	## Sharing canvases
23	
24	Shared canvases turn an interactive artifact into something your whole team can open, not just you. When you share a canvas, Cursor uploads a live snapshot of the view and gives you a link teammates can open in the browser — same layout, charts, and tables, without rerunning the agent or digging through chat history. Use **Publish** from the canvas toolbar to publish or refresh a share; browse everything your team has published from **Shared Canvases** on the [dashboard](https://cursor.com/dashboard).
25	
26	Shared canvases are available on paid plans (Pro, Teams, and Enterprise). Free accounts cannot create shares. Because each share is team-visible, you need to be on a team — Pro users on a team can share too. Sharing also requires a privacy mode that allows data storage (Legacy Privacy Mode blocks it).
27	
28	Team admins can turn shared canvases off for the organization from [team settings](https://cursor.com/dashboard/settings#shared-canvases) under **Shared Canvases**.
29	
30	## Iterating on a canvas
31	
32	Canvases are designed to be easy to refine.
33	
34	- If the layout isn't right, tell Cursor what to change instead of editing by hand.
35	- If the numbers look stale or off, ask Cursor to rerun the underlying query or show its work.
36	- For larger reworks, revert and prompt Cursor again with more details. This is usually faster than nudging through small follow-ups.
37	- For small tweaks, you can also manually edit the source code.
38	
39	## Packaging in skills
40	
41	Common canvas workflows can be packaged as [skills](https://cursor.com/docs/skills.md) so Cursor produces a consistent layout every time you ask.
42	
43	A canvas skill typically includes:
44	
45	- **A trigger description** so Cursor knows when to reach for it, like "quarterly revenue report" or "dependency audit".
46	- **Layout instructions** that define the sections, stats, and tables the canvas should contain.
47	- **Data sources and queries** Cursor should run to populate the view, such as a SQL query, API call, or shell command.
48	- **Formatting rules** like units, date ranges, or sort order.
49	
50	Once the skill is in place, a short prompt is enough to regenerate the canvas with fresh data, and every teammate using the skill gets the same output shape.
51	
52	## Related
53	
54	- [Agents Window](https://cursor.com/docs/agent/agents-window.md)
55	- [Skills](https://cursor.com/docs/skills.md)
56	- [Prompting](https://cursor.com/docs/agent/prompting.md)
57	
58	
59	---
60	
61	## Sitemap
62	
63	[Overview of all docs pages](/llms.txt)
64	

---

[FETCH RESULT]
1	# Terminal
2	
3	Cursor runs shell commands directly in your terminal. Your [Run Mode](https://cursor.com/docs/agent/security/run-modes.md) controls when commands run, when Cursor asks, and when terminal commands enter the sandbox.
4	
5	## Sandbox
6	
7	The sandbox runs terminal commands in a restricted environment that blocks unauthorized file access and network activity. For platform requirements, network modes, environment variables, and `sandbox.json` configuration, read [Run Modes > Sandboxing](https://cursor.com/docs/agent/security/run-modes.md#sandboxing).
8	
9	## Troubleshooting
10	
11	Some shell themes (for example, Powerlevel9k/Powerlevel10k) can interfere with
12	the inline terminal output. If your command output looks truncated or
13	misformatted, disable the theme or switch to a simpler prompt when Cursor runs.
14	
15	### Disable heavy prompts for Cursor sessions
16	
17	Use the `CURSOR_AGENT` environment variable in your shell config to detect when
18	Cursor is running and skip initializing fancy prompts/themes.
19	
20	```zsh
21	# ~/.zshrc - disable Powerlevel10k when Cursor runs
22	if [[ -n "$CURSOR_AGENT" ]]; then
23	  # Skip theme initialization for better compatibility
24	else
25	  [[ -r ~/.p10k.zsh ]] && source ~/.p10k.zsh
26	fi
27	```
28	
29	```bash
30	# ~/.bashrc - fall back to a simple prompt in Cursor sessions
31	if [[ -n "$CURSOR_AGENT" ]]; then
32	  PS1='\u@\h \W \$ '
33	fi
34	```
35	
36	## Related
37	
38	- [Terminal help](https://cursor.com/help/ai-features/terminal.md)
39	
40	
41	---
42	
43	## Sitemap
44	
45	[Overview of all docs pages](/llms.txt)
46	

---

[FETCH RESULT]
1	# Search
2	
3	## Instant Grep
4	
5	The fastest way to find code is an exact match: a function name, variable, error string, or regex pattern. Agent uses grep automatically when you reference specific symbols.
6	
7	Cursor ships with [Instant Grep](/changelog/2-1#instant-grep-beta), a custom search engine that outperforms `ripgrep` on large codebases. It runs automatically; no configuration needed.
8	
9	Instant Grep supports full regex and word-boundary matching, so Agent can construct patterns like `import.*PaymentService` or `PaymentFailedError` to trace references across files.
10	
11	## Privacy and security
12	
13	File paths are encrypted before being sent to Cursor's servers. Code content is never stored in plaintext.
14	
15	## Explore subagent
16	
17	Agent can spawn an [Explore subagent](https://cursor.com/docs/subagents.md) that runs in its own context window with a faster model. It executes many parallel searches without bloating the main conversation, returning only the relevant findings.
18	
19	Agent uses the Explore subagent automatically when it decides a task benefits from broad search. You can also request it directly: "use a subagent to find all the places we validate user input."
20	
21	This is useful for context management. Searching through many files generates a lot of context. The subagent keeps the main conversation focused by summarizing results instead of dumping raw file contents.
22	
23	## FAQ
24	
25	### Can I customize path encryption?
26	
27	Create a `.cursor/keys` file in your workspace root:
28	
29	```json
30	{
31	  "path_decryption_key": "your-custom-key-here"
32	}
33	```
34	
35	### Does Cursor support multi-root workspaces?
36	
37	Yes. Cursor supports [multi-root workspaces](https://code.visualstudio.com/docs/editor/workspaces#_multiroot-workspaces). Each workspace folder's context is available to Agent. Some features that rely on a single git root, like worktrees, are disabled for multi-root workspaces. Cloud Agents do not support multi-root workspaces.
38	
39	
40	---
41	
42	## Sitemap
43	
44	[Overview of all docs pages](/llms.txt)
45	

---

[FETCH RESULT]
1	# Ignore files
2	
3	Control which files Cursor includes in AI context by using ignore files.
4	
5	## How do I exclude files from Cursor?
6	
7	Create a `.cursorignore` file in your project root. Add patterns for files and folders you want excluded:
8	
9	```text
10	node_modules/
11	dist/
12	*.min.js
13	.env*
14	```
15	
16	Cursor already ignores `.env` files, `.git/`, and lock files by default. See the [full default ignore list](https://cursor.com/docs/reference/ignore-file.md) for details.
17	
18	Ignored files are blocked from Agent. Terminal commands and MCP tools run outside of Cursor's file access controls, so they may still be able to read ignored files.
19	
20	## Does Cursor respect .gitignore?
21	
22	Yes. Cursor automatically respects your `.gitignore` patterns. Files ignored by git are also excluded from AI context.
23	
24	`.cursorignore` is for additional exclusions beyond what `.gitignore` covers.
25	
26	## Why should I ignore files?
27	
28	- **Large generated files** are rarely useful as context
29	- **Secrets and credentials** are safer excluded from AI context
30	- **Binary files and assets** add noise without value
31	- **Third-party code** (like `node_modules`) is rarely useful as context
32	
33	## Related
34	
35	- [Ignore files reference](https://cursor.com/docs/reference/ignore-file.md)
36	
37	
38	---
39	
40	## Sitemap
41	
42	[Overview of all docs pages](/llms.txt)
43	

---

[FETCH RESULT]
1	# Keyboard shortcuts
2	
3	Cursor uses the same default shortcuts as VS Code, plus shortcuts for AI features.
4	
5	## What are the key AI shortcuts?
6	
7	| Action                     | Mac                | Windows/Linux        |
8	| -------------------------- | ------------------ | -------------------- |
9	| Toggle Sidepanel           | Cmd + I or Cmd + L | Ctrl + I or Ctrl + L |
10	| Inline edit                | Cmd + K            | Ctrl + K             |
11	| Mode Menu                  | Cmd + .            | Ctrl + .             |
12	| Rotate between Agent modes | Shift + Tab        | Shift + Tab          |
13	| Loop between AI models     | Cmd + /            | Ctrl + /             |
14	| Accept Tab suggestion      | Tab                | Tab                  |
15	
16	## How do I customize shortcuts?
17	
18	1. Open keyboard shortcuts:
19	   - **Mac**: Press Cmd + R then Cmd + S
20	   - **Windows/Linux**: Press Ctrl + R then Ctrl + S
21	2. Search for the command you want to remap
22	3. Click the pencil icon next to it
23	4. Press your preferred key combination
24	5. Press Return to save
25	
26	## Related
27	
28	- [Keyboard shortcuts reference](https://cursor.com/docs/reference/keyboard-shortcuts.md)
29	
30	
31	---
32	
33	## Sitemap
34	
35	[Overview of all docs pages](/llms.txt)
36	

---

[FETCH RESULT]
1	# Side chats
2	
3	Side chats are durable child conversations attached to a parent agent. They use the parent thread as reference context while keeping their own visible transcript.
4	
5	## What is a side chat and how does it differ from the main agent conversation?
6	
7	A side chat is a full agent conversation that runs next to your main chat. The parent's conversation history is copied in as reference context for the model. That history does not appear in the side-chat transcript.
8	
9	By default, side chats focus on reading, searching, and answering, so the main agent keeps working uninterrupted. A regular conversation stands on its own. A side chat stays attached to its parent and workspace, so you can explore a side question or dig into a selection without crowding the main thread.
10	
11	## How do I open a side chat?
12	
13	You can open a side chat in these ways:
14	
15	1. Type `/side` in the chat input to open an empty side chat. You can also append your question after the command to open the side chat and send the prompt right away.
16	2. Select text or a diff in the chat, then choose **Ask in Side Chat** from the selection menu
17	3. Use a shortcut to populate a side chat with the current transcript selection:
18	
19	- **Mac:** Shift+Cmd+S
20	- **Windows/Linux:** Shift+Ctrl+S
21	
22	The new side chat starts with context from the main conversation.
23	
24	## How do I bring side chat context back into the main conversation?
25	
26	@-mention the side chat in the main thread. Cursor pulls that side chat's context into the main conversation so you can keep building on what you found.
27	
28	## Does the parent conversation appear inside the side chat?
29	
30	The parent history is available to the model as hidden reference context. It is not rendered in the side-chat transcript. Only your side-chat prompt and any follow-ups show up in the side chat.
31	
32	## Can I send follow-up messages in a side chat after the first reply?
33	
34	Yes. A side chat is a full durable conversation. Follow-up messages stay in the side chat and do not appear in the parent transcript.
35	
36	## How do I close or archive a side chat?
37	
38	Click the **X** (close) button on a side chat to archive it. Closing archives the side-chat agent; it does not delete the conversation. The durable thread stays usable until you archive it by closing it.
39	
40	## Is a side chat the same thing as forking a conversation?
41	
42	No. Forking copies the parent conversation into a new chat. What gets copied depends on where you fork from. Forking the whole chat, from the tab menu, sidebar, or command palette, copies every message and subagent. Forking from a specific message copies the conversation through that message and drops everything after it, including subagents attached to later messages. A side chat only seeds the model with the parent history as hidden context. It does not reproduce the parent transcript. A side chat is a parallel thread, not a fork.
43	
44	## Can I create a side chat inside another side chat?
45	
46	No. Nesting is not supported. A side chat cannot spawn its own side chats. Start new side chats from the parent conversation instead.
47	
48	## Do side chats work with Cloud Agents?
49	
50	Side chats are local-only for now. They are not currently available for Cloud Agents, but support for this is coming soon. For cloud workflows, see [Cloud Agents](https://cursor.com/help/ai-features/cloud-agents.md).
51	
52	## What happens to a side chat if I start a new parent conversation?
53	
54	A side chat is scoped to its parent agent. If you navigate away or start a new conversation, the side chat stays attached to the original parent. It persists until you archive it.
55	
56	## Related
57	
58	- [Agent mode](https://cursor.com/help/ai-features/agent.md)
59	- [Conversation search](https://cursor.com/help/ai-features/conversation-search.md)
60	- [What is multi-agent coding?](https://cursor.com/help/ai-features/multi-agent.md)
61	- [Cloud Agents](https://cursor.com/help/ai-features/cloud-agents.md)
62	- [Subagents reference](https://cursor.com/docs/subagents.md)
63	- [Agents Window](https://cursor.com/docs/agent/agents-window.md)
64	
65	
66	---
67	
68	## Sitemap
69	
70	[Overview of all docs pages](/llms.txt)
71	

---

[FETCH RESULT]
1	# What is multi-agent coding?
2	
3	Multi-agent coding is running more than one AI agent at the same time, each working on a different task or a different slice of the same task. As models run longer and take on more, you move from guiding one agent to coordinating several.
4	
5	## How do I run multiple agents in Cursor?
6	
7	Use the [Agents Window](https://cursor.com/docs/agent/agents-window.md), Cursor's agent-first workspace for running and managing many agents across repositories and environments. You can launch parallel agents in the cloud, work with them from the web, mobile, Slack, GitHub, and Linear, and move a task between local and cloud with a click.
8	
9	## What are subagents?
10	
11	Subagents are agents that a main agent spawns to handle part of a task. Each runs in its own context window and returns a result to the main conversation, so work happens in parallel without crowding one context. Cursor includes built-in subagents for research, shell, and browser work, and you can define your own. See the [subagents reference](https://cursor.com/docs/subagents.md).
12	
13	## How do I multitask with agents?
14	
15	Type `/multitask` to have Cursor run async subagents in parallel instead of queuing your requests. From a plan, click **Build in Parallel** and Cursor runs independent steps at once while keeping dependent steps in order. This helps when tasks run long enough that waiting on each one in turn would slow you down.
16	
17	## How do I manage many agents at once?
18	
19	When a task runs for a long time, hand it to the cloud so you can close your laptop and switch context. Pull the changes back locally when you need to make edits yourself.
20	
21	Inside the Agents Window, manage every agent from the sidebar and pin the chats you return to most so they stay at the top. Some engineers pin a long-running conversation and let the agent automatically summarize its own context to keep working over a long period.
22	
23	As you switch between agents, artifacts like screenshots and demo videos help you review an agent's work and see whether the software runs, without stepping through every line of the diff to confirm the task is done.
24	
25	## Related
26	
27	- [Agents Window reference](https://cursor.com/docs/agent/agents-window.md)
28	- [Subagents reference](https://cursor.com/docs/subagents.md)
29	- [Cloud Agents](https://cursor.com/help/ai-features/cloud-agents.md)
30	- [What are background agents?](https://cursor.com/help/ai-features/background-agents.md)
31	- [Towards self-driving codebases](/blog/self-driving-codebases)
32	
33	
34	---
35	
36	## Sitemap
37	
38	[Overview of all docs pages](/llms.txt)
39	

---

[FETCH RESULT]
docs/reference/ignore-file -> 200 4302
docs/reference/keyboard-shortcuts -> 200 4801
docs/reference/sandbox -> 200 7367
docs/reference/deeplinks -> 200 5971
docs/account/pricing -> 404 389
help/models-and-usage/usage-limits -> 200 3156
help/models-and-usage/token-rate -> 200 1265
help/account-and-billing/pricing -> 200 5219
docs/bugbot -> 200 31174
docs/cloud-agent -> 200 10826
docs/cloud-agent/capabilities -> 200 17683
docs/cloud-agent/automations -> 200 16305
docs/integrations/slack -> 200 14713
docs/integrations/github -> 200 8624
help/security-and-privacy/privacy -> 200 5425
docs/security-agents -> 200 4279
docs/approval-agents -> 200 6477
docs/configuration/worktrees -> 200 7556
help/ai-features/conversation-search -> 200 1011
help/troubleshooting/tab-issues -> 200 1547
help/ai-features/terminal -> 200 1816
help/ai-features/browser -> 200 1002
help/ai-features/agent -> 200 4968
help/customization/rules -> 200 6129
help/customization/skills -> 200 5294

---

[FETCH RESULT]
1	# Keyboard Shortcuts
2	
3	Overview of keyboard shortcuts in Cursor. See all keyboard shortcuts by pressing Cmd R then Cmd S or by opening command palette Cmd Shift P and searching for `Keyboard Shortcuts`.
4	
5	Learn more about Keyboard Shortcuts in Cursor with [Key Bindings for VS Code](https://code.visualstudio.com/docs/getstarted/keybindings) as a baseline for Cursor's keybindings.
6	
7	All Cursor keybindings, including Cursor-specific features, can be remapped in Keyboard Shortcuts settings.
8	
9	## General
10	
11	| Shortcut        | Action                                  |
12	| --------------- | --------------------------------------- |
13	| Cmd I           | Toggle Sidepanel (unless bound to mode) |
14	| Cmd L           | Toggle Sidepanel (unless bound to mode) |
15	| Cmd E           | Toggle Agent layout                     |
16	| Cmd .           | Mode Menu                               |
17	| Cmd /           | Loop between AI models                  |
18	| Cmd Shift J     | Cursor settings                         |
19	| Cmd Shift Space | Toggle Voice Mode                       |
20	| Cmd ,           | General settings                        |
21	| Cmd Shift P     | Command palette                         |
22	
23	## Chat
24	
25	Shortcuts for the chat input box.
26	
27	| Shortcut                                  | Action                       |
28	| ----------------------------------------- | ---------------------------- |
29	| Return                                    | Nudge (default)              |
30	| Ctrl Return                               | Queue message                |
31	| Cmd Return when typing                    | Force send message           |
32	| Cmd Shift Backspace                       | Cancel generation            |
33	| Cmd Shift L with code selected            | Add selected code as context |
34	| Cmd V with code or log in clipboard       | Add clipboard as context     |
35	| Cmd Shift V with code or log in clipboard | Add clipboard to input box   |
36	| Cmd Return with suggested changes         | Accept all changes           |
37	| Cmd Backspace                             | Reject all changes           |
38	| Tab                                       | Cycle to next message        |
39	| Shift Tab                                 | Rotate between Agent modes   |
40	| Cmd Opt /                                 | Model toggle                 |
41	| Cmd N / Cmd R                             | New chat                     |
42	| Cmd T                                     | New chat tab                 |
43	| Cmd \[                                    | Previous chat                |
44	| Cmd ]                                     | Next chat                    |
45	| Cmd W                                     | Close chat                   |
46	| Escape                                    | Unfocus field                |
47	
48	## Inline Edit
49	
50	| Shortcut            | Action             |
51	| ------------------- | ------------------ |
52	| Cmd K               | Open               |
53	| Cmd Shift K         | Toggle input focus |
54	| Return              | Submit             |
55	| Cmd Shift Backspace | Cancel             |
56	| Opt Return          | Ask quick question |
57	
58	## Code Selection & Context
59	
60	| Shortcut                        | Action                                                   |
61	| ------------------------------- | -------------------------------------------------------- |
62	| @                               | [@-mentions](https://cursor.com/docs/agent/prompting.md) |
63	| /                               | Shortcut Commands                                        |
64	| Cmd Shift L                     | Add selection to Chat                                    |
65	| Cmd Shift K                     | Add selection to Edit                                    |
66	| Cmd L                           | Add selection to new chat                                |
67	| Cmd M                           | Toggle file reading strategies                           |
68	| Cmd →                           | Accept next word of suggestion                           |
69	| Cmd Return                      | Search codebase in chat                                  |
70	| Select code, Cmd C, Cmd V       | Add copied reference code as context                     |
71	| Select code, Cmd C, Cmd Shift V | Add copied code as text context                          |
72	
73	## Tab
74	
75	| Shortcut | Action            |
76	| -------- | ----------------- |
77	| Tab      | Accept suggestion |
78	| Cmd →    | Accept next word  |
79	
80	## Terminal
81	
82	| Shortcut   | Action                   |
83	| ---------- | ------------------------ |
84	| Cmd K      | Open terminal prompt bar |
85	| Cmd Return | Run generated command    |
86	| Escape     | Accept command           |
87	
88	## Related
89	
90	- [Keyboard shortcuts help](https://cursor.com/help/customization/keyboard-shortcuts.md)
91	
92	
93	---
94	
95	## Sitemap
96	
97	[Overview of all docs pages](/llms.txt)
98	

---

[FETCH RESULT]
1	# Ignore file
2	
3	Cursor reads your project's codebase to power its features. Control which directories and files Cursor can access using a `.cursorignore` file in your root directory.
4	
5	Cursor blocks access to files listed in `.cursorignore` from:
6	
7	- Code accessible by [Agent](https://cursor.com/docs/agent/overview.md), Tab, and Inline Edit
8	- Code accessible via [@ mention references](https://cursor.com/docs/agent/prompting.md)
9	
10	The terminal and MCP server tools used by Agent cannot block access to code
11	governed by `.cursorignore`
12	
13	## Why ignore files?
14	
15	**Security**: Restrict access to API keys, credentials, and secrets. While Cursor blocks ignored files, complete protection isn't guaranteed due to LLM unpredictability.
16	
17	**Performance**: In large codebases or monorepos, exclude irrelevant portions for more accurate file discovery.
18	
19	## Configuring `.cursorignore`
20	
21	Create a `.cursorignore` file in your root directory using `.gitignore` syntax.
22	
23	### Pattern syntax
24	
25	- `*` matches any characters except `/`
26	- `**` matches any characters including `/`
27	- `?` matches a single character
28	- `!` negates a pattern (un-ignores a previously ignored path)
29	- Lines starting with `#` are comments
30	- Trailing spaces are ignored unless escaped with `\`
31	
32	### Pattern examples
33	
34	```sh
35	config.json      # Specific file
36	dist/           # Directory
37	*.log           # File extension
38	**/logs         # Nested directories
39	!app/           # Exclude from ignore (negate)
40	```
41	
42	### Hierarchical ignore
43	
44	Enable `Cursor Settings` > `Features` > `Editor` > `Hierarchical Cursor Ignore` to search parent directories for `.cursorignore` files.
45	
46	Starting in Cursor 3.11, this setting moves to `Cursor Settings` > `Indexing` > `Ignore Files` > `Hierarchical Cursor Ignore`.
47	
48	## Global ignore files
49	
50	Set ignore patterns for all projects in user settings to exclude sensitive files without per-project configuration. The global ignore list is empty by default.
51	
52	Common patterns to add:
53	
54	- Environment files: `**/.env`, `**/.env.*`
55	- Credentials: `**/credentials.json`, `**/secrets.json`
56	- Keys: `**/*.key`, `**/*.pem`, `**/id_rsa`
57	
58	## Files ignored by default
59	
60	Cursor automatically ignores files in `.gitignore` and the default ignore list below. Override with `!` prefix in `.cursorignore`.
61	
62	### Default ignore list
63	
64	These files are ignored in addition to files in your `.gitignore` and `.cursorignore`:
65	
66	```sh
67	package-lock.json
68	pnpm-lock.yaml
69	yarn.lock
70	composer.lock
71	Gemfile.lock
72	bun.lockb
73	.env*
74	.git/
75	.svn/
76	.hg/
77	*.lock
78	*.bak
79	*.tmp
80	*.bin
81	*.exe
82	*.dll
83	*.so
84	*.lockb
85	*.qwoff
86	*.isl
87	*.csv
88	*.pdf
89	*.doc
90	*.doc
91	*.xls
92	*.xlsx
93	*.ppt
94	*.pptx
95	*.odt
96	*.ods
97	*.odp
98	*.odg
99	*.odf
100	*.sxw
101	*.sxc
102	*.sxi
103	*.sxd
104	*.sdc
105	*.jpg
106	*.jpeg
107	*.png
108	*.gif
109	*.bmp
110	*.tif
111	*.mp3
112	*.wav
113	*.wma
114	*.ogg
115	*.flac
116	*.aac
117	*.mp4
118	*.mov
119	*.wmv
120	*.flv
121	*.avi
122	*.zip
123	*.tar
124	*.gz
125	*.7z
126	*.rar
127	*.tgz
128	*.dmg
129	*.iso
130	*.cue
131	*.mdf
132	*.mds
133	*.vcd
134	*.toast
135	*.img
136	*.apk
137	*.msi
138	*.cab
139	*.tar.gz
140	*.tar.xz
141	*.tar.bz2
142	*.tar.lzma
143	*.tar.Z
144	*.tar.sz
145	*.lzma
146	*.ttf
147	*.otf
148	*.pak
149	*.woff
150	*.woff2
151	*.eot
152	*.webp
153	*.vsix
154	*.rmeta
155	*.rlib
156	*.parquet
157	*.svg
158	.egg-info/
159	.venv/
160	node_modules/
161	__pycache__/
162	.next/
163	.nuxt/
164	.cache/
165	.sass-cache/
166	.gradle/
167	.DS_Store/
168	.ipynb_checkpoints/
169	.pytest_cache/
170	.mypy_cache/
171	.tox/
172	.git/
173	.hg/
174	.svn/
175	.bzr/
176	.lock-wscript/
177	.Python/
178	.jupyter/
179	.history/
180	.yarn/
181	.yarn-cache/
182	.eslintcache/
183	.parcel-cache/
184	.cache-loader/
185	.nyc_output/
186	.node_repl_history/
187	.pnp.js/
188	.pnp/
189	```
190	
191	### Negation pattern limitations
192	
193	When using negation patterns (prefixed with `!`), you cannot re-include a file if a parent directory is excluded via \*.
194	
195	```sh
196	# Ignore all files in public folder
197	public/*
198	
199	# This works, as the file exists at the top level
200	!public/index.html
201	
202	# This doesn't work - cannot re-include files from nested directories
203	!public/assets/style.css
204	```
205	
206	**Workaround**: Explicitly exclude nested directories:
207	
208	```sh
209	public/assets/*
210	!public/assets/style.css # This file is now accessible
211	```
212	
213	Excluded directories are not traversed for performance, so patterns on contained files have no effect.
214	This matches the .gitignore implementation for negation patterns in nested directories. For more details, see the [official Git documentation on gitignore patterns](https://git-scm.com/docs/gitignore).
215	
216	## Troubleshooting
217	
218	Test patterns with `git check-ignore -v [file]`.
219	
220	
221	---
222	
223	## Sitemap
224	
225	[Overview of all docs pages](/llms.txt)
226	

---

[FETCH RESULT]
1	# Terminal integration
2	
3	Cursor's AI works inside the terminal too. Generate commands with natural language, and let Agent run terminal commands as part of larger tasks.
4	
5	## Can Agent run terminal commands on its own?
6	
7	Yes. When Agent needs to install dependencies, run tests, or check build output, it runs terminal commands automatically based on your Run Mode settings.
8	
9	Configure this in **Cursor Settings > Agents > Approvals & Execution**. In Cursor 3.6 and above, choose **Auto-review** (the default), **Allowlist**, or **Run Everything**:
10	
11	- **Auto-review**. Allowlisted commands run, the rest run in the sandbox when possible, and anything else is screened by an LLM classifier that allows or blocks based on safety and how well the command matches your request. Blocked commands can be re-tried with your approval.
12	- **Allowlist**. Only commands on your allowlist run. With sandboxing enabled, supported commands outside the allowlist can run in the sandbox.
13	- **Run Everything**. All commands run without approval. Use **Auto-review** instead if you want most calls to run without prompting.
14	
15	Before 3.5, the modes were **Run in Sandbox**, **Ask Every Time**, and **Run Everything**. **Ask Every Time** is deprecated in 3.5, and **Run in Sandbox** is now **Allowlist** with sandboxing enabled.
16	
17	## What is the Cursor CLI?
18	
19	The Cursor CLI brings Agent to your terminal as a standalone tool. It supports Agent, Plan, and Ask modes without opening the editor. Install it with:
20	
21	```bash
22	curl https://cursor.com/install -fsS | bash
23	```
24	
25	Learn more in the [CLI help article](https://cursor.com/help/integrations/cli.md) or at [cursor.com/cli](https://cursor.com/cli).
26	
27	## Related
28	
29	- [Terminal reference](https://cursor.com/docs/agent/tools/terminal.md)
30	
31	
32	---
33	
34	## Sitemap
35	
36	[Overview of all docs pages](/llms.txt)
37	

---

[FETCH RESULT]
1	# Models & Pricing
2	
3	Cursor supports frontier models from OpenAI, Anthropic, Google, SpaceXAI, and more. Pro, Pro Plus, and Ultra include two usage pools so you can pick the right balance of intelligence, speed, and cost. Start, our plan for developers in India, covers the Cursor Models pool.
4	
5	## Usage pools
6	
7	There are two separate usage pools, each resetting with your monthly billing cycle:
8	
9	- **Cursor Models**: Significantly more included usage for Cursor Grok 4.6, Grok 4.5, and Composer 2.5.
10	- **Other Models**: The pool for third-party models, charged at the model's API price. Pro, Pro Plus, and Ultra include this pool, with the option to pay for additional usage as needed. The Start plan does not include this pool.
11	
12	Both pools are visible in your editor settings and on your [usage dashboard](https://cursor.com/dashboard/usage).
13	
14	## Cursor Models
15	
16	The Cursor Models pool includes Cursor Grok 4.6, Grok 4.5, and Composer 2.5.
17	
18	On Teams and Enterprise plans, [Cursor Router](https://cursor.com/docs/cursor-router.md) picks the model for each Auto request based on your optimization mode.
19	
20	| Model                                                       | Provider | Input | Cache write | Cache read | Output | Notes                                  |
21	| ----------------------------------------------------------- | -------- | ----- | ----------- | ---------- | ------ | -------------------------------------- |
22	| Grok 4.6                                                    | Cursor   | $2    | -           | $0.5       | $6     | Jointly trained by Cursor and SpaceXAI |
23	| Grok 4.6 (Fast)                                             | Cursor   | $4    | -           | $1         | $12    | Jointly trained by Cursor and SpaceXAI |
24	| Grok 4.5                                                    | Cursor   | $2    | -           | $0.5       | $6     | Jointly trained by Cursor and SpaceXAI |
25	| Grok 4.5 (Fast)                                             | Cursor   | $4    | -           | $1         | $18    | Jointly trained by Cursor and SpaceXAI |
26	| [Composer 2.5](https://cursor.com/blog/composer-2-5)        | Cursor   | $0.5  | -           | $0.2       | $2.5   | -                                      |
27	| [Composer 2.5 (Fast)](https://cursor.com/blog/composer-2-5) | Cursor   | $3    | -           | $0.5       | $15    | -                                      |
28	
29	## Other Models
30	
31	When you select a specific third-party model, usage is drawn from the **Other Models** pool at that model's API rate.
32	
33	### Model pricing
34	
35	All prices are per million tokens:
36	
37	| Model                                                                                         | Provider  | Input | Cache write | Cache read | Output | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                         |
38	| --------------------------------------------------------------------------------------------- | --------- | ----- | ----------- | ---------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
39	| [Claude 4 Sonnet](https://www.anthropic.com/claude/sonnet)                                    | Anthropic | $3    | $3.75       | $0.3       | $15    | Hidden by default; Thinking variant counts as 2 requests in legacy pricing                                                                                                                                                                                                                                                                                                                                                                    |
40	| [Claude 4 Sonnet 1M](https://www.anthropic.com/claude/sonnet)                                 | Anthropic | $6    | $7.5        | $0.6       | $22.5  | Hidden by default; Thinking variant counts as 2 requests in legacy pricing; This model can be very expensive due to the large context window; The cost is 2x when the input exceeds 200k tokens                                                                                                                                                                                                                                               |
41	| [Claude 4.5 Haiku](https://www.anthropic.com/claude/haiku)                                    | Anthropic | $1    | $1.25       | $0.1       | $5     | Hidden by default; Bedrock/Vertex: regional endpoints +10% surcharge; Cache: writes 1.25x, reads 0.1x                                                                                                                                                                                                                                                                                                                                         |
42	| [Claude 4.5 Opus](https://www.anthropic.com/claude/opus)                                      | Anthropic | $5    | $6.25       | $0.5       | $25    | Hidden by default; Requires Max Mode on legacy request-based plans                                                                                                                                                                                                                                                                                                                                                                            |
43	| [Claude 4.5 Sonnet](https://www.anthropic.com/claude/sonnet)                                  | Anthropic | $3    | $3.75       | $0.3       | $15    | Hidden by default; Requires Max Mode on legacy request-based plans; Up to 1M tokens with extended context at the same per-token rates (no long-context surcharge)                                                                                                                                                                                                                                                                             |
44	| [Claude 4.6 Opus](https://www.anthropic.com/claude/opus)                                      | Anthropic | $5    | $6.25       | $0.5       | $25    | Hidden by default; Requires Max Mode on legacy request-based plans; Up to 1M tokens with extended context at the same per-token rates (no long-context surcharge)                                                                                                                                                                                                                                                                             |
45	| [Claude 4.6 Sonnet](https://www.anthropic.com/claude/sonnet)                                  | Anthropic | $3    | $3.75       | $0.3       | $15    | Hidden by default; Requires Max Mode on legacy request-based plans; Up to 1M tokens with extended context at the same per-token rates (no long-context surcharge)                                                                                                                                                                                                                                                                             |
46	| [Claude 4.7 Opus](https://www.anthropic.com/claude/opus)                                      | Anthropic | $5    | $6.25       | $0.5       | $25    | Hidden by default; Requires Max Mode on legacy request-based plans; Up to 1M tokens with extended context at the same per-token rates (no long-context surcharge)                                                                                                                                                                                                                                                                             |
47	| [Claude Fable 5](https://www.anthropic.com/claude)                                            | Anthropic | $10   | $12.5       | $1         | $50    | Requires data retention approval for Enterprise customers, Teams and individual customers with Privacy Mode enabled; Anthropic stores agent input and output data for harm-prevention processes; this data is not used to train or improve Anthropic models or products; Requests that trip a security guardrail are automatically routed to Claude Opus; About 2x the cost of Claude Opus 5; Requires Max Mode on legacy request-based plans |
48	| [Claude Opus 4.7 (fast mode)](https://www.anthropic.com/claude/opus)                          | Anthropic | $30   | $37.5       | $3         | $150   | Hidden by default; Requires Max Mode on legacy request-based plans; Limited research preview; Up to 1M tokens with extended context at the same per-token rates as shorter context                                                                                                                                                                                                                                                            |
49	| [Claude Opus 4.8](https://www.anthropic.com/claude/opus)                                      | Anthropic | $5    | $6.25       | $0.5       | $25    | Hidden by default; Requires Max Mode on legacy request-based plans; Fast mode (\`claude-opus-4-8-fast\`) requires Max Mode on legacy request-based plans; Fast mode is 3x lower per-token pricing than Opus 4.7 fast mode; Up to 1M tokens with extended context at the same per-token rates (no long-context surcharge)                                                                                                                      |
50	| [Claude Opus 5](https://www.anthropic.com/claude/opus)                                        | Anthropic | $5    | $6.25       | $0.5       | $25    | Requires Max Mode on legacy request-based plans; Fast mode (\`claude-opus-5-fast\`) requires Max Mode on legacy request-based plans; Up to 1M tokens with extended context at the same per-token rates (no long-context surcharge)                                                                                                                                                                                                            |
51	| [Claude Sonnet 5](https://www.anthropic.com/claude/sonnet)                                    | Anthropic | $2    | $2.5        | $0.2       | $10    | Requires Max Mode on legacy request-based plans; Up to 1M tokens with extended context at the same per-token rates (no long-context surcharge); Uses an updated tokenizer, so the same input can map to more tokens                                                                                                                                                                                                                           |
52	| [Gemini 2.5 Flash](https://developers.googleblog.com/en/start-building-with-gemini-25-flash/) | Google    | $0.3  | -           | $0.03      | $2.5   | Hidden by default                                                                                                                                                                                                                                                                                                                                                                                                                             |
53	| [Gemini 3 Flash](https://ai.google.dev/gemini-api/docs)                                       | Google    | $0.5  | -           | $0.05      | $3     | Hidden by default                                                                                                                                                                                                                                                                                                                                                                                                                             |
54	| [Gemini 3 Pro](https://ai.google.dev/gemini-api/docs)                                         | Google    | $2    | -           | $0.2       | $12    | Hidden by default                                                                                                                                                                                                                                                                                                                                                                                                                             |
55	| [Gemini 3 Pro Image Preview](https://ai.google.dev/gemini-api/docs)                           | Google    | $2    | -           | $0.2       | $12    | Hidden by default; Native image generation model optimized for speed, flexibility, and contextual understanding; Text input and output priced the same as Gemini 3 Pro; Image output: $120/1M tokens (\~$0.134 per 1K/2K image, \~$0.24 per 4K image); Preview models may change before becoming stable and have more restrictive rate limits                                                                                                 |
56	| [Gemini 3.1 Pro](https://ai.google.dev/gemini-api/docs)                                       | Google    | $2    | -           | $0.2       | $12    | -                                                                                                                                                                                                                                                                                                                                                                                                                                             |
57	| [Gemini 3.5 Flash](https://ai.google.dev/gemini-api/docs)                                     | Google    | $1.5  | -           | $0.15      | $9     | Hidden by default                                                                                                                                                                                                                                                                                                                                                                                                                             |
58	| [Gemini 3.6 Flash](https://ai.google.dev/gemini-api/docs)                                     | Google    | $1.5  | -           | $0.15      | $7.5   | Hidden by default                                                                                                                                                                                                                                                                                                                                                                                                                             |
59	| [Gemini 3.7 Flash](https://ai.google.dev/gemini-api/docs)                                     | Google    | $0.75 | -           | $0.075     | $3.5   | -                                                                                                                                                                                                                                                                                                                                                                                                                                             |
60	| [GLM 5.2](https://z.ai)                                                                       | Z.ai      | $1.4  | -           | $0.26      | $4.4   | Hidden by default                                                                                                                                                                                                                                                                                                                                                                                                                             |
61	| [GPT-5](https://openai.com/index/gpt-5/)                                                      | OpenAI    | $1.25 | -           | $0.125     | $10    | Hidden by default; Agentic and reasoning capabilities; Available reasoning effort variant is gpt-5-high                                                                                                                                                                                                                                                                                                                                       |
62	| [GPT-5 Fast](https://openai.com/index/gpt-5/)                                                 | OpenAI    | $2.5  | -           | $0.25      | $20    | Hidden by default; Faster speed but 2x price; Available reasoning effort variants are gpt-5-high-fast, gpt-5-low-fast                                                                                                                                                                                                                                                                                                                         |
63	| [GPT-5 Mini](https://openai.com/index/gpt-5/)                                                 | OpenAI    | $0.25 | -           | $0.025     | $2     | Hidden by default                                                                                                                                                                                                                                                                                                                                                                                                                             |
64	| [GPT-5-Codex](https://platform.openai.com/docs/models/gpt-5-codex)                            | OpenAI    | $1.25 | -           | $0.125     | $10    | Hidden by default; Agentic and reasoning capabilities                                                                                                                                                                                                                                                                                                                                                                                         |
65	| [GPT-5.1 Codex](https://platform.openai.com/docs/models/gpt-5-codex)                          | OpenAI    | $1.25 | -           | $0.125     | $10    | Hidden by default; Agentic and reasoning capabilities                                                                                                                                                                                                                                                                                                                                                                                         |
66	| [GPT-5.1 Codex Max](https://platform.openai.com/docs/models/gpt-5-codex)                      | OpenAI    | $1.25 | -           | $0.125     | $10    | Hidden by default                                                                                                                                                                                                                                                                                                                                                                                                                             |
67	| [GPT-5.1 Codex Mini](https://platform.openai.com/docs/models/gpt-5-codex)                     | OpenAI    | $0.25 | -           | $0.025     | $2     | Hidden by default; Agentic and reasoning capabilities; 4x rate limits compared to GPT-5.1 Codex                                                                                                                                                                                                                                                                                                                                               |
68	| [GPT-5.2](https://openai.com/index/gpt-5/)                                                    | OpenAI    | $1.75 | -           | $0.175     | $14    | Hidden by default; Agentic and reasoning capabilities; Available reasoning effort variant is gpt-5.2-high                                                                                                                                                                                                                                                                                                                                     |
69	| [GPT-5.2 Codex](https://platform.openai.com/docs/models/gpt-5-codex)                          | OpenAI    | $1.75 | -           | $0.175     | $14    | Hidden by default; Agentic and reasoning capabilities                                                                                                                                                                                                                                                                                                                                                                                         |
70	| [GPT-5.3 Codex](https://platform.openai.com/docs/models/gpt-5-codex)                          | OpenAI    | $1.75 | -           | $0.175     | $14    | Hidden by default; Requires Max Mode on legacy request-based plans; Agentic and reasoning capabilities; Available reasoning effort variant is gpt-5.3-codex-high                                                                                                                                                                                                                                                                              |
71	| [GPT-5.4](https://developers.openai.com/api/docs/models/gpt-5.4)                              | OpenAI    | $2.5  | -           | $0.25      | $15    | Hidden by default; Requires Max Mode on legacy request-based plans; Agentic and reasoning capabilities; 90% discount on cached input tokens; Fast mode is 15% faster with 2x pricing; Long context supports up to 1M tokens with 2x input pricing                                                                                                                                                                                             |
72	| [GPT-5.4 Mini](https://developers.openai.com/api/docs/models/gpt-5.4-mini)                    | OpenAI    | $0.75 | -           | $0.075     | $4.5   | Hidden by default; Smaller, faster variant of GPT-5.4; 90% discount on cached input tokens                                                                                                                                                                                                                                                                                                                                                    |
73	| [GPT-5.4 Nano](https://developers.openai.com/api/docs/models/gpt-5.4-nano)                    | OpenAI    | $0.2  | -           | $0.02      | $1.25  | Hidden by default; Smallest GPT-5.4 variant, optimized for cost; 90% discount on cached input tokens                                                                                                                                                                                                                                                                                                                                          |
74	| [GPT-5.5](https://developers.openai.com/api/docs/models/gpt-5.5)                              | OpenAI    | $5    | -           | $0.5       | $30    | Hidden by default; Requires Max Mode on legacy request-based plans; Agentic and reasoning capabilities; More token-efficient than GPT-5.4 on comparable tasks; Improved persistence on long-running tasks; Fast mode is available at higher rates; Long context supports up to 1M tokens with 2x input pricing                                                                                                                                |
75	| [GPT-5.6 Luna](https://openai.com/index/previewing-gpt-5-6-sol/)                              | OpenAI    | $0.2  | $0.25       | $0.02      | $1.2   | Smallest GPT-5.6 variant, optimized for cost and speed; Agentic and reasoning capabilities; Fast mode is available at 2x pricing; Cache writes are billed at 1.25x the uncached input rate                                                                                                                                                                                                                                                    |
76	| [GPT-5.6 Sol](https://openai.com/index/previewing-gpt-5-6-sol/)                               | OpenAI    | $4    | $5          | $0.4       | $20    | Requires Max Mode on legacy request-based plans; Agentic and reasoning capabilities; Fast mode is available at 2x pricing; Long context supports up to 1M tokens with 2x input pricing; Cache writes are billed at 1.25x the uncached input rate; Promotional pricing through November 21, 2026                                                                                                                                               |
77	| [GPT-5.6 Terra](https://openai.com/index/previewing-gpt-5-6-sol/)                             | OpenAI    | $2    | $2.5        | $0.2       | $12    | Mid-tier GPT-5.6 variant between Sol and Luna; Agentic and reasoning capabilities; Fast mode is available at 2x pricing; Cache writes are billed at 1.25x the uncached input rate                                                                                                                                                                                                                                                             |
78	| Kimi K2.7 Code                                                                                | Moonshot  | $0.95 | -           | $0.19      | $4     | Hidden by default                                                                                                                                                                                                                                                                                                                                                                                                                             |
79	| [Kimi K3](https://www.moonshot.ai)                                                            | Moonshot  | $3    | -           | $0.3       | $15    | Hidden by default; Requires Max Mode on legacy request-based plans; Up to 1M tokens with extended context at the same per-token rates (no long-context surcharge); No separate cache-write fee                                                                                                                                                                                                                                                |
80	
81	Opting in to regional data residency incurs a 10% uplift on Model pricing for eligible Models. See [Privacy and Data Governance](https://cursor.com/docs/enterprise/privacy-and-data-governance.md) for details on supported regions, Models, functions and data residency policies.
82	
83	## Plans
84	
85	Pro, Pro Plus, and Ultra include unlimited tab completions, extended agent usage limits on all models, access to Bugbot, and access to Cloud Agents. Start is a lower-priced plan for developers in India that covers the Cursor Models pool and Cloud Agents.
86	
87	| Plan                   | Price                  | Cursor Models | Other Models |
88	| :--------------------- | :--------------------- | :------------ | :----------- |
89	| **Start** (India only) | ₹649/mo, tax inclusive | Included      | Not included |
90	| **Pro**                | $20/mo                 | Included      | Included     |
91	| **Pro Plus**           | $60/mo                 | Included      | Included     |
92	| **Ultra**              | $200/mo                | Included      | Included     |
93	
94	Since different models have different API costs, your model selection affects how quickly your included usage is consumed.
95	
96	### Start (India only)
97	
98	Start is available to developers in India. It costs ₹649 per month, tax inclusive, billed monthly in INR with UPI, credit card, or debit card. Every other individual plan displays its price before tax.
99	
100	Start includes generous usage of the Cursor Models pool, so you can run Grok 4.6, Grok 4.5, and Composer 2.5 for daily building. On Start, all three models run in non-fast mode, and both Grok 4.6 and Grok 4.5 use a fixed medium effort level. You cannot change effort levels or enable Fast mode on Start. Upgrade to Pro or higher to choose effort levels and Fast mode.
101	
102	Start also includes [Cloud Agents](https://cursor.com/docs/cloud-agent.md), [Cursor for iOS](https://cursor.com/docs/cloud-agent/mobile.md), and plugins, MCP servers, hooks, and skills.
103	
104	Start does not include the Other Models pool, on-demand usage, Bugbot, Auto, Automations, or the Cursor SDK. Upgrade to Pro for those. Read the [Cursor Start announcement](https://cursor.com/blog/cursor-start-india) for more detail.
105	
106	### How much usage do I need?
107	
108	- **Daily Tab users**: Typically stay within included usage
109	- **Limited Agent users**: Often stay within included usage
110	- **Daily Agent users**: Typically $60–$100/mo total usage
111	- **Power users (multiple agents/automation)**: Often $200+/mo total usage
112	
113	### What happens when I reach my limit?
114	
115	When you exceed your included monthly usage, you can either:
116	
117	- **Add on-demand usage**: Continue at the same API rates with pay-as-you-go billing
118	- **Upgrade your plan**: Move to a higher tier for more included usage
119	
120	On-demand usage is billed monthly at the same rates. Requests are never downgraded in quality or speed.
121	
122	### Teams
123	
124	There are two business plans: Teams and Enterprise (Custom). Teams offers two seat types: Standard ($40/user/mo) and Premium ($120/user/mo), where Premium adds 5x the Standard limits on Agent.
125	
126	Team plans provide additional features like centralized team billing and administration, a team marketplace for internal rules, skills, and plugins, agentic code reviews with Bugbot, cloud agents and automations with shared team context, usage analytics, team-wide privacy mode enforcement, and SAML/OIDC SSO.
127	
128	We recommend Teams for any customer that is happy self-serving. We recommend [Enterprise](https://cursor.com/contact-sales?source=docs-models-pricing) for customers that need priority support, pooled usage, invoicing, SCIM, or advanced security controls.
129	
130	Learn more about [Teams pricing](https://cursor.com/docs/account/teams/pricing.md).
131	
132	## Cursor Token Rate
133	
134	On Teams and Enterprise plans, third-party model requests include a Cursor Token Rate of $0.25 per million tokens. This rate applies on top of model API pricing for included usage, on-demand usage, and BYOK usage.
135	
136	The Cursor Token Rate applies when you select a third-party model directly, and when Auto routes to a third-party model. First-party Cursor models, including Grok and Composer, are exempt from the Cursor Token Rate.
137	
138	## Auto modes
139	
140	Auto has three modes: Cost, Balance, and Intelligence.
141	
142	All Auto modes bill at the list price of the model each request is routed to. See [Model pricing](https://cursor.com/docs/models-and-pricing.md#model-pricing) for per-model rates. Third-party models also incur the [Cursor Token Rate](https://cursor.com/docs/models-and-pricing.md#cursor-token-rate).
143	
144	### Legacy Enterprise Auto
145	
146	Until September 7, 2026, Enterprise Auto pricing is set per million tokens, regardless of which model is used.
147	
148	## Legacy request-based pricing
149	
150	### Max Mode
151	
152	Max Mode is available only on legacy request-based plans. It extends a model's context window beyond the default limit and is billed at the model's API rate plus 20%. See [Max Mode on legacy plans](https://cursor.com/help/ai-features/max-mode.md) for details.
153	
154	## FAQ
155	
156	### Where are models hosted?
157	
158	Models are hosted by the model provider, a trusted partner, or Cursor. See our list of [sub-processors](https://trust.cursor.com/subprocessors) for details.
159	
160	### Where can I find pricing terms?
161	
162	For enterprise pricing details, billing terms, and fee calculations, see the [Pricing Policy](https://cursor.com/terms/pricing).
163	
164	
165	---
166	
167	## Sitemap
168	
169	[Overview of all docs pages](/llms.txt)
170	

---

[FETCH RESULT]
1	# Cursor Router
2	
3	Cursor Router is the model routing system behind **Auto**. Not every request needs frontier-level intelligence, so the router sends each request to the model that fits the task: simple requests go to fast, efficient models while complex work goes to the most capable ones.
4	
5	Cursor Router is currently only available on Teams and Enterprise plans.
6	
7	## How it works
8	
9	When you select **Auto** and choose **Balance** or **Intelligence** in the model picker, Cursor Router runs a classifier on each agent request and routes it based on task type and complexity. The router picks the most cost-effective model that still produces comparable quality for that request.
10	
11	Cursor Router is data-driven and managed by Cursor. You can't hand-pick which model handles a request, and the model pool changes over time as new models ship. You steer routing by choosing an optimization mode.
12	
13	On Enterprise plans, Cursor Router respects your team's model access controls. If a model is blocked for your team, the router routes to an allowed model instead. Blocking too many models reduces routing quality and can disable the router. To create cost savings, the router needs a powerful yet cost-efficient model to use when it isn't calling other frontier models, so enabling [Cursor Grok 4.5](https://cursor.com/docs/models/grok-4-5.md) is a requirement for the router to work.
14	
15	## Optimization modes
16	
17	Open the model picker, select **Auto**, and pick a mode under **Optimize For**:
18	
19	- **Cost**: Uses the previous Auto routing logic. It optimizes token spend.
20	- **Balance**: Optimizes for intelligence, speed, and cost.
21	- **Intelligence**: Routes to the most capable models for harder tasks, at a lower cost than running a single frontier model.
22	
23	Balance and Intelligence use your usage limits faster than Cost. You can switch modes at any time.
24	
25	## Pricing
26	
27	All Auto modes bill at the list price of the model each request is routed to. Third-party models also incur the Cursor Token Rate.
28	
29	Until September 7, 2026, Enterprise Auto Cost pricing is set per million tokens, regardless of which model is used ($1.25/1M input and cache write, $0.25/1M cache read, $6.00/1M output).
30	
31	## Team settings
32	
33	Admins configure Cursor Router from the [team dashboard](https://cursor.com/docs/account/teams/dashboard.md).
34	
35	- **Enable Cursor Router**: Turn routing on or off. When enabled, team members using Auto are routed by Cursor Router. Enterprise teams must enable the router manually as it's off by default. On Enterprise plans, the router can also be configured per [organization group](https://cursor.com/docs/enterprise/organization-groups.md).
36	- **Routing preferences**: Choose which optimization modes team members can select from Auto. You can disable up to 2 modes.
37	- **Underlying model**: Display which model Auto routed to at the start of each response, or keep it hidden. Hidden is the default and recommended, so results are judged on their own merit rather than by model name. Applies to Balance and Intelligence modes.
38	- **Impose Auto**: Make Auto the default model for everyone on the team. **Soft** defaults each new chat to Auto; members can still switch models. **Hard** locks the model picker to Auto. Both are off by default.
39	
40	## Use Router through the SDK
41	
42	The [TypeScript SDK](https://cursor.com/docs/sdk/typescript.md#cursor-router) and [Python SDK](https://cursor.com/docs/sdk/python.md#cursor-router) expose Cursor Router as model id `auto-smart` with parameter `optimize_for` (`cost`, `balanced`, or `intelligence`). Call `Cursor.models.list()` to confirm Router is available for the API key's team before you hard-code a selection.
43	
44	### TypeScript
45	
46	```typescript
47	import { Agent } from "@cursor/sdk";
48	
49	await using agent = await Agent.create({
50	  apiKey: process.env.CURSOR_API_KEY!,
51	  model: {
52	    id: "auto-smart",
53	    params: [{ id: "optimize_for", value: "balanced" }],
54	  },
55	  local: { cwd: process.cwd() },
56	});
57	```
58	
59	### Python
60	
61	```python
62	import os
63	
64	from cursor_sdk import Agent, LocalAgentOptions, ModelParameterValue, ModelSelection
65	
66	with Agent.create(
67	    model=ModelSelection(
68	        id="auto-smart",
69	        params=[ModelParameterValue(id="optimize_for", value="balanced")],
70	    ),
71	    local=LocalAgentOptions(cwd=os.getcwd()),
72	) as agent:
73	    ...
74	```
75	
76	The SDK runs Cursor agent workflows. It is not a standalone chat-completions or raw inference API. See [Cursor Router in the TypeScript SDK](https://cursor.com/docs/sdk/typescript.md#cursor-router) or [Python SDK](https://cursor.com/docs/sdk/python.md#cursor-router) for catalog discovery, per-run mode overrides, and troubleshooting.
77	
78	## Related
79	
80	- [Cursor Router help](https://cursor.com/help/models-and-usage/cursor-router.md)
81	
82	
83	---
84	
85	## Sitemap
86	
87	[Overview of all docs pages](/llms.txt)
88	

---

[FETCH RESULT]
1	# Usage and limits
2	
3	Most Cursor plans include two monthly usage pools:
4	
5	- **Cursor Models**: Cursor Grok 4.6, Cursor Grok 4.5, and Composer 2.5
6	- **Other Models**: Third-party models, charged at model provider prices
7	
8	Pro, Pro Plus, and Ultra include both pools. The Start plan covers the Cursor Models pool only. See [Cursor Start](https://cursor.com/help/account-and-billing/cursor-start.md) for India plan details.
9	
10	Your model selection affects how quickly your included usage is consumed.
11	
12	Current usage-based plans don't include Max Mode. On legacy request-based plans, [Max Mode](https://cursor.com/help/ai-features/max-mode.md) is billed at the model's API rate plus 20%.
13	
14	## How do I check my usage?
15	
16	Go to the [Spending](https://cursor.com/dashboard/spending) tab in your dashboard. It shows real-time usage for both pools, remaining allowance, and any on-demand charges.
17	
18	## What happens when I hit my usage limit?
19	
20	You'll see a notification in the editor. You can either enable on-demand usage (pay-as-you-go) or upgrade to a higher plan.
21	
22	## When does my usage reset?
23	
24	Usage resets monthly with your billing cycle. Unused usage does not roll over. The reset date is shown on the [Spending](https://cursor.com/dashboard/spending) tab.
25	
26	For teams, all members' usage resets at the same time based on the team billing cycle.
27	
28	## How do I get more usage?
29	
30	- **Use Cursor Models**: Cursor Grok 4.6, Cursor Grok 4.5, and Composer 2.5 draw from the Cursor Models pool, tracked separately and included with your plan
31	- **Enable on-demand usage**: Pay for additional requests at the same API rates
32	- **[Upgrade your plan](https://cursor.com/help/account-and-billing/pricing.md#how-do-i-upgrade-my-plan)**: Higher-tier plans include more usage
33	
34	## How does Cursor Router interact with my plan's usage pools and limits?
35	
36	Cursor Router requests are billed at the routed model's cost and can draw from both the Cursor Models pool and the third-party Other Models pool, depending on which model handles the request.
37	
38	- **Composer 2.5** requests carry no [Cursor Token Rate](https://cursor.com/help/models-and-usage/token-rate.md) on any plan
39	- All Auto modes bill at the routed model's list price. Third-party models also incur the Cursor Token Rate
40	
41	When included usage runs out, on-demand charges apply if you have on-demand usage enabled. Check your [Spending dashboard](https://cursor.com/dashboard/spending) for request-level cost and pool details.
42	
43	See [Cursor Router](https://cursor.com/help/models-and-usage/cursor-router.md) for mode details.
44	
45	## Related
46	
47	- [Cursor Router](https://cursor.com/help/models-and-usage/cursor-router.md)
48	- [Pricing and plans](https://cursor.com/help/account-and-billing/pricing.md)
49	- [Usage-based charges](https://cursor.com/help/account-and-billing/overages.md)
50	- [Available models](https://cursor.com/help/models-and-usage/available-models.md)
51	- [API keys](https://cursor.com/help/models-and-usage/api-keys.md)
52	- [Pricing reference](https://cursor.com/docs/models-and-pricing.md)
53	- [Model pricing](https://cursor.com/docs/models-and-pricing.md#model-pricing)
54	
55	
56	---
57	
58	## Sitemap
59	
60	[Overview of all docs pages](/llms.txt)
61	

---

[FETCH RESULT]
1	# Cursor Token Rate
2	
3	Teams and Enterprise plan customers pay a Cursor Token Rate of $0.25 per million tokens on third-party model requests. This includes when you pick a third-party model directly and when Auto routes to a third-party model.
4	
5	First-party Cursor models, including Grok and Composer, are exempt.
6	
7	This applies to included usage, on-demand usage, and BYOK usage when the request uses a third-party model that is subject to the Cursor Token Rate.
8	
9	## What does the Cursor Token Rate cover?
10	
11	- Search infrastructure
12	- Custom model execution and routing
13	- Processing and infrastructure costs
14	
15	## How is the Cursor Token Rate calculated?
16	
17	For eligible third-party model requests, the rate applies to input tokens, output tokens, and cached tokens. The Cursor Token Rate also applies to BYOK usage, in addition to whatever you pay your API provider directly.
18	
19	## How do I avoid the Cursor Token Rate?
20	
21	Use a first-party model, including Grok or Composer.
22	
23	## Related
24	
25	- [API keys](https://cursor.com/help/models-and-usage/api-keys.md)
26	- [Available models](https://cursor.com/help/models-and-usage/available-models.md)
27	- [Models & Pricing](https://cursor.com/docs/models-and-pricing.md#auto-modes)
28	
29	
30	---
31	
32	## Sitemap
33	
34	[Overview of all docs pages](/llms.txt)
35	

---

[FETCH RESULT]
1	# Subagents
2	
3	Subagents are specialized AI assistants that Cursor's agent can delegate tasks to. Each subagent operates in its own context window, handles specific types of work, and returns its result to the parent agent. Use subagents to break down complex tasks, do work in parallel, and preserve context in the main conversation.
4	
5	You can use subagents in the editor, CLI, and [Cloud Agents](https://cursor.com/docs/cloud-agent.md).
6	
7	### Context isolation
8	
9	Each subagent has its own context window. Long research or exploration tasks don't consume space in your main conversation.
10	
11	### Parallel execution
12	
13	Launch multiple subagents simultaneously. Work on different parts of your codebase without waiting for sequential completion.
14	
15	### Specialized expertise
16	
17	Configure subagents with custom prompts, tool access, and models for domain-specific tasks.
18	
19	### Reusability
20	
21	Define custom subagents and use them across projects.
22	
23	## How subagents work
24	
25	When Agent encounters a complex task, it can launch a subagent automatically. The subagent receives a prompt with all necessary context, works autonomously, and returns a final message with its results.
26	
27	Subagents start with a clean context. The parent agent includes relevant information in the prompt since subagents don't have access to prior conversation history.
28	
29	### Foreground vs background
30	
31	Subagents run in one of two modes:
32	
33	| Mode           | Behavior                                                             | Best for                                    |
34	| :------------- | :------------------------------------------------------------------- | :------------------------------------------ |
35	| **Foreground** | Blocks until the subagent completes. Returns the result immediately. | Sequential tasks where you need the output. |
36	| **Background** | Returns immediately. The subagent works independently.               | Long-running tasks or parallel workstreams. |
37	
38	## Built-in subagents
39	
40	Cursor includes three built-in subagents that handle context-heavy operations automatically. These subagents were designed based on analysis of agent conversations where context window limits were hit.
41	
42	| Subagent    | Purpose                         | Why it's a subagent                                                                                                                            |
43	| :---------- | :------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------- |
44	| **Explore** | Searches and analyzes codebases | Codebase exploration generates large intermediate output that would bloat the main context. Uses a faster model to run many parallel searches. |
45	| **Bash**    | Runs series of shell commands   | Command output is often verbose. Isolating it keeps the parent focused on decisions, not logs.                                                 |
46	| **Browser** | Controls browser via MCP tools  | Browser interactions produce noisy DOM snapshots and screenshots. The subagent filters this down to relevant results.                          |
47	
48	### Why these subagents exist
49	
50	These three operations share common traits: they generate noisy intermediate output, benefit from specialized prompts and tools, and can consume significant context. Running them as subagents solves several problems:
51	
52	- **Context isolation** — Intermediate output stays in the subagent. The parent only sees the final summary.
53	- **Model flexibility** — The explore subagent uses a faster model by default. This enables running 10 parallel searches in the time a single main-agent search would take.
54	- **Specialized configuration** — Each subagent has prompts and tool access tuned for its specific task.
55	- **Cost efficiency** — Faster models cost less. Isolating token-heavy work in subagents with appropriate model choices reduces overall cost.
56	
57	You don't need to configure these subagents. Agent uses them automatically when appropriate.
58	
59	## When to use subagents
60	
61	| Use subagents when...                                     | Use skills when...                                      |
62	| :-------------------------------------------------------- | :------------------------------------------------------ |
63	| You need context isolation for long research tasks        | The task is single-purpose (generate changelog, format) |
64	| Running multiple workstreams in parallel                  | You want a quick, repeatable action                     |
65	| The task requires specialized expertise across many steps | The task completes in one shot                          |
66	| You want an independent verification of work              | You don't need a separate context window                |
67	
68	If you find yourself creating a subagent for a simple, single-purpose task like "generate a changelog" or "format imports," consider using a [skill](https://cursor.com/docs/skills.md) instead.
69	
70	## Quick start
71	
72	Agent automatically uses subagents when appropriate. You can also create a custom subagent by asking Agent:
73	
74	Create a subagent file at .cursor/agents/verifier.md with YAML frontmatter (name, description) followed by the prompt. The verifier subagent should validate completed work, check that implementations are functional, run tests, and report what passed vs what's incomplete.
75	
76	For more control, create custom subagents manually in your project or user directory.
77	
78	## Custom subagents
79	
80	Define custom subagents to encode specialized knowledge, enforce team standards, or automate repetitive workflows.
81	
82	### File locations
83	
84	| Type                  | Location            | Scope                                                |
85	| :-------------------- | :------------------ | :--------------------------------------------------- |
86	| **Project subagents** | `.cursor/agents/`   | Current project only                                 |
87	|                       | `.claude/agents/`   | Current project only (Claude compatibility)          |
88	|                       | `.codex/agents/`    | Current project only (Codex compatibility)           |
89	| **User subagents**    | `~/.cursor/agents/` | All projects for current user                        |
90	|                       | `~/.claude/agents/` | All projects for current user (Claude compatibility) |
91	|                       | `~/.codex/agents/`  | All projects for current user (Codex compatibility)  |
92	
93	Project subagents take precedence when names conflict. When multiple locations contain subagents with the same name, `.cursor/` takes precedence over `.claude/` or `.codex/`.
94	
95	### File format
96	
97	Each subagent is a markdown file with YAML frontmatter:
98	
99	```markdown
100	---
101	name: security-auditor
102	description: Security specialist. Use when implementing auth, payments, or handling sensitive data.
103	model: inherit
104	readonly: true
105	---
106	
107	You are a security expert auditing code for vulnerabilities.
108	
109	When invoked:
110	1. Identify security-sensitive code paths
111	2. Check for common vulnerabilities (injection, XSS, auth bypass)
112	3. Verify secrets are not hardcoded
113	4. Review input validation and sanitization
114	
115	Report findings by severity:
116	- Critical (must fix before deploy)
117	- High (fix soon)
118	- Medium (address when possible)
119	```
120	
121	### Configuration fields
122	
123	| Field           | Type    | Required | Default               | Description                                                                                                                          |
124	| :-------------- | :------ | :------- | :-------------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
125	| `name`          | string  | No       | Derived from filename | Display name and identifier. Use lowercase letters and hyphens.                                                                      |
126	| `description`   | string  | No       | —                     | Short description shown in Task tool hints. Agent reads this to decide delegation.                                                   |
127	| `model`         | string  | No       | `inherit`             | Model to use: `inherit` or a specific model ID. See [model configuration](https://cursor.com/docs/subagents.md#model-configuration). |
128	| `readonly`      | boolean | No       | `false`               | If `true`, the subagent runs with restricted write permissions (no file edits, no state-changing shell commands).                    |
129	| `is_background` | boolean | No       | `false`               | If `true`, the subagent runs in the background without blocking the parent.                                                          |
130	
131	### Model configuration
132	
133	The `model` field controls which model a subagent uses. There are two options:
134	
135	| Value               | Behavior                                                                                                                                                              |
136	| :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
137	| `inherit`           | Uses the same model as the parent agent. This is the default.                                                                                                         |
138	| A specific model ID | Uses the exact model you specify, such as `composer-2` or `gpt-5.6-sol`. See the [models reference](https://cursor.com/docs/models-and-pricing.md) for available IDs. |
139	
140	Choose `inherit` when the subagent needs the same reasoning power as the parent. Use a specific model ID when you need a particular model's capabilities regardless of what the parent uses.
141	
142	#### Model parameters
143	
144	Append square brackets to a model ID to set per-model options like speed, reasoning effort, and context window. Write options as `id=value` pairs, and separate multiple options with commas.
145	
146	| Example                                   | Behavior                                                                                 |
147	| :---------------------------------------- | :--------------------------------------------------------------------------------------- |
148	| `composer-2.5[]`                          | Pins the base model. Empty brackets select the standard variant instead of the fast one. |
149	| `composer-2.5[fast=false]`                | Selects the standard (non-fast) variant explicitly.                                      |
150	| `claude-opus-5[effort=high]`              | Sets reasoning effort to `high`.                                                         |
151	| `claude-opus-5[context=300k]`             | Sets the context window to 300k tokens.                                                  |
152	| `claude-opus-5[effort=high,context=300k]` | Combines options.                                                                        |
153	
154	Available options depend on the model, and use the same `id=value` pairs as the SDK's [model parameters](https://cursor.com/docs/sdk/typescript.md#model-parameters).
155	
156	```markdown
157	---
158	name: planner
159	description: Plans complex changes before implementation.
160	model: claude-opus-5[effort=high]
161	---
162	
163	Break the task into a clear, ordered implementation plan.
164	```
165	
166	#### When the configured model won't be used
167	
168	Cursor honors the `model` field in your subagent frontmatter unless one of these conditions applies:
169	
170	- **Team admin restrictions** — Your organization's admin has blocked the specified model.
171	- **Legacy Max Mode setting** — On a legacy request-based plan, the model requires [Max Mode](https://cursor.com/help/ai-features/max-mode.md) and you don't have it enabled.
172	- **Plan limitations** — The model isn't available on your current plan.
173	
174	In these cases, Cursor falls back to a compatible model. If you're seeing unexpected model behavior, check your plan and model settings.
175	
176	```markdown
177	---
178	name: code-reviewer
179	description: Reviews code for correctness and style.
180	model: inherit
181	---
182	
183	Review the code changes for bugs, style issues, and edge cases.
184	```
185	
186	```markdown
187	---
188	name: search-agent
189	description: Searches the codebase for relevant files and symbols.
190	model: inherit
191	---
192	
193	Search the codebase and return relevant file paths and code snippets.
194	```
195	
196	```markdown
197	---
198	name: reasoning-agent
199	description: Handles complex architectural decisions.
200	model: gpt-5.6-sol
201	---
202	
203	Analyze the architecture and recommend changes with detailed reasoning.
204	```
205	
206	## Using subagents
207	
208	### Automatic delegation
209	
210	Agent proactively delegates tasks based on:
211	
212	- The task complexity and scope
213	- Custom subagent descriptions in your project
214	- Current context and available tools
215	
216	Include phrases like "use proactively" or "always use for" in your description field to encourage automatic delegation.
217	
218	### Explicit invocation
219	
220	Request a specific subagent by using the `/name` syntax in your prompt:
221	
222	```text
223	> /verifier confirm the auth flow is complete
224	> /debugger investigate this error
225	> /security-auditor review the payment module
226	```
227	
228	You can also invoke subagents by mentioning them naturally:
229	
230	```text
231	> Use the verifier subagent to confirm the auth flow is complete
232	> Have the debugger subagent investigate this error
233	> Run the security-auditor subagent on the payment module
234	```
235	
236	### Parallel execution
237	
238	Launch multiple subagents concurrently for maximum throughput:
239	
240	```text
241	> Review the API changes and update the documentation in parallel
242	```
243	
244	Agent sends multiple Task tool calls in a single message, so subagents run simultaneously.
245	
246	### Isolated project copies
247	
248	Subagents share the parent agent's checkout by default. When several subagents edit files at once, they can overwrite each other's changes. Ask for isolation and each subagent runs in its own copy of the project:
249	
250	```text
251	> Run a swarm of subagents to fix these five flaky tests, each in its own environment
252	```
253	
254	Each subagent gets its own environment with its own branch: an isolated Git worktree with a separate working directory on the same machine, or its own cloud environment with a dedicated VM and clone of the repository. Changes stay on each subagent's branch until the parent agent merges the results.
255	
256	This is subagent-level isolation within one session. To isolate a whole agent instead, run it in a [worktree](https://cursor.com/docs/configuration/worktrees.md), or hand the task to a [cloud subagent](https://cursor.com/docs/subagents.md#cloud-subagents).
257	
258	## Cloud subagents
259	
260	From a local agent session, you can hand off work to a cloud subagent that runs on its own VM and branch. Your local workspace stays clean and responsive while long-running or parallel work happens in the cloud. The parent agent keeps running locally or in the cloud without interruption. Cloud subagents run from the [Agents Window](https://cursor.com/docs/agent/agents-window.md) in the Cursor desktop app.
261	
262	### Start a cloud subagent with /in-cloud
263	
264	Type `/in-cloud` and the next task you submit runs as a cloud subagent. It spins up its own VM and branch to work on the task.
265	
266	This is useful for isolating long-running or parallel work, such as fixing CI, investigating an issue, or exploring a codebase while you keep working locally.
267	
268	### Put a PR on autopilot with /autopilot
269	
270	Ask a cloud subagent to take over a pull request with `/autopilot` or by clicking the quick-action pill. The cloud agent iterates remotely to prepare the PR for merge without tying up your local session.
271	
272	Cloud subagents use the [environment](https://cursor.com/docs/cloud-agent/setup.md) configured for your repo and follow the same model and capability rules as other [Cloud Agents](https://cursor.com/docs/cloud-agent.md). Because they run on a cloud VM, their [MCP servers](https://cursor.com/docs/cloud-agent/capabilities.md#mcp-tools) come from your team's configuration at [cursor.com/agents](https://cursor.com/agents), not from your local session.
273	
274	## Resuming subagents
275	
276	Subagents can be resumed to continue previous conversations. This is useful for long-running tasks that span multiple invocations.
277	
278	Each subagent execution returns an agent ID. Pass this ID to resume the subagent with full context preserved:
279	
280	```text
281	> Resume agent abc123 and analyze the remaining test failures
282	```
283	
284	Background subagents write their state as they run. You can resume a subagent after it completes to continue the conversation with preserved context.
285	
286	## Common patterns
287	
288	### Verification agent
289	
290	A verification agent independently validates whether claimed work was actually completed. This addresses a common issue where AI marks tasks as done but implementations are incomplete or broken.
291	
292	```markdown
293	---
294	name: verifier
295	description: Validates completed work. Use after tasks are marked done to confirm implementations are functional.
296	---
297	
298	You are a skeptical validator. Your job is to verify that work claimed as complete actually works.
299	
300	When invoked:
301	1. Identify what was claimed to be completed
302	2. Check that the implementation exists and is functional
303	3. Run relevant tests or verification steps
304	4. Look for edge cases that may have been missed
305	
306	Be thorough and skeptical. Report:
307	- What was verified and passed
308	- What was claimed but incomplete or broken
309	- Specific issues that need to be addressed
310	
311	Do not accept claims at face value. Test everything.
312	```
313	
314	Create a subagent file at .cursor/agents/verifier.md with YAML frontmatter containing name and description. The description should be 'Validates completed work. Use after tasks are marked done to confirm implementations are functional.' The prompt body should instruct it to be skeptical, verify implementations actually work by running tests, and look for edge cases.
315	
316	This pattern is useful for:
317	
318	- Validating that features work end-to-end before marking tickets complete
319	- Catching partially implemented functionality
320	- Ensuring tests actually pass (not just that test files exist)
321	
322	### Orchestrator pattern
323	
324	For complex workflows, a parent agent can coordinate multiple specialist subagents in sequence:
325	
326	1. **Planner** analyzes requirements and creates a technical plan
327	2. **Implementer** builds the feature based on the plan
328	3. **Verifier** confirms the implementation matches requirements
329	
330	Each handoff includes structured output so the next agent has clear context.
331	
332	## Example subagents
333	
334	### Debugger
335	
336	```markdown
337	---
338	name: debugger
339	description: Debugging specialist for errors and test failures. Use when encountering issues.
340	---
341	
342	You are an expert debugger specializing in root cause analysis.
343	
344	When invoked:
345	1. Capture error message and stack trace
346	2. Identify reproduction steps
347	3. Isolate the failure location
348	4. Implement minimal fix
349	5. Verify solution works
350	
351	For each issue, provide:
352	- Root cause explanation
353	- Evidence supporting the diagnosis
354	- Specific code fix
355	- Testing approach
356	
357	Focus on fixing the underlying issue, not symptoms.
358	```
359	
360	Create a subagent file at .cursor/agents/debugger.md with YAML frontmatter containing name and description. The debugger subagent should specialize in root cause analysis: capture stack traces, identify reproduction steps, isolate failures, implement minimal fixes, and verify solutions.
361	
362	### Test runner
363	
364	```markdown
365	---
366	name: test-runner
367	description: Test automation expert. Use proactively to run tests and fix failures.
368	---
369	
370	You are a test automation expert.
371	
372	When you see code changes, proactively run appropriate tests.
373	
374	If tests fail:
375	1. Analyze the failure output
376	2. Identify the root cause
377	3. Fix the issue while preserving test intent
378	4. Re-run to verify
379	
380	Report test results with:
381	- Number of tests passed/failed
382	- Summary of any failures
383	- Changes made to fix issues
384	```
385	
386	Create a subagent file at .cursor/agents/test-runner.md with YAML frontmatter containing name and description (mentioning 'Use proactively'). The test-runner subagent should proactively run tests when it sees code changes, analyze failures, fix issues while preserving test intent, and report results.
387	
388	## Best practices
389	
390	- **Write focused subagents** — Each subagent should have a single, clear responsibility. Avoid generic "helper" agents.
391	- **Invest in descriptions** — The `description` field determines when Agent delegates to your subagent. Spend time refining it. Test by making prompts and checking if the right subagent gets triggered.
392	- **Keep prompts concise** — Long, rambling prompts dilute focus. Be specific and direct.
393	- **Add subagents to version control** — Check `.cursor/agents/` into your repository so the team benefits.
394	- **Start with Agent-generated agents** — Let Agent help you draft the initial configuration, then customize.
395	- **Use hooks for file output** — If you need subagents to produce structured output files, consider using [hooks](https://cursor.com/docs/hooks.md) to process and save their results consistently.
396	
397	### Anti-patterns to avoid
398	
399	**Don't create dozens of generic subagents.** Having 50+ subagents with vague instructions like "helps with coding" is ineffective. Agent won't know when to use them, and you'll waste time maintaining them.
400	
401	- **Vague descriptions** — "Use for general tasks" gives Agent no signal about when to delegate. Be specific: "Use when implementing authentication flows with OAuth providers."
402	- **Overly long prompts** — A 2,000-word prompt doesn't make a subagent smarter. It makes it slower and harder to maintain.
403	- **Duplicating slash commands** — If a task is single-purpose and doesn't need context isolation, use a [skill](https://cursor.com/docs/skills.md) or [command](https://cursor.com/docs/customize-cursor.md#extension-components) instead.
404	- **Too many subagents** — Start with 2-3 focused subagents. Add more only when you have clear, distinct use cases.
405	
406	## Managing subagents
407	
408	### Creating subagents
409	
410	The easiest way to create a subagent is to ask Agent to create one for you:
411	
412	Create a subagent file at .cursor/agents/security-reviewer.md with YAML frontmatter containing name and description. The security-reviewer subagent should check code for common vulnerabilities like injection, XSS, and hardcoded secrets.
413	
414	You can also create subagents manually by adding markdown files to `.cursor/agents/` (project) or `~/.cursor/agents/` (user).
415	
416	### Viewing subagents
417	
418	Agent includes all custom subagents in its available tools. You can see which subagents are configured by checking the `.cursor/agents/` directory in your project.
419	
420	## Performance and cost
421	
422	Subagents have trade-offs. Understanding them helps you decide when to use them.
423	
424	| Benefit            | Trade-off                                                     |
425	| :----------------- | :------------------------------------------------------------ |
426	| Context isolation  | Startup overhead (each subagent gathers its own context)      |
427	| Parallel execution | Higher token usage (multiple contexts running simultaneously) |
428	| Specialized focus  | Latency (may be slower than main agent for simple tasks)      |
429	
430	### Token and cost considerations
431	
432	- **Subagents consume tokens independently** — Each subagent has its own context window and token usage. Running five subagents in parallel uses roughly five times the tokens of a single agent.
433	- **Evaluate the overhead** — For quick, simple tasks, the main agent is often faster. Subagents shine for complex, long-running, or parallel work.
434	- **Subagents can be slower** — The benefit is context isolation, not speed. A subagent doing a simple task may be slower than the main agent because it starts fresh.
435	
436	## FAQ
437	
438	### What are the built-in subagents?
439	
440	Cursor includes three built-in subagents: `explore` for codebase search, `bash` for running shell commands, and `browser` for browser automation via MCP. These handle context-heavy operations automatically. You don't need to configure them.
441	
442	### Can subagents launch other subagents?
443	
444	Yes, within a nesting limit. Since Cursor 2.5, subagents can launch child subagents to create a tree of coordinated work. The main agent and its direct subagents can launch subagents, but a subagent launched by another subagent can't launch further ones.
445	Nested launches also need Task tool access in the current mode, and hooks or tool policies can block spawning.
446	
447	### How do I see what a subagent is doing?
448	
449	Background subagents write output to `~/.cursor/subagents/`. The parent agent can read these files to check progress.
450	
451	### What happens if a subagent fails?
452	
453	The subagent returns an error status to the parent agent. The parent can retry, resume with additional context, or handle the failure differently.
454	
455	### Can I use MCP tools in subagents?
456	
457	Yes. Subagents inherit all tools from the parent, including MCP tools from configured servers. [Cloud subagents](https://cursor.com/docs/subagents.md#cloud-subagents) are the exception: they run on a cloud VM and use the MCP servers configured for your team at [cursor.com/agents](https://cursor.com/agents), not the servers from your local session.
458	
459	### How do I debug a misbehaving subagent?
460	
461	Check the subagent's description and prompt. Ensure the instructions are specific and unambiguous. You can also test the subagent by invoking it explicitly with a simple task.
462	
463	### Why is my subagent using a different model?
464	
465	Cursor overrides the configured model when your team admin blocks it, your plan doesn't include it, or a legacy request-based plan requires [Max Mode](https://cursor.com/help/ai-features/max-mode.md) and you don't have it enabled. On legacy request-based plans without Max Mode, subagents run using Composer regardless of any `model` configuration. If your team admin has blocked Composer, subagents can run only when Max Mode is enabled. On usage-based plans and legacy request-based plans with Max Mode, subagents default to the parent model. See [model configuration](https://cursor.com/docs/subagents.md#model-configuration) for details.
466	
467	
468	---
469	
470	## Sitemap
471	
472	[Overview of all docs pages](/llms.txt)
473	

---

Now let me get the full changelog history to build the version/feature timeline.

---

[FETCH RESULT]
page 1: 200163
page 2: 201600
page 3: 205335
page 4: 234185
page 5: 170450
page 6: 212327
-rw-r--r-- 1 bodep 197609 200163 Sep  1 10:36 cl1.html
-rw-r--r-- 1 bodep 197609 201600 Sep  1 10:36 cl2.html
-rw-r--r-- 1 bodep 197609 205335 Sep  1 10:36 cl3.html
-rw-r--r-- 1 bodep 197609 234185 Sep  1 10:36 cl4.html
-rw-r--r-- 1 bodep 197609 170450 Sep  1 10:36 cl5.html
-rw-r--r-- 1 bodep 197609 212327 Sep  1 10:36 cl6.html

---

[FETCH RESULT]
=== PAGE 1 ===
start-from-scratch | 08-19-26 | origin-code-hosting | 08-13-26 | google-workspace-plugins | start-from-scratch- | 2026-08-13-changelog-subscriptions- | 2026-08-13-changelog-sticky-skills- | 2026-08-13-changelog-subagents- | debug-builds- | 2026-08-13-changelog-goal- | origin-apps- | origin-settings-tip
=== PAGE 2 ===
ipad | cursor-start | router | slack-improvements | side-chat | inbox-43- | redesigned-picker
=== PAGE 3 ===
team-marketplace-updates | ios-mobile-app | customize | 06-18-26 | cloud-in-agents-window | team-mcps | marketplace-orgs | remote-control | cloud-environment-setup | handoff-to-cloud
=== PAGE 4 ===
bugbot-updates-june-2026 | design-mode-improvements | sdk-updates-jun-2026 | canvas-improvements | shared-canvases | enterprise-organizations | bugbot-performance
=== PAGE 5 ===
auto-review | shared-canvases | 05-20-26 | 05-19-26 | composer-2-5
=== PAGE 6 ===
3-4 | 05-13-26 | 04-24-26 | microsoft-teams | 05-11-26 | 05-07-26

---

[FETCH RESULT]
2-0 -> 404 54325
2-1 -> 404 54325
2-2 -> 404 54325
2-3 -> 404 54325
2-4 -> 404 54325
2-5 -> 404 54325
3-0 -> 404 54325
3-1 -> 404 54325
3-2 -> 404 54325
3-3 -> 404 54325
3-4 -> 404 54325
3-5 -> 404 54325
3-6 -> 404 54325
3-7 -> 404 54325
3-8 -> 404 54325
3-9 -> 404 54325
3-10 -> 404 54327
3-11 -> 404 54327
4-0 -> 404 54325
4-1 -> 404 54325
4-2 -> 404 54325

---

[FETCH RESULT]
Exit code 1
Traceback (most recent call last):
  File "<string>", line 9, in <module>
    print('\n'.join(lines[:200]))
    ~~~~~^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Python314\Lib\encodings\cp1252.py", line 19, in encode
    return codecs.charmap_encode(input,self.errors,encoding_table)[0]
           ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
UnicodeEncodeError: 'charmap' codec can't encode character '\u2193' in position 78: character maps to <undefined>

---

[FETCH RESULT]
Full-screen Tabs and Compact Chats · Cursor
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
3.4
May 13, 2026
·
Changelog
Full-screen Tabs and Compact Chats
This release introduces quality-of-life improvements to the
Agents Window
.
#
Full-screen tabs
Full screen maximizes the right panel so you can focus on a single tab.
Files, changes, canvases, PRs, browsers, and terminals can expand to fill the entire working area. This replaces the agent chat with a floating prompt bar.
Enter and exit full screen by clicking on the expand/contract button in the panel header, using the command palette, or pressing
Cmd/Ctrl+Shift+M
.
#
Compact chat responses
Compact chats give you a tighter view of your agent conversations so you can read threads more quickly without losing important context.
Customize tool call density to control how much of the agent's tool activity is shown in each response:
Compact: shows concise results with minimal tool traces
Balanced: includes important intermediate steps
Detailed: provides near-complete step-by-step context
Improvements (8)
↓
↑
Improved PR tabs by adding clearer review states, better reviewer/thread visibility, and more predictable PR tab actions.
Improved long-chat scrolling to make it smoother, added better undo grouping in prompt input, and improved behavior while streaming.
Added clearer status text for background/resumed tasks.
Added cleaner environment/repo selection and better persistence when switching contexts.
Improved MCP auth token lifecycle handling.
Removed noisy in-app terminal notifications and improved shortcut behavior.
Clarified model naming and selection behavior in the model picker and added stronger fallback handling.
Improved search and navigation to make it faster and more reliable in large workspaces.
Bug Fixes (9)
↓
↑
Fixed PR tab bugs affecting branch lookup, header state, and diff loading.
Fixed background task reliability issues like resume failures, interrupt edge cases, and incorrect status scoping on resumed subagents.
Fixed cloud agents bugs blocking setup, state merge/persistence bugs, and multi-repo identity issues.
Fixed MCP/OAuth reliability bugs like transient 401/stale-token cases and large-token handling edge cases.
Fixed edge cases around slash menu + approval regressions, ask-question flow issues, and paste-chunk handling.
Fixed keyboard shortcuts bugs in modals, vim/emacs caret style leakage, and other key handling.
Fixed hook invocation/path-length issues and Git prompt-related regressions.
Fixed model-routing mismatches, proxy body normalization, and thought-chunk forwarding issues.
Fixed webhook auth/hostname resolution, GHES installation persistence, and mirrored-repo behavior.
← Previous post
Composer 2.5
Next post →
Development environments for cloud agents
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

[FETCH RESULT]
=========== LISTING PAGE 1 ===========
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
=========== LISTING PAGE 2 ===========
Download
Changelog
Jul 29, 2026
·
Changelog
Cursor, now on iPad
Cursor for iPad is now available on all paid plans.
New to both iPhone and iPad: an inbox to stay organized, and a review experience that covers the full PR. Create, review, and merge from anywhere.
#
Built for the bigger screen
The iPad layout is rebuilt around the extra space. Sidebar chats stay pinned so you can watch several agents run at once. Split screen keeps a review open next to a chat, and file diffs render in full.
Markup gets more room to work too. Attach a screenshot, then tap to drop a comment at a specific point, or draw directly on the image with Apple Pencil.
#
A full review surface
On iPhone and iPad, the review screen now covers the full PR: comments, checks, and approvals. Add or change reviewers, read comments, and prompt the agent to resolve them. The whole path from agent output to merged PR now travels with you.
#
Inbox
An Inbox helps you and your agents stay organized. See what's in progress, what needs your attention, and which PRs are in review.
#
Additional improvements for Cursor on iPhone and iPad
Bitbucket and Azure DevOps SCM support
Multi-PR sessions: when one chat creates multiple PRs, you can now open every one of them, not just the last.
Switch between teams that you belong to directly in the app
Download the Cursor App
or read our
docs
to learn more.
Jul 28, 2026
·
Changelog
Cursor Start
We're introducing
Cursor Start
, a new ₹649 monthly plan for developers in India, making daily agentic development accessible and payment easy with local pricing and UPI.
Existing Free users in India can upgrade their plan from the
dashboard
. New users in India can visit
cursor.com/signup
and select the Start plan during onboarding.
Start bills monthly with auto-renewal and is available from July 28, 2026.
Cursor Start includes:
Generous access to Cursor models:

---

[FETCH RESULT]
<persisted-output>
Output too large (30.9KB). Full output saved to: C:\Users\bodep\.claude\projects\C--Trace-by-Origin\31d50875-2820-4c5f-8826-61b9cf9ff1b8\tool-results\bbsdzgr85.txt

Preview (first 2KB):
=========== PAGE 2 ===========
Jul 29, 2026
·
Changelog
Cursor, now on iPad
Cursor for iPad is now available on all paid plans.
New to both iPhone and iPad: an inbox to stay organized, and a review experience that covers the full PR. Create, review, and merge from anywhere.
#
Built for the bigger screen
The iPad layout is rebuilt around the extra space. Sidebar chats stay pinned so you can watch several agents run at once. Split screen keeps a review open next to a chat, and file diffs render in full.
Markup gets more room to work too. Attach a screenshot, then tap to drop a comment at a specific point, or draw directly on the image with Apple Pencil.
#
A full review surface
On iPhone and iPad, the review screen now covers the full PR: comments, checks, and approvals. Add or change reviewers, read comments, and prompt the agent to resolve them. The whole path from agent output to merged PR now travels with you.
#
Inbox
An Inbox helps you and your agents stay organized. See what's in progress, what needs your attention, and which PRs are in review.
#
Additional improvements for Cursor on iPhone and iPad
Bitbucket and Azure DevOps SCM support
Multi-PR sessions: when one chat creates multiple PRs, you can now open every one of them, not just the last.
Switch between teams that you belong to directly in the app
Download the Cursor App
or read our
docs
to learn more.
Jul 28, 2026
·
Changelog
Cursor Start
We're introducing
Cursor Start
, a new ₹649 monthly plan for developers in India, making daily agentic development accessible and payment easy with local pricing and UPI.
Existing Free users in India can upgrade their plan from the
dashboard
. New users in India can visit
cursor.com/signup
and select the Start plan during onboarding.
Start bills monthly with auto-renewal and is available from July 28, 2026.
Cursor Start includes:
Generous access to Cursor models:
...
</persisted-output>

---

[FETCH RESULT]
1	=========== PAGE 2 ===========
2	Jul 29, 2026
3	·
4	Changelog
5	Cursor, now on iPad
6	Cursor for iPad is now available on all paid plans.
7	New to both iPhone and iPad: an inbox to stay organized, and a review experience that covers the full PR. Create, review, and merge from anywhere.
8	#
9	Built for the bigger screen
10	The iPad layout is rebuilt around the extra space. Sidebar chats stay pinned so you can watch several agents run at once. Split screen keeps a review open next to a chat, and file diffs render in full.
11	Markup gets more room to work too. Attach a screenshot, then tap to drop a comment at a specific point, or draw directly on the image with Apple Pencil.
12	#
13	A full review surface
14	On iPhone and iPad, the review screen now covers the full PR: comments, checks, and approvals. Add or change reviewers, read comments, and prompt the agent to resolve them. The whole path from agent output to merged PR now travels with you.
15	#
16	Inbox
17	An Inbox helps you and your agents stay organized. See what's in progress, what needs your attention, and which PRs are in review.
18	#
19	Additional improvements for Cursor on iPhone and iPad
20	Bitbucket and Azure DevOps SCM support
21	Multi-PR sessions: when one chat creates multiple PRs, you can now open every one of them, not just the last.
22	Switch between teams that you belong to directly in the app
23	Download the Cursor App
24	or read our
25	docs
26	to learn more.
27	Jul 28, 2026
28	·
29	Changelog
30	Cursor Start
31	We're introducing
32	Cursor Start
33	, a new ₹649 monthly plan for developers in India, making daily agentic development accessible and payment easy with local pricing and UPI.
34	Existing Free users in India can upgrade their plan from the
35	dashboard
36	. New users in India can visit
37	cursor.com/signup
38	and select the Start plan during onboarding.
39	Start bills monthly with auto-renewal and is available from July 28, 2026.
40	Cursor Start includes:
41	Generous access to Cursor models:
42	Grok and Composer, with enough usage to build with agents every day.
43	Always-on cloud agents
44	that build, test, and ship code while you keep working.
45	Cursor for iOS
46	with remote control, so you can launch and steer agents from your phone.
47	Plugins, MCP servers, hooks, and skills
48	to extend Cursor across your workflows.
49	Local pricing
50	at ₹649 per month, tax inclusive, billed in INR with UPI or card.
51	Learn more in our
52	announcement
53	and
54	docs
55	.
56	Jul 22, 2026
57	·
58	Changelog
59	Cursor Router
60	Auto mode is now powered by Cursor Router.
61	Cursor Router
62	is our intelligent model router. It analyzes each request and sends it to the right model for the job. Frontier models handle work that demands them. Price-efficient models handle the rest.
63	#
64	Optimization modes
65	Select Auto, then choose how the router optimizes:
66	Intelligence:
67	Frontier quality, matching the most expensive and powerful models that might be out of reach for daily use.
68	Balance:
69	Strong quality, matching the frontier models that most people like to daily drive.
70	Cost:
71	Good quality, reaching the highest available intelligence while optimizing token spend.
72	Balance and Intelligence bill at the routed model’s rate. Each mode moves you along the cost-intelligence pareto frontier.
73	#
74	Admin controls
75	Admins can enable the router per team or group, restrict which optimization modes members can use, set the default mode, and allow or block underlying models.
76	Cursor Router is available across desktop, web, iOS, CLI, and our SDK. It is on by default for Teams plans. Enterprise admins can enable it from the dashboard.
77	Learn more in our
78	announcement
79	and
80	docs
81	.
82	Improvements
83	↓
84	↑
85	Per-request classification by task type and complexity
86	Optimization modes: Cost, Balance, and Intelligence
87	Admin controls: per-team and per-group enablement, mode restrictions, default mode, and model allow and block lists
88	Routed model can be displayed or hidden (hidden by default)
89	Soft and hard enforcement options for standardizing on Auto
90	Grok 4.5 required as a price-efficient routing option
91	Jul 17, 2026
92	·
93	Changelog
94	Improvements to Cursor in Slack
95	Cursor in Slack now shares a plan before it starts, runs in multi-repo environments, and can work across channels and threads.
96	#
97	Interaction improvements
98	Cursor now responds with a plan before it begins, so you can jump in and redirect early. As it works, it updates its status so you can follow each step.
99	We also refined how Cursor's responses look in Slack. In-message buttons are gone, replaced by compact footer links. Tables, PRs, and artifacts now render more cleanly.
100	#
101	Multi-repo environment support
102	From Slack, Cursor can now start in a named multi-repo environment instead of a single default repository. If your frontend, backend, and shared code live in separate repos, Cursor reads your request and targets the environment that gives it access to all of them.
103	Mid-task, when Cursor needs a repo outside the current environment, it prompts you with a
104	Switch repository
105	button. Click it, choose the repo or environment, and Cursor picks up right where it left off.
106	#
107	Cross-channel workflows
108	Cursor can now read from and send messages to other Slack channels and threads. During a task, it can pull context from elsewhere in the workspace and post updates back in the original thread or the relevant channel.
109	Learn more in our
110	Slack docs
111	.
112	3.11
113	Jul 10, 2026
114	·
115	Changelog
116	Side Chats and Conversation Search
117	This release makes it easier to stay in flow with side chats that run alongside your main chat, the ability to search agent transcripts, and simplified project and repo pickers.
118	#
119	Side chats
120	Open a side chat to ask questions, explore ideas, and investigate tangents without interrupting your main agent conversation. Use
121	/side
122	,
123	/btw
124	, or the plus button at the top of the chat panel to create a new side chat that has context from the main chat.
125	Each side chat is a durable, full agent conversation that you can follow up on, revisit later, and at-mention to pull context back into the main thread.
126	By default, side chats focus on reading, searching, and answering. Use them to ask clarification questions, research alternatives without committing to a pivot, and sanity-check a decision while the main agent continues running.
127	#
128	Conversation search
129	Find past agent chats faster with search results that go beyond names and PR numbers. In the
130	Agents Window
131	, you can search agent transcripts from the command palette (Cmd+K). Cursor builds a local search index that scales search to thousands of conversations with snappy performance.
132	You can also search within an existing conversation using Cmd+F. Jump between matches, see a match counter, and keep searching as you scroll through long transcripts.
133	#
134	Redesigned project and repo pickers
135	We've simplified the project and repo pickers and made them more powerful. You can now stay in the picker for workflows that used to send you elsewhere. For example, you can create a project and connect GitHub, GitLab, or Azure DevOps without leaving the picker.
136	Search is now scoped to where you're working—This Computer, Cloud, or a specific remote machine—instead of one global search box. You can also remove projects from Recents with one click.
137	#
138	New cloud agent hooks
139	Cloud agents already support team hooks around tool execution and file/shell work. We've added new hooks that let you observe and control the agent conversation itself: prompts, responses, thinking, subagents, compaction, and turn completion. See all the supported hooks in our
140	docs
141	.
142	New hooks like
143	beforeSubmitPrompt
144	,
145	afterAgentResponse
146	,
147	afterAgentThought
148	,
149	stop
150	,
151	subagentStart
152	, and more allow you to better observe output and reasoning, control subagents, and build self-correcting loops with cloud agents.
153	Picker Improvements
154	↓
155	↑
156	Improved repo picker grouping with options under No Repo, On This Computer, and Cloud.
157	Added the "Run on" picker that shows where your agent can run (Cloud, This Computer, or Remote Machines) and drills into the relevant choices (environments, local options, and so on) from there.
158	The branch picker opens on your default branch and recently used branches instead of a long flat list, with search for everything else.
159	Removed the Home concept so working without a repo is an explicit No Repo choice.
160	Combined all remote options—your machines, team pools, and existing remote workspaces—into one searchable Remote Machines menu.
161	Multi-repo and multi-root selection is a Select Multiple toggle inside the Cloud and This Computer flyouts, replacing the separate Set Up Workspace builder.
162	Moved search to the top of the menu.
163	Simplified the footer.
164	Added the ability to find the No Repo option by typing
165	none
166	or
167	no repo
168	.
169	If a repo exists only in the cloud, the picker suggests cloning it locally.
170	Added clearer section dividers.
171	Added folder icons with a small cloud badge for cloud repos.
172	Removed redundant
173	Current
174	tag in the branch list.
175	← Previous
176	Newer posts
177	Next →
178	=========== PAGE 3 ===========
179	3.10
180	Jun 30, 2026
181	·
182	Changelog
183	MCPs and Organizations in Team Marketplaces
184	We've expanded
185	team marketplaces
186	to support Team MCPs and organization groups.
187	#
188	Team MCPs in team marketplaces
189	Admins can now configure Team MCP servers once and distribute them across cloud agents, the agents window, IDE, and CLI.
190	When an admin sets up Team MCP servers for cloud agents, they can make those same servers available in a team marketplace from
191	Dashboard -> Integrations & MCP
192	. This allows members of the team to install approved integrations locally without configuring servers themselves.
193	Learn more in the docs on
194	migrating existing Team MCPs
195	.
196	#
197	Marketplace access by organization group
198	Team marketplaces now support
199	organization groups
200	, in addition to team-level SCIM directory groups.
201	Under
202	Dashboard -> Plugins -> Team Marketplaces
203	, restrict marketplace access to specific organization groups. Marketplaces that already use SCIM directory groups keep that configuration.
204	Get started in the
205	Cursor dashboard
206	.
207	3.9
208	Jun 29, 2026
209	·
210	Changelog
211	Cursor Mobile App for iOS
212	Cursor for iOS
213	is now available in public beta on all paid plans. Launch and manage always-on agents from anywhere.
214	#
215	Cloud agents on mobile
216	Open the Cursor mobile app, choose a repo, and launch an agent the same way you would on the desktop app. Pick any frontier model, describe ideas out loud with voice input, and use slash commands to guide Cursor in the right direction.
217	Cloud agents run in isolated virtual machines with full development environments to test, verify, and demo work. Move sessions from local to cloud to keep them running with your laptop closed.
218	#
219	Remote Control
220	Use
221	Remote Control
222	in the
223	Agents Window
224	to take an agent you're running on your computer and keep directing it from your phone.
225	You can also turn on a setting to keep your computer awake, so your machine stays reachable while you're away from your desk.
226	On Teams and Enterprise plans, admins must enable Remote Control from the
227	Cursor Dashboard
228	.
229	#
230	Live Activities and push notifications
231	Track the status of your agents with Live Activities on your lock screen. Get push notifications when an agent finishes, needs input, or is ready for review.
232	#
233	Artifacts and SCM
234	Review demos, screenshots, logs, and diffs from your phone. Leave follow-up instructions, or merge the PR directly from the app.
235	Download Cursor for iOS
236	to start building from your phone.  Read our
237	announcement
238	or the
239	docs
240	to learn more.
241	3.9
242	Jun 22, 2026
243	·
244	Changelog
245	Customize Cursor
246	Plugins, skills, and MCPs let you customize Cursor for your workflows. The new Customize page brings them into one place.
247	You can now add and manage plugins, skills, MCPs, subagents, rules, commands, and hooks at the user, team, or workspace level, and even bring your own custom MCPs.
248	#
249	Marketplace leaderboard
250	Cursor now shows you a leaderboard of the most popular plugins, skills, and MCPs across your team.
251	Add any to your setup with one click from the new Customize page and extend Cursor for your workflow.
252	#
253	Plugin canvases
254	Plugins now support prebuilt canvases: shared setup templates your team can open and reuse.
255	Use the Hex Canvas to build data visualizations.
256	Use the Atlassian Canvas to see a realtime view of all our issues, projects, and documents.
257	#
258	New Team Marketplaces
259	Team marketplaces
260	now support imports of plugin repositories from GitLab, BitBucket, or Azure DevOps so you easily add plugins and distribute them to your team.
261	Learn more in our
262	docs
263	.
264	3.8
265	Jun 18, 2026
266	·
267	Changelog
268	Improvements to Cursor Automations
269	Cursor Automations save you time by automating repetitive tasks with always-on agents. This release introduces the
270	/automate
271	skill, new triggers for GitHub and Slack, and support for computer use.
272	#
273	/automate skill
274	Use
275	/automate
276	to create an automation directly in your local agent session.
277	Describe the task you want to automate in plain language and Cursor will configure the triggers, instructions, and tools for you.
278	#
279	An emoji trigger for Slack
280	React to any Slack message with a designated emoji to kick off an automation. At Cursor, we use this to trigger specific automations right from Slack.
281	#
282	New GitHub triggers
283	Automations now support five additional GitHub triggers:
284	Issue comment:
285	when a comment is made on a non-PR issue
286	PR review comment:
287	when an inline comment is left on a pull request diff
288	PR review submitted:
289	when a PR review is submitted
290	Review thread updated:
291	when a review thread on a pull request is marked resolved or unresolved
292	Workflow run completed:
293	when a GitHub Actions workflow run finishes on a pull request or branch
294	We've added new templates for
295	triaging failed GitHub actions
296	and
297	auto-fixing PR review comments
298	to the
299	Cursor Marketplace
300	to help you get started.
301	#
302	Computer use tool for automations
303	Cloud agents kicked off by automations can now use their own computers to produce demos or artifacts of their work.
304	The computer use tool is enabled by default for every automation, just tell the agent to include a demo of its work in your instructions.
305	To get started, update to the latest version of Cursor. Learn more in our
306	docs
307	.
308	Improvements (3)
309	↓
310	↑
311	Automations can now be saved in an incomplete state, so you can navigate away to set up an MCP auth without losing your progress
312	Automations can now open PRs by default; so you no longer have to specify that tool in the UI
313	You can now delete memory files in the UI, or prompt your automation to delete outdated memories when it runs
314	3.7
315	Jun 17, 2026
316	·
317	Changelog
318	Cloud Environment Setup and Cloud Subagents in Agents Window
319	This release introduces updates to
320	cloud agents
321	in the
322	Agents Window
323	of the Cursor desktop app.
324	#
325	Cloud environment setup
326	Cursor can now help you set up your dev environment in the cloud in less than 10 minutes. You can watch the agent's progress in a shared terminal session as it handles setup tasks like installing dependencies.
327	Your environment is captured in a reusable snapshot, so future cloud agents start up faster with the ability to test changes by running your software. It can iterate over long time horizons until outputs are verified. This benefits your entire team when committed to
328	.cursor/environment.json
329	.
330	#
331	Cloud subagents with /in-cloud
332	Use
333	/in-cloud
334	to spin up a cloud subagent in its own VM to work on the next task you submit. It runs on its own VM and branch, so your local workspace stays clean and responsive.
335	This is especially useful for isolating long-running or parallel work like fixing CI, investigating an issue, or exploring a codebase while you keep working locally.
336	You can also ask a cloud subagent to babysit a PR by clicking on the quick-action pill or using
337	/babysit
338	. The cloud agent will iterate remotely to prepare your PR for merge without tying up the local session.
339	The cloud subagent can run in the background without interrupting the parent agent, which can continue to run locally or in the cloud.
340	#
341	Handoff between local and cloud
342	Move agent sessions more reliably between your local computer and the cloud. You can offload long-running work from your machine and run as many cloud agents in parallel as you want. Pull a cloud agent back down to local to test changes yourself.
343	← Previous
344	Newer posts
345	Next →
346	=========== PAGE 4 ===========
347	Jun 10, 2026
348	·
349	Changelog
350	Bugbot is now over 3x faster, 22% cheaper, and finds 10% more bugs
351	The average review time for Bugbot is now ~90 seconds, down from ~5 minutes. Bugbot also finds 10% more bugs per review on average — 0.62, up from 0.56 — and costs ~22% less per run.
352	These performance gains are made possible by progress we've made training Composer 2.5, which now powers Bugbot. Bugbot respects model block lists, and speed and performance can vary depending on your configuration.
353	#
354	Run Bugbot before you push
355	You can now run
356	Bugbot
357	and
358	Security Review
359	with
360	/review
361	before pushing code.
362	/review
363	prompts you to choose which agents to run, or use
364	/review-bugbot
365	and
366	/review-security
367	directly.
368	/review
369	also syncs with Bugbot on GitHub and GitLab. If you run
370	/review
371	and then open a PR with the same diff, Bugbot recognizes it, skips the review, and leaves a comment noting it has already reviewed that diff.
372	Available in Cursor 3.7+ and on
373	cursor.com/agents
374	, with support in CLI coming soon.
375	#
376	Only review what's new in your PR
377	You can now configure Bugbot to only review what's new since the last review, keeping feedback focused on your latest updates.
378	Learn more in our
379	docs
380	.
381	3.7
382	Jun 5, 2026
383	·
384	Changelog
385	Design Mode Improvements
386	With Design Mode in the Cursor browser, you can click, draw, or describe changes by voice to help agents update your UI.
387	#
388	Multi-select elements
389	Click on two or more elements together in the browser. Cursor sees the selected elements, their code, the surrounding layout, and the visual relationships on the page.
390	Ask the agent to make one match the other, remove repeated content, or adjust a group of components at once.
391	#
392	Voice input
393	Narrate changes through the Design Mode overlay. The mic stays available while an agent is mid-run, so you can queue the next change by voice without waiting for the previous one to finish.
394	Jun 4, 2026
395	·
396	Changelog
397	Custom stores, custom tools, and auto-review for the Cursor SDK
398	We've shipped a batch of new functionality across the
399	TypeScript
400	and
401	Python
402	SDKs. You can now choose how agent and run metadata is persisted, expose your own functions to the agent as tools, route local tool calls through auto-review, and nest subagents to any depth. This release also brings a set of reliability, performance, and platform fixes that make local and cloud SDK agents easier to run in production scripts, CI, and custom integrations.
403	#
404	Custom tools
405	You can now hand the local agent your own tools by passing function definitions through
406	local.customTools
407	, on
408	Agent.create()
409	or per
410	send()
411	. The SDK exposes them to the agent through a built-in MCP server called
412	custom-user-tools
413	, so the model calls your code through the same path and the same permission gate as any other MCP tool.
414	Before this, exposing a custom capability meant standing up your own stdio or remote HTTP MCP server and wiring it into the agent. Now a function definition is enough. Custom tools are also visible to every subagent of a parent agent, so a tool you define once is available throughout the whole run.
415	#
416	Auto-review
417	By default, a local SDK agent runs tool calls without asking for approval, since there's no human in the loop in a headless run. Set
418	local.autoReview
419	to route those calls through
420	auto-review
421	instead. A classifier decides which calls run automatically and which to hold back, rather than bypassing review entirely.
422	You steer that classifier with natural-language instructions in
423	permissions.json
424	. The
425	autoRun.allow_instructions
426	field describes call shapes to lean toward allowing, and
427	autoRun.block_instructions
428	describes the ones to hold for review. For example, you can allow read-only inspections of build artifacts while always pausing on destructive operations like deletes.
429	{
430	"autoRun"
431	: {
432	"allow_instructions"
433	: [
434	"Read-only inspections of build artifacts under ./dist are fine."
435	],
436	"block_instructions"
437	: [
438	"Always pause delete operations so I get a chance to review them."
439	]
440	}
441	#
442	JSONL and custom stores
443	Both SDKs persist agent and run metadata so you can resume an agent after a process restart. Until now, that store was SQLite. You can now opt into a JSONL store instead, which writes a plain, append-only file you can read, diff, and check into version control. Both
444	SqliteLocalAgentStore
445	and
446	JsonlLocalAgentStore
447	are exported directly.
448	If neither default fits your setup, implement the public
449	LocalAgentStore
450	interface and pass it through
451	local.store
452	. Build an in-memory store for ephemeral CI runs, or back persistence with Postgres when you want agent state to live next to the rest of your application data. The Python SDK exposes host, JSONL, and composed JSONL stores through the bridge.
453	#
454	Nested subagents
455	Subagents can now spawn their own subagents, and so on. A reviewer subagent can delegate to a test-writer, which can delegate further, with each level keeping its own prompt and model. There's nothing to turn on; a subagent session registers the executor it needs to call
456	Task
457	, so nesting works automatically for any agent that defines subagents.
458	#
459	Reliability, performance, and platform improvements
460	This release also includes a batch of quality-of-life fixes across both SDKs.
461	Reliability
462	↓
463	↑
464	Run correlation
465	: Every
466	send()
467	now carries a platform-generated
468	requestId
469	, exposed on
470	Run
471	and
472	RunResult
473	and persisted across the in-memory, SQLite, and JSONL stores. Tie a script or CI run to backend logs, analytics, and support threads without inferring it from
474	agentId
475	.
476	Reliable
477	wait()
478	on local runs
479	: Local runs no longer resolve
480	wait()
481	before the terminal result is written. Hydration keeps refreshing until the run reaches a final state, so automation reads a complete result.
482	Safe checkpoints on dispose
483	: Disposing a local agent no longer removes checkpoint data when a root reference is missing but checkpoint blobs still exist. The agent directory is only cleared when there's genuinely nothing left to keep.
484	Cloud streaming over HTTP/1.1
485	: Cloud agent sessions now stream correctly on HTTP/1.1 transports used by some proxies, older Node fetch stacks, and certain CI images. HTTP/2 behavior is unchanged.
486	Performance and packaging
487	↓
488	↑
489	Lighter import
490	: Importing
491	@cursor/sdk
492	no longer eagerly loads the full local agent stack. Cloud-only and type-only consumers skip the local runtime cost until the first local call, with no API change. The first local call pays a one-time import, then stays cached.
493	Self-contained TypeScript types
494	: Published
495	.d.ts
496	files no longer reference unpublished workspace packages. This fixes
497	TS2305
498	and
499	TS2307
500	errors under
501	skipLibCheck: false
502	and silent
503	any
504	on stream types like
505	TurnEndedUpdate
506	.
507	Bundled ripgrep
508	: Local shell runs use the bundled platform
509	rg
510	binary without modifying your global
511	PATH
512	. On Windows, prepending ripgrep no longer clobbers the
513	Path
514	variable.
515	Models
516	↓
517	↑
518	Composer 2 routes to Composer 2.5
519	: SDK clients still pinning retired
520	composer-2
521	slugs are routed to Composer 2.5 automatically, keeping fast variants intact, so older scripts keep running.
522	Python SDK
523	↓
524	↑
525	Workspace-scoped
526	list_runs
527	:
528	Client
529	,
530	AsyncClient
531	, and
532	Agent.list_runs
533	take an optional
534	cwd
535	, and the bridge falls back to its launch workspace. This fixes spurious "agent not found" results when the bridge runs as a subprocess.
536	Clearer not-found errors
537	: Looking up an agent that isn't in the resolved workspace returns a clear not-found error instead of an opaque internal error.
538	0.1.6 release and analytics
539	:
540	cursor-sdk
541	0.1.6 documents the Buildkite release path and labels SDK usage as
542	sdk-python-
543	for clearer analytics.
544	Run
545	npm install @cursor/sdk
546	or
547	pip install cursor-sdk
548	to upgrade. Scripts pinning
549	composer-2
550	move to Composer 2.5 automatically, and
551	requestId
552	is a safe addition to your run metadata schema. See the
553	TypeScript
554	and
555	Python
556	docs for full details.
557	3.7
558	Jun 4, 2026
559	·
560	Changelog
561	Canvas Design Mode and Context Usage Report
562	With
563	canvases
564	, agents can create interactive artifacts like dashboards, reports, and internal tools that you can
565	share with your team
566	.
567	This release introduces Design Mode for faster canvas editing, new ways to understand context usage, and other quality-of-life improvements.
568	#
569	Design Mode in canvases
570	Design Mode is now available in canvases.
571	Select and annotate UI elements directly in a canvas to guide Cursor's edits, just as you would in the browser. Instead of describing the change in text, you can point to it, provide feedback, and iterate more quickly.
572	#
573	Context usage report in canvas
574	Cursor can now show your agent's
575	context usage
576	as an interactive report in a canvas.
577	The context explorer breaks down where tokens go across the system prompt, tool definitions, rules, skills, and more. Because it's a canvas, you can ask the agent follow-up questions, and it can customize the report to answer your specific questions.
578	Click the Debug with Agent button embedded in the canvas to ask Cursor to identify opportunities to reduce context usage in a new conversation.
579	Canvas Improvements (4)
580	↓
581	↑
582	Shared canvases can now be opened full-screen in the browser, making them easier to present to others.
583	Added the ability for agents to embed buttons in canvases that will run a specific prompt when clicked.
584	Improved the agent's ability to fix canvas type errors.
585	Improved component styling, and added more chart customization functionality.
586	Jun 3, 2026
587	·
588	Changelog
589	Organizations for Cursor Enterprise
590	Enterprise customers can now manage multiple Cursor teams from one place, with different security, governance, budget, and feature controls for each. These capabilities are now generally available to all Enterprise customers.
591	#
592	Organizations
593	An organization is the top-level container for your company's identity, administration, and membership. It gives admins one place to view and manage their entire Cursor setup, including a rollup of spend and token usage across every team.
594	#
595	Teams
596	Teams are the operating unit for a department, region, or subsidiary. This is what admins manage as their Cursor org today. We've moved that unit under an organization, so you can run multiple teams, each with its own security, governance, spend, and feature settings.
597	A user can belong to more than one team, with a different role in each. For current customers, your existing team is preserved and becomes the default home for login, routing, and creating new teams.
598	#
599	Groups
600	Groups are a lightweight collection of users that can sit across or within teams. They give cohorts of users separate model access, spend limits, and agent permissions without standing up a whole new team. When a user belongs to more than one team or group, the most permissive setting wins.
601	Learn more in our
602	announcement post
603	or
604	docs
605	.
606	Improvements (5)
607	↓
608	↑
609	Multi-team support so users can be on multiple teams at once
610	Organization-level IDP management
611	Organization-level usage analytics, with drill downs to each team
612	Admins can move users between teams through the dashboard,
613	API
614	, or CSV
615	New users joining a team inherit settings and permissions automatically
616	← Previous
617	Newer posts
618	Next →
619	=========== PAGE 5 ===========
620	3.6
621	May 29, 2026
622	·
623	Changelog
624	Auto-review Run Mode
625	Auto-review is a new run mode that allows Cursor to work for longer with fewer approval prompts and safer execution.
626	Auto-review applies to Shell, MCP, and Fetch tool calls. Allowlisted calls run immediately, and calls that can be sandboxed run in the sandbox. All other agent actions go to a classifier subagent that decides whether to allow the call, try a different approach, or ask for your approval.
627	Configure your run mode in
628	Settings > Cursor Settings > Agents > Approvals & Execution
629	. You can also steer the classifier agent by giving it custom instructions.
630	Learn more in our
631	docs
632	.
633	3.5
634	May 20, 2026
635	·
636	Changelog
637	Shared Canvases and /loop Skill
638	#
639	Shared canvases
640	You can now share canvases from Cursor with your team.
641	Canvases are interactive artifacts created by agents, like reports, dashboards, and custom interfaces. Instead of sharing a full chat thread, you can share a link to a live snapshot of a canvas for teammates to open in the browser.
642	View your team's shared canvases in the Cursor Dashboard with read-only access. Shared canvases are available on Pro, Teams, and Enterprise plans.
643	Learn more in our
644	docs
645	.
646	#
647	/loop skill
648	With /loop, Cursor can run a prompt repeatedly on a local schedule, until a certain outcome is achieved, or until you stop it. If you don't specify a fixed interval, the agent decides when or what event should wake it.
649	Use the /loop skill for local long-running agents. For example, you can ask it to “check deploy status every 5 minutes” or “work on this feature until tests pass.”
650	3.5
651	May 20, 2026
652	·
653	Changelog
654	Improvements to Cursor Automations
655	This release brings
656	Cursor Automations
657	to the Agents Window and introduces the ability to configure automations with multiple attached repos or no repos at all.
658	For the next 7 days, all agent runs for newly created automations are 50% off.
659	#
660	Automations in the Agents Window
661	Cursor Automations are now available in the
662	Agents Window
663	, in addition to cursor.com/automations. Create and manage your automations in the same workspace as your agents.
664	#
665	Multi-repo automations
666	A lot of engineering work spans more than one codebase. You can now attach multiple repos to an automation so agents reason across all required context and work across repos to deliver, test, and verify tasks.
667	#
668	No-repo automations
669	Many useful automations exist apart from code, where agents monitor your tools and act on key signals. You can now create automations without an attached repository.
670	We've added five new templates for no-repo automations to the
671	Cursor Marketplace
672	to help you get started:
673	Slack digest agent
674	: Summarizes unread DMs and key Slack channels every morning and prioritizes them by importance
675	=========== PAGE 6 ===========
676	3.4
677	May 13, 2026
678	·
679	Changelog
680	Full-screen Tabs and Compact Chats
681	This release introduces quality-of-life improvements to the
682	Agents Window
683	.
684	#
685	Full-screen tabs
686	Full screen maximizes the right panel so you can focus on a single tab.
687	Files, changes, canvases, PRs, browsers, and terminals can expand to fill the entire working area. This replaces the agent chat with a floating prompt bar.
688	Enter and exit full screen by clicking on the expand/contract button in the panel header, using the command palette, or pressing
689	Cmd/Ctrl+Shift+M
690	.
691	#
692	Compact chat responses
693	Compact chats give you a tighter view of your agent conversations so you can read threads more quickly without losing important context.
694	Customize tool call density to control how much of the agent's tool activity is shown in each response:
695	Compact: shows concise results with minimal tool traces
696	Balanced: includes important intermediate steps
697	Detailed: provides near-complete step-by-step context
698	Improvements (8)
699	↓
700	↑
701	

---

Failed to authenticate. API Error: 403 pre-consume quota failed, user quota: ＄0.613470, need quota: ＄0.673636 (request id: 20260901130828661910518qbwb96cuY6s8w)