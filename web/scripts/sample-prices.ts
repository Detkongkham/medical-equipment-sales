// Fills EMPTY prices with rough sample values so the price display can be tested.
// These are NOT real prices. Prices stay hidden on the public site until "ສະແດງລາຄາໃນເວັບ" is switched on in the admin.
// Usage: pnpm prices:sample          (only products/variants with no price yet)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Sample LAK amounts by category slug.
const sample: Record<string, number> = {
  "medical-equipment": 85_000_000, diagnostic: 650_000, surgical: 1_200_000,
  analyzers: 120_000_000, reagents: 2_500_000, "rapid-tests": 450_000,
  disposables: 180_000, "printer-paper": 90_000, "xray-inspection": 900_000_000, "metal-detectors": 15_000_000, "trace-detection": 400_000_000,
};

async function main() {
  const products = await prisma.product.findMany({ include: { category: true, variants: true } });
  let count = 0;
  for (const p of products) {
    const base = sample[p.category.slug];
    if (!base || p.category.slug === "pharmaceuticals") continue;
    if (p.variants.length === 0) {
      if (p.priceLAK == null) { await prisma.product.update({ where: { id: p.id }, data: { priceLAK: base } }); count++; }
    } else {
      for (const [i, v] of p.variants.entries()) {
        if (v.priceLAK == null) { await prisma.productVariant.update({ where: { id: v.id }, data: { priceLAK: Math.round((base * (1 + i * 0.15)) / 1000) * 1000 } }); count++; }
      }
    }
  }
  console.log(`Sample prices written to ${count} items.`);
}

main().finally(() => prisma.$disconnect());
