/* HALLSTEAD LANES — fictional demo. DEMO — ThinkFirst Studios · [Your name here]
   Motion character: a mark is written into a frame. Single pass, drawn once, never flashed.
   The only count-up is the season estimate (320ms), labelled [ESTIMATE — BASED ON PLACEHOLDER PRICING].
   Under prefers-reduced-motion everything renders final, in place. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) root.classList.add("js-motion");
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Today's row, and the status strip's two authored states (league nights are DEMO DATA: Mon–Thu)
  var today = new Date().getDay();
  document.querySelectorAll('tr[data-day="' + today + '"]').forEach(function (tr) { tr.classList.add("is-today"); });
  var league = today >= 1 && today <= 4;
  document.querySelectorAll('[data-st="league"]').forEach(function (el) { el.hidden = !league; });
  document.querySelectorAll('[data-st="open"]').forEach(function (el) { el.hidden = league; });

  // Menu
  var head = document.querySelector("[data-head]"), btn = document.querySelector(".menu-btn"), nav = document.getElementById("site-nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      nav.style.setProperty("--nav-top", head.getBoundingClientRect().bottom + "px");
      var o = nav.classList.toggle("is-open"); btn.setAttribute("aria-expanded", o ? "true" : "false"); btn.textContent = o ? "Close" : "Menu";
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { btn.click(); btn.focus(); } });
  }
  function onScroll() { if (head) head.classList.toggle("is-condensed", window.scrollY > 80); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Reveals: frames fill left to right, marks draw once
  if (root.classList.contains("js-motion")) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });
  }

  // Season running total: weekly fee × weeks × bowlers (placeholder inputs)
  var FEE = 18;
  function money(n) { return "$[" + n.toFixed(2) + "]"; }
  document.querySelectorAll("[data-season]").forEach(function (f) {
    var b = f.querySelector("[data-sb]"), w = f.querySelector("[data-sw]"), out = f.querySelector("[data-out]"), last = null;
    function run() {
      var nb = +b.value, nw = +w.value, total = FEE * nw * nb;
      f.querySelector("[data-r1]").textContent = money(FEE);
      f.querySelector("[data-r2]").textContent = money(FEE * nw);
      f.querySelector("[data-r3]").textContent = money(total);
      f.querySelector("[data-w-l]").textContent = "× [" + nw + "] WEEKS";
      f.querySelector("[data-b-l]").textContent = "× [" + nb + "] BOWLER" + (nb > 1 ? "S" : "");
      var from = last === null ? total : last; last = total;
      if (!root.classList.contains("js-motion") || from === total) { out.textContent = money(total); return; }
      var st = null;
      (function step(ts) { if (!st) st = ts; var p = Math.min(1, (ts - st) / 320), e = 1 - Math.pow(1 - p, 3); out.textContent = money(from + (total - from) * e); if (p < 1) requestAnimationFrame(step); })(performance.now());
    }
    b.addEventListener("change", run); w.addEventListener("change", run); run();
  });

  // Three-path sign-up tabs
  document.querySelectorAll("[data-tabs]").forEach(function (box) {
    var tabs = box.querySelectorAll('[role="tab"]');
    function sel(t, focus) {
      tabs.forEach(function (x) { var on = x === t; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute("aria-controls")).hidden = !on; });
      if (focus) t.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { sel(t); });
      t.addEventListener("keydown", function (e) {
        var k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (k) { e.preventDefault(); sel(tabs[(i + k + tabs.length) % tabs.length], true); }
      });
    });
    var h = location.hash.replace("#", "");
    if (h && document.getElementById(h) && document.getElementById(h).getAttribute("role") === "tab") sel(document.getElementById(h));
    var lg = new URLSearchParams(location.search).get("league");
    if (lg) box.querySelectorAll("[data-league]").forEach(function (s) { s.value = lg; });
  });

  // Mock forms: validate, then say plainly that nothing was sent
  document.querySelectorAll("form[data-mock]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (fl) {
        var id = fl.id + "-err", err = document.getElementById(id);
        var bad = !String(fl.value).trim() || (fl.type === "email" && !/^\S+@\S+\.\S+$/.test(fl.value));
        fl.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad) { ok = false; if (!err) { err = document.createElement("p"); err.className = "err"; err.id = id; err.textContent = fl.type === "email" ? "Enter a valid email address." : "Please fill this in."; fl.insertAdjacentElement("afterend", err); fl.setAttribute("aria-describedby", id); } }
        else if (err) { err.remove(); fl.removeAttribute("aria-describedby"); }
      });
      if (!ok) { var first = form.querySelector('[aria-invalid="true"]'); if (first) first.focus(); return; }
      var s = form.querySelector(".form-status"); s.hidden = false;
      s.textContent = "Demo only. Nothing was registered, sent or charged. [LEAGUE REGISTRATION SYSTEM — CONFIRM]"; s.focus();
    });
  });
})();
