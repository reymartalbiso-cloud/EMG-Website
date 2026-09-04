"use client";

/* Commercial hero: scroll-scrubbed camp-build sequence — one unit multiplies
   into a workers' village while the visitor "walks" the camp by scrolling.
   Same poster-first pipeline as the residential hero. */

import { useEffect, useRef } from "react";
import PreloadVeil from "@/components/PreloadVeil";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setPinned } from "@/lib/pinState";
import { loadSequence, wantsSmallFrames } from "@/lib/frameLoader";
import { makeFrameRenderer, scrubFromUrl, pinFromUrl } from "@/lib/scrubDraw";

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

/* ?mode=chapters — Reymart's idea (3 Sep): instead of the scroll scrubbing
   frames, crossing a phase boundary plays the film forward to the next stop
   at its native rate while the page keeps scrolling freely. Prototype for
   him and Ben to feel against the scrub; nothing loads it without the flag.
   The pin, captions and HUD are the same code either way. */
const chaptersWanted = () => {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("mode") === "chapters";
};
const CHAPTER_VIDEO = "/campframes/camp-chapters.mp4";
/* rest points as fractions of the film: the start, then each phase boundary,
   then the finished village (0.9 rather than 1.01 so the ending actually
   plays when the reader nears the bottom of the pin) */
const CHAPTER_AT = [0, 0.14, 0.48, 0.78, 0.9];

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

    const images: (HTMLImageElement | undefined)[] = new Array(FRAME_COUNT);
    let current = 0;
    let killed = false;
    /* set only in chapters mode; the scroll trigger feeds it progress */
    let chapterUpdate: ((p: number) => void) | null = null;
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
          end: pinFromUrl(380, 280),
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
          onUpdate: (self) => {
            updateOverlays(self.progress);
            chapterUpdate?.(self.progress);
          },
        },
        onUpdate: () => {
          if (chapterUpdate) return; // the film drives the picture, not the canvas
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

    function startChapters() {
      const video = root.querySelector<HTMLVideoElement>(".hero-video")!;
      root.classList.add("chapters");
      video.src = CHAPTER_VIDEO;
      video.preload = "auto";
      /* the veil must never wait on a mode the loader knows nothing about */
      window.dispatchEvent(new CustomEvent("emg:preload", { detail: { loaded: 1, total: 1, ready: true } }));
      video.addEventListener("canplay", () => { poster.style.opacity = "0"; }, { once: true });

      let stage = 0;          // which rest point the film is parked at (or heading to)
      let playingTo = -1;     // target time while the film is running, else -1
      let raf = 0;
      const stopTime = (k: number) =>
        Math.min(CHAPTER_AT[k] * (video.duration || 19.9), (video.duration || 19.9) - 0.05);

      const settle = () => {
        video.pause();
        video.currentTime = stopTime(stage);
        playingTo = -1;
      };
      const watch = () => {
        if (playingTo >= 0 && video.currentTime >= playingTo) settle();
        if (!killed) raf = requestAnimationFrame(watch);
      };
      raf = requestAnimationFrame(watch);
      cleanups.push(() => cancelAnimationFrame(raf));

      const stageOf = (p: number) => {
        let k = 0;
        for (let i = 1; i < CHAPTER_AT.length; i++) if (p >= CHAPTER_AT[i]) k = i;
        return k;
      };
      chapterUpdate = (p: number) => {
        const k = stageOf(p);
        if (k === stage) return;
        if (k > stage) {
          /* forward: let the film run to the new rest point at its own pace */
          stage = k;
          playingTo = stopTime(k);
          video.play()?.catch(() => { /* autoplay veto: park at the stop instead */ settle(); });
        } else {
          /* backward: film can't run in reverse, so cut straight to the stop */
          stage = k;
          settle();
        }
      };

      /* same pin, same captions, same HUD — only the picture's driver differs */
      start();
    }

    if (slowConnection()) {
      startStatic();
    } else if (chaptersWanted()) {
      startChapters();
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
          srcSet={`${FRAME_DIR_SM}${frameName(0)} 900w, ${FRAME_DIR}${frameName(0)} 1440w`}
          sizes="100vw"
          alt=""
          fetchPriority="high"
        />
        <canvas
          className="hero-canvas"
          role="img"
          aria-label="A single accommodation unit multiplying into a full workers' camp village"
        />
        {/* chapters prototype: empty and inert unless ?mode=chapters sets a src */}
        <video className="hero-video" playsInline muted preload="none" aria-hidden="true" />
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