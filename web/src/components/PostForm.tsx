import type { Post, Product } from "@prisma/client";
import { deletePost, savePost } from "@/app/admin/actions";
import { Card, Check } from "./admin";
import { RowsEditor } from "./RowsEditor";
import { Field, Input, Select, Textarea, buttonClass } from "./ui";

export function PostForm({ post, products }: { post?: Post & { products: Pick<Product, "id">[] }; products: Pick<Product, "id" | "titleLao" | "sku">[] }) {
  const linked = new Set(post?.products.map((p) => p.id));
  return (
    <>
      <form action={savePost} className="max-w-4xl space-y-5">
        <input type="hidden" name="id" value={post?.id ?? ""} />
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ຫົວຂໍ້ (ລາວ)" required><Input name="titleLao" defaultValue={post?.titleLao} required /></Field>
            <Field label="Title (English)"><Input name="titleEng" defaultValue={post?.titleEng ?? ""} /></Field>
            <Field label="ປະເພດ"><Select name="type" defaultValue={post?.type ?? "PROJECT"}><option value="PROJECT">ຜົນງານ</option><option value="NEWS">ຂ່າວ / ກິດຈະກຳ</option></Select></Field>
            <Field label="Slug (ຫວ່າງ = ສ້າງຈາກຊື່ອັງກິດ)"><Input name="slug" defaultValue={post?.slug ?? ""} /></Field>
            <Field label="ເນື້ອຫາ (ລາວ)" required><Textarea name="bodyLao" rows={8} defaultValue={post?.bodyLao} required /></Field>
            <Field label="Body (English)"><Textarea name="bodyEng" rows={8} defaultValue={post?.bodyEng ?? ""} /></Field>
          </div>
          <div className="mt-4"><Check name="isPublished" label="ເຜີຍແຜ່ໃນເວັບ" defaultChecked={Boolean(post?.publishedAt)} /></div>
        </Card>
        <Card title="ຮູບພາບ">
          <RowsEditor columns={[{ name: "image", label: "ລິ້ງຮູບ" }]} initial={(post?.images ?? []).map((image) => ({ image }))} addLabel="ເພີ່ມລິ້ງຮູບ" />
          <Field label="ອັບໂຫຼດຮູບໃໝ່"><input type="file" name="imageFiles" accept="image/jpeg,image/png,image/webp" multiple className="mt-1 block w-full text-sm" /></Field>
        </Card>
        <Card title="ສິນຄ້າທີ່ກ່ຽວຂ້ອງ">
          <Select name="productIds" multiple size={8} defaultValue={[...linked]}>
            {products.map((p) => <option key={p.id} value={p.id}>{p.titleLao} ({p.sku})</option>)}
          </Select>
          <p className="mt-1 text-xs text-slate-500">ກົດ Ctrl / ⌘ ຄ້າງໄວ້ເພື່ອເລືອກຫຼາຍລາຍການ.</p>
        </Card>
        <button className={buttonClass("green")}>ບັນທຶກ</button>
      </form>
      {post ? (
        <form action={deletePost} className="mt-8 max-w-4xl border-t border-slate-200 pt-4">
          <input type="hidden" name="id" value={post.id} />
          <button className="text-sm font-medium text-red-600 hover:underline">ລຶບໂພສນີ້</button>
        </form>
      ) : null}
    </>
  );
}
