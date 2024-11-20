import { When } from "@cucumber/cucumber"

import userClient from "../helpers/accounts-service.js"
import Activity from "../pages/activity.js"
import Assets from "../pages/assets.js"
import DemoTransactions from "../pages/demoApp/demo-transactions.js"
import DemoUpdateDelegation from "../pages/demoApp/demo-updateDelegation.js"
import HomePage from "../pages/home-page.js"
import Nft from "../pages/nft.js"
import Profile from "../pages/profile.js"

When(/^User is logged in$/, async () => {
  await HomePage.waitForLoaderDisappear()
  await Profile.menuButton.waitForClickable({ timeout: 20000 })
})

When(/^Tokens displayed on user assets$/, async () => {
  await Profile.waitUntilBalanceLoaded()
  await Profile.waitForTokensAppear()
})

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
  async function (anchor: number) {
    let testUser: TestUser = await userClient.takeStaticUserByAnchor(anchor)
    return (await $("[name='recoveryPhrase']")).setValue(testUser.seed)
  },
)

When(/^User clicks on recover button$/, async () => {
  await $("#recovery-button").click()
})

When(/^User goes to (.*) tab$/, async (tab: string) => {
  const tabMap: { [key: string]: any } = {
    activity: [Assets.activityTab, Activity.filterButton],
    nfts: [Assets.NFTtab, Nft.randomTokenOnNFTtab],
    tokens: [Assets.tokensTab, Assets.allTokensOnTokenTab],
  }
  await Assets.waitUntilElementsLoadedProperly(tabMap[tab][0], tabMap[tab][1])
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

When(/^User selects the (.*) NFT$/, async (tokenName: string) => {
  await Assets.getTokenByNameInSend(tokenName).click()
})

When(/^User refreshes the page$/, async () => {
  await browser.refresh()
  await HomePage.waitForLoaderDisappear()
  await Profile.menuButton.waitForClickable({ timeout: 20000 })
})

When(/^User switches send type$/, async () => {
  await Assets.switchSendType.click()
})

When(/^User clicks the back button in Send window$/, async () => {
  await Assets.waitUntilElementsLoadedProperly(
    Assets.backButtonInSendWindow,
    Assets.switchSendType,
  )
})
