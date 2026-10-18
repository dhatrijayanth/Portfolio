/* ============================================================
   TXI Universe — showcase.js
   Project showcase: opens/closes the detail view, populates
   all three screens from data.js, handles navigation, and
   drives per-project canvas animations on Screen 0.

   Animation design intent:
   • Each animation tells the story of what the project does —
     not abstract particles, but a visual metaphor for the work.
   • A cycling annotation label surfaces the narrative in words.
   • Story phases build over time: state starts simple and
     grows richer as the viewer watches.
============================================================ */

const Showcase = (() => {
  let currentProject = null;
  let currentScreen  = 0;
  let animRafId      = null;
  let annotationTimer = null;

  /* ── DOM element accessors ── */
  const el = {
    view:          () => document.getElementById('showcase-view'),
    title:         () => document.getElementById('showcase-title'),
    tagline:       () => document.getElementById('showcase-tagline'),
    topbarName:    () => document.getElementById('topbar-project-name'),
    track:         () => document.getElementById('screens-track'),
    animStage:     () => document.getElementById('animation-stage'),
    statNum:       () => document.getElementById('anim-stat-num'),
    statLabel:     () => document.getElementById('anim-stat-label'),
    ovHead:        () => document.getElementById('overview-heading'),
    ovBody:        () => document.getElementById('overview-body'),
    teamGrid:      () => document.getElementById('team-grid'),
    infoWhat:      () => document.querySelector('#info-what .info-text'),
    infoWhy:       () => document.querySelector('#info-why .info-text'),
    stepsList:     () => document.getElementById('steps-list'),
    impactList:    () => document.querySelector('.impact-list'),
    navSteps:      () => document.querySelectorAll('.nav-step'),
    navConnectors: () => document.querySelectorAll('.nav-step-connector'),
    prevBtn:       () => document.getElementById('prev-btn'),
    nextBtn:       () => document.getElementById('next-btn'),
  };

  /* ──────────────────────────────────────────────────────── */

  /* Open the showcase for a given project id */
  function open(projectId) {
    stopAnimation();
    stopAnnotation();
    currentProject = PROJECTS[projectId];
    currentScreen  = 0;

    populate();
    applyProjectTheme();

    const view = el.view();
    view.classList.remove('view-hidden');

    requestAnimationFrame(() => {
      goToScreen(0, false);
      startAnimation();
    });
  }

  /* Close the showcase */
  function close() {
    stopAnimation();
    stopAnnotation();
    el.view().classList.add('view-hidden');
  }

  /* ── Populate all three screens with project data ── */
  function populate() {
    const p = currentProject;

    /* Topbar */
    el.topbarName().textContent = p.name;

    /* Screen 0 */
    el.title().textContent   = p.name;
    el.tagline().textContent = p.tagline;
    el.statNum().textContent   = p.animation.bigNumber;
    el.statLabel().textContent = p.animation.bigLabel;
    el.ovHead().textContent = p.overview.heading;
    el.ovBody().textContent = p.overview.body;

    /* Screen 1 — Team grid */
    const grid = el.teamGrid();
    grid.innerHTML = '';
    p.team.forEach(member => {
      const card = document.createElement('div');
      card.className = 'team-card';
      card.innerHTML = `
        <div class="team-card-top">
          <div class="team-avatar"
               style="background:rgba(${p.colorRgb},0.15);color:rgb(${p.colorRgb})">
            ${member.initials}
          </div>
          <div>
            <div class="team-name">${member.name}</div>
            <div class="team-role">${member.role}</div>
          </div>
        </div>
        <p class="team-bio">${member.bio}</p>
      `;
      grid.appendChild(card);
    });

    /* Screen 2 — Info */
    el.infoWhat().textContent = p.info.what;
    el.infoWhy().textContent  = p.info.why;

    const stepsList = el.stepsList();
    stepsList.innerHTML = '';
    p.info.steps.forEach(step => {
      const li = document.createElement('li');
      li.textContent = step;
      stepsList.appendChild(li);
    });

    const ul = el.impactList();
    ul.innerHTML = '';
    p.info.impact.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      ul.appendChild(li);
    });

    /* Build animation stage */
    buildAnimStage();
  }

  /* ── Apply project accent color to CSS custom properties ── */
  function applyProjectTheme() {
    const root = document.documentElement;
    root.style.setProperty('--accent',     currentProject.color);
    root.style.setProperty('--accent-rgb', currentProject.colorRgb);
  }

  /* ── Build the animation stage for Screen 0 ── */
  function buildAnimStage() {
    const stage = el.animStage();
    stage.innerHTML = '';

    const p = currentProject;

    /* Canvas */
    const canvas = document.createElement('canvas');
    canvas.className = 'anim-canvas';
    stage.appendChild(canvas);

    /* Story annotation label */
    const annotation = document.createElement('div');
    annotation.className = 'anim-annotation';
    annotation.id = 'anim-annotation';
    stage.appendChild(annotation);

    /* Size canvas after layout */
    requestAnimationFrame(() => {
      const { width, height } = stage.getBoundingClientRect();
      canvas.width  = width  || 800;
      canvas.height = height || 340;

      const type = p.animation.type;
      if      (type === 'network') animNetwork(canvas, p.colorRgb, p.animation.story);
      else if (type === 'flow')    animFlow(canvas, p.colorRgb, p.animation.story);
      else if (type === 'pulse')   animPulse(canvas, p.colorRgb, p.animation.story);
    });
  }

  /* ── Annotation cycling ──────────────────────────────────
     Fades annotation text in and out through story phrases. ── */
  function startAnnotation(storySteps) {
    const ann = document.getElementById('anim-annotation');
    if (!ann) return;

    let idx = 0;

    function showStep() {
      ann.classList.remove('visible');
      setTimeout(() => {
        ann.textContent = storySteps[idx];
        ann.classList.add('visible');
        idx = (idx + 1) % storySteps.length;
        annotationTimer = setTimeout(showStep, 3200);
      }, 700);
    }

    /* First phrase appears after a short delay */
    ann.textContent = storySteps[0];
    ann.classList.add('visible');
    idx = 1;
    annotationTimer = setTimeout(showStep, 3200);
  }

  function stopAnnotation() {
    clearTimeout(annotationTimer);
    annotationTimer = null;
    const ann = document.getElementById('anim-annotation');
    if (ann) ann.classList.remove('visible');
  }

  /* ── Stop running animation ── */
  function stopAnimation() {
    if (animRafId) { cancelAnimationFrame(animRafId); animRafId = null; }
  }

  function startAnimation() { /* animation started inside buildAnimStage */ }

  /* ──────────────────────────────────────────────────────
     ANIMATION: Network — community forming
     Story: Isolated nodes → gravitating together → rich network hub

     Visual metaphor for Orbit: people and groups that exist in
     isolation discover each other and form a connected ecosystem.
  ────────────────────────────────────────────────────── */
  function animNetwork(canvas, rgb, story) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;

    /* Distinct node colours — represent different community groups */
    const NODE_COLORS = [
      [130, 100, 255], [170, 120, 255], [100, 145, 230],
      [210, 105, 185], [105, 205, 185], [225, 155, 85],
      [85, 185, 245],  [165, 205, 105], [245, 125, 105],
      [110, 165, 255], [200, 230, 150], [150, 200, 255],
    ];

    const nodes = NODE_COLORS.map((c, i) => {
      /* Start scattered across the canvas */
      const angle = (i / NODE_COLORS.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
      const baseDist = 0.28 + Math.random() * 0.20;
      const dist = baseDist * Math.min(W, H) * 0.72;
      return {
        x:   cx + Math.cos(angle) * dist,
        y:   cy + Math.sin(angle) * dist * 0.7,
        vx:  (Math.random() - 0.5) * 0.22,
        vy:  (Math.random() - 0.5) * 0.22,
        r:   5 + Math.random() * 4,
        c:   c,
        pulse: Math.random() * Math.PI * 2,
      };
    });

    /* Hub — grows into view as network matures */
    const hub = { x: cx, y: cy, r: 0, targetR: 14, alpha: 0 };

    /* Travel sparks along connections */
    const sparks = [];

    let t = 0;
    let lastSparkTime = 0;

    function draw(ts) {
      animRafId = requestAnimationFrame(draw);
      t += 0.01;

      ctx.clearRect(0, 0, W, H);

      /* Hub appears once t > 3, grows until t > 6 */
      const hubProgress = Math.max(0, Math.min(1, (t - 3) / 3));
      hub.r     = hub.targetR * hubProgress;
      hub.alpha = hubProgress;

      /* Gravity toward hub builds over time */
      const gravScale = Math.max(0, (t - 1) / 15);
      for (const n of nodes) {
        const dx = hub.x - n.x, dy = hub.y - n.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d > 90) {
          n.vx += (dx / d) * gravScale * 0.018;
          n.vy += (dy / d) * gravScale * 0.018;
        }
        n.vx *= 0.980;
        n.vy *= 0.980;
        n.x  += n.vx;
        n.y  += n.vy;
        /* Soft boundary */
        if (n.x < 16)    n.vx += 0.12;
        if (n.x > W - 16) n.vx -= 0.12;
        if (n.y < 16)    n.vy += 0.12;
        if (n.y > H - 16) n.vy -= 0.12;
        n.pulse += 0.03;
      }

      /* Draw connections between nearby nodes */
      const CONNECT_DIST = 90 + Math.min(t * 15, 80);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECT_DIST) {
            const strength = (1 - d / CONNECT_DIST) * Math.min(1, t / 3);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${rgb},${strength * 0.22})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      /* Hub connection lines */
      if (hub.alpha > 0.05) {
        for (const n of nodes) {
          const dx = n.x - hub.x, dy = n.y - hub.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 200) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(hub.x, hub.y);
            ctx.strokeStyle = `rgba(${rgb},${hub.alpha * (1 - d / 200) * 0.28})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      /* Sparks traveling along connections */
      if (ts - lastSparkTime > 280 && t > 2) {
        const i = Math.floor(Math.random() * nodes.length);
        const j = Math.floor(Math.random() * nodes.length);
        if (i !== j) sparks.push({ from: nodes[i], to: nodes[j], p: 0, speed: 0.009 + Math.random() * 0.007 });
        lastSparkTime = ts;
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.p += s.speed;
        if (s.p >= 1) { sparks.splice(i, 1); continue; }
        const sx = s.from.x + (s.to.x - s.from.x) * s.p;
        const sy = s.from.y + (s.to.y - s.from.y) * s.p;
        const a  = Math.sin(s.p * Math.PI) * 0.85;
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${a})`;
        ctx.fill();
      }

      /* Draw nodes */
      for (const n of nodes) {
        const glowR = n.r * 3;
        const grd   = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        grd.addColorStop(0, `rgba(${n.c[0]},${n.c[1]},${n.c[2]},0.18)`);
        grd.addColorStop(1, `rgba(${n.c[0]},${n.c[1]},${n.c[2]},0)`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        const breathe = 0.65 + Math.sin(n.pulse) * 0.2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.c[0]},${n.c[1]},${n.c[2]},${breathe})`;
        ctx.fill();
      }

      /* Hub */
      if (hub.alpha > 0.02) {
        const grd = ctx.createRadialGradient(hub.x, hub.y, 0, hub.x, hub.y, hub.r * 5);
        grd.addColorStop(0, `rgba(${rgb},${hub.alpha * 0.30})`);
        grd.addColorStop(1, `rgba(${rgb},0)`);
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, hub.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        /* Pulsing ring */
        const pr = hub.r * (1 + Math.sin(t * 2.5) * 0.25);
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, pr * 2.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rgb},${hub.alpha * 0.15})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(hub.x, hub.y, hub.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${hub.alpha * 0.88})`;
        ctx.fill();
      }
    }

    draw(0);
    startAnnotation(story);
  }

  /* ──────────────────────────────────────────────────────
     ANIMATION: Flow — data pipeline
     Story: Chaotic raw data → structured pipeline → clean insight

     Visual metaphor for Flux: particles representing data events
     enter chaotically from the left, pass through three visible
     processing stages, and emerge as clean, sorted streams.
  ────────────────────────────────────────────────────── */
  function animFlow(canvas, rgb, story) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    /* The three visible pipeline stage boundaries */
    const GATES = [W * 0.32, W * 0.57, W * 0.80];
    const GATE_LABELS = ['INGEST', 'PROCESS', 'OUTPUT'];

    /* Input colors — raw, varied data */
    const RAW_COLORS = [
      [220, 90, 90], [90, 155, 215], [190, 190, 65],
      [90, 215, 130], [215, 110, 185], [110, 185, 215],
    ];

    /* Processed color — clean teal output */
    const CLEAN = [55, 210, 170];

    const particles = [];
    let lastSpawnTs = 0;
    let t = 0;

    function spawnParticle() {
      const ci = Math.floor(Math.random() * RAW_COLORS.length);
      particles.push({
        x:     -8,
        y:     H * (0.15 + Math.random() * 0.70),
        speed: 1.4 + Math.random() * 1.6,
        r:     2.5 + Math.random() * 2.5,
        ci,
        phase: Math.random() * Math.PI * 2,
      });
    }

    function draw(ts) {
      animRafId = requestAnimationFrame(draw);
      t += 0.018;

      /* Subtle trail — particles leave faint ghost */
      ctx.fillStyle = 'rgba(3,6,15,0.18)';
      ctx.fillRect(0, 0, W, H);

      /* Spawn particles */
      if (ts - lastSpawnTs > 160) {
        spawnParticle();
        if (Math.random() < 0.35) spawnParticle(); /* occasional burst */
        lastSpawnTs = ts;
      }

      /* Gate lines */
      for (let gi = 0; gi < GATES.length; gi++) {
        const gx = GATES[gi];
        ctx.strokeStyle = `rgba(${rgb},0.08)`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 8]);
        ctx.beginPath();
        ctx.moveTo(gx, H * 0.04);
        ctx.lineTo(gx, H * 0.92);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = `rgba(${rgb},0.28)`;
        ctx.font = '9px Space Mono, monospace';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '0.12em';
        ctx.fillText(GATE_LABELS[gi], gx, H * 0.055);
      }
      ctx.textAlign = 'left';

      /* Update and draw particles */
      for (let i = particles.length - 1; i >= 0; i--) {
        const p  = particles[i];
        const progress = Math.max(0, Math.min(1, p.x / W)); /* 0 = left edge, 1 = right edge */

        /* Forward movement */
        p.x += p.speed;

        /* Vertical wobble dies out as data is "processed" */
        const wobble = (1 - progress) * 7;
        p.y += Math.sin(p.phase + p.x * 0.025) * wobble * 0.18;

        /* Converge toward lane center as it progresses */
        const laneY   = H * 0.5;
        const converge = Math.max(0, (progress - 0.35) / 0.65);
        p.y += (laneY - p.y) * converge * 0.04;

        /* Color interpolates from raw to clean */
        const raw  = RAW_COLORS[p.ci];
        const blend = Math.max(0, (progress - 0.3) / 0.55);
        const r = Math.round(raw[0] + (CLEAN[0] - raw[0]) * blend);
        const g = Math.round(raw[1] + (CLEAN[1] - raw[1]) * blend);
        const b = Math.round(raw[2] + (CLEAN[2] - raw[2]) * blend);

        /* Size reduces as it gets "cleaner" */
        const size = p.r * (1 - blend * 0.45);
        const alpha = 0.55 + blend * 0.25;

        if (p.x > 0 && p.x < W + 10 && p.y > 4 && p.y < H - 4) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.fill();
        }

        if (p.x > W + 10) particles.splice(i, 1);
      }
    }

    draw(0);
    startAnnotation(story);
  }

  /* ──────────────────────────────────────────────────────
     ANIMATION: Pulse — feedback loop resolving
     Story: Feedback arrives → routed to handlers → resolved

     Visual metaphor for Echo: signals come in from sources
     around the edge, flow to a central inbox, then route out
     to handler nodes that process and resolve them.
  ────────────────────────────────────────────────────── */
  function animPulse(canvas, rgb, story) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    /* Central inbox hub */
    const inbox = { x: W * 0.38, y: H * 0.50, r: 16 };

    /* Handler/resolver nodes on the right side */
    const handlers = [
      { x: W * 0.68, y: H * 0.22, r: 10, busy: false, phase: 0.0 },
      { x: W * 0.76, y: H * 0.50, r: 10, busy: false, phase: 2.1 },
      { x: W * 0.68, y: H * 0.78, r: 10, busy: false, phase: 4.2 },
    ];

    /* Feedback sources around the left half */
    const sources = [
      { x: W * 0.06, y: H * 0.18 },
      { x: W * 0.06, y: H * 0.50 },
      { x: W * 0.06, y: H * 0.82 },
      { x: W * 0.20, y: H * 0.06 },
      { x: W * 0.20, y: H * 0.94 },
    ];

    /* Flying signals + expanding resolution rings */
    const signals      = [];
    const resolutions  = [];
    let resolvedCount  = 0;
    let lastSignalTime = 0;
    let t = 0;

    function spawnSignal() {
      const src = sources[Math.floor(Math.random() * sources.length)];
      signals.push({
        x: src.x, y: src.y,
        tx: inbox.x, ty: inbox.y,
        progress: 0,
        speed: 0.007 + Math.random() * 0.006,
        size: 2.5 + Math.random() * 2,
      });
    }

    function draw(ts) {
      animRafId = requestAnimationFrame(draw);
      t += 0.014;

      ctx.clearRect(0, 0, W, H);

      /* Spawn signals */
      if (ts - lastSignalTime > 800) {
        spawnSignal();
        if (Math.random() < 0.4) spawnSignal();
        lastSignalTime = ts;
      }

      /* Lines from inbox to handlers */
      for (const h of handlers) {
        ctx.beginPath();
        ctx.moveTo(inbox.x, inbox.y);
        ctx.lineTo(h.x, h.y);
        ctx.strokeStyle = `rgba(${rgb},0.07)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      /* Source indicators */
      for (let si = 0; si < sources.length; si++) {
        const src   = sources[si];
        const pulse = 0.35 + Math.sin(t * 1.5 + si * 1.3) * 0.2;
        /* Dot */
        ctx.beginPath();
        ctx.arc(src.x, src.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${pulse * 0.6})`;
        ctx.fill();
        /* Ring */
        ctx.beginPath();
        ctx.arc(src.x, src.y, 9, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rgb},${pulse * 0.18})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        /* Line stub toward inbox */
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(src.x + 12, src.y + (inbox.y - src.y) * 0.08);
        ctx.strokeStyle = `rgba(${rgb},0.10)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      /* Flying signals (source → inbox) */
      for (let i = signals.length - 1; i >= 0; i--) {
        const s = signals[i];
        s.progress += s.speed;
        if (s.progress >= 1) {
          signals.splice(i, 1);
          /* Trigger a random handler */
          const h = handlers[Math.floor(Math.random() * handlers.length)];
          h.busy = true;
          setTimeout(() => {
            h.busy = false;
            resolvedCount++;
            resolutions.push({ x: h.x, y: h.y, r: h.r, a: 0.65 });
          }, 500 + Math.random() * 300);
          continue;
        }
        const sx = s.x + (s.tx - s.x) * s.progress;
        const sy = s.y + (s.ty - s.y) * s.progress;
        const a  = Math.sin(s.progress * Math.PI) * 0.85;
        ctx.beginPath();
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${a})`;
        ctx.fill();
      }

      /* Inbox node */
      const inboxPulse = 1 + Math.sin(t * 2.2) * 0.12;
      const igrd = ctx.createRadialGradient(inbox.x, inbox.y, 0, inbox.x, inbox.y, inbox.r * 4);
      igrd.addColorStop(0, `rgba(${rgb},0.22)`);
      igrd.addColorStop(1, `rgba(${rgb},0)`);
      ctx.beginPath();
      ctx.arc(inbox.x, inbox.y, inbox.r * 4, 0, Math.PI * 2);
      ctx.fillStyle = igrd;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(inbox.x, inbox.y, inbox.r * inboxPulse * 1.8, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${rgb},0.14)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(inbox.x, inbox.y, inbox.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb},0.80)`;
      ctx.fill();

      /* Handler nodes */
      for (const h of handlers) {
        const brightness = h.busy ? 0.95 : 0.45 + Math.sin(t * 1.4 + h.phase) * 0.15;

        const hgrd = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.r * 3.5);
        hgrd.addColorStop(0, `rgba(${rgb},${brightness * 0.28})`);
        hgrd.addColorStop(1, `rgba(${rgb},0)`);
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = hgrd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${brightness * 0.85})`;
        ctx.fill();

        /* When busy: a bright ring emanates */
        if (h.busy) {
          ctx.beginPath();
          ctx.arc(h.x, h.y, h.r * 2, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${rgb},0.4)`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      /* Resolution rings */
      for (let i = resolutions.length - 1; i >= 0; i--) {
        const res = resolutions[i];
        res.r += 1.4;
        res.a -= 0.010;
        if (res.a <= 0) { resolutions.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(res.x, res.y, res.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rgb},${res.a})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      /* Resolved counter (upper right) */
      const counterAlpha = Math.min(1, t * 0.5);
      ctx.fillStyle = `rgba(${rgb},${counterAlpha * 0.65})`;
      ctx.font = `700 ${Math.min(36, W * 0.044)}px Space Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(resolvedCount, W * 0.86, H * 0.25);
      ctx.fillStyle = `rgba(${rgb},${counterAlpha * 0.32})`;
      ctx.font = `400 9px Space Mono, monospace`;
      ctx.fillText('resolved', W * 0.86, H * 0.25 + 18);
      ctx.textAlign = 'left';
    }

    draw(0);
    startAnnotation(story);
  }

  /* ── Navigate to a screen (0–2) ── */
  function goToScreen(index, animate = true) {
    currentScreen = index;

    /* Slide the track */
    const track = el.track();
    track.style.transition = animate
      ? 'transform 0.6s cubic-bezier(0.4,0,0.2,1)'
      : 'none';
    track.style.transform = `translateX(${-index * 100}%)`;

    /* Update step indicators */
    el.navSteps().forEach((step, i) => {
      step.classList.toggle('active',  i === index);
      step.classList.toggle('visited', i < index);
    });

    /* Update connector fill */
    el.navConnectors().forEach((conn, i) => {
      conn.classList.toggle('passed', i < index);
    });

    /* Arrow states */
    el.prevBtn().disabled = index === 0;
    el.nextBtn().disabled = index === 2;

    /* Staggered content reveal for team cards */
    if (index === 1 && animate) revealTeamCards();
  }

  /* Stagger the team cards in with a cascade effect */
  function revealTeamCards() {
    const cards = document.querySelectorAll('.team-card');
    cards.forEach(card => card.classList.remove('is-visible'));
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add('is-visible'), i * 80 + 60);
    });
  }

  /* ── Bind all UI events ── */
  function bindEvents() {
    document.getElementById('back-to-universe').addEventListener('click', () => {
      close();
      SolarSystem.show();
    });

    document.getElementById('prev-btn').addEventListener('click', () => {
      if (currentScreen > 0) goToScreen(currentScreen - 1);
    });

    document.getElementById('next-btn').addEventListener('click', () => {
      if (currentScreen < 2) goToScreen(currentScreen + 1);
    });

    document.querySelectorAll('.nav-step').forEach(step => {
      step.addEventListener('click', () => {
        goToScreen(parseInt(step.dataset.target, 10));
      });
    });

    document.addEventListener('keydown', e => {
      if (document.getElementById('showcase-view').classList.contains('view-hidden')) return;
      if (e.key === 'ArrowRight' && currentScreen < 2) goToScreen(currentScreen + 1);
      if (e.key === 'ArrowLeft'  && currentScreen > 0) goToScreen(currentScreen - 1);
      if (e.key === 'Escape') { close(); SolarSystem.show(); }
    });
  }

  return { open, close, bindEvents, startAnimation };
})();
