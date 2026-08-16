/* External destinations, in one place.

   The portal's custom domain (portal.elitemanufacturing.com.au) is the plan of
   record in the build brief, but it does not resolve yet — the DNS is still
   waiting on Ben, and the portal's own docs list the web address as open. Until
   it is cut over, "Track Your Order" has to point at the address that actually
   answers, or the most prominent button on the site is a dead link.

   Set NEXT_PUBLIC_PORTAL_URL to the custom domain the day it goes live; nothing
   else needs to change. This mirrors how the portal refers back to us
   (NEXT_PUBLIC_WEBSITE_URL, defaulted to elitemanufacturing.com.au). */
export const PORTAL_URL =
  process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://emg-order-portal.vercel.app";
