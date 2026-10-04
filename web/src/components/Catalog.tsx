import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getDictionary, pick, type Locale } from "@/lib/i18n";
import { whatsappLink } from "@/lib/site";
import { ProductGrid, productCardSelect } from "./ProductCard";
import { Container, PageTitle, buttonClass } from "./ui";

type Search = { q?: string | string[]; brand?: string | string[]; stock?: string | string[] };
const first = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

export async function Catalog({ lang, categorySlug, search }: { lang: Locale; categorySlug?: string; search: Search }) {
  const t = getDictionary(lang);
  const q = first(search.q).slice(0, 80);
  const brandSlug = first(search.brand);
  const stock = first(search.stock) === "1";

  const [tree, brands] = await Promise.all([
    db.category.findMany({ where: { parentId: null }, orderBy: { sortOrder: "asc" }, include: { children: { orderBy: { sortOrder: "asc" } } } }),
    db.brand.findMany({ where: { products: { some: { isPublished: true } } }, orderBy: { name: "asc" } }),
  ]);

  const parent = tree.find((c) => c.slug === categorySlug || c.children.some((child) => child.slug === categorySlug));
  const current = parent?.slug === categorySlug ? parent : parent?.children.find((c) => c.slug === categorySlug);
  if (categorySlug && !current) notFound();
  // A top-level category lists everything in its subcategories too.
  const categoryIds = current ? (current === parent ? [parent.id, ...parent.children.map((c) => c.id)] : [current.id]) : undefined;

  const where: Prisma.ProductWhereInput = {
    isPublished: true,
    ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
    ...(brandSlug ? { brand: { slug: brandSlug } } : {}),
    ...(stock ? { OR: [{ stockStatus: "IN_STOCK" }, { variants: { some: { stockStatus: "IN_STOCK" } } }] } : {}),
    ...(q
      ? {
          AND: [{
            OR: [
              { titleLao: { contains: q, mode: "insensitive" } },
              { titleEng: { contains: q, mode: "insensitive" } },
              { modelNumber: { contains: q, mode: "insensitive" } },
              { sku: { contains: q, mode: "insensitive" } },
              { brand: { name: { contains: q, mode: "insensitive" } } },
              { variants: { some: { OR: [{ nameEng: { contains: q, mode: "insensitive" } }, { nameLao: { contains: q, mode: "insensitive" } }] } } },
            ],
          }],
        }
      : {}),
  };
  const products = await db.product.findMany({ where, select: productCardSelect, orderBy: [{ isFeatured: "desc" }, { sku: "asc" }] });

  const basePath = `/${lang}/products${categorySlug ? `/${categorySlug}` : ""}`;
  const filtered = Boolean(q || brandSlug || stock);
  const linkClass = (active: boolean) =>
    `block rounded-md px-3 py-1.5 text-sm ${active ? "bg-brand font-semibold text-white" : "text-slate-700 hover:bg-slate-100"}`;

  return (
    <Container className="py-8">
      <PageTitle>{current ? pick(lang, current.nameLao, current.nameEng) : t.product.all}</PageTitle>
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="min-w-0">
          <nav className="flex gap-1 overflow-x-auto md:block md:space-y-1">
            <Link href={`/${lang}/products`} className={`shrink-0 ${linkClass(!categorySlug)}`}>{t.product.all}</Link>
            {tree.map((category) => (
              <div key={category.slug} className="flex shrink-0 gap-1 md:block md:space-y-1">
                <Link href={`/${lang}/products/${category.slug}`} className={`shrink-0 ${linkClass(categorySlug === category.slug)}`}>
                  {pick(lang, category.nameLao, category.nameEng)}
                </Link>
                {parent?.id === category.id
                  ? category.children.map((child) => (
                      <Link key={child.slug} href={`/${lang}/products/${child.slug}`} className={`shrink-0 md:ml-4 ${linkClass(categorySlug === child.slug)}`}>
                        {pick(lang, child.nameLao, child.nameEng)}
                      </Link>
                    ))
                  : null}
              </div>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          <form action={basePath} className="mb-5 flex flex-wrap items-center gap-2">
            <input
              type="search" name="q" defaultValue={q} placeholder={t.product.search} aria-label={t.product.search}
              className="min-w-0 flex-1 basis-full rounded-lg border border-slate-300 px-3 py-2 text-base outline-none sm:basis-auto focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <select name="brand" defaultValue={brandSlug} aria-label={t.product.brand} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-base">
              <option value="">{t.product.allBrands}</option>
              {brands.map((brand) => <option key={brand.slug} value={brand.slug}>{brand.name}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="stock" value="1" defaultChecked={stock} className="h-4 w-4" />
              {t.product.onlyInStock}
            </label>
            <button type="submit" className={buttonClass("primary")}>{t.product.searchButton}</button>
            {filtered ? <Link href={basePath} className="text-sm text-slate-500 hover:underline">{t.product.clear}</Link> : null}
          </form>

          <p className="mb-3 text-sm text-slate-500">{products.length} {t.product.count}</p>
          {products.length > 0 ? (
            <ProductGrid products={products} lang={lang} />
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
              <p>{t.product.none}</p>
              <a href={whatsappLink(q)} target="_blank" rel="noopener noreferrer" className={`mt-4 ${buttonClass("green")}`}>{t.product.askWhatsapp}</a>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
