"use client";

/* Site-wide motion layer, v3.
   Owns: Lenis smooth scroll, the top progress hairline, char/word split-text
   reveals, grid stagger, card lift + 3D tilt, magnetic buttons, media clip
   wipes, quote drift, step-number pops, CTA glow swells, velocity-reactive
   marquee and the footer mega wordmark.
   Everything is scroll-linked, pointer-linked or a short one-shot —
   user-driven motion, consistent with this site's reduced-motion policy.
   Motion tiers (design doc §3.1): functional pages get state transitions
   only — no decorative scroll choreography. */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { registerScroller, jumpTo } from "@/lib/scrollLock";

gsap.registerPlugin(ScrollTrigger);

function splitWords(el: HTMLElement) {
  if (el.dataset.split) return;
  el.dataset.split = "1";
  const nodes = Array.from(el.childNodes);
  el.innerHTML = "";
  nodes.forEach((node) => {
    if (node.nodeType === 3) {
      (node.textContent || "").split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(" ")); return; }
        const w = document.createElement("span");
        w.className = "w";
        const wi = document.createElement("span");
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

/* char-level split on top of the word masks (page-hero headlines only) */
function splitChars(el: HTMLElement) {
  splitWords(el);
  el.querySelectorAll<HTMLElement>(".wi").forEach((wi) => {
    if (wi.dataset.chars) return;
    wi.dataset.chars = "1";
    const text = wi.textContent || "";
    wi.textContent = "";
    for (const c of text) {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = c;
      wi.appendChild(s);
    }
  });
}

export default function ScrollFX() {
  const pathname = usePathname();
  /* browser back/forward: the browser restores the old position, and that
     restoration is correct — only forward navigations reset to the top */
  const popped = useRef(false);
  const firstRender = useRef(true);
  useEffect(() => {
    const onPop = () => { popped.current = true; };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  /* Smooth scroll — once for the whole app */
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 1 });
    /* so a modal (the mobile menu) can actually stop the page: body overflow
       is inert against a programmatic scroller */
    registerScroller(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => { registerScroller(null); gsap.ticker.remove(raf); lenis.destroy(); };
  }, []);

  /* Per-page effects — rebuilt on navigation */
  useEffect(() => {
    /* Every forward navigation starts at the top of the new page. Without
       this, Lenis carried its position and any un-spent flick momentum from
       the previous page onto the new one, which clamps to the bottom when the
       new page is shorter — Reymart hit it on the phone (3 Sep), where flick
       inertia makes it near-certain, but the mechanism is the same with a
       mouse wheel. Skipped on first render (reloads restore their position)
       and on back/forward (the browser's restoration is the right answer).
       A hash still wins: /terms#refunds lands on the clause, not the top. */
    if (firstRender.current) {
      firstRender.current = false;
    } else if (popped.current) {
      popped.current = false;
    } else {
      /* ScrollTrigger remembers scroll positions and restores them on
         refresh() — and the heroes call refresh() after mount, so a stale
         memory from the previous page is a snap to nowhere. GSAP's own SPA
         guidance: clear it on every route change. */
      ScrollTrigger.clearScrollMemory?.();
      const el = window.location.hash
        ? document.getElementById(window.location.hash.slice(1))
        : null;
      jumpTo(el ?? 0);
    }

    const FUNCTIONAL = ["/build-your-own", "/contact", "/faq"];
    const isFunctional = FUNCTIONAL.some((p) => pathname.startsWith(p));
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const cleanupFns: (() => void)[] = [];

    const ctx = gsap.context(() => {
      /* top progress hairline (site chrome, all tiers) */
      const bar = document.getElementById("scrollProgress");
      if (bar) {
        gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });
      }

      /* pins compute heights from layout — refresh once fonts are in (doc §3.3) */
      document.fonts?.ready.then(() => ScrollTrigger.refresh());

      if (isFunctional) {
        /* functional tier: everything visible immediately, nothing decorative */
        document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => el.classList.add("in"));
        return;
      }

      /* headline blocks: eyebrow fade → text rises from mask → sub + actions.
         Page-hero h1s get char-level rises with a rotation settle. */
      document
        .querySelectorAll<HTMLElement>(
          ".page-hero .reveal, .section-head .reveal, .cta-band .reveal, .track-band .reveal"
        )
        .forEach((head) => {
          head.classList.add("in");
          head.classList.remove("reveal");
          const h = head.querySelector<HTMLElement>("h1, h2");
          const eyebrow = head.querySelector<HTMLElement>(".eyebrow");
          const sub = head.querySelector<HTMLElement>(".section-sub");
          const actions = head.querySelector<HTMLElement>(".actions, .btn");
          const isHero = !!head.closest(".page-hero") && h?.tagName === "H1";
          const tl = gsap.timeline({ scrollTrigger: { trigger: head, start: "top 85%", once: true } });
          if (eyebrow) tl.from(eyebrow, { opacity: 0, y: 14, duration: 0.5, ease: "power2.out" }, 0);
          if (h && isHero) {
            splitChars(h);
            const chars = h.querySelectorAll(".ch");
            gsap.set(chars, { yPercent: 130, rotate: 8, transformOrigin: "0% 100%" });
            tl.to(chars, { yPercent: 0, rotate: 0, duration: 0.9, ease: "power4.out", stagger: 0.018 }, 0.05);
          } else if (h) {
            splitWords(h);
            const words = h.querySelectorAll(".wi");
            gsap.set(words, { yPercent: 120 });
            tl.to(words, { yPercent: 0, duration: 0.85, ease: "power4.out", stagger: 0.045 }, 0.08);
          }
          if (sub) tl.from(sub, { opacity: 0, y: 16, duration: 0.6, ease: "power2.out" }, 0.4);
          if (actions) tl.from(actions, { opacity: 0, y: 16, duration: 0.55, ease: "power2.out" }, 0.55);
        });

      /* trust-band figures rise from a mask, staggered */
      gsap.utils.toArray<HTMLElement>(".band-item").forEach((item, i) => {
        const nums = item.querySelectorAll<HTMLElement>(".band-num");
        nums.forEach(splitWords);
        const spans = item.querySelectorAll(".wi");
        if (!spans.length) return;
        gsap.set(spans, { yPercent: 120 });
        gsap.to(spans, {
          yPercent: 0, duration: 0.8, ease: "power4.out", delay: i * 0.09,
          scrollTrigger: { trigger: item, start: "top 88%", once: true },
        });
      });

      /* stagger the uniform IO reveals inside grids */
      document
        .querySelectorAll<HTMLElement>(".card-grid, .works-grid, .quotes, .band-grid, .steps-home, .faq-list")
        .forEach((grid) => {
          grid.querySelectorAll<HTMLElement>(".reveal").forEach((el, i) => {
            el.style.transitionDelay = `${(i % 4) * 80}ms`;
          });
        });

      /* spotlight border: cards glow under the cursor (taste-skill surface upgrade) */
      const onCardMove = (e: PointerEvent) => {
        const card = (e.target as Element).closest?.(".pcard") as HTMLElement | null;
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        card.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      };
      document.addEventListener("pointermove", onCardMove, { passive: true });
      cleanupFns.push(() => document.removeEventListener("pointermove", onCardMove));

      /* cards: lift + 3D tilt toward the cursor (JS owns the transform) */
      if (finePointer) {
        gsap.utils.toArray<HTMLElement>(".pcard").forEach((card) => {
          gsap.set(card, { transformPerspective: 900 });
          const rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power2.out" });
          const ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power2.out" });
          const lift = gsap.quickTo(card, "y", { duration: 0.45, ease: "power2.out" });
          const move = (e: PointerEvent) => {
            const r = card.getBoundingClientRect();
            rx((0.5 - (e.clientY - r.top) / r.height) * 5);
            ry(((e.clientX - r.left) / r.width - 0.5) * 7);
          };
          const enter = () => lift(-6);
          const leave = () => { rx(0); ry(0); lift(0); };
          card.addEventListener("pointermove", move, { passive: true });
          card.addEventListener("pointerenter", enter);
          card.addEventListener("pointerleave", leave);
          cleanupFns.push(() => {
            card.removeEventListener("pointermove", move);
            card.removeEventListener("pointerenter", enter);
            card.removeEventListener("pointerleave", leave);
          });
        });

        /* magnetic buttons: pull gently toward the cursor, snap home on leave */
        gsap.utils.toArray<HTMLElement>(".btn").forEach((btn) => {
          const xTo = gsap.quickTo(btn, "x", { duration: 0.35, ease: "power3.out" });
          const yTo = gsap.quickTo(btn, "y", { duration: 0.35, ease: "power3.out" });
          const move = (e: PointerEvent) => {
            const r = btn.getBoundingClientRect();
            xTo((e.clientX - (r.left + r.width / 2)) * 0.18);
            yTo((e.clientY - (r.top + r.height / 2)) * 0.24);
          };
          const leave = () => { xTo(0); yTo(0); };
          btn.addEventListener("pointermove", move, { passive: true });
          btn.addEventListener("pointerleave", leave);
          cleanupFns.push(() => {
            btn.removeEventListener("pointermove", move);
            btn.removeEventListener("pointerleave", leave);
          });
        });
      }

      /* card image parallax */
      gsap.utils.toArray<HTMLElement>(".pcard").forEach((card) => {
        const img = card.querySelector("img");
        if (!img) return;
        gsap.fromTo(img, { yPercent: -12 }, {
          yPercent: 0, ease: "none",
          scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      /* media wipes on entry: product heroes, tour cinema and card media */
      gsap.utils.toArray<HTMLElement>(".product-media, .tour-frame").forEach((media) => {
        gsap.fromTo(media,
          { clipPath: "inset(0 0 100% 0)" },
          { clipPath: "inset(0 0 0% 0)", duration: 1.1, ease: "power4.out",
            scrollTrigger: { trigger: media, start: "top 85%", once: true } });
      });
      gsap.utils.toArray<HTMLElement>(".pcard-media").forEach((media) => {
        const img = media.querySelector("img");
        const trig = { trigger: media, start: "top 92%", once: true } as const;
        gsap.fromTo(media,
          { clipPath: "inset(12% 6% 12% 6%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power3.out", scrollTrigger: trig });
        if (img) {
          gsap.fromTo(img, { scale: 1.14 }, { scale: 1, duration: 1.2, ease: "power3.out", scrollTrigger: trig });
        }
      });

      /* quotes drift at alternating speeds */
      gsap.utils.toArray<HTMLElement>(".quotes .quote").forEach((q, i) => {
        gsap.fromTo(q, { y: i % 2 ? 28 : 0 }, {
          y: i % 2 ? 0 : 28, ease: "none",
          scrollTrigger: { trigger: q.closest(".quotes"), start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      /* step / stage numbers pop in */
      gsap.utils.toArray<HTMLElement>(".step-n").forEach((n) => {
        gsap.from(n, {
          opacity: 0, y: 12, duration: 0.5, ease: "power2.out",
          scrollTrigger: { trigger: n, start: "top 90%", once: true },
        });
      });

      /* spec-table rows cascade */
      document.querySelectorAll<HTMLElement>(".spec-table tbody").forEach((tbody) => {
        gsap.from(tbody.querySelectorAll("tr"), {
          opacity: 0, x: -16, duration: 0.55, ease: "power2.out", stagger: 0.07,
          scrollTrigger: { trigger: tbody, start: "top 85%", once: true },
        });
      });

      /* CTA bands get an injected glow that swells on approach */
      document.querySelectorAll<HTMLElement>(".cta-band").forEach((band) => {
        if (!band.querySelector(".cta-glow")) {
          const glow = document.createElement("span");
          glow.className = "cta-glow";
          glow.setAttribute("aria-hidden", "true");
          band.prepend(glow);
        }
        gsap.fromTo(band.querySelector(".cta-glow"), { opacity: 0.15, scale: 0.7 }, {
          opacity: 1, scale: 1.1, ease: "none",
          scrollTrigger: { trigger: band, start: "top 95%", end: "bottom bottom", scrub: true },
        });
      });

      /* marquee: scrubs sideways AND skews with scroll velocity */
      const track = document.querySelector<HTMLElement>(".marquee-track");
      if (track) {
        gsap.fromTo(track, { xPercent: 2 }, {
          xPercent: -24, ease: "none",
          scrollTrigger: { trigger: ".marquee", start: "top bottom", end: "bottom top", scrub: true },
        });
        const skewTo = gsap.quickTo(track, "skewX", { duration: 0.4, ease: "power2.out" });
        let settle: gsap.core.Tween | null = null;
        ScrollTrigger.create({
          trigger: ".marquee", start: "top bottom", end: "bottom top",
          onUpdate: (self) => {
            skewTo(gsap.utils.clamp(-7, 7, self.getVelocity() / -400));
            settle?.kill();
            settle = gsap.delayedCall(0.12, () => skewTo(0));
          },
        });
      }

      /* footer mega wordmark: outline letters rise as the footer arrives */
      const megaChars = document.querySelectorAll(".fm-ch");
      if (megaChars.length) {
        gsap.from(megaChars, {
          yPercent: 60, opacity: 0.15, stagger: 0.06, ease: "none",
          scrollTrigger: { trigger: ".footer-mega", start: "top 100%", end: "top 68%", scrub: 1 },
        });
      }

      requestAnimationFrame(() => ScrollTrigger.refresh());

      /* A pinned hero adds thousands of pixels to the page, but only once its
         trigger has measured — which is AFTER the browser has already jumped
         to the hash. That is why /commercial#camp-scoper landed 3,400px short
         on a hard load and from the floating button. Re-aim after the refresh. */
      const hash = window.location.hash.slice(1);
      if (hash) {
        const settle = () => {
          const el = document.getElementById(hash);
          if (el) el.scrollIntoView({ block: "start" });
        };
        requestAnimationFrame(() => requestAnimationFrame(settle));
        /* fonts and images can move things again a beat later */
        cleanupFns.push((() => { const t = setTimeout(settle, 700); return () => clearTimeout(t); })());
      }
    });

    return () => {
      cleanupFns.forEach((fn) => fn());
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
