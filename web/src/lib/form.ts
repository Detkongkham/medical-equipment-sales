import { redirect } from "next/navigation";

export const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
export const strOrNull = (fd: FormData, key: string) => str(fd, key) || null;
export const all = (fd: FormData, key: string) => fd.getAll(key).map((v) => String(v).trim());

/** "2,400,000" -> 2400000; empty -> null; garbage -> undefined (caller reports an error). */
export function money(raw: string): number | null | undefined {
  const cleaned = raw.replace(/[,\s₭]/g, "");
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) && value >= 0 && value < 1e12 ? value : undefined;
}

/** "2026-12-31" from <input type="date"> -> Date at noon Vientiane time; empty -> null; garbage -> undefined. */
export function dateInput(raw: string): Date | null | undefined {
  if (!raw) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return undefined;
  const date = new Date(`${raw}T12:00:00+07:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export const dateValue = (d: Date | null | undefined) => (d ? new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Vientiane" }).format(d) : "");

export function addMonths(from: Date, months: number) {
  const d = new Date(from);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function back(path: string, key: "saved" | "error", value = "1"): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(value)}`);
}
