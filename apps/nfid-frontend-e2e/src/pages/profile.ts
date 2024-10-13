import { HomePage } from "./home-page.js"

export class Profile extends HomePage {
  private get tokens() {
    return $$("table tbody tr")
  }

  public get totalBalance() {
    return $("#totalBalance")
  }

  get sendButton() {
    return $("#sendButton")
  }

  get receiveButton() {
    return $("#receiveButton")
  }

  public async waitForTokensAppear(amount?: number) {
    await browser.waitUntil(
      async () => (await this.tokens.length) === amount || 1,
      {
        timeout: 50000,
        timeoutMsg: "Not all tokens displayed on user profile!",
      },
    )
  }

  public async waitForTokens(amount: number) {
    await browser.waitUntil(async () => (await this.tokens.length) === amount, {
      timeout: 50000,
      timeoutMsg: "Not all tokens displayed on user profile!",
    })
  }

  public async waitUntilBalanceLoaded() {
    await browser.waitUntil(async () => {
      return (await this.totalBalance.getText() != "")
    }, { timeout: 15000, timeoutMsg: "Balance wasn't loaded in 1500" })
  }
}

export default new Profile()
