"use client";

/* Floating "Get a quote" + back-to-top buttons (from Joel's prototype) */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Fabs() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onConfigurator = pathname === "/build-your-own";
  /* the commercial buyer is scoping a program, not pricing a retail build —
     the floating action follows the audience */
  const commercial = pathname.startsWith("/commercial");

  return (
    <>
      {!onConfigurator && (
        <Link
          href={commercial ? "/commercial#camp-scoper" : "/build-your-own"}
          className={`fab fab-quote${show ? " show" : ""}`}
        >
          {commercial ? "Scope a camp ↗" : "Build & price ↗"}
        </Link>
      )}
      <button
        className={`fab fab-top${show ? " show" : ""}`}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </>
  );
}