// Fills country/website for distributed brands from their official sites (researched 2026-10-05). Only fills empty fields.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const info: Record<string, { country: string; website?: string }> = {
  genrui: { country: "China", website: "https://www.genrui-bio.com" },
  chison: { country: "China", website: "https://www.chison.com" },
  lumiquick: { country: "USA" },
  vivachek: { country: "China", website: "https://www.vivachek.com" },
  vcomin: { country: "China" },
  gima: { country: "Italy", website: "https://www.gimaitaly.com" },
  sony: { country: "Japan" },
  autoclear: { country: "USA", website: "https://www.autoclear.com" },
  ceia: { country: "Italy", website: "https://www.ceia.net" },
};

async function main() {
  for (const [slug, v] of Object.entries(info)) {
    const brand = await prisma.brand.findUnique({ where: { slug } });
    if (!brand) continue;
    await prisma.brand.update({ where: { slug }, data: { country: brand.country ?? v.country, website: brand.website ?? v.website ?? null } });
  }
  console.log("Brand info updated.");
}

main().finally(() => prisma.$disconnect());
