"use client";

/* "Every leg of the journey" — pinned scroll rail for /how-it-works.
   A container marker travels a drawn route through the seven legs of a real
   EMG order while each leg's caption lights up. Deliberately abstract, not a
   map (§1.1: no origin geography). Honest ranges only (§1.3).

   Two drawings of the same journey: a wide rail for landscape screens and a
   portrait snake for phones, where the wide one rendered as an illegible
   9px squiggle (Joel's analytics: most visitors are on phones). Both are in
   the DOM and CSS shows exactly one; the single scrub drives whichever is
   visible — no pin is ever torn down and rebuilt, which is the mistake the
   eager-pin rule exists to prevent. */

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
const RAIL_WIDE = "M 40 210 C 190 130, 310 130, 460 190 S 740 280, 890 200 S 1120 110, 1160 150";
/* the same journey turned on its side for a portrait screen */
const RAIL_TALL = "M 60 36 C 300 50, 370 120, 250 170 S 50 250, 160 310 S 380 380, 300 430";

function RailSvg({ d, viewBox, variant, style }: { d: string; viewBox: string; variant: string; style?: React.CSSProperties }) {
  /* width/height ATTRIBUTES give the svg an intrinsic size. Without them
     Chrome fell back to the 640px default object width whenever CSS asked for
     width:auto, and the drawing shoved off the right edge of a phone. */
  const [, , vw, vh] = viewBox.split(" ");
  return (
    <svg className={`jr-svg jr-svg-${variant}`} viewBox={viewBox} width={vw} height={vh} style={style} aria-hidden="true">
      {/* ghost of the full route */}
      <path d={d} className="jr-rail-ghost" />
      {/* drawn-on route */}
      <path d={d} className="jr-rail" />
      {/* waypoints */}
      {LEGS.map((leg) => (
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
  );
}

export default function JourneyRail() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const caps = Array.from(root.querySelectorAll<HTMLElement>(".jr-cap"));

    /* both drawings are prepared; setProgress drives them in lockstep, so the
       one CSS reveals is always correct — orientation changes included */
    const rails = Array.from(root.querySelectorAll<SVGSVGElement>(".jr-svg")).map((svg) => {
      const path = svg.querySelector<SVGPathElement>(".jr-rail")!;
      const marker = svg.querySelector<SVGGElement>(".jr-marker")!;
      const nodes = Array.from(svg.querySelectorAll<SVGGElement>(".jr-node"));
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;
      nodes.forEach((node, i) => {
        const pt = path.getPointAtLength((len * i) / (LEGS.length - 1));
        node.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
      });
      return { path, marker, nodes, len };
    });

    const setProgress = (p: number) => {
      const active = Math.min(LEGS.length - 1, Math.floor(p * LEGS.length));
      for (const r of rails) {
        r.path.style.strokeDashoffset = `${r.len * (1 - p)}`;
        const pt = r.path.getPointAtLength(r.len * p);
        const ahead = r.path.getPointAtLength(Math.min(r.len, r.len * p + 1));
        const angle = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI;
        r.marker.setAttribute("transform", `translate(${pt.x} ${pt.y}) rotate(${angle})`);
        r.nodes.forEach((n, i) => n.classList.toggle("on", p * (LEGS.length - 1) >= i - 0.02));
      }
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

        <RailSvg d={RAIL_WIDE} viewBox="0 0 1200 340" variant="wide" />
        {/* HEIGHT-driven sizing, inline. Width-driven rules (width:100%,
           max-width, even inline min()) all made this svg compute a phantom
           640px width; only a definite height with width:auto sizes it by the
           viewBox aspect. Height also caps the pinned stage to one screen. */}
        <RailSvg
          d={RAIL_TALL}
          viewBox="0 0 420 484"
          variant="tall"
          style={{ height: "min(40svh, 380px)", width: "auto", margin: "0 auto" }}
        />

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
