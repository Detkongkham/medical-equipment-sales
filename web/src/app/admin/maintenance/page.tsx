import Link from "next/link";
import { AdminTitle, Notice, Pill, one } from "@/components/admin";
import { Input, buttonClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { dateValue } from "@/lib/form";
import { completeMaintenance } from "../service-actions";

export const metadata = { title: "ນັດ PM / Calibration" };

const label = { PM: "PM", CALIBRATION: "Calibration" } as const;

export default async function MaintenanceAdmin({ searchParams }: PageProps<"/admin/maintenance">) {
  await requireAdmin("TECHNICIAN");
  const sp = await searchParams;
  const now = new Date();
  const horizon = new Date(now.getTime() + 45 * 86_400_000);
  const due = await db.maintenanceSchedule.findMany({
    where: { isActive: true, nextDueAt: { lte: horizon } },
    orderBy: { nextDueAt: "asc" },
    include: { equipment: { include: { customer: { select: { id: true, organization: true, phone: true } } } }, assignedTo: { select: { name: true } } },
  });
  const day = (d: Date) => d.toLocaleDateString("en-GB");
  return (
    <>
      <AdminTitle>ນັດ PM / Calibration</AdminTitle>
      <Notice saved={one(sp.saved)} error={one(sp.error)} />
      <p className="mb-4 text-sm text-slate-600">ສະແດງນັດທີ່ເກີນກຳນົດ ແລະ ທີ່ຈະຄົບກຳນົດໃນ 45 ວັນ. ສ້າງນັດໃນໜ້າຂອງເຄື່ອງແຕ່ລະອັນ (<Link href="/admin/equipment" className="text-brand hover:underline">ທະບຽນເຄື່ອງ</Link>).</p>
      {due.length === 0 ? <p className="text-slate-600">ບໍ່ມີນັດທີ່ໃກ້ຄົບກຳນົດ.</p> : null}
      <div className="space-y-3">
        {due.map((s) => {
          const overdue = s.nextDueAt < now;
          return (
            <article key={s.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-bold text-brand"><Link href={`/admin/equipment/${s.equipmentId}`} className="hover:underline">{s.equipment.deviceModel}</Link> <span className="font-normal text-slate-500">· {label[s.type]}</span></h2>
                <Pill tone={overdue ? "amber" : "blue"}>{overdue ? "ເກີນກຳນົດ " : "ຄົບກຳນົດ "}{day(s.nextDueAt)}</Pill>
              </div>
              <p className="mt-1 text-slate-600">
                <Link href={`/admin/customers/${s.equipment.customer.id}`} className="text-brand hover:underline">{s.equipment.customer.organization}</Link> · {s.equipment.customer.phone}
                {s.equipment.location ? ` · ${s.equipment.location}` : ""}{s.assignedTo ? ` · ຊ່າງ ${s.assignedTo.name}` : " · ຍັງບໍ່ມອບໝາຍ"}
              </p>
              <form action={completeMaintenance} className="mt-3 flex flex-wrap items-end gap-2">
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="returnTo" value="maintenance" />
                <Input name="doneAt" type="date" defaultValue={dateValue(now)} aria-label="ວັນທີເຮັດ" />
                <Input name="note" placeholder="ໝາຍເຫດ" aria-label="ໝາຍເຫດ" />
                <button className={`${buttonClass("green")} mb-px`}>ເຮັດແລ້ວ</button>
              </form>
            </article>
          );
        })}
      </div>
    </>
  );
}
