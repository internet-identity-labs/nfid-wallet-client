import { Given } from "@wdio/cucumber-framework"

import HomePage from "../pages/home-page.js"

Given(/^User opens NFID ?(?:(.*))?$/, async function (site: string) {
  if (site === "site") await HomePage.openBaseUrl()
  else await HomePage.openPage(site)
  await HomePage.waitForLoaderDisappear()
  await HomePage.waitForDataCacheLoading()
})
