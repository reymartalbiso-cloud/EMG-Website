import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/shared";
import TourCinema from "@/components/TourCinema";
import { PRODUCTS } from "@/lib/products";

export const metadata: Metadata = {
  title: "Container Homes: Class 1A Dwellings, Australia-Wide",
  description:
    "Slide-out, two-bedroom and expandable container homes. Class 1A certified dwellings delivered and installed on your block, Australia-wide.",
};

export default function Homes() {
  const homes = PRODUCTS.filter((p) => p.audience === "residential");
  return (
    <>
      <div className="page-hero">
        <Reveal>
          <p className="eyebrow mono">CONTAINER HOMES</p>
          <h1 className="display">A real home. On your land. This year.</h1>
          <p className="section-sub">
            Class 1A certified dwellings, designed for remote Australian conditions,
            delivered and installed on your block, typically 4-6 months from
            order to keys.
          </p>
        </Reveal>
      </div>
      <section className="section" style={{ paddingTop: 0 }}>
        {/* the cards are a section in their own right; without a heading the
            page jumped from h1 straight to the card titles */}
        <h2 className="sr-only">The range</h2>
        <div className="card-grid">
          {homes.map((p) => (
            <Reveal key={p.slug}>
              <Link className="pcard" href={p.href}>
                <div className="pcard-media"><img src={p.image} alt={p.name} loading="lazy" /></div>
                <div className="pcard-body">
                  <h3 className="display">{p.name}</h3>
                  <p>{p.short}</p>
                  <span className="pcard-link">VIEW →</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} id="tour">
        <div className="section-head">
          <Reveal>
            <h2 className="display">Take the tour.</h2>
            <p className="section-sub">
              Step inside a 40ft one-bedroom home. It plays as you arrive.
            </p>
          </Reveal>
        </div>
        <Reveal>
          <TourCinema />
        </Reveal>
      </section>

      <section className="cta-band">
        <Reveal>
          <h2 className="display">Price your build in two minutes.</h2>
          <div className="actions">
            <Link className="btn btn-accent" href="/build-your-own">Build &amp; price ↗</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
