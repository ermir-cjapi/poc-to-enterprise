# Presenter Prep Guide
## Read this before presenting the workshop

This document tells you exactly what to read, what to understand, and what to practise before standing in front of the room. Estimated prep time: 2–3 hours.

---

## Step 1 — Read these two documents first (30 minutes)

| Document | What you get |
|----------|-------------|
| `case-study/nova-assist.md` | The full NovaAssist story: company, intern, stack, all 4 incidents with root causes and fixes, the evolution arc, stakeholder concerns, ADRs |
| `FACILITATOR.md` | Slide-by-slide script: what to say, what to ask, what answers to expect, timing |

Read them in that order. The case study first so you understand the material; the facilitator guide second so you understand how to use it.

---

## Step 2 — Click through the presentation yourself (45 minutes)

Open `index.html` in Chrome. Go through every slide without an audience. For each interactive element:

### Click every SVG box in every diagram
The diagrams have popups that explain what each component does and what breaks without it. You need to know these before the session. Pay attention to:
- v0.1 POC diagram (Part 0): why Chroma and OpenAI boxes are dangerous
- RAG enterprise diagram (Part 2): what Milvus namespace and reranker do specifically
- Agent diagrams (Part 3): what the policy engine prevents
- Inference diagrams (Part 4): how the router works

### Try every interactive activity
1. **Poll (Part 0):** Pick 3 risks. Practice how you'll debrief it.
2. **Architecture Builder (Part 2):** Click all 6 buttons in order. Know what each layer explains.
3. **Spot the Gap (Part 2):** Find all 3 circles. Know the incident for each.
4. **Tool Policy Game (Part 3):** Classify all 6 tools. Know the correct answers and the reasoning.
5. **Cost Simulator (Part 4):** Try: 1000 queries/day, 20% cloud, 70% cache — that's NovaAssist v2.0. Show it.
6. **Worksheet (Part 5):** Fill it in for a hypothetical project you invent right now. This shows you how students will experience it.
7. **Checklist (Part 6):** Click "Copy to clipboard". Paste it somewhere. Know what all 16 items mean.

### Press S for speaker notes
Open notes in a second window. Read them for each slide — they contain extra context and transition lines.

---

## Step 3 — The five things you must be able to explain without slides

Practice saying these out loud before the session:

### 1. Why the POC is not wrong
*"The POC is correct for week 1 with 1 user and 1 department. The mistake is calling it production on Monday. Architecture decisions are triggered by scale and stakeholder pressure — not by best practices people memorise."*

### 2. The retrieval-before-model principle
*"Fix retrieval before upgrading the model. NovaAssist went from 61% to 89% retrieval precision — by adding a reranker. Same model. No fine-tuning. The LLM writes fluent text; the vector DB decides whether it has the right context. If the context is wrong, a better LLM just writes wrong answers more confidently."*

### 3. Why agents fail differently than chatbots
*"Chatbots produce wrong text. Agents take wrong actions in the real world. 12 duplicate ServiceNow tickets is not a wrong paragraph — it is 4 hours of IT cleanup. Agents need policy engines, not just better prompts."*

### 4. The CFO-forced architecture pattern
*"The CFO gave a business constraint: $2,000/month cap. That constraint is what drove the self-hosted NIM decision, the query router, the embedding cache. Business pressure drives architecture. The architecture decision is not 'what's technically best' — it is 'what satisfies all stakeholders simultaneously.'"*

### 5. The six-pillar checklist
Be able to name all 6 pillars from memory and give the NovaAssist incident for each:
1. Data & Governance ? IT/HR leak (no dept_id)
2. Security ? API key in GitHub, no auth
3. Reliability ? OpenAI timeout = 500 error, no fallback
4. Observability ? "it feels worse" — no eval data
5. Scale & Cost ? $4,200 / 72 hours, sync embedding
6. MLOps/LLMOps ? prompt changed by copy-paste, no version

---

## Step 4 — Answers to all quiz questions (memorise or bookmark)

| Quiz | Correct | One-line explanation |
|------|---------|---------------------|
| gap-q1: HR retrieves IT runbook | Data & Governance | No dept_id namespace in Chroma |
| gap-q2: quality drop after prompt change | Observability | No offline eval set |
| gap-q3: API key scraped | Security | Rotate + Key Vault + secret scanner in CI |
| rag-q1: eval strategy | Both offline + online | Offline CI gate + online production monitoring |
| agent-q1: 12 duplicate tickets | Policy + idempotency + max_steps | Human approval gate on create_ticket |
| infer-q1: 2,000 PDFs updated weekly | RAG + ingestion | Fine-tuning on weekly-changing docs = always stale |
| final-q1: SSO + traces + CI/CD | Platform Layer | Cross-cutting concerns live at platform layer |
| final-q2: fluent text, wrong chunks | Fix retrieval (reranker) | Model upgrade is not the answer |
| final-q3: 12 duplicate tickets | max_steps + idempotency + gate | Same as agent-q1 |
| final-q4: $4K bill, 8s p99 | Cache + NIM routing | Route FAQ to self-hosted, cache embeddings |
| final-q5: IT/HR leak ? which pillar | Data & Governance (Pillar 1) | Not MLOps, not cost — data isolation |

---

## Step 5 — Terms to know

You don't need to know how to code these. You need to be able to explain the concept:

**RAG (Retrieval-Augmented Generation)**  
A pattern where the LLM's answer is grounded in documents retrieved from a database, not just from training data. The quality depends equally on retrieval quality and generation quality. Most RAG failures are retrieval failures, not LLM failures.

**Vector database (Chroma, Milvus, Qdrant)**  
A database that stores documents as mathematical vectors (embeddings) and finds similar documents using approximate nearest-neighbour search. Think: semantic Google search over your own documents. The critical enterprise requirement: tenant isolation — each user or department can only search their own vectors.

**Embedding**  
A mathematical transformation of text into a list of numbers (a vector) that represents its meaning. Similar meanings = similar vectors = similar positions in vector space. Computed by a model (e.g., OpenAI `text-embedding-3-small` or NVIDIA NIM `nv-embed-v2`).

**Reranker (cross-encoder)**  
A second-stage relevance model that looks at a query AND a retrieved chunk together, producing a precise relevance score. Runs after vector retrieval on the top-K candidates (e.g., top 20 ? keep best 3). Much more accurate than pure vector similarity but slower.

**NeMo Guardrails**  
NVIDIA's open-source library for adding safety rules to LLM pipelines using a domain-specific language called Colang. Rules like: "require citation", "block off-topic questions", "reject PII in output". Runs in the output path, adds ~50ms latency.

**NIM (NVIDIA Inference Microservices)**  
Pre-built, GPU-optimised Docker containers for running AI models. Pull the container, give it a GPU, get an API endpoint. Same OpenAI-compatible API surface — swap `openai.ChatCompletion` for your NIM URL and it works. Examples: Llama-3.1-8B-Instruct NIM, nv-embed-v2 NIM.

**LangGraph**  
Python library for building stateful, graph-based agent workflows. You define nodes (call LLM, call tool, check policy) and edges (conditional transitions). Prevents infinite loops by design; every step is a logged state transition.

**Langfuse**  
Open-source LLM observability platform. Instruments your LLM calls to capture: inputs, outputs, retrieved chunks, retrieval scores, latency, token counts, costs. Provides the data for both offline eval and online monitoring.

**ADR (Architecture Decision Record)**  
A short document (typically 1 page) that records: Context (what situation forced a decision?), Decision (what did we decide?), Consequences (what does this enable and what does it cost?). Standard practice at Amazon, Google, and most large engineering teams.

**Idempotency key**  
A unique identifier for an operation that guarantees the operation only happens once, even if the request is sent multiple times. For `create_ticket`: hash(user_id + intent + timestamp_rounded_to_5min). If a ticket with this hash was created in the last 5 minutes, return the existing ticket ID. Prevents duplicate ticket creation from agent retry loops.

**Faithfulness (RAG eval metric)**  
Measures whether every claim in the generated answer is supported by the retrieved documents. Checked by a judge LLM: "Is this claim found in the context?" Score 0–1. A faithfulness score of 1.0 means the answer contains nothing the documents don't support.

**Tenant isolation**  
The principle that data belonging to one user, department, or organisation cannot be accessed by another. In vector databases: each tenant gets their own collection or namespace; every retrieval query filters on tenant ID extracted from the authenticated request.

---

## Step 6 — Concepts you only need at a high level

These appear on the slides but you don't need deep expertise to present them:

**Triton Inference Server** — NVIDIA's production-grade serving system for ML models. Think: Kubernetes for model serving. Handles batching, concurrent requests, GPU memory management. Mentioned as the NVIDIA pattern; cloud equivalents are Azure OpenAI PTU, Bedrock, Vertex.

**Feature store** — A database for ML input features, shared across training and inference to avoid data skew. NovaAssist doesn't use one (it's a RAG system, not a trained model). Mentioned in the data layer as a pattern for future ML features.

**Azure AD / Okta** — Identity providers for SSO (Single Sign-On). When a user logs in, they get a JWT (JSON Web Token) that contains their identity and claims (like `dept_id = HR`). Every API request carries this JWT. The backend validates it before processing.

**Key Vault (Azure) / Secrets Manager (AWS)** — Managed secret stores. Your application's startup code reads the API key from Key Vault at runtime — the key is never in your codebase, never in environment variable files committed to git.

---

## Step 7 — Questions to ask yourself before the session

Run through these mentally the morning of the session. If you can't answer one, re-read the relevant section.

1. What are the four incidents that happened to NovaAssist in Week 2?
2. What one change fixed the IT/HR data leak?
3. Why did NovaAssist's precision go from 0.61 to 0.89 without changing the model?
4. What is the tool policy for `create_ticket` and why?
5. What percentage of NovaAssist's bill was embedding vs generation?
6. What does the CFO need to see to keep the project alive?
7. Name the five layers of the NovaAssist v2.0 platform.
8. What is an ADR and what are NovaAssist's three main ones?
9. What metrics does NovaAssist track offline vs online?
10. If an intern asks "do I need all of this for my project?", what do you say?

---

## Step 8 — Optional deeper reading (if you want to go further)

These are real resources that the workshop concepts are based on. You do not need to read these to present — but they are good if you want to go deeper on a topic students ask about.

| Topic | Resource |
|-------|---------|
| RAG eval | [RAGAS library docs](https://docs.ragas.io) — covers faithfulness, answer relevance, context precision |
| Agent patterns | [LangGraph docs](https://langchain-ai.github.io/langgraph/) — state machines for agents |
| NVIDIA patterns | [NVIDIA AI Blueprint: RAG](https://www.nvidia.com/en-us/ai-data-science/ai-workflows/) — reference architecture |
| NeMo Guardrails | [GitHub: NVIDIA/NeMo-Guardrails](https://github.com/NVIDIA/NeMo-Guardrails) |
| LLM observability | [Langfuse docs](https://langfuse.com/docs) — tracing, evals, cost tracking |
| ADR format | [GitHub: joelparkerhenderson/architecture-decision-record](https://github.com/joelparkerhenderson/architecture-decision-record) |
| Secret scanning | [detect-secrets](https://github.com/Yelp/detect-secrets) — pre-commit hook |
| Inference cost | [OpenAI pricing page](https://openai.com/pricing) — understand token costs |

---

## Checklist: You Are Ready to Present When...

- [ ] You can name all 4 NovaAssist incidents and their root causes
- [ ] You can explain all 6 gap framework pillars with a NovaAssist example for each
- [ ] You have clicked through every interactive element in the presentation
- [ ] You know the correct answer to every quiz question
- [ ] You can explain what a reranker does in plain English (no code)
- [ ] You can explain why `create_ticket` needs a human approval gate
- [ ] You can operate the cost simulator and find the "NovaAssist v2.0" setting
- [ ] You have done a dry run of the live request trace on slide 26 (Part 5)
- [ ] You have a plan for what to do if students ask to write code instead of discuss architecture
