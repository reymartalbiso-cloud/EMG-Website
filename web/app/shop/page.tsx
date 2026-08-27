import type { Metadata } from "next";
import ShopGrid from "@/components/ShopGrid";
import { Reveal } from "@/components/shared";

export const metadata: Metadata = {
  title: "Shop All Models: Container Homes & Buildings with Prices",
  description:
    "Every Elite Manufacturing model in one place. Filter by bedrooms, size and price. All prices inc GST, configured and quoted live in Build Your Own.",
};

export default function Shop() {
  return (
    <>
      <div className="page-hero">
        <Reveal>
          <p className="eyebrow mono">SHOP ALL MODELS</p>
          <h1 className="display">The whole range. One page.</h1>
          <p className="section-sub">
            Filter by what matters to you (bedrooms, size or budget), then
            take any model into Build Your Own to spec it and price it live.
            All prices inc GST.
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