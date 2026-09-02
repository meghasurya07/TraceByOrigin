# Supermemory and the AI-memory landscape — the foundation of our USP.

## URLs fetched
- https://supermemory.ai
- https://docs.supermemory.ai
- https://supermemory.ai/docs/
- https://supermemory.ai/llms.txt
- https://supermemory.ai/docs/concepts/how-it-works
- https://supermemory.ai/pricing.md
- https://supermemory.ai/docs/self-hosting/overview
- https://github.com/orgs/supermemoryai/repositories
- https://github.com/supermemoryai/supermemory
- https://supermemory.ai/research
- https://supermemory.ai/memory-graph
- https://github.com/supermemoryai/code-chunk
- https://github.com/supermemoryai/cursor-supermemory
- https://supermemory.ai/llms-full.txt
- https://github.com/mem0ai/mem0
- https://github.com/getzep/graphiti

## Content

I'll research this facet thoroughly, starting with Supermemory's primary sources.

---

[FETCH RESULT]
API Error: 400 content-blocked (request id: 20260901130205582689936dmhl5T2xY5duM)

---

[FETCH RESULT]
REDIRECT DETECTED: The URL redirects to a location that was not fetched automatically.

Original URL: https://docs.supermemory.ai
Redirect URL (from the server's Location header — server-supplied, not verified): https://supermemory.ai/docs/
Status: 301 Moved Permanently

To complete your request, I need to fetch content from the redirected URL. Please use WebFetch again with these parameters:
- url: "https://supermemory.ai/docs/"
- prompt: "Extract the documentation structure: what are the main sections, API endpoints, SDKs, concepts like memory router / infinite context. List all page titles and URLs you can see."

---

[FETCH RESULT]
## What it is

**Supermemory** — positioned as "The memory layer for AI agents." The site describes it as a "Context engineering platform powering enterprise APIs, developer plugins, and a personal app that remembers everything," produced by what it calls "a research and product lab building the best context and memory infrastructure for AI agents."

## Product offering / surfaces

- **API Documentation** and a **REST API Reference**
- **TypeScript / Python SDK**
- **OpenAPI Spec** (`https://api.supermemory.ai/v3/openapi`)
- **Developer Console (API Keys)** at `console.supermemory.ai`
- **MCP Server Card** and **API Catalog** under `/.well-known/`
- Agent-oriented context files: **llms.txt** and **llms-full.txt**

## Core API endpoints (v3)

- Add documents: `POST https://api.supermemory.ai/v3/documents`
- Search memories: `POST https://api.supermemory.ai/v3/search`

## Named features (verbatim feature names + claims)

| Feature | Claim |
|---|---|
| **User Profiles** | "Builds deep user profiles from behavior — intent, preferences, and context" |
| **Memory Graph** | "Custom vector graph engine with ontology-aware edges" |
| **Retrieval** | "Hybrid vector + keyword search with sub-300ms latency" |
| **Extractors** | "Understands any format — PDFs, web pages, images, audio" |
| **Connectors** | "Notion, Google Drive, S3, Gmail, and custom sources" |

## Architecture / technical claims

The notable engineering assertions are a proprietary vector-graph store whose edges carry ontology awareness, retrieval that blends embedding similarity with lexical matching, and a stated latency target under 300 milliseconds. Ingestion is claimed to be format-agnostic across documents, web content, and media.

## Target users

Two distinct audiences are implied: developers and enterprises integrating memory into agents (via SDKs, REST/MCP, and API keys), and individual end users of the consumer-facing personal recall app.

## Pricing

No figures, tiers, or limits appear in this content — pricing is only referenced as a link (`supermemory.ai/pricing`). Any specific cost details would need to come from that page.

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: InvokeModelWithResponseStream: operation error Bedrock Runtime: InvokeModelWithResponseStream, https response error StatusCode: 400, RequestID: 2f8d55cc-9565-45f2-813a-8b894bba02fd, ValidationException: Tool 'web_search' not found in provided tools (request id: f72c5b5e2b2c9eed02e3a03667f738ba) [trace_id=48a918c1a049ba7e6f391cda2931308f] (request id: 20260901130310518512719m6cnzkAMP2bC5)

---

WebSearch had a transient error. Let me retry and fetch the docs.

---

[FETCH RESULT]
## What's on this page

This is the docs landing page for supermemory, described as "Context infrastructure for AI agents." The tagline adds that you can "Use it with the API, your tools, your team, or run it yourself."

### Full index
The page points to a machine-readable index rather than listing every page: `https://supermemory.ai/docs/llms.txt` — recommended as the starting point "to discover all available pages before exploring further."

### Links present on the page

| Title / label | URL | Description given |
|---|---|---|
| Introduction (this page) | — | landing page |
| Architecture | `/docs/concepts/how-it-works` | primary CTA button |
| Quickstart | `/docs/quickstart` | secondary CTA button |
| Set up your company brain | `/docs/company-brain/setup` | tertiary CTA link |
| Developer platform | `/docs/overview/what-is-supermemory` | "API reference, concepts, and SDKs" |
| Company brain | `/docs/company-brain/overview` | "Team knowledge on the same engine" |
| Plugins and MCP | `/docs/supermemory-mcp/mcp` | "Drop memory into Claude and coding agents" |
| Self-hosting | `/docs/self-hosting/overview` | "Run it locally with zero config" |

### Implied main sections
Based on the URL path segments, the docs appear to be organized into: `overview`, `quickstart`, `concepts`, `company-brain`, `supermemory-mcp`, and `self-hosting`.

### Gaps in the provided content
- **API endpoints:** none are named. The only signal is that an API reference sits under the developer platform section.
- **SDKs:** mentioned only in passing in the developer-platform card blurb; no languages or packages are listed.
- **Concepts such as memory router or infinite context:** these do not appear anywhere in the supplied text. Only one concepts page is linked (`how-it-works`), so any such topics would need to be confirmed via the `llms.txt` index or the concepts section itself.

The remainder of the page is JSX/styling markup for the hero layout and card components, plus four CDN-hosted illustration images — no additional navigational information.

---

[FETCH RESULT]
I can't reproduce the file verbatim, but here's a complete inventory of every documented page and URL it contains, with paraphrased notes.

**Overview**
Supermemory positions itself as a memory/context layer for AI agents, spanning enterprise APIs, developer plugins, and a consumer app. It advertises five context layers: user profiles, memory graph, retrieval, extractors, and connectors.

**Quick start**
- API docs — https://docs.supermemory.ai
- TypeScript SDK — https://supermemory.ai/docs/integrations/supermemory-sdk
- Python SDK — https://supermemory.ai/docs/integrations/supermemory-sdk
- REST reference (add document) — https://supermemory.ai/docs/api-reference/manage-documents/add-document
- Developer console / API keys — https://console.supermemory.ai
- Personal app — https://app.supermemory.ai

**Core API endpoints**
- Add: POST https://api.supermemory.ai/v3/add
- Search: POST https://api.supermemory.ai/v3/search
- Reference index — https://docs.supermemory.ai/api-reference
- OpenAPI spec — https://supermemory.ai/openapi.json

**Integrations page** — https://supermemory.ai/docs/integrations/supermemory-sdk
Listed compatibility covers TypeScript, Python, REST, Claude Code, Cursor, OpenClaw, OpenCode, Windsurf, Vercel AI SDK, LangChain, LangGraph, CrewAI, OpenAI SDK, Mastra, Zapier, n8n, and Pipecat.

**Features / related properties**
- Filesystem flavor of SuperRAG — https://smfs.ai
- Retrieval is described as hybrid vector plus keyword with "sub-300ms latency" and reranking that is context-aware.

**Benchmarks & research**
- Open eval platform, MemoryBench — https://git.new/membench
- Research paper — https://supermemory.ai/research
- Claimed results: 85.2% on LongMemEval, top rank on LoCoMo and ConvoMem.

**Pricing**
- Pricing page — https://supermemory.ai/pricing
- Markdown version — https://supermemory.ai/pricing.md
- Tiers: Free $0, Pro $19/mo, Max $100/mo, Scale $399/mo, Enterprise custom, all usage-based with bundled monthly credits.
- Startup/research program: three complimentary months of Scale — https://binary.so/eQvzzEk
- Sales/enterprise call booking — https://cal.com/supermemory/meet?overlayCalendar=true

**Company links**
- Main site — https://supermemory.ai
- GitHub org — https://github.com/supermemoryai
- X — https://x.com/supermemory
- Security — https://supermemory.link/security

**Product pages**
- https://supermemory.ai/connectors — data source hookups
- https://supermemory.ai/mcp — Model Context Protocol support
- https://supermemory.ai/plugins — editor and AI tool plugins
- https://supermemory.ai/rag — retrieval-augmented generation
- https://supermemory.ai/memory-graph — described as a "living knowledge graph"
- https://supermemory.ai/personal — unified memory across AI tools

**Optional expanded doc**
- https://supermemory.ai/llms-full.txt — fuller documentation including FAQ and pricing detail

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: Tool 'web_search' not found in provided tools tid:b150625b7673977f5c672350f2214174_1788239142242 (request id: 64c2e0132c09549b2973a436fc87d1a4) [trace_id=6d8ba866d5089e50f3d6daf5ae5d0698] (request id: 20260901130520476692262vt5clLtfUzU26)

---

Let me fetch the architecture, pricing, and self-hosting docs in parallel.

---

[FETCH RESULT]
# Supermemory Pricing — Extracted Figures

## Plan tiers (identical whether signed up via Developer Console or Personal App)

| Plan | Price | Included usage | Key gating |
|---|---|---|---|
| Free | $0/mo | "~$5/mo of usage built in" | Hermes Plugin, Supermemory MCP, community support only. No pay-as-you-go. |
| Pro | $19/mo | "~$20/mo of usage built in" | Unlimited storage + users; "2 teammates included"; Google Drive, Notion & OneDrive connectors; auto top-up; OpenClaw/Claude Code plugins; email support |
| Max | $100/mo | "~$130/mo of usage built in (6× Pro)" | Adds "Gmail & Granola connectors (+ Pro)"; priority support |
| Scale | $399/mo | "~$600/mo of usage built in" | "Up to 10 teammates"; all connectors (Gmail, GitHub, S3, Web Crawler + Pro); "Auto top-up + spend caps"; SOC 2 · HIPAA BAA; self-hosted option |
| Enterprise | Custom | "~Unlimited usage" | Committed-spend pricing, air-gapped self-hosting, dedicated instance/infra, SOC 2 · HIPAA · GDPR, DPA, Enterprise MCP, uptime SLA, dedicated AM + forward-deployed engineer, Slack channel |

## Rate card (per-unit costs)

Stated as the "Same rates across Free, Pro, and Scale," with committed-spend discounts reserved for Enterprise.

- **Memory** — plain text: $0.005 per 1K SM tokens; rich content: $0.010 per 1K SM tokens. Marketed as "2× cheaper than next-best, with better quality."
- **SuperRAG** — text mode: $0.001 per 1K SM tokens; rich mode: $0.002 per 1K SM tokens. "'Rich' = images, PDFs, audio, video."
- **Search & traversal** — $0.005 per 1K queries; performance claim: "Sub-300ms p50."
- **Operations** (re-ranking, aggregation, query rewriting) — $0.10 per 1K operations.

## Billing mechanics

- Billed in SM tokens; only net-new unique content is charged, described as a "100% prompt-cache discount, baked in" — re-uploads, connector syncs, and repeated context aren't re-billed.
- Subscription credits reset each month; purchased top-up credits "never expire."
- Overage: Free accounts are paused and must upgrade; Pro/Max/Scale auto top-up, and Scale supports hard spend caps.

## Other numbers

- **Startup & Research Program**: "3 months of the Scale plan, free (100% off)," including ~$600/mo usage and all Scale features.
- **Get started**: "$5 of monthly usage. No credit card required."

## Not specified in the source

No numeric API rate limits, request quotas, or memory-object counts are published — storage and users are listed as unlimited on Pro and above, and rate limits are only described as custom at the Enterprise level. Also note the rate card names Free, Pro, and Scale but omits Max from that same-rate statement.

---

[FETCH RESULT]
## Self-hostable components

The local build is described as the same engine powering the hosted service — "ingestion, memory extraction, hybrid semantic search, and the full API" — shipped as one self-contained binary. Included out of the box:

- **Graph engine, embedded** — provisioned on first boot; no external database or connection strings
- **Local embeddings** — default `Xenova/bge-base-en-v1.5` (768d), no API key needed
- **Auto-generated API key** — printed at first startup
- **Full Memory API** — `/v3/documents`, `/v4/search`, `/v4/profile`, plus spaces

## License

The page states the project is "open source" and links to `git.new/memory`. The specific license name/version isn't given here — check the repository for the actual terms and comply with them.

## Dependencies & required services

- **Docker/Compose: not used.** The docs say plainly: "No Docker. No database to provision. No config files."
- **The one external requirement is an LLM.** Supported: OpenAI, Anthropic, Gemini, Groq, or any OpenAI-compatible endpoint.
- **Fully offline option** — point it at Ollama, LM Studio, vLLM, or llama.cpp; `gpt-oss-20b` is suggested as a good match. Configured via `OPENAI_BASE_URL`, `OPENAI_API_KEY`, `OPENAI_MODEL`.
- Install paths: a `curl | bash` script or `npx supermemory local`.
- Default listen address: `http://localhost:6767`, which SDKs and the Claude Code / Codex / OpenCode plugins can target (`SUPERMEMORY_API_URL`).

## Limitations vs. the hosted platform

| Area | Self-hosted gap |
|---|---|
| Connectors (Google Drive, Notion, Gmail, OneDrive) | Not available |
| Supermemory MCP | Not available |
| Memory extraction | Runs on "Your model, your key" instead of the platform's proprietary long-horizon models, which the docs claim deliver "higher quality, cheaper at scale" |
| Infrastructure | Confined to your machine rather than a globally distributed, auto-scaling tier |
| Embeddings | Local default or OpenAI/Gemini/Ollama, self-managed rather than hosted for you |

Parity exists on the full Memory API, hybrid semantic search, and file ingestion (PDFs, images). The docs position self-hosting for local development, air-gapped setups, and privacy-sensitive work, and note that outgrowing a single machine means migrating to the platform — framed as "one `baseURL` change away." A separate page covers Local vs. Enterprise for team deployments.

---

[FETCH RESULT]
## Core architecture (as described)

Two internal components underpin everything: "a custom learning model and a graph database that we built internally."

- **Learning model** — "Decides what and how to learn, what is important, when to forget, creating relations, etc."
- **Temporal Vector-graph engine** — where learnings are stored, "optimized for search." Described as a "Fact-based temporal graph that has Vector, FTS, and graph built in." So it isn't graph *vs.* vector — vector search, full-text search, and graph traversal are unified in one engine.

## Ingestion pipeline (six documented stages)

| Stage | Documented behavior |
|---|---|
| Queued | "Accepted; waiting to run" |
| Extracting | "Text / OCR / transcription / page fetch" |
| Chunking | "Splits content for retrieval (type-aware where needed)" |
| Embedding | "Vectors for similarity search" |
| Indexing | "Makes chunks and derived structure searchable" |
| Done | "Document path is ready for search" |

Status is polled via `client.documents.get(doc.id)`, returning values from `"queued"` through `"done"` or `"failed"`.

**Inputs accepted:** transcripts/messages, text, markdown, HTML, PDFs, images, audio/video, code, URLs, and connector items (Drive, Notion, Gmail).

## Chunking strategy

Chunking is fully managed — "You do not pre-chunk or pick an embedding model." Quality is attributed to "Contextual Chunking and other features for better quality search and memory generation," plus type-aware splitting.

## Dreaming (graph write phase)

A second phase, separate from indexing. `status: done` only means chunks are searchable; graph facts come from dreaming.

- **`dynamic`** (default): related documents are grouped so memories form from "coherent units," and extraction "may continue **after** `status: \"done\"`."
- **`instant`**: the document is "dreamed **on its own, right away**," and bills "one extra operation per document."

## Storage outputs

Three artifacts per document, all within the same `containerTag`: **document chunks** (grounding for RAG/SuperRAG), **memories** (graph facts with updates, links, and time), and a **profile** (memory sample plus static and dynamic summary).

## Isolation layer

`containerTag` is the "hard isolation boundary (user, tenant, project)"; metadata provides "soft dimensions *inside* a tag"; scoped API keys "cannot cross a container."

## API surface

`POST https://api.supermemory.ai/v3/documents` with a Bearer `sm_...` key; SDK methods `add`, `search`, `documents.get`; `customId` provides stable identity for updates and drives diff billing on re-ingest.

## Not present in this page

I can't extract these because the document doesn't contain them:

- **Embedding models** — no model names, dimensions, or providers; the page explicitly abstracts this away.
- **Infrastructure** — no mention of Cloudflare, Workers, D1, Vectorize, or any hosting/runtime detail.
- **Reranking** — no rerank stage, hybrid-fusion algorithm, or scoring method described.
- **Latency numbers** — no figures given. Only qualitative statements: "Larger PDFs and long video take longer," while short chat turns "usually finish in seconds."
- Chunk sizes, overlap, graph schema, and consistency guarantees are also unspecified.

For deeper detail the page points to Graph memory, Multi-modal ingestion, SuperRAG, Search API, and Profiles, plus the full index at `supermemory.ai/docs/llms.txt`.

---

[FETCH RESULT]
## supermemoryai — 29 repositories

| Repository | Description | Stars | Language | License |
|---|---|---|---|---|
| supermemory | Memory/context engine and app — fast, scalable, locally runnable; billed as "The Memory API for the AI era." | 29k | TypeScript | MIT |
| codex-supermemory | "Persistent memory for OpenAI Codex CLI" | 45 | TypeScript | — |
| opencode-supermemory | "Supermemory plugin for OpenCode" | 1.6k | TypeScript | — |
| cursor-supermemory | "Supermemory plugin for Cursor!" | 22 | TypeScript | — |
| claude-supermemory | Lets Claude Code learn in real time and keep its knowledge current via supermemory | 2.7k | HTML | — |
| sdk-ts | No description given | 19 | TypeScript | Apache-2.0 |
| eve-supermemory | "Memory and RAG for Eve agents" | 7 | TypeScript | — |
| memorybench | "Unified benchmark for evaluating conversational memory and RAG across multiple datasets" | 312 | TypeScript | MIT |
| smfs | Agent-oriented filesystem with retrieval, memory profiles and a sync engine; drop in PDFs, images or video and grep them | 476 | Rust | MIT |
| python-sdk | "Supermemory python SDK (Auto-generated)" | 0 | Python | Apache-2.0 |
| emoji-resolve | "Platform-agnostic emoji → shortcode resolver" with fuzzy matching for Slack, Discord, etc. | 10 | TypeScript | MIT |
| infinite-chat (template) | "Just ask." | 15 | TypeScript | Other |
| openclaw-supermemory | Adds long-term memory and recall to an openclaw agent | 799 | TypeScript | — |
| llm-bridge | Translates between LLM input formats, with observability and error handling included | 326 | TypeScript | MIT |
| preprint | "A new substrate for browser agents: files, actions, diffs, logs, and artifacts." | 22 | Rust | Apache-2.0 |
| skills | No description given | 94 | — | — |
| examples | "Examples for supermemory" | 1 | TypeScript | — |
| install-mcp | "A simple CLI to install MCP servers into any client - auth included!" | 194 | TypeScript | MIT |
| code-chunk | "AST-aware chunking of code for contextual retrieval" | 209 | TypeScript | MIT |
| pipecat-memory | "Add persistent memory to Pipecat voice AI agents" | 22 | TypeScript | MIT |
| supermemory-mcp | Universal Memory MCP that exposes your memories to any LLM, with "No logins or paywall" | 1.7k | TypeScript | MIT |
| messages-memory | No description given | 3 | TypeScript | Other |
| apple-mcp (archived) | "Collection of apple-native tools for the model context protocol." | 3.1k | TypeScript | MIT |
| opensearch-ai | "SearchGPT / Perplexity clone, but personalised for you." | 1.3k | TypeScript | — |
| cloudflare-saas-stack (template) | Ship full-stack apps with database, auth, styling and storage already sorted | 3.7k | TypeScript | — |
| backend-api-kit | Build scalable, monetisable backend APIs using Hono plus Cloudflare Workers | 554 | TypeScript | MIT |
| authkit-remix-cloudflare | Cloudflare-friendly authentication and session helpers pairing WorkOS/AuthKit with Remix | 7 | TypeScript | MIT |
| Friend | "AI wearable necklace" | 13 | C | MIT |
| markdowner | Converts any website into markdown data ready for LLMs | 2k | TypeScript | MIT |

Note: dashes indicate no language or license shown on the page.

---

[FETCH RESULT]
## What the page actually contains

### LongMemEval results (Section "01 · Memory," dated May 2026)

Benchmark setup as listed: "LongMemEval_s · 500 questions · 6 categories · with aggregation" — the metric is Recall@k.

Per-category recall (at the "with aggregation" / @15 setting shown):

| Category | Recall |
|---|---|
| Single-session – Assistant | 100% |
| Single-session – User | 97% |
| Knowledge Update | 99% |
| Multi-session | 93% |
| Temporal Reasoning | 91% |
| Single-session – Preference | 90% |

Three overall operating points are given, one per k value (@5 / @10 / @15):

- 86% overall, ~190 mean tokens, 99.8% context reduction
- 91% overall, ~450 mean tokens, 99.6% context reduction
- 95% overall, ~720 mean tokens, 99.4% context reduction

The summary claim: Supermemory reaches "95% Recall@15 with aggregation while adding only ~720 tokens — a 99.4% context reduction."

### SMFS / xAFS filesystem results (Section "02 · File Systems," May 2026)

Cumulative token usage over "110 xAFS questions," summed per agent-condition, lower being better:

| Condition | Cumulative tokens |
|---|---|
| FS × gpt-5.5 | 84M ±11M |
| SMFS × gpt-5.5 | 48M ±8.6M |
| FS × claude-opus-4.7 | 72M ±11M |
| SMFS × claude-opus-4.7 | 24M ±1.9M |

Headline: "3.0× fewer tokens on Claude · 1.75× on Codex," with the page also stating accuracy improved rather than degraded.

### Methodology details available

Very little is spelled out. The page describes only the datasets (LongMemEval_s, 500 questions, 6 categories; xAFS, 110 questions), the use of an "aggregation" variant, k values of 5/10/15, mean added tokens, and the models compared (gpt-5.5, claude-opus-4.7). Separately, it sketches a retrieval pipeline that mixes "static context" prepared by Supermemory with "Dynamic context" described as "Relevant memories from graph," using a hook endpoint (`/v4/p?query`) and a search tool (`/v4/search`), keyed by `customId`/`containerTag` plus metadata.

### Not present on this page

- **LoCoMo** — no mention.
- **ConvoMem** — no mention.
- **Mem0, Zep, OpenAI memory** — no comparisons or numbers. The only baseline is a generic filesystem ("FS") versus SMFS.
- **Paper title, authors, arXiv link** — none. There are only links: a LongMemEval paper at `/research/longmembench`, and two external items, "Memory as a filesystem" and "xAFS benchmark runs," both hosted on smfs.ai and dated May 2026.
- **Latency figures** — none given; efficiency is expressed purely in tokens and context reduction.
- **Cost figures** — none, aside from a link to a pricing page.

To obtain the missing comparisons, methodology, and any author or arXiv information, the linked papers themselves would need to be retrieved.

---

[FETCH RESULT]
## code-chunk (supermemoryai/code-chunk)

**Purpose:** A library for "AST-aware code chunking for semantic search and RAG pipelines." Instead of cutting code at fixed character counts, it divides source at meaningful structural boundaries — functions, classes, methods — so a chunk never lands "mid-function." Each output piece carries metadata: scope chain, imports, neighboring entities, and signatures.

**Parser:** Yes — tree-sitter. Source is parsed into an Abstract Syntax Tree, giving a representation that "understands language grammar."

**Pipeline (5 stages):**
1. **Parse** — build the AST via tree-sitter.
2. **Extract** — walk the tree for functions, methods, classes, interfaces, types, and imports, capturing name/type, full signature, any docstring or comment, plus byte and line ranges.
3. **Build scope tree** — nest entities hierarchically so a method knows its parent class, yielding context strings like `UserService > getUser`.
4. **Chunk** — respect `maxChunkSize`, keep whole entities intact where possible, split oversized ones at statement boundaries, and merge small neighbors "to reduce fragmentation."
5. **Enrich** — assemble `contextualizedText`, described as "optimized for embedding models to understand semantic relationships." The prepended header lists file path, scope, what's defined, what's used, and what precedes the chunk.

**Package name / install:** `code-chunk` — installable with `bun add code-chunk` or `npm install code-chunk`.

**API surface:**

| Function | Returns |
|---|---|
| `chunk(filepath, code, options?)` | `Promise<Chunk[]>` |
| `chunkStream(...)` | `AsyncGenerator<Chunk>` (note: `totalChunks` is `-1`, since the count isn't known upfront) |
| `chunkStreamEffect(...)` | `Stream.Stream<Chunk, ...>` |
| `createChunker(options?)` | reusable `Chunker` with `chunk()`, `stream()`, `chunkBatch()`, `chunkBatchStream()` |
| `chunkBatch(files, options?)` | `Promise<BatchResult[]>`, each `{ filepath, chunks, error }` |
| `chunkBatchStream(...)` | `AsyncGenerator<BatchResult>` |
| `chunkBatchEffect(...)` / `chunkBatchStreamEffect(...)` | Effect-native batch / streaming batch |
| `formatChunkWithContext(text, context, overlapText?)` | `string` |
| `detectLanguage(filepath)` | `Language \| null` |

**Options:** `maxChunkSize` (default 1500 bytes), `contextMode` (`none`/`minimal`/`full`, default `full`), `siblingDetail` (`none`/`names`/`signatures`, default `signatures`), `filterImports` (default false), `language` (overrides auto-detection), `overlapLines` (default 10). Batch adds `concurrency` (default 10) and an `onProgress` callback.

**Supported languages:** TypeScript (`.ts`, `.tsx`, `.mts`, `.cts`), JavaScript (`.js`, `.jsx`, `.mjs`, `.cjs`), Python (`.py`, `.pyi`), Rust (`.rs`), Go (`.go`), Java (`.java`).

**Errors:** `ChunkingError` for parse/extraction failures and `UnsupportedLanguageError` for unrecognized extensions; both expose a `_tag` field suited to Effect-style handling.

**Other features listed:** batch processing with controlled concurrency, incremental streaming for large files, and "First-class Effect integration."

**License:** MIT. The repo shows 209 stars, 17 forks, and 72 commits.

---

[FETCH RESULT]
# Supermemory Memory Graph — Extracted Details

## Core architecture / ontology

The design is described as a "Fact-based graph" rather than a triplet store. Each node is a self-contained fact — the page calls it "Dense storage — each fact is a self-contained node with full context" — as opposed to conventional graphs that "decompose every fact into subject-predicate-object triplets."

The stated critique of triplet models has three parts:
- **Triplet overhead** — one piece of knowledge fragments into many nodes/edges traversed "one hop at a time."
- **Scaling** — "Multi-hop traversal required for every query"; queries "fast at 1K nodes become unusable at 1M."
- **Cost** — expense tracks graph complexity rather than knowledge volume; "Latency and cost grow with graph complexity."

Claimed benefits: "Sub-second query and traversal latency at any scale" and better result quality from denser per-node information.

## Node types (memory types)

Classification is automatic, and each type has distinct persistence/retrieval behavior:

| Type | Example given | Lifecycle |
|---|---|---|
| Facts | "Alex is a PM at Stripe" | "Persists until updated" |
| Preferences | "Alex prefers morning meetings" | "Strengthens with repetition" |
| Episodes | "Met Alex for coffee Tuesday" | "Decays unless significant" |

## Edge types (three relationship kinds)

- **Updates** — supersession when facts change. A Google-engineer memory is replaced by a Stripe-PM memory; retrieval returns current data "while preserving history."
- **Extends** — enrichment where both memories stay true: "Both remain valid — searches get richer context."
- **Derives** — inference of unstated knowledge. From role plus repeated discussion of payment APIs and fraud detection, the system produces a derived memory that Alex probably works on Stripe's core payments product — "surfacing knowledge you didn't explicitly state."

## Extraction and consolidation pipeline

The advertised flow: your content (conversations, docs) → fact extraction → relation building → living graph. Stated as three steps:

1. **Extract** — one conversation yields several atomic facts, "each one a standalone memory."
2. **Connect** — new facts are auto-linked into existing memories via the three relationship types.
3. **Evolve** — currency is maintained without intervention.

## Temporal handling, invalidation, forgetting

Time-bound content is retired once its horizon passes: an exam-tomorrow memory is dropped after the exam date, and a 3pm-today meeting is dropped after today. Episodic memories fade absent significance, while preferences reinforce through repeated signals.

## Conflict resolution

Contradictions are reconciled without user action — an older employer claim is "superseded by" the newer one, tagged with an `isLatest: true` marker, and prior versions remain queryable as history.

## Operational surface

Marketed as requiring no manual relationship definition, type tagging, cleanup, or contradiction resolution. Usage is just `client.add({...})` and `client.search({ query: ... })`; the sample search for Alex's employer returns Stripe as current with Google as historical.

Distribution: npm package `@supermemory/memory-graph`; docs at `/docs/integrations/memory-graph` and `/docs/concepts/graph-memory`. Availability: "Memory Graph is available on all plans."

*Note: all of the above is vendor marketing copy from a single Supermemory page — internal implementation details, benchmark methodology, and the actual mechanics behind "sub-second" claims aren't specified there.*

---

[FETCH RESULT]
# supermemoryai/supermemory — Extracted Overview

## What the repo contains

Supermemory bills itself as a "State-of-the-art memory and context engine for AI," usable as a personal or company knowledge brain. The pitch: AI assistants lose all context between sessions, and this project addresses that by automatically pulling facts out of conversations, maintaining user profiles, reconciling contradictions, expiring stale information, and surfacing relevant context on demand. The team describes itself as "a research lab building the engine, plugins and tools around it."

Core capability areas listed:

| Area | Description |
|---|---|
| Memory | Fact extraction, temporal change handling, contradictions, auto-forgetting |
| User Profiles | Static facts plus recent activity; "One call, ~50ms" |
| Hybrid Search | "RAG + Memory in a single query" |
| Connectors | Google Drive, Gmail, Notion, OneDrive, GitHub (+ Web Crawler), real-time webhooks |
| Multi-modal Extractors | PDFs, image OCR, video transcription, "code (AST-aware chunking)" |

Three audience tracks are offered: consumers using AI tools (app + extension + MCP), developers building products (API), and people who want to self-host.

## Architecture

The README diagrams the flow as: your app or AI tool → Supermemory → five subsystems:

1. **Memory Engine** — fact extraction, update tracking, contradiction resolution, expiry of outdated info
2. **User Profiles** — static facts plus dynamic context derived from the engine
3. **Hybrid Search** — combined RAG and memory retrieval
4. **Connectors** — live sync from third-party sources
5. **File Processing** — converts documents/media/code into searchable chunks

A key conceptual claim: "**Memory is not RAG.**" RAG is characterized as stateless chunk retrieval returning identical results for all users, whereas memory tracks facts about individuals across time — the example given is that stating a move to SF should override a prior claim of living in NYC. Both run together by default. On forgetting: "Temporary facts ("I have an exam tomorrow") expire after the date passes."

Memory scoping uses **container tags**, surfaced as "projects," letting you split work vs. personal, or organize per client/repo.

## Tech stack

Repository topics indicate: **TypeScript**, **Vite**, **Remix**, **Tailwind CSS**, **Drizzle ORM**, **Postgres**, **Cloudflare Workers / Pages / KV**, plus `agent-memory`, `ai-memory`, and `memory`.

Tooling visible in the file tree: **Bun** (`bun.lock`), **Turborepo** (`turbo.json`), **Biome** for lint/format (`biome.json`), `portless.json`, and GitHub Actions workflows.

Local embeddings default to `Xenova/bge-base-en-v1.5` (no key needed); OpenAI, Gemini, or Ollama are optional alternatives. Any OpenAI-compatible LLM endpoint works — OpenAI, Anthropic, Gemini, Groq, or Ollama (the README notes `gpt-oss:20b` performs well).

SDKs ship for **npm** (`supermemory`) and **PyPI** (`supermemory`).

## Monorepo structure

Top-level directories and files:

- `.github/workflows`
- `apps` — includes `apps/web` (the logo asset lives at `apps/web/public/logo-fullmark.svg`)
- `packages`
- `skills/supermemory`
- `CLAUDE.md`, `CONTRIBUTING.md`, `LICENSE`, `README.md`, `README.zh-CN.md`
- `.gitignore`, `biome.json`, `bun.lock`, `package.json`, `portless.json`, `turbo.json`

Individual package names inside `apps/` and `packages/` are not enumerated on this page. Note that the plugins live in **separate repos**: `openclaw-supermemory`, `claude-supermemory`, `opencode-supermemory`, and NousResearch's `hermes-agent` (as a memory provider).

## How to run

**Local / self-hosted** — described as "One binary. Zero config."

```
curl -fsSL https://supermemory.ai/install | bash
# or
npx supermemory local

supermemory-server
```

First launch provisions the embedded graph engine, local embeddings, and credentials, then emits an API key. The whole Memory API listens on `http://localhost:6767`, and an interactive wizard handles model selection. All state sits in `./.supermemory` for easy backup. Switching between local and hosted is a matter of `baseURL`:

```js
const client = new Supermemory({
  apiKey: "sm_...",
  baseURL: "http://localhost:6767",
});
```

**SDK install**

```
npm install supermemory    # or: pip install supermemory
```

```js
import Supermemory from "supermemory";
const client = new Supermemory();

await client.add({
  content: "User loves TypeScript and prefers functional patterns",
  containerTag: "user_123",
});

const { profile, searchResults } = await client.profile({
  containerTag: "user_123",
  q: "What programming style does the user prefer?",
});
```

```python
from supermemory import Supermemory
client = Supermemory()
client.add(content="...", container_tag="user_123")
result = client.profile(container_tag="user_123", q="programming style")
print(result.profile.static)
print(result.profile.dynamic)
```

**API surface:** `client.add()`, `client.profile()`, `client.search()` (with `searchMode` of `hybrid` or `memories`), `client.search.documents()` (legacy v3 shape), `client.documents.uploadFile()`, `client.documents.list()`, `client.settings.update()`.

**Framework wrappers:** Vercel AI SDK, LangChain, LangGraph, OpenAI Agents SDK, Mastra, Agno, Claude Memory Tool, n8n — e.g. `withSupermemory(openai("gpt-4o"), {...})` from `@supermemory/tools/ai-sdk`.

**MCP** — point clients at `https://mcp.supermemory.ai/mcp`:

```json
{ "mcpServers": { "supermemory": { "url": "https://mcp.supermemory.ai/mcp" } } }
```

Exposed tools are `memory` (save/forget), `recall` (query + profile summary), and `context` (profile injection, invoked via `/context` in Cursor and Claude Code). Supported clients: Claude Desktop, Cursor, Windsurf, VS Code, Claude Code, OpenCode, OpenClaw, Hermes. A no-code consumer app is at `app.supermemory.ai`, with an embedded agent called Nova.

## Benchmark numbers

Claimed **#1** on all three of LongMemEval, LoCoMo, and ConvoMem — measuring, respectively, cross-session long-term memory with knowledge updates; fact recall over long conversations (single-hop, multi-hop, temporal, adversarial); and personalization/preference learning.

Headline figures: "95% Recall@15 with a 99.4% context reduction · ~50ms user profiles." On LongMemEval that 95% recall comes with roughly 720 added context tokens; reduction figures are 99.6% at @10 and 99.8% at @5.

Per-category recall: Knowledge Updates 99%, Assistant recall 100%, User recall 97%, Multi-session 93%, Temporal Reasoning 91%, Preference 90%.

**Supermemory Filesystem (SMFS)** on the 110-question xAFS benchmark: "3.0× fewer tokens on Claude" (24M against 72M) and "1.75× fewer on Codex."

**MemoryBench** is their open-source harness for reproducible provider comparisons (Supermemory, Mem0, Zep, etc.):

```
bun run src/index.ts run -p supermemory -b longmemeval -j gpt-4o -r my-run
```

An agent skill is also published for third parties to benchmark their own stacks — `npx skills add supermemoryai/memorybench`, then run `/benchmark-context`.

## License

**MIT.** A `CONTRIBUTING.md` is present. Repo stats at capture: 29.2k stars, 2.5k forks, 107 watchers, 1,890 commits on `main`, 40 open issues, 88 open pull requests. Docs, quickstart, self-hosting guides, Discord, and X links are all listed; a Simplified Chinese README (`README.zh-CN.md`) is available. The Releases, Used by, Contributors, and Languages sections were empty in this capture, so exact language percentages aren't available here.

---

[FETCH RESULT]
**The page contains no information about an "Infinite Chat API" or a memory router.** There is no mention of a proxy endpoint URL, transparent context-window extension, token/context limits for such a product, or a chat-completions passthrough mechanism. I can't extract details that aren't there — the items below are the closest adjacent material actually on the page.

**Endpoints that are documented (not proxies):**
- Ingestion: `POST https://api.supermemory.ai/v3/add`
- Query: `POST https://api.supermemory.ai/v3/search`
- Reference and spec: `https://docs.supermemory.ai/api-reference`, `https://supermemory.ai/openapi.json`

**Chunking / retrieval mechanism (described generally, not as chat interception):**
- The Extractors layer handles varied file types, and "Smart chunking preserves meaning across document boundaries."
- Retrieval is described as "Hybrid vector + keyword search with sub-300ms latency p50," with reranking so the top hits come back first, plus filters for user, time window, and metadata.
- The Memory Graph layer reconciles changing information over time — knowledge "updates, merges, contradicts, and infers."

**Token accounting and pricing (billed in SM tokens, not context tokens):**
- Billing unit: only novel ingested content counts — "Repeats cost nothing," with dedupe at the token level so re-syncing a doc doesn't recharge you.
- Memory: $0.005 per 1K SM tokens for plain text, $0.010 for rich content.
- SuperRAG: $0.001 per 1K SM tokens (text mode), $0.002 (rich mode).
- Search/traversal: $0.005 per 1K queries. Extra operations such as reranking or query rewriting: $0.10 per 1K.
- Plans: Free $0, Pro $19/mo, Max $100/mo, Scale $399/mo, Enterprise custom.

If you're looking for a chat-completions proxy product, it would need to be verified against the API docs at `docs.supermemory.ai`, since this page doesn't cover it.

---

[FETCH RESULT]
# cursor-supermemory — README extraction

Repo: `supermemoryai/cursor-supermemory` — described as a "Supermemory plugin for Cursor!", providing "Persistent AI memory for Cursor" backed by supermemory.ai. (22 stars, 6 forks, 19 commits at capture time.)

## How it works
Five behaviors are listed under "What it does":
- **Session context** — pulls in your saved profile when a Cursor conversation begins.
- **Automatic recall** — runs searches on "substantive prompts, deduplicates results," then injects them "after the first tool result supported by Cursor."
- **Incremental capture** — writes each finished turn and, at session end, retries "unsaved transcript deltas."
- **Context gatherer** — "fans out targeted searches before substantial work."
- **Always-on rule** — nudges the agent to recall history "proactively."

## Hooks / runtime
The README doesn't enumerate individual hook events by name; it states only that "Hooks and MCP run the plugin's bundled `dist/` with Node." The repo tree includes `hooks/`, `agents/`, `commands/`, `rules/`, `skills/`, `src/`, `dist/`, plus `mcp.json` and `.cursor-plugin/`. Node.js on PATH is required; Bun is "only needed to _build_ the plugin."

## What it stores / captures
- Completed conversation turns plus leftover transcript deltas at session end.
- A user **profile** summary (injected at session start if `injectProfile` is true).
- Anything explicitly saved via `supermemory_add`.
- Optional **signal-only capture**: with `signalExtraction` enabled, it keeps just turns containing keywords (defaults: remember, architecture, decision, bug, fix) plus `signalTurnsBefore` (3) surrounding turns.

**Containers.** Memories live under a shared tag format `repo_<project_name>__<project_id>`, where the ID is "a stable hash of the normalized Git remote" (falling back to the local path when there's no remote), so Cursor, Claude Code, Codex, and OpenCode can share one repository's memory. `user` and `project` now write to the same container, with an `sm_scope` metadata field separating personal/session entries from explicit project knowledge. Legacy `cursor_user_*` / `cursor_project_*` tags are still read but no longer written.

## MCP tools
`supermemory_get_config`, `supermemory_set_config`, `supermemory_containers`, `supermemory_search`, `supermemory_add`, `supermemory_list`, `supermemory_forget`, `supermemory_profile`. Tools taking a `container` accept `"user"` (default), `"project"`, `"both"`, or a raw custom tag string.

## Install steps
1. In Cursor, open **Customize**, locate **Supermemory**, choose **Install**, and pick project or user scope.
2. Restart Cursor, or invoke "Developer: Reload Window".
3. Authenticate: `node "${CURSOR_PLUGIN_ROOT}/dist/cli.js" login` — if that variable isn't set, run `node dist/cli.js login` from the installed plugin folder.

**From source / testing:** `bun install && bun run build`, then `bun run sync` to copy the repo into `~/.cursor/plugins/local/cursor-supermemory` (re-run after each change, since "Cursor rejects symlinks pointing outside its plugins directory"), then `node dist/cli.js login`; restart Cursor after MCP config edits. To try it in another project, copy the `supermemory` entry from `.cursor/mcp.json` using an absolute path to `dist/cli.js` and keep the `mcp` argument.

## Configuration
- **Env vars:** `SUPERMEMORY_API_KEY` (takes precedence over other sources), `SUPERMEMORY_API_URL`, `SUPERMEMORY_REPO_TAG`, plus legacy-read helpers `SUPERMEMORY_USER_TAG`, `SUPERMEMORY_PROJECT_TAG`, `CURSOR_USER_EMAIL`.
- **Global:** `~/.config/cursor/supermemory.json` for user-wide defaults.
- **Project:** `.cursor/.supermemory/config.json`, which overrides global; the README advises adding it to `.gitignore` when it holds an API key.
- **Key options/defaults:** `similarityThreshold` 0.55 (lower values are floored), `maxMemories` 10, `maxProjectMemories` 5, `injectProfile` true, `signalExtraction` false, `signalTurnsBefore` 3, plus `apiKey`, `baseUrl`, `repoContainerTag`, and legacy `userContainerTag`/`projectContainerTag`. These can be edited by hand or set through `supermemory_set_config`.

---

[FETCH RESULT]
## What Graphiti Is
Graphiti is "a framework for building and querying temporal context graphs for AI agents" — open source, and the core of Zep's context infrastructure. Rather than a static knowledge graph, it tracks how facts shift over time, keeps provenance back to source data, and supports both "prescribed and learned ontology." It ingests user interactions plus structured/unstructured enterprise and external data continuously, allowing incremental updates and historical queries "without requiring complete graph recomputation."

## Temporal / Bi-Temporal Model
- Each fact carries a validity window: when it became true and when (if ever) it was superseded; entities carry summaries that change over time.
- Versus GraphRAG's "Basic timestamp tracking," Graphiti is described as offering "Explicit bi-temporal tracking with automatic fact invalidation." The README does not spell out the two separate time axes in detail.

## Edge / Fact Invalidation
"When information changes, old facts are invalidated — not deleted." You can query present-day truth or truth at an earlier point. Contradictions are handled by "Automatic fact invalidation with temporal history preserved," instead of relying on LLM summarization judgments.

## Node / Edge Types
The README's component table lists four building blocks:
- **Entities (nodes):** people, products, policies, concepts, with evolving summaries.
- **Facts/Relationships (edges):** "Triplets (Entity → Relationship → Entity) with temporal validity windows."
- **Episodes (provenance):** raw ingested data, "the ground truth stream," which every derived fact traces back to.
- **Custom Types (ontology):** "Developer-defined entity and edge types via Pydantic models."

## Database Backends
All three are supported, plus Neptune:
- **Neo4j** 5.26 (recommended; default database name `neo4j`).
- **FalkorDB** 1.1.2 via the `[falkordb]` extra (default `default_db`); an embedded `[falkordblite]` variant needs Python 3.12+.
- **Kuzu** 0.11.2 — explicitly "**Kuzu is deprecated** and will be removed in a future release" because upstream is unmaintained; the driver still emits a `DeprecationWarning`.
- **Amazon Neptune** (Database Cluster or Neptune Analytics) paired with Amazon OpenSearch Serverless as the full-text backend.

Since v0.17.0 you can build a driver (`Neo4jDriver`, `FalkorDriver`, `KuzuDriver`, `NeptuneDriver`) and pass it via the `graph_driver` parameter.

## Episode Ingestion
Episodes are added as either plain text or structured JSON. New data "integrates immediately without batch recomputation," so the graph updates in real time as episodes arrive. Requirements: Python 3.10+, a graph store, and an LLM — OpenAI is the default, with Anthropic, Gemini, Groq, and any OpenAI-compatible/local endpoint (Ollama, vLLM, llama.cpp, LM Studio) usable via `OpenAIGenericClient`. Structured Output support matters: models lacking it "may result in incorrect output schemas and ingestion failures." Concurrency is governed by `SEMAPHORE_LIMIT`, defaulting to 10 to avoid 429 errors; raise it for faster ingestion. The MCP server exposes episode add/retrieve/delete operations.

## Search & Reranking
Retrieval is hybrid — it "Combines semantic embeddings, keyword (BM25), and graph traversal" for low-latency, high-precision results without depending on LLM summarization. The quickstart shows edge search via hybrid search, node search using "predefined search recipes," and "Reranking search results using graph distance." Cross-encoder rerankers are also available: `GeminiRerankerClient` defaults to `gemini-2.5-flash-lite` and uses a boolean classification approach with log probabilities; `OpenAIRerankerClient` is the OpenAI equivalent.

## License
Apache-2.0.

## Benchmark Claims
No formal benchmark numbers appear in the README — only comparative/qualitative statements:
- Graphiti query latency: "Typically sub-second latency," against GraphRAG's "Seconds to tens of seconds."
- Managed Zep (not Graphiti itself) claims retrieval with "sub-200ms performance at scale."
- Scalability is described as high and "optimized for large datasets" with parallel processing.
- The supporting paper is *Zep: A Temporal Knowledge Graph Architecture* (arXiv:2501.13956); its evaluation results aren't reproduced here.

---

[FETCH RESULT]
# Mem0 README — Extraction

## What it is
Mem0 ("mem-zero") is described as a "Universal memory layer for AI Agents" — an intelligent memory layer for assistants/agents that stores preferences and learns over time. Repo: Apache-2.0, ~64.5k stars, 7.6k forks, 2,618 commits.

## Architecture (as documented on this page)
- **Multi-level memory**: the README lists "Multi-Level Memory" that "retains User, Session, and Agent state with adaptive personalization."
- **Repo layout** implies the components: `mem0` (Python core), `mem0-ts` (TypeScript), `server` (self-host stack), `cli`, `integrations`, `skills`, `docs`, plus an `evaluation` git submodule pointing at the separate `memory-benchmarks` repo.
- **Retrieval is multi-signal and fused**: "semantic, BM25 keyword, and entity matching scored in parallel and fused."
- **Entity layer**: "entities are extracted, embedded, and linked across memories for retrieval boosting."
- **Temporal layer**: "time-aware retrieval that ranks the right dated instance" for current-state, past, and upcoming queries.

## Memory extraction / LLM calls per add
The April 2026 algorithm is explicitly **one LLM call per add, append-only**: "Single-pass ADD-only extraction -- one LLM call, no UPDATE/DELETE. Memories accumulate; nothing is overwritten." Facts produced by the agent itself are also stored — the README says agent-confirmed information is now weighted equally with user-stated facts.

Model defaults: `gpt-5-mini` as the default LLM (other LLMs supported), `text-embedding-3-small` as the default embedder, with a recommendation to use at least a Qwen 600M-class embedding model for best hybrid-search results.

## Vector store / graph store options
**Not enumerated in this page.** The only storage specifics present: optional NLP extras enable keyword/entity features (`pip install mem0ai[nlp]` plus the spaCy `en_core_web_sm` model), and there is a migration path for users already on "hosted Qdrant vectors" into the managed platform. No graph-store backends are named here — you'd need the component docs for the full provider matrix.

## API / SDK surface
- **Python**: `from mem0 import Memory`; instantiate `Memory()`; write with `memory.add(messages, user_id=...)`; read with `memory.search(query=..., filters={"user_id": ...}, top_k=3)`, which returns a dict whose `results` entries carry a `memory` field.
- **JS/TS**: `npm install mem0ai`.
- **CLI**: `@mem0/cli` (npm) or `mem0-cli` (pip), with `mem0 init`, `mem0 add`, `mem0 search`, and a `--user-id` flag.
- **Agent self-signup**: an agent can provision a key without email/dashboard/OTP via `mem0 init --agent --agent-caller <name>`; a human later claims it with `mem0 init --email <address>`, keeping the same key and memories.
- **Agent skills** installable through `npx skills add`, split into always-on reference skills (`mem0`, `mem0-cli`, `mem0-vercel-ai-sdk`) and on-demand pipeline skills (`mem0-integrate`, `mem0-test-integration`, `mem0-oss-to-platform`).
- **Integrations/demos** called out: ChatGPT-with-memory demo, a Chrome extension spanning ChatGPT/Perplexity/Claude, LangGraph, and CrewAI.

## Self-hosted vs platform vs library
| | Library | Self-hosted server | Cloud platform |
|---|---|---|---|
| Intended use | testing, prototyping | own infrastructure | zero-ops production |
| Setup | `pip install mem0ai` | `docker compose up` | sign up at app.mem0.ai |
| Dashboard | no | yes | yes |
| Auth & API keys | no | yes | yes |
| Advanced features | none | "Teasers" | all included |

Self-host notes: "Self-hosted auth is on by default." Recommended path is `cd server && make bootstrap` (starts stack, creates admin, issues first key); the manual path is `docker compose up -d` then a browser wizard at `localhost:3000`. Upgrading from a pre-auth build requires setting `ADMIN_API_KEY` or registering an admin, with `AUTH_DISABLED=true` restricted to local development.

## Benchmark claims
| Benchmark | Old | New | Tokens | Latency p50 |
|---|---|---|---|---|
| LoCoMo | 71.4 | 92.5 | 7.0K | 0.88s |
| LongMemEval | 67.8 | 94.4 | 6.8K | 1.09s |
| BEAM (1M) | — | 64.1 | 6.7K | 1.00s |
| BEAM (10M) | — | 48.6 | 6.9K | 1.05s |

Gains are framed as +21 points on LoCoMo and +27 on LongMemEval, including a 98.2 sub-score for assistant memory recall.

**Important caveats stated in the README:** results come from "Single-pass retrieval (one call, no agentic loops) at a top_200 retrieval budget" on one production-representative model stack, and the scores reflect the managed platform with proprietary optimizations absent from the OSS SDK — open-source users are told to expect "directionally similar gains but not identical numbers."

**On token savings:** there is no explicit percentage-savings claim in this text. The algorithm is marketed as "token-efficient," and the evidence offered is the absolute per-query token budget (~6.7K–7.0K) rather than a before/after reduction figure. The benchmark harness is open-sourced (`mem0ai/memory-benchmarks`) for reproduction.

## License & citation
Apache 2.0, per the LICENSE file. Citable paper: *Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory*, Chhikara, Khant, Aryan, Singh, Yadav — arXiv preprint 2504.19413 (2025).

---

Failed to authenticate. API Error: 403 pre-consume quota failed, user quota: ＄0.113272, need quota: ＄0.399940 (request id: 20260901130820870800045dds85UjPy8zRC)