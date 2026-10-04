"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LangSwitch({ lang }: { lang: string }) {
  const pathname = usePathname();
  const other = lang === "lo" ? "en" : "lo";
  const target = pathname.replace(/^\/(lo|en)(?=\/|$)/, `/${other}`);
  return (
    <Link href={target} hrefLang={other} className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
      {other === "en" ? "English" : "ລາວ"}
    </Link>
  );
}
