import Assets from "../assets.js"
import { Page } from "../page.js"

export class demoAppPage extends Page {
  public demoAppBaseUrl = process.env.DEMO_APPLICATION_URL
    ? process.env.DEMO_APPLICATION_URL
    : "http://localhost:4200"

  get getAnonymousProfiles() {
    return $("#profileID")
  }

  get getPublicProfile() {
    return $("#profile_public")
  }

  get getConnectButton() {
    return $("#connect")
  }

  get getIFrame() {
    return $(`#nfid-embed`)
  }

  get getLogoutButton() {
    return $("//button[contains(.,'Logout')]")
  }

  get getAuthenticateButton() {
    return $("#buttonAuthenticate")
  }

  get getMyDelegationLocator() {
    return $(`#myDelegation`)
  }

  get getMyTargets() {
    return $$(`#myTargetsList`)
  }

  async getAddCanisterIDButton(pageBlock: string) {
    return $(`#${pageBlock} #buttonAddTargetCanisterId`)
  }

  async getLogs(pageBlock: string, position: number[], mayBeEmpty?: boolean) {
    let locator = $(
      `div#${pageBlock} #responseID code span:nth-child(${position[0]}) span:nth-child(${position[1]})`,
    )
    if (!mayBeEmpty) {
      await locator.waitForDisplayed({
        timeout: 50000,
        timeoutMsg: "Logs aren't displayed",
      })
    }
    return locator
  }

  getAddCanisterIDInput(pageBlock: string, number: number) {
    return $(
      `//div[contains(@id, ${pageBlock})]//label[contains(.,'target canisterId ${number}')]/parent::div//input`,
    )
  }

  getDerivationOriginInput(pageBlock: string) {
    return $(
      `//div[contains(@id, ${pageBlock})]//label[contains(.,'Derivation origin')]/parent::div//input`,
    )
  }

  async addCanisterID(pageBlock: string, targetsList: string) {
    let targets = targetsList.split(",")
    for (let i = 0; i < targets.length; i++) {
      if (!(await this.getAddCanisterIDInput(pageBlock, i + 1).isDisplayed())) {
        await this.getAddCanisterIDButton(pageBlock).then(async (it) => {
          await it.waitForClickable()
          await it.click()
        })
      }
      await this.getAddCanisterIDInput(pageBlock, i + 1).then(async (it) => {
        await it.waitForDisplayed()
        await it.setValue(targets[i])
      })
    }
  }

  async clickAuthenticateButton(
    targets: string,
    profile: string,
    derivation?: string,
  ) {
    await browser.pause(6000)
    if (await this.getLogoutButton.isClickable())
      await this.getLogoutButton.click()
    await browser.waitUntil(
      async () => {
        await browser.pause(1000)
        await browser.switchToParentFrame()
        if (derivation)
          await this.getDerivationOriginInput("authentication").setValue(
            derivation,
          )
        await this.addCanisterID("authentication", targets)
        await this.getAuthenticateButton.click()
        await browser.pause(5000)
        if (await this.getIFrame.isDisplayed()) {
          await browser.switchToFrame(await this.getIFrame)
          await this.getPublicProfile.waitForDisplayed({
            timeout: 15000,
            timeoutMsg: "Public Profile is not displayed",
          })
          if (
            profile == "public" &&
            !(await this.getPublicProfile.isClickable())
          ) {
            console.log("Public profile isn't clickable")
            await browser.switchToParentFrame()
            await browser.refresh()
          } else {
            return true
          }
        }
        ;(await this.getLogoutButton.isDisplayed())
          ? await this.getLogoutButton.click()
          : await this.getAuthenticateButton.click()
        await this.checkLoginSuccess()
      },
      {
        timeout: 20000,
      },
    )
  }

  async selectProfile(profileType: string) {
    let profile =
      profileType == "public"
        ? this.getPublicProfile
        : this.getAnonymousProfiles
    await profile.waitForClickable({
      timeout: 50000,
      timeoutMsg: "'Choose Profile' modal window isn't displayed after 50sec",
    })
    await profile.click()
    await this.getConnectButton.click()
  }

  async loginUsingIframe(
    profile: string,
    targets: string,
    derivation?: string,
  ) {
    await this.clickAuthenticateButton(targets, profile, derivation)
    await this.selectProfile(profile)
    await browser.switchToParentFrame()
    await browser.waitUntil(
      async () => {
        let isElementDisplayed = await this.getIFrame.isDisplayed()
        return !isElementDisplayed
      },
      {
        timeout: 50000,
        timeoutMsg: "Login iFrame did not disappear after 50sec",
      },
    )
  }

  async checkLoginSuccess() {
    let messageHeaderLocator = await this.getLogs(
      "authentication",
      [2, 3],
      true,
    )
    let errorBodyLocator = await this.getLogs("authentication", [3, 6], true)
    if (await messageHeaderLocator.isDisplayed()) {
      let text = await errorBodyLocator.getText()
      if ((await messageHeaderLocator.getText()) == `"error"`) {
        throw new Error(text)
      }
    }
  }

  async getAuthLogs() {
    await this.checkLoginSuccess()
    let myMap = new Map()
    if (!(await $("#myTargetsList").isDisplayed())) {
      await this.getMyDelegationLocator.waitForClickable({ timeout: 90000 })
      await this.getMyDelegationLocator.click()
    }
    let myPrincipal = await Assets.getAccountId(false)
    let myAddress = await Assets.getAccountId(true)
    let listTargets = this.getMyTargets
    let myTargets = Promise.all(
      await listTargets.map(async (element) => await element.getText()),
    )
    return myMap
      .set("principal", myPrincipal)
      .set("address", myAddress)
      .set("targets", await myTargets)
  }
}

export default new demoAppPage()
