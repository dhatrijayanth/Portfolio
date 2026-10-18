/* ============================================================
   TXI Universe — solar-system.js
   Builds and animates the solar system DOM:
     • decorative background planets on orbits
     • 3 project planets (interactive)
     • floating decorative shapes
   Calls onPlanetClick(projectId, planetEl) when a planet is clicked.
============================================================ */

const SolarSystem = (() => {
  let onPlanetClick;

  /* ── Decorative planet configs ── */
  const DECO_PLANETS = [
    { cls: 'planet-deco-a', orbitR: 128, dur: 22,  delay: 5  },
    { cls: 'planet-deco-b', orbitR: 158, dur: 17,  delay: 9  },
    { cls: 'planet-deco-c', orbitR: 248, dur: 42,  delay: 18 },
    { cls: 'planet-deco-d', orbitR: 358, dur: 72,  delay: 40 },
    { cls: 'planet-deco-e', orbitR: 462, dur: 105, delay: 65 },
  ];

  /* ── Floating symbolic markers ──
     Represent quiet community activity: nodes of connection,
     lines of structure, faint traces of work and collaboration.
     Durations are long — nothing here moves quickly. ── */
  const FLOATERS = [
    /* Connection nodes — empty circles, like people in a network */
    { cls: 'shape-node',         x: 7,  y: 18, dur: 11, delay: 0   },
    { cls: 'shape-node',         x: 91, y: 72, dur: 14, delay: 5   },
    { cls: 'shape-node',         x: 52, y: 90, dur: 10, delay: 2   },
    { cls: 'shape-node',         x: 78, y: 12, dur: 13, delay: 8   },

    /* Accent node — slightly coloured, hints at planetary palette */
    { cls: 'shape-node-accent',  x: 18, y: 78, dur: 16, delay: 4   },
    { cls: 'shape-node-accent',  x: 85, y: 38, dur: 12, delay: 9   },

    /* Structural bars — horizontal lines suggesting data / horizon */
    { cls: 'shape-bar',          x: 10, y: 48, dur: 18, delay: 3   },
    { cls: 'shape-bar',          x: 68, y: 82, dur: 15, delay: 7   },

    /* Short dashes — fragments, incomplete thoughts */
    { cls: 'shape-dash',         x: 40, y: 8,  dur: 12, delay: 1   },
    { cls: 'shape-dash',         x: 94, y: 55, dur: 10, delay: 6   },

    /* Observation dots — quiet presences */
    { cls: 'shape-dot',          x: 25, y: 92, dur: 9,  delay: 2   },
    { cls: 'shape-dot',          x: 60, y: 5,  dur: 11, delay: 4   },
    { cls: 'shape-dot',          x: 4,  y: 60, dur: 13, delay: 0   },
  ];

  /* ──────────────────────────────────────────────────────── */

  function init(clickCallback) {
    onPlanetClick = clickCallback;
    buildSolarSystem();
    buildFloaters();
  }

  /* ── Build all orbits + planets inside #solar-system-container ── */
  function buildSolarSystem() {
    const container = document.getElementById('solar-system-container');

    /* 1. Decorative orbit rings + planets */
    DECO_PLANETS.forEach(cfg => {
      const decoSize = getDecoSize(cfg.cls);
      const { ring, holder, planet } = createOrbitGroup(
        cfg.orbitR, cfg.dur, cfg.delay, decoSize,
      );
      planet.classList.add('planet', 'planet-deco', cfg.cls);
      planet.style.position = 'absolute';
      planet.style.inset    = '0';
      container.appendChild(ring);
      container.appendChild(holder);
    });

    /* 2. Project orbits + planets (from data.js) */
    PROJECTS.forEach(project => {
      const planetSize = getPlanetSize(project.planetClass);

      const { ring, holder, wrapper, planet } = createOrbitGroup(
        project.orbitRadius,
        project.orbitDuration,
        project.orbitDelay,
        planetSize,
      );

      /* Planet visuals */
      planet.classList.add('planet', 'planet-project', project.planetClass);
      /* Planet fills wrapper — centered on the orbit circumference point */
      planet.style.position = 'absolute';
      planet.style.inset    = '0';
      planet.setAttribute('tabindex', '0');
      planet.setAttribute('role', 'button');
      planet.setAttribute('aria-label', `Explore ${project.name}`);

      /* Planet 1 gets a Saturn-style ring */
      if (project.id === 0) {
        const ring2 = document.createElement('div');
        ring2.className = 'planet-p1-ring';
        planet.appendChild(ring2);
      }

      /* Label below planet — sits inside the counter-rotating wrapper
         so it stays upright automatically */
      const label = document.createElement('div');
      label.className = 'planet-label';
      label.textContent = project.name;
      label.style.top = `${planetSize + 10}px`;
      wrapper.appendChild(label);

      /* Hover ripple rings */
      setupHoverRipple(planet, project);

      /* Click + keyboard interaction */
      const interact = () => onPlanetClick(project.id, planet);
      planet.addEventListener('click', interact);
      planet.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); interact(); }
      });

      container.appendChild(ring);
      container.appendChild(holder);
    });
  }

  /* ── Create one orbit group: visual ring + animated holder + wrapper + planet ──
     planetSize: width/height of the planet in px.
     The wrapper is given these dimensions so counter-rotate's translateX/Y(-50%)
     correctly centers the planet ON the orbit circumference point. ── */
  function createOrbitGroup(radius, duration, delay, planetSize) {
    const diameter = radius * 2;

    /* Visual orbit ring — static circle showing the orbit path */
    const ring = document.createElement('div');
    ring.className = 'orbit-ring';
    ring.style.width  = `${diameter}px`;
    ring.style.height = `${diameter}px`;

    /* Animated holder — rotates, carrying the planet around the sun */
    const holder = document.createElement('div');
    holder.className = 'orbit-holder';
    holder.style.width             = `${diameter}px`;
    holder.style.height            = `${diameter}px`;
    holder.style.animationDuration = `${duration}s`;
    holder.style.animationDelay    = `-${delay}s`;

    /* Planet wrapper — counter-rotates at the same speed so the planet
       stays upright. translateX(-50%) translateY(-50%) in the keyframe
       centers the wrapper (and therefore the planet) exactly on the
       orbit circumference point (top-center of the holder circle). */
    const wrapper = document.createElement('div');
    wrapper.className = 'planet-wrapper';
    wrapper.style.width             = `${planetSize}px`;
    wrapper.style.height            = `${planetSize}px`;
    wrapper.style.animationDuration = `${duration}s`;
    wrapper.style.animationDelay    = `-${delay}s`;

    /* Planet element — classes and interaction added by caller */
    const planet = document.createElement('div');
    wrapper.appendChild(planet);
    holder.appendChild(wrapper);

    return { ring, holder, wrapper, planet };
  }

  /* ── Hover ripple rings ───────────────────────────────────
     Continuously emits expanding ring elements while the cursor
     rests on a project planet. Each ring animates via CSS and
     removes itself on completion. ── */
  function setupHoverRipple(planet, project) {
    let active = false;
    let timer  = null;

    function emit() {
      if (!active) return;
      const ring = document.createElement('div');
      ring.className = 'planet-ripple';
      ring.style.inset       = '-10px';
      ring.style.borderColor = `rgba(${project.colorRgb}, 0.28)`;
      planet.appendChild(ring);
      ring.addEventListener('animationend', () => {
        ring.remove();
        if (active) timer = setTimeout(emit, 380);
      }, { once: true });
    }

    planet.addEventListener('mouseenter', () => {
      active = true;
      emit();
    });
    planet.addEventListener('mouseleave', () => {
      active = false;
      clearTimeout(timer);
    });
  }

  /* ── Build floating decorative shapes ── */
  function buildFloaters() {
    const container = document.getElementById('floating-elements');
    FLOATERS.forEach(cfg => {
      const el = document.createElement('div');
      el.className = `float-el ${cfg.cls}`;
      el.style.left              = `${cfg.x}%`;
      el.style.top               = `${cfg.y}%`;
      el.style.animationDuration = `${cfg.dur}s`;
      el.style.animationDelay    = `-${cfg.delay}s`;
      container.appendChild(el);
    });
  }

  /* ── Helpers: planet size by class (px) ── */
  function getPlanetSize(cls) {
    const sizes = { 'planet-p1': 52, 'planet-p2': 66, 'planet-p3': 44 };
    return sizes[cls] || 40;
  }
  function getDecoSize(cls) {
    const sizes = {
      'planet-deco-a': 14, 'planet-deco-b': 9,
      'planet-deco-c': 20, 'planet-deco-d': 12, 'planet-deco-e': 17,
    };
    return sizes[cls] || 14;
  }

  /* ── Show / hide the solar system view ── */
  function show() {
    const v = document.getElementById('solar-system-view');
    v.classList.remove('view-hidden');
  }

  function hide() {
    const v = document.getElementById('solar-system-view');
    v.classList.add('view-hidden');
  }

  return { init, show, hide };
})();
