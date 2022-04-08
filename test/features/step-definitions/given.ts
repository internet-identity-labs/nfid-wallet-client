import { Given } from "@cucumber/cucumber";
import chai from "chai";
import basePage from "../../page-objects/basePage"

Given(/^User navigates to home page using$/, async function () {
  await basePage.navigateTo('https://dq6kg-laaaa-aaaah-aaeaq-cai.raw.ic0.app/');
})



