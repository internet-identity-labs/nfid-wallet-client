import { Then } from "@cucumber/cucumber";
import chai from "chai";

Then(/^URL should match (.*)$/, async function (expectedURL) {
  // await browser.waitUntil(async function () {
  //     return await browser.getTitle() === "WebdriverIO · Next-gen browser and mobile automation test framework for Node.js | WebdriverIO"
  // }, {timeout: 20000, interval: 500, timeoutMsg: `Failed loading WDIO web page: ${await browser.getTitle()}`})

  let url = await browser.getUrl()
  chai.expect(url).to.equal(expectedURL)
})

Then(/^Click on the first search result$/, async function () {
  // reporter.addStep(this.testid, "info", `Clicking on first search items...`)
  let ele = await $(`<h3>`)
  ele.click()
})
