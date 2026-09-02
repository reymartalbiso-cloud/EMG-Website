import type { Metadata } from "next";
import ShopGrid from "@/components/ShopGrid";
import { Reveal } from "@/components/shared";
import { shopItemList, breadcrumbs, ld } from "@/lib/schema";

export const metadata: Metadata = {
  alternates: { canonical: "/shop" },
  title: "Shop All Models & Prices",
  description:
    "Every Elite Manufacturing model in one place. Filter by bedrooms, size and price, then configure and quote it live in Build Your Own.",
};

export default function Shop() {
  return (
    <>
      {/* F-17: 32 products enumerable rather than scrapeable */}
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld(shopItemList()) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld(breadcrumbs([["Home", "/"], ["Shop all models", "/shop"]])) }} />
      <div className="page-hero">
        <Reveal>
          <p className="eyebrow mono">SHOP ALL MODELS</p>
          <h1 className="display">The whole range. One page.</h1>
          <p className="section-sub">
            Filter by what matters to you (bedrooms, size or budget), then
            take any model into Build Your Own to spec it and price it live.
            GST treatment is shown with each price.
          </p>
        </Reveal>
      </div>
      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="sr-only">All models</h2>
        <ShopGrid />
      </section>
    </>
  );
}