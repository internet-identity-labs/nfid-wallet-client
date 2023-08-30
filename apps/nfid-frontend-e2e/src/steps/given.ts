import { Given } from "@cucumber/cucumber"

import HomePage from "../pages/home-page.js"
import DemoAppPage from "../pages/demoApp-page.js"
import clearAuthState from "./support/action/clear-auth-state.js"
import closeAllButFirstTab from "./support/action/closeAllButFirstTab.js"
import openWebsite from "./support/action/openWebsite.js"
import removeAccountByPhoneNumber from "./support/action/removeAccountByPhoneNumber.js"
import removeUserE2E from "./support/action/removeUserE2E.js"
import setWindowSize from "./support/action/setWindowSize.js"
import addLocalStorageKey from "./support/check/addLocalStorageKey.js"
import checkContainsAnyText from "./support/check/checkContainsAnyText.js"
import checkContainsText from "./support/check/checkContainsText.js"
import checkCookieContent from "./support/check/checkCookieContent.js"
import checkCookieExists from "./support/check/checkCookieExists.js"
import checkDimension from "./support/check/checkDimension.js"
import checkElementExists from "./support/check/checkElementExists.js"
import checkEqualsText from "./support/check/checkEqualsText.js"
import checkIsEmpty from "./support/check/checkIsEmpty.js"
import checkModal from "./support/check/checkModal.js"
import checkOffset from "./support/check/checkOffset.js"
import checkProperty from "./support/check/checkProperty.js"
import checkSelected from "./support/check/checkSelected.js"
import checkTitle from "./support/check/checkTitle.js"
import checkUrl from "./support/check/checkURL.js"
import compareText from "./support/check/compareText.js"
import isDisplayed from "./support/check/isDisplayed.js"
import isEnabled from "./support/check/isEnabled.js"

Given(/^I remove the e2e@identitylabs.ooo$/, removeUserE2E)

Given(
  /^I remove the account by phone number 380990374146$/,
  removeAccountByPhoneNumber,
)

Given(/^authstate is cleared$/, clearAuthState)

Given(/^User authenticates( to demoApp)? with google account$/, async (isDemoApp: string) => {
  if (isDemoApp === " to demoApp") {
    await DemoAppPage.loginUsingIframe()
  } else {
    await HomePage.openAuthModal()
    await HomePage.authenticateWithGoogle()
    await HomePage.switchToWindow("last")
    await HomePage.pickGoogleAccount()
    await HomePage.switchToWindow()
  }
})

Given(/^User authenticates with enhanced security$/, async function () {
  this.auth = await browser.addVirtualAuthenticator(
    "ctap2",
    "internal",
    true,
    true,
    true,
    true,
  )
  await HomePage.authenticateWithEnhancedSecurity()
  await HomePage.waitForLoaderDisappear()
})

Given(/^User signs in ?(?:(.*))?$/, async function (mobile: string) {
  if (mobile) await HomePage.signIn(true)
  else await HomePage.signIn()
})

Given(/^User opens the demoApp ?(.*)?$/, async function (site: string) {
  if (site != null) await browser.url(DemoAppPage.demoAppBaseUrl + site)
  else await browser.url(DemoAppPage.demoAppBaseUrl)
})

Given(/^User opens NFID ?(.*)?$/, async function (site: string) {
  if (site === "site") await HomePage.openBaseUrl()
  else await HomePage.openPage(site)
  await HomePage.waitForLoaderDisappear()
  await HomePage.waitForDataCacheLoading()
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

Given(
  /^My browser localStorage has a key "([^"]*)?" with value '([^]*)?'$/,
  addLocalStorageKey,
)
