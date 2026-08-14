# Speaker Guide � POC to Enterprise Workshop
### All 36 Slides � Script + Timing + Facilitation Notes

**Total session:** 90�120 min  
**Convention:** times shown are speaking + facilitation time per slide. Quizzes and discussions have their own timers built into the slide.  
**Before starting:** Press `F` for fullscreen � Press `S` to open speaker notes in a separate window � Click one SVG node in the first diagram to confirm tooltips work.

---

## Setup Slides

---

### Slide 1 � Title: "From POC to Enterprise"
**Time: ~1 minute**

Open with energy, not explanation. Do not describe the agenda � that is the next slide.

**Say:**
> "Today we are not going to talk about APIs, syntax, or which model to use. We are going to follow one project � built by one intern, in one week � and watch it grow into a system that 800 people depend on. Every decision we make today is a decision real teams make. The question is always the same: can this demo survive Monday?"

Let the title sit for a few seconds. Point at the sub-line: *RAG � Agentic � Inference* � three lenses, one story.

---

### Slide 2 � Agenda
**Time: ~1 minute**

Move through this quickly. Its only purpose is to show students the shape of the session.

**Say:**
> "Eight parts, 90 minutes, one project. By slide 28 you will know NovaAssist better than Alex did when it went to production. Then you will apply the same pattern to your own project."

Point out the keyboard shortcuts at the bottom: `S` for speaker notes, `F` for fullscreen, `Esc` for the slide overview. If students have their own laptops and you want them to participate interactively, tell them now to open the same file.

---

## Case Study Introduction

---

### Slide 3 � Meet NovaAssist
**Time: ~2 minutes**

Read the project card together. Go row by row � do not rush.

**Key setup line:**
> "NovaTech is 800 people. Not a startup, not a tech giant. A completely normal company with no AI team, no GPU budget, and no AI governance policy. When Alex's project became popular, the company had nothing to support it."

Then ask the room:
> "Who has built something like this? Chatbot, RAG app, LLM wrapper, document Q&A?"

Wait for hands. If the audience is shy, say:
> "It doesn't have to be production. A hackathon project, a uni assignment � same pattern. You have a working demo. What happens when real people try it?"

**What to leave students with:** This is a real, recognisable project. When Alex's system breaks, it will feel familiar.

---

### Slide 4 � What Happened in Week 2
**Time: ~3 minutes**

This slide carries the emotional weight of the whole workshop. Do not rush it.

Walk the timeline slowly: Week 1 ? Week 2 ? Week 2 (cont.) ? Week 4�6.

Then stop at each metric and pause:

- **$4,200** � "Three days. Finance cancels the card. Alex didn't even know until the morning."
- **1 cross-dept data leak** � "HR asked about remote work. Got back an IT server-access runbook with internal IP addresses and SSH keys."
- **1 wrong policy answer** � "Employee asked about parental leave. Got the answer from the old policy. Submitted a leave request for the wrong number of weeks."
- **1 API key in GitHub** � "Repo was made public to share with a friend. Automated scrapers found the key in four hours."

Then read the core message box:
> "Enterprise architecture is not a checklist you memorise. Some of it is designed upfront. The rest is refined under pressure. Both matter. Today we practise both."

**Critical point to say out loud:**
> "Every single one of these failures was visible in the code on Friday afternoon, before a single user logged in. None were surprises. The difference between a POC team and an enterprise team is that the enterprise team runs this list before opening to users � assigns a name to each risk, decides: fix it now or accept it and document why."

---

### Slide 5 � Who Cares About What?
**Time: ~2 minutes**

Read each stakeholder card. Ask students to predict what each person's complaint would be before you read it.

**Suggested framing:**
> "Same four incidents. Four different people in the room. What is each person most angry about?"

Walk through:
- **HR sponsor** � worried about wrong answers damaging employee trust. Every answer needs a source.
- **IT Security** � worried about cross-department data exposure and auditability. 90-day log retention is a compliance requirement, not a preference.
- **CFO** � does not care what technology you use. Cares about the bill. "Cap at $2K" is a hard constraint, not a suggestion.
- **Platform team** � worried about what happens after Alex leaves in 6 weeks. If only Alex understands it, it is not a product � it is a liability.

**Key line:**
> "Architecture is not a technical debate. It is a negotiation between these four people's constraints. Your job is to satisfy all of them simultaneously. That is why it is hard."

---

## Part 0 � Hook

---

### Slide 6 � Friday Demo: Everyone Claps
**Time: ~3 minutes**

This is the first interactive diagram. Click at least two boxes before you start speaking, so students see how the tooltips work.

**Say:**
> "This is Alex's v0.1 stack. User, FastAPI, OpenAI, Chroma. Built in 3 days. On Friday with one user and one department, this works perfectly. There is nothing wrong with this architecture for a proof of concept."

Click the **FastAPI** box. Read the tooltip: it does upload, embed, retrieve, and generate all in one synchronous HTTP handler.

> "Notice: one function does four things. That is fine for a demo. That is a ticking clock for 120 users."

Click the **Chroma** box: one flat collection, no tenant filter.

> "This is the data leak waiting to happen. Not a bug � a missing design decision. When IT uploaded their runbooks on Monday, they landed next to HR's PDFs with no filter between them."

**Transition:**
> "This architecture is correct for a POC. The mistake is treating 'it works on Friday with one user' as evidence that it is ready for Monday with 120."

---

### Slide 7 � Then 120 Users Show Up
**Time: ~2 minutes**

No activity on this slide. Pure story. Read the incidents slowly.

**Incident A:**
> "Tuesday, 9:14 AM. HR employee types 'remote work policy.' NovaAssist returns a chunk from IT's server-access runbook � internal IP addresses, VPN config, SSH key instructions. IT Security is on the phone before 10 AM."

Let the room react. Then:

**Incident B:**
> "Wednesday of the same week. OpenAI dashboard shows $4,200 in 72 hours. A Finance user ran a batch script to test the system � 2,000 queries in 3 hours. No rate limit. No cost alert. Finance cancels the card."

Ask:
> "Who is hurt here � the user, HR, Security, Finance, or the Platform team?"

Wait for answers. Then say: "All of them. For different reasons. We will spend the next 90 minutes building the architecture that satisfies all of them."

---

### Slide 8 � War Room: Incident Decision Tree
**Time: ~4 minutes**

This is the first interactive exercise. Introduce it:
> "You are Alex's on-call engineer. It is 2:14 AM. The OpenAI dashboard shows $1,400 in 48 hours and climbing. You have just been paged. You have three choices."

Read the three options aloud. Ask the room to vote � hands up, or have them call it out.

**After a choice is made, click it** and walk through the consequence:

**If they chose A (revoke the key):**
> "Good. Bill stops at $1,700. Now � Step 2: how do you redeploy safely?"
> Option A (Key Vault): "This is the permanent fix. Key in vault, managed identity, cost alert at 80% budget. Enterprise pattern: Revoke, Isolate, Alert, Document."
> Option B (.env again): "You solved the symptom. The habit persists. One more git push and you are back here next month."

**If they chose B (rate limit):**
> "Spend slows but doesn't stop � the key is still alive. Four hours later: $2,900. Then Security tells you the key was in a public GitHub commit three weeks ago."
> Walk through Step 2 choices.

**If they chose C (ignore it, handle at stand-up):**
> "By 8 AM: $4,200. Finance cancels the card. 120 users are down. CFO has scheduled a post-mortem for 5 PM."
> "Now you are listing root causes. What do you say?" � If they pick option A (correct root causes): "Good analysis. But analysis is not a fix. Now build the system that prevents the 2 AM page."

**After any Step 3 outcome:**
> "An automated cost alert at 80% budget would have caught this at $100, not $1,400. Enterprise does not rely on engineers waking up � it relies on systems alerting in advance."

Hit Restart if time allows and take a different path with the group.

---

## Part 1 � Gap Framework

---

### Slide 9 � The Enterprise Gap Framework
**Time: ~3 minutes**

Introduce the framework as the organizing structure for everything that follows.

**Say:**
> "Every incident Alex faced maps to one of six pillars. These are not specific to NovaAssist � they are the usual gaps between an AI demo and a real AI product. If you can name all six and explain what breaks in each one, you are thinking like an enterprise architect."

Walk each card:

1. **Data & Governance** � "Who can see which data? NovaAssist: no dept_id on any chunk."
2. **Security** � "Are secrets, auth, and attack paths controlled? NovaAssist: API key in GitHub."
3. **Reliability** � "Does it still work when services fail or traffic grows? NovaAssist: OpenAI timeout = 500 error for every user."
4. **Observability** � "Can we see quality, cost, latency, and failures? NovaAssist: Alex had no eval data when HR asked if quality had dropped."
5. **Scale & Cost** � "Can we afford this when usage grows? NovaAssist: $4,200 in 72 hours."
6. **MLOps / LLMOps** � "Can we version, test, deploy, and roll back prompts and models? NovaAssist: prompt edited by hand in a file, no tests, no rollback."

**Say:**
> "From here on, every quiz, every diagram, every discussion maps to one of these six. By the end, you should be able to categorise any AI system failure in seconds."

---

### Slide 10 � Quiz: HR Retrieves IT Runbook
**Time: ~1 minute**

Let students answer. After the click:

**Correct answer: Data & Governance � no dept_id namespace in the vector DB.**

> "Students often say 'Security.' It is not. The leak happened because there was no data isolation in Chroma � no tenant filter on the retrieval query. Authentication was not the problem: even a logged-in user should not have been able to see IT's runbooks. The isolation layer was missing entirely. That is Pillar 1, not Pillar 2."

---

### Slide 11 � Quiz: Quality Dropped After Prompt Change
**Time: ~1 minute**

**Correct answer: Observability � no offline eval set, no production feedback loop.**

> "Before you change any prompt in a production system, you need a test set of known questions and expected answers. You run it in CI. If faithfulness drops, the deploy is blocked. That is what observability means for RAG � not just logs, but an eval pipeline."

---

### Slide 12 � Quiz: API Key Scraped from GitHub
**Time: ~1 minute**

**Correct answer: Security � rotate key immediately + Key Vault + secret scanner in CI.**

> "Always emphasise the immediate first step: rotate the key and assume it was used maliciously. Then the permanent fix. Never mention '.env files' as the solution � the .env file was the problem."

---

## Part 2 � RAG Lens

---

### Slide 13 � RAG: What Alex Must Change (v0.1 ? v1.0)
**Time: ~3 minutes**

Two side-by-side diagrams. Start on the left (POC) and click each orange node to show what is wrong. Then move to the right (Enterprise) and click the new components.

**On the left, point out:**
- FastAPI monolith � sync embed inside the HTTP handler
- Chroma flat � no namespace, no filter
- OpenAI shared key � no rate limit

**On the right, click:**
- **Async Worker** � "Ingestion is now out of band. HTTP returns immediately. No more $4,200 re-embedding bug."
- **Milvus (dept ns)** � "One collection per department. Every chunk has dept_id. Every query filter uses the JWT claim. One WHERE clause prevents the entire IT/HR leak."
- **Reranker** � "NovaAssist precision: 0.61 ? 0.89. Same model. No fine-tuning. Just better retrieval."
- **NeMo Guardrails** � "Require citation in every response. Reject off-topic queries. Redact PII. This is what got HR to sign off on v1.0."
- **LangSmith** � "Traces every request. Every retrieval score, token count, latency, and cost � all logged."

**The single most important line in the RAG section:**
> "NovaAssist v1.0 uses the exact same model as v0.1 � gpt-4o-mini. Not GPT-4. Not fine-tuning. The wrong-answer rate halved purely from fixing retrieval. The model is almost never the problem."

---

### Slide 14 � Architecture Builder
**Time: ~3 minutes**

Students click the buttons to build the stack. With the new prerequisite locking, the order matters � explain this.

**Introduce:**
> "Build the v1.0 stack yourself. Some layers are locked until their dependencies exist � because in real architecture, you cannot add guardrails to a system that has no identity layer. You cannot secure what isn't isolated yet."

Let students click through in order. As each layer activates, read the explanation panel.

After Auth:
> "Every layer from here on depends on this. Without identity, there is no tenant claim in the JWT, which means no department filter, which means the data leak cannot be fixed."

After Namespace:
> "This is the single change that prevents Incident A. One WHERE clause."

After Async Worker:
> "HTTP handler returns immediately. The $4,200 re-embedding bug is architecturally impossible now."

After Guardrails:
> "HR signed off on v1.0 only after seeing this demo. Without citation enforcement, every answer is an undocumented claim."

When complete:
> "You just built an enterprise RAG system. Notice what you did not change: the model, the query language, the UI. You changed the data layer, the ingestion path, and the quality controls."

---

### Slide 15 � Spot the Gap
**Time: ~3 minutes**

Students click the three glowing circles on the v0.1 diagram. Each click now reveals the gap description **and** a fix-selection dropdown. Explain the new mechanic:

> "Find the three hidden gaps � but finding it is only half the work. Once you identify the problem, you have to pick the right fix from three options. One is correct. One is plausible but wrong � an antipattern that solves a different problem."

As each gap is revealed:

**Gap 1 � No guardrails (Chroma/Response node)**
After they find it:
> "Three choices: NeMo Guardrails with citation enforcement, add a rate limit, or upgrade to GPT-4. Which is correct?"
After answer:
> "Rate limits control cost, not content quality. GPT-4 does not self-cite unless you prompt it to and enforce it. Guardrails with citation rules is the direct fix for the parental leave incident."

**Gap 2 � No department isolation (OpenAI node)**
> "Three choices: Milvus namespace with dept_id filter, Redis cache, or filter by username. Redis speeds up retrieval � it does not isolate data. Filtering by username still allows cross-department access for shared team accounts. Namespace isolation is the only correct fix."

**Gap 3 � No observability (FastAPI area)**
> "Three choices: LangSmith + 30-Q golden eval set, more unit tests on FastAPI handlers, or Sentry error tracker. Unit tests and Sentry catch code bugs, not retrieval quality degradation. LangSmith with an eval set catches the silent degradation that Incident C represents."

---

### Slide 16 � Discussion: Eval Pipeline
**Time: ~3 minutes (timed)**

Start the timer. Let students discuss in pairs for 2 minutes, then facilitate a 1-minute share-back.

**The discussion question:** HR gives you 30 real questions employees asked. How do you build an eval pipeline? What metrics do you track offline vs online?

**Prompt if the room is quiet:**
> "Start with this: what is a 'correct answer' for an LLM response? It's not word-for-word match. How do you verify it?"

After the timer, share the target:
> "Two parts. Offline: a 30-question golden set in CI. Before every deploy, run all 30 through the live stack. Gate on faithfulness ? 0.85 and citation presence. If it fails, the deploy is blocked.
>
> Online: seven live signals in LangSmith � thumbs-down rate, retrieval score drift, context relevance, hallucination rate, cost per query, latency percentiles, and agent success rate.
>
> The difference is critical: offline catches regressions **you introduced**. Online catches drift **the world introduced** � new documents uploaded alongside old ones, changed user vocabulary, batch scripts burning budget. You need both because they protect against completely different failure modes."

---

### Slide 17 � Quiz: Eval Strategy
**Time: ~1 minute**

**Correct answer: Both offline CI gate + online monitoring.**

> "Offline without online: you wait for users to discover production drift, like the parental leave incident. Online without offline: regressions ship unchecked every deploy. Neither alone is sufficient."

---

## Part 3 � Agent Lens

---

### Slide 18 � Agents: New Powers, New Risks
**Time: ~3 minutes**

Click the enterprise diagram boxes � Orchestrator, Policy engine, Audit log, Human approval UI.

**Open with the key insight:**
> "A chatbot gives a wrong answer. An agent takes a wrong action. These are completely different failure modes with completely different consequences. A wrong paragraph can be corrected with an explanation. Twelve duplicate ServiceNow tickets took the IT team four hours to clean up � and that was a relatively low-stakes action."

Click **create_ticket (no guard)** on the POC side:
> "Called 47 times in one overnight loop. 12 duplicates created. $180 in tokens. No idempotency key, no approval gate, no step limit. The agent kept trying to create the ticket because it never received confirmation that it succeeded."

Click **Policy engine** on the enterprise side:
> "Policy is code, not a prompt. Even if the LLM is jailbroken, the policy engine still runs. You cannot prompt-inject your way past a hard policy rule."

Click **Audit log**:
> "Every plan step, tool call, input params, and decision reason is logged for 90 days. Without this, IT Security cannot investigate the 12-ticket incident. With it, you have a complete replay."

**Key line:**
> "Agent safety should be enforced by code and by policy � not by hoping the model behaves. The model is not the last line of defence. The policy engine is."

---

### Slide 19 � Tool Policy Game
**Time: ~4 minutes**

Introduce the mechanic:
> "You are the policy engine. Six tools are waiting to be classified into three zones: auto-approve, human gate required, or block entirely. Drag or click to cycle through zones. Place all six before you submit."

Give the room 2 minutes to classify, then submit together.

**After results:**

Read the consequence log for any mis-classified tools:
- **create_ticket on auto** ? "Agent ran overnight, 12 duplicates created. IT spent 4 hours cleaning up."
- **send_email_all on gate** ? "That's still dangerous � a human might approve a mass email at 3 AM without reading it carefully. Block is the correct call for irreversible broadcasts to 800 people."
- **search_docs on gate** ? "User waited 4 hours for a human to approve a read-only doc lookup. Human gates add friction without safety benefit on read-only tools."
- **delete_records on gate** ? "A gate is better than auto, but permanent data destruction should be blocked entirely. A gate gives a human the opportunity to approve a disaster."

**Classification rule to say clearly:**
> "Read-only plus scoped to the user: auto. Write action plus reversible: human gate. Write action plus irreversible, or high blast radius: block. That rule classifies 90% of tools you will ever encounter."

---

### Slide 20 -- Observability Triage
**Time: ~3 minutes**

**What this slide is and why it exists:**
This slide teaches students to read an agent execution trace -- exactly what an SRE does when investigating a production incident. It is placed **before** the idempotency quiz (Slide 22) intentionally: students discover the problem from the evidence first, then the quiz confirms they know the fix. The scope is narrow and concrete: one trace, one anomaly, one correct fix.

**What is on screen:**
A five-row LangSmith-style trace table showing every tool call the agent made in one session:
- Row 1 -- `search_docs` -- status OK
- Row 2 -- `lookup_asset` -- status OK
- Row 3 -- `create_ticket` (title="VPN reset", dept=IT) -- status APPR -- **2,310 ms latency** (something blocked)
- Row 4 -- `create_ticket` (title="VPN reset", dept=IT) -- status APPR -- **438 ms** (identical call, same session)
- Row 5 -- `search_docs` -- status OK

Rows 3 and 4 are identical write calls. The agent called the same tool twice with the same parameters in the same session -- this is the trace that produced NovaAssist's 12 duplicate ServiceNow tickets.

**How to introduce it:**
> "This is a real trace from a NovaAssist v1.5 session. Five tool calls. One problem. You have 20 seconds -- which row doesn't belong?"

Wait for the room. Most will identify rows 3 and 4 quickly. After someone calls it out, click one of the highlighted rows to open the fix panel.

**Walk through the three fix options after the row is clicked:**
- **Idempotency key** -- correct. Before calling any write tool, hash: tool name + all input params + session ID. Check: was this hash seen in the last 5 minutes? If yes, return the existing result. If no, execute and store the hash. One lookup prevents all duplicates.
- **Retry with exponential backoff** -- wrong. Backoff controls *when* you retry on failure. It does not prevent a duplicate when the first call already succeeded. The problem here is not retry timing -- the agent had no memory of the previous successful call.
- **Circuit breaker** -- wrong. Circuit breakers shut down calls to a failing service. Here the service succeeded both times. Wrong tool for a duplicate-execution problem.

**After the correct fix is selected:**
> "One field. One hash. Prevents all 12 duplicates. The idempotency key is the most underrated engineering pattern in agentic AI."

---
### Slide 21 � Discussion: refund_payment
**Time: ~3 minutes (timed)**

Start the timer. Let students discuss in pairs.

**The question:** NovaAssist v2.0 wants to add `refund_payment` for Finance (up to $500). Auto, gate, or block?

**After the timer, the expected answer:**
> "The answer is: it depends on the amount. And that is the point. A single classification does not work for a variable-risk tool.
>
> A reasonable tiered policy: under $50 � auto-approve if the business accepts that risk. $50 to $500 � human gate, show the agent's intent before executing. Over $500 � block, require a separate process.
>
> The key insight: by the time the policy engine evaluates this decision, the agent has already resolved the user's vague request � 'refund John's last order' � into a specific action: `refund_payment(customer_id=1047, amount=340)`. You show that exact action to the human approver. They approve or reject the specific number, not the abstract request."

---

### Slide 22 � Quiz: 12 Duplicate Tickets
**Time: ~1 minute**

**Correct answer: max_steps + idempotency key + human approval gate on create_ticket.**

> "The idempotency key is one line of code. A hash of the tool and its parameters, checked before execution. If an identical call was made in the last 5 minutes, return the existing result � do not repeat the action. That single check prevents all 12 duplicates."

---

## Part 4 � Inference Lens

---

### Slide 23 � Inference: Cost and Scale (v2.0 diagram)
**Time: ~3 minutes**

Click the key nodes on both sides of the diagram.

**Open with the surprising fact:**
> "Most students assume the expensive part of a RAG system is the LLM � the generation step. At NovaAssist, 62% of the $4,200 bill was embedding calls, not generation. Alex thought the expensive part was the model. It was the embeddings."

Click **openai.chat.completions (shared key)** on the POC side:
> "Re-embedding on every query, plus re-embedding all existing documents during upload. That re-indexing bug was a 3x cost multiplier on top of the normal embedding cost."

Click **Complexity router** on the enterprise side:
> "This is the highest-leverage change. An intent classifier � itself a cheap, self-hosted model � looks at each query and decides: is this a simple FAQ or a complex reasoning task? 80% of NovaAssist queries are FAQ. Route them to the self-hosted Llama-8B NIM at zero marginal cost. Only the 20% that need multi-step reasoning go to the cloud LLM."

Click **NIM Embed** on the enterprise side:
> "Self-hosted embedding at zero marginal cost after the GPU. One change reduces the bill from $4,200 to under $1,000 per month at the same traffic volume."

Click **Cost dashboard**:
> "The CFO sees this dashboard. Without it, there is no trust. Without trust, there is no budget for v3.0."

---

### Slide 24 � Cost Simulator + SLO Tab
**Time: ~4 minutes**

**Cost tab (first 2.5 min):**

Start at defaults: 1,000 queries/day, 100% cloud, 0% cache, 400ms cache latency. Show the output:
> "This is Incident B. ~$4,200/month, ~850ms p99 latency. Neither the cost nor the latency target is met."

Adjust sliders deliberately:
1. Move cloud to 20%:
   > "Most queries go to the self-hosted Llama-8B. Watch the cost drop."
2. Move cache to 70%:
   > "Top-200 FAQ embeddings are cached. Embedding cost collapses."
3. Move cache latency to 50ms:
   > "Cached responses are now faster than any cloud API call."

Check the CFO verdict � should now show "Approved ?".
> "Cost and p99 latency both need to meet target. The CFO gave two constraints. Architecture must satisfy both simultaneously."

**SLO tab (last 1.5 min):**

Click the SLO tab. Walk through the sliders:
> "NovaAssist v2.0 commits to 99.5% uptime. That sounds high. What does it actually mean?"

Move the slider to 99.5%:
> "Error budget: roughly 216 minutes per month. That's about 3.6 hours. If a single incident consumes 4 hours, you've burned your entire monthly budget. Each outage has a cost ceiling."

Show the redundancy tier:
> "99.9% requires active-passive with hot standby. 99.99% requires multi-region active-active. The SLO is not a target � it is an infrastructure obligation. More nines means more spend."

> "Cost and reliability are always in tension. You cannot have both maximised for free. The SLO tab makes that trade-off concrete."

---

### Slide 25 � Discussion: Query Routing
**Time: ~2 minutes (timed)**

Start the 1:30 timer. Shorter discussion � this concept is more constrained.

**The question:** NovaAssist uses gpt-4o-mini for everything. The platform has a self-hosted Llama-8B NIM. What queries go where, and how do you decide at runtime?

**After the timer:**
> "The routing decision itself needs to be cheap � cheaper than either model. The solution is a lightweight intent classifier: a small, self-hosted model or even keyword rules that bucket each query. FAQ questions � 'How many vacation days?' � go to Llama-8B. Complex reasoning, low-confidence retrieval, agent steps � go to cloud. The classifier costs almost nothing. The savings on the 80% of FAQ queries is what gets you under the CFO's $2K cap."

---

### Slide 26 � Quiz: 2,000 PDFs Updated Weekly
**Time: ~1 minute**

**Correct answer: RAG ingestion pipeline + routing + eval.**

> "Fine-tuning bakes knowledge into frozen weights. If your documents update weekly, the model is always stale by the time training completes. RAG externalises knowledge into a vector store you can update in real time. Fine-tuning is for teaching a new skill. RAG is for giving the model a library. NovaAssist needs a library that updates on Mondays � not a skill."

---

## Part 5 � Capstone

---

### Slide 27 � Unified Enterprise Platform
**Time: ~3 minutes**

Click each of the five layers and trace a single request through all of them. Choose a concrete example: "Reset my VPN."

> "A user types 'Reset my VPN' in the chat. Let's trace what happens."

Click **Experience Layer**:
> "HTTP request hits the FastAPI endpoint. Azure AD SSO validates the JWT. The token contains user identity and department claim: IT. No valid JWT � 401, full stop."

Click **Orchestration Layer**:
> "LangGraph orchestrator receives the request. Planner decides: this probably needs a VPN troubleshooting doc, and maybe a ticket. Policy engine is consulted before any tool call."

Click **AI Services Layer**:
> "RAG pipeline retrieves the VPN reset procedure from Milvus � IT namespace only, dept_id filter from the JWT. Reranker scores the top chunks. LLM generates a response. NeMo Guardrails checks for citation and blocks any off-topic drift."

Click **Data Layer**:
> "Milvus IT namespace returns the VPN runbook chunk. No HR or Finance documents are visible � the namespace filter makes it architecturally impossible."

Click **Platform Layer**:
> "LangSmith logs the full trace: retrieval scores, latency, token cost, guardrail events. The cost dashboard records this query in the IT department's budget line. If a ticket is created, the audit log records every step with the user's identity."

**Closing line for this slide:**
> "One request. Five layers. Each layer has one job. Enterprise architecture is making sure each layer does only its job and hands off cleanly to the next."

---

### Slide 28 � ADR Trade-off Editor
**Time: ~4 minutes**

This replaces the passive worksheet. Introduce the concept:

> "This is an Architecture Decision Record exercise. You are Alex, and you need to choose a vector store for NovaAssist: Chroma, Milvus, or pgvector. There is no single correct answer � the right choice depends on what you prioritise. That is exactly what an ADR captures."

Explain the mechanics:
> "Four criteria, each with an importance weight you control. Pre-populated scores show how each option performs on each criterion. Adjust the weights to reflect your team's real priorities and watch the winner update live."

Walk through with the room:

**Start at equal weights (all 3.0):**
> "At equal importance, Milvus wins � it has the best combined score. But is that the right answer for every team?"

**Now push Ops Cost to 5:**
> "Your team has no infra expertise and zero ops budget. Chroma becomes very attractive � zero-ops, free, familiar. Is that defensible? Yes � if you're a single-dept prototype with no multi-tenancy requirement."

**Now push Multi-tenancy to 5:**
> "NovaAssist has three departments and a data isolation hard requirement. Milvus wins clearly. Chroma scores 1 out of 5 here � it has no native multi-tenancy."

**Now push Familiarity to 5 and multi-tenancy to 2:**
> "Team knows Postgres deeply, volume is moderate. pgvector wins. Also defensible � Row-Level Security provides isolation, and it runs on infrastructure you already operate."

**Click Lock in my decision:**
> "The point is not to pick the 'correct' database. The point is to be able to defend your choice given your constraints. Every ADR is exactly this: context, decision, consequences. Notice we never said Milvus is always right or Chroma is always wrong."

---

## Part 6 � Final Quiz + Close

---

### Slide 29 � Final Quiz Intro
**Time: ~30 seconds**

> "Five questions. Each one is a NovaAssist scenario. Answer as Alex's architecture advisor � the person responsible for the decision, not just the code."

---

### Slide 30 � Final Q1: The Compound Multi-Select
**Time: ~2 minutes**

This is a multi-select question. Students must pick exactly two options.

**The question:** NovaAssist must achieve both zero cross-dept leaks AND <$2K/month. Select the two changes that together achieve this.

Let students select and submit. After reveal:

**Correct: Milvus namespace + Embedding cache + NIM routing**

> "These two changes attack two completely different pillars at the same time. Milvus namespace with mandatory dept_id filter solves the data isolation problem � Pillar 1. Embedding cache plus routing 80% of queries to self-hosted NIM solves the cost problem � Pillar 5. GPT-4 upgrade makes the model more capable but does not isolate data or reduce embedding cost. Fine-tuning is expensive and becomes stale instantly with weekly doc updates. Audit logs add traceability but don't reduce cost or improve isolation."

> "Enterprise solutions often need to target multiple pillars simultaneously. That's the compound thinking this question tests."

---

### Slide 31 � Final Q2: Fluent Text, Wrong Chunks
**Time: ~1.5 minutes**

**Correct answer: Fix chunking + add reranker + run 30-Q eval.**

> "Fluent prose from the LLM combined with wrong chunks is the most common misdiagnosis in RAG. Students reach for a bigger model � GPT-4, fine-tuning. But the LLM is working perfectly. It is generating fluent text from the wrong source. You cannot fix a retrieval problem by upgrading the generator. Fix the retrieval: tune chunk sizes, add a reranker, and gate on your golden eval set. NovaAssist went from 0.61 to 0.89 precision with the same model, same prompt, just a reranker."

---

### Slide 32 � Final Q3: The Cost-Latency Trade-off
**Time: ~2 minutes**

This is the hardest question. Two constraints: <$1,500/month AND p99 <1s.

**Correct answer: Route 80% of queries to self-hosted Llama-8B NIM + cache top-200 FAQ embeddings.**

> "The CFO set two constraints simultaneously. Most interventions only address one. A bigger cloud model makes quality better but raises both cost and latency. An async worker fixes latency for uploads but doesn't touch query cost. An audit trail adds compliance but adds latency and cost. NIM routing plus embedding cache attacks both constraints at once: most queries become $0 marginal cost and sub-200ms because they're served from cache or the self-hosted model. This is the single highest-leverage architectural change in the NovaAssist v2.0 story."

> "If you ever have two conflicting constraints from two different stakeholders, find the change that addresses both simultaneously. That's the lever."

---

### Slide 33 � Final Q4: High Bill, High Latency
**Time: ~1.5 minutes**

**Correct answer: FAQ cache + NIM Llama-8B for 80% of queries + cache embeddings.**

> "8-second p99 and $4,000/month. The correct diagnosis: most queries are FAQ, every query hits the cloud LLM, embeddings are recomputed on every request. The fix routes FAQ queries to self-hosted, caches embeddings, and caps cloud usage. Removing rate limits would make latency and cost worse. Longer system prompts increase token count and cost. The lever is routing and caching, not the prompt."

---

### Slide 34 � Final Q5: IT/HR Doc Leak
**Time: ~1 minute**

**Correct answer: Data & Governance (Pillar 1).**

> "Students still sometimes say Security. Same distinction as Quiz 1. The leak happened because Chroma had no tenant filter � a data isolation failure. Authentication was working fine. The logged-in HR employee simply received documents from the wrong namespace because there was no namespace. Security failure would be: an unauthenticated user accessing the system. Data & Governance failure is: an authenticated user accessing the wrong tenant's data."

---

### Slide 35 � Enterprise Checklist
**Time: ~2 minutes**

Walk briefly through the checklist. Do not read every line � pick five that are most relevant to the audience.

**Always read these three:**
- "Dept namespace on every vector query" � the fix for Incident A.
- "Secrets in Key Vault � never in git or .env" � the fix for Incident D.
- "Idempotency key on create_ticket and all write tools" � the fix for the 12 duplicates.

Then say:
> "This checklist is not only for NovaAssist. If you have your own AI project � university, internship, side project � your README should name which pillars you skipped and why. 'We deferred tenant isolation because this is a single-user prototype; before production we would add namespace filtering.' That one sentence demonstrates the kind of thinking that separates a junior engineer from a senior one."

Ask if anyone wants to copy or print the checklist � the buttons are on the slide.

---

### Slide 36 � Closing: Alex's Lesson
**Time: ~2 minutes**

Read the closing line slowly:

> *"The demo that wins applause is not the architecture that survives Monday."*

Then:
> "Alex's POC was good. It proved the idea could work. That is exactly what a POC is for. The mistake was calling it production before running the risk list. Every failure in Week 2 was already visible in the code on Friday. None of them were surprises. Enterprise architecture is the discipline of finding those failures before your users do."

Give the closing challenge:
> "Tonight � not next week, tonight � close your laptop and try to redraw the NovaAssist v2.0 platform from memory. Five layers, three lenses. If you can trace one request from the chat UI through authentication, through the RAG pipeline, through the data layer, and out to the audit log � you have understood this workshop. If you cannot, that is the thing to go back and read."

End with the practical action:
> "This week, write one Architecture Decision Record for your own project. Context: what problem were you solving. Decision: what you chose and what you ruled out. Consequences: what you gained and what you deferred. That single habit, done consistently, is what separates people who build demos from people who build systems."

**Pause.** Let the room sit with it for a moment. Then open for questions.

---

## Quick Reference: Full Timing Summary

| Slide | Title | Time |
|-------|-------|-----:|
| 1 | Title | 1 min |
| 2 | Agenda | 1 min |
| 3 | Meet NovaAssist | 2 min |
| 4 | What Happened in Week 2 | 3 min |
| 5 | Who Cares About What? | 2 min |
| 6 | Friday Demo: Everyone Claps | 3 min |
| 7 | Then 120 Users Show Up | 2 min |
| 8 | War Room: Decision Tree | 4 min |
| 9 | Enterprise Gap Framework | 3 min |
| 10 | Quiz: HR retrieves IT runbook | 1 min |
| 11 | Quiz: Quality / prompt change | 1 min |
| 12 | Quiz: API key scraped | 1 min |
| 13 | RAG: v0.1 ? v1.0 diagram | 3 min |
| 14 | Architecture Builder | 3 min |
| 15 | Spot the Gap + fix selection | 3 min |
| 16 | Discussion: Eval pipeline | 3 min |
| 17 | Quiz: Eval strategy | 1 min |
| 18 | Agents: New Powers, New Risks | 3 min |
| 19 | Tool Policy Game | 4 min |
| 20 | Observability Triage | 3 min |
| 21 | Discussion: refund_payment | 3 min |
| 22 | Quiz: 12 duplicate tickets | 1 min |
| 23 | Inference: Cost and Scale | 3 min |
| 24 | Cost Simulator + SLO tab | 4 min |
| 25 | Discussion: Query routing | 2 min |
| 26 | Quiz: 2,000 PDFs / RAG vs fine-tune | 1 min |
| 27 | Unified Enterprise Platform | 3 min |
| 28 | ADR Trade-off Editor | 4 min |
| 29 | Final Quiz intro | 0.5 min |
| 30 | Final Q1 � compound multi-select | 2 min |
| 31 | Final Q2 � fluent text, wrong chunks | 1.5 min |
| 32 | Final Q3 � CFO cost-latency trade-off | 2 min |
| 33 | Final Q4 � high bill, high latency | 1.5 min |
| 34 | Final Q5 � IT/HR leak pillar | 1 min |
| 35 | Enterprise Checklist | 2 min |
| 36 | Closing: Alex's Lesson | 2 min |
| | **Total** | **~82 min** |

Buffer of 8�38 minutes available for questions, extended discussions, or slower groups.

---

## Key Lines to Have Ready (If You Forget Everything Else)

> "A POC proves the idea can work. An enterprise system proves it can survive real users, real data, real cost, and real risk."

> "Every failure in Week 2 was already visible in the code on Friday afternoon. None were surprises."

> "NovaAssist v1.0 uses the same model as v0.1. The wrong-answer rate halved purely from fixing retrieval. The model is almost never the problem."

> "Policy is code, not a prompt. You cannot prompt-inject your way past a hard policy rule."

> "62% of the $4,200 bill was embedding � not generation."

> "Offline catches what you broke. Online catches what the world broke."

> "The demo that wins applause is not the architecture that survives Monday."
