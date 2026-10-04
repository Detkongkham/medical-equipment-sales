#!/bin/bash
# Stop hook: after UI/web edits, request each page from the running dev server (HTTP check, then
# headless Chrome check for client-side errors) and
# block the stop (feeding errors back to Claude) if any page errors. Gives up after MAX tries.
MAX=5
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cfg="$root/.claude/browser-check"
state="$cfg/.attempts"
input=$(cat)
base=$(tr -d '[:space:]' < "$cfg/base-url.txt" 2>/dev/null); base=${base:-http://localhost:3100}

# Only run if web source changed (uncommitted) — otherwise nothing to verify
if [ -z "$(git -C "$root" status --porcelain -- web/src web/public 2>/dev/null)" ]; then rm -f "$state"; exit 0; fi
# Dev server must be up; otherwise skip silently
curl -s -o /dev/null --max-time 3 "$base/" || exit 0

errors=""
while IFS= read -r path; do
  case "$path" in ""|\#*) continue ;; esac
  body=$(mktemp)
  code=$(curl -s -o "$body" -w "%{http_code}" --max-time 20 "$base$path")
  if [ "$code" -ge 500 ] || [ "$code" = "000" ] || [ "$code" = "404" ]; then
    errors+="- $path -> HTTP $code"$'\n'
  elif grep -qiE "Unhandled Runtime Error|Application error|Internal Server Error|Build Error|Module not found|Failed to compile|Hydration failed|nextjs-portal" "$body"; then
    errors+="- $path -> HTTP $code but error content in page: $(grep -oiE 'Unhandled Runtime Error|Application error|Internal Server Error|Build Error|Module not found|Failed to compile|Hydration failed|nextjs-portal' "$body" | head -1)"$'\n'
  fi
  rm -f "$body"
done < "$cfg/urls.txt"

# Client-side check in headless Chrome (console errors, uncaught exceptions, failed requests, error overlay)
if [ -z "$errors" ] && [ -d "$cfg/node_modules/playwright-core" ]; then
  errors=$(cd "$cfg" && node client-check.mjs 2>/dev/null)
  [ -n "$errors" ] && errors+=$'\n'
fi

if [ -z "$errors" ]; then rm -f "$state"; exit 0; fi

n=$(( $(cat "$state" 2>/dev/null || echo 0) + 1 )); echo "$n" > "$state"
if [ "$n" -gt "$MAX" ]; then rm -f "$state"; exit 0; fi   # stop looping, let Claude report

reason="Page check failed (attempt $n/$MAX). Fix the cause, then re-verify with the browser-verify-loop skill (open the page in the browser, read console/error overlay and the dev-server log).
$errors"
jq -n --arg r "$reason" '{decision:"block", reason:$r}'
exit 0
