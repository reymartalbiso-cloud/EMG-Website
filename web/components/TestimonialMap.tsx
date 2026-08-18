"use client";

/* Testimonial map (Ben's idea): a dot-matrix Australia with Herbert NT as
   the glowing home base. Delivery arcs draw out to each customer pin on
   scroll; selecting a pin glides the map toward it. Written testimonials at
   region-level positions only — no street addresses. Video/photo stories
   slot in as customers share them. */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Pin = {
  id: string;
  name: string;
  org: string;
  place: string;
  quote: string;
  x: number; // map viewBox coords (equirectangular, lon/lat projected)
  y: number;
  lx: number; // label offset + anchor, placed to avoid neighbouring pins
  ly: number;
  anchor: "start" | "middle" | "end";
};

const VB = { w: 682, h: 610 };
const HQ = { x: 315, y: 58 }; // Herbert NT, just south-east of Darwin

const PINS: Pin[] = [
  {
    id: "alan", name: "Alan Symms", org: "NT Container Services", place: "Darwin region, NT",
    quote: "I have recommended your products, the main reason is, the quality is there!",
    x: 299, y: 66, lx: -14, ly: 4, anchor: "end",
  },
  {
    id: "tony", name: "Tony Wood", org: "Total Tools Darwin", place: "Darwin, NT",
    quote: "Your product and service stood out from everyone else's.",
    x: 307, y: 52, lx: 0, ly: -15, anchor: "middle",
  },
  {
    id: "kara", name: "Kara Louise", org: "Homeowner", place: "Rural Darwin, NT",
    quote: "Overall very happy with the product and phenomenal service!",
    x: 325, y: 67, lx: 14, ly: 4, anchor: "start",
  },
  {
    id: "russell", name: "Russell Catchpole", org: "RustieJam Pest Control", place: "Northern Territory",
    quote: "Quality product for a great price.",
    x: 341, y: 97, lx: 0, ly: 24, anchor: "middle",
  },
];

/* Australia, projected from real coastline lon/lat (16px per degree lon) */
const MAINLAND =
  "M 31.6 227.8 L 39.6 213.7 L 81.2 192.6 L 118.0 182.0 L 150.0 167.9 L 169.2 148.6 " +
  "L 191.6 134.5 L 204.4 118.6 L 226.8 85.2 L 252.4 76.4 L 263.6 94.0 L 287.6 92.2 " +
  "L 294.0 67.6 L 306.8 49.3 L 322.8 44.7 L 335.6 43.0 L 335.6 34.2 L 356.4 37.7 " +
  "L 377.2 44.7 L 388.4 39.4 L 402.8 46.5 L 396.4 65.8 L 388.4 90.5 L 401.2 109.8 " +
  "L 418.8 120.4 L 441.2 134.5 L 457.2 141.5 L 468.4 136.2 L 476.4 94.0 L 481.2 50.0 " +
  "L 489.2 21.8 L 495.6 18.3 L 506.8 46.5 L 511.6 72.9 L 527.6 81.7 L 538.8 92.2 " +
  "L 540.4 113.4 L 551.6 141.5 L 556.4 164.4 L 574.0 178.5 L 594.8 187.3 L 606.0 210.2 " +
  "L 623.6 224.2 L 644.4 245.4 L 660.4 275.3 L 665.2 299.9 L 671.6 326.3 L 666.8 351.0 " +
  "L 662.0 375.6 L 652.4 403.8 L 639.6 412.6 L 633.2 426.6 L 623.6 449.5 L 615.6 470.6 " +
  "L 612.4 490.0 L 582.0 497.0 L 556.4 516.4 L 540.4 504.1 L 532.4 507.6 L 510.0 512.9 " +
  "L 476.4 505.8 L 450.8 486.5 L 449.2 463.6 L 431.6 458.3 L 423.6 431.9 L 417.2 447.8 " +
  "L 409.2 423.1 L 390.0 444.2 L 377.2 437.2 L 361.2 409.0 L 337.2 393.2 L 310.0 384.4 " +
  "L 262.0 395.0 L 214.0 403.8 L 190.0 426.6 L 164.4 426.6 L 132.4 428.4 L 102.0 447.8 " +
  "L 70.0 442.5 L 55.6 433.7 L 63.6 414.3 L 65.2 389.7 L 52.4 358.0 L 41.2 324.6 " +
  "L 33.2 298.2 L 28.4 277.0 L 34.8 261.2 L 28.4 254.2 Z";
const TASMANIA =
  "M 529.2 546.3 L 559.6 551.6 L 586.8 549.8 L 586.8 571.0 L 572.4 590.3 L 550.0 597.4 L 537.2 572.7 Z";

const STATES = [
  { t: "NT", x: 342, y: 164 }, { t: "QLD", x: 512, y: 217 }, { t: "WA", x: 166, y: 288 },
  { t: "SA", x: 372, y: 358 }, { t: "NSW", x: 552, y: 402 }, { t: "VIC", x: 512, y: 481 },
  { t: "TAS", x: 596, y: 578 },
];

/* gentle quadratic from HQ to a pin, bowed perpendicular to the line */
function arcPath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const dx = to.x - from.x, dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const lift = Math.max(8, len * 0.3);
  const cx = (from.x + to.x) / 2 + (dy / len) * lift;
  const cy = (from.y + to.y) / 2 - (dx / len) * lift;
  return `M ${from.x} ${from.y} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${to.x} ${to.y}`;
}

export default function TestimonialMap() {
  const [active, setActive] = useState<Pin>(PINS[0]);
  const [zoomed, setZoomed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  /* scroll-driven intro: home base lights up, arcs draw out, pins pop —
     unpinned scrub, so it never disturbs pin ordering elsewhere */
  useEffect(() => {
    const root = rootRef.current!;
    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const arcs = gsap.utils.toArray<SVGPathElement>(".tmap-arc", root);
      arcs.forEach((a) => {
        const l = a.getTotalLength();
        a.style.strokeDasharray = `${l}`;
        a.style.strokeDashoffset = `${l}`;
      });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top 82%", end: "top 18%", scrub: 1 },
      });
      tl.fromTo(".tmap-hq-inner", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, transformOrigin: "center", duration: 0.4 })
        .fromTo(".tmap-hq-cap", { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0.2)
        .to(arcs, { strokeDashoffset: 0, duration: 0.9, stagger: 0.18, ease: "none" }, 0.25)
        .fromTo(
          ".tmap-pin-inner",
          { opacity: 0, scale: 0.3 },
          { opacity: 1, scale: 1, transformOrigin: "center", duration: 0.45, stagger: 0.16, ease: "back.out(2)" },
          0.6
        );
    }, root);
    ctxRef.current = ctx;
    return () => { ctxRef.current = null; ctx.revert(); };
  }, []);

  /* glide the viewBox; markers counter-scale (sqrt) so they grow gently,
     not linearly, as the map zooms */
  const glide = (vb: string, z: boolean) => {
    const svg = svgRef.current;
    if (!svg) return;
    setZoomed(z);
    svg.classList.toggle("tmap-zoomed", z);
    const run = () =>
      gsap.to(svg, {
        attr: { viewBox: vb },
        duration: 1.1,
        ease: "power3.inOut",
        overwrite: "auto",
        onUpdate: () => {
          const v = svg.viewBox.baseVal;
          const s = Math.sqrt(v.width / VB.w);
          svg.querySelectorAll<SVGGElement>("[data-x]").forEach((n) => {
            n.setAttribute("transform", `translate(${n.dataset.x} ${n.dataset.y}) scale(${s.toFixed(3)})`);
          });
        },
      });
    if (ctxRef.current) ctxRef.current.add(run);
    else run();
  };

  const select = (p: Pin) => {
    setActive(p);
    const w = 250;
    const h = Math.round((w * VB.h) / VB.w);
    const x = Math.max(0, Math.min(VB.w - w, p.x - w / 2));
    const y = Math.max(0, Math.min(VB.h - h, p.y - h * 0.42));
    glide(`${x} ${y} ${w} ${h}`, true);
  };
  const reset = () => glide(`0 0 ${VB.w} ${VB.h}`, false);

  return (
    <div className="tmap" ref={rootRef}>
      <div className="tmap-map">
        <svg ref={svgRef} viewBox={`0 0 ${VB.w} ${VB.h}`} role="group" aria-label="Map of Australia with customer testimonial locations">
          <defs>
            <pattern id="tmapDots" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" className="tmap-dot" />
            </pattern>
          </defs>

          {/* land — click empty map to zoom back out */}
          <g onClick={() => zoomed && reset()}>
            <rect x="0" y="0" width={VB.w} height={VB.h} fill="transparent" />
            {[MAINLAND, TASMANIA].map((d, i) => (
              <g key={i}>
                <path d={d} className="tmap-base" />
                <path d={d} fill="url(#tmapDots)" />
                <path d={d} className="tmap-outline" vectorEffect="non-scaling-stroke" />
              </g>
            ))}
            {STATES.map((s) => (
              <text key={s.t} x={s.x} y={s.y} className="tmap-state">{s.t}</text>
            ))}
          </g>

          {/* delivery arcs, drawn on scroll */}
          {PINS.map((p) => (
            <path key={p.id} className="tmap-arc" d={arcPath(HQ, p)} vectorEffect="non-scaling-stroke" />
          ))}

          {/* home base */}
          <g data-x={HQ.x} data-y={HQ.y} transform={`translate(${HQ.x} ${HQ.y})`}>
            <g className="tmap-hq-inner">
              <circle r="10" className="tmap-hq-ring" />
              <circle r="10" className="tmap-hq-ring r2" />
              <path d="M -6 -3.5 L 0 -7 L 6 -3.5 L 6 3.5 L 0 7 L -6 3.5 Z" className="tmap-hq-hex" />
            </g>
            <g className="tmap-hq-cap">
              <line x1="8" y1="-4" x2="46" y2="-22" className="tmap-hq-leader" />
              <text x="50" y="-19" className="tmap-label">HERBERT — HOME BASE</text>
            </g>
          </g>

          {/* customer pins */}
          {PINS.map((p) => (
            <g
              key={p.id}
              data-x={p.x}
              data-y={p.y}
              transform={`translate(${p.x} ${p.y})`}
              className={`tmap-pin${active.id === p.id ? " on" : ""}`}
              onClick={() => select(p)}
              role="button"
              tabIndex={0}
              aria-label={`Testimonial from ${p.name}, ${p.place}`}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(p); } }}
            >
              {/* Invisible thumb target. On a phone the map scales to ~0.45,
                 so the 16px logo becomes 7px — the name pills below are the
                 real mobile affordance, but a pin should still be tappable. */}
              <circle r="26" fill="transparent" />
              <g className="tmap-pin-inner">
                <circle r="10" className="tmap-glow" />
                <image href="/emg-logo.png" x="-8" y="-8" width="16" height="16" />
                <text x={p.lx} y={p.ly} textAnchor={p.anchor} className="tmap-pin-name">
                  {p.name.split(" ")[0].toUpperCase()}
                </text>
              </g>
            </g>
          ))}
        </svg>
        <div className="tmap-legend mono" aria-hidden="true">
          <span><i>⬢</i> HOME BASE — HERBERT NT</span>
          <span><i>●</i> CUSTOMER DELIVERY</span>
        </div>
      </div>

      <div className="tmap-side">
        <figure className="quote tmap-quote" key={active.id} aria-live="polite">
          <blockquote>&ldquo;{active.quote}&rdquo;</blockquote>
          <figcaption>
            <strong>{active.name}</strong>
            <span className="mono">{active.org.toUpperCase()} · {active.place.toUpperCase()}</span>
          </figcaption>
        </figure>
        <div className="tmap-names" role="group" aria-label="All testimonials">
          {PINS.map((p) => (
            <button
              key={p.id}
              className={`cfg-pill${active.id === p.id ? " sel" : ""}`}
              onClick={() => select(p)}
            >
              {p.name}
            </button>
          ))}
          {zoomed && (
            <button className="cfg-pill" onClick={reset}>Full map ↺</button>
          )}
        </div>
      </div>
    </div>
  );
}
