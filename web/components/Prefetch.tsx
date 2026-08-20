"use client";

/* Idle prefetch. Once the landing page has settled, quietly warm the browser
   cache with the opening frames of the OTHER pages' scrub sequences, so the
   first scroll after any navigation is as smooth as the landing was. One
   frame at a time at low priority, once per visit, never on save-data or 2g
   connections. */

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SEQS: [route: string, base: string][] = [
  ["/residential", "/frames/"],
  ["/commercial", "/campframes/"],
  ["/how-it-works", "/journeyframes/"],
];
const COUNT = 48; /* matches the veil gate: the opening act of each hero */

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
      for (const [route, base] of SEQS) {
        if (pathname.startsWith(route)) continue; /* its own hero streams itself */
        for (let i = 1; i <= COUNT && !cancelled; i++) {
          const url = `${base}frame_${String(i).padStart(3, "0")}.webp`;
          try { await fetch(url, { priority: "low" } as RequestInit); } catch { return; }
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
