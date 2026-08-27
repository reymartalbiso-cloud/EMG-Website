import type { Metadata } from "next";
import Link from "next/link";
import { PORTAL_URL } from "@/lib/links";

/* Split entry (Ben, round 2): big self-identifying labels at the TOP of each
   panel; the commercial/industrial panel is one image split diagonally —
   site office top-left, mining camp bottom-right. Still exactly two doors. */

export const metadata: Metadata = {
  title: "Elite Manufacturing Group | Container Homes & Commercial Buildings, Australia-Wide",
  description:
    "Container homes for your block, or worker accommodation at village scale. Choose your path, residential or commercial/industrial, and see buildings priced live.",
};

export default function Chooser() {
  return (
    <div className="chooser">
      {/* the page's only heading: it was a <p>, leaving the site's
          front door with no heading structure at all */}
      <h1 className="chooser-ask mono">WHAT ARE YOU BUILDING?</h1>
      <div className="chooser-panels">
        <Link href="/residential" className="chooser-panel">
          <h2 className="chooser-big display">Residential</h2>
          <span
            className="chooser-bg"
            style={{ backgroundImage: "url(/cfg/ch_front.jpg)" }}
            aria-hidden="true"
          />
          <span className="chooser-body">
            <span className="chooser-sub">
              A home on your land: container homes certified to live in,
              delivered and installed on your block.
            </span>
            <span className="mono chooser-cta">RESIDENTIAL →</span>
          </span>
        </Link>
        <Link href="/commercial" className="chooser-panel split">
          <h2 className="chooser-big display">Commercial / Industrial</h2>
          {/* top-left triangle: site office / worker accommodation */}
          <span
            className="chooser-bg tl"
            style={{ backgroundImage: "url(/cfg/wa_ext.jpg)" }}
            aria-hidden="true"
          />
          {/* bottom-right triangle: mining camp (final frame of the camp video) */}
          <span
            className="chooser-bg br"
            style={{ backgroundImage: "url(/cfg/camp.jpg)" }}
            aria-hidden="true"
          />
          <span className="chooser-quad tl mono" aria-hidden="true">COMMERCIAL</span>
          <span className="chooser-quad br mono" aria-hidden="true">INDUSTRIAL</span>
          <span className="chooser-body">
            <span className="chooser-sub">
              Site offices, worker accommodation and full camps. Buildings at
              project and village scale.
            </span>
            <span className="mono chooser-cta">COMMERCIAL / INDUSTRIAL →</span>
          </span>
        </Link>
      </div>
      <p className="chooser-skip">
        Already ordered? <a href={PORTAL_URL}>Track your order</a>
        {" · "}
        <Link href="/shop">Shop all models</Link>
      </p>
    </div>
  );
}