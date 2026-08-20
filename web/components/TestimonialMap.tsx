"use client";

/* Testimonial map, 3D (Ben, 20 Aug): the dot-matrix Australia is now an
   extruded plate tilted into perspective. Each customer floats above their
   region on a stem, and selecting one opens their testimony as a card on the
   map itself.

   Built from CSS 3D transforms over the SAME SVG geometry as before, not
   WebGL: nothing extra to download, no second animation library fighting GSAP
   for frames, and the pins stay real <button>s so keyboard and screen-reader
   behaviour is unchanged.

   The 3D maths lives in two CSS variables, --tilt and --spin, set on the
   scene. Anything that must face the viewer counter-rotates by exactly the
   negation of both, so changing the tilt (which the mobile breakpoint does)
   can never desynchronise the pins from the plate.

   Region-level positions only, never street addresses. */

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
  lift: number; // how high this pin floats, in px of plate space
  dx: number; // screen-space nudge for the chip, so five northern pins can breathe
};

const VB = { w: 682, h: 610 };
const HQ = { x: 315, y: 58, lift: 132, dx: 0 }; // Herbert NT, just south-east of Darwin

/* Every customer so far is within an hour of Darwin, so geography alone puts
   all five markers inside a 45px circle. Height plus a horizontal nudge is
   what separates them; the stem still shows which patch of dirt is theirs. */
const PINS: Pin[] = [
  {
    id: "alan", name: "Alan Symms", org: "NT Container Services", place: "Darwin region, NT",
    quote: "I have recommended your products, the main reason is, the quality is there!",
    x: 299, y: 66, lift: 62, dx: -104,
  },
  {
    id: "tony", name: "Tony Wood", org: "Total Tools Darwin", place: "Darwin, NT",
    quote: "Your product and service stood out from everyone else's.",
    x: 307, y: 52, lift: 96, dx: -58,
  },
  {
    id: "kara", name: "Kara Louise", org: "Homeowner", place: "Rural Darwin, NT",
    quote: "Overall very happy with the product and phenomenal service!",
    x: 328, y: 67, lift: 78, dx: 62,
  },
  {
    id: "russell", name: "Russell Catchpole", org: "RustieJam Pest Control", place: "Northern Territory",
    quote: "Quality product for a great price.",
    x: 341, y: 97, lift: 46, dx: 34,
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

/* State borders, straight-line approximations of the surveyed meridians and
   parallels. They are what makes the plate read as Australia rather than a
   silhouette (and they are in Ben's reference). */
const BORDERS = [
  "M 214.0 403.8 L 214.0 148.0",              // WA/NT + WA/SA, 129°E
  "M 214.0 275.0 L 449.2 275.0",              // NT/SA, 26°S
  "M 449.2 463.6 L 449.2 121.0",              // SA/QLD + SA/NSW, 141°E
  "M 449.2 275.0 L 612.4 275.0",              // NT-QLD line east, 26°S
  "M 449.2 356.0 L 601.0 356.0",              // NSW/QLD, 29°S
  "M 449.2 437.0 L 590.0 437.0",              // NSW/VIC approximation
];

const STATES: { lines: string[]; x: number; y: number }[] = [
  { lines: ["NORTHERN", "TERRITORY"], x: 332, y: 196 },
  { lines: ["QUEENSLAND"], x: 528, y: 222 },
  { lines: ["WESTERN", "AUSTRALIA"], x: 150, y: 288 },
  { lines: ["SOUTH", "AUSTRALIA"], x: 340, y: 330 },
  { lines: ["NEW SOUTH WALES"], x: 540, y: 400 },
  { lines: ["VICTORIA"], x: 522, y: 466 },
  { lines: ["TASMANIA"], x: 600, y: 578 },
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

/* How many copies of the silhouette build the extruded side wall. Ten reads
   as solid metal; each layer is a single static path, so they rasterise once
   and cost nothing per frame. */
const EXTRUDE = Array.from({ length: 10 }, (_, i) => i + 1);

const pct = (v: number, total: number) => `${((v / total) * 100).toFixed(3)}%`;

export default function TestimonialMap() {
  const [active, setActive] = useState<Pin | null>(null);
  /* Where the open card sits, in stage pixels. The card is deliberately NOT a
     child of the tilted plate: inside a preserve-3d context the browser sorts
     by depth, which drew shorter pins in front of the card and rasterised its
     text a few pixels short. Measuring the chip's real screen box and drawing
     a flat overlay keeps the type crisp and the stacking obvious. */
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  /* scroll-driven intro: home base lights up, arcs draw out, pins rise */
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
        scrollTrigger: { trigger: root, start: "top 82%", end: "top 22%", scrub: 1 },
      });
      tl.to(arcs, { strokeDashoffset: 0, duration: 0.9, stagger: 0.16, ease: "none" }, 0)
        /* opacity on the pin, scale on the head: never scale a preserve-3d
           wrapper, and never touch .tmap-bob (CSS owns its transform) */
        .fromTo(".tmap-pin3", { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.14 }, 0.25)
        .fromTo(".tmap-head", { scale: 0.4 }, { scale: 1, duration: 0.5, stagger: 0.14, ease: "back.out(2.2)" }, 0.25);
    }, root);
    return () => ctx.revert();
  }, []);

  /* Escape closes the card, like every other overlay on the site */
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setActive(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  /* anchor the card under the chip it belongs to, and follow a resize */
  useEffect(() => {
    if (!active) { setPos(null); return; }
    const place = () => {
      const stage = stageRef.current;
      const head = stage?.querySelector<HTMLElement>(`[data-pin="${active.id}"] .tmap-head`);
      if (!stage || !head) return;
      const s = stage.getBoundingClientRect();
      const h = head.getBoundingClientRect();
      /* keep the whole card inside the stage on narrow screens */
      const half = Math.min(160, s.width / 2 - 8);
      setPos({
        x: Math.min(Math.max(h.left + h.width / 2 - s.left, half), s.width - half),
        y: h.bottom - s.top,
      });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

  /* Opening from the name list below the map: on a phone the plate is usually
     scrolled off the top by then, so the card would appear somewhere the
     reader cannot see. Bring the chips back into view first. */
  const openFromList = (p: Pin) => {
    const next = active?.id === p.id ? null : p;
    setActive(next);
    if (!next) return;
    const stage = stageRef.current;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    const chipZone = r.top + Math.min(260, r.height * 0.36);
    if (r.top < 0 || chipZone > window.innerHeight) {
      stage.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="tmap" ref={rootRef}>
      <div className="tmap-stage" ref={stageRef}>
        {/* ambient bloom, unrotated so it reads as light in the room */}
        <span className="tmap-bloom" aria-hidden="true" />

        <div className="tmap-scene">
          <div className="tmap-plate" onClick={() => setActive(null)}>
            {/* extruded side wall: the silhouette, stepped back along the plate normal */}
            {EXTRUDE.map((i) => (
              <svg
                key={i}
                className="tmap-wall"
                viewBox={`0 0 ${VB.w} ${VB.h}`}
                style={{ transform: `translateZ(${-i * 1.6}px)` }}
                aria-hidden="true"
              >
                <path d={MAINLAND} />
                <path d={TASMANIA} />
              </svg>
            ))}

            {/* the surface itself */}
            <svg
              className="tmap-surface"
              viewBox={`0 0 ${VB.w} ${VB.h}`}
              role="img"
              aria-label="Map of Australia showing where Elite Manufacturing has delivered"
            >
              <defs>
                <pattern id="tmapDots" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" className="tmap-dot" />
                </pattern>
              </defs>
              {[MAINLAND, TASMANIA].map((d, i) => (
                <g key={i}>
                  <path d={d} className="tmap-base" />
                  <path d={d} fill="url(#tmapDots)" />
                  <path d={d} className="tmap-outline" vectorEffect="non-scaling-stroke" />
                </g>
              ))}
              {/* borders clipped to the land so they never cross open water */}
              <clipPath id="tmapLand">
                <path d={MAINLAND} />
              </clipPath>
              <g clipPath="url(#tmapLand)">
                {BORDERS.map((d) => (
                  <path key={d} d={d} className="tmap-border" vectorEffect="non-scaling-stroke" />
                ))}
              </g>
              {STATES.map((s) => (
                <text key={s.lines.join()} x={s.x} y={s.y} className="tmap-state">
                  {s.lines.map((l, i) => (
                    <tspan key={l} x={s.x} dy={i === 0 ? 0 : 15}>{l}</tspan>
                  ))}
                </text>
              ))}
              {PINS.map((p) => (
                <path key={p.id} className="tmap-arc" d={arcPath(HQ, p)} vectorEffect="non-scaling-stroke" />
              ))}
            </svg>

            {/* floating markers, positioned in the same viewBox space as the SVG */}
            <div className="tmap-pins">
              {/* home base: the tallest thing on the plate */}
              <div
                className="tmap-pin3 tmap-hq3"
                style={{ left: pct(HQ.x, VB.w), top: pct(HQ.y, VB.h) }}
              >
                <span className="tmap-drop" aria-hidden="true" />
                <span className="tmap-stem" style={{ height: `${HQ.lift}px`, top: `${-HQ.lift}px` }} aria-hidden="true" />
                <span className="tmap-lift" style={{ ["--lift" as string]: `${HQ.lift}px` }}>
                  <span className="tmap-bob">
                    <span className="tmap-head" style={{ ["--dx" as string]: "0px" }}>
                      <svg viewBox="0 0 24 24" className="tmap-hex" aria-hidden="true">
                        <path d="M 12 2 L 21 7 L 21 17 L 12 22 L 3 17 L 3 7 Z" />
                      </svg>
                      <span className="tmap-first mono">HERBERT</span>
                      <span className="tmap-role mono">HOME BASE</span>
                    </span>
                  </span>
                </span>
              </div>

              {PINS.map((p, i) => (
                <button
                  key={p.id}
                  data-pin={p.id}
                  className={`tmap-pin3${active?.id === p.id ? " on" : ""}`}
                  style={{ left: pct(p.x, VB.w), top: pct(p.y, VB.h) }}
                  aria-label={`Read the testimonial from ${p.name}, ${p.place}`}
                  aria-expanded={active?.id === p.id}
                  onClick={(e) => { e.stopPropagation(); setActive(active?.id === p.id ? null : p); }}
                >
                  <span className="tmap-drop" aria-hidden="true" />
                  <span className="tmap-stem" style={{ height: `${p.lift}px`, top: `${-p.lift}px` }} aria-hidden="true" />
                  <span className="tmap-lift" style={{ ["--lift" as string]: `${p.lift}px` }}>
                    <span className="tmap-bob" style={{ animationDelay: `${i * 0.7}s` }}>
                      {/* the chip is nudged sideways, so a leader ties it back
                          to the top of its own stem */}
                      <span
                        className="tmap-leader"
                        style={{
                          ["--lw" as string]: `${Math.abs(p.dx)}px`,
                          ["--ll" as string]: `${Math.min(0, p.dx)}px`,
                        }}
                        aria-hidden="true"
                      />
                      <span className="tmap-head" style={{ ["--dx" as string]: `${p.dx}px` }}>
                        <span className="tmap-dotmark" aria-hidden="true" />
                        <span className="tmap-first mono">{p.name.split(" ")[0].toUpperCase()}</span>
                      </span>
                    </span>
                  </span>
                </button>
              ))}

            </div>
          </div>
        </div>

        {/* the testimony: a flat overlay on the stage, anchored to its chip */}
        {active && pos && (
          <figure
            className="tmap-pop-card"
            style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
            onClick={(e) => e.stopPropagation()}
            aria-live="polite"
          >
            <button
              className="tmap-pop-x"
              onClick={() => setActive(null)}
              aria-label="Close testimonial"
            >
              ✕
            </button>
            <blockquote>&ldquo;{active.quote}&rdquo;</blockquote>
            <figcaption>
              <strong>{active.name}</strong>
              <span className="mono">{active.org.toUpperCase()}</span>
              <span className="mono tmap-pop-place">{active.place.toUpperCase()}</span>
            </figcaption>
          </figure>
        )}

        <div className="tmap-legend mono" aria-hidden="true">
          <span><i>⬢</i> HOME BASE · HERBERT NT</span>
          <span><i>●</i> CUSTOMER DELIVERY</span>
        </div>
      </div>

      <div className="tmap-side">
        <p className="tmap-hint mono">
          {active ? "TAP THE MAP TO CLOSE" : "TAP A NAME TO READ THEIR STORY"}
        </p>
        <div className="tmap-names" role="group" aria-label="All testimonials">
          {PINS.map((p) => (
            <button
              key={p.id}
              className={`cfg-pill${active?.id === p.id ? " sel" : ""}`}
              onClick={() => openFromList(p)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
