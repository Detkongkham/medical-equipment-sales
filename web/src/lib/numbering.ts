/** Next sequential number for the year, e.g. Q-2026-0001, based on the highest one issued so far. */
export async function nextNumber(prefix: "Q" | "SR" | "O", latest: (startsWith: string) => Promise<string | undefined>) {
  const base = `${prefix}-${new Date().getFullYear()}-`;
  const last = await latest(base);
  return `${base}${String((last ? Number(last.slice(base.length)) : 0) + 1).padStart(4, "0")}`;
}

export function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}
