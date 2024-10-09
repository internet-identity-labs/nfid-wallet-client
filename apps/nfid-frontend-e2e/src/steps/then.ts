import { Then } from "@cucumber/cucumber"
import { softAssertAll } from "../helpers/softAssertions.js"
import cucumberJson from "wdio-cucumberjs-json-reporter"

import activity from "../pages/activity.js"
import Assets from "../pages/assets.js"
import DemoTransactions from "../pages/demoApp/demo-transactions.js"
import DemoAppPage from "../pages/demoApp/demoApp-page.js"
import Nft from "../pages/nft.js"
import Profile from "../pages/profile.js"

Then(/^I toggle checkbox "([^"]*)?"$/, async function(selector: string) {
  await $(selector).click()
})

Then(/^Asset appears with label ([^"]*)$/, async (assetLabel: string) => {
  await $(`#token_${assetLabel.replace(/\s/g, "")}`).waitForDisplayed({
    timeout: 15000,
  })
})

Then(/^Only (\d+) asset displayed/, async (amount: number) => {
  await Profile.waitForTokens(amount)
})

Then(
  /^([^"]*) appears with ([^"]*) on ([^"]*) and ([^"]*)$/,
  async (
    assetLabel: string,
    currency: string,
    chain: string,
    balance: string,
  ) => {
    await softAssertAll(
      async () => await expect(await Assets.getAssetBalance(assetLabel)).toHaveText(balance),
      async () => await expect(await Assets.getCurrency(assetLabel)).toHaveText(currency),
      async () => await expect(await Assets.getBlockchain(chain)).toHaveText(chain),
    )
  },
)

Then(
  /^([^"]*) ([^"]*) address calculated$/,
  async (chain: string, asset: string) => {
    const title = `#token_${chain.replace(/\s/g, "")}_balance`
    await $(title).waitUntil(
      async () =>
        (await $(title)).getText().then((l) => {
          return l !== "0 " + asset
        }),
      {
        timeout: 59000,
      },
    )
  },
)

Then(/^Wait while ([^"]*) accounts calculated$/, async (text: string) => {
  const menuButton = $("#profile")
  await menuButton.waitForDisplayed()
  await menuButton.waitForClickable()
})

Then(
  /^Wait while ([^"]*) asset calculated with currency ([^"]*)$/,
  async (text: string, currency) => {
    await $("#token_" + text.replace(/\s/g, "") + "_balance").then(async (it) => {
        await it.waitForExist({ timeout: 57000 })
        expect(it).not.toHaveText(`0 ${currency}`)
      },
    )
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
  await $("#choose-nft").click()
})

Then(/^User sees option ([^"]*) in dropdown/, async (option: string) => {
  const opt = await $(`#choose_option_${option}`)
  await opt.waitForExist({ timeout: 15000 })
})

Then(
  /^Choose ([^"]*) on ([^"]*) from send options/,
  async (currency: string, chain: string) => {
    await Assets.openAssetOptionsOnSR()
    await Assets.chooseCurrencyOption(currency, chain)
  },
)

Then(/^Choose ([^"]*) from accounts/, async (account: string) => {
  if (account === "NFID") return true
  await Assets.chooseAccountFrom(account)
})

Then(/^Wait while balance and fee calculated/, async () => {
  await Assets.getBalance.waitForExist({ timeout: 20000 })
  await Assets.getFee.waitForDisplayed({ timeout: 40000 })
})

Then(
  /^Balance is ([^"]*) and fee is ([^"]*) and currency is ([^"]*)/,
  async (expectedBalance: string, expectedFee: string, currency: string) => {
    let actualBalance
    let actualTransferFee
    await browser.waitUntil(async () => {
      await Assets.getBalance.waitForDisplayed()
      actualBalance = await Assets.getBalance.getText()
      return actualBalance != ""
    }, { timeout: 20000, timeoutMsg: "Balance is still empty in 20sec" })
    await Assets.getFee.waitForDisplayed({ timeout: 30000 })
    let fullText = await Assets.getFee.getText()
    actualTransferFee = fullText.replace(await Assets.getFee.$("span").getText(), "").trim()

    await softAssertAll(
      async () => await expect(actualBalance).toEqual(expectedBalance + " " + currency),
      async () => {
        if (expectedFee === "any") expect(actualTransferFee).not.toEqual("0.00")
        else expect(actualTransferFee).toEqual(expectedFee + " " + currency)
      },
    )
  },
)

Then(
  /^Set ([^"]*) address and ([^"]*) and send/,
  async (address: string, amount: string) => {
    await Assets.sendFTto(address, amount)
  },
)

Then(/^Set amount ([^"]*)/, async (amount: string) => {
  const input = await $("#amount")
  await input.setValue(amount)
})

Then(/^Transaction is success$/, async () => {
  await Assets.successWindow()
})

Then(/^Account ID is (.+)/, async function(account: string) {
  const address = await Assets.getAccountId(true)
  let expectedResult =
    (await address.firstAddressPart.getText()) +
    "..." +
    (await address.secondAddressPart.getText())
  await expect(expectedResult).toEqual(account)
})

Then(/^Principal is ([^"]*)$/, async (principal: string) => {
  let address = await Assets.getAccountId(false)
  await expect(
    (await address.firstAddressPart.getText()) +
    "..." +
    (await address.secondAddressPart.getText()),
  ).toEqual(principal)
})

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
  /^Token ([^"]*) from ([^"]*) nft collection displayed/,
  async (token: string, collection: string) => {
    await Nft.getNftName(token, collection).then((l) =>
      l.waitForDisplayed({
        timeout: 5000,
        timeoutMsg: "No NFT " + token,
      }),
    )
    await Nft.getNftCollection(collection).then((l) =>
      l.waitForDisplayed({
        timeout: 5000,
        timeoutMsg: "No NFT collection " + collection,
      }),
    )
  },
)

Then(
  /^NFT ([^"]*) ([^"]*) ([^"]*) displayed/,
  async (token: string, collection: string, id: string) => {
    await Nft.getNftName(token, collection).waitForDisplayed({
      timeout: 5000,
      timeoutMsg: `Token name ${token} is wrong or still not displayed in 5sec`,
    })
    await Nft.getNftCollection(collection).waitForDisplayed({
      timeout: 5000,
      timeoutMsg: `Collection name ${collection} is wrong or still not displayed in 5sec`,
    })
    await Nft.getNftId(id).waitForDisplayed({
      timeout: 5000,
      timeoutMsg: `ID ${id} is wrong or still not displayed in 5sec`,
    })
  },
)
Then(
  /^Details are ([^"]*) ([^"]*)/,
  async (standard: string, collection: string) => {
    await Nft.getNftStandard.waitForDisplayed()
    expect(await Nft.getNftStandard.getText()).toContain(standard)
    await Nft.getCollectionId.waitForDisplayed()
    expect(await Nft.getCollectionId.getText()).toContain(collection)
  })

Then(/^About starts with ([^"]*)/, async (about: string) => {
  await Nft.getAbout.waitForDisplayed()
  expect(await Nft.getAbout.getText()).toContain(about)
})

Then(/^Open collectibles page$/, async () => {
  await Nft.openCollectibles()
})

Then(/^(\d+) NFT displayed on collectibles page$/, async (amount: number) => {
  await Nft.getNftCollectiblesAmount(amount)
})

Then(/^Switch to table$/, async () => {
  await Nft.switchToTable()
})

Then(
  /^Open nft ([^"]*) and ([^"]*) details$/,
  async (token: string, collection: string) => {
    await Nft.nftDetails(token, collection)
  },
)

Then(
  /^Go to ([^"]*) and ([^"]*) details$/,
  async (token: string, collection: string) => {
    await Nft.nftDetails(token, collection)
  },
)

Then(
  /^The first raw has the next values: ([^"]*) & ([^"]*) & ([^"]*) & ([^"]*) & ([^"]*)$/,
  async (
    type: string,
    date: string,
    from: string,
    to: string,
    price: string,
  ) => {
    await softAssertAll(
      async () => expect(await Nft.getValueFromColumnAtFirstRow("Event type")).toContain(type),
      async () => expect(await Nft.getValueFromColumnAtFirstRow("Date and time")).toContain(date),
      async () => expect(await Nft.getValueFromColumnAtFirstRow("To")).toContain(to),
      async () => expect(await Nft.getValueFromColumnAtFirstRow("Price")).toContain(price),
      // TODO BUG - "From" field is empty () => expect(await Nft.getValueFromColumnAtFirstRow("From")).toContain(price)
    )
  },
)

Then(/^I should see filter button in Activity tab$/, async () => {
  await activity.filterButton.waitForDisplayed({ timeout: 10000 })
})

Then(/^I should see (\d+) activities in the table$/, async (amount: number) => {
  const length = await activity.getActivitiesLength()
  expect(length).toEqual(amount)
})

Then(
  /^I should see transaction ([^"]*) ([^"]*) ([^"]*) ([^"]*) ([^"]*) ([^"]*) ([^"]*)$/,
  async (
    action: string,
    currency: string,
    type: string,
    asset: string,
    timestamp: string,
    from: string,
    to: string,
  ) => {
    const tx = await activity.getTransaction(
      action,
      currency,
      type,
      asset,
      timestamp,
      from,
      to,
    )
    expect(tx).toBeTruthy()
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
