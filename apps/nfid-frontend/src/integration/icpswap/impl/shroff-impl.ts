import BigNumber from "bignumber.js"
import { idlFactory as SwapPoolIDL } from "src/integration/icpswap/idl/SwapPool"
import {
  calculateWidgetFee,
  QuoteImpl,
} from "src/integration/icpswap/impl/quote-impl"
import { Quote } from "src/integration/icpswap/quote"
import { icpSwapService } from "src/integration/icpswap/service/icpswap-service"
import { Shroff } from "src/integration/icpswap/shroff"

import {
  actor,
  exchangeRateService,
  hasOwnProperty,
  ICRC1TypeOracle,
} from "@nfid/integration"
import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"

import { PoolData } from "./../idl/SwapFactory.d"
import { _SERVICE as SwapPool, Result, SwapArgs } from "./../idl/SwapPool.d"

class ShroffImpl implements Shroff {
  private readonly zeroForOne: boolean
  private readonly poolData: PoolData
  private readonly swapPoolActor: SwapPool
  private readonly source: ICRC1TypeOracle
  private readonly target: ICRC1TypeOracle

  constructor(
    poolData: PoolData,
    zeroForOne: boolean,
    source: ICRC1TypeOracle,
    target: ICRC1TypeOracle,
  ) {
    this.poolData = poolData
    this.zeroForOne = zeroForOne
    this.swapPoolActor = actor<SwapPool>(poolData.canisterId, SwapPoolIDL)
    this.source = source
    this.target = target
  }

  //amount in token (not decimals)
  async getQuote(amount: number): Promise<Quote> {
    const amountDecimals = new BigNumber(amount)
      .multipliedBy(10 ** this.source.decimals)
      .minus(calculateWidgetFee(amount, this.source.decimals))
      .minus(Number(this.source.fee))

    const args: SwapArgs = {
      amountIn: amountDecimals.toString(),
      zeroForOne: this.zeroForOne,
      amountOutMinimum: "0",
    }
    const targetUSDPricePromise = exchangeRateService.usdPriceForICRC1(
      this.target.ledger,
    )
    const sourceUSDPricePromise = exchangeRateService.usdPriceForICRC1(
      this.source.ledger,
    )
    const quotePromise = this.swapPoolActor.quote(args) as Promise<Result>

    const [targetUSDPrice, sourceUSDPrice, quote] = await Promise.all([
      targetUSDPricePromise,
      sourceUSDPricePromise,
      quotePromise,
    ])

    if (hasOwnProperty(quote, "ok")) {
      return new QuoteImpl(
        amount,
        quote.ok as bigint,
        this.source,
        this.target,
        targetUSDPrice,
        sourceUSDPrice,
      )
    }
    throw new Error("TODO Error handling getQuote")
  }
}

export class ShroffBuilder {
  private source: string | undefined
  private target: string | undefined

  public withSource(source: string): ShroffBuilder {
    this.source = source
    return this
  }

  public withTarget(target: string): ShroffBuilder {
    this.target = target
    return this
  }

  public async build(): Promise<Shroff> {
    if (!this.source) {
      throw new Error("Source is required")
    }

    if (!this.target) {
      throw new Error("Target is required")
    }

    const [poolData, icrc1canisters]: [PoolData, ICRC1TypeOracle[]] =
      await Promise.all([
        icpSwapService.getPoolFactory(this.source, this.target),
        icrc1OracleService.getICRC1Canisters(),
      ])

    const st: ICRC1TypeOracle[] = icrc1canisters.filter(
      (icrc1) => icrc1.ledger === this.source || icrc1.ledger === this.target,
    )

    const source = st.find((icrc1) => icrc1.ledger === this.source)
    const target = st.find((icrc1) => icrc1.ledger === this.target)

    if (!source || !target) {
      throw new Error("ICRC1 not found")
    }

    let zeroForOne = false
    if (poolData.token0.address === this.source) {
      zeroForOne = true
    }
    return new ShroffImpl(poolData, zeroForOne, source, target)
  }
}
