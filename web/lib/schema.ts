/* Structured data.
 *
 * Audit F-04/F-11/F-13/F-17: the site carried exactly two schema types,
 * LocalBusiness on every page and FAQPage on /faq. Thirty-two products with
 * real published prices, from $7,490 to $149,900, were readable by people and
 * invisible to machines. Asked "how much is a two-bedroom container home in
 * Darwin", an answer engine had nothing structured to quote, so it cited
 * whoever did publish it.
 *
 * Every field here comes from data that already exists in lib/catalogue.ts and
 * lib/configurator.ts. Nothing is invented for the crawler's benefit — if we
 * cannot stand behind it on the page, it does not go in the markup.
 */

import { CATALOGUE, gallery, type CatalogueItem } from "@/lib/catalogue";
import { MODELS, type Model } from "@/lib/configurator";
import { abs, SITE_URL } from "@/lib/site";
import { PINS } from "@/lib/testimonials";

const ORG_ID = `${SITE_URL}/#organization`;

/** the business itself, referenced by @id from every product's `seller` */
export const organisation = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": ORG_ID,
  name: "Elite Manufacturing Group",
  description:
    "Container homes and portable buildings delivered and installed Australia-wide.",
  url: SITE_URL,
  logo: abs("/emg-mark-sm.webp"),
  image: abs("/emg-mark-sm.webp"),
  telephone: "+61 420 251 550",
  email: "admin@elitemanufacturing.com.au",
  /* the ABN is on every page of the site already; it is how an answer engine
     confirms this is the same legal entity as the business register */
  identifier: { "@type": "PropertyValue", propertyID: "ABN", value: "13 669 513 473" },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Herbert",
    addressRegion: "NT",
    addressCountry: "AU",
  },
  /* "Australia" alone is too vague to place a business. The Territory is where
     the yard is and where most jobs are; the states are where we genuinely
     deliver, and saying so is what lets a local search resolve to us. */
  areaServed: [
    { "@type": "State", name: "Northern Territory" },
    { "@type": "State", name: "Western Australia" },
    { "@type": "State", name: "Queensland" },
    { "@type": "State", name: "South Australia" },
    { "@type": "State", name: "New South Wales" },
    { "@type": "State", name: "Victoria" },
    { "@type": "Country", name: "Australia" },
  ],
  /* Herbert, in the rural area south-east of Darwin. Locality-level, not a
     surveyed address — enough to place the business on a map, which is what a
     local search needs. Replace with the yard's real coordinates when Ben
     confirms the street address. */
  geo: { "@type": "GeoCoordinates", latitude: -12.5167, longitude: 131.1333 },
  /* the published range, so a "how much" query can be answered before a click */
  priceRange: "$7,490 - $149,900",
  currenciesAccepted: "AUD",
  /* No openingHoursSpecification. Nobody has told me what the hours are, and a
     guess here is a customer turning up to a closed gate. Ask Ben and add it —
     it is a real local-search signal, just not one worth inventing. */
  knowsLanguage: "en-AU",
  /* F-13: how a machine ties the business on this page to the same business on
     Facebook and Instagram. Entity disambiguation is most of what decides
     whether you get cited by name rather than described vaguely. */
  sameAs: [
    "https://www.instagram.com/elite_manufacturing",
    "https://www.facebook.com/elitemanufacturing",
  ],
};

const withContext = <T extends object>(o: T) => ({ "@context": "https://schema.org", ...o });

/* A price that options can only add to is a lowPrice, not a price. Saying
   `price: 54900` for The Infinity Cube would be a claim we do not honour the
   moment somebody adds aircon, and the same is true of the five catalogue
   items the live shop sells as a range. */
function offer(low: number, exact: boolean, url: string, noGstClaim = false) {
  const common = {
    priceCurrency: "AUD",
    availability: "https://schema.org/InStock",
    seller: { "@id": ORG_ID },
    url,
    /* prices on this site include GST, which is not the default assumption.
       The exception is a price supplied with no GST position (priceAsGiven):
       claiming valueAddedTaxIncluded there would put words in Ben's mouth,
       so that offer carries no tax statement at all. */
    ...(noGstClaim
      ? {}
      : {
          priceSpecification: {
            "@type": "PriceSpecification",
            valueAddedTaxIncluded: true,
            priceCurrency: "AUD",
            price: low,
          },
        }),
  };
  return exact
    ? { "@type": "Offer", price: low, ...common }
    : { "@type": "AggregateOffer", lowPrice: low, offerCount: 1, ...common };
}

export function productSchema(c: CatalogueItem) {
  const url = abs(`/shop/${c.slug}`);
  return withContext({
    "@type": "Product",
    name: c.name,
    description: c.blurb,
    image: gallery(c).slice(0, 4).map((p) => abs(p)),
    category: c.category,
    brand: { "@type": "Brand", name: "Elite Manufacturing Group" },
    url,
    offers: offer(c.price, !c.from, url, c.priceAsGiven),
  });
}

/** the seven the configurator prices live: base plus options, so always a low */
export function modelSchema(m: Model) {
  const url = abs(`/build-your-own?model=${m.id}`);
  return withContext({
    "@type": "Product",
    name: m.name,
    description: m.spec + (m.glass ? ` · ${m.glass}` : ""),
    image: [m.photo, ...m.carousel.slice(0, 3)].map((p) => abs(p)),
    brand: { "@type": "Brand", name: "Elite Manufacturing Group" },
    url,
    offers: offer(m.base, false, url),
  });
}

/** F-11: gives a search result a readable trail and an answer engine the
    category a build belongs to */
export function breadcrumbs(trail: [string, string][]) {
  return withContext({
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: abs(path),
    })),
  });
}

/** F-17: makes the range enumerable rather than something to be scraped */
export function shopItemList() {
  const items = [
    ...MODELS.map((m) => ({ name: m.name, url: abs(`/build-your-own?model=${m.id}`) })),
    ...CATALOGUE.map((c) => ({ name: c.name, url: abs(`/shop/${c.slug}`) })),
  ];
  return withContext({
    "@type": "ItemList",
    name: "Elite Manufacturing Group — full range",
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: it.url,
    })),
  });
}

/** F-17: /how-it-works is already written as an ordered process, and HowTo is
    one of the few types that reliably surfaces in AI answers */
export function howTo(stages: { n: string; t: string; d: string }[]) {
  return withContext({
    "@type": "HowTo",
    name: "How a container home gets from order to handover",
    description:
      "The six stages Elite Manufacturing Group runs between an order and the keys: specification, factory build, shipping and customs, site works, delivery and installation, handover.",
    /* the public lead time, stated the same way it is stated on the page and
       in the FAQ — 4 to 6 months */
    totalTime: "P6M",
    step: stages.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.t,
      text: s.d,
      url: abs(`/how-it-works#step-${s.n}`),
    })),
  });
}

/** one <script> tag's worth of JSON-LD */
export const ld = (obj: object) => JSON.stringify(obj);

/* F-06. Four named customers at real Darwin businesses, and until now not one
   of their words reached a crawler.

   No aggregateRating: nobody gave a star rating, and inventing one to earn a
   rich result would be inventing customer opinion. Ben can decide whether to
   collect ratings properly — four is a thin base to publish an average from
   either way. */
export function reviews() {
  return PINS.map((t) =>
    withContext({
      "@type": "Review",
      itemReviewed: { "@type": "LocalBusiness", "@id": ORG_ID, name: "Elite Manufacturing Group" },
      author: {
        "@type": "Person",
        name: t.name,
        ...(t.org && t.org !== "Homeowner" ? { worksFor: { "@type": "Organization", name: t.org } } : {}),
      },
      reviewBody: t.quote,
      locationCreated: { "@type": "Place", name: t.place },
      url: abs("/testimonials"),
    })
  );
}
