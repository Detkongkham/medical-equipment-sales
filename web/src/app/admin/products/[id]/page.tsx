import { notFound } from "next/navigation";
import { AdminTitle, Notice, one } from "@/components/admin";
import { ProductForm } from "@/components/ProductForm";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "ແກ້ໄຂສິນຄ້າ" };

export default async function EditProduct({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  await requireAdmin("SALES");
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [product, categories, brands, others] = await Promise.all([
    db.product.findUnique({ where: { id }, include: { variants: { orderBy: { sku: "asc" } }, relatedFrom: { select: { type: true, to: { select: { id: true } } } }, relatedTo: { select: { type: true, from: { select: { id: true } } } } } }),
    db.category.findMany({ orderBy: [{ sortOrder: "asc" }] }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
    db.product.findMany({ where: { NOT: { id } }, select: { id: true, titleLao: true, sku: true }, orderBy: { sku: "asc" } }),
  ]);
  if (!product) notFound();
  const parents = categories.filter((c) => !c.parentId);
  const ordered = parents.flatMap((p) => [p, ...categories.filter((c) => c.parentId === p.id)]);
  return (
    <>
      <AdminTitle>{product.titleLao}</AdminTitle>
      <Notice saved={one(sp.saved)} error={one(sp.error)} />
      <ProductForm key={product.updatedAt.toISOString()} product={product} categories={ordered} brands={brands} others={others} />
    </>
  );
}
