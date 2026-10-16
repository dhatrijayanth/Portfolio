(function () {
  function initCarousel(root) {
    const track = root.querySelector(".cs-carousel__track");
    const slides = Array.from(root.querySelectorAll(".cs-carousel__slide"));
    const prevBtn = root.querySelector(".cs-carousel__btn--prev");
    const nextBtn = root.querySelector(".cs-carousel__btn--next");
    const dotsWrap = root.querySelector(".cs-carousel__dots");
    const status = root.querySelector(".cs-carousel__status");

    if (!track || slides.length === 0) return;

    let index = 0;

    if (slides.length < 2) {
      root.classList.add("cs-carousel--solo");
      return;
    }

    function announce() {
      if (status) {
        status.textContent = "Slide " + (index + 1) + " of " + slides.length;
      }
    }

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      slides.forEach(function (_slide, i) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "cs-carousel__dot";
        dot.setAttribute("aria-label", "Go to slide " + (i + 1));
        if (i === index) dot.setAttribute("aria-current", "true");
        dot.addEventListener("click", function () {
          goTo(i);
        });
        dotsWrap.appendChild(dot);
      });
    }

    function update() {
      track.style.transform = "translateX(-" + index * 100 + "%)";
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === slides.length - 1;
      if (dotsWrap) {
        Array.from(dotsWrap.children).forEach(function (dot, i) {
          if (i === index) {
            dot.setAttribute("aria-current", "true");
          } else {
            dot.removeAttribute("aria-current");
          }
        });
      }
      announce();
    }

    function goTo(next) {
      index = Math.max(0, Math.min(slides.length - 1, next));
      update();
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goTo(index - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goTo(index + 1);
      });
    }

    root.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(index - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(index + 1);
      }
    });

    let touchStartX = null;
    root.addEventListener(
      "touchstart",
      function (event) {
        if (event.touches.length > 1) return;
        touchStartX = event.changedTouches[0].screenX;
      },
      { passive: true }
    );
    root.addEventListener(
      "touchend",
      function (event) {
        if (touchStartX === null) return;
        if (root.dataset.boardOpen === "true") {
          touchStartX = null;
          return;
        }
        const delta = event.changedTouches[0].screenX - touchStartX;
        if (Math.abs(delta) > 40) {
          goTo(delta < 0 ? index + 1 : index - 1);
        }
        touchStartX = null;
      },
      { passive: true }
    );

    renderDots();
    update();
  }

  function initImageBoard() {
    const MIN_SCALE = 0.4;
    const MAX_SCALE = 8;
    let overlay = null;
    let stage = null;
    let boardImg = null;
    let zoomLabel = null;
    let lastFocus = null;
    let scale = 1;
    let tx = 0;
    let ty = 0;
    let fitScale = 1;
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let originTx = 0;
    let originTy = 0;
    let pointers = new Map();
    let pinchStartDist = 0;
    let pinchStartScale = 1;

    function ensureOverlay() {
      if (overlay) return;

      overlay = document.createElement("div");
      overlay.className = "cs-board";
      overlay.hidden = true;
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", "Image board viewer");
      overlay.innerHTML =
        '<div class="cs-board__backdrop" data-board-close></div>' +
        '<div class="cs-board__toolbar">' +
        '<p class="cs-board__hint">Scroll to zoom · Drag to pan · Esc to close</p>' +
        '<div class="cs-board__actions">' +
        '<span class="cs-board__zoom" aria-live="polite">100%</span>' +
        '<button type="button" class="cs-board__btn" data-board-zoom-out aria-label="Zoom out">−</button>' +
        '<button type="button" class="cs-board__btn" data-board-zoom-in aria-label="Zoom in">+</button>' +
        '<button type="button" class="cs-board__btn" data-board-fit>Fit</button>' +
        '<button type="button" class="cs-board__btn cs-board__btn--close" data-board-close aria-label="Close">Close</button>' +
        "</div></div>" +
        '<div class="cs-board__stage" tabindex="0">' +
        '<img class="cs-board__image" alt="" draggable="false" />' +
        "</div>";

      document.body.appendChild(overlay);
      stage = overlay.querySelector(".cs-board__stage");
      boardImg = overlay.querySelector(".cs-board__image");
      zoomLabel = overlay.querySelector(".cs-board__zoom");

      overlay.querySelectorAll("[data-board-close]").forEach(function (el) {
        el.addEventListener("click", closeBoard);
      });
      overlay.querySelector("[data-board-zoom-in]").addEventListener("click", function () {
        zoomAt(stage.clientWidth / 2, stage.clientHeight / 2, 1.25);
      });
      overlay.querySelector("[data-board-zoom-out]").addEventListener("click", function () {
        zoomAt(stage.clientWidth / 2, stage.clientHeight / 2, 0.8);
      });
      overlay.querySelector("[data-board-fit]").addEventListener("click", fitImage);

      stage.addEventListener(
        "wheel",
        function (event) {
          event.preventDefault();
          const rect = stage.getBoundingClientRect();
          const factor = event.deltaY < 0 ? 1.1 : 0.9;
          zoomAt(event.clientX - rect.left, event.clientY - rect.top, factor);
        },
        { passive: false }
      );

      stage.addEventListener("pointerdown", onPointerDown);
      stage.addEventListener("pointermove", onPointerMove);
      stage.addEventListener("pointerup", onPointerUp);
      stage.addEventListener("pointercancel", onPointerUp);
      stage.addEventListener("dblclick", onDoubleClick);
      stage.addEventListener("dragstart", function (event) {
        event.preventDefault();
      });
    }

    function applyTransform() {
      boardImg.style.transform =
        "translate3d(" + tx + "px, " + ty + "px, 0) scale(" + scale + ")";
      if (zoomLabel) {
        zoomLabel.textContent = Math.round(scale * 100) + "%";
      }
      stage.classList.toggle("is-zoomed", scale > fitScale + 0.02);
    }

    function fitImage() {
      if (!boardImg.naturalWidth || !stage) return;
      const pad = 48;
      const availW = Math.max(stage.clientWidth - pad, 80);
      const availH = Math.max(stage.clientHeight - pad, 80);
      fitScale = Math.min(availW / boardImg.naturalWidth, availH / boardImg.naturalHeight, 1);
      scale = fitScale;
      tx = (stage.clientWidth - boardImg.naturalWidth * scale) / 2;
      ty = (stage.clientHeight - boardImg.naturalHeight * scale) / 2;
      applyTransform();
    }

    function zoomAt(cx, cy, factor) {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor));
      if (next === scale) return;
      const wx = (cx - tx) / scale;
      const wy = (cy - ty) / scale;
      scale = next;
      tx = cx - wx * scale;
      ty = cy - wy * scale;
      applyTransform();
    }

    function onPointerDown(event) {
      if (event.button !== undefined && event.button !== 0) return;
      stage.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      moved = false;

      if (pointers.size === 2) {
        const pts = Array.from(pointers.values());
        pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        pinchStartScale = scale;
        dragging = false;
        return;
      }

      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      originTx = tx;
      originTy = ty;
      stage.classList.add("is-dragging");
    }

    function onPointerMove(event) {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size === 2) {
        const pts = Array.from(pointers.values());
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (pinchStartDist > 0) {
          const rect = stage.getBoundingClientRect();
          const midX = (pts[0].x + pts[1].x) / 2 - rect.left;
          const midY = (pts[0].y + pts[1].y) / 2 - rect.top;
          const next = Math.min(
            MAX_SCALE,
            Math.max(MIN_SCALE, pinchStartScale * (dist / pinchStartDist))
          );
          const wx = (midX - tx) / scale;
          const wy = (midY - ty) / scale;
          scale = next;
          tx = midX - wx * scale;
          ty = midY - wy * scale;
          applyTransform();
        }
        return;
      }

      if (!dragging) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
      tx = originTx + dx;
      ty = originTy + dy;
      applyTransform();
    }

    function onPointerUp(event) {
      pointers.delete(event.pointerId);
      if (pointers.size < 2) {
        pinchStartDist = 0;
      }
      if (pointers.size === 0) {
        dragging = false;
        stage.classList.remove("is-dragging");
      }
    }

    function onDoubleClick(event) {
      const rect = stage.getBoundingClientRect();
      if (scale > fitScale * 1.05) {
        fitImage();
      } else {
        zoomAt(event.clientX - rect.left, event.clientY - rect.top, 2.2 / Math.max(scale, 0.01));
      }
    }

    function onKeydown(event) {
      if (!overlay || overlay.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeBoard();
      }
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomAt(stage.clientWidth / 2, stage.clientHeight / 2, 1.25);
      }
      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        zoomAt(stage.clientWidth / 2, stage.clientHeight / 2, 0.8);
      }
      if (event.key === "0") {
        event.preventDefault();
        fitImage();
      }
    }

    function openBoard(src, alt) {
      ensureOverlay();
      lastFocus = document.activeElement;
      boardImg.onload = function () {
        fitImage();
      };
      boardImg.src = src;
      boardImg.alt = alt || "Expanded case study image";
      if (boardImg.complete && boardImg.naturalWidth) {
        fitImage();
      }
      overlay.hidden = false;
      document.body.classList.add("cs-board-open");
      document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
        carousel.dataset.boardOpen = "true";
      });
      stage.focus({ preventScroll: true });
      document.addEventListener("keydown", onKeydown);
      window.addEventListener("resize", fitImage);
    }

    function closeBoard() {
      if (!overlay || overlay.hidden) return;
      overlay.hidden = true;
      document.body.classList.remove("cs-board-open");
      document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
        delete carousel.dataset.boardOpen;
      });
      document.removeEventListener("keydown", onKeydown);
      window.removeEventListener("resize", fitImage);
      pointers.clear();
      dragging = false;
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus({ preventScroll: true });
      }
    }

    function bindImage(img) {
      if (!img || img.dataset.boardBound === "true") return;
      if (img.closest("a[href]") || img.closest("video")) return;

      img.dataset.boardBound = "true";
      img.classList.add("cs-zoomable");
      img.setAttribute("role", "button");
      img.setAttribute("tabindex", "0");
      img.setAttribute(
        "aria-label",
        (img.alt ? img.alt + ". " : "") + "Open image board to zoom and pan"
      );

      const wrap = img.closest(".cs-shot, .cs-hero-figure");
      if (wrap) wrap.classList.add("cs-zoomable-wrap");

      function activate(event) {
        if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.stopPropagation();
        openBoard(img.currentSrc || img.src, img.alt);
      }

      img.addEventListener("click", activate);
      img.addEventListener("keydown", activate);
    }

    document
      .querySelectorAll(".cs-shot img, .cs-hero-figure img, .cs-hero-img")
      .forEach(bindImage);
  }

  document.querySelectorAll("[data-carousel]").forEach(initCarousel);
  initImageBoard();
})();
