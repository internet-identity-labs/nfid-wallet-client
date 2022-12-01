import { After, Status } from "@cucumber/cucumber"
import cucumberJson from "wdio-cucumberjs-json-reporter"

After(async function () {
  // @ts-ignore
  if (browser.capabilities.browserName === "chrome") {
    const browserLogs = await browser.getLogs("browser")
    cucumberJson.attach(
      JSON.stringify(browserLogs, null, 2),
      "application/json",
    )
  }
})
