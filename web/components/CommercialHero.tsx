"use client";

/* Commercial split-entry hero (Ben's brief): scrolling builds a single
   accommodation unit into rows, ending as a full camp village —
   "we can pump out 20-50 buildings for your project". */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const UNIT_PHOTOS = ["/cfg/wa_ext.jpg", "/cfg/wa_row.jpg", "/cfg/st_ext.jpg", "/cfg/img1.jpg"];
const CELLS = Array.from({ length: 20 }, (_, i) => UNIT_PHOTOS[i % UNIT_PHOTOS.length]);

const CAPTIONS = [
  { from: 0.0, to: 0.22, eyebrow: "COMMERCIAL · MINING · COMMUNITY · GOVERNMENT", title: "One building.", sub: "Specified, delivered and installed, anywhere your project is." },
  { from: 0.3, to: 0.62, eyebrow: "PROGRAM DELIVERY", title: "Or fifty.", sub: "Rooms, ablutions, kitchens and offices, built out as a coordinated program, not a pile of containers." },
  { from: 0.72, to: 1.01, eyebrow: "CAMP & VILLAGE SCALE", title: "We build villages.", sub: "Mine camps, gas plants, remote communities, housed on schedule." },
];

export default function CommercialHero() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const cells = Array.from(root.querySelectorAll<HTMLElement>(".ch-cell"));
    const captions = Array.from(root.querySelectorAll<HTMLElement>(".ch-cap"));
    const cta = root.querySelector<HTMLElement>(".ch-cta");

    const ctx = gsap.context(() => {
      gsap.set(cells.slice(1), { opacity: 0, scale: 0.65, y: 30 });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=280%",
          pin: ".ch-stage",
          scrub: 1,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            captions.forEach((c, i) => {
              const r = CAPTIONS[i];
              c.classList.toggle("on", p >= r.from && p <= r.to);
            });
            if (cta) cta.classList.toggle("on", p > 0.72);
          },
        },
      });
      tl.to(cells.slice(1), {
        opacity: 1, scale: 1, y: 0,
        ease: "power2.out",
        stagger: { each: 0.03, from: "start" },
        duration: 0.6,
      }, 0.08);
      tl.to(".ch-grid", { scale: 0.94, ease: "none", duration: 0.25 }, 0.75);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero commercial-hero" ref={rootRef}>
      <div className="ch-stage">
        <div className="ch-grid" aria-hidden="true">
          {CELLS.map((src, i) => (
            <div className="ch-cell" key={i}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading={i === 0 ? "eager" : "lazy"} />
            </div>
          ))}
        </div>
        <div className="ch-shade" aria-hidden="true" />
        {CAPTIONS.map((c, i) => (
          <div className={`ch-cap${i === 0 ? " on" : ""}`} key={i}>
            <p className="eyebrow mono">{c.eyebrow}</p>
            <h1 className="display">{c.title}</h1>
            <p className="ch-sub">{c.sub}</p>
          </div>
        ))}
        <div className="ch-cta">
          <a className="btn btn-accent" href="/contact">Talk capability</a>
          <a className="btn btn-ghost" href="/shop">Shop all models</a>
        </div>
      </div>
    </section>
  );
}