import { Given, When } from "@cucumber/cucumber"

import clearAuthState from "../helpers/clear-auth-state.js"
import DemoAppPage from "../pages/demoApp/demoApp-page.js"
import HomePage from "../pages/home-page.js"
import userClient from "../helpers/accounts-service.js"
import Profile from "../pages/profile.js"

const pages = {
  DemoTransactions: DemoAppPage,
  HomePage: HomePage,
}

Given(/^authstate is cleared$/, clearAuthState)

Given(
  /^User authenticates to ?(.*) with (?:shared NFID Wallet address|google account)( using (.*) profile)?( with (.*) canister)?( and (.*))?$/,
  async (
    page: string,
    profile?: string,
    targets?: string,
    derivation?: string,
  ) => {
    // @ts-ignore
    await pages[page].loginUsingIframe(profile, targets, derivation)
  },
)

Given(/^User opens NFID ?(.*)?$/, async function(site: string) {
  if (site === "site") await HomePage.openBaseUrl()
  else await HomePage.openPage(site)
  await clearAuthState()
  await HomePage.waitForLoaderDisappear()
  await HomePage.waitForDataCacheLoading()
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

When(/^Verifying that user is logged in$/, async () => {
  await HomePage.waitForLoaderDisappear()
  await Profile.menuButton.waitForClickable({ timeout: 20000 })
})
