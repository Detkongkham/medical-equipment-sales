import { formatLAK } from "./pricing";
import { site } from "./site";

export type OrderMailKind = "received" | "paid" | "slipRejected" | "fulfilled" | "cancelled";
type Lang = "lo" | "en";
type Ctx = { lang: Lang; orderNumber: string; totalLAK: number; url: string; reason?: string };

const company = { lo: site.nameLao, en: site.nameEng };

// subject + opening line per kind; the common footer (order number, total, link, company) is added in orderMail
const copy: Record<Lang, Record<OrderMailKind, { subject: (n: string) => string; body: string; reason?: string }>> = {
  lo: {
    received: { subject: (n) => `ໄດ້ຮັບຄຳສັ່ງຊື້ ${n}`, body: "ຂອບໃຈທີ່ສັ່ງຊື້. ກະລຸນາຊຳລະເງິນ ແລະ ອັບໂຫຼດສະລິບໂອນເງິນຜ່ານລິ້ງດ້ານລຸ່ມ ພາຍໃນ 48 ຊົ່ວໂມງ ຖ້າບໍ່ດັ່ງນັ້ນຄຳສັ່ງຊື້ຈະຖືກຍົກເລີກອັດຕະໂນມັດ." },
    paid: { subject: (n) => `ຢືນຢັນການຊຳລະ ${n}`, body: "ເຮົາໄດ້ຮັບການຊຳລະເງິນຂອງທ່ານແລ້ວ ແລະ ກຳລັງກະກຽມສິນຄ້າ." },
    slipRejected: { subject: (n) => `ສະລິບໂອນເງິນ ${n} ບໍ່ຜ່ານ`, body: "ເຮົາກວດສະລິບໂອນເງິນຂອງທ່ານບໍ່ຜ່ານ. ກະລຸນາອັບໂຫຼດສະລິບໃໝ່ຜ່ານລິ້ງດ້ານລຸ່ມ.", reason: "ເຫດຜົນ" },
    fulfilled: { subject: (n) => `ສົ່ງມອບສິນຄ້າແລ້ວ ${n}`, body: "ຄຳສັ່ງຊື້ຂອງທ່ານໄດ້ຖືກສົ່ງມອບແລ້ວ. ຂອບໃຈທີ່ໃຊ້ບໍລິການ." },
    cancelled: { subject: (n) => `ຄຳສັ່ງຊື້ ${n} ຖືກຍົກເລີກ`, body: "ຄຳສັ່ງຊື້ຂອງທ່ານຖືກຍົກເລີກແລ້ວ. ຖ້າມີຄຳຖາມ ກະລຸນາຕິດຕໍ່ເຮົາ.", reason: "ເຫດຜົນ" },
  },
  en: {
    received: { subject: (n) => `Order ${n} received`, body: "Thank you for your order. Please pay and upload your transfer slip using the link below within 48 hours, otherwise the order is cancelled automatically." },
    paid: { subject: (n) => `Payment confirmed for ${n}`, body: "We have received your payment and are preparing your goods." },
    slipRejected: { subject: (n) => `Transfer slip for ${n} not accepted`, body: "We could not accept your transfer slip. Please upload a new one using the link below.", reason: "Reason" },
    fulfilled: { subject: (n) => `Order ${n} delivered`, body: "Your order has been delivered. Thank you." },
    cancelled: { subject: (n) => `Order ${n} cancelled`, body: "Your order has been cancelled. Please contact us if you have any questions.", reason: "Reason" },
  },
};

const labels = { lo: { order: "ເລກທີ່ຄຳສັ່ງຊື້", total: "ຍອດລວມ", link: "ເບິ່ງຄຳສັ່ງຊື້" }, en: { order: "Order number", total: "Total", link: "View your order" } };

export function orderMail(kind: OrderMailKind, ctx: Ctx): { subject: string; text: string } {
  const c = copy[ctx.lang][kind];
  const l = labels[ctx.lang];
  const lines = [c.body];
  if (ctx.reason && c.reason) lines.push(`${c.reason}: ${ctx.reason}`);
  lines.push("", `${l.order}: ${ctx.orderNumber}`, `${l.total}: ${formatLAK(ctx.totalLAK)}`, `${l.link}: ${ctx.url}`, "", company[ctx.lang]);
  return { subject: c.subject(ctx.orderNumber), text: lines.join("\n") };
}
