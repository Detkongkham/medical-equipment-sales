"use server";

import { CustomerType } from "@prisma/client";
import { z } from "zod";
import { findOrCreateCustomer } from "@/lib/customers";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";
import { isUniqueViolation, nextNumber } from "@/lib/numbering";
import { checkFiles, saveFiles } from "@/lib/storage";

export type FormState = { ok: boolean; number?: string; error?: "required" | "emptyQuote" | "files" | "failed" };

const text = (max: number) => z.string().trim().max(max);
const required = (max: number) => text(max).min(1);
const optional = (max: number) => text(max).transform((v) => v || undefined);

function fields(formData: FormData) {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) if (typeof value === "string") out[key] = value;
  return out;
}

function uploads(formData: FormData) {
  return formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
}

/** Bots fill the hidden "website" field; humans never see it. */
function isSpam(formData: FormData) {
  return Boolean(formData.get("website"));
}

const quoteSchema = z.object({
  organization: required(200),
  type: z.enum(CustomerType),
  contactName: required(120),
  phone: required(40),
  whatsapp: optional(40),
  email: optional(120),
  address: optional(500),
  note: optional(2000),
  items: z.string(),
});
const itemsSchema = z
  .array(z.object({ productId: z.string(), variantId: z.string().optional(), qty: z.number().int().min(1).max(9999) }))
  .max(100);

export async function submitQuote(_prev: FormState, formData: FormData): Promise<FormState> {
  if (isSpam(formData)) return { ok: true, number: "Q-0000" };
  const parsed = quoteSchema.safeParse(fields(formData));
  if (!parsed.success) return { ok: false, error: "required" };
  let items: z.infer<typeof itemsSchema>;
  try {
    items = itemsSchema.parse(JSON.parse(parsed.data.items));
  } catch {
    return { ok: false, error: "emptyQuote" };
  }
  if (items.length === 0) return { ok: false, error: "emptyQuote" };

  try {
    // Only keep items that still exist in the catalog.
    const products = await db.product.findMany({
      where: { id: { in: items.map((i) => i.productId) }, isPublished: true },
      select: { id: true, titleLao: true, sku: true, variants: { select: { id: true, nameLao: true } } },
    });
    const byId = new Map(products.map((p) => [p.id, p]));
    const valid = items.flatMap((item) => {
      const product = byId.get(item.productId);
      if (!product) return [];
      const variant = product.variants.find((v) => v.id === item.variantId);
      return [{ product, variant, qty: item.qty }];
    });
    if (valid.length === 0) return { ok: false, error: "emptyQuote" };

    const customer = parsed.data;
    for (let attempt = 0; ; attempt++) {
      const quoteNumber = await nextNumber("Q", async (startsWith) =>
        (await db.quotation.findFirst({ where: { quoteNumber: { startsWith } }, orderBy: { quoteNumber: "desc" } }))?.quoteNumber,
      );
      try {
        const crm = await findOrCreateCustomer({
          organization: customer.organization, type: customer.type, contactName: customer.contactName,
          phone: customer.phone, whatsapp: customer.whatsapp, email: customer.email, address: customer.address,
        });
        await db.quotation.create({
          data: {
            quoteNumber,
            note: customer.note,
            customerId: crm.id,
            items: { create: valid.map((v) => ({ productId: v.product.id, variantId: v.variant?.id, quantity: v.qty })) },
          },
        });
        await notify(
          "SALES",
          [
            `ຄຳຂໍລາຄາໃໝ່ ${quoteNumber}`,
            `${customer.organization} (${customer.type})`,
            `${customer.contactName} · ${customer.phone}`,
            ...valid.map((v) => `• ${v.product.titleLao}${v.variant ? ` – ${v.variant.nameLao}` : ""} × ${v.qty}`),
            customer.note ? `ໝາຍເຫດ: ${customer.note}` : "",
          ].filter(Boolean).join("\n"),
        );
        return { ok: true, number: quoteNumber };
      } catch (error) {
        if (!isUniqueViolation(error) || attempt >= 3) throw error;
      }
    }
  } catch (error) {
    console.error("submitQuote failed", error);
    return { ok: false, error: "failed" };
  }
}

const ticketSchema = z.object({
  organization: required(200),
  contactName: required(120),
  phone: required(40),
  deviceModel: required(200),
  serialNumber: optional(120),
  issue: required(4000),
});

export async function submitTicket(_prev: FormState, formData: FormData): Promise<FormState> {
  if (isSpam(formData)) return { ok: true, number: "SR-0000" };
  const parsed = ticketSchema.safeParse(fields(formData));
  if (!parsed.success) return { ok: false, error: "required" };
  const files = uploads(formData);
  if (checkFiles(files) !== "ok") return { ok: false, error: "files" };

  try {
    const d = parsed.data;
    const attachmentUrls = await saveFiles(files, "tickets");
    for (let attempt = 0; ; attempt++) {
      const ticketNumber = await nextNumber("SR", async (startsWith) =>
        (await db.serviceTicket.findFirst({ where: { ticketNumber: { startsWith } }, orderBy: { ticketNumber: "desc" } }))?.ticketNumber,
      );
      try {
        const crm = await findOrCreateCustomer({ organization: d.organization, contactName: d.contactName, phone: d.phone });
        // A known serial number links the ticket to the installed-equipment registry (and its warranty).
        const equipment = d.serialNumber
          ? await db.installedEquipment.findFirst({ where: { customerId: crm.id, serialNumber: { equals: d.serialNumber, mode: "insensitive" } } })
          : null;
        await db.serviceTicket.create({
          data: { ticketNumber, deviceModel: d.deviceModel, serialNumber: d.serialNumber, issueDescription: d.issue, attachmentUrls, customerId: crm.id, equipmentId: equipment?.id },
        });
        await notify(
          "SERVICE",
          [`ແຈ້ງສ້ອມໃໝ່ ${ticketNumber}`, d.organization, `${d.contactName} · ${d.phone}`, `ເຄື່ອງ: ${d.deviceModel}${d.serialNumber ? ` (S/N ${d.serialNumber})` : ""}`, d.issue].join("\n"),
        );
        return { ok: true, number: ticketNumber };
      } catch (error) {
        if (!isUniqueViolation(error) || attempt >= 3) throw error;
      }
    }
  } catch (error) {
    console.error("submitTicket failed", error);
    return { ok: false, error: "failed" };
  }
}

const applicationSchema = z.object({
  jobId: required(60),
  fullName: required(120),
  phone: required(40),
  email: optional(120),
  note: optional(2000),
});

export async function submitApplication(_prev: FormState, formData: FormData): Promise<FormState> {
  if (isSpam(formData)) return { ok: true };
  const parsed = applicationSchema.safeParse(fields(formData));
  if (!parsed.success) return { ok: false, error: "required" };
  const files = uploads(formData);
  if (files.length === 0 || checkFiles(files) !== "ok") return { ok: false, error: "files" };

  try {
    const d = parsed.data;
    const job = await db.jobOpening.findFirst({ where: { id: d.jobId, isActive: true } });
    if (!job) return { ok: false, error: "required" };
    const documentUrls = await saveFiles(files, "applications");
    await db.jobApplicant.create({
      data: { jobId: job.id, fullName: d.fullName, phone: d.phone, email: d.email, note: d.note, documentUrls },
    });
    await notify("HR", [`ໃບສະໝັກງານໃໝ່: ${job.title}`, `${d.fullName} · ${d.phone}`, `ເອກະສານ ${documentUrls.length} ໄຟລ໌`].join("\n"));
    return { ok: true };
  } catch (error) {
    console.error("submitApplication failed", error);
    return { ok: false, error: "failed" };
  }
}
