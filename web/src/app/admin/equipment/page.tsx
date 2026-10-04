import Link from "next/link";
import { AdminTitle, Notice, Pill, one } from "@/components/admin";
import { Input, buttonClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "ທະບຽນເຄື່ອງ" };

const day = (d: Date) => d.toLocaleDateString("en-GB");

export default async function EquipmentAdmin({ searchParams }: PageProps<"/admin/equipment">) {
  await requireAdmin("SALES", "TECHNICIAN");
  const sp = await searchParams;
  const q = (one(sp.q) ?? "").trim();
  const filter = one(sp.show) === "expiring" ? "expiring" : "all";
  const now = new Date();
  const soon = new Date(now.getTime() + 60 * 86_400_000);
  const equipment = await db.installedEquipment.findMany({
    where: {
      ...(q ? { OR: [{ deviceModel: { contains: q, mode: "insensitive" } }, { serialNumber: { contains: q, mode: "insensitive" } }, { customer: { organization: { contains: q, mode: "insensitive" } } }] } : {}),
      ...(filter === "expiring" ? { warrantyUntil: { gte: now, lte: soon } } : {}),
    },
    orderBy: filter === "expiring" ? { warrantyUntil: "asc" } : { installedAt: "desc" },
    take: 200,
    include: { customer: { select: { id: true, organization: true } } },
  });
  return (
    <>
      <AdminTitle>ທະບຽນເຄື່ອງທີ່ຕິດຕັ້ງ</AdminTitle>
      <Notice saved={one(sp.saved)} error={one(sp.error)} />
      <form className="mb-4 flex flex-wrap items-center gap-2" role="search">
        <div className="w-full max-w-md"><Input name="q" defaultValue={q} placeholder="ຄົ້ນຫາຕາມລຸ້ນ, Serial, ອົງກອນ" aria-label="ຄົ້ນຫາ" /></div>
        <select name="show" defaultValue={filter} aria-label="ກອງ" className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
          <option value="all">ທັງໝົດ</option>
          <option value="expiring">ໝົດຮັບປະກັນໃນ 60 ວັນ</option>
        </select>
        <button className={`${buttonClass("primary")} mt-1`}>ຄົ້ນຫາ</button>
      </form>
      <p className="mb-3 text-sm text-slate-600">ເພີ່ມເຄື່ອງໃໝ່ຈາກໜ້າລູກຄ້າ: <Link href="/admin/customers" className="text-brand hover:underline">ເລືອກລູກຄ້າ</Link> → “ເພີ່ມເຄື່ອງທີ່ຕິດຕັ້ງ”.</p>
      {equipment.length === 0 ? <p className="text-slate-600">ບໍ່ມີລາຍການ.</p> : null}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[44rem] text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr><th className="px-3 py-2 font-medium">ເຄື່ອງ</th><th className="px-3 py-2 font-medium">ລູກຄ້າ</th><th className="px-3 py-2 font-medium">ຕິດຕັ້ງ</th><th className="px-3 py-2 font-medium">ການຮັບປະກັນ</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {equipment.map((e) => (
              <tr key={e.id}>
                <td className="px-3 py-2"><Link href={`/admin/equipment/${e.id}`} className="font-medium text-brand hover:underline">{e.deviceModel}</Link>{e.serialNumber ? <span className="block text-xs text-slate-500">S/N {e.serialNumber}</span> : null}</td>
                <td className="px-3 py-2"><Link href={`/admin/customers/${e.customer.id}`} className="hover:underline">{e.customer.organization}</Link></td>
                <td className="px-3 py-2 text-slate-600">{day(e.installedAt)}</td>
                <td className="px-3 py-2"><Pill tone={e.warrantyUntil < now ? "gray" : e.warrantyUntil <= soon ? "amber" : "green"}>{e.warrantyUntil < now ? `ໝົດ ${day(e.warrantyUntil)}` : `ເຖິງ ${day(e.warrantyUntil)}`}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
