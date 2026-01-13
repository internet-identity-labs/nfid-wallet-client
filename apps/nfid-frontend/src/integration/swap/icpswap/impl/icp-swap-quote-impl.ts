import BigNumber from "bignumber.js"

import { TRIM_ZEROS } from "@nfid/integration/token/constants"

import { QuoteAbstract } from "src/integration/swap/quote/quote-abstract"

const LIQUIDITY_PROVIDER_FEE = 0.003

export class IcpSwapQuoteImpl extends QuoteAbstract {
  getSlippage(): number {
    return 0
  }

  getTransferToSwapAmount(): BigNumber {
    return BigNumber(
      this.sourceCalculator.getSourceSwapAmount().toString(),
    ).plus(Number(this.source.fee))
  }

  getEstimatedTransferFee(): string[] {
    const sourceFee = BigNumber(Number(this.source.fee))
      .div(10 ** this.source.decimals)
      .multipliedBy(3)
      .toFixed(this.source.decimals)
      .replace(TRIM_ZEROS, "")
    const targetFee = BigNumber(Number(this.target.fee))
      .div(10 ** this.target.decimals)
      .multipliedBy(2)
      .toFixed(this.target.decimals)
      .replace(TRIM_ZEROS, "")
    return [
      `${sourceFee} ${this.source.symbol}`,
      `${targetFee} ${this.target.symbol}`,
    ]
  }

  getLiquidityProviderFee(): string {
    const lpFee = this.getSourceSwapAmount()
      .multipliedBy(LIQUIDITY_PROVIDER_FEE)
      .div(10 ** this.source.decimals)
      .toFixed(this.source.decimals)
      .replace(TRIM_ZEROS, "")
    return `${lpFee} ${this.source.symbol}`
  }
}
