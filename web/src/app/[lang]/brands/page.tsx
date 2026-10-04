import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageTitle } from "@/components/ui";
import { db } from "@/lib/db";
import { getDictionary, isLocale } from "@/lib/i18n";

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps<"/[lang]/brands">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? { title: getDictionary(lang).brands.title } : {};
}

export default async function BrandsPage({ params }: PageProps<"/[lang]/brands">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).brands;
  const brands = await db.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: { where: { isPublished: true } } } } },
  });
  const groups = [
    [t.house, brands.filter((b) => b.isHouseBrand)],
    [t.distributed, brands.filter((b) => !b.isHouseBrand)],
  ] as const;

  return (
    <Container className="py-8">
      <PageTitle>{t.title}</PageTitle>
      <div className="space-y-10">
        {groups.map(([heading, list]) => (
          <section key={heading}>
            <h2 className="mb-4 text-lg font-bold text-brand">{heading}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {list.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/${lang}/products?brand=${brand.slug}`}
                  className="rounded-xl border border-slate-200 p-4 transition-shadow hover:shadow-md"
                >
                  <p className="text-lg font-bold text-slate-900">{brand.name}</p>
                  {brand.country ? <p className="text-xs text-slate-500">{brand.country}</p> : null}
                  <p className="text-sm text-slate-500">{brand._count.products} {t.products}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}
