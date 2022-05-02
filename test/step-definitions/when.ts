import { When } from "@cucumber/cucumber";
import basePage from "../step-definitions/basePage"
import isEnabled from "../page-objects/checks/isEnabled"
import isDisplayed from "../page-objects/checks/isDisplayed"
import isExisting from "../page-objects/checks/isEnabled"

When(/^user clicks on (.*) link on the navigation bar$/, async function (sectionName) {
  await basePage.clickOnSection(sectionName);
})

When(/^user clicks on register$/, () => {
  console.log("implement me")
})

When(/^user clicks on the qrcode$/, () => {
  console.log("implement me")
})
