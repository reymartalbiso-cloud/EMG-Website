"use client";

/* First-visit load gate. A branded curtain covers the very first paint and
   holds until the opening stretch of the hero sequence is cached, so the
   first scroll a customer ever makes is already smooth. Hard rules:
   - shows ONLY on the first hard load of a visit (html.first-load, stamped
     by the inline head script before paint; repeat loads never see it)
   - releases at GATE loaded frames or MAX_WAIT, whichever comes first — a
     customer on bad reception is never held hostage to a spinner
   - no JS → never shown (CSS gates it behind html.js)
   Heroes report progress via the "emg:preload" window event; their save-data
   path reports done immediately, so those customers get one brand beat. */

import { useEffect, useRef } from "react";

const GATE = 48;       /* frames that carry the opening act of every sequence */
const MAX_WAIT = 4000;
const MIN_SHOW = 450;  /* long enough to read as a beat, not a flicker */

export default function PreloadVeil() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const html = document.documentElement;
    /* mid-session navigation or a repeat visit: the CSS already hides us */
    if (!html.classList.contains("first-load")) return;

    /* the mark fades in whole — a half-painted logo reads as broken */
    const mark = el.querySelector<HTMLImageElement>(".veil-inner img")!;
    if (mark.complete && mark.naturalWidth > 0) mark.classList.add("in");
    else mark.onload = () => mark.classList.add("in");

    const t0 = performance.now();
    let done = false;
    const pct = el.querySelector<HTMLElement>(".veil-pct")!;
    const bar = el.querySelector<HTMLElement>(".veil-bar span")!;

    const finish = () => {
      if (done) return;
      done = true;
      pct.textContent = "100%";
      bar.style.width = "100%";
      const hold = Math.max(0, MIN_SHOW - (performance.now() - t0));
      setTimeout(() => {
        el.classList.add("off");
        /* keep first-load through the fade (it holds display), drop it after */
        setTimeout(() => html.classList.remove("first-load"), 800);
      }, hold);
    };

    const onProgress = (e: Event) => {
      const { loaded, total } = (e as CustomEvent).detail as { loaded: number; total: number };
      const gate = Math.min(GATE, total);
      if (loaded >= gate) { finish(); return; }
      const p = Math.min(1, loaded / gate);
      pct.textContent = `${Math.round(p * 100)}%`;
      bar.style.width = `${p * 100}%`;
    };
    window.addEventListener("emg:preload", onProgress);
    const failsafe = setTimeout(finish, MAX_WAIT);

    /* the page must not scroll blind while covered */
    const block = (e: Event) => { if (!done) e.preventDefault(); };
    el.addEventListener("wheel", block, { passive: false });
    el.addEventListener("touchmove", block, { passive: false });

    return () => {
      window.removeEventListener("emg:preload", onProgress);
      clearTimeout(failsafe);
      el.removeEventListener("wheel", block);
      el.removeEventListener("touchmove", block);
    };
  }, []);

  return (
    <div className="preload-veil" ref={ref} role="status" aria-label="Loading Elite Manufacturing">
      <div className="veil-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/emg-mark-sm.webp" alt="" width={76} height={76} fetchPriority="high" />
        <p className="mono veil-brand">ELITE MANUFACTURING GROUP</p>
        <p className="display veil-pct">0%</p>
        <div className="veil-bar" aria-hidden="true"><span /></div>
      </div>
    </div>
  );
}
