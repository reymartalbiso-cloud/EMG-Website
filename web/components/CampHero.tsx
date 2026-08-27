"use client";

/* Commercial hero: scroll-scrubbed camp-build sequence — one unit multiplies
   into a workers' village while the visitor "walks" the camp by scrolling.
   Same poster-first pipeline as the residential hero. */

import { useEffect, useRef } from "react";
import PreloadVeil from "@/components/PreloadVeil";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { loadSequence, wantsSmallFrames } from "@/lib/frameLoader";

/* 479 frames: the 24fps source motion-interpolated to 48fps, so each
   scrolled pixel steps half as far through the build-out — the smoothness ask
   from the 18 Aug call */
const FRAME_COUNT = 479;
const FRAME_DIR = "/campframes/";
const FRAME_DIR_SM = "/campframes-sm/";
const frameName = (i: number) =>
  `frame_${String(i + 1).padStart(3, "0")}.webp`;
const framePath = (i: number) => `${FRAME_DIR}${frameName(i)}`;

const PHASES = [
  { until: 0.14, label: "PHASE 01 · SITE" },
  { until: 0.48, label: "PHASE 02 · ROWS" },
  { until: 0.78, label: "PHASE 03 · STREET RUN" },
  { until: 1.01, label: "PHASE 04 · VILLAGE" },
];
const ACT_RANGES = [
  { from: 0.0, to: 0.12 },
  { from: 0.17, to: 0.44 },
  { from: 0.5, to: 0.74 },
  { from: 0.82, to: 1.01 },
];

function slowConnection(): boolean {
  const c = (navigator as any).connection;
  if (!c) return false;
  return c.saveData === true || /(^|-)2g/.test(c.effectiveType || "");
}

export default function CampHero() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const canvas = root.querySelector<HTMLCanvasElement>(".hero-canvas")!;
    const poster = root.querySelector<HTMLImageElement>(".hero-poster")!;
    const hud = root.querySelector<HTMLElement>(".hud")!;
    const hudSeq = root.querySelector<HTMLElement>(".hud-seq")!;
    const hudPhase = root.querySelector<HTMLElement>(".hud-phase")!;
    const acts = Array.from(root.querySelectorAll<HTMLElement>(".act"));
    const ctx = canvas.getContext("2d")!;

    const images: (HTMLImageElement | undefined)[] = new Array(FRAME_COUNT);
    let current = 0;
    let killed = false;
    const cleanups: (() => void)[] = [];

    function sizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      drawFrame(current);
    }

    function nearestLoaded(index: number): number {
      const ok = (i: number) => {
        const im = images[i];
        return !!im && im.complete && im.naturalWidth > 0;
      };
      if (ok(index)) return index;
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (index - d >= 0 && ok(index - d)) return index - d;
        if (index + d < FRAME_COUNT && ok(index + d)) return index + d;
      }
      return -1;
    }

    function drawFrame(index: number) {
      const i = nearestLoaded(Math.round(index));
      if (i < 0) return;
      const img = images[i]!;
      const cw = canvas.width, ch = canvas.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      poster.style.opacity = "0";
    }

    function updateOverlays(p: number) {
      acts.forEach((el, n) => {
        const a = ACT_RANGES[n];
        el.classList.toggle("on", p >= a.from && p <= a.to);
        /* local progress inside this act's window drives the caption's travel
           across the screen — text that moves with the thumb is the proof of
           scrolling Joel asked for, and the motion Ben wants on the camp */
        const t = Math.min(1, Math.max(0, (p - a.from) / (a.to - a.from)));
        el.style.setProperty("--act-t", t.toFixed(4));
      });
      const frame = Math.round(p * (FRAME_COUNT - 1));
      hudSeq.textContent = `SEQ ${String(frame + 1).padStart(3, "0")}/${FRAME_COUNT}`;
      hudPhase.textContent = PHASES.find((ph) => p <= ph.until)!.label;
    }

    function startStatic() {
      /* no sequence will stream — release the first-visit veil right away */
      window.dispatchEvent(new CustomEvent("emg:preload", { detail: { loaded: 1, total: 1 } }));
      poster.srcset = ""; // a live srcset would override the src below
      poster.src = framePath(FRAME_COUNT - 1);
      acts[3].classList.add("on");
      hud.classList.add("on");
      updateOverlays(1);
      root.classList.add("static");
    }

    function start() {
      sizeCanvas();
      gsap.registerPlugin(ScrollTrigger);

      const playhead = { frame: 0 };
      const tween = gsap.to(playhead, {
        frame: FRAME_COUNT - 1,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          /* phones get a shorter pin: the same frames in fewer swipes,
             so the picture visibly answers every scroll */
          end: window.matchMedia("(max-width: 720px)").matches ? "+=280%" : "+=380%",
          pin: ".hero-stage",
          scrub: 1,
          anticipatePin: 1,
          onUpdate: (self) => updateOverlays(self.progress),
        },
        onUpdate: () => {
          const f = Math.round(playhead.frame);
          if (f !== current) { current = f; drawFrame(f); }
        },
      });
      cleanups.push(() => { tween.scrollTrigger?.kill(); tween.kill(); });

      hud.classList.add("on");
      updateOverlays(0);

      /* this pin is created late (after frames load) — other triggers on the
         page computed their positions without our spacer, so refresh all */
      requestAnimationFrame(() => ScrollTrigger.refresh());

      const onResize = () => sizeCanvas();
      window.addEventListener("resize", onResize);
      cleanups.push(() => window.removeEventListener("resize", onResize));
    }

    if (slowConnection()) {
      startStatic();
    } else {
      /* create the pin EAGERLY at mount — pins created late invalidate other
         triggers' cached positions (the rail-over-video bug). The poster
         covers the stage until frames arrive. */
      start();
      /* Interleaved passes, so the reader can scrub the whole sequence
         almost immediately and it sharpens as the rest arrives. Phones
         pull a smaller set: same picture, a third of the bytes. */
      const dir = wantsSmallFrames() ? FRAME_DIR_SM : FRAME_DIR;
      const seq = loadSequence({
        count: FRAME_COUNT,
        src: (i) => `${dir}${frameName(i)}`,
        images,
        onFrame: (i, n) => {
          if (n === 1 || Math.abs(i - current) <= 8) drawFrame(current);
        },
      });
      cleanups.push(() => seq.cancel());
    }

    return () => { killed = true; cleanups.forEach((fn) => fn()); };
  }, []);

  return (
    <section className="hero" ref={rootRef}>
      {/* fixed overlay, outside .hero-stage: the pin transforms the stage,
         and a transformed ancestor would re-anchor a fixed element */}
      <PreloadVeil />
      <div className="hero-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="hero-poster"
          src={framePath(0)}
          /* the browser picks by viewport x DPR, so a phone takes the
             900px poster and a desktop the full one */
          srcSet={`${FRAME_DIR_SM}${frameName(0)} 900w, ${FRAME_DIR}${frameName(0)} 1600w`}
          sizes="100vw"
          alt=""
          fetchPriority="high"
        />
        <canvas
          className="hero-canvas"
          role="img"
          aria-label="A single accommodation unit multiplying into a full workers' camp village"
        />
        <div className="hero-vignette" aria-hidden="true" />

        <div className="hud mono" aria-hidden="true">
          <span className="hud-line" />
          <span className="hud-seq">SEQ 001/479</span>
          <span className="hud-phase">PHASE 01 · SITE</span>
        </div>

        <div className="act act-1">
          <p className="eyebrow mono">COMMERCIAL · MINING · COMMUNITY · GOVERNMENT</p>
          <h1>One building.</h1>
          <p className="act-sub">Specified, delivered and installed, anywhere your project is. Scroll.</p>
          <div className="scroll-cue" aria-hidden="true"><span /></div>
        </div>
        <div className="act act-2">
          <p className="eyebrow mono">PROGRAM DELIVERY</p>
          <h2>Or fifty.</h2>
          <p className="act-sub">
            Rooms, ablutions, kitchens and offices, built out as a coordinated
            program, not a pile of containers.
          </p>
        </div>
        <div className="act act-3">
          <p className="eyebrow mono">WALK THE CAMP</p>
          <h2>Streets, walkways, services. Planned as one.</h2>
          <p className="act-sub">
            Covered walkways, lit paths, ablutions and mess at the right
            distances. A village that works from day one.
          </p>
        </div>
        <div className="act act-4">
          <p className="eyebrow mono">CAMP & VILLAGE SCALE</p>
          <h2>We build villages.</h2>
          <p className="act-sub">Mine camps, gas plants, remote communities, housed on schedule.</p>
          <div className="act-cta">
            <a className="btn btn-accent" href="/contact">Send an enquiry</a>
            <a className="btn btn-ghost" href="/shop">Shop all models</a>
          </div>
        </div>
      </div>
    </section>
  );
}