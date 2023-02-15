import { chromeBrowser, chromeBrowserOptions } from "./src/browserOptions"
import { config as common } from "./wdio.conf"

export const isHeadless = process.env.IS_HEADLESS

if (isHeadless) {
  chromeBrowserOptions.args.push("--headless")
}

export const config = {
  ...common,
  capabilities: [chromeBrowser],
  cucumberOpts: {
    ...common,
    tagExpression: "not @pending and not @mobile",
  }
}
