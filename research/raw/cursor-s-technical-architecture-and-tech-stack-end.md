# Cursor's technical architecture and tech stack, end to end.

## URLs fetched
- https://cursor.com/blog
- https://cursor.com/changelog
- https://cursor.com/blog/cloud-agent-environment
- https://cursor.com/blog/git-at-any-scale
- https://cursor.com/blog/mixture-of-kittens
- https://cursor.com/blog/how-cursor-router-works
- https://cursor.com/blog/router
- https://cursor.com/blog/agent-swarm-model-economics
- https://cursor.com/blog?page=2
- https://cursor.com/blog/composer
- https://cursor.com/blog/shadow-workspace
- https://cursor.com/blog/tab-rl

## Content

I'll research Cursor's technical architecture comprehensively. Let me start with a broad set of searches.

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: InvokeModelWithResponseStream: operation error Bedrock Runtime: InvokeModelWithResponseStream, https response error StatusCode: 400, RequestID: 78167d7d-39f8-4205-bde1-c8ca0c529edf, ValidationException: Tool 'web_search' not found in provided tools (request id: 906820f27a0857272e6b95532aa14afa) [trace_id=489c80cab0dff2c19527da8af781d92b] (request id: 20260901130245237020358fht8sjwpoIUnh)

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: InvokeModelWithResponseStream: operation error Bedrock Runtime: InvokeModelWithResponseStream, https response error StatusCode: 400, RequestID: 6f56ab3c-703a-48ad-b212-0cbd763bb176, ValidationException: Tool 'web_search' not found in provided tools (request id: 8b7eefb8041f85674d42384aee6e1b32) [trace_id=7b6a81199124af0cb0575c88ceacab2c] (request id: 20260901130308462091856fht8s5BLA1v4R)

---

WebSearch appears unavailable. Let me use WebFetch against primary sources directly.

---

[FETCH RESULT]
## Changelog Entries (no version numbers are used — entries are dated releases)

**Aug 27, 2026 — "Start from scratch, without a repo"**
- Cloud Agents can begin without a linked GitHub/third-party SCM; Cursor provisions an Origin repo behind the scenes
- "Create repo" button saves work; visibility set to private or internal
- Browser port-forwarding of the agent's live environment, enabling preview and design mode
- Publishing requires a connected Vercel account

**Aug 19, 2026 — "Cloud Agents and Cursor Harness Improvements"**
- **Subscriptions:** agents attach to an event source (PR, Slack thread, schedule) and wake on activity; cloud-agents only for now
- **Custom modes:** a skill pinned into chat via `/` then ⌥⏎ (Mac) / Alt+Enter (Windows), or "Use as Mode"
- **Subagents on separate VMs:** each receives "an isolated copy of the project with clean context in its own cloud environment"
- **`/goal`:** persistent objective held until finished; pairs with `/loop`
- **Steering:** follow-ups queue until the next tool call rather than interrupting; send via ⏎ twice

**Aug 17, 2026 — "Origin Code Hosting"**
- Early beta on paid plans (enterprise admins may opt out); covers repos, PRs, code browsing, GitHub sync
- New **Codebase** tab; URL pattern `cursor.com/codebase/<name>`; CLI used for cloning/pushing
- Source-of-truth model: Origin-hosted repos land pushes on Origin; synced repos keep GitHub authoritative with Origin mirroring
- Bidirectional PR comment sync, reportedly reflected "within seconds"
- App extensions: Vercel (PR preview deploys), Depot and Buildkite for CI, both running existing GitHub Actions workflows

**Aug 13, 2026 — "Cloud Agents Start 3x Faster with Builds"**
- **Builds** = pre-prepared environment snapshots kept warm; no extra cost
- Performance claims: environments "boot 10x faster, with 3x faster time to first token"
- Install command runs during builds; start command runs at first prompt for fresh services
- Failure handling: a broken build never activates, so agents fall back to the last good one
- **Builds** tab exposes status, logs, commit SHAs, per-run build mapping; manual triggers and a staleness threshold

**Aug 3, 2026 — "Google Workspace Plugins"**
- Plugins for Google Drive, Gmail, and Google Calendar (search, drafting, labels/threads, event creation, free-time lookup)
- Installed from Cursor Marketplace or the Customize page

## Not Present in This Content
No VS Code base version, Electron version, or explicit architecture/refactor notes appear anywhere on the page. Model names are absent from the entries themselves — Grok and Composer show up only as navigation and footer links, not as release details.

---

[FETCH RESULT]
## Engineering / Technical Posts (research & product)

| Date | Title | Slug | Author(s) · Length |
|---|---|---|---|
| Aug 18, 2026 | "Git at any scale" | `/blog/git-at-any-scale` | Vicent Martí · 27m |
| Aug 13, 2026 | "Cloud agents start 3x faster with builds" | `/blog/builds` | Cursor Team · 4m |
| Aug 12, 2026 | "Introducing Grok 4.6" | `/blog/grok-4-6` | Cursor Team · 3m |
| Aug 6, 2026 | "How Cursor Router chooses the right model for the task" | `/blog/how-cursor-router-works` | Connor & Yuri · 6m |
| Aug 4, 2026 | "Mixture-of-Kittens: our open-source MoE megakernel for NVL72s" | `/blog/mixture-of-kittens` | Stuart, Nash, Henry, William & Federico · 28m |
| Jul 30, 2026 | "How we set up our cloud agent environment" | `/blog/cloud-agent-environment` | Mathew & Arvind · 7m |
| Jul 28, 2026 | "Introducing Cursor Start" | `/blog/cursor-start-india` | Cursor Team · 3m |
| Jul 22, 2026 | "Introducing Cursor Router" | `/blog/router` | Cursor Team · 8m |
| Jul 20, 2026 | "Agent swarms and the new model economics" | `/blog/agent-swarm-model-economics` | Wilson Lin · 17m |

## Company Posts

| Date | Title | Slug |
|---|---|---|
| Aug 14, 2026 | "Cursor is now a part of SpaceX" | `/blog/joining-spacex` |
| Aug 13, 2026 | "Firetiger joins Cursor" | `/blog/firetiger` |
| Aug 13, 2026 | "Cursor earns AIUC-1 certification for agent security and reliability" | `/blog/aiuc-1` |

## Customer Stories

| Date | Title | Slug |
|---|---|---|
| Aug 25, 2026 | "IMDEX uses Cursor to build integrated subsurface data and analytics platform in months, not years" | `/blog/imdex` |
| Jul 28, 2026 | "How Vercel used Cursor to build Queues" | `/blog/vercel` |
| Jun 23, 2026 | "Coinbase reduces time from idea to production by 90% with Cursor" | `/blog/coinbase` |
| Jun 15, 2026 | "How Wayfair cut ML model costs by 90% (twice!) with Cursor" | `/blog/wayfair` |

**Also referenced (no date shown):** "Towards self-driving codebases" — `/blog/self-driving-codebases`

**Note:** The listing is paginated ("View more" control present), so additional posts likely exist beyond these. Changelog items appear separately at `/changelog/start-from-scratch`, `/changelog/08-19-26`, `/changelog/origin-code-hosting`, and `/changelog/08-13-26`.

---

Rich set of posts. Let me fetch the deep technical ones in parallel.

---

[FETCH RESULT]
## Technical Details Extracted

**Source:** Cursor blog, "How we set up our cloud agent environment," Jul 30, 2026, by Mathew Hogan & Arvind Saripalli (research, 7 min read).

### Host / VM environment
- Each cloud agent gets its own computer (VM), enabling end-to-end testing of its own changes.
- OS mismatch was the core porting problem: most Cursor engineers "develop locally on Mac machines, but our cloud VMs run on Linux."
- Target distro is Ubuntu; dev utilities and setup scripts had to be made OS-agnostic to run there.
- Base image is container-based: "a Cursor-defined Dockerfile that serves as the starting image for cloud agents."
- Codebase is a monorepo.

### Networking & security controls
- "network egress restrictions"
- "scoped and proxied git remote access"
- Secret scanning applied to commits and commit messages.
- Secret redaction in tool results, which "prevents the agent from reading secret values even if it tries."
- Users can inject required secrets into the agent environment.

### Developer tooling built for agents
- **anydev** — an internal CLI that agents use to start all services; common utility scripts are routed through it. It exposes "multiple `--help` menus explaining how to use each subcommand."
- anydev includes a **supervisor process** that monitors and restarts long-running build commands, taking that duty off the model.
- **Skills** — written documentation for building/running system components; described as only helping "on the margins" without simpler underlying commands.

### Agent capabilities
- Computer use plus a **recordScreen** tool; recordings shared to Slack or attached to PRs as demos.

### Self-healing / observability layer
- **Cursor Cloud MCP** — chosen because MCP offered "dynamically discoverable tools with interfaces we could change without rebuilding the agent loop." Agents inspect their own environment for setup failures, egress policy, and changed secrets.
- **Cloud Doctor** — an automation that runs periodic failure checks, distinguishes transient from "salient" errors, performs root cause analysis, and can open PRs autonomously. It also reads agent traces to find bad skills, misleading commands, and systematically slow workflows, then patches them.

### Metrics
- December: cloud agents authored roughly 1 in 10 merged monorepo PRs; at publication, "more than half."
- Tracked via a 7-day rolling share of merged PRs from cloud agents.

### Corporate/compliance (page footer)
- Anysphere, Inc.; certifications listed: SOC 2, ISO27001, ISO42001, AIUC-1.

### Explicitly not disclosed in this page
No microVM technology (e.g., Firecracker/gVisor), no snapshotting or restore mechanics, no filesystem/storage architecture, no boot or startup times, no orchestration layer or Kubernetes references, no cloud provider, no programming languages, runtimes, or software version numbers.

---

[FETCH RESULT]
# Technical Extraction: "Git at any scale" (Cursor, Aug 18, 2026 — Vicent Martí)

## Git internals & data structures

- Git is a content-addressable store; every object (blob, tree, commit) is keyed by the SHA-1 of its contents.
- Repository layout is a **DAG** — lookups by SHA are possible, but any real operation requires walking it step by step. The article stresses that "at every step of this walk, you don't know the value of the next pointer until you fetch the previous one."
- Traversal shape: commit → root tree → files/subtrees; commit → parent commit.
- **Packfiles** are the fundamental unit of both storage and networking: "When you push or fetch data from a repository, it's transferred as a packfile."
- Pack layout is optimized for size, not locality: objects are scattered, compressed, and "Most objects are stored as a delta on top of another object in the same packfile." So logical DAG hops become physical on-disk hops too.
- Each packfile carries its own index; lookup efficiency is per-pack. With ~100 packs you must probe indexes serially — "An efficient operation is not efficient if it must be performed hundreds or thousands of times."
- Modern Git mitigations named: **multi-pack indexes** and **incremental geometric compaction**; eventually a full repack is still needed. Repacking is CPU-heavy.
- A **push = packfile + reference transaction**. Objects aren't "reachable" until the ref is updated. Git natively supports prepared ref transactions: lock the ref, verify expected old value, hold the lock pending commit/abort.

## Three approaches to scaling (increasing complexity)

1. Distribute the filesystem
2. Distribute the packfiles
3. Distribute Git itself

## Prior art

**Google / JGit DHT (Shawn Pearce)** — objects stored in a distributed hash table, enabled by JGit (Java Git implementation) whose interface/factory abstractions allowed swapping on-disk packs for a DHT. Normal ops were acceptable, but because the wire protocol still demands packfiles, `git clone` performance killed it.

**GitHub filesystem attempts** — Rails monolith, originally one machine with a Ruby server plus repos on local disk. Tried and abandoned: NFS (Git assumes local FS semantics — locking, tearing, reading, syncing — so it was "slow, and it was buggy"), then block-level replication via **GFS** (short-lived) and **DRBD** (longer-lived). Random walks over gigabytes don't tolerate networked/block-replicated storage; whole-file caching is infeasible with hundreds of thousands of repos. Resolution: an RPC layer to dedicated fileservers, but each repo still lived on one machine.

**Spokes** (GitHub, ~2013; now a de facto industry pattern — application-level replication):
- Three choices the author endorses: work at the packfile level rather than distributing Git; store real Git repos on local NVMe; replicate while keeping copies consistently in sync.
- Consensus via **3PC (three-phase commit)** — phases labeled VOTING → PRE-COMMIT → DO COMMIT; the extra pre-commit phase allows recovery if the coordinator dies. Packfiles fan out unsynchronized; only the small ref transaction goes through 3PC. Push accepted on majority ack. Reads can hit any single replica.
- Demo UI parameters: quorum 4/5, 5 replicas, 20 ms one-way latency, playback 0.010x.
- Weaknesses: 3PC step latency is bound by the slowest node ("tail at scale"), so push throughput degrades as replicas are added; 3 replicas was the original sweet spot but is now insufficient for monorepo CI load, while simultaneously being wasteful for the huge volume of small/throwaway agent-created repos — "the floor is always too high, and the ceiling too low." Operationally, on-disk repos are the consensus source of truth, so repos are "pets, not cattle": an external DB holds a large repo→machine routing table, checksums must be continuously refreshed, corruption needs fast repair jobs, and 2-of-3 corrupt copies means no quorum and no pushes.

## Continuity (Cursor's storage system)

**Core primitive:** a **write-ahead log in S3-compatible object storage**. Production runs on S3 directly; portable to other clouds.

**Write path:** each push becomes one WAL object. Packfile is written to NVMe and uploaded to S3 concurrently. Upload ≠ publish — visibility requires successfully preparing the ref transaction against a local repo and recording a pointer in the **WAL index file** (`gitwal.pb`, a separate object with an ETag). Claims: "We never acknowledge a push until it has been fully persisted." and "This forces all pushes to be linearizable."

**Batching:** one S3 PUT per push would cap throughput at PUT latency, so writes are batched; since only a single local repo (not a quorum) must be synchronized for the ref transaction, ingest is disk-bound.

**Local storage:** ordinary bare Git repos on fast NVMe, deliberately mirroring Spokes to reuse upstream Git and community optimizations.

**Placement / consensus:**
- Stateless; no routing tables, no relational database.
- Missing repo on a host is materialized from the WAL on demand.
- **Rendezvous hashing** maps repo ID → ranked node list; the only state needed is the repo ID plus the current healthy-node set. Stale state is tolerable — the repo materializes on the next node.
- No elections. Any node may be primary; WAL updates are serialized by **atomic compare-and-swap on S3**. The first node in the rendezvous ranking is preferred to avoid CAS retries. Diagram shows two nodes racing (WALGIT A/B) → CONFLICT → REFETCH → REBASE → RETRY → DONE.
- Design mantra, repeated: "always be correct when degraded, and always fast when healthy."

**Replication:**
- Arbitrary replica count; all replicas catch up straight from S3.
- Optimistic replication via **gossip UDP datagrams** carrying catch-up metadata. Loss/misdelivery is harmless.
- Each replica tracks the ETag of its last-known WAL index. Reads issue a **conditional GET**: **304** (metadata-only, "less than 10ms on average") ⇒ serve immediately; **200** ⇒ apply the new index first. Consistency is therefore verified against S3 on every read.
- Elasticity both ways: hundreds of replicas for a monorepo's CI load; a single replica for millions of tiny agent repos; idle repos are garbage collected from disk and rematerialized from the WAL on the next fetch.

**Compaction:**
- WALs need compaction because a full restore replays every entry.
- Only the **primary** compacts; the result applies to both the on-disk repo and the WAL, so replicas inherit compaction events and "simply download the already-compacted packs from S3, trading bandwidth for CPU." Contrast with Spokes, where every replica repacks and concurrent maintenance on 2+ nodes can trigger failover.
- Diagram terms: "geometric compaction", "COMPACTION FRONTIER", 5 packs, `gitwal.pb`.

## Scaling numbers

| Metric | Value |
|---|---|
| Synthetic stress test | up to **100 replicas**, linear read scaling, no push-throughput regression |
| Push rate, **S3 Standard** | up to **120 pushes/s** (while compacting + replicating compacted data) |
| Push rate, **S3 Express One Zone** | **>300 pushes/s**, bottlenecked by Git's on-disk compaction speed |
| Conditional GET 304 latency | <10 ms average |
| Benchmark repo | `everysphere`, Cursor's monorepo |

## Comparison: Azure DevOps

Stores packfiles in blob storage with references in a relational DB (MS SQL Server). Trade-off acknowledged — relational DBs handle large reference transactions well, but you must then operate one. Cursor prioritized Git-data consistency, hence a WAL design with no external database dependency.

## Consistency & durability guarantees claimed

Every push persisted to the WAL before ack; all pushes linearized; every repository view fully consistent. Because the WAL holds every push, they retain full provenance for pushes *and* repacks, can inspect any historical repository state, and can rewind/fast-forward replicas — useful when hitting upstream Git bugs (corruption at rest, repack bugs, push races). Few new bugs are introduced since all operations run against a normal on-disk repo with off-the-shelf tooling.

## Service architecture / naming

- **Continuity** — the storage layer (WAL + S3 + local NVMe Git).
- **Origin** — the product/platform on top; RPC operations include web UI interactions, a REST API, and agentic interfaces. Both Git protocol ops (clone/fetch) and Origin RPCs scale with replica count.
- Component labels from diagrams: `WALGIT` (roles: PRIMARY, REPLICA; states: receiving, upload pack, receive-pack), `BARE REPO`, WAL entry objects (e.g. `#414b1e.wal`), `gitwal.pb` index, ETag versions (e0/e1/e2). Push-flow steps: PUSH → INDEX → UPLOAD → GET → LOCK → PUT → REF TXN. Replication steps: PUSH → COMMIT → GOSSIP → REPLICATE → FETCH → GET·304 → SERVE.

## Implementation language

**Not stated.** The page contains no mention of Rust, Go, or any language used for Continuity/Origin. The only languages referenced are Ruby/Rails (GitHub's monolith) and Java (JGit). One weak, non-conclusive hint: sample repo files in the DAG diagrams include `Cargo.toml`, `server.ts`, and `pack.ts` — illustrative, not a stated stack.

## Historical / contextual notes

Git's original commit tagline was "the information manager from hell"; Torvalds built it to replace BitKeeper for Linux kernel development, where decentralization fits. The author's thesis is that distribution is now "more of a hindrance than an advantage" since most orgs depend on a central host. GitHub launched in 2008 with the tagline "Git repository hosting: no longer a pain in the ass." Spokes has run ~13 years. Author cites Shawn Pearce as his former mentor. External references linked: JGit-dev mailing list post on DHT storage, Wikipedia entries for GFS2, DRBD, 3PC and rendezvous hashing, and the CACM "tail at scale" paper.

---

[FETCH RESULT]
## Models in the routing pool

| Model | Role / observed strengths |
|---|---|
| **Grok** | The price-efficient default. "Grok offers strong value across broad, routine work" — cited for Git commands and general database operations. |
| **Sol** | "performs especially well on planning and codebase comprehension"; also strong on several implementation tasks at lower cost than other frontier models. |
| **Opus** (4.8 is the comparison baseline; **Opus 5** added post-launch) | "performs well on execution-heavy work" — devops, database queries, performance optimization. |
| **Fable** | "excels at debugging and visual implementation"; highest cost, worth it on complex tasks. |
| **Compass** | Not a serving model — an internal complexity/satisfaction predictor. |

User-facing modes: **Auto Intelligence** and **Auto Balance**, launched July 22.

## Two-stage routing architecture

1. **Compass** decides whether the turn is simple enough for the cheap model. It outputs "a continuous complexity score between 0 and 1" compared against a threshold τ. As printed, the decision rule sends Compass ≥ τ to the price-efficient model and Compass < τ to the task router. The post's own wording is loose here (it calls the output a "complexity score" while describing it as a satisfaction prediction), but the tuning direction is stated: lower thresholds keep more traffic cheap, higher thresholds "upgrade more often."
2. **Taxonomy / task router** picks the frontier model for demanding turns.

**Router input features:** signals "from the current turn and recent conversation state," including structured features such as task category, plus recent tool calls and surrounding work context.

**Taxonomy dimensions (learned from real traffic):**
- **Domains** — where work happens: backend, database schemas, frontend.
- **Tasks** — what's wanted: fixing bugs, running commands, writing tests.
- **Modifiers** — cross-cutting: bounded edits, product questions, visual-heavy changes.

**Frontier-selection rules:**
- Eligibility gate: a model qualifies only if its measured performance on that task label "clears a one-sided 75% uplift threshold against the price-efficient model" (~75% confidence the gain is real).
- Budgeted optimization: from eligible candidates, pick the "traffic-weighted combination" maximizing expected performance gain while average cost per turn stays inside the mode's budget.

**Mode positioning:** Auto Balance routes more traffic to the cheap path with a smaller router budget; Auto Intelligence gets a larger budget for frontier models.

## Training data and labels

- Built from live Cursor traffic; "hundreds of thousands of turns sampled across a range of models," honoring privacy mode and data-retention settings.
- **Performance label (implicit, not human ratings):** inferred from the user's next action — moving on is positive, correcting the agent is negative. Compass is trained on this signal.
- **Cost label:** computed from API pricing and per-turn token usage, and it captures "cache misses caused by switching models."

## Evaluation

- Offline: cross-validation to tune Compass thresholds and optimizer budgets, then a held-out test set; used to shortlist policies. Charts are normalized to Opus 4.8.
- Online: live-traffic tests measuring satisfaction and real cost, capturing token usage, caching, and model-switch costs.
- Compass validation: highest-scored turns got a positive signal 96% of the time vs. 71% for the lowest-scored.

## Reported results

- Auto Intelligence: above Fable-level satisfaction at 68% lower cost (18 points better than at launch).
- Auto Balance: beats Opus 4.8 at 41% lower cost (8 points better than launch), with satisfaction up 3%.

## Roadmap

Make the router "more adaptive by predicting each model's expected quality and cost," learning from production outcomes with continuous updates.

## Not disclosed in this page

No latency or overhead figures; no mention of reinforcement learning, embeddings, or vector retrieval; no Compass model architecture, size, or base model; no numeric τ values or budget figures; no serving/infrastructure design (deployment, caching layer, failover); no per-category performance tables or dataset date ranges.

---

[FETCH RESULT]
# Mixture-of-Kittens (MoK) — Technical Extract

*Source: Cursor blog, Aug 4, 2026, by Stuart Sul, Nash Brown, Henry Wildermuth, William Lin & Federico Cassano.*

## What it is
An open-source MoE **training** megakernel that fuses all MoE communication and computation into one deterministic kernel. Repo: `github.com/cursor/mixture-of-kittens`. It reportedly powers Composer training "across tens of thousands of GPUs." Predecessor work: their MXFP8/NVFP4 training kernels and the "warp decode" MoE inference method — both optimized compute only, leaving comms as the bottleneck.

## Hardware / platform
- **GB300 NVL72**: a rack that is "a multi-node rack within a single NVLink domain," enabling fine-grained overlap across all 72 GPUs.
- 5th-gen NVLink spec cited at **1.8 TB/s**; separate lanes per direction.
- Blackwell: **C = 148 SMs**; full tensor-core utilization means each SM handles a **128×256 output tile** ("regardless of 1-SM or 2-SM MMA"); a full MMA needs 256 tokens.
- Integrated **Grace CPUs** are "slow relative to the GPUs," so CPU work and CPU–GPU sync must be minimized; traces showed GPU stalls from CPU-side logging/metrics that didn't occur on Intel-CPU DGX boxes.
- **TMA** loads/stores can saturate NVLink with "less than a third of the SMs" (cites arXiv 2511.13940).

## MoE architecture targeted
DeepSeek-V3-style layers (GLM, Qwen, Kimi up to K2.7): one shared expert plus hundreds of routed experts, top-k router weights, up + gate projections → SwiGLU → down projection.
- Notation: D (model dim), I (intermediate), W_up, W_gate ∈ R^{I×D}, W_down ∈ R^{D×I}.
- MoE(x,s) = E_shared(x) + Σ_{i∈E} g_i·E_i(x), with g_i = s_i / Σ_j s_j.
- Expert-parallel example: 256 routed experts at EP degree 64 → 4 routed experts per rank plus the shared expert.

## Push vs. pull communication direction
MoK's chosen configuration: **pull** forward dispatch, **push** forward combine, **pull** backward reverse-combine, **push** backward reverse-dispatch. One schedule table serves all four ops.
- Push schedule needs three columns `{src_index, dst_rank, dst_index}` plus multiple sorts and cross-rank coordination; pull collapses to `{src_rank, src_index}` with no sorting.
- Scheduling goals: keep all inter-GPU lanes saturated, deliver tokens ordered by local expert, "zero local copies," and minimal scheduling overhead.
- The device-side schedule kernel costs "less than 3% of the total MoE runtime"; the table is a few MB worst case.
- NCU microbenchmark, one 256×256 BF16 tile (131,072 B): push = 159.6 KB total (RX 2.9 KB / 1.84%, TX 155.6 KB / 99.16%); pull = 172.0 KB total (RX 147.5 KB / 85.71%, TX 24.6 KB / 14.29%). Push moves ~12.4 KB fewer bytes but is nearly unidirectional.
- Empirically pull gives "up to 29% higher NVLink bandwidth utilization" under expert imbalance.
- Signalling: push dispatch ≈ **103 µs** vs pull ≈ **18 µs** (~5.8x). Push/pull-combine requires waiting on as many as **71 peers** plus a rack-wide memory fence; pull dispatch removes cross-GPU signalling entirely.

## Overlap structure
- **Minibatch** = tokens per transfer, tunable. Heuristic targets ≥2 full waves per grouped GEMM: up/gate need (T/128)·(2I/256) ≥ 2C; down needs (T/128)·(H/256) ≥ 2C; combined **T ≥ 2C·128·256 / min(2I, H)**.
- Kimi 2.5 (base for Composer 2.5), H=7168, I=2048, C=148 → **T ≥ 2368**. Measured forward times (ms): 512→5.981, 1024→4.669, 1536→3.981, 2048→3.666, **2560→3.425**, 3072→3.447, 3584→3.524, 4096→3.473.
- **Inter-SM overlapping**: SMs split into comp (expert FFNs) and comms (dispatch/combine) groups signalling via a local counter; comms-SM counts tunable separately for forward and backward.
- Forward: all dispatch tasks precede combines; shared-expert FFN fills the wait for the first dispatch.
- Backward: 3 dgrad grouped GEMMs + SwiGLU backward run per minibatch; the 3 **wgrads are deferred** because reverse-dispatch doesn't depend on them and full-token-axis accumulation "minimizes numerical instability." Shared-expert backward overlaps the first reverse-combine.

## Ring token buffers (macrobatch)
Avoids both token dropping and CPU–GPU sync: a fixed-size ring buffer of "a few hundred megabytes" cycled at minibatch granularity.
- **Dispatch–combine interleaving** at macrobatch boundaries refills a slot as soon as it drains (first macrobatch's dispatches and last macrobatch's combines are unpaired).
- **Reversed ring**: forward pass walks macrobatches in reverse order so the saved buffer is full, minimizing backward forward-replay; replay runs only up to the SwiGLU.

## Other implementation details
- **Megakernel** (referencing HazyResearch's megakernel work): avoids launch-boundary overhead, and software SM partitioning beat "multiple streams with green contexts," which were "unreliable at partitioning SMs exactly as intended."
- **Determinism**: fixed floating-point op order → "bitwise-identical output" regardless of hardware scheduling, for ablations and on-policy RL post-training.
- **CLC (Cluster Launch Control)**: Blackwell hardware work-stealing for persistent grids; lets the megakernel yield to higher-priority streams so inter-rack InfiniBand/RoCE traffic (e.g., FSDP all-gather) doesn't serialize behind it.
- **MXFP8 + BF16** modes; training runs MXFP8, but the shared expert stays BF16 for stability. Includes an optimized MXFP8 weight-quantization kernel; activation quantization is fused into dispatch, grouped GEMMs, and SwiGLU.
- **Router weight grads**: SonicMoE-style (arXiv 2512.14080), computed from the inner product of SwiGLU activation and down-projection dgrad, fused into SwiGLU backward.
- Granularity references: Comet (arXiv 2502.19811) as fine-grained, DeepEP as coarse-grained.

## Benchmarks
Single NVL72 rack, EP degree 64, 2,048 tokens/GPU pre-routing; benchmark code released.
Baselines: NCCL+PyTorch, DeepEP+PyTorch, DeepEP+TransformerEngine, HybridEP+Megatron (described as Nvidia's recommended NVL72 option over DeepEP+Megatron).

Shapes tested: Kimi K2.7 Code (E384/H7168/I2048/top-k 8), GLM-5.2 (E256/H6144/I2048/top-k 8), Qwen3.5-397B-A17B (E512/H4096/I1024/top-k 10), DeepSeek-V4-Pro (E384/H7168/I3072/top-k 6).

Speedups vs. fastest baseline: **2.37x** MXFP8 forward, **1.78x** MXFP8 backward, **1.92x** BF16 forward, **1.58x** BF16 backward.

End-to-end on **512 GPUs** across several GB300 NVL72 racks vs. their prior DeepEP-based stack: **760.9 → 1,070.2 tokens/sec/GPU (1.41x, ~41%)**.

## Notes on your requested items
- **No vLLM, TensorRT-LLM, or SGLang comparison appears** in this post — it is a training-kernel piece, and its only baselines are the four listed above. Inference is mentioned only via the earlier "warp decode" work.
- **ThunderKittens is not named**; the linked framework reference is HazyResearch's Megakernels repo, which the authors say they did *not* need this time — they "removed the additional layer of abstraction" and built from scratch with agent assistance.
- Model parameter counts aren't given beyond shape configs and the "397B-A17B" naming in the Qwen shape.
- Contact for hiring listed as hiring@cursor.com; acknowledgements to Chris Ré, Sasha Rush, Less Wright, Chen Lu, Nathan Wang.

---

[FETCH RESULT]
## Architecture

- **Core**: a pre-inference classifier — "At its core, Cursor Router is a classifier that routes users to the best model option based on their query." It works "by classifying each request before a model runs."
- **Training**: built on "600k+ live requests," with "user satisfaction (AFC)" used "as a reward."
- **Routing features**: each request is scored on "query, context, task complexity, and domain," combined with learned per-model behavior profiles.
- **Routing policy**: cheap/price-efficient models take simple work; "UI updates go to the model with the best taste"; "long-horizon problems go to frontier reasoning models."
- **Updateability**: designed for a world where "updated models get shipped early and often," so new models can be swapped into the router.
- **Taxonomy**: "data-driven," with admin/user override of the operating point.

## Caching

- Described as "cache-aware in both how it is trained and evaluated."
- Trained on a dataset "where routing results in cache misses"; production savings figures "include the cost of cache misses in routing decisions."
- A stated flaw of offline evals: they "omit the extra cache-miss cost that comes from switching models."

## Modes (cost–intelligence Pareto frontier)

| Mode | Positioning |
|---|---|
| Intelligence | "Frontier quality," matching the most expensive/powerful models |
| Balance | "Strong quality," matching models people "daily drive" |
| Cost | "Good quality," maximizing intelligence "while optimizing token spend" |

Selected via "Auto mode in the model picker."

## Evaluation methodology

- "Large online A/B tests instead of offline evals," across millions of requests/conversations.
- Metrics: **user satisfaction** (agent success inferred from user reactions — moving on = positive, correcting = negative) and **keep rate**, "how much of the agent-generated code remains in the codebase over time." Both used for the prior nine months.
- Offline evals rejected for small size, distance from real usage, and rubric limits.

## Cost / quality numbers

- Early access (dozens of enterprises): "approximately 30–50% lower cost."
- A/B tests: "frontier-quality performance at 60% savings."
- Auto Intelligence: near Fable on satisfaction "at about 60% lower cost for teams"; ~15% satisfaction lift over Opus 4.8 at roughly equal cost.
- Auto Balance: above Opus 4.8 satisfaction at "about 36% lower cost"; comparable to GPT-5.6 Sol at lower spend.
- Three high-volume accounts (thousands of users): 30–50% savings on auto-routed traffic vs. all-Opus 4.8, "with no decrease in quality."
- **Cost per commit**: Intelligence $6.76, Balance $4.63, Opus 4.8 $7.34, Fable 5 $12.69. GPT-5.6 Sol tied Intelligence on cost but scored lower on satisfaction.
- Context: ~60% of Cursor developers stick to one daily-driver model; Cursor serves "hundreds of millions of coding requests each week."

## Models referenced

Fable / Fable 5, Opus 4.8, GPT-5.6 Sol, Grok 4.5 (extends the high-cost end of the pool), Composer (improving the low-cost path).

## Serving / availability

- Live for Teams and Enterprise on "desktop, web, iOS, CLI, and our SDK."
- Admin controls: per-team or per-group enablement, which modes members may pick, the default mode, and model allow/block lists.

## Adjacent token-efficiency work

- Ongoing harness waste reduction.
- **Dynamic tool calling**: most native tool descriptions are omitted from every prompt and looked up on first use (the existing MCP pattern); frequently used tools like read/edit stay "hot," rare ones load only when called.

**Note**: no latency, throughput, or protocol/transport details (e.g., API wire format) are given in the post — only the SDK/CLI/web/iOS surfaces are named.

---

[FETCH RESULT]
## What the post actually covers — and what it doesn't

The article is about **agent-swarm orchestration economics**, not serving infrastructure. There is **nothing** on GPUs, hardware, batching, KV cache, prefill/decode split, quantization, context-window sizes, parameter counts, or model architecture internals. "Cost" is reported in dollars and tokens (API-level), not in GPU-hours. Everything below is what is present.

### Swarm architecture (roles, not neural nets)
- Two roles over a task tree: planners on "the smartest models" split and delegate; workers on "faster and less expensive models" execute.
- Strict role separation for context hygiene: a planner "never implements," a worker "never plans."
- The team credits scaling to context efficiency rather than parallelism itself; described as "a superset of more rigid orchestration systems," with compute scaling with task complexity.
- Framing analogy: the swarm as a compiler lowering intent into work, except "the swarm is probabilistic at every one" step.

### Concurrency and throughput numbers
- Old browser swarm: roughly **1,000 commits per hour** on Git. New purpose-built VCS: about **1,000 commits per second** — a claimed 3,600× throughput step.
- Git/Cargo criticized for "coarse locks," unworkable at "hundreds of concurrent agents."
- Old Grok 4.5 run: **68,000 commits** in two hours, ~**70×** the new run's commit pace (interpreted as thrash/churn, not productivity).
- Merge conflicts: old run >**70,000** before being paused; new run <**1,000** across four hours.
- Hottest file, old run: **7,771** conflicts from **1,173** distinct agents. New run's most-contested file: **47**.
- Crate sprawl: **54** crates (three duplicate SQL packages) vs. **9** crates, fixed early.

### Coordination mechanisms
- Split-brain duplication: solved by prompting planners to own design decisions and prevent two subtrees deciding the same question.
- Planner contention: shared design docs, compile-checked references from dependent code, plus a reconciler that merges docs and propagates resolutions.
- Merge conflicts: a neutral third-party resolver agent, analogous to a merge queue.
- Megafiles: workers flag bloat, commits are blocked, an external agent splits the file.
- Ossification: agents may "license intentional breakage" — patch core code, leave a rationale comment, and let compile failures carry the change downstream.
- Review: multiple decorrelated lenses (full transcript / output only / codebase only, plus varied models and personalities); rationale is that "review is much cheaper than the work it audits."
- Field Guide: agent-owned folder whose `index.md` is injected into every agent at start, bounded only by a line budget.

### Benchmark setup
- Target: implement an **835-page** SQLite manual in Rust; source, test suites, binary, and internet withheld.
- Graded on **sqllogictest** (millions of queries); the swarm was never told the suite existed; manual post-hoc checks for shortcuts.

### Results (4-hour budget)
| Config | Notes |
|---|---|
| GPT-5.5 planner+worker | frontier throughout |
| Grok 4.5 planner+worker | new run hit 80% in 4h; old run paused pre-2h |
| Opus 4.8 planner + Composer 2.5 worker | hybrid |
| Fable 5 planner + Composer 2.5 worker | ~two-thirds passed in hour one |

- New harness at cutoff: **73–85%**; old harness: **11–77%**. All new configs eventually reached **100%**.
- Code volume: Fable mix **64,305 → 9,908** lines of engine code; Opus mix **19,013 lines @ 97%** (old) vs **4,645 lines @ 100%** (new).

### Inference/token economics
- Total run cost range: **$1,339** (Opus 4.8 hybrid) to **$10,565** (GPT-5.5 solo) — ~7.9×.
- Token distribution: workers carried **≥69%** of tokens, "over 90% in most" runs.
- Cost inverts token share because planner tokens are pricier: Opus-as-planner produced few tokens but ~**two-thirds** of spend; Composer-as-worker took the token bulk for the remaining third.
- Worker-fleet cost contrast: **$9,373** (GPT-5.5 workers) vs **$411** (Composer 2.5 workers) — ~23× cheaper execution layer.
- Fable 5 vs Opus 4.8 as planner: Fable had roughly **2× per-token price** yet a slightly smaller planner bill (fewer planning tokens), but its workers burned several times more tokens, making the run substantially costlier overall — planner verbosity shifts downstream worker token load.
- Thesis: only a few moments need frontier reasoning (decomposition, design decisions, trade-offs); after ambiguity collapses into explicit instructions, cheap models suffice.
- Solo Opus 4.8 and Fable 5 baselines were run for cost reference only, shown as hatched bars, graded informally.

### Model-sensitivity note
GPT-5.6 Sol was the intended frontier config but was dropped: it seemed "more sensitive to literal and emphasized wording" and produced "runaway spirals," with no time to retune prompts without biasing the comparison.

### Artifact
Solo Opus 4.8 output published at `github.com/cursor/minisqlite`; the authors admit only an "initial glance," no deep manual analysis.

---

[FETCH RESULT]
Note: the content provided looks like the main blog index (with a "View more ↓" control), not a separate page 2 — so this is everything visible here.

## Main post list

| Date | Title | Slug | Topic |
|---|---|---|---|
| Aug 18, 2026 | "Git at any scale" | /blog/git-at-any-scale | research |
| Aug 14, 2026 | "Cursor is now a part of SpaceX" | /blog/joining-spacex | company |
| Aug 13, 2026 | "Firetiger joins Cursor" | /blog/firetiger | company |
| Aug 13, 2026 | "Cursor earns AIUC-1 certification for agent security and reliability" | /blog/aiuc-1 | company |
| Aug 13, 2026 | "Cloud agents start 3x faster with builds" | /blog/builds | product |
| Aug 12, 2026 | "Introducing Grok 4.6" | /blog/grok-4-6 | research |
| Aug 6, 2026 | "How Cursor Router chooses the right model for the task" | /blog/how-cursor-router-works | research |
| Aug 4, 2026 | "Mixture-of-Kittens: our open-source MoE megakernel for NVL72s" | /blog/mixture-of-kittens | research |
| Jul 30, 2026 | "How we set up our cloud agent environment" | /blog/cloud-agent-environment | research |
| Jul 28, 2026 | "Introducing Cursor Start" | /blog/cursor-start-india | product |
| Jul 22, 2026 | "Introducing Cursor Router" | /blog/router | product |
| Jul 20, 2026 | "Agent swarms and the new model economics" | /blog/agent-swarm-model-economics | research |

## Customer stories section

| Date | Title | Slug |
|---|---|---|
| Aug 25, 2026 | "IMDEX uses Cursor to build integrated subsurface data and analytics platform in months, not years" | /blog/imdex |
| Jul 28, 2026 | "How Vercel used Cursor to build Queues" | /blog/vercel |
| Jun 23, 2026 | "Coinbase reduces time from idea to production by 90% with Cursor" | /blog/coinbase |
| Jun 15, 2026 | "How Wayfair cut ML model costs by 90% (twice!) with Cursor" | /blog/wayfair |

Also linked without a date: "Towards self-driving codebases" (/blog/self-driving-codebases).

---

[FETCH RESULT]
## Composer — technical details (Cursor blog, Oct 29, 2025)

**Architecture**
- A "mixture-of-experts (MoE) language model supporting long-context generation and understanding."
- No parameter count, expert count, or numeric context-window size is disclosed.
- Lineage: motivated by Cursor Tab work; a faster prototype agent model was "codenamed Cheetah," and Composer is described as a smarter version of it.

**Speed / tokens per second**
- Claimed "generation speed four times faster than similar models"; no absolute tokens/sec figure is published.
- Footnote states that for the tokens-per-second measurement, "tokens are standardized across models to the latest Anthropic tokenizer."

**RL training**
- Specialized for software engineering via reinforcement learning across varied development environments.
- Each training iteration supplies a problem description; the target output may be a code edit, a plan, or an informative answer.
- Reward shaping favors efficient tool choices and maximizing parallelism, plus reduced filler responses and fewer unsupported claims.
- Emergent skills reported without explicit training: complex searches, "fixing linter errors, and writing and executing unit tests."

**Tool use**
- Full Cursor Agent harness access: file reads/edits, semantic codebase-wide search, string grep, and terminal commands.
- Training required "running hundreds of thousands of concurrent sandboxed coding environments in the cloud."

**Training/inference stack**
- Custom infrastructure built on PyTorch and Ray for "asynchronous reinforcement learning at scale."
- Native low-precision training combining their MXFP8 MoE kernels with expert parallelism and hybrid sharded data parallelism.
- Scale: "thousands of NVIDIA GPUs with minimal communication cost" (exact count not given).
- MXFP8 training reportedly yields faster inference "without requiring post-training quantization."
- Background Agents infrastructure was reused, with the VM scheduler rewritten for bursty training load, unifying RL and production environments.

**Evaluation**
- Cursor Bench: real agent requests from Cursor staff with "hand-curated optimal solutions," scoring correctness and conformance to existing codebase abstractions and practices.
- Comparison tiers per the footnote: Fast Frontier (e.g., Haiku 4.5, Gemini Flash 2.5), Best Open (e.g., Qwen Coder, GLM 4.6), a July 2025 frontier baseline, and Best Frontier — where GPT-5 and Sonnet 4.5 "both outperform Composer."

---

[FETCH RESULT]
## Cursor Tab + Online RL — Technical Details

**Scale & serving**
- The Tab model fires on every user action (each character typed or cursor move) and predicts the next action across the codebase; a suggestion is displayed only when confidence is sufficient.
- Volume: "handling over 400 million requests per day."
- **Model size and latency figures are not disclosed** anywhere in the post.

**Deployment / update cadence**
- Unusual for the industry: it "involves rolling out new models to users frequently throughout the day and using that data for training," versus competitors who ship "every few months" with static datasets or paid labelers.
- End-to-end loop time: "it takes us 1.5 to 2 hours to roll out a checkpoint and collect the data for the next step" — described as fast by industry standards but still improvable.

**Learning method**
- Policy gradient (not a separate accept-probability classifier), chosen to reuse the Tab model's code representation and prevent bad suggestions rather than filter them post-hoc.
- Objective: J(θ) = E_{s∼P, a∼π}[R(s,a)], with gradient ∇θJ(θ) = E_{s∼P(s), a∼π(a|s,θ)}[∇θ log π(a|s,θ) · R(s,a)].
- Estimation: states/actions sampled from suggestions actually shown on user requests; π(a|s,θ) computed "using a framework like PyTorch"; R(s,a) derived from whether the user accepted. This yields an unbiased gradient estimate for SGD.
- On-policy constraint: once weights update, prior samples are off-policy, so fresh data requires deploying the new checkpoint to real users — the reason the fast rollout infrastructure matters.

**Reward shaping (illustrative example given)**
- Target accept rate of 25% → +0.75 for accepted, −0.25 for rejected, 0 for showing nothing.
- Expected reward when showing = 0.75p − 0.25(1−p), positive only when p > 0.25, so the optimal policy suggests above that threshold.
- Production reward is more complex: it factors in suggestion size plus "the possibility of jumping to other locations in the code and showing more suggestions." Acceptance probability is never modeled explicitly — it's presumably learned internally and "we leave that up to the optimizer."

**Prior art referenced (GitHub Copilot, per Parth Thakkar, 2022)**
- A "contextual filter score" from logistic regression over 11 features (language, whether the prior suggestion was accepted/rejected, trailing characters before the cursor, etc.).
- Suggestions suppressed below a 15% score.

**Results**
- New model is now the Cursor default: **"21% fewer suggestions"** than its predecessor with a **"28% higher accept rate"** on the suggestions it does make.

*Post dated Sep 12, 2025 by Jacob Jackson, Phillip Kravtsov, and Shomil Jain.*

---

[FETCH RESULT]
# Shadow Workspaces (Cursor) — Technical Summary

*Arvid Lunnemark, Sep 1, 2024 · Cursor blog, "research" · ~20 min read*

## Concept

The shadow workspace is Cursor's mechanism for letting AI agents iterate inside a real development environment — seeing lints, jumping to definitions, eventually running code — while keeping the user's editing session untouched. The motivating argument: an engineer handed a few files in a Google Doc would fail at implementing a PR, and so would a model; give either one a working dev environment and results improve. The post notes that unrestrained AI edits in your folder produce "chaos," since a background model could clobber a hand-written function or leave non-compiling code in place. It was a one-person, one-week project and ships as an opt-in hidden setting.

## Two goals

1. **LSP-usability** — full interaction with the language server protocol (lints, go-to-definition, etc.).
2. **Runnability** — executing code and reading its output.

LSP-usability came first, partly because most language servers can operate on unsaved buffers, whereas "involving the file system makes things quite a bit more difficult."

## Six requirements

- **Independence** — "the user's coding experience must be unaffected."
- **Privacy** — keep code local.
- **Concurrency** — multiple AIs working simultaneously.
- **Universality** — all languages, all workspace layouts.
- **Maintainability** — minimal, isolatable code.
- **Speed** — no minute-scale delays; throughput for "hundreds of branches of AIs."

Rationale: Cursor serves 100k+ users, and degrading normal editing even slightly would make the AI features irrelevant — the author says he personally "would just not use Cursor" in that case.

## Why lints matter

Feeding lints back is described as "one of the most impactful ways to improve code generation performance when holding the underlying language model fixed" — pushing 90%-working code to 100%, and, under limited context, flagging where the model guessed wrong about a method or service and needs more information.

## VS Code internals and the approach that failed

- Cursor is a VS Code fork, so language servers are readily accessible.
- Each open file is a `TextModel` holding in-memory file state; language servers read these objects rather than disk, which is why diagnostics appear while typing instead of only on save.
- Naive attempt (~6 lines): duplicate the `TextModel` via `modelService.createModel(...)`, apply the AI edit with `applyEdits`, sleep ~2 seconds so language servers catch up, then read diagnostics from `markerService.read({ resource: newModel.uri })` (the marker service dispatches to the right extension by language), then `dispose()` the model.
- Strong on maintainability, universality (users already have their language extensions configured), concurrency, and privacy — but it breaks independence, because the *same* language server the user depends on is informed about the duplicate file.
- Concrete breakages: go-to-references surfaces the copy; Go's multi-file default namespace scope reports duplicate declarations across both copies; Rust, where files only count if explicitly imported, yields no diagnostics at all.
- Other discarded designs: running standalone `tsc` / `gopls` / `rust-analyzer` outside VS Code's infrastructure; duplicating the extension host process to host two copies of every language server extension; forking popular language servers to hold multiple file versions and bundling those forks.

## Current implementation: a hidden Electron window

- On demand, the normal window's renderer asks the main process to open a hidden window on the same folder; the window is reused across requests.
- Hiding it is essentially one Electron flag: `show: false`.
- Electron sandboxing blocks renderer-to-renderer communication. Rather than rebuild VS Code's message-port creation logic between windows, they reused the existing renderer↔extension-host message port and added an independent extension-host↔extension-host IPC link — described as "a hack," but one that let them adopt gRPC plus **buf** instead of VS Code's "custom and somewhat brittle JSON serialization logic."
- Request path (Figure 4): AI proposes an edit → renderer → its extension host → shadow extension host → shadow renderer → edit applied in the hidden window → lints travel back the same route → AI decides how to iterate.
- Independence holds: the hidden window is fully separate, so "the user won't notice anything."
- **Memory cost**: naively 2× usage. Mitigations: restrict which extensions load in the shadow window, kill it after 15 minutes idle, keep it opt-in.
- **Concurrency via interleaving**: instead of one window per AI, exploit that AIs "can be paused an indefinite amount of time without even noticing." For AIs A and B with edits A1/A2 and B1/B2, the window resets the whole folder state to A1, returns lints to A, resets to B1, returns lints to B, and so on — likening AIs to CPU-scheduled processes rather than humans with "an intrinsic sense of time."
- A small Protobuf API (published as a gist) exposes this to background AIs.
- Debug-mode behavior (Figure 5): the first request in 15 minutes spawns the window, then confirms the language server is live by inserting deliberately broken code and waiting for the expected diagnostic before doing the real edit; later requests are far faster.

### Known limitation

Some servers need code on disk. `rust-analyzer` shells out to a project-level `cargo check` and doesn't hook into VS Code's virtual file system (upstream issue #6591), so Rust LSP-usability isn't supported unless the user runs the deprecated `RLS` extension.

## Runnability (designed, not yet built)

Cursor's focus is short-horizon AIs (filling in functions in the background) rather than whole PRs, so this remains speculative. Execution requires writing to disk and produces side effects like build caches and logs, so the shadow window can no longer share the user's folder. Full fidelity would also need network isolation; the analysis targets disk isolation only.

**`cp -r` into /tmp** (with `rm -rf` + re-copy per edit) is too slow, because running a project means copying build artifacts too — `node_modules`, `venv`, `target` — which are large even in mid-size repos.

**Faster copy primitives**: bun is cited as proof that bulk copies can be fast — hardlinks on Linux (no data movement) and macOS's `clonefile` syscall for copy-on-write of a file or directory. But on their own monorepo a `cp -c` clonefile still needs 45 seconds. Hardlinks risk mutating the real repository from inside the shadow folder; symlinks share that risk and additionally aren't handled transparently (e.g. Node's `--preserve-symlinks`).

**Change-accounting variant**: track file changes on both sides since the last full copy, and before each request revert the shadow-side changes while replaying the user-side ones, doing a fresh full copy when either history grows too large. Judged workable but "bug prone, brittle, and, frankly, a bit ugly."

## The desired design: a kernel-level folder proxy

Target semantics: a shadow folder A′ that looks byte-identical to folder A through ordinary file system APIs, with a quickly configurable set of override files served from memory, and with all writes to A′ redirected into that in-memory override store instead of disk. Put the shadow window inside A′ and you get "perfect disk-level independence." Overrides can live wholly in RAM.

Kernel support is essential so that existing code keeps issuing plain `read`/`write` syscalls unchanged. One route is a kernel extension registering as a backend for the shadow folder within the kernel's virtual file system.

### FUSE on Linux

FUSE ships as a kernel module in most distributions and forwards file system calls to a userspace process. The post sketches a toy C++ proxy:

- Setup: `#define FUSE_USE_VERSION 31`, include `<fuse3/fuse.h>`, a `target_folder` string, and `unordered_map<string, vector<char>> overrides`.
- `proxy_read(path, buf, size, offset, fi)`: if the path is in `overrides`, clamp `size` against the stored content length and `memcpy` out of it (returning 0 bytes past the end); otherwise `open` the concatenated target path read-only, `pread`, `close`, and return `-errno` on error.
- `proxy_write(...)`: always target the overrides map, resizing the vector to `offset + size` if needed, then `memcpy` in and return `size`.
- Wire both into a `fuse_operations` struct and hand it to `fuse_main`.

A production version must implement the rest of the API — `readdir`, `getattr`, `lock` — in similar fashion. Per-request setup is instant since it only means swapping the overrides map to that AI's edits; the map could be spilled to disk (with bookkeeping) to bound memory. Given full control of the environment, a native kernel module would be preferred to avoid FUSE's extra user↔kernel context switches.

## Walled gardens: macOS and Windows

- Neither platform bundles FUSE, and most Cursor users are on them.
- Kernel extensions are effectively unshippable on Apple Silicon: users must reboot into recovery mode and downgrade to "Reduced Security" — the post's verdict is "Unshippable!"
- macFUSE inherits the same installation barrier since part of it runs in-kernel.
- Workaround family: implement a FUSE-like API beneath a network file system macOS supports natively (NFS or SMB). Examples: `xetdata/nfsserve` (open-source local-server proof of concept over NFS) and the closed-source `macos-fuse-t/fuse-t` (NFS and SMB backends).
- These fall short because "File systems are more complicated than just reading, writing, and listing files!" — NFSv3, which `nfsserve` builds on, lacks file locking, so Cargo fails (Figure 6).
- FUSE-t uses NFSv4, which does support locking, but its repo holds only Attributions.txt, License.txt and README.md under a single-purpose account — unshippable as an opaque binary — and its issue tracker points to deeper problems tied to Apple kernel bugs.
- Remaining hope is a novel technique or "politics": Apple's long deprecation of kexts has come with more userspace APIs (DriverKit), legacy file system support has moved to user-land, and Apple's open-source msdosfs code references a private `FSKit` framework. Getting that finalized and opened to third parties could unlock macOS runnability.

## Open questions posed

1. A folder proxy without a kernel extension or FUSE — FUSE solves the broader problem of "any kind of file system," so some narrower macOS/Windows API might suffice.
2. The Windows path: would WinFsp simply work, or bring installation, performance, or security issues? (Most of the author's investigation went into macOS.)
3. Whether DriverKit could emulate a fake USB device serving as the proxy folder — considered unlikely but not ruled out.
4. Network-level independence, e.g. an AI debugging an integration test spread across three microservices; possibly VM-like, at the cost of replicating the whole environment and installed software.
5. Reproducing the local workspace remotely with minimal user setup — in the cloud, FUSE or a kernel module is available with no vendor negotiation, memory stays off the user's machine, and independence is complete, trading away some privacy. A sketched idea: auto-infer a Docker container by probing the machine and having a language model write the Dockerfile.

Feedback invited at arvid@cursor.com; the post closes with a hiring note.

---

Failed to authenticate. API Error: 403 pre-consume quota failed, user quota: ＄0.094528, need quota: ＄0.403056 (request id: 20260901130925304755933vxl4tnAJkbtdK)