import * as Agent from "@dfinity/agent"
import { HttpAgent, SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"

import BigNumber from "bignumber.js"
import { Cache } from "node-ts-cache"

import { integrationCache } from "@nfid/integration"
import {
  actorBuilder,
  agentBaseConfig,
  exchangeRateService,
  hasOwnProperty,
  ICRC1TypeOracle,
  replaceActorIdentity,
} from "@nfid/integration"
import { TRIM_ZEROS } from "@nfid/integration/token/constants"
import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"

import {
  LiquidityError,
  ServiceUnavailableError,
} from "src/integration/swap/errors/types"
import { idlFactory as icrc1IDL } from "src/integration/swap/kong/idl/icrc1"
import {
  _SERVICE as ICRC1ServiceIDL,
  Account,
} from "src/integration/swap/kong/idl/icrc1.d"
import { idlFactory as KongIDL } from "src/integration/swap/kong/idl/kong_backend"
import {
  _SERVICE,
  PoolsResult,
  SwapArgs,
} from "src/integration/swap/kong/idl/kong_backend.d"
import { KongCalculator } from "src/integration/swap/kong/impl/kong-calculator"
import { KongQuoteImpl } from "src/integration/swap/kong/impl/kong-quote-impl"
import { KongSwapTransactionImpl } from "src/integration/swap/kong/impl/kong-swap-transaction-impl"
import { Shroff } from "src/integration/swap/shroff"
import { ShroffAbstract } from "src/integration/swap/shroff/shroff-abstract"

import { ContactSupportError } from "../../errors/types/contact-support-error"
import { Quote } from "../../quote"
import { SwapTransaction } from "../../swap-transaction"
import { SwapName } from "../../types/enums"

export const ROOT_CANISTER = "2ipq2-uqaaa-aaaar-qailq-cai"

export class KongSwapShroffImpl extends ShroffAbstract {
  private actor: Agent.ActorSubclass<_SERVICE>

  constructor(source: ICRC1TypeOracle, target: ICRC1TypeOracle) {
    super(source, target)
    this.actor = actorBuilder<_SERVICE>(ROOT_CANISTER, KongIDL)
  }

  protected getCalculator(amountInDecimals: BigNumber): SourceInputCalculator {
    return new KongCalculator(
      BigInt(amountInDecimals.toFixed()),
      this.source.fee,
    )
  }

  getSwapName(): SwapName {
    return SwapName.Kongswap
  }

  //TODO improve
  async getQuote(amount: string): Promise<Quote> {
    const amountInDecimals = this.getAmountInDecimals(amount)
    console.debug(`Amount in decimals: ${amountInDecimals.toFixed()}`)
    const preCalculation = this.getCalculator(amountInDecimals)
    const targetUSDPricePromise = exchangeRateService.usdPriceForICRC1(
      this.target.ledger,
    )
    const sourceUSDPricePromise = exchangeRateService.usdPriceForICRC1(
      this.source.ledger,
    )
    const quotePromise = this.getQuotePromise(preCalculation)
    const [targetUSDPrice, sourceUSDPrice, quote] = await Promise.all([
      targetUSDPricePromise,
      sourceUSDPricePromise,
      quotePromise,
    ])

    if (hasOwnProperty(quote, "Ok")) {
      this.requestedQuote = new KongQuoteImpl(
        amount,
        preCalculation,
        quote.Ok.receive_amount,
        this.source,
        this.target,
        await this.getSlippage(),
        quote.Ok,
        targetUSDPrice?.value,
        sourceUSDPrice?.value,
      )
      return this.requestedQuote
    }

    throw new LiquidityError()
  }

  async swap(delegationIdentity: SignIdentity): Promise<SwapTransaction> {
    if (!this.requestedQuote) {
      throw new Error("Quote not set")
    }
    this.delegationIdentity = delegationIdentity

    this.swapTransaction = new KongSwapTransactionImpl(
      this.target.ledger,
      this.source.ledger,
      this.requestedQuote.getTargetAmount().toNumber(),
      BigInt(this.requestedQuote.getSourceUserInputAmount().toNumber()),
    )
    try {
      const icrc2supported = await this.icrc2supported()

      let icrcTransferId

      if (icrc2supported) {
        icrcTransferId = await this.icrc2approve(ROOT_CANISTER)
        console.log("ICRC2 approve response", JSON.stringify(icrcTransferId))
        this.swapTransaction.setTransferId(icrcTransferId)
      } else {
        try {
          icrcTransferId = await this.transferToSwap()
          console.log(
            "ICRC21 transfer response",
            JSON.stringify(icrcTransferId),
          )
          this.swapTransaction.setDeposit(icrcTransferId)
        } catch (e) {
          throw new ContactSupportError(`Deposit error: ${e}`)
        }
      }

      this.restoreTransaction()

      const slippage = await this.getSlippage()

      const args: SwapArgs = {
        receive_token: this.target.symbol,
        max_slippage: [slippage],
        pay_amount: BigInt(
          this.requestedQuote
            .getSourceSwapAmount()
            .toFixed(this.source.decimals)
            .replace(TRIM_ZEROS, ""),
        ),
        referred_by: [],
        receive_amount: [
          BigInt(
            this.requestedQuote
              .getTargetAmount()
              .toFixed(this.target.decimals)
              .replace(TRIM_ZEROS, ""),
          ),
        ],
        receive_address: [],
        pay_token: this.source.symbol,
        pay_tx_id: icrc2supported ? [] : [{ BlockIndex: icrcTransferId }],
      }
      await replaceActorIdentity(this.actor, delegationIdentity)

      console.debug("Swap args", JSON.stringify(args))

      await this.swapInternal(args)

      this.restoreTransaction()

      const transferNFID = await this.transferToNFID()

      this.swapTransaction.setNFIDTransferId(transferNFID)

      await this.restoreTransaction()

      return this.swapTransaction
    } catch (e) {
      console.error("Swap error:", e)
      this.swapTransaction.setError((e as Error).message)
      await this.restoreTransaction()
      throw e
    }
  }

  protected async swapInternal(args: SwapArgs): Promise<void> {
    try {
      const resp = await this.actor.swap(args)
      console.log("Swap response", JSON.stringify(resp))

      if (hasOwnProperty(resp, "Err")) {
        throw new ContactSupportError(JSON.stringify(resp.Err))
      }

      this.swapTransaction!.setSwap(resp.Ok.ts)
    } catch (e) {
      throw new ContactSupportError(`Swap error: ${e}`)
    }
  }

  protected getQuotePromise(
    sourceCalculator: SourceInputCalculator,
  ): Promise<any> {
    return this.actor.swap_amounts(
      this.source.symbol,
      sourceCalculator.getSourceSwapAmount(),
      this.target.symbol,
    )
  }

  @Cache(integrationCache, { ttl: 300 })
  async getPools(source: string, target: string): Promise<PoolsResult[]> {
    return await Promise.all([
      this.actor.pools([`${source}_${target}`]),
      this.actor.pools([`${target}_${source}`]),
    ])
  }

  static async getAvailablePools(source: string): Promise<string[]> {
    try {
      const actor: Agent.ActorSubclass<_SERVICE> = actorBuilder<_SERVICE>(
        ROOT_CANISTER,
        KongIDL,
      )
      const result = await actor.pools([source])

      if (!("Ok" in result)) return []

      const allPools: string[] = []

      result.Ok.forEach((pool) => {
        if (pool.address_0 === source) allPools.push(pool.address_1)
        if (pool.address_1 === source) allPools.push(pool.address_0)
      })

      return allPools
    } catch (e) {
      console.error("Get Pools error: ", e)
      return []
    }
  }

  getSwapAccount(): Account {
    return {
      subaccount: [],
      owner: Principal.fromText(ROOT_CANISTER),
    }
  }

  protected getICRCActor() {
    return actorBuilder<ICRC1ServiceIDL>(this.source.ledger, icrc1IDL, {
      agent: new HttpAgent({
        ...agentBaseConfig,
        identity: this.delegationIdentity,
      }),
    })
  }
}

export class KongShroffBuilder {
  private source: string | undefined
  private target: string | undefined
  protected sourceOracle: ICRC1TypeOracle | undefined
  protected targetOracle: ICRC1TypeOracle | undefined

  public withSource(source: string): KongShroffBuilder {
    this.source = source
    return this
  }

  public withTarget(target: string): KongShroffBuilder {
    this.target = target
    return this
  }

  //todo generify
  public async build(): Promise<Shroff> {
    if (!this.source) {
      throw new Error("Source is required")
    }

    if (!this.target) {
      throw new Error("Target is required")
    }

    try {
      const [icrc1canisters]: [ICRC1TypeOracle[]] = await Promise.all([
        icrc1OracleService.getICRC1Canisters(),
      ])

      const st: ICRC1TypeOracle[] = icrc1canisters.filter(
        (icrc1) => icrc1.ledger === this.source || icrc1.ledger === this.target,
      )

      this.sourceOracle = st.find((icrc1) => icrc1.ledger === this.source)
      this.targetOracle = st.find((icrc1) => icrc1.ledger === this.target)

      if (!this.sourceOracle || !this.targetOracle) {
        throw new Error("ICRC1 not found")
      }

      const buildShroff = this.buildShroff()

      const pools = await buildShroff.getPools(
        this.sourceOracle.symbol,
        this.targetOracle.symbol,
      )

      if (!pools.some((pool) => "Ok" in pool && pool.Ok.length > 0)) {
        throw new LiquidityError()
      }

      return buildShroff
    } catch (e) {
      if (e instanceof LiquidityError) {
        throw e
      }
      throw new ServiceUnavailableError()
    }
  }

  protected buildShroff(): KongSwapShroffImpl {
    return new KongSwapShroffImpl(this.sourceOracle!, this.targetOracle!)
  }
}
