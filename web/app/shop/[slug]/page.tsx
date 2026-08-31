import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Reveal } from "@/components/shared";
import Gallery from "@/components/Gallery";
import { CATALOGUE, bySlug, gallery } from "@/lib/catalogue";
import { COPY } from "@/lib/catalogueCopy";
import { money } from "@/lib/configurator";
import { productSchema, breadcrumbs, ld } from "@/lib/schema";
import { OG_BASE } from "@/lib/site";

export function generateStaticParams() {
  return CATALOGUE.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const c = bySlug(slug);
  if (!c) return {};
  /* the blurb is written for the page; a snippet is cut at ~160, so trim on a
     word boundary rather than letting Google do it mid-sentence */
  const snippet = c.blurb.length <= 158
    ? c.blurb
    : c.blurb.slice(0, 155).replace(/[\s,.;:]+\S*$/, "") + "…";
  return {
    title: `${c.name} — ${c.from ? "from " : ""}${money(c.price)} inc GST`,
    description: snippet,
    alternates: { canonical: `/shop/${c.slug}` },
    /* F-05: the shared link shows this build, not the site-wide fallback */
    openGraph: {
      ...OG_BASE,
      title: c.name,
      description: snippet,
      url: `/shop/${c.slug}`,
      images: [{ url: `/shop/${c.slug}/00.webp`, alt: `${c.name} — ${c.spec}` }],
    },
    twitter: { card: "summary_large_image", images: [`/shop/${c.slug}/00.webp`] },
  };
}

export default async function CatalogueProduct(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const c = bySlug(slug);
  if (!c) notFound();

  /* Most of these carry CAD drawings after the photos, and seven have nothing
     but drawings. Mark them so the grid can put them on white — line art on a
     dark tile is unreadable — and so the alt text promises a drawing, not a
     photo. */
  const all = gallery(c);
  const firstPlan = c.planOnly ? 0 : c.plansFrom ?? all.length;
  const shots = all.map((src, i) => {
    const isPlan = i >= firstPlan;
    return {
      src,
      thumb: src.replace(/\.webp$/, "-sm.webp"),
      plan: isPlan,
      alt: isPlan
        ? `${c.name} floor plan and elevations, drawing ${i - firstPlan + 1}`
        : `${c.name}, photo ${i + 1}`,
    };
  });
  const planCount = all.length - firstPlan;

  return (
    <>
      {/* F-04: the price on this page is now readable by a machine, not just
          by a person. F-11: the trail replaces a bare URL in the result. */}
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld(productSchema(c)) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld(breadcrumbs([
          ["Home", "/"], ["Shop all models", "/shop"], [c.name, `/shop/${c.slug}`],
        ])) }} />
      <div className="page-hero">
        <Reveal>
          <p className="eyebrow mono">{c.category.toUpperCase()}</p>
          <h1 className="display">{c.name}</h1>
          <p className="section-sub">{c.blurb}</p>
        </Reveal>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="cat-head">
            <div className="spec-chips" aria-label="Specifications">
              {c.spec.split("·").map((s) => (
                <span className="mono spec-chip" key={s}>{s.trim().toUpperCase()}</span>
              ))}
            </div>
            <p className="shop-price cat-price">
              <span className="from mono">{c.from ? "FROM" : "PRICE"}</span> {money(c.price)}{" "}
              <small>inc GST</small>
            </p>
          </div>

          {c.planOnly ? (
            <p className="cat-note">
              We have not photographed this one yet, so the drawing is what we
              can honestly show. Every dimension on it is the build dimension.
              Ask us and we&apos;ll send photos of the closest build we have
              delivered.
            </p>
          ) : planCount > 0 && (
            <p className="cat-note">
              The last {planCount === 1 ? "image is the" : `${planCount} images are the`}{" "}
              dimensioned {planCount === 1 ? "drawing" : "drawings"} for this build. Open{" "}
              {planCount === 1 ? "it" : "them"} full size to read the millimetres.
            </p>
          )}

          <Gallery photos={shots} />

          {/* F-14: these pages were a headline, a price and photos — about 110
              words. Nothing for a reader to weigh up and nothing for an answer
              engine to quote. */}
          {COPY[c.slug] && (
            <div className="cat-prose">
              {COPY[c.slug].map((para, i) => <p key={i}>{para}</p>)}
            </div>
          )}

          <div className="cat-actions">
            {/* the contact form already prefills its message box from ?q=, so
                Joel gets the product name without a second mechanism */}
            <Link
              className="btn btn-accent"
              href={`/contact?q=${encodeURIComponent(`I'd like a quote on the ${c.name}.`)}`}
            >
              Enquire about this build ↗
            </Link>
            <a className="btn btn-ghost" href="tel:0420251550">Call 0420 251 550</a>
            <Link className="btn btn-ghost" href="/shop">Back to the range</Link>
          </div>

          <p className="cat-foot section-sub">
            Price covers the building. Delivery, footings and service
            connections are quoted per site, because access and distance decide
            them. Typical lead time is 4-6 months.
          </p>
        </Reveal>
      </section>
    </>
  );
}
