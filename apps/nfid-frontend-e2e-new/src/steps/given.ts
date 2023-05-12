import { Given } from "@wdio/cucumber-framework"

import HomePage from "../pages/home-page.js"
import clearAuthState from "./support/actions/clear-auth-state.js"

Given(/^User opens NFID ?(?:(.*))?$/, async function (site: string) {
  if (site === "site") await HomePage.openBaseUrl()
  else await HomePage.openPage(site)
  await HomePage.waitForLoaderDisappear()
  await HomePage.waitForDataCacheLoading()
})

Given(/^authstate is cleared$/, clearAuthState)

Given(/^User signs in ?(?:(.*))?$/, async function (mobile: string) {
  await HomePage.waitForLoaderDisappear()
  if (mobile) await HomePage.signIn(true)
  else await HomePage.signIn()
})
