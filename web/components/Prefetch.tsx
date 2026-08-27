"use client";

/* Idle prefetch. Once the landing page has settled, quietly warm the browser
   cache for the OTHER pages' scrub sequences, so the first scroll after any
   navigation is as smooth as the landing was.

   It warms exactly the frames the loader will ask for first: the interleaved
   coarse pass, spread across the whole sequence. Warming frames 1..48 in a row
   would only prefill the opening seconds; warming every 16th means the next
   page can scrub end to end the instant it mounts, and its load veil lifts
   immediately. One request at a time at low priority, once per visit, never on
   save-data or 2g. */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { coarseCount, interleavedOrder, wantsSmallFrames } from "@/lib/frameLoader";

const SEQS: { route: string; big: string; small: string; count: number }[] = [
  { route: "/residential", big: "/frames/", small: "/frames-sm/", count: 361 },
  { route: "/commercial", big: "/campframes/", small: "/campframes-sm/", count: 479 },
  { route: "/how-it-works", big: "/journeyframes/", small: "/journeyframes-sm/", count: 361 },
];

const frameName = (i: number) => `frame_${String(i + 1).padStart(3, "0")}.webp`;

export default function Prefetch() {
  const pathname = usePathname();

  useEffect(() => {
    try { if (sessionStorage.getItem("emg-prefetched")) return; } catch { return; }
    const c = (navigator as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (c && (c.saveData === true || /(^|-)2g/.test(c.effectiveType || ""))) return;

    let cancelled = false;
    const run = async () => {
      try { sessionStorage.setItem("emg-prefetched", "1"); } catch {}
      /* the page-wipe badge shows the mark at up to 460px and is needed the
         first time someone navigates, so warm it before that happens */
      try { await fetch("/emg-mark.webp", { priority: "low" } as RequestInit); } catch {}

      const small = wantsSmallFrames();
      for (const seq of SEQS) {
        if (pathname.startsWith(seq.route)) continue; /* its own hero streams itself */
        const dir = small ? seq.small : seq.big;
        const coarse = interleavedOrder(seq.count).slice(0, coarseCount(seq.count));
        for (const i of coarse) {
          if (cancelled) return;
          try { await fetch(`${dir}${frameName(i)}`, { priority: "low" } as RequestInit); }
          catch { return; }
        }
      }
    };
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const id = w.requestIdleCallback
      ? w.requestIdleCallback(run, { timeout: 8000 })
      : window.setTimeout(run, 4500);
    return () => {
      cancelled = true;
      if (w.requestIdleCallback) w.cancelIdleCallback?.(id as number);
      else clearTimeout(id as number);
    };
  }, [pathname]);

  return null;
}
