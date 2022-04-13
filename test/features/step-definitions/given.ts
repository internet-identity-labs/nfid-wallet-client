import { Given } from "@cucumber/cucumber"

import basePage from "../../page-objects/basePage"

Given(/^User navigates to home page using$/, async function () {
  await basePage.navigateTo("https://dq6kg-laaaa-aaaah-aaeaq-cai.raw.ic0.app/")
})

Given(/^User is registered$/, async function () {})

Given(
  /^User opens third party application for the first time$/,
  async function () {},
)

Given(/^User navigates to demo app page using$/, async function () {
  await basePage.navigateTo("https://wzkxy-vyaaa-aaaaj-qab3q-cai.ic0.app/")
})
