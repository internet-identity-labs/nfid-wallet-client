import { Given } from "@cucumber/cucumber"

import closeAllButFirstTab from "../action/closeAllButFirstTab"
import openWebsite from "../action/openWebsite"
import setWindowSize from "../action/setWindowSize"
import checkContainsAnyText from "../check/checkContainsAnyText"
import checkContainsText from "../check/checkContainsText"
import checkCookieContent from "../check/checkCookieContent"
import checkCookieExists from "../check/checkCookieExists"
import checkDimension from "../check/checkDimension"
import checkElementExists from "../check/checkElementExists"
import checkEqualsText from "../check/checkEqualsText"
import checkIsEmpty from "../check/checkIsEmpty"
import checkModal from "../check/checkModal"
import checkOffset from "../check/checkOffset"
import checkProperty from "../check/checkProperty"
import checkSelected from "../check/checkSelected"
import checkTitle from "../check/checkTitle"
import checkUrl from "../check/checkURL"
import compareText from "../check/compareText"
import isDisplayed from "../check/isDisplayed"
import isEnabled from "../check/isEnabled"

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
