import { Then } from "@cucumber/cucumber"
import cucumberJson from "wdio-cucumberjs-json-reporter"

import { softAssertAll } from "../helpers/softAssertions.js"
import Activity from "../pages/activity.js"
import Assets from "../pages/assets.js"
import DemoTransactions from "../pages/demoApp/demo-transactions.js"
import DemoAppPage from "../pages/demoApp/demoApp-page.js"
import Nft from "../pages/nft.js"
import Profile from "../pages/profile.js"

Then(/^User toggle checkbox "([^"]*)?"$/, async function (selector: string) {
  await $(selector).click()
})

Then(/^Asset appears with label ([^"]*)$/, async (label: string) => {
  await Assets.tokenLabel(label).waitForDisplayed({
    timeout: 15000,
  })
})

Then(/^Verifying that only (\d+) asset displayed/, async (amount: number) => {
  await Profile.waitForTokens(amount)
})

Then(
  /^([^"]*) appears with ([^"]*) on ([^"]*) and not 0 balance$/,
  async (tokenName: string, currency: string, category: string) => {
    await softAssertAll(
      async () =>
        expect(await (await Assets.tokenBalance(tokenName)).getText()).not.toBe(
          "0",
        ),
      async () =>
        expect(await (await Assets.getCurrency(tokenName)).getText()).toContain(
          currency,
        ),
      async () =>
        expect(await (await Assets.getBlockchain(category)).isDisplayed()).toBe(
          true,
        ),
    )
  },
)

Then(/^Wait while ([^"]*) accounts calculated$/, async (text: string) => {})

Then(
  /^Wait while ([^"]*) asset calculated with currency ([^"]*)$/,
  async (tokenName: string, balance: string) => {
    await Assets.tokenBalance(tokenName).waitForExist({ timeout: 20000 })
    console.log(await Assets.tokenBalance(tokenName).getText())
    expect(Assets.tokenBalance(tokenName)).not.toHaveText(`0 ${balance}`)
  },
)

Then(/^User opens receive dialog window/, async () => {
  await Assets.receiveDialog()
})

Then(/^User opens send dialog window/, async () => {
  await Assets.sendDialog()
})

Then(/^User opens send nft dialog window/, async () => {
  await Assets.sendNFTDialog()
})

Then(/^User opens choose nft window/, async () => {
  await Assets.chooseNFTinSend.click()
})

Then(/^Verifying that user sees option ([^"]*) in dropdown/, async (option: string) => {
  await Assets.getTokenByNameInSend(option).waitForExist({ timeout: 15000 })
})

Then(
  /^User selects ([^"]*) from send options/,
  async (currency: string) => {
    await Assets.openAssetOptionsOnSR()
    await Assets.currencyOption(currency).click()
  },
)

Then(/^User selects ([^"]*) from accounts/, async (account: string) => {
  if (account === "NFID") return true
  await Assets.chooseAccountFrom(account)
})

Then(
  /^Verifying that the balance is calculated as ([^"]*) and fee is calculated as ([^"]*)/,
  async (balance: string, fee: string) => {
    await softAssertAll(
      async () => expect(await Assets.getBalance.getText()).toContain(balance),
      async () => expect(await Assets.getFee.getText()).toContain(fee),
    )
  },
)

Then(
  /^Verifying that the balance is ([^"]*) and fee is ([^"]*) and currency is ([^"]*)/,
  async (expectedBalance: string, expectedFee: string, currency: string) => {
    let actualBalance
    let actualTransferFee
    await browser.waitUntil(
      async () => {
        await Assets.getBalance.waitForDisplayed()
        actualBalance = await Assets.getBalance.getText()
        return actualBalance != ""
      },
      { timeout: 20000, timeoutMsg: "Balance is still empty in 20sec" },
    )
    await Assets.getFee.waitForDisplayed({ timeout: 30000 })
    let fullText = await Assets.getFee.getText()
    actualTransferFee = fullText
      .replace(await Assets.getFee.$("span").getText(), "")
      .trim()

    await softAssertAll(
      async () =>
        await expect(actualBalance).toEqual(expectedBalance + " " + currency),
      async () => {
        if (expectedFee === "any") expect(actualTransferFee).not.toEqual("0.00")
        else expect(actualTransferFee).toEqual(expectedFee + " " + currency)
      },
    )
  },
)

Then(
  /^Set (.+) address then send(?: ([^"]*) FT)?$/,
  async (address: string, amount: string) => {
    amount
      ? await Assets.sendFTto(address, amount)
      : await Assets.sendNFTto(address)
  },
)

Then(/^User sets the amount to ([^"]*)/, async (amount: string) => {
  await Assets.amountField.setValue(amount)
})

Then(/^Transaction is success$/, async () => {
  await Assets.successWindow.waitForExist({
    timeout: 80000,
    interval: 1000,
  })
})

Then(
  /^Verifying that the Account ID is ([^"]*) and the Principal is ([^"]*)/,
  async function (account: string, principal: string) {
    const currentAddress = await Assets.getAccountId(true)
    let currentPrincipal = await Assets.getAccountId(false)

    await softAssertAll(
      async () =>
        await expect(
          (await currentAddress.firstAddressPart.getText()) +
            "..." +
            (await currentAddress.secondAddressPart.getText()),
        ).toEqual(account),
      async () =>
        await expect(
          (await currentPrincipal.firstAddressPart.getText()) +
            "..." +
            (await currentPrincipal.secondAddressPart.getText()),
        ).toEqual(principal),
    )
  },
)

Then(/^Principal, Address, Targets are correct:/, async (data) => {
  let expectedData = data.rowsHash()
  let usersData = await DemoAppPage.getAuthLogs()

  expect(
    String(
      (await (await usersData.get("principal")).firstAddressPart.getText()) +
        "..." +
        (await (await usersData.get("principal")).secondAddressPart.getText()),
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
})

Then(
  /^([^"]*) USD balance not ([^"]*)$/,
  async (chain: string, text: string) => {
    const usd = await $(`#token_${chain.replace(/\s/g, "")}_usd`)

    await usd.waitForExist({
      timeout: 30000,
    })
    await expect(usd).not.toHaveText(text)
  },
)

Then(
  /^Token with name (.+) and collection (.+?)(?: and ID (.+))? is displayed$/,
  async (token: string, collection: string, id?: string) => {
    await Nft.getNftName(token, collection).waitForDisplayed({
      timeout: 5000,
      timeoutMsg: `Not found NFT with name ${token} and collection ${collection}`,
    })
    await Nft.getNftCollection(collection).waitForDisplayed({
      timeout: 5000,
      timeoutMsg: `Not found collection with name ${collection}`,
    })

    if (id)
      await Nft.getNftId(id).waitForDisplayed({
        timeout: 5000,
        timeoutMsg: `Token ID ${id} is wrong or still not displayed in 5sec`,
      })
  },
)

Then(
  /^Details are: standard - ([^"]*), collection - ([^"]*), about - ([^"]*)/,
  async (standard: string, collection: string, about: string) => {
    await softAssertAll(
      async () =>
        expect(await Nft.getNftStandard.getText()).toContain(standard),
      async () =>
        expect(await Nft.getCollectionId.getText()).toContain(collection),
      async () => expect(await Nft.getAbout.getText()).toContain(about),
    )
  },
)

Then(/^(\d+) NFT displayed on collectibles page$/, async (amount: number) => {
  await Nft.getNftCollectiblesAmount(amount)
})

Then(/^Switch to table$/, async () => {
  await Nft.switchToTable()
})

Then(
  /^User goes to details of the nft with name ([^"]*) and collection ([^"]*)$/,
  async (token: string, collection: string) => {
    await Nft.nftDetails(token, collection)
  },
)

Then(
  /^The first raw has the next values: ([^"]*) & ([^"]*) & ([^"]*) & ([^"]*) & ([^"]*) in activity section$/,
  async (
    type: string,
    date: string,
    from: string,
    to: string,
    price: string,
  ) => {
    await softAssertAll(
      async () =>
        expect(await Nft.getValueFromColumnAtFirstRow("Event type")).toContain(
          type,
        ),
      async () =>
        expect(
          await Nft.getValueFromColumnAtFirstRow("Date and time"),
        ).toContain(date),
      async () =>
        expect(await Nft.getValueFromColumnAtFirstRow("To")).toContain(to),
      async () =>
        expect(await Nft.getValueFromColumnAtFirstRow("Price")).toContain(
          price,
        ),
      // TODO BUG - "From" field is empty () => expect(await Nft.getValueFromColumnAtFirstRow("From")).toContain(price)
    )
  },
)

Then(/^I should see filter button in Activity tab$/, async () => {
  await Activity.filterButton.waitForDisplayed({ timeout: 10000 })
})

Then(/^There are (\d+) activities in the table$/, async (amount: number) => {
  expect(await Activity.getActivitiesLength()).toEqual(amount)
})

Then(
  /^There is transaction ([^"]*) ([^"]*) ([^"]*) ([^"]*) ([^"]*) ([^"]*) ([^"]*)$/,
  async (
    action: string,
    currency: string,
    type: string,
    amount: string,
    timestamp: string,
    from: string,
    to: string,
  ) => {
    const tx = await Activity.getTransaction(
      action,
      currency,
      type,
      amount,
      timestamp,
      from,
      to,
    )
    await tx.waitForExist()
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
    await DemoTransactions.getApproveButton.then(async (it) => {
      await it.waitForDisplayed({
        timeout: 10000,
        timeoutMsg: "ApproveButton is still not displayed after 10 sec",
      })
      cucumberJson.attach(await browser.takeScreenshot(), "image/png")
      await it.click()
    })

    await screenModal.waitForDisplayed({
      reverse: true,
      timeout: 100000,
      timeoutMsg: "The screenModal is still visible.",
    })
    await browser.switchToParentFrame()
  },
)
