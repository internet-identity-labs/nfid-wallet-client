import { Given } from "@cucumber/cucumber";
import chai from "chai";
import basePage from "../../page-objects/basePage"

Given(/^User navigates to home page using (.*)$/, async function (url) {
  await basePage.navigateTo(url);
})



