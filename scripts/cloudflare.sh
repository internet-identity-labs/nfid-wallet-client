# !/bin/bash

# On production branch
if [ "$CF_PAGES_BRANCH" == "production" ]; then
  npx env-cmd -f .env.production nx build nfid-frontend

# On staging branch
elif [ "$CF_PAGES_BRANCH" == "staging" ]; then
  npx env-cmd -f .env.staging nx build nfid-frontend

# all other branches
else
  npx env-cmd -f .env.dev nx build nfid-frontend
fi
