# Slide-by-Slide Guide
### What every slide is about and why it is there

Use this document as a quick reference before or during the workshop. Each entry explains the **purpose** (why the slide exists), the **content** (what is on screen), and the **key point** you should leave students with.

---

## Setup slides (before the workshop starts)

### Slide 1 ï¿½ Title: "From POC to Enterprise"
**Purpose:** Sets the tone and signals this is not a lecture about code ï¿½ it is a decision-making workshop.

**What is on screen:** The workshop title, subtitle "90-minute hands-on workshop", and a brief framing of what the session is about.

**Key point:** The words "not syntax, not APIs ï¿½ decisions" are the entire thesis of the workshop. Say them out loud. Students should leave knowing *what to decide*, not just *what to build*.

---

### Slide 2 ï¿½ Agenda
**Purpose:** Gives students a map of the session so they know what to expect and how the parts connect.

**What is on screen:** Six parts listed with their themes. The NovaAssist case study is mentioned as the thread that runs through everything.

**Key point:** *"One project threads through every slide. By the end you'll know this project inside out ï¿½ and then apply it to your own."*

---

## Case Study Introduction (Slides 3ï¿½5)

### Slide 3 ï¿½ Meet NovaAssist
**Purpose:** Introduces the fictional case study that will be referenced on every subsequent slide. Students need to feel this is a real, familiar project before the problems start.

**What is on screen:** A project card with company (NovaTech), intern (Alex), stack (FastAPI + Chroma + OpenAI), and a two-sentence story: Friday demo ? standing ovation ? "Ship it Monday."

**Key point:** Ask the room: *"Who has built something exactly like this?"* Almost every intern has. That moment of recognition is what makes the rest of the workshop feel relevant instead of abstract.

---

### Slide 4 ï¿½ What Happened in Week 2
**Purpose:** Delivers the four real incidents that Alex faced when the POC was opened to 120 users. These incidents are not made up ï¿½ they are composites of real production failures. Everything in the workshop is a response to one of these four numbers.

**What is on screen:** A timeline (Week 1ï¿½4), four red metrics ($4,200 bill / 1 data leak / 1 wrong policy answer / 1 API key scraped), and a "Core Message" box.

**Key point:** *"Enterprise architecture is not a checklist you memorise ï¿½ it is a sequence of decisions triggered by real failures."* Pause on each metric and let the weight of it land before moving on.

---

### Slide 5 ï¿½ Who Cares About What?
**Purpose:** Shows that each stakeholder at NovaTech is worried about a completely different problem. This sets up the idea that enterprise architecture must satisfy multiple constraints simultaneously ï¿½ not just the technical ones.

**What is on screen:** Four stakeholder cards: HR sponsor (correctness), IT Security (isolation + logs), CFO (cost), Platform team (maintainability).

**Key point:** *"Every stakeholder is worried about a different thing. Your architecture must satisfy all four simultaneously. That is the actual job."* Students often think the only goal is "make it work." This slide corrects that.

---

## Part 0 ï¿½ Hook (Slides 6ï¿½8)

### Slide 6 ï¿½ Friday Demo: Everyone Claps
**Purpose:** Shows the v0.1 POC diagram in its full, clean simplicity. The goal is to make students appreciate *why* Alex built it this way ï¿½ it was a perfectly reasonable POC.

**What is on screen:** An interactive SVG diagram of the v0.1 stack: User ? FastAPI ? OpenAI API ? Chroma. Every box is clickable and shows a tooltip explaining what it does and what it is missing.

**Key point:** *"This architecture is perfectly reasonable for a proof of concept with one user and one department. The problem is not the code ï¿½ the problem is calling it production."* Click a few boxes so students see the interactivity.

---

### Slide 7 ï¿½ Then 120 Users Show Up
**Purpose:** Narrates the transition from Friday demo to Monday production. This slide is purely story ï¿½ no activity, no quiz. It is meant to create a sense of dread.

**What is on screen:** Incident A (IT runbook in HR results) told as a story with a timestamp: Tuesday 9:14 AM.

**Key point:** Tell the story slowly. *"IT Security is on the phone before 10 AM."* Let the room react. This emotional hook makes the gap framework slides feel urgent rather than theoretical.

---

### Slide 8 ï¿½ Risk Poll (interactive)
**Purpose:** Forces students to think like an architect *before* they've been taught the framework. They must prioritise competing risks with real consequences ï¿½ a cross-department data leak, a $4,200 bill, a wrong HR policy answer, a scraped API key, 8-second latency, and no observability.

**What is on screen:** Six risk options with checkboxes. Students select their top 3 and submit. The poll shows aggregate results.

**Why this slide matters:** Students will have different priorities. Some will pick cost first because it's already happened. Others pick the data leak because it has legal consequences. Others pick prompt injection because they're security-minded. *None are wrong.* The discussion after is the actual learning ï¿½ not the poll result.

**Key point:** *"The difference between a POC and an enterprise system is that enterprise assigns an explicit owner and a mitigation to every risk before go-live ï¿½ not after the incident proves it's real."* This is the central thesis of the entire workshop. Say it clearly.

---

## Part 1 ï¿½ Gap Framework (Slides 9-12)

### Slide 9 ï¿½ The Enterprise Gap Framework
**Purpose:** Introduces the six-pillar framework that organises all enterprise AI concerns. Every incident, quiz, and diagram in the workshop maps back to one of these six pillars.

**What is on screen:** Six cards, one per pillar: (1) Data & Governance, (2) Security, (3) Reliability, (4) Observability, (5) Scale & Cost, (6) Organisational Readiness. Each card has a one-sentence NovaAssist failure example.

**Key point:** This framework is not a checklist to pass ï¿½ it is a map of where things break. Every quiz question in the workshop tests one pillar. Students should be able to name all six from memory by the end.

---

### Slide 10 ï¿½ Quiz: HR retrieves IT runbook
**Purpose:** Tests whether students can map a real symptom to the correct gap pillar. The symptom is Incident A.

**Correct answer:** Data & Governance (Pillar 1) ï¿½ no `dept_id` namespace in the vector DB.

**Why this quiz:** Students often say "that's a security problem." It's not. The leak happened because there was no data isolation in Chroma ï¿½ no tenant filter, not because authentication failed. The distinction between Data & Governance vs Security is important: data isolation is in Pillar 1, API key security is in Pillar 2.

---

### Slide 11 ï¿½ Quiz: Quality dropped after prompt change
**Purpose:** Tests Observability (Pillar 4). Alex changed the system prompt and had no way to know if quality got worse.

**Correct answer:** Observability ï¿½ no offline eval set, no production feedback loop.

**Key point:** *"Before you change any prompt, you need a test set of known good questions and expected answers. You run it in CI. If faithfulness drops, the deploy is blocked. That is what observability means for RAG ï¿½ not just logs, but eval pipelines."*

---

### Slide 12 ï¿½ Quiz: API key scraped from GitHub
**Purpose:** Tests Security (Pillar 2). Alex committed the OpenAI API key to `.env` which was later made public.

**Correct answer:** Security ï¿½ rotate key immediately + Azure Key Vault + secret scanner in CI.

**Key point:** Always emphasise the **immediate** first step: rotate the key and assume it was used maliciously. Then the permanent fix: Key Vault + managed identity + pre-commit `detect-secrets` hook. Never mention "use a `.env` file" as a solution ï¿½ that file was the problem.

---


## Part 2 ï¿½ RAG Lens (Slides 13-17)

### Slide 13 ï¿½ RAG: What Alex Must Change (v0.1 vs v1.0)
**Purpose:** Shows side-by-side the POC diagram (v0.1) and the enterprise RAG diagram (v1.0). Students see exactly what changed and why, by clicking each new component.

**What is on screen:** Two interactive SVG diagrams. Left: the old v0.1 stack. Right: the v1.0 stack with Milvus (dept namespace), async worker, reranker, NeMo Guardrails, LangSmith. Every new component is clickable.

**Key point:** *"Notice that NovaAssist v1.0 uses the same model as v0.1 ï¿½ gpt-4o-mini. Not GPT-4. Not fine-tuning. The wrong-answer rate halved purely from fixing retrieval. The model is rarely the problem."* This is the most important RAG insight in the workshop.

---

### Slide 14 ï¿½ Architecture Builder (interactive)
**Purpose:** Students build the v1.0 enterprise RAG stack themselves by clicking buttons one at a time. Each button adds a layer and shows a popup explaining which NovaAssist incident that layer fixes.

**What is on screen:** The v0.1 base stack on the left. Six buttons on the right: +Auth & JWT, +Dept Namespace, +Async Worker, +Reranker, +Guardrails, +Eval & Observability. Each click lights up a new layer in the diagram and shows a panel explaining the fix.

**Why this is interactive:** Learning by doing. Students who build the stack themselves remember why each layer exists, not just what it does.

---

### Slide 15 ï¿½ Spot the Gap (interactive)
**Purpose:** Students click glowing circles on a simplified v0.1 diagram to reveal the hidden gaps ï¿½ the things that were missing that caused the Week 2 incidents.

**What is on screen:** The v0.1 diagram with six numbered hotspots (glowing green circles). Clicking each one reveals a gap description in the panel below.

**Key point:** Every gap maps back to a pillar. This is a self-directed version of the quiz questions ï¿½ students discover the problems rather than being told them.

---

### Slide 16 ï¿½ Discussion: Eval pipeline
**Purpose:** A timed pair/share discussion. Students think about what an evaluation strategy for NovaAssist should include before the answer is revealed on slide 18.

**What is on screen:** Discussion prompt + 2:00 timer. The question: *"What would a complete evaluation strategy for NovaAssist look like?"*

**Key point:** The correct answer is **both offline and online — they protect against different failure modes**.

- **Offline** = 30-question golden set runs in CI before every deploy. Blocks regressions *you introduced* (prompt changes, model swaps, chunking changes). Cannot catch changes in the world after you deploy.
- **Online** = LangSmith tracks 7 live signals continuously in production: user thumbs-down rate, retrieval score drift, context relevance, hallucination rate, cost per query, latency percentiles, and agent success rate. Catches drift the world introduces — documents updated, query patterns changing, batch scripts burning budget.

**The one-sentence version to say out loud:** *"Offline catches what you broke before it ships. Online catches what the world broke after it shipped."*

See `nova-assist.md` Section 10 for the full signal breakdown with examples.

---

### Slide 17 ï¿½ Quiz: Eval strategy
**Purpose:** Confirms students understood the discussion. Tests whether they know both eval types are needed.

**Correct answer:** Both offline CI gate + online monitoring.

**Key point:** *"Offline without online means you wait for users to discover production drift ï¿½ like the Incident C wrong policy answer. Online without offline means your CI never catches regressions before they ship."*

---

## Part 3 ï¿½ Agentic Lens (Slides 18-21)

### Slide 18 ï¿½ Agents: New Powers, New Risks
**Purpose:** Introduces the agentic version of NovaAssist (v1.5) where the bot can take actions ï¿½ not just answer questions. Shows the new risks this creates, specifically the overnight loop that created 12 duplicate ServiceNow tickets.

**What is on screen:** A diagram showing the v1.5 agent architecture with LangGraph, tool registry, policy engine. The "create_ticket (no guard)" node is clickable and shows the incident detail.

**Key point:** *"Agents fail differently from chatbots. A chatbot gives a wrong answer ï¿½ bad, but recoverable. An agent takes an action in the real world. 12 ServiceNow tickets took the IT team 4 hours to clean up."* The failure mode is completely different.

---

### Slide 19 ï¿½ Tool Policy Game (interactive)
**Purpose:** Students classify six tools into three policy zones: Auto-approve, Human gate required, or Block entirely. This forces them to think about the risk level of each action before the model executes it.

**What is on screen:** Six tool cards on the left (search_docs, create_ticket, lookup_asset, send_email_all, delete_records, update_salary). Three drop zones on the right. Drag or click to classify.

**The correct answers:**
| Tool | Correct zone | Why |
|------|-------------|-----|
| search_docs | Auto-approve | Read-only, scoped to user's department |
| lookup_asset | Auto-approve | Read-only, scoped to requesting user |
| create_ticket | Human gate | Write action ï¿½ caused 12 duplicate tickets |
| update_salary | Human gate | Financial write ï¿½ needs approval + threshold |
| send_email_all | Block entirely | Irreversible broadcast to 800 people |
| delete_records | Block entirely | Permanent data destruction |

**Key point:** The classification rule is simple: read-only + scoped = auto. Write + reversible = gate. Write + irreversible or high-blast-radius = block.

---

### Slide 20 ï¿½ Discussion: refund_payment
**Purpose:** Extends the tool policy discussion to a more nuanced case ï¿½ a financial tool with a variable amount. There's no single right answer; the correct answer depends on thresholds.

**What is on screen:** Discussion prompt + 2:00 timer. The question: *"NovaAssist v2.0 wants to add `refund_payment` for Finance (up to $500). Auto, gate, or block?"*

**Key point:** The expected answer is a **tiered policy** ï¿½ not a single zone for the whole tool. For example: `< $50` = auto-approve, `$50ï¿½$500` = human gate, `> $500` = block. The amount changes the risk level. This is the most realistic enterprise scenario in the workshop.

---

### Slide 21 ï¿½ Quiz: 12 duplicate tickets
**Purpose:** Tests whether students know the specific technical fix for the agent loop problem.

**Correct answer:** Idempotency key ï¿½ hash the intent, check if a ticket with that hash was created in the last 5 minutes, return the existing ticket ID instead of creating a new one.

**Key point:** *"One line of code prevents all 12 duplicates. The idempotency key is underrated."* Also mention `max_steps=8` and `timeout=30s` as guardrails in LangGraph ï¿½ if the agent hits 8 steps, it stops and asks the user.

---

## Part 4 ï¿½ Inference Lens (Slides 22-25)

### Slide 22 ï¿½ Inference: Cost and Scale
**Purpose:** Shows where NovaAssist's $4,200 bill actually came from. Most students assume the expensive part is the LLM (generation). It was actually the **embeddings**.

**What is on screen:** A cost breakdown diagram showing 62% of the bill was embedding calls, not generation. Explains the re-embedding bug and the batch-query script.

**Key point:** *"62% of NovaAssist's bill was embedding ï¿½ not generation. Alex thought the expensive part was the LLM. It was the embeddings."* This surprises almost every student. It also sets up the cost simulator.

---

### Slide 23 ï¿½ Cost Simulator (interactive)
**Purpose:** Students adjust three sliders ï¿½ queries per day, % of queries routed to cloud, % served from cache ï¿½ and see the monthly cost change in real time. They discover the v2.0 configuration themselves.

**What is on screen:** Three sliders + four output cards (embed cost, generation cost, total/month, cost per query).

**How to run it:**
1. Start at default (1,000 queries/day, 100% cloud, 0% cache) ï¿½ shows the expensive baseline
2. Change cloud % to 20% ? cost drops significantly (most queries go to self-hosted Llama-8B)
3. Change cache to 70% ? drops further
4. That configuration (1,000/day, 20% cloud, 70% cached) = NovaAssist v2.0 at under $1,840/month. CFO approved.

**Key point:** *"The CFO didn't give a technology mandate ï¿½ they gave a budget constraint. That constraint forced the architecture decision."*

---

### Slide 24 ï¿½ Discussion: Query routing
**Purpose:** Pair/share on how to route queries between cheap and expensive models.

**What is on screen:** Discussion prompt: *"NovaAssist sees 1,000 queries/day. How would you decide which go to self-hosted Llama-8B vs cloud gpt-4o-mini?"*

**Key point:** The answer is an **intent classifier** ï¿½ a very cheap model (or even a keyword filter) that buckets each query: FAQ (go to Llama-8B), complex reasoning (go to cloud), agent action (go to cloud). 80% of NovaAssist queries are FAQ. Routing them to the self-hosted model is the single biggest cost saving.

---

### Slide 25 ï¿½ Quiz: 2,000 PDFs updated weekly
**Purpose:** Tests the RAG vs fine-tuning decision. This is the most common mistake in AI projects ï¿½ teams try to fine-tune on documents that change frequently.

**Correct answer:** RAG ingestion pipeline + routing + eval.

**The decision rule to explain:**
- Fine-tuning bakes knowledge into frozen weights. If documents change weekly, the model is always stale by the time training completes.
- RAG externalises knowledge into the vector store. Update a PDF today, the model answers correctly today. No retraining needed.

**Key point:** *"Fine-tuning is for teaching the model a new skill. RAG is for giving the model a library to look things up in. NovaAssist needs a library that updates on Mondays ï¿½ not a skill."*

---

## Part 5 ï¿½ Capstone (Slides 26-27)

### Slide 26 ï¿½ Unified Platform (5-layer diagram)
**Purpose:** Shows all three lenses (RAG, Agents, Inference) unified into a single five-layer enterprise platform diagram. This is the architecture NovaAssist v2.0 runs on.

**What is on screen:** A full-platform SVG diagram with five colour-coded layers. Every layer is clickable. The slide also has a "live trace" instruction: trace a request from login to response through all five layers.

**The five layers:**
| Layer | Colour | What it does in NovaAssist |
|-------|--------|---------------------------|
| Experience | Blue | Chat UI + FastAPI + Azure AD SSO |
| Orchestration | Purple | LangGraph agents + policy engine + approval UI |
| AI Services | Green | NIM Embed + Milvus + Reranker + NIM LLM + NeMo Guardrails |
| Data | Orange | Milvus (dept namespaces) + Blob storage + SQL |
| Platform | Grey | Azure Key Vault + LangSmith + GitHub Actions + cost dashboard |

**Key point:** Click each layer and trace a real request: *"JWT from Experience ? agent plan in Orchestration ? RAG in AI Services ? Milvus dept filter in Data ? audit log in Platform."* Students should be able to trace this from memory by the end.

---

### Slide 27 ï¿½ Worksheet (interactive)
**Purpose:** Students apply the NovaAssist pattern to their own project. Five minutes of quiet writing. This is the moment the abstract becomes personal.

**What is on screen:** A worksheet with six fields: project name, the incident that would happen first at 100 users, which gap pillar it belongs to, the fix, the stakeholder affected, and one NFR they would add.

**How to run it:** Give 5 minutes of silence ï¿½ no talking. Then ask 1ï¿½2 volunteers to share one field. The best field to ask about: *"What incident would happen first at 100 users?"*

**Key point:** Students who haven't built anything yet should design a project and do the exercise for that. The worksheet forces the mental model shift from "I built a thing" to "I'm responsible for what this thing does at scale."

---

## Part 6 ï¿½ Quiz + Close (Slides 28-35)

### Slides 28-33 ï¿½ Final Quiz (intro + 5 questions)
**Purpose:** Consolidation. Each question maps to one of the five workshop pillars and uses a NovaAssist scenario as the stem.

**The five questions and correct answers:**
1. *SSO login, LangSmith traces, GitHub Actions deploy ï¿½ which layer?* ? **Platform Layer**
2. *Wrong HR chunks but fluent LLM text ï¿½ first fix?* ? **Fix retrieval / add reranker** (not the model ï¿½ the most common wrong answer)
3. *12 duplicate ServiceNow tickets overnight ï¿½ what was missing?* ? **Idempotency key + max_steps guard**
4. *8s p99, $4K/month ï¿½ CFO wants <$2K and <1.2s ï¿½ best lever?* ? **Query routing + self-hosted embedding**
5. *IT/HR doc leak ï¿½ which gap pillar?* ? **Data & Governance (Pillar 1)**

**For each question:** Let students click, reveal the answer, then give the one-sentence explanation. Don't spend more than 2 minutes per question.

---

### Slide 34 ï¿½ Enterprise Checklist
**Purpose:** Gives students a portable reference card ï¿½ the six-pillar checklist they can apply to any AI project, including their own.

**What is on screen:** A two-column checklist with checkboxes for all six pillars and their key sub-items. Export and print buttons.

**Key point:** *"Your README should name which pillars you knowingly skipped and why. 'We deferred tenant isolation because this is a single-user prototype; before production we would add namespace filtering.' That one sentence demonstrates senior thinking."*

---

### Slide 35 ï¿½ Closing: "Alex's Lesson"
**Purpose:** The emotional close. Brings the story back to Alex and gives students a concrete action to take tonight.

**What is on screen:** Alex's lesson in three sentences. A closing challenge.

**The closing challenge to say:** *"Take your worksheet. Tonight ï¿½ not next week, tonight ï¿½ redraw NovaAssist v2.0 from memory. Five layers, three lenses. If you can trace one request through all five layers, you understand enterprise AI architecture."*

**Why this matters:** Students leave with a task they can do in 20 minutes that proves to themselves whether they understood the session. It's not homework ï¿½ it's a self-test.

---

## Quick Reference: What does each part cover?

| Slides | Part | Core question |
|--------|------|---------------|
| 1ï¿½2 | Setup | What is this workshop about? |
| 3ï¿½5 | Case Study | Who is Alex, what went wrong, who cares? |
| 6ï¿½8 | Hook | Why is this hard? What risks exist? |
| 9-12 | Gap Framework | What are the six pillars? Which pillar broke? |
| 13-17 | RAG Lens | How do you fix retrieval at enterprise scale? |
| 18-21 | Agentic Lens | How do you make agents safe? |
| 22-25 | Inference Lens | How do you control cost and routing? |
| 26-27 | Capstone | How does it all fit together? Can you apply it? |
| 28-35 | Quiz + Close | Can you answer scenario questions? What's next? |
