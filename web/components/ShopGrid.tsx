"use client";

/* Shop-all grid: filter pills + search + price sort, FLIP transitions on
   change, dynamic bento (first result anchors as a 2x2 feature tile),
   hover reveals each model's interior shot.

   Two sources feed it. MODELS are the seven builds Joel's configurator can
   price live, so they get "Build & price". CATALOGUE is the other twenty-five
   from the live shop — real prices, no live option pricing — so they get
   "See this build", which lands on the product page and its quote form. */

import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { MODELS, money, thumb } from "@/lib/configurator";
import { CATALOGUE, CATEGORIES, cover, coverAlt, type Category } from "@/lib/catalogue";

/* Flip.getState throws without this, and it throws inside the click handler
   BEFORE the setState runs — so a missing registration reads as "the filters
   do nothing" rather than as an error anyone would notice. */
gsap.registerPlugin(Flip);

type Entry = {
  id: string;
  name: string;
  price: number;
  from?: boolean;
  spec: string;
  glass?: string;
  ntOnly?: boolean;
  photo: string;
  alt: string;
  href: string;
  /** price published exactly as supplied — suppress the inc GST label */
  priceAsGiven?: boolean;
  cta: string;
  live: boolean;
  category: Category;
  beds: string;
  size: string;
};

/* the configurator's seven, keyed the way the old facet table had them */
const MODEL_FACETS: Record<string, { beds: string; size: string; cat: Category }> = {
  ob20: { beds: "Studio/1", size: "20ft", cat: "Homes" },
  studio: { beds: "Studio/1", size: "20ft", cat: "Compact homes" },
  one: { beds: "1", size: "40ft", cat: "Homes" },
  family: { beds: "2", size: "40ft", cat: "Homes" },
  ob40: { beds: "2", size: "40ft", cat: "Homes" },
  workers: { beds: "3-4", size: "40ft", cat: "Commercial" },
  custom: { beds: "Any", size: "Any", cat: "Homes" },
};

/* catalogue items carry their bedroom and size story in the spec string, so
   read it back rather than maintaining a second table that can drift.
   "None" matters: an ablution block has no bedrooms, and the first cut of this
   returned "Any" for everything unlabelled, which made twenty-two of thirty-two
   products answer a "3-4 bed" filter. Only the Custom build is genuinely Any. */
const bedsOf = (spec: string) => {
  const s = spec.toLowerCase();
  if (/3 or 4 bed|3x room/.test(s)) return "3-4";
  if (/2 bed|2x bedroom|two bed/.test(s)) return "2";
  if (/1 bed|1 room|one bed|studio/.test(s)) return "Studio/1";
  return "None";
};
const sizeOf = (spec: string) => {
  const m = spec.match(/\b(10ft|13ft|20ft|40ft)\b/i);
  if (m) return m[1].toLowerCase();
  if (/12m/.test(spec)) return "40ft";
  /* the Retreat is 5.85m — 20ft-class for filtering, stated in metres on the
     card because Ben corrected the length (1 Sep 2026) */
  if (/5\.85m/.test(spec)) return "20ft";
  return "Any";
};

const ENTRIES: Entry[] = [
  ...MODELS.map((m): Entry => ({
    id: m.id,
    name: m.name,
    price: m.base,
    spec: m.spec,
    glass: m.glass,
    ntOnly: m.ntOnly,
    photo: thumb(m.photo),
    alt: thumb(m.carousel.find((c) => c !== m.photo) || m.photo),
    href: `/build-your-own?model=${m.id}`,
    cta: "Build & price",
    live: true,
    category: MODEL_FACETS[m.id].cat,
    beds: MODEL_FACETS[m.id].beds,
    size: MODEL_FACETS[m.id].size,
  })),
  ...CATALOGUE.map((c): Entry => ({
    id: c.slug,
    name: c.name,
    price: c.price,
    from: c.from,
    spec: c.spec,
    photo: cover(c),
    alt: coverAlt(c),
    href: `/shop/${c.slug}`,
    priceAsGiven: c.priceAsGiven,
    cta: "See this build",
    live: false,
    category: c.category,
    beds: bedsOf(c.spec),
    size: sizeOf(c.spec),
  })),
];

const BED_FILTERS = ["All", "Studio/1", "2", "3-4"];
const SIZE_FILTERS = ["All", "10ft", "13ft", "20ft", "40ft"];
/* rebanded again now the range runs $7,490 to $149,900 — the old three bands
   put twenty of thirty-two products in one bucket, which is not a filter */
const PRICE_FILTERS = [
  { label: "Any price", test: () => true },
  { label: "Under $25k", test: (p: number) => p < 25000 },
  { label: "$25k-$50k", test: (p: number) => p >= 25000 && p < 50000 },
  { label: "$50k-$80k", test: (p: number) => p >= 50000 && p < 80000 },
  { label: "Over $80k", test: (p: number) => p >= 80000 },
];
const SORTS = [
  { label: "Featured", cmp: () => 0 },
  { label: "Price ↑", cmp: (a: number, b: number) => a - b },
  { label: "Price ↓", cmp: (a: number, b: number) => b - a },
];

export default function ShopGrid() {
  const [cat, setCat] = useState<"All" | Category>("All");
  const [beds, setBeds] = useState("All");
  const [size, setSize] = useState("All");
  const [price, setPrice] = useState(0);
  const [sort, setSort] = useState(0);
  const [liveOnly, setLiveOnly] = useState(false);
  const [ntFilter, setNtFilter] = useState<"all" | "nt" | "everywhere">("all");
  const [q, setQ] = useState("");
  /* the NT controls exist only once a flagged model exists — invisible until
     Joel's D-types and fold-outs land */
  const hasNtStock = ENTRIES.some((m) => m.ntOnly);
  const gridRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<ReturnType<typeof Flip.getState> | null>(null);

  const results = useMemo(() => {
    const list = ENTRIES.filter((m) => {
      if (cat !== "All" && m.category !== cat) return false;
      if (beds !== "All" && m.beds !== beds && m.beds !== "Any") return false;
      if (size !== "All" && m.size !== size && m.size !== "Any") return false;
      if (!PRICE_FILTERS[price].test(m.price)) return false;
      if (liveOnly && !m.live) return false;
      if (ntFilter === "nt" && !m.ntOnly) return false;
      if (ntFilter === "everywhere" && m.ntOnly) return false;
      if (q && !(m.name + " " + m.spec + " " + m.category).toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    return sort === 0 ? list : [...list].sort((a, b) => SORTS[sort].cmp(a.price, b.price));
  }, [cat, beds, size, price, sort, liveOnly, ntFilter, q]);

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
        {(["All", ...CATEGORIES] as const).map((c) => (
          <button key={c} className={`cfg-pill${cat === c ? " sel" : ""}`} onClick={() => set(setCat)(c)}>
            {c === "All" ? "Everything" : c}
          </button>
        ))}
        <span aria-hidden="true" style={{ opacity: 0.3 }}>|</span>
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
        <span aria-hidden="true" style={{ opacity: 0.3 }}>|</span>
        <button className={`cfg-pill${liveOnly ? " sel" : ""}`} onClick={() => set(setLiveOnly)(!liveOnly)}>
          Price it live
        </button>
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
        <span className="shop-count mono">{results.length}/{ENTRIES.length} MODELS</span>
      </div>

      <div className="card-grid shop-grid" ref={gridRef}>
        {results.map((m, idx) => {
          const chips = m.spec.split("·").map((s) => s.trim());
          return (
            <div className={`pcard${idx === 0 ? " pcard-feature" : ""}`} key={m.id} data-flip-id={m.id}>
              <div className="pcard-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.photo} alt={m.name} loading="lazy" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="img-alt" src={m.alt} alt="" loading="lazy" aria-hidden="true" />
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
                  {/* the seven configurable models price up from a base, and a
                      few catalogue items sell as a range — everything else is
                      the published fixed price, so don't say "from" */}
                  <span className="from mono">{m.live || m.from ? "FROM" : "PRICE"}</span>{" "}
                  {money(m.price)}{!m.priceAsGiven && <> <small>inc GST</small></>}
                </p>
                <Link className={`btn ${m.live ? "btn-accent" : "btn-ghost"}`} href={m.href}>
                  {m.cta} ↗
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      {results.length === 0 && (
        <p className="section-sub">
          No models match those filters. <Link href="/contact" style={{ color: "var(--accent-text)" }}>Tell us what you need</Link> and we&apos;ll quote a custom build.
        </p>
      )}
    </>
  );
}
