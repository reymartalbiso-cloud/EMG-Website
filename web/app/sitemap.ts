import type { MetadataRoute } from "next";
import { CATALOGUE } from "@/lib/catalogue";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://elitemanufacturing.com.au";
  /* the twenty-five catalogue builds each have their own page; leaving them
     out of the sitemap is how a shop this size stays invisible */
  const catalogue = CATALOGUE.map((c) => `/shop/${c.slug}`);
  return [
    "", "/residential", "/homes", "/homes/slide-out", "/homes/two-bedroom", "/homes/expandable",
    "/commercial", "/commercial/accommodation", "/commercial/ablution", "/commercial/kitchen",
    "/domes", "/shop", "/build-your-own", "/finance", "/how-it-works", "/projects", "/testimonials", "/about",
    "/quality", "/faq", "/contact", "/privacy", "/terms",
    ...catalogue,
  ].map((p) => ({ url: `${base}${p}`, lastModified: new Date() }));
}
