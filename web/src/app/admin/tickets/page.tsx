import Link from "next/link";
import { AdminTitle, Notice, Pill, customerType, one, thDate, ticketStatus } from "@/components/admin";
import { buttonClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateTicket } from "../service-actions";

export const metadata = { title: "ແຈ້ງສ້ອມ" };

const field = "rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm";

export default async function TicketsAdmin({ searchParams }: PageProps<"/admin/tickets">) {
  await requireAdmin("TECHNICIAN");
  const sp = await searchParams;
  const [tickets, technicians] = await Promise.all([
    db.serviceTicket.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        customer: { include: { equipment: { orderBy: { installedAt: "desc" } } } },
        equipment: true,
        assignedTo: true,
        logs: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } },
      },
    }),
    db.adminUser.findMany({ where: { isActive: true, role: { in: ["TECHNICIAN", "ADMIN"] } }, orderBy: { name: "asc" } }),
  ]);
  const now = new Date();
  return (
    <>
      <AdminTitle>ແຈ້ງສ້ອມ</AdminTitle>
      <Notice saved={one(sp.saved)} error={one(sp.error)} />
      {tickets.length === 0 ? <p className="text-slate-600">ຍັງບໍ່ມີການແຈ້ງສ້ອມ.</p> : null}
      <div className="space-y-4">
        {tickets.map((t) => {
          const [label, tone] = ticketStatus[t.status];
          const underWarranty = t.equipment ? t.equipment.warrantyUntil >= now : null;
          return (
            <article key={t.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-bold text-brand">{t.ticketNumber} <span className="ml-2 align-middle"><Pill tone={tone}>{label}</Pill></span></h2>
                <span className="text-xs text-slate-500">{thDate(t.createdAt)}</span>
              </div>
              <p className="mt-2 font-medium text-slate-900">{t.deviceModel}{t.serialNumber ? <span className="text-sm font-normal text-slate-500"> · S/N {t.serialNumber}</span> : null}</p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{t.issueDescription}</p>
              <p className="mt-2 text-sm text-slate-600">
                <Link href={`/admin/customers/${t.customer.id}`} className="text-brand hover:underline">{t.customer.organization}</Link> ({customerType[t.customer.type]}) · {t.customer.contactName} · <a className="text-brand hover:underline" href={`tel:${t.customer.phone}`}>{t.customer.phone}</a>
              </p>
              {t.equipment ? (
                <p className="mt-1 text-sm">
                  ເຄື່ອງໃນທະບຽນ: <Link href={`/admin/equipment/${t.equipment.id}`} className="text-brand hover:underline">{t.equipment.deviceModel}</Link>{" "}
                  <Pill tone={underWarranty ? "green" : "gray"}>{underWarranty ? `ຢູ່ໃນການຮັບປະກັນ ເຖິງ ${t.equipment.warrantyUntil.toLocaleDateString("en-GB")}` : "ໝົດການຮັບປະກັນ"}</Pill>
                </p>
              ) : null}
              {t.attachmentUrls.length > 0 ? (
                <p className="mt-1 text-sm">ໄຟລ໌ແນບ: {t.attachmentUrls.map((url, i) => <a key={url} className="mr-3 text-brand hover:underline" href={`/admin/download?f=${encodeURIComponent(url)}`}>ໄຟລ໌ {i + 1}</a>)}</p>
              ) : null}

              <form action={updateTicket} className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <input type="hidden" name="id" value={t.id} />
                <select name="status" defaultValue={t.status} aria-label="ສະຖານະ" className={field}>
                  {Object.entries(ticketStatus).map(([value, [text]]) => <option key={value} value={value}>{text}</option>)}
                </select>
                <select name="assignedToId" defaultValue={t.assignedToId ?? ""} aria-label="ຊ່າງທີ່ຮັບຜິດຊອບ" className={field}>
                  <option value="">— ຍັງບໍ່ມອບໝາຍ —</option>
                  {technicians.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <select name="equipmentId" defaultValue={t.equipmentId ?? ""} aria-label="ເຄື່ອງໃນທະບຽນ" className={`${field} sm:col-span-2`}>
                  <option value="">— ບໍ່ຜູກກັບເຄື່ອງໃນທະບຽນ —</option>
                  {t.customer.equipment.map((e) => <option key={e.id} value={e.id}>{e.deviceModel}{e.serialNumber ? ` · ${e.serialNumber}` : ""}</option>)}
                </select>
                <input name="note" placeholder="ບັນທຶກການສ້ອມ (ເຊັ່ນ ປ່ຽນຊິ້ນສ່ວນ, ຜົນກວດ)" aria-label="ບັນທຶກ" className={`${field} sm:col-span-2 lg:col-span-3`} />
                <button className={buttonClass("primary")}>ບັນທຶກ</button>
              </form>

              {t.logs.length > 0 ? (
                <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm text-slate-700">
                  {t.logs.map((log) => (
                    <li key={log.id}>
                      <span className="text-xs text-slate-500">{thDate(log.createdAt)} · {log.author?.name ?? "—"}{log.status ? ` · → ${ticketStatus[log.status][0]}` : ""}</span>
                      <br />{log.note}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>
    </>
  );
}
