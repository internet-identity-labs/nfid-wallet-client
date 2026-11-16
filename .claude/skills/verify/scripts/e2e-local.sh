#!/usr/bin/env bash
# Run the E2E scenarios of one feature locally, for /verify.
#
#   e2e-local.sh '<tag expression>' <outdir>
#   e2e-local.sh '@sendft or @sendnft' /tmp/e2e-run
#
# Wraps scripts/run-e2e-frontend.sh (builds with .env.test, serves on :9091, runs wdio).
# Passing --cucumberOpts.tags REPLACES wdio.conf.ts's default expression, so the default
# exclusions are re-added here: (<tags>) and not @pending and not @mobile and not @skip.
# Runs headless. Exit code = the wdio exit code. Prints a short summary at the end.

set -uo pipefail

tags=${1:?usage: e2e-local.sh '<tag expression>' <outdir>}
out=${2:?usage: e2e-local.sh '<tag expression>' <outdir>}
mkdir -p "$out"
out=$(cd "$out" && pwd)
root=$(git rev-parse --show-toplevel)
expr="($tags) and not @pending and not @mobile and not @skip"

cd "$root" || exit 2
echo "tags: $expr" | tee "$out/e2e.cmd"
IS_HEADLESS=true ./scripts/run-e2e-frontend.sh -- "--cucumberOpts.tags=$expr" > "$out/e2e.log" 2>&1
rc=$?
echo "$rc" > "$out/e2e.exit"

sed -E 's/\x1b\[[0-9;]*m//g' "$out/e2e.log" > "$out/e2e.clean.log"
echo "== Summary (exit $rc)"
grep -E "Spec Files:|scenarios? \(|steps? \(" "$out/e2e.clean.log" | tail -5
echo "== Failed steps"
grep -E "✖|✗" "$out/e2e.clean.log" | sort -u | head -30
echo "Log: $out/e2e.log"
echo "Allure results: $root/apps/nfid-frontend-e2e/src/reporter/desktop/allure-results"
exit $rc
