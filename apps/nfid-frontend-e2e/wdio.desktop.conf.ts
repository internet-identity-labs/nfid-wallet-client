import { cucumberOpts } from "./src/cucumber-options"
import { chromeBrowser } from "./src/browserOptions"
import { config as common } from "./wdio.conf"


export const config: WebdriverIO.Config = {
  ...common,
  capabilities: [chromeBrowser],
  cucumberOpts: {
    ...cucumberOpts,
    tagExpression: "not @pending and not @mobile",
  }
}
