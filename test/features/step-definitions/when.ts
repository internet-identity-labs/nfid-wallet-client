import { When } from "@cucumber/cucumber";
import basePage from "../../page-objects/basePage"

When(/^user clicks on (.*) link on the navigation bar$/, async function (sectionName) {
  await basePage.clickOnSection(sectionName);
})
