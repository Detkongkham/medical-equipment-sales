import { AdminTitle, Notice, one } from "@/components/admin";
import { ProductForm } from "@/components/ProductForm";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "ເພີ່ມສິນຄ້າ" };

export default async function NewProduct({ searchParams }: PageProps<"/admin/products/new">) {
  await requireAdmin("SALES");
  const sp = await searchParams;
  const [categories, brands, others] = await Promise.all([
    db.category.findMany({ orderBy: [{ sortOrder: "asc" }] }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
    db.product.findMany({ select: { id: true, titleLao: true, sku: true }, orderBy: { sku: "asc" } }),
  ]);
  return (
    <>
      <AdminTitle>ເພີ່ມສິນຄ້າ</AdminTitle>
      <Notice error={one(sp.error)} />
      <ProductForm categories={sortTree(categories)} brands={brands} others={others} />
    </>
  );
}

function sortTree<T extends { id: string; parentId: string | null }>(items: T[]): T[] {
  return items.filter((c) => !c.parentId).flatMap((parent) => [parent, ...items.filter((c) => c.parentId === parent.id)]);
}
