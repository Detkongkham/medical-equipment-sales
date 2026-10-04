import { getAdmin } from "@/lib/auth";
import { quotePdfResponse } from "@/lib/quotes";

export async function GET(_request: Request, { params }: RouteContext<"/admin/quotes/[id]/pdf">) {
  const user = await getAdmin();
  if (!user || !["ADMIN", "SALES"].includes(user.role)) return new Response("Unauthorized", { status: 401 });
  return quotePdfResponse((await params).id);
}
