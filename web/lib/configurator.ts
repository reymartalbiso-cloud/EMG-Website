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

const img = (k: string) => `/cfg/${k}.jpg`;

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
    photo: img("img1"),
    carousel: ["img2", "img3", "img4", "img5", "img6"].map(img),
  },
  {
    id: "studio",
    name: "The Retreat",
    base: 36000,
    ac: "mix",
    show: ["colour", "bench", "tap", "floor", "hw", "ac", "delivery"],
    spec: "20ft · 1 room · kitchen · ensuite",
    photo: img("st_ext"),
    carousel: ["st_ext", "st_room", "st_k", "st_bath", "st_bath2", "st_fp"].map(img),
  },
  {
    id: "one",
    name: "Deluxe 40ft Home",
    base: 69900,
    ac: "mix",
    show: ["colour", "bench", "tap", "floor", "hw", "ac", "delivery"],
    spec: "40ft · 1 bed · kitchen + living + bathroom",
    photo: img("ch_front"),
    carousel: ["ch_front2", "ch_k", "ch_bed1", "ch_bath", "ch_bath2", "fp1"].map(img),
  },
  {
    id: "family",
    name: "40ft 2xBedroom Container Home",
    base: 64000,
    ac: "mix",
    show: ["colour", "bench", "tap", "floor", "hw", "ac", "delivery"],
    spec: "40ft · 2 bed · kitchen, bathroom + living",
    photo: img("ch_front"),
    carousel: ["ch_front2", "ch_k", "ch_bed1", "ch_bath", "ch_bath2", "fp2bed"].map(img),
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
    photo: img("so_ext2"),
    carousel: ["so_ext1", "so_int1", "so_int2", "so_bed", "so_bath", "so_fp"].map(img),
  },
  {
    id: "workers",
    name: "Worker Accommodation",
    base: 69500,
    ac: "mix",
    show: ["bedrooms", "colour", "bench", "tap", "floor", "hw", "ac", "delivery"],
    spec: "40ft · 3 or 4 bedroom · ensuite per room",
    photo: img("wa_ext"),
    carousel: ["wa_row", "wa_k", "wa_kb", "wa_3d", "wa_fp3", "wa_fp4"].map(img),
  },
  {
    id: "custom",
    name: "Custom build",
    base: 59900,
    ac: "mix",
    show: ["colour", "bench", "tap", "floor", "hw", "ac", "delivery", "custom"],
    custom: true,
    spec: "Built to your plan · add-ons selectable",
    photo: img("ch_front"),
    carousel: ["ch_front2", "ch_k", "ch_bed1", "ch_bed2", "ch_bath", "ch_bath2", "fp1", "fp2bed"].map(img),
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