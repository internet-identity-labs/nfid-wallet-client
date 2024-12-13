import { Then, When } from "@cucumber/cucumber"

import { softAssertAll } from "../helpers/softAssertions.js"
import Assets from "../pages/assets.js"
import HomePage from "../pages/home-page.js"
import Profile from "../pages/profile.js"

When(/^Verifying that tokens are displayed on assets tab$/, async () => {
  await Profile.waitUntilBalanceLoaded()
  await Profile.waitForTokensAppear()
})

When(/^User clicks the (.*) option button$/, async (option: string) => {
  await Assets.getTokenOption(option).click()
  await browser.pause(10000)
})

When(
  /^User clicks the ShowHide button of (.*) token$/,
  async (tokenName: string) => {
    await Assets.ManageTokensDialog.tokenShowHideButton(tokenName).then(
      async (it) => {
        await it.waitForDisplayed()
        await browser.pause(1500)
        await it.click()
        await browser.pause(12000)
      },
    )
  },
)

When(/^User filters tokens by (.*)$/, async (token: string) => {
  await Assets.ManageTokensDialog.filterField.setValue(token)
})

When(
  /^User sets the token ([^"]+) to be displayed if needed$/,
  async (tokenName: string) => {
    if (!(await Assets.tokenLabel(tokenName).isDisplayed())) {
      await Assets.ManageTokensDialog.manageTokensDialogButton.click()
      await Assets.ManageTokensDialog.filterField.setValue(tokenName)
      await Assets.ManageTokensDialog.tokenShowHideButton(tokenName).then(
        async (it) => {
          await it.waitForDisplayed()
          await browser.pause(1500)
          await it.click()
        },
      )
      await Assets.tokenLabel(tokenName).waitForDisplayed({
        timeout: 50000,
        timeoutMsg: "Failed attempt to make the token visible",
      })
      await HomePage.clickOnLeftUpperCorner()
      await browser.pause(10000)
    }
  },
)

Then(
  /^Verifying that only (\d+) asset (?:is|are) displayed/,
  async (amount: number) => {
    await Profile.waitForTokens(amount)
  },
)

Then(
  /^Verifying that there is ([^"]*) token with currency ([^"]*) on category ([^"]*), token balance ([^"]*) and USD balance is not 0$/,
  async (
    tokenName: string,
    currency: string,
    category: string,
    balance: string,
  ) => {
    await softAssertAll(
      async () =>
        await browser.waitUntil(
          async () => {
            let currentBalance = (
              await (await Assets.tokenUSDBalance(tokenName)).getText()
            )
              .trim()
              .replace(/[^\d.]/g, "")
            return currentBalance != "0" && currentBalance != undefined
          },
          {
            timeout: 10000,
            timeoutMsg: `Incorrect ${tokenName} token USD balance: must be not 0 and not empty`,
          },
        ),
      async () =>
        expect(await (await Assets.tokenBalance(tokenName)).getText()).toBe(
          balance,
        ),
      async () =>
        expect(await (await Assets.getCurrency(tokenName)).getText()).toBe(
          currency,
        ),
      async () =>
        expect(await (await Assets.getBlockchain(category)).isDisplayed()).toBe(
          true,
        ),
    )
  },
)

Then(
  /^Verifying that the ([^"]+) token is( not)? displayed$/,
  async (tokenName: string, presence: string) => {
    let isDisplayed
    await browser.waitUntil(
      async () => {
        console.log(await Assets.tokenLabel(tokenName).selector)
        isDisplayed = await Assets.tokenLabel(tokenName).isDisplayed()
        return Boolean(presence) ? !isDisplayed : isDisplayed
      },
      {
        timeout: 30000,
        timeoutMsg: `${
          Boolean(presence)
            ? "Token was displayed in 30 sec, but shouldn't"
            : "Token wasn't displayed in 30 sec, but should"
        }`,
      },
    )
  },
)
