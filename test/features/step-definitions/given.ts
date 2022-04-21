import { Given } from "@cucumber/cucumber"

import basePage from "../../page-objects/basePage"

Given(/^User navigates to home page using$/, async function () {
  await basePage.navigateTo("/")
})
