# Cursor's codebase indexing, embedding, and retrieval pipeline — the de

## URLs fetched
- https://cursor.com/docs/context/codebase-indexing
- https://cursor.com/docs/llms.txt
- https://cursor.com/docs/agent/tools/search.md
- https://cursor.com/help/customization/context.md
- https://cursor.com/help/customization/ignore-files.md
- https://cursor.com/help/security-and-privacy/privacy.md
- https://cursor.com/docs/agent/tools/search
- https://cursor.com/help/customization/context
- https://cursor.com/help/customization/ignore-files
- https://cursor.com/help/security-and-privacy/privacy
- https://cursor.com/security
- https://cursor.com/docs/reference/ignore-file
- https://cursor.com/changelog
- https://trust.cursor.com/subprocessors
- https://cursor.com/blog
- https://cursor.com/changelog/page/2
- https://web.archive.org/web/2025/https://docs.cursor.com/context/codebase-indexing
- https://web.archive.org/web/2025/https://www.cursor.com/security
- https://cursor.com/blog/git-at-any-scale
- https://cursor.com/blog/semsearch
- https://forum.cursor.com/search?q=merkle
- https://cursor.com/changelog/page/3
- https://turbopuffer.com/blog/cursor
- https://turbopuffer.com/blog
- https://cursor.com/changelog/page/5
- https://docs.cursor.com/context/codebase-indexing
- https://cursor.com/changelog/2-1
- https://turbopuffer.com/customers/cursor
- https://turbopuffer.com/architecture
- https://cursor.com/changelog/page/8

## Content

I'll research Cursor's codebase indexing, embedding, and retrieval pipeline in depth.

---

[FETCH RESULT]
## Not present in this document

The page provided covers **Search** (Instant Grep, the Explore subagent, and a short FAQ). It contains **no information** on any of the following requested items:

- Merkle trees or hash-based change detection
- Chunking strategy
- Embeddings or embedding models
- Vector databases / vector storage
- `.cursorignore` or `.cursorindexingignore`
- Privacy Mode (as a named setting)
- File count, file size, or repo size limits
- Sync/re-index cadence or triggers

I can't infer these details, so nothing above should be treated as documented.

## Adjacent details that *are* documented

**Search engine (not an index).** Cursor includes Instant Grep, described as a custom search engine that "outperforms `ripgrep` on large codebases." It's automatic — the docs say it needs no configuration. It handles "full regex and word-boundary matching," letting the agent build patterns such as `import.*PaymentService` to follow references between files. Exact-match lookups (symbol names, error strings, regex) are the stated fast path, and grep is invoked automatically when specific symbols are mentioned.

**Privacy / security.** The one relevant claim: "File paths are encrypted before being sent to Cursor's servers. Code content is never stored in plaintext." Note this is about *paths* and search traffic, not about embedding storage.

**Customizing path encryption.** Add a `.cursor/keys` file at the workspace root containing a JSON object with a `path_decryption_key` field set to your own key.

**Explore subagent.** Runs in a separate context window on a faster model, issuing many parallel searches and returning only what's relevant. Purpose is context management — it summarizes rather than "dumping raw file contents." Triggered automatically, or on request (e.g., asking it to find everywhere user input is validated).

**Multi-root workspaces.** Supported, with each folder's context exposed to the agent. Features assuming one git root — worktrees is the given example — are turned off. Additionally: "Cloud Agents do not support multi-root workspaces."

If you need the indexing internals, they'd be on a different docs page than this one; the sitemap link (`/llms.txt`) would be the place to look.

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: InvokeModelWithResponseStream: operation error Bedrock Runtime: InvokeModelWithResponseStream, https response error StatusCode: 400, RequestID: ac8f8438-bacd-431b-b152-9306ec358cd8, ValidationException: Tool 'web_search' not found in provided tools (request id: 5948cb6a1a7e1cab38d0e82c720a488e) [trace_id=c679405b8c419c2fcca7aa0246fff228] (request id: 202609011302403404359397drhbZla2Ib72)

---

The WebSearch tool errored. Let me retry and pull the docs sitemap.

---

[FETCH RESULT]
## Pages Most Relevant to Your Focus Areas

**Search, context & indexing** (note: no page in this index specifically covers embeddings)
- https://cursor.com/docs/agent/tools/search.md
- https://cursor.com/help/customization/context.md
- https://cursor.com/help/customization/ignore-files.md
- https://cursor.com/help/ai-features/conversation-search.md
- https://cursor.com/docs/origin/browse.md
- https://cursor.com/docs/origin/codebase-settings.md
- https://cursor.com/docs/account/teams/analytics-api.md#conversation-insights

**Privacy & data governance**
- https://cursor.com/help/security-and-privacy/privacy.md
- https://cursor.com/help/security-and-privacy/regions.md
- https://cursor.com/help/security-and-privacy/compliance.md
- https://cursor.com/docs/enterprise/privacy-and-data-governance.md
- https://cursor.com/docs/enterprise/compliance-and-monitoring.md
- https://cursor.com/docs/enterprise/baa.md
- https://cursor.com/help/grok-bot/secrets.md

**Security**
- https://cursor.com/docs/agent/security.md · /docs/agent/security/run-modes.md
- https://cursor.com/docs/cloud-agent/security.md · security-network.md · private-connectivity.md · identity.md
- https://cursor.com/docs/security-agents.md · https://cursor.com/docs/approval-agents.md
- https://cursor.com/docs/enterprise/security-hardening.md · endpoint-security.md · llm-safety-and-controls.md
- https://cursor.com/docs/account/enterprise/cyber-safeguards.md
- https://cursor.com/help/security-and-privacy/marketplace-security.md · sso.md · account-compromised.md
- Identity/access: /docs/enterprise/identity-and-access-management.md, /docs/account/teams/sso.md, /docs/account/teams/scim.md, /docs/grok-bot/identity.md

**Architecture, deployment & networking**
- https://cursor.com/docs/enterprise/deployment-patterns.md · network-configuration.md
- https://cursor.com/docs/cloud-agent/self-hosted.md plus guides: choose-runtime, pool, my-machines, kubernetes, cloud-run
- https://cursor.com/docs/cursor-router.md
- https://cursor.com/docs/enterprise/opentelemetry-export.md · .../wire.md
- https://cursor.com/help/troubleshooting/network.md

## Full Index (remaining pages)

**Get started / models:** /docs.md, /docs/get-started/quickstart.md, /docs/models-and-pricing.md, and model pages for claude-sonnet-5, claude-opus-5, claude-fable-5, gemini-3-1-pro, gemini-3-7-flash, gpt-5-6-sol, gpt-5-6-terra, gpt-5-6-luna, grok-4-6, grok-4-5, cursor-composer-2-5. (One entry is malformed: `https://cursor.comhttps://cursor.com/changelog.md`.)

**Agent:** overview, agents-window, agent-review, plan-mode, prompting, debug-mode, design-mode, tools/terminal, tools/browser, tools/canvas, /docs/configuration/worktrees.md

**grok-bot (docs):** /docs/grok-bot.md, get-started, use-cases, work, settings, teams

**Customizing:** /docs/customize-cursor.md, plugins, rules, skills, subagents, hooks, mcp

**Cloud agents:** /docs/cloud-agent.md, setup, builds, capabilities, metadata, best-practices, automations, /docs/bugbot.md, /docs/cloud-agent/mobile.md, settings, api/endpoints.md, api/webhooks.md

**Origin:** /docs/origin.md, cli, cli/reference/commands, cli/reference/pull-requests, create-repository, git, mirror-github, pull-requests, settings, integrations

**Integrations:** slack, microsoft-teams, jira, linear, notion, github, gitlab, azure-devops, bitbucket, jetbrains, xcode, /docs/reference/deeplinks.md, /docs/integrations/cursor-blame.md

**SDK:** typescript, python, bridge, changelog

**CLI:** overview, installation, using, changelog, shell-mode, acp, headless, github-actions, reference/{slash-commands, parameters, authentication, permissions, configuration, output-format, terminal-setup}

**Account/Enterprise:** teams/{setup, pricing, members, dashboard, analytics}, /docs/enterprise.md, admin-setup-guide, organizations, organization-groups, model-and-integration-management, pooled-usage, account/enterprise/{service-accounts, billing-groups}

**APIs:** /docs/api.md (+ #authentication, #rate-limits, #best-practices), cloud-agent endpoints (agents, runs, streaming, artifacts, workers, pools, models, repos), teams admin-api, organizations/organization-admin-api, teams/analytics-api, teams/ai-code-tracking-api

**Help Center:** getting-started (install, first-project, build-ai-coding-agent, migrate-vscode, migrate-jetbrains); AI features (agent, coding-agents, agentic-coding, ai-pair-programming, multi-agent, side-chats, vibe-coding, plan-mode, ask-mode, debug-mode, tab, inline-edit, max-mode, terminal, browser, cloud-agents, background-agents, mobile-app, automations, shared-transcripts, bugbot); customization (rules, mcp, skills, extensions, plugins, keyboard-shortcuts, themes); models-and-usage (available-models, cursor-router, grok-4-6, grok-4-5, api-keys, usage-limits, token-rate); account-and-billing (~20 pages incl. pricing, billing, invoices, overages, spend-limits, refunds, delete-account); integrations (git, github-gitlab, cli, third-party); grok-bot help (11 pages); troubleshooting (agent-issues, tab-issues, install-issues, extensions, performance, reporting-bugs)

**Localization:** paths accept a language prefix — available codes are "cn, ru, ja, pt-BR, es".

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: Tool 'web_search' not found in provided tools [trace_id=c07bffd92dec38c967d27fcda8123223] (request id: 20260901130611501718704zxqsVnkh9d0o)

---

WebSearch is unavailable in this environment, so I'll drive everything through WebFetch on primary sources. Let me pull the key docs pages.

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
The server returned HTTP 404 Not Found.

The response body was not retrieved. If this URL requires authentication, use an authenticated tool (e.g. `gh` for GitHub, or an MCP-provided fetch tool) instead of WebFetch.

---

[FETCH RESULT]
The server returned HTTP 404 Not Found.

The response body was not retrieved. If this URL requires authentication, use an authenticated tool (e.g. `gh` for GitHub, or an MCP-provided fetch tool) instead of WebFetch.

---

The `.md` variants 404. Let me try the HTML paths.

---

[FETCH RESULT]
## What the page actually covers: @-symbols

The provided content documents only one context mechanism — manual attachment via the `@` symbol in the chat input. Typing `@` lets you "attach specific context to your conversation," which "helps Agent focus on the right files and information."

**Referenceable context types:**

| Type | Syntax / notes |
|---|---|
| Files & folders | `@auth.ts`, `@src/components/` — "type `/` after selecting a folder to navigate deeper" |
| Terminals | `@Terminals` to "include terminal output as context" |
| Prior chats | `@Chats` to "reference context from a previous conversation" |
| Git diffs | `@Commit (Diff of Working State)` for uncommitted work; `@Branch (Diff with Main)` for the whole branch |
| Browser | `@Browser` pulls context from the built-in browser |

**Multiple attachments:** Supported — repeating `@` adds several items, and "Each one gets added to the conversation."

## Automatic vs. manual retrieval

The page draws one explicit distinction here. Manual mentions are advised "when you know which files are relevant" — the example given is naming both a component and its test file. Otherwise, you're told to omit them, because "Agent finds relevant files through its own search." That implies an autonomous, tool-driven retrieval path, but the page gives no detail on its mechanics.

## Not present in this source

The following requested topics have **no coverage** in the supplied content, so I can't describe them without inventing details:

- Codebase indexing pipelines
- Embeddings or vector storage
- Merkle tree change detection / sync
- Semantic search implementation or ranking
- Context window sizing, truncation, or budget management

The page's only outbound pointers are to related customization docs on Rules and Ignore files, plus a sitemap at `/llms.txt` — those may hold the indexing and retrieval internals you're after.

---

[FETCH RESULT]
## .cursorignore

- Created as a file named `.cursorignore` in the project root, containing patterns for files/folders to exclude.
- Example patterns given in the docs: `node_modules/`, `dist/`, `*.min.js`, `.env*`.
- Its role is to cover exclusions on top of git's: ".cursorignore is for additional exclusions beyond what .gitignore covers."

## .gitignore handling

- Git ignore rules are honored automatically — "Cursor automatically respects your `.gitignore` patterns," and files git ignores are "also excluded from AI context."

## AI access vs. indexing

- The page addresses AI/Agent access rather than indexing specifically: "Ignored files are blocked from Agent."
- Important gap in enforcement: "Terminal commands and MCP tools run outside of Cursor's file access controls, so they may still be able to read ignored files." So exclusion isn't an absolute guarantee against retrieval.
- No separate discussion of index-only exclusion appears here.

## Default ignore list

- Out of the box, Cursor "already ignores `.env` files, `.git/`, and lock files by default."
- A complete enumeration is not on this page; it points to the reference doc at `cursor.com/docs/reference/ignore-file.md` for the "full default ignore list."

## Secrets

- Credential handling is framed as a rationale rather than an automatic scanning feature: "Secrets and credentials are safer excluded from AI context." The only built-in secret-related default named is `.env` files.

## Glob / pattern syntax

- No formal syntax specification is provided. Only the demonstrated forms are visible: trailing-slash directory patterns (`node_modules/`, `dist/`), a wildcard extension match (`*.min.js`), and a prefix wildcard (`.env*`).

## Other stated reasons to ignore

- "Large generated files are rarely useful as context"
- "Binary files and assets add noise without value"
- Third-party dependencies such as `node_modules` are described as seldom valuable context.

## Not covered on this page

`.cursorindexingignore` is never mentioned, nor is any file size limit, indexing threshold, or distinction between indexing exclusion and access blocking. The linked reference page would be the place to check for those details.

---

[FETCH RESULT]
## Privacy Mode

- Purpose: it "ensures your code is never used for training by Cursor or other AI model providers."
- How to turn it on: open Cursor Settings (Mac: Cmd + Shift + J; Windows/Linux: Ctrl + Shift + J), select **General** in the sidebar, then switch **Privacy Mode** on.
- Defaults and enforcement: teams get it on by default for every member, and the page also states it is "on by default for Enterprise teams." Admins can lock it across the organization through cursor.com/dashboard so individuals "cannot disable it."
- Model coverage: it behaves identically for Grok 4.5 and all other models — "With Privacy Mode enabled, your code is never used for training."
- Limits: Grok Bot is described as a "separate product surface with its own data flows," so editor-side Privacy Mode is not presented as covering it.

## Data sent to / processed by providers

- AI features transmit "prompts and code context to model providers like OpenAI, Anthropic, and Google."
- Grok 4.5, like other models, "is hosted by the model provider, a trusted partner, or Cursor."

## Zero data retention (ZDR) exceptions

- ZDR "doesn't apply when you use your own API keys" — in that scenario the provider's own privacy policy governs handling.
- Certain models mandate retention at the provider and sit "outside Cursor's ZDR agreements"; these are disabled by default and need admin approval.

## Server-side / stored data mentioned

- Grok Bot "can copy or create files on a cloud computer during agent runs."
- Where those files live, how long they persist, and deletion options "depend on your account type and how the files were created" — no specific location or duration is given.
- Deletion requests go through support with your account email, the agent name, and a file description, following Cursor's standard data-deletion process.

## Subprocessors

- All sub-processors "have data processing agreements"; the current list is published at trust.cursor.com/subprocessors. No individual vendors are named on this page.
- Cursor's DPA applies to enterprise contracts (Teams/Enterprise), describing processor commitments and sub-processor coverage; individual plans fall under the Privacy Policy instead.

## Enterprise privacy controls

- AI code tracking API plus audit logs for organization-wide usage visibility
- Granular admin/model controls: restrict models, enforce Privacy Mode org-wide, manage agent permissions
- Compliance: "SOC 2 Type II and more"
- CMEK — "Encrypt Cloud Agent data with your own keys," including control over rotation and access

## Not covered in this content

The page contains nothing about codebase indexing storage mechanics, embeddings, obfuscated or encrypted file paths, named vector database vendors, or numeric retention periods. Those details would need to be sourced elsewhere (e.g., the linked data-use, security, or privacy-and-data-governance pages).

---

[FETCH RESULT]
## Search tooling documented

**Grep (automatic)**
- Exact-match lookups are described as the quickest route to code — function names, variable names, error strings, or regex patterns. The agent invokes grep on its own when you name specific symbols.
- Cursor includes Instant Grep, linked as a beta item in the 2.1 changelog, described as "a custom search engine that outperforms `ripgrep` on large codebases."
- Zero setup: it "runs automatically; no configuration needed."
- Capabilities: "full regex and word-boundary matching," letting the agent build patterns such as `import.*PaymentService` or `PaymentFailedError` to follow references across a codebase.

**Explore subagent**
- The agent may launch an Explore subagent that operates "in its own context window with a faster model."
- It fires off many searches in parallel without inflating the main thread, "returning only the relevant findings."
- Triggered automatically when the agent judges a task suited to broad search, or explicitly on request — the example phrasing given is "use a subagent to find all the places we validate user input."
- Purpose is context management: search across many files is context-heavy, so the subagent summarizes rather than "dumping raw file contents."

## Privacy and encryption
- "File paths are encrypted before being sent to Cursor's servers."
- "Code content is never stored in plaintext."
- Encryption can be customized via a `.cursor/keys` file at the workspace root:

```json
{
  "path_decryption_key": "your-custom-key-here"
}
```

## Multi-root workspaces
- Supported, with each workspace folder's context exposed to the agent.
- Anything depending on a single git root — worktrees is the cited example — is turned off in multi-root setups.
- Cloud Agents lack multi-root workspace support.

## Not present in this page
The source contains no mention of semantic search or a `codebase_search` tool, no fuzzy file-search tool, no `read_file` line-range behavior, nothing about embeddings or codebase indexing, and no benchmark figures or accuracy percentages. The only comparative claim is the qualitative ripgrep statement quoted above.

---

Major signal: the current docs describe "Instant Grep" and no embeddings. I need to establish the historical pipeline and when it changed. Let me hit the security page, ignore-file reference, changelog, and subprocessors.

---

[FETCH RESULT]
The page content I was given contains only the title — "Cursor Trust Center" — with no accompanying text, tables, or subprocessor listings.

Because of that, I can't provide the requested breakdown. Specifically, I have no information here about:

- **Vector database / embedding vendors** (e.g., Turbopuffer, Pinecone, Voyage)
- **Model or inference providers** (e.g., Fireworks, OpenAI, Anthropic)
- **Cloud and storage infrastructure** (e.g., AWS, GCP, Azure, Databricks, MongoDB, Neon)
- **Search infrastructure** (e.g., Exa)
- Any stated purpose, data categories, or processing locations for the above

Naming any of these as subprocessors, or assigning purposes to them, would mean inventing details not present in the source — so I'll refrain.

**To get a usable answer, you could:**
1. Re-fetch the page with the full body text or the linked subprocessor page/PDF, which is typically a separate document from the Trust Center landing page.
2. Paste the subprocessor table directly, and I can organize it by category and purpose.
3. Check whether the list sits behind a request/gated form, in which case a scrape may only return the shell of the page — which appears to be what happened here.

Once you share the actual list, I'll summarize each entry with its purpose, keeping any direct quotes short and clearly marked, and paraphrasing everything else. I'm not a lawyer, so I'll stick to describing what the document says rather than assessing it.

---

[FETCH RESULT]
**No changelog entries on this page match those topics.** None of the five posts mention indexing, embeddings, semantic search, codebase search, grep, Instant Grep, an Explore subagent, retrieval, or an index. This page also lists dates only — no version numbers appear anywhere.

Entries present, for reference:

| Date | Title | Topic |
|---|---|---|
| Aug 27, 2026 | Start from scratch, without a repo | Cloud Agents without a connected SCM; Origin repo creation, browser preview, Vercel publish |
| Aug 19, 2026 | Cloud Agents and Cursor Harness Improvements | Subscriptions, custom modes, subagents on separate VMs, `/goal`, steering |
| Aug 17, 2026 | Origin Code Hosting | Cursor-hosted repos, PRs, GitHub sync, apps, settings |
| Aug 13, 2026 | Cloud Agents Start 3x Faster with Builds | Prebuilt environments, resilience, build history |
| Aug 3, 2026 | Google Workspace Plugins | Gmail, Drive, Calendar plugins |

Closest adjacent mentions (word "search," but not codebase retrieval):

- **Aug 17, 2026 — Origin Code Hosting:** synced repos let you "Browse, search, and pull from the copy in Origin," and the beta covers "repos, pull requests, code browsing, and GitHub sync." This describes repository browsing, not an index or embedding-based lookup.
- **Aug 3, 2026 — Google Workspace Plugins:** the Drive plugin can "search files and folders," and Gmail can "search and read mail" — both external services, not codebase search.

One caveat: this is page 1 of the changelog, and there's a link to older posts (`/changelog/page/2`). Anything about indexing or retrieval may appear in those earlier entries, which aren't in the content provided.

---

[FETCH RESULT]
## Bottom line

This page contains **none** of the codebase-indexing technical detail you asked about. There is no mention of Merkle trees, chunking, embedding models, vector databases (no Turbopuffer, Pinecone, or any other name), obfuscated or encrypted file paths, hash-based caching, or index storage schemas. The page is a high-level security overview rather than an architecture document.

## What the page does contain (relevant adjacent items)

**Privacy Mode**
- Can be switched on in settings, or set centrally by "a team or enterprise admin."
- Availability: "Privacy Mode is available to anyone (free or Pro)."
- Inheritance: people joining a team pick up "the team's Privacy Mode settings."
- Effect on training: "When enabled, we will not train on your data."
- Backed by "technical controls and contractual requirements with our model providers" — the specific controls are not described.

**Infrastructure vendors / subprocessors**
- No vendor is named on this page. AWS, Azure, Fireworks, and similar are absent.
- The subprocessor roster lives externally: "Our list of subprocessors is published on our trust portal" (trust.cursor.com/subprocessors).
- Vendors go through "our vendor risk management program" with annual re-review.
- Geographic restriction stated: "Cursor does not use or maintain any infrastructure in China," and no subprocessors headquartered there.
- Model routing control: "Cursor respects model blocklists and will not send requests to models on a blocklist."

**Access controls**
- Least-privilege access, enforced MFA, deployed security tooling, and log/activity monitoring.

**Server-side storage and data retention**
- Not addressed anywhere on this page. Retention windows, index persistence, and what is held server-side are simply not covered.

**Account deletion**
- Self-service via the Settings dashboard, with a linked deletion guide; support at hi@cursor.com. No statement about what happens to any stored index or embeddings.

**Certifications**
- AIUC-1, ISO/IEC 27001:2022, ISO/IEC 42001:2023, plus a SOC 2 Type II attestation; artifacts furnished on request.
- Pen testing: a commitment to "at-least-annual penetration testing by reputable third parties," with an executive summary available through the trust portal.

**Client/agent security**
- Upstream patches assessed "based on risk and impact"; when justified, merged and shipped right away.
- The desktop app calls Cursor backend domains for API, update, and marketplace functions; proxy users are directed to an IP allowlisting doc.

## Where the missing detail likely lives

The page defers architecture specifics to linked resources you'd need to consult directly:

- `/docs/enterprise/privacy-and-data-governance#data-encryption` — labeled "Data Encryption and CMEK," the most probable home for storage and key-management specifics
- `/data-use` — linked under "how your data is used"
- `/docs/enterprise/security-hardening`
- `/docs/agent/security` and `/docs/cloud-agent/security-network`
- `cursor.com/help/security-and-privacy/privacy` — the Privacy Mode help article

## Other notes

- Page timestamp: "Last updated August 25, 2026."
- Security contacts: security-reports@cursor.com for vulnerabilities, security@cursor.com otherwise; reports acknowledged "within 5 business days," and critical incidents are emailed to affected users.
- Internal practice: Cursor uses BugBot and Cloud Agent automations on its own repository.

---

[FETCH RESULT]
## What `.cursorignore` does

A `.cursorignore` file in the project root controls which paths Cursor can read. Blocked files are withheld from Agent, Tab, and Inline Edit, and from `@` mention references. One important caveat: the page states that "The terminal and MCP server tools used by Agent cannot block access to code governed by `.cursorignore`" — so shell commands and MCP tools can still reach those files.

Two stated motivations: security (keeping keys and secrets out of reach, though the docs warn that "complete protection isn't guaranteed due to LLM unpredictability") and performance (trimming irrelevant parts of large monorepos to improve file discovery).

## Pattern syntax

Uses `.gitignore` grammar:

- `*` — any characters except `/`
- `**` — any characters including `/`
- `?` — one character
- `!` — negation, re-including a previously ignored path
- `#` — comment line
- Trailing whitespace dropped unless escaped with `\`

Examples given: `config.json` (single file), `dist/` (directory), `*.log` (extension), `**/logs` (nested), `!app/` (negation).

## Hierarchical and global ignores

Turning on `Hierarchical Cursor Ignore` makes Cursor look in parent directories for additional `.cursorignore` files. Its location is `Cursor Settings` > `Features` > `Editor`, relocating in Cursor 3.11 to `Cursor Settings` > `Indexing` > `Ignore Files`.

Global (user-level) ignore patterns apply across every project and start out empty. Suggested entries: `**/.env`, `**/.env.*`, `**/credentials.json`, `**/secrets.json`, `**/*.key`, `**/*.pem`, `**/id_rsa`.

## Default ignore list

These patterns apply on top of your `.gitignore` and `.cursorignore`, and can be overridden with a `!` prefix. (Reproduced as published; note `*.doc` is listed twice and `.git/`, `.hg/`, `.svn/` appear twice.)

```sh
package-lock.json
pnpm-lock.yaml
yarn.lock
composer.lock
Gemfile.lock
bun.lockb
.env*
.git/
.svn/
.hg/
*.lock
*.bak
*.tmp
*.bin
*.exe
*.dll
*.so
*.lockb
*.qwoff
*.isl
*.csv
*.pdf
*.doc
*.doc
*.xls
*.xlsx
*.ppt
*.pptx
*.odt
*.ods
*.odp
*.odg
*.odf
*.sxw
*.sxc
*.sxi
*.sxd
*.sdc
*.jpg
*.jpeg
*.png
*.gif
*.bmp
*.tif
*.mp3
*.wav
*.wma
*.ogg
*.flac
*.aac
*.mp4
*.mov
*.wmv
*.flv
*.avi
*.zip
*.tar
*.gz
*.7z
*.rar
*.tgz
*.dmg
*.iso
*.cue
*.mdf
*.mds
*.vcd
*.toast
*.img
*.apk
*.msi
*.cab
*.tar.gz
*.tar.xz
*.tar.bz2
*.tar.lzma
*.tar.Z
*.tar.sz
*.lzma
*.ttf
*.otf
*.pak
*.woff
*.woff2
*.eot
*.webp
*.vsix
*.rmeta
*.rlib
*.parquet
*.svg
.egg-info/
.venv/
node_modules/
__pycache__/
.next/
.nuxt/
.cache/
.sass-cache/
.gradle/
.DS_Store/
.ipynb_checkpoints/
.pytest_cache/
.mypy_cache/
.tox/
.git/
.hg/
.svn/
.bzr/
.lock-wscript/
.Python/
.jupyter/
.history/
.yarn/
.yarn-cache/
.eslintcache/
.parcel-cache/
.cache-loader/
.nyc_output/
.node_repl_history/
.pnp.js/
.pnp/
```

## Negation limits

A file cannot be brought back if a parent directory was excluded with `*`. With `public/*` ignored, `!public/index.html` succeeds because it sits at the top level, while `!public/assets/style.css` fails. The fix is to exclude the nested directory explicitly (`public/assets/*`) and then negate the specific file. The rationale: skipped directories aren't walked, for speed — matching git's own behavior, with a pointer to the official gitignore documentation.

## Troubleshooting

Validate a pattern with `git check-ignore -v [file]`.

## Not present in this page

The supplied content does not mention `.cursorindexingignore` at all, gives no file size limits, no indexing size or count limits, and draws no explicit contrast between excluding files from the index versus blocking model access. The only access-scope distinction stated is the terminal/MCP carve-out noted above. You'd need Cursor's indexing/codebase-indexing documentation for those specifics.

---

Let me get the blog index, older changelog pages, and archived versions of the removed indexing docs.

---

[FETCH RESULT]
Claude Code is unable to fetch from web.archive.org

---

[FETCH RESULT]
Claude Code is unable to fetch from web.archive.org

---

[FETCH RESULT]
## Changelog entries on this page

| Date | Version | Title |
|---|---|---|
| Jul 29, 2026 | — (none listed) | Cursor, now on iPad |
| Jul 28, 2026 | — (none listed) | Cursor Start |
| Jul 22, 2026 | — (none listed) | Cursor Router |
| Jul 17, 2026 | — (none listed) | Improvements to Cursor in Slack |
| Jul 10, 2026 | **3.11** | Side Chats and Conversation Search |

Only the Jul 10 entry carries an explicit version tag (3.11); the other four are dated but unversioned. Navigation links indicate more entries exist on adjacent pages (newer posts and page 3).

## 🚩 Flagged for search/indexing relevance

**Jul 10, 2026 (3.11) — Side Chats and Conversation Search** — the only entry touching these topics, and it concerns *conversation* search rather than codebase search:

- **Indexing:** described as building "a local search index that scales search to thousands of conversations with snappy performance."
- **Transcript search:** agent transcripts are searchable from the command palette in the Agents Window (Cmd+K).
- **In-conversation search:** Cmd+F supports jumping between matches with a match counter.
- **Side chats** are said by default to concentrate on "reading, searching, and answering," used for clarification and research.
- **Picker search:** scoping changed so search targets This Computer, Cloud, or a specific remote machine instead of one global box.

## Not found

No entry on this page mentions embeddings, semantic search, codebase search, grep, Instant Grep, an Explore subagent, or retrieval. The closest adjacent items are the router's per-request classification (Jul 22) and multi-repo environment targeting in Slack (Jul 17), neither of which describes a retrieval or indexing mechanism.

---

[FETCH RESULT]
## Blog posts listed on the page

| Date | Title | Topic | URL |
|---|---|---|---|
| Aug 18, 2026 | "Git at any scale" (Vicent Martí, 27m) | research | /blog/git-at-any-scale |
| Aug 14, 2026 | "Cursor is now a part of SpaceX" (2m) | company | /blog/joining-spacex |
| Aug 13, 2026 | "Firetiger joins Cursor" (Maxime Prades, 2m) | company | /blog/firetiger |
| Aug 13, 2026 | "Cursor earns AIUC-1 certification for agent security and reliability" (Kenneth Moras, 4m) | company | /blog/aiuc-1 |
| Aug 13, 2026 | "Cloud agents start 3x faster with builds" (4m) | product | /blog/builds |
| Aug 12, 2026 | "Introducing Grok 4.6" (3m) | research | /blog/grok-4-6 |
| Aug 6, 2026 | "How Cursor Router chooses the right model for the task" (Connor & Yuri, 6m) | research | /blog/how-cursor-router-works |
| Aug 4, 2026 | "Mixture-of-Kittens: our open-source MoE megakernel for NVL72s" (28m) | research | /blog/mixture-of-kittens |
| Jul 30, 2026 | "How we set up our cloud agent environment" (Mathew & Arvind, 7m) | research | /blog/cloud-agent-environment |
| Jul 28, 2026 | "Introducing Cursor Start" (3m) | product | /blog/cursor-start-india |
| Jul 22, 2026 | "Introducing Cursor Router" (8m) | product | /blog/router |
| Jul 20, 2026 | "Agent swarms and the new model economics" (Wilson Lin, 17m) | research | /blog/agent-swarm-model-economics |

Also linked without a date: "Towards self-driving codebases" — /blog/self-driving-codebases, quoted as a future "where agents merge PRs, manage rollouts, and monitor production."

**Customer stories:** IMDEX subsurface data/analytics platform (Aug 25, 2026, /blog/imdex); "How Vercel used Cursor to build Queues" (Jul 28, 2026, /blog/vercel); Coinbase 90% faster idea-to-production (Jun 23, 2026, /blog/coinbase); Wayfair ML cost reduction (Jun 15, 2026, /blog/wayfair).

## On your topics of interest
- **Infrastructure / systems:** the strongest matches are the Git scaling post, the MoE megakernel post, the cloud agent environment post, and the builds/startup-speed post.
- **Context & model selection:** the two Router posts (routing a task to a model) are the closest fit.
- **Semantic search, embeddings, indexing, retrieval:** nothing on this page addresses these directly.
- **Evals:** no blog post here; there is only a product/nav link at /evals.

Caveat: the listing is truncated by a "View more" control, so additional posts likely exist beyond these.

---

Archive.org is blocked. Let me try guessed primary URLs and the forum, plus the deep "Git at any scale" post.

---

[FETCH RESULT]
The page contains no forum topics, no URLs, and nothing about Merkle trees or indexing internals. Its entire content is a joke line: "This is not the content you are looking for" — preceded by a stage direction about a hand wave.

Since there's no search result listing to work from, I can't produce titles, links, or snippets. If you can share the actual search results page (or a different URL/paste of the content), I'll extract the matching topics and any relevant technical details.

---

[FETCH RESULT]
## Changelog entries on this page (5 total)

| Version | Date | Title |
|---|---|---|
| 3.10 | Jun 30, 2026 | MCPs and Organizations in Team Marketplaces |
| 3.9 | Jun 29, 2026 | Cursor Mobile App for iOS |
| 3.9 | Jun 22, 2026 | Customize Cursor |
| 3.8 | Jun 18, 2026 | Improvements to Cursor Automations |
| 3.7 | Jun 17, 2026 | Cloud Environment Setup and Cloud Subagents in Agents Window |

### Retrieval-related flags: none

No entry on this page discusses indexing, embeddings, semantic search, codebase search, grep/Instant Grep, an Explore subagent, or retrieval as a feature.

**One borderline mention worth noting:** the 3.7 entry (Jun 17, 2026) lists codebase exploration as a use case for cloud subagents, describing it as good for isolating work such as fixing CI, looking into an issue, or "exploring a codebase while you keep working locally." That is about where an agent runs, not about a search or indexing capability.

Other content is focused on team marketplaces and MCP distribution (3.10), the iOS app with Remote Control and notifications (3.9, Jun 29), the Customize page for plugins/skills/MCPs (3.9, Jun 22), automation triggers plus computer use (3.8), and cloud environment snapshots with `/in-cloud` and `/babysit` subagents (3.7).

---

[FETCH RESULT]
**Source:** Cursor blog, "Improving agent with semantic search," Nov 6, 2025 — Stefan Heule, Emily Jia & Naman Jain (research).

## What it is
Semantic search returns "segments of code matching natural language queries," with the post's example being a question like "where do we handle authentication?" It sits alongside, not instead of, regex-style search from grep.

## Embedding model & infrastructure
- Cursor trained its own embedding model and built "indexing pipelines for fast retrieval."
- Training signal comes from agent sessions: since an agent runs many searches and file opens before locating the right code, the traces reveal "in retrospect what should have been retrieved earlier in the conversation."
- Those traces go to an LLM that "ranks what content would have been most helpful at each step."
- The embedding model is then trained "to align its similarity scores with these LLM-generated rankings," forming a feedback loop grounded in real agent behavior instead of "generic code similarity."

## Chunking
Not covered. The post only refers to retrieving code *segments*; no chunk sizes, boundaries, or indexing granularity are disclosed.

## Offline evals
- Dataset: **Cursor Context Bench**, aimed at retrieving codebase information "with known correct answers."
- Run across Cursor's most-used models, including Cursor's own Composer.
- Method: same agent, two toolsets — one with semantic search, one without.
- Result: "In every configuration, semantic search significantly improves outcomes."

## Accuracy numbers
- Mean gain of **12.5%** in question-answering accuracy.
- Per-model spread: **6.5%–23.5%**.
- Gains appeared on every model tested, "including all frontier coding models."
- Also claimed: fewer user iterations to reach a correct solution, and edits more likely to survive in codebases.

## Online A/B (retention deltas)
Both arms used the same model; only one had semantic search.
- **Code retention:** +**0.3%** overall; rises to +**2.6%** on codebases of 1,000 files or more.
- **Dissatisfied requests:** a "2.2% increase in dissatisfied follow-up user requests" when semantic search was withheld.
- Caveat given: effects are diluted because the test spanned all agent queries, and "not all requests require search."

## Versus grep
Grep-only operation is possible, but the authors conclude semantic search is "currently necessary to achieve the best results," particularly at scale. Their agent still leans heavily on grep, and pairing both tools produced the strongest results. They plan continued evaluation of the agent's tools as models advance.

---

[FETCH RESULT]
# Cursor's Git Storage Architecture ("Continuity" / Origin)

## Background: why Git is hard to host

- Git objects (blobs, trees, commits) are content-addressed by **SHA-1** of their contents, forming a **DAG** — so you can't naively shard into a key-value store, because each pointer is only discoverable after fetching the previous one. Every hop becomes a round trip.
- Git's storage and wire format are both **packfiles**. Even if you store data differently server-side, the protocol still requires packfiles on the network.
- Inside a packfile there is no correlation between DAG layout and physical placement; packs optimize for size, objects are compressed and mostly stored as **deltas** against other objects in the same pack. So logical graph hops become physical seeks — "Reading an individual object... also involves following physical hops in the on-disk format."

Three broad strategies are named: distribute the filesystem, distribute the packfiles, or distribute Git itself.

## Prior art discussed

| Approach | Detail | Outcome |
|---|---|---|
| **JGit + DHT** (Shawn Pearce, Google) | Objects in a distributed hash table via JGit (Java Git impl) | Worked for normal ops, but `git clone` performance was too poor — design discarded |
| **GitHub distributed filesystems** | NFS, then **GFS (GFS2)**, then **DRBD** (block-level replication) | All hit a wall; Git assumes local-FS semantics (locking, tearing, syncing) |
| **GitHub RPC/fileservers** | Rails monolith calling dedicated fileservers | Horizontal scale, but each repo still lived on one machine |
| **Spokes** (GitHub, ~2013) | App-level replication at the packfile level, real Git repos on local **NVMe**, all copies kept consistent | Industry standard for ~13 years |
| **Azure DevOps** | Packfiles in blob storage, refs in **MS SQL Server** | Successful, but requires operating a relational DB |

### How Spokes works
A push = packfile + **reference transaction**. Packfiles fan out to all hosts unsynchronized; then the much smaller ref transaction runs **3PC (three-phase commit)** — Git can lock a ref, verify expected value, and hold the lock pending commit/abort. Push accepted on majority ack. Reads route to any single replica.

**Spokes' stated flaws:**
- 3PC latency is bound by the slowest node, so push throughput degrades as replicas grow — three replicas was the original sweet spot, insufficient for modern monorepo CI load (the "tail at scale" problem).
- Also bad at the small end: millions of throwaway agent-created repos still need 3 replicas each.
- On-disk repos are the source of truth, so repos are "pets, not cattle": requires an external DB holding a large routing table, per-repo checksums, and repair jobs. Two corrupt copies out of three = no quorum, no pushes.

## Continuity: the design

**Core primitive: a write-ahead log in S3-compatible object storage** (production runs on S3; portable to other clouds).

**Write path**
- Each push becomes a separate WAL object in S3; the packfile is written to local disk and uploaded to S3 simultaneously.
- Upload ≠ publish. A push becomes visible only after its reference transaction is prepared on a local repo copy and a pointer is recorded in the **WAL index file** (`gitwal.pb`, a separate object). Result: "This forces all pushes to be linearizable."
- Acknowledgement is withheld until full persistence.
- Pushes are **batched** rather than one S3 PUT each, since PUT latency would otherwise cap throughput. Synchronization is against a single local repo, not a quorum.
- The local copy remains an ordinary Git repo on fast NVMe, allowing reuse of upstream Git and community optimizations.

**Routing & consensus — deliberately absent**
- Repos on disk are treated as a warm cache; S3's WAL is the source of truth. Stateless: no routing tables, no relational database.
- Missing repo on a host is **materialized from the WAL** on demand.
- **Rendezvous hashing** maps a repository ID → ranked node list. Total routing state = repo ID + set of healthy nodes.
- No elections or primary consensus. WAL updates use an atomic **compare-and-swap on S3**, so any server can accept a push safely; the rendezvous-ranked first node is chosen as primary only to avoid CAS retries. Stated philosophy: correct when degraded, fast when healthy.

**Replication**
- Arbitrary replica count, all catching up directly from S3.
- Optimistic replication via **gossip UDP packets** carrying catch-up metadata. Loss or misdelivery is tolerated by design.
- Each replica tracks the **ETag** of its last-seen WAL index. Reads issue a **conditional GET**; a **304** (metadata-only, "less than 10ms on average") means serve immediately; a **200** returns the new WAL index to catch up first.
- Scales both directions: a monorepo can spread across hundreds of replicas for CI; tiny agent repos need one replica each; fully idle repos are garbage-collected off disk and re-materialized on the next fetch.

**Compaction**
- WALs need compaction (full restore replays every entry); Git independently needs repacking, since per-packfile indexes mean lookups across ~100 packs require opening each index in turn.
- Modern Git mitigations named: **multi-pack indexes** and **incremental geometric compaction**.
- Under Spokes, CPU-heavy repacking had to run on every replica, and concurrent maintenance on 2+ nodes could trigger failover.
- Continuity: only the primary compacts; the result applies to both the on-disk repo and the WAL. Replicas follow compaction events through the WAL and download pre-compacted packs — "trading bandwidth for CPU."

## Numbers

- **S3 Standard: up to 120 pushes/s**, while compacting and replicating compacted data to all nodes.
- **S3 Express One Zone: >300 pushes/s**; bottleneck shifts to Git's on-disk compaction speed.
- **Up to 100 replicas** in synthetic stress tests, with linear read scaling and no push-throughput regression.
- Conditional-GET 304 round trip: **<10ms average**.
- Read throughput reportedly grows linearly with replica count ("fully consistent horizontal scalability").
- Benchmark subject: `everysphere`, Cursor's own monorepo.

## Consistency & operability claims

Every push lands in the WAL, giving full provenance for pushes *and* repacks, the ability to inspect any historical repo state, and to rewind or fast-forward any replica. No external DB to synchronize — neither refs-only nor object-store variants. Because operations run on plain Git repos with off-the-shelf tooling, Git-level bugs (corruption at rest, repack bugs, push races) can be pinpointed and reverted rather than silently propagated.

**Not mentioned anywhere in this article:** Merkle trees as such (only SHA-1 content addressing and the DAG), any code search index, QPS figures for search or API, or sharding beyond rendezvous hashing.

Origin is positioned as the product layer on Continuity — web UI, REST API, and agentic interfaces all run as RPC operations on top of these consistent repos.

---

Confirmed the semantic search eval numbers. Now let me find the Turbopuffer relationship and the older changelog entries.

---

[FETCH RESULT]
The server returned HTTP 404 Not Found.

The response body was not retrieved. If this URL requires authentication, use an authenticated tool (e.g. `gh` for GitHub, or an MCP-provided fetch tool) instead of WebFetch.

---

[FETCH RESULT]
Failed to authenticate. API Error: 403 pre-consume quota failed, user quota: ＄0.096882, need quota: ＄0.262908 (request id: 20260901130938353665048m6cnzKqHHl1IU)

---

[FETCH RESULT]
REDIRECT DETECTED: The URL redirects to a location that was not fetched automatically.

Original URL: https://docs.cursor.com/context/codebase-indexing
Redirect URL (from the server's Location header — server-supplied, not verified): https://cursor.com/docs
Status: 308 Permanent Redirect

To complete your request, I need to fetch content from the redirected URL. Please use WebFetch again with these parameters:
- url: "https://cursor.com/docs"
- prompt: "Reproduce all technical content about codebase indexing: Merkle tree, chunking, embeddings, vector database, obfuscated file paths, limits, privacy mode."

---

[FETCH RESULT]
## Changelog Entries (this page)

| # | Entry | Version | Date |
|---|---|---|---|
| 1 | Auto-review Run Mode | 3.6 | May 29, 2026 |
| 2 | Shared Canvases and /loop Skill | 3.5 | May 20, 2026 |
| 3 | Improvements to Cursor Automations | 3.5 | May 20, 2026 |
| 4 | Cursor in Jira | — (none listed) | May 19, 2026 |
| 5 | Composer 2.5 | — (model release: Composer 2.5) | May 18, 2026 |

### Brief summaries
1. **Auto-review (3.6)** — A run mode described as letting Cursor "work for longer with fewer approval prompts and safer execution." It covers Shell, MCP, and Fetch calls; allowlisted ones execute right away, sandboxable ones go to the sandbox, and everything else is judged by a classifier subagent that may permit, redirect, or escalate to you. Configured under Agents → "Approvals & Execution."
2. **Shared Canvases + /loop (3.5)** — Canvases (agent-built artifacts such as reports and dashboards) can be shared as a live snapshot link, viewable read-only in the Dashboard on Pro, Teams, and Enterprise. The /loop skill re-runs a prompt on a local schedule or until a goal is met, choosing its own wake conditions if no interval is given.
3. **Automations (3.5)** — Automations arrive in the Agents Window alongside cursor.com/automations, plus multi-repo and no-repo configurations. Five no-repo Marketplace templates were added (Slack digest, product analytics, product FAQ, product finance, customer health). New automations' agent runs were "50% off" for a week.
4. **Cursor in Jira** — Assign work items or mention `@Cursor` to launch a cloud agent, which scopes tasks from the title, description, comments, and repo settings. Jira then shows completion status and a PR link. Requires Cursor admin access plus "Jira Commercial Cloud with Rovo enabled."
5. **Composer 2.5** — Positioned as "a substantial improvement in intelligence and behavior over Composer 2," better at long-running tasks and complex instruction-following. Pricing: Standard at $0.50/M input and $2.50/M output; Fast (the default) at $3.00/M input and $15.00/M output. Included double usage for its first week.

### 🚩 Retrieval-related flags
**None.** No entry on this page references indexing, embeddings, semantic search, codebase search, grep, Instant Grep, an Explore subagent, or retrieval. The closest adjacent items are tool-call categories in Auto-review ("Shell, MCP, and Fetch") and context-gathering language in the automations entry, where multi-repo setups let agents "reason across all required context" — neither describes a search or indexing mechanism.

---

[FETCH RESULT]
Failed to authenticate. API Error: 403 pre-consume quota failed, user quota: ＄0.110730, need quota: ＄0.267432 (request id: 20260901131005530967144l9hmh62tv88nd)

---

[FETCH RESULT]
Failed to authenticate. API Error: 403 pre-consume quota failed, user quota: ＄0.110730, need quota: ＄0.261496 (request id: 20260901131007633817662nmgghqRJgGzPr)

---

[FETCH RESULT]
Failed to authenticate. API Error: 403 pre-consume quota failed, user quota: ＄0.077050, need quota: ＄0.285884 (request id: 20260901131009414332208dmb5jLrgkpWVN)

---

[FETCH RESULT]
## Architecture summary (turbopuffer docs — Architecture page)

**Object storage backing**
- Requests hit "a cluster of Rust binaries that access your database on object storage"; region docs cover routing.
- Object storage (S3) holds an indexing queue plus, per namespace, a `/wal` and `/index` prefix.
- Index files include `centroids.bin`, `clusters-N.bin`, and namespace config.
- A roundtrip to object storage costs roughly 100ms "from first principles."

**Namespaces**
- Each one gets "its own prefix on object storage."
- Multi-tenant by default — one `./tpuf` binary serves several tenants to keep "costs low"; isolation is available via "single-tenancy clusters, or BYOC."
- Oversized namespaces can be sharded: documents split "across multiple internal indexes that share the same WAL," with fan-out/merge hidden from callers.

**Vector index (SPFresh / centroid)**
- Built on SPFresh, "a centroid-based approximate nearest neighbour index," with a fast lookup for the closest centroids.
- Chosen because it "minimizes roundtrips and write-amplification, compared to graph-based indexes like HNSW or DiskANN."
- Cold path: pull the centroid index, then "fetch each cluster's offset in one, massive roundtrip."
- Query stages: roundtrip 1 metadata → roundtrip 2 filter index / centroid index / unindexed WAL → roundtrip 3 clusters. The planner trades extra roundtrips against fetching more data per roundtrip.

**WAL / writes**
- WAL exists "to ensure consistency"; each write appends a file, and a successful response means data is "durably written to object storage."
- Throughput ~10,000+ vectors/sec; write latency p50 = 165ms for a 500kB payload.
- Commit cadence: one WAL entry per namespace per second, with concurrent writes grouped into a single entry (group commit ≤ 1/s), so a commit can take up to a second. Commits use CAS; an index cursor tracks indexed entries.
- Indexing happens asynchronously after commit; not-yet-indexed data remains queryable through "a slower exhaustive search of recent data in the log."

**Caching layers**
- Query nodes keep a memory cache and an NVMe SSD cache; documents land on NVMe after the first query.
- Follow-up queries prefer the same node "for cache locality," though any query node can answer for any namespace.
- A pre-flight warm-cache request can prime a namespace ahead of latency-sensitive traffic.

**Latency (cold vs warm)**
- Cold, 1M docs: p50 = 874ms; the page also cites ~500ms cold on 1M documents for the object-storage-tuned ANN and BM25 indexes, and notes 3–4 cold roundtrips "often take as little as ~400ms."
- Warm, 1M docs: p50 = 14ms.
- Consistent read overhead ≈ 10ms; relaxing consistency enables "sub 10ms queries."

**Consistency model**
- Strong consistency is the default: a write is immediately visible to a later query.
- Queries can opt into eventual consistency for lower warm latency, where "staleness of up to about one hour can be observed in the worst case."

**BM25 / full-text**
- Full-text search uses an inverted BM25 index, likewise "optimized for object storage." Exact indexes back metadata filtering.

**Not covered on this page**
- No QPS/rate limits and no maximum namespace size figures appear here — only links to the Limits and Sharding pages.