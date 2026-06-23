# NovaAssist — Full Case Study Reference
### The AI project that threads through every slide

This document gives you everything you need to know about NovaAssist before the workshop. Read it once. Reference it during the session.

---

## 1. The Company — NovaTech

| Attribute | Detail |
|-----------|--------|
| Industry | B2B SaaS |
| Size | ~800 employees |
| Departments in scope | HR, IT, Finance |
| AI maturity | None before Alex arrived |
| Infrastructure | Azure cloud, Microsoft 365, ServiceNow for IT tickets |
| Data sensitivity | HR policies (personal), IT runbooks (internal), Finance policies (regulated) |

**Why it matters:** NovaTech is a completely typical mid-size company. No AI team, no GPU budget, no AI governance policy. When Alex's project became popular, the company had no infrastructure to support it.

---

## The Core Distinction This Case Study Teaches

### POC vs Enterprise System

| | Proof of Concept (POC) | Enterprise System |
|---|---|---|
| **Primary question** | "Can this idea work?" | "Is this safe, reliable, and compliant for the real world?" |
| **Approach to risk** | Ignored or bypassed to move fast | Every risk identified, assigned, and mitigated before go-live |
| **Accountability** | None — it's a sandbox experiment | Explicit owner per risk, sign-off before launch |
| **Failure mode** | Expected and acceptable | Unacceptable — real users, real data, real consequences |
| **Alex's version** | v0.1 — FastAPI + Chroma + OpenAI, built in 3 days | v1.0 through v2.0 — the rest of this document |

**The key principle:** Enterprises prioritise **proactive accountability over reactive damage control**.

Alex's POC was not wrong. It was correct for its purpose: proving that an HR chatbot could work at NovaTech. The mistake was treating "it worked on Friday with one user" as evidence it was ready for 120 users across three departments on Monday — without anyone sitting down and running a risk list first.

Every risk that caused an incident in Week 2 was **already visible in the code on Friday afternoon**:
- No `dept_id` filter → cross-department leak (Incident A)
- No rate limit + re-embedding bug → $4,200 bill (Incident B)
- No document versioning + no eval → wrong policy answer (Incident C)
- API key in `.env` committed to Git → key scraped (Incident D)

None were surprises. All were foreseeable. The difference between a POC team and an enterprise team is that the enterprise team runs this list **before** opening to users, assigns a name to each risk, and decides: *"We fix this before go-live"* or *"We accept this risk and document why."*

That decision process — not the code, not the model — is what separates a POC from a production system.

---

## 2. The Intern — Alex

Alex is a 6-week AI placement intern, halfway through a Master's in AI/ML. Alex knows:
- Python, FastAPI, basic LangChain
- How to call the OpenAI API
- How to use Chroma (the free, zero-config local vector DB)
- How to demo things effectively

Alex does **not** know (yet):
- Secrets management (stored API key in `.env`, committed to GitHub)
- Tenant data isolation in vector databases
- Async architecture (put embedding inside the HTTP handler)
- Evaluation pipelines (just eyeballed the answers)
- Agent safety (set `while True` with no max_steps)

**This is not Alex's fault.** This is exactly what an intern project looks like. The workshop is about what happens when you scale that.

---

## 3. The Project — NovaAssist v0.1

### What it does
Internal Q&A chatbot. Employees ask questions in plain English; the bot searches uploaded department PDFs and answers using an LLM.

### Stack
```
User (browser)
  ? FastAPI endpoint  [handles upload + embed + retrieve + generate, all synchronously]
  ? OpenAI API        [gpt-4o-mini for both embeddings and generation]
  ? Chroma (local)    [single collection, all departments mixed together]
```

### What works well
- Correct answers 85–90% of the time for HR-only queries with 1 user
- Simple to deploy: `pip install -r requirements.txt && uvicorn main:app`
- Fast to build: ~3 days of coding

### What is dangerously missing
1. **No authentication** — the API endpoint has no auth; anyone with the URL can query any department's documents
2. **No tenant isolation** — all departments share one Chroma collection; no WHERE filter on retrieval
3. **Shared API key in `.env`** — committed to the Git repo (private at the time, but later publicised when Alex shared the project)
4. **No rate limiting** — no per-user quotas, no monthly budget cap, no cost alerts
5. **Re-embedding on every query** — the HTTP handler re-embeds the query AND re-indexes uploaded documents on every request
6. **No evaluation** — Alex judged quality by manually reading 5 responses
7. **No observability** — no logging of retrieval scores, latency, or costs

---

## 4. The Timeline

### Week 1
- Monday–Thursday: Build and iterate
- Friday 3 PM: Demo to HR manager and director
- Result: Standing ovation. "This is brilliant. Can IT and Finance use it too?"
- Alex: "Sure, I'll set it up over the weekend."

### Week 2
- Monday: IT and Finance both upload their PDFs. 120 users have access.
- Tuesday 9:14 AM: **Incident A — Data Leak**
- Wednesday: **Incident B — Cost Spike**
- Thursday: **Incident C — Wrong Policy Answer** (discovered via HR ticket)
- Friday: **Incident D — API Key Scraped**
- Friday afternoon: Alex in emergency meeting with CTO, HR director, IT Security, CFO

---

## 5. The Four Incidents — Full Detail

### Incident A: The Data Leak
**What happened:** An HR employee searched for "remote access policy." NovaAssist returned a chunk from IT's server-access runbook — a document that contained internal IP addresses, VPN configuration, and SSH key instructions.

**Root cause:** Chroma had a single collection. When IT uploaded their runbooks Monday morning, they landed in the same index as the HR PDFs. There was no `department_id` field on any chunk. The retrieval query had no WHERE filter. The cosine similarity between "remote access" in an IT runbook and an HR "remote work policy" was high enough to surface the wrong document.

**Who was affected:** IT Security. The runbook contained internal infrastructure details. GDPR-relevant: cross-department personal data exposure risk.

**The fix:**
- Add `dept_id` metadata to every chunk at ingestion time
- Store in Milvus with one collection per department (or namespace per department)
- Every retrieval query MUST include `WHERE dept_id = :user_dept` from the JWT claim
- Test: try an HR query after ingesting IT docs — zero IT results should come back

**Gap pillar:** Data & Governance (Pillar 1)

---

### Incident B: The Cost Spike
**What happened:** $4,200 charged to the company credit card in 72 hours.

**Root cause breakdown:**
- 62% of the cost was **embedding**, not generation
- Every incoming query re-embedded the query text — fine, that's normal
- But Alex's code also re-embedded the TOP-K retrieved document chunks before sending them to the LLM, "to check freshness" — this was redundant and expensive
- Additionally, when new PDFs were uploaded, the HTTP handler re-processed ALL existing documents synchronously, not just the new ones
- No rate limit: one Finance user wrote a script to batch-query all 2,000 Finance policies to "test the system" — 2,000 queries in 3 hours

**The fix:**
- Move embedding to an async worker (Celery/RQ): upload API returns immediately, embedding happens in background
- Cache query embeddings: compute and store the top-200 most frequent FAQ embeddings
- Deduplicate: track document hash at ingestion; if hash unchanged, skip re-embedding
- Rate limit: 100 requests/minute per user, $2K/month hard cap with alert at 80%
- Self-hosted NIM embedding model: zero marginal cost per embedding after GPU cost

**Cost breakdown at 1,000 queries/day, 100% cloud:**
- Embedding: ~$0.0001 × 1,000 × 30 = ~$3/day ? $90/month
- Generation: ~$0.002 × 1,000 × 30 = ~$60/day ? $1,800/month (this was the minority)
- Re-indexing bug added ~3x multiplier on embeddings ? the actual $4,200 bill

**Gap pillar:** Scale & Cost (Pillar 5)

---

### Incident C: Wrong Policy Answer
**What happened:** An HR employee asked: "How many weeks of parental leave am I entitled to?" NovaAssist answered "8 weeks." The correct answer was 12 weeks. The policy had been updated 2 months earlier — and HR had uploaded the new PDF to NovaAssist when they set it up. But they never deleted the original PDF. The employee submitted their leave request for 8 weeks. HR manager caught it and had to manually correct it — causing a 2-day delay.

**The key point:** Both PDFs were in the database — the old one (8 weeks) and the new one (12 weeks). NovaAssist had the right answer. It just did not return it. The old chunk won the similarity search.

**Root cause — why did the old chunk win?**
The old policy PDF used the exact phrase "entitled to 8 weeks of parental leave." The new policy was rewritten by a lawyer and said "employees are granted a 12-week primary caregiver allowance." The wording changed completely. When the employee asked "How many weeks of parental leave?", the word "parental leave" was an exact term match to the old document's language. The new document used "primary caregiver allowance" — semantically the same, but the cosine similarity score was lower. Old chunk: 0.82. New chunk: 0.71. Old chunk surfaced first. LLM answered based on that.

**Secondary failures:**
- No document versioning: uploading a new PDF should automatically mark old chunks from the same source as `superseded = true`; queries should filter out superseded chunks
- No citation requirement: if the answer had included "Source: parental-leave-policy-2023.pdf (uploaded 14 months ago)", the employee or the HR manager would have questioned the date immediately
- No eval pipeline: a golden test set with the question "current parental leave entitlement" would have caught this discrepancy before go-live
- No confidence gap detection: old chunk scored 0.82, new chunk scored 0.71 — an 11-point gap that should have flagged "conflicting versions present, do not answer"

**The fix:**
- Document versioning: when a new PDF is uploaded for the same source name, mark all old chunks with `superseded = true` and filter them out at retrieval time
- Require citation in every answer: guardrail blocks any response that does not include a chunk ID and its upload date
- Offline eval: 30-question golden set in CI; "parental leave weeks" must return 12, not 8
- Conflict detection: if top-2 chunks contain contradictory numerical values on the same topic, return "I found conflicting versions — please contact HR directly" instead of answering

**Gap pillar:** Observability (Pillar 4) + Data & Governance (Pillar 1)

---

### Incident D: API Key Scraped
**What happened:** Alex had originally stored the OpenAI API key in a `.env` file, which was committed to a private GitHub repository. The repository was made public on Thursday afternoon when Alex shared the project with a friend from university. Within 4 hours, an automated scraper found the key and began making API calls. OpenAI flagged unusual usage and sent an alert at midnight.

**Timeline:**
- 3:47 PM: Repo made public
- 7:52 PM: First scraper call (detected in OpenAI dashboard later)
- 12:13 AM: OpenAI auto-suspended the key (threshold alert)
- 7:00 AM Friday: Alex discovers suspension during morning check
- $147 in additional charges from scraper usage

**The fix (immediate):**
1. Rotate the key immediately — assume it was used maliciously
2. Make repo private again
3. Add `.env` to `.gitignore` and remove from git history (`git filter-branch` or BFG)

**The fix (permanent):**
- API key in Azure Key Vault, accessed via managed identity (no key in code)
- Pre-commit hook: `detect-secrets` scanner blocks any commit with API key patterns
- CI pipeline: `trufflehog` or `gitleaks` scans every pull request
- Principle: the application reads secrets from environment variables injected at runtime by the secret store — never stored in files, never in config

**Gap pillar:** Security (Pillar 2)

---

## 6. The Evolution Arc

### v0.1 ? v1.0: Fix RAG
**Main changes:**
- Async worker (Celery) for PDF ingestion — HTTP handler no longer embeds
- Milvus with dept namespace replacing flat Chroma
- NIM Embed service replacing OpenAI embedding for all chunks
- Cross-encoder reranker added to query path
- NeMo Guardrails: require citation, block PII in output, reject off-topic queries (see Section 10 for full detail)
- LangSmith observability: traces every request
- 30-question offline eval golden set in CI

**Result:** Wrong-answer rate halved. Cost reduced from $4,200 to $840/month (same traffic). HR signed off. IT Security signed off. CFO signed off conditionally (cap still required).

**What didn't change:** The LLM model stayed as gpt-4o-mini. Not GPT-4. Not fine-tuning. Retrieval fixes, not model upgrades.

---

### v1.0 ? v1.5: Add Agents
**Trigger:** IT asks: "Can it open a ServiceNow ticket when an employee asks for help?"

**Main changes:**
- LangGraph orchestrator replacing Python `while True` loop
- Tool registry with JSON Schema validation
- Policy engine: `search_docs` and `lookup_asset` = auto; `create_ticket` = human approval + idempotency key
- Audit log: every step logged with 90-day retention
- `max_steps=8`, `timeout=30s`, `cost_cap=$0.50/session`

**The incident that forced this:** Before the policy engine was added, Alex tested the agent overnight. The agent created 12 duplicate ServiceNow tickets for the same request — the loop ran 47 iterations without hitting a stop condition. IT team spent 4 hours cleaning up.

---

### v1.5 ? v2.0: Fix Inference
**Trigger:** CFO mandates: "Cap AI spend at $2,000/month, prove ROI or shut it down."

**Main changes:**
- Self-hosted NIM embedding model on a shared GPU (replaces cloud embedding calls)
- Top-200 FAQ query embedding cache (Redis)
- Complexity router: intent classifier (Llama-8B NIM, $0 marginal) routes queries
  - FAQ queries (80% of traffic) ? Llama-8B NIM self-hosted
  - Complex reasoning / agent steps (20%) ? gpt-4o-mini cloud
- API Gateway with rate limiting (100 req/min/user) and $2K/month hard cap
- Cost dashboard: $/query per department, daily email to CFO

**Result:** Monthly cost at 1,000 queries/day: $1,840/month. Under the $2K cap. CFO approved continued operation and added budget for v3.0 planning.

---

## 7. The 5-Layer Platform NovaAssist v2.0 Runs On

| Layer | What it does | NovaAssist component |
|-------|-------------|---------------------|
| **Experience** | UI, APIs, auth gateway | React chat UI + FastAPI + Azure AD SSO |
| **Orchestration** | Agents, workflows, policy, human-in-the-loop | LangGraph + policy engine + Slack approval UI |
| **AI Services** | RAG pipeline, embeddings, LLM, guardrails | NIM Embed + Milvus retriever + Reranker + NIM LLM + NeMo Guardrails |
| **Data** | Vector DB, docs, structured data | Milvus (dept namespaces) + Blob storage + SQL (HR/Finance) |
| **Platform** | Auth, observability, CI/CD, secrets, cost mgmt | Azure Key Vault + LangSmith + GitHub Actions + cost dashboard |

---

## 8. The Stakeholders — What Each One Needs to See

### HR Sponsor
- **Concern:** "One wrong answer could become an HR incident. Every answer must cite its source and be traceable."
- **What satisfied them:** NeMo Guardrails requiring citation + offline eval showing faithfulness > 0.85
- **What would kill the project:** Any answer without a cited source chunk in production

### IT Security
- **Concern:** "Finance documents cannot appear in HR queries. Every query must be logged with user identity for 90 days."
- **What satisfied them:** Milvus dept namespace + JWT dept_id filter in every query + LangSmith audit log
- **What would kill the project:** Any cross-department retrieval in production, or logs disappearing

### CFO
- **Concern:** "Show me the bill every week. Cap it at $2K/month. If you go over without warning, the project is cancelled."
- **What satisfied them:** Cost dashboard + $2K hard cap in API gateway + daily email summary
- **What would kill the project:** Unexplained cost spikes (like the $4,200 incident) with no warning

### Platform Team
- **Concern:** "Alex leaves in 6 weeks. This can't be a one-off script no one can maintain. Build it like a feature, not a hack."
- **What satisfied them:** The 5-layer platform architecture, ADRs, documented NFRs, IaC templates
- **What would kill the project:** "Only Alex knows how it works"

---

## 9. Architectural Decision Records (ADRs) in NovaAssist

These are the 3 main decisions Alex documented as ADRs:

### ADR-001: Milvus over Chroma
- **Context:** Need tenant isolation after IT/HR data leak. Chroma has no native multi-tenancy.
- **Decision:** Migrate to Milvus on Kubernetes. One collection per department. dept_id on every chunk.
- **Consequences:** +2 days migration effort. Gain: zero cross-tenant retrieval risk. Cost: operational complexity of running Milvus.

### ADR-002: Async ingestion worker
- **Context:** Synchronous embedding in HTTP handler caused timeouts and the $4,200 re-embedding bug.
- **Decision:** Add Celery worker. Upload endpoint returns 202 (accepted) immediately. Embedding happens async.
- **Consequences:** Users see "processing" status instead of instant confirmation. Gain: no more timeouts, no more HTTP thread blocking. Eliminates re-embedding cost.

### ADR-003: LangGraph over while-loop agent
- **Context:** Python while-loop agent ran 47 iterations overnight, created 12 duplicate tickets.
- **Decision:** Replace with LangGraph state machine. max_steps=8, timeout=30s, cost_cap=$0.50/session.
- **Consequences:** Learning curve for team. Gain: every step is a logged state transition, bounded cost, clean abort on limit. Eliminates infinite loop risk.

---

## 10. Offline vs Online Eval — What Each One Catches

### Why AI systems need a different approach than traditional software

For traditional software, the deployment lifecycle is linear:

```
Unit Tests → Deploy → Done
```

For AI systems, the world keeps moving after you deploy:

```
Tests pass → Deploy → Knowledge changes
                      Users change
                      Prompts change
                      Models change
                         ↓
                   Quality degrades
```

That is why online evaluation exists. It is not a replacement for offline testing — it is the gate that covers everything offline testing cannot see.

### The core distinction

| | Offline eval | Online eval |
|---|---|---|
| **When it runs** | In CI, before every deploy | Continuously in production |
| **What it tests** | Known questions with known correct answers | Real user queries, real traffic |
| **What it catches** | Regressions *you introduced* (prompt change, model swap, chunk size change) | Production drift *the world introduced* (updated documents, unexpected query patterns, cost spikes) |
| **How fast** | Minutes (automated) | Immediate (live signals) |
| **Tool in NovaAssist** | LangSmith eval datasets + RAGAS faithfulness scorer | LangSmith traces + thumbs-down feedback |

### Why offline evaluation alone is not enough — a concrete example

Consider NovaAssist's parental leave scenario.

Offline test (written in Month 1):
> Q: How many weeks of parental leave do I get?
> A: 12 weeks — **PASS**

You deploy. The tests pass. Two weeks later, HR uploads a revised policy PDF with the new entitlement. The old PDF is never deleted from Milvus — both versions now coexist. The new document uses different wording chosen by a lawyer. When a user asks "How many weeks of parental leave?", the old chunk scores higher in cosine similarity (0.82 vs 0.71) because the wording matches better. NovaAssist answers from the old chunk:

> 8 weeks — **WRONG**

Offline evaluation still reports 100% accuracy, because nobody re-ran the tests after the new PDF was uploaded. The tests were passing against the correct answer in CI — but in production, the wrong chunk ranked first. This is exactly Incident C.

The key point: **offline eval can only catch regressions in things you control**. It cannot detect that a new document was uploaded alongside an old one, or that vocabulary drift in the new version caused the wrong chunk to rank higher.

### Offline eval in NovaAssist

HR's manager and IT lead contributed 30 questions with verified correct answers — things like "How many vacation days does a senior engineer get?", "What is the VPN reset procedure?", "What is the parental leave entitlement?" (answer must be 12 weeks, not 8).

Before any deploy, the CI pipeline runs all 30 questions through the live RAG stack and checks:
- **Faithfulness score** (via RAGAS): is every claim in the answer supported by a retrieved chunk? Must be ≥ 0.85 or deploy is blocked.
- **Citation presence**: does the answer include a source document name and upload date? Checked by NeMo Guardrails rule.
- **Exact-match for numerical answers**: "12 weeks" not "8 weeks". Catches document versioning failures before go-live.

If any check fails, the GitHub Actions pipeline fails and the deploy does not proceed.

### Online eval in NovaAssist — the 7 signals

Online evaluation does not check whether an answer exactly matches expected text. It asks: *"Is the system behaving normally?"*

NovaAssist tracks these signals continuously in LangSmith:

---

**Signal 1 — User Feedback (thumbs-down rate)**

The simplest signal. Every response has a thumbs-up / thumbs-down button. LangSmith aggregates by topic cluster.

Example from NovaAssist:

| Week | Parental Leave Questions | Downvotes |
|------|--------------------------|-----------|
| 1 | 100 | 2 |
| 2 | 120 | 3 |
| 3 | 115 | 35 |

Week 3 spike — something changed. Nobody needs to read logs. The metric reveals the problem before HR files a support ticket.

---

**Signal 2 — Retrieval Quality Drift**

Every query logs the cosine similarity score of the top retrieved chunk. Normal range in NovaAssist: 0.78–0.85.

Example drift:

> Query: "What is parental leave?"
> Month 1 — Chunk #1 similarity: **0.84** (good)
> Month 2 — Chunk #1 similarity: **0.61** (alert)

A drop like this across many queries usually means: documents were updated or replaced in the source system but the new versions were never ingested into Milvus. The LLM is fine. The retrieval layer is stale.

Concrete example: HR uploads `Parental Leave Policy 2026.pdf` to SharePoint but nobody triggers the ingestion pipeline. Milvus still holds only the 2025 version. Queries that used to match cleanly now return lower similarity because the vocabulary in user questions has drifted away from the outdated document. Similarity drops. Online evaluation catches it.

Note: this is a **different failure mode from Incident C**. In Incident C, the new document *was* ingested — but the old one was never deleted. Both coexisted, and the old chunk won the similarity race due to vocabulary mismatch. Retrieval score drift would not have flagged Incident C because the old chunk still scored 0.82. What would catch Incident C is document versioning (filtering out superseded chunks) combined with an offline eval that checks the answer against the current policy, not just whether a chunk was returned.

A LangSmith alert fires when the 7-day rolling average drops below 0.70.

---

**Signal 3 — Context Relevance**

Measures whether retrieved chunks were actually relevant to the question. If a query about parental leave retrieves HR policy + travel expenses + VPN guide, only one chunk is useful.

| Period | Average relevance score |
|--------|------------------------|
| Month 1 | 0.82 |
| Month 3 | 0.63 |

A drop like this suggests chunking strategy has degraded, embedding model has drifted, or new documents are polluting the namespace.

---

**Signal 4 — Hallucination Rate**

A second LLM (the judge) reads each response alongside the retrieved context and asks: *"Is this answer supported by the context?"*

Example:
> Context says: leave = 30 days
> Answer says: leave = 45 days
> Judge verdict: **Unsupported**

NovaAssist alert thresholds:

| Hallucination rate | Status |
|--------------------|--------|
| ≤ 3% | Normal |
| 8% | Warning |
| 15% | Alert — block deploys |

---

**Signal 5 — Cost per Query per Department**

Every query has a measurable token cost. Normal range in NovaAssist: ~2,000 tokens / $0.02 per HR query.

Example alert:
> Finance department: 40,000 tokens / query — $0.50/query

Investigation finds a batch script calling the assistant 5,000 times per hour (Incident B pattern). The API Gateway rate limiter catches it in real time, but the cost dashboard makes it visible before the monthly CFO report.

---

**Signal 6 — Latency (P50 / P95 / P99)**

Track response time percentiles, not just the average. An average of 2 seconds can hide a p99 of 10 seconds, which is what a small subset of users experiences.

Common causes of latency spikes in NovaAssist:
- Vector DB slow (Milvus index not optimised)
- LLM provider degraded
- MCP tool timeout in the agent pipeline
- Prompt explosion (context window too large)

---

**Signal 7 — Agent Success Rate** *(for NovaAssist v1.5 onwards)*

Agent pipelines have multiple steps. Each step can fail independently. Track success rate at the workflow level, not just step level.

Example: Create Offer Workflow = Retrieve Customer → Calculate Price → Generate Excel → Generate Word

| Period | Success rate |
|--------|-------------|
| Week 1 | 97% |
| After deploy | 72% |

A drop from 97% to 72% tells you a specific step broke — investigate the step-level trace in LangSmith.

---

### What LangSmith stores per request

For every query through NovaAssist, LangSmith logs:

```
Question
Retrieved documents
Similarity scores
Prompt sent to model
Model used
Token count
Cost
Latency
Final answer
User feedback (thumbs)
```

Dashboards then aggregate:
- Average similarity (retrieval health)
- Average cost (budget tracking)
- Average latency (performance)
- Thumbs-down rate (user satisfaction)
- Hallucination score (answer quality)

### Why you need both

- **Offline only**: catches regressions *you introduced*, misses changes *the world introduced*. Incident C (old chunk winning over new due to vocabulary mismatch) would not be caught by offline eval — the golden test set tests that the *answer* is correct, not that the *right chunk ranked first*. After HR uploaded the new PDF alongside the old one, the tests still passed in CI because they were run in isolation, not against the live Milvus index with both documents in it. The problem was in production data, not in the code.
- **Online only**: no gate before deploy. A prompt change that drops faithfulness from 0.88 to 0.72 ships to production and only real users discover it.
- **Both**: offline catches what you broke before it ships; online catches what the world broke after it shipped.

---

## 11. NeMo Guardrails — What It Is and How NovaAssist Uses It

### What is NeMo Guardrails?
NeMo Guardrails is an open-source framework from NVIDIA that wraps around any LLM call and enforces a set of rules written in a language called **Colang**. Think of it as a policy layer that sits between your application and the model: every prompt goes in, Guardrails checks the rules, and the response either passes through, gets modified, or is blocked entirely.

It adds roughly 30–80 ms of latency. In exchange, you get programmable, auditable control over what the model can and cannot say.

### The three rules NovaAssist uses

**Rule 1 — Require citation**

Every response must reference the exact chunk it retrieved — the source document name and its upload date. If the LLM generates an answer without a citation, Guardrails blocks the response and returns a fallback: *"I found relevant information but could not confirm a source. Please contact HR directly."*

Why this matters: this is what finally got HR to sign off on v1.0. Before this rule, they had no way to verify an answer. After it, every answer in production comes with a traceable source.

```
define flow check citation
  if not $response contains "Source:"
    $response = "I found relevant information but could not confirm a verified source. Please contact HR directly."
```

**Rule 2 — Block PII in output**

NovaAssist retrieves chunks from HR and Finance PDFs. Those PDFs sometimes contain employee names, salary bands, or NI/SSN numbers in the surrounding context. Guardrails scans the LLM output for patterns matching personal data (names next to salary figures, ID number formats) and redacts them before the response reaches the user.

Why this matters: even if retrieval isolation (Pillar 1) is working correctly, a single chunking edge case could pull a salary band adjacent to an employee's name. Guardrails is the last line of defence before the response leaves the system.

**Rule 3 — Reject off-topic queries**

NovaAssist is scoped to HR, IT, and Finance policies. If a user asks about anything outside that scope — stock prices, personal advice, coding questions, competitor products — Guardrails intercepts the query before it even reaches the LLM and returns: *"I'm only able to answer questions about NovaTech's internal HR, IT, and Finance policies."*

Why this matters: without this rule, the LLM would happily answer off-topic questions using its general training knowledge, burning tokens and API budget, and potentially giving advice the company has not sanctioned.

### How it fits in the v1.0 architecture
```
User query
  → Auth (JWT check, dept_id extracted)
  → NeMo Guardrails [input check: topic scope, jailbreak patterns]
  → Milvus retrieval [WHERE dept_id = :user_dept]
  → Reranker
  → LLM (gpt-4o-mini)
  → NeMo Guardrails [output check: citation present, PII scan]
  → Response to user
```

Guardrails runs twice — once on the input (topic check) and once on the output (citation + PII check).

### Cloud/non-NVIDIA equivalent
If the team is not on NVIDIA infrastructure, the equivalent patterns are:
- **Azure AI Content Safety** — input/output content moderation as a managed service
- **AWS Bedrock Guardrails** — same concept, native to AWS
- **LangChain output parsers + custom validators** — code-level equivalent, less structured but fully portable
- **Prompt injection defence** — any of the above can be combined with a system prompt hardening pattern

---

## 12. Observability — LangSmith vs Langfuse

NovaAssist v1.0+ uses **LangSmith** for observability. This is LangChain's own tracing and evaluation platform, and since NovaAssist already uses LangGraph (LangChain's agent framework), LangSmith requires almost zero additional instrumentation — every chain step, tool call, retrieval, and LLM call is automatically traced.

### What LangSmith gives you in NovaAssist

| Signal | How it's used |
|--------|--------------|
| **Retrieval scores per query** | See exactly which chunks surfaced, their similarity scores, and reranker scores. Detect the "old chunk wins" problem (Incident C) before it reaches users. |
| **LLM token counts + cost per request** | Feeds the CFO cost dashboard. Alerts when $/query drifts above threshold. |
| **End-to-end latency trace** | Per-step breakdown: embedding ms, retrieval ms, reranker ms, LLM ms. Identify bottlenecks. |
| **Guardrail block rate** | How often is Guardrails blocking responses? A spike means either a policy issue or a retrieval quality problem. |
| **Thumbs up/down feedback** | Users rate answers; LangSmith stores these alongside the trace for offline eval review. |
| **Golden set eval runs** | The 30-question CI eval set runs against LangSmith's eval framework. Faithfulness and citation scores are tracked over time. |

### Why not Langfuse?
Both tools do the same job. Langfuse is open-source and self-hostable (better for strict data residency). LangSmith has tighter native integration with LangChain/LangGraph and a more polished UI for prompt playground and eval datasets. If NovaTech's data governance team requires that traces never leave their own infrastructure, Langfuse self-hosted is the better choice. For most teams starting out, LangSmith is faster to set up.
