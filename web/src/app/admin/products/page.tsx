import Link from "next/link";
import { AdminTitle, Notice, Pill, one } from "@/components/admin";
import { ButtonLink } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatLAK } from "@/lib/pricing";

export const metadata = { title: "ສິນຄ້າ" };

export default async function ProductsAdmin({ searchParams }: PageProps<"/admin/products">) {
  await requireAdmin("SALES");
  const sp = await searchParams;
  const q = (one(sp.q) ?? "").trim().slice(0, 80);
  const products = await db.product.findMany({
    where: q ? { OR: [{ titleLao: { contains: q, mode: "insensitive" } }, { titleEng: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }, { modelNumber: { contains: q, mode: "insensitive" } }] } : {},
    include: { category: true, brand: true, variants: { select: { priceLAK: true } } },
    orderBy: [{ category: { sortOrder: "asc" } }, { sku: "asc" }],
  });
  return (
    <>
      <AdminTitle actions={<ButtonLink href="/admin/products/new" variant="green">+ ເພີ່ມສິນຄ້າ</ButtonLink>}>ສິນຄ້າ ({products.length})</AdminTitle>
      <Notice saved={one(sp.saved)} error={one(sp.error)} />
      <form className="mb-4 flex gap-2">
        <input name="q" defaultValue={q} placeholder="ຄົ້ນຫາຊື່, ລຸ້ນ ຫຼື ລະຫັດ" className="w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
        <button className="rounded-lg border border-brand px-4 text-sm font-semibold text-brand hover:bg-brand/5">ຄົ້ນຫາ</button>
      </form>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr><th className="px-3 py-2">ສິນຄ້າ</th><th className="px-3 py-2">ໝວດ / ຍີ່ຫໍ້</th><th className="px-3 py-2">ລາຄາ</th><th className="px-3 py-2">ສະຖານະ</th></tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const prices = [p.priceLAK, ...p.variants.map((v) => v.priceLAK)].filter((x) => x != null).map(Number);
              return (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <Link href={`/admin/products/${p.id}`} className="font-medium text-brand hover:underline">{p.titleLao}</Link>
                    <p className="text-xs text-slate-500">{p.sku}{p.modelNumber ? ` · ${p.modelNumber}` : ""}</p>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{p.category.nameLao}{p.brand ? ` / ${p.brand.name}` : ""}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {prices.length ? <>{prices.length > 1 ? "ເລີ່ມ " : ""}{formatLAK(Math.min(...prices))}{p.showPrice ? "" : " (ປິດ)"}</> : <span className="text-slate-400">ຂໍລາຄາ</span>}
                  </td>
                  <td className="space-x-1 px-3 py-2">
                    <Pill tone={p.isPublished ? "green" : "gray"}>{p.isPublished ? "ເຜີຍແຜ່" : "ຮ່າງ"}</Pill>
                    {p.stockStatus === "IN_STOCK" ? <Pill tone="blue">ພ້ອມສົ່ງ</Pill> : null}
                    {p.salesMode === "DIRECT_BUY" ? <Pill tone="indigo">ຊື້ອອນລາຍ</Pill> : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
