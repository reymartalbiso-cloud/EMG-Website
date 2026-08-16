import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductPage from "@/components/ProductPage";
import { PRODUCTS } from "@/lib/products";

const commercial = () =>
  PRODUCTS.filter((p) => p.audience === "commercial" && p.slug !== "domes");

export function generateStaticParams() {
  return commercial().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const p = commercial().find((x) => x.slug === slug);
  if (!p) return {};
  return { title: p.name, description: p.short };
}

export default async function CommercialProduct(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = commercial().find((x) => x.slug === slug);
  if (!product) notFound();
  return <ProductPage product={product} />;
}