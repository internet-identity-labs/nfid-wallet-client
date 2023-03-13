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
  await Assets.getAssetByLabel(asselLabel)
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

Then(/^([^"]*) address calculated$/, async (asselLabel: string) => {
  await Assets.waitUntilAddressWithFundsCalculated(asselLabel)
})

Then(
  /^Expect ([^"]*) with text ([^"]*)$/,
  async (asselLabel: string, text: string) => {
    await Assets.getAssetByElementAndCompareText(asselLabel, text)
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
    await Assets.getAssetByElementAndCompareText(
      "option_txs_" + asselLabel,
      text,
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
    let dropdownAccountId = "selected_acc"
    await Assets.getAssetByElementAndCompareText(
      dropdownAccountId,
      expectedText,
    )
  },
)

Then(/^Open ([^"]*) tab for first account$/, async (tab: string) => {
  await clickElement("click", "selector", '[id="account_row_0"]')
  await Assets.openElementById("tab_" + tab)
})

Then(/^Wait while ([^"]*) accounts calculated$/, async (text: string) => {
  const asselLabel = "page_title"
  await Assets.getAssetByElementAndCompareText(asselLabel, text)
})

Then(/^Expect that ([^"]*) is "([^"]*)"$/, async (id: string, text: string) => {
  let label = "transaction_" + id + "_0"
  await Assets.getAssetByElementAndCompareText(label, text)
})

Then(/^Date is ([^"]*)$/, async (date: string) => {
  let label = "transaction_date_0"
  let parsed = format(new Date(Number(date)), "MMM dd, yyyy - hh:mm:ss aaa")
  await Assets.getAssetByElementAndCompareText(label, parsed)
})

Then(/^Open filter menu on assets screen/, async () => {
  let dropdownAccountId = "asset_filter"
  await Assets.openElementById(dropdownAccountId)
})

Then(/^([^"]*) USD balance not empty$/, async (chain: string) => {
  let assetLabel = "token_" + chain + "_usd"
  await Assets.getAssetByElementAndCompareText(assetLabel, "$0.00", false)
})

Then(/^Account balance in USD not empty$/, async () => {
  let assetLabel = "usd_balance_0"
  await Assets.getAssetByElementAndCompareText(assetLabel, "$0.00", false)
})

Then(
  /^([^"]*) with ([^"]*) ([^"]*) in header/,
  async (chain: string, amount: string, token: string) => {
    await Assets.getAssetByElementAndCompareText("label", chain)
    await Assets.getAssetByElementAndCompareText("token", token)
    await Assets.getAssetByElementAndCompareText(
      "token_info",
      amount + " " + token,
    )
  },
)

Then(
  /^([^"]*) app ([^"]*) with ([^"]*) ([^"]*) displayed/,
  async (app: string, account: string, crypto: string, currency: string) => {
    await Assets.getAssetByElementAndCompareText("app_name_0", app)
    await Assets.getAssetByElementAndCompareText("acc_name_0", account)
    await Assets.getAssetByElementAndCompareText(
      "token_balance_0",
      crypto + " " + currency,
    )
  },
)

Then(
  /^Identifiers are ([^"]*) and ([^"]*)/,
  async (princ: string, account: string) => {
    await Assets.getAssetByElementAndCompareText("principal_id_0", princ)
    await Assets.getAssetByElementAndCompareText("account_id_0", account)
  },
)

Then(/^(\d+) row in the table/, async (amount: number) => {
  for (let i = 0; i < amount; i++) {
    await Assets.getAssetByElement("account_row_" + i)
  }
  await Assets.getAssetByElement("account_row_" + amount, true)
})

Then(/^(\d+) transaction in the table/, async (amount: number) => {
  for (let i = 0; i < amount; i++) {
    await Assets.getAssetByElement("transaction_" + i)
  }
  await Assets.getAssetByElement("transaction_" + amount, true)
})

Then(/^Sent ([^"]*) ([^"]*)/, async (amount: string, currency: string) => {
  await Assets.verifyTransactionField("asset", currency)
  await Assets.verifyTransactionField("quantity", amount)
})

Then(/^From ([^"]*) to ([^"]*)/, async (from: string, to: string) => {
  await Assets.verifyTransactionField("from", from)
  await Assets.verifyTransactionField("to", to)
})

Then(
  /^Expect "([^"]*)" not with text ([^"]*)$/,
  async (assetLabel: string, text: string) => {
    await Assets.getAssetByElementAndCompareText(assetLabel, text, false)
  },
)
