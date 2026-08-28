import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Reveal } from "@/components/shared";
import Gallery from "@/components/Gallery";
import { CATALOGUE, bySlug, gallery } from "@/lib/catalogue";
import { money } from "@/lib/configurator";

export function generateStaticParams() {
  return CATALOGUE.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const c = bySlug(slug);
  if (!c) return {};
  return {
    title: `${c.name} — ${c.from ? "from " : ""}${money(c.price)} inc GST`,
    description: c.blurb,
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
