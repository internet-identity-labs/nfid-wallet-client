import BigNumber from "bignumber.js"
import { Quote } from "src/integration/icpswap/quote"

import { ICRC1TypeOracle } from "@nfid/integration"
import { TRIM_ZEROS } from "@nfid/integration/token/constants"

export const WIDGET_FEE = 0.00875
const LIQUIDITY_PROVIDER_FEE = 0.003

export class QuoteImpl implements Quote {
  private readonly sourceAmount: number
  private readonly quote: bigint
  private readonly source: ICRC1TypeOracle
  private readonly target: ICRC1TypeOracle
  private readonly targetPriceUSD: BigNumber | undefined
  private readonly sourcePriceUSD: BigNumber | undefined
  private readonly amountWithoutWidgetFee: BigNumber

  constructor(
    sourceAmount: number,
    quote: bigint,
    source: ICRC1TypeOracle,
    target: ICRC1TypeOracle,
    targetPriceUSD: BigNumber | undefined,
    sourcePriceUSD: BigNumber | undefined,
  ) {
    this.sourceAmount = sourceAmount
    this.quote = quote
    this.source = source
    this.target = target
    this.targetPriceUSD = targetPriceUSD
    this.sourcePriceUSD = sourcePriceUSD
    this.amountWithoutWidgetFee = new BigNumber(sourceAmount)
      .multipliedBy(10 ** this.source.decimals)
      .minus(calculateWidgetFee(sourceAmount, this.source.decimals))
      .minus(Number(this.source.fee))
  }

  getTargetAmountUSD(): string {
    if (!this.targetPriceUSD) {
      return "Not listed"
    }
    const prettified = this.targetPriceUSD
      .multipliedBy(this.getTargetAmount())
      .div(10 ** this.target.decimals)
      .toFixed(2)
      .replace(TRIM_ZEROS, "")
    return `${prettified} USD`
  }

  getEstimatedTransferFee(): string[] {
    const sourceFee = BigNumber(Number(this.source.fee))
      .div(10 ** this.source.decimals)
      .multipliedBy(3)
      .toFixed(this.source.decimals)
      .replace(TRIM_ZEROS, "")
    const targetFee = BigNumber(Number(this.target.fee))
      .div(10 ** this.target.decimals)
      .toFixed(this.target.decimals)
      .replace(TRIM_ZEROS, "")
    return [
      `${sourceFee} ${this.source.symbol}`,
      `${targetFee} ${this.target.symbol}`,
    ]
  }

  getSourceAmountUSD(): string {
    if (!this.sourcePriceUSD) {
      return "Not listed"
    }
    const prettified = this.sourcePriceUSD
      .multipliedBy(this.getSourceAmount())
      .div(10 ** this.source.decimals)
      .toFixed(2)
      .replace(TRIM_ZEROS, "")
    return `${prettified} USD`
  }

  getTargetAmountPrettified(): string {
    return this.getTargetAmount()
      .div(10 ** this.target.decimals)
      .toFixed(this.target.decimals)
      .replace(TRIM_ZEROS, "")
  }

  getTargetAmountPrettifiedWithSymbol(): string {
    return (
      this.getTargetAmount()
        .div(10 ** this.target.decimals)
        .toFixed(this.target.decimals)
        .replace(TRIM_ZEROS, "") +
      " " +
      this.target.symbol
    )
  }

  getGuaranteedAmount(): string {
    return this.getTargetAmountPrettified() + " " + this.target.symbol
  }

  getSourceAmountPrettified(): string {
    return this.getSourceAmount()
      .div(10 ** this.source.decimals)
      .toFixed(this.source.decimals)
      .replace(TRIM_ZEROS, "")
  }

  getSourceAmountPrettifiedWithSymbol(): string {
    return (
      this.getSourceAmount()
        .div(10 ** this.source.decimals)
        .toFixed(this.source.decimals)
        .replace(TRIM_ZEROS, "") +
      " " +
      this.source.symbol
    )
  }

  getQuoteRate(): string {
    const quote = new BigNumber(Number(this.quote))
    const rate = quote.div(this.getSourceAmount())
    return `1 ${this.source.symbol} = ${rate.toFixed(this.target.decimals)} ${
      this.target.symbol
    }`
  }

  getLiquidityProviderFee(): string {
    const lpFee = this.getSourceAmount()
      .multipliedBy(LIQUIDITY_PROVIDER_FEE)
      .div(10 ** this.source.decimals)
      .toFixed(this.source.decimals)
      .replace(TRIM_ZEROS, "")
    return `${lpFee} ${this.source.symbol}`
  }

  getWidgetFee(): string {
    return (
      this.getWidgetFeeAmount()
        .div(10 ** this.source.decimals)
        .toFixed(this.source.decimals)
        .replace(TRIM_ZEROS, "")
        .toString() +
      " " +
      this.source.symbol
    )
  }

  getMaxSlippagge(): string {
    return "0%"
  }

  getSourceAmount(): BigNumber {
    return BigNumber(this.sourceAmount).multipliedBy(10 ** this.source.decimals)
  }

  getTargetAmount(): BigNumber {
    return BigNumber(Number(this.quote))
  }

  getAmountWithoutWidgetFee(): BigNumber {
    return this.amountWithoutWidgetFee
  }

  getWidgetFeeAmount(): BigNumber {
    return this.getSourceAmount().multipliedBy(WIDGET_FEE)
  }
}

export function calculateWidgetFee(
  sourceAmount: number,
  sourceDecimals: number,
): number {
  return parseFloat(
    BigNumber(sourceAmount)
      .multipliedBy(10 ** sourceDecimals)
      .multipliedBy(WIDGET_FEE)
      .toFixed(sourceDecimals),
  )
}
