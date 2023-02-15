import { chromeBrowser, chromeBrowserOptions } from "./src/browserOptions"
import { config as common } from "./wdio.conf"

export const deviceName = process.env.DEVICE_NAME
export const isHeadless = process.env.IS_HEADLESS

if (deviceName) {
  // chromeBrowserOptions.args.push('--window-size=500,900')
  chromeBrowserOptions.mobileEmulation = { deviceName }
}

if (isHeadless) {
  chromeBrowserOptions.args.push("--headless")
}

export const config = {
  ...common,
  capabilities: [chromeBrowser],
  cucumberOpts: {
    ...common,
    tagExpression: "@mobile",
  }
}
