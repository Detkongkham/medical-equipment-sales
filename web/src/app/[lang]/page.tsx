import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid, productCardSelect } from "@/components/ProductCard";
import { ButtonLink, Container, SectionTitle } from "@/components/ui";
import { db } from "@/lib/db";
import { getDictionary, isLocale, pick } from "@/lib/i18n";

export const revalidate = 300;

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  const [categories, featured, inStock, posts] = await Promise.all([
    db.category.findMany({ where: { parentId: null }, orderBy: { sortOrder: "asc" } }),
    db.product.findMany({ where: { isPublished: true, isFeatured: true }, select: productCardSelect, orderBy: { sku: "asc" }, take: 8 }),
    db.product.findMany({ where: { isPublished: true, stockStatus: "IN_STOCK", isFeatured: false }, select: productCardSelect, orderBy: { sku: "asc" }, take: 8 }),
    db.post.findMany({ where: { publishedAt: { not: null }, type: "PROJECT" }, orderBy: { publishedAt: "desc" }, take: 3 }),
  ]);

  return (
    <>
      <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
        <Container className="grid items-center gap-8 py-12 md:grid-cols-2 md:py-16">
          <div>
            <h1 className="text-3xl font-bold leading-snug sm:text-4xl">{t.home.heroTitle}</h1>
            <p className="mt-4 text-white/85">{t.home.heroText}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={`/${lang}/products`} variant="green">{t.home.browse}</ButtonLink>
              <Link href={`/${lang}/quote`} className="inline-flex items-center rounded-lg border border-white/60 px-4 py-2.5 text-sm font-semibold hover:bg-white/10">
                {t.nav.quote}
              </Link>
            </div>
          </div>
          <div className="relative aspect-[3471/1207] overflow-hidden rounded-xl md:aspect-[2/1]">
            <Image src="/brand/cover.jpg" alt="" fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
        </Container>
      </section>

      <Container className="space-y-14 py-12">
        <section>
          <SectionTitle>{t.home.categories}</SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/${lang}/products/${category.slug}`}
                className="group flex flex-col items-center rounded-xl border border-slate-200 p-3 text-center transition-shadow hover:shadow-md"
              >
                <div className="relative mb-2 aspect-square w-full">
                  {category.image ? <Image src={category.image} alt="" fill sizes="(max-width: 640px) 50vw, 16vw" className="object-contain" /> : null}
                </div>
                <span className="text-sm font-semibold text-slate-900 group-hover:text-brand">{pick(lang, category.nameLao, category.nameEng)}</span>
              </Link>
            ))}
            <Link
              href={`/${lang}/services`}
              className="flex flex-col items-center justify-center rounded-xl border border-leaf/40 bg-leaf/5 p-3 text-center text-sm font-semibold text-leaf-dark transition-shadow hover:shadow-md"
            >
              <span className="mb-2 text-4xl" aria-hidden>🛠</span>
              {t.nav.services}
            </Link>
          </div>
        </section>

        <section>
          <SectionTitle href={`/${lang}/products`} more={t.home.viewAll}>{t.home.featured}</SectionTitle>
          <ProductGrid products={featured} lang={lang} />
        </section>

        {inStock.length > 0 ? (
          <section>
            <SectionTitle href={`/${lang}/products?stock=1`} more={t.home.viewAll}>{t.home.inStock}</SectionTitle>
            <ProductGrid products={inStock} lang={lang} />
          </section>
        ) : null}

        <section>
          <SectionTitle>{t.home.why}</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.home.whyItems.map(([title, text]) => (
              <div key={title} className="rounded-xl border border-slate-200 p-4">
                <h3 className="font-bold text-brand">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {posts.length > 0 ? (
          <section>
            <SectionTitle href={`/${lang}/projects`} more={t.home.viewAll}>{t.home.latest}</SectionTitle>
            <div className="grid gap-4 md:grid-cols-3">
              {posts.map((post) => (
                <Link key={post.slug} href={`/${lang}/projects/${post.slug}`} className="group overflow-hidden rounded-xl border border-slate-200 transition-shadow hover:shadow-md">
                  <div className="relative aspect-[4/3] bg-slate-100">
                    {post.images[0] ? <Image src={post.images[0]} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /> : null}
                  </div>
                  <h3 className="p-3 text-sm font-semibold group-hover:text-brand">{pick(lang, post.titleLao, post.titleEng)}</h3>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </>
  );
}
