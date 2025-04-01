import Video from "wdio-video-reporter"
import { chromeBrowser, chromeBrowserOptions } from "./src/browserOptions.js"

export const isHeadless = process.env.IS_HEADLESS === "true"
export const isDebug = process.env.DEBUG === "true"
export const hostName = process.env.HOST_NAME
export const hostPath = process.env.HOST_PATH
export const baseURL = process.env.NFID_PROVIDER_URL
  ? process.env.NFID_PROVIDER_URL
  : "http://localhost:9090"

if (isHeadless) {
  chromeBrowserOptions.args.push("--headless=new")
}

export const config: WebdriverIO.Config = {
  runner: "local",
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      transpileOnly: true,
      project: "tsconfig.json",
    },
  },
  specs: ["./src/features/**/*.feature"],
  // Patterns to exclude.
  exclude: [
    // 'path/to/excluded/files'
  ],
  maxInstances: 5,
  capabilities: [chromeBrowser],
  logLevel: "error",
  bail: 0,
  baseUrl: baseURL,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 2,
  framework: "cucumber",
  specFileRetries: 1,
  reporters: [
    "spec",
    [
      "allure",
      {
        outputDir: "src/reporter/allure-results",
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
        outputDir: "src/reporter/video",
      },
    ],
  ],

  cucumberOpts: {
    // <string[]> (file/dir) require files before executing features
    require: [
      "./src/steps/**/*.ts",
      "./src/helpers/hooks.ts",
      "./src/helpers/parameterTypes.ts",
    ],
    // <boolean> show full backtrace for errors
    backtrace: true,
    // <string[]> ("extension:module") require files with the given EXTENSION after requiring MODULE (repeatable)
    requireModule: [],
    // <boolean> invoke formatters without executing steps
    dryRun: false,
    // <boolean> abort the run on first failure
    failFast: false,
    // <boolean> hide step definition snippets for pending steps
    snippets: true,
    // <boolean> hide source uris
    source: true,
    // <boolean> fail if there are any undefined or pending steps
    strict: false,
    // <string> (expression) only execute the features or scenarios with tags matching the expression
    tagExpression: "not @pending and not @mobile",
    // <number> timeout for step definitions
    timeout: 150000,
    // <boolean> Enable this config to treat undefined definitions as warnings.
    ignoreUndefinedDefinitions: false,
  },
}
