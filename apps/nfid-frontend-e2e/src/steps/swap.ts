import { When } from "@cucumber/cucumber"

import Activity from "../pages/activity.js"
import Assets from "../pages/assets.js"

let currentSourceTokenBalance: number
let currentTargetTokenBalance: number
let expectedTargetTokenAmount: number
let sourceTokenAmountToSwap: number
When(/^Verifying that the swap transaction is success$/, async () => {
  await Assets.SwapDialog.successTitle.waitForDisplayed()
  await Assets.SwapDialog.closeButton.click()
})

When(/^User clicks the Swap tokens button$/, async () => {
  await Assets.SwapDialog.swapTokensButton.click()
  await browser.waitUntil(
    async () => {
      return (
        (await Assets.SwapDialog.successTitle.getText()) == "Swap successful"
      )
    },
    { timeout: 60000, timeoutMsg: "Swap successful title didn't appear" },
  )
})

When(
  /^User sets the (.*) token to (.*)$/,
  async (tokenRole: string, token: string) => {
    await Assets.SwapDialog.getChooseTokenModalButton(tokenRole).then(
      async (it) => {
        await it.waitForClickable()
        await it.click()
      },
    )
    await Assets.SwapDialog.getSearchTokenInputField(tokenRole).then(
      async (it) => {
        await it.waitForClickable()
        await it.setValue(token)
      },
    )
    await Assets.SwapDialog.getTokenByNameFromList(tokenRole, token).then(
      async (it) => {
        await it.waitForDisplayed({ timeout: 70000 })
        await it.click()
      },
    )
  },
)

When(/^User sets amount to swap to (.*)$/, async (amount: string) => {
  await Assets.SwapDialog.getSourceAmountField.setValue(amount)
  await browser.waitUntil(async () => {
    return (
      (await Assets.SwapDialog.getTargetAmountField.isDisplayed()) &&
      parseFloat(
        await (
          await Assets.SwapDialog.getTargetAmountField
        ).getAttribute("value"),
      ) > 0
    )
  })
  sourceTokenAmountToSwap = parseFloat(amount)
  currentSourceTokenBalance = parseFloat(
    (await Assets.getSourceTokenBalance.getText()).replace(/[^\d.]/g, ""),
  )
  currentTargetTokenBalance = parseFloat(
    (await Assets.SwapDialog.getTargetTokenBalance.getText()).replace(
      /[^\d.]/g,
      "",
    ),
  )
  expectedTargetTokenAmount = parseFloat(
    await Assets.SwapDialog.getTargetAmountField.getAttribute("value"),
  )
})

When(
  /^Verifying the balance of (.*) token and (.*) token has changed correctly$/,
  async (targetToken: string, sourceToken: string) => {
    await browser.waitUntil(
      async () => {
        await Assets.waitUntilElementsLoadedProperly(
          Assets.activityTab,
          Activity.filterButton,
        )
        await browser.pause(2000)
        await Assets.waitUntilElementsLoadedProperly(
          Assets.tokensTab,
          Assets.ManageTokensDialog.manageTokensDialogButton,
        )
        await browser.pause(2000)
        let expectedSourceTokenBalance =
          Math.floor(
            (currentSourceTokenBalance - sourceTokenAmountToSwap) * 1e8,
          ) / 1e8
        let expectedTargetTokenBalance =
          Math.floor(
            (currentTargetTokenBalance + expectedTargetTokenAmount) * 1e8,
          ) / 1e8
        return (
          expectedSourceTokenBalance -
            parseFloat(
              (
                await (await Assets.tokenBalance(sourceToken)).getText()
              ).replace(/[^\d.]/g, ""),
            ) <
            0.00000001 &&
          expectedTargetTokenBalance -
            parseFloat(
              (
                await (await Assets.tokenBalance(targetToken)).getText()
              ).replace(/[^\d.]/g, ""),
            ) <
            0.00000001
        )
      },
      {
        timeout: 95000,
        timeoutMsg: "Incorrect balance after swap",
      },
    )
  },
)
