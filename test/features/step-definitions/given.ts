import { Given } from "@cucumber/cucumber";
import chai from "chai";
import basePage from "../../page-objects/basePage"

Given(/^Google page is opened$/, async function () {
  await basePage.navigateTo("https://www.google.com");
})
