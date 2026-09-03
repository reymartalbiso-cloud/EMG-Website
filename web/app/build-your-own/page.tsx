import type { Metadata } from "next";
import Configurator from "@/components/Configurator";
import { Reveal } from "@/components/shared";
import { modelSchema, breadcrumbs, ld } from "@/lib/schema";
import { MODELS } from "@/lib/configurator";

export const metadata: Metadata = {
  alternates: { canonical: "/build-your-own" },
  title: "Build & Price Your Home",
  description:
    "Configure your container home and see the price move as you choose colour, benchtop, flooring, hot water and aircon. All prices inc GST, fixed.",
};

export default async function BuildYourOwn({
  searchParams,
}: {
  searchParams: Promise<{ model?: string }>;
}) {
  const { model } = await searchParams;
  return (
    <>
      {/* F-04: the seven the configurator prices live. Their price is a base
          that options only add to, so each is a lowPrice, never a price. */}
      {MODELS.map((m) => (
        <script key={m.id} type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ld(modelSchema(m)) }} />
      ))}
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld(breadcrumbs([["Home", "/"], ["Build & price", "/build-your-own"]])) }} />
      <div className="page-hero">
        <Reveal>
          <p className="eyebrow mono">BUILD YOUR OWN</p>
          <h1 className="display">Pick it. Spec it. We build it.</h1>
          <p className="section-sub">
            Start with the layout, pick the version of it that fits, then make
            it yours: colour, benchtop, flooring, tapware, hot water and air
            conditioning. Your total updates live as you go, and when
            you&apos;re happy, send it straight to us as your quote request.
          </p>
        </Reveal>
      </div>
      <Configurator initialModel={model} />
    </>
  );
}