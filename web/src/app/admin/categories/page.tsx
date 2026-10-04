import { AdminTitle, Card, Notice, one } from "@/components/admin";
import { Field, Input, Select, buttonClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteCategory, saveCategory } from "../actions";

export const metadata = { title: "ໝວດໝູ່" };

type Cat = { id: string; slug: string; nameLao: string; nameEng: string; parentId: string | null; sortOrder: number };

function CategoryForm({ category, parents }: { category?: Cat; parents: Cat[] }) {
  return (
    <form action={saveCategory} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_1fr_1fr_5rem_auto]">
      <input type="hidden" name="id" value={category?.id ?? ""} />
      <Field label="ຊື່ (ລາວ)" required><Input name="nameLao" defaultValue={category?.nameLao} required /></Field>
      <Field label="Name (English)" required><Input name="nameEng" defaultValue={category?.nameEng} required /></Field>
      <Field label="Slug"><Input name="slug" defaultValue={category?.slug} /></Field>
      <Field label="ໝວດແມ່">
        <Select name="parentId" defaultValue={category?.parentId ?? ""}>
          <option value="">– ໝວດຫຼັກ –</option>
          {parents.filter((p) => p.id !== category?.id).map((p) => <option key={p.id} value={p.id}>{p.nameLao}</option>)}
        </Select>
      </Field>
      <Field label="ລຳດັບ"><Input name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} /></Field>
      <button className={buttonClass("primary")}>{category ? "ບັນທຶກ" : "ເພີ່ມ"}</button>
    </form>
  );
}

export default async function CategoriesAdmin({ searchParams }: PageProps<"/admin/categories">) {
  await requireAdmin("SALES");
  const sp = await searchParams;
  const categories = await db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } });
  const top = categories.filter((c) => !c.parentId);
  const ordered = top.flatMap((p) => [p, ...categories.filter((c) => c.parentId === p.id)]);
  return (
    <>
      <AdminTitle>ໝວດໝູ່</AdminTitle>
      <Notice saved={one(sp.saved)} error={one(sp.error)} />
      <Card title="ເພີ່ມໝວດ" className="mb-6"><CategoryForm parents={top} /></Card>
      <div className="space-y-3">
        {ordered.map((c) => (
          <Card key={c.id} className={c.parentId ? "ml-4 sm:ml-8" : ""}>
            <CategoryForm category={c} parents={top} />
            <form action={deleteCategory} className="mt-2 text-xs text-slate-500">
              <input type="hidden" name="id" value={c.id} />
              {c._count.products} ສິນຄ້າ · <button className="text-red-600 hover:underline">ລຶບ</button>
            </form>
          </Card>
        ))}
      </div>
    </>
  );
}
