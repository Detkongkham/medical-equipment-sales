import { cache } from "react";
import { db } from "./db";

/** Site-wide switch (Admin > Dashboard). Off by default so sample prices never leak to the public site. */
export const getShowPrices = cache(async () => {
  const setting = await db.siteSetting.findUnique({ where: { key: "showPrices" } });
  return setting?.value === "true";
});

export function formatLAK(value: unknown) {
  return `${new Intl.NumberFormat("en-US").format(Number(value))} ₭`;
}

type Priced = { priceLAK: unknown; showPrice: boolean; variants?: { priceLAK: unknown }[] };

/** Lowest price to show for a product, or null when prices are hidden (site-wide or for this product) or unset. */
export function publicPrice(product: Priced, showPrices: boolean): { amount: unknown; from: boolean } | null {
  if (!showPrices || !product.showPrice) return null;
  const variantPrices = (product.variants ?? []).flatMap((v) => (v.priceLAK == null ? [] : [Number(v.priceLAK)]));
  if (variantPrices.length > 0) return { amount: Math.min(...variantPrices), from: variantPrices.length > 1 || (product.variants?.length ?? 0) > 1 };
  return product.priceLAK == null ? null : { amount: product.priceLAK, from: false };
}
