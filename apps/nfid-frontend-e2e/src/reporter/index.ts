import reporter, { Options } from "cucumber-html-reporter"
import path from "path"

const options: Options = {
  theme: "bootstrap",
  brandTitle: "Test Summary",
  jsonDir: path.join(__dirname, "../../test/reporter/json/"),
  output: path.join(__dirname, "../../test/reporter/cucumber_report.html"),
  screenshotsDirectory: path.join(
    __dirname,
    "../../test/reporter/screenshots/",
  ),
  storeScreenshots: true,
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  ignoreBadJsonFile: true,
  launchReport: false,
  metadata: {
    "App Version": "0.3.2",
    "Test Environment": "STAGING",
    Browser: "Chrome  54.0.2840.98",
    Platform: "Windows 10",
    Parallel: "Scenarios",
    Executed: "Remote",
  },
}

console.log(">> ", { options })

reporter.generate(options)
