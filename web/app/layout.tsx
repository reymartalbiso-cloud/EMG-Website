import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { Archivo, Inter, IBM_Plex_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollFX from "@/components/ScrollFX";
import PageWipe from "@/components/PageWipe";
import Prefetch from "@/components/Prefetch";
import Fabs from "@/components/Fabs";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  /* Audit F-02: no page carried a canonical. Deliberately NOT set here —
     `alternates` is inherited, so a canonical on the layout would make every
     page in the site declare itself the homepage, which is worse than having
     none. Each page sets its own. */
  title: {
    default: "Elite Manufacturing Group | Container Homes & Buildings, Australia-Wide",
    template: "%s | Elite Manufacturing Group",
  },
  description:
    "Class 1A container homes, commercial accommodation, ablution blocks and container domes, delivered and installed Australia-wide. Owned end-to-end from factory to handover.",
  icons: { icon: "/emg-logo.png", apple: "/emg-logo.png" },
};

/* first-load: stamped before paint on the first hard load of a visit only —
   it lets the preload veil cover from the very first frame, and it is what
   keeps the veil away from reloads and every later page of the session */
const themeInit = `(function(){document.documentElement.classList.add("js");try{var t=localStorage.getItem("emg-theme");if(!t){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}try{if(!sessionStorage.getItem("emg-visit")){sessionStorage.setItem("emg-visit","1");document.documentElement.classList.add("first-load")}}catch(e){}})();`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Elite Manufacturing Group",
  description:
    "Container homes and portable buildings delivered and installed Australia-wide.",
  telephone: "+61 420 251 550",
  email: "admin@elitemanufacturing.com.au",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Herbert",
    addressRegion: "NT",
    addressCountry: "AU",
  },
  areaServed: "Australia",
  url: "https://elitemanufacturing.com.au",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <head>
        {/* The preload veil and the nav both open on this mark, so it must be
           on screen before anything else, whatever the connection. Only the
           256px copy is needed here; the full-size one is for the page-wipe
           badge and is warmed at idle instead. */}
        <link rel="preload" href="/emg-mark-sm.webp" as="image" fetchPriority="high" />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${archivo.variable} ${inter.variable} ${plexMono.variable}`}>
        <a href="#main" className="skip-link">Skip to content</a>
        <div className="scroll-progress" id="scrollProgress" aria-hidden="true" />
        <ScrollFX />
        <Prefetch />
        <PageWipe />
        <Nav />
        {/* tabIndex -1 so the skip link actually MOVES focus here, not
            just the URL fragment */}
        <main id="main" tabIndex={-1}>{children}</main>
        <Fabs />
        <Footer />
      </body>
    </html>
  );
}