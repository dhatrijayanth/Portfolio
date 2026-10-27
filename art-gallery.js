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
    var src = coverSrc(work);
    var href = "art-work.html?id=" + encodeURIComponent(id);
    var labelId = id + "-heading";

    html +=
      '<article class="art-tile" role="listitem" aria-labelledby="' +
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
      '<a class="art-cell art-cell--cover" href="' +
      href +
      '" aria-label="' +
      escapeHtml(work.title) +
      (multi ? ", " + images.length + " images" : "") +
      '">' +
      '<div class="art-circle">' +
      '<img src="' +
      escapeHtml(src) +
      '" alt="" width="600" height="600" loading="' +
      (index < 6 ? "eager" : "lazy") +
      '" />' +
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
