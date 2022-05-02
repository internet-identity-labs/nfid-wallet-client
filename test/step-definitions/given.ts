import { Given } from "@cucumber/cucumber"

import DFX_JSON from "../../.dfx/local/canister_ids.json"
import basePage from "../step-definitions/basePage"
import isEnabled from "../page-objects/checks/isEnabled"
import isDisplayed from "../page-objects/checks/isDisplayed"
import isExisting from "../page-objects/checks/isEnabled"

const getUrl = (basePath: string) => {
  return `${basePath}?canisterId=${DFX_JSON.assets.local}`
}

Given(/^User navigates to home page using$/, async function () {
  await basePage.navigateTo(getUrl("/"))
})

Given(/^User is registered$/, async function () {})

Given(
  /^User opens third party application for the first time$/,
  async function () {},
)
