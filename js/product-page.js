(function () {
  "use strict";

  function getProductById(id) {
    var list = window.JKPG_PRODUCTS || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function formatPriceLine(product, qty) {
    var total = product.unitPriceSek * qty;
    if (qty <= 1) {
      return total + " SEK (1)";
    }
    return total + " SEK (" + product.unitPriceSek + " SEK × " + qty + ")";
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function showNotFound() {
    var article = document.getElementById("product-article");
    var nf = document.getElementById("product-not-found");
    if (article) article.hidden = true;
    if (nf) nf.hidden = false;
    document.title = "Product not found — JKPG Studio";
  }

  function initQty(product) {
    var qty = 1;
    var qtyEl = document.getElementById("product-qty");
    var priceEl = document.getElementById("product-price");
    var minus = document.getElementById("product-qty-minus");
    var plus = document.getElementById("product-qty-plus");

    function renderQty() {
      if (qtyEl) qtyEl.textContent = String(qty);
      if (priceEl) priceEl.textContent = formatPriceLine(product, qty);
    }

    function bump(delta) {
      qty = Math.max(1, Math.min(99, qty + delta));
      renderQty();
    }

    if (minus) minus.addEventListener("click", function () { bump(-1); });
    if (plus) plus.addEventListener("click", function () { bump(1); });
    renderQty();
  }

  function init() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    if (!id && window.JKPG_PRODUCTS && window.JKPG_PRODUCTS.length) {
      id = window.JKPG_PRODUCTS[0].id;
    }

    var product = id ? getProductById(id) : null;
    if (!product) {
      showNotFound();
      if (typeof feather !== "undefined") feather.replace();
      return;
    }

    document.title = product.title + " — JKPG Studio";

    setText("product-title", product.title);
    var img = document.getElementById("product-image");
    if (img) {
      img.src = product.image;
      img.alt = product.imageAlt || product.title;
      img.width = 900;
      img.height = 1200;
    }

    setText("product-measurements-mm", product.measurements_mm);
    setText("product-measurements-cm", product.measurements_cm);
    setText("product-measurements-in", product.measurements_in);
    setText("product-description", product.description);

    initQty(product);

    var addBtn = document.getElementById("product-add-cart");
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        var qtyEl = document.getElementById("product-qty");
        var qty = qtyEl ? parseInt(qtyEl.textContent, 10) : 1;
        if (isNaN(qty) || qty < 1) qty = 1;
        if (window.jkpgCartAdd) window.jkpgCartAdd(product.id, qty);
      });
    }

    if (typeof feather !== "undefined") feather.replace();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
