---
name: browser-verify-loop
description: "Verify web changes in a real browser and fix errors in a loop until the pages work. Use after editing UI/pages in web/, when the user reports an error page, or when the Stop hook reports 'Page check failed'. Opens the page, reads the error overlay/console, fixes the cause, and re-checks until clean (max 5 rounds)."
---

# Browser Verify Loop

Dev server: `cd web && pnpm dev` → http://localhost:3100 (pages listed in `.claude/browser-check/urls.txt`).
The Stop hook `.claude/hooks/verify-pages.sh` requests every listed page after web edits and
sends failures back here. It runs two checks: (1) HTTP status/HTML via curl, then (2) `browser-check/client-check.mjs` in
headless Chrome (console errors, uncaught exceptions, failed requests, Next.js error overlay, mobile
390px viewport). Lines tagged `[browser]` come from (2). Headless checks can't judge visual
quality, so **still look at the page yourself** for layout/UX problems.
Run it manually: `node .claude/browser-check/client-check.mjs` (setup once: `cd .claude/browser-check && pnpm install`).

## Loop (max 5 rounds, then stop and report honestly)
1. **Server up?** `curl -s -o /dev/null -w "%{http_code}" localhost:3100/lo`. If down, start `pnpm dev` in `web/` in the background and read its log.
2. **Open the page** in the browser (built-in browser tools, or Claude in Chrome if available — load the matching skill first). Check: Next.js error overlay, console errors/warnings, failed network requests, blank/broken layout, Lao text rendering, mobile width.
3. **Collect evidence**: error message + stack, the dev-server log, the failing route.
4. **Fix the root cause** in code (no suppressing errors, no deleting checks). Read `web/node_modules/next/dist/docs/` first if it is a Next.js API question (this Next version differs from training data — see web/AGENTS.md).
5. **Re-check** the same page, then the other pages in `urls.txt`. If clean → done. If not → next round.
6. After 5 failed rounds, stop and report: what fails, what was tried, suspected cause.

## Rules
- Report what you actually saw in the browser; don't claim "works" from a 200 status alone.
- Also run `cd web && pnpm lint` and `pnpm exec tsc --noEmit` once at the end.
- Add new routes you create to `.claude/browser-check/urls.txt`.
- Pages needing login (`/admin/*`) redirect (307) — check `/admin/login`, and log in manually in the browser to inspect the rest.
- Log the work with the change-log skill.
