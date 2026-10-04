import type { Transporter } from "nodemailer";
import { shareToken } from "./auth";
import { db } from "./db";
import { sendMail } from "./mailer";
import { orderMail, type OrderMailKind } from "./mail-templates";
import { site } from "./site";

// Emails the customer about their order. Best effort: returns false (never throws) when the customer has no email,
// the order is missing, SMTP is not set up or sending fails. `transport` is only for tests.
export async function sendOrderMail(orderId: string, kind: OrderMailKind, transport?: Transporter): Promise<boolean> {
  try {
    const order = await db.order.findUnique({ where: { id: orderId }, include: { customer: true } });
    if (!order?.customer.email) return false;
    const lang = order.lang === "en" ? "en" : "lo";
    const { subject, text } = orderMail(kind, {
      lang,
      orderNumber: order.orderNumber,
      totalLAK: Number(order.totalAmountLAK),
      url: `${site.url}/${lang}/order/${order.orderNumber}?t=${shareToken("order", order.id)}`,
      reason: kind === "slipRejected" || kind === "cancelled" ? (order.adminNote ?? undefined) : undefined,
    });
    return await sendMail({ to: order.customer.email, subject, text }, transport);
  } catch (error) {
    console.error("sendOrderMail failed", error);
    return false;
  }
}
