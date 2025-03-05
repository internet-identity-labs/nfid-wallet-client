import { Page } from "./page.js"

export class Profile extends Page {
  get menuButton() {
    return $("#profile")
  }

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

  get disconnectButton() {
    return $("#nav-logout")
  }

  public async waitForTokensAppear(amount?: number) {
    await browser.waitUntil(
      async () => {
        return amount
          ? (await this.tokens.length) === amount
          : (await this.tokens.length) > 0
      },
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
    await browser.waitUntil(
      async () => {
        return (await this.totalBalance.getText()) != ""
      },
      { timeout: 70000, timeoutMsg: "Balance wasn't loaded in 35sec" },
    )
  }
}

export default new Profile()
