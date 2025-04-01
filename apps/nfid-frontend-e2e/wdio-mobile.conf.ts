import { config as desktopConfig } from "./wdio.conf.js"
import { mobileChromeBrowser } from "./src/browserOptions.js"
import Video from "wdio-video-reporter"

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
      Video,
      {
        saveAllVideos: true,
        videoSlowdownMultiplier: 3,
        outputDir: "src/reporter/mobile/video",
      },
    ],
  ],
})
