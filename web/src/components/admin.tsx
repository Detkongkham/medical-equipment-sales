import type { AdminRole, AdminUser } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { logout } from "@/app/admin/actions";
import { buttonClass } from "./ui";

const nav: { href: string; label: string; roles: AdminRole[] }[] = [
  { href: "/admin", label: "ພາບລວມ", roles: [] },
  { href: "/admin/quotes", label: "ຄຳຂໍລາຄາ", roles: ["SALES"] },
  { href: "/admin/tickets", label: "ແຈ້ງສ້ອມ", roles: ["TECHNICIAN"] },
  { href: "/admin/applicants", label: "ຜູ້ສະໝັກງານ", roles: ["HR"] },
  { href: "/admin/products", label: "ສິນຄ້າ", roles: ["SALES"] },
  { href: "/admin/categories", label: "ໝວດໝູ່", roles: ["SALES"] },
  { href: "/admin/brands", label: "ຍີ່ຫໍ້", roles: ["SALES"] },
  { href: "/admin/posts", label: "ຜົນງານ / ຂ່າວ", roles: ["SALES"] },
  { href: "/admin/jobs", label: "ຕຳແໜ່ງງານ", roles: ["HR"] },
  { href: "/admin/users", label: "ຜູ້ໃຊ້ລະບົບ", roles: [] },
];

const roleLabel: Record<AdminRole, string> = { ADMIN: "ຜູ້ດູແລ", SALES: "ຝ່າຍຂາຍ", TECHNICIAN: "ຊ່າງ", HR: "ບຸກຄະລາກອນ" };

export function AdminShell({ user, children }: { user: AdminUser; children: ReactNode }) {
  const items = nav.filter((item) => (item.href === "/admin/users" ? user.role === "ADMIN" : item.roles.length === 0 || user.role === "ADMIN" || item.roles.includes(user.role)));
  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-slate-200 bg-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:overflow-y-auto md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-4 py-3">
          <Image src="/brand/logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="font-bold text-brand">ຫຼັງບ້ານ XTK</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:pb-4" aria-label="ເມນູຫຼັງບ້ານ">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-brand/5 hover:text-brand">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-slate-200 p-4 text-sm md:block">
          <p className="font-semibold text-slate-900">{user.name}</p>
          <p className="text-xs text-slate-500">{roleLabel[user.role]} · {user.email}</p>
          <form action={logout} className="mt-3">
            <button className="text-sm font-medium text-red-600 hover:underline">ອອກຈາກລະບົບ</button>
          </form>
          <Link href="/lo" target="_blank" className="mt-2 block text-sm text-leaf hover:underline">ເບິ່ງເວັບໄຊທ໌ →</Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}

export function AdminTitle({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold text-slate-900">{children}</h1>
      {actions}
    </div>
  );
}

/** Banner for ?saved=1 and ?error=... set by server actions. */
export function Notice({ saved, error, denied }: { saved?: string; error?: string; denied?: string }) {
  if (error) return <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>;
  if (denied) return <p role="alert" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">ບັນຊີຂອງທ່ານບໍ່ມີສິດເຂົ້າໜ້ານັ້ນ.</p>;
  if (saved) return <p role="status" className="mb-4 rounded-lg border border-leaf/30 bg-leaf/10 px-4 py-3 text-sm text-leaf-dark">ບັນທຶກແລ້ວ.</p>;
  return null;
}

export const one = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 sm:p-5 ${className}`}>
      {title ? <h2 className="mb-3 font-bold text-brand">{title}</h2> : null}
      {children}
    </section>
  );
}

export function Check({ label, hint, ...props }: ComponentProps<"input"> & { label: string; hint?: string }) {
  return (
    <label className="flex items-start gap-2 text-sm text-slate-800">
      <input type="checkbox" {...props} className="mt-1 h-4 w-4 accent-[#2e3192]" />
      <span>{label}{hint ? <span className="block text-xs text-slate-500">{hint}</span> : null}</span>
    </label>
  );
}

const tones = {
  gray: "bg-slate-100 text-slate-700",
  blue: "bg-blue-50 text-blue-800",
  amber: "bg-amber-50 text-amber-800",
  green: "bg-leaf/10 text-leaf-dark",
  indigo: "bg-brand/10 text-brand",
};

export function Pill({ tone = "gray", children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export const quoteStatus = {
  PENDING: ["ໃໝ່", "blue"], REVIEWING: ["ກຳລັງກວດ", "amber"], QUOTED: ["ສົ່ງໃບສະເໜີແລ້ວ", "indigo"], APPROVED: ["ລູກຄ້າຕົກລົງ", "green"], CLOSED: ["ປິດ", "gray"],
} as const;

export const ticketStatus = {
  OPEN: ["ຮັບແລ້ວ", "blue"], IN_PROGRESS: ["ກຳລັງສ້ອມ", "amber"], WAITING_PARTS: ["ລໍຊິ້ນສ່ວນ", "indigo"], RESOLVED: ["ສຳເລັດ", "green"], CLOSED: ["ປິດ", "gray"],
} as const;

export const customerType = { HOSPITAL: "ໂຮງໝໍ", CLINIC: "ຄລີນິກ", DEALER: "ຕົວແທນ", GOVERNMENT: "ລັດ", INDIVIDUAL: "ບຸກຄົນ" } as const;

export const thDate = (d: Date) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Vientiane" }).format(d);

export const submitClass = buttonClass("primary");
