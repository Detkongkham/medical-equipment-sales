import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { locales } from "@/lib/i18n";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, posts] = await Promise.all([
    db.product.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    db.category.findMany({ select: { slug: true } }),
    db.post.findMany({ where: { publishedAt: { not: null } }, select: { slug: true, publishedAt: true } }),
  ]);
  const paths: { path: string; lastModified?: Date }[] = [
    ...["", "/products", "/brands", "/services", "/projects", "/careers", "/about", "/contact"].map((path) => ({ path })),
    ...categories.map((c) => ({ path: `/products/${c.slug}` })),
    ...products.map((p) => ({ path: `/product/${p.slug}`, lastModified: p.updatedAt })),
    ...posts.map((p) => ({ path: `/projects/${p.slug}`, lastModified: p.publishedAt ?? undefined })),
  ];
  return paths.flatMap(({ path, lastModified }) =>
    locales.map((lang) => ({
      url: `${site.url}/${lang}${path}`,
      lastModified,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${site.url}/${l}${path}`])) },
    })),
  );
}
