#!/usr/bin/env bash
# Smoke-test every starter sequentially. Continues on failure and reports a
# summary at the end. Exits non-zero if any starter failed.
set -uo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"

ids=()
for dir in "$ROOT"/starters/*/; do
  ids+=("$(basename "$dir")")
done

passed=()
failed=()

for id in "${ids[@]}"; do
  if bash "$HERE/smoke-one.sh" "$id"; then
    passed+=("$id")
  else
    failed+=("$id")
  fi
  echo
done

echo "=========================================="
echo "passed (${#passed[@]}): ${passed[*]:-none}"
echo "failed (${#failed[@]}): ${failed[*]:-none}"
echo "=========================================="

[[ ${#failed[@]} -eq 0 ]]
