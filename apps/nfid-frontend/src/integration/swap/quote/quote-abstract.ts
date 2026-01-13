import BigNumber from "bignumber.js"

import { ICRC1TypeOracle } from "@nfid/integration"
import { TRIM_ZEROS } from "@nfid/integration/token/constants"

import { LiquidityError } from "src/integration/swap/errors/types"
import { Quote } from "src/integration/swap/quote"
import { PriceImpactStatus } from "src/integration/swap/types/enums"
import { PriceImpact } from "src/integration/swap/types/types"

export abstract class QuoteAbstract implements Quote {
  protected readonly sourceAmount: string
  protected readonly quote: bigint
  protected readonly source: ICRC1TypeOracle
  protected readonly target: ICRC1TypeOracle
  protected readonly targetPriceUSD: BigNumber | undefined
  protected readonly sourcePriceUSD: BigNumber | undefined
  protected readonly sourceCalculator: SourceInputCalculator
  protected readonly slippage: number

  constructor(
    userInputAmount: string,
    sourceCalculator: SourceInputCalculator,
    quote: bigint,
    source: ICRC1TypeOracle,
    target: ICRC1TypeOracle,
    slippage: number,
    targetPriceUSD: BigNumber | undefined,
    sourcePriceUSD: BigNumber | undefined,
  ) {
    this.sourceAmount = userInputAmount
    this.quote = quote
    this.source = source
    this.target = target
    this.targetPriceUSD = targetPriceUSD
    this.slippage = slippage
    this.sourcePriceUSD = sourcePriceUSD
    this.sourceCalculator = sourceCalculator
    if (quote <= this.target.fee) {
      console.error(
        "Not enough amount to pay fee for provider: ",
        this.constructor.name,
      )
      throw new LiquidityError()
    }
  }

  abstract getSlippage(): number

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

  abstract getEstimatedTransferFee(): string[]

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
    return `${this.getTargetAmount()
      .minus(Number(this.target.fee))
      .div(10 ** this.target.decimals)
      .toFixed(this.target.decimals)
      .replace(TRIM_ZEROS, "")} ${this.target.symbol}`
  }

  getGuaranteedAmount(slippage: number): string {
    const amount = new BigNumber(this.getTargetAmountPrettified())
    const slippageAmount = amount.multipliedBy(slippage).dividedBy(100)
    const guaranteedAmount = amount.minus(slippageAmount)

    return `${guaranteedAmount
      .toFixed(this.target.decimals)
      .replace(TRIM_ZEROS, "")} ${this.target.symbol}`
  }

  getSourceAmountPrettified(): string {
    return this.getSourceUserInputAmount()
      .div(10 ** this.source.decimals)
      .toFixed(this.source.decimals)
      .replace(TRIM_ZEROS, "")
  }

  getSourceAmountPrettifiedWithSymbol(): string {
    return `${this.getSourceUserInputAmount()
      .div(10 ** this.source.decimals)
      .toFixed(this.source.decimals)
      .replace(TRIM_ZEROS, "")} ${this.source.symbol}`
  }

  //TODO
  getQuoteRate(): string {
    const quote = this.getTargetAmount().div(10 ** this.target.decimals)
    const rate = quote.div(
      BigNumber(this.sourceCalculator.getSourceSwapAmount().toString()).div(
        10 ** this.source.decimals,
      ),
    )
    return `1 ${this.source.symbol} = ${rate
      .toNumber()
      .toFixed(this.target.decimals)
      .replace(TRIM_ZEROS, "")} ${this.target.symbol}`
  }

  abstract getLiquidityProviderFee(): string

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
    return `${BigNumber(this.getWidgetFeeAmount().toString())
      .div(10 ** this.source.decimals)
      .toFixed(this.source.decimals)
      .replace(TRIM_ZEROS, "")} ${this.source.symbol}`
  }

  getSourceUserInputAmount(): BigNumber {
    return BigNumber(this.sourceAmount).multipliedBy(10 ** this.source.decimals)
  }

  getSourceSwapAmount(): BigNumber {
    return BigNumber(this.sourceCalculator.getSourceSwapAmount().toString())
  }

  abstract getTransferToSwapAmount(): BigNumber

  getTargetAmount(): BigNumber {
    return BigNumber(this.quote.toString())
  }

  getWidgetFeeAmount(): bigint {
    return this.sourceCalculator.getWidgetFee()
  }
}
