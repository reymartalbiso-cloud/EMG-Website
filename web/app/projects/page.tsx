import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/shared";
import Gallery from "@/components/Gallery";

/* Delivered-work photos, re-shot from the live shop galleries on 28 Aug so
   each one is the model it claims to be. Grid loads the 700px copy. */
const PHOTOS = [
  { src: "/cfg/sl_ext.webp", thumb: "/cfg/sl_ext-sm.webp", alt: "40ft Containerised Slide Out Home opened out, full glass frontage onto lawn" },
  { src: "/cfg/fam_ext.webp", thumb: "/cfg/fam_ext-sm.webp", alt: "40ft two-bedroom container home finished in the yard before delivery" },
  { src: "/cfg/ic_ext.webp", thumb: "/cfg/ic_ext-sm.webp", alt: "The Infinity Cube expanded on site with its glass frontage open to the garden" },
  { src: "/cfg/wk_row.webp", thumb: "/cfg/wk_row-sm.webp", alt: "Worker accommodation blocks installed on a cleared bush site" },
  { src: "/cfg/rt_ext.webp", thumb: "/cfg/rt_ext-sm.webp", alt: "The Retreat installed in a Darwin backyard on galvanised stumps" },
  { src: "/cfg/dl_lawn.webp", thumb: "/cfg/dl_lawn-sm.webp", alt: "40ft container home set up on a suburban lawn" },
  { src: "/cfg/sl_liv.webp", thumb: "/cfg/sl_liv-sm.webp", alt: "Open-plan living inside the 40ft Containerised Slide Out Home" },
  { src: "/cfg/ic_liv.webp", thumb: "/cfg/ic_liv-sm.webp", alt: "Furnished living and kitchen space inside The Infinity Cube" },
  { src: "/cfg/fam_k.webp", thumb: "/cfg/fam_k-sm.webp", alt: "Kitchen and living area inside a 40ft two-bedroom container home" },
];

export const metadata: Metadata = {
  title: "Projects Delivered Across Australia",
  description:
    "Completed container home and commercial building deliveries across Australia. Homes, camps, ablution blocks and domes, installed and handed over.",
};

/* "Us in action" (Ben, 18 Aug): crew photos from real delivery and install
   days. Source folder at the repo root is gitignored on purpose; only the
   §1.1-audited selection is published here. */
const ACTION = [
  { src: "/action/crane-lift.webp", thumb: "/action/crane-lift-sm.webp", alt: "Crane lifting a container building into place between mango trees" },
  { src: "/action/slideout-install.webp", thumb: "/action/slideout-install-sm.webp", alt: "Slide-out container home opened out on its stumps during installation" },
  { src: "/action/footings-pad.webp", thumb: "/action/footings-pad-sm.webp", alt: "Gravel footing pad with galvanised posts set out on a bush block" },
  { src: "/action/footings-bearers.webp", thumb: "/action/footings-bearers-sm.webp", alt: "Steel bearers levelled on engineered footings, ready for delivery day" },
  { src: "/action/tight-access.webp", thumb: "/action/tight-access-sm.webp", alt: "Container home rolled on skates through a tight side yard to its pad" },
  { src: "/action/bore-test.webp", thumb: "/action/bore-test-sm.webp", alt: "Flow-testing a new bore pump during site services work" },
];

const PROJECTS = [
  { t: "Slide-out container home", w: "Private block, rural Darwin region", k: "RESIDENTIAL" },
  { t: "Two-bedroom Class 1A home", w: "Private land, Northern Territory", k: "RESIDENTIAL" },
  { t: "Multi-unit accommodation program", w: "Commercial operator, NT", k: "COMMERCIAL" },
  { t: "Type-D open plan buildings with upgraded electrical", w: "Commercial site, NT", k: "COMMERCIAL" },
  { t: "Shower & toilet blocks with container store", w: "Camp facilities, NT", k: "COMMERCIAL" },
  { t: "C4080S container dome", w: "Machinery cover, QLD", k: "DOMES" },
];

export default function Projects() {
  return (
    <>
      <div className="page-hero">
        <Reveal>
          <p className="eyebrow mono">DELIVERED, INSTALLED, HANDED OVER</p>
          <h1 className="display">Real buildings on real red dirt.</h1>
          <p className="section-sub">
            A selection of completed deliveries, Australia-wide: homes on
            private blocks, camp accommodation,
            ablution facilities and domes. Every photo below is one of our
            real builds; descriptions come straight from the order book.
          </p>
        </Reveal>
      </div>
      <section className="section" style={{ paddingTop: 0 }}>
        <Reveal>
          <Gallery photos={PHOTOS} />
        </Reveal>
      </section>
      {/* delivery-day photos straight from the crew, Ben's "Us in Action" folder */}
      <section className="section" style={{ paddingTop: 0 }} id="us-in-action">
        <div className="section-head">
          <Reveal>
            <h2 className="display">Us, in action.</h2>
            <p className="section-sub">
              Straight from the crew&apos;s phones: cranes working between mango
              trees, footings going down on red dirt, bore pumps flow-tested,
              and a home wheeled through a side gate with centimetres to
              spare. This is what delivery day really looks like.
            </p>
          </Reveal>
        </div>
        <Reveal>
          <Gallery photos={ACTION} />
        </Reveal>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="works-grid">
          {PROJECTS.map((p) => (
            <Reveal key={p.t}>
              <div className="works-item">
                <span className="mono step-n">{p.k}</span>
                <h3 className="display">{p.t}</h3>
                <p>{p.w}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="cta-band">
        <Reveal>
          <h2 className="display">Your block could be next.</h2>
          <div className="actions">
            <Link className="btn btn-accent" href="/contact">Send an enquiry</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
