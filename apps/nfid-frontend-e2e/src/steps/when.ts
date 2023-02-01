import { When } from "@cucumber/cucumber"

import HomePage from "../pages/home-page"
import Profile from "../pages/profile"
import Vaults from "../pages/vaults"
import Vault from "../pages/vault"

import clearInputField from "./support/action/clearInputField"
import clickElement from "./support/action/clickElement"
import closeLastOpenedWindow from "./support/action/closeLastOpenedWindow"
import deleteCookies from "./support/action/deleteCookies"
import dragElement from "./support/action/dragElement"
import focusLastOpenedWindow from "./support/action/focusLastOpenedWindow"
import handleModal from "./support/action/handleModal"
import moveTo from "./support/action/moveTo"
import pause from "./support/action/pause"
import pressButton from "./support/action/pressButton"
import scroll from "./support/action/scroll"
import selectOption from "./support/action/selectOption"
import selectOptionByIndex from "./support/action/selectOptionByIndex"
import setCookie from "./support/action/setCookie"
import setInputField from "./support/action/setInputField"
import setPromptText from "./support/action/setPromptText"

When(/^I enter a captcha$/, async () => {
  await HomePage.captchaPass();
})

When(/^It log's me in$/, async () => {
  await HomePage.justLogMeIn();
  await HomePage.waitForLoaderDisappear();
})

When(/^I open profile menu$/, async () => {
  await Profile.openProfileMenu();
})

When(/^I open Vaults$/, async () => {
  await Profile.openVaults();
  await Profile.waitForLoaderDisappear();
})

When(/^I open Members tab$/, async () => {
  await Vault.openMembersTab();
})

When(/^I add new member to this vault with ([^"]*) and ([^"]*)$/, async (name: string, address: string) => {
  await Vault.addMember(name, address);
})

When(/^I create a new Vault with name ([^"]*)$/, async (vaultName: string) => {
  await Vaults.createVault(vaultName);
  await Vaults.waitForLoaderDisappear();
})

When(/^I click on vault with name ([^"]*)$/, async (vaultName: string) => {
  await (await Vaults.getVaultByName(vaultName)).click();
  await Vaults.waitForLoaderDisappear();
})

When(/^I create a new wallet with name ([^"]*)$/, async (walletName: string) => {
  await Vault.addWallet(walletName);
  await Vault.waitForLoaderDisappear();
})

When(/^I open Policies tab$/, async () => {
  await Vault.openPoliciestab();
})

When(/^I create new Policy for this vault with ([^"]*), ([^"]*) and ([^"]*) included$/,
  async (walletName: string, greaterThan: number, approvers: number) => {
    await Vault.addPolicy(walletName, greaterThan, approvers);
  })

When(/^I (click|doubleclick) on the (link|selector) "([^"]*)?"$/, clickElement)

When(/^I (add|set) "([^"]*)?" to the inputfield "([^"]*)?"$/, setInputField)

When(/^I clear the inputfield "([^"]*)?"$/, clearInputField)

When(/^I drag element "([^"]*)?" to element "([^"]*)?"$/, dragElement)

When(/^I pause for (\d+)ms$/, pause)

When(/^I set a cookie "([^"]*)?" with the content "([^"]*)?"$/, setCookie)

When(/^I delete the cookie "([^"]*)?"$/, deleteCookies)

When(/^I press "([^"]*)?"$/, pressButton)

When(/^I (accept|dismiss) the (alertbox|confirmbox|prompt)$/, handleModal)

When(/^I enter "([^"]*)?" into the prompt$/, setPromptText)

When(/^I scroll to element "([^"]*)?"$/, scroll)

When(/^I close the last opened (window|tab)$/, closeLastOpenedWindow)

When(/^I focus the (previous|last) opened (window|tab)$/, focusLastOpenedWindow)

When(
  /^I select the (\d+)(st|nd|rd|th) option for element "([^"]*)?"$/,
  selectOptionByIndex,
)

When(
  /^I select the option with the (name|value|text) "([^"]*)?" for element "([^"]*)?"$/,
  selectOption,
)

When(
  /^I move to element "([^"]*)?"(?: with an offset of (\d+),(\d+))*$/,
  moveTo,
)
