import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SlipForm } from "@/components/SlipForm";
import { Container, PageTitle } from "@/components/ui";
import { validShareToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDictionary, isLocale } from "@/lib/i18n";
import { formatLAK } from "@/lib/pricing";
import { getPaymentInfo, releaseExpiredOrders } from "@/lib/shop";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function OrderPage({ params, searchParams }: PageProps<"/[lang]/order/[number]">) {
  const { lang, number } = await params;
  const sp = await searchParams;
  const token = typeof sp.t === "string" ? sp.t : "";
  if (!isLocale(lang)) notFound();
  await releaseExpiredOrders();
  const order = await db.order.findUnique({ where: { orderNumber: number }, include: { items: true } });
  // The token is the only proof of ownership, so a wrong one looks the same as a missing order.
  if (!order || !validShareToken("order", order.id, token)) notFound();
  const t = getDictionary(lang).shop;
  const pay = await getPaymentInfo();
  const when = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Vientiane" });
  const awaiting = order.status === "PENDING_PAYMENT";
  const status = {
    PENDING_PAYMENT: null, PAYMENT_REVIEW: t.order.review, PAID: t.order.paid, FULFILLED: t.order.fulfilled, CANCELLED: t.order.cancelled,
  }[order.status];

  return (
    <Container className="max-w-3xl py-8">
      <PageTitle intro={t.order.keepLink}>{t.order.title} {order.orderNumber}</PageTitle>

      <p className="mb-4 inline-block rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">{t.order.status[order.status]}</p>
      {status ? <p role="status" className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">{status}{order.status === "CANCELLED" && order.adminNote ? ` ${order.adminNote}` : ""}</p> : null}
      {awaiting && order.adminNote ? <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{t.order.rejected} {order.adminNote}</p> : null}

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-2 font-bold text-brand">{t.order.items}</h2>
        <ul className="divide-y divide-slate-100 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 py-2">
              <span>{item.title} <span className="text-slate-500">× {item.quantity}</span></span>
              <span className="whitespace-nowrap font-medium">{formatLAK(Number(item.unitPrice) * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-lg font-bold text-brand"><span>{t.order.total}</span><span>{formatLAK(order.totalAmountLAK)}</span></p>
        <p className="mt-3 text-sm text-slate-600">{t.order.delivery}: {order.deliveryAddress}</p>
      </section>

      {awaiting || order.status === "PAYMENT_REVIEW" ? (
        <>
          {awaiting ? (
            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 font-bold text-brand">{t.order.payTitle}</h2>
              <p className="text-sm text-slate-600">{t.order.payAmount}</p>
              <p className="text-2xl font-bold text-brand">{formatLAK(order.totalAmountLAK)}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {pay.qrImage && order.paymentMethod === "LAO_QR" ? (
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700">{t.order.scanQr}</p>
                    <Image src={pay.qrImage} alt="LAO QR" width={240} height={240} unoptimized className="h-auto w-60 rounded-lg border border-slate-200" />
                  </div>
                ) : null}
                {pay.accountNumber && (order.paymentMethod === "BANK_TRANSFER" || !pay.qrImage) ? (
                  <dl className="text-sm">
                    {pay.bankName ? <><dt className="text-slate-500">{t.order.bank}</dt><dd className="mb-2 font-medium">{pay.bankName}</dd></> : null}
                    <dt className="text-slate-500">{t.order.accountName}</dt><dd className="mb-2 font-medium">{pay.accountName}</dd>
                    <dt className="text-slate-500">{t.order.accountNumber}</dt><dd className="font-mono text-lg font-bold">{pay.accountNumber}</dd>
                  </dl>
                ) : null}
              </div>
              <p className="mt-4 text-sm text-slate-700">{t.order.reference} <strong>{order.orderNumber}</strong></p>
              {pay.note ? <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{pay.note}</p> : null}
              <p className="mt-2 text-sm text-amber-800">{t.order.deadline}: {when.format(order.expiresAt)}</p>
            </section>
          ) : null}
          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 font-bold text-brand">{t.order.uploadTitle}</h2>
            <SlipForm t={t.order} number={order.orderNumber} token={token} />
          </section>
        </>
      ) : null}

      <p className="mt-6 text-sm text-slate-600">{t.order.help} <a href={`tel:${site.hotline.tel}`} className="font-semibold text-brand hover:underline">{site.hotline.label}</a></p>
    </Container>
  );
}
