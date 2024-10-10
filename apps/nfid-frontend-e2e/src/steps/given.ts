import { Given } from "@cucumber/cucumber"

import DemoAppPage from "../pages/demoApp/demoApp-page.js"
import HomePage from "../pages/home-page.js"
import clearAuthState from "../helpers/clear-auth-state.js"

//TODO Move to Page.ts
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

Given(/^User opens the demoApp ?(.*)?$/, async function (site: string) {
  await browser.url(DemoAppPage.demoAppBaseUrl)
})

Given(/^User opens NFID ?(.*)?$/, async function (site: string) {
  if (site === "site") await HomePage.openBaseUrl()
  else await HomePage.openPage(site)
  await clearAuthState()
  await HomePage.waitForLoaderDisappear()
  await HomePage.waitForDataCacheLoading()
})
