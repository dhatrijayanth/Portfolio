(function () {
  var works = window.ART_WORKS || {};
  var order = window.ART_WORK_ORDER || Object.keys(works);
  var root = document.getElementById("art-gallery");
  if (!root) return;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function coverSrc(work) {
    return work.hero || (work.images && work.images[0] && work.images[0].src) || "";
  }

  var html =
    '<div class="art-grid art-grid--gallery art-grid--projects" role="list">';

  order.forEach(function (id, index) {
    var work = works[id];
    if (!work) return;
    var images = work.images || [];
    var multi = images.length > 1;
    var href = "art-work.html?id=" + encodeURIComponent(id);
    var labelId = id + "-heading";
    var loading = index < 4 ? "eager" : "lazy";
    // Show up to 2 images in the gallery tile so related pieces read as one project
    var pair = multi
      ? images.slice(0, 2)
      : [{ src: coverSrc(work), alt: work.title }];

    html +=
      '<article class="art-tile' +
      (multi ? " art-tile--pair" : "") +
      '" role="listitem" aria-labelledby="' +
      escapeHtml(labelId) +
      '">' +
      '<h2 id="' +
      escapeHtml(labelId) +
      '" class="art-tile__title">' +
      '<a class="art-tile__title-link" href="' +
      href +
      '">' +
      escapeHtml(work.title) +
      "</a>" +
      "</h2>" +
      '<a class="art-tile__link" href="' +
      href +
      '" aria-label="' +
      escapeHtml(work.title) +
      (multi ? ", " + images.length + " images in this project" : "") +
      '">' +
      '<div class="art-tile__frames' +
      (multi ? " art-tile__frames--pair" : "") +
      '">';

    pair.forEach(function (img, imgIndex) {
      html +=
        '<div class="art-circle">' +
        '<img src="' +
        escapeHtml(img.src) +
        '" alt="' +
        escapeHtml(img.alt || work.title) +
        '" width="600" height="600" loading="' +
        (imgIndex === 0 ? loading : "lazy") +
        '" />' +
        "</div>";
    });

    html +=
      "</div>" +
      (multi
        ? '<span class="art-cover-badge" aria-hidden="true">' +
          images.length +
          " images</span>"
        : "") +
      "</a>" +
      "</article>";
  });

  html += "</div>";
  root.innerHTML = html;
})();
