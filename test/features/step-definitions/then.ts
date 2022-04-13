
import { Then } from "@cucumber/cucumber";
import chai from "chai";
import basePage from "../../page-objects/basePage"

Then(/^user should be navigated to (.*)$/, async function (sectionName) {
  chai.expect(await basePage.getSectionName(sectionName)).to.equal(sectionName)
})

Then(/^user should be switched to new window$/, async function () {
  chai.expect(await basePage.getWindowTitle()).to.equal('Internet Computer Content Validation Bootstrap')
})


