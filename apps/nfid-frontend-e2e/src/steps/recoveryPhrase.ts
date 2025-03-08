import { When } from "@cucumber/cucumber"

import userClient from "../helpers/accounts-service.js"
import HomePage from "../pages/home-page.js"

When(/^User opens Auth modal window$/, async () => {
  await HomePage.openAuthModal()
})

When(/^User clicks the "Other sign in options" button$/, async () => {
  await HomePage.otherSignInOptionsButton.waitForClickable({
    timeoutMsg: `"Other sign in options" button wasn't clickable`,
  })
  await HomePage.otherSignInOptionsButton.click()
  await HomePage.continueWithRecoveryPhraseButton.waitForClickable({
    timeoutMsg: `"Continue with recovery phrase" button wasn't clickable`,
  })
})

When(/^User enters the recovery phrase of ([^"]*) anchor$/, async (anchor: number) => {
  await HomePage.continueWithRecoveryPhraseButton.click()
  await HomePage.recoveryPhraseTextArea.setValue((await userClient.takeStaticUserByAnchor(anchor)).seed)
  await HomePage.submitRecoveryPhraseButton.click()
  try {
    await HomePage.skipSecureWalletButton.waitForDisplayed({
      timeout: 8000,
    })
  } catch (e) {/*empty*/
  }
  if (await HomePage.skipSecureWalletButton.isDisplayed()) await HomePage.skipSecureWalletButton.click()
})
