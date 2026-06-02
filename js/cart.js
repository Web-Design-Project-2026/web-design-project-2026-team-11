(function () {
  "use strict";

  var STORAGE_KEY = "jkpg_cart";

  function readCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  //updates the cart count label in header- copied from another code, change names of words
  // Updates the cart count label in header
  function updateCartCount() {
    var countEl = document.getElementById("cart-count");
    if (countEl) {
      var items = readCart(); // Grabs the current items array
      var totalItems = items.reduce(function (sum, item) {
        return sum + (item.qty || 0); // Adds up the quantities
      }, 0);
      countEl.textContent = totalItems;
    }
  }

  function writeCart(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function findLineIndex(items, id) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) return i;
    }
    return -1;
  }

  function getProduct(id) {
    var list = window.JKPG_PRODUCTS || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  window.jkpgCartAdd = function (id, qty) {
    qty = Math.max(1, Math.min(99, parseInt(qty, 10) || 1));
    var items = readCart();
    var i = findLineIndex(items, id);
    if (i >= 0) items[i].qty = Math.min(99, items[i].qty + qty);
    else items.push({ id: id, qty: qty });
    writeCart(items);
    updateCartCount();
  };

  window.jkpgCartSetQty = function (id, qty) {
    var items = readCart();
    var i = findLineIndex(items, id);
    var n = parseInt(qty, 10);
    if (isNaN(n) || n < 1) {
      if (i >= 0) items.splice(i, 1);
    } else {
      n = Math.min(99, n);
      if (i >= 0) items[i].qty = n;
      else items.push({ id: id, qty: n });
    }
    writeCart(items);
    updateCartCount();
  };

  window.jkpgCartRead = readCart;

  function formatLinePrice(unit, qty) {
    var total = unit * qty;
    if (qty <= 1) return "Price: " + total + " SEK";
    return "Price: " + total + " SEK (" + unit + " SEK × " + qty + ")";
  }

  function renderCartPage() {
    var listEl = document.getElementById("cart-lines-list");
    if (!listEl) return;

    var emptyEl = document.getElementById("cart-empty");
    var checkoutEl = document.getElementById("cart-checkout-section");
    var items = readCart();
    var valid = [];
    for (var x = 0; x < items.length; x++) {
      if (getProduct(items[x].id)) valid.push(items[x]);
    }
    if (valid.length !== items.length) writeCart(valid);
    items = valid;

    listEl.innerHTML = "";
    var subtotal = 0;

    for (var j = 0; j < items.length; j++) {
      var line = items[j];
      var product = getProduct(line.id);
      if (!product) continue;
      subtotal += product.unitPriceSek * line.qty;

      var li = document.createElement("li");
      li.className = "cart-line";
      li.setAttribute("data-product-id", line.id);

      var thumb = document.createElement("figure");
      thumb.className = "cart-line__thumb";
      var img = document.createElement("img");
      img.src = product.image;
      img.alt = product.imageAlt || product.title;
      img.width = 300;
      img.height = 400;
      img.loading = "lazy";
      thumb.appendChild(img);

      var meta = document.createElement("div");
      meta.className = "cart-line__meta";

      var titleP = document.createElement("p");
      titleP.className = "cart-line__title";
      var link = document.createElement("a");
      link.href = "product.html?id=" + encodeURIComponent(line.id);
      link.textContent = product.title;
      titleP.appendChild(link);

      var qtyWrap = document.createElement("div");
      qtyWrap.className = "cart-line__qty";
      var amountSpan = document.createElement("span");
      amountSpan.className = "cart-line__amount";
      amountSpan.textContent = "Amount: " + line.qty;

      var stepper = document.createElement("div");
      stepper.className = "qty-stepper";
      stepper.setAttribute("role", "group");
      stepper.setAttribute("aria-label", "Quantity for " + product.title);

      var btnMinus = document.createElement("button");
      btnMinus.type = "button";
      btnMinus.setAttribute("aria-label", "Decrease quantity");
      btnMinus.innerHTML = '<i data-feather="minus" aria-hidden="true"></i>';
      btnMinus.addEventListener(
        "click",
        (function (idRef) {
          return function () {
            var cur = readCart();
            var idx = findLineIndex(cur, idRef);
            if (idx < 0) return;
            var q = cur[idx].qty - 1;
            window.jkpgCartSetQty(idRef, q);
            renderCartPage();
          };
        })(line.id),
      );

      var btnPlus = document.createElement("button");
      btnPlus.type = "button";
      btnPlus.setAttribute("aria-label", "Increase quantity");
      btnPlus.innerHTML = '<i data-feather="plus" aria-hidden="true"></i>';
      btnPlus.addEventListener(
        "click",
        (function (idRef) {
          return function () {
            var cur = readCart();
            var idx = findLineIndex(cur, idRef);
            var q = idx >= 0 ? cur[idx].qty + 1 : 1;
            window.jkpgCartSetQty(idRef, q);
            renderCartPage();
          };
        })(line.id),
      );

      stepper.appendChild(btnMinus);
      stepper.appendChild(btnPlus);
      qtyWrap.appendChild(amountSpan);
      qtyWrap.appendChild(stepper);

      var priceP = document.createElement("p");
      priceP.className = "cart-line__price";
      priceP.textContent = formatLinePrice(product.unitPriceSek, line.qty);

      meta.appendChild(titleP);
      meta.appendChild(qtyWrap);
      meta.appendChild(priceP);

      li.appendChild(thumb);
      li.appendChild(meta);
      listEl.appendChild(li);
    }

    if (emptyEl) emptyEl.hidden = items.length > 0;
    if (checkoutEl) checkoutEl.hidden = items.length === 0;

    var totalEl = document.getElementById("cart-summary-total");
    if (totalEl) totalEl.textContent = subtotal.toFixed(2) + " SEK";

    var finalEl = document.getElementById("cart-summary-final");
    if (finalEl) finalEl.textContent = subtotal + " SEK";

    var linesUl = document.getElementById("cart-summary-lines");
    if (linesUl) {
      linesUl.innerHTML = "";
      for (var k = 0; k < items.length; k++) {
        var p = getProduct(items[k].id);
        if (!p) continue;
        var row = document.createElement("li");
        var name = document.createElement("span");
        name.textContent = p.title;
        var price = document.createElement("span");
        price.textContent = p.unitPriceSek * items[k].qty + " SEK";
        row.appendChild(name);
        row.appendChild(price);
        linesUl.appendChild(row);
      }
      var disc = document.createElement("li");
      var d1 = document.createElement("span");
      d1.textContent = "Discounts & Offers";
      var d2 = document.createElement("span");
      d2.textContent = "0.00 SEK";
      disc.appendChild(d1);
      disc.appendChild(d2);
      linesUl.appendChild(disc);
    }

    if (typeof feather !== "undefined") feather.replace();
  }

  //NEW CODE, REPLACES THE OLD ONE
  function initializeCart() {
    updateCartCount(); // Runs on every page to keep header correct
    if (document.getElementById("cart-lines-list")) {
      renderCartPage(); // Only builds the full list if we are on the cart page
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeCart);
  } else {
    initializeCart();
  }

  //OLD CODE BELOW, KEPT FOR REFERENCE, DELETE LATER
  // if (document.getElementById("cart-lines-list")) {
  //   if (document.readyState === "loading") {
  //     document.addEventListener("DOMContentLoaded", renderCartPage);
  //   } else {
  //     renderCartPage();
  //   }
  // }
})();
