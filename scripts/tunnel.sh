NGROK=./scripts/ngrok
if [ -f "$NGROK" ]; then
  # TODO:
  # - [ ] get port from .env
  # - [ ] get static configured subdomain
  $NGROK http 9090
else
  echo "you need to download and unzip ngrok in this folder"
  echo "https://dashboard.ngrok.com/get-started/setup"
fi
