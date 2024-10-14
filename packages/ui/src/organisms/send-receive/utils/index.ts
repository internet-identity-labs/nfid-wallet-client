import { ICP_CANISTER_ID } from "@nfid/integration/token/constants"

import { FT } from "frontend/integration/ft/ft"
import {
  DepositError,
  SwapError,
  WithdrawError,
} from "frontend/integration/icpswap/errors"
import { SwapStage } from "frontend/integration/icpswap/types/enums"

export const getTokenOptions = async (tokens: FT[]) => {
  return await Promise.all(
    tokens.map(async (token) => {
      const usdBalance = await token.getTokenRate(
        token.getTokenBalanceFormatted() || "0",
      )

      return {
        label: "Internet Computer",
        options: [
          {
            icon: token.getTokenLogo(),
            value: token.getTokenAddress(),
            title: token.getTokenSymbol(),
            subTitle: token.getTokenName(),
            innerTitle: `${
              token.getTokenBalanceFormatted() || 0
            } ${token.getTokenSymbol()}`,
            innerSubtitle:
              usdBalance === undefined
                ? "Not listed"
                : usdBalance === 0
                ? "0.00 USD"
                : `${usdBalance.toString()} USD`,
          },
        ],
      }
    }),
  )
}

export const getTokenOptionsVault = async (tokens: FT[]) => {
  const options = await getTokenOptions(tokens)
  return options.filter((option) => option.options[0].value === ICP_CANISTER_ID)
}

export const getErrorType = (
  error: SwapError | WithdrawError | DepositError | undefined,
) => {
  if (error instanceof DepositError)
    return {
      title: "deposit",
      button: "Close",
      activityMessage: "Cancel your swap and try again.",
    }
  if (error instanceof SwapError)
    return {
      title: "swap",
      button: "Close",
      activityMessage: "Cancel your swap and try again.",
    }
  if (error instanceof WithdrawError)
    return {
      title: "withdraw",
      button: "Complete swap",
      activityMessage: "Complete your swap.",
    }
  return { title: "", button: "Close", activityMessage: "" }
}

export const getTextStatusByStep = (step: SwapStage) => {
  if (step < SwapStage.Swap) {
    return "Depositing"
  } else if (step === SwapStage.Swap) {
    return "Swapping"
  } else if (step === SwapStage.Withdraw) {
    return "Withdrawing"
  } else {
    return ""
  }
}
