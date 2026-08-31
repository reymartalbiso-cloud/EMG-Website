import type { Metadata } from "next";
import Link from "next/link";
import TestimonialMap from "@/components/TestimonialMap";
import { Reveal } from "@/components/shared";

export const metadata: Metadata = {
  alternates: { canonical: "/testimonials" },
  title: "Testimonials from Customers Across Australia",
  description:
    "Real customers, real buildings, real words. Explore Elite Manufacturing testimonials across Australia.",
};

export default function Testimonials() {
  return (
    <>
      <div className="page-hero">
        <Reveal>
          <p className="eyebrow mono">WORD GETS AROUND</p>
          <h1 className="display">Real customers, on the map.</h1>
          <p className="section-sub">
            Every glowing mark is a customer who took delivery and had
            something to say. Tap a pin to read their words. Video stories
            and build photos are being added as customers share them.
          </p>
        </Reveal>
      </div>
      <section className="section" style={{ paddingTop: 0 }}>
        <Reveal>
          <TestimonialMap />
        </Reveal>
      </section>
      <section className="cta-band">
        <Reveal>
          <h2 className="display">Your build could be the next pin.</h2>
          <div className="actions">
            <Link className="btn btn-accent" href="/build-your-own">Build &amp; price</Link>
            <Link className="btn btn-ghost" href="/contact">Send an enquiry</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}