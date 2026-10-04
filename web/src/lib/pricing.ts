import type { CustomerType, PriceTier } from "@prisma/client";
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

/* ---------- Phase 2: price tiers for quotations (never shown on the public site) ---------- */

export const tierLabel = { GENERAL: "ທົ່ວໄປ", MEDICAL: "ໂຮງໝໍ / ຄລີນິກ", DEALER: "ຕົວແທນ" } as const;

/** Customer type decides the default tier; sales can override it per quotation. */
export function tierForCustomer(type: CustomerType): PriceTier {
  if (type === "DEALER") return "DEALER";
  if (type === "HOSPITAL" || type === "CLINIC" || type === "GOVERNMENT") return "MEDICAL";
  return "GENERAL";
}

type Tiered = { priceLAK: unknown; medicalPriceLAK: unknown; dealerPriceLAK: unknown };

/** Price of one catalog line for a tier. A tier with no price falls back to the general price; null means "not priced yet". */
export function tierPrice(line: Tiered, tier: PriceTier): number | null {
  const pick = (value: unknown) => (value == null ? null : Number(value));
  const general = pick(line.priceLAK);
  if (tier === "DEALER") return pick(line.dealerPriceLAK) ?? pick(line.medicalPriceLAK) ?? general;
  if (tier === "MEDICAL") return pick(line.medicalPriceLAK) ?? general;
  return general;
}

/** A variant's own price wins; a product without variants uses the product's prices. */
export function itemTierPrice(product: Tiered, variant: Tiered | null | undefined, tier: PriceTier) {
  return tierPrice(variant ?? product, tier);
}
