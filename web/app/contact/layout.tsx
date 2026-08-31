import type { Metadata } from "next";

/* The contact page is a client component, so it cannot export metadata itself.
   Without this it inherited the site-wide default and shipped a duplicate
   title and description alongside /residential. */
export const metadata: Metadata = {
  /* the quote handoff appends ?q=..., so this page has as many URLs as there
     are enquiries. They are all the same page. */
  alternates: { canonical: "/contact" },
  title: "Contact Elite Manufacturing Group",
  description:
    "Tell us where you're building and what you need. Real answers on access, timing and cost from the team that delivers and installs the building.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
