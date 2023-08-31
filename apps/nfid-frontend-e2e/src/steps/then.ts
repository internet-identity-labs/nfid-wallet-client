import { Then } from "@cucumber/cucumber"
import { format } from "date-fns"

import activity from "../pages/activity.js"
// import { checkCredentialAmount } from "../helpers/setupVirtualWebauthn"
import DemoAppPage from "../pages/demoApp-page.js"
import Assets from "../pages/assets.js"
import Nft from "../pages/nft.js"
import Profile from "../pages/profile.js"
import Vault from "../pages/vault.js"
import Vaults from "../pages/vaults.js"
import clickElement from "./support/action/clickElement.js"
import setInputField from "./support/action/setInputField.js"
import waitFor from "./support/action/waitFor.js"
import waitForVisible from "./support/action/waitForDisplayed.js"
import checkClass from "./support/check/checkClass.js"
import checkContainsAnyText from "./support/check/checkContainsAnyText.js"
import checkContainsText from "./support/check/checkContainsText.js"
import checkCookieContent from "./support/check/checkCookieContent.js"
import checkCookieExists from "./support/check/checkCookieExists.js"
import checkDimension from "./support/check/checkDimension.js"
import checkEqualsText from "./support/check/checkEqualsText.js"
import checkFocus from "./support/check/checkFocus.js"
import checkFontProperty from "./support/check/checkFontProperty.js"
import checkIfElementExists from "./support/check/checkIfElementExists.js"
import checkInURLPath from "./support/check/checkInURLPath.js"
import checkIsEmpty from "./support/check/checkIsEmpty.js"
import checkIsOpenedInNewWindow from "./support/check/checkIsOpenedInNewWindow.js"
import checkLocalStorageKey from "./support/check/checkLocalStorageKey.js"
import checkModal from "./support/check/checkModal.js"
import checkModalText from "./support/check/checkModalText.js"
import checkNewWindow from "./support/check/checkNewWindow.js"
import checkOffset from "./support/check/checkOffset.js"
import checkProperty from "./support/check/checkProperty.js"
import checkSelected from "./support/check/checkSelected.js"
import checkTitle from "./support/check/checkTitle.js"
import checkTitleContains from "./support/check/checkTitleContains.js"
import checkURL from "./support/check/checkURL.js"
import checkURLPath from "./support/check/checkURLPath.js"
import checkWithinViewport from "./support/check/checkWithinViewport.js"
import compareText from "./support/check/compareText.js"
import isVisible from "./support/check/isDisplayed.js"
import isEnabled from "./support/check/isEnabled.js"
import isExisting from "./support/check/isExisting.js"

Then(/^User logs out$/, async () => {
  await Profile.logout()
})

Then(/^Vault appears with name ([^"]*)$/, async (vaultName: string) => {
  await Vaults.getVaultByName(vaultName)
})

Then(/^Wallet displays with name ([^"]*)$/, async (walletName: string) => {
  await Vault.getWalletByName(walletName)
})

Then(/^New member displays with ([^"]*)$/, async (memberName: string) => {
  await Vault.getMemberByName(memberName)
})

Then(/^Policy is displayed on the policies list$/, async () => {
  const policiesCount = await Vault.policiesList.length
  await browser.waitUntil(
    async () => policiesCount < (await Vault.policiesList.length),
    { timeout: 10000, timeoutMsg: "Policy has no been added" },
  )
})

Then(/^NFID number is not zero$/, async () => {
  await browser.waitUntil(async () => (await Profile.getNFIDnumber()) !== "0", {
    timeout: 10000,
    timeoutMsg: "Profile NFID number is 0",
  })
})

Then(/^Phone number is ([^"]*)$/, async (phoneNumber: string) => {
  await Profile.getPhoneNumber.waitForDisplayed({
    timeout: 13000,
    timeoutMsg: "Phone Number is not displayed",
  })
  expect(await Profile.getPhoneNumber.getText()).toContain(phoneNumber)
})

Then(/^I expect that the title is( not)* "([^"]*)?"$/, checkTitle)

Then(/^I expect that the title( not)* contains "([^"]*)?"$/, checkTitleContains)

Then(
  /^I expect that element "([^"]*)?" does( not)* appear exactly "([^"]*)?" times$/,
  checkIfElementExists,
)

Then(/^I expect that element "([^"]*)?" is( not)* displayed$/, isVisible)

Then(
  /^I expect that element ([^"]*)? becomes( not)* displayed$/,
  waitForVisible,
)

Then(
  /^I expect that element "([^"]*)?" is( not)* within the viewport$/,
  checkWithinViewport,
)

Then(/^I expect that element "([^"]*)?" does( not)* exist$/, isExisting)

Then(
  /^I expect that element "([^"]*)?"( not)* contains the same text as element "([^"]*)?"$/,
  compareText,
)

Then(
  /^I expect that (button|element) "([^"]*)?"( not)* matches the text "([^"]*)?"$/,
  checkEqualsText,
)

Then(
  /^I expect that (button|element|container) "([^"]*)?"( not)* contains the text "([^"]*)?"$/,
  checkContainsText,
)

Then(
  /^I expect that (button|element) "([^"]*)?"( not)* contains any text$/,
  checkContainsAnyText,
)

Then(
  /^I expect that (button|element) "([^"]*)?" is( not)* empty$/,
  checkIsEmpty,
)

Then(/^I expect that the url is( not)* "([^"]*)?"$/, checkURL)

Then(/^I expect that the path is( not)* "([^"]*)?"$/, checkURLPath)

Then(/^I expect the url to( not)* contain "([^"]*)?"$/, checkInURLPath)

Then(
  /^I expect that the( css)* attribute "([^"]*)?" from element "([^"]*)?" is( not)* "([^"]*)?"$/,
  checkProperty,
)

Then(
  /^I expect that the font( css)* attribute "([^"]*)?" from element "([^"]*)?" is( not)* "([^"]*)?"$/,
  checkFontProperty,
)

Then(/^I expect that checkbox "([^"]*)?" is( not)* checked$/, checkSelected)

Then(/^I expect that element "([^"]*)?" is( not)* selected$/, checkSelected)

Then(/^I expect that element "([^"]*)?" is( not)* enabled$/, isEnabled)

Then(
  /^I expect that cookie "([^"]*)?"( not)* contains "([^"]*)?"$/,
  checkCookieContent,
)

Then(/^I expect that cookie "([^"]*)?"( not)* exists$/, checkCookieExists)

Then(
  /^I expect that element "([^"]*)?" is( not)* ([\d]+)px (broad|tall)$/,
  checkDimension,
)

Then(
  /^I expect that element "([^"]*)?" is( not)* positioned at ([\d+.?\d*]+)px on the (x|y) axis$/,
  checkOffset,
)

Then(
  /^I expect that element "([^"]*)?" (has|does not have) the class "([^"]*)?"$/,
  checkClass,
)

Then(/^I expect a new (window|tab) has( not)* been opened$/, checkNewWindow)

Then(
  /^I expect the url "([^"]*)?" is opened in a new (tab|window)$/,
  checkIsOpenedInNewWindow,
)

Then(/^I expect that element "([^"]*)?" is( not)* focused$/, checkFocus)

Then(
  /^I wait on element "([^"]*)?"(?: for (\d+)ms)*(?: to( not)* (be checked|be enabled|be selected|be displayed|contain a text|contain a value|exist))*$/,
  {
    wrapperOptions: {
      retry: 3,
    },
  },
  waitFor,
)

Then(
  /^I expect that a (alertbox|confirmbox|prompt) is( not)* opened$/,
  checkModal,
)

Then(
  /^I expect that a (alertbox|confirmbox|prompt)( not)* contains the text "([^"]*)?"$/,
  checkModalText,
)

Then(
  /^I expect "([^"]*)?" key to( not)* be present in localStorage/,
  checkLocalStorageKey,
)

Then(/^Go to Profile page$/, async function () {
  await clickElement("click", "selector", "#profileButton")
})

Then(
  /^I put Recovery Phrase to input field ([^"]*)$/,
  async function (phrase: string) {
    await setInputField("setValue", phrase, '[name="recoveryPhrase"]')
  },
)

Then(/^I put copied Recovery Phrase to input field/, async function () {
  await clickElement("click", "selector", '[name="recoveryPhrase"]')
  await browser.keys(["Command", "v"])
})

Then(/^I toggle checkbox "([^"]*)?"$/, async function (selector: string) {
  await clickElement("click", "selector", selector)
})

Then(/^I press button "([^"]*)?"$/, async function (button: string) {
  await clickElement("click", "selector", button)
})

Then(/^Asset appears with label ([^"]*)$/, async (assetLabel: string) => {
  await $(`#token_${assetLabel.replace(/\s/g, "")}`).waitForDisplayed({
    timeout: 15000,
  })
})

Then(
  /^Open asset with label ([^"]*) and network ([^"]*)$/,
  async (assetLabel: string, network: string) => {
    await Assets.openAssetByLabel(assetLabel + network)
  },
)

Then(/^Only (\d+) asset displayed/, async (amount: number) => {
  await Profile.waitForTokensAppear(amount)
})

Then(
  /^([^"]*) appears with ([^"]*) on ([^"]*) and ([^"]*)$/,
  async (
    assetLabel: string,
    currency: string,
    blockchain: string,
    balance: string,
  ) => {
    let assetBalance = await Assets.getAssetBalance(assetLabel)
    expect(assetBalance).toHaveText(balance)
    let assetCurrency = await Assets.getCurrency(assetLabel)
    expect(assetCurrency).toHaveText(currency)
    let assetBlockchain = await Assets.getBlockchain(assetLabel)
    expect(assetBlockchain).toHaveText(blockchain)
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

Then(/^Open dropdown menu on page/, async () => {
  let dropdownAccountId = "selected_acc"
  await Assets.openElementById(dropdownAccountId)
})

Then(/^Open blockchain filter on page/, async () => {
  await Assets.openElementById("blockchain_filter")
})

Then(/^Open account filter on page/, async () => {
  await Assets.openElementById("account_filter")
})

Then(
  /^Expect txs account "([^"]*)" with txs amount "([^"]*)"$/,
  async (assetLabel: string, text: string) => {
    assetLabel = assetLabel.replace(/\s/g, "")
    await $("#option_txs_" + assetLabel).then(async (x) =>
      x
        .waitForExist({ timeout: 7000 })
        .then(async () => expect(x).toHaveText(text)),
    )
  },
)

Then(
  /^Expect checkbox for account "([^"]*)" is( not)* selected$/,
  async (assetLabel: string, falseCase: string) => {
    assetLabel = assetLabel.replace(/\s/g, "")
    await Assets.isElementSelected("option_cbx_" + assetLabel, falseCase)
  },
)

Then(/^Click checkbox account ([^"]*)$/, async (assetLabel: string) => {
  assetLabel = assetLabel.replace(/\s/g, "")
  await Assets.openElementById("option_cbx_" + assetLabel)
})

Then(/^Click checkbox chain ([^"]*)$/, async (assetLabel: string) => {
  assetLabel = assetLabel.replace(/\s/g, "")
  await Assets.openElementById("option_cbx_" + assetLabel)
})

Then(
  /^Expect dropdown menu with text "([^"]*)"$/,
  async (expectedText: string) => {
    const dropdown = await $("#selected_acc")
    await dropdown.waitForExist({ timeout: 5000 })
    expect(dropdown).toHaveText(expectedText)
  },
)

Then(
  /^Expect blockchain filter menu with text "([^"]*)"$/,
  async (expectedText: string) => {
    await $("#blockchain_filter #selected_acc").then(async (x) =>
      x
        .waitForExist({ timeout: 17000 })
        .then(async () => expect(x).toHaveText(expectedText)),
    )
  },
)
Then(
  /^Expect account filter menu with text "([^"]*)"$/,
  async (expectedText: string) => {
    await $("#account_filter #selected_acc").then(async (x) =>
      x
        .waitForExist({ timeout: 7000 })
        .then(async () => expect(x).toHaveText(expectedText)),
    )
  },
)

Then(/^Open ([^"]*) tab for first account$/, async (tab: string) => {
  await clickElement("click", "selector", '[id="account_row_0"]')
  await Assets.openElementById("tab_" + tab)
})

Then(/^Wait while ([^"]*) accounts calculated$/, async (text: string) => {
  const title = "#page_title"
  await $(title).waitUntil(
    async () =>
      (await $(title)).getText().then((l) => {
        return l.includes(text)
      }),
    {
      timeout: 59000,
    },
  )
})

Then(
  /^Wait while ([^"]*) asset calculated with currency ([^"]*)$/,
  async (text: string, currency) => {
    await $("#token_" + text.replace(/\s/g, "") + "_balance").then(async (x) =>
      x
        .waitForExist({ timeout: 57000 })
        .then(async () => expect(x).not.toHaveText(`0 ${currency}`)),
    )
  },
)

Then(/^Expect that ([^"]*) is "([^"]*)"$/, async (id: string, text: string) => {
  await $("#transaction_" + id + "_0").then(async (x) =>
    x
      .waitForExist({ timeout: 7000 })
      .then(async () => expect(x).toHaveText(text)),
  )
})

Then(/^Date is ([^"]*)$/, async (date: string) => {
  let parsed = format(new Date(Number(date)), "MMM dd, yyyy - hh:mm:ss aaa")
  await $("#transaction_date_0").then(async (x) =>
    x
      .waitForExist({ timeout: 7000 })
      .then(async () => expect(x).toHaveText(parsed)),
  )
})

Then(/^Open filter menu on assets screen/, async () => {
  let dropdownAccountId = "asset_filter"
  await Assets.openElementById(dropdownAccountId)
})

Then(/^User opens receive dialog window/, async () => {
  await Assets.receiveDialog()
})

Then(/^User opens send modal window/, async () => {
  browser.setWindowSize(1000, 1000)
  const sendReceiveButton = await $("#sendReceiveButton")
  const loader = await $("#loader")

  await loader.waitForDisplayed({ reverse: true, timeout: 55000 })
  await sendReceiveButton.waitForDisplayed({
    timeout: 30000,
  })
  await sendReceiveButton.click()

  await loader.waitForDisplayed({ reverse: true, timeout: 25000 })

  await (await $("#sendFT")).waitForDisplayed({ timeout: 5000 })
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

Then(/^Choose ([^"]*) from receive options/, async (chain: string) => {
  await Assets.openAssetReceiveOptions()
  await Assets.chooseChainOption(chain)

  const loader = await $("#loader")
  await loader.waitForDisplayed({ reverse: true, timeout: 10000 })
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

Then(/^Choose ([^"]*) from receive accounts/, async (account: string) => {
  await Assets.chooseAccountReceive(account)
})

Then(
  /^Asset calculated for ([^"]*) with ([^"]*)/,
  async (assetLabel: string, currency: string) => {
    await Assets.waitWhileCalculated(assetLabel, currency)
  },
)

Then(/^Wait while balance and fee calculated/, async () => {
  const assetBalance = await Assets.getBalance()
  const fee = await Assets.getFee()

  await assetBalance.waitForExist({ timeout: 20000 })
  await fee.waitForDisplayed({ timeout: 40000 })
})

Then(
  /^Balance is ([^"]*) and fee is ([^"]*) and currency is ([^"]*)/,
  async (balance: string, fee: string, currency: string) => {
    const assetBalance = await Assets.getBalance()
    assetBalance.waitForExist({ timeout: 40000 })
    expect(assetBalance).toHaveText(balance + " " + currency)

    const transferFee = await Assets.getFee()
    transferFee.waitForDisplayed({ timeout: 30000 })
    if (fee === "any") expect(transferFee).not.toContain("0.00")
    else expect(transferFee).toHaveText(fee + " " + currency)
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

Then(
  /^Account ID is ([^"]*) ... ([^"]*)/,
  async (first: string, second: string) => {
    let address = await Assets.getAccountId()
    await expect(address.firstAddressPart).toHaveText(first)
    await expect(address.secondAddressElement).toHaveText(second)
  },
)

Then(/^Account ID is ([^"]*)/, async (principal: string) => {
  let address = await Assets.getAccountId(true)
  expect(
    (await address.firstAddressPart.getText()) +
    "..." +
    (await address.secondAddressElement.getText()),
  ).toEqual(principal)
})

Then(/^Principal ?(.*)? is ([^"]*)/, async (isDemoApp: string, principal: string) => {
  if (isDemoApp === "in demoApp") {
    expect((await DemoAppPage.getPrincipalId()).substring(18, 81)).toEqual(principal)
  } else {
    let address = await Assets.getAccountId(false)
    expect(
      (await address.firstAddressPart.getText()) +
      "..." +
      (await address.secondAddressElement.getText())
    ).toEqual(principal)
  }
})

Then(
  /^([^"]*) USD balance not ([^"]*)$/,
  async (chain: string, text: string) => {
    const usd = await $(`#token_${chain.replace(/\s/g, "")}_usd`)

    await usd.waitForExist({
      timeout: 13000,
    })
    await expect(usd).not.toHaveText(text)
  },
)

Then(/^([^"]*) USD balance is not empty$/, async (chain: string) => {
  const usd = await $(`#token_${chain.replace(/\s/g, "")}_usd`)

  await usd.waitForExist({
    timeout: 13000,
  })
  await expect(usd).not.toHaveText("")
})

Then(/^Account balance in USD not empty$/, async () => {
  const usd = await $("#usd_balance_0")
  await usd.waitForExist({
    timeout: 13000,
  })
  await expect(usd).not.toHaveText("")
})

Then(
  /^([^"]*) with ([^"]*) ([^"]*) in header/,
  async (chain: string, amount: string, token: string) => {
    const label = await $(`#label`)
    await label.waitForExist({
      timeout: 7000,
    })
    await expect(label).toHaveText(chain)
    const tokenEl = await $(`#token`)
    await tokenEl.waitForExist({
      timeout: 7000,
    })
    await expect(tokenEl).toHaveText(token)
    const amountEl = await $(`#token_info`)
    await amountEl.waitForExist({
      timeout: 7000,
    })
    await expect(amountEl).toHaveText(amount + " " + token)
  },
)

Then(
  /^([^"]*) app ([^"]*) with ([^"]*) ([^"]*) displayed/,
  async (app: string, account: string, crypto: string, currency: string) => {
    const accName = await $("#acc_name_0")
    await accName.waitForExist({ timeout: 7000 })
    await expect(accName).toHaveText(account)
    const balance = await $("#token_balance_0")
    await balance.waitForExist({ timeout: 7000 })
    await expect(balance).toHaveText(crypto + " " + currency)
    await $("#app_name_0").then((x) =>
      x
        .waitForDisplayed({ timeout: 7000 })
        .then(async () => expect(await x.getText()).toContain(app)),
    )
  },
)

Then(
  /^Identifiers are ([^"]*) and ([^"]*)/,
  async (princ: string, account: string) => {
    await $("#account_id_0").then((x) =>
      x
        .waitForDisplayed({ timeout: 12000 })
        .then(async () => expect(await x.getText()).toContain(account)),
    )

    if (princ.length)
      await $("#principal_id_0").then((x) =>
        x
          .waitForDisplayed({ timeout: 12000 })
          .then(async () => expect(await x.getText()).toContain(princ)),
      )
  },
)

Then(/^(\d+) row in the table/, async (amount: number) => {
  for (let i = 0; i < amount; i++) {
    await $(`#account_row_${i}`).waitForDisplayed({ timeout: 7000 })
  }
  await $(`#account_row_${amount}`).waitForDisplayed({
    timeout: 7000,
    reverse: true,
  })
})

Then(/^([^"]*) transaction in the table/, async (amount: number) => {
  for (let i = 0; i < amount; i++) {
    await $(`#transaction_${i}`).waitForDisplayed({
      timeout: 15000,
      timeoutMsg: "Transaction has not been showed! Missing transaction!",
      reverse: false,
    })
  }

  await $(`#transaction_${amount}`).waitForDisplayed({
    timeout: 15000,
    timeoutMsg: "More than expects. Unexpected transaction!",
    reverse: true,
  })
})

Then(/^Sent ([^"]*) ([^"]*)/, async (amount: string, currency: string) => {
  await $("#transaction_asset_0").then(async (x) =>
    x
      .waitForExist({ timeout: 17000 })
      .then(async () => expect(x).toHaveText(currency)),
  )
  await $("#transaction_quantity_0").then(async (x) =>
    x
      .waitForExist({ timeout: 17000 })
      .then(async () => expect(x).toHaveText(amount)),
  )
})

Then(/^From ([^"]*) to ([^"]*)/, async (from: string, to: string) => {
  await $("#transaction_from_0").then(async (x) =>
    x
      .waitForExist({ timeout: 7000 })
      .then(async () => expect(x).toHaveText(from)),
  )
  await $("#transaction_to_0").then(async (x) =>
    x
      .waitForExist({ timeout: 7000 })
      .then(async () => expect(x).toHaveText(to)),
  )
})

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
  /^NFT ([^"]*) ([^"]*) ([^"]*) ([^"]*) displayed/,
  async (token: string, collection: string, id: string, wallet: string) => {
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
    await Nft.getNftWallet(wallet).then((l) =>
      l.waitForDisplayed({
        timeout: 5000,
        timeoutMsg: "No NFT wallet " + wallet,
      }),
    )
    await Nft.getNftId(id).then((l) =>
      l.waitForDisplayed({
        timeout: 5000,
        timeoutMsg: "No NFT id " + id,
      }),
    )
  },
)
Then(
  /^Details are ([^"]*) ([^"]*)/,
  async (standard: string, collection: string) => {
    await Nft.getNftStandard().then(async (l) => {
      l.waitForDisplayed({
        timeout: 5000,
      })
      expect(await l.getText()).toContain(standard)
    })
    await Nft.getCollectionId().then(async (l) => {
      l.waitForDisplayed({
        timeout: 5000,
      })
      expect(await l.getText()).toContain(collection)
    })
  },
)
Then(/^About starts with ([^"]*)/, async (about: string) => {
  await Nft.getAbout().then(async (l) => {
    l.waitForDisplayed({
      timeout: 5000,
    })
    expect(await l.getText()).toContain(about)
  })
})

Then(/^Asset preview type is ([^"]*)/, async (type: string) => {
  ;(await $(`#asset-${type}`)).waitForDisplayed({ timeout: 5000 })
})

Then(/^Open collectibles page$/, async () => {
  await Nft.openCollectibles()
})

Then(/^Filter by ([^"]*)$/, async (blockchain: string) => {
  await Nft.filterByBlockchain(blockchain)
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

Then(/^Go to ([^"]*) details$/, async (token: string) => {
  await Nft.nftDetails(token)
})

Then(/^(\d+) transactions appear$/, async (amount: number) => {
  await Nft.getActivityAmount(amount)
})

Then(
  /^(\d+) raw with ([^"]*) & (\d+) & ([^"]*) & ([^"]*) & ([^"]*)$/,
  async (
    n: number,
    type: string,
    date: number,
    from: string,
    to: string,
    price: string,
  ) => {
    const actualType = await Nft.trType(n)
    expect(actualType).toContain(type)
    const actualFrom = await Nft.trFrom(n)
    expect(actualFrom).toContain(from)
    const actualTo = await Nft.trTo(n)
    expect(actualTo).toContain(to)
    const actualPrice = await Nft.trPrice(n)
    expect(actualPrice).toContain(price)
    const actualDate = await Nft.trDate(n)
    let parsed = format(new Date(Number(date)), "MMM dd, yyyy - hh:mm:ss aaa")
    expect(actualDate).toContain(parsed)
  },
)

Then(/^I should see activity page$/, async () => {
  const pageTitle = await activity.pageTitle
  await pageTitle.waitForDisplayed({ timeout: 10000 })
  expect(await pageTitle.getText()).toContain("Activity")
  await activity.waitForLoaderDisappear()

  await new Promise((resolve) => setTimeout(() => resolve(true), 3000)) // just manual delay before next step
})

Then(/^I should see (\d+) activities in the table$/, async (amount: number) => {
  const length = await activity.getActivitiesLength()
  expect(length).toEqual(amount)
})

Then(
  /^I should see transaction ([^"]*) ([^"]*) ([^"]*) ([^"]*) ([^"]*) ([^"]*) ([^"]*) ([^"]*)$/,
  async (
    action: string,
    chain: string,
    currency: string,
    type: string,
    asset: string,
    timestamp: string,
    from: string,
    to: string,
  ) => {
    const tx = await activity.getTransaction(
      action,
      chain,
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
