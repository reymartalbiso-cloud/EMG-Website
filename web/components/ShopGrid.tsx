"use client";

/* Shop-all grid: filter pills + search + price sort, FLIP transitions on
   change, dynamic bento (first result anchors as a 2x2 feature tile),
   hover reveals each model's interior shot. */

import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { MODELS, money } from "@/lib/configurator";

gsap.registerPlugin(Flip);

const FACETS: Record<string, { beds: string; size: string }> = {
  ob20: { beds: "Studio/1", size: "20ft" },
  studio: { beds: "Studio/1", size: "20ft" },
  one: { beds: "1", size: "40ft" },
  family: { beds: "2", size: "40ft" },
  ob40: { beds: "2", size: "40ft" },
  workers: { beds: "3–4", size: "40ft" },
  custom: { beds: "Any", size: "Any" },
};

const BED_FILTERS = ["All", "Studio/1", "2", "3–4"];
const SIZE_FILTERS = ["All", "20ft", "40ft"];
const PRICE_FILTERS = [
  { label: "Any price", test: () => true },
  { label: "Under $50k", test: (p: number) => p < 50000 },
  { label: "$50k–$70k", test: (p: number) => p >= 50000 && p <= 70000 },
  { label: "Over $70k", test: (p: number) => p > 70000 },
];
const SORTS = [
  { label: "Featured", cmp: () => 0 },
  { label: "Price ↑", cmp: (a: number, b: number) => a - b },
  { label: "Price ↓", cmp: (a: number, b: number) => b - a },
];

export default function ShopGrid() {
  const [beds, setBeds] = useState("All");
  const [size, setSize] = useState("All");
  const [price, setPrice] = useState(0);
  const [sort, setSort] = useState(0);
  const [ntFilter, setNtFilter] = useState<"all" | "nt" | "everywhere">("all");
  const [q, setQ] = useState("");
  /* the NT controls exist only once a flagged model exists — invisible until
     Joel's D-types and fold-outs land */
  const hasNtStock = MODELS.some((m) => m.ntOnly);
  const gridRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<ReturnType<typeof Flip.getState> | null>(null);

  const results = useMemo(() => {
    const list = MODELS.filter((m) => {
      const f = FACETS[m.id];
      if (beds !== "All" && f.beds !== beds && f.beds !== "Any") return false;
      if (size !== "All" && f.size !== size && f.size !== "Any") return false;
      if (!PRICE_FILTERS[price].test(m.base)) return false;
      if (ntFilter === "nt" && !m.ntOnly) return false;
      if (ntFilter === "everywhere" && m.ntOnly) return false;
      if (q && !(m.name + " " + m.spec).toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    return sort === 0 ? list : [...list].sort((a, b) => SORTS[sort].cmp(a.base, b.base));
  }, [beds, size, price, sort, ntFilter, q]);

  /* FLIP: capture positions before a filter/sort change, animate after */
  const capture = () => {
    if (gridRef.current) {
      flipState.current = Flip.getState(gridRef.current.querySelectorAll(".pcard"));
    }
  };
  useLayoutEffect(() => {
    if (!flipState.current) return;
    Flip.from(flipState.current, {
      duration: 0.45,
      ease: "power2.inOut",
      stagger: 0.02,
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.94, duration: 0.25, ease: "power2.in" }),
    });
    flipState.current = null;
  }, [results]);

  const set = <T,>(setter: (v: T) => void) => (v: T) => { capture(); setter(v); };

  return (
    <>
      <div className="shop-filters" role="group" aria-label="Filter models">
        {BED_FILTERS.map((b) => (
          <button key={b} className={`cfg-pill${beds === b ? " sel" : ""}`} onClick={() => set(setBeds)(b)}>
            {b === "All" ? "All bedrooms" : b === "Studio/1" ? "Studio / 1 bed" : `${b} bed`}
          </button>
        ))}
        <span aria-hidden="true" style={{ opacity: 0.3 }}>|</span>
        {SIZE_FILTERS.map((s) => (
          <button key={s} className={`cfg-pill${size === s ? " sel" : ""}`} onClick={() => set(setSize)(s)}>
            {s === "All" ? "All sizes" : s}
          </button>
        ))}
        <span aria-hidden="true" style={{ opacity: 0.3 }}>|</span>
        {PRICE_FILTERS.map((p, i) => (
          <button key={p.label} className={`cfg-pill${price === i ? " sel" : ""}`} onClick={() => set(setPrice)(i)}>
            {p.label}
          </button>
        ))}
        {hasNtStock && (
          <>
            <span aria-hidden="true" style={{ opacity: 0.3 }}>|</span>
            {([["all", "NT + interstate"], ["nt", "NT stock only"], ["everywhere", "Delivered anywhere"]] as const).map(([v, label]) => (
              <button key={v} className={`cfg-pill${ntFilter === v ? " sel" : ""}`} onClick={() => set(setNtFilter)(v)}>
                {label}
              </button>
            ))}
          </>
        )}
        <span aria-hidden="true" style={{ opacity: 0.3 }}>|</span>
        {SORTS.map((s, i) => (
          <button key={s.label} className={`cfg-pill${sort === i ? " sel" : ""}`} onClick={() => set(setSort)(i)}>
            {s.label}
          </button>
        ))}
        <input
          type="search" placeholder="Search models…" value={q}
          onChange={(e) => { capture(); setQ(e.target.value); }} aria-label="Search models"
        />
        <span className="shop-count mono">{results.length}/{MODELS.length} MODELS</span>
      </div>

      <div className="card-grid shop-grid" ref={gridRef}>
        {results.map((m, idx) => {
          const altPhoto = m.carousel.find((c) => c !== m.photo) || m.photo;
          const chips = m.spec.split("·").map((s) => s.trim());
          return (
            <div className={`pcard${idx === 0 ? " pcard-feature" : ""}`} key={m.id} data-flip-id={m.id}>
              <div className="pcard-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.photo} alt={m.name} loading="lazy" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="img-alt" src={altPhoto} alt="" loading="lazy" aria-hidden="true" />
              </div>
              <div className="pcard-body">
                <h3 className="display">{m.name}</h3>
                <div className="spec-chips" aria-label="Specifications">
                  {chips.map((c) => (
                    <span className="mono spec-chip" key={c}>{c.toUpperCase()}</span>
                  ))}
                  {m.glass && <span className="mono spec-chip glass">{m.glass.toUpperCase()}</span>}
                  {m.ntOnly && <span className="mono spec-chip nt-only">NT DELIVERY ONLY</span>}
                </div>
                <p className="shop-price">
                  <span className="from mono">FROM</span> {money(m.base)} <small>inc GST</small>
                </p>
                <Link className="btn btn-accent" href={`/build-your-own?model=${m.id}`}>
                  Build &amp; price ↗
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      {results.length === 0 && (
        <p className="section-sub">
          No models match those filters — <Link href="/contact" style={{ color: "var(--accent-text)" }}>tell us what you need</Link> and we&apos;ll quote a custom build.
        </p>
      )}
    </>
  );
}