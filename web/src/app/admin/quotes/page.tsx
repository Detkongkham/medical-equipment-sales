import { AdminTitle, Notice, Pill, customerType, one, quoteStatus, thDate } from "@/components/admin";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { setQuoteStatus } from "../actions";

export const metadata = { title: "ຄຳຂໍລາຄາ" };

export default async function QuotesAdmin({ searchParams }: PageProps<"/admin/quotes">) {
  await requireAdmin("SALES");
  const sp = await searchParams;
  const quotes = await db.quotation.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { customer: true, items: { include: { product: { select: { titleLao: true, sku: true } }, variant: { select: { nameLao: true } } } } },
  });
  return (
    <>
      <AdminTitle>ຄຳຂໍລາຄາ</AdminTitle>
      <Notice saved={one(sp.saved)} error={one(sp.error)} />
      {quotes.length === 0 ? <p className="text-slate-600">ຍັງບໍ່ມີຄຳຂໍລາຄາ.</p> : null}
      <div className="space-y-4">
        {quotes.map((q) => {
          const [label, tone] = quoteStatus[q.status];
          const phone = q.customer.whatsapp ?? q.customer.phone;
          return (
            <article key={q.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-bold text-brand">{q.quoteNumber} <span className="ml-2 align-middle"><Pill tone={tone}>{label}</Pill></span></h2>
                <span className="text-xs text-slate-500">{thDate(q.createdAt)}</span>
              </div>
              <p className="mt-2 font-medium text-slate-900">{q.customer.organization} <span className="text-sm font-normal text-slate-500">({customerType[q.customer.type]})</span></p>
              <p className="text-sm text-slate-600">
                {q.customer.contactName} · <a className="text-brand hover:underline" href={`tel:${q.customer.phone}`}>{q.customer.phone}</a>
                {" · "}<a className="text-leaf hover:underline" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${phone.replace(/\D/g, "")}`}>WhatsApp</a>
                {q.customer.email ? <> · <a className="text-brand hover:underline" href={`mailto:${q.customer.email}`}>{q.customer.email}</a></> : null}
              </p>
              {q.customer.address ? <p className="text-sm text-slate-600">{q.customer.address}</p> : null}
              <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
                {q.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3 px-3 py-1.5">
                    <span>{item.product.titleLao}{item.variant ? ` – ${item.variant.nameLao}` : ""} <span className="text-xs text-slate-500">{item.product.sku}</span></span>
                    <span className="shrink-0 font-semibold">× {item.quantity}</span>
                  </li>
                ))}
              </ul>
              {q.note ? <p className="mt-2 whitespace-pre-line rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{q.note}</p> : null}
              <form action={setQuoteStatus} className="mt-3 flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={q.id} />
                <select name="status" defaultValue={q.status} aria-label="ສະຖານະ" className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm">
                  {Object.entries(quoteStatus).map(([value, [text]]) => <option key={value} value={value}>{text}</option>)}
                </select>
                <button className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark">ອັບເດດສະຖານະ</button>
              </form>
            </article>
          );
        })}
      </div>
    </>
  );
}
