/* Product range — public-safe content only (no invoice ranges, counts or
   internal rules; brief §5 header). Vocabulary follows real order descriptions. */

export type Product = {
  slug: string;
  href: string;
  name: string;
  short: string;
  image: string;
  audience: "residential" | "commercial" | "both";
  specs: [string, string][];
  body: string[];
};

export const PRODUCTS: Product[] = [
  {
    slug: "slide-out",
    href: "/homes/slide-out",
    name: "Slide-Out Container Home",
    short:
      "A 40 ft high-cube that arrives as one container and expands on site into a full-width home. The most impressive thing we deliver.",
    image: "/cfg/so_ext2.jpg",
    audience: "residential",
    specs: [
      ["FORMAT", "40 ft high-cube, slide-out expansion"],
      ["CLASS", "Class 1A habitable dwelling"],
      ["COLOUR", "RAL 7035 light grey, standard"],
      ["ACCESS", "Threshold-free doorways, sunken shower base"],
      ["DELIVERY", "Australia-wide, including remote sites"],
    ],
    body: [
      "The slide-out arrives on your block as a standard 40-foot container — then opens out on site to roughly double its floor area. One truck, one crane lift, and a building that no flat-pack or kit home can match for arrival-day drama.",
      "Inside, it is a genuine Class 1A dwelling: full kitchen, bathroom with our standard sunken shower base, bedroom, and living space — insulated, wired and plumbed to habitable standard.",
      "One proven version, refined across real deliveries — with your choice of layout and finishes agreed before the build starts.",
    ],
  },
  {
    slug: "two-bedroom",
    href: "/homes/two-bedroom",
    name: "Two-Bedroom Container Home",
    short:
      "The core residential build: a 40 ft high-cube, one or two bedrooms, certified Class 1A — a real home, not a converted shed.",
    image: "/cfg/ch_front.jpg",
    audience: "residential",
    specs: [
      ["FORMAT", "40 ft high-cube, 1–2 bedrooms"],
      ["CLASS", "Class 1A habitable dwelling"],
      ["COLOUR", "RAL 7035 light grey, standard"],
      ["ACCESS", "Threshold-free doorways, sunken shower base"],
      ["DELIVERY", "Australia-wide, including remote sites"],
    ],
    body: [
      "This is the building most of our residential customers choose: a 40-foot high-cube fitted out as a one- or two-bedroom home with a full kitchen, bathroom and living area.",
      "Class 1A certification means it is built and certified as a habitable dwelling — the same classification as a house — not as a shed or temporary structure. That distinction decides what you can legally live in.",
      "Every build carries our accessibility standard: flat, threshold-free entry and doorways, and a sunken shower base. No steps, no trip edges, all the way through.",
    ],
  },
  {
    slug: "expandable",
    href: "/homes/expandable",
    name: "Expandable Container Home",
    short:
      "A 20 ft high-cube Type A that unfolds on site — the compact, budget-conscious way into a container home.",
    image: "/cfg/img1.jpg",
    audience: "residential",
    specs: [
      ["FORMAT", "20 ft high-cube, Type A expandable"],
      ["COLOUR", "RAL 7035 light grey, standard"],
      ["ACCESS", "Threshold-free doorways, sunken shower base"],
      ["DELIVERY", "Australia-wide, including remote sites"],
    ],
    body: [
      "The expandable Type A ships compact and unfolds on site into a liveable space with kitchenette and bathroom — a practical first dwelling, granny flat, or station quarters.",
      "It shares the same build standards as our larger homes: high-cube height, RAL 7035 finish, and flat threshold-free access throughout.",
    ],
  },
  {
    slug: "accommodation",
    href: "/commercial/accommodation",
    name: "Site Accommodation",
    short:
      "Accommodation blocks and site offices for mining, remote community and government work — specified, delivered and installed.",
    image: "/cfg/wa_ext.jpg",
    audience: "commercial",
    specs: [
      ["FORMAT", "20 ft & 40 ft high-cube units"],
      ["USE", "Camps, villages, site offices"],
      ["COLOUR", "RAL 7035 light grey, standard"],
      ["DELIVERY", "Australia-wide, incl. remote and island sites"],
    ],
    body: [
      "We supply and install accommodation for the places hotels don't exist: mine sites, remote communities, work camps and stations, Australia-wide.",
      "Orders are specified per project — unit count, layouts, electrical spec, furniture — and delivered as a coordinated program, not a pile of containers on a pad.",
    ],
  },
  {
    slug: "ablution",
    href: "/commercial/ablution",
    name: "Ablution Blocks",
    short:
      "Toilet and shower blocks built to the same standard as our homes — because your crew deserves better than a portaloo.",
    image: "/cfg/ch_bath.jpg",
    audience: "commercial",
    specs: [
      ["FORMAT", "Type-01A shower/toilet units"],
      ["USE", "Camps, events, community facilities"],
      ["ACCESS", "Sunken shower bases, threshold-free"],
      ["DELIVERY", "Australia-wide, including remote sites"],
    ],
    body: [
      "Our ablution blocks are plumbed, ventilated and finished as permanent-quality facilities: proper showers with sunken bases, real fixtures, and steel buildings that survive site life.",
      "They pair with our septic and wastewater site-works packages, so the whole sanitation problem is handled by one contractor.",
    ],
  },
  {
    slug: "kitchen",
    href: "/commercial/kitchen",
    name: "Kitchen & Mess Units",
    short:
      "20 ft Type-D open-plan units with kitchenette and bathroom — the working heart of a camp or event site.",
    image: "/cfg/wa_k.jpg",
    audience: "commercial",
    specs: [
      ["FORMAT", "20 ft Type-D open plan"],
      ["FIT-OUT", "Kitchenette + bathroom, updated electrical available"],
      ["COLOUR", "RAL 7035 light grey, standard"],
      ["DELIVERY", "Australia-wide, including remote sites"],
    ],
    body: [
      "The Type-D is our most flexible commercial unit: an open-plan 20-footer with a kitchenette and bathroom that works as a mess, a crib room, an office with amenities, or event catering space.",
      "Fleet operators order them in multiples; each unit arrives wired, plumbed and ready to connect.",
    ],
  },
  {
    slug: "domes",
    href: "/domes",
    name: "Container Domes",
    short:
      "Large-span fabric domes anchored on containers — workshop, machinery and storage cover measured in whole sheds.",
    image: "/frames/frame_020.webp",
    audience: "commercial",
    specs: [
      ["MODELS", "C4040S · C4080S"],
      ["FORMAT", "Container-mounted fabric span"],
      ["USE", "Workshops, machinery, hay, storage"],
      ["DELIVERY", "Australia-wide"],
    ],
    body: [
      "Container domes turn two container rows into the walls of a huge covered span — fast to erect, engineered for real wind, and a fraction of the cost of a steel shed of the same footprint.",
      "We deliver the containers, the dome and the installation as one job.",
    ],
  },
];

export const SITE_WORKS = [
  { name: "Site preparation", desc: "Clearing, levelling and pad work before delivery day." },
  { name: "Footings", desc: "Engineered footings matched to your soil and cyclone region." },
  { name: "Delivery & set-up", desc: "Trucking, crane lift and placement — including remote access planning." },
  { name: "Septic & wastewater", desc: "Treatment plant supply and installation, council-compliant." },
  { name: "Plumbing & hot water", desc: "Connection to services, hot water system supplied and fitted." },
  { name: "Electrical connection", desc: "Mains or generator connection by licensed electricians." },
  { name: "Water tank & pump", desc: "Rainwater storage and pressure systems for off-grid blocks." },
  { name: "Air conditioning", desc: "Split systems sized for the harshest Australian heat, installed and tested." },
  { name: "Decking & roofing", desc: "Verandahs, walkways and roof-overs that turn a unit into a homestead." },
  { name: "Sealing & finishing", desc: "The last 2% — flashings, sealing, snag list, handover clean." },
];