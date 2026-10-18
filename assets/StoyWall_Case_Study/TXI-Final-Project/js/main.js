/* ============================================================
   TXI Universe — main.js
   App controller: initialises all modules, orchestrates
   the entry → solar system → showcase flow and transitions.
============================================================ */

(function () {
  'use strict';

  /* ── DOM refs ── */
  const entryScreen  = document.getElementById('entry-screen');
  const enterBtn     = document.getElementById('enter-universe-btn');
  const exploreHint  = document.getElementById('explore-hint');
  const sceneWipe    = document.getElementById('scene-wipe');

  /* ──────────────────────────────────────────────────────── */

  function init() {
    /* Starfield runs immediately (always behind everything) */
    Starfield.init(document.getElementById('starfield-canvas'));

    /* Build solar system — planets hidden until entry completes */
    SolarSystem.init(handlePlanetClick);

    /* Wire up showcase UI events once */
    Showcase.bindEvents();

    /* Entry button */
    enterBtn.addEventListener('click', enterUniverse);
  }

  /* ── User clicks "Enter the Universe" ── */
  function enterUniverse() {
    enterBtn.disabled = true;
    entryScreen.classList.add('fade-out');

    setTimeout(() => {
      entryScreen.style.display = 'none';
      SolarSystem.show();

      setTimeout(() => {
        exploreHint.classList.remove('hint-hidden');
      }, 1400);
    }, 1200);
  }

  /* ── Burst rings — thin circles that expand outward from the planet center
     on click, bridging the moment between click and the wipe opening. ── */
  function emitBurst(px, py, colorRgb) {
    [0, 120, 240].forEach(delay => {
      setTimeout(() => {
        const ring = document.createElement('div');
        ring.className  = 'burst-ring';
        ring.style.left = `${px}px`;
        ring.style.top  = `${py}px`;
        ring.style.width        = '40px';
        ring.style.height       = '40px';
        ring.style.borderColor  = `rgba(${colorRgb}, 0.70)`;
        document.body.appendChild(ring);
        ring.addEventListener('animationend', () => ring.remove(), { once: true });
      }, delay);
    });
  }

  /* ── Clip-path wipe — a circle expands from the planet's exact screen
     position, filling the viewport with the project's accent color before
     revealing the showcase beneath. ── */
  function startWipe(px, py, pr, project) {
    const rgb = project.colorRgb;

    /* Set the gradient background of the wipe layer — light radiates from
       the planet's position, so it feels like the planet is opening. */
    sceneWipe.style.background =
      `radial-gradient(circle at ${px}px ${py}px,` +
      ` rgba(${rgb}, 0.95) 0%,` +
      ` rgba(${rgb}, 0.40) 32%,` +
      ` rgba(2,4,8,1) 68%)`;

    /* Snap clip-path to planet size (no transition yet) */
    sceneWipe.style.transition = 'none';
    sceneWipe.style.opacity    = '1';
    sceneWipe.style.clipPath   = `circle(${pr}px at ${px}px ${py}px)`;

    /* Force reflow so the browser registers the starting clip-path */
    sceneWipe.offsetWidth; // eslint-disable-line no-unused-expressions

    /* Expand the circle to cover the whole viewport */
    sceneWipe.style.transition = 'clip-path 0.88s cubic-bezier(0.65, 0, 0.15, 1)';
    sceneWipe.style.clipPath   = `circle(200vmax at ${px}px ${py}px)`;

    /* Once the wipe covers the screen, swap views */
    setTimeout(() => {
      SolarSystem.hide();
      Showcase.open(project.id);

      /* Fade the wipe out so the showcase is revealed cleanly */
      sceneWipe.style.transition = 'opacity 0.65s ease';
      sceneWipe.style.opacity    = '0';

      /* Reset to invisible initial state after fade */
      setTimeout(() => {
        sceneWipe.style.transition = 'none';
        sceneWipe.style.opacity    = '';
        sceneWipe.style.clipPath   = 'circle(0px at 50% 50%)';
      }, 680);
    }, 860);
  }

  /* ── User clicks a project planet ── */
  function handlePlanetClick(projectId, planetEl) {
    const rect    = planetEl.getBoundingClientRect();
    const px      = Math.round(rect.left + rect.width  / 2);
    const py      = Math.round(rect.top  + rect.height / 2);
    const pr      = Math.round(rect.width / 2);
    const project = PROJECTS[projectId];

    exploreHint.classList.add('hint-hidden');

    /* Burst rings fire immediately on click */
    emitBurst(px, py, project.colorRgb);

    /* Short pause lets the burst register before the wipe begins */
    setTimeout(() => startWipe(px, py, pr, project), 160);
  }

  /* ── Boot ── */
  document.addEventListener('DOMContentLoaded', init);
})();
