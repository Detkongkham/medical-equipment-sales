import { timingSafeEqual } from "node:crypto";
import { runReminders } from "@/lib/reminders";
import { releaseExpiredOrders } from "@/lib/shop";

export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

// Called once a day by the host's scheduler: cancels expired unpaid orders (emailing customers), then sends due reminders.
async function handle(request: Request) {
  if (!authorized(request)) return Response.json({ error: "unauthorized" }, { status: 401 });
  try {
    await releaseExpiredOrders();
    return Response.json({ ok: true, ...(await runReminders()) });
  } catch (error) {
    console.error("cron reminders failed", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}

export { handle as GET, handle as POST };
