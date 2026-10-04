import { AdminTitle, Card, Notice, Pill, one } from "@/components/admin";
import { Field, Input, Select, buttonClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { dateValue } from "@/lib/form";
import { releaseExpiredOrders } from "@/lib/shop";
import { addLot, deleteLot, setLotQuantity } from "../shop-actions";

export const metadata = { title: "ສະຕັອກ / Lot" };

const SOON_DAYS = 90;
const small = "rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm";

export default async function StockAdmin({ searchParams }: PageProps<"/admin/stock">) {
  await requireAdmin("SALES");
  const sp = await searchParams;
  await releaseExpiredOrders();
  const [products, lots] = await Promise.all([
    db.product.findMany({ where: { salesMode: "DIRECT_BUY" }, orderBy: { sku: "asc" }, include: { variants: { orderBy: { sku: "asc" } } } }),
    db.stockLot.findMany({
      orderBy: [{ expiryDate: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
      include: { product: { select: { titleLao: true, sku: true } }, variant: { select: { nameLao: true } }, _count: { select: { allocations: true } } },
    }),
  ]);
  const now = new Date();
  const soon = new Date(now.getTime() + SOON_DAYS * 86_400_000);
  const targets = products.flatMap((p) =>
    p.variants.length > 0
      ? p.variants.map((v): [string, string] => [`${p.id}:${v.id}`, `${p.titleLao} – ${v.nameLao} (${v.sku})`])
      : [[p.id, `${p.titleLao} (${p.sku})`] as [string, string]],
  );
  const expiringCount = lots.filter((l) => l.quantity > 0 && l.expiryDate && l.expiryDate <= soon).length;

  return (
    <>
      <AdminTitle>ສະຕັອກ / Lot</AdminTitle>
      <Notice saved={one(sp.saved)} error={one(sp.error)} />
      <p className="mb-4 max-w-3xl text-sm text-slate-600">
        ຈຳນວນຄົງເຫຼືອ ຄືຈຳນວນທີ່ຍັງຂາຍໄດ້: ຫັກອອກທັນທີທີ່ລູກຄ້າສັ່ງ (ຈອງ 48 ຊົ່ວໂມງ) ແລະ ຄືນໃຫ້ເມື່ອຍົກເລີກ. ລະບົບຂາຍ Lot ທີ່ໝົດອາຍຸກ່ອນ (FEFO) ແລະ ບໍ່ຂາຍ Lot ທີ່ໝົດອາຍຸແລ້ວ.
        {expiringCount > 0 ? <strong className="text-amber-800"> ມີ {expiringCount} Lot ທີ່ໝົດອາຍຸໃນ {SOON_DAYS} ວັນ.</strong> : null}
      </p>

      <Card title="ຮັບເຂົ້າ Lot ໃໝ່" className="mb-6 max-w-4xl">
        {targets.length === 0 ? (
          <p className="text-sm text-slate-600">ຍັງບໍ່ມີສິນຄ້າທີ່ຕັ້ງເປັນ “ຊື້ອອນລາຍໄດ້”. ໄປທີ່ໜ້າແກ້ໄຂສິນຄ້າ ແລ້ວເລືອກວິທີຂາຍ.</p>
        ) : (
          <form action={addLot} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="ສິນຄ້າ / ຕົວເລືອກ" required>
                <Select name="target" required defaultValue="">
                  <option value="" disabled>ເລືອກ</option>
                  {targets.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="ເລກ Lot" required><Input name="lotNumber" required maxLength={60} /></Field>
            <Field label="ວັນໝົດອາຍຸ"><Input name="expiryDate" type="date" /></Field>
            <Field label="ຈຳນວນ" required><Input name="quantity" type="number" min={1} required inputMode="numeric" /></Field>
            <div className="sm:col-span-2 lg:col-span-3"><Field label="ໝາຍເຫດ"><Input name="notes" maxLength={300} /></Field></div>
            <div><button className={buttonClass("green")}>ບັນທຶກ Lot</button></div>
          </form>
        )}
      </Card>

      {lots.length === 0 ? <p className="text-slate-600">ຍັງບໍ່ມີ Lot.</p> : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr><th className="px-3 py-2">ສິນຄ້າ</th><th className="px-3 py-2">Lot</th><th className="px-3 py-2">ໝົດອາຍຸ</th><th className="px-3 py-2">ຮັບເຂົ້າ</th><th className="px-3 py-2">ຄົງເຫຼືອ</th><th className="px-3 py-2" /></tr>
            </thead>
            <tbody>
              {lots.map((lot) => {
                const expired = lot.expiryDate != null && lot.expiryDate <= now;
                const expiring = !expired && lot.expiryDate != null && lot.expiryDate <= soon;
                return (
                  <tr key={lot.id} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2"><p className="font-medium">{lot.product.titleLao}</p><p className="text-xs text-slate-500">{lot.variant?.nameLao ?? lot.product.sku}</p></td>
                    <td className="px-3 py-2 font-mono">{lot.lotNumber}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {lot.expiryDate ? dateValue(lot.expiryDate) : "–"}{" "}
                      {expired ? <Pill tone="amber">ໝົດອາຍຸ</Pill> : expiring ? <Pill tone="amber">ໃກ້ໝົດ</Pill> : null}
                    </td>
                    <td className="px-3 py-2">{lot.receivedQty}</td>
                    <td className="px-3 py-2">
                      <form action={setLotQuantity} className="flex gap-1">
                        <input type="hidden" name="id" value={lot.id} />
                        <input name="quantity" type="number" min={0} defaultValue={lot.quantity} aria-label="ຈຳນວນຄົງເຫຼືອ" className={`${small} w-24`} />
                        <button className="text-sm font-medium text-brand hover:underline">ແກ້ຈຳນວນ</button>
                      </form>
                    </td>
                    <td className="px-3 py-2">
                      {lot._count.allocations === 0 ? (
                        <form action={deleteLot}><input type="hidden" name="id" value={lot.id} /><button className="text-sm text-red-600 hover:underline">ລຶບ</button></form>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
