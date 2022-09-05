import { config as common, isDebug } from "./wdio.conf"

export const config = {
  ...common,
  capabilities: [
    {
      browserName: "chrome",
      "goog:chromeOptions": {
        mobileEmulation: {
          deviceName: "Pixel 2",
        },
        args: [
          "--no-sandbox",
          ...(isDebug
            ? ["--auto-open-devtools-for-tabs", "--window-size=1200,896"]
            : ["--headless", "--window-size=414,896"]),
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--ignore-certificate-errors", // allow self-signed certificates
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
