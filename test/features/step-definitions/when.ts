import { When } from "@cucumber/cucumber";
import chai from "chai";

When(/^Search with (.*)$/, async function (searchItem) {
  // reporter.addStep(this.testid, "info", `Searching: ${searchItem} in Google...`)
  let ele = await $(`[name=q]`)
  await ele.setValue(searchItem)
  await browser.keys("Enter")
})
