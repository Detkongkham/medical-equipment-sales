import { AdminTitle, Card, Check, Notice, one } from "@/components/admin";
import { Field, Input, buttonClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteBrand, saveBrand } from "../actions";

export const metadata = { title: "ຍີ່ຫໍ້" };

function BrandForm({ brand }: { brand?: { id: string; name: string; slug: string; country: string | null; website: string | null; isHouseBrand: boolean } }) {
  return (
    <form action={saveBrand} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_1fr_1.3fr_auto_auto]">
      <input type="hidden" name="id" value={brand?.id ?? ""} />
      <Field label="ຊື່ຍີ່ຫໍ້" required><Input name="name" defaultValue={brand?.name} required /></Field>
      <Field label="Slug"><Input name="slug" defaultValue={brand?.slug} /></Field>
      <Field label="ປະເທດ"><Input name="country" defaultValue={brand?.country ?? ""} /></Field>
      <Field label="ເວັບທາງການ"><Input name="website" type="url" defaultValue={brand?.website ?? ""} placeholder="https://" /></Field>
      <Check name="isHouseBrand" label="ຍີ່ຫໍ້ຂອງບໍລິສັດ" defaultChecked={brand?.isHouseBrand} />
      <button className={buttonClass("primary")}>{brand ? "ບັນທຶກ" : "ເພີ່ມ"}</button>
    </form>
  );
}

export default async function BrandsAdmin({ searchParams }: PageProps<"/admin/brands">) {
  await requireAdmin("SALES");
  const sp = await searchParams;
  const brands = await db.brand.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } });
  return (
    <>
      <AdminTitle>ຍີ່ຫໍ້</AdminTitle>
      <Notice saved={one(sp.saved)} error={one(sp.error)} />
      <Card title="ເພີ່ມຍີ່ຫໍ້" className="mb-6"><BrandForm /></Card>
      <div className="space-y-3">
        {brands.map((b) => (
          <Card key={b.id}>
            <BrandForm brand={b} />
            <form action={deleteBrand} className="mt-2 text-xs text-slate-500">
              <input type="hidden" name="id" value={b.id} />
              {b._count.products} ສິນຄ້າ · <button className="text-red-600 hover:underline">ລຶບ</button>
            </form>
          </Card>
        ))}
      </div>
    </>
  );
}
