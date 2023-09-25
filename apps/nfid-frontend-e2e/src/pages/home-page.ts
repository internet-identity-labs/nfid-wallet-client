import { Page } from "./page.js"

export class HomePage extends Page {
  private get signInButton() {
    return $$("#btn-signin")
  }

  private get homeBurgerButton() {
    return $("#burger-mobile")
  }

  private get isHomeBurgerMenuOpened() {
    return $("#menu-mobile-window")
  }

  private get authenticationButton() {
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

  private get enhacedSecurity() {
    return $("#continue-with-enhanced-security")
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

  private get whatIfMyDeviceHasBeenStolen() {
    return $("//button[contains(.,'What if my device')]")
  }

  private get recoverNFID() {
    return $("[href*='/recover-nfid']")
  }

  private get trustThisDeviceButton() {
    return $("#trust-this-device")
  }

  private get dontTrustThisDeviceButton() {
    return $("#just-log-me-in")
  }

  public async openHomeBurgerMenu() {
    await this.homeBurgerButton.waitForDisplayed({
      timeout: 7000,
      timeoutMsg: "Burgen Menu is missing!",
    })
    await this.homeBurgerButton.click()
    await this.isHomeBurgerMenuOpened.waitForDisplayed({
      timeout: 3000,
      timeoutMsg: "Burger Menu is not opened",
    })
  }

  public async openAuthModal() {
    await this.authenticationButton.waitForDisplayed({
      timeout: 5000,
    })
    await this.authenticationButton.click()

    await this.authSelection.waitForDisplayed({
      timeout: 5000,
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

  public async authenticateWithEnhancedSecurity() {
    await this.enhacedSecurity.waitForDisplayed({
      timeout: 7000,
      timeoutMsg: "Enhanced Security button is missing!",
    })
    await this.enhacedSecurity.click()
  }

  public async signIn(isMobile?: boolean) {
    let index = isMobile ? 0 : 1
    let counter = 0
    if (isMobile) {
      await this.openHomeBurgerMenu()
    } else {
      await browser.waitUntil(
        async () => (await this.signInButton.length) > 1,
        {
          timeout: 10000,
          timeoutMsg: "Sign In button for desktop is not displayed!",
        },
      )
    }
    await this.signInButton[index].waitForDisplayed({
      timeout: 17000,
      timeoutMsg: "Sign In button is not displayed!",
    })
    await this.signInButton[index].waitForClickable({
      timeout: 4000,
      timeoutMsg: "Sign In button is not clickable!",
    })
    while ((await this.signInButton.length) > 0 && counter < 5) {
      try {
        await this.signInButton[index].click()
        await $(".//div[contains(text(),'Loading')]").waitForDisplayed({
          interval: 8000,
          reverse: true,
        })
        // handles the situation with Registration ceremony
        // https://www.w3.org/TR/webauthn-2/#sctn-privacy-considerations-client
        await browser.waitUntil(
          async () => (await this.signInButton.length) < 1,
          {
            timeout: 6000 + counter * 2500,
          },
        )
        break
      } catch (err) {
        ++counter
      }
    }
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

  public async iTrustThisDevice() {
    await this.trustThisDeviceButton.waitForDisplayed({
      timeout: 30000,
      timeoutMsg: "Trust this device option is missing",
    })
    await this.trustThisDeviceButton.click()
  }

  public async dontTrustThisDevice() {
    await this.dontTrustThisDeviceButton.waitForDisplayed({
      timeout: 30000,
      timeoutMsg: "Just Log Me In option is missing",
    })
    await this.dontTrustThisDeviceButton.click()
  }

  public async recoverAccountWithFAQ() {
    await $(`=${"FAQ"}`).waitForDisplayed({
      timeout: 8000,
      timeoutMsg: "FAQ page is failed to load",
    })

    await this.whatIfMyDeviceHasBeenStolen.waitForDisplayed({ timeout: 7000 })
    await this.whatIfMyDeviceHasBeenStolen.click()

    await this.recoverNFID.waitForDisplayed({ timeout: 6000 })
    await this.recoverNFID.waitForClickable({ timeout: 6000 })
    await this.recoverNFID.click()
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
