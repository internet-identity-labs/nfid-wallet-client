import { When } from "@cucumber/cucumber"

import { baseURL } from "../../wdio.conf"
import userClient from "../helpers/accounts-service"
import HomePage from "../pages/home-page"
import Profile from "../pages/profile"
import RecoveryPage from "../pages/recovery-page"
import Vault from "../pages/vault"
import Vaults from "../pages/vaults"
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

When(/^User enters a captcha$/, async function () {
  await HomePage.captchaPass()
  await HomePage.waitForLoaderDisappear()
  await HomePage.waitForLoaderDisappear()
})

When(/^User trusts this device$/, async () => {
  await HomePage.iTrustThisDevice()
  await browser.addVirtualWebAuth("ctap2", "internal", true, true, true, true)
  await HomePage.waitForLoaderDisappear()
})

When(/^It log's me in$/, async () => {
  await HomePage.dontTrustThisDevice()
  await HomePage.waitForLoaderDisappear()
})

When(/^Tokens displayed on user assets$/, async () => {
  await Profile.waitForTokensAppear()
})

When(/^User opens burger menu$/, async () => {
  await HomePage.openHomeBurgerMenu()
})

When(/^User opens mobile profile menu$/, async () => {
  await Profile.openMobileProfileMenu()
})

When(/^User opens profile menu$/, async () => {
  await Profile.openProfileMenu()
})

When(/^User has account stored in localstorage$/, async () => {
  const localStorage = await browser.getLocalStorageItem("account")
  expect(localStorage.length).toBeGreaterThan(1)
  expect(localStorage).toContain("account")
})

When(
  /^User has authState$/,
  //use this method to pick a random available user from the list
  async function () {
    for (let i = 0; i < userClient.userMap.size; i++) {
      if (userClient.userMap.get(userClient.users[i]) === false) {
        await userClient.takeUser(userClient.users[i])
        this.testUser = userClient.users[i]
      }
    }

    let testUser: TestUser = this.testUser

    await browser.execute(function (authState: AuthState) {
      // @ts-ignore
      if (typeof this.setAuthState === "function") {
        // @ts-ignore
        this.setAuthState(authState)
      }
    }, testUser.authstate)
  },
)

When(
  /^User is already authenticated with ?(?:(.*))?$/,
  async function (account: string) {
    if (account === "BTC") {
      for (let i = 0; i < userClient.userMap.size; i++) {
        if (
          userClient.userMap.get(userClient.users[i]) === false &&
          userClient.users[i].btcAddress !== undefined
        ) {
          await userClient.takeUser(userClient.users[i])
          this.testUser = userClient.users[i]
        }
      }
    } else {
      for (let i = 0; i < userClient.userMap.size; i++) {
        if (userClient.userMap.get(userClient.users[i]) === false) {
          await userClient.takeUser(userClient.users[i])
          this.testUser = userClient.users[i]
        }
      }
    }

    let testUser: TestUser = this.testUser

    const authId = await browser.addVirtualWebAuth(
      "ctap2",
      "internal",
      true,
      true,
      true,
      true,
    )
    const rpId = new URL(baseURL).hostname
    const creds: WebAuthnCredential = testUser.credentials
    const anchor: JSON = testUser.account

    await browser.addWebauthnCredential(
      authId,
      rpId,
      creds.credentialId,
      creds.isResidentCredential,
      creds.privateKey,
      creds.signCount,
    )

    await browser.setLocalStorage("account", JSON.stringify(anchor))
    await browser.refresh()
  },
)

When(
  /^User is already authenticated by ([^"]*) anchor$/, 
  {
    wrapperOptions: {
      retry: 2
    },
  },
  async function (anchor: number) {
    let testUser: TestUser = await userClient.takeStaticUserByAnchor(anchor)

    await browser.execute(function (authState: AuthState) {
      // @ts-ignore
      if (typeof this.setAuthState === "function") {
        // @ts-ignore
        this.setAuthState(authState)
      }
    }, testUser.authstate)
    await HomePage.openPage("/profile/assets")
    console.log(await browser.getLogs("browser"))
  },
)

When(/^I open Vaults$/, async () => {
  await Profile.openVaults()
  await Profile.waitForLoaderDisappear()
})

When(/^I open Members tab$/, async () => {
  await Vault.openMembersTab()
})

When(
  /^I add new member to this vault with ([^"]*) and ([^"]*)$/,
  async (name: string, address: string) => {
    await Vault.addMember(name, address)
  },
)

When(/^I create a new Vault with name ([^"]*)$/, async (vaultName: string) => {
  await Vaults.createVault(vaultName)
  await Vaults.waitForLoaderDisappear()
})

When(/^I click on vault with name ([^"]*)$/, async (vaultName: string) => {
  await (await Vaults.getVaultByName(vaultName)).click()
  await Vaults.waitForLoaderDisappear()
})

When(
  /^I create a new wallet with name ([^"]*)$/,
  async (walletName: string) => {
    await Vault.addWallet(walletName)
    await Vault.waitForLoaderDisappear()
  },
)

When(/^I open Policies tab$/, async () => {
  await Vault.openPoliciestab()
})

When(
  /^I create new Policy for this vault with ([^"]*), ([^"]*) and ([^"]*) included$/,
  async (walletName: string, greaterThan: number, approvers: number) => {
    await Vault.addPolicy(walletName, greaterThan, approvers)
  },
)

When(/^User opens Credentials$/, async () => {
  await Profile.openCredentials()
})

When(/^User connects mobile number$/, async () => {
  await Profile.connectMobilePhoneNumber()
})

When(/^User inputs a phone number (.*)$/, async (phoneNumber: string) => {
  await Profile.inputAndVerifyPhoneNumber(phoneNumber)
  await Profile.waitForLoaderDisappear()
})

When(/^Phone number error appears "(.*)"$/, async (errorMsg: string) => {
  await $("#phone-number-error").waitForDisplayed({
    timeout: 7000,
    timeoutMsg: "Phone number error is missing",
  })
  expect(await $("#phone-number-error").getText()).toContain(errorMsg)
})

When(/^User enters pincode "(.*)"$/, async (pinCode: string) => {
  await Profile.enterPin(pinCode)
})

When(/^Pin code error message appears "(.*)"$/, async (errorMsg: string) => {
  await Profile.waitForLoaderDisappear()
  await $("#pin-input-error").waitForDisplayed({
    timeout: 7000,
    timeoutMsg: "Pin Error message is not displayed",
  })
  const text = await $("#pin-input-error").getText()
  expect(text).toHaveText(errorMsg)
})

When(/^User goes to recover account with FAQ$/, async () => {
  await HomePage.recoverAccountWithFAQ()
  await HomePage.switchToWindow("last")
})

When(/^User authenticates with a phrase/, async function () {
  for (let i = 0; i < userClient.userMap.size; i++) {
    if (userClient.userMap.get(userClient.users[i]) === false) {
      await userClient.takeUser(userClient.users[i])
      this.testUserSeed = userClient.users[i]
    }
  }
  await RecoveryPage.recoverAccountWithThePhrase(this.testUserSeed.seed)
})

When(/^I (click|doubleclick) on the (link|selector) ([^"]*)?$/, clickElement)

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
