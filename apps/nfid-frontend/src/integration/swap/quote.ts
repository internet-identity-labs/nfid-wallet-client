import BigNumber from "bignumber.js"

import { PriceImpact } from "src/integration/swap/types/types"

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
  getSlippage(): number
  getGuaranteedAmount(slippage: number): string
  getSourceUserInputAmount(): BigNumber
  getSourceSwapAmount(): BigNumber
  getTargetAmount(): BigNumber
  getWidgetFeeAmount(): bigint
  getPriceImpact(): PriceImpact | undefined
  getTransferToSwapAmount(): BigNumber
}
