import { When } from "@cucumber/cucumber"

import Activity from "../pages/activity.js"
import Assets from "../pages/assets.js"
import Staking from "../pages/staking.js"
import Page from "../pages/page.js"

import { moveSlider } from "../helpers/performActions.js"

let tokenUSDPrice: number

let SwapBalances = {
  currentSourceTokenBalance: 0,
  currentTargetTokenBalance: 0,
  expectedTargetTokenAmount: 0,
  sourceTokenAmountToSwap: 0,
}

let StakingBalances = {
  currentStakingUSDBalance: 0,
  currentStakedUSDAmount: 0,
  currentStakingUSDRewards: 0,
  expectedStakingUSDBalance: 0,
  expectedStakedUSDAmount: 0,
  expectedStakingUSDRewards: 0,
  amountToStake: 0,
}

let StakedTokenBalances = {
  currentStakedAmount: 0,
  currentStakingRewards: 0,
  expectedStakedAmount: 0,
  expectedStakingRewards: 0,
}

When(/^Verifying that the (Swap|Stake) transaction is success$/, async (action: string) => {
  if (action == "Swap") {
    await Assets.SwapDialog.successTitle.waitForDisplayed()
    await Assets.SwapDialog.closeButton.click()
  } else {
    await Staking.successTitle.waitForDisplayed()
    await Staking.closeButton.click()
  }
})

When(/^User clicks the (Swap|Stake) tokens button$/, async (action: string) => {
  if (await Assets.priceImpactCheckBox.isDisplayed()) {
    await Assets.priceImpactCheckBox.click()
  }

  let button = action == "Swap"
    ? await Assets.SwapDialog.swapTokensButton
    : await Staking.stakeTokensButton
  await button.waitForClickable()
  await button.click()

  let expectedTitle = action == "Swap" ? "Swap successful" : "Staked successfully"
  await browser.waitUntil(
    async () => {
      return (
        action == "Swap"
          ? (await Assets.SwapDialog.successTitle.getText()) == expectedTitle
          : (await Staking.successTitle.getText()) == expectedTitle
      )
    },
    { timeout: 60000, timeoutMsg: "Successful title didn't appear" },
  )
})

When(
  /^User sets the (.*) token to (.*)$/,
  async (tokenRole: string, token: string) => {
    await Assets.getChooseTokenModalButton(tokenRole).then(
      async (it) => {
        await it.waitForClickable()
        await it.click()
      },
    )
    await Assets.getSearchTokenInputField(tokenRole).then(
      async (it) => {
        await it.waitForClickable()
        await it.setValue(token.replace(/^\$/, ""))
      },
    )
    await Assets.getTokenByNameFromList(tokenRole, token.replace(/^\$/, "")).then(
      async (it) => {
        await it.waitForDisplayed({ timeout: 70000 })
        await it.click()
      },
    )
  },
)

When(/^User sets amount to (Swap|Stake) to (.*)$/, async (action: string, amount: string) => {
  await Assets.getSourceAmountField.setValue(amount)
  if (action == "Swap") {
    await browser.waitUntil(
      async () => {
        return (
          (await Assets.getTargetAmountField.isDisplayed()) &&
          parseFloat(
            await (
              await Assets.getTargetAmountField
            ).getAttribute("value"),
          ) > 0
        )
      },
      {
        interval: 1000,
        timeoutMsg: `Expected targetAmountField value > 0`,
      },
    )

    SwapBalances.sourceTokenAmountToSwap = parseFloat(amount)
    SwapBalances.currentSourceTokenBalance = parseFloat(
      (await Assets.getSourceTokenBalance.getText()).replace(/[^\d.]/g, ""),
    )
    SwapBalances.currentTargetTokenBalance = parseFloat(
      (await Assets.getTargetTokenBalance.getText()).replace(
        /[^\d.]/g,
        "",
      ),
    )
    SwapBalances.expectedTargetTokenAmount = parseFloat(
      await Assets.getTargetAmountField.getAttribute("value"),
    )
  } else {
    StakingBalances.amountToStake = Number(amount)
  }
})

When(
  "Verifying the balance of {token} token and {token} token has changed correctly",
  async (targetToken: string, sourceToken: string) => {
    let expectedSourceTokenBalance: number
    let expectedTargetTokenBalance: number
    let actualSourceTokenBalance: number
    let actualTargetTokenBalance: number

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
        expectedSourceTokenBalance =
          Math.floor(
            (
              SwapBalances.currentSourceTokenBalance - SwapBalances.sourceTokenAmountToSwap
            ) * 1e8,
          ) / 1e8
        expectedTargetTokenBalance =
          Math.floor(
            (
              SwapBalances.currentTargetTokenBalance + SwapBalances.expectedTargetTokenAmount
            ) * 1e8,
          ) / 1e8
        actualSourceTokenBalance = parseFloat(
          (await (await Assets.tokenBalance(sourceToken)).getText()).replace(
            /[^\d.]/g,
            "",
          ),
        )
        actualTargetTokenBalance = parseFloat(
          (await (await Assets.tokenBalance(targetToken)).getText()).replace(
            /[^\d.]/g,
            "",
          ),
        )
        return (
          expectedSourceTokenBalance - actualSourceTokenBalance < 0.00000001 &&
          expectedTargetTokenBalance - actualTargetTokenBalance < 0.00000001
        )
      },
      {
        timeout: 90000,
        timeoutMsg: `Incorrect balance after swap.
        Expected:
        sourceTokenBalance - ${
          Math.floor(
            (
              SwapBalances.currentSourceTokenBalance - SwapBalances.sourceTokenAmountToSwap
            ) * 1e8,
          ) / 1e8
        },
        targetTokenBalance - ${
          Math.floor(
            (
              SwapBalances.currentTargetTokenBalance + SwapBalances.expectedTargetTokenAmount
            ) * 1e8,
          ) / 1e8
        },

        but was:
        sourceTokenBalance - ${parseFloat(
          (
            await (await Assets.tokenBalance(sourceToken)).getText()
          ).replace(/[^\d.]/g, ""),
        )},
        targetTokenBalance - ${parseFloat(
          (
            await (await Assets.tokenBalance(targetToken)).getText()
          ).replace(/[^\d.]/g, ""),
        )}`,
      },
    )
  },
)

When("User sets the Lock Time to {lockTime}", async (time: string) => {
  await browser.waitUntil(async () => {
    await moveSlider(await Page.slider, 45, 0)
    return (await Staking.lockTimePeriod
      .getAttribute("value")).trim() == time
  }, { timeout: 20000, timeoutMsg: "Failed to set lock time" })
})

When("User verifies total staking balances and staked {token} token balances are changed correctly",
  async (tokenName: string) => {
    await browser.waitUntil(async () => {
      await browser.refresh()
      await Staking.stakedToken("NFIDWallet").detailsButton.waitForClickable()

      StakingBalances.expectedStakingUSDBalance =
        StakingBalances.currentStakingUSDBalance + (StakingBalances.amountToStake * tokenUSDPrice)

      StakingBalances.expectedStakedUSDAmount =
        StakingBalances.currentStakedUSDAmount + (StakingBalances.amountToStake * tokenUSDPrice)
      // StakingBalances.expectedStakingUSDRewards =
      //   StakingBalances.currentStakingUSDRewards + (StakingBalances.amountToStake * tokenUSDPrice)

      StakedTokenBalances.expectedStakedAmount = StakedTokenBalances.currentStakedAmount + StakingBalances.amountToStake
      // StakedTokenBalances.expectedStakingRewards =
      //   StakedTokenBalances.currentStakingRewards + (StakingBalances.amountToStake * tokenUSDPrice)

      return [
        [StakingBalances.expectedStakingUSDBalance, Number(await Staking.stakingBalances("stakingBalance"))],
        [StakingBalances.expectedStakedUSDAmount, Number(await Staking.stakingBalances("stakedAmount"))],
        // [StakingBalances.expectedStakingRewards, Number(await Staking.stakingBalances("stakingRewards"))],
        [StakedTokenBalances.expectedStakedAmount, Number((await Staking.stakedToken(tokenName).stakedAmount.getText())
          .replace(/[^\d.]/g, ""),
        )],
        // [StakedTokenBalances.expectedStakingRewards, Number((await Staking.stakedToken(tokenName).rewards.getText())
        //   .replace(/[^\d.]/g, ""),
        // )],
      ].every(([expected, current]) => {
        const result = Math.floor((expected - current) * 100) / 100
        return result < 0.001 && result >= 0
      })

    }, {
      timeout: 50000,
      timeoutMsg: `Incorrect staking values after staking
      Expected:
      StakingBalance - ${StakingBalances.currentStakingUSDBalance + (StakingBalances.amountToStake * tokenUSDPrice)},
      StakedAmount - ${StakingBalances.currentStakedUSDAmount + (StakingBalances.amountToStake * tokenUSDPrice)},
      //StakingRewards - ${StakingBalances.currentStakingUSDRewards + (StakingBalances.amountToStake * tokenUSDPrice)},
      StakedTokenBalance - ${StakedTokenBalances.currentStakedAmount + StakingBalances.amountToStake},
      //StakedTokenRewards - ${StakedTokenBalances.currentStakingRewards + (StakingBalances.amountToStake * tokenUSDPrice)},
      but was:
      StakingBalance - ${Number(await Staking.stakingBalances("stakingBalance"))},
      StakedAmount - ${Number(await Staking.stakingBalances("stakedAmount"))},
      //StakingRewards - ${Number(await Staking.stakingBalances("stakingRewards"))},
      StakedTokenBalance - ${Number(
        (await Staking.stakedToken(tokenName).stakedAmount.getText())
          .replace(/[^\d.]/g, ""),
      )},
      //StakedTokenRewards - ${Number(
        (await Staking.stakedToken(tokenName).rewards.getText())
          .replace(/[^\d.]/g, ""),
      )}`,
    })
  },
)

When("System saves current user's total staking values and staked {token} token values",
  async (tokenName: string) => {
    StakingBalances.currentStakingUSDBalance = Number(
      await Staking.stakingBalances("stakingBalance"),
    )
    StakingBalances.currentStakedUSDAmount = Number(
      await Staking.stakingBalances("stakedAmount"),
    )
    StakingBalances.currentStakingUSDRewards = Number(
      await Staking.stakingBalances("stakingRewards"),
    )
    StakedTokenBalances.currentStakedAmount = Number(
      (await Staking.stakedToken(tokenName).stakedAmount.getText())
        .replace(/[^\d.]/g, ""),
    )
    StakedTokenBalances.currentStakingRewards = Number(
      (await Staking.stakedToken(tokenName).rewards.getText())
        .replace(/[^\d.]/g, ""),
    )
  },
)

When("System saves current USD price of {token} token",
  async (tokenName: string) => {
    tokenUSDPrice = Number((await (await Assets.tokenUSDPrice(tokenName))
      .getText())
      .replace(/[^\d.]/g, ""),
    )
  },
)
