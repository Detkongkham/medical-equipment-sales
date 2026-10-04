import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

const ALLOWED = new Set([".pdf", ".jpg", ".jpeg", ".png", ".webp"]);
export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 8 * 1024 * 1024;

export function checkFiles(files: File[]): "ok" | "too-many" | "too-big" | "bad-type" {
  if (files.length > MAX_FILES) return "too-many";
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) return "too-big";
    if (!ALLOWED.has(extname(file.name).toLowerCase())) return "bad-type";
  }
  return "ok";
}

// Development storage: files go to ./storage (not publicly served).
// Production needs object storage (Cloudflare R2 / S3) behind this same function.
export async function saveFiles(files: File[], folder: "tickets" | "applications" | "orders"): Promise<string[]> {
  const dir = join(process.cwd(), "storage", folder);
  await mkdir(dir, { recursive: true });
  const saved: string[] = [];
  for (const file of files) {
    const name = `${randomUUID()}${extname(file.name).toLowerCase()}`;
    await writeFile(join(dir, name), Buffer.from(await file.arrayBuffer()));
    saved.push(`local:${folder}/${name}`);
  }
  return saved;
}

const IMAGE_TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".pdf": "application/pdf" };
export const publicContentType = (name: string) => IMAGE_TYPES[extname(name).toLowerCase()];

/**
 * Images and brochures uploaded from the admin. Served by app/files/[name]/route.ts.
 * Production: replace the body with an upload to Cloudflare R2 and return its public URL; callers only store the returned string.
 */
export async function savePublicFile(file: File): Promise<string | null> {
  const ext = extname(file.name).toLowerCase();
  if (!(ext in IMAGE_TYPES) || file.size > MAX_FILE_BYTES) return null;
  const dir = join(process.cwd(), "storage", "public");
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}${ext}`;
  await writeFile(join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/files/${name}`;
}
