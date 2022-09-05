import { config as common, isDebug } from "./wdio.conf"

export const config = {
  ...common,
  capabilities: [
    {
      browserName: "chrome",
      "goog:chromeOptions": {
        args: [
          "--no-sandbox",
          ...(isDebug
            ? []
            : [
                "--headless",
                "--disable-dev-shm-usage",
                "--auto-open-devtools-for-tabs",
              ]),
          "disable-gpu",
          "--ignore-certificate-errors", // allow self-signed certificates
          "use-mobile-user-agent",
          "user-agent=Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3",
        ],
      },
      acceptInsecureCerts: true,
    },
  ],
  cucumberOpts: {
    ...common.cucumberOpts,
    tagExpression: "@mobile",
  },
}
