import BigNumber from "bignumber.js"

import { PriceImpact } from "./types/types"

export interface Quote {
  getTargetAmountUSD(): string
  getSourceAmountUSD(): string
  getEstimatedTransferFee(): string[]
  getTargetAmountPrettified(): string
  getSourceAmountPrettified(): string
  getTargetAmountPrettifiedWithSymbol(): string
  getSourceAmountPrettifiedWithSymbol(): string
  getQuoteRate(): string
  getLiquidityProviderFee(): string
  getWidgetFee(): string
  getMaxSlippagge(): string
  getGuaranteedAmount(): string
  getSourceUserInputAmount(): BigNumber
  getSourceSwapAmount(): BigNumber
  getTargetAmount(): BigNumber
  getWidgetFeeAmount(): bigint
  getPriceImpact(): PriceImpact | undefined
}
