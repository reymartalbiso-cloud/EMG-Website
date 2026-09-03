"use client";

/* Route-change wipe: the screen fades to black FIRST, the mark pops up on
   the black, navigation happens under cover, and the cover fades away over
   the new page — nothing ever slides over a still-visible page, which is
   what Ben called messy (18 Aug). His original spec ended with an orange
   bar sweeping up to carry the black away; Reymart had it removed (3 Sep)
   because it read as an orange flash on every navigation.
   No transforms ever touch <main>, so hero pin creation is unaffected.
   Back/forward navigation skips the wipe (no click to intercept). */

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

export default function PageWipe() {
  const router = useRouter();
  const pathname = usePathname();
  const covering = useRef(false);
  const firstRender = useRef(true);
  const failsafe = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reveal = () => {
    if (failsafe.current) { clearTimeout(failsafe.current); failsafe.current = null; }
    /* the mark leaves first, then the black lifts off the new page. A touch
       of hold (0.12s) keeps the badge from blinking on very fast loads. */
    gsap.timeline({ onComplete: () => { covering.current = false; } })
      .to(".wipe-badge", { opacity: 0, scale: 0.94, duration: 0.24, ease: "power1.in" }, 0.12)
      .to(".wipe-black", { opacity: 0, duration: 0.4, ease: "power1.inOut" }, "-=0.08")
      .set(".page-wipe", { visibility: "hidden", pointerEvents: "none" });
  };

  /* intercept internal left-clicks and play the cover before navigating */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (!href.startsWith("/") || href.startsWith("//")) return;
      if ((a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      /* strip BOTH the hash and the query: /build-your-own?model=x from
         /build-your-own never changes the pathname, so the cover would play
         and then sit there until the failsafe */
      const path = href.split("#")[0].split("?")[0];
      if (!path || path === window.location.pathname) return; // hash/same-page: default
      e.preventDefault();
      if (covering.current) return;
      covering.current = true;
      /* the first-visit preload veil is a landing-only device: once the
         visitor navigates, the wipe owns every cover from here on */
      document.documentElement.classList.remove("first-load");
      /* black first, then the mark on the black — never anything moving over
         the still-visible page */
      gsap.timeline({ onComplete: () => router.push(href) })
        .set(".page-wipe", { visibility: "visible", pointerEvents: "auto" })
        .fromTo(".wipe-black", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.inOut" })
        .fromTo(".wipe-badge", { opacity: 0, scale: 0.82 }, { opacity: 1, scale: 1, duration: 0.32, ease: "power2.out" }, "-=0.06");
      /* never strand the user behind the wipe if navigation stalls */
      failsafe.current = setTimeout(reveal, 3000);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  /* the new route has rendered under the cover — sweep it away */
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (!covering.current) return; // back/forward — no cover was played
    reveal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="page-wipe" aria-hidden="true">
      <div className="wipe-black" />
      {/* The mark carries "Elite Manufacturing Group" itself, so there is no
         wordmark beside it — at this size a second one would just crowd it. */}
      <div className="wipe-badge">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {/* This is the one moment the mark gets the whole screen, but the CSS
            caps it at 460px, so 512px lossless is the right file: pixel-exact
            for every ordinary display and at worst a 1.2x upscale on a very
            high-density phone, for a geometric logo shown over black for half
            a second. The 800px copy used to load on EVERY page whether the
            reader navigated or not, 303KB of a logo nobody had asked for. */}
        <img src="/emg-mark-md.webp" alt="" width={512} height={512} />
      </div>
    </div>
  );
}
