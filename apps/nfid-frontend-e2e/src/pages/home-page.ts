import { Page } from "./page"

export class HomePage extends Page {
  private get googleAuthButton() {
    return $(".//iframe[contains(@src,'accounts.google')]")
  }

  private get accountPicker() {
    return $("#credentials-picker > div:first-child") //picks first account from the list
  }

  private get captchaImage() {
    return $("#captcha-img")
  }

  private get captchaInput() {
    return $("#enter-captcha")
  }

  private get enterCaptcha() {
    return $("#enter-captcha")
  }

  private get createNFID() {
    return $("#create-nfid")
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

  public async captchaPass() {
    await this.captchaImage.waitForDisplayed({
      timeout: 18000,
      interval: 1000,
      timeoutMsg: "Captha is failed to appear",
    })
    await this.enterCaptcha.waitForDisplayed({ timeout: 15000, interval: 1500 })
    await this.captchaInput.waitForDisplayed({ timeout: 10000 })
    expect(await this.captchaInput.getValue()).toBe("")
    await this.createNFID.waitForDisplayed({ timeout: 10000 })
    expect(await this.createNFID).not.toBeClickable()
    await this.captchaInput.setValue("a")
    await this.createNFID.click()
    return this
  }

  public async justLogMeIn() {
    await $("#just-log-me-in").waitForDisplayed({
      timeout: 30000,
      timeoutMsg: "Just Log Me In option is missing",
    })
    await $("#just-log-me-in").click()
  }
}

export default new HomePage()
