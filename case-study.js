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
        touchStartX = event.changedTouches[0].screenX;
      },
      { passive: true }
    );
    root.addEventListener(
      "touchend",
      function (event) {
        if (touchStartX === null) return;
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

  document.querySelectorAll("[data-carousel]").forEach(initCarousel);
})();
