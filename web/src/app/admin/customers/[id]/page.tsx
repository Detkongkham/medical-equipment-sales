import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminTitle, Card, Notice, Pill, customerType, one, quoteStatus, thDate, ticketStatus } from "@/components/admin";
import { EquipmentForm } from "@/components/EquipmentForm";
import { Field, Input, Select, Textarea, buttonClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatLAK } from "@/lib/pricing";
import { saveCustomer } from "../../sales-actions";

export const metadata = { title: "ລູກຄ້າ" };

export default async function CustomerDetail({ params, searchParams }: PageProps<"/admin/customers/[id]">) {
  const user = await requireAdmin("SALES", "TECHNICIAN");
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [customer, products] = await Promise.all([
    db.customer.findUnique({
      where: { id },
      include: {
        quotations: { orderBy: { createdAt: "desc" } },
        serviceTickets: { orderBy: { createdAt: "desc" } },
        equipment: { orderBy: { installedAt: "desc" } },
      },
    }),
    db.product.findMany({ select: { id: true, titleLao: true, sku: true, modelNumber: true }, orderBy: { sku: "asc" } }),
  ]);
  if (!customer) notFound();
  const canEdit = user.role === "ADMIN" || user.role === "SALES";
  const now = new Date();
  const approved = customer.quotations.filter((q) => q.status === "APPROVED" || q.status === "CLOSED").reduce((sum, q) => sum + Number(q.totalAmountLAK ?? 0), 0);

  return (
    <>
      <AdminTitle actions={<Link href="/admin/customers" className="text-sm text-brand hover:underline">← ລູກຄ້າທັງໝົດ</Link>}>{customer.organization}</AdminTitle>
      <Notice saved={one(sp.saved)} error={one(sp.error)} />
      <div className="max-w-4xl space-y-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          <Card><p className="text-2xl font-bold text-brand">{customer.quotations.length}</p><p className="text-xs text-slate-600">ໃບສະເໜີລາຄາ</p></Card>
          <Card><p className="text-2xl font-bold text-brand">{customer.serviceTickets.length}</p><p className="text-xs text-slate-600">ແຈ້ງສ້ອມ</p></Card>
          <Card><p className="text-2xl font-bold text-brand">{customer.equipment.length}</p><p className="text-xs text-slate-600">ເຄື່ອງທີ່ຕິດຕັ້ງ</p></Card>
        </div>

        <Card title="ຂໍ້ມູນລູກຄ້າ">
          <form action={saveCustomer} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="id" value={customer.id} />
            <fieldset disabled={!canEdit} className="contents">
              <Field label="ອົງກອນ" required><Input name="organization" defaultValue={customer.organization} required /></Field>
              <Field label="ປະເພດ">
                <Select name="type" defaultValue={customer.type}>
                  {Object.entries(customerType).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </Select>
              </Field>
              <Field label="ຜູ້ຕິດຕໍ່" required><Input name="contactName" defaultValue={customer.contactName} required /></Field>
              <Field label="ເບີໂທ" required><Input name="phone" defaultValue={customer.phone} required /></Field>
              <Field label="WhatsApp"><Input name="whatsapp" defaultValue={customer.whatsapp ?? ""} /></Field>
              <Field label="Email"><Input name="email" type="email" defaultValue={customer.email ?? ""} /></Field>
              <div className="sm:col-span-2"><Field label="ທີ່ຢູ່"><Textarea name="address" rows={2} defaultValue={customer.address ?? ""} /></Field></div>
              <div className="sm:col-span-2"><Field label="ບັນທຶກພາຍໃນ (ລູກຄ້າບໍ່ເຫັນ)"><Textarea name="notes" rows={3} defaultValue={customer.notes ?? ""} /></Field></div>
              {canEdit ? <div className="sm:col-span-2"><button className={buttonClass("primary")}>ບັນທຶກ</button></div> : null}
            </fieldset>
          </form>
        </Card>

        <Card title={`ປະຫວັດການຂໍລາຄາ${approved > 0 ? ` · ມູນຄ່າທີ່ຕົກລົງ ${formatLAK(approved)}` : ""}`}>
          {customer.quotations.length === 0 ? <p className="text-sm text-slate-600">ຍັງບໍ່ມີ.</p> : (
            <ul className="divide-y divide-slate-100 text-sm">
              {customer.quotations.map((q) => (
                <li key={q.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span>{canEdit ? <Link href={`/admin/quotes/${q.id}`} className="font-semibold text-brand hover:underline">{q.quoteNumber}</Link> : q.quoteNumber} <Pill tone={quoteStatus[q.status][1]}>{quoteStatus[q.status][0]}</Pill></span>
                  <span className="text-slate-600">{q.totalAmountLAK ? formatLAK(q.totalAmountLAK) : "ຍັງບໍ່ໄດ້ໃສ່ລາຄາ"} · {thDate(q.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="ປະຫວັດແຈ້ງສ້ອມ">
          {customer.serviceTickets.length === 0 ? <p className="text-sm text-slate-600">ຍັງບໍ່ມີ.</p> : (
            <ul className="divide-y divide-slate-100 text-sm">
              {customer.serviceTickets.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span><span className="font-semibold text-brand">{t.ticketNumber}</span> {t.deviceModel} <Pill tone={ticketStatus[t.status][1]}>{ticketStatus[t.status][0]}</Pill></span>
                  <span className="text-slate-600">{thDate(t.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="ເຄື່ອງທີ່ຕິດຕັ້ງ ແລະ ການຮັບປະກັນ">
          {customer.equipment.length === 0 ? <p className="text-sm text-slate-600">ຍັງບໍ່ມີເຄື່ອງໃນທະບຽນ.</p> : (
            <ul className="divide-y divide-slate-100 text-sm">
              {customer.equipment.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span><Link href={`/admin/equipment/${e.id}`} className="font-medium text-brand hover:underline">{e.deviceModel}</Link>{e.serialNumber ? <span className="text-slate-500"> · S/N {e.serialNumber}</span> : null}</span>
                  <Pill tone={e.warrantyUntil >= now ? "green" : "gray"}>{e.warrantyUntil >= now ? `ຮັບປະກັນເຖິງ ${e.warrantyUntil.toLocaleDateString("en-GB")}` : "ໝົດການຮັບປະກັນ"}</Pill>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <EquipmentForm customerId={customer.id} products={products} returnTo={`/admin/customers/${customer.id}`} title="ເພີ່ມເຄື່ອງທີ່ຕິດຕັ້ງ" />
      </div>
    </>
  );
}
