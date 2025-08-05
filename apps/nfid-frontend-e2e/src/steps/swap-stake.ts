import { When } from "@cucumber/cucumber"

import Activity from "../pages/activity.js"
import Assets from "../pages/assets.js"
import Staking from "../pages/staking.js"
import Page from "../pages/page.js"

import { moveSlider } from "../helpers/performActions.js"
import { softAssertAll } from "../helpers/assertions.js"
import { formatDate } from "../helpers/dateCalculation.js"

let tokenUSDPrice: number

let SwapBalances = {
  currentSourceTokenBalance: 0,
  currentTargetTokenBalance: 0,
  expectedTargetTokenAmount: 0,
  sourceTokenAmountToSwap: 0,
}

let StakingTotalBalances = {
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

let StakedTokenDetailsBalances = {
  currentStakingBalance: 0,
  currentStakedAmount: 0,
  currentStakingRewards: 0,
  expectedStakingBalance: 0,
  expectedStakedAmount: 0,
  expectedStakingRewards: 0,
}

let StakingTransactionDetails = {
  transactionID: "",
  lockTime: "",
  createdDate: "",
  unlockTime: "",
}

When(/^Verifying that the (Swap|Stake) transaction is success$/, async (action: string) => {
  if (action == "Swap") {
    await Assets.SwapDialog.successTitle.waitForDisplayed()
    await Assets.SwapDialog.closeButton.click()
  } else {
    await Staking.successTitle.waitForDisplayed()
    await Staking.closeButton.click()
  }

  StakingTransactionDetails.createdDate = formatDate(Date.now())
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
        await it.waitForClickable({ timeout: 25000 })
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
    StakingTotalBalances.amountToStake = Number(amount)
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

When("User moves pointer for {int} to set the Lock Time to {lockTime}",
  async (movePointer: number, time: string) => {
    StakingTransactionDetails.lockTime = time
    if ((await Staking.lockTimePeriod.getAttribute("value")).trim() != time) {
      await browser.waitUntil(async () => {
        await moveSlider(await Page.slider, movePointer, 0)
        return (await Staking.lockTimePeriod
          .getAttribute("value")).trim() == time
      }, { timeout: 20000, timeoutMsg: "Failed to set lock time" })
    }
  })

When("User verifies total staking balances and staked {token} token balances were changed correctly",
  async (tokenName: string) => {
    await Assets.waitUntilElementsLoadedProperly(
      Assets.stakingTab, Staking.stakedToken(tokenName).detailsButton,
    )

    StakingTotalBalances.expectedStakingUSDBalance =
      StakingTotalBalances.currentStakingUSDBalance + (StakingTotalBalances.amountToStake * tokenUSDPrice)

    StakingTotalBalances.expectedStakedUSDAmount =
      StakingTotalBalances.currentStakedUSDAmount + (StakingTotalBalances.amountToStake * tokenUSDPrice)

    // StakingBalances.expectedStakingUSDRewards =
    //   StakingBalances.currentStakingUSDRewards + (StakingBalances.amountToStake * tokenUSDPrice)

    StakedTokenBalances.expectedStakedAmount = StakedTokenBalances.currentStakedAmount + StakingTotalBalances.amountToStake

    // StakedTokenBalances.expectedStakingRewards =
    //   StakedTokenBalances.currentStakingRewards + (StakingBalances.amountToStake * tokenUSDPrice)

    await browser.waitUntil(async () => {
      await browser.refresh()
      await (await Staking.stakedToken(tokenName).detailsButton).waitForDisplayed(
        {
          timeout: 30000,
          timeoutMsg: "Transactions weren't loaded in 30 sec or list is empty",
        },
      )
      await browser.pause(3000)

      const stakingBalance = Number(
        await (await Staking.stakingBalances("stakingBalance")).number(),
      )

      const stakingUSDRewards = Number(
        await (await Staking.stakingBalances("stakingRewards")).number(),
      )

      const stakedAmount = Number(
        await (await Staking.stakingBalances("stakedAmount")).number(),
      )

      const stakedTokenAmount = Number(
        (await (await Staking.stakedToken(tokenName).stakedAmount).getText())
          .replace(/[^\d.]/g, ""),
      )

      const stakedTokenRewards = Number(
        (await (await Staking.stakedToken(tokenName).rewards).getText()
        ).replace(/[^\d.]/g, ""),
      )

      return [
        [StakingTotalBalances.expectedStakingUSDBalance, stakingBalance],
        [StakingTotalBalances.expectedStakedUSDAmount, stakedAmount],
        // [StakingTotalBalances.expectedStakingUSDRewards, stakingUSDRewards],
        [StakedTokenBalances.expectedStakedAmount, stakedTokenAmount],
        // [StakedTokenBalances.expectedStakingRewards, stakedTokenRewards],
      ].every(([expected, current]) => {
        const result = Math.floor((expected - current) * 100) / 100
        return result < 0.001 && result >= 0
      })
    }, {
      timeout: 50000,
      timeoutMsg: `Incorrect staking values after staking
      Expected:
      StakingBalance - ${StakingTotalBalances.currentStakingUSDBalance + (StakingTotalBalances.amountToStake * tokenUSDPrice)} USD,
      StakedAmount - ${StakingTotalBalances.currentStakedUSDAmount + (StakingTotalBalances.amountToStake * tokenUSDPrice)} USD,
      //StakingRewards - ${StakingTotalBalances.currentStakingUSDRewards + (StakingTotalBalances.amountToStake * tokenUSDPrice)} USD,
      StakedTokenBalance - ${StakedTokenBalances.currentStakedAmount + StakingTotalBalances.amountToStake},
      //StakedTokenRewards - ${StakedTokenBalances.currentStakingRewards + (StakingTotalBalances.amountToStake * tokenUSDPrice)}`,
    })
  },
)

When("User verifies user's staking values of the {token} token were changed correctly on details page",
  async (tokenName: string) => {
    await browser.waitUntil(async () => {
      await browser.refresh()
      await Staking.StakedTokenTransaction("Locked")
        .getFirstRowInTable.waitForClickable({ timeout: 20000 })

      StakedTokenDetailsBalances.expectedStakingBalance =
        StakedTokenDetailsBalances.currentStakingBalance + StakingTotalBalances.amountToStake

      StakedTokenDetailsBalances.expectedStakedAmount =
        StakedTokenDetailsBalances.currentStakedAmount + StakingTotalBalances.amountToStake

      // StakedTokenDetailsBalances.expectedStakingUSDRewards =
      //   StakedTokenDetailsBalances.currentStakingUSDRewards + StakingBalances.amountToStake

      const stakedTokenBalance = Number(
        await (await Staking.stakingBalances("stakingBalance")).number(),
      )

      const stakedTokenStakedAmount = Number(
        await (await Staking.stakingBalances("stakedAmount")).number(),
      )

      const stakedTokenRewards = Number(
        await (await Staking.stakingBalances("stakingRewards")).number(),
      )

      return [
        [StakedTokenDetailsBalances.expectedStakingBalance, stakedTokenBalance],
        [StakedTokenDetailsBalances.expectedStakedAmount, stakedTokenStakedAmount],
        // [StakedTokenDetailsBalances.expectedStakingRewards, stakedTokenRewards],
      ].every(([expected, current]) => {
        const result = Math.floor((expected - current) * 100) / 100
        return result < 0.001 && result >= 0
      })

    }, {
      timeout: 50000,
      timeoutMsg: `Incorrect staked token balances in details after staking
      Expected:
      StakingBalance - ${StakedTokenDetailsBalances.currentStakingBalance + StakingTotalBalances.amountToStake},
      StakedAmount - ${StakedTokenDetailsBalances.currentStakedAmount + StakingTotalBalances.amountToStake},
      //StakingRewards - ${StakedTokenDetailsBalances.currentStakingRewards + StakingTotalBalances.amountToStake}`,
    })
  },
)

When("System saves current user's total staking values and staked {token} token values",
  async (tokenName: string) => {
    StakingTotalBalances.currentStakingUSDBalance = Number(
      await (await Staking.stakingBalances("stakingBalance")).number(),
    )
    StakingTotalBalances.currentStakedUSDAmount = Number(
      await (await Staking.stakingBalances("stakedAmount")).number(),
    )
    StakingTotalBalances.currentStakingUSDRewards = Number(
      await (await Staking.stakingBalances("stakingRewards")).number(),
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

When("System saves current user's staking values of the {token} token",
  async (tokenName: string) => {
    StakedTokenDetailsBalances.currentStakingBalance = Number(
      await (await Staking.stakingBalances("stakingBalance")).number(),
    )
    StakedTokenDetailsBalances.currentStakedAmount = Number(
      await (await Staking.stakingBalances("stakedAmount")).number(),
    )
    StakedTokenDetailsBalances.currentStakingRewards = Number(
      await (await Staking.stakingBalances("stakingRewards")).number(),
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

When("User goes to details of the staked token with name {token}",
  async (tokenName: string) => {
    await Assets.waitUntilElementsLoadedProperly(
      Staking.stakedToken(tokenName).detailsButton,
      Staking.StakedTokenTransaction("Locked", tokenName).firstTransactionTokenID,
    )
  },
)

When("User verifies values are correct in the first transaction of {token} in {word} table",
  async (
    tokenName: string,
    tableType: "Locked" | "Unlocking",
  ) => {
    let actionType: "lockTime" | "unlockTime" = tableType == "Locked"
      ? "lockTime"
      : "unlockTime"

    StakingTransactionDetails.transactionID =
      await Staking.StakedTokenTransaction(tableType, tokenName)
        .firstTransactionTokenID
        .getText()

    await softAssertAll(
      [
        async () => {
          expect(
            (await Staking.StakedTokenTransaction(
              tableType,
              tokenName,
              StakingTransactionDetails.transactionID,
            ).initialStake
              .getText())
              .replace(/[^\d.,]/g, ""),
          ).toEqual(StakingTotalBalances.amountToStake.toString())
        }, `Incorrect initial stake in the first transaction of the ${tableType} table.
        Expected:
        ${
        (await Staking.StakedTokenTransaction(
          tableType,
          tokenName,
          StakingTransactionDetails.transactionID,
        ).initialStake
          .getText())
          .replace(/[^\d.,]/g, "")
      }
        but was:
        ${StakingTotalBalances.amountToStake.toString()}`,
      ],
      // [
      //   async () => {
      //     expect(
      //       await Staking.StakedTokenTransaction(
      //         tableType,
      //         tokenName,
      //         StakingTransactionDetails.transactionID,
      //       )
      //         .rewards
      //         .getText(),
      //     ).toEqual(StakedTokenDetailsBalances.expectedStakingRewards.toString())
      //   },
      // ],
      [
        async () => {
          expect(
            await Staking.StakedTokenTransaction(
              tableType,
              tokenName,
              StakingTransactionDetails.transactionID,
            )[actionType]
              .getText(),
          ).toEqual(StakingTransactionDetails[actionType])
        }, `Incorrect ${actionType} in the first transaction in the ${tableType} table
        Expected:
        ${
        await Staking.StakedTokenTransaction(
          tableType,
          tokenName,
          StakingTransactionDetails.transactionID,
        )[actionType]
          .getText()
      }
        but was:
        ${StakingTransactionDetails[actionType]}`,
      ],
    )
  },
)

When("User click on the first row of the {word} table",
  async (tableType: "Locked" | "Unlocking") => {
    await (await Staking.StakedTokenTransaction(tableType)
      .getFirstRowInTable).click()
  },
)

When("User finds by ID and clicks on the transaction in {word} table",
  async (tableType: "Locked" | "Unlocking") => {
    await (await Staking.StakedTokenTransaction(
      tableType, StakingTransactionDetails.transactionID,
    ).findTransactionByID).click()
  },
)

When(/^User verifies details of the (Locked|Unlocking) staking transaction are correct on the side bar$/,
  async (tableType: string) => {
    let actionType: "lockTime" | "unlockTime" = tableType == "Locked"
      ? "lockTime"
      : "unlockTime"

    await softAssertAll(
      [
        async () => {
          expect(StakingTransactionDetails.transactionID)
            .toEqual(await (await Staking.sidePanel().stakeID).getText())
        }, `Incorrect transaction ID in the side panel.
        Expected:
        ${StakingTransactionDetails.transactionID}
        but was:
        ${await (await Staking.sidePanel().stakeID).getText()}`,
      ],
      [
        async () => {
          expect(StakingTotalBalances.amountToStake)
            .toEqual(Number(
                (await (await Staking.sidePanel().initialStake)
                  .getText())
                  .replace(/[^\d.,]/g, ""),
              ),
            )
        }, `Incorrect initial stake in the side panel.
        Expected:
        ${StakingTotalBalances.amountToStake}
        but was:
        ${Number((await (await Staking.sidePanel().initialStake)
        .getText())
        .replace(/[^\d.,]/g, ""))}`,
      ],
      // [
      //   async () => {
      //     expect(StakedTokenDetailsBalances.expectedStakingRewards)
      //       .toEqual(await (await Staking.sidePanel().rewards).getText())
      //   },
      // ],
      [
        async () => {
          expect(StakingTotalBalances.amountToStake)
            .toEqual(Number(
                (await (await Staking.sidePanel().totalValue)
                  .getText())
                  .replace(/[^\d.,]/g, ""),
              ),
            )
        }, `Incorrect total value in the side panel.
        Expected:,
        ${StakedTokenDetailsBalances.expectedStakingBalance}
        but was:
        ${Number((await (await Staking.sidePanel().totalValue)
        .getText())
        .replace(/[^\d.,]/g, ""))}`,
      ],
      [
        async () => {
          expect(`${StakingTransactionDetails
            .lockTime}${actionType === "unlockTime" ? ", 1 day" : ""}`,
          ).toEqual(await (await Staking.sidePanel()[actionType]).getText())
        }, `Incorrect ${actionType} in the side panel.
        Expected:
        ${StakingTransactionDetails.lockTime}
        but was:
        ${await (await Staking.sidePanel()[actionType]).getText()}`,
      ],
      [
        async () => {
          expect(StakingTransactionDetails.createdDate)
            .toEqual(formatDate(Date.now()))
        }, `Incorrect created date in the side panel.
        Expected:
        ${StakingTransactionDetails.createdDate}
        but was:
        ${formatDate(Date.now())}`,
      ],
    )
  },
)

When(/^User click the (?:Start|Stop) unlocking button$/,
  async () => {
    await (await Staking.sidePanel().startActionButton).click()
  },
)

When(/^User verifies that the staking transaction is moved to the (Locked|Unlocking) table$/,
  async (tableType: "Locked" | "Unlocking") => {
    await browser.waitUntil(async () => {
      let transaction: WebdriverIO.Element
        = await Staking.StakedTokenTransaction(tableType).getAllTableTransactionsIDs
        .find(async (el) => {
          return await el.getText() == StakingTransactionDetails.transactionID
        })
      return transaction.isDisplayed()
    }, {
      timeout: 30000,
      timeoutMsg:
        `Transaction with ID '${StakingTransactionDetails.transactionID}'
        wasn't moved to the '${tableType}' table'`,
    })
  },
)
