import Link from "next/link";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import { Reveal } from "@/components/shared";
import { PRODUCTS } from "@/lib/products";
import { PORTAL_URL } from "@/lib/links";

const TRUST = [
  ["Class 1A", "Certified habitable dwellings — legal to live in, not just to park"],
  ["Flat entry", "Threshold-free doorways and sunken shower bases, standard on every build"],
  ["High-cube", "Extra ceiling height on every unit; RAL 7035 finish as standard"],
  ["NT & QLD", "Delivered and installed, including remote and island sites"],
];

const STAGES = [
  ["01", "Order & spec", "Layout, fit-out and compliance locked in before the build starts."],
  ["02", "Factory build", "Built to our specification, inspected before it ships."],
  ["03", "At sea & customs", "We run the shipping, the customs entry and the trucking."],
  ["04", "Site & handover", "Footings, services, septic, install — then the keys."],
];

export default function Home() {
  return (
    <>
      <Hero />

      <section className="band" aria-label="Why Elite Manufacturing">
        <ul className="band-grid" role="list">
          {TRUST.map(([num, label]) => (
            <li className="band-item" key={num}>
              <Reveal>
                <span className="band-num display">{num}</span>
                <span className="band-label">{label}</span>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* Tailored capability block — residential version of "we are your people" */}
      <section className="section" id="capability" style={{ paddingBottom: 0 }}>
        <div className="section-head">
          <Reveal>
            <p className="eyebrow mono">FOR YOUR BLOCK</p>
            <h2 className="display">Everything, from one team.</h2>
            <p className="section-sub">
              Putting a home on your own land shouldn&apos;t mean managing five
              contractors. For residential customers we handle:
            </p>
          </Reveal>
        </div>
        <div className="works-grid">
          {[
            ["Transportable homes & caravans", "Container homes, slide-outs and transportable dwellings — built to order."],
            ["Class 1A certified installs", "Habitable-standard dwellings, certified — legal to live in, not just to park."],
            ["Site works, start to finish", "Footings, septic, power, water and decking — sequenced while your build ships."],
            ["Delivery & crane placement", "Trucked and craned onto your block, anywhere in the NT and Queensland."],
            ["Finance pathways", "Fixed, itemised, lender-ready quotes — and guidance on residential finance options."],
            ["After-sales support", "Warranty backed by the same local team that sold you the building."],
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

      <section className="section" id="range">
        <div className="section-head">
          <Reveal>
            <h2 className="display">A building for every block, camp and site.</h2>
            <p className="section-sub">
              Transportable homes, caravans and Class 1A dwellings — with
              finance pathways available for residential buyers.
            </p>
          </Reveal>
        </div>
        <div className="card-grid featured">
          {PRODUCTS.map((p) => (
            <Reveal key={p.slug}>
              <Link className="pcard" href={p.href}>
                <div className="pcard-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} loading="lazy" />
                </div>
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

      <section className="section" id="process-teaser">
        <div className="section-head">
          <Reveal>
            <h2 className="display">Order to move-in, typically 4–6 months.</h2>
            <p className="section-sub">
              We are not the factory — we are everything after it. Two proven
              factories build to our spec; we own the shipping, customs,
              trucking, footings, services and handover. One company,
              accountable for the whole journey.
            </p>
          </Reveal>
        </div>
        <ol className="steps-home" role="list">
          {STAGES.map(([n, t, d]) => (
            <li key={n}>
              <Reveal>
                <span className="mono step-n">{n}</span>
                <h3 className="display">{t}</h3>
                <p>{d}</p>
              </Reveal>
            </li>
          ))}
        </ol>
        <Reveal>
          <Link className="btn btn-ghost" href="/how-it-works">See the whole process, honestly told</Link>
        </Reveal>
      </section>

      <section className="track-band" id="track">
        <Reveal className="track-inner">
          <div>
            <p className="eyebrow mono">ALREADY ORDERED?</p>
            <h2 className="display">Track your build.</h2>
            <p className="section-sub">
              See your stage, your shipping dates, your documents and your
              payments — live, in the customer portal.
            </p>
          </div>
          <a className="btn btn-accent" href={PORTAL_URL}>
            Track Your Order
          </a>
        </Reveal>
      </section>

      <section className="section" id="reviews">
        <div className="section-head">
          <Reveal>
            <h2 className="display">Trusted across the Territory.</h2>
          </Reveal>
        </div>
        <div className="quotes">
          {[
            ["“I have recommended your products, the main reason is, the quality is there!”", "Alan Symms", "NT CONTAINER SERVICES"],
            ["“Your product and service stood out from everyone else's.”", "Tony Wood", "TOTAL TOOLS DARWIN"],
            ["“Overall very happy with the product and phenomenal service!”", "Kara Louise", "HOMEOWNER"],
            ["“Quality product for a great price.”", "Russell Catchpole", "RUSTIEJAM PEST CONTROL"],
          ].map(([q, name, org]) => (
            <Reveal key={name}>
              <figure className="quote">
                <blockquote>{q}</blockquote>
                <figcaption>
                  <strong>{name}</strong>
                  <span className="mono">{org}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <Marquee />

      <section className="cta-band">
        <Reveal>
          <h2 className="display">Tell us where. We&apos;ll handle the rest.</h2>
          <div className="actions">
            <a className="btn btn-accent" href="tel:0420251550">Call 0420 251 550</a>
            <Link className="btn btn-ghost" href="/contact">Send an enquiry</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}