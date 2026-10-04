import { db } from "./db";
import { renderQuotationPdf } from "./pdf/quotation";
import { shareToken } from "./auth";
import { site } from "./site";

export const DEFAULT_TERMS = [
  "1. ລາຄາເປັນເງິນກີບ ແລະ ໃຊ້ໄດ້ຕາມວັນທີ່ລະບຸ.",
  "2. ການຮັບປະກັນ ແລະ ການຕິດຕັ້ງ ຕາມເງື່ອນໄຂຂອງສິນຄ້າແຕ່ລະລາຍການ.",
  "3. ການຊຳລະ: ຕາມການຕົກລົງລະຫວ່າງສອງຝ່າຍ.",
].join("\n");

export const quoteInclude = {
  customer: true,
  items: { orderBy: { id: "asc" }, include: { product: true, variant: true } },
} as const;

/** Link a customer can open without signing in (WhatsApp / email). */
export const publicQuoteUrl = (id: string) => `${site.url}/quote-pdf/${id}/${shareToken("quote", id)}`;

export async function quotePdfResponse(id: string, opts: { onlyIfSent?: boolean } = {}) {
  const quote = await db.quotation.findUnique({ where: { id }, include: quoteInclude });
  if (!quote || (opts.onlyIfSent && !quote.sentAt)) return new Response("Not found", { status: 404 });
  const buffer = await renderQuotationPdf({
    quoteNumber: quote.quoteNumber,
    issuedAt: quote.sentAt ?? new Date(),
    validUntil: quote.validUntil,
    customer: quote.customer,
    discount: Number(quote.discountLAK ?? 0),
    terms: quote.terms,
    items: quote.items.map((item) => ({
      name: `${item.product.titleLao}${item.variant ? ` – ${item.variant.nameLao}` : ""}`,
      sku: item.variant?.sku ?? item.product.sku,
      pack: item.variant?.packSize ?? null,
      quantity: item.quantity,
      unitPrice: item.unitPrice == null ? null : Number(item.unitPrice),
    })),
  });
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${quote.quoteNumber}.pdf"`, "Cache-Control": "private, no-store" },
  });
}
