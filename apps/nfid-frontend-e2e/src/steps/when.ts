import { When } from "@cucumber/cucumber"

import userClient from "../helpers/accounts-service.js"
import assets from "../pages/assets.js"
import DemoTransactions from "../pages/demoApp/demo-transactions.js"
import DemoUpdateDelegation from "../pages/demoApp/demo-updateDelegation.js"
import HomePage from "../pages/home-page.js"
import Profile from "../pages/profile.js"
import activity from "../pages/activity.js"

When(/^It log's me in$/, async () => {
  await HomePage.waitForLoaderDisappear()
})

When(/^Tokens displayed on user assets$/, async () => {
  await Profile.waitForTokensAppear()
})

When(
  /^User is already authenticated by ([^"]*) anchor$/,
  {
    wrapperOptions: {
      retry: 2,
    },
  },
  async function(anchor: number) {
    let testUser: TestUser = await userClient.takeStaticUserByAnchor(anchor)

    const response = await browser.executeAsync(function(
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
    await HomePage.openPage("/wallet/tokens")
  },
)

When(
  /^User enters recovery phrase of ([^"]*) anchor$/,
  {
    wrapperOptions: {
      retry: 2,
    },
  },
  async function(anchor: number) {
    let testUser: TestUser = await userClient.takeStaticUserByAnchor(anchor)
    return (await $("[name='recoveryPhrase']")).setValue(testUser.seed)
  },
)

When(/^I click on recover button$/, async () => {
  await $("#recovery-button").click()
})

When(/^I press on Activity icon$/, async () => {
  await assets.waitUntilElementsLoadedProperly(assets.activityTab, activity.filterButton)
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
