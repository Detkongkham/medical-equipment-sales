import { createHmac, timingSafeEqual } from "node:crypto";
import type { AdminRole } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "./db";

export { hashPassword, verifyPassword } from "./auth-hash";

const COOKIE = "xtk_admin";
const SESSION_SECONDS = 60 * 60 * 12;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET is required in production");
  return "dev-only-secret-change-me";
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export async function startSession(userId: string) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `${userId}.${expires}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/** The signed-in admin, or null. Re-checks the database so a deactivated account loses access at once. */
export const getAdmin = cache(async () => {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [userId, expires, signature] = raw.split(".");
  if (!userId || !expires || !signature) return null;
  const expected = Buffer.from(sign(`${userId}.${expires}`));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  if (Number(expires) < Date.now() / 1000) return null;
  const user = await db.adminUser.findUnique({ where: { id: userId } });
  return user?.isActive ? user : null;
});

/** Pages and actions call this first. ADMIN may do everything; other roles only what is listed. */
export async function requireAdmin(...roles: AdminRole[]) {
  const user = await getAdmin();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN" && roles.length > 0 && !roles.includes(user.role)) redirect("/admin?denied=1");
  return user;
}

// Slows down password guessing: 5 failures per email per 15 minutes (per server instance).
const failures = new Map<string, { count: number; since: number }>();

export function loginAllowed(email: string) {
  const entry = failures.get(email);
  if (!entry || Date.now() - entry.since > 15 * 60_000) return true;
  return entry.count < 5;
}

export function recordLogin(email: string, ok: boolean) {
  if (ok) return void failures.delete(email);
  const entry = failures.get(email);
  if (!entry || Date.now() - entry.since > 15 * 60_000) failures.set(email, { count: 1, since: Date.now() });
  else entry.count += 1;
}

/** Unguessable token for a public link (e.g. a quotation PDF sent to a customer). Tied to the id, so it cannot open other records. */
export const shareToken = (scope: string, id: string) => sign(`${scope}:${id}`).slice(0, 32);

export function validShareToken(scope: string, id: string, token: string) {
  const expected = Buffer.from(shareToken(scope, id));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
