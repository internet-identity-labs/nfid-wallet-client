#!/usr/bin/env bash
# Verification suite for /verify (and /dependabot-update).
#
#   verify.sh run <worktree> <outdir>
#       install (always --frozen-lockfile) → tsc (app, spec, e2e) → lint → unit tests (as CI) → build.
#       Every stage runs even if an earlier one fails; results go to <outdir>.
#   verify.sh compare <baseline-outdir> <branch-outdir>
#       Prints only what is NEW on the branch vs the baseline. Exit 0 = nothing new.
#   verify.sh derive <outdir>
#       Re-parses the raw logs in <outdir> (run does this automatically).
#   verify.sh baseline-dir
#       Fetches origin/main, then prints the cache dir for its SHA (reuse it if
#       <dir>/status has "done").
#
# Unit tests run like CI: env-cmd .env.test, --runInBand, --maxParallel=1. Without
# LAMBDA_IDENTITY some live-canister suites fail on both sides, so compare never trusts a
# stage's exit code alone: it diffs failing test names, failing test files, tsc errors,
# lint errors (file + message + rule) and build errors against the baseline.

set -uo pipefail

TSC_CONFIGS="apps/nfid-frontend/tsconfig.app.json apps/nfid-frontend/tsconfig.spec.json apps/nfid-frontend-e2e/tsconfig.json"

strip_ansi() { sed -E 's/\x1b\[[0-9;]*m//g; s/\^\[\[[0-9;]*m//g'; }

# Version numbers are removed so that "pkg@1.2.3 wants peer@^4" on both sides matches.
normalise_versions() { sed -E 's/@[0-9]+\.[0-9]+\.[0-9]+[^" ]*"/@X"/g; s/\^[0-9]+\.[0-9]+\.[0-9]+[^" ]*"/^X"/g'; }

cmd_run() {
  local wt=$1 out=$2
  mkdir -p "$out"
  out=$(cd "$out" && pwd)
  cd "$wt" || { echo "no such worktree: $wt" >&2; exit 2; }
  : > "$out/status"
  # Lets derive turn absolute paths in logs into repo-relative ones. realpath.native gives the
  # on-disk case (`pwd -P` keeps the shell's case, e.g. …/documents/nfid/ vs ESLint's …/Documents/NFID/).
  node -p 'require("fs").realpathSync.native(".")' > "$out/root"
  git rev-parse HEAD > "$out/sha" 2>/dev/null
  [ -n "${LAMBDA_IDENTITY:-}" ] && echo "lambda=set" >> "$out/status" || echo "lambda=unset" >> "$out/status"

  # Always frozen, on the branch too: verification must never rewrite yarn.lock in the
  # engineer's checkout, and both sides must install the same way. A lockfile that needs
  # changing fails this stage — a finding for /implement.
  yarn install --non-interactive --frozen-lockfile > "$out/install.log" 2>&1
  echo "install=$?" >> "$out/status"

  local cfg
  for cfg in $TSC_CONFIGS; do
    npx tsc --noEmit -p "$cfg" > "$out/tsc_$(echo "$cfg" | tr / _).log" 2>&1
    echo "tsc_$(echo "$cfg" | tr / _)=$?" >> "$out/status"
  done

  NX_DAEMON=false yarn nx run-many -t lint --all --skip-nx-cache > "$out/lint.log" 2>&1
  echo "lint=$?" >> "$out/status"

  NX_DAEMON=false npx env-cmd -f .env.test yarn nx run-many -t test --all --skip-nx-cache \
    --maxParallel=1 --runInBand > "$out/test.log" 2>&1
  echo "test=$?" >> "$out/status"

  NX_DAEMON=false yarn nx run-many -t build --all --skip-nx-cache > "$out/build.log" 2>&1
  echo "build=$?" >> "$out/status"

  cmd_derive "$out"
  echo "done" >> "$out/status"
  cat "$out/status"
}

# Parses the raw logs in <outdir> into the comparable result files. Separate from `run`
# so it can be re-applied to existing logs.
cmd_derive() {
  local out=$1 cfg name root=""
  [ -f "$out/root" ] && root=$(cat "$out/root")
  for cfg in $TSC_CONFIGS; do
    name=$(echo "$cfg" | tr / _)
    # Errors without line/column, so moved lines don't count as new errors.
    grep "error TS" "$out/tsc_$name.log" 2>/dev/null | sed -E 's/\([0-9]+,[0-9]+\)//' | sort -u > "$out/tsc_$name.errors"
  done
  strip_ansi < "$out/test.log" > "$out/test.clean.log"
  grep -E "^ ?FAIL " "$out/test.clean.log" | awk '{for(i=NF;i>0;i--) if ($i ~ /\.(spec|test)\.[cm]?[jt]sx?$/) {print $i; break}}' \
    | sed -E 's#^(apps/nfid-frontend/|packages/[a-z-]+/)##' | sort -u > "$out/failing-suites.txt"
  grep -E "^  ● " "$out/test.clean.log" | grep -v "● Console" | sort -u > "$out/failing-tests.txt"
  # Nx test targets that failed (from the "Failed tasks:" list).
  grep -oE "^- [a-z0-9-]+:test" "$out/test.clean.log" | sed 's/^- //' | sort -u > "$out/failed-targets.txt"
  # Per project: "<project> <suites passed> <tests passed>" from the Jest summary. Nx only
  # prints the output of failing targets, so projects that pass have no line here.
  awk '
    match($0, /nx run [a-z0-9-]+:test/) { proj = substr($0, RSTART + 7, RLENGTH - 12) }
    /^Test Suites:/ { s = 0; if (match($0, /[0-9]+ passed/)) s = substr($0, RSTART, RLENGTH) + 0 }
    /^Tests:/ { t = 0; if (match($0, /[0-9]+ passed/)) t = substr($0, RSTART, RLENGTH) + 0; if (proj != "") counts[proj] = s " " t }
    END { for (p in counts) print p, counts[p] }' "$out/test.clean.log" | sort > "$out/test-counts.txt"
  grep -iE "incorrect peer|unmet peer" "$out/install.log" | normalise_versions | sort -u > "$out/peers.txt"
  grep -i "engine" "$out/install.log" | grep -v "appears to be invalid" | sort -u > "$out/engines.txt"

  # ESLint: "file: message rule", without line:col, so moved lines don't count as new.
  strip_ansi < "$out/lint.log" | awk -v root="$root" '
    function rel(p) { return (root != "" && index(p, root "/") == 1) ? substr(p, length(root) + 2) : p }
    /^\/.*\.(ts|tsx|js|jsx|cjs|mjs)$/ { file = rel($0); next }
    /^[ \t]+[0-9]+:[0-9]+[ \t]+error[ \t]/ {
      msg = $0; sub(/^[ \t]+[0-9]+:[0-9]+[ \t]+error[ \t]+/, "", msg); gsub(/[ \t]+/, " ", msg)
      print file ": " msg
    }' | sort -u > "$out/lint-errors.txt"

  # Webpack: "ERROR in <module> :: <first message line>", with the worktree path removed.
  # The root is removed with index()/substr(), not gsub(): gsub would treat the path as a regex.
  strip_ansi < "$out/build.log" | awk -v root="$root" '
    function strip(s,   p) {
      if (root == "") return s
      while ((p = index(s, root "/")) > 0) s = substr(s, 1, p - 1) substr(s, p + length(root) + 1)
      return s
    }
    /^ERROR in / { loc = $0; getline msg; print strip(loc) " :: " strip(msg) }' | sort -u > "$out/build-errors.txt"
}

stage() { grep "^$1=" "$2/status" | cut -d= -f2; }

# new_lines <title> <file>: prints the lines only in the branch's <file>; returns 1 if any.
new_lines() {
  local title=$1 f=$2
  echo "== $title"
  if [ ! -f "$BASE/$f" ] || [ ! -f "$BR/$f" ]; then
    # Missing results mean "unknown", never "nothing new".
    echo "  CAN'T COMPARE: $f is missing — run: verify.sh derive <dir> on both result dirs"
    return 1
  fi
  comm -13 "$BASE/$f" "$BR/$f" | sed 's/^/  /' | grep . && return 1
  return 0
}

cmd_compare() {
  BASE=$1 BR=$2
  local base=$1 br=$2 new=0 s b r
  for f in "$base/status" "$br/status"; do
    grep -q "^done$" "$f" 2>/dev/null || { echo "incomplete run: $f" >&2; exit 2; }
  done

  # Live-canister suites pass or fail depending on LAMBDA_IDENTITY, so runs with different
  # settings aren't comparable: every such suite would show up as new (or hide a regression).
  local lb lr
  lb=$(grep "^lambda=" "$base/status"); lr=$(grep "^lambda=" "$br/status")
  if [ "$lb" != "$lr" ]; then
    echo "WARNING: baseline ($lb) and branch ($lr) ran with different LAMBDA_IDENTITY settings."
    echo "         Unit-test results are not comparable. Re-run the baseline with the same setting"
    echo "         (delete $base and run /verify again)."
    new=1
  fi

  echo "== Stages (baseline → branch)"
  for s in install tsc_apps_nfid-frontend_tsconfig.app.json tsc_apps_nfid-frontend_tsconfig.spec.json \
           tsc_apps_nfid-frontend-e2e_tsconfig.json lint test build; do
    b=$(stage "$s" "$base"); r=$(stage "$s" "$br")
    if [ -z "$b" ] || [ -z "$r" ]; then
      # A stage missing from either run (e.g. an older cached baseline) is unknown, not ok.
      echo "  CAN'T COMPARE  $s (baseline: '${b}', branch: '${r}')"; new=1
    elif [ "$b" = 0 ] && [ "$r" != 0 ]; then echo "  NEW FAILURE  $s"; new=1
    else echo "  ok           $s ($b → $r)"; fi
  done

  local cfg
  for cfg in $TSC_CONFIGS; do
    new_lines "New tsc errors ($cfg)" "tsc_$(echo "$cfg" | tr / _).errors" || new=1
  done

  # A stage that already fails on main hides new errors in its exit code, so every stage
  # with parseable output is also compared line by line.
  new_lines "New lint errors (file: message rule)" lint-errors.txt || new=1
  new_lines "New build errors" build-errors.txt || new=1
  # Files, not just names: every suite that fails to load prints the same
  # "● Test suite failed to run", so a new one is only visible by its path.
  new_lines "New failing test files" failing-suites.txt || new=1
  new_lines "New failing unit tests (by name)" failing-tests.txt || new=1
  # A test target can also get worse without any new FAIL/● line: it crashes before running
  # (broken Jest config), or runs fewer passing tests. The test stage already fails on main,
  # so only these counts show it.
  new_lines "New failing test targets" failed-targets.txt || new=1
  echo "== Fewer passing suites/tests (per failing project)"
  if [ -f "$base/test-counts.txt" ] && [ -f "$br/test-counts.txt" ] && [ -f "$br/failed-targets.txt" ]; then
    local fewer
    fewer=$(awk -v failed="$(tr '\n' ' ' < "$br/failed-targets.txt")" '
      FNR == NR { bs[$1] = $2; bt[$1] = $3; next }
      { rs[$1] = $2; rt[$1] = $3 }
      END {
        for (p in bs) {
          if (p in rs) {
            if (rs[p] < bs[p] || rt[p] < bt[p])
              printf "  %s: suites passed %d → %d, tests passed %d → %d\n", p, bs[p], rs[p], bt[p], rt[p]
          } else if (index(" " failed " ", " " p ":test ")) {
            printf "  %s: test target failed without a Jest summary (tests did not run)\n", p
          }
        }
      }' "$base/test-counts.txt" "$br/test-counts.txt")
    [ -n "$fewer" ] && { echo "$fewer"; new=1; }
  else
    echo "  CAN'T COMPARE: test-counts.txt / failed-targets.txt missing — run: verify.sh derive <dir> on both"
    new=1
  fi
  echo "== Failing on baseline, passing on branch (informational)"
  if [ -f "$base/failing-tests.txt" ] && [ -f "$br/failing-tests.txt" ]; then
    comm -23 "$base/failing-tests.txt" "$br/failing-tests.txt" | sed 's/^/  /'
  fi

  new_lines "New peer-dependency warnings" peers.txt || new=1
  new_lines "New engine errors" engines.txt || new=1

  grep -q "lambda=unset" "$br/status" && echo "NOTE: LAMBDA_IDENTITY not set — live-canister unit tests can't be verified locally; CI runs them."
  echo
  [ "$new" = 0 ] && echo "RESULT: nothing new vs baseline" || echo "RESULT: new failures above"
  return $new
}

cmd_baseline_dir() {
  local sha
  # A stale origin/main would compare the branch against an old baseline.
  git fetch -q origin main 2>/dev/null || echo "warning: git fetch failed; using the local origin/main" >&2
  sha=$(git rev-parse origin/main) || exit 2
  local tmp=${TMPDIR:-/tmp}
  echo "${tmp%/}/nfid-verify/$sha"
}

case "${1:-}" in
  run) shift; cmd_run "$@" ;;
  derive) shift; cmd_derive "$@" ;;
  compare) shift; cmd_compare "$@" ;;
  baseline-dir) cmd_baseline_dir ;;
  *) sed -n '2,15p' "$0"; exit 2 ;;
esac
