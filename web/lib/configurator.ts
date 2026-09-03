/* Configurator data — Joel's option list and pricing rules, taken verbatim
   from his approved prototype (elite-manufacturing-site_3.html).
   All prices inc GST. Keep this file as the single editable price source;
   it is scheduled to move to a no-deploy store (CMS/Supabase) per brief §7.1. */

export type AcMode = "single" | "mix";

export type Model = {
  id: string;
  name: string;
  base: number;
  ac: AcMode;
  show: string[];
  spec: string;
  glass?: string;
  custom?: boolean;
  setup?: { label: string; price: number; incl: string };
  photo: string;
  carousel: string[];
  /** NT-yard stock EMG cannot deliver interstate (Joel, 18 Aug: D-types and
      fold-outs). The shop badges and filters these automatically the moment a
      model carries the flag — an interstate caller asking for a product we
      cannot supply is a lost sale that never needed to happen. */
  ntOnly?: boolean;
};

/* Photography pulled from the live elitemanufacturing.com.au shop, 28 Aug,
   after Ben spotted the old set showing Louise's custom build on models it
   isn't. Every shot is audited against brief §1.1 before it lands here.
   Schematics that predate the shop galleries are still .jpg. */
const img = (k: string) => `/cfg/${k}.webp`;
const plan = (k: string) => `/cfg/${k}.jpg`;

/* Card grids show the 700px copy, the carousel and lightbox the full 1400px
   file. Only the shot library carries -sm copies; schematics pass through. */
export const thumb = (src: string) =>
  src.endsWith(".webp") ? src.replace(/\.webp$/, "-sm.webp") : src;

export const MODELS: Model[] = [
  {
    id: "ob20",
    name: "The Infinity Cube",
    base: 54900,
    ac: "single",
    show: ["hw", "ac", "setup"],
    setup: {
      label: "Darwin-only setup",
      price: 12000,
      incl: "Stumping, weatherproofing, slide-out + weld-off. Darwin only. Excludes service connections.",
    },
    spec: "20ft · 1 room double wide · kitchen + bathroom",
    glass: "6m infinity glass frontage",
    photo: img("ic_ext"),
    carousel: ["ic_ext", "ic_liv", "ic_open", "ic_bed", "ic_int", "ic_bath", "ic_ext2", "ic_closed"].map(img),
  },
  {
    id: "studio",
    name: "The Retreat",
    /* Ben, WhatsApp 3 Sep 10:05: "Retreats can be 34900 for the 20-foot" */
    base: 34900,
    ac: "mix",
    show: ["colour", "bench", "tap", "floor", "hw", "ac", "delivery"],
    /* Ben, 1 Sep 2026: the Retreat is 5.85m, not 6m — so not "20ft" either,
       which reads as 6.06m. The one model whose length is stated in metres. */
    spec: "5.85m · 1 room · kitchen · ensuite",
    photo: img("rt_ext"),
    carousel: [...["rt_ext", "rt_int", "rt_bath", "rt_bath2", "rt_ext2", "rt_yard"].map(img), plan("st_fp")],
  },
  {
    id: "one",
    name: "Deluxe 40ft Home",
    base: 69900,
    ac: "mix",
    show: ["colour", "bench", "tap", "floor", "hw", "ac", "delivery"],
    spec: "40ft · 1 bed · kitchen + living + bathroom",
    /* the live shop has no clean exterior for this one — its own listing leads
       with a service-side shot — so the card leads with the interior and the
       exteriors follow. Replace when Ben's 3D renders land. */
    photo: img("dl_liv"),
    carousel: ["dl_liv", "dl_lawn", "dl_int", "dl_bath", "dl_ext", "dl_fp"].map(img),
  },
  {
    id: "family",
    name: "40ft 2xBedroom Container Home",
    base: 64000,
    ac: "mix",
    show: ["colour", "bench", "tap", "floor", "hw", "ac", "delivery"],
    spec: "40ft · 2 bed · kitchen, bathroom + living",
    photo: img("fam_front"),
    carousel: [...["fam_front", "fam_ext", "fam_k", "fam_bath", "fam_int", "fam_grass2"].map(img), img("fam_fp")],
  },
  {
    id: "ob40",
    name: "40ft Containerised Slide Out Home",
    base: 99000,
    ac: "mix",
    show: ["hw", "ac", "setup"],
    setup: {
      label: "Site setup",
      price: 20000,
      incl: "Stumping, weatherproofing, slide-out + weld-off. Excludes service connections.",
    },
    spec: "40ft · slide-out · multiple living areas",
    glass: "12m infinity glass frontage",
    photo: img("sl_ext"),
    carousel: [...["sl_ext", "sl_liv", "sl_k", "sl_room", "sl_desk", "sl_bath", "sl_ext2", "sl_closed"].map(img), img("sl_fp")],
  },
  {
    id: "workers",
    name: "Worker Accommodation",
    base: 69500,
    ac: "mix",
    show: ["bedrooms", "colour", "bench", "tap", "floor", "hw", "ac", "delivery"],
    spec: "40ft · 3 or 4 bedroom · ensuite per room",
    photo: img("wk_row"),
    carousel: ["wk_row", "wk_ext", "wk_k", "wk_bath", "wk_entry", "wk_fp"].map(img),
  },
  {
    id: "custom",
    name: "Custom build",
    base: 59900,
    ac: "mix",
    show: ["colour", "bench", "tap", "floor", "hw", "ac", "delivery", "custom"],
    custom: true,
    spec: "Built to your plan · add-ons selectable",
    photo: img("ic_liv"),
    carousel: ["ic_liv", "sl_ext", "fam_ext", "rt_ext", "dl_liv", "wk_row"].map(img),
  },
];

export const COLOURS = [
  { n: "Surfmist", r: "RAL 9002", h: "#E4E2D5" },
  { n: "Classic Cream", r: "RAL 1015", h: "#E6DBC0" },
  { n: "Dune", r: "RAL 7032", h: "#CAC5B6" },
  { n: "Shale Grey", r: "RAL 7038", h: "#BABEB3" },
  { n: "Windspray", r: "RAL 7037", h: "#8A8D8C" },
  { n: "Woodland Grey", r: "RAL 7022", h: "#4C4F4C" },
  { n: "Ironstone", r: "RAL 7015", h: "#404650" },
  { n: "Monument", r: "RAL 7021", h: "#34363A" },
  { n: "Night Sky", r: "RAL 9005", h: "#1E1E1E" },
];

export const BENCHTOPS = ["7705", "7718", "7702", "9038", "7719", "9037", "7701", "Black"].map(
  (c) => ({ c, img: `/cfg/bench_${c}.jpg` })
);

export const FLOORS = [
  "2205", "2208", "2026", "2203", "2021", "2206", "2022", "2025",
  "2209", "2822", "2825", "2821", "2827", "2829", "2823",
].map((c) => ({ c, img: `/cfg/floor_${c}.jpg` }));

/* Ben, 18 Aug (twice): the glass sliding door is the standard door; a normal
   hinged door — swinging OUTWARDS — is the option, and it takes $2,000 off. */
export const DOORS = [
  { id: "sliding", name: "Glass sliding door", sub: "standard on every build", price: 0 },
  { id: "hinged", name: "Standard hinged door", sub: "opens outwards", price: -2000 },
];

export const HOT_WATER = [
  { name: "None", cap: "", sub: "building only", price: 0 },
  { name: "Electric storage", cap: "50L", sub: "50L tank", price: 2500 },
  { name: "Gas instant", cap: "16L/min", sub: "16L/min · continuous", price: 3000 },
];

export const AC_UNITS = {
  single: [{ kw: "4.5kW", use: "this model", price: 3100 }],
  mix: [
    { kw: "2.5kW", use: "bedrooms", price: 2700 },
    { kw: "3.5kW", use: "smaller living", price: 2900 },
    { kw: "4.6kW", use: "open living", price: 3100 },
  ],
};

export const KM_RATE = 15;

export const money = (n: number) => "$" + n.toLocaleString("en-AU");

/* ---------------------------------------------------------------------------
   The four LAYOUT FAMILIES the page now leads with.

   Ben, WhatsApp 3 Sep 10:05: "I think it should just lead with a layout of
   each type of building that we can customize rather than having the product
   there to start with. Our customizable layouts are currently: 20- and
   40-foot-high cube containers / 350 and 450 Vantalux / 20-foot slide-out and
   / 20 and 40ft retreat models with cladding."

   No price is ever written here: members point at MODELS or the catalogue so
   every figure keeps exactly one source. "enquire" members exist for the two
   buildings Ben named that have no page yet (Vantalux 450 has no price from
   him at all; the 40ft Retreat has one but Reymart is holding the page until
   Ben confirms) — they show no number, only a way to ask.

   Not placed in any family, still in the model picker below: the 40ft
   slide-out (Ben's list says only "20-foot slide-out" and Reymart's brief
   says leave it as it is until Ben says where it goes) and the Custom build,
   which is by definition every layout. */
export type FamilyMember =
  | { kind: "model"; id: string }
  | { kind: "catalogue"; slug: string }
  | { kind: "enquire"; name: string };

export type Family = {
  id: string;
  name: string;
  sizes: string;
  /** the layout drawing or top-down view that leads the card */
  plan: string;
  /** line art needs paper behind it; top-down renders do not */
  planIsLineArt?: boolean;
  blurb: string;
  members: FamilyMember[];
};

export const FAMILIES: Family[] = [
  {
    id: "hc",
    name: "High cube container",
    sizes: "20ft & 40ft",
    plan: "/cfg/dl_fp-sm.webp",
    planIsLineArt: true,
    blurb: "The shell that started it all, fitted out to your layout. One or two bedrooms in a 20ft; full homes and crew accommodation in a 40ft.",
    members: [
      { kind: "catalogue", slug: "one-two-bedroom-20ft-buildings" },
      { kind: "catalogue", slug: "2-bedroom-20ft-building" },
      { kind: "model", id: "one" },
      { kind: "model", id: "family" },
      { kind: "model", id: "workers" },
    ],
  },
  {
    id: "vx",
    name: "Vantalux",
    sizes: "350 & 450",
    plan: "/shop/vantalux-350/06-sm.webp",
    blurb: "Our largest homes, settled finish by finish before the build starts.",
    members: [
      { kind: "catalogue", slug: "vantalux-350" },
      { kind: "enquire", name: "Vantalux 450" },
    ],
  },
  {
    id: "so",
    name: "Slide-out",
    sizes: "20ft",
    plan: "/cfg/sl_fp-sm.webp",
    planIsLineArt: true,
    blurb: "Arrives closed on one truck; the living space slides out on site.",
    members: [{ kind: "model", id: "ob20" }],
  },
  {
    id: "rt",
    name: "Retreat, clad",
    sizes: "20ft & 40ft",
    plan: "/cfg/st_fp.jpg",
    planIsLineArt: true,
    blurb: "External cladding over the whole build, so nothing about it reads as a container.",
    members: [
      { kind: "model", id: "studio" },
      { kind: "enquire", name: "Retreat 40ft" },
    ],
  },
];
