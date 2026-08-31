/* One source of truth for the site's own address.
 *
 * Audit F-02/F-03: canonical tags did not exist and the sitemap hardcoded
 * elitemanufacturing.com.au, so the preview deployment published a sitemap
 * full of URLs it does not serve — pointing, until 28 Aug, at a completely
 * different WordPress site.
 *
 * VERCEL_PROJECT_PRODUCTION_URL is the production domain as Vercel knows it,
 * which stays right if the domain ever changes again. VERCEL_URL is the
 * per-deployment host, used so a preview describes itself honestly.
 */
const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const self = process.env.VERCEL_URL;

export const SITE_URL =
  process.env.VERCEL_ENV === "production" && prod
    ? `https://${prod}`
    : self
      ? `https://${self}`
      : "https://www.elitemanufacturing.com.au";

/** absolute URL for a path, for canonical tags and the sitemap */
export const abs = (path: string) => new URL(path || "/", SITE_URL).toString();

/* Next does not deep-merge `openGraph`: a page that sets its own replaces the
   root's entirely, which silently dropped og:site_name and og:locale from
   every product page. Spread this into each override. */
export const OG_BASE = {
  type: "website" as const,
  siteName: "Elite Manufacturing Group",
  locale: "en_AU",
};
