"use client";

/* Route-change wipe, choreographed to Ben's spec (18 Aug): the screen fades
   to black FIRST, the mark pops up on the black, navigation happens under
   cover, and then the orange bar sweeps up to carry it all away — nothing
   ever slides over a still-visible page, which is what he called messy.
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
    /* the orange bar rises to cover the black, the black (and the mark) leave
       behind it, and the bar keeps going off the top to reveal the new page */
    gsap.timeline({ onComplete: () => { covering.current = false; } })
      .fromTo(".wipe-orange", { yPercent: 103 }, { yPercent: 0, duration: 0.38, ease: "power2.in" }, 0.05)
      .set(".wipe-black", { opacity: 0 })
      .set(".wipe-badge", { opacity: 0 })
      .to(".wipe-orange", { yPercent: -103, duration: 0.55, ease: "power3.inOut" }, "+=0.02")
      .set(".page-wipe", { visibility: "hidden", pointerEvents: "none" })
      .set(".wipe-orange", { yPercent: 103 });
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
        {/* the full-size mark: this is the one moment it gets the whole screen */}
        <img src="/emg-mark.webp" alt="" width={800} height={800} />
      </div>
      <div className="wipe-orange" />
    </div>
  );
}
