import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Reveal } from "@/components/shared";
import { AREAS, areaBySlug } from "@/lib/areas";
import { breadcrumbs, ld } from "@/lib/schema";
import { OG_BASE } from "@/lib/site";

export function generateStaticParams() {
  return AREAS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const a = areaBySlug(slug);
  if (!a) return {};
  const desc = a.summary.length <= 158 ? a.summary : a.summary.slice(0, 155).replace(/[\s,.;:]+\S*$/, "") + "…";
  return {
    title: a.title,
    description: desc,
    alternates: { canonical: `/areas/${a.slug}` },
    openGraph: {
      ...OG_BASE,
      title: a.title,
      description: desc,
      url: `/areas/${a.slug}`,
      images: [{ url: "/cfg/res_home.webp", alt: `Container home delivered to ${a.name}` }],
    },
    twitter: { card: "summary_large_image", images: ["/cfg/res_home.webp"] },
  };
}

export default async function AreaPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const a = areaBySlug(slug);
  if (!a) notFound();

  /* the four things that are actually different about building here, in the
     order somebody weighing it up asks them */
  const sections: [string, string][] = [
    ["Getting it there", a.freight],
    ["What the ground and the weather decide", a.ground],
    ["Who approves it", a.approval],
    ["What people here order", a.common],
    ["The part worth knowing early", a.watch],
  ];

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld(breadcrumbs([
          ["Home", "/"], ["Where we deliver", "/areas"], [a.name, `/areas/${a.slug}`],
        ])) }} />

      <div className="page-hero">
        <Reveal>
          <p className="eyebrow mono">{a.region.toUpperCase()}</p>
          <h1 className="display">{a.title}</h1>
          <p className="section-sub">{a.summary}</p>
        </Reveal>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="area-grid">
          {sections.map(([h, body]) => (
            <Reveal key={h}>
              <div className="area-item">
                <h2 className="display">{h}</h2>
                <p>{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <Reveal>
          <h2 className="display">Tell us the address and we&apos;ll tell you the number.</h2>
          <p className="section-sub" style={{ margin: "0 auto" }}>
            Access, footings, services and distance are what move a quote, so we
            price the job rather than guess at it. Typical lead time is 4 to 6
            months from order to handover.
          </p>
          <div className="actions">
            <Link className="btn btn-accent" href={`/contact?q=${encodeURIComponent(`I'm building in ${a.name}. `)}`}>
              Send an enquiry
            </Link>
            <a className="btn btn-ghost" href="tel:0420251550">Call 0420 251 550</a>
            <Link className="btn btn-ghost" href="/shop">See the range</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
