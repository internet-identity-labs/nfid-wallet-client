import {
  DepositError,
  SlippageSwapError,
  SwapError,
  WithdrawError,
} from "src/integration/swap/errors/types"
import { SwapStage } from "src/integration/swap/types/enums"

import { ContactSupportError } from "frontend/integration/swap/errors/types/contact-support-error"

export const getTitleAndButtonText = (
  error:
    | SwapError
    | WithdrawError
    | DepositError
    | SlippageSwapError
    | ContactSupportError
    | undefined,
) => {
  if (error instanceof DepositError)
    return {
      title: "deposit",
      buttonText: "Close",
    }
  if (error instanceof SwapError || error instanceof SlippageSwapError)
    return {
      title: "swap",
      buttonText: "Close",
    }
  if (error instanceof WithdrawError)
    return {
      title: "withdraw",
      buttonText: "Complete swap",
    }
  if (error instanceof ContactSupportError)
    return {
      title: "swap",
      buttonText: "Contact support",
    }
  return { title: "", buttonText: "Close" }
}

const textStatusByStep: { [key in SwapStage]: string } = {
  [SwapStage.TransferSwap]: "Depositing",
  [SwapStage.Deposit]: "Depositing",
  [SwapStage.Swap]: "Swapping",
  [SwapStage.Withdraw]: "Withdrawing",
  [SwapStage.TransferNFID]: "Withdrawing",
  [SwapStage.Completed]: "",
}

export const getTextStatusByStep = (step: SwapStage) =>
  textStatusByStep[step] || ""
