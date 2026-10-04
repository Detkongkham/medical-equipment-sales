import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminTitle, Card, Notice, Pill, customerType, one, quoteStatus, thDate } from "@/components/admin";
import { Field, Input, Select, Textarea, buttonClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { dateValue } from "@/lib/form";
import { waLink } from "@/lib/phone";
import { formatLAK, itemTierPrice, tierForCustomer, tierLabel } from "@/lib/pricing";
import { DEFAULT_TERMS, publicQuoteUrl, quoteInclude } from "@/lib/quotes";
import { applyTierPrices, markQuoteSent, saveQuotation } from "../../sales-actions";
import { setQuoteStatus } from "../../actions";

export const metadata = { title: "ໃບສະເໜີລາຄາ" };

const plain = (value: unknown) => (value == null ? "" : String(Number(value)));

export default async function QuoteDetail({ params, searchParams }: PageProps<"/admin/quotes/[id]">) {
  await requireAdmin("SALES");
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const quote = await db.quotation.findUnique({ where: { id }, include: quoteInclude });
  if (!quote) notFound();

  const tier = quote.priceTier ?? tierForCustomer(quote.customer.type);
  const [label, tone] = quoteStatus[quote.status];
  const subtotal = quote.items.reduce((sum, i) => sum + Number(i.unitPrice ?? 0) * i.quantity, 0);
  const missing = quote.items.filter((i) => i.unitPrice == null).length;
  const catalogMissing = quote.items.filter((i) => itemTierPrice(i.product, i.variant, tier) == null).length;
  const link = quote.sentAt ? publicQuoteUrl(quote.id) : null;
  const message = link ? `ສະບາຍດີ ${quote.customer.contactName}, ໃບສະເໜີລາຄາ ${quote.quoteNumber} ຈາກ ຊັບທະວີຄູນ (XTK): ${link}` : "";

  return (
    <>
      <AdminTitle actions={<Link href="/admin/quotes" className="text-sm text-brand hover:underline">← ທຸກຄຳຂໍ</Link>}>
        {quote.quoteNumber} <span className="ml-2 align-middle"><Pill tone={tone}>{label}</Pill></span>
      </AdminTitle>
      <Notice saved={one(sp.saved)} error={one(sp.error)} />

      <div className="max-w-4xl space-y-5">
        <Card title="ລູກຄ້າ">
          <p className="font-medium text-slate-900">
            <Link href={`/admin/customers/${quote.customer.id}`} className="text-brand hover:underline">{quote.customer.organization}</Link>{" "}
            <span className="text-sm font-normal text-slate-500">({customerType[quote.customer.type]})</span>
          </p>
          <p className="text-sm text-slate-600">{quote.customer.contactName} · {quote.customer.phone}{quote.customer.email ? ` · ${quote.customer.email}` : ""}</p>
          {quote.note ? <p className="mt-2 whitespace-pre-line rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{quote.note}</p> : null}
          <p className="mt-2 text-xs text-slate-500">ຮັບຄຳຂໍ {thDate(quote.createdAt)}</p>
        </Card>

        <Card title="ລະດັບລາຄາ">
          <form action={applyTierPrices} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="id" value={quote.id} />
            <Field label="ໃຊ້ລາຄາຂອງ">
              <Select name="tier" defaultValue={tier}>
                {Object.entries(tierLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </Field>
            <button className={buttonClass("outline")}>ດຶງລາຄາຈາກ catalog ໃສ່ທຸກລາຍການ</button>
          </form>
          <p className="mt-2 text-xs text-slate-500">
            ຄ່າເລີ່ມຕົ້ນຕາມປະເພດລູກຄ້າ ({customerType[quote.customer.type]} → {tierLabel[tierForCustomer(quote.customer.type)]}). ຈະຂຽນທັບລາຄາທີ່ແກ້ໄວ້.
            {catalogMissing > 0 ? ` ${catalogMissing} ລາຍການ ຍັງບໍ່ມີລາຄາໃນ catalog — ໃສ່ເອງໃນຕາຕະລາງລຸ່ມ.` : ""}
          </p>
        </Card>

        <form action={saveQuotation} className="space-y-5">
          <input type="hidden" name="id" value={quote.id} />
          <input type="hidden" name="tier" value={tier} />
          <Card title="ລາຍການ ແລະ ລາຄາ">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500"><th className="pb-2 font-medium">ລາຍການ</th><th className="w-20 pb-2 font-medium">ຈຳນວນ</th><th className="w-36 pb-2 font-medium">ລາຄາ/ຫົວໜ່ວຍ (₭)</th><th className="w-32 pb-2 text-right font-medium">ລວມ</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quote.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 pr-2">
                        {item.product.titleLao}{item.variant ? ` – ${item.variant.nameLao}` : ""}
                        <span className="block text-xs text-slate-500">{item.variant?.sku ?? item.product.sku}{item.variant?.packSize ? ` · ${item.variant.packSize}` : ""}</span>
                        <input type="hidden" name="itemId" value={item.id} />
                      </td>
                      <td className="py-2 pr-2"><Input name="quantity" type="number" min={1} max={9999} defaultValue={item.quantity} aria-label="ຈຳນວນ" /></td>
                      <td className="py-2 pr-2"><Input name="unitPrice" inputMode="numeric" defaultValue={plain(item.unitPrice)} placeholder="ຍັງບໍ່ມີ" aria-label="ລາຄາຕໍ່ຫົວໜ່ວຍ" /></td>
                      <td className="py-2 text-right tabular-nums">{item.unitPrice == null ? "—" : formatLAK(Number(item.unitPrice) * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="ສ່ວນຫຼຸດ (ກີບ)"><Input name="discountLAK" inputMode="numeric" defaultValue={plain(quote.discountLAK)} placeholder="ບໍ່ມີ" /></Field>
              <Field label="ໃຊ້ໄດ້ເຖິງວັນທີ"><Input name="validUntil" type="date" defaultValue={dateValue(quote.validUntil)} /></Field>
            </div>
            <p className="mt-3 text-right text-sm text-slate-600">ລວມຍ່ອຍ {formatLAK(subtotal)}{quote.discountLAK ? ` − ${formatLAK(quote.discountLAK)}` : ""}</p>
            <p className="text-right text-lg font-bold text-leaf-dark">ລວມທັງໝົດ {formatLAK(Math.max(0, subtotal - Number(quote.discountLAK ?? 0)))}</p>
          </Card>
          <Card title="ເງື່ອນໄຂໃນໃບສະເໜີ">
            <Field label="ຂໍ້ຄວາມທີ່ພິມໃນ PDF"><Textarea name="terms" rows={5} defaultValue={quote.terms ?? DEFAULT_TERMS} /></Field>
          </Card>
          <button className={buttonClass("primary")}>ບັນທຶກໃບສະເໜີ</button>
        </form>

        <Card title="PDF ແລະ ການສົ່ງ">
          <div className="flex flex-wrap items-center gap-3">
            <a href={`/admin/quotes/${quote.id}/pdf`} target="_blank" rel="noopener noreferrer" className={buttonClass("outline")}>ເບິ່ງ / ດາວໂຫຼດ PDF</a>
            {!link ? (
              <form action={markQuoteSent}>
                <input type="hidden" name="id" value={quote.id} />
                <button className={buttonClass("primary")} disabled={missing > 0}>ອອກໃບສະເໜີ ແລະ ສ້າງລິ້ງສົ່ງລູກຄ້າ</button>
              </form>
            ) : null}
          </div>
          {missing > 0 ? <p className="mt-2 text-sm text-amber-800">ຍັງມີ {missing} ລາຍການທີ່ບໍ່ມີລາຄາ — ບັນທຶກລາຄາໃຫ້ຄົບກ່ອນອອກໃບສະເໜີ.</p> : null}
          {link ? (
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-slate-600">ອອກໃບສະເໜີແລ້ວ {quote.sentAt ? thDate(quote.sentAt) : ""}. ລິ້ງນີ້ເປີດ PDF ໄດ້ໂດຍບໍ່ຕ້ອງເຂົ້າລະບົບ:</p>
              <input readOnly value={link} aria-label="ລິ້ງ PDF" className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs" />
              <div className="flex flex-wrap gap-3">
                <a href={waLink(quote.customer.whatsapp ?? quote.customer.phone, message)} target="_blank" rel="noopener noreferrer" className={buttonClass("outline")}>ສົ່ງທາງ WhatsApp</a>
                {quote.customer.email ? (
                  <a href={`mailto:${quote.customer.email}?subject=${encodeURIComponent(`ໃບສະເໜີລາຄາ ${quote.quoteNumber}`)}&body=${encodeURIComponent(message)}`} className={buttonClass("outline")}>ສົ່ງທາງ Email</a>
                ) : null}
              </div>
              <p className="text-xs text-slate-500">ຫາກແກ້ລາຄາຫຼັງອອກແລ້ວ ລິ້ງດຽວກັນຈະສະແດງ PDF ສະບັບທີ່ແກ້.</p>
            </div>
          ) : null}
        </Card>

        <Card title="ສະຖານະ">
          <form action={setQuoteStatus} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={quote.id} />
            <input type="hidden" name="back" value={`/admin/quotes/${quote.id}`} />
            <Select name="status" defaultValue={quote.status} aria-label="ສະຖານະ">
              {Object.entries(quoteStatus).map(([value, [text]]) => <option key={value} value={value}>{text}</option>)}
            </Select>
            <button className={buttonClass("outline")}>ອັບເດດສະຖານະ</button>
          </form>
        </Card>
      </div>
    </>
  );
}
