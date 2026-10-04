import Image from "next/image";
import Link from "next/link";
import { getDictionary, pick, type Locale } from "@/lib/i18n";
import { StockBadge } from "./ui";

export type ProductCardData = {
  slug: string;
  titleLao: string;
  titleEng: string;
  images: string[];
  stockStatus: "IN_STOCK" | "PRE_ORDER";
  brand: { name: string } | null;
};

export const productCardSelect = {
  slug: true, titleLao: true, titleEng: true, images: true, stockStatus: true, brand: { select: { name: true } },
} as const;

export function ProductCard({ product, lang }: { product: ProductCardData; lang: Locale }) {
  const t = getDictionary(lang).product;
  const title = pick(lang, product.titleLao, product.titleEng);
  return (
    <Link
      href={`/${lang}/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-slate-50">
        {product.images[0] ? (
          <Image src={product.images[0]} alt={title} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-contain p-3" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">{t.noImage}</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        {product.brand ? <p className="text-xs font-semibold uppercase tracking-wide text-leaf">{product.brand.name}</p> : null}
        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-brand">{title}</h3>
        <div className="mt-auto pt-1">
          <StockBadge inStock={product.stockStatus === "IN_STOCK"} labels={t} />
        </div>
      </div>
    </Link>
  );
}

export function ProductGrid({ products, lang }: { products: ProductCardData[]; lang: Locale }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} lang={lang} />
      ))}
    </div>
  );
}
