"use client";

/* "Every leg of the journey" — pinned scroll rail for /how-it-works.
   A container marker travels a drawn route through the seven legs of a real
   EMG order while each leg's caption lights up. Deliberately abstract, not a
   map (§1.1: no origin geography). Honest ranges only (§1.3). */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const LEGS = [
  { n: "01", title: "Order locked", time: "WEEK 0", body: "Layout, fit-out and compliance agreed — the spec the whole journey follows." },
  { n: "02", title: "Factory build", time: "TYPICALLY 8–12 WEEKS", body: "Built to our specification by our manufacturing partners, inspected before it ships." },
  { n: "03", title: "At sea", time: "TYPICALLY 4–8 WEEKS", body: "The least predictable leg — which is why we own it, and why our dates are ranges." },
  { n: "04", title: "Port & customs", time: "CLEARED WHILE IT SAILS", body: "Documents forwarded, clearance paid, delivery order issued — ready before the ship berths." },
  { n: "05", title: "The highway", time: "AUSTRALIA-WIDE", body: "Trucked from the port to your block — stations, islands and mine sites included." },
  { n: "06", title: "Your site", time: "SEQUENCED IN ADVANCE", body: "Craned onto footings poured while it was at sea; services connected." },
  { n: "07", title: "Handover", time: "TYPICALLY 4–6 MONTHS ALL UP", body: "Walk-through, keys, warranty — and the portal tracked every leg above, live." },
];

/* gentle rail across the stage with a rise and fall — reads as a journey */
const RAIL = "M 40 210 C 190 130, 310 130, 460 190 S 740 280, 890 200 S 1120 110, 1160 150";

export default function JourneyRail() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const path = root.querySelector<SVGPathElement>(".jr-rail")!;
    const marker = root.querySelector<SVGGElement>(".jr-marker")!;
    const nodes = Array.from(root.querySelectorAll<SVGGElement>(".jr-node"));
    const caps = Array.from(root.querySelectorAll<HTMLElement>(".jr-cap"));

    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;

    /* place nodes along the real path */
    nodes.forEach((node, i) => {
      const pt = path.getPointAtLength((len * i) / (LEGS.length - 1));
      node.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
    });

    const setProgress = (p: number) => {
      path.style.strokeDashoffset = `${len * (1 - p)}`;
      const pt = path.getPointAtLength(len * p);
      const ahead = path.getPointAtLength(Math.min(len, len * p + 1));
      const angle = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI;
      marker.setAttribute("transform", `translate(${pt.x} ${pt.y}) rotate(${angle})`);
      const active = Math.min(LEGS.length - 1, Math.floor(p * LEGS.length));
      nodes.forEach((n, i) => n.classList.toggle("on", p * (LEGS.length - 1) >= i - 0.02));
      caps.forEach((c, i) => c.classList.toggle("on", i === active));
    };

    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      /* pinned scrub — safe now that all hero pins are created eagerly at
         mount, in document order */
      const state = { p: 0 };
      gsap.to(state, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=280%",
          pin: ".jr-stage",
          scrub: 1,
          anticipatePin: 1,
        },
        onUpdate: () => setProgress(state.p),
      });
      setProgress(0);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="jr" ref={rootRef} aria-label="The journey of an order, leg by leg">
      <div className="jr-stage">
        <div className="jr-head">
          <h2 className="display">Every leg of the journey.</h2>
          <p className="jr-sub">One container, one accountable company — scroll to travel with it.</p>
        </div>

        <svg className="jr-svg" viewBox="0 0 1200 340" aria-hidden="true">
          {/* ghost of the full route */}
          <path d={RAIL} className="jr-rail-ghost" />
          {/* drawn-on route */}
          <path d={RAIL} className="jr-rail" />
          {/* waypoints */}
          {LEGS.map((leg, i) => (
            <g className="jr-node" key={leg.n}>
              <circle r="16" className="ring" />
              <circle r="5" className="dot" />
              <text y="38" textAnchor="middle" className="jr-node-n">{leg.n}</text>
            </g>
          ))}
          {/* the container itself */}
          <g className="jr-marker">
            <rect x="-20" y="-12" width="40" height="22" rx="2" className="box" />
            {[-12, -4, 4, 12].map((x) => (
              <line key={x} x1={x} y1={-10} x2={x} y2={8} className="rib" />
            ))}
          </g>
        </svg>

        <div className="jr-caps">
          {LEGS.map((leg, i) => (
            <div className={`jr-cap${i === 0 ? " on" : ""}`} key={leg.n}>
              <span className="mono jr-time">{leg.time}</span>
              <h3 className="display">{leg.n} — {leg.title}</h3>
              <p>{leg.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}