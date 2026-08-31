import type { MetadataRoute } from "next";
import { CATALOGUE } from "@/lib/catalogue";
import { AREAS } from "@/lib/areas";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  /* was hardcoded, so the preview host advertised production URLs */
  const base = SITE_URL;
  /* the twenty-five catalogue builds each have their own page; leaving them
     out of the sitemap is how a shop this size stays invisible */
  const catalogue = CATALOGUE.map((c) => `/shop/${c.slug}`);
  const areas = AREAS.map((a) => `/areas/${a.slug}`);
  return [
    "", "/residential", "/homes", "/homes/slide-out", "/homes/two-bedroom", "/homes/expandable",
    "/commercial", "/commercial/accommodation", "/commercial/ablution", "/commercial/kitchen",
    "/domes", "/shop", "/build-your-own", "/finance", "/how-it-works", "/projects", "/testimonials", "/about",
    "/quality", "/faq", "/contact", "/privacy", "/terms",
    ...catalogue,
  /* F-12: this was `new Date()`, so all 48 URLs claimed to change on every
     deploy. A crawler learns to discount a field that is always "just now",
     and then you have lost it for the pages that genuinely did change.
     Omitting it is more honest than lying, until there is a real per-page
     date to publish. */
  ].map((p) => ({ url: `${base}${p}` }));
}
