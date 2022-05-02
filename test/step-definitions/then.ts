
import { Then } from "@cucumber/cucumber";
import chai from "chai";
import basePage from "../step-definitions/basePage"
import isEnabled from "../page-objects/checks/isEnabled"
import isDisplayed from "../page-objects/checks/isDisplayed"
import isExisting from "../page-objects/checks/isEnabled"

Then(/^user should be navigated to (.*)$/, async function (sectionName) {
  chai.expect(await basePage.getSectionName(sectionName)).to.contains(sectionName)
})

Then(/^the user should see something$/, () => {
  console.log("implement me")
})

Then(/^the user should see something else$/, () => {
  console.log("implement me")
})
