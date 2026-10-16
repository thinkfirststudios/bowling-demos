/* SEVENTH ARROW — fictional demo. DEMO — ThinkFirst Studios · [Your name here]
   Motion character: a ball travels the lane once. Lateral, single pass, nothing illuminates, nothing pulses.
   Count-up only on the derived reservation and corporate estimates (320ms), labelled [ESTIMATE — BASED ON PLACEHOLDER PRICING].
   Placeholder arithmetic: $[45] per lane per hour, [90] minute blocks, $[200] minimum per lane, [6] per lane, food $[25] per head. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) root.classList.add("js-motion");
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  var today = new Date().getDay();
  document.querySelectorAll('tr[data-day="' + today + '"]').forEach(function (tr) { tr.classList.add("is-today"); });

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

  if (root.classList.contains("js-motion")) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    document.querySelectorAll(".rv, .rv-x").forEach(function (el) { io.observe(el); });
  }

  function money(n) { return "$[" + (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, "") + "]"; }
  function tween(el, to) {
    var from = parseFloat(el.getAttribute("data-v")); el.setAttribute("data-v", to);
    if (isNaN(from) || from === to || !root.classList.contains("js-motion")) { el.textContent = money(to); return; }
    var st = null;
    (function step(ts) { if (!st) st = ts; var p = Math.min(1, (ts - st) / 320), e = 1 - Math.pow(1 - p, 3); el.textContent = money(from + (to - from) * e); if (p < 1) requestAnimationFrame(step); })(performance.now());
  }

  // Reservation: lanes × hours × rate, and the minimum across the lanes booked
  var RATE = 45, HOURS = 1.5, MIN = 200, CAP = 6;
  document.querySelectorAll("[data-reserve]").forEach(function (f) {
    var lanes = f.querySelector("[data-lanes]"), party = f.querySelector("[data-party]"), dots = f.querySelectorAll("[data-dots] span");
    function run() {
      var l = +lanes.value, p = Math.max(1, +party.value || 1), need = Math.ceil(p / CAP);
      tween(f.querySelector("[data-hire]"), l * HOURS * RATE);
      tween(f.querySelector("[data-min]"), l * MIN);
      f.querySelector("[data-recon-t]").textContent = need === l ? (l + " lane" + (l > 1 ? "s" : "") + " for " + p + " people — that fits")
        : need > l ? (p + " people need " + need + " lanes at [6] per lane — add a lane") : (l + " lanes for " + p + " people — more lanes than you need");
      var filled = 0;
      f.querySelectorAll("[data-track]").forEach(function (t) { if (String(t.value).trim()) filled++; });
      if (f.querySelector("[data-block]:checked")) filled++;
      dots.forEach(function (d, k) { d.classList.toggle("on", k < Math.min(5, filled)); });
    }
    f.addEventListener("input", run); f.addEventListener("change", run); run();
  });

  // Corporate quote
  document.querySelectorAll("[data-corp]").forEach(function (f) {
    var n = f.querySelector("[data-qn]"), h = f.querySelector("[data-qh]");
    function run() { var people = Math.max(1, +n.value || 1); tween(f.querySelector("[data-quote]"), Math.ceil(people / CAP) * (+h.value) * RATE + people * 25); }
    f.addEventListener("input", run); f.addEventListener("change", run); run();
  });

  // Mock forms
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
      var dots = form.querySelectorAll("[data-dots] span"); dots.forEach(function (d) { d.classList.add("on"); });
      var s = form.querySelector(".form-status"); s.hidden = false;
      s.textContent = "Demo only. Nothing was reserved, sent or charged. [BOOKING SYSTEM — CONFIRM]"; s.focus();
    });
  });
})();
