import { AdminTitle, Notice, Pill, customerType, one, thDate, ticketStatus } from "@/components/admin";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateTicket } from "../actions";

export const metadata = { title: "ແຈ້ງສ້ອມ" };

export default async function TicketsAdmin({ searchParams }: PageProps<"/admin/tickets">) {
  await requireAdmin("TECHNICIAN");
  const sp = await searchParams;
  const tickets = await db.serviceTicket.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { customer: true } });
  return (
    <>
      <AdminTitle>ແຈ້ງສ້ອມ</AdminTitle>
      <Notice saved={one(sp.saved)} error={one(sp.error)} />
      {tickets.length === 0 ? <p className="text-slate-600">ຍັງບໍ່ມີການແຈ້ງສ້ອມ.</p> : null}
      <div className="space-y-4">
        {tickets.map((t) => {
          const [label, tone] = ticketStatus[t.status];
          return (
            <article key={t.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-bold text-brand">{t.ticketNumber} <span className="ml-2 align-middle"><Pill tone={tone}>{label}</Pill></span></h2>
                <span className="text-xs text-slate-500">{thDate(t.createdAt)}</span>
              </div>
              <p className="mt-2 font-medium text-slate-900">{t.deviceModel}{t.serialNumber ? <span className="text-sm font-normal text-slate-500"> · S/N {t.serialNumber}</span> : null}</p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{t.issueDescription}</p>
              <p className="mt-2 text-sm text-slate-600">
                {t.customer.organization} ({customerType[t.customer.type]}) · {t.customer.contactName} · <a className="text-brand hover:underline" href={`tel:${t.customer.phone}`}>{t.customer.phone}</a>
              </p>
              {t.attachmentUrls.length > 0 ? (
                <p className="mt-1 text-sm">ໄຟລ໌ແນບ: {t.attachmentUrls.map((url, i) => <a key={url} className="mr-3 text-brand hover:underline" href={`/admin/download?f=${encodeURIComponent(url)}`}>ໄຟລ໌ {i + 1}</a>)}</p>
              ) : null}
              <form action={updateTicket} className="mt-3 flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={t.id} />
                <select name="status" defaultValue={t.status} aria-label="ສະຖານະ" className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm">
                  {Object.entries(ticketStatus).map(([value, [text]]) => <option key={value} value={value}>{text}</option>)}
                </select>
                <input name="assignedTech" defaultValue={t.assignedTech ?? ""} placeholder="ຊ່າງທີ່ຮັບຜິດຊອບ" aria-label="ຊ່າງທີ່ຮັບຜິດຊອບ" className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm" />
                <button className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark">ອັບເດດ</button>
              </form>
            </article>
          );
        })}
      </div>
    </>
  );
}
