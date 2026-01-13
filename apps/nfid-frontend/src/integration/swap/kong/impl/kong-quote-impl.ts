import BigNumber from "bignumber.js"

import { ICRC1TypeOracle } from "@nfid/integration"
import { TRIM_ZEROS } from "@nfid/integration/token/constants"

import { SwapAmountsReply } from "src/integration/swap/kong/idl/kong_backend.d"
import { QuoteAbstract } from "src/integration/swap/quote/quote-abstract"

export class KongQuoteImpl extends QuoteAbstract {
  private readonly quoteResponse: SwapAmountsReply
  constructor(
    userInputAmount: string,
    sourceCalculator: SourceInputCalculator,
    quote: bigint,
    source: ICRC1TypeOracle,
    target: ICRC1TypeOracle,
    slippage: number,
    quoteResponse: SwapAmountsReply,
    targetPriceUSD: BigNumber | undefined,
    sourcePriceUSD: BigNumber | undefined,
  ) {
    super(
      userInputAmount,
      sourceCalculator,
      quote,
      source,
      target,
      slippage,
      targetPriceUSD,
      sourcePriceUSD,
    )
    this.quoteResponse = quoteResponse
  }

  getSlippage(): number {
    return this.quoteResponse.slippage
  }

  getTransferToSwapAmount(): BigNumber {
    return BigNumber(this.sourceCalculator.getSourceSwapAmount().toString())
  }

  getEstimatedTransferFee(): string[] {
    const sourceFee = BigNumber(Number(this.source.fee))
      .div(10 ** this.source.decimals)
      .multipliedBy(2)
      .toFixed(this.source.decimals)
      .replace(TRIM_ZEROS, "")
    return [`${sourceFee} ${this.source.symbol}`]
  }

  getGuaranteedAmount(slippage: number): string {
    const targetAmountWithZeroSlippage = new BigNumber(
      this.getTargetAmountPrettified(),
    )
      .div(100 - this.getSlippage())
      .multipliedBy(100)

    const slippageAmount = targetAmountWithZeroSlippage
      .multipliedBy(slippage)
      .dividedBy(100)
    const guaranteedAmount = targetAmountWithZeroSlippage.minus(slippageAmount)

    return `${guaranteedAmount
      .toFixed(this.target.decimals)
      .replace(TRIM_ZEROS, "")} ${this.target.symbol}`
  }

  getLiquidityProviderFee(): string {
    const lpFee = this.quoteResponse.txs
      .map((tx) => tx.lp_fee)
      .reduce((f1, f2) => f1 + f2)
    const fee = BigNumber(lpFee.toString())
      .div(10 ** this.target.decimals)
      .toFixed(this.target.decimals)
      .replace(TRIM_ZEROS, "")
    return `${fee} ${this.target.symbol}`
  }
}
