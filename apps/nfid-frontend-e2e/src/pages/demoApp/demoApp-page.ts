import {Page} from "../page.js"
import Assets from "../assets.js"

export class demoAppPage extends Page {

  public demoAppBaseUrl = process.env.NFID_DEMO_URL
    ? process.env.NFID_DEMO_URL
    : "http://localhost:4200"

  get getAnonymousProfiles() {
    return $('#profileID')
  }

  get getPublicProfile() {
    return $('#publicProfileID')
  }

  get getAddCanisterIDInput() {
    return $("//label[contains(.,'target canisterId 1')]/parent::div//input")
  }

  get getAddCanisterIDButton() {
    return $('#buttonAddTargetCanisterId')
  }

  get getIFrame() {
    return $(`#nfid-embed`)
  }

  get getLogoutButton() {
    return $("//button[contains(.,\'Logout\')]")
  }

  get getAuthenticateButton() {
    return $('#buttonAuthenticate')
  }

  get getMyDelegationLocator() {
    return $(`#myDelegation`)
  }

  get getMyTargets() {
    return $(`#myTargetsList`)
  }

  async addCanisterID(targets: string[]) {
    if (!await this.getAddCanisterIDInput.isDisplayed() && await this.getAddCanisterIDButton.isClickable()) {
      await this.getAddCanisterIDButton.click()
      await this.getAddCanisterIDInput.setValue(String(targets))
    }
  }

  async clickAuthenticateButton(targets: string[], profile: string) {
    if (await this.getLogoutButton.isDisplayed()) await this.getLogoutButton.click()
    await browser.waitUntil(async () => {
        await this.addCanisterID(targets)
        if (await this.getIFrame.isDisplayed()) {
          await browser.switchToFrame(await this.getIFrame)
          await this.getPublicProfile.waitForDisplayed({timeoutMsg: "Google account iframe is not displayed"})
          if (profile == "public" && !await this.getPublicProfile.isClickable()) {
            await browser.switchToParentFrame()
            await browser.refresh()
          } else return true
        }
        await browser.switchToParentFrame()
        await this.getLogoutButton.isDisplayed() ? await this.getLogoutButton.click() : await this.getAuthenticateButton.click()
      },
      {
        timeout: 15000,
        timeoutMsg: "Google account iframe is not appeared",
      }
    )
  }

  async selectProfile(profile: string) {
    return profile == "public" ? this.getPublicProfile : this.getAnonymousProfiles
  }

  async loginUsingIframe(profile: string, targets: string[]) {
    await this.clickAuthenticateButton(targets, profile)
    await (await this.selectProfile(profile)).waitForClickable({
      timeout: 50000, timeoutMsg: "'Choose Profile' modal window isn't appear after 50sec"
    })
    await this.getPublicProfile.click()
    await browser.switchToParentFrame()
    await browser.waitUntil(async () => {
      let isElementDisplayed = await this.getIFrame.isDisplayed()
      return !isElementDisplayed
    }, {timeout: 50000, timeoutMsg: "Login iFrame did not disappear after 50sec"})
  }

  async getAuthLogs() {
    let myMap = new Map()
    await this.getMyDelegationLocator.waitForClickable({timeout: 90000})
    await this.getMyDelegationLocator.click()
    let myPrincipal = await Assets.getAccountId(false)
    let myAddress = await Assets.getAccountId(true)
    let myTargets = await this.getMyTargets.getText()
    return myMap.set("principal", myPrincipal).set("address", myAddress).set("targets", myTargets)
  }
}


export default new demoAppPage()
