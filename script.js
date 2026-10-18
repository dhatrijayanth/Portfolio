(function () {
  const body = document.body;
  const toggle = document.querySelector(".nav-toggle");
  const backdrop = document.querySelector(".nav-backdrop");

  function closeNav() {
    body.classList.remove("nav-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  function openNav() {
    body.classList.add("nav-open");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      if (body.classList.contains("nav-open")) {
        closeNav();
      } else {
        openNav();
      }
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", closeNav);
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeNav();
  });

  document.querySelectorAll(".nav a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = (contactForm.querySelector("#name") || {}).value || "";
      const email = (contactForm.querySelector("#email") || {}).value || "";
      const message = (contactForm.querySelector("#message") || {}).value || "";
      const subject = encodeURIComponent("Portfolio inquiry from " + name);
      const body = encodeURIComponent(
        "Name: " + name + "\nEmail: " + email + "\n\n" + message
      );
      window.location.href =
        "mailto:dhatri07.jayanth@gmail.com?subject=" + subject + "&body=" + body;
    });
  }

  /* Hero tree: hover lean + click to pluck a leaf */
  const leavesLayer = document.querySelector(".hero-leaves");
  if (leavesLayer) {
    const leaves = Array.prototype.slice.call(
      leavesLayer.querySelectorAll(".leaf")
    );
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    leaves.forEach(function (leaf, index) {
      leaf.setAttribute("tabindex", "0");
      leaf.setAttribute("role", "button");
      leaf.setAttribute("aria-label", "Pluck leaf " + (index + 1));

      function pluck() {
        if (
          leaf.classList.contains("is-falling") ||
          leaf.classList.contains("is-returning")
        ) {
          return;
        }
        const drift = (Math.random() * 80 - 40).toFixed(1) + "px";
        const spin = (100 + Math.random() * 100).toFixed(0) + "deg";
        leaf.style.setProperty("--fall-x", drift);
        leaf.style.setProperty("--fall-spin", spin);
        leaf.classList.remove("is-back", "is-returning");
        leaf.classList.add("is-falling");

        var finished = false;
        function growBack() {
          if (finished) return;
          finished = true;
          leaf.classList.remove("is-falling");
          leaf.classList.add("is-returning");
          /* wait one frame so the bud start state paints, then grow */
          window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
              leaf.classList.add("is-back");
            });
          });
          window.setTimeout(function () {
            leaf.classList.remove("is-returning", "is-back");
            leaf.style.removeProperty("--fall-x");
            leaf.style.removeProperty("--fall-spin");
          }, 700);
        }

        if (reduceMotion) {
          window.setTimeout(growBack, 280);
          return;
        }

        leaf.addEventListener(
          "animationend",
          function (event) {
            if (event.animationName === "leaf-fall") growBack();
          },
          { once: true }
        );
        /* fallback if animationend does not fire */
        window.setTimeout(growBack, 1300);
      }

      leaf.addEventListener("click", pluck);
      leaf.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          pluck();
        }
      });
    });

    if (!reduceMotion) {
      var leanFrame = 0;
      leavesLayer.addEventListener("pointermove", function (event) {
        if (leanFrame) return;
        leanFrame = window.requestAnimationFrame(function () {
          leanFrame = 0;
          var rect = leavesLayer.getBoundingClientRect();
          var nx = (event.clientX - rect.left) / rect.width - 0.5;
          var ny = (event.clientY - rect.top) / rect.height - 0.5;
          leavesLayer.style.transform =
            "translate(" +
            (nx * 10).toFixed(1) +
            "px, " +
            (ny * 6).toFixed(1) +
            "px)";
        });
      });
      leavesLayer.addEventListener("pointerleave", function () {
        leavesLayer.style.transform = "";
      });
    }
  }
})();
