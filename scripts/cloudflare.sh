#!/bin/bash

echo "variable CF_PAGES_BRANCH: $CF_PAGES_BRANCH"

# On production branch
if [ "$CF_PAGES_BRANCH" = "production" ]; then
  echo "Building production branch with .env.production"
  npx env-cmd -f .env.production nx build nfid-frontend

# On staging branch
elif [ "$CF_PAGES_BRANCH" = "staging" ]; then
  echo "Building staging branch with .env.staging"
  npx env-cmd -f .env.staging nx build nfid-frontend

# all other branches
else
  echo "Building branch: $CF_PAGES_BRANCH with .env.dev"
  npx env-cmd -f .env.dev nx build nfid-frontend
fi
