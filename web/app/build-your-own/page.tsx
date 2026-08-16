import type { Metadata } from "next";
import Configurator from "@/components/Configurator";
import { Reveal } from "@/components/shared";

export const metadata: Metadata = {
  title: "Build Your Own — Live-Priced Container Building Configurator",
  description:
    "Pick a model, choose your colours, benchtop, flooring, hot water and air conditioning — and watch the price update live. All prices inc GST. Delivery included for the first 100km.",
};

export default async function BuildYourOwn({
  searchParams,
}: {
  searchParams: Promise<{ model?: string }>;
}) {
  const { model } = await searchParams;
  return (
    <>
      <div className="page-hero">
        <Reveal>
          <p className="eyebrow mono">BUILD YOUR OWN</p>
          <h1 className="display">Pick it. Spec it. We build it.</h1>
          <p className="section-sub">
            Choose a model and make it yours — colour, benchtop, flooring,
            tapware, hot water and air conditioning. Your total updates live as
            you go, and when you&apos;re happy, send it straight to us as your
            quote request.
          </p>
        </Reveal>
      </div>
      <Configurator initialModel={model} />
    </>
  );
}