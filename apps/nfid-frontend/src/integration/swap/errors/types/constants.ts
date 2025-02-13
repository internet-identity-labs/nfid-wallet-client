import { SwapName } from "../../types/enums"

export const getDepositError = (provider: SwapName) =>
  `Something went wrong with the ${provider} service. Cancel your swap and try again.`

export const getContactSupportError = (provider: SwapName) =>
  `Something went wrong with the ${provider} service. Contact support.`

export const getWithdrawError = (provider: SwapName) =>
  `Something went wrong with the ${provider} service. Complete your swap.`

export const getSwapError = (provider: SwapName) =>
  `Something went wrong with the ${provider} service. Cancel your swap and try again.`

export const SLIPPAGE_SWAP_ERROR =
  "Swap exceeded slippage tolerance, please withdraw your unswapped tokens and try again."

export const SLIPPAGE_QUOTE_ERROR =
  "Swap exceeded slippage tolerance. Try again."
