"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PORTAL_URL } from "@/lib/links";

const LINKS = [
  { href: "/homes", label: "Homes" },
  { href: "/commercial", label: "Commercial" },
  { href: "/shop", label: "Shop All" },
  { href: "/build-your-own", label: "Build Your Own" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/finance", label: "Finance" },
  { href: "/about", label: "About" },
];

function ThemeToggle() {
  const [theme, setTheme] = useState<string>("dark");
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || "dark");
  }, []);
  const flip = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("emg-theme", next);
    setTheme(next);
  };
  return (
    <button className="theme-toggle" onClick={flip} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
      {theme === "dark" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(false);
  /* Below 940px the links do not fit across the bar, so they move into a
     panel. Without this there was no way to reach any page from a phone —
     only the brand and Track Your Order were left on screen. */
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const hasHero = !!document.querySelector(".hero");
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setOverHero(hasHero && window.scrollY < window.innerHeight * 6);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  /* Close on navigation, and never leave the page unscrollable behind it. */
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}${overHero ? " over-hero" : ""}${menuOpen ? " menu-open" : ""}`}>
      <Link className="nav-brand" href="/" aria-label="Elite Manufacturing Group — home">
        {/* the transparent mark, not the black-square logo — at this size the
           square's edge would show against the bar */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="nav-logo" src="/emg-mark.png" alt="" width={46} height={46} />
        <div>
          <span className="nav-brand-main">ELITE</span>
          <span className="nav-brand-sub">MANUFACTURING GROUP</span>
        </div>
      </Link>

      <nav className="nav-links" aria-label="Primary">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={pathname.startsWith(l.href) ? "page" : undefined}
          >
            {l.label}
          </Link>
        ))}
        <ThemeToggle />
        <a className="btn btn-accent nav-track" href={PORTAL_URL}>
          Track Your Order
        </a>
      </nav>

      <button
        className="nav-burger"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span /><span /><span />
      </button>

      <div
        id="mobile-menu"
        className={`nav-panel${menuOpen ? " open" : ""}`}
        hidden={!menuOpen}
      >
        <nav aria-label="Primary, mobile">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname.startsWith(l.href) ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
        </nav>
        <div className="nav-panel-foot">
          <a className="btn btn-accent" href={PORTAL_URL}>Track Your Order</a>
          <a className="btn btn-ghost" href="tel:0420251550">Call 0420 251 550</a>
          {/* the toggle lives in the bar on desktop; it would be lost on a
             phone otherwise, where the bar only has room for the burger */}
          <div className="nav-panel-theme">
            <ThemeToggle />
            <span className="mono">Switch theme</span>
          </div>
        </div>
      </div>
    </header>
  );
}