import { config as common } from "./wdio.conf"

export const config = {
  ...common,

  hostname: "hub.browserstack.com",
  baseUrl: "http://bs-local.com:9090",
  capabilities: [
    {
      browserName: "ios",
      "bstack:options": {
        deviceName: "iPhone 12 Pro Max",
        osVersion: "16 Beta",
      },
    },
    {
      browserName: "android",
      "bstack:options": {
        deviceName: "Google Pixel 6 Pro",
        osVersion: "13.0",
      },
    },
    {
      browserName: "ios",
      "bstack:options": {
        deviceName: "iPad Air 4",
        osVersion: "14",
      },
    },
  ],
  commonCapabilities: {
    "bstack:options": {
      buildName: "browserstack-nfid-mobile",
    },
  },
  connection_settings: {
    local: true,
    local_identifier: "CypressLocalConnection1",
  },
  cucumberOpts: {
    ...common.cucumberOpts,
    tagExpression: "@mobile",
  },
}
