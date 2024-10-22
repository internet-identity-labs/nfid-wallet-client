import { HomePage } from "./home-page.js"

export class Profile extends HomePage {
  get menuButton() {
    return $("#profile")
  }

  private get tokens() {
    return $$("table tbody tr")
  }

  public get totalBalance() {
    return $("#totalBalance")
  }

  get principal() {
    return $("#principal")
  }

  get sendButton() {
    return $("#sendButton")
  }

  get receiveButton() {
    return $("#receiveButton")
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
      { timeout: 25000, timeoutMsg: "Balance wasn't loaded in 2500sec" },
    )
  }

  public async waitUntilPrincipalLoaded() {
    await browser.waitUntil(
      async () => {
        return (await this.principal.getText()) != ""
      },
      { timeout: 25000, timeoutMsg: "Principal wasn't loaded in 2500sec" },
    )
  }
}

export default new Profile()
