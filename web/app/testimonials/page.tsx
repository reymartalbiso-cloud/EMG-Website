import type { Metadata } from "next";
import Link from "next/link";
import TestimonialMap from "@/components/TestimonialMap";
import { Reveal } from "@/components/shared";
import { PINS } from "@/lib/testimonials";
import { reviews, breadcrumbs, ld } from "@/lib/schema";

export const metadata: Metadata = {
  alternates: { canonical: "/testimonials" },
  title: "Customer Testimonials",
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
      {reviews().map((r, i) => (
        <script key={i} type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ld(r) }} />
      ))}
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld(breadcrumbs([["Home", "/"], ["Testimonials", "/testimonials"]])) }} />
      <section className="section" style={{ paddingTop: 0 }}>
        <Reveal>
          <TestimonialMap />
        </Reveal>
      </section>
      {/* F-06: the map hides these behind a click and a canvas, which means
          nobody outside a browser has ever read them. The words go in the page
          as text, in the order the pins run north to south. */}
      <section className="section" style={{ paddingTop: 0 }} id="in-their-words">
        <div className="section-head">
          <Reveal>
            <h2 className="display">In their words.</h2>
          </Reveal>
        </div>
        <div className="quote-grid">
          {PINS.map((t) => (
            <Reveal key={t.id}>
              <figure className="quote-card">
                <blockquote><p>&ldquo;{t.quote}&rdquo;</p></blockquote>
                <figcaption>
                  <span className="quote-name">{t.name}</span>
                  <span className="mono quote-org">
                    {t.org === "Homeowner" ? t.org : t.org} &middot; {t.place}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
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