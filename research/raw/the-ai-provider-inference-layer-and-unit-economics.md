# The AI provider/inference layer and unit economics of running a Cursor

## URLs fetched
- https://docs.claude.com/en/docs/about-claude/pricing
- https://cursor.com/pricing
- https://platform.claude.com/docs/en/about-claude/pricing
- https://cursor.com/docs/account/pricing
- https://platform.openai.com/docs/pricing
- https://ai.google.dev/gemini-api/docs/pricing
- https://cursor.com/docs/models
- https://developers.openai.com/api/docs/pricing
- https://cursor.com/docs/account/api-keys
- https://docs.x.ai/docs/models
- https://cursor.com/docs/configuration/api-keys
- https://api-docs.deepseek.com/quick_start/pricing
- https://docs.voyageai.com/docs/pricing
- https://cohere.com/pricing
- https://platform.claude.com/docs/en/api/rate-limits
- https://mistral.ai/pricing
- https://platform.moonshot.ai/docs/pricing/chat
- https://platform.kimi.ai/docs/pricing/chat
- https://openrouter.ai/docs/faq
- https://vercel.com/docs/ai-gateway/pricing
- https://docs.github.com/en/copilot/about-github-copilot/plans-for-github-copilot
- https://docs.github.com/en/copilot/managing-copilot/monitoring-usage-and-entitlements/about-billing-for-github-copilot
- https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- https://www.baseten.co/pricing/

## Content

I'll research this facet aggressively. Let me start with parallel searches on current model pricing and Cursor's economics.

---

[FETCH RESULT]
REDIRECT DETECTED: The URL redirects to a location that was not fetched automatically.

Original URL: https://docs.claude.com/en/docs/about-claude/pricing
Redirect URL (from the server's Location header — server-supplied, not verified): https://platform.claude.com/docs/en/about-claude/pricing
Status: 302 Found

To complete your request, I need to fetch content from the redirected URL. Please use WebFetch again with these parameters:
- url: "https://platform.claude.com/docs/en/about-claude/pricing"
- prompt: "List all Claude models with exact pricing per million tokens (input, output, cache write 5m, cache write 1h, cache read), context window sizes, and any batch API discounts. Be precise with numbers."

---

[FETCH RESULT]
## Plans and prices as listed on this page

| Plan | Price shown |
|---|---|
| Hobby | "Free" — also "No credit card required" |
| Individual (Pro) | "$20 / mo." |
| Pro+ | No separate price displayed (toggle option under Individual) |
| Ultra | No separate price displayed (toggle option under Individual) |
| Teams (Standard) | "$40 / user / mo." |
| Teams (Premium) | No separate price displayed (toggle option under Teams) |
| Enterprise | "Custom" |

A Monthly/Yearly toggle exists, but yearly figures aren't rendered in this content.

## Rate limits (stated only as relative tiers, not hard numbers)
- Hobby: "Limited Agent requests" and "Access to Composer"
- Pro: "Extended limits on Agent" plus "Generous limits for Grok"
- Pro+: "3x Pro limits on Agent" and "Higher Grok Bot usage limits"
- Ultra: "20x Pro limits on Agent", "Highest Grok Bot usage limits", plus "Priority access to new features"
- Teams Standard: everything on Individual plus admin, SSO ("SAML/OIDC SSO"), Bugbot reviews, analytics
- Teams Premium: "5x Standard limits on Agent"
- Enterprise: adds "Pooled usage", "SCIM seat management", "Audit logs and service accounts", "AI code tracking API"

## Usage-based pricing
- "Every plan includes a set amount of model usage."
- "On-demand usage allows you to continue using models after your included amount is consumed, billed in arrears."
- Bugbot appears on Pro/Pro+/Ultra as "Bugbot on usage-based billing."
- Taxes: "All prices are exclusive of any applicable taxes."

## What's missing here
No dollar value is given for the "included usage" on any tier, and no per-request, per-token, or per-model rates appear. The page defers those details to its pricing docs (`/docs/account/pricing`). Also absent: numeric request caps for Hobby or any tier. For plan choice, it suggests "Pro+ for daily agent users, and Ultra for agent power users," with Enterprise for orgs needing "invoicing, pooled usage, or advanced security."

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: InvokeModelWithResponseStream: operation error Bedrock Runtime: InvokeModelWithResponseStream, https response error StatusCode: 400, RequestID: 5451f96e-b58a-4cdf-ae39-2ab42b43e8ea, ValidationException: Tool 'web_search' not found in provided tools (request id: 3aa435475732ed2f01153e29de926c8b) [trace_id=0551914b8177ac5cc2c50ff6783dbd0c] (request id: 20260901130225391292263psfmhzMaK1Qok)

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: InvokeModelWithResponseStream: operation error Bedrock Runtime: InvokeModelWithResponseStream, https response error StatusCode: 400, RequestID: a31fd019-9a5e-4354-b430-bc7fbf8db85b, ValidationException: Tool 'web_search' not found in provided tools (request id: 3ce995b93ee23c0bcbc35b4ad32fcff4) [trace_id=81b721efc84c0053fe92734c5fa6fde7] (request id: 20260901130226304485092t8hrsW2TDUQeh)

---

WebSearch errored. Let me retry it and continue with WebFetch on primary sources.

---

[FETCH RESULT]
---
title: Pricing
url: https://platform.claude.com/docs/en/about-claude/pricing
description: Learn about Anthropic's pricing structure for models and features
---

This page provides detailed pricing information for Anthropic's models and features. All prices are in USD.

For the most current pricing information, visit [claude.com/pricing](https://claude.com/pricing).

## Model pricing

The following table shows pricing for all Claude models:

| Model                                                                                                                                 | Base Input Tokens | 5m Cache Writes | 1h Cache Writes | Cache Hits & Refreshes | Output Tokens |
| ------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | --------------- | --------------- | ---------------------- | ------------- |
| Claude Fable 5                                                                                                                        | $10 / MTok        | $12.50 / MTok   | $20 / MTok      | $1 / MTok              | $50 / MTok    |
| Claude Mythos 5 ([limited availability](https://anthropic.com/glasswing))                                                             | $10 / MTok        | $12.50 / MTok   | $20 / MTok      | $1 / MTok              | $50 / MTok    |
| Claude Opus 5                                                                                                                         | $5 / MTok         | $6.25 / MTok    | $10 / MTok      | $0.50 / MTok           | $25 / MTok    |
| Claude Opus 4.8                                                                                                                       | $5 / MTok         | $6.25 / MTok    | $10 / MTok      | $0.50 / MTok           | $25 / MTok    |
| Claude Opus 4.7                                                                                                                       | $5 / MTok         | $6.25 / MTok    | $10 / MTok      | $0.50 / MTok           | $25 / MTok    |
| Claude Opus 4.6                                                                                                                       | $5 / MTok         | $6.25 / MTok    | $10 / MTok      | $0.50 / MTok           | $25 / MTok    |
| Claude Opus 4.5                                                                                                                       | $5 / MTok         | $6.25 / MTok    | $10 / MTok      | $0.50 / MTok           | $25 / MTok    |
| Claude Opus 4.1 ([retired, except on Bedrock and Google Cloud](https://platform.claude.com/docs/en/about-claude/model-deprecations))  | $15 / MTok        | $18.75 / MTok   | $30 / MTok      | $1.50 / MTok           | $75 / MTok    |
| Claude Opus 4 ([retired, except on Google Cloud](https://platform.claude.com/docs/en/about-claude/model-deprecations))                | $15 / MTok        | $18.75 / MTok   | $30 / MTok      | $1.50 / MTok           | $75 / MTok    |
| Claude Sonnet 5                                                                                                                       | $2 / MTok         | $2.50 / MTok    | $4 / MTok       | $0.20 / MTok           | $10 / MTok    |
| Claude Sonnet 4.6                                                                                                                     | $3 / MTok         | $3.75 / MTok    | $6 / MTok       | $0.30 / MTok           | $15 / MTok    |
| Claude Sonnet 4.5                                                                                                                     | $3 / MTok         | $3.75 / MTok    | $6 / MTok       | $0.30 / MTok           | $15 / MTok    |
| Claude Sonnet 4 ([retired, except on Bedrock and Google Cloud](https://platform.claude.com/docs/en/about-claude/model-deprecations))  | $3 / MTok         | $3.75 / MTok    | $6 / MTok       | $0.30 / MTok           | $15 / MTok    |
| Claude Haiku 4.5                                                                                                                      | $1 / MTok         | $1.25 / MTok    | $2 / MTok       | $0.10 / MTok           | $5 / MTok     |
| Claude Haiku 3.5 ([retired, except on Bedrock and Google Cloud](https://platform.claude.com/docs/en/about-claude/model-deprecations)) | $0.80 / MTok      | $1 / MTok       | $1.60 / MTok    | $0.08 / MTok           | $4 / MTok     |

<Note id="claude-sonnet-5-introductory-pricing">
  The $2/$10 per million input/output token pricing for Claude Sonnet 5, announced at launch as introductory pricing through August 31, 2026, is now the standard price. The previously scheduled increase to $3/$15 per million input/output tokens on September 1, 2026 will not occur.
</Note>

<Note>
  MTok = Million tokens. The "Base Input Tokens" column shows standard input pricing, the "5m Cache Writes", "1h Cache Writes", and "Cache Hits & Refreshes" columns are specific to [prompt caching](https://platform.claude.com/docs/en/about-claude/pricing#prompt-caching), and "Output Tokens" shows output pricing. See [prompt caching pricing](https://platform.claude.com/docs/en/about-claude/pricing#prompt-caching) for an explanation of the cache columns and pricing multipliers.
</Note>

<Note>
  Claude 4.7 and later models and Claude Mythos Preview use a newer tokenizer that contributes to their improved performance on a wide range of tasks. This tokenizer produces approximately 30% more tokens for the same text. The exact increase depends on the content and workload shape. Claude Sonnet 4.6 and earlier models use the previous tokenizer.
</Note>

For Claude Platform on AWS pricing, see [Claude Platform on AWS pricing](https://platform.claude.com/docs/en/about-claude/pricing#claude-platform-on-aws-pricing).

## Cloud platform pricing

This section covers partner-operated cloud platforms, where the cloud provider invoices you. For Anthropic-operated cloud platforms billed through a marketplace, see [Claude Platform on AWS pricing](https://platform.claude.com/docs/en/about-claude/pricing#claude-platform-on-aws-pricing) and [Claude in Microsoft Foundry pricing](https://platform.claude.com/docs/en/about-claude/pricing#claude-in-microsoft-foundry-pricing).

Claude models are available on [Amazon Bedrock](https://platform.claude.com/docs/en/build-with-claude/claude-in-amazon-bedrock) and [Google Cloud](https://platform.claude.com/docs/en/build-with-claude/claude-on-vertex-ai). For official pricing, visit:

* [Amazon Bedrock pricing](https://aws.amazon.com/bedrock/pricing/)
* [Google Cloud pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing#claude-models)

<Note>
  **Regional and multi-region endpoint pricing for Claude 4.5 models and beyond**

  Starting with Claude Sonnet 4.5, Haiku 4.5, and Opus 4.5:

  * **Bedrock** offers two endpoint types: global endpoints (dynamic routing for maximum availability) and regional endpoints (guaranteed data routing through specific geographic regions).
  * **Google Cloud** offers three endpoint types: global endpoints, multi-region endpoints (dynamic routing within a geographic area), and regional endpoints.

  Regional and multi-region endpoints include a 10% premium over global endpoints. The Claude API (first-party) is global by default; for first-party data residency options and pricing, see [Data residency pricing](https://platform.claude.com/docs/en/about-claude/pricing#data-residency-pricing).

  **Scope:** This pricing structure applies to Claude Sonnet 4.5, Haiku 4.5, Opus 4.5, and all future models. Earlier models (Claude Opus 4.1 and prior releases) retain their existing pricing.

  For implementation details and code examples:

  * [Amazon Bedrock global vs regional endpoints](https://platform.claude.com/docs/en/build-with-claude/claude-in-amazon-bedrock#regions) for Opus 4.7, Haiku 4.5, and later models, or [the legacy integration](https://platform.claude.com/docs/en/build-with-claude/claude-on-amazon-bedrock-legacy#global-vs-regional-endpoints) for all other models on Bedrock
  * [Google Cloud global, multi-region, and regional endpoints](https://platform.claude.com/docs/en/build-with-claude/claude-on-vertex-ai#global-multi-region-and-regional-endpoints)
</Note>

## Claude Platform on AWS pricing

[Claude Platform on AWS](https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws) bills through AWS Marketplace using Claude Consumption Units (CCUs). Anthropic rates your token usage in USD at standard per-model, per-feature rates, applies any negotiated discount, converts the result to CCUs at $0.01 per CCU, and reports the CCU quantity to AWS Marketplace hourly. Your AWS bill shows a single CCU line item.

| Concept             | Details                                                                                                                                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Billing unit**    | Claude Consumption Unit (CCU)                                                                                                                                                                                     |
| **CCU price**       | $0.01 per CCU (fixed; discounts apply at token-to-CCU conversion, not to the CCU price)                                                                                                                           |
| **Conversion**      | Token usage rated in USD at standard per-model, per-feature rates (same as [Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing#model-pricing)), then converted to CCUs at $0.01 per CCU |
| **Billing cadence** | Hourly metering to AWS Marketplace; monthly invoices                                                                                                                                                              |
| **Payment model**   | Arrears only (postpaid); no prepaid credits                                                                                                                                                                       |
| **Discounts**       | Applied as fewer CCUs metered                                                                                                                                                                                     |
| **Tax**             | Pre-tax metering; AWS Marketplace handles tax                                                                                                                                                                     |
| **Cost visibility** | Real-time breakdown in the Claude Console (access through the AWS Console); AWS Cost Explorer shows aggregated CCU                                                                                                |

<Note>
  **Claude Consumption Units.** If Customer accesses the Services through certain Marketplace Platforms (e.g., Claude Platform on AWS), usage will be invoiced in Claude Consumption Units ("CCU") rather than per MTok. A CCU is a unit of measure used solely for Marketplace Platform invoicing. One hundred (100) CCU represents $1.00 USD of fees owed for the Services, calculated at the applicable prices on [claude.com/pricing#api](https://claude.com/pricing#api), after application of any discounts.
</Note>

### Inference geography

For Claude 4.6 and later models, using `inference_geo: "us"` applies a 1.1x pricing multiplier. `inference_geo: "global"` (default) uses standard pricing. See [Data residency](https://platform.claude.com/docs/en/manage-claude/data-residency) for details.

### Private offers

When you sign up on the AWS Console **Claude Platform on AWS** service page, the AWS Console looks up any private offer associated with your account and prompts you to accept it in AWS Marketplace. Contact your Anthropic account representative for private offer terms.

<Note>
  If you have an existing Amazon Bedrock private offer, contact your Anthropic or AWS account representative before getting started with Claude Platform on AWS to ensure your discounts are applied correctly. Discounts cannot be applied retroactively to usage incurred before your private offer is accepted.
</Note>

## Claude in Microsoft Foundry pricing

[Claude in Microsoft Foundry](https://platform.claude.com/docs/en/build-with-claude/claude-in-microsoft-foundry) bills through the Azure Marketplace using Claude Consumption Units (CCUs). Anthropic rates your token usage in USD at standard per-model, per-feature rates, applies any negotiated discount, converts the result to CCUs at $0.01 per CCU, and reports the CCU quantity to the Azure Marketplace hourly. Your Azure bill shows a single CCU line item.

| Concept             | Details                                                                                                                                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Billing unit**    | Claude Consumption Unit (CCU)                                                                                                                                                                                     |
| **CCU price**       | $0.01 per CCU (fixed; discounts apply at token-to-CCU conversion, not to the CCU price)                                                                                                                           |
| **Conversion**      | Token usage rated in USD at standard per-model, per-feature rates (same as [Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing#model-pricing)), then converted to CCUs at $0.01 per CCU |
| **Billing cadence** | Hourly metering to the Azure Marketplace; monthly invoices                                                                                                                                                        |
| **Payment model**   | Arrears only (postpaid); no prepaid credits                                                                                                                                                                       |
| **Discounts**       | Applied as fewer CCUs metered                                                                                                                                                                                     |
| **Tax**             | Pre-tax metering; Azure Marketplace handles tax                                                                                                                                                                   |
| **Cost visibility** | Azure Cost Management shows aggregated CCU                                                                                                                                                                        |

<Note>
  **Claude Consumption Units.** If Customer accesses the Services through certain Marketplace Platforms (e.g., Claude Platform on AWS, Claude in Microsoft Foundry), usage will be invoiced in Claude Consumption Units ("CCU") rather than per MTok. A CCU is a unit of measure used solely for Marketplace Platform invoicing. One hundred (100) CCU represents $1.00 USD of fees owed for the Services, calculated at the applicable prices on [claude.com/pricing#api](https://claude.com/pricing#api), after application of any discounts.
</Note>

### Inference geography

Deployments hosted on Azure can use the US Data Zone Standard deployment type, which keeps inference within the United States. This is equivalent to `inference_geo: "us"` on the Claude API and applies the same 1.1x pricing multiplier. See [Data residency](https://platform.claude.com/docs/en/manage-claude/data-residency) for details.

## Feature-specific pricing

### Prompt caching

Prompt caching reduces costs and latency by reusing previously processed portions of your prompt across API calls. Instead of reprocessing the same large system prompt, document, or conversation history on every request, the API reads from cache at a fraction of the standard input price.

There are two ways to enable prompt caching:

* **Automatic caching:** Add a single `cache_control` field at the top level of your request. The system automatically manages cache breakpoints as conversations grow. This is the recommended starting point for most use cases.
* **Explicit cache breakpoints:** Place `cache_control` directly on individual content blocks for fine-grained control over exactly what gets cached.

Prompt caching uses the following pricing multipliers relative to base input token rates:

| Cache operation      | Multiplier             | Duration                             |
| -------------------- | ---------------------- | ------------------------------------ |
| 5-minute cache write | 1.25x base input price | Cache valid for 5 minutes            |
| 1-hour cache write   | 2x base input price    | Cache valid for 1 hour               |
| Cache read (hit)     | 0.1x base input price  | Same duration as the preceding write |

Cache write tokens are charged when content is first stored. Cache read tokens are charged when a subsequent request retrieves the cached content. A cache hit costs 10% of the standard input price, which means caching pays off after one cache read for the 5-minute duration (1.25x write), or after two cache reads for the 1-hour duration (2x write).

These multipliers stack with other pricing modifiers, including the Batch API discount and data residency.

For implementation details, supported models, and code examples, see [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).

### Data residency pricing

For Claude 4.6 and later models, specifying US-only inference through the `inference_geo` parameter incurs a 1.1x multiplier on all token pricing categories, including input tokens, output tokens, cache writes, and cache reads. Global routing (the default) uses standard pricing.

This applies to the Claude API (first-party) and Claude Platform on AWS. On Claude in Microsoft Foundry, the same 1.1x multiplier applies to deployments that use the US Data Zone Standard deployment type (see [Inference geography](https://platform.claude.com/docs/en/about-claude/pricing#foundry-inference-geography)). Partner-operated platforms (Bedrock and Google Cloud) have independent regional pricing. See [Bedrock](https://aws.amazon.com/bedrock/pricing/) and [Google Cloud](https://cloud.google.com/vertex-ai/generative-ai/pricing#claude-models) for details. Earlier models do not support the `inference_geo` parameter and always use standard pricing; requests that include the parameter on these models return a 400 error.

For more information, see [Data residency](https://platform.claude.com/docs/en/manage-claude/data-residency).

### Fast mode pricing

[Fast mode](https://platform.claude.com/docs/en/build-with-claude/fast-mode), in research preview, provides significantly faster output for Claude Opus 5 and Claude Opus 4.8 at premium pricing. Fast mode pricing applies across the full context window, including requests over 200k input tokens. Fast mode is available on the Claude API (first-party) only; it is not available on Claude Platform on AWS or partner-operated cloud platforms.

| Model                           | Input      | Output     |
| ------------------------------- | ---------- | ---------- |
| Claude Opus 5 / Claude Opus 4.8 | $10 / MTok | $50 / MTok |

Fast mode is not available on Claude Opus 4.7 (requests with `speed: "fast"` return an error) or Claude Opus 4.6 (requests run at standard speed and are billed at standard rates). See [Fast mode](https://platform.claude.com/docs/en/build-with-claude/fast-mode#supported-models).

Fast mode pricing stacks with other pricing modifiers:

* [Prompt caching multipliers](https://platform.claude.com/docs/en/about-claude/pricing#prompt-caching) apply on top of fast mode pricing
* [Data residency](https://platform.claude.com/docs/en/manage-claude/data-residency) multipliers apply on top of fast mode pricing

Fast mode is not available with the [Batch API](https://platform.claude.com/docs/en/about-claude/pricing#batch-processing).

For more information, see [Fast mode](https://platform.claude.com/docs/en/build-with-claude/fast-mode).

### Batch processing

The Batch API allows asynchronous processing of large volumes of requests with a 50% discount on both input and output tokens.

| Model                                                                                                                                 | Batch input  | Batch output  |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------- |
| Claude Fable 5                                                                                                                        | $5 / MTok    | $25 / MTok    |
| Claude Mythos 5 ([limited availability](https://anthropic.com/glasswing))                                                             | $5 / MTok    | $25 / MTok    |
| Claude Opus 5                                                                                                                         | $2.50 / MTok | $12.50 / MTok |
| Claude Opus 4.8                                                                                                                       | $2.50 / MTok | $12.50 / MTok |
| Claude Opus 4.7                                                                                                                       | $2.50 / MTok | $12.50 / MTok |
| Claude Opus 4.6                                                                                                                       | $2.50 / MTok | $12.50 / MTok |
| Claude Opus 4.5                                                                                                                       | $2.50 / MTok | $12.50 / MTok |
| Claude Opus 4.1 ([retired, except on Bedrock and Google Cloud](https://platform.claude.com/docs/en/about-claude/model-deprecations))  | $7.50 / MTok | $37.50 / MTok |
| Claude Opus 4 ([retired, except on Google Cloud](https://platform.claude.com/docs/en/about-claude/model-deprecations))                | $7.50 / MTok | $37.50 / MTok |
| Claude Sonnet 5                                                                                                                       | $1 / MTok    | $5 / MTok     |
| Claude Sonnet 4.6                                                                                                                     | $1.50 / MTok | $7.50 / MTok  |
| Claude Sonnet 4.5                                                                                                                     | $1.50 / MTok | $7.50 / MTok  |
| Claude Sonnet 4 ([retired, except on Bedrock and Google Cloud](https://platform.claude.com/docs/en/about-claude/model-deprecations))  | $1.50 / MTok | $7.50 / MTok  |
| Claude Haiku 4.5                                                                                                                      | $0.50 / MTok | $2.50 / MTok  |
| Claude Haiku 3.5 ([retired, except on Bedrock and Google Cloud](https://platform.claude.com/docs/en/about-claude/model-deprecations)) | $0.40 / MTok | $2 / MTok     |

For more information about batch processing, see [Batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing).

### Long context pricing

Claude 4.6 and later models and [Claude Mythos Preview](https://anthropic.com/glasswing) include the full [1M token context window](https://platform.claude.com/docs/en/build-with-claude/context-windows) at standard pricing. (A 900k-token request is billed at the same per-token rate as a 9k-token request.) Prompt caching and batch processing discounts apply at standard rates across the full context window.

### Tool use pricing

Tool use requests are priced based on:

1. The total number of input tokens sent to the model (including in the `tools` parameter)
2. The number of output tokens generated
3. For server-side tools, additional usage-based pricing (for example, web search charges per search performed)

Client-side tools are priced the same as any other Claude API request, although server-side tools can incur additional charges based on their specific usage.

The additional tokens from tool use come from:

* The `tools` parameter in API requests (tool names, descriptions, and schemas)
* `tool_use` content blocks in API requests and responses
* `tool_result` content blocks in API requests

When you use `tools`, the API also automatically includes a special system prompt for the model that enables tool use. The number of tool use tokens required for each model is listed in the following table (excluding the additional tokens listed earlier). Note that the table assumes at least 1 tool is provided. If no `tools` are provided, then a tool choice of `none` uses 0 additional system prompt tokens.

| Model                                                                                                                                 | Tool choice                    | Tool use system prompt token count |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------- |
| Claude Opus 5                                                                                                                         | `auto`, `none`***`any`, `tool` | 286 tokens***406 tokens            |
| Claude Opus 4.8                                                                                                                       | `auto`, `none`***`any`, `tool` | 290 tokens***410 tokens            |
| Claude Opus 4.7                                                                                                                       | `auto`, `none`***`any`, `tool` | 675 tokens***804 tokens            |
| Claude Opus 4.6                                                                                                                       | `auto`, `none`***`any`, `tool` | 497 tokens***589 tokens            |
| Claude Opus 4.5                                                                                                                       | `auto`, `none`***`any`, `tool` | 496 tokens***588 tokens            |
| Claude Opus 4.1 ([retired, except on Bedrock and Google Cloud](https://platform.claude.com/docs/en/about-claude/model-deprecations))  | `auto`, `none`***`any`, `tool` | 313 tokens***315 tokens            |
| Claude Opus 4 ([retired, except on Google Cloud](https://platform.claude.com/docs/en/about-claude/model-deprecations))                | `auto`, `none`***`any`, `tool` | 313 tokens***315 tokens            |
| Claude Sonnet 5                                                                                                                       | `auto`, `none`***`any`, `tool` | 354 tokens***474 tokens            |
| Claude Sonnet 4.6                                                                                                                     | `auto`, `none`***`any`, `tool` | 497 tokens***589 tokens            |
| Claude Sonnet 4.5                                                                                                                     | `auto`, `none`***`any`, `tool` | 496 tokens***588 tokens            |
| Claude Sonnet 4 ([retired, except on Bedrock and Google Cloud](https://platform.claude.com/docs/en/about-claude/model-deprecations))  | `auto`, `none`***`any`, `tool` | 313 tokens***315 tokens            |
| Claude Haiku 4.5                                                                                                                      | `auto`, `none`***`any`, `tool` | 496 tokens***588 tokens            |
| Claude Haiku 3.5 ([retired, except on Bedrock and Google Cloud](https://platform.claude.com/docs/en/about-claude/model-deprecations)) | `auto`, `none`***`any`, `tool` | 264 tokens***355 tokens            |

These token counts are added to your normal input and output tokens to calculate the total cost of a request.

For current per-model prices, refer to the [model pricing](https://platform.claude.com/docs/en/about-claude/pricing#model-pricing) section.

For more information about tool use implementation and best practices, see [Tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview).

### Specific tool pricing

#### Bash tool

The bash tool definition adds the following input tokens to your request. This is in addition to the per-model [tool use system prompt](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview#pricing) that applies whenever any tool is present.

| Model                                               | Additional input tokens |
| --------------------------------------------------- | ----------------------- |
| Claude Opus 5, Claude Opus 4.8, and Claude Opus 4.7 | 325 tokens              |
| Claude Opus 4.6, Claude Sonnet 4.6, and earlier     | 244 tokens              |

Additional tokens are consumed by:

* Command outputs (stdout/stderr)
* Error messages
* Large file contents

See [tool use pricing](https://platform.claude.com/docs/en/about-claude/pricing#tool-use-pricing) for complete pricing details.

#### Code execution tool

**Code execution is free when used with web search or web fetch.** When `web_search_20260209` (or later) or `web_fetch_20260209` (or later) is included in your API request, there are no additional charges for code execution tool calls beyond the standard input and output token costs.

When used without these tools, code execution is billed by execution time, tracked separately from token usage:

* Execution time has a minimum of 5 minutes
* Each organization receives **1,550 free hours** of usage per month
* Additional usage beyond 1,550 hours is billed at **$0.05 USD per hour, per container**
* If files are included in the request, execution time is billed even if the tool is not called, because files are preloaded onto the container

Code execution usage is tracked in the response:

```json
{
  "usage": {
    "input_tokens": 105,
    "output_tokens": 239,
    "server_tool_use": {
      "code_execution_requests": 1
    }
  }
}
```

#### Text editor tool

The text editor tool uses the same pricing structure as other tools used with Claude. It follows the standard input and output token pricing based on the Claude model you're using.

In addition to the base tokens, the following additional input tokens are needed for the text editor tool:

| Tool                                | Additional input tokens |
| ----------------------------------- | ----------------------- |
| `text_editor_20250429` (Claude 4.x) | 700 tokens              |

See [tool use pricing](https://platform.claude.com/docs/en/about-claude/pricing#tool-use-pricing) for complete pricing details.

#### Web search tool

Web search usage is charged in addition to token usage:

```json
{
  "usage": {
    "input_tokens": 105,
    "output_tokens": 6039,
    "cache_read_input_tokens": 7123,
    "cache_creation_input_tokens": 7345,
    "server_tool_use": {
      "web_search_requests": 1
    }
  }
}
```

Web search is available on the Claude API for **$10 per 1,000 searches**, plus standard token costs for search-generated content. Web search results retrieved throughout a conversation are counted as input tokens, in search iterations executed during a single turn and in subsequent conversation turns.

Each web search counts as one use, regardless of the number of results returned. If an error occurs during web search, the web search will not be billed.

#### Web fetch tool

Web fetch usage has **no additional charges** beyond standard token costs:

```json
{
  "usage": {
    "input_tokens": 25039,
    "output_tokens": 931,
    "cache_read_input_tokens": 0,
    "cache_creation_input_tokens": 0,
    "server_tool_use": {
      "web_fetch_requests": 1
    }
  }
}
```

The web fetch tool is available on the Claude API at **no additional cost**. You only pay standard token costs for the fetched content that becomes part of your conversation context.

To protect against inadvertently fetching large content that would consume excessive tokens, use the `max_content_tokens` parameter to set appropriate limits based on your use case and budget considerations.

Example token usage for typical content:

* Average web page (10 kB): \~2,500 tokens
* Large documentation page (100 kB): \~25,000 tokens
* Research paper PDF (500 kB): \~125,000 tokens

#### Computer use tool

Computer use follows the standard [tool use pricing](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview#pricing). When using the computer use tool:

**Toolset definition overhead:** Declaring `computer_toolset_20260801` with its default members adds about 4,500 input tokens to a request (about 4,520 on Claude Fable 5, Claude Mythos 5, Claude Opus 5, and Claude Opus 4.8, and about 4,590 on Claude Sonnet 5), which covers the member tool definitions and the tool use system prompt. Disabling `zoom` with `configs` removes about 410 of those tokens. The exact count for a request is reported in the response `usage`, and you can estimate it in advance with the [token counting endpoint](https://platform.claude.com/docs/en/build-with-claude/token-counting).

**Earlier tool versions:** The following figures apply to the `computer_20251124` and `computer_20250124` tool versions, not to `computer_toolset_20260801`:

* System prompt overhead: 466–499 tokens added to the system prompt
* Tool definition: about 735 input tokens per tool definition (measured with `computer_20250124`)

**Additional token consumption:**

* Screenshot and zoom images returned in tool results, billed as image input (see [Vision pricing](https://platform.claude.com/docs/en/build-with-claude/vision#evaluate-image-size))
* Tool execution results returned to Claude

<Note>
  If you're also using bash or text editor tools alongside computer use, those tools have their own token costs as documented in their respective pages.
</Note>

#### Browser use tool

Browser use follows the standard [tool use pricing](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview#pricing). When using the browser use tool:

**Toolset definition overhead:** Declaring `browser_toolset_20260801` with its default members adds about 6,600 input tokens to a request (about 6,610 on Claude Fable 5, Claude Mythos 5, Claude Opus 5, and Claude Opus 4.8, and about 6,670 on Claude Sonnet 5), which covers the member tool definitions and the tool use system prompt. Enabling all four optional members adds about 880 tokens, and disabling members with `configs` reduces the count. The exact count for a request is reported in the response `usage`, and you can estimate it in advance with the [token counting endpoint](https://platform.claude.com/docs/en/build-with-claude/token-counting).

**Additional token consumption:**

* Screenshot and zoom images returned in tool results, billed as image input (see [Vision pricing](https://platform.claude.com/docs/en/build-with-claude/vision#evaluate-image-size))
* Text tool results returned to Claude, such as accessibility trees, page text, and console or network entries

<Note>
  If you also use the computer use tool, bash tool, text editor tool, or your own tools alongside browser use, those tools have their own token costs as documented on their respective pages.
</Note>

## Claude Managed Agents pricing

[Claude Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview) is billed on two dimensions: tokens and session runtime.

### Tokens

All tokens consumed by a Claude Managed Agents session are billed at the rates shown in [Model pricing](https://platform.claude.com/docs/en/about-claude/pricing#model-pricing). [Prompt caching](https://platform.claude.com/docs/en/about-claude/pricing#prompt-caching) multipliers apply identically. Web search triggered inside a session incurs the standard $10 per 1,000 searches. On [Claude Platform on AWS](https://platform.claude.com/docs/en/about-claude/pricing#claude-platform-on-aws-pricing), session token and runtime charges convert to Claude Consumption Units at the standard rate. [Fast mode](https://platform.claude.com/docs/en/about-claude/pricing#fast-mode-pricing) premium pricing applies when an agent's `model.speed` is set to `"fast"`.

The [data residency multiplier](https://platform.claude.com/docs/en/about-claude/pricing#data-residency-pricing) also applies: when an agent's `model.inference_geo` is pinned to `"us"`, tokens consumed by sessions running that agent are billed at 1.1x the standard rates, the same multiplier that applies to US-only inference on the Messages API.

The following Messages API modifiers do **not** apply to Claude Managed Agents sessions:

| Modifier                                                                                                  | Why it doesn't apply                                           |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [Batch API discount](https://platform.claude.com/docs/en/about-claude/pricing#batch-processing)           | Sessions are stateful and interactive. There is no batch mode. |
| [Cloud platform pricing](https://platform.claude.com/docs/en/about-claude/pricing#cloud-platform-pricing) | Not available on partner-operated cloud platforms.             |

### Session runtime

| SKU             | Rate                   | Metering                  |
| --------------- | ---------------------- | ------------------------- |
| Session runtime | $0.08 per session-hour | `running` status duration |

Runtime is measured to the millisecond and accrues only while the session's status is `running`. Time spent `idle` (waiting for your next message or a tool confirmation), `rescheduling`, or `terminated` does not count toward runtime.

<Note>
  Session runtime replaces the [code execution](https://platform.claude.com/docs/en/about-claude/pricing#code-execution-tool) container-hour billing model when using Claude Managed Agents. You are not separately billed for container hours on top of session runtime.
</Note>

### Worked example

A one-hour coding session using Claude Opus 5 that consumes 50,000 input tokens and 15,000 output tokens:

| Line item       | Calculation              | Cost       |
| --------------- | ------------------------ | ---------- |
| Input tokens    | 50,000 × $5 / 1,000,000  | $0.25      |
| Output tokens   | 15,000 × $25 / 1,000,000 | $0.375     |
| Session runtime | 1.0 hour × $0.08         | $0.08      |
| **Total**       |                          | **$0.705** |

If prompt caching is active and 40,000 of the input tokens are cache reads:

| Line item             | Calculation                   | Cost       |
| --------------------- | ----------------------------- | ---------- |
| Uncached input tokens | 10,000 × $5 / 1,000,000       | $0.05      |
| Cache read tokens     | 40,000 × $5 × 0.1 / 1,000,000 | $0.02      |
| Output tokens         | 15,000 × $25 / 1,000,000      | $0.375     |
| Session runtime       | 1.0 hour × $0.08              | $0.08      |
| **Total**             |                               | **$0.525** |

<Note>
  Example calculation for processing 10,000 support tickets:

  * Average \~3,700 tokens per conversation
  * Using Claude Haiku 4.5 at $1/MTok input, $5/MTok output
  * Total cost: \~$37.00 per 10,000 tickets
</Note>

For a detailed walkthrough of this calculation, see the [customer support agent guide](https://platform.claude.com/docs/en/about-claude/use-case-guides/customer-support-chat).

## Additional pricing considerations

### Cost optimization strategies

When building agents with Claude:

1. **Use appropriate models:** Choose Haiku for simple tasks, Sonnet for most production workloads, and Opus for the most complex reasoning
2. **Implement prompt caching:** Reduce costs for repeated context
3. **Batch operations:** Use the Batch API for non-time-sensitive tasks
4. **Monitor usage patterns:** Track token consumption to identify optimization opportunities

<Tip>
  For high-volume agent applications, contact the [enterprise sales team](https://claude.com/contact-sales) for custom pricing arrangements.
</Tip>

### Rate limits

Rate limits vary by usage tier and affect how many requests you can make:

* **Start tier:** Entry-level limits for getting started
* **Build tier:** Increased limits for growing applications
* **Scale tier:** Highest standard limits for production workloads

For detailed rate limit information, see [Rate limits](https://platform.claude.com/docs/en/api/rate-limits).

For limits beyond the Scale tier or custom pricing arrangements, [contact the sales team](https://claude.com/contact-sales).

### Volume discounts

Volume discounts may be available for high-volume users. These are negotiated on a case-by-case basis.

* Standard usage tiers use the pricing shown in [Model pricing](https://platform.claude.com/docs/en/about-claude/pricing#model-pricing)
* Enterprise customers can [contact sales](mailto:sales@anthropic.com) for custom pricing
* Academic and research discounts may be available

### Enterprise pricing

For enterprise customers with specific needs:

* Custom rate limits
* Volume discounts
* Dedicated support
* Custom terms

Contact the sales team at [sales@anthropic.com](mailto:sales@anthropic.com) or through the [Claude Console](https://platform.claude.com/settings/limits) to discuss enterprise pricing options.

## Billing and payment

* Billing is based on actual monthly usage
* All payments are in USD
* Credit card and invoicing options available
* Usage tracking available in the [Claude Console](https://platform.claude.com/)

## Frequently asked questions

### How is token usage calculated?

Tokens are pieces of text that models process. As a rough estimate, 1 token is approximately 4 characters or 0.75 words in English. The exact count varies by language and content type.

### Are there free tiers or trials?

New users receive a small amount of free credits to test the API. [Contact sales](mailto:sales@anthropic.com) for information about extended trials for enterprise evaluation.

### How do discounts stack?

Batch API and prompt caching discounts can be combined. For example, using both features together provides significant cost savings compared to standard API calls. See [prompt caching pricing](https://platform.claude.com/docs/en/about-claude/pricing#prompt-caching) for how the multipliers interact.

### What payment methods are accepted?

Major credit cards are accepted for standard accounts. Enterprise customers can arrange invoicing and other payment methods.

For additional questions about pricing, contact [support@anthropic.com](mailto:support@anthropic.com).


---

[FETCH RESULT]
## Plans and listed prices

| Plan | Price | Cursor Models pool | Other Models pool |
|---|---|---|---|
| Start (India only) | ₹649/mo, "tax inclusive" | Included | Not included |
| Pro | $20/mo | Included | Included |
| Pro Plus | $60/mo | Included | Included |
| Ultra | $200/mo | Included | Included |
| Teams — Standard seat | $40/user/mo | — | — |
| Teams — Premium seat | $120/user/mo | — | — |
| Enterprise | Custom | — | — |

No "Hobby" or free tier appears anywhere on this page.

## Included usage — dollar amounts not published

The page gives **no dollar-denominated allowance** for any plan. The plan table only marks each pool "Included" or "Not included," and the prose says the Cursor Models pool has "Significantly more included usage" and that Start has "generous usage" of it — both unquantified. The only stated consequence of model choice is that "your model selection affects how quickly your included usage is consumed."

## How usage is metered

- Two pools reset on the monthly billing cycle: Cursor Models (Grok 4.6, Grok 4.5, Composer 2.5) and Other Models (third-party).
- Third-party usage is "charged at the model's API price," drawn from Other Models "at that model's API rate."
- Billing is token-based, "per million tokens," split into input / cache write / cache read / output columns. Examples: Claude Sonnet 5 at $2 input, $2.5 cache write, $0.2 cache read, $10 output; Gemini 3.1 Pro at $2/$0.2/$12; Grok 4.6 at $2/$0.5/$6.
- Both pools appear in editor settings and the usage dashboard.

## Markup / uplift statements (the closest thing to disclosed margin)

1. **Cursor Token Rate** — Teams and Enterprise pay "$0.25 per million tokens" that "applies on top of model API pricing for included usage, on-demand usage, and BYOK usage." It also applies when Auto routes to a third party. First-party Grok and Composer models are exempt.
2. **Max Mode (legacy request-based plans only)** — "billed at the model's API rate plus 20%."
3. **Regional data residency** — opting in "incurs a 10% uplift on Model pricing for eligible Models."
4. **Provider-level surcharges** — e.g., Claude 4.5 Haiku via Bedrock/Vertex: "regional endpoints +10% surcharge."
5. Per-model multipliers exist too: Claude 4 Sonnet 1M costs "2x when the input exceeds 200k tokens"; GPT-5.4/5.5/5.6 Sol long context is "up to 1M tokens with 2x input pricing"; fast modes generally run 2x (GPT-5 Fast: "Faster speed but 2x price").

For consumer plans (Pro/Pro Plus/Ultra), the page asserts pass-through at API rates and states no additional margin — so no explicit consumer markup is disclosed beyond the items above.

## Rate limits

No numeric request or token caps are given. What exists:

- Pro tiers include "unlimited tab completions, extended agent usage limits on all models."
- Teams Premium "adds 5x the Standard limits on Agent."
- Model-specific notes only: GPT-5.1 Codex Mini has "4x rate limits compared to GPT-5.1 Codex"; preview models "have more restrictive rate limits."
- Start locks models to non-fast mode with fixed medium effort for both Grok versions: "You cannot change effort levels or enable Fast mode on Start."

## On-demand / usage-based billing

At the limit you may "Add on-demand usage" and "Continue at the same API rates with pay-as-you-go billing," or upgrade tiers. It is "billed monthly at the same rates," and the page promises "Requests are never downgraded in quality or speed." Start excludes on-demand usage entirely (also no Bugbot, Auto, Automations, or SDK).

## Cursor's own usage estimates

Daily Tab users and limited Agent users "Typically stay within included usage." Daily Agent users: "$60–$100/mo total usage." Power users: "$200+/mo total usage."

For fee-calculation specifics the page defers to its Pricing Policy and, for enterprise terms, sales.

---

[FETCH RESULT]
API Error: 400 Anthropic Claude bad request: InvokeModelWithResponseStream: operation error Bedrock Runtime: InvokeModelWithResponseStream, https response error StatusCode: 400, RequestID: 602cda5c-f2da-425c-98f9-39f3add14c89, ValidationException: Tool 'web_search' not found in provided tools (request id: 8673b73d6a28a5e70dbe01d2f540e5d9) [trace_id=5137c01dfe31cc1db4da39888457c263] (request id: 20260901130314329313188vt5clK29CuAnR)

---

WebSearch is unavailable in this environment. I'll work entirely from primary-source URLs via WebFetch. Batching aggressively.

---

[FETCH RESULT]
REDIRECT DETECTED: The URL redirects to a location that was not fetched automatically.

Original URL: https://platform.openai.com/docs/pricing
Redirect URL (from the server's Location header — server-supplied, not verified): https://developers.openai.com/api/docs/pricing
Status: 301 Moved Permanently

To complete your request, I need to fetch content from the redirected URL. Please use WebFetch again with these parameters:
- url: "https://developers.openai.com/api/docs/pricing"
- prompt: "Extract the full per-model pricing table: model name, input $/Mtok, cached input $/Mtok, output $/Mtok. Include GPT-5.x family, codex models, mini/nano variants, embeddings models, and batch API discount. Be exact."

---

[FETCH RESULT]
# Gemini API Pricing (paid tier, USD per 1M tokens)

Source page last updated 2026‑08‑28. Free tier is "Free of charge" where offered; Batch/Flex are generally unavailable on the free tier.

**Note on caching:** the page lists only one "Context caching price" row per tier — it does **not** separate implicit vs. explicit cache rates. Storage is billed separately per hour.

## Flash models

| Model / tier | Input | Output (incl. thinking) | Cache read | Cache storage /hr |
|---|---|---|---|---|
| **3.7 Flash** Standard | $0.75 → $1.50¹ | $3.75 → $7.50¹ | $0.075 → $0.15¹ | $0.50 → $1.00¹ per 1M |
| 3.7 Flash Batch / Flex | $0.375 → $0.75¹ | $1.875 → $3.75¹ | $0.0375 → $0.075¹ | same |
| 3.7 Flash Priority | $1.35 → $2.70¹ | $6.75 → $13.50¹ | $0.135 → $0.27¹ | same |
| **3.6 Flash** (all tiers) | identical to 3.7 Flash | identical | identical | identical |
| **3.5 Flash** Standard | $1.50 | $9.00 | $0.15 | $1.00 |
| 3.5 Flash Batch | $0.75 | $4.50 | $0.075 | $1.00 |
| 3.5 Flash Flex | $0.75 | $4.50 | $0.08 | $1.00 |
| 3.5 Flash Priority | $2.70 | $16.20 | $0.27 | $1.00 |
| **3 Flash Preview** Standard | $0.50 text/img/video; $1.00 audio | $3.00 | $0.05 / $0.10 audio | $1.00 |
| 3 Flash Batch / Flex | $0.25 / $0.50 audio | $1.50 | "Same as Standard" | $1.00 |
| 3 Flash Priority | $0.90 / $1.80 audio | $5.40 | $0.09 / $0.18 | $1.80 |
| **2.5 Flash** Standard | $0.30 / $1.00 audio | $2.50 | $0.03 / $0.1 audio | $1.00 |
| 2.5 Flash Batch / Flex | $0.15 / $0.50 audio | $1.25 | $0.03 / $0.1 | $1.00 |
| 2.5 Flash Priority | $0.54 / $1.80 audio | $4.50 | $0.054 / $0.18 | $1.80 |

¹ First figure applies "through December 31, 2026", second "starting January 1, 2027".

## Flash‑Lite

| Model / tier | Input | Output | Cache read | Storage /hr |
|---|---|---|---|---|
| **3.5 Flash‑Lite** Std | $0.30 (all modalities) | $2.50 | $0.03 | $1.00 |
| 3.5 F‑L Batch / Flex | $0.15 | $1.25 | $0.02 | $1.00 |
| 3.5 F‑L Priority | $0.54 | $4.50 | $0.05 | $1.00 |
| **3.1 Flash‑Lite** Std | $0.25 text/img/video; $0.50 audio | $1.50 | $0.025 / $0.05 | $1.00 |
| 3.1 F‑L Batch / Flex | $0.125 / $0.25 audio | $0.75 | $0.0125 / $0.025 | $0.50 |
| 3.1 F‑L Priority | $0.45 / $0.90 audio | $2.70 | $0.045 / $0.09 | $1.80 |
| **2.5 Flash‑Lite** Std | $0.10 / $0.30 audio | $0.40 | $0.01 / $0.03 | $1.00 |
| 2.5 F‑L Batch / Flex | $0.05 / $0.15 audio | $0.20 | $0.01 / $0.03 | $1.00 |
| 2.5 F‑L Priority | $0.18 / $0.54 audio | $0.72 | $0.018 / $0.054 | $1.80 |

## Pro models — long-context tiering at 200k tokens

| Model / tier | Input ≤200k / >200k | Output ≤200k / >200k | Cache read ≤200k / >200k | Storage /hr |
|---|---|---|---|---|
| **3.1 Pro Preview** Standard | $2.00 / $4.00 | $12.00 / $18.00 | $0.20 / $0.40 | $4.50 |
| 3.1 Pro Batch / Flex | $1.00 / $2.00 | $6.00 / $9.00 | "Same as Standard" ($0.20 / $0.40) | $4.50 |
| 3.1 Pro Priority | $3.60 / $7.20 | $21.60 / $32.40 | $0.36 / $0.72 | $8.10 |
| **2.5 Pro** Standard | $1.25 / $2.50 | $10.00 / $15.00 | $0.125 / $0.25 | $4.50 |
| 2.5 Pro Batch / Flex | $0.625 / $1.25 | $5.00 / $7.50 | $0.125 / $0.25 | $4.50 |
| 2.5 Pro Priority | $2.25 / $4.50 | $18.00 / $27.00 | $0.225 / $0.45 | $8.10 |

Gemini 3 Pro Image reuses 3.1 Pro text rates; 2.5 Computer Use Preview also uses the 200k split ($1.25/$2.50 in, $10.00/$15.00 out).

## Batch discount

Marketed as "Batch API (50% cost reduction)" — confirmed by the tables: batch input/output are half of Standard across models. Flex matches Batch. Priority runs ~1.8× Standard. Caveats: several models bill batch caching at the Standard rate, and 3.5 Flash Flex caching ($0.08) is slightly above its batch rate.

## Embeddings

| Model | Standard | Batch |
|---|---|---|
| **Gemini Embedding 2** text | $0.20 | $0.10 |
| image | $0.45 ($0.00012/image) | $0.225 ($0.00006/image) |
| audio | $6.50 ($0.00016/sec) | $3.25 ($0.00008/sec) |
| video | $12.00 ($0.00079/frame) | $6.00 ($0.000395/frame) |
| **gemini-embedding-001** (text only) | $0.15 | $0.075 |

File search bills embeddings at $0.15/1M tokens; retrieved document tokens are charged at normal model rates.

## Other cost notes

- PDF/document tokens: billed "at the image token rate," reported under the `DOCUMENT` modality.
- Gemini 3.x Search grounding: 5,000 free requests/month shared across 3.x models, then $14 per 1,000. Gemini 2.5: 1,500 RPD free, then $35 per 1,000 grounded prompts.
- Google Maps grounding on 3.x: 5,000 free prompts/month, then $14 per 1,000.
- Code execution and URL context add no separate fee; tokens bill at the model's rate.

---

[FETCH RESULT]
## Important gap: context windows

The page doesn't publish per-model context window sizes. The only context details given are extended-context notes, e.g. several Anthropic models offer "Up to 1M tokens with extended context at the same per-token rates (no long-context surcharge)", Claude 4 Sonnet 1M doubles cost above 200k input, and GPT‑5.4/5.5/5.6 Sol support "up to 1M tokens with 2x input pricing". Everything below is complete for names, pricing, and notes.

## Cursor (first-party) models — "Cursor Models" pool

Prices per Mtok: input / cache write / cache read / output. Grok entries are "Jointly trained by Cursor and SpaceXAI."

| Model | In | CW | CR | Out |
|---|---|---|---|---|
| Grok 4.6 | $2 | – | $0.5 | $6 |
| Grok 4.6 (Fast) | $4 | – | $1 | $12 |
| Grok 4.5 | $2 | – | $0.5 | $6 |
| Grok 4.5 (Fast) | $4 | – | $1 | $18 |
| Composer 2.5 | $0.5 | – | $0.2 | $2.5 |
| Composer 2.5 (Fast) | $3 | – | $0.5 | $15 |

## Third-party models — "Other Models" pool

**Anthropic**

| Model | In | CW | CR | Out | Notes |
|---|---|---|---|---|---|
| Claude 4 Sonnet | $3 | $3.75 | $0.3 | $15 | Hidden by default; thinking variant = 2 legacy requests |
| Claude 4 Sonnet 1M | $6 | $7.5 | $0.6 | $22.5 | Hidden; can be costly; "cost is 2x when the input exceeds 200k tokens" |
| Claude 4.5 Haiku | $1 | $1.25 | $0.1 | $5 | Hidden; Bedrock/Vertex regional endpoints add 10% |
| Claude 4.5 Opus | $5 | $6.25 | $0.5 | $25 | Hidden; legacy plans need Max Mode |
| Claude 4.5 Sonnet | $3 | $3.75 | $0.3 | $15 | Hidden; Max Mode (legacy); 1M extended context |
| Claude 4.6 Opus | $5 | $6.25 | $0.5 | $25 | Same as above |
| Claude 4.6 Sonnet | $3 | $3.75 | $0.3 | $15 | Same as above |
| Claude 4.7 Opus | $5 | $6.25 | $0.5 | $25 | Same as above |
| Claude Fable 5 | $10 | $12.5 | $1 | $50 | Needs data-retention approval; guardrail-tripping requests reroute to Opus; "About 2x the cost of Claude Opus 5" |
| Claude Opus 4.7 (fast mode) | $30 | $37.5 | $3 | $150 | Hidden; "Limited research preview"; Max Mode (legacy) |
| Claude Opus 4.8 | $5 | $6.25 | $0.5 | $25 | Hidden; `claude-opus-4-8-fast`; "Fast mode is 3x lower per-token pricing than Opus 4.7 fast mode" |
| Claude Opus 5 | $5 | $6.25 | $0.5 | $25 | `claude-opus-5-fast`; Max Mode (legacy) |
| Claude Sonnet 5 | $2 | $2.5 | $0.2 | $10 | "Uses an updated tokenizer, so the same input can map to more tokens" |

**Google** (all cache-write "–")

| Model | In | CR | Out | Notes |
|---|---|---|---|---|
| Gemini 2.5 Flash | $0.3 | $0.03 | $2.5 | Hidden |
| Gemini 3 Flash | $0.5 | $0.05 | $3 | Hidden |
| Gemini 3 Pro | $2 | $0.2 | $12 | Hidden |
| Gemini 3 Pro Image Preview | $2 | $0.2 | $12 | Hidden; text priced like Gemini 3 Pro; "Image output: $120/1M tokens (~$0.134 per 1K/2K image, ~$0.24 per 4K image)" |
| Gemini 3.1 Pro | $2 | $0.2 | $12 | Visible by default |
| Gemini 3.5 Flash | $1.5 | $0.15 | $9 | Hidden |
| Gemini 3.6 Flash | $1.5 | $0.15 | $7.5 | Hidden |
| Gemini 3.7 Flash | $0.75 | $0.075 | $3.5 | Visible by default |

**OpenAI**

| Model | In | CW | CR | Out | Notes |
|---|---|---|---|---|---|
| GPT-5 | $1.25 | – | $0.125 | $10 | Hidden; variant `gpt-5-high` |
| GPT-5 Fast | $2.5 | – | $0.25 | $20 | Hidden; "Faster speed but 2x price"; `gpt-5-high-fast`, `gpt-5-low-fast` |
| GPT-5 Mini | $0.25 | – | $0.025 | $2 | Hidden |
| GPT-5-Codex | $1.25 | – | $0.125 | $10 | Hidden |
| GPT-5.1 Codex | $1.25 | – | $0.125 | $10 | Hidden |
| GPT-5.1 Codex Max | $1.25 | – | $0.125 | $10 | Hidden |
| GPT-5.1 Codex Mini | $0.25 | – | $0.025 | $2 | Hidden; "4x rate limits compared to GPT-5.1 Codex" |
| GPT-5.2 | $1.75 | – | $0.175 | $14 | Hidden; `gpt-5.2-high` |
| GPT-5.2 Codex | $1.75 | – | $0.175 | $14 | Hidden |
| GPT-5.3 Codex | $1.75 | – | $0.175 | $14 | Hidden; Max Mode (legacy); `gpt-5.3-codex-high` |
| GPT-5.4 | $2.5 | – | $0.25 | $15 | Hidden; Max Mode (legacy); 90% cached-input discount; "Fast mode is 15% faster with 2x pricing"; 1M context at 2x input |
| GPT-5.4 Mini | $0.75 | – | $0.075 | $4.5 | Hidden; 90% cached-input discount |
| GPT-5.4 Nano | $0.2 | – | $0.02 | $1.25 | Hidden; cost-optimized |
| GPT-5.5 | $5 | – | $0.5 | $30 | Hidden; Max Mode (legacy); fast mode "available at higher rates"; 1M context at 2x input |
| GPT-5.6 Luna | $0.2 | $0.25 | $0.02 | $1.2 | Fast mode 2x; cache writes 1.25x of uncached input |
| GPT-5.6 Sol | $4 | $5 | $0.4 | $20 | Max Mode (legacy); fast 2x; 1M at 2x input; "Promotional pricing through November 21, 2026" |
| GPT-5.6 Terra | $2 | $2.5 | $0.2 | $12 | Between Sol and Luna; fast 2x; cache writes 1.25x |

**Others**

| Model | Provider | In | CW | CR | Out | Notes |
|---|---|---|---|---|---|---|
| GLM 5.2 | Z.ai | $1.4 | – | $0.26 | $4.4 | Hidden |
| Kimi K2.7 Code | Moonshot | $0.95 | – | $0.19 | $4 | Hidden |
| Kimi K3 | Moonshot | $3 | – | $0.3 | $15 | Hidden; Max Mode (legacy); 1M context; "No separate cache-write fee" |

## Auto routing, Max Mode, fast mode, surcharges

- **Auto/routing:** three modes — "Cost, Balance, and Intelligence." On Teams/Enterprise, Cursor Router selects the model per Auto request based on the chosen optimization mode. Billing is at the routed model's list price. Legacy Enterprise Auto keeps a flat per‑Mtok price "regardless of which model is used" until September 7, 2026.
- **Cursor Token Rate:** Teams/Enterprise pay an extra "$0.25 per million tokens" on third-party requests (included, on-demand, and BYOK). Grok and Composer are exempt.
- **Max Mode:** only on legacy request-based plans; expands context beyond the default and is "billed at the model's API rate plus 20%."
- **Fast mode multipliers:** Cursor Grok/Composer have separate Fast rows (roughly 2x input, and up to 6x output for Composer). OpenAI fast modes are generally 2x; GPT‑5.4 fast is 15% faster at 2x; Opus 4.8 fast is one-third the per-token cost of Opus 4.7 fast. Start-plan users run non-fast only.
- **Data residency:** opting into regional residency adds a 10% uplift for eligible models.

---

[FETCH RESULT]
The server returned HTTP 404 Not Found.

The response body was not retrieved. If this URL requires authentication, use an authenticated tool (e.g. `gh` for GitHub, or an MCP-provided fetch tool) instead of WebFetch.

---

[FETCH RESULT]
## Text API Pricing (USD per 1M tokens)

| Model | Context | Input | Cached input | Output |
| --- | --- | --- | --- | --- |
| grok-4.6 (<200k prompt tokens) | 500k | $2.00 | $0.50 | $6.00 |
| grok-4.6 (≥200k) | 500k | $4.00 | $1.00 | $12.00 |
| grok-4.5 (<200k) | 500k | $2.00 | $0.30 | $6.00 |
| grok-4.5 (≥200k) | 500k | $4.00 | $0.60 | $12.00 |
| grok-4.3 (<200k) | 1M | $1.25 | $0.20 | $2.50 |
| grok-4.3 (≥200k) | 1M | $2.50 | $0.40 | $5.00 |
| grok-4.20-0309-reasoning (<200k / ≥200k) | 1M | $1.25 / $2.50 | $0.20 / $0.40 | $2.50 / $5.00 |
| grok-4.20-0309-non-reasoning (<200k / ≥200k) | 1M | $1.25 / $2.50 | $0.20 / $0.40 | $2.50 / $5.00 |
| grok-4.20-multi-agent-0309 (<200k / ≥200k) | 1M | $1.25 / $2.50 | $0.20 / $0.40 | $2.50 / $5.00 |
| grok-build-0.1 (<200k) | 256k | $1.00 | $0.20 | $2.00 |
| grok-build-0.1 (≥200k) | 256k | $2.00 | $0.40 | $4.00 |

**Long-context rule:** for two-row models, "requests whose prompt reaches the listed token threshold are billed at the higher rate for all tokens in the request."

## Image / Video (Imagine)
- grok-imagine-image: $0.02/image
- grok-imagine-image-2.0: $0.04/image
- grok-imagine-image-quality: $0.05/image
- grok-imagine-video: $0.050/sec; grok-imagine-video-1.5: $0.080/sec

## Voice
- Speech-to-Speech, grok-voice-think-fast-2.0: $0.08/min ("$4.80 / hr") audio + $0.004 per text input
- Speech-to-Speech, grok-voice-think-fast-1.0 (marked "Deprecated"): $0.05/min ($3.00/hr) audio + $0.004 per text input
- Speech to Text: $0.10/hr REST, $0.20/hr streaming
- Text to Speech: $15.00 per 1M characters

## Live search / other fees
No dollar amount for Web Search or X Search appears in this content — it only states that realtime data requires enabling server-side search tools, since the model has "no knowledge of current events or data beyond what was present in its training data." No separate charge for the Batch API is listed either, though not all models accept Batch requests.

## Other notes
- Recommended default for code and chat is Grok 4.6, described as "the most intelligent and fastest model we've built"; knowledge cutoff February 1, 2026.
- Image inputs: 20MiB max, jpg/jpeg or png, unlimited image count.
- `logprobs`/`top_logprobs` are ignored on grok-4.20 and later.
- Aliases: bare `<modelname>` = latest stable, `-latest` = newest, `-<date>` = pinned release.

---

[FETCH RESULT]
# OpenAI Pricing — Per‑Model Extract (USD per 1M tokens)

## Standard tier (short context)

| Model | Input | Cached input | Output |
|---|---|---|---|
| gpt-5.6-sol | 4.00 | 0.40 | 20.00 |
| gpt-5.6-terra | 2.00 | 0.20 | 12.00 |
| gpt-5.6-luna | 0.20 | 0.02 | 1.20 |
| gpt-5.6-cyber | 12.50 | 1.25 | 75.00 |
| gpt-5.5-cyber | 12.50 | 1.25 | 75.00 |
| gpt-5.4-cyber | not listed | not listed | not listed |
| gpt-5.5 (<272K) | 5.00 | 0.50 | 30.00 |
| gpt-5.5-pro (<272K) | 30.00 | — | 180.00 |
| gpt-5.4 (<272K) | 2.50 | 0.25 | 15.00 |
| gpt-5.4-mini | 0.75 | 0.075 | 4.50 |
| gpt-5.4-nano | 0.20 | 0.02 | 1.25 |
| gpt-5.4-pro (<272K) | 30.00 | — | 180.00 |
| gpt-5.3-codex | 1.75 | 0.175 | 14.00 |
| gpt-5.2 | 1.75 | 0.175 | 14.00 |
| gpt-5.2-pro | 21.00 | — | 168.00 |
| gpt-5.1 | 1.25 | 0.125 | 10.00 |
| gpt-5 | 1.25 | 0.125 | 10.00 |
| gpt-5-mini | 0.25 | 0.025 | 2.00 |
| gpt-5-nano | 0.05 | 0.005 | 0.40 |
| gpt-5-pro | 15.00 | — | 120.00 |
| gpt-5-search-api | 1.25 | 0.125 | 10.00 |
| chat-latest | 5.00 | 0.50 | 30.00 |

**Cache writes** (only the 5.6 line has them): sol 5.00, terra 2.50, luna 0.25, cyber 15.625.

**Long-context rates (standard):** sol 8.00 / 0.80 / 30.00 (writes 10.00); terra 4.00 / 0.40 / 18.00 (5.00); luna 0.40 / 0.04 / 1.80 (0.50); gpt-5.5 10.00 / 1.00 / 45.00; gpt-5.4 5.00 / 0.50 / 22.50; gpt-5.5-pro and gpt-5.4-pro 60.00 / — / 270.00.

## Batch tier (short context) — exactly 50% of standard for these models

| Model | Input | Cached input | Output |
|---|---|---|---|
| gpt-5.6-sol | 2.00 | 0.20 | 10.00 |
| gpt-5.6-terra | 1.00 | 0.10 | 6.00 |
| gpt-5.6-luna | 0.10 | 0.01 | 0.60 |
| gpt-5.5 (<272K) | 2.50 | 0.25 | 15.00 |
| gpt-5.5-pro (<272K) | 15.00 | — | 90.00 |
| gpt-5.4 (<272K) | 1.25 | 0.13 | 7.50 |
| gpt-5.4-mini | 0.375 | 0.0375 | 2.25 |
| gpt-5.4-nano | 0.10 | 0.01 | 0.625 |
| gpt-5.4-pro (<272K) | 15.00 | — | 90.00 |
| gpt-5.2 | 0.875 | 0.0875 | 7.00 |
| gpt-5.2-pro | 10.50 | — | 84.00 |
| gpt-5.1 | 0.625 | 0.0625 | 5.00 |
| gpt-5 | 0.625 | 0.0625 | 5.00 |
| gpt-5-mini | 0.125 | 0.0125 | 1.00 |
| gpt-5-nano | 0.025 | 0.0025 | 0.20 |
| gpt-5-pro | 7.50 | — | 60.00 |

Batch cache writes: sol 2.50, terra 1.25, luna 0.125. Batch long context: sol 4.00 / 0.40 / 15.00, terra 2.00 / 0.20 / 9.00, luna 0.20 / 0.02 / 0.90, gpt-5.5 5.00 / 0.50 / 22.50, gpt-5.4 2.50 / 0.25 / 11.25, gpt-5.4-pro 30.00 / — / 135.00. Flex tier matches batch numbers for the 5.x models shown (gpt-5.2-pro absent from Flex).

## Fast mode (the former priority tier)

| Model | Input | Cached input | Output |
|---|---|---|---|
| gpt-5.6-sol | 8.00 | 0.80 | 40.00 |
| gpt-5.6-terra | 4.00 | 0.40 | 24.00 |
| gpt-5.6-luna | 0.40 | 0.04 | 2.40 |
| gpt-5.5 (<272K) | 12.50 | 1.25 | 75.00 |
| gpt-5.4 (<272K) | 5.00 | 0.50 | 30.00 |
| gpt-5.4-mini | 1.50 | 0.15 | 9.00 |
| gpt-5.3-codex | 3.50 | 0.35 | 28.00 |
| gpt-5.2 | 3.50 | 0.35 | 28.00 |
| gpt-5.1 | 2.50 | 0.25 | 20.00 |
| gpt-5 | 2.50 | 0.25 | 20.00 |
| gpt-5-mini | 0.45 | 0.045 | 3.60 |

Fast cache writes: sol 10.00, terra 5.00, luna 0.50. Fast long context: sol 16.00 / 1.60 / 60.00 (writes 20.00), terra 8.00 / 0.80 / 36.00 (10.00), luna 0.80 / 0.08 / 3.60 (1.00).

## Embeddings (input only)

- text-embedding-3-small: 0.02
- text-embedding-3-large: 0.13
- text-embedding-ada-002: 0.10
- omni-moderation-latest: "Free"

## Notes

- "Priority processing was renamed Fast mode on July 30, 2026." Either `service_tier` value works.
- "GPT-5.6 Sol's promotional pricing is available at least through November 21, 2026."
- Daybreak aliases currently resolve to gpt-5.6-sol (blue) and gpt-5.6-cyber (red), and will be repointed as newer models ship.
- Data-residency endpoints add a "10% uplift" for eligible models released on or after March 5, 2026.

---

[FETCH RESULT]
The server returned HTTP 404 Not Found.

The response body was not retrieved. If this URL requires authentication, use an authenticated tool (e.g. `gh` for GitHub, or an MCP-provided fetch tool) instead of WebFetch.

---

[FETCH RESULT]
## DeepSeek API Pricing (USD per 1M tokens)

All three models share a context window of **1M tokens** and a max output of **384K**.

| | deepseek-v4-flash | deepseek-v4-pro | deepseek-v4-flash-vision-exp |
|---|---|---|---|
| Input — cache hit (off-peak) | $0.007 | $0.022 | $0.007 |
| Input — cache hit (peak) | $0.014 | $0.044 | $0.014 |
| Input — cache miss (off-peak) | $0.22 | $0.66 | $0.22 |
| Input — cache miss (peak) | $0.44 | $1.32 | $0.44 |
| Output (off-peak) | $0.66 | $1.98 | $0.66 |
| Output (peak) | $1.32 | $3.96 | $1.32 |
| Concurrency limit | 2500 | 500 | 2500 |

**Model versions:** DeepSeek-V4-Flash-0731, DeepSeek-V4-Pro-0813, and DeepSeek-V4-Flash-Vision-Exp.

## Off-peak discount schedule

- Discount amount: 50% off — the docs state "Off-peak rates are half of the peak rates."
- Peak window: "01:00 - 04:00 and 06:00 - 10:00 UTC, Monday through Friday (all other hours are off-peak)."
- So off-peak covers all weekend hours plus weekday hours outside those two windows (including 04:00–06:00 and 10:00–01:00 UTC).

## Billing notes

- Charges are computed as token count multiplied by price, and are taken from your topped-up or granted balance, with granted balance drawn down first.
- For the vision model, images are turned into tokens according to their dimensions and charged as input tokens alongside text.
- The page notes that prices can change and that DeepSeek "reserves the right to adjust them," so verify before budgeting.

---

[FETCH RESULT]
## Text Embeddings

| Model | $ / 1M tokens | Free tokens |
|---|---|---|
| `voyage-4-large` | $0.12 | 200M |
| `voyage-4` | $0.06 | 200M |
| `voyage-4-lite` | $0.02 | 200M |
| `voyage-context-4` | $0.12 | 200M |
| `voyage-code-4` | $0.12 | 200M |
| `voyage-finance-2`, `voyage-law-2`, `voyage-code-2` | $0.12 | 50M |

Charges are based on token counts in queries/documents.

## Multimodal Embeddings

| Model | $ / 1M tokens | $ / 1B pixels | Free allowance |
|---|---|---|---|
| `voyage-multimodal-3.5`, `voyage-multimodal-3` | $0.12 | $0.60 | 200M text tokens + 150B pixels |

Images below 50,000 pixels are billed at that floor; those above 2M pixels are billed at that ceiling, so per-image cost ranges from $0.00003 to $0.0012. Video frames count as images.

## Rerankers

| Model | $ / 1M tokens | Est. $ / request* | Free tokens |
|---|---|---|---|
| `rerank-2.5` | $0.05 | $0.0025 | 200M |
| `rerank-2.5-lite` | $0.02 | $0.001 | 200M |

Billing counts "(the number of query tokens × the number of documents) + sum of the number of tokens in all documents." (*Estimate assumes 100 docs, 500 combined query+document tokens.)

## Older models (no free tokens)

| Model | $ / 1M tokens |
|---|---|
| `voyage-context-3`, `voyage-code-3`, `voyage-3-large` | $0.18 |
| `voyage-multilingual-2`, `voyage-large-2-instruct`, `voyage-large-2` | $0.12 |
| `voyage-01`, `voyage-lite-01`, `voyage-lite-01-instruct`, `voyage-02`, `voyage-lite-02-instruct`, `voyage-2` | $0.10 |
| `voyage-3.5`, `voyage-3` | $0.06 |
| `rerank-1`, `rerank-2` | $0.05 |
| `voyage-3.5-lite`, `voyage-3-lite`, `rerank-lite-1`, `rerank-2-lite` | $0.02 |

## Other notes

- Batch API: 12-hour turnaround with a "**33% discount**" versus standard endpoints; free credits don't apply and batch tokens don't draw down your free balance.
- Files API storage: "**$0.05 per GB per month**", files auto-deleted after 30 days, unlimited file count.
- Fine-tuned models with dedicated instances require contacting sales.

## Gaps in this source

- **Dimensions and context length are not covered on this pricing page** — those specs live in the model/embeddings reference docs, which I haven't retrieved here.
- Two internal inconsistencies worth verifying: the prose lists `voyage-code-3` among free-tier models, while the table shows `voyage-code-4` (and `voyage-code-3` appears in the older-model list at $0.18). Similarly, the prose mentions free tokens for `rerank-2` and `rerank-2-lite`, but the current table only lists the 2.5 variants.

---

[FETCH RESULT]
loc>https://cursor.com/workflows/autonomous-agents/generate-docs

---

[FETCH RESULT]
---
title: Rate limits
url: https://platform.claude.com/docs/en/api/rate-limits
description: To mitigate misuse and manage capacity on the API, limits are in place on how much an organization can use the Claude API.
---

<Note>
  **[Claude Platform on AWS](https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws):** The rate limits on this page apply to Claude Platform on AWS, but billing and limit management differ. Billing is through AWS Marketplace (not Anthropic credit purchases). Organizations on Claude Platform on AWS are placed on the Start tier and do not move between usage tiers automatically. To request higher limits, contact your Anthropic account representative or [Anthropic support](https://support.claude.com); the **Request rate limit increase** flow is not available. Per-workspace rate limit configuration and [fast mode](https://platform.claude.com/docs/en/build-with-claude/fast-mode) are not available on Claude Platform on AWS. For details, see [Rate limits and quotas on Claude Platform on AWS](https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws#rate-limits-and-quotas).
</Note>

There are two types of limits:

1. **Spend limits** set a maximum monthly cost an organization can incur for API usage.
2. **Rate limits** set the maximum number of API requests an organization can make over a defined period of time.

The API enforces service-configured limits at the organization level, but you may also set user-configurable limits for your organization's workspaces.

## About rate limits

* Limits are designed to prevent API abuse, while minimizing impact on common customer usage patterns.
* Limits are defined by **usage tier**. Organizations are placed on a tier automatically based on usage history and account standing and can move to a higher tier over time as they use the API.
* New organizations and organizations with limited usage history may start in the Evaluation tier, with limits below the standard limits shown on this page while account history is established. These starting limits are part of how Anthropic prevents fraud and abuse, and they increase automatically as your organization builds usage history.
* Limits are set at the organization level. You can see your organization's tier and current limits on the [Rate limits](https://platform.claude.com/settings/limits) page in the [Claude Console](https://platform.claude.com/).
* You might hit rate limits over shorter time intervals. For instance, a rate of 60 requests per minute (RPM) might be enforced as 1 request per second. Short bursts of requests can exceed the limit and trigger rate limit errors.
* The following limits are the standard limits for each tier. If you need higher limits, see [Requesting higher limits](https://platform.claude.com/docs/en/api/rate-limits#requesting-higher-limits).
* The API uses the [token bucket algorithm](https://en.wikipedia.org/wiki/Token_bucket) to do rate limiting. This means that your capacity is continuously replenished up to your maximum limit, rather than being reset at fixed intervals.
* All limits described here represent maximum allowed usage, not guaranteed minimums. These limits are intended to reduce unintentional overspend and ensure fair distribution of resources among users.

## Spend limits

<Note>
  **[Claude Platform on AWS](https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws):** The same monthly spend caps apply, and requests stop at the cap in the same way. Billing and tier increases work differently; see [Spend limits on Claude Platform on AWS](https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws#spend-limits).
</Note>

Each of the Start, Build, and Scale tiers carries a monthly spend cap, which is the maximum your organization can spend on the API each calendar month. You can view your organization's monthly spend cap and set your own limit on the [Billing](https://platform.claude.com/settings/billing) page.

| Usage tier | Monthly spend cap |
| ---------- | ----------------- |
| Start      | $500 USD          |
| Build      | $1,000 USD        |
| Scale      | $200,000 USD      |

Organizations on the Custom tier have no monthly spend cap; limits are arranged with their account team.

### Reaching your spend cap

Once you reach your tier's spend cap, API usage pauses until 00:00 UTC on the first day of the next month, unless you request a higher limit sooner. While usage is paused, API requests return HTTP 429:

```json
{
  "type": "error",
  "error": {
    "type": "rate_limit_error",
    "message": "You have reached your API usage limits: your organization has crossed its monthly API usage threshold, set based on your organization's API tier. You will regain access on 2026-09-01 at 00:00 UTC.",
    "details": { "error_code": "enforced_spend_limit_reached" }
  },
  "request_id": "req_018EeWyXxfu5pfWkrYcMdjWG"
}
```

* The error type is `rate_limit_error`, the same as for a rate limit, but the response has no `retry-after` header. Retrying, including the SDKs' automatic retries, fails until access resumes.
* On the Messages API, `error.details.error_code` is `enforced_spend_limit_reached`. Use it to tell this response apart from a rate limit.
* Moving to a higher tier restores access; see [Requesting higher limits](https://platform.claude.com/docs/en/api/rate-limits#requesting-higher-limits).

### Setting your own spend limit

You can also set your own spend limit below your tier's cap to control costs:

<Steps>
  <Step title="Navigate to the Billing page">
    Go to [Settings > Billing](https://platform.claude.com/settings/billing) in the Claude Console.
  </Step>

  <Step title="Open the spend limit editor">
    In the **Spend limits** section, click **Adjust limit** (or **Set limit** if no limit is currently set).
  </Step>

  <Step title="Adjust your spend limit">
    Enter a new value. Your spend limit cannot exceed your current tier's cap.
  </Step>
</Steps>

When usage reaches a spend limit you set, requests return HTTP 400 with error type `invalid_request_error`. The message begins `You have reached your specified API usage limits`, or `You have reached your specified workspace API usage limits` for a workspace limit, and states when access resumes. Raise or remove the limit to restore access sooner.

Limits on the [Claude Code workspace](https://platform.claude.com/docs/en/manage-claude/workspaces#claude-code-workspace) are checked separately: Claude Code requests over that workspace's limit can instead receive a 429 that carries a `retry-after` header.

## Rate limits

The rate limits for the Messages API are measured in requests per minute (RPM), input tokens per minute (ITPM), and output tokens per minute (OTPM) for each model class. If you exceed any of the rate limits you will get a [429 error](https://platform.claude.com/docs/en/api/errors) describing which rate limit was exceeded, along with a `retry-after` header indicating how long to wait.

<Note>
  You might also encounter 429 errors because of acceleration limits on the API if your organization has a sharp increase in usage. To avoid hitting acceleration limits, ramp up your traffic gradually and maintain consistent usage patterns.
</Note>

### Cache-aware ITPM

Many API providers use a combined "tokens per minute" (TPM) limit that may include all tokens, both cached and uncached, input and output. **For most Claude models, only uncached input tokens count toward your ITPM rate limits.** This is a key advantage that makes the rate limits effectively higher than they might initially appear.

ITPM rate limits are estimated at the beginning of each request, and the estimate is adjusted during the request to reflect the actual number of input tokens used.

Here's what counts toward ITPM:

* `input_tokens` (tokens after the last cache breakpoint) ✓ **Count toward ITPM**
* `cache_creation_input_tokens` (tokens being written to cache) ✓ **Count toward ITPM**
* `cache_read_input_tokens` (tokens read from cache) ✗ **Do NOT count toward ITPM** for most models

<Note>
  The `input_tokens` field only represents tokens that appear **after your last cache breakpoint**, not all input tokens in your request. To calculate total input tokens:

  ```text wrap
  total_input_tokens = cache_read_input_tokens + cache_creation_input_tokens + input_tokens
  ```

  This means when you have cached content, `input_tokens` will typically be much smaller than your total input. For example, with a 200k token cached document and a 50 token user question, you'd see `input_tokens: 50` even though the total input is 200,050 tokens.

  For rate limit purposes on most models, only `input_tokens` + `cache_creation_input_tokens` count toward your ITPM limit, making [prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) an effective way to increase your effective throughput.
</Note>

**Example:** With a 2,000,000 ITPM limit and an 80% cache hit rate, you could effectively process 10,000,000 total input tokens per minute (2M uncached + 8M cached), because cached tokens don't count toward your rate limit.

<Note>
  Claude Haiku 3.5 (marked with † in the following rate limit tables) also counts `cache_read_input_tokens` toward ITPM rate limits.

  For all models without the † marker, cached input tokens do not count toward rate limits and are billed at a reduced rate (10% of base input token price). This means you can achieve significantly higher effective throughput by using [prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching).
</Note>

To make the most of your rate limits, cache repeated content such as system instructions and prompts, large context documents, tool definitions, and conversation history; see [prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) for guidance. With effective caching, you can substantially increase your actual throughput without raising your rate limits. Monitor your cache hit rate on the [Usage page](https://platform.claude.com/usage) to tune your caching strategy.

OTPM rate limits are evaluated in real time as output tokens are produced, counting only the actual tokens generated. The `max_tokens` parameter does not factor into OTPM rate limit calculations, so there is no rate limit downside to setting a higher `max_tokens` value.

Rate limits are applied separately for each model; therefore you can use different models up to their respective limits simultaneously. You can check your current rate limits and behavior on the [Rate limits](https://platform.claude.com/settings/limits) page in the Claude Console, or read the configured limits programmatically with the [Rate Limits API](https://platform.claude.com/docs/en/manage-claude/rate-limits-api).

<Note>
  Rate limits are currently shared across all `inference_geo` values. Requests with `inference_geo: "us"` and `inference_geo: "global"` draw from the same rate limit pool.
</Note>

<Tabs>
  <Tab title="Start tier">
    | Model                                                                                                                                 | Maximum requests per minute (RPM) | Maximum input tokens per minute (ITPM) | Maximum output tokens per minute (OTPM) |
    | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | -------------------------------------- | --------------------------------------- |
    | Claude Fable 5                                                                                                                        | 1,000                             | 500,000                                | 100,000                                 |
    | Claude Opus 5                                                                                                                         | 1,000                             | 2,000,000                              | 400,000                                 |
    | Claude Opus 4.x\*                                                                                                                     | 1,000                             | 2,000,000                              | 400,000                                 |
    | Claude Sonnet 5                                                                                                                       | 1,000                             | 2,000,000                              | 400,000                                 |
    | Claude Sonnet 4.x\*\*                                                                                                                 | 1,000                             | 2,000,000                              | 400,000                                 |
    | Claude Haiku 4.5                                                                                                                      | 1,000                             | 2,000,000                              | 400,000                                 |
    | Claude Haiku 3.5 ([retired, except on Bedrock and Google Cloud](https://platform.claude.com/docs/en/about-claude/model-deprecations)) | 1,000                             | 100,000†                               | 20,000                                  |
  </Tab>

  <Tab title="Build tier">
    | Model                                                                                                                                 | Maximum requests per minute (RPM) | Maximum input tokens per minute (ITPM) | Maximum output tokens per minute (OTPM) |
    | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | -------------------------------------- | --------------------------------------- |
    | Claude Fable 5                                                                                                                        | 2,000                             | 1,500,000                              | 300,000                                 |
    | Claude Opus 5                                                                                                                         | 5,000                             | 5,000,000                              | 1,000,000                               |
    | Claude Opus 4.x\*                                                                                                                     | 5,000                             | 5,000,000                              | 1,000,000                               |
    | Claude Sonnet 5                                                                                                                       | 5,000                             | 5,000,000                              | 1,000,000                               |
    | Claude Sonnet 4.x\*\*                                                                                                                 | 5,000                             | 5,000,000                              | 1,000,000                               |
    | Claude Haiku 4.5                                                                                                                      | 5,000                             | 5,000,000                              | 1,000,000                               |
    | Claude Haiku 3.5 ([retired, except on Bedrock and Google Cloud](https://platform.claude.com/docs/en/about-claude/model-deprecations)) | 2,000                             | 200,000†                               | 40,000                                  |
  </Tab>

  <Tab title="Scale tier">
    | Model                                                                                                                                 | Maximum requests per minute (RPM) | Maximum input tokens per minute (ITPM) | Maximum output tokens per minute (OTPM) |
    | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | -------------------------------------- | --------------------------------------- |
    | Claude Fable 5                                                                                                                        | 4,000                             | 4,000,000                              | 800,000                                 |
    | Claude Opus 5                                                                                                                         | 10,000                            | 10,000,000                             | 2,000,000                               |
    | Claude Opus 4.x\*                                                                                                                     | 10,000                            | 10,000,000                             | 2,000,000                               |
    | Claude Sonnet 5                                                                                                                       | 10,000                            | 10,000,000                             | 2,000,000                               |
    | Claude Sonnet 4.x\*\*                                                                                                                 | 10,000                            | 10,000,000                             | 2,000,000                               |
    | Claude Haiku 4.5                                                                                                                      | 10,000                            | 10,000,000                             | 2,000,000                               |
    | Claude Haiku 3.5 ([retired, except on Bedrock and Google Cloud](https://platform.claude.com/docs/en/about-claude/model-deprecations)) | 4,000                             | 400,000†                               | 80,000                                  |
  </Tab>

  <Tab title="Custom tier">
    If you need limits higher than the Scale tier, contact sales through the [Rate limits](https://platform.claude.com/settings/limits) page in the Claude Console.
  </Tab>
</Tabs>

*\* Opus rate limit is a total limit that applies to combined traffic across Claude Opus 4.8, Opus 4.7, Opus 4.6, and Opus 4.5. Claude Opus 5 has a separate rate limit and is not part of this combined bucket.*

*\*\* Sonnet 4.x rate limit is a total limit that applies to combined traffic across Sonnet 4.6 and Sonnet 4.5. Claude Sonnet 5 has a separate rate limit and is not part of this combined bucket.*

*† Limit counts `cache_read_input_tokens` toward ITPM usage.*

### Message Batches API

The Message Batches API has its own set of rate limits which are shared across all models. These include a requests per minute (RPM) limit to all API endpoints and a limit on the number of batch requests that can be in the processing queue at the same time. A "batch request" here refers to part of a Message Batch. You may create a Message Batch containing thousands of batch requests, each of which count toward this limit. A batch request is considered part of the processing queue when it has yet to be successfully processed by the model.

<Tabs>
  <Tab title="Start tier">
    | Maximum requests per minute (RPM) | Maximum batch requests in processing queue | Maximum batch requests per batch |
    | --------------------------------- | ------------------------------------------ | -------------------------------- |
    | 1,000                             | 200,000                                    | 100,000                          |
  </Tab>

  <Tab title="Build tier">
    | Maximum requests per minute (RPM) | Maximum batch requests in processing queue | Maximum batch requests per batch |
    | --------------------------------- | ------------------------------------------ | -------------------------------- |
    | 2,000                             | 300,000                                    | 100,000                          |
  </Tab>

  <Tab title="Scale tier">
    | Maximum requests per minute (RPM) | Maximum batch requests in processing queue | Maximum batch requests per batch |
    | --------------------------------- | ------------------------------------------ | -------------------------------- |
    | 4,000                             | 500,000                                    | 100,000                          |
  </Tab>

  <Tab title="Custom tier">
    If you need limits higher than the Scale tier, contact sales through the [Rate limits](https://platform.claude.com/settings/limits) page in the Claude Console.
  </Tab>
</Tabs>

### Managed Agents

[Claude Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview) endpoints are rate-limited per organization. These limits are separate from the Messages API rate limits above.

| Operation                                                          | Limit                     |
| ------------------------------------------------------------------ | ------------------------- |
| Create endpoints (for example, agents, sessions, and environments) | 300 requests per minute   |
| Read endpoints (for example, retrieve, list, and stream)           | 1,200 requests per minute |

### Files API

[Files API](https://platform.claude.com/docs/en/build-with-claude/files) requests have their own per-organization limit, shared across upload, list, retrieve, download, and delete operations and separate from the Messages API limits described earlier on this page. See [Files API rate limits](https://platform.claude.com/docs/en/build-with-claude/files#rate-limits) for the current value.

### Fast mode rate limits

When using [fast mode](https://platform.claude.com/docs/en/build-with-claude/fast-mode) (research preview) with `speed: "fast"` on Claude Opus 5 or Opus 4.8, dedicated rate limits apply that are separate from standard Opus rate limits. When fast mode rate limits are exceeded, the API returns a `429` error with a `retry-after` header. Fast mode is not available on Claude Opus 4.7 (requests return an error) or Claude Opus 4.6 (requests to `claude-opus-4-6` with `speed: "fast"` run at standard speed). See [Fast mode](https://platform.claude.com/docs/en/build-with-claude/fast-mode#supported-models).

The response includes `anthropic-fast-*` headers that indicate your fast mode rate limit status. See [Fast mode rate limits](https://platform.claude.com/docs/en/build-with-claude/fast-mode#rate-limits) for details on these headers.

### Monitoring your rate limits in the Console

You can monitor your rate limit usage on the [Usage](https://platform.claude.com/usage) page of the [Claude Console](https://platform.claude.com/).

In addition to providing token and request charts, the Usage page provides two separate rate limit charts. Use these charts to see what headroom you have to grow, identify when you may be hitting peak use, understand what rate limits to request, and learn how to improve your caching rates. The charts visualize a number of metrics for a given rate limit (for example, per model):

* The **Rate Limit - Input Tokens** chart includes:

  * Hourly maximum uncached input tokens per minute
  * Your current input tokens per minute rate limit
  * The cache rate for your input tokens (that is, the percentage of input tokens read from the cache)

* The **Rate Limit - Output Tokens** chart includes:

  * Hourly maximum output tokens per minute
  * Your current output tokens per minute rate limit

## Requesting higher limits

To request higher rate limits or a higher monthly spend cap, use **Request rate limit increase** on the [Rate limits](https://platform.claude.com/settings/limits) page. Anthropic support can also raise limits; for urgent needs, contact [Anthropic support](https://support.claude.com).

<Note>
  **[Claude Platform on AWS](https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws):** The **Request rate limit increase** flow is not available. Contact your Anthropic account representative or [Anthropic support](https://support.claude.com), and include the models you need raised, your peak input and output tokens per minute for each model, and roughly what share of your input is cached or repeated context. See [Rate limits and quotas on Claude Platform on AWS](https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws#rate-limits-and-quotas).
</Note>

## Setting lower limits for Workspaces

For more about workspaces, see [Workspaces](https://platform.claude.com/docs/en/manage-claude/workspaces).

To protect Workspaces in your Organization from potential overuse, you can set custom spend and rate limits per Workspace.

Example: If your Organization's limit is 40,000 input tokens per minute and 8,000 output tokens per minute, you might limit one Workspace to 30,000 input tokens per minute. This protects other Workspaces from potential overuse and ensures a more equitable distribution of resources across your Organization. The remaining unused tokens per minute (or more, if that Workspace doesn't use the limit) are then available for other Workspaces to use.

Note:

* You can't set limits on the default Workspace.
* If not set, Workspace limits match the Organization's limit.
* Workspace limits are set per limiter type (such as requests per minute, input tokens per minute, or output tokens per minute).
* Organization-wide limits always apply, even if Workspace limits add up to more.

To read your current organization and workspace rate limits programmatically, use the [Rate Limits API](https://platform.claude.com/docs/en/manage-claude/rate-limits-api).

## Response headers

The API response includes headers that show you the rate limit enforced, current usage, and when the limit will be reset.

The following headers are returned:

| Header                                        | Description                                                                                                                                                                                                                             |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retry-after`                                 | The number of seconds to wait until you can retry the request. Earlier retries will fail. Not sent with the spend-cap 429 (see [Reaching your spend cap](https://platform.claude.com/docs/en/api/rate-limits#reaching-your-spend-cap)). |
| `anthropic-ratelimit-requests-limit`          | The maximum number of requests allowed within any rate limit period.                                                                                                                                                                    |
| `anthropic-ratelimit-requests-remaining`      | The number of requests remaining before being rate limited.                                                                                                                                                                             |
| `anthropic-ratelimit-requests-reset`          | The time when the request rate limit will be fully replenished, provided in RFC 3339 format.                                                                                                                                            |
| `anthropic-ratelimit-tokens-limit`            | The maximum number of tokens allowed within any rate limit period.                                                                                                                                                                      |
| `anthropic-ratelimit-tokens-remaining`        | The number of tokens remaining (rounded to the nearest thousand) before being rate limited.                                                                                                                                             |
| `anthropic-ratelimit-tokens-reset`            | The time when the token rate limit will be fully replenished, provided in RFC 3339 format.                                                                                                                                              |
| `anthropic-ratelimit-input-tokens-limit`      | The maximum number of input tokens allowed within any rate limit period.                                                                                                                                                                |
| `anthropic-ratelimit-input-tokens-remaining`  | The number of input tokens remaining (rounded to the nearest thousand) before being rate limited.                                                                                                                                       |
| `anthropic-ratelimit-input-tokens-reset`      | The time when the input token rate limit will be fully replenished, provided in RFC 3339 format.                                                                                                                                        |
| `anthropic-ratelimit-output-tokens-limit`     | The maximum number of output tokens allowed within any rate limit period.                                                                                                                                                               |
| `anthropic-ratelimit-output-tokens-remaining` | The number of output tokens remaining (rounded to the nearest thousand) before being rate limited.                                                                                                                                      |
| `anthropic-ratelimit-output-tokens-reset`     | The time when the output token rate limit will be fully replenished, provided in RFC 3339 format.                                                                                                                                       |
| `anthropic-priority-input-tokens-limit`       | The maximum number of Priority Tier input tokens allowed within any rate limit period. (Priority Tier only)                                                                                                                             |
| `anthropic-priority-input-tokens-remaining`   | The number of Priority Tier input tokens remaining (rounded to the nearest thousand) before being rate limited. (Priority Tier only)                                                                                                    |
| `anthropic-priority-input-tokens-reset`       | The time when the Priority Tier input token rate limit will be fully replenished, provided in RFC 3339 format. (Priority Tier only)                                                                                                     |
| `anthropic-priority-output-tokens-limit`      | The maximum number of Priority Tier output tokens allowed within any rate limit period. (Priority Tier only)                                                                                                                            |
| `anthropic-priority-output-tokens-remaining`  | The number of Priority Tier output tokens remaining (rounded to the nearest thousand) before being rate limited. (Priority Tier only)                                                                                                   |
| `anthropic-priority-output-tokens-reset`      | The time when the Priority Tier output token rate limit will be fully replenished, provided in RFC 3339 format. (Priority Tier only)                                                                                                    |

The `anthropic-ratelimit-tokens-*` headers display the values for the most restrictive limit currently in effect. For instance, if you have exceeded the Workspace per-minute token limit, the headers will contain the Workspace per-minute token rate limit values. If Workspace limits do not apply, the headers will return the total tokens remaining, where total is the sum of input and output tokens. This approach ensures that you have visibility into the most relevant constraint on your current API usage. To see which Workspace a request counted against, read the `anthropic-workspace-id` [response header](https://platform.claude.com/docs/en/api/overview#response-headers), which carries the ID of the Workspace that your API key or access token resolved to.


---

[FETCH RESULT]
## What's Missing From This Page

The page does **not** contain current per-token pricing for Command, per-1M-token/per-image rates for Embed, or per-1,000-search rates for Rerank. Those tabs ("Generative models," "Advanced retrieval models," "Coding models") appear as navigation labels only — no figures were rendered. North and Compass are both listed as custom enterprise pricing, available by request.

## Per-Token Pricing That Is Listed

**Legacy Command models** (noted as "For existing customers"), per 1M tokens input / output:

| Model | Input | Output |
|---|---|---|
| Command | $1.00 | $2.00 |
| Command-light | $0.30 | $0.60 |
| Command R 03-2024 | $0.50 | $1.50 |
| Command R+ 04-2024 | $3.00 | $15.00 |
| Command R+ 08-2024 | $2.50 | $10.00 |

**Aya Expanse (8B and 32B) via API:** $0.50 per 1M input tokens, $1.50 per 1M output tokens.

## Model Vault (Instance-Based, Not Token-Based)

Embed and Rerank pricing here is charged per instance by performance tier, with hourly and monthly options:

| Model | Tier | Hourly | Monthly |
|---|---|---|---|
| Embed 4 | Small | $4.00 | $2,500 |
| Embed 4 | Medium | $5.00 | $3,250 |
| Rerank 3.5 | Medium | $5.00 | $3,250 |
| Rerank 4 Fast | Medium | $5.00 | $3,250 |
| Rerank 4 Pro | Medium | $5.00 | $3,250 |
| Rerank 4 Pro | Large | $10.00 | $6,500 |
| Parse 5 | Medium | $4.00 | $2,500 |
| Parse 5 | XL | $7.00 | $4,300 |

The page states that "Pricing is determined per instance based on the selected model and its performance tier," with hourly, monthly, or annual billing.

## Rerank Search Unit Definition

Although no per-1,000-search rate is given, the counting rule is: "A single search unit is defined as one query with up to 100 documents to be ranked." Documents over 500 tokens (query length included) get split into chunks, and each chunk counts as a separate document toward that search's total.

For the missing Command, Embed, and Rerank token/image/search rates, the page directs users to the Cohere dashboard or sales.

---

[FETCH RESULT]
=== https://cursor.com/docs/sitemap.xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>https://cursor.com/docs/account/enterprise/billing-groups</loc>
<lastmod>2026-09-01T03:57:16.338Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.6</priority>
</url>
<url>
<loc>https://cursor.com/docs/account/enterprise/cyber-safeguards</loc>
<lastmod>2026-09-01T03:57:16.338Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.6</priority>
</url>
<url>
<loc>https://cursor.com/docs/account/enterprise/service-accounts</loc>
<lastmod>2026-09-01T03:57:16.338Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.6</priority>
</url>
<url>
<loc>https://cursor.com/docs/account/organizations/organization-admin-api</loc>
<lastmod>2026-09-01T03:57:16.339Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.6</priority>
</url>
<url>
<loc>https://cursor.com/docs/account/pricing/request-based-legacy</loc>
<lastmod>2026-09-01T03:57:16.339Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.6</priority>
</url>
<url>
<loc>https://cursor.com/docs/account/regions</loc>
<lastmod>2026-09-01T03:57:16.339Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.6</priority>
</url>
<url>
<loc>https://cursor.com/docs/account/teams/admin-api</loc>
<lastmod>2026-09-01T03:57:16.339Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.6</priority>
</url>
<url>
<loc>https://cursor.com/docs/account/teams/ai-code-tracking-api</loc>
<lastmod>2026-09-01T03:57:16.339Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.6</priority>
</url>
<url>
<loc>https://cursor.com/docs/account/teams/analytics</loc>
<lastmod>2026-09-01T03:57:16.340Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.6</priority>
</url>
<url>
<loc>https://cursor.com/docs/account/teams/analytics-api</loc>
<lastmod>2026-09-01T03:57:16.340Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.6</priority>
</url>
<url>
<loc>https://cursor.com/docs/account/teams/dashboard</loc>
<lastmod>2026-09-01T03:57:16.340Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.6</priority>
</url>
<url>
<loc>https://cursor.com/docs/account/teams/members</loc>
<lastmod>2026-09-01T03:57:16.340Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.6</priority>
</url>
<url>
<loc>https://cursor.com/docs/account/teams/pricing</loc>
<lastmod>2026-09-01T03:57:16.340Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.6</priority>
</url>
<url>
<loc>https://cursor.com/docs/account/teams/scim</loc>
<lastmod>2026-09-01T03:57:16.340Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.6</priority>
</url>
<url>
<loc>https://cursor.com/docs/account/teams/setup</loc>
<lastmod>2026-09-01T03:57:16.340Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.6</priority>
</url>
<url>
<loc>https://cursor.com/docs/account/teams/sso</loc>
<lastmod>2026-09-01T03:57:16.340Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.6</priority>
</url>
<url>
<loc>https://cursor.com/docs/account/update-access</loc>
<lastmod>2026-09-01T03:57:16.340Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.6</priority>
</url>
<url>
<loc>https://cursor.com/docs/agent/agent-review</loc>
<lastmod>2026-09-01T03:57:16.341Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.8</priority>
</url>
<url>
<loc>https://cursor.com/docs/agent/agents-window</loc>
<lastmod>2026-09-01T03:57:16.341Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.8</priority>
</url>
<url>
<loc>https://cursor.com/docs/agent/debug-mode</loc>
<lastmod>2026-09-01T03:57:16.341Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.8</priority>
</url>
<url>
<loc>https://cursor.com/docs/agent/design-mode</loc>
<lastmod>2026-09-01T03:57:16.341Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.8</priority>
</url>
<url>
<loc>https://cursor.com/docs/agent/overview</loc>
<lastmod>2026-09-01T03:57:16.341Z</lastmod>
<changefreq>monthly</changefreq>
<priority>0.8</priority>
</url>
<url>
<loc>https://cursor.com/docs/agent/plan-mod
=== https://cursor.com/docs/llms.txt
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
- https://cursor.co
=== https://cursor.com/llms.txt
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
- https://cursor.co

---

[FETCH RESULT]
REDIRECT DETECTED: The URL redirects to a location that was not fetched automatically.

Original URL: https://platform.moonshot.ai/docs/pricing/chat
Redirect URL (from the server's Location header — server-supplied, not verified): https://platform.kimi.ai/docs/pricing/chat
Status: 301 Moved Permanently

To complete your request, I need to fetch content from the redirected URL. Please use WebFetch again with these parameters:
- url: "https://platform.kimi.ai/docs/pricing/chat"
- prompt: "Extract Moonshot AI Kimi API pricing: model names (K2, K2.5, K3, kimi-k2-turbo etc), context window, input price per 1M tokens (cache hit and miss), cache storage price, and output price per 1M tokens."

---

[FETCH RESULT]
## API pricing isn't on this page

The content provided is Mistral's **Plans** page (subscription tiers), not the **API pricing** page. It contains no per-model rate table — so there are **no figures available here for Codestral, Devstral, Mistral Medium, Magistral, Codestral Embed, or Mistral Embed**. Those would be on the linked `/pricing/api` page.

### The only model rate mentioned
A single example appears in the FAQ section:

- **Mistral Large** — "$0.5 /M tokens in and $1.5 /M tokens out"

### Pricing mechanics described
- Billing is generally token-based: "Most models are priced per million tokens, with both input (your prompts) and output (responses) counted separately."
- **Batch processing** for large volumes "reduces the price by 50%."
- **Prompt caching**: cached input tokens "reduce input cost by up to 90% for repeated prompts."
- Non-token billing models: OCR is charged "per 1,000 pages," speech models "per minute," and tool APIs "per call."

### Included API credits by plan
| Plan | Price | API credits |
|---|---|---|
| Free | $0 | "$10 /mo in API credits" |
| Pro | $14.99/mo | "$30 /mo in API credits" (a $15/mo variant is also shown) |
| Team | $24.99/user/mo | "$50 /mo" |
| Enterprise | Contact sales | Not stated |

Students can get Pro at $5.99/month, valid up to 12 months with verification.

To get the full model-by-model breakdown you requested, the API rate card at `/pricing/api` would need to be retrieved.

---

[FETCH RESULT]
422 /tmp/cursor_llms.txt
7:- https://cursor.com/docs/models-and-pricing.md
8:  - https://cursor.com/docs/cursor-router.md
19:  - https://cursor.com/docs/models/cursor-composer-2-5.md
140:  - https://cursor.com/docs/account/teams/pricing.md
157:  - https://cursor.com/docs/enterprise/pooled-usage.md
164:  - https://cursor.com/docs/account/enterprise/billing-groups.md
219:- https://cursor.com/docs/cloud-agent/api/endpoints.md#worker-tokens
230:- https://cursor.com/docs/cloud-agent/api/endpoints.md#api-key-info
241:- https://cursor.com/docs/account/organizations/organization-admin-api.md#get-pooled-usage
242:- https://cursor.com/docs/account/organizations/organization-admin-api.md#get-usage-events
243:- https://cursor.com/docs/account/organizations/organization-admin-api.md#get-daily-usage-data
248:- https://cursor.com/docs/account/teams/admin-api.md#get-daily-usage-data
250:- https://cursor.com/docs/account/teams/admin-api.md#get-usage-events-data
256:- https://cursor.com/docs/account/teams/admin-api.md#billing-groups
270:- https://cursor.com/docs/account/teams/analytics-api.md#tab-usage
273:- https://cursor.com/docs/account/teams/analytics-api.md#model-usage
316:- https://cursor.com/help/ai-features/tab.md
337:- https://cursor.com/help/customization/keyboard-shortcuts.md
340:## Models and usage
342:- https://cursor.com/help/models-and-usage/available-models.md
343:- https://cursor.com/help/models-and-usage/cursor-router.md
344:- https://cursor.com/help/models-and-usage/grok-4-6.md
345:- https://cursor.com/help/models-and-usage/grok-4-5.md
346:- https://cursor.com/help/models-and-usage/api-keys.md
347:- https://cursor.com/help/models-and-usage/usage-limits.md
348:- https://cursor.com/help/models-and-usage/token-rate.md
359:## Account and billing
361:- https://cursor.com/help/account-and-billing/pricing.md
362:- https://cursor.com/help/account-and-billing/billing.md
363:- https://cursor.com/help/account-and-billing/cursor-start.md
364:- https://cursor.com/help/account-and-billing/app-store-subscription.md
365:- https://cursor.com/help/account-and-billing/teams-setup.md
366:- https://cursor.com/help/account-and-billing/teams-management.md
367:- https://cursor.com/help/account-and-billing/invoices.md
368:- https://cursor.com/help/account-and-billing/overages.md
369:- https://cursor.com/help/account-and-billing/bugbot-usage-based-billing.md
370:- https://cursor.com/help/account-and-billing/spend-alerts.md
371:- https://cursor.com/help/account-and-billing/spend-limits.md
372:- https://cursor.com/help/account-and-billing/enterprise.md
373:- https://cursor.com/help/account-and-billing/profiles.md
374:- https://cursor.com/help/account-and-billing/change-email.md
375:- https://cursor.com/help/account-and-billing/payment-issues.md
376:- https://cursor.com/help/account-and-billing/payment-not-applied.md
377:- https://cursor.com/help/account-and-billing/cancel.md
378:- https://cursor.com/help/account-and-billing/refunds.md
379:- https://cursor.com/help/account-and-billing/delete-account.md
380:- https://cursor.com/help/account-and-billing/referral-program.md
381:- https://cursor.com/help/account-and-billing/student-discount.md
407:- https://cursor.com/help/troubleshooting/tab-issues.md

---

[FETCH RESULT]
**The requested numbers aren't in this page.** It's the pricing *overview*, which explains billing concepts and links out to per-model rate tables — no per-1M-token figures, cache hit/miss rates, cache storage prices, or currency appear anywhere in the text provided.

**What the page does give:**

| Model | Stated capability | Rates found |
|---|---|---|
| Kimi K3 | "Flagship model with a 1M-token context window" | none listed |
| Kimi K2.7 Code | "Kimi's dedicated Coding model, multi-modal model" | none listed |
| Kimi K2.6 | "Supports visual and text input" | none listed |

The only context-window figure stated is K3's 1M tokens; K2.7 Code and K2.6 have no context length given here.

**Billing rules described:**
- Unit of billing is the token, with roughly "1 token is roughly equivalent to 3-4 English characters" for ordinary English text.
- Chat Completion calls are metered on both input and output volume.
- Text you extract from an uploaded document and then feed to the model counts toward your input charges.
- Upload, extraction, and storage endpoints are described as "temporarily free" — so extraction alone triggers no cost.
- A Token Calculation API (`/docs/api/estimate`) can return exact token counts per call.

**To get the actual figures**, check the three linked sub-pages: `/docs/pricing/chat-k3`, `/docs/pricing/chat-k27-code`, and `/docs/pricing/chat-k26`. The full doc index is at `https://platform.kimi.ai/docs/llms.txt`. I can't supply invented values for cache-hit versus cache-miss input pricing, cache storage, or output pricing, since none are present in what you shared.

---

[FETCH RESULT]
########## help/models-and-usage/api-keys
# Bring your own API key

You can add your own API keys so Cursor uses your preferred AI models. This lets you send unlimited AI messages at your own cost through providers like OpenAI, Anthropic, or Google.

## How do I add an API key?

1. Open **Cursor Settings** > **Models**
2. Find the provider you want (OpenAI, Anthropic, Google, Azure, or AWS Bedrock)
3. Paste your API key into the text field
4. Click **Save**

Cursor now uses your key for that provider's models. They appear in the model picker. If a key is invalid or rejected by the provider, requests using that provider fail until you update or remove the key.

## What providers are supported?

- **OpenAI**: Standard, non-reasoning chat models. The model picker shows which OpenAI models are available.
- **Anthropic**: All Claude models available through the Anthropic API.
- **Google**: Gemini models available through the Google AI API.
- **Azure OpenAI**: Models deployed in your Azure OpenAI Service instance.
- **AWS Bedrock**: Use AWS access keys and secret keys in the IDE, or configure IAM roles through the [Cursor dashboard](https://cursor.com/dashboard). Works with models available in your Bedrock configuration. See the [AWS Bedrock setup guide](https://cursor.com/docs/customizing/aws-bedrock.md) for detailed instructions.

Custom API keys only work with chat models. Tab completion continues using Cursor's built-in models.

## Does Cursor's Zero Data Retention policy apply when using my own API keys?

No. Cursor's [Zero Data Retention policy](https://cursor.com/docs/account/teams/dashboard.md#settings) does not apply when you use your own API keys. Your data handling follows the privacy policy of your chosen provider (OpenAI, Anthropic, Google, Azure, or AWS).

If your team relies on Zero Data Retention, use Cursor's built-in models instead.

## Will my API key be stored or leave my device?

Your API key is not stored on our servers. It is sent to our backend with every request because all requests are routed through Cursor's servers for final prompt building. The key is transmitted over encrypted connections and is not persisted after the request completes.

## Related

- [AWS Bedrock setup guide](https://cursor.com/docs/customizing/aws-bedrock.md)
- [Available models](https://cursor.com/help/models-and-usage/available-models.md)
- [Privacy and data](https://cursor.com/help/security-and-privacy/privacy.md)


---

## Sitemap

[Overview of all docs pages](/llms.txt)

########## help/models-and-usage/token-rate
# Cursor Token Rate

Teams and Enterprise plan customers pay a Cursor Token Rate of $0.25 per million tokens on third-party model requests. This includes when you pick a third-party model directly and when Auto routes to a third-party model.

First-party Cursor models, including Grok and Composer, are exempt.

This applies to included usage, on-demand usage, and BYOK usage when the request uses a third-party model that is subject to the Cursor Token Rate.

## What does the Cursor Token Rate cover?

- Search infrastructure
- Custom model execution and routing
- Processing and infrastructure costs

## How is the Cursor Token Rate calculated?

For eligible third-party model requests, the rate applies to input tokens, output tokens, and cached tokens. The Cursor Token Rate also applies to BYOK usage, in addition to whatever you pay your API provider directly.

## How do I avoid the Cursor Token Rate?

Use a first-party model, including Grok or Composer.

## Related

- [API keys](https://cursor.com/help/models-and-usage/api-keys.md)
- [Available models](https://cursor.com/help/models-and-usage/available-models.md)
- [Models & Pricing](https://cursor.com/docs/models-and-pricing.md#auto-modes)


---

## Sitemap

[Overview of all docs pages](/llms.txt)

########## help/models-and-usage/usage-limits
# Usage and limits

Most Cursor plans include two monthly usage pools:

- **Cursor Models**: Cursor Grok 4.6, Cursor Grok 4.5, and Composer 2.5
- **Other Models**: Third-party models, charged at model provider prices

Pro, Pro Plus, and Ultra include both pools. The Start plan covers the Cursor Models pool only. See [Cursor Start](https://cursor.com/help/account-and-billing/cursor-start.md) for India plan details.

Your model selection affects how quickly your included usage is consumed.

Current usage-based plans don't include Max Mode. On legacy request-based plans, [Max Mode](https://cursor.com/help/ai-features/max-mode.md) is billed at the model's API rate plus 20%.

## How do I check my usage?

Go to the [Spending](https://cursor.com/dashboard/spending) tab in your dashboard. It shows real-time usage for both pools, remaining allowance, and any on-demand charges.

## What happens when I hit my usage limit?

You'll see a notification in the editor. You can either enable on-demand usage (pay-as-you-go) or upgrade to a higher plan.

## When does my usage reset?

Usage resets monthly with your billing cycle. Unused usage does not roll over. The reset date is shown on the [Spending](https://cursor.com/dashboard/spending) tab.

For teams, all members' usage resets at the same time based on the team billing cycle.

## How do I get more usage?

- **Use Cursor Models**: Cursor Grok 4.6, Cursor Grok 4.5, and Composer 2.5 draw from the Cursor Models pool, tracked separately and included with your plan
- **Enable on-demand usage**: Pay for additional requests at the same API rates
- **[Upgrade your plan](https://cursor.com/help/account-and-billing/pricing.md#how-do-i-upgrade-my-plan)**: Higher-tier plans include more usage

## How does Cursor Router interact with my plan's usage pools and limits?

Cursor Router requests are billed at the routed model's cost and can draw from both the Cursor Models pool and the third-party Other Models pool, depending on which model handles the request.

- **Composer 2.5** requests carry no [Cursor Token Rate](https://cursor.com/help/models-and-usage/token-rate.md) on any plan
- All Auto modes bill at the routed model's list price. Third-party models also incur the Cursor Token Rate

When included usage runs out, on-demand charges apply if you have on-demand usage enabled. Check your [Spending dashboard](https://cursor.com/dashboard/spending) for request-level cost and pool details.

See [Cursor Router](https://cursor.com/help/models-and-usage/cursor-router.md) for mode details.

## Related

- [Cursor Router](https://cursor.com/help/models-and-usage/cursor-router.md)
- [Pricing and plans](https://cursor.com/help/account-and-billing/pricing.md)
- [Usage-based charges](https://cursor.com/help/account-and-billing/overages.md)
- [Available models](https://cursor.com/help/models-and-usage/available-models.md)
- [API keys](https://cursor.com/help/models-and-usage/api-keys.md)
- [Pricing reference](https://cursor.com/docs/models-and-pricing.md)
- [Model pricing](https://cursor.com/docs/models-and-pricing.md#model-pricing)


---

## Sitemap

[Overview of all docs pages](/llms.txt)

---

[FETCH RESULT]
########## help/account-and-billing/pricing
# Pricing and plans

Compare plans and manage subscription changes from your billing dashboard.

## What plans are available?

| Plan               | Price                  |
| ------------------ | ---------------------- |
| Hobby              | Free                   |
| Start (India only) | ₹649/mo, tax inclusive |
| Pro                | $20/mo                 |
| Pro+               | $60/mo                 |
| Ultra              | $200/mo                |
| Teams Standard     | $40/user/mo            |
| Teams Premium      | $120/user/mo           |

See [Models & Pricing](https://cursor.com/docs/models-and-pricing.md) for usage pools and [Cursor Start](https://cursor.com/help/account-and-billing/cursor-start.md) for the India plan.

**Enterprise** plans include pooled usage, SCIM provisioning, audit logs, advanced admin controls, and invoice billing. [Contact sales](https://cursor.com/contact-sales?source=docs-help-pricing) to get started.

See [cursor.com/pricing](https://cursor.com/pricing) for the full feature comparison.

## What is Auto?

**Auto** balances intelligence, cost, and reliability through [Cursor Router](https://cursor.com/help/models-and-usage/cursor-router.md). All Auto modes bill at the list price of the model each request is routed to. For example, if your request is routed to Opus 5, you are billed at Opus 5 pricing for that request. Third-party models also incur the [Cursor Token Rate](https://cursor.com/help/models-and-usage/token-rate.md). See [Auto modes](https://cursor.com/docs/models-and-pricing.md#auto-modes) for current rates.

You can switch between Auto and specific models in the model picker. See [available models](https://cursor.com/help/models-and-usage/available-models.md) for details.

## Is Cursor Router available on my plan?

Cursor Router will launch for Teams and Enterprise plans. Individual plans (Hobby, Pro, Pro+, Ultra) will receive this update a few months after launch. Enterprise teams start with Cursor Router off; an admin must opt in.

It is available across the Agents window, editor, CLI, Cursor SDK, and the iOS app. See [Cursor Router](https://cursor.com/help/models-and-usage/cursor-router.md) for how routing and optimization modes work.

## Why is the old Auto mode now called Cost mode?

The old Auto mode was split into 3 new modes: **Cost**, **Balance** and **Intelligence**.

## What's included in the free Hobby plan?

The Hobby plan gives you access to Cursor's core features with limited usage. You can use Agent, Chat, and Tab completions with the Auto model.

## How do I upgrade my plan?

1. Go to [cursor.com/dashboard/billing](https://cursor.com/dashboard/billing)
2. Find the tile with your current plan and click **Adjust plan**
3. Select the plan you want
4. Complete payment through Stripe checkout

The change takes effect immediately. This applies to individual plans (Pro, Pro+, Ultra). Any credit for your previous plan is based on its unused included usage, not days remaining. See [Do I get a prorated refund when I upgrade my plan?](https://cursor.com/help/account-and-billing/refunds.md#do-i-get-a-prorated-refund-when-i-upgrade-my-plan)

## How do I downgrade my plan?

1. Go to [cursor.com/dashboard/billing](https://cursor.com/dashboard/billing)
2. Find the tile with your current plan and click **Adjust plan**
3. Select the plan you want
4. Confirm in the modal and click **Schedule Downgrade**

You keep your current plan until the end of your billing period. This applies to individual plans (Pro, Pro+, Ultra).

## Where do I manage my subscription?

Use [cursor.com/dashboard/billing](https://cursor.com/dashboard/billing) for plan changes, payment method updates, invoices, and cancellation. Click **Manage Subscription** there to open the Stripe billing portal.

## What if I move from an individual plan to a Teams plan?

When you join a team, billing state can change based on the team setup flow. If your plan state looks wrong after joining, use [payment completed but plan not updated](https://cursor.com/help/account-and-billing/payment-not-applied.md) for troubleshooting steps.

## Can I switch between monthly and yearly billing?

**To switch to yearly:**

1. Go to [cursor.com/dashboard/billing](https://cursor.com/dashboard/billing)
2. Click **Upgrade Now** on the green banner at the top

**To switch to monthly:**

There is no way to switch mid-plan. Use the [Adjust plan](https://cursor.com/help/account-and-billing/pricing.md#how-do-i-downgrade-my-plan) flow to schedule the switch at the end of your yearly billing period.

## Related

- [Billing and payments](https://cursor.com/help/account-and-billing/billing.md)
- [Cursor Start](https://cursor.com/help/account-and-billing/cursor-start.md)
- [Cancel your subscription](https://cursor.com/help/account-and-billing/cancel.md)
- [Cursor Router](https://cursor.com/help/models-and-usage/cursor-router.md)
- [Usage and limits](https://cursor.com/help/models-and-usage/usage-limits.md)
- [Payment completed but plan not updated](https://cursor.com/help/account-and-billing/payment-not-applied.md)
- [Pricing reference](https://cursor.com/docs/models-and-pricing.md)


---

## Sitemap

[Overview of all docs pages](/llms.txt)

########## help/account-and-billing/overages
# Usage-based charges

If you see charges beyond your base subscription, you likely have on-demand usage enabled.

## How does on-demand pricing work?

Each plan includes a monthly usage budget. If you exceed your included usage, additional requests are billed at API rates with no markup.

On Teams and Enterprise plans, third-party model requests also include the [Cursor Token Rate](https://cursor.com/help/models-and-usage/token-rate.md). This includes when Auto routes to a third-party model. First-party Cursor models, including Grok and Composer, are exempt.

- On-demand usage must be explicitly enabled in your settings
- On-demand usage has its own invoices and line items, distinct from your subscription

## How do I check my usage?

Go to [cursor.com/dashboard](https://cursor.com/dashboard) and click **Billing & Invoices**. You'll see two sections:

- **Included Usage**: Usage covered by your monthly subscription.
- **On-Demand Usage**: Any usage charged above your monthly subscription.

## How do I prevent on-demand charges?

- **Disable on-demand usage**: Turn it off in your dashboard settings to stop requests once your included usage runs out
- **Set a spend limit**: Cap how much on-demand usage you're willing to pay that billing cycle. Raising it mid-cycle can make previously credited overage billable.
- **[Upgrade your plan](https://cursor.com/help/account-and-billing/pricing.md#how-do-i-upgrade-my-plan)**: Pro+ or Ultra give you higher included usage limits for Cursor Models and Other Models.

## What if usage goes over my spend limit?

Enforcement is not instant, so usage can briefly exceed your spend limit. Once we recognize that you have reached your spend limit, on-demand usage stops until you increase the spend limit or a new billing cycle starts. If a higher plan is available, upgrading can add included usage without raising the spend limit.

We will credit the limited overage that occurs prior to enforcement as a temporary spend-limit credit. That is not a refund or a permanent credit. You are billed up to your current limit. If you raise the limit in the same cycle, we may bill some or all of that credit, up to the new limit. Leave the limit unchanged, or turn off on-demand usage, to keep the credit.

## Why did my usage costs increase after the Cursor Router launch?

Cursor Router introduced new Auto optimization modes. All Auto modes bill at the routed model's list price.

If you were using the former Auto mode before the launch, you will be defaulted to Auto **Cost** mode.

See [Cursor Router](https://cursor.com/help/models-and-usage/cursor-router.md) for mode details and [pricing and plans](https://cursor.com/help/account-and-billing/pricing.md#why-is-the-old-auto-mode-now-called-cost-mode) for the Cost rename.

## Related

- [Cursor Router](https://cursor.com/help/models-and-usage/cursor-router.md)
- [Usage and limits](https://cursor.com/help/models-and-usage/usage-limits.md)
- [Spend limits](https://cursor.com/help/account-and-billing/spend-limits.md)
- [Pricing and plans](https://cursor.com/help/account-and-billing/pricing.md)
- [Billing and payments](https://cursor.com/help/account-and-billing/billing.md)
- [Invoices](https://cursor.com/help/account-and-billing/invoices.md)


---

## Sitemap

[Overview of all docs pages](/llms.txt)

########## docs/cursor-router
# Cursor Router

Cursor Router is the model routing system behind **Auto**. Not every request needs frontier-level intelligence, so the router sends each request to the model that fits the task: simple requests go to fast, efficient models while complex work goes to the most capable ones.

Cursor Router is currently only available on Teams and Enterprise plans.

## How it works

When you select **Auto** and choose **Balance** or **Intelligence** in the model picker, Cursor Router runs a classifier on each agent request and routes it based on task type and complexity. The router picks the most cost-effective model that still produces comparable quality for that request.

Cursor Router is data-driven and managed by Cursor. You can't hand-pick which model handles a request, and the model pool changes over time as new models ship. You steer routing by choosing an optimization mode.

On Enterprise plans, Cursor Router respects your team's model access controls. If a model is blocked for your team, the router routes to an allowed model instead. Blocking too many models reduces routing quality and can disable the router. To create cost savings, the router needs a powerful yet cost-efficient model to use when it isn't calling other frontier models, so enabling [Cursor Grok 4.5](https://cursor.com/docs/models/grok-4-5.md) is a requirement for the router to work.

## Optimization modes

Open the model picker, select **Auto**, and pick a mode under **Optimize For**:

- **Cost**: Uses the previous Auto routing logic. It optimizes token spend.
- **Balance**: Optimizes for intelligence, speed, and cost.
- **Intelligence**: Routes to the most capable models for harder tasks, at a lower cost than running a single frontier model.

Balance and Intelligence use your usage limits faster than Cost. You can switch modes at any time.

## Pricing

All Auto modes bill at the list price of the model each request is routed to. Third-party models also incur the Cursor Token Rate.

Until September 7, 2026, Enterprise Auto Cost pricing is set per million tokens, regardless of which model is used ($1.25/1M input and cache write, $0.25/1M cache read, $6.00/1M output).

## Team settings

Admins configure Cursor Router from the [team dashboard](https://cursor.com/docs/account/teams/dashboard.md).

- **Enable Cursor Router**: Turn routing on or off. When enabled, team members using Auto are routed by Cursor Router. Enterprise teams must enable the router manually as it's off by default. On Enterprise plans, the router can also be configured per [organization group](https://cursor.com/docs/enterprise/organization-groups.md).
- **Routing preferences**: Choose which optimization modes team members can select from Auto. You can disable up to 2 modes.
- **Underlying model**: Display which model Auto routed to at the start of each response, or keep it hidden. Hidden is the default and recommended, so results are judged on their own merit rather than by model name. Applies to Balance and Intelligence modes.
- **Impose Auto**: Make Auto the default model for everyone on the team. **Soft** defaults each new chat to Auto; members can still switch models. **Hard** locks the model picker to Auto. Both are off by default.

## Use Router through the SDK

The [TypeScript SDK](https://cursor.com/docs/sdk/typescript.md#cursor-router) and [Python SDK](https://cursor.com/docs/sdk/python.md#cursor-router) expose Cursor Router as model id `auto-smart` with parameter `optimize_for` (`cost`, `balanced`, or `intelligence`). Call `Cursor.models.list()` to confirm Router is available for the API key's team before you hard-code a selection.

### TypeScript

```typescript
import { Agent } from "@cursor/sdk";

await using agent = await Agent.create({
  apiKey: process.env.CURSOR_API_KEY!,
  model: {
    id: "auto-smart",
    params: [{ id: "optimize_for", value: "balanced" }],
  },
  local: { cwd: process.cwd() },
});
```

### Python

```python
import os

from cursor_sdk import Agent, LocalAgentOptions, ModelParameterValue, ModelSelection

with Agent.create(
    model=ModelSelection(
        id="auto-smart",
        params=[ModelParameterValue(id="optimize_for", value="balanced")],
    ),
    local=LocalAgentOptions(cwd=os.getcwd()),
) as agent:
    ...
```

The SDK runs Cursor agent workflows. It is not a standalone chat-completions or raw inference API. See [Cursor Router in the TypeScript SDK](https://cursor.com/docs/sdk/typescript.md#cursor-router) or [Python SDK](https://cursor.com/docs/sdk/python.md#cursor-router) for catalog discovery, per-run mode overrides, and troubleshooting.

## Related

- [Cursor Router help](https://cursor.com/help/models-and-usage/cursor-router.md)


---

## Sitemap

[Overview of all docs pages](/llms.txt)

---

[FETCH RESULT]
<persisted-output>
Output too large (32.4KB). Full output saved to: C:\Users\bodep\.claude\projects\C--Trace-by-Origin\31d50875-2820-4c5f-8826-61b9cf9ff1b8\tool-results\bpput33n7.txt

Preview (first 2KB):
33165 /tmp/cmp.md
# Models & Pricing

Cursor supports frontier models from OpenAI, Anthropic, Google, SpaceXAI, and more. Pro, Pro Plus, and Ultra include two usage pools so you can pick the right balance of intelligence, speed, and cost. Start, our plan for developers in India, covers the Cursor Models pool.

## Usage pools

There are two separate usage pools, each resetting with your monthly billing cycle:

- **Cursor Models**: Significantly more included usage for Cursor Grok 4.6, Grok 4.5, and Composer 2.5.
- **Other Models**: The pool for third-party models, charged at the model's API price. Pro, Pro Plus, and Ultra include this pool, with the option to pay for additional usage as needed. The Start plan does not include this pool.

Both pools are visible in your editor settings and on your [usage dashboard](https://cursor.com/dashboard/usage).

## Cursor Models

The Cursor Models pool includes Cursor Grok 4.6, Grok 4.5, and Composer 2.5.

On Teams and Enterprise plans, [Cursor Router](https://cursor.com/docs/cursor-router.md) picks the model for each Auto request based on your optimization mode.

| Model                                                       | Provider | Input | Cache write | Cache read | Output | Notes                                  |
| ----------------------------------------------------------- | -------- | ----- | ----------- | ---------- | ------ | -------------------------------------- |
| Grok 4.6                                                    | Cursor   | $2    | -           | $0.5       | $6     | Jointly trained by Cursor and SpaceXAI |
| Grok 4.6 (Fast)                                             | Cursor   | $4    | -           | $1         | $12    | Jointly trained by Cursor and SpaceXAI |
| Grok 4.5                                                    | Cursor   | $2    | -           | $0.5       | $6     | Jointly trained by Cursor and SpaceXAI |
...
</persisted-output>

---

[FETCH RESULT]
3:Cursor supports frontier models from OpenAI, Anthropic, Google, SpaceXAI, and more. Pro, Pro Plus, and Ultra include two usage pools so you can pick the right balance of intelligence, speed, and cost. Start, our plan for developers in India, covers the Cursor Models pool.
7:There are two separate usage pools, each resetting with your monthly billing cycle:
9:- **Cursor Models**: Significantly more included usage for Cursor Grok 4.6, Grok 4.5, and Composer 2.5.
10:- **Other Models**: The pool for third-party models, charged at the model's API price. Pro, Pro Plus, and Ultra include this pool, with the option to pay for additional usage as needed. The Start plan does not include this pool.
12:Both pools are visible in your editor settings and on your [usage dashboard](https://cursor.com/dashboard/usage).
31:When you select a specific third-party model, usage is drawn from the **Other Models** pool at that model's API rate.
55:| [Gemini 3 Pro Image Preview](https://ai.google.dev/gemini-api/docs)                           | Google    | $2    | -           | $0.2       | $12    | Hidden by default; Native image generation model optimized for speed, flexibility, and contextual understanding; Text input and output priced the same as Gemini 3 Pro; Image output: $120/1M tokens (\~$0.134 per 1K/2K image, \~$0.24 per 4K image); Preview models may change before becoming stable and have more restrictive rate limits                                                                                                 |
85:Pro, Pro Plus, and Ultra include unlimited tab completions, extended agent usage limits on all models, access to Bugbot, and access to Cloud Agents. Start is a lower-priced plan for developers in India that covers the Cursor Models pool and Cloud Agents.
89:| **Start** (India only) | ₹649/mo, tax inclusive | Included      | Not included |
90:| **Pro**                | $20/mo                 | Included      | Included     |
91:| **Pro Plus**           | $60/mo                 | Included      | Included     |
92:| **Ultra**              | $200/mo                | Included      | Included     |
94:Since different models have different API costs, your model selection affects how quickly your included usage is consumed.
100:Start includes generous usage of the Cursor Models pool, so you can run Grok 4.6, Grok 4.5, and Composer 2.5 for daily building. On Start, all three models run in non-fast mode, and both Grok 4.6 and Grok 4.5 use a fixed medium effort level. You cannot change effort levels or enable Fast mode on Start. Upgrade to Pro or higher to choose effort levels and Fast mode.
104:Start does not include the Other Models pool, on-demand usage, Bugbot, Auto, Automations, or the Cursor SDK. Upgrade to Pro for those. Read the [Cursor Start announcement](https://cursor.com/blog/cursor-start-india) for more detail.
106:### How much usage do I need?
108:- **Daily Tab users**: Typically stay within included usage
109:- **Limited Agent users**: Often stay within included usage
110:- **Daily Agent users**: Typically $60–$100/mo total usage
111:- **Power users (multiple agents/automation)**: Often $200+/mo total usage
115:When you exceed your included monthly usage, you can either:
117:- **Add on-demand usage**: Continue at the same API rates with pay-as-you-go billing
118:- **Upgrade your plan**: Move to a higher tier for more included usage
120:On-demand usage is billed monthly at the same rates. Requests are never downgraded in quality or speed.
126:Team plans provide additional features like centralized team billing and administration, a team marketplace for internal rules, skills, and plugins, agentic code reviews with Bugbot, cloud agents and automations with shared team context, usage analytics, team-wide privacy mode enforcement, and SAML/OIDC SSO.
128:We recommend Teams for any customer that is happy self-serving. We recommend [Enterprise](https://cursor.com/contact-sales?source=docs-models-pricing) for customers that need priority support, pooled usage, invoicing, SCIM, or advanced security controls.
134:On Teams and Enterprise plans, third-party model requests include a Cursor Token Rate of $0.25 per million tokens. This rate applies on top of model API pricing for included usage, on-demand usage, and BYOK usage.
138:## Auto modes
142:All Auto modes bill at the list price of the model each request is routed to. See [Model pricing](https://cursor.com/docs/models-and-pricing.md#model-pricing) for per-model rates. Third-party models also incur the [Cursor Token Rate](https://cursor.com/docs/models-and-pricing.md#cursor-token-rate).
=== TAIL SECTIONS
5:## Usage pools
14:## Cursor Models
29:## Other Models
33:### Model pricing
83:## Plans
96:### Start (India only)
106:### How much usage do I need?
113:### What happens when I reach my limit?
122:### Teams
132:## Cursor Token Rate
138:## Auto modes
144:### Legacy Enterprise Auto
148:## Legacy request-based pricing
150:### Max Mode
154:## FAQ
156:### Where are models hosted?
160:### Where can I find pricing terms?
167:## Sitemap

---

[FETCH RESULT]
## FAQ

### Where are models hosted?

Models are hosted by the model provider, a trusted partner, or Cursor. See our list of [sub-processors](https://trust.cursor.com/subprocessors) for details.

### Where can I find pricing terms?

For enterprise pricing details, billing terms, and fee calculations, see the [Pricing Policy](https://cursor.com/terms/pricing).


---

## Sitemap
=== COMPOSER
Composer 2.5 is Cursor's own agentic model. It builds on [Composer 2](/blog/composer-2) with stronger intelligence on long agentic tasks, better effort calibration, tool selection, intent understanding, and reliability.

## Strengths

- Strong on long-horizon tasks via [reinforcement learning](/blog/real-time-rl-for-composer) on [long-horizon coding tasks](/blog/self-driving-codebases).
- Default fast variant for interactive sessions; standard tier further optimized for cost per token.
- Tuned for tool use, file edits, and terminal operations inside Cursor.

## Tools

Composer 2.5 has access to all agent tools when used with Cursor including:

Learn more about [how tools work](https://cursor.com/docs/agent/overview.md#tools) and [tool calling fundamentals](https://cursor.com/learn/tool-calling.md).

## Pricing

A **faster variant** with the same intelligence is also available at $3/M input and $15/M output tokens. Fast is the default in the product and is priced lower than other fast models at similar speeds.

On individual and team plans, Composer 2.5 draws from the Cursor Models pool with Cursor Grok 4.6 and Grok 4.5. On-demand usage is charged at the rates below. All prices are per million tokens.


---

## Sitemap

[Overview of all docs pages](/llms.txt)

---

[FETCH RESULT]
---
title: AI Gateway Pricing
product: vercel
url: /docs/ai-gateway/pricing
canonical_url: "https://vercel.com/docs/ai-gateway/pricing"
last_updated: 2026-08-23
type: reference
prerequisites:
  - /docs/ai-gateway
related:
  - /docs/ai-gateway/observability-and-spend/budgets
  - /docs/plans/enterprise
  - /docs/ai-gateway/pricing/discounts
  - /docs/ai-gateway/authentication-and-byok/byok
  - /docs/ai-gateway/observability-and-spend/custom-reporting
summary: Learn about pricing for AI Gateway.
install_vercel_plugin: npx plugins add vercel/vercel-plugin
---

# AI Gateway Pricing

**AI Gateway charges no markup and no platform fee on tokens.** You pay the provider's list price on a pay-as-you-go basis. Purchase [AI Gateway Credits](#top-up-your-ai-gateway-credits) and Vercel automatically deducts charges from your balance.


<!-- docsgraph:related -->
## Related pages

> **For AI agents:** Follow these links to understand how this page connects to the rest of the Vercel ecosystem. For the full cross-link map (inbound, outbound, prerequisites, and semantic neighbors), see the .graph.md link below.

- [GPT-5.6 Sol is now 50% off a lower price](https://vercel.com/changelog/gpt-5-6-sol-is-now-50-percent-off-a-lower-price?from=related&source_path=%2Fdocs%2Fai-gateway%2Fpricing&source_site=vercel-docs&relationship=related)
- [MiniMax H3 and H3 Max are 50% off on AI Gateway](https://vercel.com/changelog/minimax-h3-and-h3-max-are-50-off-on-ai-gateway?from=related&source_path=%2Fdocs%2Fai-gateway%2Fpricing&source_site=vercel-docs&relationship=related)
- [How to build your own AI model router](https://vercel.com/kb/guide/how-to-build-your-own-ai-model-router?from=related&source_path=%2Fdocs%2Fai-gateway%2Fpricing&source_site=vercel-docs&relationship=related) — Build an AI model router with Vercel AI Gateway. Keep routing, key, and retention decisions in your code while the gatew
- [AI Gateway: Production-ready reliability for your AI apps](https://vercel.com/blog/ai-gateway-is-now-generally-available?from=related&source_path=%2Fdocs%2Fai-gateway%2Fpricing&source_site=vercel-docs&relationship=related)
- [Introducing the AI Gateway](https://vercel.com/blog/ai-gateway?from=related&source_path=%2Fdocs%2Fai-gateway%2Fpricing&source_site=vercel-docs&relationship=related)
- [How to route your coding agent spend through AI Gateway](https://vercel.com/kb/guide/route-coding-agent-spend-through-ai-gateway?from=related&source_path=%2Fdocs%2Fai-gateway%2Fpricing&source_site=vercel-docs&relationship=related) — Point Claude Code, Codex, Cursor, and every other harness on your machine at AI Gateway with one CLI command, on a budge
- [Pricing on Vercel](https://vercel.com/docs/pricing?from=related&source_path=%2Fdocs%2Fai-gateway%2Fpricing&source_site=vercel-docs&relationship=related) — Learn about Vercel's pricing model, including the resources and services that are billed, and how they are priced.
- [Vercel Agent Pricing](https://vercel.com/docs/agent/pricing?from=related&source_path=%2Fdocs%2Fai-gateway%2Fpricing&source_site=vercel-docs&relationship=related) — Understand Vercel Agent pricing and how to track costs
- [Ecosystem](https://vercel.com/docs/ai-gateway/ecosystem?from=related&source_path=%2Fdocs%2Fai-gateway%2Fpricing&source_site=vercel-docs&relationship=related) — Explore community framework integrations and ecosystem features for the AI Gateway.
- [Pricing and Limits](https://vercel.com/docs/eve/pricing?from=related&source_path=%2Fdocs%2Fai-gateway%2Fpricing&source_site=vercel-docs&relationship=related) — Understand how eve usage maps to Vercel resources and inherited platform limits.
- [Vercel Documentation Sitemap](https://vercel.com/docs/sitemap.md?from=related&source_path=%2Fdocs%2Fai-gateway%2Fpricing&source_site=vercel-docs&relationship=related) — Browse Vercel documentation pages with summaries, prerequisites, and topics.

Full cross-link map for this page: [/docs/ai-gateway/pricing.graph.md](/docs/ai-gateway/pricing.graph.md?from=related&source_path=%2Fdocs%2Fai-gateway%2Fpricing&source_site=vercel-docs&relationship=graph)
<!-- /docsgraph:related -->

## Free and paid tiers

Every Vercel team account gets access to both a free tier and a paid tier for AI Gateway Credits. **For the paid tier, AI Gateway provides tokens with zero markup, including when you bring your own key.**

The free tier includes a subset of models, not the full catalog. To see which models you can use with free credits, [browse the Free Tier models](/ai-gateway/models?freeTier=true). To use any other model, purchase AI Gateway Credits.

Free tier requests are also rate limited per model, with lower limits than the paid tier. If you exceed a limit, AI Gateway returns a `429` error and you can retry after a short wait. Purchasing AI Gateway Credits moves your team to the paid tier, which raises your rate limits.

Your free credits start when you make your first AI Gateway request. To run larger workloads, you can purchase AI Gateway Credits at any time with no obligation to renew. Once you purchase credits, your account transitions to the paid tier and the monthly free credit no longer applies.

## AI Gateway Rates

Whether you use a free or paid account, you'll pay the AI Gateway rates listed in the Models section of the [**AI Gateway**](https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai-gateway\&title=Go+to+AI+Gateway) tab for each request. AI Gateway bases its rates on the provider's list price.

The charge for each request depends on the AI provider and model you select, and the number of input and output tokens processed. **You're responsible for any payment processing fees that may apply.**

To cap how much your team, a project, an API key, or a team member can spend, set [budgets](/docs/ai-gateway/observability-and-spend/budgets).

[Enterprise](/docs/plans/enterprise) teams can pay for AI Gateway by invoice instead, which has no payment processing fees. [Contact sales](/contact/sales) to set up invoiced billing.

### Volume discounts

For volume spend, custom [discounts on token spend](/docs/ai-gateway/pricing/discounts) are also available.

### Finding model pricing

You can find the most up-to-date pricing for all models in two places:

- [**AI Gateway Model List**](/ai-gateway/models): Browse all available models with pricing information
- [**AI Gateway Dashboard**](https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai-gateway%2Fmodels\&title=AI+Gateway+Models): View models directly in your Vercel dashboard

When you click on a model, you can see the full pricing breakdown including variations across different providers that offer the same model.

## Bring Your Own Key (BYOK)

AI Gateway also supports [Bring Your Own Key (BYOK)](/docs/ai-gateway/authentication-and-byok/byok) for any provider listed in our catalog. With BYOK, there is no markup or fee from AI Gateway.

BYOK is available on the paid tier. When a request with your credentials fails, AI Gateway retries it with system credentials for reliability, and that fallback usage is charged against your credits balance. To use your own provider keys, you'll need purchased AI Gateway Credits.

## Add-on surcharges

Some AI Gateway capabilities are off by default. When you enable one, it incurs additional charges beyond the per-token rates, deducted from your AI Gateway Credits balance. Disable the capability in your team's AI Gateway settings to stop the charges.

### Custom Reporting

[Custom Reporting](/docs/ai-gateway/observability-and-spend/custom-reporting) lets you attach tags, user IDs, and quota entity IDs to requests, then query that data through the reporting endpoint.

| Charge type | Cost                                              |
| ----------- | ------------------------------------------------- |
| Write       | $0.075 / 1,000 tag/user ID/quota entity ID writes |
| Query       | $5 / 1,000 queries to the reporting endpoint      |

> **💡 Note:** Each unique tag, user ID, or quota entity ID within a single request scope
> counts as one write.

### Provider Allowlist

The [provider allowlist](/docs/ai-gateway/security-and-compliance/provider-allowlist) is a team-wide setting that applies to every request. If you only need to restrict providers on individual requests, use the `only` parameter in `providerOptions` instead at no additional cost.

| Option                       | Cost                                | Availability       |
| ---------------------------- | ----------------------------------- | ------------------ |
| Per-request `only` filter    | No additional cost                  | All plans          |
| Team-wide provider allowlist | $0.10 per 1,000 successful requests | Pro and Enterprise |

### Zero Data Retention (ZDR)

[Zero Data Retention (ZDR)](/docs/ai-gateway/security-and-compliance/zdr) routes requests to providers that have agreed not to retain or train on prompt data.

| Option                          | Cost                     | Availability       |
| ------------------------------- | ------------------------ | ------------------ |
| Per-request zero data retention | No additional cost       | Pro and Enterprise |
| Team-wide zero data retention   | $0.10 per 1,000 requests | Pro and Enterprise |

## Trace Drains

[Trace Drains](/docs/ai-gateway/observability-and-spend/trace-drains) forward an OpenTelemetry trace of every AI Gateway request to your own observability tool. They're available on Pro and Enterprise plans and bill on two meters, the number of trace events delivered to your drains and the volume of trace data transferred.

Vercel bills these two meters through Drains usage on your plan, not against your AI Gateway Credits balance. Track them on the [Usage dashboard](https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fusage\&title=Usage) under **Drains → AI Gateway Traces**.

Pro plans include no allowance for either meter, so charges begin with the first delivered trace and first byte of trace egress. A higher [sampling rate](/docs/drains/reference/traces#sampling-rate) increases both. To stop future charges, [pause or delete the trace drain](/docs/drains/using-drains#managing-your-active-drains).

## View your AI Gateway Credits balance

To view your balance:

1. Go to the [**AI Gateway**](https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai-gateway\&title=Go+to+AI+Gateway) section in your Vercel dashboard sidebar.
2. On the upper right corner, you will see your AI Gateway Credits balance displayed.

## Top up your AI Gateway Credits

To add AI Gateway Credits:

1. Go to the [**AI Gateway**](https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai-gateway\&title=Go+to+AI+Gateway) section in your Vercel dashboard sidebar.
2. In the upper right corner, click on the button that shows your AI Gateway Credits balance.
3. In the dialog that appears, you can select the amount of AI Gateway Credits you want to add.
4. Click on **Continue to Payment**.
5. Choose your payment method and click on **Confirm and Pay** to complete your purchase.

## Configure auto top-up

You can configure auto top-up to automatically add AI Gateway Credits when your balance falls below a threshold.

To enable auto top-up:

1. Go to the [**AI Gateway**](https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai-gateway\&title=Go+to+AI+Gateway) section in your Vercel dashboard sidebar.
2. In the upper right corner, click on the button that shows your AI Gateway Credits balance.
3. Click the **Change** button next to auto top-up (disabled by default).
4. Configure your preferred threshold and top-up amount.
5. Click **Save** to apply your settings.

When your balance drops below the threshold, AI Gateway automatically charges your payment method and adds the configured amount to your balance.


---

[View full sitemap](/docs/sitemap)


---

[FETCH RESULT]
## Credit purchase fee (platform fee)
- Card/Stripe top-ups: **"5.5% ($0.80 minimum)"**
- Crypto (USDC): **5%** — "Crypto payments are charged a fee of 5%."
- This purchase fee is how the company earns revenue; platform fees are described as non-refundable.

## BYOK (bring your own provider key) fee
- Fee above the free allowance: **5%** — "of what the same model and provider would normally cost on OpenRouter," charged against your OpenRouter credits.
- Free allowance is "measured by list-price inference cost, not request count":
  - Pay-as-you-go: **$25,000/month** with no BYOK fee
  - Enterprise: **$200,000/month**

## Markup on token pricing
- None. The docs state there is "no markup on inference pricing," and that per-model rates match the underlying provider's listed price.
- Prices are shown per million tokens, with typically separate prompt vs. completion rates; some models also bill per request, per image, or for reasoning tokens.
- Optional discount: opting in to logging prompts/completions earns a **1% discount on usage costs**.

## Routing and fallback
- "If a provider returns an error OpenRouter will automatically fall back to the next provider," handled invisibly to the caller.
- Routing variants: `:nitro` (sorts by throughput), `:floor` (sorts by price), `:exacto` (quality signals tuned for tool-calling), `:free`, and the deprecated `:online`.
- If your specified provider routing conflicts with your privacy settings, the request errors out rather than completing.

## Uptime
- No numeric SLA or uptime percentage is given. The claim is qualitative: by "pooling their uptime" across providers plus fallbacks, you get "much better uptime" than a single provider.

## Rate limits
- Free models, no credits purchased: **50 requests per day**
- Free models, after purchasing at least **10 credits**: **1,000 requests per day**
- Paid-account limits aren't quantified here; the doc points to its separate rate-limits reference.

## Other billing numbers
- Refund window: **24 hours** from the transaction for unused credits; crypto payments are never refundable.
- Unused credits may be expired after **one year** from purchase.
- Volume discounts: not currently offered.

---

[FETCH RESULT]
## Pricing (monthly)

| Plan | Price |
|---|---|
| Copilot Free | Free |
| Copilot Student | Free |
| Copilot Pro | $10 USD ("free for some users") |
| Copilot Pro+ | $39 USD |
| Copilot Max | $100 USD |
| Copilot Business | "$19 USD per granted seat per month" |
| Copilot Enterprise | "$39 USD per granted seat per month" |

## Allowances (stated as GitHub AI Credits, not premium requests)

| Plan | Base credits | Flex allotment | Total/month |
|---|---|---|---|
| Pro | 1,000 | 500 | 1,500 |
| Pro+ | 3,900 | 3,100 | 7,000 |
| Max | 10,000 | 10,000 | 20,000 |
| Business | 1,900 (per user) | — | 1,900 |
| Enterprise | 3,900 (per user) | — | 3,900 |
| Free / Student | "An allowance of GitHub AI Credits" (no figure given) | — | — |

Other stated limit: Free is capped at "2000 completions per month" for inline suggestions.

## Model access

Free and Student: "access to models is available through auto model selection only." Pro gets "A selection of models," Pro+ and Business get "Access to premium models," Max and Enterprise get "Priority access to premium models."

Models listed as included on Pro, Pro+, and Max: Claude Haiku 4.5, Claude Sonnet 4.5/4.6/5, Gemini 3.1 Pro, Gemini 3.5/3.6/3.7 Flash, GPT-5 mini, GPT-5.3-Codex, GPT-5.4, GPT-5.4 mini, GPT-5.6 Luna, GPT-5.6 Terra, Grok 4.5/4.6, Kimi K2.7 Code, Kimi K3, MAI-Code-1-Flash, MAI-Code-1.1-Flash, Raptor mini.

Pro+ and Max only (excluded on Pro): Claude Opus 4.7, Claude Opus 4.8, Claude Opus 4.8 fast mode (preview), Claude Opus 5, Claude Fable 5, GPT-5.4 nano, GPT-5.5, GPT-5.6 Sol.

Excluded on all three individual paid plans: Claude Opus 4.5, Claude Opus 4.6.

## Not present in this content

- Premium request counts per plan (the page measures usage in AI credits instead)
- Price per additional premium request / overage rate
- Per-model multipliers — the models table only marks included vs. not included

For those figures, the page directs readers to its usage-based billing pages for individuals and for organizations and enterprises. Note also a truncated agents section and a notice that self-serve Business/Enterprise purchases were paused as of April 22, 2026, with sign-ups "are reopening soon" for card or PayPal customers.

---

[FETCH RESULT]
The server returned HTTP 404 Not Found.

The response body was not retrieved. If this URL requires authentication, use an authenticated tool (e.g. `gh` for GitHub, or an MCP-provided fetch tool) instead of WebFetch.

---

[FETCH RESULT]
Failed to authenticate. API Error: 403 pre-consume quota failed, user quota: ＄0.241574, need quota: ＄0.318936 (request id: 20260901130848857692433v4n2fAWCmVAZu)

---

[FETCH RESULT]
# Anthropic Prompt Caching — Implementation Details

## 1. Minimum cacheable prompt length (exact token minimums)

Applies on the Claude API, Claude Platform on AWS, Google Cloud, and Microsoft Foundry. "These minimums apply on every platform where each model is available."

| Minimum | Models |
| --- | --- |
| **512 tokens** | Claude Opus 5, Claude Fable 5, Claude Mythos 5 |
| **1,024 tokens** | Claude Opus 4.8, Claude Sonnet 5, Claude Sonnet 4.6, Claude Sonnet 4.5, Claude Opus 4.1 (retired exc. Bedrock/GCloud), Claude Opus 4 (retired exc. GCloud), Claude Sonnet 4 (retired exc. Bedrock/GCloud) |
| **2,048 tokens** | Claude Mythos Preview, Claude Opus 4.7, Claude Haiku 3.5 (retired exc. Bedrock/GCloud) |
| **4,096 tokens** | Claude Opus 4.6, Claude Opus 4.5, Claude Haiku 4.5 |

Note the minimums are **not monotonic by version** — Opus 4.8 is 1,024 while Opus 4.7 is 2,048 and Opus 4.6/4.5 are 4,096.

Failure mode: shorter prompts "cannot be cached, even if marked with `cache_control`… will be processed without caching, and **no error is returned**." Verify via usage: if both `cache_creation_input_tokens` and `cache_read_input_tokens` are `0`, nothing was cached.

**Bedrock** (AWS-operated) has its own per-model minimums, failure behavior, and usage-field names — see the Bedrock prompt caching docs.

**Concurrency caveat:** "a cache entry only becomes available after the first response begins. If you need cache hits for parallel requests, wait for the first response before sending subsequent requests."

---

## 2. Cache breakpoints

- **Maximum 4 breakpoints** per request.
- **Automatic caching consumes one of the 4 slots.** If 4 explicit block-level breakpoints already exist → **400 error** (no slot left for automatic).
- **Lookback window = 20 blocks** per breakpoint (the breakpoint itself counts as position 1). Applies to both automatic and explicit.
- **Breakpoints are free**: "Adding more `cache_control` breakpoints doesn't increase your costs." You pay only for writes, reads, and uncached input.

### The three core mechanics
1. **Writes happen only at your breakpoint** — one cache entry = hash of the cumulative prefix ending at that block. No entries are written at earlier positions.
2. **Reads walk backward** looking for entries *prior requests wrote* — not for "stable content."
3. **Stops after 20 positions** (then resumes from the next explicit breakpoint, if any).

**Growing-conversation example from the docs:**
- Turn 1: 10 blocks, breakpoint at 10 → write at 10.
- Turn 2: 15 blocks, breakpoint at 15 → miss at 15, walk back to 10, hit; process 11–15 fresh, write at 15.
- Turn 3: 35 blocks, breakpoint at 35 → checks blocks 35→16, finds nothing. The turn-2 entry at block 15 is **one position outside the window** → no hit. Fix: add a second breakpoint at block 15.

**The classic bug:** static system context in blocks 1–5, per-request block (timestamp + user message) at block 6, `cache_control` on block 6. Every request produces a new hash at 6; lookback through 5→1 finds nothing because no write ever happened there. You pay a fresh write every request and never get a read. Fix: put `cache_control` on **block 5**. Automatic caching hits the same trap (it targets the last cacheable block), so use an explicit breakpoint here.

**Key rule:** place `cache_control` on the last block whose prefix is identical across requests you want to share a cache.

---

## 3. API shape: automatic vs explicit

### Automatic — single top-level `cache_control`

```json
{
  "model": "claude-opus-5",
  "max_tokens": 1024,
  "cache_control": {"type": "ephemeral"},
  "system": "You are a helpful assistant that remembers our conversation.",
  "messages": [
    {"role": "user", "content": "My name is Alex. I work on machine learning."},
    {"role": "assistant", "content": "Nice to meet you, Alex! ..."},
    {"role": "user", "content": "What did I say I work on?"}
  ]
}
```

Python: `cache_control={"type": "ephemeral"}` as a top-level kwarg. TS: `cache_control: { type: "ephemeral" }`. Go: `CacheControl: anthropic.NewCacheControlEphemeralParam()`. Java: `.cacheControl(CacheControlEphemeral.builder().build())`.

Breakpoint auto-advances each turn:

| Request | Content | Behavior |
| --- | --- | --- |
| 1 | System + User(1) + Asst(1) + **User(2)** ◀ cache | Everything written |
| 2 | … + Asst(2) + **User(3)** ◀ cache | System→User(2) read; Asst(2)+User(3) written |
| 3 | … + Asst(3) + **User(4)** ◀ cache | System→User(3) read; Asst(3)+User(4) written |

**Automatic caching edge cases:**
- Last block already has explicit `cache_control` with **same TTL** → no-op.
- Last block has explicit `cache_control` with **different TTL** → **400 error**.
- 4 explicit breakpoints already present → **400 error**.
- Last block ineligible → silently walks backward to nearest eligible block; if none, caching is skipped.
- **Not available on legacy Amazon Bedrock (Opus 4.6 and earlier)** — returns 400 for top-level `cache_control`; use explicit breakpoints there.

### Explicit — `cache_control` on a content block

```json
{
  "system": [
    {"type": "text", "text": "You are an AI assistant tasked with analyzing legal documents."},
    {"type": "text", "text": "Here is the full text of a complex legal agreement: [...]",
     "cache_control": {"type": "ephemeral"}}
  ],
  "messages": [{"role": "user", "content": "What are the key terms and conditions?"}]
}
```

### Combined (automatic + explicit)

```json
{
  "model": "claude-opus-5",
  "max_tokens": 1024,
  "cache_control": { "type": "ephemeral" },
  "system": [
    {"type": "text", "text": "You are a helpful assistant.",
     "cache_control": { "type": "ephemeral" }}
  ],
  "messages": [{ "role": "user", "content": "What are the key terms?" }]
}
```

"Pricing, minimum token thresholds, context ordering requirements, and the 20-block lookback window all apply the same as with explicit breakpoints."

**Prefix order is always `tools` → `system` → `messages`**, up to and including the marked block.

**Cacheable:** tool definitions in `tools`; blocks in `system`; text blocks in `messages.content` (user *and* assistant); images/documents (user turns); tool_use and tool_result blocks.
**Not cacheable:** thinking blocks (via `cache_control` directly — but they *are* cached as part of prior assistant turns, and **count as input tokens when read from cache**); sub-content blocks like citations (cache the top-level document block instead); empty text blocks.

---

## 4. TTL options

Default **5 minutes**; **1 hour** available via `ttl`. `"ephemeral"` is the only supported cache type.

```json
"cache_control": { "type": "ephemeral", "ttl": "1h" }
```

- Cache is **refreshed free** each time it's used.
- **Lifetime is measured from the start of the request** that writes or reads the entry, *not* from the end of the response. "if a response takes 4 minutes to stream, a follow-up request that reuses the same cached prefix must start within about 1 minute of that response completing."
- 1h availability: Claude API, Amazon Bedrock, Amazon Bedrock (Opus 4.6 and earlier), Claude Platform on AWS, Google Cloud, Microsoft Foundry.
- Latency is identical between 5m and 1h.

### Pricing multipliers
- 5-minute cache **write** = **1.25×** base input price
- 1-hour cache **write** = **2×** base input price
- Cache **read** = **0.1×** base input price

These stack with the Batch API discount and data residency. Examples: Opus 5 — $5 base / $6.25 (5m write) / $10 (1h write) / $0.50 (read) / $25 output. Sonnet 5 — $2 / $2.50 / $4 / $0.20 / $10. Haiku 4.5 — $1 / $1.25 / $2 / $0.10 / $5.

### Mixing TTLs
Constraint: **longer TTL entries must appear before shorter ones** (1h before any 5m). Billing uses three positions:
- `A` = token count at the **highest cache hit** (0 if no hits)
- `B` = token count at the highest **1-hour** `cache_control` block after `A` (= `A` if none)
- `C` = token count at the **last** `cache_control` block

Charged: read tokens for `A`, 1h write tokens for `(B − A)`, 5m write tokens for `(C − B)`.

Usage response splits writes by TTL:
```json
"usage": {
  "input_tokens": 2048,
  "cache_read_input_tokens": 1800,
  "cache_creation_input_tokens": 248,
  "output_tokens": 503,
  "cache_creation": {
    "ephemeral_5m_input_tokens": 148,
    "ephemeral_1h_input_tokens": 100
  }
}
```
`cache_creation_input_tokens` equals the sum of the `cache_creation` object. Unexpected `ephemeral_5m_input_tokens` can come from server tools (e.g. web search), which cache results automatically.

**When to prefer 1h:** reuse intervals >5 min but <1 hr (long side-agent runs, chat sessions where the user may pause); latency-sensitive follow-ups beyond 5 min; better rate-limit utilization. Otherwise stay on 5m since refreshes are free.

---

## 5. Cache invalidation

Hierarchy `tools` → `system` → `messages`; a change at one level invalidates that level and everything after it. ✘ = invalidated.

| What changes | Tools | System | Messages | Notes |
| --- | --- | --- | --- | --- |
| **Tool definitions** (names, descriptions, params) | ✘ | ✘ | ✘ | Invalidates entire cache |
| **Web search toggle** | ✓ | ✘ | ✘ | Modifies system prompt |
| **Citations toggle** | ✓ | ✘ | ✘ | Modifies system prompt |
| **Speed setting** (`speed: "fast"` vs standard) | ✓ | ✘ | ✘ | |
| **`tool_choice`** | ✓ | ✓ | ✘ | |
| **Images** (added/removed anywhere) | ✓ | ✓ | ✘ | |
| **Thinking parameters** (mode, `budget_tokens`) | Model-specific | Model-specific | ✘ | Rendered into the prompt |
| **`output_config.effort`** | Model-specific | Model-specific | ✘ | Setting effort explicitly to the model default ≡ omitting it (no invalidation) |
| **Non-tool-result user content w/ extended thinking** | ✓ | ✓ | Model-specific | Opus 4.5+/Sonnet 4.6+: thinking preserved, cache valid ✓. Earlier Opus/Sonnet + **all Haiku**: thinking blocks stripped, following messages dropped from cache ✘ |

Other requirements: **exact matching** — "Cache hits require 100% identical prompt segments, including all text and images up to and including the block marked with cache control." Watch for languages that randomize JSON key order in `tool_use` blocks (Swift, Go) — this breaks caches.

**Mid-conversation system messages:** On Claude Fable 5, Mythos 5, Opus 4.8, and Opus 5 you can append a `{"role": "system"}` message to `messages` to add instructions mid-conversation **without invalidating** the system or message caches. Not available on Sonnet 5.

**Isolation:** caches never shared across organizations. **Workspace-level isolation** on Claude API, Claude Platform on AWS, and Microsoft Foundry; **organization-level** on Bedrock and Google Cloud.

Prompt caching has no effect on output token generation — responses are identical to uncached.

---

## 6. Rate limits & token accounting

**Cache hits are not deducted against your rate limit** — cited as a reason to use the 1-hour cache to "improve your rate limit utilization."

Usage fields (in `usage`, or the `message_start` event when streaming):
- `cache_creation_input_tokens` — tokens written to cache
- `cache_read_input_tokens` — tokens read from cache
- `input_tokens` — **only tokens after the last cache breakpoint**, not all input you sent

```text
total_input_tokens = cache_read_input_tokens + cache_creation_input_tokens + input_tokens
```

Example: 100,000 cached-read + 0 written + 50-token user message → `cache_read_input_tokens: 100000`, `cache_creation_input_tokens: 0`, `input_tokens: 50`, total 100,050. "This is important for understanding both costs and rate limits, as `input_tokens` will typically be much smaller than your total input."

---

## 7. Cache pre-warming (`max_tokens: 0`)

Loads the prefix and writes the cache without generating output — removes first-request TTFT penalty. Response has empty `content`, `stop_reason: "max_tokens"`, `output_tokens: 0`, and full `usage`.

```json
{
  "model": "claude-opus-5",
  "max_tokens": 0,
  "system": [
    {"type": "text",
     "text": "You are an expert software engineer with deep knowledge of distributed systems...",
     "cache_control": {"type": "ephemeral"}}
  ],
  "messages": [{"role": "user", "content": "warmup"}]
}
```

Requirements: use an **explicit** breakpoint on the last block shared with real requests (system prompt / tools), **not** on the placeholder — automatic caching would key the entry to the placeholder. Match the thinking config and `output_config.effort` of real traffic. Placeholder can be any non-whitespace string. A cache write is billed if the prefix isn't already cached; zero output tokens billed. Re-warm at least every 5 min (or use `ttl: "1h"`).

**Rejected with `invalid_request_error`** when `max_tokens: 0` is combined with: `stream: true`, extended thinking (`thinking.type: "enabled"`), structured outputs (`output_config.format`), `tool_choice` of `{"type":"tool",...}` or `{"type":"any"}`, or inside a Message Batches request.

Preferred over the old `max_tokens: 1` workaround (no token to discard, no output billed).

---

## 8. Troubleshooting checklist

- Cached sections byte-identical; `cache_control` markers in the same locations
- Calls within the TTL (5 min default), measured from request start
- `tool_choice`, image presence, thinking config, and `output_config.effort` consistent
- Meeting the model's token minimum
- Breakpoint on a block that doesn't change per request (remember: lookback only finds *prior writes*, never "stable content behind the breakpoint")
- Stable JSON key ordering in `tool_use` blocks
- Use **cache diagnostics (beta)** to have the API compare consecutive requests and report exactly where the prefix diverged

---

Failed to authenticate. API Error: 403 pre-consume quota failed, user quota: ＄0.110730, need quota: ＄0.548220 (request id: 20260901130955703843527rc7qqOEgfM5Bt)