import { Page } from "./page.js"

export class HomePage extends Page {
  get authenticationButton() {
    return $("#authentication-button")
  }

  private get authSelection() {
    return $("#auth-selection")
  }

  private get googleAuthButton() {
    return $("#google-sign-button")
  }

  private get accountPicker() {
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

  public async openAuthModal() {
    await this.authenticationButton.waitForDisplayed()
    await this.authenticationButton.click()
    await this.authSelection.waitForDisplayed({
      timeout: 5000,
      timeoutMsg: "Auth modal window didn't appear",
    })
  }

  public async authenticateWithGoogle() {
    await this.googleAuthButton.waitForDisplayed({
      timeout: 6000,
      timeoutMsg: "Google auth button is missing!",
    })
    await this.googleAuthButton.waitForClickable()
    await this.googleAuthButton.click()
  }

  public async pickGoogleAccount() {
    await this.accountPicker.waitForDisplayed({
      timeout: 7000,
      timeoutMsg: "Google Account is missing!",
    })
    await this.accountPicker.waitForClickable()
    await this.accountPicker.click()
  }

  public override async loginUsingIframe() {
    await this.openAuthModal()
    await this.authenticateWithGoogle()
    await this.switchToWindow("last")
    await this.pickGoogleAccount()
    await this.switchToWindow()
  }
}

export default new HomePage()
