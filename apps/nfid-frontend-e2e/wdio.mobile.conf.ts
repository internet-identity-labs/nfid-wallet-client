import { cucumberOpts } from "./src/cucumber-options"
import { chromeBrowser, chromeBrowserOptions } from "./src/browserOptions"
import { config as common } from "./wdio.conf"

export const deviceName = process.env.DEVICE_NAME

if (deviceName) {
  // chromeBrowserOptions.args.push('--window-size=500,900')
  chromeBrowserOptions.mobileEmulation = { deviceName }
}

export const config: WebdriverIO.Config = {
  ...common,
  capabilities: [chromeBrowser],
  cucumberOpts: {
    ...cucumberOpts,
    tagExpression: "@mobile"
  }
}
