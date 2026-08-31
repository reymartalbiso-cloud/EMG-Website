import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/shared";
import { AREAS } from "@/lib/areas";
import { breadcrumbs, ld } from "@/lib/schema";

export const metadata: Metadata = {
  alternates: { canonical: "/areas" },
  title: "Where We Deliver",
  description:
    "Container homes and commercial buildings delivered from our Herbert yard to Darwin, Katherine, Alice Springs and remote communities. What changes with distance, ground and season.",
};

export default function Areas() {
  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld(breadcrumbs([["Home", "/"], ["Where we deliver", "/areas"]])) }} />

      <div className="page-hero">
        <Reveal>
          <p className="eyebrow mono">FROM HERBERT, NORTHERN TERRITORY</p>
          <h1 className="display">Where we deliver.</h1>
          <p className="section-sub">
            We deliver Australia-wide, but the honest answer to &ldquo;what will it
            cost to get here&rdquo; changes with the distance, the ground and the
            season. These are the places we go most, and what is different about
            each of them.
          </p>
        </Reveal>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="area-grid">
          {AREAS.map((a) => (
            <Reveal key={a.slug}>
              <Link className="area-card" href={`/areas/${a.slug}`}>
                <h2 className="display">{a.title}</h2>
                <p>{a.summary}</p>
                <span className="mono area-cta">{a.name.toUpperCase()} &rarr;</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <Reveal>
          <p className="section-sub" style={{ maxWidth: "46rem" }}>
            Somewhere not listed? We deliver to every state, including sites most
            suppliers will not quote. The rule is the same everywhere: the first
            100km of road transport from your local port is included, and
            everything past that is $15 per kilometre.
          </p>
          <div className="actions" style={{ marginTop: "1.5rem" }}>
            <Link className="btn btn-accent" href="/contact">Send an enquiry</Link>
            <a className="btn btn-ghost" href="tel:0420251550">Call 0420 251 550</a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
