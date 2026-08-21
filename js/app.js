/* =========================================================================
   Biscuit Bliss — interactions
   No dependencies. Everything degrades gracefully without JS.
   ========================================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- toast */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 4200);
  }

  /* ------------------------------------------------------------------ nav */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("menu");

  if (nav) {
    var onScroll = function () { nav.classList.toggle("is-stuck", window.scrollY > 24); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* --------------------------------------------------------------- reveal */
  var revealables = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || reduced) {
    revealables.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* -------------------------------------------------------------- marquee */
  // Duplicate the track so the -100% translate loops seamlessly.
  var track = document.querySelector(".marquee-track");
  if (track && !reduced) {
    var clone = track.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.parentNode.appendChild(clone);
  }

  /* ----------------------------------------------------------------- rail */
  var rail = document.getElementById("rail");
  if (rail) {
    var step = function () {
      var card = rail.querySelector(".flavour");
      if (!card) return rail.clientWidth * 0.8;
      var gap = parseFloat(getComputedStyle(rail).columnGap || "16");
      return card.getBoundingClientRect().width + gap;
    };

    document.querySelectorAll("[data-rail]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var dir = btn.dataset.rail === "next" ? 1 : -1;
        rail.scrollBy({ left: step() * dir, behavior: reduced ? "auto" : "smooth" });
      });
    });

    // Pointer drag-to-scroll (mouse/trackpad; touch already scrolls natively).
    var down = false, startX = 0, startScroll = 0, moved = 0;
    rail.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") return;
      down = true; moved = 0;
      startX = e.clientX;
      startScroll = rail.scrollLeft;
    });
    rail.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) {
        moved = Math.abs(dx);
        rail.classList.add("dragging");
        rail.setPointerCapture(e.pointerId);
      }
      rail.scrollLeft = startScroll - dx;
    });
    var endDrag = function () { down = false; rail.classList.remove("dragging"); };
    rail.addEventListener("pointerup", endDrag);
    rail.addEventListener("pointercancel", endDrag);
    rail.addEventListener("click", function (e) { if (moved > 6) e.preventDefault(); }, true);

    // Keyboard support for the focusable rail.
    rail.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); rail.scrollBy({ left: step(), behavior: "smooth" }); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); rail.scrollBy({ left: -step(), behavior: "smooth" }); }
    });
  }

  /* --------------------------------------------------------- tub builder */
  var VARIETIES = [
    "Coffee Pecan",
    "Pistachio Selection",
    "Mocha Biscuits",
    "Choc Chip Cookies",
    "Nieman Marcus",
    "Milk Chocolate Pecan",
    "Chocolate Biscotti",
    "Nougat Fusion",
    "Pastry Muska"
  ];
  var MAX = 4;

  var picker = document.getElementById("picker");
  var tubList = document.getElementById("tubList");
  var tubCount = document.getElementById("tubCount");
  var orderBtn = document.getElementById("orderBtn");
  var chosen = [];

  function renderTub() {
    tubList.innerHTML = "";
    if (!chosen.length) {
      var li = document.createElement("li");
      li.className = "empty";
      li.textContent = "Your selection appears here";
      tubList.appendChild(li);
    } else {
      chosen.forEach(function (name) {
        var li = document.createElement("li");
        li.textContent = name.toUpperCase();
        tubList.appendChild(li);
      });
    }
    tubCount.textContent = String(chosen.length);
    orderBtn.disabled = chosen.length === 0;
  }

  function toggleVariety(name, btn) {
    var i = chosen.indexOf(name);
    if (i > -1) {
      chosen.splice(i, 1);
      btn.setAttribute("aria-pressed", "false");
    } else {
      if (chosen.length >= MAX) {
        toast("A tub holds four varieties — remove one to swap it out.");
        return;
      }
      chosen.push(name);
      btn.setAttribute("aria-pressed", "true");
    }
    renderTub();
  }

  if (picker && tubList && tubCount && orderBtn) {
    VARIETIES.forEach(function (name) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.setAttribute("aria-pressed", "false");
      btn.innerHTML = '<span>' + name + '</span><span class="x" aria-hidden="true">&times;</span>';
      btn.addEventListener("click", function () { toggleVariety(name, btn); });
      picker.appendChild(btn);
    });
    renderTub();

    orderBtn.addEventListener("click", function () {
      var msg =
        "Hi Biscuit Bliss! I would like to order a tub with:\n" +
        chosen.map(function (n, i) { return (i + 1) + ". " + n; }).join("\n") +
        "\n\nCould you let me know the price and when it would be ready?";

      var open = function () {
        window.open("https://www.instagram.com/biscuitbliss/", "_blank", "noopener");
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(msg).then(function () {
          toast("Order copied — paste it into a DM to @biscuitbliss.");
          open();
        }).catch(function () {
          toast("Opening Instagram — tell us: " + chosen.join(", ") + ".");
          open();
        });
      } else {
        toast("Opening Instagram — tell us: " + chosen.join(", ") + ".");
        open();
      }
    });
  }

  /* ----------------------------------------------------------------- misc */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
