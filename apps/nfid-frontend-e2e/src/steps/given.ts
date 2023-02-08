import { Given } from "@cucumber/cucumber"

import HomePage from "../pages/home-page"
import closeAllButFirstTab from "./support/action/closeAllButFirstTab"
import openWebsite from "./support/action/openWebsite"
import removeAccountByPhoneNumber from "./support/action/removeAccountByPhoneNumber"
import removeUserE2E from "./support/action/removeUserE2E"
import setWindowSize from "./support/action/setWindowSize"
import { setupVirtualAuthenticator, addWebAuthnCredential } from "./support/action/setupVirtualWebauthn"
import addLocalStorageKey from "./support/check/addLocalStorageKey"
import checkContainsAnyText from "./support/check/checkContainsAnyText"
import checkContainsText from "./support/check/checkContainsText"
import checkCookieContent from "./support/check/checkCookieContent"
import checkCookieExists from "./support/check/checkCookieExists"
import checkDimension from "./support/check/checkDimension"
import checkElementExists from "./support/check/checkElementExists"
import checkEqualsText from "./support/check/checkEqualsText"
import checkIsEmpty from "./support/check/checkIsEmpty"
import checkModal from "./support/check/checkModal"
import checkOffset from "./support/check/checkOffset"
import checkProperty from "./support/check/checkProperty"
import checkSelected from "./support/check/checkSelected"
import checkTitle from "./support/check/checkTitle"
import checkUrl from "./support/check/checkURL"
import compareText from "./support/check/compareText"
import isDisplayed from "./support/check/isDisplayed"
import isEnabled from "./support/check/isEnabled"

Given(/^I remove the e2e@identitylabs.ooo$/, removeUserE2E)

Given(
  /^I remove the account by phone number 380990374146$/,
  removeAccountByPhoneNumber,
)

Given(/^User authenticates with google account$/, async () => {
  await HomePage.authenticateWithGoogle();
  await HomePage.switchToWindow("last");
  await HomePage.pickGoogleAccount();
  await HomePage.switchToWindow();
});

Given(/^User authenticates with enhanced security$/, async function () {
  this.auth = await browser.addVirtualWebAuth("ctap2", "internal", true, true, true, true);
  await HomePage.authenticateWithEnhancedSecurity();
  await HomePage.waitForLoaderDisappear();
})

Given(/^User signs in$/, async function () {
  await HomePage.signIn();
})

Given(/^User opens NFID site$/, async () => {
  await HomePage.openBaseUrl();
})

Given(/^I open the (url|site) "([^"]*)?"$/, openWebsite)

Given(/^the element "([^"]*)?" is( not)* displayed$/, isDisplayed)

Given(/^the element "([^"]*)?" is( not)* enabled$/, isEnabled)

Given(/^the element "([^"]*)?" is( not)* selected$/, checkSelected)

Given(/^the checkbox "([^"]*)?" is( not)* checked$/, checkSelected)

Given(/^there is (an|no) element "([^"]*)?" on the page$/, checkElementExists)

Given(/^the title is( not)* "([^"]*)?"$/, checkTitle)

Given(
  /^the element "([^"]*)?" contains( not)* the same text as element "([^"]*)?"$/,
  compareText,
)

Given(
  /^the (button|element) "([^"]*)?"( not)* matches the text "([^"]*)?"$/,
  checkEqualsText,
)

Given(
  /^the (button|element|container) "([^"]*)?"( not)* contains the text "([^"]*)?"$/,
  checkContainsText,
)

Given(
  /^the (button|element) "([^"]*)?"( not)* contains any text$/,
  checkContainsAnyText,
)

Given(/^the (button|element) "([^"]*)?" is( not)* empty$/, checkIsEmpty)

Given(/^the page url is( not)* "([^"]*)?"$/, checkUrl)

Given(
  /^the( css)* attribute "([^"]*)?" from element "([^"]*)?" is( not)* "([^"]*)?"$/,
  checkProperty,
)

Given(
  /^the cookie "([^"]*)?" contains( not)* the value "([^"]*)?"$/,
  checkCookieContent,
)

Given(/^the cookie "([^"]*)?" does( not)* exist$/, checkCookieExists)

Given(
  /^the element "([^"]*)?" is( not)* ([\d]+)px (broad|tall)$/,
  checkDimension,
)

Given(
  /^the element "([^"]*)?" is( not)* positioned at ([\d]+)px on the (x|y) axis$/,
  checkOffset,
)

Given(/^I have a screen that is ([\d]+) by ([\d]+) pixels$/, setWindowSize)

Given(/^I have closed all but the first (window|tab)$/, closeAllButFirstTab)

Given(/^a (alertbox|confirmbox|prompt) is( not)* opened$/, checkModal)

Given(/^My browser supports WebAuthN$/, async function () {
  this.authenticator = await setupVirtualAuthenticator()
})

Given(
  /^My browser localStorage has a key "([^"]*)?" with value '([^]*)?'$/,
  addLocalStorageKey,
)
