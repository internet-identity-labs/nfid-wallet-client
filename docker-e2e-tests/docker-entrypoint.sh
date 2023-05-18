#! /bin/bash

WORKDIR="${WORKDIR:-/home/user/workdir}"
BACKEND_PORT="${BACKEND_PORT:-9090}"
CI_DEBUG="${CI_DEBUG:-false}"
exit_code=0

source /usr/src/CI_OUTPUT.sh

if ! pushd "${WORKDIR}" > /dev/null; then
    ci_echo_error "Can't switch directory to '${WORKDIR}'" >&2
    exit 1
fi


ci_echo_title "Current configuration" "warn" >&2
ci_echo_info "
WORKDIR=${WORKDIR}
BACKEND_PORT=${BACKEND_PORT}
YARN=$(yarn --version)
CHROME=$(chrome --version)
NPM=$(npm --version)

WORKDIR=${WORKDIR}
BACKEND_PORT=${BACKEND_PORT}

CI_DEBUG=${CI_DEBUG}

Additional test params: $@
" >&2

ci_echo_info "Building backend on port '${BACKEND_PORT}' ..." >&2
ci_echo_debug "yarn --prefer-offline" >&2
yarn --prefer-offline

ci_echo_debug "npx env-cmd -f .env.staging nx build nfid-frontend" >&2
npx env-cmd -f .env.staging nx build nfid-frontend

ci_echo_info "Running backend on port '${BACKEND_PORT}' ..." >&2
ci_echo_debug "yarn serve -l ${BACKEND_PORT} -s dist/apps/nfid-frontend > /dev/null 2>&1 &" >&2
yarn serve -l ${BACKEND_PORT} -s dist/apps/nfid-frontend > /dev/null 2>&1 &


ci_echo_info "Preparing and Running tests ..." >&2
ci_echo_debug "npx nx clean nfid-frontend-e2e" >&2
npx nx clean nfid-frontend-e2e

ci_echo_debug "IS_HEADLESS='true' npx env-cmd -f .env.dev nx test:e2e nfid-frontend-e2e $@" >&2
IS_HEADLESS='true' npx env-cmd -f .env.dev nx test:e2e nfid-frontend-e2e $@ || exit_code=$?

if [ "${exit_code}" -eq 0 ]; then
    status='success'
else
    status='error'
fi

ci_echo_title "Finished ( exit code ${exit_code} )" "${status}" >&2
exit ${exit_code}
