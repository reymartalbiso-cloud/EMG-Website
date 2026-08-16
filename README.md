# Elite Manufacturing Group — website

The public site for elitemanufacturing.com.au. Next.js 16 + TypeScript +
Tailwind, deployed on Vercel. The customer portal is a separate project
(`EMG-Dashboard`); the two share one Supabase database.

## Deploying to Vercel

**Set the project's Root Directory to `web`.** The Next.js app lives in `web/`;
the repository root also carries working history (the original static
prototype, the design system, and the video prompts), which is not part of the
build. Without this setting the first build fails.

Everything else is the Next.js default — build `next build`, no extra config.

### Environment variables

Needed only by `/api/order`, which writes a customer's configured build into
the portal's `web_orders` table.

| Variable | Value |
| --- | --- |
| `SUPABASE_URL` | The portal's Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | The portal's service-role key — **server-side only, never prefixed `NEXT_PUBLIC_`** |
| `NEXT_PUBLIC_PORTAL_URL` | Optional. Where "Track Your Order" points. Defaults to the live portal; set it to `https://portal.elitemanufacturing.com.au` once that DNS is cut over |

The service-role key bypasses every row-level-security policy in the portal
database, so it belongs in Vercel's environment variables and nowhere else.
`app/api/order/route.ts` imports `server-only`, which makes the build fail if
that file is ever pulled into a client component.

Without the two Supabase variables the site still runs; the order form fails
visibly and offers the customer a phone number rather than losing the request.

**The `web_orders` table must exist first** — apply
`supabase/migrations/20260816000035_web_orders.sql` from the `EMG-Dashboard`
repository.

## Repository layout

| Path | What it is |
| --- | --- |
| `web/` | **The website.** The only thing Vercel builds |
| `web/public/frames`, `campframes`, `journeyframes` | Extracted WebP frames driving the scroll-scrubbed heroes |
| `web/lib/configurator.ts` | Model and option pricing — the single place prices are edited today |
| `design-system/` | The design system of record |
| `*-prompt.txt` | Prompts the hero videos were generated from, kept so they can be regenerated |
| `index.html`, `css/`, `js/`, `public/` | The original static prototype, reference only |
| `elite-manufacturing-site_3.html` | Joel's configurator prototype, reference only |

## Source video

The raw generation output the scroll sequences were made from is **not**
committed (see `.gitignore`). The frames those files produced are in
`web/public/`, which is what the site serves, so the originals would add ~110MB
to every deploy without changing what ships. They remain on the working
machine; SharePoint is the right home if they need backing up.

## Local development

```bash
cd web
npm install
npm run dev
```
