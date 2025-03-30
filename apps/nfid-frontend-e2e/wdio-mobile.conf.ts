import { config as desktopConfig } from "./wdio.conf.js"
import { mobileChromeBrowser } from "./src/browserOptions.js"

export const config = Object.assign({}, desktopConfig, {
  capabilities: [mobileChromeBrowser],
  reporters: [
    "spec",
    [
      "allure",
      {
        outputDir: "apps/nfid-frontend-e2e/src/reporter/mobile/allure-results"
        ,
      },
    ],
    [
      "video",
      {
        outputDir: "apps/nfid-frontend-e2e/src/reporter/mobile/video",
      },
    ],
  ],
})
