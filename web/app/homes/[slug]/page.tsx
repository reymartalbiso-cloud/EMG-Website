import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductPage from "@/components/ProductPage";
import { PRODUCTS } from "@/lib/products";

const homes = () => PRODUCTS.filter((p) => p.audience === "residential");

export function generateStaticParams() {
  return homes().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const p = homes().find((x) => x.slug === slug);
  if (!p) return {};
  return { title: p.name, description: p.short, alternates: { canonical: `/homes/${p.slug}` } };
}

export default async function HomeProduct(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = homes().find((x) => x.slug === slug);
  if (!product) notFound();
  return <ProductPage product={product} />;
}