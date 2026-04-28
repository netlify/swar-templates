#!/usr/bin/env bash
# Smoke-test a single starter: install (if needed), build, serve, fetch /, grep
# expected text. Mirrors the per-starter steps in .github/workflows/smoke-test.yml.
set -euo pipefail

expect_for() {
  case "$1" in
    basic)      echo 'Hello World' ;;
    ai-chat)    echo 'Weather Chat' ;;
    blog)       echo 'Your Blog' ;;
    calculator) echo '+/-' ;;
    dashboard)  echo 'Analytics Dashboard' ;;
    ecommerce)  echo 'Product Company' ;;
    marketing)  echo 'Product Company' ;;
    portfolio)  echo 'Thoughts on web development' ;;
    resume)     echo 'My Resume' ;;
    saas)       echo 'Ship faster with' ;;
    survey)     echo 'favorite season' ;;
    *)          return 1 ;;
  esac
}

if [[ $# -lt 1 ]]; then
  echo "usage: $0 <starter-id>" >&2
  echo "ids: basic ai-chat blog calculator dashboard ecommerce marketing portfolio resume saas survey" >&2
  exit 2
fi

id="$1"
if ! expect="$(expect_for "$id")"; then
  echo "error: unknown starter '$id'" >&2
  exit 2
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WRAPPER="$ROOT/scripts/smoke-serve.mjs"
PORT="${PORT:-8787}"
LOG="${TMPDIR:-/tmp}/smoke-${id}.log"

cd "$ROOT/starters/$id"

echo "=== $id (expect: $expect) ==="

if [[ -n "${SKIP_INSTALL:-}" ]]; then
  :
elif [[ ! -d node_modules ]]; then
  echo "  installing..."
  npm ci --silent
fi

if [[ -z "${SKIP_BUILD:-}" ]]; then
  echo "  building..."
  npm run build --silent
fi

echo "  serving on :$PORT (log: $LOG)..."
node "$WRAPPER" . "$PORT" > "$LOG" 2>&1 &
PID=$!
cleanup() { kill "$PID" 2>/dev/null || true; wait "$PID" 2>/dev/null || true; }
trap cleanup EXIT

curl --silent --fail --retry 30 --retry-delay 1 --retry-connrefused --retry-all-errors \
  -o /dev/null "http://127.0.0.1:$PORT/"

BODY_FILE="${TMPDIR:-/tmp}/smoke-${id}.html"
curl -fsS "http://127.0.0.1:$PORT/" -o "$BODY_FILE"

if grep -aqF "$expect" "$BODY_FILE"; then
  echo "  ✓ found '$expect'"
  exit 0
else
  echo "  ✗ missing '$expect'" >&2
  echo "  --- first 2KB of body ($BODY_FILE) ---" >&2
  head -c 2000 "$BODY_FILE" >&2
  echo >&2
  echo "  --- server log ($LOG) ---" >&2
  tail -50 "$LOG" >&2 || true
  exit 1
fi
