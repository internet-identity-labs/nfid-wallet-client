import { config as desktopConfig } from "./wdio.conf.js"
import { mobileChromeBrowser } from "./src/browserOptions.js"

export const config = Object.assign({}, desktopConfig, {
  capabilities: [mobileChromeBrowser],
  reporters: [
    "spec",
    [
      "allure",
      {
        outputDir: "src/reporter/mobile/allure-results",
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: true,
        useCucumberStepReporter: true,
        addConsoleLogs: true,
      },
    ],
    [
      "video",
      {
        outputDir: "src/reporter/mobile/video",
        saveAllVideos: true,
        videoSlowdownMultiplier: 3,
      },
    ],
  ],
})
