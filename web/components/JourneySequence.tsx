"use client";

/* /how-it-works hero: scroll-scrubbed transport film — factory bay → open
   ocean → outback highway → crane placement, linked by match-move
   transformations. Same poster-first pipeline as the other heroes. */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const FRAME_COUNT = 361;
const framePath = (i: number) =>
  `/journeyframes/frame_${String(i + 1).padStart(3, "0")}.webp`;

const PHASES = [
  { until: 0.18, label: "LEG 01 — THE FACTORY" },
  { until: 0.45, label: "LEG 02 — AT SEA" },
  { until: 0.72, label: "LEG 03 — THE HIGHWAY" },
  { until: 1.01, label: "LEG 04 — YOUR BLOCK" },
];
const ACT_RANGES = [
  { from: 0.0, to: 0.13 },
  { from: 0.2, to: 0.41 },
  { from: 0.48, to: 0.66 },
  { from: 0.76, to: 1.01 },
];

function slowConnection(): boolean {
  const c = (navigator as any).connection;
  if (!c) return false;
  return c.saveData === true || /(^|-)2g/.test(c.effectiveType || "");
}

export default function JourneySequence() {
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
    let loaded = 0;
    let current = 0;
    let started = false;
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
      });
      const frame = Math.round(p * (FRAME_COUNT - 1));
      hudSeq.textContent = `SEQ ${String(frame + 1).padStart(3, "0")}/${FRAME_COUNT}`;
      hudPhase.textContent = PHASES.find((ph) => p <= ph.until)!.label;
    }

    function startStatic() {
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
          end: "+=450%",
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
      started = true;
      start();
      let inFlight = 0, next = 0;
      const pump = () => {
        while (inFlight < 8 && next < FRAME_COUNT && !killed) {
          const i = next++;
          const img = new Image();
          img.decoding = "async";
          img.onload = img.onerror = () => {
            inFlight--; loaded++;
            if (loaded === 1 || loaded === FRAME_COUNT) drawFrame(current);
            pump();
          };
          img.src = framePath(i);
          images[i] = img;
          inFlight++;
        }
      };
      pump();
    }

    return () => { killed = true; cleanups.forEach((fn) => fn()); };
  }, []);

  return (
    <section className="hero" ref={rootRef}>
      <div className="hero-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hero-poster" src={framePath(0)} alt="" fetchPriority="high" />
        <canvas
          className="hero-canvas"
          role="img"
          aria-label="A container travelling from the factory, across the ocean, up the highway and onto a bush block"
        />
        <div className="hero-vignette" aria-hidden="true" />

        <div className="hud mono" aria-hidden="true">
          <span className="hud-line" />
          <span className="hud-seq">SEQ 001/361</span>
          <span className="hud-phase">LEG 01 — THE FACTORY</span>
        </div>

        <div className="act act-1">
          <p className="eyebrow mono">HOW IT WORKS</p>
          <h1>Built to our spec.</h1>
          <p className="act-sub">Every journey starts the same way: one steel box, finished to the millimetre. Scroll to travel with it.</p>
          <div className="scroll-cue" aria-hidden="true"><span /></div>
        </div>
        <div className="act act-2">
          <h2>Across open water.</h2>
          <p className="act-sub">
            The least predictable leg of the journey — so we own it: the
            booking, the customs entry, the clearance, all handled while it sails.
          </p>
        </div>
        <div className="act act-3">
          <h2>Up the highway.</h2>
          <p className="act-sub">
            From the port to anywhere the NT and Queensland roads reach —
            stations, islands and mine sites included.
          </p>
        </div>
        <div className="act act-4">
          <h2>Onto your block.</h2>
          <p className="act-sub">
            Craned onto footings poured while it was at sea. One journey, one
            accountable company — typically 4–6 months, order to keys.
          </p>
        </div>
      </div>
    </section>
  );
}