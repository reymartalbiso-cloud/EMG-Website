import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/shared";

export const metadata: Metadata = {
  title: "About — Elite Manufacturing Group, Herbert NT",
  description:
    "Elite Manufacturing Group delivers and installs container homes and portable buildings across the NT and QLD from Herbert, Northern Territory — owning every step from factory to handover.",
};

const NUMBERS: [string, string][] = [
  ["2", "Established factories building to our spec"],
  ["1", "Company accountable, end to end"],
  ["NT+QLD", "Delivered, craned and installed"],
  ["4–6", "Months, typically, quote to keys"],
];

const VALUES: [string, string][] = [
  [
    "Exceptional craftsmanship",
    "Every building is inspected before it ships and again before handover — the standard we've built our name on.",
  ],
  [
    "Honest dates",
    "You get a range we actually hit, not a promise we can't — and a portal where you watch your build move, leg by leg.",
  ],
  [
    "Certified for real living",
    "Class 1A dwellings you can legally live in — with flat, threshold-free access as a standing rule of every spec we write.",
  ],
  [
    "Warranty & after-sales",
    "The team that sold you the building answers the phone after handover too. Warranty backed locally, not by a call centre.",
  ],
  [
    "Less waste, by design",
    "Factory prefabrication cuts material waste and build-time energy compared to building the same floor plan on site.",
  ],
  [
    "Built to move",
    "Portable by nature — buildings that can be relocated, re-tasked and resold as your block, project or business changes.",
  ],
];

const SECTORS: [string, string][] = [
  ["Families & first homes", "Class 1A container homes on your own land — delivered, installed and ready to live in."],
  ["Mining, gas & resources", "Worker accommodation, ablutions and full camp facilities at project and village scale."],
  ["Business & site offices", "Temporary and permanent offices for remote sites, expansions and works depots."],
  ["Education", "Portable classrooms and facility buildings, delivered to schedule around term dates."],
  ["Healthcare", "Clinics and support facilities for remote and temporary health services."],
  ["Communities & government", "Remote community and government projects — including the sites most suppliers won't quote."],
];

export default function About() {
  return (
    <>
      <div className="page-hero">
        <Reveal>
          <p className="eyebrow mono">HERBERT, NORTHERN TERRITORY</p>
          <h1 className="display">We&apos;re not the factory. We&apos;re everything after it.</h1>
          <p className="section-sub">
            Two established factories build our container buildings to our
            specification. What Elite Manufacturing Group owns is the rest of
            the journey — and the rest of the journey is the hard part.
          </p>
        </Reveal>
      </div>

      <section className="band" aria-label="Elite Manufacturing at a glance">
        <ul className="band-grid" role="list">
          {NUMBERS.map(([num, label]) => (
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
        <div className="prose">
          <Reveal>
            <p>
              Anyone can import a container. What our customers are actually
              buying is a building they can switch a light on in: the shipping
              booked, the customs entry cleared, the trucking arranged for a
              track the maps don&apos;t know, the footings engineered for the
              soil that&apos;s really there, the septic approved, the services
              connected, and the keys handed over by the same people who took
              the order.
            </p>
          </Reveal>
          <Reveal>
            <p>
              We run that whole journey from Herbert, in the rural area outside
              Darwin — Territory-based, delivering across the NT and Queensland
              including the remote sites most suppliers won&apos;t quote. Our
              customers range from families putting a first home on their own
              land to mining operators housing a crew, remote communities and
              government projects.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="section-head">
          <Reveal>
            <h2 className="display">What we stand for.</h2>
            <p className="section-sub">
              The standards that don&apos;t show up on a price list — and the
              reason customers recommend us to their neighbours.
            </p>
          </Reveal>
        </div>
        <div className="works-grid">
          {VALUES.map(([t, d]) => (
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
            <h2 className="display">Who we build for.</h2>
            <p className="section-sub">
              Portable buildings are quietly reshaping how Australia builds —
              these are the people we do it for.
            </p>
          </Reveal>
        </div>
        <div className="works-grid">
          {SECTORS.map(([t, d]) => (
            <Reveal key={t}>
              <div className="works-item">
                <h3 className="display">{t}</h3>
                <p>{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <Reveal>
            <h2 className="display">Find us.</h2>
            <p className="section-sub">
              Come and walk through a display building before you decide.
            </p>
          </Reveal>
        </div>
        <Reveal>
          <table className="spec-table">
            <tbody>
              <tr><th>Address</th><td>55 Sunter Road, Herbert NT 0836</td></tr>
              <tr><th>Hours</th><td>Monday–Friday 9am–8pm · Saturday 10am–6pm · Sunday by appointment</td></tr>
              <tr><th>Phone</th><td><a href="tel:0420251550">0420 251 550</a></td></tr>
              <tr><th>Email</th><td><a href="mailto:admin@elitemanufacturing.com.au">admin@elitemanufacturing.com.au</a></td></tr>
              <tr><th>Service area</th><td>Northern Territory &amp; Queensland — remote sites included</td></tr>
              <tr><th>ABN</th><td>13 669 513 473</td></tr>
            </tbody>
          </table>
        </Reveal>
      </section>

      <section className="cta-band">
        <Reveal>
          <h2 className="display">Talk to the team.</h2>
          <div className="actions">
            <a className="btn btn-accent" href="tel:0420251550">Call 0420 251 550</a>
            <Link className="btn btn-ghost" href="/contact">Send an enquiry</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
