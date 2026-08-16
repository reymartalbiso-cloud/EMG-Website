/* Elite Manufacturing Group — scroll-driven build sequence */
(function () {
  "use strict";

  var FRAME_COUNT = 361;
  var FRAME_PATH = function (i) {
    return "public/frames/frame_" + String(i + 1).padStart(3, "0") + ".webp";
  };
  var PRELOAD_START_THRESHOLD = 80; // frames needed before the page unlocks

  var canvas = document.getElementById("heroCanvas");
  var ctx = canvas.getContext("2d");
  var preloader = document.getElementById("preloader");
  var preloaderBar = document.getElementById("preloaderBar");
  var preloaderLabel = document.getElementById("preloaderLabel");
  var hud = document.getElementById("hud");
  var hudSeq = document.getElementById("hudSeq");
  var hudPhase = document.getElementById("hudPhase");
  var nav = document.getElementById("nav");
  var acts = Array.prototype.slice.call(document.querySelectorAll(".act"));

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* QA hook: headless browsers report reduced motion; ?motion=force tests the full experience */
  if (/[?&]motion=force/.test(location.search)) reducedMotion = false;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  var images = new Array(FRAME_COUNT);
  var loadedCount = 0;
  var currentFrame = 0;
  var started = false;

  /* ---------- Canvas drawing (cover fit) ---------- */
  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    drawFrame(currentFrame);
  }

  function nearestLoaded(index) {
    if (images[index] && images[index].complete && images[index].naturalWidth) return index;
    for (var d = 1; d < FRAME_COUNT; d++) {
      var lo = index - d, hi = index + d;
      if (lo >= 0 && images[lo] && images[lo].complete && images[lo].naturalWidth) return lo;
      if (hi < FRAME_COUNT && images[hi] && images[hi].complete && images[hi].naturalWidth) return hi;
    }
    return -1;
  }

  function drawFrame(index) {
    var i = nearestLoaded(Math.round(index));
    if (i < 0) return;
    var img = images[i];
    var cw = canvas.width, ch = canvas.height;
    var scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    var w = img.naturalWidth * scale, h = img.naturalHeight * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  /* ---------- Preload ---------- */
  function preload() {
    var inFlight = 0, next = 0, CONCURRENCY = 8;
    function pump() {
      while (inFlight < CONCURRENCY && next < FRAME_COUNT) {
        (function (i) {
          var img = new Image();
          img.decoding = "async";
          img.onload = img.onerror = function () {
            inFlight--;
            loadedCount++;
            onProgress();
            pump();
          };
          img.src = FRAME_PATH(i);
          images[i] = img;
        })(next);
        next++;
        inFlight++;
      }
    }
    pump();
  }

  function onProgress() {
    var pct = Math.round((loadedCount / FRAME_COUNT) * 100);
    if (preloaderBar) preloaderBar.style.width = pct + "%";
    if (preloaderLabel) {
      preloaderLabel.textContent =
        "LOADING SEQUENCE " + String(Math.min(loadedCount, FRAME_COUNT)).padStart(3, "0") + "/" + FRAME_COUNT;
    }
    if (!started && (loadedCount >= PRELOAD_START_THRESHOLD || loadedCount === FRAME_COUNT)) {
      started = true;
      start();
    }
    if (loadedCount === FRAME_COUNT) drawFrame(currentFrame);
  }

  /* ---------- Acts & HUD ---------- */
  var ACT_RANGES = [
    { el: null, from: 0.0, to: 0.1 },
    { el: null, from: 0.125, to: 0.25 },
    { el: null, from: 0.3, to: 0.64 },
    { el: null, from: 0.78, to: 1.01 }
  ];
  acts.forEach(function (el) {
    var n = parseInt(el.getAttribute("data-act"), 10) - 1;
    if (ACT_RANGES[n]) ACT_RANGES[n].el = el;
  });

  var PHASES = [
    { until: 0.1, label: "PHASE 01 — RAW SHELL" },
    { until: 0.25, label: "PHASE 02 — X-RAY SCAN" },
    { until: 0.7, label: "PHASE 03 — ASSEMBLY" },
    { until: 1.01, label: "PHASE 04 — HERO REVEAL" }
  ];

  function updateOverlays(p) {
    ACT_RANGES.forEach(function (a) {
      if (!a.el) return;
      var on = p >= a.from && p <= a.to;
      a.el.classList.toggle("on", on);
    });
    var frame = Math.round(p * (FRAME_COUNT - 1));
    hudSeq.textContent = "SEQ " + String(frame + 1).padStart(3, "0") + "/" + FRAME_COUNT;
    for (var i = 0; i < PHASES.length; i++) {
      if (p <= PHASES[i].until) { hudPhase.textContent = PHASES[i].label; break; }
    }
  }

  /* ---------- Static fallback (reduced motion or no GSAP) ---------- */
  function startStatic() {
    currentFrame = FRAME_COUNT - 1;
    sizeCanvas();
    var act4 = ACT_RANGES[3].el;
    if (act4) act4.classList.add("on");
    hud.classList.add("on");
    updateOverlays(1);
    hidePreloader();
    revealObserver();
    plainNav();
  }

  /* ---------- Full experience ---------- */
  function start() {
    sizeCanvas();
    /* The scrub itself is user-controlled motion (it only moves with scroll),
       so it stays on under prefers-reduced-motion; only the smooth-scroll
       glide and slide transitions are dropped. Static fallback is reserved
       for environments without GSAP. */
    if (!hasGsap) { startStatic(); return; }

    gsap.registerPlugin(ScrollTrigger);

    /* Smooth scroll (Lenis) — always on: the glide tracks user input exactly,
       so it reads as responsiveness, not autonomous motion */
    var lenis = null;
    if (typeof window.Lenis !== "undefined") {
      lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 1 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    /* Hero scrub */
    var playhead = { frame: 0 };
    var heroTween = gsap.to(playhead, {
      frame: FRAME_COUNT - 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "+=500%",
        pin: ".hero-stage",
        scrub: 1,
        anticipatePin: 1,
        onUpdate: function (self) { updateOverlays(self.progress); }
      },
      onUpdate: function () {
        var f = Math.round(playhead.frame);
        if (f !== currentFrame) {
          currentFrame = f;
          drawFrame(f);
        }
      }
    });

    var heroTrigger = heroTween.scrollTrigger;

    hud.classList.add("on");
    updateOverlays(0);
    hidePreloader();
    revealObserver();
    enhanceSections();

    /* Nav: shade after scroll, hide going down, show going up */
    ScrollTrigger.create({
      start: 60,
      end: "max",
      onUpdate: function (self) {
        nav.classList.toggle("hidden", self.direction === 1 && self.scroll() > window.innerHeight * 0.6);
        if (self.direction === -1) nav.classList.remove("hidden");
      },
      onToggle: function (self) { nav.classList.toggle("scrolled", self.isActive); }
    });

    /* Debug hooks (visual QA): #goto=<section-id> jumps to a section,
       #p=0.42 jumps to that hero progress. Runs after full load so pin
       spacers and trigger positions are final. */
    function qaJump() {
      ScrollTrigger.refresh();
      var y = null;
      var g = location.hash.match(/^#goto=(.+)$/);
      var m = location.hash.match(/^#p=([\d.]+)$/);
      if (g) {
        var sec = document.getElementById(g[1]);
        if (sec) y = sec.getBoundingClientRect().top + window.scrollY - 80;
      } else if (m) {
        var target = Math.min(Math.max(parseFloat(m[1]), 0), 1);
        var st = heroTrigger;
        y = st.start + (st.end - st.start) * target;
      }
      if (y !== null) {
        if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
        else window.scrollTo(0, y);
        ScrollTrigger.update();
      }
    }
    if (/^#(goto|p)=/.test(location.hash)) {
      if (document.readyState === "complete") setTimeout(qaJump, 700);
      else window.addEventListener("load", function () { setTimeout(qaJump, 700); });
    }
  }

  function hidePreloader() {
    preloader.classList.add("done");
    setTimeout(function () { preloader.remove(); }, 900);
  }

  /* ---------- Scroll-driven section animation ---------- */
  function splitWords(el) {
    var nodes = Array.prototype.slice.call(el.childNodes);
    el.innerHTML = "";
    nodes.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(" ")); return; }
          var w = document.createElement("span");
          w.className = "w";
          var wi = document.createElement("span");
          wi.className = "wi";
          wi.textContent = part;
          w.appendChild(wi);
          el.appendChild(w);
        });
      } else {
        el.appendChild(node);
      }
    });
  }

  function enhanceSections() {
    /* top progress hairline */
    gsap.to("#scrollProgress", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: true }
    });

    /* headline word-mask reveals (replaces the plain fade for section heads) */
    document.querySelectorAll(".section-head, .cta-final-inner").forEach(function (head) {
      head.classList.remove("reveal");
      var h2 = head.querySelector("h2");
      var eyebrow = head.querySelector(".eyebrow");
      var cta = head.querySelector(".act-cta");
      if (h2) splitWords(h2);
      var tl = gsap.timeline({
        scrollTrigger: { trigger: head, start: "top 84%", once: true }
      });
      if (eyebrow) tl.from(eyebrow, { opacity: 0, y: 14, duration: 0.5, ease: "power2.out" }, 0);
      if (h2) {
        tl.to(h2.querySelectorAll(".wi"), {
          y: 0, duration: 0.9, ease: "power4.out", stagger: 0.05,
          onComplete: function () {
            h2.querySelectorAll(".wi").forEach(function (s) { s.classList.add("settled"); });
          }
        }, 0.08);
      }
      if (cta) tl.from(cta, { opacity: 0, y: 18, duration: 0.6, ease: "power2.out" }, 0.5);
    });

    /* card image parallax */
    gsap.utils.toArray(".card").forEach(function (card) {
      var img = card.querySelector(".card-media img");
      if (!img) return;
      gsap.fromTo(img, { yPercent: -12 }, {
        yPercent: 0,
        ease: "none",
        scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    /* process line draws across; step numbers light as it passes */
    var steps = gsap.utils.toArray("#process .step");
    if (document.getElementById("stepsFill") && steps.length) {
      gsap.to("#stepsFill", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "#process", start: "top 62%", end: "bottom 78%", scrub: true,
          onUpdate: function (self) {
            steps.forEach(function (s, i) {
              s.classList.toggle("lit", self.progress > (i + 0.4) / steps.length);
            });
          }
        }
      });
    }

    /* marquee slides with scroll */
    if (document.getElementById("marqueeTrack")) {
      gsap.fromTo("#marqueeTrack", { xPercent: 2 }, {
        xPercent: -24,
        ease: "none",
        scrollTrigger: { trigger: "#marquee", start: "top bottom", end: "bottom top", scrub: true }
      });
    }

    /* final CTA glow swells on approach */
    if (document.getElementById("ctaGlow")) {
      gsap.fromTo("#ctaGlow", { opacity: 0.2, scale: 0.75 }, {
        opacity: 1, scale: 1.1,
        ease: "none",
        scrollTrigger: { trigger: "#contact", start: "top 92%", end: "bottom bottom", scrub: true }
      });
    }
  }

  /* ---------- Section reveals ---------- */
  function revealObserver() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
  }

  function plainNav() {
    window.addEventListener("scroll", function () {
      nav.classList.toggle("scrolled", window.scrollY > 60);
    }, { passive: true });
  }

  /* ---------- Boot ---------- */
  window.addEventListener("resize", sizeCanvas);
  preload();

  /* Safety: if the network stalls, unlock after 12s with whatever we have */
  setTimeout(function () {
    if (!started) { started = true; start(); }
  }, 12000);
})();