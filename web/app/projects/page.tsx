import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/shared";
import Gallery from "@/components/Gallery";

const PHOTOS = [
  { src: "/cfg/ch_front.jpg", alt: "40ft container home on a bush block" },
  { src: "/cfg/so_ext2.jpg", alt: "40ft Outback slide-out with full glass frontage" },
  { src: "/cfg/img1.jpg", alt: "20ft Outback double-wide unit" },
  { src: "/cfg/wa_ext.jpg", alt: "Workers accommodation unit" },
  { src: "/cfg/st_ext.jpg", alt: "20ft Studio exterior" },
  { src: "/cfg/ch_front2.jpg", alt: "Container home with sliding glass doors" },
  { src: "/cfg/so_ext1.jpg", alt: "Slide-out home under roof-over" },
  { src: "/cfg/ch_k.jpg", alt: "Full kitchen inside a container home" },
  { src: "/cfg/so_int1.jpg", alt: "Open-plan living inside the 40ft Outback" },
];

export const metadata: Metadata = {
  title: "Projects — Delivered Across NT & QLD",
  description:
    "Completed container home and commercial building deliveries across the Northern Territory and Queensland — homes, camps, ablution blocks and domes, installed and handed over.",
};

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
            A selection of completed deliveries across the Northern Territory
            and Queensland — homes on private blocks, camp accommodation,
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
