# POC to Enterprise AI Architecture Workshop

Interactive workshop for AI university interns — **one case study (NovaAssist)**, three architecture lenses (RAG, agentic, inference), NVIDIA reference patterns.

## Local development

```bash
npm install
npm start        # serves at http://localhost:3456
```

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings ? Pages ? Source** and select **GitHub Actions**
3. Push to `main` — the workflow in `.github/workflows/deploy.yml` runs automatically
4. Live at `https://<your-username>.github.io/<repo-name>/`

Share the URL in the Teams chat **at the moment you start** — not before.

## What this workshop teaches

Not slide templates — a **story**:

1. **NovaAssist** — intern Alex builds an HR chatbot at NovaTech
2. **Week 2 incidents** — cross-dept data leak, $4,200 API bill, wrong policy answer, API key in GitHub
3. **Evolution** — v1.0 RAG hardening ? v1.5 agents with tools ? v2.0 inference routing
4. **Capstone** — NovaAssist on a five-layer enterprise platform

Every quiz, diagram, and discussion is tied to Alex's project.

## Presenting

| Key | Action |
|-----|--------|
| **S** | Speaker notes (facilitator script on every slide) |
| **F** | Fullscreen |
| **? / Space** | Next slide |
| **Esc** | Slide overview |

**Read first:** [FACILITATOR.md](FACILITATOR.md) — timing, insights, expected answers  
**Prep guide:** [PRESENTER-PREP.md](PRESENTER-PREP.md) — terms, quiz answers, self-check  
**Case study:** [case-study/nova-assist.md](case-study/nova-assist.md)

## Project layout

```
poc-to-enterprice/
??? index.html                   # Slides + NovaAssist narrative + quizzes
??? package.json                 # npm start ? local server
??? .github/workflows/deploy.yml # GitHub Actions ? GitHub Pages
??? FACILITATOR.md               # Presenter guide (timing, insights, Q&A)
??? PRESENTER-PREP.md            # What to read before presenting
??? case-study/
?   ??? nova-assist.md           # Full case study reference
??? css/workshop.css
??? js/workshop.js
```

## License

Use freely for intern training and internal workshops.
