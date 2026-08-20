import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/shared";

export const metadata: Metadata = {
  title: "Finance: Fund Your Container Home or Commercial Buildings",
  description:
    "Finance options for Elite Manufacturing container homes and commercial buildings. Personal finance for residential customers, business finance for commercial and industrial projects.",
};

const TERMS: [string, string][] = [
  ["50%", "Deposit, locks in your build slot"],
  ["30%", "Progress payment during production"],
  ["20%", "On notice of arrival, before delivery"],
  ["4-6", "Months, typically, quote to keys"],
];

const PATHWAYS: [string, string][] = [
  [
    "Residential lending",
    "A container home on your own land can be financed through personal or secured lending. Ask us for a finance-ready quote and we'll point you to the lenders our customers use.",
  ],
  [
    "Business & equipment finance",
    "Site offices, ablution blocks and worker accommodation are business assets. Equipment finance and chattel mortgage structures usually fit, through your own broker or accountant.",
  ],
  [
    "Volume & project terms",
    "Multi-unit camp and accommodation programs work on project terms. Tell us the scale and the timeline and we'll structure the quote to match your funding drawdowns.",
  ],
  [
    "Negotiated per contract",
    "The 50/30/20 split is our standard, not a rule. Every contract is negotiated per job, so if your funding needs a different shape, talk to us before you sign anything.",
  ],
];

const STEPS: [string, string, string][] = [
  ["01", "Get a finance-ready quote", "Fixed and itemised: building, delivery and site works in one document your lender can read."],
  ["02", "Deposit locks it in", "50% starts your build with our manufacturing partners and reserves your delivery window."],
  ["03", "Progress while it builds", "30% during production, and you'll see photos and updates through your order portal."],
  ["04", "Final payment, then keys", "20% on notice of arrival at the port. We clear customs, deliver, install and hand over."],
];

export default function Finance() {
  return (
    <>
      <div className="page-hero">
        <Reveal>
          <p className="eyebrow mono">FINANCE</p>
          <h1 className="display">Get building sooner.</h1>
          <p className="section-sub">
            You don&apos;t have to pay for your building outright on day one.
            Our standard terms split payment across the build, and finance
            can cover the rest.
          </p>
        </Reveal>
      </div>

      <section className="band" aria-label="Payment structure">
        <ul className="band-grid" role="list">
          {TERMS.map(([num, label]) => (
            <li className="band-item" key={label}>
              <Reveal>
                <span className="band-num display">{num}</span>
                <span className="band-label">{label}</span>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="section-head">
          <Reveal>
            <h2 className="display">Two ways to fund it.</h2>
            <p className="section-sub">
              Residential buyers and commercial operators fund buildings
              differently. We quote so both work.
            </p>
          </Reveal>
        </div>
        <div className="works-grid">
          {PATHWAYS.map(([t, d]) => (
            <Reveal key={t}>
              <div className="works-item">
                <h3 className="display">{t}</h3>
                <p>{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="section-head">
          <Reveal>
            <h2 className="display">One document your lender will actually like.</h2>
            <p className="section-sub">
              Lenders stall on vague numbers. An EMG quote gives them none.
            </p>
          </Reveal>
        </div>
        <Reveal>
          <table className="spec-table">
            <tbody>
              <tr><th>Fixed price</th><td>One total, inc GST. No provisional sums waiting to blow out later.</td></tr>
              <tr><th>Itemised</th><td>Building, options, delivery and site works each priced on their own line.</td></tr>
              <tr><th>Site works included</th><td>Footings, services and install in the same document. No second contractor to explain.</td></tr>
              <tr><th>Payment schedule</th><td>The 50/30/20 structure in writing, tied to build milestones.</td></tr>
              <tr><th>Timeline</th><td>An honest 4-6 month window, tracked live in your order portal.</td></tr>
            </tbody>
          </table>
        </Reveal>
      </section>

      <section className="section">
        <div className="section-head">
          <Reveal>
            <h2 className="display">From quote to keys.</h2>
          </Reveal>
        </div>
        <ol className="steps-home" role="list">
          {STEPS.map(([n, t, d]) => (
            <li key={n}>
              <Reveal>
                <div>
                  <span className="step-n mono">{n}</span>
                  <h3 className="display">{t}</h3>
                  <p>{d}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="cta-band">
        <Reveal>
          <h2 className="display">Talk numbers with a real person.</h2>
          <div className="actions">
            <a className="btn btn-accent" href="tel:0420251550">Call 0420 251 550</a>
            <Link className="btn btn-ghost" href="/contact">Send an enquiry</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
