#!/bin/bash

echo "variable NETWORK_NAME : ${NETWORK_NAME}"

case ${NETWORK_NAME} in
dev)
    echo "Building ${NETWORK_NAME} branch with .env.${NETWORK_NAME}"
    npx env-cmd -f .env.ic nx build nfid-frontend
    ;;
*)
    # all other branches
    echo "Building ${NETWORK_NAME} branch with .env.${NETWORK_NAME}"
    npx env-cmd -f .env.${NETWORK_NAME} nx build nfid-frontend
    ;;
esac
