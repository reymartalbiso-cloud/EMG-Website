import type { Metadata } from "next";
import { Reveal } from "@/components/shared";

export const metadata: Metadata = {
  title: "FAQ: Lead Times, Permits, Delivery & Site Prep",
  description:
    "Straight answers on container home lead times (typically 4-6 months), permits and approvals, delivery access, site preparation, and warranty, Australia-wide.",
};

const FAQS: [string, string][] = [
  [
    "How long until I get my building?",
    "Typically 4 to 6 months from order to handover. That covers the factory build, ocean freight, customs, trucking and installation. Ocean shipping is the least predictable stage (sometimes fast, sometimes slow), which is why we give you an honest range instead of a date that moves, and why you can watch every stage live in the customer portal.",
  ],
  [
    "Do I need council approval?",
    "For a Class 1A dwelling on your own land, usually yes, and the rules depend on your council and zoning. We supply the building's certification and engineering documents; the development approval on your land is yours to arrange, and we tell you exactly what's involved before you commit.",
  ],
  [
    "Can you deliver to my block?",
    "We deliver Australia-wide, including remote sites, stations and island communities, and the first 100km of road transport from your local port is included free, with extra distance charged at $15/km. A 40-foot container arrives on a semi-trailer with a crane, so access is the real question. We assess your track, gates and overhead clearances as part of the quote.",
  ],
  [
    "What do I need to have ready on site?",
    "A cleared, level pad the truck and crane can reach, and decisions made about services. If you take our site-works packages (footings, septic, power, water), we sequence those while your building is at sea, so the site is ready the day it arrives.",
  ],
  [
    "Are your buildings legal to live in?",
    "Our residential container homes are certified Class 1A, the National Construction Code class for habitable dwellings, the same as a house. That is the difference between a home and a shed someone put a bed in.",
  ],
  [
    "What's included in the price?",
    "Our prices are fixed and include GST: the building with your choice of colour, benchtop and flooring at no extra cost, plus the first 100km of delivery. Add-ons like hot water, air conditioning and site setup are priced individually in Build Your Own, so the total you see is the total we quote.",
  ],
  [
    "What about warranty?",
    "Buildings carry a warranty and we support them after handover. Claims go to the same local team that sold you the building.",
  ],
  [
    "Can I see my order's progress?",
    "Yes. Every customer gets access to our order portal showing your build stage, shipping dates, documents and payments, live.",
  ],
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(([q, a]) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function Faq() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="page-hero">
        <Reveal>
          <p className="eyebrow mono">STRAIGHT ANSWERS</p>
          <h1 className="display">Frequently asked questions.</h1>
        </Reveal>
      </div>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="faq-list">
          {FAQS.map(([q, a]) => (
            <Reveal key={q}>
              <div className="faq-item">
                <details>
                  <summary><h3 className="display">{q}</h3></summary>
                  <p>{a}</p>
                </details>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}