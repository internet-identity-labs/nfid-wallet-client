import { defineManifest } from "@crxjs/vite-plugin"

import { version } from "./package-json"

export default defineManifest((env) => ({
  manifest_version: 3,
  name: "NFID Wallet",
  description: "NFID Wallet description",
  version,
  version_name: version,
  icons: {
    "128": "logo.png",
  },
  action: { default_popup: "index.html" },
  background: {
    service_worker: "src/scripts/background.ts",
  },
  permissions: [
    "storage",
    "identity",
    "identity.email",
    "activeTab",
    "contextMenus",
  ],
  optional_host_permissions: ["https://*/*", "http://*/*"],
  host_permissions: [
    "https://www.developer.chrome.com/*",
    "https://accounts.google.com/*",
    "https://ic0.app/*",
    "https://*.ic0.app/*",
    "https://*.icp0.io/*",
    "https://rosetta-api.internetcomputer.org/*",
    "https://free.currconv.com/*",
    "https://us-central1-entrepot-api.cloudfunctions.net/*",
    "https://stats.g.doubleclick.net/g/collect",
    "https://registry.walletconnect.com/*",
    "wss://*.bridge.walletconnect.org/*",
    "https://mempool.space/*",
    "https://api.blockcypher.com/*",
    "https://api.coinbase.com/*",
    "https://api.pro.coinbase.com/*",
    "https://icp-api.io/*",
    "https://api.nftgeek.app/*",
    "https://toniq.io/*",
    "https://stat.yuku.app/*",
    "https://memecake.io/*",
    "https://ia15v0pzlb.execute-api.us-east-1.amazonaws.com/*",
  ],
  oauth2: {
    client_id:
      "1089802819081-76qi2na9op8ke4isk3kuo30b2ga7gjqn.apps.googleusercontent.com",
    scopes: ["openid", "email", "profile"],
  },
  web_accessible_resources: [
    {
      resources: ["scripts/gsi-client.js"],
      matches: ["http://*/*", "https://*/*"],
    },
  ],
}))
