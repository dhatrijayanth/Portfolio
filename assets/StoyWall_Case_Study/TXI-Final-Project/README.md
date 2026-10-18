# TXI Interactive Universe

This is a lightweight interactive HTML/CSS/JS experience that opens into a solar-system-like environment. Three main planets represent projects — clicking a planet opens a cinematic project showcase with three screens.

Files:
- [index.html](index.html) — entry HTML, semantic structure, overlay container.
- [css/styles.css](css/styles.css) — all visual styles, planet, overlay and animation rules.
- [js/app.js](js/app.js) — starfield canvas, interactions, and carousel logic. Placeholder `PROJECTS` array is defined at the top and should be replaced with real project metadata.

Where to replace placeholder data:
- Replace the `PROJECTS` array in `js/app.js` with your real projects (title, summary, why, impact, team).
- To provide per-project visuals, replace the SVG placeholder inside `buildScreens()` with a richer animation or embed media in the `.project-animation` container.

How to run:
1. Open [index.html](index.html) in a modern browser (Chrome, Edge, Firefox, Safari).

Design notes & extension points:
- The starfield is drawn on a canvas for performance. You can tune density in `createStars()`.
- Each planet is a semantic `button` and receives a `data-project-id` that maps to the `PROJECTS` array.
- The overlay uses a simple three-screen carousel. You can extend the `buildScreens()` function to generate additional screens or fetch dynamic content.

Accessibility & performance:
- Planets are keyboard-focusable; overlay can be closed with `Esc` and navigated with arrow keys.
- Animations use CSS transforms where possible for GPU acceleration.

Next steps (suggested):
- Add project-specific visuals (animated video, Lottie, or interactive SVGs).
- Load projects dynamically from a JSON endpoint and add images.
- Add smooth camera transitions (zoom/blur) when entering/exiting overlays.
