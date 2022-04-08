import { When } from "@cucumber/cucumber";
import chai from "chai";
import basePage from "../../page-objects/basePage"

When(/^user clicks on (.*) link on the navigation bar$/, async function (x) {
  await basePage.dummy();
})
