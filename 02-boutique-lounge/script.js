/* Bowling demo (fictional) — DEMO — ThinkFirst Studios · [Your name here]
   Slider crossfades every 6s (paused on hover/focus, off under reduced motion). Reveals on scroll. No flashing effects. */
(function () {
  var root = document.documentElement; root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); });
  var day = new Date().getDay();
  document.querySelectorAll('tr[data-day="' + day + '"]').forEach(function (t) { t.classList.add("is-today"); });
  document.querySelectorAll("[data-today]").forEach(function (e) { var h = JSON.parse(e.getAttribute("data-today")); e.textContent = h[day]; });

  var head = document.querySelector(".site-head"), btn = document.querySelector(".menu-btn"), nav = document.getElementById("site-nav"), top = document.querySelector(".to-top");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      nav.style.setProperty("--nav-top", head.getBoundingClientRect().bottom + "px");
      var o = nav.classList.toggle("is-open"); btn.setAttribute("aria-expanded", o); btn.textContent = o ? "Close" : "Menu";
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { btn.click(); btn.focus(); } });
  }
  function onScroll() { var y = window.scrollY; if (head) head.classList.toggle("is-condensed", y > 40); if (top) top.classList.toggle("show", y > 700); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if (top) top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  // reveals
  var rv = document.querySelectorAll(".rv, .rv-l, .rv-r, .rv-z");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    rv.forEach(function (e) { io.observe(e); });
  } else rv.forEach(function (e) { e.classList.add("is-in"); });

  // hero slider
  document.querySelectorAll("[data-slider]").forEach(function (s) {
    var slides = s.querySelectorAll(".slide"), copy = s.querySelectorAll(".hero-slide-copy"), dots = s.querySelectorAll(".dots button"), cur = 0, timer = null;
    function go(i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (x, k) { x.classList.toggle("is-on", k === cur); x.setAttribute("aria-hidden", k !== cur); });
      copy.forEach(function (x, k) { x.classList.toggle("is-on", k === cur); });
      dots.forEach(function (x, k) { x.setAttribute("aria-current", k === cur); });
    }
    function play() { if (!reduce && !timer) timer = setInterval(function () { go(cur + 1); }, 6500); }
    function stop() { clearInterval(timer); timer = null; }
    s.querySelector("[data-prev]").addEventListener("click", function () { go(cur - 1); });
    s.querySelector("[data-next]").addEventListener("click", function () { go(cur + 1); });
    dots.forEach(function (d, k) { d.addEventListener("click", function () { go(k); }); });
    s.addEventListener("mouseenter", stop); s.addEventListener("mouseleave", play);
    s.addEventListener("focusin", stop); s.addEventListener("focusout", play);
    go(0); play();
  });

  // tab sets (menus, league sign-up paths)
  document.querySelectorAll("[data-tabset]").forEach(function (box) {
    var tabs = box.querySelectorAll('[role="tab"]');
    function sel(t) { tabs.forEach(function (x) { var on = x === t; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute("aria-controls")).hidden = !on; }); }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { sel(t); });
      t.addEventListener("keydown", function (e) { var k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (k) { e.preventDefault(); var n = tabs[(i + k + tabs.length) % tabs.length]; sel(n); n.focus(); } });
    });
  });

  function money(n) { return "$" + n.toFixed(2).replace(/\.00$/, ""); }
  // estimators: data-calc="league|lane|party"
  document.querySelectorAll("[data-calc]").forEach(function (f) {
    var kind = f.getAttribute("data-calc");
    function v(sel) { var e = f.querySelector(sel); return e ? e : null; }
    function run() {
      if (kind === "league") {
        var b = +v("[name=bowlers]").value, w = +v("[name=weeks]").value || 32, fee = 19;
        v("[data-o1]").textContent = money(fee * w); v("[data-out]").textContent = money(fee * w * b);
      } else if (kind === "lane") {
        var lanes = +(f.querySelector("[name=lanes]:checked") || {}).value || 1, blk = f.querySelector("[name=block]:checked"), hrs = +v("[name=hours]").value,
            rate = blk ? +blk.getAttribute("data-rate") : 60, min = blk ? +blk.getAttribute("data-min") : 150, people = +v("[name=party]").value || 1;
        v("[data-hire]").textContent = money(lanes * hrs * rate); v("[data-min]").textContent = money(lanes * min);
        var need = Math.ceil(people / 6);
        v("[data-fit]").textContent = need > lanes ? people + " guests need " + need + " lanes (6 per lane)" : people + " guests fit on " + lanes + " lane" + (lanes > 1 ? "s" : "");
      } else if (kind === "party") {
        var p = f.querySelector("[name=pkg]:checked"), per = p ? +p.getAttribute("data-price") : 25.99, n = Math.max(8, +v("[name=guests]").value || 8);
        v("[data-per]").textContent = money(per); v("[data-out]").textContent = money(per * n); v("[data-bal]").textContent = money(Math.max(0, per * n - 75));
      }
    }
    f.addEventListener("input", run); f.addEventListener("change", run); run();
  });

  // multi-step booking
  document.querySelectorAll("[data-steps]").forEach(function (f) {
    var steps = f.querySelectorAll(".bstep"), bars = f.querySelectorAll(".steps span"), prev = f.querySelector("[data-back]"), next = f.querySelector("[data-fwd]"), cur = 0;
    function show(i) { cur = i; steps.forEach(function (s, k) { s.hidden = k !== i; }); bars.forEach(function (b, k) { b.classList.toggle("on", k <= i); }); prev.disabled = i === 0; next.hidden = i === steps.length - 1; }
    prev.addEventListener("click", function () { show(Math.max(0, cur - 1)); });
    next.addEventListener("click", function () {
      var bad = null; steps[cur].querySelectorAll("[required]").forEach(function (r) { var b = !String(r.value).trim(); r.setAttribute("aria-invalid", b); if (b && !bad) bad = r; });
      if (bad) { bad.focus(); return; } show(Math.min(steps.length - 1, cur + 1));
    });
    show(0);
  });

  // forms (demo)
  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault(); var bad = null;
      form.querySelectorAll("[required]").forEach(function (r) {
        var b = !String(r.value).trim() || (r.type === "email" && !/^\S+@\S+\.\S+$/.test(r.value)); r.setAttribute("aria-invalid", b);
        if (b && !bad) bad = r;
      });
      if (bad) { var st = bad.closest(".bstep"); if (st && st.hidden) form.querySelectorAll(".bstep").forEach(function (s) { s.hidden = s !== st; }); bad.focus(); return; }
      var s = form.querySelector(".form-status"); s.hidden = false; s.textContent = form.getAttribute("data-ok") + " (Demo site: nothing was sent or charged.)"; s.focus();
    });
  });
})();
