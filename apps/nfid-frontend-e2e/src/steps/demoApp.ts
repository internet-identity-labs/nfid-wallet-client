import { Given, Then, When } from "@cucumber/cucumber"

import DemoTransactions from "../pages/demoApp/demo-transactions.js"
import DemoUpdateDelegation from "../pages/demoApp/demo-updateDelegation.js"
import DemoAppPage from "../pages/demoApp/demoApp-page.js"

Given(/^User opens the demoApp ?(.*)?$/, async function() {
  await browser.url(DemoAppPage.demoAppBaseUrl)
})

When(
  /^User sends ?(.*)? ([^"]*) to (.*) through demoApp$/,
  async (amount: number, FT: string, address: string) => {
    FT == "ICP"
      ? await DemoTransactions.sendICPTransaction(amount, address)
      : await DemoTransactions.sendNFTTransaction(address)
  },
)

When(
  /^User updates list of targets by (.*)( and (.*))?$/,
  async (targets: string, derivation?: string) => {
    await DemoUpdateDelegation.updateDelegation(targets, derivation)
  },
)

Then(
  /^Verifying that Principal, Address, Targets are correct:/,
  async (data) => {
    let expectedData = data.rowsHash()
    let usersData = await DemoAppPage.getAuthLogs()

    expect(
      String(
        (usersData.get("principal").firstAddressPart.getText()) +
        "..." +
        ((
          await usersData.get("principal")
        ).secondAddressPart.getText()),
      ),
    ).toEqual(
      expectedData.principal.substring(0, 29) +
      "..." +
      expectedData.principal.substring(58, 63),
    )

    expect(
      String(
        (await (await usersData.get("address")).firstAddressPart.getText()) +
        "..." +
        (await (await usersData.get("address")).secondAddressPart.getText()),
      ),
    ).toEqual(
      expectedData.address.substring(0, 29) +
      "..." +
      expectedData.address.substring(59, 64),
    )

    await browser.waitUntil(
      async () => {
        let usersData = await DemoAppPage.getAuthLogs()
        let targets = String(usersData.get("targets"))
          .trim()
          .replace(/^[+\-\s]*/gm, "")
          .trim()
          .split("\n")
          .map((str) => str.trim())
          .join(",")
        return targets == expectedData.targets
      },
      {
        timeout: 50000,
        timeoutMsg: `Incorrect number of targets. Expected ${
          expectedData.targets
        } but was ${String(usersData.get("targets"))
          .trim()
          .replace(/^[+\-\s]*/gm, "")
          .trim()
          .split("\n")
          .map((str) => str.trim())
          .join(",")}`,
      },
    )
  },
)

Then(/^Assert ([^"]*) code block has hash$/, async (block: string) => {
  const response = await (
    await DemoTransactions.getEXTTResponseBlock(block)
  ).getText()
  let responseTrim = response.trim().replace(/(?<!["\d])\b\d+\b(?!["\d])/g, "")
  let responseJSON = JSON.parse(responseTrim)

  let errors: string[] = []
  Object.keys(responseJSON).forEach((it) => {
    if (it == "error") errors.push(`\n${responseJSON[it]}`)
  })

  if (errors.length > 0)
    throw new Error(
      `Incorrect response message. Expected to contain 'hash', but there were errors: \n${errors}`,
    )
})

Then(
  /^Check request details ([^"]*) equals to ([^"]*)$/,
  async (FT: string, details: string) => {
    const embed = await DemoTransactions.getEmbed()
    const screenModal = await DemoTransactions.getScreenModal()

    await browser.switchToFrame(embed)
    await DemoTransactions.getApproveButton.waitForDisplayed({
      timeout: 10000,
      timeoutMsg: "Approve Transfer modal windows isn't appeared",
    })
    expect(await DemoTransactions.getFTDetails(FT).getText()).toEqual(details)
    await DemoTransactions.getApproveButton.waitForDisplayed({
        timeout: 10000,
        timeoutMsg: "ApproveButton is still not displayed after 10 sec",
      })
    await DemoTransactions.getApproveButton.click()

    await screenModal.waitForDisplayed({
      reverse: true,
      timeout: 100000,
      timeoutMsg: "The screenModal is still visible.",
    })
    await browser.switchToParentFrame()
  },
)
