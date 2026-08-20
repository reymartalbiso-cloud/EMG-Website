import type { Metadata } from "next";
import { Reveal } from "@/components/shared";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for the Elite Manufacturing Group website, quotes and configurations.",
};

export default function Terms() {
  return (
    <>
      <div className="page-hero">
        <Reveal>
          <h1 className="display">Terms of use.</h1>
        </Reveal>
      </div>
      <section className="section" style={{ paddingTop: 0 }}>
        <p className="legal-note">
          Draft for review, to be confirmed by EMG management before launch.
          Last updated August 2026.
        </p>
        <div className="prose">
          <h3 className="display">Prices and configurations</h3>
          <p>
            Prices shown on this site, including totals produced by Build Your
            Own, are indicative and include GST. Every order is confirmed with
            a written quote that accounts for your site, access and delivery
            distance. A website configuration is not a contract and does not
            reserve stock or pricing.
          </p>
          <h3 className="display">Lead times</h3>
          <p>
            Published lead times are typical ranges, not guarantees. Ocean
            freight and customs timing vary; your order confirmation and the
            customer portal are the authoritative record for your build.
          </p>
          <h3 className="display">Content</h3>
          <p>
            Building images and floor plans on this site are representative.
            Specifications for your building are the ones documented in your
            quote and order paperwork.
          </p>
          <h3 className="display">Payment terms</h3>
          <p>
            Our standard structure is a 50% deposit, a 30% progress payment,
            and 20% on notice of arrival at the port, as set out in your
            invoice. Individual contracts may vary; the invoice governs.
          </p>
        </div>
      </section>
    </>
  );
}