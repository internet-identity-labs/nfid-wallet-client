#!/bin/sh

. .env.local
NGROK=./scripts/ngrok

if [ -f "$NGROK" ]; then
  $NGROK http --region=eu --hostname=${VITE_MULTIPASS_DOMAIN} ${MULTIPASS_PORT}
else
  echo "you need to download and unzip ngrok in this folder"
  echo "https://dashboard.ngrok.com/get-started/setup"
fi
