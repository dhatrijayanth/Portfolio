/* ============================================================
   TXI Universe — starfield.js
   Canvas background: stars, constellations, nebulae, comet

   Rendering order (back to front):
     1. Nebulae  — soft atmospheric color fields, slowly drifting
     2. Stars    — temperature-tinted, slow twinkle, parallax
     3. Constellations — faint chart tracings with glowing vertices
     4. Comet    — rare crossing streak, appears every ~40 seconds

   All motion is slow and deliberate. Nothing flickers or rushes.
============================================================ */

const Starfield = (() => {
  let canvas, ctx;
  let W, H;
  let stars = [];
  let constellations = [];
  let mouseX = 0, mouseY = 0;   /* -0.5 … +0.5 relative to center */
  let rafId;
  let time = 0;

  /* active comet instance (null = none visible) */
  let comet = null;
  let lastCometTime = -999999; /* ms since page load, starts negative so first comet appears sooner */
  const COMET_BASE_INTERVAL = 38000;  /* 38 s minimum between comets */
  const COMET_VARIANCE      = 24000;  /* +0-24 s random additional wait */
  let nextCometInterval     = COMET_BASE_INTERVAL;

  /* ── Constellation shapes ──
     Laid out to occupy the four corners and upper-centre of the
     viewport, avoiding the solar system area in the middle.
     Points are [x%, y%] viewport percentages.
     "Names" are thematic — they represent community ideas. ── */
  const CONSTELLATION_DEFS = [
    /* Upper-left — a loose cluster suggesting gathering */
    {
      pts: [[7,11],[11,20],[8,29],[14,26],[16,17],[20,22]],
      lines: [[0,1],[1,2],[1,3],[3,4],[0,4],[4,5],[1,4]],
    },
    /* Upper-right — a branching form suggesting growth */
    {
      pts: [[72,8],[76,17],[80,11],[78,23],[72,25],[68,18]],
      lines: [[0,1],[1,2],[1,3],[3,4],[4,5],[5,0]],
    },
    /* Lower-right — a chain suggesting connection */
    {
      pts: [[83,57],[88,51],[86,62],[92,64],[90,70],[84,72]],
      lines: [[0,1],[0,2],[2,3],[3,4],[4,5],[2,5]],
    },
    /* Lower-left — a loop suggesting cycles/iteration */
    {
      pts: [[26,70],[32,63],[38,67],[36,76],[29,79]],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,0]],
    },
    /* Top-centre — a simple arc, suggesting horizon/vision */
    {
      pts: [[48,5],[53,11],[59,8],[57,18],[51,20]],
      lines: [[0,1],[1,2],[1,3],[3,4],[0,4]],
    },
  ];

  /* ── Nebula definitions ──
     Soft elliptical color patches that drift and breathe slowly.
     x/y are viewport fractions. rx/ry are radii as fraction of
     the viewport's shorter dimension. r/g/b/a are color + max opacity. ── */
  const NEBULA_DEFS = [
    { x: 0.11, y: 0.42, rx: 0.38, ry: 0.27, r: 75,  g: 45,  b: 195, a: 0.038, phase: 0.0 },
    { x: 0.80, y: 0.60, rx: 0.30, ry: 0.22, r: 35,  g: 75,  b: 195, a: 0.030, phase: 2.1 },
    { x: 0.46, y: 0.16, rx: 0.28, ry: 0.19, r: 105, g: 40,  b: 175, a: 0.026, phase: 4.3 },
    { x: 0.88, y: 0.24, rx: 0.20, ry: 0.28, r: 25,  g: 95,  b: 175, a: 0.020, phase: 1.4 },
    { x: 0.28, y: 0.82, rx: 0.26, ry: 0.17, r: 85,  g: 55,  b: 155, a: 0.022, phase: 3.7 },
  ];

  /* ──────────────────────────────────────────────────────── */

  function init(canvasEl) {
    canvas = canvasEl;
    ctx    = canvas.getContext('2d');

    resize();
    buildStars();
    buildConstellations();
    lastCometTime = performance.now() - COMET_BASE_INTERVAL * 0.4; /* first comet ~60% sooner */
    nextCometInterval = COMET_BASE_INTERVAL + Math.random() * COMET_VARIANCE;

    render();
    window.addEventListener('resize', onResize);
    document.addEventListener('mousemove', onMouseMove, { passive: true });
  }

  function onResize() {
    resize();
    buildStars();
    buildConstellations();
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function onMouseMove(e) {
    mouseX = e.clientX / W - 0.5;
    mouseY = e.clientY / H - 0.5;
  }

  /* ── Stars ────────────────────────────────────────────────
     Most stars are faint and tiny. A small fraction are
     "feature stars" — slightly larger, prone to a rare bright
     moment that mimics variable star behaviour. ── */
  function buildStars() {
    stars = [];
    const count = Math.floor((W * H) / 3500);

    /* Color temperatures — subtle variation like a real sky */
    const TINTS = [
      [215, 228, 255],   /* cool blue-white  */
      [238, 240, 252],   /* near-neutral     */
      [255, 248, 228],   /* warm white       */
      [255, 255, 255],   /* pure white       */
    ];

    for (let i = 0; i < count; i++) {
      const isFeature = Math.random() < 0.025;
      const tint = TINTS[Math.floor(Math.random() * TINTS.length)];
      stars.push({
        x:       Math.random() * W,
        y:       Math.random() * H,
        r:       isFeature
                   ? Math.random() * 0.7 + 1.1
                   : Math.random() * 0.85 + 0.15,
        alpha:   Math.random() * 0.50 + 0.15,
        twinkle: Math.random() * 0.007 + 0.002,  /* very slow */
        phase:   Math.random() * Math.PI * 2,
        layer:   Math.random(),
        rt: tint[0], gt: tint[1], bt: tint[2],
        isFeature,
        featureFreq: Math.random() * 0.003 + 0.001,
        featurePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  /* ── Constellations ───────────────────────────────────────*/
  function buildConstellations() {
    constellations = CONSTELLATION_DEFS.map(def => ({
      pts: def.pts.map(([px, py]) => ({
        x:     (px / 100) * W,
        y:     (py / 100) * H,
        r:     0.85 + Math.random() * 0.65,
        alpha: 0.50 + Math.random() * 0.38,
      })),
      lines: def.lines,
    }));
  }

  /* ── Comet factory ────────────────────────────────────────*/
  function spawnComet() {
    /* Enter from a random edge, travel diagonally.
       Horizontal angle: 25–55° — looks natural, not straight-line. */
    const fromLeft = Math.random() > 0.5;
    const angle    = (Math.random() * 30 + 25) * (Math.PI / 180);
    const yDir     = Math.random() > 0.5 ? 1 : -1;

    const speed = Math.random() * 2.8 + 3.5;  /* px/frame */
    const vx = (fromLeft ? 1 : -1) * Math.cos(angle) * speed;
    const vy = yDir * Math.sin(angle) * speed;

    /* Start off-screen */
    const startX = fromLeft ? -60 : W + 60;
    const startY = H * (0.12 + Math.random() * 0.76);

    return {
      x: startX, y: startY,
      vx, vy,
      brightness: 0.65 + Math.random() * 0.30,
      tailLen: 55 + Math.random() * 55,  /* px history */
      history: [],
      dead: false,
    };
  }

  /* ──────────────────────────────────────────────────────── */
  /* Render loop                                              */
  /* ──────────────────────────────────────────────────────── */
  let lastTimestamp = 0;

  function render(timestamp = 0) {
    rafId = requestAnimationFrame(render);

    const dt = Math.min((timestamp - lastTimestamp) / 16.67, 3); /* cap at 3× for tab focus */
    lastTimestamp = timestamp;
    time += 0.008 * dt;

    ctx.clearRect(0, 0, W, H);

    drawNebulae(timestamp);
    drawStars();
    drawConstellations();
    drawComet(timestamp, dt);
  }

  /* ── Draw nebulae ─────────────────────────────────────────*/
  function drawNebulae(ts) {
    /* Nebulae drift extremely slowly — their centre oscillates
       by a few dozen pixels over many seconds */
    const t = ts * 0.00006;

    for (const n of NEBULA_DEFS) {
      /* Gentle position oscillation */
      const dx = Math.sin(t + n.phase * 1.3) * 18;
      const dy = Math.cos(t * 0.7 + n.phase) * 12;

      const cx = n.x * W + dx;
      const cy = n.y * H + dy;

      /* Radius in px — use the viewport's shorter dimension as base */
      const base = Math.min(W, H);
      const rx   = n.rx * base;
      const ry   = n.ry * base;

      /* Opacity breathes very slowly */
      const breathe = 0.82 + Math.sin(t * 1.4 + n.phase) * 0.18;
      const alpha   = n.a * breathe;

      /* Render as an ellipse by scaling the context */
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, ry / rx);

      const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      grd.addColorStop(0,   `rgba(${n.r},${n.g},${n.b},${alpha})`);
      grd.addColorStop(0.45, `rgba(${n.r},${n.g},${n.b},${alpha * 0.40})`);
      grd.addColorStop(1,   'rgba(0,0,0,0)');

      ctx.beginPath();
      ctx.arc(0, 0, rx, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.restore();
    }
  }

  /* ── Draw stars ───────────────────────────────────────────*/
  function drawStars() {
    for (const s of stars) {
      /* Slow twinkle */
      const tw = Math.sin(time * s.twinkle * 120 + s.phase) * 0.09;
      let a    = Math.max(0, Math.min(1, s.alpha + tw));

      /* Feature stars: rare bright surge (simulates variable star) */
      if (s.isFeature) {
        const surge = Math.sin(time * s.featureFreq * 100 + s.featurePhase);
        if (surge > 0.92) {
          a = Math.min(1, a + (surge - 0.92) * 3.5);
        }
      }

      /* Parallax — closer (higher layer) moves more with mouse */
      const ox = mouseX * s.layer * -13;
      const oy = mouseY * s.layer * -13;

      ctx.beginPath();
      ctx.arc(s.x + ox, s.y + oy, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.rt},${s.gt},${s.bt},${a})`;
      ctx.fill();
    }
  }

  /* ── Draw constellations ──────────────────────────────────*/
  function drawConstellations() {
    /* Constellations are on a slow parallax layer — background depth */
    const OX = mouseX * 0.12 * -13;
    const OY = mouseY * 0.12 * -13;

    for (const c of constellations) {
      /* Lines — faint chart tracings */
      ctx.strokeStyle = 'rgba(200, 212, 242, 0.040)';
      ctx.lineWidth   = 0.5;
      ctx.lineCap     = 'round';

      for (const [i, j] of c.lines) {
        const a = c.pts[i], b = c.pts[j];
        ctx.beginPath();
        ctx.moveTo(a.x + OX, a.y + OY);
        ctx.lineTo(b.x + OX, b.y + OY);
        ctx.stroke();
      }

      /* Star vertices — cool blue-white, wider halo than regular stars */
      for (const p of c.pts) {
        const px = p.x + OX, py = p.y + OY;

        /* Soft halo */
        const hR  = p.r * 6;
        const grd = ctx.createRadialGradient(px, py, 0, px, py, hR);
        grd.addColorStop(0, 'rgba(195, 212, 255, 0.11)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(px, py, hR, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        /* Core */
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(218, 228, 255, ${p.alpha})`;
        ctx.fill();
      }
    }
  }

  /* ── Comet ────────────────────────────────────────────────*/
  function drawComet(ts, dt) {
    /* Spawn check */
    if (!comet) {
      if (ts - lastCometTime > nextCometInterval) {
        comet = spawnComet();
        lastCometTime     = ts;
        nextCometInterval = COMET_BASE_INTERVAL + Math.random() * COMET_VARIANCE;
      } else {
        return;
      }
    }

    /* Move */
    comet.history.unshift({ x: comet.x, y: comet.y });
    comet.x += comet.vx * dt;
    comet.y += comet.vy * dt;

    /* Trim tail history to desired pixel length */
    const frameLen = Math.sqrt(comet.vx ** 2 + comet.vy ** 2) * dt || 1;
    const maxFrames = Math.ceil(comet.tailLen / frameLen);
    if (comet.history.length > maxFrames) comet.history.length = maxFrames;

    /* Kill if well off-screen */
    if (comet.x < -100 || comet.x > W + 100 ||
        comet.y < -100 || comet.y > H + 100) {
      comet = null;
      return;
    }

    /* Draw tail — each historical point fades from head to tip */
    for (let i = 0; i < comet.history.length; i++) {
      const t  = 1 - i / comet.history.length;  /* 1 = head, 0 = tail tip */
      const pt = comet.history[i];
      const r  = t * 1.4 + 0.15;
      const a  = t * comet.brightness * 0.65;

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(225, 235, 255, ${a})`;
      ctx.fill();
    }

    /* Head — bright core + soft glow */
    const hx = comet.x, hy = comet.y;

    const grd = ctx.createRadialGradient(hx, hy, 0, hx, hy, 4);
    grd.addColorStop(0, `rgba(255, 255, 255, ${comet.brightness})`);
    grd.addColorStop(0.4, `rgba(210, 228, 255, ${comet.brightness * 0.5})`);
    grd.addColorStop(1,   'rgba(0,0,0,0)');

    ctx.beginPath();
    ctx.arc(hx, hy, 4, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
  }

  /* ──────────────────────────────────────────────────────── */

  function destroy() {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('mousemove', onMouseMove);
  }

  return { init, destroy };
})();
