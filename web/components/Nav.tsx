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

  return (
    <header className={`nav${scrolled ? " scrolled" : ""}${overHero ? " over-hero" : ""}`}>
      <Link className="nav-brand" href="/" aria-label="Elite Manufacturing Group — home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="nav-logo" src="/emg-logo.png" alt="" width={34} height={34} />
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
    </header>
  );
}