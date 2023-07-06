import { chromeBrowser, chromeBrowserOptions } from "./src/browserOptions.js"
import { cucumberOpts } from "./src/cucumber-options.js"
import { config as common } from "./wdio.conf.js"

export const deviceName = process.env.DEVICE_NAME

if (deviceName) {
  chromeBrowserOptions.args.push("--window-size=500,900")
  chromeBrowserOptions.mobileEmulation = { deviceName }
}

export const config: WebdriverIO.Config = {
  ...common,
  capabilities: [chromeBrowser],
  cucumberOpts: {
    ...cucumberOpts,
    tagExpression: "@mobile",
  },
}
