import Link from "next/link";
import { AdminTitle, Card, Check, Notice, one } from "@/components/admin";
import { buttonClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getShowPrices } from "@/lib/pricing";
import { setShowPrices } from "./actions";

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000);

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const user = await requireAdmin();
  const sp = await searchParams;
  const [newQuotes, openTickets, applicants, products, priced, showPrices] = await Promise.all([
    db.quotation.count({ where: { status: "PENDING" } }),
    db.serviceTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS", "WAITING_PARTS"] } } }),
    db.jobApplicant.count({ where: { createdAt: { gte: daysAgo(30) } } }),
    db.product.count({ where: { isPublished: true } }),
    db.product.count({ where: { OR: [{ priceLAK: { not: null } }, { variants: { some: { priceLAK: { not: null } } } }] } }),
    getShowPrices(),
  ]);
  const tiles = [
    { href: "/admin/quotes", label: "ຄຳຂໍລາຄາໃໝ່", value: newQuotes },
    { href: "/admin/tickets", label: "ແຈ້ງສ້ອມທີ່ຍັງເປີດ", value: openTickets },
    { href: "/admin/applicants", label: "ຜູ້ສະໝັກງານ (30 ວັນ)", value: applicants },
    { href: "/admin/products", label: "ສິນຄ້າທີ່ເຜີຍແຜ່", value: products },
  ];
  return (
    <>
      <AdminTitle>ສະບາຍດີ, {user.name}</AdminTitle>
      <Notice saved={one(sp.saved)} error={one(sp.error)} denied={one(sp.denied)} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Link key={tile.href} href={tile.href} className="rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md">
            <p className="text-3xl font-bold text-brand">{tile.value}</p>
            <p className="mt-1 text-sm text-slate-600">{tile.label}</p>
          </Link>
        ))}
      </div>

      {user.role === "ADMIN" ? (
        <Card title="ການສະແດງລາຄາໃນເວັບ" className="mt-6 max-w-2xl">
          <form action={setShowPrices} className="space-y-3">
            <Check
              name="showPrices"
              defaultChecked={showPrices}
              label="ສະແດງລາຄາໃນເວັບໄຊທ໌"
              hint="ປິດ = ທຸກໜ້າສະແດງ “ຂໍລາຄາ”. ເປີດ = ສະແດງສະເພາະສິນຄ້າທີ່ໃສ່ລາຄາ ແລະ ບໍ່ໄດ້ປິດລາຄາຂອງສິນຄ້ານັ້ນ."
            />
            <p className="text-sm text-slate-600">ມີ {priced} ລາຍການທີ່ໃສ່ລາຄາແລ້ວ. ລາຄາແກ້ຢູ່ໃນໜ້າແກ້ໄຂສິນຄ້າແຕ່ລະອັນ.</p>
            {showPrices ? <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">ລາຄາກຳລັງສະແດງຕໍ່ສາທາລະນະ. ກວດໃຫ້ແນ່ໃຈວ່າບໍ່ແມ່ນລາຄາຕົວຢ່າງ.</p> : null}
            <button className={buttonClass("primary")}>ບັນທຶກ</button>
          </form>
        </Card>
      ) : null}
    </>
  );
}
