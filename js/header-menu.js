(function () {
  "use strict";

  var COMPACT_MQ = "(max-width: 47.99rem)";

  function init() {
    var header = document.querySelector(".site-header");
    var toggle = document.getElementById("site-header-toggle");
    var closeBtn = document.getElementById("site-header-close");
    var panel = document.getElementById("site-header-panel");
    var backdrop = document.getElementById("site-header-backdrop");
    if (!header || !toggle || !panel) return;

    var compactQuery = window.matchMedia(COMPACT_MQ);
    var label = toggle.querySelector(".visually-hidden");

    panel.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");

    function replaceFeatherIcons() {
      if (typeof feather !== "undefined") {
        feather.replace({ width: "1.25em", height: "1.25em" });
      }
    }

    replaceFeatherIcons();

    function isCompact() {
      return compactQuery.matches;
    }

    function syncCompactMode() {
      var compact = isCompact();
      header.classList.toggle("site-header--compact", compact);
      if (!compact) {
        setOpen(false);
      }
    }

    function setOpen(open) {
      if (open && !isCompact()) {
        open = false;
      }

      header.classList.toggle("site-header--nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      panel.setAttribute("aria-hidden", open ? "false" : "true");
      if (label) {
        label.textContent = "Open menu";
      }
      document.body.classList.toggle("site-header-nav-open", open);
      document.body.style.overflow = open ? "hidden" : "";

      if (open) {
        replaceFeatherIcons();
      }
    }

    toggle.addEventListener("click", function () {
      if (!isCompact()) return;
      if (!header.classList.contains("site-header--nav-open")) {
        setOpen(true);
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        setOpen(false);
      });
    }

    if (backdrop) {
      backdrop.addEventListener("click", function () {
        setOpen(false);
      });
    }

    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });

    if (typeof compactQuery.addEventListener === "function") {
      compactQuery.addEventListener("change", syncCompactMode);
    } else if (typeof compactQuery.addListener === "function") {
      compactQuery.addListener(syncCompactMode);
    }

    window.addEventListener("resize", syncCompactMode);
    syncCompactMode();

    function updateScrolled() {
      header.classList.toggle("site-header--scrolled", window.scrollY > 0);
    }

    window.addEventListener("scroll", updateScrolled, { passive: true });
    updateScrolled();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
