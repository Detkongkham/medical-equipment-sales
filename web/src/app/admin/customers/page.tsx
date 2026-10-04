import Link from "next/link";
import { AdminTitle, Notice, customerType, one } from "@/components/admin";
import { Input, buttonClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "ລູກຄ້າ" };

export default async function CustomersAdmin({ searchParams }: PageProps<"/admin/customers">) {
  await requireAdmin("SALES", "TECHNICIAN");
  const sp = await searchParams;
  const q = (one(sp.q) ?? "").trim();
  const customers = await db.customer.findMany({
    where: q ? { OR: [{ organization: { contains: q, mode: "insensitive" } }, { contactName: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { quotations: true, serviceTickets: true, equipment: true } } },
  });
  return (
    <>
      <AdminTitle>ລູກຄ້າ (CRM)</AdminTitle>
      <Notice saved={one(sp.saved)} error={one(sp.error)} />
      <form className="mb-4 flex max-w-xl gap-2" role="search">
        <Input name="q" defaultValue={q} placeholder="ຄົ້ນຫາຕາມຊື່ອົງກອນ, ຜູ້ຕິດຕໍ່, ເບີໂທ" aria-label="ຄົ້ນຫາ" />
        <button className={`${buttonClass("primary")} mt-1`}>ຄົ້ນຫາ</button>
      </form>
      {customers.length === 0 ? <p className="text-slate-600">{q ? "ບໍ່ພົບລູກຄ້າ." : "ຍັງບໍ່ມີລູກຄ້າ. ລູກຄ້າຈະຖືກສ້າງອັດຕະໂນມັດເມື່ອມີຄຳຂໍລາຄາ ຫຼື ແຈ້ງສ້ອມ."}</p> : null}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr><th className="px-3 py-2 font-medium">ອົງກອນ</th><th className="px-3 py-2 font-medium">ຜູ້ຕິດຕໍ່</th><th className="px-3 py-2 text-center font-medium">ໃບສະເໜີ</th><th className="px-3 py-2 text-center font-medium">ແຈ້ງສ້ອມ</th><th className="px-3 py-2 text-center font-medium">ເຄື່ອງ</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="px-3 py-2"><Link href={`/admin/customers/${c.id}`} className="font-medium text-brand hover:underline">{c.organization}</Link> <span className="text-xs text-slate-500">{customerType[c.type]}</span></td>
                <td className="px-3 py-2 text-slate-600">{c.contactName} · {c.phone}</td>
                <td className="px-3 py-2 text-center">{c._count.quotations}</td>
                <td className="px-3 py-2 text-center">{c._count.serviceTickets}</td>
                <td className="px-3 py-2 text-center">{c._count.equipment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
