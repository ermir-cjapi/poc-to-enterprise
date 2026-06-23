/**
 * POC-to-Enterprise Workshop — NovaAssist case study
 * Clickable SVG nodes, Architecture Builder, Tool Policy Game,
 * Cost Simulator, quizzes, timers, progress tracking.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'poc-enterprise-workshop-v2';
  const SECTIONS = [
    { id: 'part0', label: 'Hook',       quizIds: ['poll-risks'] },
    { id: 'part1', label: 'Gap',        quizIds: ['gap-q1', 'gap-q2', 'gap-q3'] },
    { id: 'part2', label: 'RAG',        quizIds: ['rag-spot', 'rag-discussion', 'rag-q1', 'arch-builder'] },
    { id: 'part3', label: 'Agent',      quizIds: ['tool-game', 'agent-discussion', 'agent-q1'] },
    { id: 'part4', label: 'Infer',      quizIds: ['cost-sim', 'infer-discussion', 'infer-q1'] },
    { id: 'part5', label: 'Capstone',   quizIds: ['worksheet'] },
    { id: 'part6', label: 'Quiz',       quizIds: ['final-q1', 'final-q2', 'final-q3', 'final-q4', 'final-q5'] }
  ];

  let progress = loadProgress();

  function loadProgress () {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { completed: {}, scores: {} }; }
    catch { return { completed: {}, scores: {} }; }
  }

  function saveProgress () {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    updateProgressBar();
  }

  function markComplete (id, score) {
    progress.completed[id] = true;
    if (score !== undefined) progress.scores[id] = score;
    saveProgress();
  }

  /* ──────────── Progress bar ──────────── */
  function updateProgressBar () {
    const bar = document.getElementById('workshop-progress');
    if (!bar) return;
    let total = 0, done = 0;
    SECTIONS.forEach(s => s.quizIds.forEach(id => {
      total++;
      if (progress.completed[id]) done++;
    }));
    const pct = total ? Math.round((done / total) * 100) : 0;
    const fill = bar.querySelector('.progress-fill');
    const label = bar.querySelector('.progress-label');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = `${done}/${total} activities \u00b7 ${pct}%`;
    SECTIONS.forEach(s => {
      const badge = document.querySelector(`[data-section-badge="${s.id}"]`);
      if (badge) badge.classList.toggle('completed', s.quizIds.every(id => progress.completed[id]));
    });
  }

  /* ──────────── SVG node tooltips ──────────── */
  function initSvgNodes () {
    const panel = document.getElementById('node-panel');
    const labelEl = document.getElementById('node-panel-label');
    const descEl  = document.getElementById('node-panel-desc');
    const fixEl   = document.getElementById('node-panel-fix');
    const closeBtn = document.getElementById('node-panel-close');
    if (!panel) return;

    function showPanel (node, x, y) {
      const label = node.dataset.label || 'Component';
      const desc  = node.dataset.desc  || '';
      const fix   = node.dataset.fix   || '';
      if (labelEl) labelEl.textContent = label;
      if (descEl)  descEl.textContent  = desc;
      if (fixEl)   fixEl.textContent   = fix;
      fixEl.style.display = fix ? 'block' : 'none';

      panel.classList.add('visible');

      // Position near click but keep on screen
      const pw = panel.offsetWidth || 300;
      const ph = panel.offsetHeight || 160;
      let px = x + 12, py = y + 12;
      if (px + pw > window.innerWidth - 10) px = x - pw - 12;
      if (py + ph > window.innerHeight - 10) py = y - ph - 12;
      panel.style.left = Math.max(8, px) + 'px';
      panel.style.top  = Math.max(8, py) + 'px';
    }

    function hidePanel () { panel.classList.remove('visible'); }

    document.querySelectorAll('.svgnode').forEach(node => {
      node.addEventListener('click', e => {
        e.stopPropagation();
        showPanel(node, e.clientX, e.clientY);
      });
    });

    closeBtn?.addEventListener('click', hidePanel);
    document.addEventListener('click', e => {
      if (!panel.contains(e.target) && !e.target.classList.contains('svgnode')) hidePanel();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') hidePanel(); });
  }

  /* ──────────── MCQ Quizzes ──────────── */
  function initQuizzes () {
    document.querySelectorAll('.quiz-mcq').forEach(quiz => {
      const id      = quiz.dataset.quizId;
      const options = quiz.querySelectorAll('.quiz-option');
      const feedback = quiz.querySelector('.quiz-feedback');
      const hint    = quiz.querySelector('.quiz-hint');

      if (progress.completed[id]) {
        quiz.classList.add('quiz-done');
        options.forEach(o => {
          if (o.dataset.value === quiz.dataset.correct) o.classList.add('correct');
          o.disabled = true;
        });
        if (feedback) { feedback.classList.add('visible', 'success'); feedback.textContent = 'Completed \u2713'; }
        return;
      }

      options.forEach(opt => {
        opt.addEventListener('click', () => {
          if (quiz.classList.contains('quiz-done')) return;
          const correct = opt.dataset.value === quiz.dataset.correct;
          options.forEach(o => o.disabled = true);
          if (correct) {
            opt.classList.add('correct');
            if (feedback) { feedback.classList.add('visible', 'success'); feedback.textContent = quiz.dataset.success || 'Correct!'; }
            quiz.classList.add('quiz-done');
            markComplete(id, 1);
          } else {
            opt.classList.add('incorrect');
            options.forEach(o => { if (o.dataset.value === quiz.dataset.correct) o.classList.add('correct'); });
            if (feedback) { feedback.classList.add('visible', 'error'); feedback.textContent = quiz.dataset.failure || 'Not quite — see the correct answer highlighted.'; }
            if (hint) hint.classList.add('visible');
            markComplete(id, 0);
          }
        });
      });
    });
  }

  /* ──────────── Multi-select poll ──────────── */
  function initPoll () {
    const poll = document.getElementById('poll-risks');
    if (!poll) return;

    const options  = poll.querySelectorAll('.poll-option');
    const submit   = poll.querySelector('.poll-submit');
    const feedback = poll.querySelector('.poll-feedback');
    const max      = parseInt(poll.dataset.maxSelect || '3', 10);
    let selected   = new Set();

    if (progress.completed['poll-risks']) { poll.classList.add('quiz-done'); return; }

    options.forEach(opt => {
      opt.addEventListener('click', () => {
        const v = opt.dataset.value;
        if (selected.has(v)) { selected.delete(v); opt.classList.remove('selected'); }
        else if (selected.size < max)  { selected.add(v); opt.classList.add('selected'); }
        if (submit) submit.disabled = selected.size === 0;
      });
    });

    submit?.addEventListener('click', () => {
      poll.classList.add('quiz-done');
      if (feedback) {
        feedback.classList.add('visible');
        feedback.textContent = `You flagged ${selected.size} risk(s). In enterprise, every one of these has an explicit owner and mitigation before go-live — not "we'll fix it when it breaks."`;
      }
      options.forEach(o => o.disabled = true);
      markComplete('poll-risks');
    });
  }

  /* ──────────── Spot-the-gap hotspots ──────────── */
  function initHotspots () {
    document.querySelectorAll('.spot-gap').forEach(container => {
      const id       = container.dataset.quizId;
      const hotspots = container.querySelectorAll('.hotspot');
      const panel    = container.querySelector('.gap-panel');
      const found    = new Set();

      hotspots.forEach(spot => {
        spot.addEventListener('click', () => {
          if (found.has(spot.dataset.gap)) return;
          found.add(spot.dataset.gap);
          spot.classList.add('found');
          if (panel) {
            // Remove placeholder text on first click
            const placeholder = panel.querySelector('em');
            if (placeholder) placeholder.remove();

            const item = document.createElement('div');
            item.className = 'gap-item';
            item.innerHTML = `<strong class="gap-num">${found.size}.</strong> <strong>${spot.dataset.gap}</strong> &mdash; ${spot.dataset.desc}`;
            panel.appendChild(item);
            // Scroll to the new item
            item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
          if (found.size === hotspots.length) {
            container.classList.add('all-found');
            if (id) markComplete(id);
          }
        });
      });
    });
  }

  /* ──────────── Discussion timers ──────────── */
  function initDiscussionTimers () {
    document.querySelectorAll('.discussion-block').forEach(block => {
      const id      = block.dataset.quizId;
      const display = block.querySelector('.timer-display');
      const start   = block.querySelector('.timer-start');
      const done    = block.querySelector('.timer-done');
      const dur     = parseInt(block.dataset.duration || '120', 10);
      let interval  = null;
      let remaining = dur;

      function fmt (s) { return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }
      if (display) display.textContent = fmt(remaining);

      if (progress.completed[id]) {
        block.classList.add('discussion-done');
        start && (start.disabled = true);
        done  && (done.disabled  = true);
        return;
      }

      start?.addEventListener('click', () => {
        remaining = dur;
        start.disabled = true;
        clearInterval(interval);
        interval = setInterval(() => {
          remaining--;
          if (display) display.textContent = fmt(remaining);
          if (remaining <= 0) { clearInterval(interval); start.disabled = false; block.classList.add('timer-expired'); }
        }, 1000);
      });

      done?.addEventListener('click', () => {
        clearInterval(interval);
        block.classList.add('discussion-done');
        markComplete(id);
      });
    });
  }

  /* ──────────── Architecture Builder (RAG) ──────────── */
  function initArchBuilder () {
    const builder = document.getElementById('arch-builder');
    if (!builder || progress.completed['arch-builder']) {
      if (builder && progress.completed['arch-builder']) {
        document.querySelectorAll('.arch-layer').forEach(l => l.classList.add('active'));
        const msg = document.getElementById('arch-complete-msg');
        if (msg) msg.style.display = 'block';
        document.querySelectorAll('.arch-add-btn').forEach(b => b.disabled = true);
      }
      return;
    }

    const explainPanel = document.getElementById('arch-explain-panel');
    let activatedCount = 0;
    const total = document.querySelectorAll('.arch-add-btn').length;

    document.querySelectorAll('.arch-add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        if (!target || target.classList.contains('active')) return;
        target.classList.add('active');
        btn.disabled = true;
        activatedCount++;

        if (explainPanel) {
          explainPanel.classList.add('visible');
          explainPanel.innerHTML = `<strong>${btn.textContent.replace(/^\+ /,'')}</strong> \u2014 ${btn.dataset.explain}`;
        }

        if (activatedCount === total) {
          const msg = document.getElementById('arch-complete-msg');
          if (msg) msg.style.display = 'block';
          markComplete('arch-builder', 1);
        }
      });
    });
  }

  /* ──────────── Tool Policy Game ──────────── */
  function initToolGame () {
    const game    = document.getElementById('tool-game');
    if (!game) return;

    if (progress.completed['tool-game']) {
      game.classList.add('quiz-done');
      return;
    }

    const cards   = game.querySelectorAll('.tool-card');
    const zones   = game.querySelectorAll('.tool-zone');
    const submit  = document.getElementById('tool-game-submit');
    const reset   = document.getElementById('tool-game-reset');
    const result  = document.getElementById('tool-game-result');
    const placed  = {}; // tool -> zone

    function placeCard(tool, zoneName) {
      const card = game.querySelector(`.tool-card[data-tool="${tool}"]`);
      if (!card) return;
      // Remove chip from previous zone if any
      if (placed[tool]) {
        game.querySelector(`#zone-${placed[tool]} .zone-drop`)
            ?.querySelector(`[data-tool="${tool}"]`)?.remove();
      }
      placed[tool] = zoneName;
      card.classList.add('placed');
      const drop = game.querySelector(`#zone-${zoneName} .zone-drop`);
      const zCard = document.createElement('div');
      zCard.className = 'zone-card';
      zCard.dataset.tool = tool;
      zCard.textContent = tool;
      zCard.title = 'Click to remove';
      zCard.addEventListener('click', e => {
        e.stopPropagation();
        zCard.remove();
        card.classList.remove('placed');
        delete placed[tool];
      });
      drop.appendChild(zCard);
    }

    // Drag-and-drop — allow re-dragging placed cards to a new zone
    cards.forEach(card => {
      card.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', card.dataset.tool);
      });
    });

    zones.forEach(zone => {
      zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
      zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const tool = e.dataTransfer.getData('text/plain');
        placeCard(tool, zone.dataset.zone);
      });
    });

    // Click to cycle through zones: auto → gate → block → (remove)
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const tool    = card.dataset.tool;
        const zoneIds = ['auto', 'gate', 'block'];
        if (placed[tool]) {
          const idx  = zoneIds.indexOf(placed[tool]);
          const next = idx < zoneIds.length - 1 ? zoneIds[idx + 1] : null;
          if (next) {
            placeCard(tool, next);
          } else {
            // Last zone → remove entirely
            game.querySelector(`#zone-${placed[tool]} .zone-drop`)
                ?.querySelector(`[data-tool="${tool}"]`)?.remove();
            card.classList.remove('placed');
            delete placed[tool];
          }
        } else {
          placeCard(tool, zoneIds[0]);
        }
      });
    });

    reset?.addEventListener('click', () => {
      Object.keys(placed).forEach(k => delete placed[k]);
      cards.forEach(c => c.classList.remove('placed'));
      zones.forEach(z => { const d = z.querySelector('.zone-drop'); if (d) d.innerHTML = ''; });
      if (result) { result.innerHTML = ''; result.style.display = 'none'; }
      const body = document.getElementById('tool-game-body');
      if (body) body.style.display = '';
    });

    submit?.addEventListener('click', () => {
      if (!result) return;
      const allTools = Array.from(cards).map(c => c.dataset.tool);
      const unplaced = allTools.filter(t => !placed[t]);

      if (unplaced.length > 0) {
        result.innerHTML = `<span style="color:var(--accent-orange)">Place all tools first: ${unplaced.join(', ')}</span>`;
        return;
      }

      const explanations = {
        search_docs:   { correct: 'auto',  why: 'Read-only, scoped to user dept. No enterprise risk. Auto-approve.' },
        create_ticket: { correct: 'gate',  why: 'Write action. NovaAssist: 12 duplicates overnight. Human approval + idempotency key required.' },
        lookup_asset:  { correct: 'auto',  why: 'Read-only, scoped to requesting user. Safe to auto-approve.' },
        send_email_all:{ correct: 'block', why: 'Irreversible broadcast to 800 people. Block entirely — too high risk for autonomous action.' },
        delete_records:{ correct: 'block', why: 'Permanent data destruction. No agent should auto-delete DB rows. Block entirely.' },
        update_salary: { correct: 'gate',  why: 'Financial write. Requires human approval + amount threshold check.' }
      };

      let correct = 0;
      let html = '<div style="margin-bottom:6px;font-weight:600">Results:</div>';
      allTools.forEach(tool => {
        const exp   = explanations[tool];
        const got   = placed[tool];
        const ok    = got === exp.correct;
        if (ok) correct++;
        html += `<div class="tool-result-row ${ok ? 'correct' : 'wrong'}">
          ${ok ? '&#9989;' : '&#10060;'} <strong>${tool}</strong>: 
          ${ok ? `${exp.correct} \u2014 ` : `you said ${got}, correct is ${exp.correct} \u2014 `}${exp.why}
        </div>`;
      });
      html += `<div style="margin-top:8px;color:${correct===allTools.length?'var(--nv-green)':'var(--accent-orange)'};font-weight:600">${correct}/${allTools.length} correct</div>`;

      // Show results IN PLACE of the cards+zones so content height stays the same
      const body = document.getElementById('tool-game-body');
      if (body) body.style.display = 'none';
      result.innerHTML = html;
      result.style.display = 'block';
      markComplete('tool-game', correct === allTools.length ? 1 : 0);
    });
  }

  /* ──────────── Cost Simulator ──────────── */
  function initCostSim () {
    const sim = document.getElementById('cost-sim');
    if (!sim) return;

    const sliderQ     = document.getElementById('slider-queries');
    const sliderCloud = document.getElementById('slider-cloud');
    const sliderCache = document.getElementById('slider-cache');
    const valQ     = document.getElementById('val-queries');
    const valCloud = document.getElementById('val-cloud');
    const valCache = document.getElementById('val-cache');
    const embedCost = document.getElementById('val-embed-cost');
    const genCost   = document.getElementById('val-gen-cost');
    const totalCost = document.getElementById('val-total-cost');
    const cfoVerdict = document.getElementById('val-cfo');

    if (!sliderQ) return;

    function calc () {
      const queries = parseInt(sliderQ.value);
      const cloudPct = parseInt(sliderCloud.value) / 100;
      const cachePct = parseInt(sliderCache.value) / 100;

      // Pricing approximations (per 1K tokens)
      const EMBED_COST_PER_Q   = 0.00002; // OpenAI ada-002 equiv
      const GEN_COST_PER_Q_BIG = 0.0006;  // gpt-4o-mini output
      const GEN_COST_PER_Q_SML = 0.0;     // self-hosted Llama (sunk GPU)

      const monthlyQ   = queries * 30;
      const uncachedQ  = monthlyQ * (1 - cachePct);
      const cloudQ     = monthlyQ * cloudPct;
      const selfHostQ  = monthlyQ * (1 - cloudPct);

      const embMonthly  = uncachedQ * EMBED_COST_PER_Q;
      const genMonthly  = (cloudQ * GEN_COST_PER_Q_BIG) + (selfHostQ * GEN_COST_PER_Q_SML);
      const total       = embMonthly + genMonthly;

      if (valQ)     valQ.textContent     = queries.toLocaleString();
      if (valCloud) valCloud.textContent  = sliderCloud.value;
      if (valCache) valCache.textContent  = sliderCache.value;

      if (embedCost) embedCost.textContent = '$' + embMonthly.toFixed(0);
      if (genCost)   genCost.textContent   = '$' + genMonthly.toFixed(0);

      const totalEl = document.getElementById('cost-total');
      const totalVal = document.getElementById('val-total-cost');
      if (totalVal) {
        totalVal.textContent = '$' + total.toFixed(0);
        totalVal.className   = 'cost-value ' + (total < 2000 ? 'good' : total < 4000 ? 'warn' : 'bad');
      }
      if (totalEl) {
        totalEl.style.borderColor = total < 2000 ? 'var(--nv-green)' : total < 4000 ? 'var(--accent-orange)' : 'var(--accent-red)';
      }

      if (cfoVerdict) {
        if (total < 2000) {
          cfoVerdict.textContent = 'Approved ✓';
          cfoVerdict.className   = 'cost-value good';
        } else if (total < 4000) {
          cfoVerdict.textContent = 'Negotiating';
          cfoVerdict.className   = 'cost-value warn';
        } else {
          cfoVerdict.textContent = 'Card blocked';
          cfoVerdict.className   = 'cost-value bad';
        }
      }

      if (!progress.completed['cost-sim'] && total < 2000) markComplete('cost-sim', 1);
    }

    [sliderQ, sliderCloud, sliderCache].forEach(s => s.addEventListener('input', calc));
    calc();
  }

  /* ──────────── Worksheet ──────────── */
  function initWorksheet () {
    const ws = document.getElementById('upgrade-worksheet');
    if (!ws) return;

    const fields  = ws.querySelectorAll('textarea, input[type="text"]');
    const saveBtn = ws.querySelector('.worksheet-save');
    const msg     = ws.querySelector('.worksheet-msg');

    const saved = localStorage.getItem('nova-worksheet');
    if (saved) {
      try { const d = JSON.parse(saved); fields.forEach(f => { if (d[f.name]) f.value = d[f.name]; }); } catch {}
    }
    if (progress.completed['worksheet']) ws.classList.add('worksheet-done');

    saveBtn?.addEventListener('click', () => {
      const d = {};
      fields.forEach(f => d[f.name] = f.value);
      localStorage.setItem('nova-worksheet', JSON.stringify(d));
      ws.classList.add('worksheet-done');
      markComplete('worksheet');
      if (msg) { msg.classList.add('visible'); msg.textContent = 'Worksheet saved locally \u2713'; }
    });
  }

  /* ──────────── Checklist export ──────────── */
  function initChecklist () {
    const copyBtn  = document.getElementById('export-checklist');
    const printBtn = document.getElementById('print-checklist');

    copyBtn?.addEventListener('click', () => {
      const list = document.getElementById('enterprise-checklist');
      if (!list) return;
      const text = Array.from(list.querySelectorAll('li')).map(li => '[ ] ' + li.textContent.trim()).join('\n');
      navigator.clipboard.writeText('NovaAssist Enterprise Checklist\n\n' + text).then(() => {
        copyBtn.textContent = 'Copied \u2713';
        setTimeout(() => copyBtn.textContent = 'Copy checklist to clipboard', 2500);
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        copyBtn.textContent = 'Copied \u2713';
        setTimeout(() => copyBtn.textContent = 'Copy checklist to clipboard', 2500);
      });
    });

    printBtn?.addEventListener('click', () => window.print());
  }

  /* ──────────── Reset ──────────── */
  function initReset () {
    document.getElementById('reset-progress')?.addEventListener('click', () => {
      if (confirm('Reset all workshop progress?')) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('nova-worksheet');
        location.reload();
      }
    });
  }

  /* ──────────── Bootstrap ──────────── */
  function init () {
    updateProgressBar();
    initSvgNodes();
    initQuizzes();
    initPoll();
    initHotspots();
    initDiscussionTimers();
    initArchBuilder();
    initToolGame();
    initCostSim();
    initWorksheet();
    initChecklist();
    initReset();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof Reveal !== 'undefined') Reveal.on('slidechanged', updateProgressBar);
  });
})();
