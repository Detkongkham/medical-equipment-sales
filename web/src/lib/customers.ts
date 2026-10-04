import type { CustomerType } from "@prisma/client";
import { db } from "./db";
import { waNumber } from "./phone";

type Input = { organization: string; type?: CustomerType; contactName: string; phone: string; whatsapp?: string; email?: string; address?: string };

/**
 * One CRM record per organization + phone, so repeat requests build a history instead of duplicates.
 * An existing record keeps its type and details; only blank fields are filled from the new request.
 */
export async function findOrCreateCustomer(input: Input) {
  const sameOrg = await db.customer.findMany({ where: { organization: { equals: input.organization, mode: "insensitive" } } });
  const phone = waNumber(input.phone);
  const existing = sameOrg.find((c) => waNumber(c.phone) === phone);
  if (!existing) return db.customer.create({ data: input });
  const fill = {
    whatsapp: existing.whatsapp ?? input.whatsapp,
    email: existing.email ?? input.email,
    address: existing.address ?? input.address,
  };
  return db.customer.update({ where: { id: existing.id }, data: fill });
}
