import { chromeBrowser } from "./src/browserOptions"
import { config as common, isDebug } from "./wdio.conf"

export const config = {
  ...common,
  capabilities: [chromeBrowser],
  cucumberOpts: {
    ...common.cucumberOpts,
    tagExpression: "@mobile",
  },
}
