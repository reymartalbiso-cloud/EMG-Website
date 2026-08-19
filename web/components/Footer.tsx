import Link from "next/link";
import { PORTAL_URL } from "@/lib/links";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <p className="nav-brand-main">ELITE</p>
          <p className="nav-brand-sub">MANUFACTURING GROUP</p>
          <p className="footer-muted">
            Container buildings delivered and installed Australia-wide —
            owned end-to-end, from factory to handover.
          </p>
        </div>
        <div className="mono footer-meta">
          <p>HERBERT, NORTHERN TERRITORY</p>
          <p>PHONE 0420 251 550</p>
          <p>ADMIN@ELITEMANUFACTURING.COM.AU</p>
          <p>ABN 13 669 513 473</p>
        </div>
        <div className="footer-links">
          <Link href="/homes">Homes</Link>
          <Link href="/commercial">Commercial</Link>
          <Link href="/domes">Domes</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/testimonials">Testimonials</Link>
          <Link href="/quality">Quality &amp; compliance</Link>
        </div>
        <div className="footer-links">
          <Link href="/how-it-works">How it works</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <a href={PORTAL_URL}>Track your order</a>
          <a href="https://www.instagram.com/elite_manufacturing" rel="noopener">Instagram</a>
          <a href="https://www.facebook.com/elitemanufacturing" rel="noopener">Facebook</a>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
      {/* mega wordmark: outline letters rise on scroll, fill laterite on hover */}
      <div className="footer-mega display" aria-hidden="true">
        {"ELITE".split("").map((c, i) => (
          <span className="fm-ch" key={i}>{c}</span>
        ))}
      </div>
    </footer>
  );
}