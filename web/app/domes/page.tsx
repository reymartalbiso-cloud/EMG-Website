import type { Metadata } from "next";
import ProductPage from "@/components/ProductPage";
import { PRODUCTS } from "@/lib/products";

export const metadata: Metadata = {
  alternates: { canonical: "/domes" },
  title: "Container Domes",
  description:
    "Large-span container-mounted fabric domes for workshops, machinery and storage. Delivered and installed Australia-wide.",
};

export default function Domes() {
  const product = PRODUCTS.find((p) => p.slug === "domes")!;
  return <ProductPage product={product} />;
}