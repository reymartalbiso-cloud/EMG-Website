"use client";

/* "Build Your Own" — live-priced configurator (Ben W3, built to Joel's
   prototype). Pricing math mirrors the prototype exactly:
   total = base + hot water + Σ(aircon qty × price) + site setup + extra km × $15 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MODELS, COLOURS, BENCHTOPS, FLOORS, DOORS, HOT_WATER, AC_UNITS, KM_RATE, money,
} from "@/lib/configurator";
import LayoutDesigner from "@/components/LayoutDesigner";
import type { PlacedItem } from "@/lib/fixtures";

type AcSel = { kw: string; use: string; price: number; qty: number };

/* Esc-to-close for lightboxes (doc: keyboard + Esc) */
function LightboxKeys({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return null;
}

export default function Configurator({ initialModel }: { initialModel?: string }) {
  const router = useRouter();
  const cfgRef = useRef<HTMLDivElement>(null);

  const startModel = MODELS.some((m) => m.id === initialModel) ? initialModel! : "ob20";
  const [modelId, setModelId] = useState(startModel);
  const model = MODELS.find((m) => m.id === modelId)!;

  const [colour, setColour] = useState(`${COLOURS[0].n} (${COLOURS[0].r})`);
  const [benchtop, setBenchtop] = useState("7705");
  const [tapware, setTapware] = useState("Black");
  const [flooring, setFlooring] = useState("2208");
  const [bedrooms, setBedrooms] = useState("3 bedroom");
  const [hw, setHw] = useState(HOT_WATER[0]);
  /* like the finishes, the door choice survives a model switch */
  const [door, setDoor] = useState(DOORS[0]);
  const [km, setKm] = useState(0);
  /* the longest road delivery in the country, with room to spare */
  const KM_MAX = 5000;
  const [setupOn, setSetupOn] = useState(false);
  const [customNeeds, setCustomNeeds] = useState("");
  const [ac, setAc] = useState<AcSel[]>([]);
  const [carIdx, setCarIdx] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [dispTotal, setDispTotal] = useState(() => MODELS.find((m) => m.id === startModel)!.base);
  const [priceDir, setPriceDir] = useState("");
  const [layoutItems, setLayoutItems] = useState<PlacedItem[]>([]);
  const [layoutSummary, setLayoutSummary] = useState("");
  const [layoutPlan, setLayoutPlan] = useState("");

  const show = (s: string) => model.show.includes(s);
  const colourHex = COLOURS.find((c) => colour.startsWith(c.n))?.h || "#E4E2D5";
  const is20ft = modelId === "ob20" || modelId === "studio";

  /* model change resets per-model state (mirrors prototype applyModel) */
  function pickModel(id: string, scroll = false) {
    const m = MODELS.find(x => x.id === id)!;
    setModelId(id);
    setSetupOn(false);
    setCarIdx(0);
    setAc(AC_UNITS[m.ac].map((d) => ({ ...d, qty: 0 })));
    if (scroll) cfgRef.current?.scrollIntoView({ behavior: "smooth" });
  }
  useEffect(() => { pickModel(startModel); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const acCost = ac.reduce((s, u) => s + u.qty * u.price, 0);
  const setupCost = model.setup && setupOn ? model.setup.price : 0;
  const delCost = show("delivery") ? km * KM_RATE : 0;
  const total = model.base + hw.price + acCost + setupCost + delCost + door.price;

  /* price countTo: 250ms, direction in colour (design doc §4.5) */
  useEffect(() => {
    setDispTotal((from) => {
      if (from === total) return from;
      setPriceDir(total > from ? "up" : "down");
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / 250);
        const eased = 1 - Math.pow(1 - p, 2);
        setDispTotal(Math.round(from + (total - from) * eased));
        if (p < 1) requestAnimationFrame(step);
        else setTimeout(() => setPriceDir(""), 600);
      };
      requestAnimationFrame(step);
      return from;
    });
  }, [total]);

  const specParts = useMemo(() => {
    const parts: string[] = [];
    if (show("bedrooms")) parts.push(bedrooms);
    if (show("colour")) parts.push("Colour " + colour);
    if (show("bench")) parts.push("Benchtop " + benchtop);
    if (show("tap")) parts.push(tapware + " tapware");
    if (show("floor")) parts.push("Flooring " + flooring);
    parts.push(door.price ? `${door.name} (${door.sub}, − $2,000)` : door.name);
    parts.push(hw.name === "None" ? "no hot water" : `${hw.name} (${hw.cap}) hot water`);
    const acP = ac.filter((u) => u.qty > 0).map((u) => `${u.qty}× ${u.kw}`);
    parts.push(acP.length ? acP.join(", ") + " aircon" : "no aircon");
    if (setupCost) parts.push(`${model.setup!.label} (${money(setupCost)})`);
    if (delCost) parts.push(`+${km}km delivery (${money(delCost)})`);
    return parts.join(" · ");
  }, [model, colour, benchtop, tapware, flooring, bedrooms, door, hw, ac, setupCost, delCost, km]); // eslint-disable-line react-hooks/exhaustive-deps

  function addToQuote() {
    /* gate on the plan text, not the fixture list — a layout can be nothing
       but partitions and still needs to reach us */
    const layoutLine = layoutPlan
      ? ` My layout (${is20ft ? "20ft" : "40ft"} floor plan, positions from front-left corner): ${layoutPlan}.`
      : "";
    const msg = model.custom
      ? `Custom build request. Requirements: ${customNeeds.trim() || "(add your details)"}. Options: ${specParts}.${layoutLine} From ${money(total)} inc GST, please confirm final price.`
      : `${model.name}: ${specParts}.${layoutLine} Total ${money(total)} inc GST.`;
    /* The same configuration, structured — WEBSITE-BRIEF §7.2 asks for the
       layout to reach the enquiry as JSON, not only as a sentence. The message
       above is what a human reads; this is what the dashboard stores. */
    const data = {
      model: model.name,
      modelId: model.id,
      size: is20ft ? "20ft" : "40ft",
      spec: specParts,
      layoutPlan,
      /* the same fixtures in words — the quote panel shows a customer this,
         never the coordinate list, which is written for whoever quotes it */
      layoutSummary,
      layout: layoutItems,
      totalAud: total,
      deliveryKm: km,
      custom: model.custom ? customNeeds.trim() : null,
    };
    /* localStorage first; if blocked (private mode, in-app webviews), carry the
       quote in the URL so it is never silently lost */
    let stored = false;
    try {
      localStorage.setItem("emg-quote", msg);
      localStorage.setItem("emg-quote-data", JSON.stringify(data));
      stored = true;
    } catch {}
    router.push(stored ? "/contact?quote=1" : `/contact?q=${encodeURIComponent(msg)}`);
  }

  return (
    <>
      {/* Range cards */}
      <section className="section" id="range" style={{ paddingBottom: 0 }}>
        <div className="section-head">
          <h2 className="display">Built for every site.</h2>
          <p className="section-sub">All prices inc GST.</p>
        </div>
        <div className="card-grid">
          {MODELS.map((m) => (
            <div className="pcard" key={m.id}>
              <div className="pcard-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.photo} alt={m.name} loading="lazy" />
              </div>
              <div className="pcard-body">
                <h3 className="display">{m.name}</h3>
                <p style={{ flex: "none" }}>{m.spec}</p>
                {m.glass && <p className="cfg-glass mono">{m.glass.toUpperCase()}</p>}
                <p className="cfg-price">
                  From {money(m.base)} <small>inc GST</small>
                </p>
                <button className="btn btn-accent" onClick={() => pickModel(m.id, true)}>
                  Build now ↗
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Configurator */}
      <section className="section" id="configurator" ref={cfgRef}>
        <div className="cfg-inner">
          {/* options column — the summary sits beside it as a sticky rail on
             wide screens, and below it as a sticky bottom bar on narrow ones */}
          <div className="cfg-main">
          <div className="section-head">
            <h2 className="display">Pick your model, then make it yours.</h2>
            <p className="section-sub">Your total updates live. All prices inc GST.</p>
          </div>

          <div className="cfg-models">
            {MODELS.map((m) => (
              <button
                key={m.id}
                className={`cfg-msel${m.id === modelId ? " sel" : ""}`}
                onClick={() => pickModel(m.id)}
              >
                <span className="mn">{m.name}</span>
                <span className="mp">from {money(m.base)}</span>
              </button>
            ))}
          </div>

          {/* Carousel */}
          <div className="cfg-block">
            <p className="cfg-lbl">A closer look</p>
            <div className="cfg-car">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={model.carousel[carIdx]}
                alt={`${model.name}, photo ${carIdx + 1}`}
                onClick={() => setLightbox(model.carousel[carIdx])}
              />
              <button className="cfg-carbtn prev" aria-label="Previous photo"
                onClick={() => setCarIdx((carIdx - 1 + model.carousel.length) % model.carousel.length)}>‹</button>
              <button className="cfg-carbtn next" aria-label="Next photo"
                onClick={() => setCarIdx((carIdx + 1) % model.carousel.length)}>›</button>
            </div>
            <div className="cfg-dots">
              {model.carousel.map((_, i) => (
                <button key={i} className={`cfg-dot${i === carIdx ? " on" : ""}`}
                  aria-label={`Photo ${i + 1}`} onClick={() => setCarIdx(i)} />
              ))}
            </div>
          </div>

          {show("bedrooms") && (
            <div className="cfg-block">
              <p className="cfg-lbl">Bedrooms</p>
              <p className="cfg-hint">Both layouts are the same price</p>
              <div className="cfg-pills">
                {["3 bedroom", "4 bedroom"].map((b) => (
                  <button key={b} className={`cfg-pill${bedrooms === b ? " sel" : ""}`} onClick={() => setBedrooms(b)}>{b}</button>
                ))}
              </div>
            </div>
          )}

          {show("colour") && (
            <div className="cfg-block">
              <p className="cfg-lbl">External colour <span className="cfg-free">Any colour, no extra cost</span></p>
              <p className="cfg-hint">Colorbond match, RAL approximate</p>
              <div className="cfg-preview" aria-hidden="true">
                <svg width="120" height="52" viewBox="0 0 120 52">
                  <rect x="2" y="6" width="116" height="42" rx="2" fill={COLOURS.find((c) => colour.startsWith(c.n))?.h || "#E4E2D5"} stroke="rgba(0,0,0,0.35)" />
                  {Array.from({ length: 13 }, (_, i) => (
                    <line key={i} x1={8 + i * 8.6} y1={8} x2={8 + i * 8.6} y2={46} stroke="rgba(0,0,0,0.16)" strokeWidth="2.6" />
                  ))}
                  <rect x="48" y="16" width="24" height="30" rx="1" fill="rgba(20,18,16,0.55)" />
                  <rect x="80" y="14" width="18" height="14" rx="1" fill="rgba(120,160,190,0.6)" />
                </svg>
                <div>
                  <div className="lbl">Your container, live</div>
                  <div className="val">{colour}</div>
                </div>
              </div>
              <div className="cfg-swatches">
                {COLOURS.map((c) => {
                  const val = `${c.n} (${c.r})`;
                  return (
                    <button key={c.n} className={`cfg-sw${colour === val ? " sel" : ""}`} onClick={() => setColour(val)}>
                      <span className="chip" style={{ background: c.h }} />
                      <span className="nm">{c.n}</span>
                      <span className="rl mono">{c.r}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {show("bench") && (
            <div className="cfg-block">
              <p className="cfg-lbl">Benchtop</p>
              <p className="cfg-hint">Quartz stone, colour code shown</p>
              <div className="cfg-swatches small">
                {BENCHTOPS.map((b) => (
                  <button key={b.c} className={`cfg-sw${benchtop === b.c ? " sel" : ""}`} onClick={() => setBenchtop(b.c)}>
                    <span className="chip" style={{ backgroundImage: `url(${b.img})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                    <span className="nm">{b.c}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {show("tap") && (
            <div className="cfg-block">
              <p className="cfg-lbl">Tapware &amp; sink</p>
              <div className="cfg-pills">
                {["Silver", "Black"].map((t) => (
                  <button key={t} className={`cfg-pill${tapware === t ? " sel" : ""}`} onClick={() => setTapware(t)}>{t}</button>
                ))}
              </div>
            </div>
          )}

          {show("floor") && (
            <div className="cfg-block">
              <p className="cfg-lbl">Flooring</p>
              <p className="cfg-hint">SPC flooring, colour code shown</p>
              <div className="cfg-swatches small">
                {FLOORS.map((f) => (
                  <button key={f.c} className={`cfg-sw${flooring === f.c ? " sel" : ""}`} onClick={() => setFlooring(f.c)}>
                    <span className="chip" style={{ backgroundImage: `url(${f.img})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                    <span className="nm">{f.c}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="cfg-block">
            <p className="cfg-lbl">Design your layout <span className="cfg-free">Optional, included with your quote</span></p>
            <p className="cfg-hint">
              A to-scale {is20ft ? "20ft" : "40ft"} floor plan. Add fixtures,
              drag them into place, and the walls take your chosen colour.
            </p>
            <LayoutDesigner
              key={is20ft ? "20" : "40"}
              len20={is20ft}
              colourHex={colourHex}
              onChange={(its, sum, pl) => { setLayoutItems(its); setLayoutSummary(sum); setLayoutPlan(pl); }}
            />
          </div>

          <div className="cfg-block">
            <p className="cfg-lbl">External door</p>
            <p className="cfg-hint">Glass sliding door is standard · the hinged door opens outwards and takes $2,000 off</p>
            <div className="cfg-pills">
              {DOORS.map((d) => (
                <button
                  key={d.id}
                  className={`cfg-pill${door.id === d.id ? " sel" : ""}`}
                  onClick={() => setDoor(d)}
                >
                  {d.name} · {d.price ? "− $2,000" : "included"}
                </button>
              ))}
            </div>
          </div>

          <div className="cfg-block">
            <p className="cfg-lbl">Hot water unit</p>
            <p className="cfg-hint">One per building · includes new electrical circuit + isolator</p>
            <div className="cfg-hw">
              {HOT_WATER.map((h) => (
                <button key={h.name} className={`cfg-hwcard${hw.name === h.name ? " sel" : ""}`} onClick={() => setHw(h)}>
                  <span className="t">{h.name}</span>
                  <span className="s">{h.sub}</span>
                  <span className={`pr${h.price === 0 ? " zero" : ""}`}>{money(h.price)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="cfg-block">
            <p className="cfg-lbl">Air conditioning</p>
            <p className="cfg-hint">
              {model.ac === "single" ? "4.5kW for this model · " : "Mix sizes · "}
              each includes new electrical circuit + isolator · none by default
            </p>
            {ac.map((u, i) => (
              <div className="cfg-acrow" key={u.kw}>
                <div className="left">
                  <span className={`tick${u.qty > 0 ? " on" : ""}`}>{u.qty > 0 ? "✓" : ""}</span>
                  <div>
                    <div className="t">{u.kw}</div>
                    <div className="s">{u.use} · {money(u.price)}</div>
                  </div>
                </div>
                <div className="right">
                  <button className="stp" aria-label={`Remove one ${u.kw} unit`}
                    onClick={() => setAc((prev) => prev.map((x, j) => j === i ? { ...x, qty: Math.max(0, x.qty - 1) } : x))}>−</button>
                  <span className="qn">{u.qty}</span>
                  <button className="stp" aria-label={`Add one ${u.kw} unit`}
                    onClick={() => setAc((prev) => prev.map((x, j) => j === i ? { ...x, qty: Math.min(6, x.qty + 1) } : x))}>+</button>
                </div>
              </div>
            ))}
          </div>

          {show("setup") && model.setup && (
            <div className="cfg-block">
              <p className="cfg-lbl">Site setup</p>
              <button className={`cfg-hwcard wide${setupOn ? " sel" : ""}`} onClick={() => setSetupOn(!setupOn)}>
                <span className="t">{model.setup.label}</span>
                <span className="s">{model.setup.incl}</span>
                <span className="pr">{money(model.setup.price)} {setupOn ? "✓" : ""}</span>
              </button>
            </div>
          )}

          {show("delivery") && (
            <div className="cfg-block">
              <p className="cfg-lbl">Delivery</p>
              <p className="cfg-hint">First 100km of road transport to your port is included free</p>
              <div className="cfg-delivery">
                <p>Further than 100km from your local port? Add the extra distance:</p>
                <div className="row">
                  <input
                    type="number" min={0} max={KM_MAX} step={1} placeholder="0" value={km || ""}
                    aria-label="Extra kilometres beyond the free 100km"
                    /* capped: an uncapped field produced a $15m indicative
                       total, which the server then refused and stored as no
                       price at all. Darwin to Perth is about 4,000km. */
                    onChange={(e) =>
                      setKm(Math.min(KM_MAX, Math.max(0, parseInt(e.target.value, 10) || 0)))
                    }
                  />
                  <span>extra km × {money(KM_RATE)}/km =</span>
                  <strong>{money(delCost)}</strong>
                </div>
              </div>
            </div>
          )}

          {show("custom") && (
            <div className="cfg-block">
              <p className="cfg-lbl">Your custom build</p>
              <p className="cfg-hint">From {money(model.base)}. Final price confirmed once we have your details</p>
              <textarea
                className="cfg-textarea" value={customNeeds}
                onChange={(e) => setCustomNeeds(e.target.value)}
                placeholder="Describe what you're after: size, layout, number of rooms, anything specific. We'll confirm your price."
              />
            </div>
          )}

          {/* What's NOT included — the unquoted-cost surprise killer (doc §4.5) */}
          <div className="cfg-block">
            <p className="cfg-lbl">What&apos;s not included</p>
            <p className="cfg-hint">
              So there are no surprises on delivery day, these are quoted
              separately once we know your site:
            </p>
            <ul className="cfg-notincluded">
              <li>Council or development approvals on your land</li>
              <li>Special site access, e.g. side-loader or larger crane on constrained or remote sites</li>
              <li>Connection to mains services beyond the packages selected above</li>
              <li>Abnormal ground works: rock breaking, deep-fill or engineered retaining</li>
            </ul>
          </div>
          </div>

          {/* Summary */}
          <div className="cfg-summary">
            <p className="bl mono">{model.name.toUpperCase()} · FROM {money(model.base)} INC GST</p>
            <p className="spec">{specParts}</p>
            <div className="tot">
              <span className="lab">Total</span>
              <span className={`num ${priceDir}`}>{money(dispTotal)}</span>
              <span className="gst">inc GST</span>
            </div>
            <p className="note">
              {model.custom
                ? "From price. Final cost confirmed once we have your details."
                : "Colour, benchtop and flooring included at no extra cost."}
            </p>
            <button className="btn btn-accent" onClick={addToQuote}>
              {model.custom ? "Request custom quote" : "Add to my quote"} ↗
            </button>
          </div>
        </div>
      </section>

      {lightbox && (
        <LightboxKeys onClose={() => setLightbox(null)} />
      )}
      {lightbox && (
        <div className="cfg-lightbox" onClick={() => setLightbox(null)} role="dialog" aria-label="Enlarged photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" />
        </div>
      )}
    </>
  );
}