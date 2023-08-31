import HomePage from "./home-page.js"
import {Page} from "./page.js"

export class demoAppPage extends Page {

  public demoAppBaseUrl = "https://hvn26-aiaaa-aaaak-aaa2a-cai.ic0.app"

  get updateIframeButton() {
    return $("//button[contains(@class, 'transition')]/div[contains(.,'Update Iframe')]")
    // .transition=Update Iframe
    //TODO add an ID
  }

  get getPrincipalIdSelector() {
    return $("//div[contains(.,'\"principalId\":') and contains(@class, 'font-mono')]")
    //TODO add an ID
  }

  get getAnonymousProfiles() {
    return $("//div[contains(@class, 'border-gray-300')]/span")
    //TODO add an ID
  }

  public async loginUsingIframe() {
    let iFrame = await $(`iframe.w-full`)
    await iFrame.isDisplayed()
    await browser.switchToFrame(await $(iFrame))
    await HomePage.authenticateWithGoogle()
    await HomePage.switchToWindow("last")
    await HomePage.pickGoogleAccount()
    await HomePage.switchToWindow()
    await browser.switchToFrame(await $(iFrame))
    await this.getAnonymousProfiles.waitForDisplayed()
    await this.getAnonymousProfiles.waitForClickable()
    await this.getAnonymousProfiles.click()
    await browser.switchToParentFrame()
  }

  public async getPrincipalId() {
    await this.getPrincipalIdSelector.waitForDisplayed()
    return await this.getPrincipalIdSelector.getText()
  }
}

export default new demoAppPage()
