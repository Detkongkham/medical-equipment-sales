import { AdminTitle, Notice, one } from "@/components/admin";
import { PostForm } from "@/components/PostForm";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "ເພີ່ມໂພສ" };

export default async function NewPost({ searchParams }: PageProps<"/admin/posts/new">) {
  await requireAdmin("SALES");
  const sp = await searchParams;
  const products = await db.product.findMany({ select: { id: true, titleLao: true, sku: true }, orderBy: { sku: "asc" } });
  return (
    <>
      <AdminTitle>ເພີ່ມໂພສ</AdminTitle>
      <Notice error={one(sp.error)} />
      <PostForm products={products} />
    </>
  );
}
