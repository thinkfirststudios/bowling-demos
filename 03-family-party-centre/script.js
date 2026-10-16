/* PINFALL PARK — fictional demo. DEMO — ThinkFirst Studios · [Your name here]
   Motion character: a rack drops and settles — apex down, row by row, once. Nothing bounces, glows, cycles or falls over.
   The header rack minimap fills the current pin instantly. Booking steps cross-fade; the minimap advances one position per step.
   Count-up only on the party estimate (headcount × per head, 320ms), labelled [ESTIMATE — BASED ON PLACEHOLDER PRICING]. */
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

  // Header minimap: the current pin section
  var mm = head ? head.querySelector(".minimap") : null, pins = document.querySelectorAll("[data-pin]");
  function onScroll() {
    if (head) head.classList.toggle("is-condensed", window.scrollY > 80);
    if (!mm || !pins.length) return;
    var cur = 0, line = window.innerHeight * 0.35;
    pins.forEach(function (s) { if (s.getBoundingClientRect().top < line) cur = +s.getAttribute("data-pin"); });
    mm.querySelectorAll("polygon").forEach(function (p) { p.classList.toggle("on", +p.getAttribute("data-mm") === cur); });
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  if (root.classList.contains("js-motion")) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    document.querySelectorAll(".rv, .rv-up").forEach(function (el) { io.observe(el); });
  }

  function money(n) { return "$[" + Math.round(n) + "]"; }
  // Five-step deposit flow
  document.querySelectorAll("[data-book]").forEach(function (f) {
    var steps = f.querySelectorAll(".bstep"), prev = f.querySelector("[data-prev]"), next = f.querySelector("[data-next]"),
      lab = f.querySelector("[data-steplabel]"), marks = f.querySelectorAll(".steprack polygon"), out = f.querySelector("[data-out]"), n = f.querySelector("[data-n]"), cur = 0, last = null;
    var q = new URLSearchParams(location.search).get("pkg");
    if (q) { var r = f.querySelector('input[name="pkg"][value="' + q + '"]'); if (r) r.checked = true; }
    function show(i) {
      cur = i;
      steps.forEach(function (s, k) { s.hidden = k !== i; if (k === i && root.classList.contains("js-motion")) { s.style.opacity = 0; requestAnimationFrame(function () { s.style.opacity = 1; }); } });
      marks.forEach(function (m, k) { m.classList.toggle("on", k <= i); });
      lab.textContent = "Step " + (i + 1) + " of 5";
      prev.disabled = i === 0; next.hidden = i === steps.length - 1;
      var first = steps[i].querySelector("input, select"); if (first && i > 0) first.focus();
    }
    prev.addEventListener("click", function () { show(Math.max(0, cur - 1)); });
    next.addEventListener("click", function () {
      var bad = false;
      steps[cur].querySelectorAll("[required]").forEach(function (r) { var b = !String(r.value).trim(); r.setAttribute("aria-invalid", b ? "true" : "false"); if (b) bad = true; });
      if (bad) { steps[cur].querySelector('[aria-invalid="true"]').focus(); return; }
      show(Math.min(steps.length - 1, cur + 1));
    });
    function est() {
      var pk = f.querySelector('input[name="pkg"]:checked'), per = pk ? parseFloat(pk.getAttribute("data-price")) : 24, total = Math.max(1, +n.value || 1) * per;
      var from = last === null ? total : last; last = total;
      if (!root.classList.contains("js-motion") || from === total) { out.textContent = money(total); return; }
      var st = null;
      (function step(ts) { if (!st) st = ts; var p = Math.min(1, (ts - st) / 320), e = 1 - Math.pow(1 - p, 3); out.textContent = money(from + (total - from) * e); if (p < 1) requestAnimationFrame(step); })(performance.now());
    }
    f.addEventListener("input", est); f.addEventListener("change", est); est(); show(0);
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
      if (!ok) { var first = form.querySelector('[aria-invalid="true"]'); var st = first && first.closest(".bstep"); if (st && st.hidden) form.querySelectorAll(".bstep").forEach(function (s) { s.hidden = s !== st; }); if (first) first.focus(); return; }
      var s = form.querySelector(".form-status"); s.hidden = false;
      s.textContent = "Demo only. Nothing was booked, sent or charged. [BOOKING / PAYMENT SYSTEM — CONFIRM]"; s.focus();
    });
  });
})();
