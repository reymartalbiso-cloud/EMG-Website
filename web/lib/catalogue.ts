/* The rest of the range.
 *
 * `MODELS` in configurator.ts holds the seven builds Joel's configurator can
 * price live. The live WooCommerce shop carries twenty-five more, and Reymart
 * (28 Aug) asked for all of them. These are catalogue entries: real photos,
 * real specs, the published price, and a path into the quote form — no live
 * option pricing, because Joel's rules only cover the seven.
 *
 * Prices are the ones published on elitemanufacturing.com.au/shop. Note that
 * the six models we already carry have NEWER prices from Ben's 18 Aug call,
 * so those live in configurator.ts and deliberately differ from the shop's.
 * Anything sold as a range on the live shop is marked `from`.
 *
 * Photos live in /shop/<slug>/NN.webp with a 700px NN-sm.webp beside each.
 * Every gallery was audited against brief §1.1 before it landed.
 */

export type Category = "Homes" | "Compact homes" | "Caravans" | "Site offices" | "Ablutions" | "Commercial";

export type CatalogueItem = {
  slug: string;
  name: string;
  /** published price, inc GST */
  price: number;
  /** true when the live shop sells it as a range and this is the low end */
  from?: boolean;
  category: Category;
  /** short facts for the card chips — kept to what we can stand behind */
  spec: string;
  blurb: string;
  /** how many images sit in /shop/<slug>/ */
  shots: number;
  /** index of the first drawing in the gallery; everything from here on is a
      floor plan or schematic rather than a photo. Absent means all photos. */
  plansFrom?: number;
  /** no photography exists yet; the card shows the schematic */
  planOnly?: boolean;
  /** shown as a note on the product page: interstate minimums, or a
      delivery boundary. Ben called it "a little disclaimer" (4 Sep) — a note
      only, never a checkout rule, and worded so it does not answer whether a
      buyer can mix building types to reach a minimum, because he has not
      answered that. */
  deliveryNote?: string;
  /** Ben, 4 Sep, on the coolroom panel buildings: "Yes Darwin only". Shows
      the card chip and keeps the item out of the delivered-anywhere filter. */
  darwinOnly?: boolean;
  /** Ben supplied this price with no GST position, so it is published exactly
      as given: no "inc GST", no "ex GST", no "from" — anywhere it renders,
      including metadata and JSON-LD. Resolve against the standing GST question
      before ever removing this flag. */
  priceAsGiven?: boolean;
};

const C: CatalogueItem[] = [
  {
    slug: "vantalux-350",
    name: "Vantalux 350",
    price: 149900,
    category: "Homes",
    spec: "12m x 3.5m · 2 bed · 2 bath",
    blurb:
      "The largest building we sell and the most configurable. Twelve metres by three and a half, two bedrooms, two bathrooms, full kitchen and living. Finishes are settled before the build starts.",
    shots: 9,
    /* Floor-Plan-1 and -2 are 3D cutaway plan views, not dimensioned sheets,
       so they stay with the renders. Only the last two carry millimetres:
       the external elevations and the duplex variation. */
    plansFrom: 7,
  },
  {
    slug: "40ft-steel-frame-caravan-customisable",
    name: "40ft Steel Frame Caravan",
    price: 80200,
    category: "Caravans",
    spec: "40ft · steel chassis · off-road wheels",
    blurb:
      "A full 40ft body on a heavy steel chassis and off-road wheels. Insulated walls and ceiling, kitchen and bathroom, wired and plumbed throughout. Air conditioning can be quoted as an extra and installed after delivery.",
    shots: 6,
  },
  {
    /* Ben, 1 Sep 2026: "could you please upload this to our website as the
       commercial kitchen price $44,900". New listing, price exactly as he gave
       it. No spec beyond the size and no inclusions ANYWHERE on this page —
       there is no verified inclusions list yet, and an inclusion on a priced
       page is a price commitment. The photos are his eight edited picks; the
       fit-out they show is described as a fit-out, never as what's included.
       Air-con and hot water may only ever be described as quotable extras
       installed after delivery. 20ft building — never imply 40ft. */
    slug: "commercial-kitchen",
    name: "Commercial Kitchen",
    price: 44900,
    priceAsGiven: true,
    category: "Commercial",
    spec: "20ft",
    blurb:
      "A 20ft commercial kitchen building. The photographs show a recent fit-out; the exact specification for your kitchen is settled on your written quote, so what arrives matches your site and the way you cook.",
    shots: 8,
  },
  {
    slug: "mobile-village-13x-shipping-containers",
    name: "Mobile Village, 13 units",
    price: 79900,
    category: "Commercial",
    spec: "13 units · camp or village · relocatable",
    blurb:
      "Thirteen units supplied as one village: sleeping, ablutions and shared space, laid out for the site rather than dropped on a pad. Delivered and installed as a coordinated program.",
    shots: 7,
  },
  {
    slug: "40ft-open-plan-class1a",
    name: "40ft Open Plan Class 1A",
    price: 74900,
    category: "Homes",
    spec: "40ft · open plan · Class 1A",
    blurb:
      "A 40ft high-cube certified as a habitable dwelling and left open plan, so the internal walls go where you want them. Kitchen and bathroom fixed, everything else to your layout.",
    shots: 1,
    planOnly: true,
  },
  {
    slug: "zac-emmas-double-40ft-custom",
    name: "Zac & Emma's Double 40ft",
    price: 69900,
    category: "Homes",
    spec: "2 x 40ft · 2 bed · centre bathroom",
    blurb:
      "Two 40ft buildings joined into one home with the bathroom in the centre, built to Zac and Emma's plan. We name a build after the people it was drawn for, and it can be built again.",
    shots: 8,
    plansFrom: 7,
  },
  {
    slug: "louises-custom-container",
    name: "Louise's Custom Container",
    price: 69900,
    category: "Homes",
    spec: "40ft high-cube · 2 bed · tiled",
    blurb:
      "A 40ft high-cube fitted out as a two-bedroom home: tiled floors, full kitchen with overhead cabinetry, open living and a shared bathroom. Green Life windows and a glass sliding door.",
    shots: 7,
  },
  {
    slug: "the-executive",
    name: "The Executive",
    price: 66000,
    category: "Site offices",
    spec: "40ft · boardroom · dual bathroom",
    blurb:
      "A 40ft office built for the people who run the site, not just staff it. Boardroom, two bathrooms and a proper kitchen area, finished above site-shed standard.",
    shots: 1,
    planOnly: true,
  },
  {
    slug: "40ft-5-desk-office",
    name: "40ft 5 Desk Office",
    price: 65000,
    category: "Site offices",
    spec: "40ft · 5 desks · meeting area",
    blurb:
      "Five workstations down a 40ft building with a meeting space in the middle, plus storage and amenities. Wired for the gear a site office actually runs.",
    shots: 1,
    planOnly: true,
  },
  {
    slug: "40ft-3-desk-office",
    name: "40ft 3 Desk Office",
    price: 64000,
    category: "Site offices",
    spec: "40ft · 3 desks · storage",
    blurb:
      "Three workstations with room to spread out, built-in storage and amenities in a 40ft shell. The size most site teams settle on.",
    shots: 1,
    planOnly: true,
  },
  {
    slug: "40ft-containerised-building-open-plan",
    name: "40ft Containerised Building, Open Plan",
    price: 59500,
    category: "Homes",
    spec: "40ft · open plan · kitchen + bathroom",
    blurb:
      "The same 40ft shell as our one and two-bedroom homes, left open. Kitchen and bathroom at one end, the rest of the floor yours to arrange.",
    shots: 5,
    plansFrom: 4,
  },
  {
    slug: "20ft-customisable-steel-frame-caravan",
    name: "20ft Steel Frame Caravan",
    price: 47900,
    category: "Caravans",
    spec: "20ft · steel chassis · off-road wheels",
    blurb:
      "The 20ft version of our steel-frame caravan. Same heavy chassis and off-road wheels, insulated, with kitchen and bathroom, in a body you can tow anywhere in the Territory.",
    shots: 4,
  },
  {
    slug: "20ft-5-toilet-block",
    name: "20ft 5 Toilet Block",
    price: 34990,
    category: "Ablutions",
    spec: "20ft · 5 cubicles · hand basin",
    blurb:
      "Five individual cubicles and a basin in a 20ft building, for events and sites where a queue costs you more than the block does.",
    shots: 1,
    planOnly: true,
  },
  {
    slug: "20ft-shower-block",
    name: "20ft Shower Block",
    price: 34990,
    category: "Ablutions",
    spec: "20ft · 4 showers · change area",
    blurb:
      "Four showers with change space in a 20ft building, plumbed and ventilated to the same standard as the bathrooms in our homes.",
    shots: 1,
    planOnly: true,
  },
  {
    slug: "new-age-home-35m2-foldout",
    name: "New Age Home, 35m² Foldout",
    price: 34900,
    category: "Compact homes",
    spec: "35m2 · foldout · kitchen + bathroom",
    blurb:
      "Ships compact and folds out to thirty-five square metres on site. Kitchen, bathroom and sleeping space, with the walls doing the work instead of a crane.",
    shots: 8,
    plansFrom: 7,
  },
  {
    slug: "20ft-foldout-home",
    name: "20ft Foldout Home",
    price: 34900,
    category: "Compact homes",
    spec: "20ft · foldout · kitchen + bathroom",
    blurb:
      "A 20ft body that folds out into a liveable home with a full kitchen, bathroom and living area. Practical as a granny flat, a first dwelling or station quarters.",
    shots: 8,
    plansFrom: 7,
  },
  {
    slug: "the-salon-beauty-parlor-customisable",
    name: "The Salon & Beauty Parlor",
    price: 34000,
    category: "Commercial",
    spec: "20ft · basin + styling stations · fitted out",
    blurb:
      "A salon fit-out in a 20ft building: wash basin, styling stations, mirrors, kitchenette and bathroom. Trades out of a car park as readily as a shopfront.",
    shots: 8,
    plansFrom: 7,
  },
  {
    slug: "20ft-premium-site-office",
    name: "20ft Premium Site Office",
    price: 34000,
    category: "Site offices",
    spec: "20ft · glass entry · tiled",
    blurb:
      "A 20ft office with a full-height glazed entry and tiled floor. It reads as a building rather than a shed, which matters when clients visit the site.",
    shots: 8,
    plansFrom: 7,
  },
  {
    slug: "the-caravan",
    name: "The Caravan",
    price: 29900,
    from: true,
    category: "Caravans",
    spec: "Tandem trailer · registered · corner jacks",
    blurb:
      "Built on a galvanised tandem trailer with corner jacks, so it tows behind a ute and levels itself on arrival. Windows, door and fit-out to your spec.",
    shots: 5,
  },
  {
    slug: "2-bedroom-20ft-building",
    name: "Two Bedroom 20ft Building",
    price: 21400,
    category: "Compact homes",
    spec: "20ft · coolroom panel · 2 bed · bathroom",
    blurb:
      "Two bedrooms and a bathroom in a 20ft coolroom-panel building. The cheapest way we can put two separate sleeping rooms on a block. Darwin delivery only.",
    deliveryNote:
      "Delivered in the Darwin region only. This building does not ship interstate.",
    darwinOnly: true,
    shots: 8,
    plansFrom: 7,
  },
  {
    /* Ben, 4 Sep: these ARE his "20ft coolroom panel building" — the photos
       show the same flat-panel build on both pages, so his three variants
       live here rather than as duplicate listings at the same price. Flat
       $21,400 across variants (his figure), Darwin only (his words: "Yes
       Darwin only"), and air-con is "additional charge" — standard wording
       only. */
    slug: "one-two-bedroom-20ft-buildings",
    name: "One Bedroom 20ft Building",
    price: 21400,
    category: "Compact homes",
    spec: "20ft · coolroom panel · 1 bed · bathroom",
    blurb:
      "A single bedroom, bathroom and living space in a 20ft coolroom-panel building. Our entry point into a finished, liveable building. Darwin delivery only.",
    deliveryNote:
      "Delivered in the Darwin region only. This building does not ship interstate.",
    darwinOnly: true,
    shots: 8,
    plansFrom: 7,
  },
  {
    slug: "13ft-bedroom-add-on",
    name: "13ft Bedroom Add-On",
    price: 19500,
    category: "Compact homes",
    spec: "13ft · 1 room · joins an existing build",
    blurb:
      "A 13ft room that couples onto a building you already have, for when the family grew after the house arrived.",
    shots: 1,
    planOnly: true,
  },
  {
    slug: "wheelchair-accessible-toilet-and-shower-block-10ft",
    name: "Wheelchair Accessible Toilet & Shower, 10ft",
    price: 18500,
    from: true,
    category: "Ablutions",
    spec: "10ft · ramp access · grab rails",
    blurb:
      "A 10ft block with ramp access, grab rails, a fold-down shower seat and turning space. Built to the same accessibility standard we hold our homes to.",
    shots: 5,
    deliveryNote:
      "Interstate orders carry a 3-building minimum. There is no minimum for NT delivery.",
  },
  {
    slug: "13ft-site-office-with-bathroom",
    name: "13ft Site Office with Bathroom",
    price: 18000,
    from: true,
    category: "Site offices",
    spec: "13ft · office + bathroom · portable",
    blurb:
      "Office and bathroom in one 13ft body, small enough to shift as the job moves and self-contained enough that nobody walks to find a toilet.",
    shots: 7,
    plansFrom: 6,
  },
  {
    slug: "deluxe-toilet-and-shower",
    name: "Deluxe Toilet and Shower",
    price: 8800,
    category: "Ablutions",
    spec: "Single unit · shower + toilet · timber ceiling",
    blurb:
      "A single toilet and shower finished properly: tiled walls, timber-lined ceiling, real fixtures. What you put on a block when a portaloo would be an insult.",
    shots: 7,
    deliveryNote:
      "Interstate orders carry a 6-building minimum. There is no minimum for NT delivery.",
  },
  {
    slug: "portable-double-toilet-block",
    name: "Portable Double Toilet Block",
    price: 7490,
    category: "Ablutions",
    spec: "2 cubicles · plumbed · forklift base",
    blurb:
      "Two plumbed cubicles on a base a forklift can pick up. The cheapest thing we make, built to the same standard as everything else.",
    shots: 7,
    deliveryNote:
      "Interstate orders carry a 6-building minimum. There is no minimum for NT delivery.",
  },
];

export const CATALOGUE = C;

export const CATEGORIES: Category[] = [
  "Homes", "Compact homes", "Caravans", "Site offices", "Ablutions", "Commercial",
];

/** first photo, at card size */
export const cover = (i: CatalogueItem) => `/shop/${i.slug}/00-sm.webp`;
/** the hover image: second shot where there is one */
export const coverAlt = (i: CatalogueItem) =>
  `/shop/${i.slug}/${i.shots > 1 ? "01" : "00"}-sm.webp`;
/** full-size gallery, largest first */
export const gallery = (i: CatalogueItem) =>
  Array.from({ length: i.shots }, (_, n) => `/shop/${i.slug}/${String(n).padStart(2, "0")}.webp`);

export const bySlug = (slug: string) => C.find((i) => i.slug === slug);
