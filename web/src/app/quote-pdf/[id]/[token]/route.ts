import { validShareToken } from "@/lib/auth";
import { quotePdfResponse } from "@/lib/quotes";

// Customer-facing link sent by sales. The token only opens this one quotation, and only once it was sent.
export async function GET(_request: Request, { params }: RouteContext<"/quote-pdf/[id]/[token]">) {
  const { id, token } = await params;
  if (!validShareToken("quote", id, token)) return new Response("Not found", { status: 404 });
  return quotePdfResponse(id, { onlyIfSent: true });
}
