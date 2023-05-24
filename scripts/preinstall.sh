#!/usr/bin/env bash

[ -z ${CF_PAGES+x} ] && exit 0

cat >.npmrc <<EOF
@psychedelic:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${PSYCHEDELIC_GH_NPM_REGISTRY}
EOF
exit 1
