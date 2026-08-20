import Link from "next/link";
import type { Metadata } from "next";
import JourneyRail from "@/components/JourneyRail";
import JourneySequence from "@/components/JourneySequence";
import { Reveal } from "@/components/shared";
import { SITE_WORKS } from "@/lib/products";
import { PORTAL_URL } from "@/lib/links";

export const metadata: Metadata = {
  title: "How It Works: Container Home Delivery, Honestly Told",
  description:
    "How a container home actually gets from order to handover, anywhere in Australia: specification, factory build, shipping and customs, site works and installation. Typically 4-6 months, honestly tracked.",
};

const STAGES = [
  {
    n: "01", t: "Specification & order",
    d: "We lock the layout, fit-out, electrical spec and compliance path before anything is built. You see drawings of what you're getting, including our standard threshold-free access and sunken shower bases, and the factory builds to that spec, not to an interpretation of an email.",
  },
  {
    n: "02", t: "Factory build",
    d: "Your building is constructed by one of the two established factories we work with, to our specification. We are not the factory, and that honesty matters, because what you are buying from us is everything the factory can't do: getting a finished building certified, shipped and standing on your block.",
  },
  {
    n: "03", t: "Shipping & customs",
    d: "We book the sailing, run the customs entry and quarantine, and manage the port handling. Ocean freight is the least predictable stage of the journey, which is exactly why we own it rather than leaving it to you, and why our public lead time is honest about the range.",
  },
  {
    n: "04", t: "Site works",
    d: "While your building is at sea, your site gets ready: footings engineered for your soil and wind region, septic and wastewater if you need it, power, water and site access. One crew, one plan, sequenced so nothing waits on anything.",
  },
  {
    n: "05", t: "Delivery & installation",
    d: "Trucking, crane lift, placement, connection and commissioning. A 40-foot container on a truck needs real access, so we assess that before you order, not on delivery morning.",
  },
  {
    n: "06", t: "Handover",
    d: "Walk-through, keys, documents, and warranty support after you move in. You can watch every stage above happen live in the customer portal from the day you order.",
  },
];

export default function HowItWorks() {
  return (
    <>
      <JourneySequence />

      <div className="page-hero" style={{ paddingTop: "var(--space-6)" }}>
        <Reveal>
          <p className="eyebrow mono">THE WHOLE JOURNEY, HONESTLY TOLD</p>
          <h2 className="display" style={{ fontSize: "clamp(2.4rem, 5.4vw, 4.6rem)" }}>Order to move-in, typically 4-6 months.</h2>
          <p className="section-sub">
            Most container-building websites promise a delivery date. We&apos;d
            rather explain the journey and give you a range we actually hit,
            because the one thing that ruins this experience is a date that
            moves. Here is what really happens, stage by stage.
          </p>
        </Reveal>
      </div>

      <JourneyRail />

      <section className="section">
        <div className="section-head">
          <Reveal>
            <h2 className="display">The detail, stage by stage.</h2>
          </Reveal>
        </div>
        <div className="faq-list">
          {STAGES.map((s) => (
            <Reveal key={s.n}>
              <div className="faq-item">
                <span className="mono step-n">{s.n}</span>
                <h3 className="display">{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <Reveal>
            <h2 className="display">One contractor, the whole job.</h2>
            <p className="section-sub">
              A building you can&apos;t switch a light on in isn&apos;t finished.
              These are the works we deliver alongside the building itself.
            </p>
          </Reveal>
        </div>
        <div className="works-grid">
          {SITE_WORKS.map((w) => (
            <Reveal key={w.name}>
              <div className="works-item">
                <h3 className="display">{w.name}</h3>
                <p>{w.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <Reveal>
          <h2 className="display">Want a timeline for your build?</h2>
          <div className="actions">
            <Link className="btn btn-accent" href="/contact">Send an enquiry</Link>
            <a className="btn btn-ghost" href={PORTAL_URL}>Already ordered? Track it</a>
          </div>
        </Reveal>
      </section>
    </>
  );
}