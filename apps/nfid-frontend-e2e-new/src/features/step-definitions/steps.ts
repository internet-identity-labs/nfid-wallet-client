import { Given, When, Then } from "@wdio/cucumber-framework";

import LoginPage from "../pageobjects/login.page.js";
import SecurePage from "../pageobjects/secure.page.js";

const pages = {
  login: LoginPage,
};

Given(/^my browser supports WebAuthN$/, async () => {
  const id = await browser.addVirtualAuthenticator(
    "ctap2",
    "internal",
    true,
    true,
    true,
    true
  );
  console.debug("Virtual authenticator created with id", id);
});

Given(/^I am on the (\w+) page$/, async (page) => {
  await pages[page].open();
});

When(/^I login with (\w+) and (.+)$/, async (username, password) => {
  await LoginPage.login(username, password);
});

Then(/^I should see a flash message saying (.*)$/, async (message) => {
  await expect(SecurePage.flashAlert).toBeExisting();
  await expect(SecurePage.flashAlert).toHaveTextContaining(message);
});
