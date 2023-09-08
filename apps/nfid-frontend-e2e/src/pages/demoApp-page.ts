import HomePage from "./home-page.js"
import {Page} from "./page.js"

export class demoAppPage extends Page {

  public demoAppBaseUrl = "https://wzkxy-vyaaa-aaaaj-qab3q-cai.ic0.app"

  get updateIframeButton() {
    return $('#updateIframe')
  }

  get getPrincipalIdSelector() {
    return $('#principalID')
  }

  get getAnonymousProfiles() {
    return $('#profileID')
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
