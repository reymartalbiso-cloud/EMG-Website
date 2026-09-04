"use client";

/* /how-it-works hero: scroll-scrubbed transport film — factory bay → open
   ocean → outback highway → crane placement, linked by match-move
   transformations. Same poster-first pipeline as the other heroes. */

import { useEffect, useRef } from "react";
import PreloadVeil from "@/components/PreloadVeil";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setPinned } from "@/lib/pinState";
import { loadSequence, wantsSmallFrames } from "@/lib/frameLoader";
import { makeFrameRenderer, scrubFromUrl, pinFromUrl, actSnap } from "@/lib/scrubDraw";

/* 719: motion-interpolated 24->48fps from the source video (4 Sep) —
   median step 11.84 -> 7.29 vs camp's 6.65. */
const FRAME_COUNT = 719;
const FRAME_DIR = "/journeyframes/";
const FRAME_DIR_SM = "/journeyframes-sm/";
const frameName = (i: number) =>
  `frame_${String(i + 1).padStart(3, "0")}.webp`;
const framePath = (i: number) => `${FRAME_DIR}${frameName(i)}`;

const PHASES = [
  { until: 0.18, label: "LEG 01 · THE FACTORY" },
  { until: 0.45, label: "LEG 02 · AT SEA" },
  { until: 0.72, label: "LEG 03 · THE HIGHWAY" },
  { until: 1.01, label: "LEG 04 · YOUR BLOCK" },
];
/* where each act comes to REST (0-based frames): the stillest legible frame
   in each caption window, hand-checked 5 Sep. The last act rests on the final
   frame via actSnap, so leaving the hero never needs a second stop. */
const SNAP_FRAMES = [29, 163, 270];

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

    const images: (HTMLImageElement | undefined)[] = new Array(FRAME_COUNT);
    let current = 0;
    let killed = false;
    const cleanups: (() => void)[] = [];

    function sizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      renderer.redraw();
    }

    /* the renderer owns nearest-loaded fallback and the sub-frame blend that
       stops the picture standing still through a slow scrub */
    const renderer = makeFrameRenderer(canvas, images, FRAME_COUNT, () => {
      poster.style.opacity = "0";
    });
    function drawFrame(index: number) { renderer.draw(index); }

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
          end: pinFromUrl(450, 320),
          pin: ".hero-stage",
          /* the floating buttons stand down while this owns the screen */
          onToggle: (self) => setPinned(self.isActive),
          /* 0 is EXPLICIT and it is what has actually shipped since 31 Aug:
             a Number(null)===0 bug in scrubFromUrl silently overrode the 0.3
             everyone believed was live, and nobody - Ben included - found the
             result too tight. The picture answers the finger directly; the
             only smoothing left is Lenis. (Reymart's original "0.3 over 1"
             choice was made through the same bug: both test URLs carried
             explicit params, the no-param page he approved was scrub 0.) */
          scrub: scrubFromUrl(0),
          anticipatePin: 1,
          snap: actSnap(SNAP_FRAMES, FRAME_COUNT) as never,
          onUpdate: (self) => updateOverlays(self.progress),
        },
        onUpdate: () => {
          /* the float, not the rounded integer: the blend lives between the
             two frames either side of it, and rounding threw that away */
          const f = playhead.frame;
          if (Math.abs(f - current) > 0.008) { current = f; drawFrame(f); }
        },
      });
      cleanups.push(() => { tween.scrollTrigger?.kill(); tween.kill(); });

      hud.classList.add("on");
      updateOverlays(0);

      /* The film ends, the captions dissolve. Without this the closing caption
         held at full opacity while the section scrolled away, sliding up
         through the fixed wordmark: two sets of large white type tangled for
         about half a second on every phone. */
      const exit = ScrollTrigger.create({
        trigger: root,
        start: "bottom bottom",
        end: "bottom 72%",
        onUpdate: (self) => root.style.setProperty("--exit", String(1 - self.progress)),
        onLeaveBack: () => root.style.setProperty("--exit", "1"),
      });
      cleanups.push(() => exit.kill());

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
          aria-label="A container travelling from the factory, across the ocean, up the highway and onto a bush block"
        />
        <div className="hero-vignette" aria-hidden="true" />

        <div className="hud mono" aria-hidden="true">
          <span className="hud-line" />
          <span className="hud-seq">SEQ 001/719</span>
          <span className="hud-phase">LEG 01 · THE FACTORY</span>
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
            The least predictable leg of the journey, so we own it: the
            booking, the customs entry, the clearance, all handled while it sails.
          </p>
        </div>
        <div className="act act-3">
          <h2>Up the highway.</h2>
          <p className="act-sub">
            From the port to anywhere Australia's roads reach.
            Stations, islands and mine sites included.
          </p>
        </div>
        <div className="act act-4">
          <h2>Onto your block.</h2>
          <p className="act-sub">
            Craned onto footings poured while it was at sea. One journey, one
            accountable company, typically 4-6 months, order to keys.
          </p>
        </div>
      </div>
    </section>
  );
}