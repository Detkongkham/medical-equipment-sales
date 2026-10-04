import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Catalog } from "@/components/Catalog";
import { getDictionary, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/products">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: getDictionary(lang).product.all, alternates: { canonical: `/${lang}/products`, languages: { lo: "/lo/products", en: "/en/products" } } };
}

export default async function ProductsPage({ params, searchParams }: PageProps<"/[lang]/products">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <Catalog lang={lang} search={await searchParams} />;
}
