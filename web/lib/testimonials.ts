/* Customer testimonials.
 *
 * Audit F-06: these lived inside TestimonialMap, a client component, and were
 * only painted into the 3D map's popups after a click. Searching the served
 * HTML of /testimonials for "quality is there", "stood out from everyone" or
 * "phenomenal service" returned nothing — four named customers at real Darwin
 * businesses, and no crawler had ever seen one of them. Reputation queries had
 * nothing to cite.
 *
 * The data lives here now so the page can render the words server-side and
 * publish Review markup, while the map keeps using the same array for its
 * pins. One source, so the two cannot drift apart.
 */

export type Pin = {
  id: string;
  name: string;
  org: string;
  place: string;
  quote: string;
  x: number; // map viewBox coords (equirectangular, lon/lat projected)
  y: number;
  lift: number; // how high this pin floats, in px of plate space
  dx: number; // screen-space nudge for the chip, so five northern pins can breathe
};

export const HQ = { x: 315, y: 58, lift: 132, dx: 0 }; // Herbert NT, just south-east of Darwin

/* Every customer so far is within an hour of Darwin, so geography alone puts
   all five markers inside a 45px circle. Height plus a horizontal nudge is
   what separates them; the stem still shows which patch of dirt is theirs. */
export const PINS: Pin[] = [
  {
    id: "alan", name: "Alan Symms", org: "NT Container Services", place: "Darwin region, NT",
    quote: "I have recommended your products, the main reason is, the quality is there!",
    x: 299, y: 66, lift: 62, dx: -104,
  },
  {
    id: "tony", name: "Tony Wood", org: "Total Tools Darwin", place: "Darwin, NT",
    quote: "Your product and service stood out from everyone else's.",
    x: 307, y: 52, lift: 96, dx: -58,
  },
  {
    id: "kara", name: "Kara Louise", org: "Homeowner", place: "Rural Darwin, NT",
    quote: "Overall very happy with the product and phenomenal service!",
    x: 328, y: 67, lift: 78, dx: 62,
  },
  {
    id: "russell", name: "Russell Catchpole", org: "RustieJam Pest Control", place: "Northern Territory",
    quote: "Quality product for a great price.",
    x: 341, y: 97, lift: 46, dx: 34,
  },
];
