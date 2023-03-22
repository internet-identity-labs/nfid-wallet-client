import { Then } from "@cucumber/cucumber"
import { format } from "date-fns"

import { checkCredentialAmount } from "../helpers/setupVirtualWebauthn"
import Assets from "../pages/assets"
import Profile from "../pages/profile"
import Vault from "../pages/vault"
import Vaults from "../pages/vaults"
import clickElement from "./support/action/clickElement"
import setInputField from "./support/action/setInputField"
import waitFor from "./support/action/waitFor"
import waitForVisible from "./support/action/waitForDisplayed"
import checkClass from "./support/check/checkClass"
import checkContainsAnyText from "./support/check/checkContainsAnyText"
import checkContainsText from "./support/check/checkContainsText"
import checkCookieContent from "./support/check/checkCookieContent"
import checkCookieExists from "./support/check/checkCookieExists"
import checkDimension from "./support/check/checkDimension"
import checkEqualsText from "./support/check/checkEqualsText"
import checkFocus from "./support/check/checkFocus"
import checkFontProperty from "./support/check/checkFontProperty"
import checkInURLPath from "./support/check/checkInURLPath"
import checkIsEmpty from "./support/check/checkIsEmpty"
import checkIsOpenedInNewWindow from "./support/check/checkIsOpenedInNewWindow"
import checkLocalStorageKey from "./support/check/checkLocalStorageKey"
import checkModal from "./support/check/checkModal"
import checkModalText from "./support/check/checkModalText"
import checkNewWindow from "./support/check/checkNewWindow"
import checkOffset from "./support/check/checkOffset"
import checkProperty from "./support/check/checkProperty"
import checkSelected from "./support/check/checkSelected"
import checkTitle from "./support/check/checkTitle"
import checkTitleContains from "./support/check/checkTitleContains"
import checkURL from "./support/check/checkURL"
import checkURLPath from "./support/check/checkURLPath"
import checkWithinViewport from "./support/check/checkWithinViewport"
import compareText from "./support/check/compareText"
import isVisible from "./support/check/isDisplayed"
import isEnabled from "./support/check/isEnabled"
import isExisting from "./support/check/isExisting"
import checkIfElementExists from "./support/lib/checkIfElementExists"

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
  const actualNFID = await Profile.getNFIDnumber()
  expect(actualNFID).not.toBe("0")
})

Then(/^Phone number is ([^"]*)$/, async (phoneNumber: string) => {
  await Profile.getPhoneNumber.waitForDisplayed({
    timeout: 13000,
    timeoutMsg: "Phone Number is not displayed",
  })
  expect(await Profile.getPhoneNumber.getText()).toHaveText(phoneNumber)
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

Then(/^My browser has ([\d]+) credentials$/, async function (amount: number) {
  await checkCredentialAmount(this.authenticator, Number(amount))
})

Then(/^Go to Profile page$/, async function () {
  await clickElement("click", "selector", "#profileButton")
})

Then(
  /^I put Recovery Phrase to input field "([^"]*)?"$/,
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

Then(/^Asset appears with label ([^"]*)$/, async (asselLabel: string) => {
  await $(`#token_${asselLabel.replace(/\s/g, "")}`).waitForDisplayed({ timeout: 7000 })
})

Then(/^Open asset with label ([^"]*)$/, async (asselLabel: string) => {
  await Assets.openAssetByLabel(asselLabel)
})

Then(/^Only (\d+) asset displayed/, async (amount: number) => {
  await Profile.waitForTokensAppear(amount)
})

Then(
  /^([^"]*) appears with ([^"]*) on ([^"]*) and ([^"]*) && ([^"]*) USD$/,
  async (
    asselLabel: string,
    currency: string,
    blockchain: string,
    balance: string,
    usd: string,
  ) => {
    await Assets.verifyAssetFields(
      asselLabel,
      currency,
      blockchain,
      balance,
      usd,
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

Then(/^Open dropdown menu on page/, async () => {
  let dropdownAccountId = "selected_acc"
  await Assets.openElementById(dropdownAccountId)
})

Then(
  /^Expect txs account "([^"]*)" with txs amount "([^"]*)"$/,
  async (asselLabel: string, text: string) => {
    asselLabel = asselLabel.replace(/\s/g, "")
    await $("#option_txs_" + asselLabel).then(async (x) =>
      x
        .waitForExist({ timeout: 7000 })
        .then(async () => expect(x).toHaveText(text)),
    )
  },
)

Then(
  /^Expect checkbox for account "([^"]*)" is( not)* selected$/,
  async (asselLabel: string, falseCase: string) => {
    asselLabel = asselLabel.replace(/\s/g, "")
    await Assets.isElementSelected("option_cbx_" + asselLabel, falseCase)
  },
)

Then(/^Click checkbox account ([^"]*)$/, async (asselLabel: string) => {
  asselLabel = asselLabel.replace(/\s/g, "")
  await Assets.openElementById("option_cbx_" + asselLabel)
})

Then(/^Click checkbox chain ([^"]*)$/, async (asselLabel: string) => {
  asselLabel = asselLabel.replace(/\s/g, "")
  await Assets.openElementById("option_cbx_" + asselLabel)
})

Then(
  /^Expect dropdown menu with text "([^"]*)"$/,
  async (expectedText: string) => {
    await $("#selected_acc").then(async (x) =>
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

Then(/^([^"]*) USD balance not ([^"]*)$/, async (chain: string, text: string) => {
  const usd = await $(`#token_${chain.replace(/\s/g, "")}_usd`)

  await usd.waitForExist({
    timeout: 7000,
  })
  await expect(usd).not.toHaveText(text)
})

Then(/^([^"]*) USD balance is not empty$/, async (chain: string) => {
  const usd = await $(`#token_${chain.replace(/\s/g, "")}_usd`)

  await usd.waitForExist({
    timeout: 7000,
  })
  await expect(usd).not.toHaveText("")
})

Then(/^Account balance in USD not empty$/, async () => {
  const usd = await $("#usd_balance_0")
  await usd.waitForExist({
    timeout: 7000,
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
    await $("#principal_id_0").then((x) =>
      x
        .waitForDisplayed({ timeout: 7000 })
        .then(async () => expect(await x.getText()).toContain(princ)),
    )
    await $("#account_id_0").then((x) =>
      x
        .waitForDisplayed({ timeout: 7000 })
        .then(async () => expect(await x.getText()).toContain(account)),
    )
  },
)

Then(/^(\d+) row in the table/, async (amount: number) => {
  for (let i = 0; i < amount; i++) {
    await $(`#account_row_${i}`).waitForExist({ timeout: 7000 })
  }
  await $(`#account_row_${amount}`).waitForExist({
    timeout: 7000,
    reverse: true,
  })
})

Then(/^(\d+) transaction in the table/, async (amount: number) => {
  for (let i = 0; i < amount; i++) {
    await $("id=transaction_" + i).waitForDisplayed({
      timeout: 7000,
      timeoutMsg: "Transaction has not been showed! Missing transaction!",
      reverse: false,
    })
  }
  await $("id=transaction_" + amount).waitForDisplayed({
    timeout: 70000,
    timeoutMsg: "Transaction has been showed! Unexpected transaction!",
    reverse: true,
  })
})

Then(/^Sent ([^"]*) ([^"]*)/, async (amount: string, currency: string) => {
  await $("#transaction_asset_0").then(async (x) =>
    x
      .waitForExist({ timeout: 7000 })
      .then(async () => expect(x).toHaveText(currency)),
  )
  await $("#transaction_quantity_0").then(async (x) =>
    x
      .waitForExist({ timeout: 7000 })
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
