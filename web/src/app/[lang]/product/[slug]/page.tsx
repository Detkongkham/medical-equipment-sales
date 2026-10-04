import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Gallery } from "@/components/Gallery";
import { ProductGrid, productCardSelect } from "@/components/ProductCard";
import { AddToCartButton } from "@/components/CartButtons";
import { AddToQuoteButton } from "@/components/QuoteButtons";
import { Container, SectionTitle, StockBadge, buttonClass } from "@/components/ui";
import { db } from "@/lib/db";
import { getDictionary, isLocale, pick } from "@/lib/i18n";
import { formatLAK, getShowPrices, publicPrice } from "@/lib/pricing";
import { getPaymentInfo, paymentReady, priceCart, releaseExpiredOrders } from "@/lib/shop";
import { messengerLink, site, whatsappLink } from "@/lib/site";

export const revalidate = 300;

type Spec = { labelLao: string; labelEng: string; value: string };

const getProduct = cache((slug: string) =>
  db.product.findFirst({
    where: { slug, isPublished: true },
    include: {
      brand: true,
      category: { include: { parent: true } },
      variants: { orderBy: { sku: "asc" } },
      relatedFrom: { include: { to: { select: productCardSelect } } },
      relatedTo: { include: { from: { select: productCardSelect } } },
      posts: { where: { publishedAt: { not: null } }, orderBy: { publishedAt: "desc" } },
    },
  }),
);

export async function generateMetadata({ params }: PageProps<"/[lang]/product/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const product = await getProduct(slug);
  if (!product) return {};
  const title = pick(lang, product.titleLao, product.titleEng);
  return {
    title,
    description: pick(lang, product.shortDescLao ?? title, product.shortDescEng ?? product.titleEng),
    alternates: { canonical: `/${lang}/product/${slug}`, languages: { lo: `/lo/product/${slug}`, en: `/en/product/${slug}` } },
    openGraph: { images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: PageProps<"/[lang]/product/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const product = await getProduct(slug);
  if (!product) notFound();
  const t = getDictionary(lang).product;
  const showPrices = await getShowPrices();
  const price = publicPrice(product, showPrices);
  const variantPricesVisible = showPrices && product.showPrice && product.variants.some((v) => v.priceLAK != null);

  const title = pick(lang, product.titleLao, product.titleEng);
  const description = pick(lang, product.shortDescLao ?? "", product.shortDescEng);
  const specs = (product.specifications as Spec[] | null) ?? [];
  const inStock = product.stockStatus === "IN_STOCK" || product.variants.some((v) => v.stockStatus === "IN_STOCK");
  const inquiry = `${t.inquiry}: ${title} (${product.sku})`;
  const quoteLabels = { add: t.addToQuote, added: t.added, view: t.viewQuote };
  // Online purchase: only consumables set to "buy online", with a price, stock in unexpired lots and a payment account configured.
  const canBuy = product.salesMode === "DIRECT_BUY" && paymentReady(await getPaymentInfo());
  if (canBuy) await releaseExpiredOrders();
  const buyLines = canBuy ? await priceCart(product.variants.length > 0 ? product.variants.map((v) => ({ productId: product.id, variantId: v.id, qty: 1 })) : [{ productId: product.id, qty: 1 }]) : [];
  const buyable = (variantId?: string) => buyLines.find((l) => l.variantId === variantId);
  const shop = getDictionary(lang).shop;
  const cartLabels = { add: shop.addToCart, added: shop.addedToCart, view: shop.viewCart };
  const crumbs = [product.category.parent, product.category].filter((c) => c !== null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    sku: product.sku,
    ...(product.modelNumber ? { model: product.modelNumber } : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand.name } } : {}),
    ...(description ? { description } : {}),
    image: product.images.map((src) => `${site.url}${src}`),
    ...(price
      ? { offers: { "@type": "Offer", priceCurrency: "LAK", price: Number(price.amount), availability: inStock ? "https://schema.org/InStock" : "https://schema.org/PreOrder" } }
      : {}),
  };

  return (
    <Container className="py-8">
      <nav className="mb-4 text-sm text-slate-500">
        <Link href={`/${lang}/products`} className="hover:underline">{t.all}</Link>
        {crumbs.map((c) => (
          <span key={c.slug}>
            {" / "}
            <Link href={`/${lang}/products/${c.slug}`} className="hover:underline">{pick(lang, c.nameLao, c.nameEng)}</Link>
          </span>
        ))}
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="min-w-0">
          <Gallery images={product.images} alt={title} emptyLabel={t.noImage} />
        </div>

        <div className="min-w-0">
          {product.brand ? (
            <p className="text-sm font-semibold uppercase tracking-wide text-leaf">
              {product.brand.name}
              {product.brand.isHouseBrand ? <span className="ml-2 rounded bg-leaf/10 px-1.5 py-0.5 text-xs normal-case text-leaf-dark">{t.houseBrand}</span> : null}
            </p>
          ) : null}
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
            <StockBadge inStock={inStock} labels={t} />
            {product.modelNumber ? <span>{t.model}: <strong>{product.modelNumber}</strong></span> : null}
            <span>{t.sku}: {product.sku}</span>
            {product.fddRegNumber ? <span>{t.fdd}: {product.fddRegNumber}</span> : null}
          </div>
          {description ? <p className="mt-4 text-slate-700">{description}</p> : null}

          {product.certifications.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-slate-600">{t.certifications}:</span>
              {product.certifications.map((cert) => (
                <span key={cert} className="rounded-md border border-brand/30 px-2 py-0.5 text-xs font-semibold text-brand">{cert}</span>
              ))}
            </div>
          ) : null}

          {price ? (
            <div className="mt-5">
              <p className="text-2xl font-bold text-brand">
                {price.from ? <span className="mr-1 text-base font-medium text-slate-600">{t.priceFrom}</span> : null}
                {formatLAK(price.amount)}
              </p>
              <p className="mt-1 text-xs text-slate-500">{t.priceNote}</p>
            </div>
          ) : (
            <p className="mt-5 text-lg font-bold text-brand">{t.askPrice}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.length === 0 && buyable() ? (
              buyable()?.ok ? <AddToCartButton productId={product.id} labels={cartLabels} lang={lang} /> : <span className="self-center rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">{shop.outOfStock}</span>
            ) : null}
            {product.variants.length === 0 ? (
              <AddToQuoteButton productId={product.id} title={title} labels={quoteLabels} lang={lang} />
            ) : null}
            <a href={whatsappLink(inquiry)} target="_blank" rel="noopener noreferrer" className={buttonClass("green")}>{t.askWhatsapp}</a>
            <a href={messengerLink(inquiry)} target="_blank" rel="noopener noreferrer" className={buttonClass("outline")}>{t.askMessenger}</a>
            {product.brochurePdfUrl ? <a href={product.brochurePdfUrl} className={buttonClass("outline")}>{t.brochure}</a> : null}
          </div>

          {product.variants.length > 0 ? (
            <div className="mt-6">
              <h2 className="mb-2 font-bold text-brand">{t.options}</h2>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-3 py-2 font-medium">{t.option}</th>
                      <th className="px-3 py-2 font-medium">{t.pack}</th>
                      {variantPricesVisible ? <th className="px-3 py-2 font-medium">{t.price}</th> : null}
                      <th className="px-3 py-2 font-medium">{t.status}</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((variant) => {
                      const name = pick(lang, variant.nameLao, variant.nameEng);
                      return (
                        <tr key={variant.id} className="border-t border-slate-100">
                          <td className="px-3 py-2 font-medium">{name}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-slate-600">{variant.packSize ?? "–"}</td>
                          {variantPricesVisible ? (
                            <td className="whitespace-nowrap px-3 py-2 font-semibold text-brand">{variant.priceLAK == null ? t.askPrice : formatLAK(variant.priceLAK)}</td>
                          ) : null}
                          <td className="px-3 py-2"><StockBadge inStock={variant.stockStatus === "IN_STOCK"} labels={t} /></td>
                          <td className="space-y-1 px-3 py-2 text-right">
                            {buyable(variant.id) ? (
                              buyable(variant.id)?.ok ? <AddToCartButton productId={product.id} variantId={variant.id} labels={cartLabels} lang={lang} compact /> : <span className="block text-xs text-slate-500">{shop.outOfStock}</span>
                            ) : null}
                            <AddToQuoteButton productId={product.id} variantId={variant.id} title={title} variant={name} labels={quoteLabels} lang={lang} compact />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-12 space-y-12">
        {specs.length > 0 ? (
          <section>
            <SectionTitle>{t.specs}</SectionTitle>
            <dl className="max-w-3xl overflow-hidden rounded-lg border border-slate-200 text-sm">
              {specs.map((spec, i) => (
                <div key={spec.labelEng} className={`grid grid-cols-[40%_60%] ${i % 2 ? "bg-slate-50" : "bg-white"}`}>
                  <dt className="px-3 py-2 font-medium text-slate-600">{pick(lang, spec.labelLao, spec.labelEng)}</dt>
                  <dd className="px-3 py-2">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {product.relatedFrom.length > 0 ? (
          <section>
            <SectionTitle>{t.usedWith}</SectionTitle>
            <ProductGrid products={product.relatedFrom.map((r) => r.to)} lang={lang} />
          </section>
        ) : null}

        {product.relatedTo.length > 0 ? (
          <section>
            <SectionTitle>{t.worksWith}</SectionTitle>
            <ProductGrid products={product.relatedTo.map((r) => r.from)} lang={lang} />
          </section>
        ) : null}

        {product.posts.length > 0 ? (
          <section>
            <SectionTitle>{t.related}</SectionTitle>
            <ul className="list-inside list-disc space-y-1">
              {product.posts.map((post) => (
                <li key={post.slug}>
                  <Link href={`/${lang}/projects/${post.slug}`} className="text-brand hover:underline">{pick(lang, post.titleLao, post.titleEng)}</Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Container>
  );
}
