#!/bin/sh

. .env.local
NGROK=./scripts/ngrok

if [ -f "$NGROK" ]; then
  $NGROK http --region=eu --hostname=${VITE_MULTIPASS_DOMAIN} 5001
else
  echo "you need to download and unzip ngrok in this folder"
  echo "https://dashboard.ngrok.com/get-started/setup"
fi
