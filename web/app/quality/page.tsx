import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/shared";

export const metadata: Metadata = {
  title: "Quality & Compliance — Class 1A Container Homes",
  description:
    "What Class 1A certification means, EMG's accessibility standard (threshold-free doorways, sunken shower bases), high-cube builds, RAL 7035 finish, permits and warranty.",
};

export default function Quality() {
  return (
    <>
      <div className="page-hero">
        <Reveal>
          <p className="eyebrow mono">QUALITY &amp; COMPLIANCE</p>
          <h1 className="display">The questions a serious buyer asks first.</h1>
          <p className="section-sub">
            Certification, access, permits and warranty — answered plainly,
            because the most expensive problems in this industry come from
            things nobody stated up front.
          </p>
        </Reveal>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="prose">
          <Reveal>
            <h3 className="display">Class 1A — a dwelling, not a shed</h3>
            <p>
              Class 1A is the National Construction Code classification for a
              habitable dwelling — the same class as a house. Our residential
              container homes are built and certified to that standard, which is
              what makes them legal to live in. Plenty of container buildings on the
              market are certified (if at all) as sheds or temporary structures;
              the difference decides whether your council will let you occupy
              it. Ask any supplier which class their building is certified to —
              it is the single most revealing question in this market.
            </p>
          </Reveal>
          <Reveal>
            <h3 className="display">Accessible by default</h3>
            <p>
              Every container building we deliver is specified with a sunken
              shower base and threshold-free doorways — flat all the way
              through, no step edges, no trip hazards. It is a standing rule in
              our build spec, not an optional extra. If you or the people you
              house have mobility needs, this is the detail most suppliers
              charge for and we simply include.
            </p>
          </Reveal>
          <Reveal>
            <h3 className="display">High-cube, RAL 7035, every time</h3>
            <p>
              All our container units are high-cube — roughly 30&nbsp;cm more
              ceiling height than a standard container, and the difference
              between &ldquo;converted container&rdquo; and a room you&apos;d
              happily live in. The standard finish is RAL&nbsp;7035 light grey:
              heat-sensible in the harshest Australian sun and consistent across every
              building we deliver.
            </p>
          </Reveal>
          <Reveal>
            <h3 className="display">Permits — what we do, what you do</h3>
            <p>
              We handle the building itself: certification, engineering
              documentation and the delivery. Development approval on your land
              is between you and your council, and the rules differ by
              jurisdiction and zoning. We tell you plainly what paperwork the
              building carries and what you&apos;ll need to arrange locally —
              before you pay a deposit, not after.
            </p>
          </Reveal>
          <Reveal>
            <h3 className="display">Site access and preparation</h3>
            <p>
              A 40-foot container arrives on a semi with a crane. Your track,
              gates, trees and power lines matter. We assess access as part of
              quoting, and we tell you what must be ready on your site before
              delivery day — cleared, levelled, and reachable.
            </p>
          </Reveal>
          <Reveal>
            <h3 className="display">Warranty and after-sales</h3>
            <p>
              Buildings are covered by warranty and we support them after
              handover — including shipping warranty parts with subsequent
              orders when that&apos;s the fastest path. A claim starts with an
              email or a phone call to the same people who sold you the
              building; there is no offshore ticket queue.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="cta-band">
        <Reveal>
          <h2 className="display">Ask us the hard questions.</h2>
          <div className="actions">
            <a className="btn btn-accent" href="tel:0420251550">Call 0420 251 550</a>
            <Link className="btn btn-ghost" href="/faq">Read the FAQ</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}