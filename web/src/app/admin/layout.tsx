import type { Metadata } from "next";
import { Noto_Sans_Lao } from "next/font/google";
import { AdminShell } from "@/components/admin";
import { getAdmin } from "@/lib/auth";
import "../globals.css";

const lao = Noto_Sans_Lao({ variable: "--font-lao", subsets: ["lao", "latin"] });

export const metadata: Metadata = { title: { default: "ຫຼັງບ້ານ XTK", template: "%s | ຫຼັງບ້ານ XTK" }, robots: { index: false, follow: false }, icons: { icon: "/brand/logo.png" } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getAdmin();
  return (
    <html lang="lo" className={lao.variable}>
      <body className="bg-slate-50 font-sans antialiased">{user ? <AdminShell user={user}>{children}</AdminShell> : children}</body>
    </html>
  );
}
