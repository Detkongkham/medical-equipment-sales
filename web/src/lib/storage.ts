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
export async function saveFiles(files: File[], folder: "tickets" | "applications"): Promise<string[]> {
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
