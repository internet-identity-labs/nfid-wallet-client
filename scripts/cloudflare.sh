#!/bin/bash

echo "variable CF_PAGES_BRANCH: $CF_PAGES_BRANCH"

case ${CF_PAGES_BRANCH} in
    staging)
        # On staging branch
        echo "Building staging branch with .env.staging"
        npx env-cmd -f .env.staging nx build nfid-frontend
        ;;
    production)
        # On production branch
        echo "Building production branch with .env.production"
        npx env-cmd -f .env.production nx build nfid-frontend
        ;;
    *)
        # all other branches
        echo "Building branch: $CF_PAGES_BRANCH with .env.dev"
        npx env-cmd -f .env.dev nx build nfid-frontend
esac
