# The protocol and integration layer for agent-first coding tools — what

## URLs fetched
- https://modelcontextprotocol.io/specification/latest
- https://agentclientprotocol.com/
- https://agents.md/
- https://modelcontextprotocol.io/llms.txt
- https://agentclientprotocol.com/llms.txt
- https://modelcontextprotocol.io/specification/2026-07-28/changelog.md
- https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md
- https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http.md
- https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/index.md
- https://modelcontextprotocol.io/docs/2026-07-28/develop/clients/client-best-practices.md
- https://modelcontextprotocol.io/extensions/client-matrix.md
- https://agentclientprotocol.com/protocol/v1/overview.md
- https://agentclientprotocol.com/protocol/v2/migration.md

## Content

I'll research this facet thoroughly. Let me start with parallel searches across the major protocol areas.

---

[FETCH RESULT]
> ## Documentation Index
> Fetch the complete documentation index at: https://modelcontextprotocol.io/llms.txt
> Use this file to discover all available pages before exploring further.

# Specification

<div id="enable-section-numbers" />

[Model Context Protocol](https://modelcontextprotocol.io) (MCP) is an open protocol that
enables seamless integration between LLM applications and external data sources and
tools. Whether you're building an AI-powered IDE, enhancing a chat interface, or creating
custom AI workflows, MCP provides a standardized way to connect LLMs with the context
they need.

This specification defines the authoritative protocol requirements, based on the
TypeScript schema in
[schema.ts](https://github.com/modelcontextprotocol/specification/blob/main/schema/2026-07-28/schema.ts).

For implementation guides and examples, visit
[modelcontextprotocol.io](https://modelcontextprotocol.io).

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD
NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be
interpreted as described in [BCP 14](https://datatracker.ietf.org/doc/html/bcp14)
\[[RFC2119](https://datatracker.ietf.org/doc/html/rfc2119)]
\[[RFC8174](https://datatracker.ietf.org/doc/html/rfc8174)] when, and only when, they
appear in all capitals, as shown here.

## Overview

MCP provides a standardized way for applications to:

* Share contextual information with language models
* Expose tools and capabilities to AI systems
* Build composable integrations and workflows

The protocol uses [JSON-RPC](https://www.jsonrpc.org/) 2.0 messages to establish
communication between:

* **Hosts**: LLM applications that initiate connections
* **Clients**: Connectors within the host application
* **Servers**: Services that provide context and capabilities

MCP takes some inspiration from the
[Language Server Protocol](https://microsoft.github.io/language-server-protocol/), which
standardizes how to add support for programming languages across a whole ecosystem of
development tools. In a similar way, MCP standardizes how to integrate additional context
and tools into the ecosystem of AI applications.

## Key Details

### Base Protocol

* [JSON-RPC](https://www.jsonrpc.org/) message format
* Stateless, self-contained requests
* Per-request capability negotiation

### Features

Servers offer any of the following features to clients:

* **Resources**: Context and data, for the user or the AI model to use
* **Prompts**: Templated messages and workflows for users
* **Tools**: Functions for the AI model to execute

Clients may offer the following features to servers:

* **Elicitation**: Server-initiated requests for additional information from users

### Additional Utilities

* Configuration
* Progress tracking
* Cancellation
* Error reporting

### Extensions

Beyond the core protocol, MCP defines optional [extensions](/extensions/overview)
that add modular, specialized, or experimental functionality. Extensions
are always opt-in and require explicit support from both client and server, negotiated
during initialization. Notable extensions include:

* **[Tasks](/extensions/tasks/overview)**: Asynchronous execution of long-running
  operations, with polling, mid-flight input, and durable handles
* **[Skills over MCP](/community/working-groups/skills-over-mcp)**: Rich, structured
  instructions for agent workflows, discovered and consumed through MCP
* **[MCP Apps](/extensions/apps/overview)**: Interactive UI elements (charts, forms,
  video players) rendered inline within conversations

## Security and Trust & Safety

The Model Context Protocol enables powerful capabilities through arbitrary data access
and code execution paths. With this power comes important security and trust
considerations that all implementors must carefully address.

### Key Principles

1. **User Consent and Control**
   * Users must explicitly consent to and understand all data access and operations
   * Users must retain control over what data is shared and what actions are taken
   * Implementors should provide clear UIs for reviewing and authorizing activities

2. **Data Privacy**
   * Hosts must obtain explicit user consent before exposing user data to servers
   * Hosts must not transmit resource data elsewhere without user consent
   * User data should be protected with appropriate access controls

3. **Tool Safety**
   * Tools represent arbitrary code execution and must be treated with appropriate
     caution.
     * In particular, descriptions of tool behavior such as annotations should be
       considered untrusted, unless obtained from a trusted server.
   * Hosts must obtain explicit user consent before invoking any tool
   * Users should understand what each tool does before authorizing its use

### Implementation Guidelines

While MCP itself cannot enforce these security principles at the protocol level,
implementors **SHOULD**:

1. Build robust consent and authorization flows into their applications
2. Provide clear documentation of security implications
3. Implement appropriate access controls and data protections
4. Follow security best practices in their integrations
5. Consider privacy implications in their feature designs

## Learn More

Explore the detailed specification for each protocol component:

<CardGroup cols={5}>
  <Card title="Architecture" icon="sitemap" href="/specification/2026-07-28/architecture" />

  <Card title="Base Protocol" icon="code" href="/specification/2026-07-28/basic" />

  <Card title="Server Features" icon="server" href="/specification/2026-07-28/server" />

  <Card title="Client Features" icon="user" href="/specification/2026-07-28/client" />

  <Card title="Contributing" icon="pencil" href="/community/contributing" />
</CardGroup>


---

[FETCH RESULT]
## What ACP Is

The Agent Client Protocol is a specification that "standardizes communication between code editors/IDEs and coding agents," designed to work whether the agent runs on the same machine or elsewhere.

Its purpose is to break the tight coupling between editors and agents. Today each pairing demands bespoke work, which the page frames as three costs: "Integration overhead," "Limited compatibility," and "Developer lock-in." The stated analogy is the [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) — once an agent speaks ACP it can be used by any conforming editor, and any ACP-aware editor inherits the whole pool of compatible agents, letting each side evolve on its own schedule.

## Architecture

The design starts from the premise that the developer stays in the editor and reaches out to agents for particular tasks. Two deployment shapes are described:

- **Local** — the agent is spawned as a child process of the editor, exchanging JSON-RPC messages over stdio.
- **Remote** — the agent lives in the cloud or on separate infrastructure and is reached over HTTP or WebSocket.

The documentation flags remote support as still maturing, describing it as "a work in progress" while the maintainers work with agentic platforms on cloud-hosting requirements.

Two data-format decisions round out the picture. Where practical, ACP borrows the JSON shapes already defined by MCP, adding its own types only for coding-specific UI needs such as rendering diffs. For anything shown to a human, the default is Markdown, chosen so editors get rich formatting without needing an HTML renderer.

## Not Covered by This Page

Three parts of your question can't be answered from this excerpt:

- **Version number** — no protocol or spec version appears in the text.
- **Implementers** — no particular agents or editors are named; adoption is discussed only in the abstract.
- **Method list** — JSON-RPC is identified as the transport encoding, but no individual methods, parameters, or handshake sequence are enumerated.

The page points to a documentation index at `https://agentclientprotocol.com/llms.txt` as the place to enumerate all available pages, which is where version details, an implementer list, and full method reference would likely be found.

---

[FETCH RESULT]
## What it is

AGENTS.md is described as "A simple, open format for guiding coding agents" — essentially a "README for agents." The idea is that README files serve human contributors, while this separate file holds the build steps, tests, and conventions an AI coding agent needs without cluttering human-facing docs.

## Format

There's no schema or required fields — per the FAQ, "AGENTS.md is just standard Markdown. Use any headings you like." Common sections suggested include project overview, build/test commands, code style, testing instructions, and security considerations. You place it at the repo root, and monorepos can nest additional files per package; the page notes that "Agents automatically read the nearest file in the directory tree." On conflicts: "The closest AGENTS.md to the edited file wins; explicit user chat prompts override everything." Agents will also run listed test commands automatically.

## Adoption numbers

- The site's header says it is "used by over 60k open-source projects" (linking to a GitHub code search), and a later link offers to "View 60k+ examples on GitHub."
- On nesting scale, the page states that "at time of writing the main OpenAI repo has 88 AGENTS.md files."
- Featured example repos: openai/codex, apache/airflow, temporalio/sdk-java, and PlutoLang/Pluto.

## Products listed as compatible

Codex (OpenAI), Jules (Google), Factory, Aider, goose, opencode, Zed, Warp, VS Code, Devin (Cognition), Autopilot & Coded Agents (UiPath), Junie (JetBrains), Amp, Cursor, RooCode, Gemini CLI (Google), Kilo Code, Phoenix, Semgrep, Coding agent (GitHub Copilot), Ona, Windsurf (Cognition), and Augment Code. Two need explicit config: Aider via `read: AGENTS.md` in `.aider.conf.yml`, and Gemini CLI via a `fileName` context setting in `.gemini/settings.json`.

## Origins

The format grew out of joint work across the ecosystem, credited to OpenAI Codex, Amp, Jules from Google, Cursor, and Factory. It is now "stewarded by the Agentic AI Foundation under the Linux Foundation."

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: Tool 'web_search' not found in provided tools [trace_id=724ad16dfa34c39c284ef22340100e07] (request id: 20260901130733932653341lds7rnPzv4CtK)

---

WebSearch appears unavailable. Let me test it once more and go deep with WebFetch in parallel.

---

[FETCH RESULT]
# Agent Client Protocol — Documentation Index

## Get Started
- Introduction — https://agentclientprotocol.com/get-started/introduction.md
- Architecture — https://agentclientprotocol.com/get-started/architecture.md
- Agents — https://agentclientprotocol.com/get-started/agents.md
- Clients — https://agentclientprotocol.com/get-started/clients.md
- ACP Registry — https://agentclientprotocol.com/get-started/registry.md ("The easiest way to find and install ACP-compatible agents.")

## Protocol v1
- Overview — /protocol/v1/overview.md
- Initialization — /protocol/v1/initialization.md
- Authentication — /protocol/v1/authentication.md
- Session Setup — /protocol/v1/session-setup.md
- Session List — /protocol/v1/session-list.md
- Session Delete — /protocol/v1/session-delete.md
- Prompt Turn — /protocol/v1/prompt-turn.md
- Content — /protocol/v1/content.md
- Tool Calls — /protocol/v1/tool-calls.md
- Elicitation — /protocol/v1/elicitation.md
- File System — /protocol/v1/file-system.md
- Cancellation — /protocol/v1/cancellation.md
- Terminals — /protocol/v1/terminals.md
- Agent Plan — /protocol/v1/agent-plan.md
- Session Modes — /protocol/v1/session-modes.md
- Session Config Options — /protocol/v1/session-config-options.md
- Slash Commands — /protocol/v1/slash-commands.md
- Extensibility — /protocol/v1/extensibility.md
- Transports — /protocol/v1/transports.md
- **Schema** — /protocol/v1/schema.md

(Prefix all with `https://agentclientprotocol.com`)

## Protocol v2 (Draft)
- Overview — /protocol/v2/overview.md
- Migrating from v1 — /protocol/v2/migration.md
- Initialization — /protocol/v2/initialization.md
- Authentication — /protocol/v2/authentication.md
- Session Setup — /protocol/v2/session-setup.md (creating and resuming sessions)
- Session List — /protocol/v2/session-list.md
- Session Delete — /protocol/v2/session-delete.md
- Prompt Lifecycle — /protocol/v2/prompt-lifecycle.md
- Content — /protocol/v2/content.md
- Tool Calls — /protocol/v2/tool-calls.md
- Elicitation — /protocol/v2/elicitation.md
- Cancellation — /protocol/v2/cancellation.md
- Agent Plan — /protocol/v2/agent-plan.md
- Session Config Options — /protocol/v2/session-config-options.md
- Slash Commands — /protocol/v2/slash-commands.md
- Extensibility — /protocol/v2/extensibility.md
- Transports — /protocol/v2/transports.md
- **Schema** — /protocol/v2/schema.md

Note: v2 drops the dedicated File System, Terminals, and Session Modes pages found in v1.

## Libraries
Kotlin, Java, Python, Rust, TypeScript, and Community — `/libraries/{kotlin,java,python,rust,typescript,community}.md`

## RFDs (Requests for Dialog)
- About — /rfds/about.md · Updates — /rfds/updates.md
- session-fork, proxy-chains, mcp-over-acp, end-turn-token-usage, diff-delete, next-edit-suggestions, custom-llm-endpoint, plan-operations, tool-call-name, get-auth-state, session-compaction, session-notices, streamable-http-websocket-transport, auth-methods, introduce-rfd-process, session-config-options, acp-agent-registry, session-info-update, session-list, session-resume, session-close, logout-method, additional-directories, meta-propagation, message-id, session-usage, session-delete, model-config-category, rust-sdk-v1, request-cancellation, boolean-config-option, elicitation
- v2 sub-series: /rfds/v2/{overview, prompt, enum-variant-extension, required-session-methods, session-resume-replay, client-filesystem-terminal-capabilities, terminal-output, plan-variants, tool-call-updates, diff-file-states, permission-requests, message-updates}.md

## Community
communication.md, code-of-conduct.md, governance.md, working-interest-groups.md, contributing.md — under `/community/`

## Announcements
elicitation-stabilized, acp-v2-draft, boolean-config-option-stabilized, request-cancellation-stabilized, sdk-1-0-releases, model-config-category-stabilized, message-id-stabilized, session-usage-stabilized, session-delete-stabilized, additional-directories-stabilized, logout-method-stabilized, session-close-stabilized, session-resume-stabilized, transports-working-group, acp-agent-registry-stabilized, session-info-update-stabilized, session-list-stabilized, sergey-ignatov-lead-maintainer, session-config-options-stabilized, implementation-information — under `/announcements/`

## Other
- Publications — /publications.md
- Updates — /updates.md
- Brand — /brand.md
- OpenAPI spec — /api-reference/openapi.json

**On methods:** the index doesn't enumerate individual JSON-RPC methods, but method-level docs live in the schema pages plus topic pages such as session setup/list/delete, prompt turn/lifecycle, authentication, and cancellation. Two methods are named directly in announcement descriptions: `session/delete` and `session/list`.

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: Tool 'web_search' not found in provided tools [trace_id=25fd2c6f109c7e08f252a45e02ed4831] (request id: 20260901130822313456362psfmhFNcrTCrR)

---

[FETCH RESULT]
# Model Context Protocol — Full Documentation Index

Base URL: `https://modelcontextprotocol.io` · All paths end in `.md` (Markdown source); drop `.md` for the HTML page.

**Versions available:** `2026-07-28` (latest), `2025-11-25`, `2025-06-18`, `2025-03-26`, `2024-11-05`, `draft`

---

## 1. Docs (`/docs/{version}/...`)

These pages exist for **every** version. Substitute `{version}`:

| Page | Path |
|---|---|
| What is MCP? | `/docs/{version}/getting-started/intro.md` |
| Architecture overview | `/docs/{version}/learn/architecture.md` |
| Understanding MCP servers | `/docs/{version}/learn/server-concepts.md` |
| Understanding MCP clients | `/docs/{version}/learn/client-concepts.md` |
| Versioning | `/docs/{version}/learn/versioning.md` |
| Connect to local MCP servers | `/docs/{version}/develop/connect-local-servers.md` |
| Connect to remote MCP servers | `/docs/{version}/develop/connect-remote-servers.md` |
| Build with Agent Skills | `/docs/{version}/develop/build-with-agent-skills.md` |
| Build an MCP server | `/docs/{version}/develop/build-server.md` |
| Build an MCP client | `/docs/{version}/develop/build-client.md` |
| Client Best Practices | `/docs/{version}/develop/clients/client-best-practices.md` |
| SDKs | `/docs/{version}/sdk.md` |
| Understanding Authorization in MCP | `/docs/{version}/tutorials/security/authorization.md` |
| Security Best Practices | `/docs/{version}/tutorials/security/security_best_practices.md` |
| MCP Inspector | `/docs/{version}/tools/inspector.md` |
| Debugging | `/docs/{version}/tools/debugging.md` |

**Inspector sub-pages — only in `2026-07-28` and `draft`:**

```
/docs/{2026-07-28|draft}/tools/inspector/web.md            # graphical Inspector, tab-by-tab
/docs/{2026-07-28|draft}/tools/inspector/cli.md            # methods, output formats, exit codes, CI
/docs/{2026-07-28|draft}/tools/inspector/tui.md            # terminal client, keyboard reference
/docs/{2026-07-28|draft}/tools/inspector/configuration.md  # catalog vs. config files, env vars
/docs/{2026-07-28|draft}/tools/inspector/authorization.md  # OAuth, re-auth mid-session, token sharing
/docs/{2026-07-28|draft}/tools/inspector/protocol-eras.md  # legacy vs. modern MCP negotiation
/docs/{2026-07-28|draft}/tools/inspector/recipes.md        # transports, configs, MCP Apps, Docker
```

**Unversioned:** `/examples.md` — Example Servers

---

## 2. Specification

### 2026-07-28 & draft (restructured spec)

```
/specification/{2026-07-28|draft}/index.md
/specification/{2026-07-28|draft}/changelog.md          # "Key Changes" (2026-07-28) / "Changelog" (draft)
/specification/{2026-07-28|draft}/deprecated.md         # Deprecated Features
/specification/{2026-07-28|draft}/architecture/index.md
/specification/{2026-07-28|draft}/basic/index.md
/specification/{2026-07-28|draft}/basic/versioning.md   # Versioning and Compatibility

# Patterns (replaces basic/utilities)
/specification/{...}/basic/patterns/index.md
/specification/{...}/basic/patterns/mrtr.md             # Multi Round-Trip Requests
/specification/{...}/basic/patterns/subscriptions.md
/specification/{...}/basic/patterns/cancellation.md
/specification/{...}/basic/patterns/progress.md

# Transports (split into per-transport pages)
/specification/{...}/basic/transports/index.md
/specification/{...}/basic/transports/stdio.md
/specification/{...}/basic/transports/streamable-http.md

# Authorization (split into sub-pages)
/specification/{...}/basic/authorization/index.md
/specification/{...}/basic/authorization/authorization-server-discovery.md
/specification/{...}/basic/authorization/client-registration.md
/specification/{...}/basic/authorization/security-considerations.md

# Client features
/specification/{...}/client/roots.md
/specification/{...}/client/sampling.md
/specification/{...}/client/elicitation.md

# Server features
/specification/{...}/server/index.md
/specification/{...}/server/discover.md                 # NEW: Discovery
/specification/{...}/server/prompts.md
/specification/{...}/server/resources.md
/specification/{...}/server/tools.md
/specification/{...}/server/utilities/caching.md        # NEW: Caching
/specification/{...}/server/utilities/completion.md
/specification/{...}/server/utilities/logging.md
/specification/{...}/server/utilities/pagination.md

/specification/{2026-07-28|draft}/schema.md             # Schema Reference
```

### 2025-11-25

```
/specification/2025-11-25/index.md
/specification/2025-11-25/changelog.md                  # Key Changes
/specification/2025-11-25/architecture/index.md
/specification/2025-11-25/basic/index.md
/specification/2025-11-25/basic/lifecycle.md
/specification/2025-11-25/basic/transports.md           # single-page transports
/specification/2025-11-25/basic/authorization.md        # single-page authorization
/specification/2025-11-25/basic/utilities/cancellation.md
/specification/2025-11-25/basic/utilities/ping.md
/specification/2025-11-25/basic/utilities/progress.md
/specification/2025-11-25/basic/utilities/tasks.md      # Tasks (in-spec here)
/specification/2025-11-25/client/roots.md
/specification/2025-11-25/client/sampling.md
/specification/2025-11-25/client/elicitation.md
/specification/2025-11-25/server/index.md
/specification/2025-11-25/server/prompts.md
/specification/2025-11-25/server/resources.md
/specification/2025-11-25/server/tools.md
/specification/2025-11-25/server/utilities/completion.md
/specification/2025-11-25/server/utilities/logging.md
/specification/2025-11-25/server/utilities/pagination.md
/specification/2025-11-25/schema.md
```

### 2025-06-18

Same as 2025-11-25 **minus** `basic/utilities/tasks.md`:

```
index.md · changelog.md · architecture/index.md · basic/index.md · basic/lifecycle.md
basic/transports.md · basic/authorization.md
basic/utilities/{cancellation,ping,progress}.md
client/{roots,sampling,elicitation}.md
server/index.md · server/{prompts,resources,tools}.md
server/utilities/{completion,logging,pagination}.md · schema.md
```

### 2025-03-26

Same as 2025-06-18 **minus** `client/elicitation.md` and **minus** `schema.md`:

```
index.md · changelog.md · architecture/index.md · basic/index.md · basic/lifecycle.md
basic/transports.md · basic/authorization.md
basic/utilities/{cancellation,ping,progress}.md
client/{roots,sampling}.md
server/index.md · server/{prompts,resources,tools}.md
server/utilities/{completion,logging,pagination}.md
```

### 2024-11-05 (original)

No changelog, no authorization, no elicitation, no schema; adds `basic/messages.md`:

```
/specification/2024-11-05/index.md
/specification/2024-11-05/architecture/index.md
/specification/2024-11-05/basic/index.md
/specification/2024-11-05/basic/lifecycle.md
/specification/2024-11-05/basic/messages.md            # only in this version
/specification/2024-11-05/basic/transports.md
/specification/2024-11-05/basic/utilities/{cancellation,ping,progress}.md
/specification/2024-11-05/client/{roots,sampling}.md
/specification/2024-11-05/server/index.md
/specification/2024-11-05/server/{prompts,resources,tools}.md
/specification/2024-11-05/server/utilities/{completion,logging,pagination}.md
```

**Changelog quick links:** `2026-07-28`, `2025-11-25`, `2025-06-18`, `2025-03-26`, `draft` → `/specification/{version}/changelog.md` (none for `2024-11-05`). Deprecation pages exist only for `2026-07-28` and `draft` → `/specification/{version}/deprecated.md`.

---

## 3. Extensions (unversioned)

| Page | URL |
|---|---|
| Extensions Overview | `/extensions/overview.md` |
| Extension Support Matrix (which clients implement what) | `/extensions/client-matrix.md` |
| MCP Apps — interactive UI in hosts | `/extensions/apps/overview.md` |
| Build an MCP App | `/extensions/apps/build.md` |
| Authorization Extensions overview | `/extensions/auth/overview.md` |
| OAuth Client Credentials (machine-to-machine) | `/extensions/auth/oauth-client-credentials.md` |
| Enterprise-Managed Authorization (IdP-centralized) | `/extensions/auth/enterprise-managed-authorization.md` |
| Tasks (async long-running operations) | `/extensions/tasks/overview.md` |

---

## 4. Registry

```
/registry/about.md                  # The MCP Registry
/registry/quickstart.md             # Publish a server to the registry
/registry/faq.md
/registry/package-types.md          # Supported package types
/registry/remote-servers.md         # Publishing remote servers
/registry/authentication.md         # Auth when publishing
/registry/versioning.md             # Versioning published servers
/registry/github-actions.md         # Automate publishing
/registry/moderation-policy.md
/registry/registry-aggregators.md
/registry/terms-of-service.md
```

---

## 5. SEPs (Specification Enhancement Proposals) — `/seps/...`

Index: `/seps/index.md`

| SEP | Title | Slug |
|---|---|---|
| 414 | OpenTelemetry Trace Context Propagation | `414-request-meta.md` |
| 932 | MCP Governance | `932-model-context-protocol-governance.md` |
| 973 | Additional metadata for Implementations/Resources/Tools/Prompts | `973-expose-additional-metadata-for-implementations-res.md` |
| 985 | Align OAuth 2.0 Protected Resource Metadata w/ RFC 9728 | `985-align-oauth-20-protected-resource-metadata-with-rf.md` |
| 986 | Specify Format for Tool Names | `986-specify-format-for-tool-names.md` |
| 990 | Enterprise IdP policy controls in OAuth flows | `990-enable-enterprise-idp-policy-controls-during-mcp-o.md` |
| 991 | URL-based Client Registration (Client ID Metadata Docs) | `991-enable-url-based-client-registration-using-oauth-c.md` |
| 994 | Shared Communication Practices/Guidelines | `994-shared-communication-practicesguidelines.md` |
| 1024 | Client Security Reqs for Local Server Installation | `1024-mcp-client-security-requirements-for-local-server-.md` |
| 1034 | Default values for primitive types in elicitation schemas | `1034--support-default-values-for-all-primitive-types-in.md` |
| 1036 | URL Mode Elicitation (out-of-band) | `1036-url-mode-elicitation-for-secure-out-of-band-intera.md` |
| 1046 | OAuth client credentials flow | `1046-support-oauth-client-credentials-flow-in-authoriza.md` |
| 1302 | Formalize Working/Interest Groups | `1302-formalize-working-groups-and-interest-groups-in-mc.md` |
| 1303 | Input Validation Errors as Tool Execution Errors | `1303-input-validation-errors-as-tool-execution-errors.md` |
| 1319 | Decouple Request Payload from RPC Methods | `1319-decouple-request-payload-from-rpc-methods-definiti.md` |
| 1330 | Elicitation Enum Schema Improvements | `1330-elicitation-enum-schema-improvements-and-standards.md` |
| 1577 | Sampling With Tools | `1577--sampling-with-tools.md` |
| 1613 | JSON Schema 2020-12 as Default Dialect | `1613-establish-json-schema-2020-12-as-default-dialect-f.md` |
| 1686 | Tasks | `1686-tasks.md` |
| 1699 | SSE polling via server-side disconnect | `1699-support-sse-polling-via-server-side-disconnect.md` |
| 1730 | SDKs Tiering System | `1730-sdks-tiering-system.md` |
| 1850 | PR-Based SEP Workflow | `1850-pr-based-sep-workflow.md` |
| 1865 | MCP Apps — Interactive UIs | `1865-mcp-apps-interactive-user-interfaces-for-mcp.md` |
| 2085 | Governance Succession and Amendment | `2085-governance-succession-and-amendment.md` |
| 2106 | Tools `inputSchema`/`outputSchema` → JSON Schema 2020-12 | `2106-json-schema-2020-12.md` |
| 2133 | Extensions | `2133-extensions.md` |
| 2148 | MCP Contributor Ladder | `2148-contributor-ladder.md` |
| 2149 | Group Governance & Charter Template | `2149-working-group-charter-template.md` |
| 2164 | Standardize Resource Not Found Error Code | `2164-resource-not-found-error.md` |
| 2207 | OIDC-Flavored Refresh Token Guidance | `2207-oidc-refresh-token-guidance.md` |
| 2243 | HTTP Header Standardization (Streamable HTTP) | `2243-http-standardization.md` |
| 2260 | Server requests must associate w/ Client request | `2260-Require-Server-requests-to-be-associated-with-Client-requests.md` |
| 2322 | Multi Round-Trip Requests | `2322-MRTR.md` |
| 2468 | Recommend Issuer (`iss`) in Auth Responses | `2468-recommend-issuer-claim-for-auth.md` |
| 2484 | Conformance Tests required for Final SEPs | `2484-conformance-tests-required-for-final-seps.md` |
| 2549 | TTL for List Results | `2549-TTL-for-list-results.md` |
| 2567 | Sessionless MCP via Explicit State Handles | `2567-sessionless-mcp.md` |
| 2575 | Make MCP Stateless | `2575-stateless-mcp.md` |
| 2577 | Deprecate Roots, Sampling, and Logging | `2577-deprecate-roots-sampling-and-logging.md` |
| 2596 | Feature Lifecycle & Deprecation Policy | `2596-spec-feature-lifecycle-and-deprecation.md` |
| 2663 | Tasks Extension | `2663-tasks-extension.md` |

---

## 6. Community, Governance & Development

```
/community/contributing.md              # How to contribute
/community/communication.md             # Contributor communication
/community/working-interest-groups.md   # WG vs. IG governance rules
/community/charter-template.md          # Group Charter Template
/community/design-principles.md
/community/sep-guidelines.md
/community/governance.md                # Governance and Stewardship
/community/contributor-ladder.md
/community/feature-lifecycle.md         # Active → Deprecated → Removed
/community/sdk-tiers.md                 # SDK Tiering System
/community/security.md                  # Security Policy / vuln reporting
/community/antitrust.md
/development/roadmap.md                 # Roadmap
```

**Working Groups** (`/community/working-groups/`):
`agents.md` · `file-uploads.md` · `inspector-v2.md` · `interceptors.md` · `registry.md` · `sdk.md` · `server-card.md` · `skills-over-mcp.md` · `transports.md` · `triggers-events.md`

**Interest Groups** (`/community/interest-groups/`):
`auth.md` · `enterprise.md` · `enterprise-managed-authorization.md` · `financial-services.md` · `primitive-grouping.md` · `security.md` · `tool-annotations.md`

---

### Notable structural changes worth knowing

- **Transports:** single `basic/transports.md` (2024-11-05 → 2025-11-25) split into `basic/transports/{index,stdio,streamable-http}.md` in 2026-07-28/draft.
- **Authorization:** absent in 2024-11-05; single `basic/authorization.md` from 2025-03-26; split into 4 pages (`index`, `authorization-server-discovery`, `client-registration`, `security-considerations`) in 2026-07-28/draft.
- **Utilities → Patterns:** `basic/utilities/*` (cancellation, ping, progress, tasks) became `basic/patterns/*` (mrtr, subscriptions, cancellation, progress) — `ping` and `lifecycle` pages are gone in 2026-07-28/draft, replaced by `basic/versioning.md`.
- **Tasks** moved from in-spec (`2025-11-25/basic/utilities/tasks.md`) to an extension (`/extensions/tasks/overview.md`).
- **New in 2026-07-28/draft:** `server/discover.md`, `server/utilities/caching.md`, `deprecated.md`.

---

Rich index. Let me hit the critical MCP spec pages in parallel.

---

[FETCH RESULT]
> ## Documentation Index
> Fetch the complete documentation index at: https://modelcontextprotocol.io/llms.txt
> Use this file to discover all available pages before exploring further.

# Key Changes

<div id="enable-section-numbers" />

This document lists changes made to the Model Context Protocol (MCP) specification since
the previous revision, [2025-11-25](/specification/2025-11-25).

## Major changes

1. Remove protocol-level sessions and the `Mcp-Session-Id` header from the Streamable HTTP transport. List endpoints (`tools/list`, `resources/list`, `prompts/list`) no longer vary per-connection. Servers that need cross-call state use explicit, server-minted handles passed as ordinary tool arguments ([SEP-2567](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2567)).

2. Make MCP stateless: remove the `initialize`/`notifications/initialized` handshake. Every request now carries its protocol version and client capabilities in `_meta` (`io.modelcontextprotocol/protocolVersion`, `io.modelcontextprotocol/clientCapabilities`). Clients SHOULD identify themselves on each request (`io.modelcontextprotocol/clientInfo`), and servers SHOULD identify themselves in each result's `_meta` (`io.modelcontextprotocol/serverInfo`). Version mismatches return `UnsupportedProtocolVersionError` ([SEP-2575](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2575)).

3. Add `server/discover`: servers MUST implement this RPC to advertise their supported protocol versions, capabilities, and identity. Clients MAY call it before any other request for up-front version selection, or use it as a backward-compatibility probe on STDIO ([SEP-2575](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2575)).

4. Replace the HTTP GET endpoint and `resources/subscribe`/`resources/unsubscribe` with `subscriptions/listen`: a single long-lived POST-response stream for opted-in server-to-client change notifications. Clients opt in to specific types (`toolsListChanged`, `promptsListChanged`, `resourcesListChanged`, `resourceSubscriptions`); the server acknowledges and tags notifications with `io.modelcontextprotocol/subscriptionId`. Request-scoped notifications such as `notifications/progress` and `notifications/message` continue to flow on the response stream of the request they relate to, not the `subscriptions/listen` stream ([SEP-2575](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2575)).

5. Remove `ping`, `logging/setLevel`, and `notifications/roots/list_changed`. Log level is now set per-request via `io.modelcontextprotocol/logLevel` in `_meta`; servers MUST NOT emit `notifications/message` for requests that did not include this field ([SEP-2575](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2575)).

6. Move experimental tasks out of the core protocol and into an official extension (`io.modelcontextprotocol/tasks`). The redesigned extension replaces the blocking `tasks/result` method with polling via `tasks/get` and a new `tasks/update` for client-to-server input, removes `tasks/list`, and allows servers to return task handles unsolicited without per-request opt-in ([SEP-2663](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2663)).

7. Multi Round-Trip Requests (MRTR) pattern introduced which replaces the previous approach of sending server-initiated requests, such as `roots/list`, `sampling/createMessage`, or `elicitation/create`. Servers return an `InputRequiredResult` (`resultType: "input_required"`) whose `inputRequests` field carries the requests for the additional information needed to process the request. Clients respond with `inputResponses` on a retry of the original request providing the requested information. ([SEP-2322](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2322)).

8. All results now carry a required `resultType` field: `"complete"` for ordinary results and `"input_required"` for [multi round-trip request](/specification/2026-07-28/basic/patterns/mrtr) interim results. Clients **MUST** treat results from earlier-protocol servers that omit the field as `"complete"` ([SEP-2322](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2322)).

9. Remove SSE stream resumability and message redelivery (the `Last-Event-ID` header and SSE event IDs) from the Streamable HTTP transport. A broken response stream loses the in-flight request; clients **MUST** re-issue it as a new request with a new request ID ([SEP-2575](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2575)).

## Minor changes

1. Add `extensions` field to `ClientCapabilities` and `ServerCapabilities` to support optional [extensions](/docs/extensions/overview) beyond the core protocol.
2. Document OpenTelemetry trace context propagation conventions for `_meta` keys (`traceparent`, `tracestate`, `baggage`) ([SEP-414](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/414)).
3. Servers **SHOULD** return tools from `tools/list` in a deterministic order to enable client-side caching and improve LLM prompt cache hit rates.
4. Require standard MCP request headers (`Mcp-Method`, `Mcp-Name`) on Streamable HTTP POST requests, and add support for custom headers from tool parameters via `x-mcp-header` ([SEP-2243](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2243)).
5. Require `ttlMs` and `cacheScope` fields on results returned by `tools/list`, `prompts/list`, `resources/list`, `resources/read`, and `resources/templates/list` via a new `CacheableResult` interface. `ttlMs` is a freshness hint (in milliseconds) allowing clients to cache responses and reduce polling; `cacheScope` (`"public"` or `"private"`) controls whether shared intermediaries may cache the response. Both fields complement existing `listChanged` notifications ([SEP-2549](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2549)).
6. Change resource not found error code from `-32002` to `-32602` (Invalid Params) to align with JSON-RPC specification.
7. Authorization servers **SHOULD** include the `iss` parameter in authorization responses per
   [RFC 9207](https://datatracker.ietf.org/doc/html/rfc9207), and MCP clients **MUST** validate a
   present `iss` against the recorded issuer before redeeming the authorization code
   ([SEP-2468](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2468)).
8. Require MCP clients to specify an appropriate `application_type` during Dynamic Client
   Registration to avoid OpenID Connect redirect URI conflicts
   ([SEP-837](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/837)).
9. Clarify that client credentials are bound to the authorization server that issued them:
   clients **MUST** key persisted credentials by the issuer identifier, **MUST NOT** reuse them
   with a different authorization server, and **MUST** re-register when the authorization server
   changes ([SEP-2352](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2352)).
10. Loosen `inputSchema` and `outputSchema` to allow any JSON Schema 2020-12 keywords, and
    `structuredContent` to allow any JSON value. Add `$ref` resolution requirements and
    composition-keyword resource bounds
    ([SEP-2106](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2106)).
11. Remove the `notifications/elicitation/complete` notification and the
    `elicitationId` field of URL mode elicitation requests, both introduced in
    `2025-11-25`. Under the
    [Multi Round-Trip Requests](/specification/2026-07-28/basic/patterns/mrtr) pattern, the
    client learns the outcome of an out-of-band interaction by retrying the original
    request, so a server-initiated completion signal — and the identifier used to
    correlate it — no longer fit the protocol. Servers needing to correlate an
    elicitation across retries encode their own identifier in `requestState`.
12. Define an [error code allocation policy](/specification/2026-07-28/basic/index#error-codes)
    partitioning the JSON-RPC server-error range: `-32000` to `-32019` remains
    implementation-defined (existing SDK usage is grandfathered), `-32020` to `-32099` is
    reserved for the MCP specification. Renumber the error codes introduced in this draft
    accordingly — `HeaderMismatch` `-32001` → `-32020`, `MissingRequiredClientCapability`
    `-32003` → `-32021`, `UnsupportedProtocolVersion` `-32004` → `-32022` — and add
    `HeaderMismatchError` to the schema, which previously existed only in transport prose.

## Deprecated

Features listed here remain part of the specification but are scheduled for removal under the [feature lifecycle and deprecation policy](/community/feature-lifecycle). New implementations should not adopt them. The [deprecated features registry](/specification/2026-07-28/deprecated) tracks every feature currently in the Deprecated state.

1. Deprecate the Roots, Sampling, and Logging features
   ([SEP-2577](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2577)).
   These features remain fully functional during the deprecation window but new
   implementations should not add support for them. Suggested migrations: pass
   directories or files via tool parameters, resource URIs, or server
   configuration instead of Roots; integrate directly with LLM provider APIs
   instead of Sampling; log to `stderr` (stdio) or use OpenTelemetry instead of
   Logging.

2. Reclassify the HTTP+SSE transport (deprecated since protocol version
   `2025-03-26`) as Deprecated under the feature lifecycle policy
   ([SEP-2596](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596)).
   Migrate to [Streamable HTTP](/specification/2026-07-28/basic/transports/streamable-http).

3. Reclassify the `includeContext` values `"thisServer"` and `"allServers"`
   (soft-deprecated since protocol version `2025-11-25`) as Deprecated
   ([SEP-2596](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596)).
   Omit the field or use `"none"`; these values will be removed no later than
   the Sampling feature itself.

4. Deprecate the OAuth 2.0 Dynamic Client Registration Protocol
   ([RFC7591](https://datatracker.ietf.org/doc/html/rfc7591)) as a client registration
   mechanism in favor of
   [Client ID Metadata Documents](/specification/2026-07-28/basic/authorization/client-registration#client-id-metadata-documents)
   ([PR #2858](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2858)).
   It remains available for backwards compatibility with authorization servers that do
   not support Client ID Metadata Documents.

## Other schema changes

1. `schema.json` now correctly reflects that the Typescript definition of minimum/maximum/default are `number`'s and not just `integers`. This was caused by running the generator using `--defaultNumberType integer` ([PR#2710](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2710)).

## Governance and process updates

1. Adopt a specification
   [feature lifecycle and deprecation policy](/community/feature-lifecycle)
   defining the Active, Deprecated, and Removed feature states, a minimum
   twelve-month deprecation window, and a
   [registry of deprecated features](/specification/2026-07-28/deprecated)
   ([SEP-2596](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596)).

## Process changes

1. Formalize PR-based SEP workflow with markdown files in `seps/` directory, PR-derived numbering, sponsor responsibilities, and status management via PR labels ([SEP-1850](https://github.com/modelcontextprotocol/specification/pull/1850)).

## Full changelog

For a complete list of all changes that have been made since the last protocol revision,
[see GitHub](https://github.com/modelcontextprotocol/specification/compare/2025-11-25...2026-07-28).


---

[FETCH RESULT]
> ## Documentation Index
> Fetch the complete documentation index at: https://modelcontextprotocol.io/llms.txt
> Use this file to discover all available pages before exploring further.

# Deprecated Features

<div id="enable-section-numbers" />

This page is the registry of specification features that are currently in the
**Deprecated** state under the
[feature lifecycle and deprecation policy](/community/feature-lifecycle)
([SEP-2596](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596)).

A Deprecated feature remains part of the specification but is scheduled for
removal: new implementations **SHOULD NOT** adopt it, and existing
implementations **SHOULD** migrate before the feature's earliest removal. The
earliest removal marks when a feature becomes *eligible* for removal; the
actual removal is a Core Maintainer decision taken during release preparation
and may happen later.

This registry is a derived view kept consistent with the per-feature
deprecation notices and changelog entries, which are the normative records.

## Deprecated

| Feature                                                                                                                      | Deprecation SEP                                                                    | Deprecated in | Migration path                                                                                                                 | Earliest removal                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| [Roots](/specification/2026-07-28/client/roots)                                                                              | [SEP-2577](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2577) | `2026-07-28`  | Pass directories or files via tool parameters, resource URIs, or server configuration                                          | First revision released on or after 2027-07-28                                                        |
| [Sampling](/specification/2026-07-28/client/sampling)                                                                        | [SEP-2577](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2577) | `2026-07-28`  | Integrate directly with LLM provider APIs                                                                                      | First revision released on or after 2027-07-28                                                        |
| [Logging](/specification/2026-07-28/server/utilities/logging)                                                                | [SEP-2577](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2577) | `2026-07-28`  | Log to `stderr` for stdio transports; use [OpenTelemetry](https://opentelemetry.io/) for observability                         | First revision released on or after 2027-07-28                                                        |
| [Dynamic Client Registration](/specification/2026-07-28/basic/authorization/client-registration#dynamic-client-registration) | [PR #2858](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2858) | `2026-07-28`  | [Client ID Metadata Documents](/specification/2026-07-28/basic/authorization/client-registration#client-id-metadata-documents) | First revision released on or after 2027-07-28                                                        |
| `includeContext: "thisServer"` / `"allServers"` ([Sampling](/specification/2026-07-28/client/sampling#capabilities))         | [SEP-2596](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596) | `2025-11-25`  | Omit the field or use `"none"`                                                                                                 | Follows Sampling ([SEP-2577](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2577)) |
| [HTTP+SSE transport](/specification/2024-11-05/basic/transports#http-with-sse)                                               | [SEP-2596](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596) | `2025-03-26`  | [Streamable HTTP](/specification/2026-07-28/basic/transports/streamable-http)                                                  | Three months after SEP-2596 reaches Final                                                             |

The HTTP+SSE transport and the `includeContext` values were already described
as deprecated before the lifecycle policy existed; SEP-2596 reclassifies them
as Deprecated under its [transition provisions](/community/feature-lifecycle).

## Removed

No features have been removed under this policy yet. When a Deprecated feature
is removed, its row moves to this section with a link to the changelog entry
recording the removal.


---

[FETCH RESULT]
> ## Documentation Index
> Fetch the complete documentation index at: https://modelcontextprotocol.io/llms.txt
> Use this file to discover all available pages before exploring further.

# Streamable HTTP

<div id="enable-section-numbers" />

<Info>
  Streamable HTTP was introduced in protocol version 2025-03-26 as a replacement
  for the [HTTP+SSE transport][http-sse] from protocol version 2024-11-05.
</Info>

<Info>
  Revision 2026-07-28 changed the behavior of Streamable HTTP. Clients must
  ensure they handle backwards compatibility correctly. Changes included:

  * Removal of the GET stream endpoint.
  * Removal of protocol-level sessions.

  See the [changelog](/specification/2026-07-28/changelog) and
  [Backward Compatibility](#backward-compatibility) below.
</Info>

In the **Streamable HTTP** transport, the server operates as an independent
process that can handle multiple client connections. At a glance:

* The server exposes a single HTTP endpoint (the **MCP endpoint**) that
  accepts POST.
* The client sends every JSON-RPC request or notification as its own HTTP
  POST.
* The server answers each request with either a single JSON object or a
  [Server-Sent Events][sse] (SSE) stream scoped to that request, carrying
  request-related notifications followed by the final response.
* Server-to-client interactions (sampling, elicitation, roots) are embedded
  in results as input requests per
  [Multi Round-Trip Requests (MRTR)][mrtr] ([SEP-2322][sep-2322]).
* Long-lived change notifications (such as list changes and resource updates)
  are delivered on the response stream of a
  [`subscriptions/listen`][subscriptions-listen] request.

See [Message Flow](#message-flow) for sequence diagrams of these
interactions.

The server **MUST** provide a single HTTP endpoint path (hereafter referred to
as the **MCP endpoint**) that supports POST. For example, this could be a URL
like `https://example.com/mcp`.

[http-sse]: /specification/2024-11-05/basic/transports#http-with-sse

[sse]: https://en.wikipedia.org/wiki/Server-sent_events

## Security & Endpoint

When implementing Streamable HTTP transport:

1. Servers **MUST** validate the `Origin` header on all incoming connections
   to prevent DNS rebinding attacks.
   * If the `Origin` header is present and invalid, servers **MUST** respond
     with HTTP 403 Forbidden. The HTTP response body **MAY** comprise a
     JSON-RPC *error response* that has no `id`.
2. When running locally, servers **SHOULD** bind only to localhost
   (127.0.0.1) rather than all network interfaces (0.0.0.0).
3. Servers **SHOULD** implement proper authentication for all connections.

Without these protections, attackers could use DNS rebinding to interact with
local MCP servers from remote websites.

## Sending Messages

Every JSON-RPC message sent from the client **MUST** be a new HTTP POST
request to the MCP endpoint.

1. The client **MUST** use HTTP POST to send JSON-RPC messages.
2. The client **MUST** include an `Accept` header listing both
   `application/json` and `text/event-stream` as supported content types.
3. The client **MUST** include the [request metadata headers](#request-metadata)
   on each POST request.
4. The body of the HTTP POST **MUST** be a single JSON-RPC *request* or
   *notification*. The client **MUST NOT** send JSON-RPC *responses*.
5. If the body is a JSON-RPC *notification*:
   * If the server accepts it, the server **MUST** return HTTP status code
     `202 Accepted` with no body.
   * If the server cannot accept it, it **MUST** return an HTTP error status
     code (e.g., `400 Bad Request`). The HTTP response body **MAY** comprise
     a JSON-RPC *error response* that has no `id`.
6. If the body is a JSON-RPC *request*, the server **MUST** return either
   `Content-Type: application/json` (a single JSON object) or
   `Content-Type: text/event-stream` (an SSE response stream). The client
   **MUST** support both.

<Note>
  This revision of the core protocol defines no client-to-server
  *notifications* over Streamable HTTP. The only client-sent notification in
  the core protocol, `notifications/cancelled`, is used only on the
  [stdio](/specification/2026-07-28/basic/transports/stdio) transport; on
  Streamable HTTP, closing the SSE response stream is itself the cancellation
  signal and no `notifications/cancelled` message is expected (see
  [Cancellation][cancellation]). The notification rules above describe the
  transport mechanics for a notification POST; header requirements for
  notification POSTs are not defined by this revision.
</Note>

## Receiving Messages

When the server returns an SSE response stream
(`Content-Type: text/event-stream`):

* The server **MAY** send JSON-RPC *notifications* — for example,
  [`notifications/progress`][notifications-progress]
  or [`notifications/message`][notifications-message] —
  before the final response. These notifications **MUST** relate to the
  originating client request.
* The server **MUST NOT** send independent JSON-RPC *requests* on this stream.
  Server-to-client interactions (sampling, elicitation, list-roots) are
  embedded as input requests inside an
  [`InputRequiredResult`][input-required-result] per
  [MRTR][mrtr] ([SEP-2322][sep-2322]), not delivered as separate requests on
  this or any other stream. This is a change from Streamable HTTP in protocol
  versions `2025-03-26` through `2025-11-25`, where servers could send such
  requests on SSE streams.
* The final JSON-RPC *response* **SHOULD** terminate the stream.

Long-lived notification streams are obtained by sending a
[`subscriptions/listen`][subscriptions-listen]
request. The server's response is itself an SSE stream that stays open and
delivers the change notifications the client opted in to (such as
`notifications/tools/list_changed` or `notifications/resources/updated`).
Request-scoped notifications like `notifications/progress` and
`notifications/message` are **not** delivered on the listen stream — they
flow only on the response stream of the request they relate to.

When initiating an SSE stream, servers **SHOULD** include the
`X-Accel-Buffering: no` header in the HTTP response. This instructs reverse
proxies (such as nginx) to disable response buffering, ensuring that SSE
events are delivered to clients immediately rather than being held in a
buffer. Without this header, proxies may accumulate messages before sending
them to the client, introducing unwanted latency and potentially breaking the
real-time nature of SSE communication.

<Note>
  For long-lived streams — in particular the
  [`subscriptions/listen`][subscriptions-listen] response stream — servers are
  encouraged to periodically emit an SSE comment line (a line beginning with a
  colon, e.g. `:\r\n`) as a keep-alive. This keeps the connection from being
  closed by intermediaries or client idle timeouts during quiet periods when no
  notifications are flowing. Per the [SSE specification][sse], any line beginning
  with a colon is a comment that carries no event data; clients must ignore such
  lines and must not treat them as malformed input.
</Note>

Resumable SSE streams via `Last-Event-ID` are not supported.

[notifications-progress]: /specification/2026-07-28/basic/patterns/progress

[notifications-message]: /specification/2026-07-28/server/utilities/logging

[input-required-result]: /specification/2026-07-28/schema#inputrequiredresult

[mrtr]: /specification/2026-07-28/basic/patterns/mrtr

[sep-2322]: /seps/2322-MRTR

[subscriptions-listen]: /specification/2026-07-28/basic/patterns/subscriptions

## Message Flow

The following diagrams illustrate the message flows on a single MCP endpoint.

**Requests and responses.** Each request is its own POST; the server chooses
per request whether to respond with a single JSON object or an SSE stream:

```mermaid theme={null}
sequenceDiagram
    participant Client
    participant Server

    note over Client,Server: Simple response
    Client->>Server: POST tools/call (JSON-RPC request)
    Server-->>Client: 200 OK, application/json<br/>JSON-RPC response

    note over Client,Server: Streaming response
    Client->>Server: POST tools/call (JSON-RPC request)
    note over Server: Opens SSE stream<br/>scoped to this request
    Server-->>Client: SSE: notifications/progress
    Server-->>Client: SSE: notifications/progress
    Server-->>Client: SSE: JSON-RPC response
    note over Client,Server: Stream closes

    note over Client,Server: Notification
    Client->>Server: POST (JSON-RPC notification)
    Server-->>Client: 202 Accepted
```

**Server-to-client interactions (MRTR).** When the server needs input from
the client — sampling, elicitation, or roots — it does not send its own
JSON-RPC request. It returns an
[`InputRequiredResult`][input-required-result] containing `inputRequests`,
and the client retries the original request with the matching
`inputResponses` (see [Multi Round-Trip Requests][mrtr]):

```mermaid theme={null}
sequenceDiagram
    participant Client
    participant Server

    Client->>Server: POST tools/call (id: 1)
    note over Server: Needs user input or<br/>an LLM completion
    Server-->>Client: InputRequiredResult<br/>(inputRequests: elicitation/create)
    note over Client: Gathers the requested input
    Client->>Server: POST tools/call (id: 2)<br/>(original params + inputResponses)
    Server-->>Client: Final result
```

**Change notifications.** Clients that want server-initiated change
notifications open a long-lived stream with
[`subscriptions/listen`][subscriptions-listen]; the response stream stays
open and carries only the notification types the client opted in to:

```mermaid theme={null}
sequenceDiagram
    participant Client
    participant Server

    Client->>Server: POST subscriptions/listen<br/>(notification filter)
    Server-->>Client: SSE: notifications/subscriptions/acknowledged
    note over Client,Server: Stream stays open
    Server-->>Client: SSE: notifications/tools/list_changed
    Server-->>Client: SSE: notifications/resources/updated
    note over Client,Server: Until the client or server closes the stream
```

## Cancellation

Closing the SSE response stream **MUST** be treated by the server as
cancellation of that request. Because each request has its own response
stream, the transport-level disconnect is unambiguous. The server **SHOULD**
stop work on the cancelled request as soon as practical and **MUST NOT** send
any further messages for it. See
[Cancellation][cancellation] for the full rules.

[cancellation]: /specification/2026-07-28/basic/patterns/cancellation

## Request Metadata

The Streamable HTTP transport mirrors selected JSON-RPC body fields into HTTP
headers so that intermediaries (load balancers, gateways, observability
tooling) can route and inspect requests without parsing the body.

### Protocol Version Header

Every POST request to the MCP endpoint **MUST** include an
`MCP-Protocol-Version` header.

For example: `MCP-Protocol-Version: 2026-07-28`

The header value **MUST** match the
`io.modelcontextprotocol/protocolVersion` field carried in the request body's
`_meta`. If the values do not match, the server **MUST** reject the request
with `400 Bad Request` and a `HeaderMismatch` JSON-RPC error
(see [Server Validation](#server-validation)).

If the server does not implement the requested protocol version (whether the
version is unknown to the server, or is a known version the server has chosen
not to support), it **MUST** respond with `400 Bad Request` and an
[`UnsupportedProtocolVersionError`][unsupported-version]
listing its supported versions. See
[Versioning: Protocol Version Negotiation][lifecycle-version]
for the negotiation flow.

If the server does not implement the requested RPC method, it **MUST** respond
with `404 Not Found` and a JSON-RPC error with code `-32601`
(`Method not found`). The JSON-RPC error body distinguishes this case from a
`404` returned by a legacy [HTTP+SSE][http-sse] server that does not host the
modern MCP endpoint (see [Backward Compatibility](#backward-compatibility)).

A server that supports clients implementing protocol versions earlier than
`2025-06-18` (which did not define the `MCP-Protocol-Version` header) **MAY**
treat a request that omits the header as protocol version `2025-03-26`. A
server that does not support such clients **MUST** reject a request without
the header per [Server Validation](#server-validation).

[unsupported-version]: /specification/2026-07-28/schema#unsupportedprotocolversionerror

[lifecycle-version]: /specification/2026-07-28/basic/versioning#protocol-version-negotiation

### Standard Request Headers

| Header Name  | Source Field                  | Required For                                           |
| ------------ | ----------------------------- | ------------------------------------------------------ |
| `Mcp-Method` | `method`                      | All requests                                           |
| `Mcp-Name`   | `params.name` or `params.uri` | `tools/call`, `resources/read`, `prompts/get` requests |

These headers are **REQUIRED** for compliance.

If the `Mcp-Name` source value cannot be safely represented as a plain ASCII
header value, clients **MUST** encode it using the Base64 sentinel format
described in [Value Encoding](#value-encoding).

**`tools/call` request:**

```http theme={null}
POST /mcp HTTP/1.1
Content-Type: application/json
MCP-Protocol-Version: 2026-07-28
Mcp-Method: tools/call
Mcp-Name: get_weather

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_weather",
    "arguments": {
      "location": "Seattle, WA"
    },
    "_meta": {
      "io.modelcontextprotocol/protocolVersion": "2026-07-28",
      "io.modelcontextprotocol/clientInfo": {
        "name": "ExampleClient",
        "version": "1.0.0"
      },
      "io.modelcontextprotocol/clientCapabilities": {}
    }
  }
}
```

**`resources/read` request:**

```http theme={null}
POST /mcp HTTP/1.1
Content-Type: application/json
MCP-Protocol-Version: 2026-07-28
Mcp-Method: resources/read
Mcp-Name: file:///projects/myapp/config.json

{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "resources/read",
  "params": {
    "uri": "file:///projects/myapp/config.json",
    "_meta": {
      "io.modelcontextprotocol/protocolVersion": "2026-07-28",
      "io.modelcontextprotocol/clientInfo": {
        "name": "ExampleClient",
        "version": "1.0.0"
      },
      "io.modelcontextprotocol/clientCapabilities": {}
    }
  }
}
```

### Custom Headers from Tool Parameters

MCP servers **MAY** designate specific tool parameters to be mirrored into
HTTP headers using an `x-mcp-header` extension property in the parameter's
schema within the tool's `inputSchema`. See
[Tool Definitions][tool-definitions] for
details on how to annotate tool parameters.

While the use of `x-mcp-header` is optional for servers, clients **MUST**
support this feature. When a server's tool definition includes
`x-mcp-header` annotations, conforming clients **MUST** mirror the
designated parameter values into HTTP headers.

[tool-definitions]: /specification/2026-07-28/server/tools#x-mcp-header

#### Schema Extension

The `x-mcp-header` property specifies the name portion used to construct
the header name `Mcp-Param-{name}`.

**Constraints on `x-mcp-header` values**:

* **MUST NOT** be empty
* **MUST** match HTTP field-name token syntax (`1*tchar`, [RFC 9110 Section 5.1](https://datatracker.ietf.org/doc/html/rfc9110#section-5.1))
* **MUST NOT** contain control characters, including carriage return (CR, `\r`)
  or line feed (LF, `\n`)
* **MUST** be case-insensitively unique among all `x-mcp-header` values in
  the `inputSchema`
* **MUST** only be applied to parameters with primitive types (integer,
  string, boolean). Parameters with type `number` are not permitted.
  Integer values **MUST** be within the safe range for JavaScript
  (−2<sup>53</sup>+1 to 2<sup>53</sup>−1)
* **MUST** only be applied to properties that are *statically reachable*
  from the schema root: reachable via a chain consisting solely of
  `properties` keys. The chain **MUST NOT** pass through `items` (or any
  other array keyword), composition keywords (`oneOf`, `anyOf`, `allOf`,
  `not`), conditional keywords (`if`/`then`/`else`), or `$ref`. Nested
  object properties are permitted as long as every step in the chain is a
  `properties` key. An `x-mcp-header` annotation anywhere else makes the
  annotation — and thus the tool definition — invalid.

Header extraction is defined as reading the instance value at the exact
property path of the annotated property (the chain of `properties` keys
leading to it). If no value is present at that path in the call arguments,
the header is omitted.

Clients using the Streamable HTTP transport **MUST** reject tool definitions
where any `x-mcp-header` value violates these constraints. Rejection means
the client **MUST** exclude the invalid tool from the result of `tools/list`.
Clients **SHOULD** log a warning when rejecting a tool definition, including
the tool name and the reason for rejection. This ensures that a single
malformed tool definition does not prevent other valid tools from being used.
Clients using other transports (e.g., stdio) **MAY** ignore `x-mcp-header`
annotations entirely.

**Example tool definition:**

```json theme={null}
{
  "name": "execute_sql",
  "description": "Execute SQL on Google Cloud Spanner",
  "inputSchema": {
    "type": "object",
    "properties": {
      "region": {
        "type": "string",
        "description": "The region to execute the query in",
        "x-mcp-header": "Region"
      },
      "query": {
        "type": "string",
        "description": "The SQL query to execute"
      }
    },
    "required": ["region", "query"]
  }
}
```

**Resulting HTTP request:**

```http theme={null}
POST /mcp HTTP/1.1
Content-Type: application/json
MCP-Protocol-Version: 2026-07-28
Mcp-Method: tools/call
Mcp-Name: execute_sql
Mcp-Param-Region: us-west1

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "_meta": {
      "io.modelcontextprotocol/protocolVersion": "2026-07-28",
      "io.modelcontextprotocol/clientInfo": {
        "name": "ExampleClient",
        "version": "1.0.0"
      },
      "io.modelcontextprotocol/clientCapabilities": {}
    },
    "name": "execute_sql",
    "arguments": {
      "region": "us-west1",
      "query": "SELECT * FROM users"
    }
  }
}
```

#### Value Encoding

Clients **MUST** encode parameter values before including them in HTTP
headers to ensure safe transmission and prevent injection attacks.

**Type conversion**: Convert the parameter value to its string representation:

* `string`: Use the value as-is
* `integer`: Convert to decimal string representation (e.g., `42`, `-7`)
* `boolean`: Convert to lowercase `"true"` or `"false"`

Per [RFC 9110][rfc9110-values],
HTTP header field values must consist of visible ASCII characters
(0x21-0x7E), space (0x20), and horizontal tab (0x09). When a value cannot
be safely represented as a plain ASCII header value (e.g., it contains
non-ASCII characters, control characters, or has leading/trailing
whitespace), clients **MUST** use Base64 encoding of the UTF-8
representation with the following format:

```text theme={null}
Mcp-Param-{Name}: =?base64?{Base64EncodedValue}?=
```

The same encoding rule applies to the `Mcp-Name` header value. Tool and
prompt names are only **SHOULD**-constrained to header-safe characters, so a
name (or resource URI) outside the safe set is carried as:

```text theme={null}
Mcp-Name: =?base64?{Base64EncodedValue}?=
```

The prefix `=?base64?` and suffix `?=` indicate that the value is
Base64-encoded. These markers are case-sensitive and **MUST** appear exactly
as shown (lowercase). Servers and intermediaries that need to inspect these
values **MUST** decode them accordingly. In particular, servers **MUST**
decode an encoded `Mcp-Name` or `Mcp-Param-{Name}` value before comparing it
to the corresponding request body value during
[Server Validation](#server-validation).

To avoid ambiguity, clients **MUST** also Base64-encode any plain-ASCII
value that matches the sentinel pattern (i.e., starts with `=?base64?`
and ends with `?=`).

**Encoding examples:**

| Original Value         | Reason                   | Encoded Header Value                                  |
| ---------------------- | ------------------------ | ----------------------------------------------------- |
| `"us-west1"`           | Plain ASCII              | `Mcp-Param-Region: us-west1`                          |
| `"Hello, 世界"`          | Contains non-ASCII       | `Mcp-Param-Greeting: =?base64?SGVsbG8sIOS4lueVjA==?=` |
| `" padded "`           | Leading/trailing spaces  | `Mcp-Param-Text: =?base64?IHBhZGRlZCA=?=`             |
| `"line1\nline2"`       | Contains newline         | `Mcp-Param-Text: =?base64?bGluZTEKbGluZTI=?=`         |
| `"=?base64?literal?="` | Matches sentinel pattern | `Mcp-Param-Val: =?base64?PT9iYXNlNjQ/bGl0ZXJhbD89?=`  |

[rfc9110-values]: https://datatracker.ietf.org/doc/html/rfc9110#name-field-values

#### Client Behavior

When constructing a `tools/call` request via HTTP transport, the client
**MUST**:

1. Extract the values for any standard headers from the request body (e.g.,
   `method`, `params.name`, `params.uri`).
2. Append the `Mcp-Method` header and, if applicable, `Mcp-Name` header to
   the request.
3. Inspect the tool's `inputSchema` for properties marked with
   `x-mcp-header` and extract the value at each annotated property's exact
   property path, omitting the header when no value is present (see
   [Schema Extension](#schema-extension)).
4. Encode the values according to the [Value Encoding](#value-encoding)
   rules.
5. Append a `Mcp-Param-{Name}: {Value}` header to the request.

If the server rejects a request with a
[`HeaderMismatch`](#server-validation) error because required
`Mcp-Param-*` headers are missing or do not match the body, the client
**SHOULD** call `tools/list` to check for changes to the tool's
`inputSchema`, then retry the original request with the appropriate
headers.

#### Server Behavior for Custom Headers

Intermediate servers that do not recognize an `Mcp-Param-{Name}` header
**MUST** forward it and otherwise ignore it, as required by the
[HTTP Semantics RFC][http-semantics].

Servers **MUST** reject requests with a recognized `Mcp-Param-{Name}` header
that contains invalid characters (see [Value Encoding](#value-encoding)).

Any server that processes the message body **MUST** validate that encoded
header values, after decoding if Base64-encoded, match the corresponding
values in the request body. Servers **MUST** reject requests with a
`400 Bad Request` HTTP status and JSON-RPC error code `-32020`
(`HeaderMismatch`) if any validation fails.

| Scenario                                 | Client Behavior                | Server Behavior                          |
| ---------------------------------------- | ------------------------------ | ---------------------------------------- |
| Parameter value provided                 | Client MUST include the header | Server MUST validate header matches body |
| Parameter value is `null`                | Client MUST omit the header    | Server MUST NOT expect the header        |
| Parameter not in arguments               | Client MUST omit the header    | Server MUST NOT expect the header        |
| Client omits header but value is in body | Non-conforming client          | Server MUST reject the request           |

[http-semantics]: https://www.rfc-editor.org/rfc/rfc9110.html#name-field-names

### Case Sensitivity

Header names (called "field names" in
[RFC 9110][rfc9110-names])
are case-insensitive. Clients and servers **MUST** use case-insensitive
comparisons for header names. Header *values* (such as method names) are
case-sensitive.

[rfc9110-names]: https://datatracker.ietf.org/doc/html/rfc9110#name-field-names

### Server Validation

Servers that process the request body **MUST** reject requests where the
values specified in the headers do not match the corresponding values in the
request body. This prevents potential security vulnerabilities when
different components in the network rely on different sources of truth
(e.g., a load balancer routing on the header value while the MCP server
executes based on the body value).

<Note>
  When validating integer parameter values, servers **SHOULD** compare the
  header value and the body value numerically rather than as strings (e.g.,
  `42.0` and `42` are considered equal).
</Note>

When rejecting a request due to header validation failure, servers **MUST**
return HTTP status `400 Bad Request` and **MUST** include a JSON-RPC error
response using the following error code:

| Code     | Name                                                                     | Description                                                                                                            |
| -------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `-32020` | [`HeaderMismatch`](/specification/2026-07-28/schema#headermismatcherror) | The HTTP headers do not match the corresponding values in the request body, or required headers are missing/malformed. |

This error code is allocated from the sub-range the MCP specification
reserves for protocol-defined errors. See
[Error Codes](/specification/2026-07-28/basic/index#error-codes).

**Example error response:**

```json theme={null}
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32020,
    "message": "Header mismatch: Mcp-Name header value 'foo' does not match body value 'bar'"
  }
}
```

Validation failure conditions include:

* A required standard header (`MCP-Protocol-Version`, `Mcp-Method`,
  `Mcp-Name`) is missing.
* A header value does not match the corresponding request body value.
  For headers that permit the Base64 sentinel encoding (`Mcp-Name` and
  `Mcp-Param-{Name}`), servers **MUST** decode encoded values (see
  [Value Encoding](#value-encoding)) before comparing them to the body value.
* A header value contains invalid characters.

<Note>
  Intermediaries **MUST** return an appropriate HTTP error status (e.g.,
  `400 Bad Request`) for validation failures but are not required to return
  a JSON-RPC error response.
</Note>

<Note>
  Intermediaries that enforce policy based on mirrored headers (e.g., routing
  or rate-limiting by tenant) **SHOULD** verify that the `MCP-Protocol-Version`
  header indicates a version that requires header–body validation. If the
  version is older or the header is absent, the intermediary **SHOULD** reject
  the request rather than trusting unvalidated header values.
</Note>

## Backward Compatibility

A client that supports both modern (per-request-metadata) MCP versions and a
legacy version that requires an `initialize` handshake **MAY** detect which
era the server implements by attempting a modern request first. On
`400 Bad Request`, the client **SHOULD** inspect the response body before
falling back: modern servers also use `400` for
[`UnsupportedProtocolVersionError`][unsupported-version],
`MissingRequiredClientCapabilityError`, and header-validation failures.

* If the body contains a recognized modern JSON-RPC error, the server speaks
  a modern version of MCP — retry using the advertised `supported` versions
  or correct the request, rather than falling back.
* If the body is empty or is not a recognized modern JSON-RPC error, fall
  back to `initialize` and continue with the legacy version for subsequent
  requests.

See [Versioning: Backward Compatibility][lifecycle-compat] for the era model
and a compatibility matrix for implementors.

### Earlier Streamable HTTP Revisions

Protocol versions `2025-03-26` through [`2025-11-25`](/specification/2025-11-25/basic/transports)
also used the Streamable HTTP transport, but in a different shape: servers could assign a session via
the `Mcp-Session-Id` header (terminated with HTTP DELETE), clients could open
a standalone SSE stream with HTTP GET to receive server-initiated messages,
servers could send JSON-RPC *requests* on SSE streams, and streams were
resumable via `Last-Event-ID`. None of these mechanisms are part of this
revision.

A server that supports only this revision and receives such traffic from an
older client **SHOULD** respond as follows:

* HTTP GET or DELETE to the MCP endpoint: respond with
  `405 Method Not Allowed`.
* An `Mcp-Session-Id` header on a request: ignore it, and do not mint or echo
  session IDs.
* A `Last-Event-ID` header: ignore it; streams are not resumable.

Servers and clients that need to interoperate with counterparts speaking
those protocol versions implement the behavior described in the corresponding
revision (for example,
[2025-11-25: Streamable HTTP](/specification/2025-11-25/basic/transports#streamable-http)),
in addition to the version-negotiation fallback described above.

### HTTP+SSE Transport (2024-11-05)

<Warning>
  **Deprecated**: The [HTTP+SSE transport][http-sse] from protocol version
  2024-11-05 has been deprecated since protocol version `2025-03-26` and is
  classified as Deprecated under the [feature lifecycle
  policy](/community/feature-lifecycle#deprecating-a-feature)
  ([SEP-2596](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596)).
  New implementations **SHOULD NOT** adopt it; existing implementations
  **SHOULD** migrate to [Streamable
  HTTP](/specification/2026-07-28/basic/transports/streamable-http). It is
  eligible for removal in a future revision; see the [deprecated features
  registry](/specification/2026-07-28/deprecated).
</Warning>

Clients and servers can maintain backward compatibility with the
deprecated [HTTP+SSE transport][http-sse] (from
protocol version 2024-11-05) as follows:

**Servers** wanting to support older clients should:

* Continue to host both the SSE and POST endpoints of the old transport,
  alongside the new "MCP endpoint" defined for the Streamable HTTP transport.
  * It is also possible to combine the old POST endpoint and the new MCP
    endpoint, but this may introduce unneeded complexity.

**Clients** wanting to support older servers should:

1. Accept an MCP server URL from the user, which may point to either a server
   using the old transport or the new transport.
2. Attempt to POST a request to the server URL, with an `Accept` header as
   defined above:
   * If it succeeds, the client can assume this is a server supporting the
     new Streamable HTTP transport.
   * If it fails with HTTP status code `400 Bad Request`, `404 Not Found`,
     or `405 Method Not Allowed` **and** the response body is not a
     recognized modern JSON-RPC error (a modern server returns one for
     unsupported version, unknown method, or header-validation failure):
     * Issue a GET request to the server URL, expecting that this will open
       an SSE stream and return an `endpoint` event as the first event.
     * When the `endpoint` event arrives, the client can assume this is a
       server running the old HTTP+SSE transport, and should use that
       transport for all subsequent communication.

[lifecycle-compat]: /specification/2026-07-28/basic/versioning#backward-compatibility-with-initialization-based-versions


---

[FETCH RESULT]
> ## Documentation Index
> Fetch the complete documentation index at: https://modelcontextprotocol.io/llms.txt
> Use this file to discover all available pages before exploring further.

# Authorization

<div id="enable-section-numbers" />

## Introduction

### Purpose and Scope

The Model Context Protocol provides authorization capabilities at the transport level,
enabling MCP clients to make requests to restricted MCP servers on behalf of resource
owners. This specification defines the authorization flow for HTTP-based transports.

### Protocol Requirements

Authorization is **OPTIONAL** for MCP implementations. When supported:

* Implementations using an HTTP-based transport **SHOULD** conform to this specification.
* Implementations using an STDIO transport **SHOULD NOT** follow this specification, and
  instead retrieve credentials from the environment.
* Implementations using alternative transports **MUST** follow established security best
  practices for their protocol.

### Standards Compliance

This authorization mechanism is based on established specifications listed below, but
implements a selected subset of their features to ensure security and interoperability
while maintaining simplicity:

* OAuth 2.1 IETF DRAFT ([draft-ietf-oauth-v2-1-13](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-13))
* OAuth 2.0 Bearer Token Usage
  ([RFC6750](https://datatracker.ietf.org/doc/html/rfc6750))
* OAuth 2.0 Authorization Server Metadata
  ([RFC8414](https://datatracker.ietf.org/doc/html/rfc8414))
* OAuth 2.0 Dynamic Client Registration Protocol
  ([RFC7591](https://datatracker.ietf.org/doc/html/rfc7591))
* Resource Indicators for OAuth 2.0
  ([RFC8707](https://www.rfc-editor.org/rfc/rfc8707.html))
* OAuth 2.0 Protected Resource Metadata ([RFC9728](https://datatracker.ietf.org/doc/html/rfc9728))
* OAuth 2.0 Authorization Server Issuer Identification ([RFC9207](https://datatracker.ietf.org/doc/html/rfc9207))
* OAuth Client ID Metadata Documents ([draft-ietf-oauth-client-id-metadata-document-00](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-client-id-metadata-document-00))
* [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html)
* OpenID Connect Dynamic Client Registration 1.0 ([OpenID Connect Registration](https://openid.net/specs/openid-connect-registration-1_0.html))

## Roles

A protected *MCP server* acts as an [OAuth 2.1 resource server](https://www.ietf.org/archive/id/draft-ietf-oauth-v2-1-13.html#name-roles),
capable of accepting and responding to protected resource requests using access tokens.

An *MCP client* acts as an [OAuth 2.1 client](https://www.ietf.org/archive/id/draft-ietf-oauth-v2-1-13.html#name-roles),
making protected resource requests on behalf of a resource owner.

The *authorization server* is responsible for interacting with the user (if necessary) and issuing access tokens for use at the MCP server.
The implementation details of the authorization server are beyond the scope of this specification. It may be hosted with the
resource server or a separate entity. [Authorization Server Discovery](/specification/2026-07-28/basic/authorization/authorization-server-discovery)
specifies how an MCP server indicates the location of its corresponding authorization server to a client.

## Overview

1. Authorization servers **MUST** implement OAuth 2.1 with appropriate security
   measures for both confidential and public clients.

2. Authorization servers and MCP clients **SHOULD** support [OAuth Client ID Metadata Documents](/specification/2026-07-28/basic/authorization/client-registration#client-id-metadata-documents)
   ([draft-ietf-oauth-client-id-metadata-document-00](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-client-id-metadata-document-00)).

3. Authorization servers and MCP clients **MAY** support the OAuth 2.0 Dynamic Client Registration
   Protocol ([RFC7591](https://datatracker.ietf.org/doc/html/rfc7591)). Note that
   [Dynamic Client Registration](/specification/2026-07-28/basic/authorization/client-registration#dynamic-client-registration)
   is deprecated and retained for backwards compatibility with authorization servers that do not support Client ID Metadata Documents.

4. MCP servers **MUST** implement OAuth 2.0 Protected Resource Metadata ([RFC9728](https://datatracker.ietf.org/doc/html/rfc9728)).
   MCP clients **MUST** use OAuth 2.0 Protected Resource Metadata for [authorization server discovery](/specification/2026-07-28/basic/authorization/authorization-server-discovery).

5. MCP authorization servers **MUST** provide at least one of the following discovery mechanisms:

   * OAuth 2.0 Authorization Server Metadata ([RFC8414](https://datatracker.ietf.org/doc/html/rfc8414))
   * [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html)

   MCP clients **MUST** support both [discovery mechanisms](/specification/2026-07-28/basic/authorization/authorization-server-discovery#authorization-server-metadata-discovery) to obtain the information required to interact with the authorization server.

## Authorization Server Discovery

MCP servers advertise their associated authorization servers through OAuth 2.0 Protected
Resource Metadata, and MCP clients determine authorization server endpoints and supported
capabilities through authorization server metadata discovery. Implementations **MUST**
follow the normative discovery requirements defined in
[Authorization Server Discovery](/specification/2026-07-28/basic/authorization/authorization-server-discovery).

## Client Registration

Before initiating the authorization flow, MCP clients **MUST** obtain a client ID through
one of three registration mechanisms: Client ID Metadata Documents, pre-registration, or
Dynamic Client Registration, following the requirements and selection priority defined in
[Client Registration](/specification/2026-07-28/basic/authorization/client-registration).

## Scope Selection Strategy

MCP servers **SHOULD** include a `scope` parameter in the `WWW-Authenticate` header as defined in
[RFC 6750 Section 3](https://datatracker.ietf.org/doc/html/rfc6750#section-3)
to indicate the scopes required for accessing the resource. This provides clients with immediate
guidance on the appropriate scopes to request during authorization,
following the principle of least privilege and preventing clients from requesting excessive permissions.

The scopes included in the `WWW-Authenticate` challenge **MAY** match `scopes_supported`, be a subset
or superset of it, or an alternative collection that is neither a strict subset nor
superset. Clients **MUST NOT** assume any particular set relationship between the challenged
scope set and `scopes_supported`. Clients **MUST** treat the scopes provided in the
challenge as authoritative for the current operation. These scopes are required to
satisfy the current request. When re-authorizing, clients **SHOULD** include these scopes
alongside any previously granted scopes to avoid losing permissions needed for other operations
(see [Step-Up Authorization Flow](#step-up-authorization-flow)). Servers **SHOULD** strive for
consistency in how they construct scope sets but they are not required to surface every dynamically
issued scope through `scopes_supported`.

Example 401 response with scope guidance:

```http theme={null}
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer resource_metadata="https://mcp.example.com/.well-known/oauth-protected-resource",
                         scope="files:read"
```

When implementing authorization flows, MCP clients **SHOULD** follow the principle of least privilege by requesting
only the scopes necessary for their intended operations. During the initial authorization handshake, MCP clients
**SHOULD** follow this priority order for scope selection:

1. **Use `scope` parameter** from the initial `WWW-Authenticate` header in the 401 response, if provided
2. **If `scope` is not available**, use all scopes defined in `scopes_supported` from the Protected Resource Metadata document, omitting the `scope` parameter if `scopes_supported` is undefined.

The `scopes_supported` field is intended to represent the minimal set of scopes necessary
for basic functionality (see [Scope Minimization](/docs/2026-07-28/tutorials/security/security_best_practices#scope-minimization)),
with additional scopes requested incrementally through the step-up authorization flow steps
described in the [Scope Challenge Handling](#scope-challenge-handling) section.

## Authorization Flow Steps

The registration step shown in the flow uses one of the mechanisms defined in
[Client Registration](/specification/2026-07-28/basic/authorization/client-registration).

The complete Authorization flow proceeds as follows:

```mermaid theme={null}
sequenceDiagram
    participant B as User-Agent (Browser)
    participant C as Client
    participant M as MCP Server (Resource Server)
    participant A as Authorization Server

    C->>M: MCP request without token
    M->>C: HTTP 401 Unauthorized with WWW-Authenticate header
    Note over C: Extract resource_metadata URL from WWW-Authenticate

    C->>M: Request Protected Resource Metadata
    M->>C: Return metadata

    Note over C: Parse metadata and extract authorization server(s)<br/>Client determines AS to use

    C->>A: GET Authorization server metadata endpoint
    Note over C,A: Try OAuth 2.0 and OpenID Connect<br/>discovery endpoints in priority order
    A-->>C: Authorization server metadata

    alt Client ID Metadata Documents
        Note over C: Client uses HTTPS URL as client_id
        Note over A: Server detects URL-formatted client_id
        A->>C: Fetch metadata from client_id URL
        C-->>A: JSON metadata document
        Note over A: Validate metadata and redirect_uris
    else Dynamic client registration
        C->>A: POST /register
        A->>C: Client Credentials
    else Pre-registered client
        Note over C: Use existing client_id
    end

    Note over C: Generate PKCE parameters<br/>Include resource parameter<br/>Apply scope selection strategy<br/>Record expected issuer
    C->>B: Open browser with authorization URL + code_challenge + resource
    B->>A: Authorization request with resource parameter
    Note over A: User authorizes
    A->>B: Redirect to callback with authorization code + iss
    B->>C: Authorization code callback
    Note over C: Validate iss against recorded issuer (RFC 9207)
    C->>A: Token request + code_verifier + resource
    A->>C: Access token (+ refresh token)
    C->>M: MCP request with access token
    M-->>C: MCP response
    Note over C,M: MCP communication continues with valid token
```

### Authorization Response Validation

Before redirecting the user-agent, the client **MUST** record the `issuer` value from the selected authorization server's validated metadata document (see [Authorization Server Metadata Discovery](/specification/2026-07-28/basic/authorization/authorization-server-discovery#authorization-server-metadata-discovery)) and associate it with the same per-request record used to store the PKCE code verifier (and the `state` value, if used). The validation in this section depends on that recorded value being authentic; it provides no protection if the expected issuer was obtained from an unvalidated source.

MCP authorization servers **SHOULD** include the `iss` parameter in authorization responses, including error responses, as defined in [RFC9207 Section 2](https://datatracker.ietf.org/doc/html/rfc9207#section-2). Authorization servers that include the `iss` parameter **MUST** advertise this by setting `authorization_response_iss_parameter_supported` to `true` in their metadata ([RFC9207 Section 2.3](https://datatracker.ietf.org/doc/html/rfc9207#section-2.3)).

On receiving the authorization response, MCP clients **MUST** apply the validation in [RFC9207 Section 2.4](https://datatracker.ietf.org/doc/html/rfc9207#section-2.4) before transmitting the authorization code to any token endpoint:

| `authorization_response_iss_parameter_supported` | `iss` in response | Client action                                                                              |
| ------------------------------------------------ | ----------------- | ------------------------------------------------------------------------------------------ |
| `true`                                           | present           | Compare to the recorded issuer using simple string comparison ([RFC3986 Section 6.2.1][1]) |
| `true`                                           | absent            | Reject the response                                                                        |
| `false` or absent                                | present           | Compare to the recorded issuer using simple string comparison ([RFC3986 Section 6.2.1][1]) |
| `false` or absent                                | absent            | Proceed                                                                                    |

[1]: https://datatracker.ietf.org/doc/html/rfc3986#section-6.2.1

The third row applies the local-policy provision in [RFC9207 Section 2.4](https://datatracker.ietf.org/doc/html/rfc9207#section-2.4): this specification compares a present `iss` against the recorded issuer regardless of metadata advertisement, to accommodate authorization servers that emit `iss` before updating their metadata.

A future revision of this specification is expected to upgrade authorization server inclusion of `iss` from **SHOULD** to **MUST**. Implementers are encouraged to emit and validate `iss` now to ease that transition; client rejection behavior on `iss` absence will continue to be keyed on `authorization_response_iss_parameter_supported` until that revision defines the upgrade path.

After decoding the `iss` value from the `application/x-www-form-urlencoded` response per [RFC 9207 Section 2.4](https://datatracker.ietf.org/doc/html/rfc9207#section-2.4), clients **MUST NOT** apply scheme or host case folding, default-port elision, trailing-slash, or percent-encoding normalization ([RFC 3986 Sections 6.2.2-6.2.3](https://datatracker.ietf.org/doc/html/rfc3986#section-6.2.2)) before comparison.

This validation applies equally to error responses - on mismatch the client **MUST NOT** act on or display `error`, `error_description`, or `error_uri`.

## Resource Parameter Implementation

MCP clients **MUST** implement Resource Indicators for OAuth 2.0 as defined in [RFC 8707](https://www.rfc-editor.org/rfc/rfc8707.html)
to explicitly specify the target resource for which the token is being requested. The `resource` parameter:

1. **MUST** be included in both authorization requests and token requests.
2. **MUST** identify the MCP server that the client intends to use the token with.
3. **MUST** use the canonical URI of the MCP server as defined in [RFC 8707 Section 2](https://www.rfc-editor.org/rfc/rfc8707.html#name-access-token-request).

### Canonical Server URI

For the purposes of this specification, the canonical URI of an MCP server is defined as the resource identifier as specified in
[RFC 8707 Section 2](https://www.rfc-editor.org/rfc/rfc8707.html#section-2) and aligns with the `resource` parameter in
[RFC 9728](https://datatracker.ietf.org/doc/html/rfc9728).

MCP clients **SHOULD** provide the most specific URI that they can for the MCP server they intend to access, following the guidance in [RFC 8707](https://www.rfc-editor.org/rfc/rfc8707). While the canonical form uses lowercase scheme and host components, implementations **SHOULD** accept uppercase scheme and host components for robustness and interoperability.

Examples of valid canonical URIs:

* `https://mcp.example.com/mcp`
* `https://mcp.example.com`
* `https://mcp.example.com:8443`
* `https://mcp.example.com/server/mcp` (when path component is necessary to identify individual MCP server)

Examples of invalid canonical URIs:

* `mcp.example.com` (missing scheme)
* `https://mcp.example.com#fragment` (contains fragment)

> **Note:** While both `https://mcp.example.com/` (with trailing slash) and `https://mcp.example.com` (without trailing slash) are technically valid absolute URIs according to [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986), implementations **SHOULD** consistently use the form without the trailing slash for better interoperability unless the trailing slash is semantically significant for the specific resource.

For example, if accessing an MCP server at `https://mcp.example.com`, the authorization request would include:

```
&resource=https%3A%2F%2Fmcp.example.com
```

MCP clients **MUST** send this parameter regardless of whether authorization servers support it.

## Access Token Usage

### Token Requirements

Access token handling when making requests to MCP servers **MUST** conform to the requirements defined in
[OAuth 2.1 Section 5 "Resource Requests"](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-13#section-5).
Specifically:

1. MCP client **MUST** use the Authorization request header field defined in
   [OAuth 2.1 Section 5.1.1](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-13#section-5.1.1):

```
Authorization: Bearer <access-token>
```

Note that authorization **MUST** be included in every HTTP request from client to server.

2. Access tokens **MUST NOT** be included in the URI query string

Example request:

```http theme={null}
GET /mcp HTTP/1.1
Host: mcp.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Token Handling

MCP servers, acting in their role as an OAuth 2.1 resource server, **MUST** validate access tokens as described in
[OAuth 2.1 Section 5.2](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-13#section-5.2).
MCP servers **MUST** validate that access tokens were issued specifically for them as the intended audience,
according to [RFC 8707 Section 2](https://www.rfc-editor.org/rfc/rfc8707.html#section-2).
If validation fails, servers **MUST** respond according to
[OAuth 2.1 Section 5.3](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-13#section-5.3)
error handling requirements. Invalid or expired tokens **MUST** receive a HTTP 401
response.

MCP clients **MUST NOT** send tokens to the MCP server other than ones issued by the MCP server's authorization server.

MCP servers **MUST** only accept tokens that are valid for use with their
own resources.

MCP servers **MUST NOT** accept or transit any other tokens.

## Refresh Tokens

This section provides guidance for MCP Clients and MCP Servers when handling or issuing
refresh tokens for both OAuth and OpenID Connect.

**MCP Clients** that desire refresh tokens:

* **MUST** keep refresh tokens confidential in transit and storage as specified in [OAuth 2.1 Section 4.3](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-14#section-4.3)
* **SHOULD** include `refresh_token` in their `grant_types` client metadata
* **MAY** add `offline_access` to the `scope` parameter of the authorization and token requests when the Authorization Server metadata contains it in `scopes_supported`
* **MUST NOT** assume refresh tokens will be issued; the AS retains discretion

**MCP Servers** (Protected Resources) **SHOULD NOT** include `offline_access` in
`WWW-Authenticate` scope or Protected Resource Metadata `scopes_supported`, as refresh
tokens are not a resource requirement.

## Error Handling

Servers **MUST** return appropriate HTTP status codes for authorization errors:

| Status Code | Description  | Usage                                      |
| ----------- | ------------ | ------------------------------------------ |
| 401         | Unauthorized | Authorization required or token invalid    |
| 403         | Forbidden    | Invalid scopes or insufficient permissions |
| 400         | Bad Request  | Malformed authorization request            |

### Scope Challenge Handling

This section covers handling insufficient scope errors during runtime operations when
a client already has a token but needs additional permissions. This follows the error
handling patterns defined in [OAuth 2.1 Section 5](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-13#section-5)
and leverages the metadata fields from [RFC 9728 (OAuth 2.0 Protected Resource Metadata)](https://datatracker.ietf.org/doc/html/rfc9728).

#### Runtime Insufficient Scope Errors

When a client makes a request with an access token with insufficient
scope during runtime operations, the server **SHOULD** respond with:

* `HTTP 403 Forbidden` status code (per [RFC 6750 Section 3.1](https://datatracker.ietf.org/doc/html/rfc6750#section-3.1))
* `WWW-Authenticate` header with the `Bearer` scheme and additional parameters:
  * `error="insufficient_scope"` - indicating the specific type of authorization failure
  * `scope="required_scope1 required_scope2"` - specifying the minimum scopes needed for the operation
  * `resource_metadata` - the URI of the Protected Resource Metadata document (for consistency with 401 responses)
  * `error_description` (optional) - human-readable description of the error

**Server Scope Management**: When responding with insufficient scope errors, servers
**SHOULD** include the scopes needed to satisfy the current operation in the `scope`
parameter, consistent with
[RFC 6750 Section 3.1](https://datatracker.ietf.org/doc/html/rfc6750#section-3.1).
The `scope` attribute describes the scopes necessary to access
the requested resource — servers are not required to include
the client's previously granted scopes.

Whatever scope-inclusion strategy a server adopts, servers **SHOULD** include all
scopes required for the current operation in a single challenge.
Challenging incrementally (returning one missing scope, then another
on the subsequent retry) forces multiple authorization round-trips
for a single operation and degrades user experience. The required
scopes may be determined dynamically based on the specific request
arguments and context, but once determined, they should be emitted
together.

Servers **SHOULD** be consistent in their scope inclusion strategy to provide predictable behavior for clients.

Servers **SHOULD** consider the user experience impact when determining which scopes to include in the
response, as misconfigured scopes may require frequent user interaction.

Scope accumulation across operations is a client-side responsibility. See the
[Step-Up Authorization Flow](#step-up-authorization-flow) for the scope-union requirement.

Example insufficient scope response:

```http theme={null}
HTTP/1.1 403 Forbidden
WWW-Authenticate: Bearer error="insufficient_scope",
                         scope="files:write",
                         resource_metadata="https://mcp.example.com/.well-known/oauth-protected-resource",
                         error_description="File write permission required for this operation"
```

#### Step-Up Authorization Flow

Clients will receive scope-related errors during initial authorization or at runtime (`insufficient_scope`).
Clients **SHOULD** respond to these errors by requesting a new access token with an increased set of scopes via a step-up authorization flow or handle the errors in other, appropriate ways.
Clients acting on behalf of a user **SHOULD** attempt the step-up authorization flow. Clients acting on their own behalf (`client_credentials` clients)
**MAY** attempt the step-up authorization flow or abort the request immediately.

The flow is as follows:

1. **Parse error information** from the authorization server response or `WWW-Authenticate` header
2. **Determine required scopes** by computing the union of the
   client's previously requested scope set and the scopes from
   the current challenge. This ensures previously granted
   permissions are preserved when servers emit per-operation
   scope challenges per
   [RFC 6750 Section 3.1](https://datatracker.ietf.org/doc/html/rfc6750#section-3.1).
   Clients **MAY** also consult the
   [Scope Selection Strategy](#scope-selection-strategy) for
   initial scope selection guidance.
3. **Initiate (re-)authorization** with the determined scope set
4. **Retry the original request** with the new authorization no more than a few times and treat this as a permanent authorization failure

Clients **SHOULD** implement retry limits and **SHOULD** track scope upgrade attempts to avoid
repeated failures for the same resource and operation combination.

Servers **MUST** account for scope hierarchies, where a broader scope implies narrower ones, when
deciding whether a token is sufficient for an operation.

## Security Considerations

Implementations of this specification **MUST** follow the normative security
requirements in [Security Considerations](/specification/2026-07-28/basic/authorization/security-considerations),
covering token audience binding and validation, token theft, communication security,
authorization code protection, mix-up and confused deputy attacks, open redirection,
and Client ID Metadata Document security.

## MCP Authorization Extensions

There are several authorization extensions to the core protocol that define additional authorization mechanisms. These extensions are:

* **Optional** - Implementations can choose to adopt these extensions
* **Additive** - Extensions do not modify or break core protocol functionality; they add new capabilities while preserving core protocol behavior
* **Composable** - Extensions are modular and designed to work together without conflicts, allowing implementations to adopt multiple extensions simultaneously
* **Versioned independently** - Extensions follow the core MCP versioning cycle but may adopt independent versioning as needed

A list of supported extensions can be found in the [MCP Authorization Extensions](https://github.com/modelcontextprotocol/ext-auth) repository.


---

Major finding: MCP 2026-07-28 is a stateless redesign. Now the client-side requirements and ACP.

---

[FETCH RESULT]
> ## Documentation Index
> Fetch the complete documentation index at: https://modelcontextprotocol.io/llms.txt
> Use this file to discover all available pages before exploring further.

# Client Best Practices

> Patterns for scaling MCP host applications across many servers and tools.

As MCP host applications, such as agents, connect to more MCP servers and accumulate access to hundreds or thousands of tools, naive approaches to tool management break down. Loading every tool definition into the model's context window upfront wastes tokens, increases latency, and degrades model performance. Passing large intermediate results through the model between sequential tool calls compounds the problem.

Two patterns address these challenges: **progressive discovery**, which controls *when* tool definitions enter context, and **programmatic tool calling**, which controls *how* tools are invoked.

## Progressive Tool Discovery

Naive MCP host implementations pass the tool definitions of every connected server directly to the model at the start of each conversation. For a handful of tools, this is perfectly reasonable. But when a host has access to dozens of servers exposing hundreds of tools, those definitions alone can consume the majority of the context window before the model has even read the user's message.

<img src="https://mintcdn.com/mcp/JXfd5cBmEUh_qPUI/images/progressive-discovery.svg?fit=max&auto=format&n=JXfd5cBmEUh_qPUI&q=85&s=db39f47006107f04af43b5eeae2d6022" alt="Comparison of loading all tools upfront versus discovering tools on demand. The upfront approach consumes ~150,000 tokens on definitions alone, while progressive discovery uses ~2,000 tokens by loading only what the task requires." width="760" height="440" data-path="images/progressive-discovery.svg" />

Progressive discovery avoids this:

* The host fetches tool definitions via `tools/list` as normal, but defers injecting them into the model's context.
* The host provides a lightweight `search_tools` meta-tool to the model.
* The host loads full definitions into context only as needed.

### When to Use Progressive Discovery

Progressive discovery is best used when tool definitions take large parts of the context window. For a small
set of tools with tool definitions taking up a small part of the context window, loading all tools is fine.
Once the tool definitions take up a significant part of the available context window, clients should switch to progressive discovery. We recommend that clients implement thresholds to determine when to switch:

* Implement a threshold as a percentage of the context window. For example, 1%-5%.
* Load tool definitions. Once the threshold is reached, switch to progressive discovery.

### Choosing a Discovery Strategy

Once the model invokes the `search_tools` tool, we need to choose a search strategy:

* **Keyword-based**: Keyword matching (BM25, regex). Simple and effective, particularly for descriptive tool names and descriptions.
* **Embedding-based**: Vector-similarity retrieval over tool descriptions. Handles synonyms and semantic matching better.
* **Subagent-based**: A secondary model, often a small and fast model such as Claude Haiku or Gemini Flash, selects tools for the task. This usually works very well but can be more costly than embedding-based or keyword-based solutions.
* **Hybrid**: Combine approaches. For example, by scoring across keyword and embedding rankings, or choosing
  different strategies depending on use-case or query.

Some model providers already offer built-in tool search. For example, [OpenAI](https://developers.openai.com/api/docs/guides/tools-tool-search) and [Anthropic](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool) support this natively; check your provider's documentation for an equivalent. When available, you may prefer the platform's tool search over a custom implementation. Build your own when the provider doesn't offer one or when you need specialized retrieval logic (e.g., domain-specific ranking or access-control filtering).

The three-layer pattern below illustrates a custom search-based approach in detail, but the layered principle (catalog, inspect, execute) applies regardless of retrieval mechanism.

### Using Progressive Discovery

One common implementation for progressive discovery uses a search-based three-layer approach:

**Layer 1: Catalog.** The host exposes a small set of meta-tools for searching available capabilities. A `search_tools` tool accepts a natural-language query and returns matching tool names with brief descriptions.

```typescript theme={null}
// The model calls a lightweight search tool
search_tools({ query: "update salesforce record" })

// Returns concise matches: names and one-line descriptions only
→ [
    { name: "salesforce_updateRecord", description: "Update fields on a Salesforce object" },
    { name: "salesforce_upsertRecord", description: "Insert or update based on external ID" }
  ]
```

**Layer 2: Inspect.** Once the model identifies a candidate, it fetches the full definition (input schema, output schema, documentation) for that tool only.

```typescript theme={null}
// The model inspects only the tool it needs
get_tool_details({ name: "salesforce_updateRecord" });
```

This returns the complete schema for a single tool:

```json theme={null}
{
  "name": "salesforce_updateRecord",
  "description": "Updates a record in Salesforce",
  "inputSchema": {
    "type": "object",
    "properties": {
      "objectType": {
        "type": "string",
        "description": "Salesforce object type"
      },
      "recordId": { "type": "string", "description": "Record ID to update" },
      "data": { "type": "object", "description": "Fields to update" }
    },
    "required": ["objectType", "recordId", "data"]
  }
}
```

**Layer 3: Execute.** The model calls the tool with full knowledge of its interface, having loaded only the definitions it needed.

This pattern reduces token usage dramatically and can improve tool selection accuracy: the model focuses on a few relevant tools rather than scanning hundreds of irrelevant ones. Other discovery strategies (embeddings, subagents, etc.) follow the same layered principle but substitute different retrieval mechanisms in the catalog layer.

### Dynamic Server Management

Progressive discovery extends beyond individual tools to entire servers. Rather than connecting to every configured server at startup, a host can:

1. Maintain a registry of available servers and their high-level descriptions.
2. Connect to a server only when the model determines it needs that server's capabilities.
3. Disconnect servers that are no longer relevant to the current task, freeing context.

```mermaid theme={null}
sequenceDiagram
    participant Model
    participant Host
    participant Registry
    participant Server

    Model->>Host: search_available_servers("CRM")
    Host->>Registry: Query available servers
    Registry-->>Host: Salesforce server (not connected)
    Host-->>Model: Salesforce server available

    Model->>Host: enable_server("salesforce")
    Host->>Server: server/discover
    Server-->>Host: Supported versions + capabilities
    Host->>Server: tools/list
    Server-->>Host: Tool definitions
    Host-->>Model: Salesforce server connected

    Note over Model: Task complete

    Model->>Host: disable_server("salesforce")
    Host-->>Model: Server disconnected, context freed
```

This works especially well for general-purpose agents, where the user's intent isn't known upfront. The agent starts with a minimal set of always-on servers and connects others as needed. Combined with [agent skills](/docs/2026-07-28/develop/build-with-agent-skills), a skill file can declare which MCP servers it needs, and the host connects them only when that skill is invoked.

### Implementation Guidelines

When implementing progressive discovery:

| Guideline                        | Rationale                                                                                                                                                                                          |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Offer multiple detail levels** | Let the model choose between name-only, name-and-description, or full-schema responses.                                                                                                            |
| **Cache tool definitions**       | Once fetched from a server, memoize the definition host-side so re-injecting it later doesn't need another `tools/list` round trip. This is separate from what's currently in the model's context. |
| **Refresh on `list_changed`**    | Re-index the search catalog when a server sends `notifications/tools/list_changed`.                                                                                                                |
| **Group tools by server**        | Present tools organized by their source server so the model can reason about related capabilities.                                                                                                 |

### Caching

Each list result (such as `tools/list`), as well as each `server/discover` and
`resources/read` result, carries `ttlMs` and `cacheScope` hints. Follow them as defined in the
specification's [caching utility](/specification/2026-07-28/server/utilities/caching). In particular,
treat a cached list as stale once a `list_changed` notification arrives, even before its TTL
expires.

### Interaction with Prompt Caching

Most providers cache the prompt prefix, including the `tools` array. Adding or removing tool
definitions mid-conversation invalidates that cache, and the resulting miss can cost more tokens
than the definitions you removed. To preserve caching:

* Append newly discovered definitions after the cache breakpoint rather than re-sorting the
  `tools` array, or route every call through a single stable `call_tool({name, args})` meta-tool
  so the array never changes.
* Treat server disconnection as a conversation-boundary operation rather than a per-turn one.
* Consult your provider's caching documentation alongside the tool-search links above.

## Programmatic Tool Calling / Code Mode

With direct tool calling, every tool invocation is a round trip: the model generates a tool call, the client executes it, and the full result flows back into the model's context. When a task requires chaining multiple tools (read a document, transform it, write it somewhere else), each intermediate result passes through the model, consuming tokens and adding latency even when it has nothing to do with them.

Programmatic tool calling (sometimes called "code mode") provides a way for clients to **compose tool calls** effectively. Instead of calling tools directly, the model writes code that calls tools. The code executes in a sandboxed environment, and only the final result returns to the model.

Programmatic tool calling is powerful and allows for more efficient use of MCP tools and resources, but requires
clients to implement a sandbox environment.

<img src="https://mintcdn.com/mcp/JXfd5cBmEUh_qPUI/images/programmatic-tool-calling.svg?fit=max&auto=format&n=JXfd5cBmEUh_qPUI&q=85&s=a2be82d097bb7cd7c7fd415918b1571d" alt="Comparison of direct tool calling versus programmatic tool calling. Direct calling passes every intermediate result through the model (~100K+ tokens). Programmatic calling sends a ~200-token script to a sandbox, which executes the tool calls and returns a ~15-token summary." width="900" height="900" data-path="images/programmatic-tool-calling.svg" />

### How It Works

The host converts MCP tool schemas into a typed API available inside a sandbox. When the model needs tools, it writes a script and executes it.

**Step 1: Generate a programmatic API from MCP schemas.** The host reads each server's tool definitions and produces typed functions based on each tool's arguments and `outputSchema`:

```typescript theme={null}
// Auto-generated from the Logging MCP server's tool schema
interface LogEntry {
  timestamp: string;
  message: string;
  level: string;
}

function logging_getLogs(input: {
  level: "error" | "warn" | "info";
  since: number;
}): Promise<{ entries: LogEntry[] }> {
  return mcp.callTool<{ entries: LogEntry[] }>("logging_getLogs", input);
}

// Auto-generated from the Ticketing MCP server's tool schema
function ticketing_createIssue(input: {
  title: string;
  body?: string;
  priority: "low" | "medium" | "high";
}): Promise<{ issueId: string }> {
  return mcp.callTool<{ issueId: string }>("ticketing_createIssue", input);
}
```

MCP Servers can provide an optional [`outputSchema`](/specification/2026-07-28/server/tools#output-schema) for each tool. When an output schema is present, the host can produce precise return types (like `LogEntry` above).

When an output schema is absent, prefer the simple path:

* **Use a generic type and move on.** Accept `any` or `string` and handle the unstructured output downstream. The real fix is for server authors to provide `outputSchema`.
* **Extract a typed result using a fast model**, for single-shot calls outside loops. Expose a host-brokered `extract(value, ExpectedType)` helper through the same stub-interception path as MCP tool calls so the sandbox itself never opens a network connection. The helper routes to a small model (for example, Claude Haiku or Gemini Flash) to coerce the value into `ExpectedType`. This adds per-call latency and can hallucinate or drop fields, so validate the result against `ExpectedType` before use.

**Step 2: The model writes code against these APIs.** Rather than making separate tool calls with full results flowing through context between them, the model writes a single script. Consider a task like "find all error logs from the past hour and file a ticket for each unique error." With direct tool calling, thousands of log entries would flow through the model's context. With code, the model filters in the sandbox:

```typescript theme={null}
// Model-generated code, executes in sandbox
const logs = await logging_getLogs({
  level: "error",
  since: Date.now() - 3600000,
});

// Filter and deduplicate inside the sandbox, not in the model's context
const uniqueErrors = new Map<string, LogEntry>();
for (const log of logs.entries) {
  if (!uniqueErrors.has(log.message)) {
    uniqueErrors.set(log.message, log);
  }
}

for (const [message, log] of uniqueErrors) {
  await ticketing_createIssue({
    title: `Error: ${message}`,
    body: `First seen: ${log.timestamp}\nOccurrences: ${
      logs.entries.filter((l) => l.message === message).length
    }`,
    priority: "high",
  });
}

console.log(
  `Filed ${uniqueErrors.size} tickets from ${logs.entries.length} error logs`,
);
```

**Step 3: The sandbox executes the code.** Function calls inside the sandbox are intercepted and routed back to the appropriate MCP server through the host broker. The log data and ticket creation flow directly between servers without ever entering the model's context. Only the `console.log` output, a single summary line, returns to the model.

### Choosing a Sandbox

The right sandbox depends on the language you want the model to write, your host application's language, and how much isolation you need. The table lists example runtimes rather than endorsements; evaluate maturity for your use case:

| Sandboxed language | Runtime / Library                                             | Host language     | Approach                                                                                        |
| ------------------ | ------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------- |
| **JavaScript**     | [Deno](https://github.com/denoland/deno), `isolated-vm`       | Rust / Node / CLI | V8-based runtimes with fine-grained permissions. Can disable all permissions for full lockdown. |
| **Python**         | [Monty](https://github.com/pydantic/monty) *(experimental)*   | Rust              | Minimal Python interpreter built for AI use cases. No I/O by default.                           |
| **TypeScript**     | [pctx](https://github.com/portofcontext/pctx) *(early-stage)* | Python / Rust     | Incorporates code mode concepts as a library, with low-level Rust support.                      |
| **Any (via Wasm)** | [Wasmtime](https://github.com/bytecodealliance/wasmtime)      | Rust / C / Go     | Compile any language to Wasm and run it with capability-based security.                         |

Regardless of sandbox, the integration pattern is the same: the host injects function stubs, intercepts calls over an in-process or stdio channel (so network permissions can stay fully denied), and dispatches them as `tools/call` requests to MCP servers.

### Execution Architecture

The implementation has three components:

```mermaid theme={null}
flowchart LR
    subgraph Host["MCP Host"]
        A[LLM] -->|writes code| B[Sandbox]
        B -->|function call| C[MCP Client]
        C -->|return value| B
        B -->|console output| A
    end
    C -->|tool call| D[MCP Server A]
    C -->|tool call| E[MCP Server B]
    D -->|result| C
    E -->|result| C
```

**The sandbox** runs model-generated code in an isolated environment with no direct network access. Its only interface to the outside world is through the generated function stubs, which route calls back to the host.

**The host** acts as a broker. It receives function calls from the sandbox, maps them to the correct MCP server, executes the tool call, and returns the result to the sandbox. Authorization tokens and credentials are held by the host and never exposed to the generated code.

**The model** sees only what the sandbox returns, typically the output of `console.log` statements or a final return value. This gives the model (and the client developer) precise control over what enters the context window.

### Security Considerations

Programmatic tool calling introduces a code execution surface that requires careful sandboxing:

* **Per-call authorization**: The broker is still the MCP host for spec purposes. Apply the same human-in-the-loop confirmation policy to sandbox-originated calls that you apply to direct calls (see [Tools: Security](/specification/2026-07-28/server/tools#security-considerations)). Approving the script does not grant blanket approval for every tool call it makes at runtime; hosts may grant categorical approval (for example, "allow `ticketing_createIssue` for this script run") rather than prompting per iteration, but the broker must still evaluate each call against that grant.
* **Cross-server data flow**: Tool results from one server are untrusted input to another. The broker should apply the same input-review policy to brokered calls as to direct ones; output truncation alone does not prevent exfiltration.
* **Network isolation**: The sandbox should have no direct network access. All external communication flows through the host broker, which enforces authorization and access control.
* **No credential exposure**: API keys and tokens are held by the host. The generated code calls typed functions; the host adds authentication when forwarding to servers.
* **Resource limits**: Set timeouts and memory limits on sandbox execution to prevent runaway scripts.
* **Output filtering**: Validate and truncate sandbox console output before feeding it back to the model.

### Error Handling

MCP tool errors arrive as a successful response with
[`isError: true`](/specification/2026-07-28/server/tools#error-handling) rather than a transport
failure. Generated wrappers should convert this into a thrown exception so model-authored code
can use `try`/`catch`. If an uncaught error terminates the script, surface it as the script's
result so the model can self-correct; the model is responsible for reporting any partial side
effects already committed.

## Combining Both Patterns

Progressive discovery and programmatic tool calling work well together. The model uses discovery tools to identify which tools it needs, loads their schemas, and then writes a single script that calls multiple tools in one execution pass. This combination minimizes both the token cost of tool definitions *and* the token cost of tool results, keeping the model's context focused on reasoning rather than passing data through it.


---

[FETCH RESULT]
> ## Documentation Index
> Fetch the complete documentation index at: https://modelcontextprotocol.io/llms.txt
> Use this file to discover all available pages before exploring further.

# Extension Support Matrix

> Which MCP clients implement which official extensions

export const CHECK = () => <span className="flex justify-center">
    <Icon icon="check" iconType="solid" size={18} className="text-green-500" />
  </span>;

This matrix shows which MCP clients support each [official extension](/extensions/overview). Extensions are always opt-in: a client only uses an extension if both client and server declare support in the `extensions` field of their [capabilities](/extensions/overview#negotiation).

<Note>
  This list is maintained by the community. If you notice any inaccuracies or would like to add or update information, please [submit a pull request](https://github.com/modelcontextprotocol/modelcontextprotocol/pulls).
</Note>

## Extension overview

| Extension                                                                             | Identifier                                                 | Description                                                     |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------- |
| [MCP Apps](/extensions/apps/overview)                                                 | `io.modelcontextprotocol/ui`                               | Interactive HTML interfaces rendered inline in the conversation |
| [OAuth Client Credentials](/extensions/auth/oauth-client-credentials)                 | `io.modelcontextprotocol/oauth-client-credentials`         | Machine-to-machine auth without interactive user login          |
| [Enterprise-Managed Authorization](/extensions/auth/enterprise-managed-authorization) | `io.modelcontextprotocol/enterprise-managed-authorization` | Centralized access control via enterprise IdP                   |

## Support matrix

| Client                                                                   | [MCP Apps](/extensions/apps/overview) | [OAuth Client Credentials](/extensions/auth/oauth-client-credentials) | [Enterprise Auth](/extensions/auth/enterprise-managed-authorization) |
| ------------------------------------------------------------------------ | :-----------------------------------: | :-------------------------------------------------------------------: | :------------------------------------------------------------------: |
| [Claude (web)](https://claude.ai)                                        |               <CHECK />               |                                                                       |                                                                      |
| [Claude Desktop](https://claude.ai/download)                             |               <CHECK />               |                                                                       |                                                                      |
| [VS Code GitHub Copilot](https://code.visualstudio.com/)                 |               <CHECK />               |                                                                       |                                                                      |
| [Microsoft 365 Copilot](https://www.microsoft.com/microsoft-365-copilot) |               <CHECK />               |                                                                       |                                                                      |
| [Goose](https://block.github.io/goose/)                                  |               <CHECK />               |                                                                       |                                                                      |
| [Postman](https://postman.com)                                           |               <CHECK />               |                                                                       |                                                                      |
| [MCPJam](https://www.mcpjam.com/)                                        |               <CHECK />               |                                                                       |                                                                      |
| [ChatGPT](https://chatgpt.com/)                                          |               <CHECK />               |                                                                       |                                                                      |
| [Cursor](https://cursor.com/)                                            |               <CHECK />               |                                                                       |                                                                      |
| [Archestra.AI](https://www.archestra.ai/)                                |               <CHECK />               |                                                                       |                               <CHECK />                              |
| [PostHog Code](https://posthog.com/code/)                                |               <CHECK />               |                                                                       |                                                                      |

<Note>
  Auth extension support (OAuth Client Credentials and Enterprise-Managed Authorization) is tracked separately from the core MCP authorization features (DCR, CIMD). Check each extension's specification and the [ext-auth repository](https://github.com/modelcontextprotocol/ext-auth) for the latest implementation status.
</Note>

## Adding extension support to your client

If you're building an MCP client and want to implement extension support:

1. Review the extension specification (e.g., in the [ext-auth](https://github.com/modelcontextprotocol/ext-auth) or [ext-apps](https://github.com/modelcontextprotocol/ext-apps) repository)
2. Declare support in the `extensions` field of the `io.modelcontextprotocol/clientCapabilities` your client sends in each request's `_meta`, and read the server's `extensions` from its [`server/discover`](/specification/draft/server/discover) response
3. Implement the extension's protocol requirements
4. Submit a pull request to update this matrix

See [Extensions Overview](/extensions/overview#negotiation) for details on the capability negotiation mechanism.


---

[FETCH RESULT]
Failed to authenticate. API Error: 403 pre-consume quota failed, user quota: ＄0.209734, need quota: ＄0.308128 (request id: 20260901130952346675552v2ksshszGFv53)

---

[FETCH RESULT]
## Version

The documentation set is the **v1** protocol (all schema/spec links point to `/protocol/v1/...`). The overview itself doesn't print a numeric version constant — version agreement happens in the `initialize` call, described as "Negotiate versions and exchange capabilities."

## Communication model

Built on JSON-RPC 2.0, with two message kinds: request/response **methods** and one-way **notifications** that get no reply. Typical order: initialize (plus authenticate if needed) → create or load a session → prompt turn, which ends when the agent returns a stop reason. Errors use standard JSON-RPC `error` objects with `code` and `message`; successful calls return `result`.

## Agent-side methods (exact names)

**Baseline:** `initialize`, `authenticate`, `session/new`, `session/prompt`

**Optional (capability-gated):** `session/load` (needs `loadSession`), `logout` (needs `agentCapabilities.auth.logout`), `session/set_mode`

**Notification:** `session/cancel`

## Client-side methods (exact names)

**Baseline:** `session/request_permission`

**Optional (capability-gated):** `fs/read_text_file` (`fs.readTextFile`), `fs/write_text_file` (`fs.writeTextFile`), `terminal/create`, `terminal/output`, `terminal/release`, `terminal/wait_for_exit`, `terminal/kill` (all require the `terminal` capability), and `elicitation/create` (requires "the matching `elicitation` mode capability")

**Notifications:** `elicitation/complete`, `session/update` — the latter carries message chunks, tool calls, plans, available-command updates, and mode changes.

## Capability negotiation & extensibility

Capabilities are swapped during initialization, and each optional method above is unlocked only if the corresponding capability was declared. Beyond the standard set, implementers may attach extra data via `_meta` fields, define non-standard methods by giving the name a leading underscore, and "Advertise custom capabilities during initialization."

## Other conventions

Every file path must be absolute; line numbers start at 1. Object property keys are `camelCase`, while discriminator string values are `snake_case`; JSON-RPC envelope fields keep their spec-defined names.

---

Failed to authenticate. API Error: 403 pre-consume quota failed, user quota: ＄0.290258, need quota: ＄0.481616 (request id: 20260901131014468782773vt5cliDTdAT3G)