import {
  After,
  AfterAll,
  ITestCaseHookParameter,
  AfterStep,
  Before,
  BeforeAll,
  ITestStepHookParameter,
} from "@wdio/cucumber-framework"
import { browser } from "@wdio/globals"
import allureReporter from "@wdio/allure-reporter"
import type { Browser as PuppeteerBrowser, ConsoleMessage } from "puppeteer"

const baseURL = process.env.NFID_PROVIDER_URL ?? "http://localhost:9090"

let browserLogs: string[] = []

const getStepName = (step: ITestStepHookParameter): string =>
  step.pickleStep?.text ?? "Unknown step"

const getCaseLine = (scenario: ITestCaseHookParameter): number | undefined => {
  const astNodeId = scenario.pickle.astNodeIds.at(-1)

  if (!astNodeId) return undefined

  const findLine = (
    children: NonNullable<
      NonNullable<
        ITestCaseHookParameter["gherkinDocument"]["feature"]
      >["children"]
    >,
  ): number | undefined => {
    for (const child of children) {
      if (child.scenario) {
        if (child.scenario.id === astNodeId) {
          return child.scenario.location?.line
        }

        for (const examples of child.scenario.examples ?? []) {
          const exampleRow = examples.tableBody?.find(
            (row) => row.id === astNodeId,
          )

          if (exampleRow) {
            return exampleRow.location?.line
          }
        }
      }

      if (child.rule) {
        const ruleLine = findLine(child.rule.children)

        if (ruleLine) {
          return ruleLine
        }
      }
    }

    return undefined
  }

  const featureChildren = scenario.gherkinDocument.feature?.children

  if (!featureChildren) return undefined

  return findLine(featureChildren)
}

const getExampleArguments = (
  scenario: ITestCaseHookParameter,
): Array<[string, string]> => {
  const astNodeId = scenario.pickle.astNodeIds.at(-1)
  const featureChildren = scenario.gherkinDocument.feature?.children

  if (!astNodeId || !featureChildren) return []

  const findArguments = (
    children: NonNullable<
      NonNullable<
        ITestCaseHookParameter["gherkinDocument"]["feature"]
      >["children"]
    >,
  ): Array<[string, string]> => {
    for (const child of children) {
      if (child.scenario) {
        for (const examples of child.scenario.examples ?? []) {
          const exampleRow = examples.tableBody?.find(
            (row) => row.id === astNodeId,
          )

          if (!exampleRow) continue

          return exampleRow.cells.map((cell, index) => [
            examples.tableHeader?.cells[index]?.value ?? `arg${index + 1}`,
            cell.value,
          ])
        }
      }

      if (child.rule) {
        const ruleArguments = findArguments(child.rule.children)

        if (ruleArguments.length) {
          return ruleArguments
        }
      }
    }

    return []
  }

  return findArguments(featureChildren)
}

BeforeAll(async function () {
  if (process.env.DEMO_APPLICATION_URL)
    console.warn(`DEMO_APPLICATION_URL: ${process.env.DEMO_APPLICATION_URL}`)
  if (process.env.NFID_PROVIDER_URL)
    console.warn(`NFID_PROVIDER_URL: ${process.env.NFID_PROVIDER_URL}`)

  type BrowserWithPuppeteer = WebdriverIO.Browser & {
    getPuppeteer(): Promise<PuppeteerBrowser>
  }
  const client = await (browser as BrowserWithPuppeteer).getPuppeteer()
  const page = (await client.pages())[0]
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "warn" || msg.type() === "error") {
      const entry = `[${msg.type().toUpperCase()}] ${msg.text()}`
      browserLogs.push(entry)
    }
  })
})

Before(async function (scenario: ITestCaseHookParameter) {
  const scenarioLine = getCaseLine(scenario)
  const caseReference = scenarioLine
    ? `${scenario.pickle.uri}:${scenarioLine}`
    : `${scenario.pickle.uri}:${scenario.pickle.id}`

  console.warn(`Scenario: ${scenario.pickle.name} [${caseReference}]`)
  allureReporter.addSubSuite(caseReference)
  allureReporter.addArgument("Browser", "Chrome")
  allureReporter.addArgument("Environment", baseURL)
  allureReporter.addArgument("Platform", process.platform)
  allureReporter.addArgument("Case", caseReference)

  for (const [name, value] of getExampleArguments(scenario)) {
    allureReporter.addArgument(name, value)
  }
})

AfterStep(async function (step: ITestStepHookParameter): Promise<void> {
  if (!step.pickleStep) return
  console.warn(
    getStepName(step) +
      " " +
      (step.result?.status === "PASSED"
        ? "\x1b[32mPASSED\x1b[0m"
        : "\x1b[31mFAILED\x1b[0m"),
  )
  if (browserLogs.length) {
    allureReporter.addAttachment(
      "Browser Console",
      browserLogs.join("\n"),
      "text/plain",
    )
    browserLogs = []
  }

  try {
    const screenshot = await browser.takeScreenshot()
    allureReporter.addAttachment(
      `Step Screenshot - ${getStepName(step)}`,
      Buffer.from(screenshot, "base64"),
      "image/png",
    )
  } catch (error) {
    console.warn(`Failed to capture step screenshot: ${error}`)
  }
})

After(async () => {
  await browser.execute(() => {
    const dbNames = ["authstate", "profile-db", "ttl-db", "domainkey-db"]
    for (const name of dbNames) indexedDB.deleteDatabase(name)
    localStorage.clear()
    sessionStorage.clear()
  })
  await browser.deleteCookies()
})

AfterAll(async function () {})
