import reporter, { Options } from "cucumber-html-reporter"

var options: Options = {
  theme: "bootstrap",
  brandTitle: "Test Summary",
  jsonDir: "test/reporter/json/",
  output: "test/reporter/cucumber_report.html",
  screenshotsDirectory: "test/reporter/screenshots/",
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

reporter.generate(options)

// trest
