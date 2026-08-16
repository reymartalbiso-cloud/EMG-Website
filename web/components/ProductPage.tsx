import Link from "next/link";
import { Reveal } from "@/components/shared";
import type { Product } from "@/lib/products";

export default function ProductPage({ product }: { product: Product }) {
  return (
    <>
      <div className="page-hero">
        <Reveal>
          <p className="eyebrow mono">
            {product.audience === "commercial" ? "COMMERCIAL RANGE" : "CONTAINER HOMES"}
          </p>
          <h1 className="display">{product.name}</h1>
          <p className="section-sub">{product.short}</p>
        </Reveal>
      </div>
      <div className="product-layout">
        <Reveal>
          <div className="product-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image} alt={product.name} />
          </div>
          <div className="prose" style={{ marginTop: "2rem" }}>
            {product.body.map((p, i) => (<p key={i}>{p}</p>))}
          </div>
        </Reveal>
        <Reveal>
          <table className="spec-table">
            <tbody>
              {product.specs.map(([k, v]) => (
                <tr key={k}><th>{k}</th><td>{v}</td></tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "2.5rem" }}>
            <Link className="btn btn-accent" href="/contact">Send an enquiry</Link>
            <Link className="btn btn-ghost" href="/how-it-works">How delivery works</Link>
          </div>
        </Reveal>
      </div>
      <section className="cta-band">
        <Reveal>
          <h2 className="display">Every quote is per job. Tell us your site.</h2>
          <p className="section-sub" style={{ margin: "0 auto" }}>
            Access, footings, services and distance all matter — so we quote
            each build properly rather than guessing.
          </p>
          <div className="actions">
            <a className="btn btn-accent" href="tel:0420251550">Call 0420 251 550</a>
            <Link className="btn btn-ghost" href="/contact">Send an enquiry</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}