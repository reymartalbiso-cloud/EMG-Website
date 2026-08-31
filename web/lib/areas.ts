/* Places we deliver to, as pages.
 *
 * The site said "Australia-wide" on every page and named Darwin sixteen times
 * in passing, with no page targeting anywhere. Searching "container homes
 * Darwin" on 31 Aug returned The Container House, Konbuild, Container Build
 * Group and Northern Transportables. It did not return us.
 *
 * These are not doorway pages and must not become them. Google treats a set of
 * near-identical pages with the town name swapped as spam, and it is right to.
 * Each one below carries something that is only true of that place — the
 * distance freight is charged over, what the ground and the weather do to a
 * delivery window, which council decides the approval, what people there
 * actually buy. Where I do not know something specific to a town, the page
 * does not claim it, and if a place has nothing particular to say it does not
 * get a page.
 *
 * Nothing here implies a depot, an office or staff anywhere but Herbert.
 */

export type Area = {
  slug: string;
  /** how the place is written in a sentence */
  name: string;
  /** for the page title, where the search term matters */
  title: string;
  region: string;
  /** one sentence, used as the meta description's spine */
  summary: string;
  /** road distance from the Darwin yard, and what that means for freight */
  freight: string;
  /** what is genuinely different about building there */
  ground: string;
  /** who decides the development approval */
  approval: string;
  /** what people in this place actually order */
  common: string;
  /** the honest caveat for this place */
  watch: string;
};

export const AREAS: Area[] = [
  {
    slug: "darwin",
    name: "Darwin",
    title: "Container Homes Darwin",
    region: "Northern Territory",
    summary:
      "Container homes and commercial buildings delivered and installed across Darwin, Palmerston and the rural area. Our yard is at Herbert, so Darwin is the shortest delivery we do.",
    freight:
      "Herbert is about 40km from the Darwin CBD, so a Darwin delivery sits well inside the first 100km of road transport that comes with the building. For most Darwin, Palmerston and Litchfield addresses there is no freight line on the quote at all.",
    ground:
      "Darwin is a cyclone region, and that is not a formality: footings and tie-downs are engineered for the wind classification of your particular block, not to a generic slab detail. If you are on one of the rural blocks south of the city, the soil report matters as much as the wind — reactive clay and a 40-foot building want a footing designed for both.",
    approval:
      "Which council you deal with depends on where the block is: City of Darwin, City of Palmerston or Litchfield Council, and the rural area is mostly Litchfield. We supply the building's certification and engineering; the development approval on your land is yours to lodge, and we tell you what it involves before you commit.",
    common:
      "Granny flats and second dwellings on rural blocks, homes on land people already own, and site offices for local trades. The Retreat and the 20ft buildings move most often here.",
    watch:
      "The wet, roughly November to April. An unsealed track that a semi-trailer and a crane can use in July can be impassable in February. If your access is unsealed we would rather deliver before the wet than argue with it, and we will say so when we quote.",
  },
  {
    slug: "katherine",
    name: "Katherine",
    title: "Container Homes Katherine NT",
    region: "Northern Territory",
    summary:
      "Container homes, worker accommodation and ablution blocks delivered to Katherine and the surrounding stations, about 320km down the Stuart Highway from our yard.",
    freight:
      "Katherine is roughly 320km from Herbert by road, so about 220km falls outside the included first 100km. At $15 per kilometre that is a freight line you can work out before you ring us, and it is the same number whether the building is a toilet block or a two-bedroom home.",
    ground:
      "Most of what we deliver around Katherine goes onto rural or station land rather than a serviced suburban lot, which usually means footings, power and water are part of the same job as the building. Sequencing those while the building is still at sea is what stops the site waiting.",
    approval:
      "Katherine Town Council for addresses in town; outside it you are generally dealing with the NT Government's planning process for unincorporated land. Either way the building's Class 1A certification is ours to provide and the land approval is yours.",
    common:
      "Worker accommodation, ablution blocks and site offices for stations and contractors, and single dwellings on rural blocks.",
    watch:
      "Highway access is good, but the last few kilometres onto a station rarely are. The crane needs somewhere to stand and the truck needs somewhere to turn — we ask about both at quote stage rather than on delivery morning.",
  },
  {
    slug: "alice-springs",
    name: "Alice Springs",
    title: "Container Homes Alice Springs",
    region: "Northern Territory",
    summary:
      "Container homes and commercial buildings delivered to Alice Springs and Central Australia. The freight is the honest part of this conversation: it is roughly 1,500km from our yard.",
    freight:
      "Alice Springs is about 1,500km from Herbert down the Stuart Highway, so freight is a real line on the quote rather than a rounding error — about 1,400km beyond the included first 100km, at $15 per kilometre. We would rather you saw that number early than discovered it late.",
    ground:
      "Central Australia is not a cyclone region, so the tie-down engineering that governs a Darwin build is not what governs one here. What does matter is the temperature swing: insulation and air conditioning sizing are worth more of your attention in Alice than almost anywhere else we deliver.",
    approval:
      "Alice Springs Town Council for town addresses, and the NT planning process beyond it. Same split as everywhere: we certify the building, you approve the land.",
    common:
      "Worker accommodation, site offices and ablution facilities for remote work, and dwellings on land outside town.",
    watch:
      "Distance means the delivery window is less forgiving. One truck, one crane, one day — a site that is not ready when the building arrives is an expensive thing to reschedule from 1,500km away.",
  },
  {
    slug: "remote-and-island-communities",
    name: "remote and island communities",
    title: "Remote & Island Community Buildings",
    region: "Northern Territory and beyond",
    summary:
      "Buildings for the places most suppliers will not quote: remote communities, cattle stations and island sites, including barge access.",
    freight:
      "Road distance is charged the same way anywhere — the first 100km included, $15 per kilometre after — but a barge or a wet-season road closure is a separate conversation, and one we would rather have with you before you order than after.",
    ground:
      "Remote sites are where site works stop being optional. Footings, septic, water and power are usually part of the job, because there is nothing to connect to. We sequence that work while the building is at sea so the pad is ready when the truck arrives.",
    approval:
      "Community land and station land each have their own process, and it is usually slower than a suburban DA. Start it early. The building's certification is not the part that will hold you up.",
    common:
      "Worker accommodation, ablution blocks, clinics and site offices, often as several units delivered as one program rather than one building at a time.",
    watch:
      "Barge timetables and the wet season decide the calendar, not us. Our published lead time is 4 to 6 months and remote sites live at the longer end of it. Anyone promising you a date rather than a range has not thought about the barge.",
  },
];

export const areaBySlug = (slug: string) => AREAS.find((a) => a.slug === slug);
