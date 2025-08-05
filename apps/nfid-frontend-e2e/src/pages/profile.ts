import { Page } from "./page.js"

export class Profile extends Page {
  get menuButton() {
    return $("#profile")
  }

  get tokens() {
    return $$("table tbody tr")
  }

  get totalBalance() {
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

  async waitForTokensAppear(amount?: number) {
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

  async waitForTokens(amount: number) {
    await browser.waitUntil(async () => (await this.tokens.length) === amount, {
      timeout: 50000,
      timeoutMsg: "Not all tokens displayed on user profile!",
    })
  }

  async waitUntilBalanceLoaded() {
    await browser.waitUntil(
      async () => {
        try {
          await browser.waitUntil(
            async () => {
              return await this.totalBalance.getText() !== ""
            }, { timeout: 70000 },
          )
          return true
        } catch (e) {
          await browser.refresh()
          return false
        }
      },
      {
        timeout: 150000,
        timeoutMsg: "Balance wasn't loaded in 100sec",
      },
    )
  }
}

export default new Profile()
