import { config as common } from "./wdio.conf"

export const config = {
  ...common,
  user: "philipplitzenber_bPNyfo",
  key: "faaS9WisBd4BqfFnyoEz",
  hostname: "hub.browserstack.com",
  capabilities: [
    {
      browserName: "chrome",
      browserVersion: "104.0",
      "bstack:options": {
        os: "Windows",
        osVersion: "11",
      },
    },
  ],
  commonCapabilities: {
    "bstack:options": {
      buildName: "browserstack-nfid-mobile",
    },
  },
  cucumberOpts: {
    ...common.cucumberOpts,
    tagExpression: "not @mobile",
  },
}
