import { Then } from "@wdio/cucumber-framework"

import Profile from "../pages/profile.js"
import waitForVisible from "./support/actions/waitForDisplayed.js"

Then(/^NFID number is not zero$/, async () => {
  const actualNFID = await Profile.getNFIDnumber()
  expect(actualNFID).not.toBe("0")
})

Then(
  /^I expect that element ([^"]*)? becomes( not)* displayed$/,
  waitForVisible,
)