import type { InstalledEquipment } from "@prisma/client";
import { saveEquipment } from "@/app/admin/service-actions";
import { dateValue } from "@/lib/form";
import { Card } from "./admin";
import { Field, Input, Select, Textarea, buttonClass } from "./ui";

type Props = {
  equipment?: InstalledEquipment;
  customerId: string;
  products: { id: string; titleLao: string; sku: string; modelNumber: string | null }[];
  returnTo: string;
  title?: string;
};

/** Create or edit a registry entry. Warranty end is computed from the install date + months on save. */
export function EquipmentForm({ equipment, customerId, products, returnTo, title = "ຂໍ້ມູນເຄື່ອງ" }: Props) {
  return (
    <Card title={title}>
      <form action={saveEquipment} className="grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="id" value={equipment?.id ?? ""} />
        <input type="hidden" name="customerId" value={customerId} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <Field label="ສິນຄ້າໃນ catalog (ຖ້າມີ)">
          <Select name="productId" defaultValue={equipment?.productId ?? ""}>
            <option value="">— ບໍ່ລະບຸ —</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.titleLao}{p.modelNumber ? ` (${p.modelNumber})` : ""} · {p.sku}</option>)}
          </Select>
        </Field>
        <Field label="ຊື່ / ລຸ້ນເຄື່ອງ" required><Input name="deviceModel" defaultValue={equipment?.deviceModel} required /></Field>
        <Field label="Serial No."><Input name="serialNumber" defaultValue={equipment?.serialNumber ?? ""} /></Field>
        <Field label="ສະຖານທີ່ຕິດຕັ້ງ (ຫ້ອງ / ພະແນກ)"><Input name="location" defaultValue={equipment?.location ?? ""} /></Field>
        <Field label="ວັນຕິດຕັ້ງ / ສົ່ງມອບ" required><Input name="installedAt" type="date" defaultValue={dateValue(equipment?.installedAt)} required /></Field>
        <Field label="ການຮັບປະກັນ (ເດືອນ)" required><Input name="warrantyMonths" type="number" min={0} max={120} defaultValue={equipment?.warrantyMonths ?? 12} required /></Field>
        <div className="sm:col-span-2"><Field label="ໝາຍເຫດ"><Textarea name="notes" rows={2} defaultValue={equipment?.notes ?? ""} /></Field></div>
        <div className="sm:col-span-2"><button className={buttonClass("primary")}>{equipment ? "ບັນທຶກ" : "ເພີ່ມເຂົ້າທະບຽນ"}</button></div>
      </form>
    </Card>
  );
}
