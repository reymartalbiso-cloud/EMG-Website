import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/shared";
import { TERMS, TERMS_VERSION } from "@/lib/terms";

export const metadata: Metadata = {
  alternates: { canonical: "/terms" },
  title: "Terms & Conditions",
  description:
    "Elite Manufacturing Group's terms and conditions of sale: orders, pricing, payment, delivery, site access, warranty, refunds, liability and dispute resolution.",
};

/* Anchors people are sent to. The refunds one matters most: /return-policy
   redirects here, and it was a real URL on the old site that Google has
   indexed. */
const anchorFor = (n: string) => {
  const num = n.match(/^(\d+)\./)?.[1];
  if (num === "16") return "refunds";
  if (num === "15") return "warranty";
  if (num === "8") return "delivery";
  if (num === "21") return "disputes";
  return `s${num}`;
};

export default function Terms() {
  return (
    <>
      <div className="page-hero">
        <Reveal>
          <p className="eyebrow mono">ELITE MANUFACTURING GROUP PTY LTD</p>
          <h1 className="display">Terms &amp; conditions.</h1>
          <p className="section-sub">
            These are the terms on which we sell, build, deliver and install.
            They apply to every order, however it is placed.
          </p>
        </Reveal>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <Reveal>
          <p className="legal-note">
            Version {TERMS_VERSION}. ABN 13 669 513 473.
          </p>

          {/* The no-refund policy in section 16 is published without a
              consumer-law carve-out beside it, which is the single largest
              exposure in this document. This notice is EMG's own clause 53
              from the quote-and-invoice terms, quoted exactly, placed where a
              customer reads it rather than 37 clauses later. */}
          <div className="legal-callout">
            <h2 className="display">Your rights under Australian Consumer Law</h2>
            <p>
              Nothing in these Terms and Conditions excludes rights which cannot
              be legally excluded under Australian Consumer Law.
            </p>
            <p className="legal-callout-sub">
              This applies to everything below, including section 16. If a
              consumer guarantee applies to your purchase, these terms do not
              take it away.
            </p>
          </div>

          {/* The website's own terms — how prices and lead times on these pages
              relate to a quote — sit ahead of the terms of sale because they
              are what someone browsing is actually reading. */}
          <div className="prose legal-prose">
            <h2 className="display">About this website</h2>
            <p>
              Prices shown on this site, including totals produced by Build Your
              Own, include GST and are indicative. Every order is confirmed with
              a written quote that accounts for your site, access and delivery
              distance. A configuration made on this website is not a contract
              and does not reserve stock or pricing.
            </p>
            <p>
              Published lead times are typical ranges, not guarantees. Ocean
              freight and customs timing vary; your order confirmation and the
              customer portal are the authoritative record for your build.
            </p>
            <p>
              Building images and floor plans on this site are representative.
              The specifications for your building are the ones documented in
              your quote and order paperwork.
            </p>
          </div>
        </Reveal>

        {TERMS.map((part) => (
          <Reveal key={part.part}>
            <div className="legal-part">
              <h2 className="mono legal-part-head">{part.part}</h2>
              {part.sections.map((sec) => (
                <div className="legal-section" key={sec.n} id={anchorFor(sec.n)}>
                  <h3 className="display">{sec.n}</h3>
                  {sec.intro.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                  {sec.subs.map((sub) => (
                    <div className="legal-sub" key={sub.n}>
                      <h4>{sub.n}</h4>
                      {sub.body.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Reveal>
        ))}

        <Reveal>
          <div className="legal-foot">
            <p>
              Questions about these terms, or about an order already placed:
              call <a href="tel:0420251550">0420 251 550</a> or{" "}
              <Link href="/contact">send us a message</Link>.
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
