(function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const works = window.ART_WORKS || {};
  const order = window.ART_WORK_ORDER || Object.keys(works);
  const work = id && works[id];

  if (!work) {
    window.location.replace("art.html");
    return;
  }

  document.title = work.title + " - Dhatri Jayanth";

  const categoryEl = document.getElementById("art-category");
  const titleEl = document.getElementById("art-title");
  const heroEl = document.getElementById("art-hero");
  const metaEl = document.getElementById("art-meta");
  const headlineEl = document.getElementById("art-headline");
  const bodyEl = document.getElementById("art-body");
  const gallerySection = document.getElementById("art-gallery-section");
  const galleryEl = document.getElementById("art-gallery");
  const pagerEl = document.getElementById("art-pager");

  categoryEl.textContent = work.category;
  titleEl.textContent = work.title;
  heroEl.src = work.hero;
  heroEl.alt = work.title;

  metaEl.innerHTML =
    '<div><dt>Category</dt><dd>' +
    escapeHtml(work.category) +
    "</dd></div>" +
    "<div><dt>Year</dt><dd>" +
    escapeHtml(work.year) +
    "</dd></div>" +
    "<div><dt>Medium</dt><dd>" +
    escapeHtml(work.medium) +
    "</dd></div>";

  headlineEl.textContent = work.headline;
  bodyEl.innerHTML = (work.body || [])
    .map(function (p) {
      return "<p>" + escapeHtml(p) + "</p>";
    })
    .join("");

  const images = work.images || [];
  if (images.length > 1) {
    gallerySection.hidden = false;
    galleryEl.innerHTML = images
      .map(function (img) {
        return (
          '<figure class="product-gallery__item" role="listitem">' +
          '<img src="' +
          escapeAttr(img.src) +
          '" alt="' +
          escapeAttr(img.alt || work.title) +
          '" width="1200" height="1200" loading="lazy" />' +
          "</figure>"
        );
      })
      .join("");
  }

  const index = order.indexOf(id);
  const prevId = index > 0 ? order[index - 1] : null;
  const nextId = index >= 0 && index < order.length - 1 ? order[index + 1] : null;
  let pagerHtml = "";
  if (prevId && works[prevId]) {
    pagerHtml +=
      '<a class="art-detail__pager-link" href="art-work.html?id=' +
      encodeURIComponent(prevId) +
      '"><span class="art-detail__pager-dir">Previous</span><span class="art-detail__pager-title">' +
      escapeHtml(works[prevId].title) +
      "</span></a>";
  } else {
    pagerHtml += "<span></span>";
  }
  if (nextId && works[nextId]) {
    pagerHtml +=
      '<a class="art-detail__pager-link art-detail__pager-link--next" href="art-work.html?id=' +
      encodeURIComponent(nextId) +
      '"><span class="art-detail__pager-dir">Next</span><span class="art-detail__pager-title">' +
      escapeHtml(works[nextId].title) +
      "</span></a>";
  }
  pagerEl.innerHTML = pagerHtml;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, "&#39;");
  }
})();
