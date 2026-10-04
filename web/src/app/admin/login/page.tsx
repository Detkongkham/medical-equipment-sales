import Image from "next/image";
import { redirect } from "next/navigation";
import { login } from "../actions";
import { Field, Input, buttonClass } from "@/components/ui";
import { getAdmin } from "@/lib/auth";

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getAdmin()) redirect("/admin");
  const { error } = await searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <Image src="/brand/logo.png" alt="XTK" width={64} height={64} className="mx-auto mb-4 h-16 w-16 object-contain" />
      <h1 className="mb-6 text-center text-xl font-bold text-brand">ເຂົ້າສູ່ລະບົບຫຼັງບ້ານ</h1>
      <form action={login} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        {error ? (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            {error === "locked" ? "ລອງຜິດຫຼາຍເກີນໄປ. ລໍຖ້າ 15 ນາທີ ແລ້ວລອງໃໝ່." : "ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ."}
          </p>
        ) : null}
        <Field label="ອີເມວ" required><Input name="email" type="email" autoComplete="username" required autoFocus /></Field>
        <Field label="ລະຫັດຜ່ານ" required><Input name="password" type="password" autoComplete="current-password" required /></Field>
        <button className={`${buttonClass("primary")} w-full`}>ເຂົ້າສູ່ລະບົບ</button>
      </form>
    </main>
  );
}
