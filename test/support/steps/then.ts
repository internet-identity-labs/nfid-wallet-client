import { Then } from "@cucumber/cucumber"

import waitFor from "../action/waitFor"
import waitForVisible from "../action/waitForDisplayed"
import checkClass from "../check/checkClass"
import checkContainsAnyText from "../check/checkContainsAnyText"
import checkContainsText from "../check/checkContainsText"
import checkCookieContent from "../check/checkCookieContent"
import checkCookieExists from "../check/checkCookieExists"
import checkDimension from "../check/checkDimension"
import checkEqualsText from "../check/checkEqualsText"
import checkFocus from "../check/checkFocus"
import checkFontProperty from "../check/checkFontProperty"
import checkInURLPath from "../check/checkInURLPath"
import checkIsEmpty from "../check/checkIsEmpty"
import checkIsOpenedInNewWindow from "../check/checkIsOpenedInNewWindow"
import checkModal from "../check/checkModal"
import checkModalText from "../check/checkModalText"
import checkNewWindow from "../check/checkNewWindow"
import checkOffset from "../check/checkOffset"
import checkProperty from "../check/checkProperty"
import checkSelected from "../check/checkSelected"
import checkTitle from "../check/checkTitle"
import checkTitleContains from "../check/checkTitleContains"
import checkURL from "../check/checkURL"
import checkURLPath from "../check/checkURLPath"
import checkWithinViewport from "../check/checkWithinViewport"
import compareText from "../check/compareText"
import isVisible from "../check/isDisplayed"
import isEnabled from "../check/isEnabled"
import isExisting from "../check/isExisting"
import checkIfElementExists from "../lib/checkIfElementExists"

Then(/^I expect that the title is( not)* "([^"]*)?"$/, checkTitle)

Then(/^I expect that the title( not)* contains "([^"]*)?"$/, checkTitleContains)

Then(
  /^I expect that element "([^"]*)?" does( not)* appear exactly "([^"]*)?" times$/,
  checkIfElementExists,
)

Then(/^I expect that element "([^"]*)?" is( not)* displayed$/, isVisible)

Then(
  /^I expect that element "([^"]*)?" becomes( not)* displayed$/,
  waitForVisible,
)

Then(
  /^I expect that element "([^"]*)?" is( not)* within the viewport$/,
  checkWithinViewport,
)

Then(/^I expect that element "([^"]*)?" does( not)* exist$/, isExisting)

Then(
  /^I expect that element "([^"]*)?"( not)* contains the same text as element "([^"]*)?"$/,
  compareText,
)

Then(
  /^I expect that (button|element) "([^"]*)?"( not)* matches the text "([^"]*)?"$/,
  checkEqualsText,
)

Then(
  /^I expect that (button|element|container) "([^"]*)?"( not)* contains the text "([^"]*)?"$/,
  checkContainsText,
)

Then(
  /^I expect that (button|element) "([^"]*)?"( not)* contains any text$/,
  checkContainsAnyText,
)

Then(
  /^I expect that (button|element) "([^"]*)?" is( not)* empty$/,
  checkIsEmpty,
)

Then(/^I expect that the url is( not)* "([^"]*)?"$/, checkURL)

Then(/^I expect that the path is( not)* "([^"]*)?"$/, checkURLPath)

Then(/^I expect the url to( not)* contain "([^"]*)?"$/, checkInURLPath)

Then(
  /^I expect that the( css)* attribute "([^"]*)?" from element "([^"]*)?" is( not)* "([^"]*)?"$/,
  checkProperty,
)

Then(
  /^I expect that the font( css)* attribute "([^"]*)?" from element "([^"]*)?" is( not)* "([^"]*)?"$/,
  checkFontProperty,
)

Then(/^I expect that checkbox "([^"]*)?" is( not)* checked$/, checkSelected)

Then(/^I expect that element "([^"]*)?" is( not)* selected$/, checkSelected)

Then(/^I expect that element "([^"]*)?" is( not)* enabled$/, isEnabled)

Then(
  /^I expect that cookie "([^"]*)?"( not)* contains "([^"]*)?"$/,
  checkCookieContent,
)

Then(/^I expect that cookie "([^"]*)?"( not)* exists$/, checkCookieExists)

Then(
  /^I expect that element "([^"]*)?" is( not)* ([\d]+)px (broad|tall)$/,
  checkDimension,
)

Then(
  /^I expect that element "([^"]*)?" is( not)* positioned at ([\d+.?\d*]+)px on the (x|y) axis$/,
  checkOffset,
)

Then(
  /^I expect that element "([^"]*)?" (has|does not have) the class "([^"]*)?"$/,
  checkClass,
)

Then(/^I expect a new (window|tab) has( not)* been opened$/, checkNewWindow)

Then(
  /^I expect the url "([^"]*)?" is opened in a new (tab|window)$/,
  checkIsOpenedInNewWindow,
)

Then(/^I expect that element "([^"]*)?" is( not)* focused$/, checkFocus)

Then(
  /^I wait on element "([^"]*)?"(?: for (\d+)ms)*(?: to( not)* (be checked|be enabled|be selected|be displayed|contain a text|contain a value|exist))*$/,
  {
    wrapperOptions: {
      retry: 3,
    },
  },
  waitFor,
)

Then(
  /^I expect that a (alertbox|confirmbox|prompt) is( not)* opened$/,
  checkModal,
)

Then(
  /^I expect that a (alertbox|confirmbox|prompt)( not)* contains the text "([^"]*)?"$/,
  checkModalText,
)
