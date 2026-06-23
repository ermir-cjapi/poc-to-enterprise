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
**What happened:** An HR employee asked: "How many weeks of parental leave am I entitled to?" NovaAssist answered "8 weeks" based on an older version of the policy PDF. The actual current policy was 12 weeks (updated 2 months earlier, new PDF not yet uploaded by HR). The employee submitted their leave request for 8 weeks. HR manager caught it and had to manually correct it — causing a 2-day delay.

**Root cause:**
- No document versioning: old and new PDFs both in Chroma, old chunks surfacing because they had higher embedding similarity
- No guardrail requiring citation of the source chunk and its upload date
- No eval: Alex had never tested "what if there are two versions of the same policy?"
- No confidence threshold: a low-confidence retrieval was treated identically to a high-confidence one

**The fix:**
- Require citation in every answer: guardrail rule blocks responses that don't cite a chunk ID and upload date
- Document versioning: when a new PDF is uploaded for the same source document, mark old chunks as superseded
- Offline eval: 30-question golden set in CI that tests answers against known correct policy versions
- Confidence threshold: if top retrieved chunk score < 0.65, respond "I found relevant documents but my confidence is low — please contact HR directly"

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
- NeMo Guardrails: require citation, block PII in output, reject off-topic queries
- Langfuse observability: traces every request
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
| **Platform** | Auth, observability, CI/CD, secrets, cost mgmt | Azure Key Vault + Langfuse + GitHub Actions + cost dashboard |

---

## 8. The Stakeholders — What Each One Needs to See

### HR Sponsor
- **Concern:** "One wrong answer could become an HR incident. Every answer must cite its source and be traceable."
- **What satisfied them:** NeMo Guardrails requiring citation + offline eval showing faithfulness > 0.85
- **What would kill the project:** Any answer without a cited source chunk in production

### IT Security
- **Concern:** "Finance documents cannot appear in HR queries. Every query must be logged with user identity for 90 days."
- **What satisfied them:** Milvus dept namespace + JWT dept_id filter in every query + Langfuse audit log
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
