import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminTitle, Card, Notice, Pill, one, thDate, ticketStatus } from "@/components/admin";
import { EquipmentForm } from "@/components/EquipmentForm";
import { Field, Input, Select, buttonClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { dateValue } from "@/lib/form";
import { addSchedule, completeMaintenance, deleteEquipment, setScheduleActive } from "../../service-actions";

export const metadata = { title: "ເຄື່ອງທີ່ຕິດຕັ້ງ" };

const maintenanceLabel = { PM: "ບຳລຸງຮັກສາ (PM)", CALIBRATION: "ປັບຄ່າ (Calibration)" } as const;

export default async function EquipmentDetail({ params, searchParams }: PageProps<"/admin/equipment/[id]">) {
  await requireAdmin("SALES", "TECHNICIAN");
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [equipment, products, technicians] = await Promise.all([
    db.installedEquipment.findUnique({
      where: { id },
      include: {
        customer: true,
        tickets: { orderBy: { createdAt: "desc" } },
        schedules: { orderBy: { nextDueAt: "asc" }, include: { assignedTo: { select: { name: true } }, records: { orderBy: { doneAt: "desc" }, take: 3, include: { doneBy: { select: { name: true } } } } } },
      },
    }),
    db.product.findMany({ select: { id: true, titleLao: true, sku: true, modelNumber: true }, orderBy: { sku: "asc" } }),
    db.adminUser.findMany({ where: { isActive: true, role: { in: ["TECHNICIAN", "ADMIN"] } }, orderBy: { name: "asc" } }),
  ]);
  if (!equipment) notFound();
  const now = new Date();
  const day = (d: Date) => d.toLocaleDateString("en-GB");
  const warranty = equipment.warrantyUntil >= now;

  return (
    <>
      <AdminTitle actions={<Link href={`/admin/customers/${equipment.customerId}`} className="text-sm text-brand hover:underline">← {equipment.customer.organization}</Link>}>
        {equipment.deviceModel} <span className="ml-2 align-middle"><Pill tone={warranty ? "green" : "gray"}>{warranty ? `ຮັບປະກັນເຖິງ ${day(equipment.warrantyUntil)}` : `ໝົດຮັບປະກັນ ${day(equipment.warrantyUntil)}`}</Pill></span>
      </AdminTitle>
      <Notice saved={one(sp.saved)} error={one(sp.error)} />
      <div className="max-w-4xl space-y-5">
        <Card title="ນັດບຳລຸງຮັກສາ ແລະ Calibration">
          {equipment.schedules.length === 0 ? <p className="text-sm text-slate-600">ຍັງບໍ່ມີນັດ.</p> : null}
          <ul className="space-y-3">
            {equipment.schedules.map((s) => {
              const overdue = s.isActive && s.nextDueAt < now;
              return (
                <li key={s.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{maintenanceLabel[s.type]} · ທຸກ {s.intervalMonths} ເດືອນ{s.assignedTo ? ` · ${s.assignedTo.name}` : ""}</span>
                    {s.isActive ? <Pill tone={overdue ? "amber" : "blue"}>{overdue ? "ເກີນກຳນົດ " : "ຄົບກຳນົດ "}{day(s.nextDueAt)}</Pill> : <Pill>ຢຸດນັດ</Pill>}
                  </div>
                  {s.records.length > 0 ? <p className="mt-1 text-xs text-slate-500">ເຮັດຫຼ້າສຸດ: {s.records.map((r) => `${day(r.doneAt)}${r.doneBy ? ` (${r.doneBy.name})` : ""}`).join(", ")}</p> : null}
                  <div className="mt-2 flex flex-wrap items-end gap-2">
                    {s.isActive ? (
                      <form action={completeMaintenance} className="flex flex-wrap items-end gap-2">
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="returnTo" value="equipment" />
                        <Input name="doneAt" type="date" defaultValue={dateValue(now)} aria-label="ວັນທີເຮັດ" />
                        <Input name="note" placeholder="ໝາຍເຫດ" aria-label="ໝາຍເຫດ" />
                        <button className={`${buttonClass("green")} mb-px`}>ເຮັດແລ້ວ</button>
                      </form>
                    ) : null}
                    <form action={setScheduleActive}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="active" value={s.isActive ? "0" : "1"} />
                      <button className="text-xs font-medium text-slate-500 hover:underline">{s.isActive ? "ຢຸດນັດນີ້" : "ເປີດນັດນີ້ຄືນ"}</button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
          <form action={addSchedule} className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-5">
            <input type="hidden" name="equipmentId" value={equipment.id} />
            <Field label="ປະເພດ"><Select name="type">{Object.entries(maintenanceLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select></Field>
            <Field label="ທຸກໆ (ເດືອນ)"><Input name="intervalMonths" type="number" min={1} max={120} defaultValue={6} required /></Field>
            <Field label="ຄັ້ງທຳອິດ (ຫວ່າງ = ນັບຈາກມື້ນີ້)"><Input name="nextDueAt" type="date" /></Field>
            <Field label="ຊ່າງ">
              <Select name="assignedToId"><option value="">—</option>{technicians.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Select>
            </Field>
            <div className="self-end"><button className={buttonClass("outline")}>+ ເພີ່ມນັດ</button></div>
          </form>
        </Card>

        <Card title="ປະຫວັດແຈ້ງສ້ອມຂອງເຄື່ອງນີ້">
          {equipment.tickets.length === 0 ? <p className="text-sm text-slate-600">ຍັງບໍ່ມີ. ໃບແຈ້ງສ້ອມທີ່ມີ Serial ກົງກັນຈະຜູກຫາເຄື່ອງນີ້ອັດຕະໂນມັດ.</p> : (
            <ul className="divide-y divide-slate-100 text-sm">
              {equipment.tickets.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span><span className="font-semibold text-brand">{t.ticketNumber}</span> {t.issueDescription.slice(0, 60)}{t.issueDescription.length > 60 ? "…" : ""} <Pill tone={ticketStatus[t.status][1]}>{ticketStatus[t.status][0]}</Pill></span>
                  <span className="text-slate-600">{thDate(t.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <EquipmentForm equipment={equipment} customerId={equipment.customerId} products={products} returnTo={`/admin/equipment/${equipment.id}`} />

        <form action={deleteEquipment}>
          <input type="hidden" name="id" value={equipment.id} />
          <button className="text-sm font-medium text-red-600 hover:underline">ລຶບເຄື່ອງນີ້ອອກຈາກທະບຽນ (ລຶບນັດບຳລຸງຮັກສາທັງໝົດນຳ)</button>
        </form>
      </div>
    </>
  );
}
