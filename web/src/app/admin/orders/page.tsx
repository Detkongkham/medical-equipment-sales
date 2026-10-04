import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { AdminTitle, Card, Notice, Pill, customerType, one, orderStatus, thDate } from "@/components/admin";
import { Field, Input, Textarea, buttonClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatLAK } from "@/lib/pricing";
import { getPaymentInfo, paymentReady, releaseExpiredOrders } from "@/lib/shop";
import { cancelOrderAction, confirmPayment, markFulfilled, rejectSlip, savePaymentInfo } from "../shop-actions";

export const metadata = { title: "ຄຳສັ່ງຊື້ ແລະ ຊຳລະເງິນ" };

const small = "rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm";
const methodLabel = { LAO_QR: "LAO QR", BANK_TRANSFER: "ໂອນທະນາຄານ" } as const;

export default async function OrdersAdmin({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin("SALES");
  const sp = await searchParams;
  await releaseExpiredOrders();
  const filter = Object.values(OrderStatus).find((s) => s === one(sp.status));
  const [orders, pay, counts] = await Promise.all([
    db.order.findMany({
      where: filter ? { status: filter } : {},
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { customer: true, items: { include: { allocations: { include: { lot: true } } } } },
    }),
    getPaymentInfo(),
    db.order.groupBy({ by: ["status"], _count: true }),
  ]);
  const countOf = (s: OrderStatus) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <>
      <AdminTitle>ຄຳສັ່ງຊື້ ແລະ ຊຳລະເງິນ</AdminTitle>
      <Notice saved={one(sp.saved)} error={one(sp.error)} />

      {!paymentReady(pay) ? (
        <p role="alert" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          ຍັງບໍ່ໄດ້ຕັ້ງບັນຊີຮັບເງິນ. ເວັບຈະບໍ່ເປີດຮັບຄຳສັ່ງຊື້ ຈົນກວ່າຈະໃສ່ເລກບັນຊີ ຫຼື ຮູບ LAO QR ດ້ານລຸ່ມ.
        </p>
      ) : null}

      <nav className="mb-4 flex flex-wrap gap-2 text-sm" aria-label="ກອງຕາມສະຖານະ">
        <Link href="/admin/orders" className={`rounded-full border px-3 py-1 ${filter ? "border-slate-300 text-slate-700" : "border-brand bg-brand text-white"}`}>ທັງໝົດ</Link>
        {Object.values(OrderStatus).map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={`rounded-full border px-3 py-1 ${filter === s ? "border-brand bg-brand text-white" : "border-slate-300 text-slate-700"}`}>
            {orderStatus[s][0]} ({countOf(s)})
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? <p className="text-slate-600">ຍັງບໍ່ມີຄຳສັ່ງຊື້.</p> : null}
      <div className="space-y-4">
        {orders.map((o) => {
          const [label, tone] = orderStatus[o.status];
          return (
            <article key={o.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-bold text-brand">{o.orderNumber} <span className="ml-2 align-middle"><Pill tone={tone}>{label}</Pill></span></h2>
                <span className="text-xs text-slate-500">{thDate(o.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">
                <Link href={`/admin/customers/${o.customer.id}`} className="font-medium text-brand hover:underline">{o.customer.organization}</Link> ({customerType[o.customer.type]}) · {o.customer.contactName} · <a className="text-brand hover:underline" href={`tel:${o.customer.phone}`}>{o.customer.phone}</a>
              </p>
              <p className="mt-1 text-sm text-slate-600">ຈັດສົ່ງ: {o.deliveryAddress}</p>
              {o.note ? <p className="mt-1 text-sm text-slate-600">ໝາຍເຫດ: {o.note}</p> : null}

              <ul className="mt-3 divide-y divide-slate-100 text-sm">
                {o.items.map((item) => (
                  <li key={item.id} className="py-2">
                    <div className="flex justify-between gap-3">
                      <span>{item.title} <span className="text-slate-500">× {item.quantity}</span></span>
                      <span className="whitespace-nowrap">{formatLAK(Number(item.unitPrice) * item.quantity)}</span>
                    </div>
                    {item.allocations.length > 0 ? (
                      <p className="text-xs text-slate-500">Lot: {item.allocations.map((a) => `${a.lot.lotNumber} (${a.quantity}${a.lot.expiryDate ? `, exp ${a.lot.expiryDate.toLocaleDateString("en-GB")}` : ""})`).join(" · ")}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
              <p className="mt-2 flex flex-wrap justify-between gap-2 border-t border-slate-200 pt-2 text-sm">
                <span>{methodLabel[o.paymentMethod]}{o.status === "PENDING_PAYMENT" ? ` · ໝົດເວລາ ${thDate(o.expiresAt)}` : ""}</span>
                <strong className="text-brand">{formatLAK(o.totalAmountLAK)}</strong>
              </p>
              {o.adminNote ? <p className="mt-1 text-sm text-amber-800">ບັນທຶກ: {o.adminNote}</p> : null}
              {o.slipUrls.length > 0 ? (
                <p className="mt-1 text-sm">ສະລິບ: {o.slipUrls.map((url, i) => <a key={url} target="_blank" className="mr-3 text-brand hover:underline" href={`/admin/download?f=${encodeURIComponent(url)}`}>ໄຟລ໌ {i + 1}</a>)}{o.slipUploadedAt ? <span className="text-xs text-slate-500">({thDate(o.slipUploadedAt)})</span> : null}</p>
              ) : null}

              {o.status === "PENDING_PAYMENT" || o.status === "PAYMENT_REVIEW" || o.status === "PAID" ? (
                <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-3">
                  {o.status !== "PAID" ? (
                    <form action={confirmPayment}>
                      <input type="hidden" name="id" value={o.id} />
                      <button className={buttonClass("green")}>ຢືນຢັນການຊຳລະ</button>
                    </form>
                  ) : (
                    <form action={markFulfilled}>
                      <input type="hidden" name="id" value={o.id} />
                      <button className={buttonClass("primary")}>ສົ່ງມອບແລ້ວ</button>
                    </form>
                  )}
                  {o.status === "PAYMENT_REVIEW" ? (
                    <form action={rejectSlip} className="flex gap-2">
                      <input type="hidden" name="id" value={o.id} />
                      <input name="reason" required maxLength={300} placeholder="ເຫດຜົນທີ່ສະລິບບໍ່ຜ່ານ" className={`${small} w-56`} />
                      <button className={buttonClass("outline")}>ສະລິບບໍ່ຜ່ານ</button>
                    </form>
                  ) : null}
                  <form action={cancelOrderAction} className="flex gap-2">
                    <input type="hidden" name="id" value={o.id} />
                    <input name="reason" maxLength={300} placeholder="ເຫດຜົນຍົກເລີກ (ຖ້າມີ)" className={`${small} w-48`} />
                    <button className="text-sm font-medium text-red-600 hover:underline">ຍົກເລີກ + ຄືນສະຕັອກ</button>
                  </form>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <Card title="ບັນຊີຮັບເງິນ (ສະແດງໃຫ້ລູກຄ້າຫຼັງສັ່ງຊື້)" className="mt-8 max-w-3xl">
        <form action={savePaymentInfo} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ຊື່ທະນາຄານ"><Input name="bankName" defaultValue={pay.bankName} maxLength={120} /></Field>
            <Field label="ຊື່ບັນຊີ"><Input name="accountName" defaultValue={pay.accountName} maxLength={120} /></Field>
            <Field label="ເລກບັນຊີ"><Input name="accountNumber" defaultValue={pay.accountNumber} maxLength={60} inputMode="numeric" /></Field>
            <Field label="ຮູບ LAO QR (JPG, PNG, WebP)"><input type="file" name="qrFile" accept="image/jpeg,image/png,image/webp" className="mt-1 block w-full text-sm" /></Field>
          </div>
          {pay.qrImage ? (
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of a local upload */}
              <img src={pay.qrImage} alt="LAO QR" className="h-24 w-24 rounded-lg border border-slate-200 object-contain" />
              <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" name="removeQr" className="h-4 w-4" /> ລຶບຮູບ QR ປັດຈຸບັນ</label>
            </div>
          ) : null}
          <Field label="ຂໍ້ຄວາມເພີ່ມເຕີມທີ່ສະແດງໃຫ້ລູກຄ້າ (ຄ່າສົ່ງ, ເວລາຈັດສົ່ງ...)"><Textarea name="note" rows={3} defaultValue={pay.note} maxLength={500} /></Field>
          <button className={buttonClass("primary")}>ບັນທຶກ</button>
        </form>
      </Card>
    </>
  );
}
