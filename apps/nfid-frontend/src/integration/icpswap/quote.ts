import BigNumber from "bignumber.js"

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
  getSourceAmount(): BigNumber
  getTargetAmount(): BigNumber
  getAmountWithoutWidgetFee(): BigNumber
  getWidgetFeeAmount(): BigNumber
}
