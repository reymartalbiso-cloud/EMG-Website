"use client";

/* Scroll-scrubbed build sequence — poster-first (§9).
   The first frame renders immediately as a plain <img> so the hero carries
   itself on any connection; the 719-frame sequence streams in behind it and
   the canvas takes over only once enough frames exist. Slow connections and
   Save-Data get the poster + summary instead of the sequence. */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setPinned } from "@/lib/pinState";
import { loadSequence, wantsSmallFrames } from "@/lib/frameLoader";
import { makeFrameRenderer, scrubFromUrl, pinFromUrl } from "@/lib/scrubDraw";
import PreloadVeil from "@/components/PreloadVeil";
import { PORTAL_URL } from "@/lib/links";

/* 719: the 24fps source motion-interpolated to 48fps (4 Sep), the same
   treatment the camp hero already had. Measured before/after on every
   consecutive pair: median step 11.11 -> 7.37, p90 18.29 -> 12.14, which puts
   this sequence at 1.11x the camp benchmark instead of 1.79x. The 361-frame
   sets are in the scratchpad backups if this ever needs reverting. */
const FRAME_COUNT = 719;
const FRAME_DIR = "/frames/";
const FRAME_DIR_SM = "/frames-sm/";
const frameName = (i: number) =>
  `frame_${String(i + 1).padStart(3, "0")}.webp`;
const framePath = (i: number) => `${FRAME_DIR}${frameName(i)}`;

const PHASES = [
  { until: 0.1, label: "PHASE 01 · RAW SHELL" },
  { until: 0.25, label: "PHASE 02 · X-RAY SCAN" },
  { until: 0.7, label: "PHASE 03 · ASSEMBLY" },
  { until: 1.01, label: "PHASE 04 · HANDOVER" },
];
const ACT_RANGES = [
  { from: 0.0, to: 0.1 },
  { from: 0.125, to: 0.25 },
  { from: 0.3, to: 0.64 },
  { from: 0.78, to: 1.01 },
];

function slowConnection(): boolean {
  const c = (navigator as any).connection;
  if (!c) return false;
  return c.saveData === true || /(^|-)2g/.test(c.effectiveType || "");
}

const ROT_WORDS = ["the outback", "the wet season", "your block"];

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const [rotIdx, setRotIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setRotIdx((i) => (i + 1) % ROT_WORDS.length), 2400);
    return () => clearInterval(t);
  }, []);

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
          end: pinFromUrl(500, 340),
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
          /* redraw when the frame that landed is the one being looked
             at, or close to it, so a finer frame replaces a coarse one
             even while the reader holds still */
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
        {/* Poster carries the hero alone until the sequence is ready */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="hero-poster"
          src={framePath(0)}
          /* the browser picks by viewport x DPR, so a phone takes the
             900px poster and a desktop the full one */
          srcSet={`${FRAME_DIR_SM}${frameName(0)} 900w, ${FRAME_DIR}${frameName(0)} 1440w`}
          sizes="100vw"
          alt=""
          fetchPriority="high"
        />
        <canvas
          className="hero-canvas"
          role="img"
          aria-label="A shipping container transforming into a finished container home"
        />
        <div className="hero-vignette" aria-hidden="true" />

        <div className="hud mono" aria-hidden="true">
          <span className="hud-line" />
          <span className="hud-seq">SEQ 001/719</span>
          <span className="hud-phase">PHASE 01 · RAW SHELL</span>
        </div>

        <div className="act act-1">
          <p className="eyebrow mono">ELITE MANUFACTURING GROUP · HERBERT, NT</p>
          <h1>It starts as a steel box.</h1>
          <p className="act-sub">
            Ready for <span key={rotIdx} className="rot-word swap">{ROT_WORDS[rotIdx]}</span>.
            Scroll, and watch it become a home.
          </p>
          <div className="scroll-cue" aria-hidden="true"><span /></div>
        </div>
        <div className="act act-2">
          <p className="eyebrow mono">ENGINEERED</p>
          <h2>Specified to the millimetre. Certified Class 1A.</h2>
          <p className="act-sub">
            Habitable-standard dwellings. Threshold-free doorways and sunken
            shower bases come standard, not as extras.
          </p>
        </div>
        <div className="act act-3">
          <p className="eyebrow mono">OWNED END-TO-END</p>
          <h2>One company, from factory floor to your floor.</h2>
          <p className="act-sub">
            Shipping, customs, trucking, footings, septic, power and water.
            We run every step, so you deal with one team.
          </p>
        </div>
        <div className="act act-4">
          <p className="eyebrow mono">HANDOVER</p>
          <h2>Order to move-in, typically 4-6 months.</h2>
          <p className="act-sub">Honest timelines, tracked in the open. Watch your build move stage by stage.</p>
          <div className="act-cta">
            <a className="btn btn-accent" href="/build-your-own">Build &amp; price</a>
            <a className="btn btn-ghost" href={PORTAL_URL}>Track your order</a>
          </div>
        </div>
      </div>
    </section>
  );
}