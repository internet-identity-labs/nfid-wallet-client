import BigNumber from "bignumber.js"

export interface Quote {
  getTargetAmountUSD(): string
  getSourceAmountUSD(): string
  getEstimatedTransferFee(): string[]
  getTargetAmountPrettified(): string
  getSourceAmountPrettified(): string
  getQuoteRate(): string
  getLiquidityProviderFee(): string
  getWidgetFee(): string
  getMaxSlippagge(): string
  getGuaranteedAmount(): string
  getSourceAmount(): BigNumber
  getTargetAmount(): BigNumber
}
