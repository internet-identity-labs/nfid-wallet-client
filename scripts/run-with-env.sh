#!/bin/bash
# Helper script to run commands with the appropriate .env file
# Usage: ./scripts/run-with-env.sh <command> [args...]
#
# Set ENV_FILE to use a specific environment file, defaults to .env.local
# Examples:
#   ./scripts/run-with-env.sh nx serve nfid-wallet-client
#   ENV_FILE=.env.dev ./scripts/run-with-env.sh nx build nfid-wallet-client
#   ENV_FILE=.env.test ./scripts/run-with-env.sh nx test

set -e

# Default to .env.local if ENV_FILE is not set
ENV_FILE="${ENV_FILE:-.env.local}"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

ENV_PATH="${PROJECT_ROOT}/${ENV_FILE}"

# Check if the env file exists
if [ ! -f "${ENV_PATH}" ]; then
  echo "Error: Environment file '${ENV_PATH}' not found" >&2
  echo "Available env files:" >&2
  ls -1 "${PROJECT_ROOT}"/.env* 2>/dev/null || echo "  No .env files found" >&2
  exit 1
fi

echo "Using environment file: ${ENV_FILE}" >&2

# Run the command with env-cmd
npx env-cmd -f "${ENV_PATH}" "$@"
