"use client";

/* "Scope your camp" — the commercial page's answer to the configurator.
   Ben's brief for this buyer: a mining exec must instantly see "can they
   handle my 100-building order". So let them drag a crew size and watch an
   indicative village assemble, building by building, the way the camp video
   assembles one — then send that program straight into the same quote
   pipeline the configurator uses.

   No dollars anywhere: commercial programs are quoted per project (brief
   §7.1 boundary), and the composition is labelled indicative — the ratios
   below are honest defaults from the real products (Worker Accommodation is
   genuinely 3–4 ensuite rooms per 40ft), not engineering. */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const MIN = 8, MAX = 150;

/* indicative composition — every camp is engineered to its project */
function compose(people: number) {
  const accom = Math.ceil(people / 4);          // 4 ensuite rooms per 40ft accommodation building
  const kitchen = Math.max(1, Math.ceil(people / 40)); // kitchen & mess per ~40 diners
  const ablution = Math.max(1, Math.ceil(people / 30)); // common-area facilities beside mess/site
  const office = Math.max(1, Math.ceil(people / 50));   // site offices
  return { accom, kitchen, ablution, office, total: accom + kitchen + ablution + office };
}

const TYPES = [
  { key: "accom", label: "Accommodation", cls: "sc-accom" },
  { key: "kitchen", label: "Kitchen & mess", cls: "sc-kitchen" },
  { key: "ablution", label: "Ablutions", cls: "sc-ablution" },
  { key: "office", label: "Site office", cls: "sc-office" },
] as const;

/* village geometry: accommodation in rows of 8, services on their own row */
const PER_ROW = 8;
const BW = 40, BH = 18, GX = 8, GY = 12;

export default function CampScoper() {
  const router = useRouter();
  const [people, setPeople] = useState(40);
  const c = useMemo(() => compose(people), [people]);

  const blocks = useMemo(() => {
    const list: { type: (typeof TYPES)[number]; i: number }[] = [];
    TYPES.forEach((t) => {
      const n = c[t.key as keyof typeof c] as number;
      for (let i = 0; i < n; i++) list.push({ type: t, i });
    });
    return list;
  }, [c]);

  const rows = Math.ceil(blocks.length / PER_ROW);
  const vbW = PER_ROW * (BW + GX) + GX;
  const vbH = rows * (BH + GY) + GY + 14;

  const summary = `${c.accom}× accommodation (4 ensuite rooms each) · ${c.ablution}× ablution block · ${c.kitchen}× kitchen/mess · ${c.office}× site office`;

  function requestQuote() {
    const msg = `Camp program enquiry — ${people} personnel. Indicative composition: ${summary} (${c.total} buildings). Please scope and quote as a program.`;
    const data = {
      model: `Camp program — ${people} personnel`,
      modelId: "camp-program",
      size: "PROGRAM",
      spec: summary,
      layoutSummary: `${c.total} buildings housing ${people} personnel, delivered as one coordinated program`,
      custom: null,
    };
    let stored = false;
    try {
      localStorage.setItem("emg-quote", msg);
      localStorage.setItem("emg-quote-data", JSON.stringify(data));
      stored = true;
    } catch {}
    router.push(stored ? "/contact?quote=1" : `/contact?q=${encodeURIComponent(msg)}`);
  }

  return (
    <div className="scoper">
      <div className="scoper-controls">
        <label className="scoper-lbl" htmlFor="scoper-range">
          <span className="mono">CREW SIZE</span>
          <strong className="display">{people}<small> personnel</small></strong>
        </label>
        <input
          id="scoper-range"
          type="range"
          min={MIN}
          max={MAX}
          step={1}
          value={people}
          onChange={(e) => setPeople(+e.target.value)}
          aria-valuetext={`${people} personnel`}
        />
        <div className="scoper-presets" role="group" aria-label="Common crew sizes">
          {[20, 50, 100, 150].map((n) => (
            <button
              key={n}
              className={`cfg-pill${people === n ? " sel" : ""}`}
              onClick={() => setPeople(n)}
            >
              {n} person
            </button>
          ))}
        </div>
      </div>

      <div className="scoper-stage">
        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          width={vbW}
          height={vbH}
          className="scoper-svg"
          role="img"
          aria-label={`Indicative camp for ${people} personnel: ${summary}`}
        >
          {blocks.map((b, i) => {
            const col = i % PER_ROW;
            const row = Math.floor(i / PER_ROW);
            const x = GX + col * (BW + GX);
            const y = GY + row * (BH + GY);
            return (
              <g
                key={`${b.type.key}-${b.i}`}
                className={`sc-block ${b.type.cls}`}
                style={{ transitionDelay: `${(i % PER_ROW) * 28 + row * 60}ms` }}
                transform={`translate(${x} ${y})`}
              >
                <rect width={BW} height={BH} rx="2" className="sc-body" />
                {/* roof ridge + door — the same visual grammar as the camp video */}
                <line x1="2.5" y1={BH / 2} x2={BW - 2.5} y2={BH / 2} className="sc-ridge" />
                <rect x={BW / 2 - 1.6} y={BH - 5} width="3.2" height="5" className="sc-door" />
              </g>
            );
          })}
        </svg>
        <p className="scoper-count mono" aria-hidden="true">
          {c.total} BUILDINGS · {c.accom * 4} ENSUITE ROOMS
        </p>
      </div>

      <div className="scoper-foot">
        <ul className="scoper-legend" aria-hidden="true">
          {TYPES.map((t) => (
            <li key={t.key} className={t.cls}>
              <i /> {t.label} × {c[t.key as keyof typeof c] as number}
            </li>
          ))}
        </ul>
        <p className="scoper-note">
          Indicative composition only — every camp is engineered to its
          project, and programs are quoted per project.
        </p>
        <button className="btn btn-accent" onClick={requestQuote}>
          Request a program quote ↗
        </button>
      </div>
    </div>
  );
}
