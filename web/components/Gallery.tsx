"use client";

/* Photo gallery with lightbox — real build photos from the order records */

import { useEffect, useState } from "react";

export default function Gallery({ photos }: { photos: { src: string; alt: string }[] }) {
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
            <img src={p.src} alt={p.alt} loading="lazy" />
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