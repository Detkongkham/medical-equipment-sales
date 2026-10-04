import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getAdmin } from "@/lib/auth";
import { publicContentType } from "@/lib/storage";

// Private uploads (repair photos, CVs) are only readable by signed-in admins.
export async function GET(request: Request) {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });
  const ref = new URL(request.url).searchParams.get("f") ?? "";
  const match = /^local:(tickets|applications)\/([\w-]+\.\w+)$/.exec(ref);
  const type = match && publicContentType(match[2]);
  if (!match || !type) return new Response("Not found", { status: 404 });
  try {
    const body = await readFile(join(process.cwd(), "storage", match[1], match[2]));
    return new Response(body, { headers: { "Content-Type": type, "Content-Disposition": `inline; filename="${match[2]}"`, "Cache-Control": "private, no-store" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
