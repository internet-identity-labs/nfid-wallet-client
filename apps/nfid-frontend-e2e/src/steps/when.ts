import { When } from "@cucumber/cucumber"

import { baseURL } from "../../wdio.conf.js"
import userClient from "../helpers/accounts-service.js"
import assets, { Assets } from "../pages/assets.js"
import DemoTransactions from "../pages/demoApp/demo-transactions.js"
import DemoUpdateDelegation from "../pages/demoApp/demo-updateDelegation.js"
import HomePage from "../pages/home-page.js"
import Collectibles from "../pages/nft.js"
import Profile from "../pages/profile.js"
import RecoveryPage from "../pages/recovery-page.js"
import Vault from "../pages/vault.js"
import Vaults from "../pages/vaults.js"
import clearInputField from "./support/action/clearInputField.js"
import clickElement from "./support/action/clickElement.js"
import closeLastOpenedWindow from "./support/action/closeLastOpenedWindow.js"
import deleteCookies from "./support/action/deleteCookies.js"
import dragElement from "./support/action/dragElement.js"
import focusLastOpenedWindow from "./support/action/focusLastOpenedWindow.js"
import handleModal from "./support/action/handleModal.js"
import moveTo from "./support/action/moveTo.js"
import pause from "./support/action/pause.js"
import pressButton from "./support/action/pressButton.js"
import scroll from "./support/action/scroll.js"
import selectOption from "./support/action/selectOption.js"
import selectOptionByIndex from "./support/action/selectOptionByIndex.js"
import setCookie from "./support/action/setCookie.js"
import setInputField from "./support/action/setInputField.js"
import setPromptText from "./support/action/setPromptText.js"

When(/^User enters a captcha$/, async function () {
  await HomePage.captchaPass()
  await HomePage.waitForLoaderDisappear()
  await HomePage.waitForLoaderDisappear()
})

When(/^User trusts this device$/, async () => {
  await HomePage.iTrustThisDevice()
  await browser.addVirtualAuthenticator(
    "ctap2",
    "internal",
    true,
    true,
    true,
    true,
  )
  await HomePage.waitForLoaderDisappear()
})

When(/^It log's me in$/, async () => {
  await HomePage.waitForLoaderDisappear()
})

When(/^Tokens displayed on user assets$/, async () => {
  await Profile.waitForTokensAppear()
})

When(
  /^([^"]*) NFT displayed on assets page and ([^"]*) at all$/,
  async (amount: string, view: string) => {
    await Collectibles.waitForNFTsAppear()
    const nftAmount = await Collectibles.getNftAmount()
    await nftAmount.waitUntil(async () =>
      (await nftAmount).getText().then((l) => {
        return l === amount
      }),
    )
    const actualAmount = await Collectibles.getNftsLength()
    if (parseInt(view) < 4) {
      expect(view).toEqual(actualAmount)
    } else {
      expect(parseInt(view)).toBeGreaterThan(2)
    }
  },
)

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
        if (userClient.userMap.get(userClient.users[i]) === false) {
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

    const authId = await browser.addVirtualAuthenticator(
      "ctap2",
      "internal",
      true,
      true,
      true,
      true,
    )

    const rpId = new URL(baseURL).hostname
    const creds: WebAuthnCredential = testUser.credentials
    // @ts-ignore
    const anchor: JSON = testUser.account

    // @ts-ignore
    await browser.addCredentialV2(
      authId,
      rpId,
      creds.credentialId,
      creds.isResidentCredential,
      creds.privateKey,
      creds.signCount,
    )

    await browser.execute(
      function (key, value) {
        // @ts-ignore
        return this.localStorage.setItem(key, value)
      },
      "account",
      JSON.stringify(anchor),
    )
    await browser.execute(function () {
      // @ts-ignore
      return this.location.reload()
    })
  },
)

When(
  /^User is already authenticated by ([^"]*) anchor$/,
  {
    wrapperOptions: {
      retry: 2,
    },
  },
  async function (anchor: number) {
    let testUser: TestUser = await userClient.takeStaticUserByAnchor(anchor)

    const response = await browser.executeAsync(function (
      authState: AuthState,
      done,
    ) {
      // @ts-ignore
      if (typeof this.setAuthState === "function") {
        // @ts-ignore
        this.setAuthState(authState).then(done)
      }
    },
    testUser.authstate)
    console.log("set auth state", { response })
    await HomePage.openPage("/profile/assets")
  },
)

When(
  /^User enters recovery phrase of ([^"]*) anchor$/,
  {
    wrapperOptions: {
      retry: 2,
    },
  },
  async function (anchor: number) {
    let testUser: TestUser = await userClient.takeStaticUserByAnchor(anchor)
    return (await $("[name='recoveryPhrase']")).setValue(testUser.seed)
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

When(/^I click on recover button$/, async () => {
  await $("#recovery-button").click()
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

When(/^I press on Activity icon$/, async () => {
  await assets.openActivity()
})

When(
  /^User sends ?(.*)? ([^"]*) to (.*)$/,
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
