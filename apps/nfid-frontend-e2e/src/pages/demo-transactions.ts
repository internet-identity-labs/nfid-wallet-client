import {demoAppPage} from "./demoApp-page.js"
import {ProfileType} from "./types.js"

export class DemoTransactions extends demoAppPage {
  get getAuthenticateButton() {
    return $("//button[contains(.,\'Authenticate\')]")
  }

  get getLogoutButton() {
    return $("//button[contains(.,\'Logout\')]")
  }

  get getAuthLogsLocator() {
    return $("//code[contains(.,'principal')]")
  }

  get getReceiverICAddressInput() {
    return $("//h4[contains(.,'Request ICP transfer')]/..//label[contains(.,'Receiver IC address')]/..//input")
  }

  get getAmountICPInput() {
    return $("//h4[contains(.,'Request ICP transfer')]/..//label[contains(.,'Amount ICP')]/..//input")
  }

  get getRequestICPButton() {
    return $("//h4[contains(.,'Request ICP transfer')]/..//button")
  }

  get getTransferLogsLocator() {
    return $("//h4[contains(.,'Request ICP transfer')]/..//pre")
  }

  async getAuthLogs() {
    await browser.waitUntil(async () => {
      let text = new Map(Object.entries(JSON.parse(await this.getAuthLogsLocator.getText())))
      if (text.get("principal") != "" && text.get("address") != "" && text.get("balance") != "") return true
    }, {
      timeout: 20000,
      timeoutMsg: "Authentication logs are not appeared"
    })
    return new Map(Object.entries(JSON.parse(await this.getAuthLogsLocator.getText())))
  }

  async getTransferLogs() {
    return new Map(Object.entries(JSON.parse(await this.getTransferLogsLocator.getText())))
  }

  async clickAuthenticateButton() {
    await browser.waitUntil(async () => {
        if (await this.getLogoutButton.isDisplayed()) await this.getLogoutButton.click()
        if (await $("#nfid-embed").isDisplayed() ?
          true
          :
          (await this.getLogoutButton.isDisplayed() ?
            await this.getLogoutButton.click()
            :
            await this.getAuthenticateButton.click()))
          return true
      },
      {
        timeout: 15000,
        timeoutMsg: "Google account iframe is not appeared",
      }
    )
  }

  async sendICPTransaction(amount: number, address: string) {
    await this.getReceiverICAddressInput.setValue(address)
    await this.getAmountICPInput.setValue(amount)
    await this.getRequestICPButton.click()
  }

  async selectProfile(profile: ProfileType) {
    return profile == ProfileType.public ? super.getPublicProfile : super.getAnonymousProfiles
  }

  public override async loginUsingIframe(profile: ProfileType) {
    await this.clickAuthenticateButton()
    await browser.switchToFrame(await $("#nfid-embed"))
    await (await this.selectProfile(profile)).waitForDisplayed({timeout: 50000})
    await (await this.selectProfile(profile)).waitForClickable()
    await this.getPublicProfile.click()
    await browser.switchToParentFrame()
  }
}

export default new DemoTransactions()
