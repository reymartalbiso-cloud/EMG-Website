import Link from "next/link";
import type { Metadata } from "next";
import CampHero from "@/components/CampHero";
import CountStat from "@/components/CountStat";
import { Reveal } from "@/components/shared";
import { PRODUCTS } from "@/lib/products";

export const metadata: Metadata = {
  title: "Commercial & Remote-Site Buildings — Mining, Community, Government",
  description:
    "Site accommodation, ablution blocks and kitchen/mess units for mining, remote community and government projects — specified, delivered and installed across NT and QLD.",
};

export default function Commercial() {
  const range = PRODUCTS.filter((p) => p.audience === "commercial" && p.slug !== "domes");
  return (
    <>
      <CampHero />
      <div className="page-hero" style={{ paddingTop: "var(--space-6)" }}>
        <Reveal>
          <p className="eyebrow mono">COMMERCIAL · MINING · COMMUNITY · GOVERNMENT</p>
          <h2 className="display" style={{ fontSize: "clamp(2.4rem, 5.4vw, 4.6rem)" }}>Buildings for the places hotels don&apos;t exist.</h2>
          <p className="section-sub">
            Site offices, worker accommodation, ablutions, kitchens and mess
            units — delivered as coordinated programs at camp and village
            scale, specified to National Construction Code requirements for
            your site class. Multiple buildings per shipping cycle, installed
            on schedule, supported after handover. We quote to specification,
            and we&apos;ve delivered to the remote sites most suppliers
            won&apos;t.
          </p>
        </Reveal>
      </div>
      {/* Fleet + compliance — volume and logistics lead for this buyer (doc §4.3) */}
      <section className="band" aria-label="Delivery record">
        <ul className="band-grid" role="list">
          <li className="band-item"><Reveal>
            <span className="band-num display"><CountStat value={300} />+ × 40ft</span>
            <span className="band-label">40-foot buildings landed and counting</span>
          </Reveal></li>
          <li className="band-item"><Reveal>
            <span className="band-num display"><CountStat value={180} />+ × 20ft</span>
            <span className="band-label">20-foot buildings landed and counting</span>
          </Reveal></li>
          <li className="band-item"><Reveal>
            <span className="band-num display">Multi-unit</span>
            <span className="band-label">Camps delivered as coordinated programs, not one-offs</span>
          </Reveal></li>
          <li className="band-item"><Reveal>
            <span className="band-num display">Remote</span>
            <span className="band-label">Stations, island communities and mine sites, Australia-wide</span>
          </Reveal></li>
        </ul>
      </section>

      {/* Tailored capability block — "specifically copywritten for them" (Ben) */}
      <section className="section" style={{ paddingTop: 0 }} id="capability">
        <div className="section-head">
          <Reveal>
            <h2 className="display">We are your people.</h2>
            <p className="section-sub">
              If you&apos;re housing a workforce, you don&apos;t need a
              building — you need a program delivered. This is what we do for
              business, mining, community and government clients:
            </p>
          </Reveal>
        </div>
        <div className="works-grid">
          {[
            ["Site offices & worker accommodation", "Powered, insulated, secure — singles or ensuited rooms, ready to occupy."],
            ["Full camps at 100-person scale", "Accommodation rows, ablutions, kitchen and mess — planned and delivered as one village."],
            ["Volume on schedule", "Multiple buildings per shipping cycle, sequenced so your site is never waiting on us."],
            ["Specified to NCC requirements", "Documented to National Construction Code requirements for your site classification."],
            ["Remote-site delivery, Australia-wide", "Stations, island communities and mine sites most suppliers won't quote."],
            ["One accountable contractor", "Footings, services, septic, install and after-sales — one team, one contract."],
          ].map(([t, d]) => (
            <Reveal key={t}>
              <div className="works-item">
                <h3 className="display">{t}</h3>
                <p>{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Compliance block — prominent, mono, standards without brand names (doc §4.3 + §1.1) */}
      <section className="section" style={{ paddingTop: 0 }} id="compliance">
        <div className="section-head">
          <Reveal>
            <h2 className="display">Compliance, in writing.</h2>
          </Reveal>
        </div>
        <Reveal>
          <table className="spec-table">
            <tbody>
              <tr><th>DWELLINGS</th><td>Class 1A under the National Construction Code — habitable standard</td></tr>
              <tr><th>ELECTRICAL</th><td>AS/NZS 3000 &amp; AS/NZS 3001 transportable installations</td></tr>
              <tr><th>PLUMBING</th><td>WaterMark fittings to AS/NZS 3500, WELS-rated fixtures</td></tr>
              <tr><th>GLAZING</th><td>Windows to AS 2047, glass to AS 1288</td></tr>
              <tr><th>ACCESS</th><td>Threshold-free doorways and sunken shower bases, standard</td></tr>
              <tr><th>DOCUMENTS</th><td>Specification sheet and certification pack supplied with every quote</td></tr>
            </tbody>
          </table>
        </Reveal>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="card-grid">
          {range.map((p) => (
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
      <section className="cta-band">
        <Reveal>
          <h2 className="display">Send us the spec. We&apos;ll meet it.</h2>
          <div className="actions">
            <Link className="btn btn-accent" href="/contact">Send an enquiry</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
