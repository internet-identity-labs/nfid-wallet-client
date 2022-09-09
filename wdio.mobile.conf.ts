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
            ? [
                // "--auto-open-devtools-for-tabs",
                // "--window-size=1200,896"
              ]
            : [
                "--headless",
                // "--window-size=414,896"
              ]),
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--ignore-certificate-errors", // allow self-signed certificates
          "--use-mobile-user-agent",
          "--user-agent='Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'",
          "--window-size=414,896",
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
