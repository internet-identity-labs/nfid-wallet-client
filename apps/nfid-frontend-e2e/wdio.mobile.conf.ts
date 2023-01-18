import { config as common, isDebug } from "./wdio.conf"
import { chromeBrowser } from "./src/browserOptions"


export const config = {
  ...common,
  capabilities: [
    chromeBrowser
  ],
  cucumberOpts: {
    ...common.cucumberOpts,
    tagExpression: "@mobile"
  },
}
