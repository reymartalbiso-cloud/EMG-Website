/* Layout designer catalog — fixtures at real-world dimensions (metres),
   drawn top-down. Container internals: 20ft ≈ 5.9 × 2.35m usable,
   40ft ≈ 12.0 × 2.35m usable (high-cube shell 2.44m wide, walls ~0.1m). */

export type Fixture = {
  type: string;
  name: string;
  short: string; // label used when the drawn box is too small for the full name
  w: number; // metres, along container length
  h: number; // metres, across container width
  cat: "sleep" | "living" | "kitchen" | "bath" | "utility";
};

export const FIXTURES: Fixture[] = [
  { type: "bed-d", name: "Double bed", short: "Bed", w: 1.9, h: 1.55, cat: "sleep" },
  { type: "bed-s", name: "Single bed", short: "Bed", w: 1.9, h: 0.95, cat: "sleep" },
  { type: "bunk", name: "Bunk bed", short: "Bunk", w: 1.9, h: 0.95, cat: "sleep" },
  { type: "wardrobe", name: "Wardrobe", short: "Robe", w: 1.2, h: 0.6, cat: "sleep" },
  { type: "sofa", name: "Sofa", short: "Sofa", w: 1.85, h: 0.85, cat: "living" },
  { type: "dining", name: "Dining table", short: "Dining", w: 1.2, h: 0.8, cat: "living" },
  { type: "desk", name: "Desk", short: "Desk", w: 1.2, h: 0.6, cat: "living" },
  { type: "tv", name: "TV unit", short: "TV", w: 1.2, h: 0.4, cat: "living" },
  { type: "stove", name: "Stove", short: "Stove", w: 0.6, h: 0.6, cat: "kitchen" },
  { type: "sink", name: "Kitchen sink", short: "Sink", w: 0.6, h: 0.55, cat: "kitchen" },
  { type: "fridge", name: "Fridge", short: "Fridge", w: 0.7, h: 0.72, cat: "kitchen" },
  { type: "bench", name: "Kitchen bench", short: "Bench", w: 1.5, h: 0.6, cat: "kitchen" },
  { type: "shower", name: "Shower", short: "Shower", w: 0.9, h: 0.9, cat: "bath" },
  { type: "toilet", name: "Toilet", short: "WC", w: 0.72, h: 0.5, cat: "bath" },
  { type: "vanity", name: "Vanity", short: "Vanity", w: 0.9, h: 0.5, cat: "bath" },
  { type: "washer", name: "Washing machine", short: "Washer", w: 0.62, h: 0.62, cat: "utility" },
  { type: "hws", name: "Hot water unit", short: "HWS", w: 0.55, h: 0.55, cat: "utility" },
  { type: "ac", name: "Aircon head", short: "AC", w: 0.85, h: 0.28, cat: "utility" },
];

export const CAT_COLOURS: Record<Fixture["cat"], string> = {
  sleep: "#7d9bb8",
  living: "#8aa87c",
  kitchen: "#c9a25e",
  bath: "#7fb3ad",
  utility: "#a08db0",
};

export const CAT_LABELS: Record<Fixture["cat"], string> = {
  sleep: "Sleeping",
  living: "Living",
  kitchen: "Kitchen",
  bath: "Bathroom",
  utility: "Laundry & services",
};

export const CAT_ORDER: Fixture["cat"][] = ["sleep", "living", "kitchen", "bath", "utility"];

/* Geometry runs on an integer grid: 1 cell = 5cm. */
export const CELL = 0.05;
export const cellsOf = (m: number) => Math.round(m / CELL);

export type PlacedItem = {
  id: number;
  type: string;
  cx: number; // grid cells from inner left wall
  cy: number; // grid cells from inner top wall
  rot: boolean; // rotated 90°
};

/* Internal partitions — the customer's own room divisions. Also on the cell
   grid: "v" runs across the container width at cx = c, "h" runs along the
   length at cy = c. a/b are the span ends on the other axis, so a partition
   that stops short of a wall reads as a doorway. */
export type Wall = {
  id: number;
  o: "v" | "h";
  c: number;
  a: number;
  b: number;
};

export const WALL_T_C = 2;      // partition thickness in cells (0.1m)
export const WALL_MIN_C = 4;    // shortest useful partition (0.2m)
export const PARTITION_C = "#8b8b84";

/* Popular layouts (brief W4) — pre-sets so most people never start blank.
   Authored in grid cells against the designer's usable area:
   20ft = 117×45 cells, 40ft = 239×45 cells. All in-bounds, no overlaps
   (loadPreset validates again defensively). */
export const PRESETS: Record<string, { name: string; len: 20 | 40; items: Omit<PlacedItem, "id">[] }> = {
  "studio-20": {
    name: "The Retreat",
    len: 20,
    items: [
      { type: "bed-d", cx: 79, cy: 13, rot: false },
      { type: "wardrobe", cx: 90, cy: 0, rot: false },
      { type: "shower", cx: 4, cy: 4, rot: false },
      { type: "toilet", cx: 4, cy: 26, rot: false },
      { type: "bench", cx: 26, cy: 4, rot: false },
      { type: "stove", cx: 26, cy: 20, rot: false },
      { type: "sink", cx: 40, cy: 20, rot: false },
      { type: "fridge", cx: 58, cy: 4, rot: false },
      { type: "dining", cx: 54, cy: 24, rot: false },
    ],
  },
  "one-40": {
    name: "Deluxe 40ft Home",
    len: 40,
    items: [
      { type: "bed-d", cx: 6, cy: 6, rot: false },
      { type: "wardrobe", cx: 48, cy: 4, rot: false },
      { type: "desk", cx: 48, cy: 20, rot: false },
      { type: "shower", cx: 80, cy: 4, rot: false },
      { type: "toilet", cx: 80, cy: 26, rot: false },
      { type: "vanity", cx: 102, cy: 4, rot: false },
      { type: "washer", cx: 102, cy: 18, rot: false },
      { type: "bench", cx: 126, cy: 4, rot: false },
      { type: "stove", cx: 126, cy: 20, rot: false },
      { type: "sink", cx: 142, cy: 20, rot: false },
      { type: "fridge", cx: 160, cy: 4, rot: false },
      { type: "dining", cx: 160, cy: 24, rot: false },
      { type: "sofa", cx: 192, cy: 6, rot: false },
      { type: "tv", cx: 192, cy: 30, rot: false },
    ],
  },
};