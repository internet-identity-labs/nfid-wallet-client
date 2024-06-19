#!/bin/bash

echo "variable CF_PAGES_BRANCH: $CF_PAGES_BRANCH"

case ${CF_PAGES_BRANCH} in
stage)
    # On stage branch
    echo "Building stage branch with .env.stage"
    npx env-cmd -f .env.stage nx build nfid-frontend
    ;;
production)
    # On production branch
    echo "Building production branch with .env.production"
    npx env-cmd -f .env.production nx build nfid-frontend
    ;;
*)
    # all other branches
    echo "Building branch: $CF_PAGES_BRANCH with .env.dev"
    npx env-cmd -f .env.test nx build nfid-frontend
    ;;
esac
