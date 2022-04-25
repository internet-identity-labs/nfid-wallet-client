
import { Then } from "@cucumber/cucumber";
import chai from "chai";
import basePage from "../../page-objects/basePage"

Then(/^user should be navigated to (.*)$/, async function (sectionName) {
  chai.expect(await basePage.getSectionName(sectionName)).to.contains(sectionName)
})
