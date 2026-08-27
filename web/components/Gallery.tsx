"use client";

/* Photo gallery with lightbox — real build photos from the order records */

import { useEffect, useState } from "react";

/* `thumb` is what the grid loads. The grid cell is about 400px wide, so
   serving the full-size image there cost 1.8MB on /projects for pictures
   nobody had asked to see full size yet. The lightbox still gets `src`. */
export default function Gallery({ photos }: { photos: { src: string; alt: string; thumb?: string }[] }) {
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <>
      <div className="gal-grid">
        {photos.map((p) => (
          <button key={p.src} className="gal-item" onClick={() => setOpen(p.src)} aria-label={`Enlarge: ${p.alt}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumb ?? p.src} alt={p.alt} loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
      {open && (
        <div className="cfg-lightbox" onClick={() => setOpen(null)} role="dialog" aria-label="Enlarged photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={open} alt="" />
        </div>
      )}
    </>
  );
}