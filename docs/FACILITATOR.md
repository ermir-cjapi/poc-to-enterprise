# Facilitator Guide - POC to Enterprise AI Workshop

Simple running notes for presenting the NovaAssist workshop.

**Audience:** AI university interns  
**Duration:** 90-120 minutes  
**Open:** `index.html` in Chrome or Edge  
**Use with:** `docs/PRESENTER-PREP.md`, `docs/SLIDE-GUIDE.md`, and `docs/nova-assist.md`

---

## The Main Idea

This workshop is not about memorising tools. It is about learning how engineers make decisions when an AI demo becomes a real system.

Keep bringing students back to this sentence:

> A POC proves the idea can work. An enterprise system proves it can survive real users, real data, real cost, and real risk.

NovaAssist is the story you use to make that idea concrete.

---

## Before Students Arrive

1. Open `index.html`.
2. Press **F** for fullscreen.
3. Press **S** for speaker notes.
4. Go to the first slide.
5. Click through at least one diagram to make sure popups work.

If students have laptops, they can open the same file and answer the interactive parts themselves.

---

## Simple Timing

| Part | Time | Purpose |
|---|---:|---|
| Intro + case study | 15 min | Make the story feel real |
| Hook + risk poll | 15 min | Show why the POC breaks |
| Gap framework | 12 min | Give students the six categories |
| RAG lens | 20 min | Fix retrieval, data isolation, guardrails, eval |
| Agent lens | 15 min | Show why actions need policies |
| Inference lens | 15 min | Connect cost and scale to architecture |
| Platform + worksheet | 15 min | Put everything together |
| Final quiz + close | 10 min | Reinforce the main lessons |

If you are short on time, skip one discussion slide. Do not skip the worksheet or final quiz.

---

## Part 1 - Intro And Case Study

### Title And Agenda

**What to do:** Set the tone quickly. Do not explain every technology yet.

**Say:** "Today is about decisions, not syntax. We will follow one AI project from a Friday demo to an enterprise system."

**Key point:** Students should understand that NovaAssist is one continuous story, not separate examples.

### Meet NovaAssist

**Explain simply:** Alex is an intern. Alex builds an HR chatbot over PDFs. The Friday demo works. Everyone is excited.

**Ask:** "Who has built something like this: chatbot, RAG app, document Q&A, or LLM demo?"

**Key point:** The POC is not bad. It is good for a POC. The mistake is treating it as production.

### Week 2 Incidents

Pause on each incident:

| Incident | Simple meaning |
|---|---|
| `$4,200` bill | No cost control |
| HR saw IT docs | No data isolation |
| Wrong HR answer | No eval or document versioning |
| API key scraped | No secrets management |

**Say:** "Every one of these problems was visible before launch. Enterprise work means finding and owning those risks before users hit them."

### Stakeholders

**Explain simply:** Different people care about different failures.

| Stakeholder | What they care about |
|---|---|
| HR | Answers must be correct and cited |
| Security | Departments must not see each other's data |
| CFO | The bill must be predictable |
| Platform team | The system must be maintainable after Alex leaves |

**Key point:** Architecture is not only technical. It has to satisfy all of these people at the same time.

---

## Part 2 - The POC Breaks

### Friday Demo

**What to do:** Click the main boxes in the POC diagram.

**Explain simply:** The stack is small: user, FastAPI, OpenAI, Chroma. This is fine for a demo.

**Say:** "The problem is not this architecture on Friday. The problem is this architecture on Monday with 120 users and three departments."

### Then 120 Users Show Up

Read the two incidents slowly.

**Ask:** "Who is hurt here: the user, HR, Security, Finance, or Platform?"

Let students answer in business terms before you use technical terms.

### Risk Poll

**What to do:** Ask students to pick their top three risks.

After they answer, ask two or three students why they chose those risks.

**Debrief simply:**

| Risk | What it really means |
|---|---|
| Cost spike | Scale and cost problem |
| Department leak | Data governance problem |
| Wrong answer | Eval and observability problem |
| Prompt injection | Security problem |
| Slow latency | Reliability problem |
| No traces | Observability problem |

**Key point:** There are no silly choices. Enterprise systems need an owner and a mitigation for every serious risk.

---

## Part 3 - The Six Gap Pillars

Use this as the simple version of the framework:

| Pillar | Plain-English question |
|---|---|
| Data & Governance | Can the right users access only the right data? |
| Security | Are secrets, auth, and attack paths controlled? |
| Reliability | Does it still work when services fail or traffic grows? |
| Observability | Can we see quality, cost, latency, and failures? |
| Scale & Cost | Can we afford this when usage grows? |
| MLOps / LLMOps | Can we version, test, deploy, and roll back prompts and models? |

**Say:** "These are not NovaAssist-specific. They are the usual gaps between an AI demo and a real AI product."

### Quiz Debriefs

Keep the quiz explanations short:

| Quiz | Correct idea | Say this |
|---|---|---|
| HR retrieves IT runbook | Data & Governance | "The fix is department metadata plus a department filter on every search." |
| Quality dropped after prompt change | Observability | "Prompt changes need tests, just like code changes." |
| API key scraped | Security | "First rotate the key. Then move secrets into a vault and scan commits." |

---

## Part 4 - RAG Lens

### What Alex Must Change

**What to do:** Click the enterprise diagram boxes: department namespace, reranker, guardrails, observability.

**Explain simply:**

| Change | Why it matters |
|---|---|
| Auth + JWT | Know who the user is |
| Department namespace | Stop HR and IT data from mixing |
| Async worker | Do embedding outside the request path |
| Reranker | Improve which chunks are selected |
| Guardrails | Require citations and block unsafe output |
| Eval + observability | Know if quality is getting better or worse |

**Key point:** NovaAssist improves without changing the LLM. The main fix is better retrieval and better system design.

### Architecture Builder

**What to do:** Let students add the six layers.

**Ask:** "Which layer would you add first, and why?"

Good answers are usually auth, department isolation, or cost controls. The useful discussion is why they picked that order.

### Spot The Gap

**What to do:** Let students click the hidden bugs.

**Debrief:** Link each bug back to a real incident:

| Hidden gap | Real incident |
|---|---|
| No guardrails | Wrong HR answer without a source |
| No department isolation | IT runbook shown to HR |
| No observability | Nobody can prove when quality changed |

### Eval Discussion

Use the simple version:

**Offline eval:** Runs before deploy. It catches regressions you introduced.  
**Online eval:** Runs in production. It catches changes in the real world.

**Say:** "Offline catches what you broke before it ships. Online catches what changed after it shipped. You need both."

---

## Part 5 - Agent Lens

### Agents: New Powers, New Risks

**Explain simply:** A chatbot gives an answer. An agent takes an action.

That is why the risk changes. A bad answer is a problem. A bad action can create tickets, send emails, refund money, or delete records.

**Key point:** Agent safety should be enforced by code and policy, not only by prompting the model nicely.

### Tool Policy Game

Use this rule:

| Tool type | Policy |
|---|---|
| Read-only and scoped | Auto-approve |
| Write action | Human approval |
| Irreversible or high-blast-radius action | Block |

Correct answers:

| Tool | Policy |
|---|---|
| `search_docs` | Auto |
| `lookup_asset` | Auto |
| `create_ticket` | Human gate |
| `update_salary` | Human gate |
| `send_email_all` | Block |
| `delete_records` | Block |

### Refund Payment Discussion

Expected answer: use thresholds.

Example:

| Amount | Policy |
|---:|---|
| Under `$50` | Maybe auto, if business accepts it |
| `$50-$500` | Human approval |
| Over `$500` | Block or require stronger approval |

**Key point:** The human gate happens after the agent has resolved the user's vague request into a specific action.

Example: "Refund John's last order" becomes `refund_payment(customer_id=John, amount=340)`. Show that exact action before execution.

### Duplicate Tickets Quiz

**Correct idea:** Human approval, idempotency key, max steps, timeout.

**Say:** "An idempotency key means the same action cannot be repeated accidentally. If a similar ticket was created five minutes ago, return the existing ticket instead of creating another one."

---

## Part 6 - Inference Lens

### Cost And Scale

**Explain simply:** Cost is an architecture requirement, not an accounting detail.

NovaAssist's bill was high because it had no limits, no caching, and inefficient embedding.

**Key point:** The CFO gives a constraint. The architecture must meet it.

### Cost Simulator

**What to do:** Move sliders in this order:

1. Start at 1,000 queries/day, 100% cloud, 0% cache.
2. Move cloud usage down to about 20%.
3. Move cache up to about 70%.

**Say:** "Routing common questions to a cheaper path and caching frequent queries can matter more than changing models."

### Query Routing

**Simple explanation:** Use a cheap classifier first.

| Query type | Route |
|---|---|
| Simple FAQ | Cheap/self-hosted model |
| Complex reasoning | Stronger cloud model |
| Agent action | Stronger model plus policy checks |

### RAG vs Fine-Tuning Quiz

**Correct idea:** Use RAG for documents that change often.

**Say:** "Fine-tuning teaches a model a skill. RAG gives a model a library. NovaAssist needs a library because the policies change every week."

---

## Part 7 - Unified Platform And Worksheet

### Unified Platform

Trace one request through the five layers:

| Layer | Simple role |
|---|---|
| Experience | User interface and API |
| Orchestration | Agent workflow and approvals |
| AI Services | RAG, LLM, embeddings, guardrails |
| Data | Vector DB, documents, structured data |
| Platform | Auth, secrets, CI/CD, monitoring, cost |

**Say:** "A real request crosses several layers. Enterprise architecture is making sure each layer does its job."

### Worksheet

Give students five quiet minutes.

Ask them to fill in:

1. What project are you thinking about?
2. What would break first at 100 real users?
3. Which pillar does that belong to?
4. Who would care?
5. What would you fix before launch?

Ask one or two students to share only one field. The best question is:

**"What would break first at 100 users?"**

---

## Part 8 - Final Quiz And Close

For each final quiz question:

1. Let students answer.
2. Reveal the correct answer.
3. Give one sentence of explanation.

Quick answer key:

| Question theme | Correct idea |
|---|---|
| SSO, traces, CI/CD, secrets | Platform layer |
| Fluent text, wrong chunks | Fix retrieval first |
| Duplicate tickets | Idempotency, max steps, approval gate |
| High bill and high latency | Routing, caching, self-hosted embedding |
| IT/HR document leak | Data & Governance |

### Enterprise Checklist

**Say:** "This checklist is not only for NovaAssist. Put a short version in your own project README. Even if you skip a pillar for a university project, name that you skipped it and why."

### Closing

**Say:** "The demo that wins applause is not automatically the architecture that survives Monday."

End with one practical action:

**"This week, write one Architecture Decision Record for your own project: context, decision, consequences."**

---

## Common Student Questions

### "Do we need all of this for a university project?"

No. But you should know what you skipped.

Good answer in a README: "This is a single-user prototype. We skipped tenant isolation for now. Before production, we would add department metadata and filter every retrieval query."

### "Why not just use a better model?"

A better model does not fix wrong retrieval, missing auth, leaked secrets, no budget limits, or no logs. Fix the architecture first.

### "Is fine-tuning better than RAG?"

It depends. Use RAG when the facts change often and you need citations. Use fine-tuning when you need to teach a stable behaviour, style, or task pattern.

### "What is the simplest enterprise upgrade?"

Add auth, isolate data, move secrets into a vault, add rate limits, and create a small eval set. Those five changes already move a demo much closer to production.

### "What if no one answers a discussion question?"

Give them 30 seconds to write first. Then ask: "What would break first?" That question is easier than "What is the architecture?"

---

## If You Get Lost

Return to the story:

1. Alex built a good POC.
2. Real users exposed real risks.
3. Each risk maps to a pillar.
4. Each fix is an architecture decision.
5. Students can apply the same pattern to their own projects.

That is the workshop.
