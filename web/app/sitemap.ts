import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://elitemanufacturing.com.au";
  return [
    "", "/residential", "/homes", "/homes/slide-out", "/homes/two-bedroom", "/homes/expandable",
    "/commercial", "/commercial/accommodation", "/commercial/ablution", "/commercial/kitchen",
    "/domes", "/shop", "/build-your-own", "/finance", "/how-it-works", "/projects", "/testimonials", "/about",
    "/quality", "/faq", "/contact", "/privacy", "/terms",
  ].map((p) => ({ url: `${base}${p}`, lastModified: new Date() }));
}
