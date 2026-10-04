import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Catalog } from "@/components/Catalog";
import { db } from "@/lib/db";
import { isLocale, pick } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/products/[category]">): Promise<Metadata> {
  const { lang, category } = await params;
  if (!isLocale(lang)) return {};
  const found = await db.category.findUnique({ where: { slug: category } });
  if (!found) return {};
  return {
    title: pick(lang, found.nameLao, found.nameEng),
    alternates: { canonical: `/${lang}/products/${category}`, languages: { lo: `/lo/products/${category}`, en: `/en/products/${category}` } },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/[lang]/products/[category]">) {
  const { lang, category } = await params;
  if (!isLocale(lang)) notFound();
  return <Catalog lang={lang} categorySlug={category} search={await searchParams} />;
}
