import { notFound } from "next/navigation";
import { AdminTitle, Notice, one } from "@/components/admin";
import { PostForm } from "@/components/PostForm";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "ແກ້ໄຂໂພສ" };

export default async function EditPost({ params, searchParams }: PageProps<"/admin/posts/[id]">) {
  await requireAdmin("SALES");
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [post, products] = await Promise.all([
    db.post.findUnique({ where: { id }, include: { products: { select: { id: true } } } }),
    db.product.findMany({ select: { id: true, titleLao: true, sku: true }, orderBy: { sku: "asc" } }),
  ]);
  if (!post) notFound();
  return (
    <>
      <AdminTitle>{post.titleLao}</AdminTitle>
      <Notice saved={one(sp.saved)} error={one(sp.error)} />
      <PostForm key={post.id + (sp.saved ?? "")} post={post} products={products} />
    </>
  );
}
