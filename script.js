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
        "mailto:dj24997@utexas.edu?subject=" + subject + "&body=" + body;
    });
  }
})();
