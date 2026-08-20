import type { Metadata } from "next";
import ProductPage from "@/components/ProductPage";
import { PRODUCTS } from "@/lib/products";

export const metadata: Metadata = {
  title: "Container Domes C4040S & C4080S",
  description:
    "Large-span container-mounted fabric domes for workshops, machinery and storage. Delivered and installed Australia-wide.",
};

export default function Domes() {
  const product = PRODUCTS.find((p) => p.slug === "domes")!;
  return <ProductPage product={product} />;
}