/* =========================================================================
   Biscuit Bliss — interactions
   No dependencies. Everything degrades gracefully without JS.
   ========================================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

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
    var desktop = window.matchMedia("(min-width: 920px)");

    var setMenu = function (open) {
      menu.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      // Stop the page scrolling behind the open overlay.
      document.body.style.overflow = open ? "hidden" : "";
    };

    toggle.addEventListener("click", function () {
      setMenu(!menu.classList.contains("open"));
    });

    // Any link tap closes it.
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });

    // Escape closes it, and focus goes back to the button that opened it.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        setMenu(false);
        toggle.focus();
      }
    });

    // Tapping the page outside the overlay closes it.
    document.addEventListener("click", function (e) {
      if (!menu.classList.contains("open")) return;
      if (menu.contains(e.target) || toggle.contains(e.target)) return;
      setMenu(false);
    });

    // Rotating to landscape past the breakpoint must not leave the body locked.
    var onBreakpoint = function (e) { if (e.matches) setMenu(false); };
    if (desktop.addEventListener) desktop.addEventListener("change", onBreakpoint);
    else if (desktop.addListener) desktop.addListener(onBreakpoint);
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

  /* --------------------------------------------------------- card tilt */
  // Cursor-tracked tilt + spotlight glare on the flavour cards. Desktop only.
  if (finePointer && !reduced) {
    document.querySelectorAll(".flavour").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rotY = (px - 0.5) * 9;
        var rotX = (0.5 - py) * 9;
        card.style.setProperty("--mx", (px * 100) + "%");
        card.style.setProperty("--my", (py * 100) + "%");
        card.style.transform =
          "translateY(-8px) rotateX(" + rotX.toFixed(2) + "deg) rotateY(" + rotY.toFixed(2) + "deg)";
      });
      card.addEventListener("pointerleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* -------------------------------------------------------------- count-up */
  var statNums = document.querySelectorAll(".stat b");
  if (statNums.length && !reduced && "IntersectionObserver" in window) {
    var animateCount = function (el) {
      var match = el.textContent.trim().match(/^([\d.]+)(.*)$/);
      if (!match) return;
      var end = parseFloat(match[1]);
      var suffix = match[2] || "";
      var whole = end % 1 === 0;
      var start = null;
      var dur = 1100;
      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = end * eased;
        el.textContent = (whole ? Math.round(val) : val.toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      el.textContent = "0" + suffix;
      requestAnimationFrame(step);
    };

    var statIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    statNums.forEach(function (el) { statIo.observe(el); });
  }

  /* ------------------------------------------------------- magnetic + spark */
  function spark(x, y) {
    if (reduced) return;
    var n = 8;
    for (var i = 0; i < n; i++) {
      var angle = (Math.PI * 2 * i) / n;
      var dist = 32 + Math.random() * 18;
      var dot = document.createElement("span");
      dot.className = "spark-dot";
      dot.style.left = x + "px";
      dot.style.top = y + "px";
      dot.style.setProperty("--dx", (Math.cos(angle) * dist).toFixed(1) + "px");
      dot.style.setProperty("--dy", (Math.sin(angle) * dist).toFixed(1) + "px");
      document.body.appendChild(dot);
      dot.addEventListener("animationend", function () { this.remove(); });
    }
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".btn--pink");
    if (btn) spark(e.clientX, e.clientY);
  });

  if (finePointer && !reduced) {
    document.querySelectorAll(".btn--pink, .btn--ink").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        if (btn.disabled) return;
        var rect = btn.getBoundingClientRect();
        var dx = (e.clientX - rect.left - rect.width / 2) * 0.28;
        var dy = (e.clientY - rect.top - rect.height / 2) * 0.28;
        var max = 9;
        dx = Math.max(-max, Math.min(max, dx));
        dy = Math.max(-max, Math.min(max, dy));
        btn.style.transform = "translate(" + dx.toFixed(1) + "px," + (dy - 3).toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ----------------------------------------------------------------- misc */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
