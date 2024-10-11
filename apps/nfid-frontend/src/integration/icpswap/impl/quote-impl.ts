import BigNumber from "bignumber.js"
import { Quote } from "src/integration/icpswap/quote"

import { ICRC1TypeOracle } from "@nfid/integration"
import { TRIM_ZEROS } from "@nfid/integration/token/constants"

import { PriceImpactStatus } from "../types/enums"
import { PriceImpact } from "../types/types"

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
    userInputAmount: number,
    quote: bigint,
    source: ICRC1TypeOracle,
    target: ICRC1TypeOracle,
    targetPriceUSD: BigNumber | undefined,
    sourcePriceUSD: BigNumber | undefined,
  ) {
    this.sourceAmount = userInputAmount
    this.quote = quote
    this.source = source
    this.target = target
    this.targetPriceUSD = targetPriceUSD
    this.sourcePriceUSD = sourcePriceUSD
    this.amountWithoutWidgetFee = new BigNumber(userInputAmount)
      .multipliedBy(10 ** this.source.decimals)
      .minus(calculateWidgetFee(userInputAmount, this.source.decimals))
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

  getPriceImpact(): PriceImpact | undefined {
    const sourcePrice = this.sourcePriceUSD
    const targetPrice = this.targetPriceUSD

    if (!sourcePrice || !targetPrice) return

    const sourcePriceFormatted = sourcePrice
      .multipliedBy(this.getSourceAmount())
      .div(10 ** this.source.decimals)
      .decimalPlaces(2)

    const targetPriceFormatted = targetPrice
      .multipliedBy(this.getTargetAmount())
      .div(10 ** this.target.decimals)
      .decimalPlaces(2)

    const priceImpact = targetPriceFormatted
      .minus(sourcePriceFormatted)
      .dividedBy(sourcePriceFormatted)
      .multipliedBy(100)

    return {
      priceImpact: `-${priceImpact.toFixed(2)}%`,
      status: priceImpact.isGreaterThanOrEqualTo(-1)
        ? PriceImpactStatus.LOW
        : priceImpact.isGreaterThanOrEqualTo(-5)
        ? PriceImpactStatus.MEDIUM
        : PriceImpactStatus.HIGH,
    }
  }

  getWidgetFee(): string {
    return (
      calculateWidgetFee(this.sourceAmount, this.source.decimals)
        .toString()
        .replace(TRIM_ZEROS, "") +
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

  getWidgetFeeAmount(): bigint {
    return BigInt(calculateWidgetFee(this.sourceAmount, this.source.decimals))
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
      .toFixed(0),
  )
}
