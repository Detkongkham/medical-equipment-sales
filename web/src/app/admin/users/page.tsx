import { AdminTitle, Card, Check, Notice, one } from "@/components/admin";
import { Field, Input, Select, buttonClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveUser } from "../actions";

export const metadata = { title: "ຜູ້ໃຊ້ລະບົບ" };

const roles: [string, string][] = [["ADMIN", "ຜູ້ດູແລ (ທຸກຢ່າງ)"], ["SALES", "ຝ່າຍຂາຍ"], ["TECHNICIAN", "ຊ່າງ"], ["HR", "ບຸກຄະລາກອນ"]];

function UserForm({ user }: { user?: { id: string; name: string; email: string; role: string; isActive: boolean } }) {
  return (
    <form action={saveUser} className="grid items-end gap-3 sm:grid-cols-[1fr_1.2fr_1fr_1fr_auto_auto]">
      <input type="hidden" name="id" value={user?.id ?? ""} />
      <Field label="ຊື່" required><Input name="name" defaultValue={user?.name} required /></Field>
      <Field label="ອີເມວ" required><Input name="email" type="email" defaultValue={user?.email} required /></Field>
      <Field label="ບົດບາດ"><Select name="role" defaultValue={user?.role ?? "SALES"}>{roles.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select></Field>
      <Field label={user ? "ລະຫັດຜ່ານໃໝ່ (ຫວ່າງ = ບໍ່ປ່ຽນ)" : "ລະຫັດຜ່ານ (≥ 10 ຕົວ)"} required={!user}><Input name="password" type="password" autoComplete="new-password" minLength={10} required={!user} /></Field>
      <Check name="isActive" label="ໃຊ້ງານ" defaultChecked={user?.isActive ?? true} />
      <button className={buttonClass("primary")}>{user ? "ບັນທຶກ" : "ເພີ່ມ"}</button>
    </form>
  );
}

export default async function UsersAdmin({ searchParams }: PageProps<"/admin/users">) {
  await requireAdmin();
  const sp = await searchParams;
  const users = await db.adminUser.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <>
      <AdminTitle>ຜູ້ໃຊ້ລະບົບ</AdminTitle>
      <Notice saved={one(sp.saved)} error={one(sp.error)} />
      <Card title="ເພີ່ມຜູ້ໃຊ້" className="mb-6"><UserForm /></Card>
      <div className="space-y-3">{users.map((u) => <Card key={u.id}><UserForm user={u} /></Card>)}</div>
    </>
  );
}
