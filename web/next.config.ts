import type { NextConfig } from "next";
import { CATALOGUE } from "./lib/catalogue";

/* Frames, brand marks and build photos never change once published: a new
   sequence would be a new set of files. Next serves /public with
   `Cache-Control: public, max-age=0`, which makes a returning reader
   revalidate all 361 hero frames one by one, and makes the idle prefetch
   almost pointless because nothing it warms survives the next navigation.
   Marking them immutable is the single cheapest win available here. */
const IMMUTABLE = [
  "/frames/:path*",
  "/frames-sm/:path*",
  "/campframes/:path*",
  "/campframes-sm/:path*",
  "/journeyframes/:path*",
  "/journeyframes-sm/:path*",
  "/action/:path*",
  "/cfg/:path*",
];

/* The WordPress site this replaced kept products at /product/<slug> and we
   keep them at /shop/<slug>. The domain moved on 28 Aug, so every one of the
   51 URLs in its sitemap that we do not serve started returning 404: 31
   product pages plus the shop facets, the WooCommerce account pages and a few
   others. Those addresses are in Google's index, in old Facebook posts and in
   quotes Joel has emailed, and a 404 throws away both the visitor and the
   ranking the page had earned.

   25 of the 31 products map straight across, because the catalogue slugs were
   taken from WooCommerce on purpose. The other six are the builds Joel's
   configurator prices live, so they go to it with the model preselected. */
const MODEL_FOR_OLD_PRODUCT: Record<string, string> = {
  "the-infinity-cube-20ft-containerised-slide-out-6m-x-5m-with-infinity-glass-frontage": "ob20",
  "the-retreat": "studio",
  "deluxe-40ft-home": "one",
  "40ft-container-home": "family",
  "40ft-containerised-slide-out-home-with-infinity-glass-frontage": "ob40",
  "3x-bedroom-40ft-container-w-kitchens-and-ensuites": "workers",
};

/* 308 rather than 307: permanent, and it keeps the method. Next's `permanent:
   true` emits 308, which is what passes ranking to the destination. */
const wpRedirects = [
  ...CATALOGUE.map((c) => ({
    source: `/product/${c.slug}`,
    destination: `/shop/${c.slug}`,
    permanent: true,
  })),
  ...Object.entries(MODEL_FOR_OLD_PRODUCT).map(([slug, model]) => ({
    source: `/product/${slug}`,
    destination: `/build-your-own?model=${model}`,
    permanent: true,
  })),
  /* shop facets: WooCommerce category and tag archives. Our shop filters on
     the one page, so the range is the honest destination. */
  { source: "/product-category/:slug*", destination: "/shop", permanent: true },
  { source: "/product-tag/:slug*", destination: "/shop", permanent: true },
  /* author archives were never content anyone wanted */
  { source: "/author/:slug*", destination: "/", permanent: true },
  /* anything else under /product that we have not enumerated still lands on
     the range rather than a dead end */
  { source: "/product/:slug*", destination: "/shop", permanent: true },
];

const nextConfig: NextConfig = {
  async redirects() {
    return wpRedirects;
  },

  async headers() {
    return [
      /* Audit F-01. The preview host is a complete copy of this site on a
         different domain, fully crawlable, and it will compete with
         elitemanufacturing.com.au for every page. VERCEL_ENV is "production"
         only for the real deployment, so previews and the *.vercel.app URL
         get told to stay out of the index while production is untouched. */
      ...(process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production"
        ? [{
            source: "/:path*",
            headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
          }]
        : []),
      ...IMMUTABLE.map((source) => ({
        source,
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      })),
      {
        source: "/:file(emg-mark|emg-mark-sm|emg-logo).:ext(webp|png)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
