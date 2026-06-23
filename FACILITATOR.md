# Facilitator Guide — POC to Enterprise AI Workshop
## Slide-by-slide script with timing, what to say, and what to expect

**Audience:** AI university interns  
**Duration:** 90–120 minutes  
**Before you start:** Read `PRESENTER-PREP.md` and `case-study/nova-assist.md` first.  
**Technical:** Just open `index.html` in a browser — diagrams are embedded, no server needed.

---

## The one thing to keep in mind throughout

You are not teaching technology. You are teaching **how engineers make decisions when real problems hit real users**. NovaAssist is the vehicle. Every slide connects back to: "What broke? Why? What decision fixes it?"

---

## SETUP — Before the room fills (5 min)

1. Open `index.html` in Chrome or Edge (double-click it — no server needed now)
2. Press **F** for fullscreen
3. Press **S** to open the speaker notes window on your second screen (or phone)
4. Navigate to the Title slide
5. Check the progress bar at the top is showing "0/0" — if not, click "Reset progress" (bottom-right)

**Room setup tip:** If students have laptops, ask them to open the same file. They can participate in quizzes directly on their own screens alongside you.

---

## SLIDE 1 — Title: "From POC to Enterprise"
**? 1 minute**

**Say:** *"Today we follow one intern project from a Friday demo to a production enterprise system. Not syntax, not APIs — decisions. Every diagram on this deck is clickable: tap any box to see what it does and what breaks without it."*

**Don't say:** Anything about NVIDIA yet. Let it appear naturally in diagrams.

**Transition:** Arrow right to Agenda.

---

## SLIDE 2 — Agenda
**? 2 minutes**

Read through the agenda quickly. Emphasise two things:

1. *"One case study threads through everything — you'll know this project inside out by the end."*
2. *"Parts 2, 3, and 4 each have an activity where you build or decide something — not just watch."*

**Transition:** *"Let me introduce the project."*

---

## CASE STUDY SLIDES (3 slides)

### Slide 3 — Meet NovaAssist
**? 4 minutes**

**Say:** *"Alex is an AI intern at NovaTech — 800-person B2B SaaS company. Week 1: Alex builds a chatbot over HR PDFs using FastAPI, Chroma, and OpenAI. Uploads 50 PDFs, runs a demo Friday afternoon. HR manager asks about vacation days. Gets the right answer. Applause. 'Ship it Monday.'"*

**Ask the room:** *"Who has built something exactly like this — a chatbot, RAG app, or LLM project over some documents?"* (pause for hands)

*"Every incident Alex is about to face is based on a real production failure. Names changed."*

**Key point to land:** The POC is not wrong. It is correct for week 1. The mistake is treating it as production.

---

### Slide 4 — What Happened in Week 2
**? 3 minutes**

Point at each metric card as you read it. Let the numbers land:
- **$4,200** — "In 72 hours. Not a monthly bill. Three days."
- **1 cross-dept leak** — "HR employee retrieved an IT server runbook."
- **1 wrong policy answer** — "An employee took wrong parental-leave guidance and acted on it."
- **1 API key in GitHub** — "Scrapers found it in 4 hours."

**Say:** *"Enterprise architecture is not a checklist you memorise. It is a sequence of decisions triggered by real failures, under stakeholder pressure. That's what we're practising today."*

---

### Slide 5 — Who Cares About What?
**? 3 minutes**

Read each stakeholder quote aloud as if you are that person. Change your tone slightly for each.

**Key insight to say aloud:** *"Notice — every stakeholder is worried about a different thing. HR cares about correctness. Security cares about isolation. CFO cares about money. Platform team cares about reusability. Your architecture must satisfy all four simultaneously. That is the actual job."*

**Transition:** *"Let's look at the POC that caused all of this."*

---

## PART 0 — HOOK (3 slides)

### Slide 6 — Friday Demo: Everyone Claps
**? 4 minutes**

**What's on screen:** The v0.1 POC diagram — User ? FastAPI ? OpenAI ? Chroma.

**Do first:** Click on "Chroma" in the diagram. Read the popup aloud. Then click "OpenAI". Read it aloud.

**Say:** *"This architecture is perfectly reasonable for a proof of concept with one user and one department. The problem is not the code — the problem is calling it production."*

**Point at the red text at the bottom:** *"No auth, no isolation, no rate limit, no eval, no guardrails. That is the list of things that are invisible when you demo alone on a Friday."*

**Transition:** Arrow down to the Monday slide.

---

### Slide 7 — Then 120 Users Show Up
**? 3 minutes**

Read each incident box aloud, slowly.

**Incident A:** *"Tuesday 9:14 AM. HR employee asks about remote work policy. NovaAssist returns a chunk from IT's internal server-access runbook — because Chroma had one flat collection, no department filter. IT Security is on the phone before 10 AM."*

**Incident B:** *"Wednesday. Alex checks the OpenAI dashboard. $4,200 in 72 hours. No rate limits. Every single query re-embeds the entire document set on every call. Finance kills the credit card that afternoon."*

**Pause. Ask the room:** *"What went wrong? Not in tech terms — in business terms. Who is hurt, and how?"* (Let 2–3 people answer.)

---

### Slide 8 — Risk Poll (interactive)
**? 5 minutes**

**How it works:** Students click up to 3 options on screen. Buttons highlight when selected. Clicking "Submit my top 3" locks their answer and shows a confirmation. If projecting on a shared screen, ask for a show of hands alongside and click with the audience.

**Say to open:** *"You are now Alex's architecture advisor. It's Monday morning. 120 users, 3 departments, shared API key, no auth — and two incidents already happened. Pick your top 3 risks."*

**While they select, stay quiet.** Let them read and think. Don't pre-explain the options.

---

**What each option maps to (your reference):**

| Option on screen | What it really is | Gap pillar |
|------------------|-------------------|------------|
| $4K+ API bill / no quotas | Already happening — cost spike | Scale & Cost (5) |
| Cross-department doc leak | Already happened — IT runbook in HR results | Data & Governance (1) |
| Wrong HR policy answer ? employee acts | Will happen — no guardrails, no eval | Observability (4) |
| Prompt injection via a crafted PDF | Hasn't happened yet — but possible | Security (2) |
| 8s p99 latency at 9 AM Monday | Will happen — sync embed in HTTP handler | Reliability (3) |
| Can't debug — no traces, no eval | Already invisible — no observability | Observability (4) |

---

**After most have submitted, ask 2–3 students:** *"What did you pick first, and why?"*

Common answers and how to respond:

- *"I picked cost first"* — *"Good — it's already happening, so it's urgent not just important. Urgency moves it to the top of the backlog."*
- *"I picked the data leak first"* — *"Strong instinct — data leaks have legal and trust consequences beyond the dollar cost. GDPR fines exist for this."*
- *"I picked latency"* — *"Smart — reliability failures are visible to every user immediately. But it's not the most dangerous here because slow is recoverable; leaked data is not."*
- *"I picked prompt injection"* — *"Great — that's forward-thinking. It hasn't happened yet but a malicious PDF upload is a real attack vector."*

---

**Key point to say out loud after results:**

*"Every single one of these is a real risk. None are wrong answers. The difference between a POC and an enterprise system is that enterprise assigns an explicit owner and a mitigation to every risk before go-live — not after the incident proves it's real. Alex's mistake wasn't building the POC. It was not running this list on Monday morning before opening it to three departments."*

**Optional deeper point (say if time allows):**

*"Also notice that some of these risks were completely invisible during Friday's demo. Latency only shows up at scale. The data leak only shows up when there are two departments. The cost only shows up with real users. You cannot validate enterprise readiness with a 5-minute single-user demo — no matter how well it goes."*

**Transition:** *"Let's name the six levers that address every one of these risks."*

---

## PART 1 — GAP FRAMEWORK (4 slides)

### Slide 9 — The Enterprise Gap Framework
**? 5 minutes**

**Walk through each card.** For each, read the NovaAssist example as the anchor:

1. **Data & Governance:** *"No dept_id on vectors — one query returns another department's documents."*
2. **Security:** *"API key in GitHub. No auth on the API endpoint. Anyone can call it."*
3. **Reliability:** *"OpenAI times out — FastAPI returns a 500. No fallback, no retry. Every user sees an error."*
4. **Observability:** *"HR asks 'is it getting worse?' Alex cannot answer. No traces, no eval, no metrics."*
5. **Scale & Cost:** *"$4,200 in 72 hours. Synchronous embedding in the HTTP handler, no caching."*
6. **MLOps / LLMOps:** *"Prompt is changed by copying text in the file. No version, no rollback, no test."*

**Say:** *"Keep this grid. Every AI project you build for the rest of your career goes through this checklist before it touches users."*

**Interview tip to say aloud:** *"Interviewers ask 'how did you evaluate your RAG system?' A junior answer: 'it worked.' A senior answer: 'we gated prompt changes on a 50-question golden set; faithfulness score must stay above 0.85 before any deploy.' That second answer comes from pillar 4."*

---

### Slide 10 — Quiz: HR retrieves IT runbook
**? 2 minutes**

Let students click. The correct answer is: **Data & Governance — no dept_id namespace in vector DB**.

**After reveal:** *"The fix is two things: every chunk in the database gets tagged with a dept_id at ingestion time. Every retrieval query passes the user's dept_id from their JWT as a WHERE filter. One missing clause exposed everything. This is not a model problem — it is a data isolation problem."*

---

### Slide 11 — Quiz: Quality dropped after prompt change
**? 2 minutes**

Correct answer: **Observability — no offline eval set, no production feedback loop**.

**After reveal:** *"Alex changed the system prompt and had no way to know if it got worse. The fix: before you change any prompt, you need a test set of known good questions and expected answers. You run it in CI. If faithfulness drops, the deploy is blocked. That is what 'observability' means for RAG — not just logs, but eval pipelines."*

---

### Slide 12 — Quiz: API key scraped from GitHub
**? 2 minutes**

Correct answer: **Security — rotate key + Key Vault + secret scanner in CI**.

**After reveal:** *"The first thing you do: rotate the key immediately — assume it was used. Then: move the key to Azure Key Vault or AWS Secrets Manager. Add a pre-commit hook that scans for secrets. Add it to CI. Never use environment variables in code for secrets that ship to production."*

**Transition:** *"Now let's fix NovaAssist. Starting with RAG."*

---

## PART 2 — RAG LENS (6 slides)

### Slide 13 — RAG: What Alex Must Change (v0.1 vs v1.0 diagrams)
**? 6 minutes**

**Do this on screen:** Click three boxes in the enterprise (right) diagram:
1. Click **Milvus (dept ns)** — read the popup. Emphasise: "One namespace per department prevents the leak."
2. Click **Reranker** — read it. Emphasise: "NovaAssist precision went from 0.61 to 0.89 without changing the model."
3. Click **NeMo Guardrails** — read it. "HR signed off on v1.0 only after seeing this."

**Key message to say explicitly:** *"Notice that NovaAssist v1.0 uses the same model as v0.1 — gpt-4o-mini. Not GPT-4. Not fine-tuning. The wrong-answer rate halved purely from fixing retrieval. This is the most important lesson in RAG: the model is rarely the problem."*

**Reference NVIDIA:** *"NVIDIA calls this pattern: NeMo Curator for ingestion, NIM for embeddings, NeMo Retriever for retrieval, NIM for generation, NeMo Guardrails on output. Same architecture pattern regardless of which cloud you use."*

---

### Slide 14 — Architecture Builder
**⏱ 6 minutes**

**What's on screen:** The v0.1 POC (User → FastAPI → OpenAI → Chroma) with 6 buttons below: `+ Auth & JWT`, `+ Dept namespace`, `+ Async worker`, `+ Reranker`, `+ Guardrails`, `+ Eval & Observability`. Each button adds a visual layer and shows an explanation popup. When all 6 are added, a green "NovaAssist v1.0 complete!" message appears.

**Say to open:** *"This is the POC that just broke. You are Alex on Monday morning. You have a Friday incident review with the CFO. Click each layer to add it — but before you click each one, predict what it does and why it was missing."*

Give students 2–3 minutes to click through all 6 buttons individually.

---

**What each button reveals — your reference table:**

| Button | What the popup says | NovaAssist incident it fixes |
|--------|--------------------|-----------------------------|
| **+ Auth & JWT** | SSO + JWT with dept_id claim. Without this, anyone can query anyone's documents. | No auth on the API — any URL holder could query any department |
| **+ Dept namespace** | Milvus collection per dept. Every chunk tagged dept_id. One WHERE clause prevents the leak. | Incident A — IT runbook surfaced in HR query |
| **+ Async worker** | Celery worker handles embed out-of-band. HTTP returns immediately — no timeouts. | Incident B — sync embed caused timeouts and the ,200 re-embedding bill |
| **+ Reranker** | Cross-encoder re-scores top-K chunks. Precision 0.61 → 0.89. No model change needed. | Incident C — wrong policy answer from poor chunk ranking |
| **+ Guardrails** | NeMo Guardrails: require citation, block off-topic, redact PII. HR signed off after this. | Incident C — parental-leave answer with no source cited |
| **+ Eval & Observability** | Langfuse traces every request. 30-Q golden set in CI. Online: thumbs + cost/query. | "It feels worse" — no data to answer any stakeholder question |

---

**After all 6 are added, ask the room:** *"Which layer did you add first, and why?"*

Responses to common answers:
- *"Auth first"* — "Good instinct — security is the gating concern. Without auth every other layer can be bypassed."
- *"Namespace first"* — "Also correct — data isolation is the most legally consequential gap. GDPR exposure."
- *"Eval last"* — "Common and reasonable — but in practice start with at least 10 golden questions on day one so you can detect regressions from the start."

**Key insight to say out loud:**

*"The order is driven by stakeholders, not personal preference. At NovaTech: auth + namespace first (IT Security's incident), then async worker (cost spike), then reranker (quality before HR's review), then guardrails (what HR required before sign-off), then eval (what the CFO needed to see this won't happen again). Stakeholder pressure defines the roadmap."*

**Optional deeper point:**

*"Notice we never upgraded the model. NovaAssist v1.0 uses the same gpt-4o-mini as v0.1. Retrieval precision went from 0.61 to 0.89 purely from the reranker. The next time someone says 'just use GPT-4', ask: which metric are you trying to improve? The model is rarely the bottleneck in RAG systems."*


---

### Slide 15 — Spot the Gap
**? 3 minutes**

**Say:** *"Three glowing circles on the v0.1 diagram. Each maps to a real NovaAssist incident. Click them."*

After all three are found, name the real incident for each:
1. **No guardrails** ? parental-leave wrong answer
2. **No department isolation** ? IT runbook in HR results
3. **No observability** ? "it feels worse" with no data

---

### Slide 16 — Discussion: Eval pipeline
**? 3 minutes total**

Start the 2:00 timer. While students discuss, you can circulate or stay quiet.

**After timer:** Ask 2 students what they came up with. Then:

**Say:** *"Target answer: both offline and online. Offline means: HR gives you 30 real questions with correct answers. Before any deploy, you run those 30 questions automatically and check faithfulness — does the answer actually come from the retrieved chunk? Citation accuracy — is a source cited? If faithfulness drops below 0.85, deploy is blocked. Online means: you track thumbs-down rates, retrieval score drift, and cost-per-query in production. Drift in retrieval scores tells you your documents changed but your chunks didn't get re-indexed."*

---

### Slide 17 — Quiz: Eval strategy
**? 2 minutes**

Correct answer: **Both offline CI gate + online monitoring**.

After reveal: *"Offline without online misses production drift. Online without offline means you wait for users to catch regressions. You need both gates: one before deploy, one after."*

---

## PART 3 — AGENTIC LENS (4 slides)

### Slide 18 — Agents: New Powers, New Risks
**? 5 minutes**

**Set the scene:** *"NovaAssist v1.0 is stable. IT now says: 'Don't just tell me the VPN fix — open the ticket.' Alex adds tools."*

**Click on "create_ticket (no guard)"** in the POC diagram. Read the popup aloud slowly:
*"Called 47 times in one overnight loop. Created 12 duplicate ServiceNow tickets. $180 in tokens. No idempotency key, no approval, no dedup."*

**Say:** *"This is the key insight about agents: they fail differently from chatbots. A chatbot gives a wrong answer — bad, but recoverable. An agent takes an action in the real world. 12 ServiceNow tickets took the IT team 4 hours to clean up. The failure mode is completely different."*

**Click the enterprise diagram boxes:** Show LangGraph orchestrator, policy engine, human approval UI.

**Key message:** *"The policy engine is code, not a prompt. Even if someone jailbreaks the LLM, the policy engine still runs. The LLM cannot convince the policy engine to auto-approve create_ticket."*

---

### Slide 19 — Tool Policy Game
**? 6 minutes**

**Say:** *"You are the policy engine. Drag — or click — each tool into the correct column: auto-approve, human gate required, or block entirely."*

Give 3–4 minutes for students to classify.

**After "Check my policy":** Walk through each answer:

| Tool | Correct | Why |
|------|---------|-----|
| search_docs | Auto | Read-only, scoped. No risk. |
| create_ticket | Gate | Write action. 12 duplicates prove it needs approval. |
| lookup_asset | Auto | Read-only, user-scoped. Safe. |
| send_email_all | Block | Irreversible broadcast to 800 people. No autonomous agent should do this. |
| delete_records | Block | Permanent data loss. Never auto. |
| update_salary | Gate | Financial write. Approval + amount threshold. |

**Key principle to articulate:** *"The rule: read-only + scoped = auto. Write or external action = gate. Irreversible or broadcast = block. Match the policy to the actual risk, not a blanket 'always ask humans.'"*

---

### Slide 20 — Discussion: refund_payment
**? 3 minutes**

Start 2:00 timer. Expected answer: human gate + amount threshold (e.g., <$50 auto, $50–$500 gate, >$500 block). Two-factor approval above $200.

**Say after:** *"Financial writes are never auto-approve. Even $1 — because the amount can change between the intent and the execution. The pattern: show the user what the agent is about to do, give them 30 seconds to approve or reject."*

---

### Slide 21 — Quiz: 12 duplicate tickets
**? 2 minutes**

Correct answer: **Policy: human approval + idempotency key + max_steps=8 + timeout**.

After reveal: *"The idempotency key is underrated. Hash the intent — 'create VPN reset ticket for Alex Chen' — and if a ticket with that hash was created in the last 5 minutes, return the existing ticket ID instead of creating a new one. One line of code prevents all 12 duplicates."*

---

## PART 4 — INFERENCE LENS (4 slides)

### Slide 22 — Inference: Cost and Scale
**? 5 minutes**

**Click on "openai.chat.completions (shared key)"** in the POC diagram. Read popup.

**Reveal the key number:** *"62% of NovaAssist's bill was embedding — not generation. Every query re-embedded the query text against every document. Alex thought the expensive part was the LLM. It was the embeddings."*

**Click through the enterprise diagram boxes:** API Gateway, Router, Llama-8B NIM, Cost dashboard.

**Say:** *"Two changes got NovaAssist from $4,200/month to under $1,840/month at the same traffic: First, self-hosted NIM embedding — $0 marginal cost after the GPU is running. Second, query routing — 80% of questions are FAQ ('how many vacation days?'). Route those to the cheap self-hosted model. Use the cloud LLM only for complex reasoning."*

---

### Slide 23 — Cost Simulator
**? 5 minutes**

**Say:** *"Move the sliders. Watch the CFO verdict change."*

Walk through the demo:
1. **Start:** 1000 queries/day, 100% cloud, 0% cached = shows high cost
2. **Then:** Change cloud % to 20% — cost drops significantly
3. **Then:** Change cache to 70% — drops further
4. **Say:** *"That last setting — 1000 queries/day, 20% cloud, 70% cached — is NovaAssist v2.0. Under $1,840/month. CFO approved."*

**Key message:** *"The CFO didn't give a technology mandate — they gave a budget constraint. That constraint is what forced the architecture decision: self-host the embedding model, cache the frequent queries, route by complexity. Business pressure drives architecture."*

---

### Slide 24 — Discussion: Query routing
**? 2 minutes**

Start 1:30 timer. Expected: intent classifier (Llama-8B, cheap) makes the routing decision. FAQ ? Llama-8B NIM. Multi-step reasoning/agent ? gpt-4o-mini.

After: *"The routing decision itself is made by a tiny, fast, cheap model. The expensive model only runs when it's needed. That's the pattern."*

---

### Slide 25 — Quiz: 2,000 PDFs updated weekly
**? 2 minutes**

Correct: **RAG ingestion pipeline + routing + eval**.

After: *"Fine-tuning on docs that change weekly means you are always training on stale data. By the time the fine-tuned model ships, 200 policies have changed. RAG + ingestion pipeline means you update the vector store when a PDF changes — same day. That's why RAG is the right answer for volatile document stores."*

---

## PART 5 — CAPSTONE (2 slides)

### Slide 26 — Unified Platform (5-layer diagram)
**? 5 minutes**

**Click each layer as you describe it:**

1. **Experience Layer** (blue) — *"Chat UI. REST API. This is what users see. Every request must carry a valid JWT before it goes anywhere else."*
2. **Orchestration Layer** (purple) — *"Agents, workflows, policy engine, human-in-the-loop. NovaAssist v1.5 lives here. This is where create_ticket approval gates run."*
3. **AI Services Layer** (green) — *"RAG pipeline, NIM embeddings, NIM LLM, guardrails. All three lenses live in this layer."*
4. **Data Layer** (orange) — *"Milvus with department namespaces. This is where the IT/HR leak was fixed. The data layer enforces isolation."*
5. **Platform Layer** (grey) — *"Auth, observability, CI/CD, secrets, cost management. This is where Alex's API key incident is solved — Key Vault lives here."*

**Live trace — do this verbally, pointing at the diagram:**
*"User types: 'Reset my VPN.' Here is what happens: Experience Layer receives the request, JWT validated ? Orchestration Layer: agent plans, decides to search docs and create_ticket ? AI Services: RAG retrieves IT docs from Milvus IT namespace ? Data Layer: Milvus IT collection, dept_id filter ? back up: LLM generates answer ? Orchestration: policy engine shows approval prompt ? user approves ? Platform Layer: action logged, cost tracked. Five layers. One request. Every incident prevented."*

---

### Slide 27 — Worksheet
**? 8 minutes**

**Say:** *"5 minutes of quiet writing. Apply the NovaAssist pattern to your own project — a university project, a hackathon project, anything you've built. If you haven't built anything yet, design one now."*

Set a timer (your phone). Walk the room or wait quietly.

**After 5 minutes:** Ask 1–2 volunteers to share one field — "what incident would happen first at 100 users?"

**This is the most important activity in the workshop.** The transfer from NovaAssist to their own project is where the learning is anchored.

---

## PART 6 — QUIZ + CLOSE (7 slides)

### Slides 28–32 — Final Quiz (5 questions)
**? 6 minutes**

Let students click answers individually. After each answer:

| Q | Key point to reinforce |
|---|------------------------|
| 1 | Platform layer = auth + observability + CI/CD + secrets + cost |
| 2 | Fix retrieval before touching the model. Same model, precision 0.61 ? 0.89. |
| 3 | max_steps + idempotency + approval gate = prevents 12 duplicate tickets |
| 4 | Route FAQ to self-hosted NIM. Cache embeddings. Cost drops 56%. |
| 5 | IT/HR leak = Data & Governance (pillar 1). Not MLOps. Not cost. Data isolation. |

---

### Slide 33 — Enterprise Checklist
**? 2 minutes**

**Say:** *"Click 'Copy checklist to clipboard'. Paste it into your project README right now if you have one open. This is your gate checklist before any AI project touches real users."*

Scroll through and highlight 3 items that surprised students most in the quiz.

---

### Slide 34 — Closing: "Alex's Lesson"
**? 2 minutes**

**Read the subtitle aloud:** *"The demo that wins applause is not the architecture that survives Monday."*

**Closing words:** *"Take your worksheet. Tonight — not next week, tonight — redraw NovaAssist v2.0 from memory. Five layers, three lenses. If you can trace one request through all five layers, you understand enterprise AI architecture."*

**One homework assignment:** *"Write one Architecture Decision Record for your project this week. Context: what problem are you solving? Decision: what did you choose? Consequence: what does this enable and what does it trade off? That habit is what separates junior from senior engineers."*

---

## TIMING SUMMARY

| Section | Slides | Target time |
|---------|--------|-------------|
| Setup + Title + Agenda | 1–2 | 5 min |
| Case study | 3–5 | 10 min |
| Part 0 Hook | 6–8 | 11 min |
| Part 1 Gap framework | 9–12 | 11 min |
| Part 2 RAG | 13–17 | 19 min |
| Part 3 Agents | 18–21 | 16 min |
| Part 4 Inference | 22–25 | 14 min |
| Part 5 Capstone | 26–27 | 13 min |
| Part 6 Quiz + Close | 28–34 | 12 min |
| **Total** | | **~111 min** |

**If running long:** Cut the worksheet to 3 minutes, or skip the inference discussion (slide 24) and just read the answer.

**If running short:** Extend the worksheet, or do a second round of the tool policy game with a new scenario.

---

## QUESTIONS STUDENTS WILL ASK — FULL ANSWERS

**"Is NovaAssist a real company?"**  
Fictional, but every incident is a composite of real production failures from companies that shipped LLM apps too fast. The $4,200 bill, the cross-tenant leak, the agent loop — all happened, different companies.

**"What is NIM exactly?"**  
NVIDIA Inference Microservices — pre-built, optimised container images for running LLMs and embedding models on NVIDIA GPUs. You pull the container, it runs. Same idea as a Docker image but pre-optimised for the GPU. The same architecture patterns apply to Azure OpenAI, AWS Bedrock, or Google Vertex — NIM is just the NVIDIA-native way to self-host.

**"Why not just use OpenAI for everything?"**  
You can. Until the CFO sees the bill. At scale, self-hosting embeddings on a $3/hour GPU vs $0.0001/token at high volume is a significant cost difference. The architecture decision is always: at what volume does self-hosting pay for itself? For NovaAssist at 1,000 queries/day, it does.

**"What is a reranker?"**  
Vector retrieval (ANN search in Chroma/Milvus) is fast but approximate — it finds chunks that are semantically similar to the query embedding. A reranker is a cross-encoder that looks at the query AND each chunk together and scores them more precisely. It runs after retrieval on the top-K results (e.g., top 20), then picks the best 3–5. Much more accurate but slower — which is why it only runs on the shortlist.

**"What is LangGraph?"**  
A Python library from LangChain for building stateful, multi-step agent workflows. Instead of `while True`, you define a graph: nodes = actions (call LLM, call tool, check policy), edges = transitions. Every step is logged. Max steps and timeouts are first-class features.

**"What is an ADR?"**  
Architecture Decision Record — a short document (1 page) capturing: Context (why we faced this decision), Decision (what we chose), Consequences (what this enables and what it costs). Companies like Amazon and Google require ADRs for significant technical decisions. It is a forcing function for thinking through trade-offs.

**"Do we need all six pillars for a university project?"**  
No. But your README should name which pillars you knowingly skipped and why — "We deferred tenant isolation because this is a single-user prototype; before production we would add namespace filtering." That sentence demonstrates senior thinking. Most intern projects get rejected for enterprise adoption because the intern doesn't know what they skipped.

**"What is faithfulness in RAG evaluation?"**  
Faithfulness measures whether the generated answer is actually supported by the retrieved documents — or whether the LLM hallucinated it. Measured with a judge LLM that scores: "Is every claim in the answer backed by a retrieved chunk?" Score 0–1. RAGAS is a common library for this.

---

## THINGS THAT COMMONLY GO WRONG

| Problem | What to do |
|---------|-----------|
| Students try to ask "how do I code this" | "We're doing architecture today. The code comes after the decisions. Let's stay at the decision level." |
| Students say "just use GPT-4 and it solves everything" | "OpenAI also has data isolation, rate limits, observability, and cost tracking to solve. GPT-4 doesn't fix the architectural gaps — it just moves the problem." |
| No one answers discussion questions | Ask a specific person by name. Or give 30 seconds to write before sharing. |
| Time running out | Skip slides 24 (inference discussion) and trim worksheet to 2 min. Keep quiz and close. |
| Students have no prior project | "Design one now. Pick a domain you know: medical records, university course docs, customer support tickets." |
