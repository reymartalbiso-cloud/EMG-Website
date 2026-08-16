/* Plan-view icons for the layout designer.

   Each icon draws into a local 0,0 → w,h box (SVG units, 100 units = 1 metre)
   matching that fixture's true footprint, so detail scales with real size.
   Rotation is applied by the caller, so every icon assumes its natural
   orientation: beds put the head at the left, kitchen and bathroom fixtures
   put their back edge at the top (the back wall), and the entry/glass side
   of the container is below. */

import type { ReactNode } from "react";
import { FIXTURES } from "@/lib/fixtures";

type P = { w: number; h: number };

const SURF = "rgba(255, 255, 255, 0.32)";   // object surface
const SOFT = "rgba(255, 255, 255, 0.6)";    // cushions, pillows, basins
const HOLE = "rgba(24, 22, 20, 0.14)";      // recesses: drains, burners

const ICONS: Record<string, (p: P) => ReactNode> = {
  "bed-d": ({ w, h }) => (
    <>
      <rect x={w * 0.04} y={h * 0.05} width={w * 0.92} height={h * 0.9} rx={h * 0.07} fill={SURF} />
      <rect x={w * 0.08} y={h * 0.1} width={w * 0.18} height={h * 0.35} rx={h * 0.07} fill={SOFT} />
      <rect x={w * 0.08} y={h * 0.55} width={w * 0.18} height={h * 0.35} rx={h * 0.07} fill={SOFT} />
      <line x1={w * 0.42} y1={h * 0.05} x2={w * 0.42} y2={h * 0.95} />
    </>
  ),
  "bed-s": ({ w, h }) => (
    <>
      <rect x={w * 0.04} y={h * 0.06} width={w * 0.92} height={h * 0.88} rx={h * 0.1} fill={SURF} />
      <rect x={w * 0.08} y={h * 0.16} width={w * 0.18} height={h * 0.68} rx={h * 0.1} fill={SOFT} />
      <line x1={w * 0.42} y1={h * 0.06} x2={w * 0.42} y2={h * 0.94} />
    </>
  ),
  bunk: ({ w, h }) => (
    <>
      <rect x={w * 0.04} y={h * 0.06} width={w * 0.92} height={h * 0.88} rx={h * 0.1} fill={SURF} />
      <rect x={w * 0.08} y={h * 0.16} width={w * 0.16} height={h * 0.68} rx={h * 0.1} fill={SOFT} />
      {/* the bunk above, shown dashed as an overhead item */}
      <rect
        x={w * 0.1} y={h * 0.16} width={w * 0.72} height={h * 0.68} rx={h * 0.08}
        strokeDasharray={`${h * 0.09} ${h * 0.07}`}
      />
      {[0.28, 0.5, 0.72].map((t) => (
        <line key={t} x1={w * 0.86} y1={h * t} x2={w * 0.97} y2={h * t} />
      ))}
    </>
  ),
  wardrobe: ({ w, h }) => (
    <>
      <rect x={w * 0.03} y={h * 0.06} width={w * 0.94} height={h * 0.88} rx={h * 0.06} fill={SURF} />
      <line x1={w * 0.09} y1={h * 0.34} x2={w * 0.91} y2={h * 0.34} />
      {[0.2, 0.4, 0.6, 0.8].map((t) => (
        <path key={t} d={`M ${w * t - h * 0.13} ${h * 0.62} L ${w * t} ${h * 0.36} L ${w * t + h * 0.13} ${h * 0.62}`} />
      ))}
      <line x1={w * 0.03} y1={h * 0.87} x2={w * 0.97} y2={h * 0.87} strokeDasharray={`${h * 0.12} ${h * 0.1}`} />
    </>
  ),
  sofa: ({ w, h }) => (
    <>
      <rect x={w * 0.02} y={h * 0.04} width={w * 0.96} height={h * 0.26} rx={h * 0.1} fill={SURF} />
      <rect x={w * 0.02} y={h * 0.28} width={w * 0.09} height={h * 0.68} rx={h * 0.1} fill={SURF} />
      <rect x={w * 0.89} y={h * 0.28} width={w * 0.09} height={h * 0.68} rx={h * 0.1} fill={SURF} />
      <rect x={w * 0.13} y={h * 0.32} width={w * 0.36} height={h * 0.62} rx={h * 0.1} fill={SOFT} />
      <rect x={w * 0.51} y={h * 0.32} width={w * 0.36} height={h * 0.62} rx={h * 0.1} fill={SOFT} />
    </>
  ),
  dining: ({ w, h }) => (
    <>
      <rect x={w * 0.15} y={h * 0.17} width={w * 0.7} height={h * 0.66} rx={h * 0.08} fill={SURF} />
      <rect x={w * 0.36} y={h * 0.01} width={w * 0.28} height={h * 0.12} rx={h * 0.05} fill={SOFT} />
      <rect x={w * 0.36} y={h * 0.87} width={w * 0.28} height={h * 0.12} rx={h * 0.05} fill={SOFT} />
      <rect x={w * 0.01} y={h * 0.34} width={w * 0.11} height={h * 0.32} rx={h * 0.05} fill={SOFT} />
      <rect x={w * 0.88} y={h * 0.34} width={w * 0.11} height={h * 0.32} rx={h * 0.05} fill={SOFT} />
    </>
  ),
  desk: ({ w, h }) => (
    <>
      <rect x={w * 0.02} y={h * 0.04} width={w * 0.96} height={h * 0.58} rx={h * 0.06} fill={SURF} />
      <rect x={w * 0.71} y={h * 0.09} width={w * 0.24} height={h * 0.48} rx={h * 0.05} fill={SOFT} />
      <line x1={w * 0.71} y1={h * 0.33} x2={w * 0.95} y2={h * 0.33} />
      <rect
        x={w * 0.24} y={h * 0.66} width={w * 0.26} height={h * 0.3} rx={h * 0.12}
        strokeDasharray={`${h * 0.1} ${h * 0.08}`}
      />
    </>
  ),
  tv: ({ w, h }) => (
    <>
      <rect x={w * 0.02} y={h * 0.38} width={w * 0.96} height={h * 0.58} rx={h * 0.1} fill={SURF} />
      <rect x={w * 0.18} y={h * 0.05} width={w * 0.64} height={h * 0.16} rx={h * 0.06} fill={SOFT} />
      <line x1={w * 0.5} y1={h * 0.21} x2={w * 0.5} y2={h * 0.38} />
      <line x1={w * 0.35} y1={h * 0.66} x2={w * 0.65} y2={h * 0.66} />
    </>
  ),
  stove: ({ w, h }) => (
    <>
      <rect x={w * 0.04} y={h * 0.04} width={w * 0.92} height={h * 0.92} rx={h * 0.06} fill={SURF} />
      {[[0.3, 0.28], [0.7, 0.28], [0.3, 0.6], [0.7, 0.6]].map(([px, py]) => (
        <circle key={`${px}-${py}`} cx={w * px} cy={h * py} r={Math.min(w, h) * 0.15} fill={HOLE} />
      ))}
      {[0.24, 0.41, 0.59, 0.76].map((t) => (
        <circle key={t} cx={w * t} cy={h * 0.86} r={Math.min(w, h) * 0.045} fill={SOFT} />
      ))}
    </>
  ),
  sink: ({ w, h }) => (
    <>
      <rect x={w * 0.03} y={h * 0.04} width={w * 0.94} height={h * 0.92} rx={h * 0.06} fill={SURF} />
      <rect x={w * 0.14} y={h * 0.3} width={w * 0.72} height={h * 0.56} rx={h * 0.1} fill={SOFT} />
      <circle cx={w * 0.5} cy={h * 0.58} r={Math.min(w, h) * 0.08} fill={HOLE} />
      <circle cx={w * 0.5} cy={h * 0.15} r={Math.min(w, h) * 0.07} />
      <line x1={w * 0.5} y1={h * 0.22} x2={w * 0.5} y2={h * 0.3} />
    </>
  ),
  fridge: ({ w, h }) => (
    <>
      <rect x={w * 0.05} y={h * 0.05} width={w * 0.9} height={h * 0.9} rx={h * 0.05} fill={SURF} />
      <line x1={w * 0.05} y1={h * 0.78} x2={w * 0.95} y2={h * 0.78} />
      <line x1={w * 0.78} y1={h * 0.82} x2={w * 0.78} y2={h * 0.92} strokeWidth={3} />
      <path
        d={`M ${w * 0.95} ${h * 0.95} A ${w * 0.9} ${w * 0.9} 0 0 0 ${w * 0.05} ${h * 0.95 - w * 0.9}`}
        strokeDasharray={`${h * 0.08} ${h * 0.07}`}
        opacity={0.55}
      />
    </>
  ),
  bench: ({ w, h }) => (
    <>
      <rect x={w * 0.02} y={h * 0.04} width={w * 0.96} height={h * 0.92} rx={h * 0.05} fill={SURF} />
      <rect x={w * 0.02} y={h * 0.04} width={w * 0.96} height={h * 0.14} fill={SOFT} />
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={w * t} y1={h * 0.22} x2={w * t} y2={h * 0.93} strokeDasharray={`${h * 0.12} ${h * 0.1}`} />
      ))}
    </>
  ),
  shower: ({ w, h }) => (
    <>
      <rect x={w * 0.05} y={h * 0.05} width={w * 0.9} height={h * 0.9} rx={h * 0.05} fill={SURF} />
      <path d={`M ${w * 0.95} ${h * 0.24} A ${w * 0.72} ${h * 0.72} 0 0 1 ${w * 0.24} ${h * 0.95}`} strokeWidth={3} />
      <circle cx={w * 0.2} cy={h * 0.2} r={Math.min(w, h) * 0.09} fill={SOFT} />
      <circle cx={w * 0.56} cy={h * 0.6} r={Math.min(w, h) * 0.08} fill={HOLE} />
      <line x1={w * 0.48} y1={h * 0.6} x2={w * 0.64} y2={h * 0.6} />
      <line x1={w * 0.56} y1={h * 0.52} x2={w * 0.56} y2={h * 0.68} />
    </>
  ),
  toilet: ({ w, h }) => (
    <>
      <rect x={w * 0.03} y={h * 0.1} width={w * 0.2} height={h * 0.8} rx={h * 0.06} fill={SURF} />
      <ellipse cx={w * 0.58} cy={h * 0.5} rx={w * 0.32} ry={h * 0.37} fill={SOFT} />
      <ellipse cx={w * 0.58} cy={h * 0.5} rx={w * 0.22} ry={h * 0.24} opacity={0.7} />
      <line x1={w * 0.23} y1={h * 0.5} x2={w * 0.26} y2={h * 0.5} />
    </>
  ),
  vanity: ({ w, h }) => (
    <>
      <rect x={w * 0.03} y={h * 0.05} width={w * 0.94} height={h * 0.9} rx={h * 0.06} fill={SURF} />
      <ellipse cx={w * 0.5} cy={h * 0.56} rx={w * 0.24} ry={h * 0.3} fill={SOFT} />
      <circle cx={w * 0.5} cy={h * 0.56} r={Math.min(w, h) * 0.06} fill={HOLE} />
      <circle cx={w * 0.5} cy={h * 0.17} r={Math.min(w, h) * 0.07} />
      <line x1={w * 0.5} y1={h * 0.24} x2={w * 0.5} y2={h * 0.3} />
    </>
  ),
  washer: ({ w, h }) => (
    <>
      <rect x={w * 0.05} y={h * 0.05} width={w * 0.9} height={h * 0.9} rx={h * 0.05} fill={SURF} />
      <rect x={w * 0.09} y={h * 0.08} width={w * 0.82} height={h * 0.14} rx={h * 0.05} fill={SOFT} />
      {[0.2, 0.34, 0.48].map((t) => (
        <circle key={t} cx={w * t} cy={h * 0.15} r={Math.min(w, h) * 0.035} fill={HOLE} />
      ))}
      <circle cx={w * 0.5} cy={h * 0.6} r={Math.min(w, h) * 0.27} fill={SOFT} />
      <circle cx={w * 0.5} cy={h * 0.6} r={Math.min(w, h) * 0.16} fill={HOLE} />
    </>
  ),
  hws: ({ w, h }) => (
    <>
      <circle cx={w * 0.5} cy={h * 0.52} r={Math.min(w, h) * 0.42} fill={SURF} />
      <circle cx={w * 0.5} cy={h * 0.52} r={Math.min(w, h) * 0.22} fill={SOFT} />
      <line x1={w * 0.5} y1={h * 0.1} x2={w * 0.5} y2={h * 0.02} strokeWidth={3} />
      <line x1={w * 0.78} y1={h * 0.2} x2={w * 0.9} y2={h * 0.08} strokeWidth={3} />
    </>
  ),
  ac: ({ w, h }) => (
    <>
      <rect x={w * 0.03} y={h * 0.08} width={w * 0.94} height={h * 0.84} rx={h * 0.22} fill={SURF} />
      <line x1={w * 0.1} y1={h * 0.4} x2={w * 0.9} y2={h * 0.4} />
      <line x1={w * 0.1} y1={h * 0.62} x2={w * 0.9} y2={h * 0.62} />
      {[0.25, 0.5, 0.75].map((t) => (
        <path key={t} d={`M ${w * t - h * 0.18} ${h * 0.74} L ${w * t} ${h * 0.9} L ${w * t + h * 0.18} ${h * 0.74}`} />
      ))}
    </>
  ),
};

export default function FixtureIcon({
  type, w, h, sw = 2,
}: { type: string; w: number; h: number; sw?: number }) {
  const draw = ICONS[type];
  if (!draw) return null;
  return (
    <g
      fill="none"
      stroke="rgba(24, 22, 20, 0.78)"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      pointerEvents="none"
    >
      {draw({ w, h })}
    </g>
  );
}

/* Small standalone glyph for the palette chips — same drawing, fitted to a
   fixed box so every chip reads at a glance. */
export function FixtureGlyph({ type, box = 26 }: { type: string; box?: number }) {
  const f = FIXTURES.find((x) => x.type === type);
  if (!f) return null;
  const bw = box, bh = box * 0.66;
  const scale = Math.min(bw / f.w, bh / f.h) * 0.92;
  const w = f.w * scale, h = f.h * scale;
  return (
    <svg width={bw} height={bh} viewBox={`0 0 ${bw} ${bh}`} aria-hidden="true" className="ld-glyph">
      <g transform={`translate(${(bw - w) / 2} ${(bh - h) / 2})`}>
        <rect width={w} height={h} rx={1.5} fill="currentColor" fillOpacity={0.9} />
        <FixtureIcon type={type} w={w} h={h} sw={0.55} />
      </g>
    </svg>
  );
}
