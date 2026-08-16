import type { Metadata } from "next";
import { Archivo, Inter, IBM_Plex_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollFX from "@/components/ScrollFX";
import PageWipe from "@/components/PageWipe";
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
  metadataBase: new URL("https://elitemanufacturing.com.au"),
  title: {
    default: "Elite Manufacturing Group — Container Homes & Buildings, NT & QLD",
    template: "%s — Elite Manufacturing Group",
  },
  description:
    "Class 1A container homes, commercial accommodation, ablution blocks and container domes — delivered and installed across the Northern Territory and Queensland, owned end-to-end from factory to handover.",
  icons: { icon: "/emg-logo.png", apple: "/emg-logo.png" },
};

const themeInit = `(function(){document.documentElement.classList.add("js");try{var t=localStorage.getItem("emg-theme");if(!t){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}})();`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Elite Manufacturing Group",
  description:
    "Container homes and portable buildings delivered and installed across the Northern Territory and Queensland.",
  telephone: "+61 420 251 550",
  email: "admin@elitemanufacturing.com.au",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Herbert",
    addressRegion: "NT",
    addressCountry: "AU",
  },
  areaServed: ["Northern Territory", "Queensland"],
  url: "https://elitemanufacturing.com.au",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <head>
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
        <PageWipe />
        <Nav />
        <main id="main">{children}</main>
        <Fabs />
        <Footer />
      </body>
    </html>
  );
}