import BigNumber from "bignumber.js"
import { SourceInputCalculator } from "src/integration/icpswap/impl/calculator"
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
  private readonly sourceCalculator: SourceInputCalculator

  constructor(
    userInputAmount: number,
    sourceCalculator: SourceInputCalculator,
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
    this.sourceCalculator = sourceCalculator
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
      .multipliedBy(2)
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
      .multipliedBy(this.getSourceUserInputAmount())
      .div(10 ** this.source.decimals)
      .toFixed(2)
      .replace(TRIM_ZEROS, "")
    return `${prettified} USD`
  }

  getTargetAmountPrettified(): string {
    return this.getTargetAmount()
      .minus(Number(this.target.fee))
      .div(10 ** this.target.decimals)
      .toFixed(this.target.decimals)
      .replace(TRIM_ZEROS, "")
  }

  getTargetAmountPrettifiedWithSymbol(): string {
    return (
      this.getTargetAmount()
        .minus(Number(this.target.fee))
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
    return this.getSourceUserInputAmount()
      .div(10 ** this.source.decimals)
      .toFixed(this.source.decimals)
      .replace(TRIM_ZEROS, "")
  }

  getSourceAmountPrettifiedWithSymbol(): string {
    return (
      this.getSourceUserInputAmount()
        .div(10 ** this.source.decimals)
        .toFixed(this.source.decimals)
        .replace(TRIM_ZEROS, "") +
      " " +
      this.source.symbol
    )
  }

  getQuoteRate(): string {
    const quote = this.getTargetAmount().div(10 ** this.target.decimals)
    const rate = quote.div(
      BigNumber(Number(this.sourceCalculator.getSourceSwapAmount())).div(
        10 ** this.source.decimals,
      ),
    )
    return `1 ${this.source.symbol} = ${rate
      .toNumber()
      .toFixed(this.target.decimals)
      .replace(TRIM_ZEROS, "")} ${this.target.symbol}`
  }

  getLiquidityProviderFee(): string {
    const lpFee = this.getSourceSwapAmount()
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
      .multipliedBy(this.getSourceSwapAmount())
      .div(10 ** this.source.decimals)

    const targetPriceFormatted = targetPrice
      .multipliedBy(this.getTargetAmount())
      .div(10 ** this.target.decimals)

    const priceImpact = targetPriceFormatted
      .minus(sourcePriceFormatted)
      .dividedBy(sourcePriceFormatted)
      .multipliedBy(100)

    return {
      priceImpact: `${priceImpact.toFixed(2)}%`,
      status: priceImpact.isGreaterThanOrEqualTo(-1)
        ? PriceImpactStatus.LOW
        : priceImpact.isGreaterThanOrEqualTo(-5)
        ? PriceImpactStatus.MEDIUM
        : PriceImpactStatus.HIGH,
    }
  }

  getWidgetFee(): string {
    return (
      BigNumber(Number(this.getWidgetFeeAmount()))
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

  getSourceUserInputAmount(): BigNumber {
    return BigNumber(this.sourceAmount).multipliedBy(10 ** this.source.decimals)
  }

  getSourceSwapAmount(): BigNumber {
    return BigNumber(Number(this.sourceCalculator.getSourceSwapAmount()))
  }

  getTargetAmount(): BigNumber {
    return BigNumber(Number(this.quote))
  }

  getWidgetFeeAmount(): bigint {
    return this.sourceCalculator.getWidgetFee()
  }
}
