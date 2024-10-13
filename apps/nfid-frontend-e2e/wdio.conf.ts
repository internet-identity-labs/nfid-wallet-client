import allureReporter from "@wdio/allure-reporter"
import cucumberJson from "wdio-cucumberjs-json-reporter"

import { ITestCaseHookParameter } from "@cucumber/cucumber"

import { chromeBrowser, chromeBrowserOptions } from "./src/browserOptions.js"
import { PickleResult, PickleStep } from "@wdio/types/build/Frameworks"

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
  // REFERENCE: https://webdriver.io/docs/configurationfile
  //
  // ====================
  // Runner Configuration
  // ====================
  //
  //
  // =====================
  // ts-node Configurations
  // =====================
  //
  // You can write tests using TypeScript to get autocompletion and type safety.
  // You will need typescript and ts-node installed as devDependencies.
  // WebdriverIO will automatically detect if these dependencies are installed
  // and will compile your config and tests for you.
  // If you need to configure how ts-node runs please use the
  // environment variables for ts-node or use wdio config's autoCompileOpts section.
  //

  runner: "local",
  autoCompileOpts: {
    autoCompile: true,
    // see https://github.com/TypeStrong/ts-node#cli-and-programmatic-options
    // for all available options
    tsNodeOpts: {
      transpileOnly: true,
      project: "tsconfig.json",
    },
    // tsconfig-paths is only used if "tsConfigPathsOpts" are provided, if you
    // do please make sure "tsconfig-paths" is installed as dependency
    // tsConfigPathsOpts: {
    //     baseUrl: './'
    // }
  },
  //
  // ==================
  // Specify Test Files
  // ==================
  // Define which test specs should run. The pattern is relative to the directory
  // from which `wdio` was called.
  //
  // The specs are defined as an array of spec files (optionally using wildcards
  // that will be expanded). The test for each spec file will be run in a separate
  // worker process. In order to have a group of spec files run in the same worker
  // process simply enclose them in an array within the specs array.
  //
  // If you are calling `wdio` from an NPM script (see https://docs.npmjs.com/cli/run-script),
  // then the current working directory is where your `package.json` resides, so `wdio`
  // will be called from there.
  //
  specs: ["./src/features/**/*.feature"],
  // Patterns to exclude.
  exclude: [
    // 'path/to/excluded/files'
  ],
  //
  // ============
  // Capabilities
  // ============
  // Define your capabilities here. WebdriverIO can run multiple capabilities at the same
  // time. Depending on the number of capabilities, WebdriverIO launches several test
  // sessions. Within your capabilities you can overwrite the spec and exclude options in
  // order to group specific specs to a specific capability.
  //
  // First, you can define how many instances should be started at the same time. Let's
  // say you have 3 different capabilities (Chrome, Firefox, and Safari) and you have
  // set maxInstances to 1; wdio will spawn 3 processes. Therefore, if you have 10 spec
  // files and you set maxInstances to 10, all spec files will get tested at the same time
  // and 30 processes will get spawned. The property handles how many capabilities
  // from the same test should run tests.
  //
  maxInstances: 1,
  // maxInstances: isDebug ? 1 : 10,
  //
  capabilities: [chromeBrowser],
  //
  // ===================
  // Test Configurations
  // ===================
  // Define all options that are relevant for the WebdriverIO instance here
  //
  // Level of logging verbosity: trace | debug | info | warn | error | silent
  logLevel: "error",
  //
  // Set specific log levels per logger
  // loggers:
  // - webdriver, webdriverio
  // - @wdio/browserstack-service, @wdio/devtools-service, @wdio/sauce-service
  // - @wdio/mocha-framework, @wdio/jasmine-framework
  // - @wdio/local-runner
  // - @wdio/sumologic-reporter
  // - @wdio/cli, @wdio/config, @wdio/utils
  // Level of logging verbosity: trace | debug | info | warn | error | silent
  // logLevels: {
  //     webdriver: 'info',
  //     '@wdio/appium-service': 'info'
  // },
  //
  // If you only want to run your tests until a specific amount of tests have failed use
  // bail (default is 0 - don't bail, run all tests).
  bail: 0,
  //
  // Set a base URL in order to shorten url command calls. If your `url` parameter starts
  // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
  // If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url
  // gets prepended directly.
  baseUrl: baseURL,
  //
  // Default timeout for all waitFor* commands.
  waitforTimeout: 10000,
  //
  // Default timeout in milliseconds for request
  // if browser driver or grid doesn't send response
  connectionRetryTimeout: 120000,
  //
  // Default request retries count
  connectionRetryCount: 2,
  //
  // Test runner services
  // Services take over a specific job you don't want to take care of. They enhance
  // your test setup with almost no effort. Unlike plugins, they don't add new
  // commands. Instead, they hook themselves up into the test process.
  // services: [],

  // Framework you want to run your specs with.
  // The following are supported: Mocha, Jasmine, and Cucumber
  // see also: https://webdriver.io/docs/frameworks
  //
  // Make sure you have the wdio adapter package for the specific framework installed
  // before running any tests.
  framework: "cucumber",
  //
  // The number of times to retry the entire specfile when it fails as a whole
  specFileRetries: 1,
  //
  // Delay in seconds between the spec file retry attempts
  // specFileRetriesDelay: 0,
  //
  // Whether or not retried specfiles should be retried immediately or deferred to the end of the queue
  // specFileRetriesDeferred: false,
  //
  // Test reporter for stdout.
  // The only one supported by default is 'dot'
  // see also: https://webdriver.io/docs/dot-reporter
  reporters: [
    "spec",
    [
      "allure",
      {
        outputDir: "allure-results",
        disableWebdriverStepsReporting: true,
        useCucumberStepReporter: true,
        addConsoleLogs: true,
      },
    ],
    [
      "json",
      {
        outputDir: "test/reporter",
        outputFileFormat: function() {
          return `cucumber_report.json`
        },
      },
    ],
    [
      "cucumberjs-json",
      {
        jsonFolder: "test/reporter/json",
        language: "en",
      },
    ],
  ],

  //
  // If you are using Cucumber you need to specify the location of your step definitions.
  // cucumberOpts,
  // ...hooks,

  cucumberOpts: {
    // <string[]> (file/dir) require files before executing features
    require: ["./src/steps/*.ts"],
    // <boolean> show full backtrace for errors
    backtrace: false,
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

  //
  // =====
  // Hooks
  // =====
  // WebdriverIO provides a several hooks you can use to interfere the test process in order to
  // enhance it and build services around it. You can either apply a single function to it or
  // an array of methods. If one of them returns with a promise,
  // WebdriverIO will wait until that promise is resolved to continue.
  //
  // export const hooks = {
  /**
   * Gets executed once before all workers get launched.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   */
  // onPrepare: () => {
  //   if (process.env.RUNNER === "LOCAL" && fs.existsSync("./allure-results")) {
  //     fs.rmdirSync(path.resolve(__dirname, "../allure-results"), {
  //       recursive: true,
  //     })
  //   }
  // },
  /**
   * Gets executed before a worker process is spawned & can be used to initialize specific service
   * for that worker as well as modify runtime environments in an async fashion.
   * @param  {String} cid    capability id (e.g 0-0)
   * @param  {[type]} caps   object containing capabilities for session
   * @param  {[type]} specs  specs to be run in the worker process
   * @param  {[type]} args   object that will be merged with the main
   *                         configuration once worker is initialized
   * @param  {[type]} execArgv list of string arguments passed to the worker process
   */
  // onWorkerStart: function (cid, caps, specs, args, execArgv) {
  // },
  /**
   * Gets executed just before initializing the webdriver session and test framework.
   * It allows you to manipulate configurations depending on the capability or spec.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   */
  // beforeSession: function (config, capabilities, specs) {
  // },
  /**
   * Gets executed before test execution begins. At this point you can access to all global
   * variables like `browser`. It is the perfect place to define custom commands.
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   */
  before: async function(capabilities: any, specs: any) {
    if (process.env.DEMO_APPLICATION_URL) console.info(`DEMO_APPLICATION_URL: ${process.env.DEMO_APPLICATION_URL}`)
    if (process.env.NFID_PROVIDER_URL) console.info(`NFID_PROVIDER_URL: ${process.env.NFID_PROVIDER_URL}`)
  },
  /**
   * Gets executed before the suite starts.
   * @param {Object} suite suite details
   */
  // beforeSuite: function (suite) {
  // },
  /**
   * This hook gets executed _before_ every hook within the suite starts.
   * (For example, this runs before calling `before`, `beforeEach`, `after`)
   *
   * (`stepData` and `world` are Cucumber-specific.)
   *
   */
  // beforeHook: function (test, context, stepData, world) {
  // },
  /**
   * Hook that gets executed _after_ every hook within the suite ends.
   * (For example, this runs after calling `before`, `beforeEach`, `after`, `afterEach` in Mocha.)
   *
   * (`stepData` and `world` are Cucumber-specific.)
   */
  // afterHook:function(test,context,{error, result, duration, passed, retries}, stepData,world) {
  // },
  /**
   * Function to be executed before a test (in Mocha/Jasmine) starts.
   */
  // beforeTest: function (test, context) {
  // },
  /**
   * Runs before a WebdriverIO command is executed.
   * @param {String} commandName hook command name
   * @param {Array} args arguments that the command would receive
   */
  // beforeCommand: function (commandName, args) {
  // },
  /**
   * Runs after a WebdriverIO command gets executed
   * @param {String} commandName hook command name
   * @param {Array} args arguments that command would receive
   * @param {Number} result 0 - command success, 1 - command error
   * @param {Object} error error object, if any
   */
  // afterCommand: function (commandName, args, result, error) {
  // },
  /**
   * Function to be executed after a test (in Mocha/Jasmine)
   */
  // afterTest: function (test, context, {error, result, duration, passed, retries}) {
  // },
  /**
   * Hook that gets executed after the suite has ended.
   * @param {Object} suite suite details
   */
  // afterSuite: function (suite) {
  // },
  /**
   * Gets executed after all tests are done. You still have access to all global variables from
   * the test.
   * @param {Number} result 0 - test pass, 1 - test fail
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  // after: function (result, capabilities, specs) {
  // },
  /**
   * Gets executed right after terminating the webdriver session.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  // afterSession: function (config, capabilities, specs) {
  // },
  /**
   * Gets executed after all workers have shut down and the process is about to exit.
   * An error thrown in the `onComplete` hook will result in the test run failing.
   * @param {Object} exitCode 0 - success, 1 - fail
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {<Object>} results object containing test results
   */
  // onComplete: function (exitCode, config, capabilities, results) {
  // },
  /**
   * Gets executed when a refresh happens.
   * @param {String} oldSessionId session ID of the old session
   * @param {String} newSessionId session ID of the new session
   */
  // onReload: function (oldSessionId, newSessionId) {
  // },
  /**
   * Cucumber-specific hooks
   */
  // beforeFeature: function (uri, feature, scenarios) {
  // },
  // beforeScenario: function (uri, feature, scenario, sourceLocation) {
  // },
  /**
   *
   * Runs before a Cucumber Scenario.
   * @param {ITestCaseHookParameter} world    world object containing information on pickle and test step
   * @param {Object}                 context  Cucumber World object
   */
  beforeScenario: async (world: any) => {
    console.info("Scenario: " + (<ITestCaseHookParameter>world).pickle.name)
    allureReporter.addFeature(world.name)
  },
  afterScenario: async () => {
    await browser.execute("window.localStorage.clear()")
  },
  // beforeStep: function ({uri, feature, step}, context) {
  // },
  // afterStep: function ({uri, feature, step}, context, {error, result, duration, passed}) {
  // },
  /**
   *
   * Runs after a Cucumber Step.
   * @param {Pickle.IPickleStep} step             step data
   * @param {IPickle}            scenario         scenario pickle
   * @param {Object}             result           results object containing scenario results
   * @param {boolean}            result.passed    true if scenario has passed
   * @param {string}             result.error     error stack if scenario failed
   * @param {number}             result.duration  duration of scenario in milliseconds
   * @param {Object}             context          Cucumber World object
   */
  afterStep: async function(step: PickleStep, scenario: any, result: PickleResult) {
    cucumberJson.attach(await browser.takeScreenshot(), "image/png")
    console.log(
      step.text + " " +
      (result.passed ? "\x1b[32mPASSED\x1b[0m" : "\x1b[31mFAILED\x1b[0m"),
    )
  },
  // afterScenario: function (uri, feature, scenario, result, sourceLocation) {
  // },
  // afterFeature: function (uri, feature, scenarios) {
  // }
  /**
   *
   * Runs after a Cucumber Feature.
   * @param {String}                   uri      path to feature file
   * @param {GherkinDocument.IFeature} feature  Cucumber feature object
   */
  // @ts-ignore
  afterFeature: async function(uri, feature) {
    // @ts-ignore browser
    allureReporter.addArgument("Browser", "Chrome")
    allureReporter.addArgument("Environment", baseURL)
    allureReporter.addArgument("Platform", process.platform)
  },
}
