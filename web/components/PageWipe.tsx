"use client";

/* Route-change wipe: internal link clicks are intercepted, a laterite panel
   chased by a steel panel sweeps up to cover the screen, navigation happens
   under cover, and the panels continue up and away over the new page.
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
    gsap.timeline({ onComplete: () => { covering.current = false; } })
      .to(".wipe-badge", { opacity: 0, duration: 0.2, ease: "power1.in" }, 0.08)
      .to(".wipe-panel", { yPercent: -103, duration: 0.6, ease: "power4.inOut", stagger: 0.08 }, 0.08)
      .set(".page-wipe", { visibility: "hidden", pointerEvents: "none" })
      .set(".wipe-panel", { yPercent: 103 });
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
      const [path] = href.split("#");
      if (!path || path === window.location.pathname) return; // hash/same-page: default
      e.preventDefault();
      if (covering.current) return;
      covering.current = true;
      gsap.timeline({ onComplete: () => router.push(href) })
        .set(".page-wipe", { visibility: "visible", pointerEvents: "auto" })
        .fromTo(".wipe-panel", { yPercent: 103 }, { yPercent: 0, duration: 0.45, ease: "power3.in", stagger: 0.07 })
        .fromTo(".wipe-badge", { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" }, "-=0.12");
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
      <div className="wipe-panel p1" />
      <div className="wipe-panel p2" />
      {/* The mark carries "Elite Manufacturing Group" itself, so there is no
         wordmark beside it — at this size a second one would just crowd it. */}
      <div className="wipe-badge">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/emg-mark.png" alt="" width={800} height={800} />
      </div>
    </div>
  );
}
