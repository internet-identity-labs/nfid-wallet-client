import { Then } from "@wdio/cucumber-framework"

import Profile from "../pages/profile.js"

Then(/^NFID number is not zero$/, async () => {
  const actualNFID = await Profile.getNFIDnumber()
  expect(actualNFID).not.toBe("0")
})
