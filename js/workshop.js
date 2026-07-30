/**
 * POC-to-Enterprise Workshop — NovaAssist case study
 * Incident Decision Tree, Architecture Builder (locked), Tool Policy Game (consequences),
 * Observability Triage, Cost Simulator (latency + SLO tab), ADR Editor, quizzes, timers.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'poc-enterprise-workshop-v2';
  const SECTIONS = [
    { id: 'part0', label: 'Hook',       quizIds: ['incident-tree'] },
    { id: 'part1', label: 'Gap',        quizIds: ['gap-q1', 'gap-q2', 'gap-q3'] },
    { id: 'part2', label: 'RAG',        quizIds: ['rag-spot', 'rag-discussion', 'rag-q1', 'arch-builder'] },
    { id: 'part3', label: 'Agent',      quizIds: ['tool-game', 'obs-triage', 'agent-discussion', 'agent-q1'] },
    { id: 'part4', label: 'Infer',      quizIds: ['cost-sim', 'infer-discussion', 'infer-q1'] },
    { id: 'part5', label: 'Capstone',   quizIds: ['adr-editor'] },
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

      // Multi-select quiz support
      if (quiz.classList.contains('quiz-multiselect')) {
        const submitBtn = quiz.querySelector('.quiz-multiselect-submit');
        const selected = new Set();
        const correctValues = new Set((quiz.dataset.correct || '').split(','));

        options.forEach(opt => {
          opt.addEventListener('click', () => {
            if (quiz.classList.contains('quiz-done')) return;
            const v = opt.dataset.value;
            if (selected.has(v)) { selected.delete(v); opt.classList.remove('selected'); }
            else { selected.add(v); opt.classList.add('selected'); }
            if (submitBtn) submitBtn.disabled = selected.size === 0;
          });
        });

        submitBtn?.addEventListener('click', () => {
          if (quiz.classList.contains('quiz-done')) return;
          const isCorrect = selected.size === correctValues.size &&
            [...selected].every(v => correctValues.has(v));
          options.forEach(o => {
            o.disabled = true;
            if (correctValues.has(o.dataset.value)) o.classList.add('correct');
            else if (selected.has(o.dataset.value)) o.classList.add('incorrect');
          });
          quiz.classList.add('quiz-done');
          if (feedback) {
            feedback.classList.add('visible', isCorrect ? 'success' : 'error');
            feedback.textContent = isCorrect
              ? (quiz.dataset.success || 'Correct!')
              : (quiz.dataset.failure || 'See correct answers highlighted.');
          }
          markComplete(id, isCorrect ? 1 : 0);
        });
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
            if (feedback) { feedback.classList.add('visible', 'error'); feedback.textContent = quiz.dataset.failure || 'Not quite \u2014 see the correct answer highlighted.'; }
            if (hint) hint.classList.add('visible');
            markComplete(id, 0);
          }
        });
      });
    });
  }

  /* ──────────── Incident Decision Tree (replaces poll) ──────────── */
  function initIncidentTree () {
    const tree = document.getElementById('incident-tree');
    if (!tree) return;

    const quizId = 'incident-tree';

    if (progress.completed[quizId]) {
      tree.classList.add('tree-completed');
      const nav = document.getElementById('tree-nav');
      if (nav) nav.style.display = 'flex';
      return;
    }

    let currentPath = 'good';

    tree.querySelectorAll('.tree-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextId   = btn.dataset.next;
        const outcome  = btn.dataset.outcome;

        // Downgrade path quality, never upgrade
        if (outcome === 'bad') currentPath = 'bad';
        else if (outcome === 'warn' && currentPath !== 'bad') currentPath = 'warn';

        // Hide current step
        const currentStep = tree.querySelector('.tree-step.active');
        if (currentStep) {
          currentStep.classList.add('exiting');
          currentStep.classList.remove('active');
        }

        // Show next step
        const nextStep = document.getElementById('tree-step-' + nextId);
        if (nextStep) nextStep.classList.add('active');

        // Step 3 reached — show nav with verdict
        if (nextId.startsWith('3-')) {
          const nav = document.getElementById('tree-nav');
          const label = tree.querySelector('.tree-outcome-label');
          if (nav) nav.style.display = 'flex';
          if (label) {
            const verdicts = {
              good:    { text: 'Optimal response \u2014 bill contained, secrets secured', cls: 'good' },
              warn:    { text: 'Partial fix \u2014 costs persist or habit unchanged', cls: 'warn' },
              bad:     { text: 'Incident escalated \u2014 full post-mortem required', cls: 'bad' }
            };
            const v = verdicts[currentPath];
            label.textContent = v.text;
            label.className   = 'tree-outcome-label ' + v.cls;
          }
          markComplete(quizId, currentPath === 'good' ? 1 : 0);
        }
      });
    });

    document.getElementById('tree-restart-btn')?.addEventListener('click', () => {
      tree.querySelectorAll('.tree-step').forEach(s => {
        s.classList.remove('active', 'exiting');
      });
      document.getElementById('tree-step-1')?.classList.add('active');
      const nav = document.getElementById('tree-nav');
      if (nav) nav.style.display = 'none';
      currentPath = 'good';
    });
  }

  /* ──────────── Spot-the-gap hotspots (now requires fix selection) ──────────── */
  function initHotspots () {
    document.querySelectorAll('.spot-gap').forEach(container => {
      const id       = container.dataset.quizId;
      const hotspots = container.querySelectorAll('.hotspot');
      const panel    = container.querySelector('.gap-panel');
      const found    = new Set();
      const answered = new Set();
      let   correctCount = 0;

      if (progress.completed[id]) {
        hotspots.forEach(s => s.classList.add('found'));
        if (panel) panel.innerHTML = '<div style="color:var(--cc-horizon);font-weight:600;font-size:0.9em">All gaps found and fixes confirmed \u2713</div>';
        container.classList.add('all-found');
        return;
      }

      hotspots.forEach(spot => {
        spot.addEventListener('click', () => {
          if (found.has(spot.dataset.gap)) return;
          found.add(spot.dataset.gap);
          spot.classList.add('found');

          if (panel) {
            const placeholder = panel.querySelector('em');
            if (placeholder) placeholder.remove();

            let fixOptions = [];
            try { fixOptions = JSON.parse(spot.dataset.fixOptions || '[]'); } catch {}
            const fixCorrect = parseInt(spot.dataset.fixCorrect || '0', 10);
            const gapKey     = 'gap-' + found.size;

            const item = document.createElement('div');
            item.className = 'gap-item';

            const optionsBtns = fixOptions.map((opt, i) =>
              `<button type="button" class="gap-fix-option" data-idx="${i}">${opt}</button>`
            ).join('');

            item.innerHTML = `
              <div class="gap-item-header">
                <strong class="gap-num">${found.size}.</strong>
                <strong class="gap-name">${spot.dataset.gap}</strong>
                &mdash; ${spot.dataset.desc}
              </div>
              <div class="gap-fix-prompt">What is the correct enterprise fix?</div>
              <div class="gap-fix-options">${optionsBtns}</div>
              <div class="gap-fix-feedback"></div>
            `;
            panel.appendChild(item);
            item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

            item.querySelectorAll('.gap-fix-option').forEach(opt => {
              opt.addEventListener('click', () => {
                if (item.classList.contains('fix-answered')) return;
                item.classList.add('fix-answered');

                const idx = parseInt(opt.dataset.idx, 10);
                const ok  = idx === fixCorrect;
                const fb  = item.querySelector('.gap-fix-feedback');

                if (ok) correctCount++;

                item.querySelectorAll('.gap-fix-option').forEach((o, i) => {
                  o.disabled = true;
                  if (i === fixCorrect) o.classList.add('fix-correct');
                });
                if (!ok) opt.classList.add('fix-wrong');

                if (fb) {
                  fb.className  = 'gap-fix-feedback ' + (ok ? 'fix-ok' : 'fix-err');
                  fb.textContent = ok ? 'Correct fix \u2713' : 'Not quite \u2014 correct fix highlighted above.';
                }

                answered.add(gapKey);
                if (answered.size === hotspots.length) {
                  container.classList.add('all-found');
                  if (id) markComplete(id, correctCount === hotspots.length ? 1 : 0);
                }
              });
            });
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

  /* ──────────── Architecture Builder (with prerequisite locking) ──────────── */
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

    function refreshLockState () {
      document.querySelectorAll('.arch-add-btn').forEach(btn => {
        if (btn.disabled) return;
        const requires = btn.dataset.requires;
        const locked   = requires && !document.getElementById(requires)?.classList.contains('active');
        btn.classList.toggle('arch-locked', !!locked);
        btn.title = locked
          ? '\uD83D\uDD12 Add "' + (requires.replace('layer-', '').replace('-', ' ')) + '" first'
          : '';
      });
    }

    refreshLockState();

    document.querySelectorAll('.arch-add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const requires = btn.dataset.requires;
        if (requires && !document.getElementById(requires)?.classList.contains('active')) {
          if (explainPanel) {
            explainPanel.classList.add('visible');
            const reqLabel = requires.replace('layer-', '').replace(/-/g, '\u00a0');
            explainPanel.innerHTML = `<span style="color:var(--accent-red)">\uD83D\uDD12 Add <strong>${reqLabel}</strong> first \u2014 you cannot guard what isn&rsquo;t isolated.</span>`;
          }
          return;
        }

        const target = document.getElementById(btn.dataset.target);
        if (!target || target.classList.contains('active')) return;
        target.classList.add('active');
        btn.disabled = true;
        activatedCount++;

        if (explainPanel) {
          explainPanel.classList.add('visible');
          explainPanel.innerHTML = `<strong>${btn.textContent.replace(/^\+\s*/,'')}</strong> \u2014 ${btn.dataset.explain}`;
        }

        refreshLockState();

        if (activatedCount === total) {
          const msg = document.getElementById('arch-complete-msg');
          if (msg) msg.style.display = 'block';
          markComplete('arch-builder', 1);
        }
      });
    });
  }

  /* ──────────── Tool Policy Game (with consequence replay) ──────────── */
  function initToolGame () {
    const game = document.getElementById('tool-game');
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
    const placed  = {};

    function placeCard(tool, zoneName) {
      const card = game.querySelector(`.tool-card[data-tool="${tool}"]`);
      if (!card) return;
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

    const explanations = {
      search_docs:    { correct: 'auto',  why: 'Read-only, scoped to user dept. No enterprise risk. Auto-approve.' },
      create_ticket:  { correct: 'gate',  why: 'Write action. NovaAssist: 12 duplicates overnight. Human approval + idempotency key required.' },
      lookup_asset:   { correct: 'auto',  why: 'Read-only, scoped to requesting user. Safe to auto-approve.' },
      send_email_all: { correct: 'block', why: 'Irreversible broadcast to 800 people. Block entirely \u2014 too high risk for autonomous action.' },
      delete_records: { correct: 'block', why: 'Permanent data destruction. No agent should auto-delete DB rows. Block entirely.' },
      update_salary:  { correct: 'gate',  why: 'Financial write. Requires human approval + amount threshold check.' }
    };

    // Consequence scenarios — what happens when a tool is mis-classified
    const consequences = {
      search_docs: {
        auto:  null,
        gate:  '\u23F3 User waited 4 hours for a human to approve a read-only doc lookup. HR files a UX complaint.',
        block: '\u274C NovaAssist can no longer answer HR questions. Core feature broken.'
      },
      create_ticket: {
        auto:  '\uD83D\uDEA8 Agent ran overnight. 12 identical "VPN reset" tickets created. IT spent 4 hours cleaning up.',
        gate:  null,
        block: '\u26A0\uFE0F IT loses ticket automation entirely. Reasonable if org risk appetite is low.'
      },
      lookup_asset: {
        auto:  null,
        gate:  '\u23F3 Every "what laptop do I have?" query now needs manager approval. 47 pending approvals in queue.',
        block: '\u274C IT asset lookups unavailable. Help-desk volume spikes 30%.'
      },
      send_email_all: {
        auto:  '\uD83D\uDEA8 Agent sent "URGENT: VPN maintenance" to all 800 employees at 3AM. CEO called. Trust = 0.',
        gate:  '\u2714 Human caught the draft before send. One near-miss avoided.',
        block: null
      },
      delete_records: {
        auto:  '\uD83D\uDEA8 Finance Q3 payroll records deleted autonomously. Requires DR restore. 6h downtime.',
        gate:  '\u2714 Approval gate blocked the delete. Auditor satisfied.',
        block: null
      },
      update_salary: {
        auto:  '\uD83D\uDEA8 Agent set 12 salaries to $0 during a "bulk update" loop. Emergency payroll correction needed.',
        gate:  null,
        block: '\u26A0\uFE0F HR loses salary update automation. Manual process for now \u2014 acceptable depending on risk policy.'
      }
    };

    submit?.addEventListener('click', () => {
      if (!result) return;
      const allTools = Array.from(cards).map(c => c.dataset.tool);
      const unplaced = allTools.filter(t => !placed[t]);

      if (unplaced.length > 0) {
        result.innerHTML = `<span style="color:var(--accent-orange)">Place all tools first: ${unplaced.join(', ')}</span>`;
        result.style.display = 'block';
        return;
      }

      let correct = 0;
      let html = '<div class="tg-results-header">Policy Results</div>';
      allTools.forEach(tool => {
        const exp = explanations[tool];
        const got = placed[tool];
        const ok  = got === exp.correct;
        if (ok) correct++;
        html += `<div class="tool-result-row ${ok ? 'correct' : 'wrong'}">
          ${ok ? '&#9989;' : '&#10060;'} <strong>${tool}</strong>:
          ${ok ? `${exp.correct}` : `you: ${got} &mdash; correct: ${exp.correct}`} &mdash; ${exp.why}
        </div>`;
      });

      // Consequence log
      const mistakes = allTools.filter(t => placed[t] !== explanations[t].correct);
      if (mistakes.length > 0) {
        html += '<div class="tg-consequence-header">What Would Have Happened</div>';
        mistakes.forEach(tool => {
          const c = consequences[tool]?.[placed[tool]];
          if (c) html += `<div class="tg-consequence-row">${c}</div>`;
        });
      } else {
        html += '<div class="tg-consequence-header" style="color:var(--cc-horizon)">Perfect policy \u2014 zero real-world incidents from this run</div>';
      }

      html += `<div style="margin-top:8px;color:${correct===allTools.length?'var(--nv-green, var(--cc-horizon))':'var(--accent-orange)'};font-weight:600">${correct}/${allTools.length} correct</div>`;

      const body = document.getElementById('tool-game-body');
      if (body) body.style.display = 'none';
      result.innerHTML = html;
      result.style.display = 'block';
      markComplete('tool-game', correct === allTools.length ? 1 : 0);
    });
  }

  /* ──────────── Observability Triage ──────────── */
  function initObsTriage () {
    const triage = document.getElementById('obs-triage');
    if (!triage) return;

    const quizId = 'obs-triage';

    if (progress.completed[quizId]) {
      triage.classList.add('triage-done');
      return;
    }

    const rows   = triage.querySelectorAll('.trace-row[data-anomaly]');
    const panel  = triage.querySelector('.obs-panel');
    let anomalyFound = false;

    rows.forEach(row => {
      row.addEventListener('click', () => {
        if (anomalyFound) return;
        anomalyFound = true;
        rows.forEach(r => r.classList.add('row-highlighted'));
        row.classList.add('row-selected');

        if (panel) {
          panel.innerHTML = `
            <div class="triage-find">
              <strong style="color:var(--accent-red)">\uD83D\uDEA8 Anomaly found:</strong>
              <code>create_ticket</code> called twice with identical parameters in the same session (rows 3 &amp; 4).
              This is the NovaAssist 12-duplicate-ticket incident root cause.
            </div>
            <div class="triage-fix-prompt">What is the correct fix?</div>
            <div class="triage-fix-options">
              <button type="button" class="triage-fix-btn" data-correct="true">Add an idempotency key: hash(tool + params + session_id). Reject if key seen in last 5 min.</button>
              <button type="button" class="triage-fix-btn" data-correct="false">Add a retry policy with exponential backoff to prevent double-calls.</button>
              <button type="button" class="triage-fix-btn" data-correct="false">Add a circuit breaker to stop calls after 2 failures.</button>
            </div>
            <div class="triage-fix-feedback"></div>
          `;

          panel.querySelectorAll('.triage-fix-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              const isCorrect = btn.dataset.correct === 'true';
              panel.querySelectorAll('.triage-fix-btn').forEach(b => {
                b.disabled = true;
                if (b.dataset.correct === 'true') b.classList.add('fix-correct');
              });
              if (!isCorrect) btn.classList.add('fix-wrong');

              const fb = panel.querySelector('.triage-fix-feedback');
              if (fb) {
                fb.className  = 'triage-fix-feedback ' + (isCorrect ? 'fix-ok' : 'fix-err');
                fb.textContent = isCorrect
                  ? 'Correct \u2713 \u2014 Idempotency key prevents duplicate actions across retries and agent loops.'
                  : 'Not quite \u2014 Retry/circuit-breaker controls failure recovery, not duplicate prevention. Idempotency key is the right primitive.';
              }
              triage.classList.add('triage-done');
              markComplete(quizId, isCorrect ? 1 : 0);
            });
          });
        }
      });
    });
  }

  /* ──────────── Cost Simulator (latency axis + SLO tab) ──────────── */
  function initCostSim () {
    const sim = document.getElementById('cost-sim');
    if (!sim) return;

    // Tab switching
    const tabCost = document.getElementById('tab-cost');
    const tabSlo  = document.getElementById('tab-slo');
    const panelCost = document.getElementById('panel-cost');
    const panelSlo  = document.getElementById('panel-slo');

    function switchTab(t) {
      if (t === 'cost') {
        tabCost?.classList.add('active');
        tabSlo?.classList.remove('active');
        if (panelCost) panelCost.style.display = '';
        if (panelSlo)  panelSlo.style.display  = 'none';
      } else {
        tabSlo?.classList.add('active');
        tabCost?.classList.remove('active');
        if (panelSlo)  panelSlo.style.display  = '';
        if (panelCost) panelCost.style.display  = 'none';
      }
    }
    tabCost?.addEventListener('click', () => switchTab('cost'));
    tabSlo?.addEventListener('click',  () => switchTab('slo'));
    switchTab('cost');

    /* ── Cost tab ── */
    const sliderQ     = document.getElementById('slider-queries');
    const sliderCloud = document.getElementById('slider-cloud');
    const sliderCache = document.getElementById('slider-cache');
    const sliderLatency = document.getElementById('slider-latency');
    const valQ       = document.getElementById('val-queries');
    const valCloud   = document.getElementById('val-cloud');
    const valCache   = document.getElementById('val-cache');
    const valLatency = document.getElementById('val-latency');
    const embedCost  = document.getElementById('val-embed-cost');
    const genCost    = document.getElementById('val-gen-cost');
    const cfoVerdict = document.getElementById('val-cfo');
    const latencyVerdict = document.getElementById('val-latency-verdict');

    if (!sliderQ) return;

    function calcCost () {
      const queries   = parseInt(sliderQ.value);
      const cloudPct  = parseInt(sliderCloud.value) / 100;
      const cachePct  = parseInt(sliderCache.value) / 100;
      const cacheLatMs = parseInt(sliderLatency?.value || '400');

      const EMBED_COST_PER_Q   = 0.04;
      const GEN_COST_PER_Q_BIG = 0.10;
      const GEN_COST_PER_Q_SML = 0.036;

      // Base latency: cloud=850ms, self-hosted=200ms, cached=cacheLatMs
      const BASE_CLOUD_LAT  = 850;
      const BASE_SELF_LAT   = 200;
      const cachedRatio     = cachePct;
      const uncachedCloud   = (1 - cachedRatio) * cloudPct;
      const uncachedSelf    = (1 - cachedRatio) * (1 - cloudPct);
      const p99Lat = Math.round(
        cachedRatio   * cacheLatMs +
        uncachedCloud * BASE_CLOUD_LAT * 1.8 +   // p99 = ~1.8x p50
        uncachedSelf  * BASE_SELF_LAT  * 1.8
      );

      const monthlyQ   = queries * 30;
      const uncachedQ  = monthlyQ * (1 - cachePct);
      const cloudQ     = monthlyQ * cloudPct;
      const selfHostQ  = monthlyQ * (1 - cloudPct);

      const embMonthly = uncachedQ * EMBED_COST_PER_Q;
      const genMonthly = (cloudQ * GEN_COST_PER_Q_BIG) + (selfHostQ * GEN_COST_PER_Q_SML);
      const total      = embMonthly + genMonthly;

      if (valQ)       valQ.textContent       = queries.toLocaleString();
      if (valCloud)   valCloud.textContent   = sliderCloud.value;
      if (valCache)   valCache.textContent   = sliderCache.value;
      if (valLatency) valLatency.textContent = cacheLatMs;

      if (embedCost) embedCost.textContent = '$' + embMonthly.toFixed(0);
      if (genCost)   genCost.textContent   = '$' + genMonthly.toFixed(0);

      const totalEl  = document.getElementById('cost-total');
      const totalVal = document.getElementById('val-total-cost');
      if (totalVal) {
        totalVal.textContent = '$' + total.toFixed(0);
        totalVal.className   = 'cost-value ' + (total < 2000 ? 'good' : total < 4000 ? 'warn' : 'bad');
      }
      if (totalEl) {
        totalEl.style.borderColor = total < 2000 ? 'var(--cc-horizon)' : total < 4000 ? 'var(--accent-orange)' : 'var(--accent-red)';
      }

      const p99El = document.getElementById('val-p99');
      if (p99El) {
        p99El.textContent = p99Lat + 'ms';
        p99El.className   = 'cost-value ' + (p99Lat < 500 ? 'good' : p99Lat < 1000 ? 'warn' : 'bad');
      }
      const p99Card = document.getElementById('cost-p99');
      if (p99Card) {
        p99Card.style.borderColor = p99Lat < 500 ? 'var(--cc-horizon)' : p99Lat < 1000 ? 'var(--accent-orange)' : 'var(--accent-red)';
      }

      const costOk    = total < 2000;
      const latencyOk = p99Lat < 500;

      if (cfoVerdict) {
        if (costOk && latencyOk) {
          cfoVerdict.textContent = 'Approved \u2713';
          cfoVerdict.className   = 'cost-value good';
        } else if (total < 4000) {
          cfoVerdict.textContent = costOk ? 'Cost OK \u2014 fix latency' : latencyOk ? 'Latency OK \u2014 cut cost' : 'Negotiating';
          cfoVerdict.className   = 'cost-value warn';
        } else {
          cfoVerdict.textContent = 'Card blocked';
          cfoVerdict.className   = 'cost-value bad';
        }
      }

      if (!progress.completed['cost-sim'] && costOk && latencyOk) markComplete('cost-sim', 1);
    }

    [sliderQ, sliderCloud, sliderCache, sliderLatency].forEach(s => s?.addEventListener('input', calcCost));
    calcCost();

    /* ── SLO tab ── */
    const sliderSlo     = document.getElementById('slider-slo');
    const sliderAvgLat  = document.getElementById('slider-avg-lat');
    const sliderP99Mult = document.getElementById('slider-p99-mult');
    const valSlo        = document.getElementById('val-slo');
    const valAvgLat     = document.getElementById('val-avg-lat');
    const valP99Mult    = document.getElementById('val-p99-mult');

    function calcSlo () {
      const slo     = parseFloat(sliderSlo?.value || '99.9') / 100;
      const avgLat  = parseInt(sliderAvgLat?.value  || '400');
      const p99Mult = parseFloat(sliderP99Mult?.value || '3');

      if (valSlo)    valSlo.textContent    = sliderSlo?.value + '%';
      if (valAvgLat) valAvgLat.textContent = avgLat + 'ms';
      if (valP99Mult) valP99Mult.textContent = p99Mult + 'x';

      const budgetMin  = Math.round((1 - slo) * 30 * 24 * 60);
      const p99Lat     = Math.round(avgLat * p99Mult);
      const blastMin   = Math.max(1, Math.round(budgetMin * 0.2));

      const tier =
        slo >= 0.9999 ? 'Multi-region active-active + automatic failover (<30s)' :
        slo >= 0.999  ? 'Active-passive with hot standby (<2 min failover)' :
        slo >= 0.99   ? 'Single region + health checks + restart policy' :
                        'Best-effort \u2014 no SLA enforcement';

      const budgetEl  = document.getElementById('val-error-budget');
      const p99El     = document.getElementById('val-slo-p99');
      const blastEl   = document.getElementById('val-blast-radius');
      const tierEl    = document.getElementById('val-redundancy');

      if (budgetEl) budgetEl.textContent = budgetMin + ' min/month';
      if (p99El)    p99El.textContent    = p99Lat    + 'ms';
      if (blastEl)  blastEl.textContent  = '\u2264' + blastMin + ' min per incident';
      if (tierEl)   tierEl.textContent   = tier;

      // Budget colour
      const budgetCard = document.getElementById('slo-budget-card');
      if (budgetCard) {
        budgetCard.style.borderColor =
          budgetMin < 22  ? 'var(--accent-red)' :
          budgetMin < 130 ? 'var(--accent-orange)' :
                            'var(--cc-horizon)';
      }
    }

    [sliderSlo, sliderAvgLat, sliderP99Mult].forEach(s => s?.addEventListener('input', calcSlo));
    calcSlo();
  }

  /* ──────────── ADR Trade-off Editor (replaces Worksheet) ──────────── */
  function initAdrEditor () {
    const editor = document.getElementById('adr-editor');
    if (!editor) return;

    if (progress.completed['adr-editor']) {
      editor.classList.add('adr-done');
      const msg = editor.querySelector('.adr-save-msg');
      if (msg) { msg.classList.add('visible'); msg.textContent = 'Decision locked \u2713'; }
      return;
    }

    const options   = ['chroma', 'milvus', 'pgvector'];
    const criteria  = ['ops-cost', 'multi-tenancy', 'latency', 'familiarity'];

    // Pre-populated scores [Chroma, Milvus, pgvector] for each criterion
    const preScores = {
      'ops-cost':      [5, 2, 4],   // Chroma=easy/free, Milvus=ops heavy, pg=moderate
      'multi-tenancy': [1, 5, 3],   // Chroma=none, Milvus=namespaces, pg=RLS
      'latency':       [3, 5, 2],   // Milvus wins, pg slow at scale
      'familiarity':   [4, 2, 5]    // Most interns know pg
    };

    function calcAdr () {
      const totals = { chroma: 0, milvus: 0, pgvector: 0 };

      criteria.forEach(c => {
        const weightSlider = editor.querySelector(`[data-weight="${c}"]`);
        const weight = parseFloat(weightSlider?.value || '3');
        const wLabel = editor.querySelector(`[data-weight-label="${c}"]`);
        if (wLabel) wLabel.textContent = weight.toFixed(1);

        options.forEach((opt, i) => {
          totals[opt] += weight * preScores[c][i];
        });
      });

      // Update totals
      const maxTotal = Math.max(...Object.values(totals));
      options.forEach(opt => {
        const el   = editor.querySelector(`[data-total="${opt}"]`);
        const bar  = editor.querySelector(`[data-bar="${opt}"]`);
        const score = totals[opt];
        if (el)  el.textContent = score.toFixed(1);
        if (bar) bar.style.width = Math.round((score / (maxTotal * 1.1)) * 100) + '%';
        if (el)  el.className = 'adr-score ' + (score === maxTotal ? 'adr-winner' : '');
      });

      const winnerOpt = options.reduce((a, b) => totals[a] >= totals[b] ? a : b);
      const winnerEl  = editor.querySelector('.adr-recommendation');
      if (winnerEl) {
        const names = { chroma: 'Chroma (dev-only)', milvus: 'Milvus', pgvector: 'pgvector' };
        const rationale = {
          chroma:   'Your weights favour operational simplicity over isolation — acceptable only for a single-dept POC.',
          milvus:   'Multi-tenancy and latency dominate your priorities — Milvus is the right enterprise choice for NovaAssist.',
          pgvector: 'Familiarity and ops cost lead — pgvector is pragmatic if teams already run Postgres and traffic is moderate.'
        };
        winnerEl.innerHTML = `<strong style="color:var(--cc-horizon)">${names[winnerOpt]}</strong> wins with your weights. ${rationale[winnerOpt]}`;
      }
    }

    editor.querySelectorAll('[data-weight]').forEach(slider => {
      slider.addEventListener('input', calcAdr);
    });
    calcAdr();

    const lockBtn = editor.querySelector('.adr-lock-btn');
    lockBtn?.addEventListener('click', () => {
      const weights = {};
      criteria.forEach(c => {
        const s = editor.querySelector(`[data-weight="${c}"]`);
        if (s) weights[c] = s.value;
      });
      localStorage.setItem('nova-adr', JSON.stringify(weights));
      editor.classList.add('adr-done');
      const msg = editor.querySelector('.adr-save-msg');
      if (msg) { msg.classList.add('visible'); msg.textContent = 'Decision locked \u2713 — your ADR weights saved locally.'; }
      markComplete('adr-editor', 1);
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
        localStorage.removeItem('nova-adr');
        location.reload();
      }
    });
  }

  /* ──────────── Bootstrap ──────────── */
  function init () {
    updateProgressBar();
    initSvgNodes();
    initQuizzes();
    initIncidentTree();
    initHotspots();
    initDiscussionTimers();
    initArchBuilder();
    initToolGame();
    initObsTriage();
    initCostSim();
    initAdrEditor();
    initChecklist();
    initReset();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof Reveal !== 'undefined') Reveal.on('slidechanged', updateProgressBar);
  });
})();
