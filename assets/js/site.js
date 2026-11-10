/* wyywyy.com — 互動（平常不需要改） */
(function () {
  "use strict";
  var d = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* 首屏進場 */
  var hero = document.querySelector(".hero");
  $$(".frame").forEach(function (f, i) { f.style.setProperty("--i", i); });
  requestAnimationFrame(function () { requestAnimationFrame(function () { if (hero) hero.classList.add("is-loaded"); }); });

  /* 深淺色 */
  var themeBtn = document.querySelector(".theme-toggle");
  function themeLabel() {
    if (!themeBtn) return;
    var light = d.getAttribute("data-theme") === "light";
    themeBtn.textContent = light ? themeBtn.getAttribute("data-dark") : themeBtn.getAttribute("data-light");
  }
  themeLabel();
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var next = d.getAttribute("data-theme") === "light" ? "dark" : "light";
    d.setAttribute("data-theme", next); store("theme", next); themeLabel();
  });

  /* 語言 */
  $$("[data-target-lang]").forEach(function (a) {
    a.addEventListener("click", function () { store("lang", a.getAttribute("data-target-lang")); });
  });

  /* 手機選單 */
  var menuBtn = document.querySelector(".menu-toggle");
  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    if (!menuBtn) return;
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.textContent = open ? menuBtn.getAttribute("data-close") : menuBtn.getAttribute("data-open");
  }
  if (menuBtn) menuBtn.addEventListener("click", function () { setMenu(!document.body.classList.contains("menu-open")); });
  $$(".nav a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  /* 照片資料 */
  var photos = [];
  try { photos = JSON.parse(document.getElementById("photo-data").textContent); } catch (e) {}
  function photoIndex(id) { for (var i = 0; i < photos.length; i++) if (photos[i].id === id) return i; return 0; }

  /* 放大檢視（loupe） */
  var loupe = document.querySelector(".loupe");
  var at = 0, list = photos;
  function show(i) {
    if (!list.length) return;
    at = (i + list.length) % list.length;
    var p = list[at];
    var img = loupe.querySelector(".loupe-img");
    img.src = "/images/photos/" + p.id + ".webp";
    img.alt = p.cap;
    loupe.querySelector(".loupe-cap").textContent = p.cap + (d.getAttribute("data-lang") === "en" ? ", " : "，") + p.cat;
  }
  function openLoupe(id, subset) {
    if (!loupe || typeof loupe.showModal !== "function") { window.open("/images/photos/" + id + ".webp", "_blank"); return; }
    list = subset && subset.length ? subset : photos;
    var idx = 0;
    for (var i = 0; i < list.length; i++) if (list[i].id === id) idx = i;
    show(idx); loupe.showModal();
  }
  if (loupe) {
    loupe.querySelector(".loupe-prev").addEventListener("click", function () { show(at - 1); });
    loupe.querySelector(".loupe-next").addEventListener("click", function () { show(at + 1); });
    loupe.querySelector(".loupe-close").addEventListener("click", function () { loupe.close(); });
    loupe.addEventListener("click", function (e) { if (e.target === loupe || e.target.classList.contains("loupe-figure")) loupe.close(); });
    loupe.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(at - 1);
      if (e.key === "ArrowRight") show(at + 1);
    });
    var sx = null;
    loupe.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    loupe.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  /* 照片環：指到哪張，句子就換成那張的名稱 */
  var ring = document.querySelector(".ring");
  var def = document.querySelector(".core-default");
  var capEl = document.querySelector(".core-caption");
  function point(f) {
    if (!ring) return;
    $$(".frame", ring).forEach(function (x) { x.classList.toggle("is-active", x === f); });
    ring.classList.toggle("is-pointing", !!f);
    if (f) { capEl.textContent = f.getAttribute("data-caption"); capEl.hidden = false; def.hidden = true; }
    else { capEl.hidden = true; def.hidden = false; }
  }
  $$(".frame").forEach(function (f) {
    f.addEventListener("mouseenter", function () { point(f); });
    f.addEventListener("mouseleave", function () { point(null); });
    f.addEventListener("focus", function () { point(f); });
    f.addEventListener("blur", function () { point(null); });
    f.addEventListener("click", function () { openLoupe(f.getAttribute("data-photo")); });
  });

  /* 攝影分類 */
  var filters = $$(".filter");
  var shots = $$(".shot");
  filters.forEach(function (b) {
    b.addEventListener("click", function () {
      var c = b.getAttribute("data-filter");
      filters.forEach(function (x) {
        var on = x === b;
        x.classList.toggle("is-on", on);
        x.setAttribute("aria-pressed", on ? "true" : "false");
      });
      shots.forEach(function (s) { s.hidden = !(c === "all" || s.getAttribute("data-cat") === c); });
    });
  });
  $$(".shot-open").forEach(function (b) {
    b.addEventListener("click", function () {
      var visible = shots.filter(function (s) { return !s.hidden; }).map(function (s) {
        return photos[photoIndex(s.querySelector(".shot-open").getAttribute("data-photo"))];
      });
      openLoupe(b.getAttribute("data-photo"), visible);
    });
  });

  /* 作品列：中間那張置中，點旁邊那張先滑過來 */
  function center(strip, slide, smooth) {
    var left = slide.offsetLeft - (strip.clientWidth - slide.clientWidth) / 2;
    strip.scrollTo({ left: left, behavior: smooth && !reduce ? "smooth" : "auto" });
  }
  $$(".strip").forEach(function (strip) {
    var slides = $$(".slide", strip);
    if (slides.length > 2) center(strip, slides[1], false);
    slides.forEach(function (sl) {
      sl.addEventListener("click", function (e) {
        var r = sl.getBoundingClientRect(), mid = window.innerWidth / 2;
        if (Math.abs(r.left + r.width / 2 - mid) > r.width * 0.25) { e.preventDefault(); center(strip, sl, true); }
      });
    });
    strip.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      strip.scrollBy({ left: (e.key === "ArrowRight" ? 1 : -1) * slides[0].clientWidth, behavior: reduce ? "auto" : "smooth" });
    });
  });

  /* Email：用到時才組出地址 */
  function addr(el) { return el.getAttribute("data-u") + "@" + el.getAttribute("data-d"); }
  $$(".js-mail").forEach(function (el) {
    el.href = "mailto:" + addr(el);
    if (el.classList.contains("js-mail-text")) el.textContent = addr(el);
  });
  $$(".js-copy").forEach(function (b) {
    b.addEventListener("click", function () {
      var text = addr(b), orig = b.textContent;
      function done() { b.textContent = b.getAttribute("data-done"); setTimeout(function () { b.textContent = orig; }, 1800); }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
    });
  });

  /* 台中時間 */
  var clock = document.querySelector(".js-clock");
  function tick() {
    if (!clock) return;
    try {
      clock.textContent = new Intl.DateTimeFormat(d.getAttribute("data-lang") === "en" ? "en-GB" : "zh-TW", {
        timeZone: "Asia/Taipei", hour: "2-digit", minute: "2-digit", hour12: false
      }).format(new Date());
    } catch (e) {}
  }
  tick(); setInterval(tick, 20000);

  /* 區塊進場：依序出現 */
  var items = $$("[data-in]");
  items.forEach(function (el) {
    var sibs = $$("[data-in]", el.parentElement);
    el.style.setProperty("--d", Math.min(sibs.indexOf(el), 5) * 80 + "ms");
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-in"); });
  }
})();
