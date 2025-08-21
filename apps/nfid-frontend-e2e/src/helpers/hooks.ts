import { After, AfterAll, AfterStep, Before, BeforeAll, ITestStepHookParameter } from "@wdio/cucumber-framework"
import { browser } from "@wdio/globals"
import allureReporter from "@wdio/allure-reporter"
import { ConsoleMessage } from "puppeteer"

const baseURL = process.env.NFID_PROVIDER_URL ?? "http://localhost:9090"

let browserLogs: string[] = []

BeforeAll(async function() {
  if (process.env.DEMO_APPLICATION_URL) console.info(`DEMO_APPLICATION_URL: ${process.env.DEMO_APPLICATION_URL}`)
  if (process.env.NFID_PROVIDER_URL) console.info(`NFID_PROVIDER_URL: ${process.env.NFID_PROVIDER_URL}`)

  const client = await (browser as any).getPuppeteer()
  const page = (await client.pages())[0]
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "warn" || "error") {
      const entry = `[${msg.type().toUpperCase()}] ${msg.text()}`
      browserLogs.push(entry)
    }
  })
})

// BeforeAll(async () => {
//   if (process.env.DEMO_APPLICATION_URL) console.info(`DEMO_APPLICATION_URL: ${process.env.DEMO_APPLICATION_URL}`)
//   if (process.env.NFID_PROVIDER_URL) console.info(`NFID_PROVIDER_URL: ${process.env.NFID_PROVIDER_URL}`)
//
//   await (browser as any).sessionSubscribe({ events: ["log.entryAdded"] })
//
//   ;(browser as any).on("log.entryAdded", (entry: any) => {
//     const level = String(entry?.level ?? "info").toUpperCase()
//     const text = String(entry?.text ?? "")
//     browserLogs.push(`[${level}] ${text}`)
//   })
// })

Before(async function(scenario) {
  console.info("Scenario: " + scenario.pickle.name)
  allureReporter.addArgument("Browser", "Chrome")
  allureReporter.addArgument("Environment", baseURL)
  allureReporter.addArgument("Platform", process.platform)
})

AfterStep(async function(step: ITestStepHookParameter): Promise<void> {
  if (!step.pickleStep) return
  console.info(step.pickleStep.text + " " +
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

AfterAll(async function() {
})
