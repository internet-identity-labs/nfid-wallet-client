import { Page } from "./page.js"

export class HomePage extends Page {
  get authenticationButton() {
    return $("#authentication-button")
  }

  get authSelection() {
    return $("#auth-selection")
  }

  get googleAuthButton() {
    return $("#google-sign-button")
  }

  get accountPicker() {
    return $("#credentials-picker > div:first-child") //picks first account from the list
  }

  get otherSignInOptionsButton() {
    return $("#other-sign-button")
  }

  get continueWithRecoveryPhraseButton() {
    return $("#continue-recovery-phrase")
  }

  get recoveryPhraseTextArea() {
    return $("#recovery-phrase-text-area")
  }

  get submitRecoveryPhraseButton() {
    return $("#submit-recovery-phrase")
  }

  get skipSecureWalletButton() {
    return $("#skip-secure-wallet")
  }

  async openAuthModal() {
    await this.authenticationButton.waitForDisplayed()
    await this.authenticationButton.click()
    await this.authSelection.waitForDisplayed({
      timeoutMsg: "Auth modal window didn't appear",
    })
  }

  async authenticateWithGoogle() {
    await this.googleAuthButton.waitForDisplayed({
      timeoutMsg: "Google auth button is missing!",
    })
    await this.googleAuthButton.waitForClickable()
    await this.googleAuthButton.click()
  }

  async pickGoogleAccount() {
    await this.accountPicker.waitForDisplayed({
      timeoutMsg: "Google Account is missing!",
    })
    await this.accountPicker.waitForClickable()
    await this.accountPicker.click()
  }

  override async loginUsingIframe() {
    await this.openAuthModal()
    await this.authenticateWithGoogle()
    await this.switchToWindow("last")
    await this.pickGoogleAccount()
    await this.switchToWindow()
  }
}

export default new HomePage()
