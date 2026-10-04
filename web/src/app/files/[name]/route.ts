import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { publicContentType } from "@/lib/storage";

// Serves admin-uploaded images and brochures from storage/public.
export async function GET(_request: Request, { params }: RouteContext<"/files/[name]">) {
  const { name } = await params;
  const type = publicContentType(name);
  if (!type || !/^[\w-]+\.\w+$/.test(name)) return new Response("Not found", { status: 404 });
  try {
    const body = await readFile(join(process.cwd(), "storage", "public", name));
    return new Response(body, { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
