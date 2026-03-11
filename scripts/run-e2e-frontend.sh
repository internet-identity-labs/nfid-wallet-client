#!/usr/bin/env bash
set -euo pipefail

# Run NFID Wallet E2E tests against a built frontend bundle.
# - Builds the app with .env.test (by default)
# - Serves dist/apps/nfid-frontend on port 9090
# - Runs nx test:e2e nfid-frontend-e2e with any extra args
#
# Usage:
#   ./scripts/run-e2e-frontend.sh
#   ./scripts/run-e2e-frontend.sh -- --cucumberOpts.tagExpression='@sendft'
#
# Env:
#   ENV_FILE (optional) - defaults to .env.test

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-.env.test}"
# Use a separate port from the dev server to avoid conflicts
PORT="${PORT:-9091}"

cd "${ROOT_DIR}"

echo "Using ENV_FILE=${ENV_FILE}"

TMP_ENV_FILE="${ENV_FILE}.e2e"
cp "${ENV_FILE}" "${TMP_ENV_FILE}"
echo "Overriding NFID_PROVIDER_URL in ${TMP_ENV_FILE} to http://localhost:${PORT}"
perl -pi -e 's|^NFID_PROVIDER_URL=.*$|NFID_PROVIDER_URL=http://localhost:'"${PORT}"'|g' "${TMP_ENV_FILE}"

echo "Building NFID frontend for E2E..."
npx env-cmd -f "${TMP_ENV_FILE}" nx build nfid-wallet-client

# Ensure asset URLs in the built index.html are absolute so that when the
# app is opened at /wallet/* the browser still loads main.css/js from "/".
INDEX_HTML="dist/apps/nfid-frontend/index.html"
if [ -f "${INDEX_HTML}" ]; then
  echo "Normalizing asset URLs in ${INDEX_HTML}..."
  perl -pi -e 's|href="styles.css"|href="/styles.css"|g;
               s|href="main.css"|href="/main.css"|g;
               s|src="runtime.js"|src="/runtime.js"|g;
               s|src="styles.js"|src="/styles.js"|g;
               s|src="main.js"|src="/main.js"|g;' "${INDEX_HTML}"
fi

echo "Starting static server on port ${PORT}..."
npx serve -s "dist/apps/nfid-frontend" -l "${PORT}" >/dev/null 2>&1 &
SERVER_PID=$!

cleanup() {
  echo "Stopping static server (pid=${SERVER_PID})..."
  kill "${SERVER_PID}" >/dev/null 2>&1 || true
  rm -f "${TMP_ENV_FILE}"
}
trap cleanup EXIT

echo "Waiting for server to be ready..."
sleep 10

echo "Running E2E tests..."
npx env-cmd -f "${TMP_ENV_FILE}" nx test:e2e nfid-frontend-e2e "$@"

