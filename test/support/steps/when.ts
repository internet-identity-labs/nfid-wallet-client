import { When } from "@cucumber/cucumber"

import clearInputField from "../action/clearInputField"
import clickElement from "../action/clickElement"
import closeLastOpenedWindow from "../action/closeLastOpenedWindow"
import deleteCookies from "../action/deleteCookies"
import dragElement from "../action/dragElement"
import focusLastOpenedWindow from "../action/focusLastOpenedWindow"
import handleModal from "../action/handleModal"
import moveTo from "../action/moveTo"
import pause from "../action/pause"
import pressButton from "../action/pressButton"
import scroll from "../action/scroll"
import selectOption from "../action/selectOption"
import selectOptionByIndex from "../action/selectOptionByIndex"
import setCookie from "../action/setCookie"
import setInputField from "../action/setInputField"
import setPromptText from "../action/setPromptText"

When(
  /^I (click|doubleclick) on the (link|button|element) "([^"]*)?"$/,
  clickElement,
)

When(/^I (add|set) "([^"]*)?" to the inputfield "([^"]*)?"$/, setInputField)

When(/^I clear the inputfield "([^"]*)?"$/, clearInputField)

When(/^I drag element "([^"]*)?" to element "([^"]*)?"$/, dragElement)

When(/^I pause for (\d+)ms$/, pause)

When(/^I set a cookie "([^"]*)?" with the content "([^"]*)?"$/, setCookie)

When(/^I delete the cookie "([^"]*)?"$/, deleteCookies)

When(/^I press "([^"]*)?"$/, pressButton)

When(/^I (accept|dismiss) the (alertbox|confirmbox|prompt)$/, handleModal)

When(/^I enter "([^"]*)?" into the prompt$/, setPromptText)

When(/^I scroll to element "([^"]*)?"$/, scroll)

When(/^I close the last opened (window|tab)$/, closeLastOpenedWindow)

When(/^I focus the last opened (window|tab)$/, focusLastOpenedWindow)

When(
  /^I select the (\d+)(st|nd|rd|th) option for element "([^"]*)?"$/,
  selectOptionByIndex,
)

When(
  /^I select the option with the (name|value|text) "([^"]*)?" for element "([^"]*)?"$/,
  selectOption,
)

When(
  /^I move to element "([^"]*)?"(?: with an offset of (\d+),(\d+))*$/,
  moveTo,
)
