import type { Brand, Category, Product, ProductVariant } from "@prisma/client";
import { deleteProduct, saveProduct } from "@/app/admin/actions";
import { Card, Check } from "./admin";
import { RowsEditor } from "./RowsEditor";
import { Field, Input, Select, Textarea, buttonClass } from "./ui";

type Spec = { labelLao: string; labelEng: string; value: string };
type Link = { type: string; to?: { id: string }; from?: { id: string } };
type Full = Product & { variants: ProductVariant[]; relatedFrom: (Link & { to: { id: string } })[]; relatedTo: (Link & { from: { id: string } })[] };
type Option = { id: string; titleLao: string; sku: string };

const relationTypes: [string, string][] = [["REAGENT", "ນ້ຳຢາ"], ["CONSUMABLE", "ວັດສະດຸສິ້ນເປືອງ / ເຈ້ຍພິມ"], ["ACCESSORY", "ອຸປະກອນເສີມ"]];

const stockOptions: [string, string][] = [["PRE_ORDER", "ສັ່ງຈອງ"], ["IN_STOCK", "ພ້ອມສົ່ງ"]];
const plain = (value: unknown) => (value == null ? "" : String(Number(value)));

export function ProductForm({ product, categories, brands, others }: { product?: Full; categories: Category[]; brands: Brand[]; others: Option[] }) {
  const productOptions: [string, string][] = [["", "— ເລືອກສິນຄ້າ —"], ...others.map((o): [string, string] => [o.id, `${o.titleLao} (${o.sku})`])];
  const specs = (product?.specifications as Spec[] | null) ?? [];
  return (
    <>
      <form action={saveProduct} className="max-w-4xl space-y-5">
        <input type="hidden" name="id" value={product?.id ?? ""} />

        <Card title="ຂໍ້ມູນຫຼັກ">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ຊື່ສິນຄ້າ (ລາວ)" required><Input name="titleLao" defaultValue={product?.titleLao} required /></Field>
            <Field label="Product name (English)" required><Input name="titleEng" defaultValue={product?.titleEng} required /></Field>
            <Field label="ໝວດ" required>
              <Select name="categoryId" defaultValue={product?.categoryId ?? ""} required>
                <option value="" disabled>ເລືອກໝວດ</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.parentId ? "– " : ""}{c.nameLao}</option>)}
              </Select>
            </Field>
            <Field label="ຍີ່ຫໍ້">
              <Select name="brandId" defaultValue={product?.brandId ?? ""}>
                <option value="">ບໍ່ລະບຸ</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </Field>
            <Field label="ລຸ້ນ (Model)"><Input name="modelNumber" defaultValue={product?.modelNumber ?? ""} /></Field>
            <Field label="ລະຫັດ SKU (ຫວ່າງ = ສ້າງໃຫ້ເອງ)"><Input name="sku" defaultValue={product?.sku ?? ""} /></Field>
            <Field label="Slug ຂອງລິ້ງ (ຫວ່າງ = ສ້າງຈາກຊື່ອັງກິດ)"><Input name="slug" defaultValue={product?.slug ?? ""} /></Field>
            <Field label="ສະຖານະສະຕັອກ"><Select name="stockStatus" defaultValue={product?.stockStatus ?? "PRE_ORDER"}>{stockOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select></Field>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            <Check name="isPublished" label="ເຜີຍແຜ່ໃນເວັບ" defaultChecked={product?.isPublished ?? false} />
            <Check name="isFeatured" label="ສະແດງໃນໜ້າຫຼັກ" defaultChecked={product?.isFeatured ?? false} />
          </div>
        </Card>

        <Card title="ລາຄາ">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ລາຄາ (ກີບ) — ສຳລັບສິນຄ້າທີ່ບໍ່ມີຕົວເລືອກ"><Input name="priceLAK" inputMode="numeric" defaultValue={plain(product?.priceLAK)} placeholder="ຫວ່າງ = ຂໍລາຄາ" /></Field>
            <div className="self-end">
              <Check name="showPrice" label="ສະແດງລາຄາຂອງສິນຄ້ານີ້" hint="ຕ້ອງເປີດ “ສະແດງລາຄາໃນເວັບ” ໃນໜ້າພາບລວມນຳ. ປິດບ່ອນນີ້ = ສິນຄ້ານີ້ສະແດງ “ຂໍລາຄາ”." defaultChecked={product?.showPrice ?? true} />
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="ລາຄາໂຮງໝໍ / ຄລີນິກ (ກີບ)"><Input name="medicalPriceLAK" inputMode="numeric" defaultValue={plain(product?.medicalPriceLAK)} placeholder="ຫວ່າງ = ໃຊ້ລາຄາທົ່ວໄປ" /></Field>
            <Field label="ລາຄາຕົວແທນ (ກີບ)"><Input name="dealerPriceLAK" inputMode="numeric" defaultValue={plain(product?.dealerPriceLAK)} placeholder="ຫວ່າງ = ໃຊ້ລາຄາໂຮງໝໍ / ທົ່ວໄປ" /></Field>
          </div>
          <p className="mt-2 text-xs text-slate-500">ລາຄາໂຮງໝໍ ແລະ ຕົວແທນ ໃຊ້ໃນໃບສະເໜີລາຄາເທົ່ານັ້ນ, ບໍ່ສະແດງໃນເວັບ. ຖ້າມີຕົວເລືອກ (ດ້ານລຸ່ມ) ໃຫ້ໃສ່ລາຄາຢູ່ແຕ່ລະຕົວເລືອກ.</p>
        </Card>

        <Card title="ລາຍລະອຽດ">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ຄຳອະທິບາຍສັ້ນ (ລາວ)"><Textarea name="shortDescLao" rows={3} defaultValue={product?.shortDescLao ?? ""} /></Field>
            <Field label="Short description (English)"><Textarea name="shortDescEng" rows={3} defaultValue={product?.shortDescEng ?? ""} /></Field>
            <Field label="ລາຍລະອຽດເຕັມ (ລາວ)"><Textarea name="fullDescLao" rows={5} defaultValue={product?.fullDescLao ?? ""} /></Field>
            <Field label="Full description (English)"><Textarea name="fullDescEng" rows={5} defaultValue={product?.fullDescEng ?? ""} /></Field>
          </div>
        </Card>

        <Card title="ມາດຕະຖານ ແລະ ເອກະສານ">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ມາດຕະຖານ (ແຍກດ້ວຍຈຸດ , )"><Input name="certifications" defaultValue={product?.certifications.join(", ") ?? ""} placeholder="CE, FDA, ISO 13485" /></Field>
            <Field label="ເລກທະບຽນ ອຢ"><Input name="fddRegNumber" defaultValue={product?.fddRegNumber ?? ""} /></Field>
            <Field label="Brochure (PDF)"><input type="file" name="brochureFile" accept="application/pdf" className="mt-1 block w-full text-sm" /></Field>
            <Field label="ຫຼື ລິ້ງ Brochure"><Input name="brochurePdfUrl" defaultValue={product?.brochurePdfUrl ?? ""} /></Field>
          </div>
          <p className="mt-2 text-xs text-slate-500">ໃສ່ເລກທະບຽນສະເພາະທີ່ມີເອກະສານຢືນຢັນແລ້ວ. ຖ້າຫວ່າງ ເວັບຈະບໍ່ສະແດງ.</p>
        </Card>

        <Card title="ຮູບພາບ (ຮູບທຳອິດແມ່ນຮູບຫຼັກ)">
          <RowsEditor columns={[{ name: "image", label: "ລິ້ງຮູບ" }]} initial={(product?.images ?? []).map((image) => ({ image }))} addLabel="ເພີ່ມລິ້ງຮູບ" />
          <Field label="ອັບໂຫຼດຮູບໃໝ່ (JPG, PNG, WebP; ເລືອກໄດ້ຫຼາຍຮູບ)"><input type="file" name="imageFiles" accept="image/jpeg,image/png,image/webp" multiple className="mt-1 block w-full text-sm" /></Field>
        </Card>

        <Card title="ຕົວເລືອກ ແລະ ຂະໜາດບັນຈຸ">
          <RowsEditor
            addLabel="ເພີ່ມຕົວເລືອກ"
            columns={[
              { name: "variantId", label: "id", type: "hidden" },
              { name: "variantSku", label: "ລະຫັດ (ຫວ່າງ = ສ້າງເອງ)", width: "0.8fr" },
              { name: "variantNameLao", label: "ຊື່ (ລາວ)", width: "1.2fr" },
              { name: "variantNameEng", label: "Name (English)", width: "1.2fr" },
              { name: "variantPack", label: "ຂະໜາດບັນຈຸ", width: "0.9fr" },
              { name: "variantPrice", label: "ລາຄາທົ່ວໄປ (ກີບ)", width: "0.8fr" },
              { name: "variantMedical", label: "ລາຄາໂຮງໝໍ", width: "0.8fr" },
              { name: "variantDealer", label: "ລາຄາຕົວແທນ", width: "0.8fr" },
              { name: "variantStock", label: "ສະຖານະ", type: "select", options: stockOptions, width: "0.8fr" },
            ]}
            initial={(product?.variants ?? []).map((v) => ({
              variantId: v.id, variantSku: v.sku, variantNameLao: v.nameLao, variantNameEng: v.nameEng,
              variantPack: v.packSize ?? "", variantPrice: plain(v.priceLAK), variantMedical: plain(v.medicalPriceLAK), variantDealer: plain(v.dealerPriceLAK), variantStock: v.stockStatus,
            }))}
          />
        </Card>

        <Card title="ສະເປັກ">
          <RowsEditor
            addLabel="ເພີ່ມສະເປັກ"
            columns={[
              { name: "specLabelLao", label: "ຫົວຂໍ້ (ລາວ)" },
              { name: "specLabelEng", label: "Label (English)" },
              { name: "specValue", label: "ຄ່າ", width: "1.4fr" },
            ]}
            initial={specs.map((s) => ({ specLabelLao: s.labelLao, specLabelEng: s.labelEng, specValue: s.value }))}
          />
        </Card>

        <Card title="ສິນຄ້າທີ່ໃຊ້ຮ່ວມກັນ">
          <p className="mb-2 text-sm font-medium text-slate-700">ນ້ຳຢາ ແລະ ວັດສະດຸທີ່ໃຊ້ກັບສິນຄ້ານີ້ (ສະແດງໃນໜ້າເຄື່ອງ)</p>
          <RowsEditor
            addLabel="ເພີ່ມນ້ຳຢາ / ວັດສະດຸ"
            columns={[
              { name: "outTo", label: "ສິນຄ້າ", type: "select", options: productOptions, width: "2fr" },
              { name: "outType", label: "ປະເພດ", type: "select", options: relationTypes },
            ]}
            initial={(product?.relatedFrom ?? []).map((r) => ({ outTo: r.to.id, outType: r.type }))}
          />
          <p className="mb-2 mt-5 text-sm font-medium text-slate-700">ເຄື່ອງທີ່ສິນຄ້ານີ້ໃຊ້ໄດ້ນຳ (ສະແດງ “ໃຊ້ໄດ້ກັບເຄື່ອງ”)</p>
          <RowsEditor
            addLabel="ເພີ່ມເຄື່ອງ"
            columns={[
              { name: "inFrom", label: "ສິນຄ້າ", type: "select", options: productOptions, width: "2fr" },
              { name: "inType", label: "ປະເພດ", type: "select", options: relationTypes },
            ]}
            initial={(product?.relatedTo ?? []).map((r) => ({ inFrom: r.from.id, inType: r.type }))}
          />
        </Card>

        <div className="sticky bottom-0 -mx-4 flex gap-3 border-t border-slate-200 bg-slate-50/95 px-4 py-3 md:static md:mx-0 md:border-0 md:bg-transparent md:px-0">
          <button className={buttonClass("green")}>ບັນທຶກ</button>
        </div>
      </form>

      {product ? (
        <form action={deleteProduct} className="mt-8 max-w-4xl border-t border-slate-200 pt-4">
          <input type="hidden" name="id" value={product.id} />
          <button className="text-sm font-medium text-red-600 hover:underline">ລຶບສິນຄ້ານີ້</button>
          <span className="ml-2 text-xs text-slate-500">ຖ້າເຄີຍຢູ່ໃນໃບຂໍລາຄາ ຈະລຶບບໍ່ໄດ້ (ໃຫ້ປິດການເຜີຍແຜ່ແທນ).</span>
        </form>
      ) : null}
    </>
  );
}
