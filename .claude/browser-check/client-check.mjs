// Headless Chrome check: loads each URL, reports console errors, uncaught exceptions,
// failed requests (>=400) and Next.js error overlay. Prints one line per problem; exit 0 always.
import { chromium } from "playwright-core";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const base = (readFileSync(join(dir, "base-url.txt"), "utf8").trim()) || "http://localhost:3100";
const paths = readFileSync(join(dir, "urls.txt"), "utf8").split("\n").map(s => s.trim()).filter(s => s && !s.startsWith("#"));
const candidates = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"];
const executablePath = candidates.find(existsSync);
if (!executablePath) process.exit(0);

const ignore = [/favicon/i, /Download the React DevTools/i, /\[HMR\]|\[Fast Refresh\]/i];
const browser = await chromium.launch({ executablePath, headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const out = [];
for (const p of paths) {
  const page = await ctx.newPage();
  const issues = [];
  page.on("console", m => { if (m.type() === "error" && !ignore.some(r => r.test(m.text()))) issues.push("console.error: " + m.text().split("\n")[0].slice(0, 300)); });
  page.on("pageerror", e => issues.push("uncaught: " + String(e.message).split("\n")[0].slice(0, 300)));
  page.on("response", r => { if (r.status() >= 400 && !ignore.some(x => x.test(r.url()))) issues.push(`HTTP ${r.status()}: ${r.url().replace(base, "")}`); });
  try {
    await page.goto(base + p, { waitUntil: "networkidle", timeout: 25000 });
    const ov = page.locator("nextjs-portal [data-nextjs-dialog], nextjs-portal [data-nextjs-dialog-overlay]");
    if (await ov.count()) {
      const t = (await ov.first().innerText().catch(() => "")).split("\n").filter(Boolean).slice(0, 3).join(" ").slice(0, 300);
      issues.push("Next.js error overlay: " + t);
    }
  } catch (e) { issues.push("load failed: " + String(e.message).split("\n")[0]); }
  for (const i of [...new Set(issues)]) out.push(`- ${p} [browser] ${i}`);
  await page.close();
}
await browser.close();
console.log(out.join("\n"));
