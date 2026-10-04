import Link from "next/link";
import { AdminTitle, Notice, Pill, one, thDate } from "@/components/admin";
import { ButtonLink } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "ຜົນງານ / ຂ່າວ" };

export default async function PostsAdmin({ searchParams }: PageProps<"/admin/posts">) {
  await requireAdmin("SALES");
  const sp = await searchParams;
  const posts = await db.post.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <AdminTitle actions={<ButtonLink href="/admin/posts/new" variant="green">+ ເພີ່ມໂພສ</ButtonLink>}>ຜົນງານ / ຂ່າວ</AdminTitle>
      <Notice saved={one(sp.saved)} error={one(sp.error)} />
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {posts.map((p) => (
          <Link key={p.id} href={`/admin/posts/${p.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-slate-50">
            <span className="font-medium text-brand">{p.titleLao}</span>
            <span className="flex items-center gap-2 text-xs text-slate-500">
              {p.type === "PROJECT" ? "ຜົນງານ" : "ຂ່າວ"} · {p.publishedAt ? thDate(p.publishedAt) : ""} <Pill tone={p.publishedAt ? "green" : "gray"}>{p.publishedAt ? "ເຜີຍແຜ່" : "ຮ່າງ"}</Pill>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
