(function () {
  "use strict";

  function getProductById(id) {
    var list = window.JKPG_PRODUCTS || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function getCategoryBySlug(slug) {
    var list = window.JKPG_CATEGORIES || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].slug === slug) return list[i];
    }
    return null;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showNotFound() {
    var main = document.getElementById("category-main");
    var nf = document.getElementById("category-not-found");
    if (main) main.hidden = true;
    if (nf) nf.hidden = false;
    document.title = "Category not found — JKPG Studio";
  }

  function renderProductCard(product) {
    var title = escapeHtml(product.title);
    var img = escapeHtml(product.image);
    var alt = escapeHtml(product.imageAlt || product.title);
    var id = escapeHtml(product.id);
    return (
      '<figure class="product-card" role="listitem">' +
      '<a class="product-card__link" href="product.html?id=' +
      id +
      '">' +
      '<div class="product-card__frame product-card__frame--print">' +
      '<img src="' +
      img +
      '" width="600" height="800" alt="' +
      alt +
      '" loading="lazy" />' +
      '<div class="product-card__overlay" aria-hidden="true">' +
      '<span class="product-card__buy">' +
      '<span class="product-card__buy-text">BUY</span>' +
      '<i data-feather="arrow-up-right" aria-hidden="true"></i>' +
      "</span>" +
      "</div>" +
      "</div>" +
      '<figcaption class="product-card__caption">' +
      title +
      "</figcaption>" +
      "</a>" +
      "</figure>"
    );
  }

  function init() {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get("category");
    if (!slug && window.JKPG_CATEGORIES && window.JKPG_CATEGORIES.length) {
      slug = window.JKPG_CATEGORIES[0].slug;
    }

    var category = slug ? getCategoryBySlug(slug) : null;
    if (!category) {
      showNotFound();
      if (typeof feather !== "undefined") feather.replace();
      return;
    }

    document.title = category.heroTitle + " — JKPG Studio";

    var heroTitle = document.getElementById("category-hero-title");
    var subtitle = document.getElementById("category-subtitle");
    if (heroTitle) heroTitle.textContent = category.heroTitle;
    if (subtitle) subtitle.textContent = category.subtitle;

    var grid = document.getElementById("category-product-grid");
    if (!grid) return;

    var html = "";
    for (var j = 0; j < category.productIds.length; j++) {
      var p = getProductById(category.productIds[j]);
      if (p) html += renderProductCard(p);
    }
    grid.innerHTML = html;
    grid.setAttribute("aria-label", category.heroTitle + " products");

    if (typeof feather !== "undefined") feather.replace();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
