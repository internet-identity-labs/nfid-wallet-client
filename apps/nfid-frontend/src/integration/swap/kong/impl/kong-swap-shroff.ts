import * as Agent from "@dfinity/agent"
import { HttpAgent, SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import {
  LiquidityError,
  ServiceUnavailableError,
} from "src/integration/swap/errors"
import { idlFactory as icrc1IDL } from "src/integration/swap/kong/idl/icrc1"
import {
  _SERVICE as ICRC1ServiceIDL,
  Account,
  ApproveArgs,
} from "src/integration/swap/kong/idl/icrc1.d"
import { idlFactory as KongIDL } from "src/integration/swap/kong/idl/kong_backend"
import {
  _SERVICE,
  SwapArgs,
  SwapResult,
} from "src/integration/swap/kong/idl/kong_backend.d"
import { KongCalculator } from "src/integration/swap/kong/impl/kong-calculator"
import { KongQuoteImpl } from "src/integration/swap/kong/impl/kong-quote-impl"
import { KongSwapTransactionImpl } from "src/integration/swap/kong/impl/kong-swap-transaction-impl"
import { Shroff } from "src/integration/swap/shroff"
import { ShroffAbstract } from "src/integration/swap/shroff/shroff-abstract"

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

import { Quote } from "../../quote"
import { SwapTransaction } from "../../swap-transaction"
import { SwapName } from "../../types/enums"

export const ROOT_CANISTER = "2ipq2-uqaaa-aaaar-qailq-cai"

class KongSwapShroffImpl extends ShroffAbstract {
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

  getTargets(): string[] {
    return [ROOT_CANISTER, ...ShroffAbstract.getStaticTargets()]
  }

  //TODO improve
  async getQuote(amount: string): Promise<Quote> {
    const amountInDecimals = this.getAmountInDecimals(amount)
    console.debug("Amount in decimals: " + amountInDecimals.toFixed())
    const preCalculation = this.getCalculator(amountInDecimals)
    const targetUSDPricePromise = exchangeRateService.usdPriceForICRC1(
      this.target.ledger,
    )
    const sourceUSDPricePromise = exchangeRateService.usdPriceForICRC1(
      this.source.ledger,
    )
    let quotePromise = this.getQuotePromise(preCalculation)
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

    console.log("KONG swap quote")

    this.swapTransaction = new KongSwapTransactionImpl(
      this.target.ledger,
      this.source.ledger,
      this.requestedQuote.getTargetAmount().toNumber(),
      BigInt(this.requestedQuote.getSourceUserInputAmount().toNumber()),
    )
    try {
      const icrc2approve = await this.icrc2approve()

      if (hasOwnProperty(icrc2approve, "Err")) {
        throw new Error(
          "ICRC2 approve error: " + JSON.stringify(icrc2approve.Err),
        )
      }

      this.swapTransaction.setTransferId(BigInt(icrc2approve.Ok))

      this.restoreTransaction()

      console.log("ICRC2 approve response", JSON.stringify(icrc2approve))

      const slippage = await this.getSlippage()

      let args: SwapArgs = {
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
        pay_tx_id: [],
      }
      await replaceActorIdentity(this.actor, delegationIdentity)

      console.debug("Swap args", JSON.stringify(args))

      let resp: SwapResult = await this.actor.swap(args)

      console.log("Swap response", JSON.stringify(resp))

      if (hasOwnProperty(resp, "Err")) {
        throw new Error("Swap error: " + JSON.stringify(resp.Err))
      }

      this.swapTransaction.setSwap(resp.Ok.ts)

      this.restoreTransaction()

      const transferNFID = await this.transferToNFID()

      this.swapTransaction.setNFIDTransferId(transferNFID)

      await this.restoreTransaction()

      return this.swapTransaction
    } catch (e) {
      console.error("Swap error:", e)
      this.swapTransaction.setError("Swap error: " + e)
      await this.restoreTransaction()
      throw e
    }
  }

  validateQuote(): Promise<Quote> {
    throw new Error("Method not implemented.")
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

  protected async icrc2approve() {
    const actorICRC2 = actorBuilder<ICRC1ServiceIDL>(
      this.source.ledger,
      icrc1IDL,
      {
        agent: new HttpAgent({
          ...agentBaseConfig,
          identity: this.delegationIdentity,
        }),
      },
    )

    const spender: Account = {
      owner: Principal.fromText(ROOT_CANISTER),
      subaccount: [],
    }

    const icrc2_approve_args: ApproveArgs = {
      from_subaccount: [],
      spender,
      fee: [],
      memo: [],
      amount: BigInt(
        this.requestedQuote!.getSourceSwapAmount()
          .plus(Number(this.source.fee))
          .toFixed(this.source.decimals)
          .replace(TRIM_ZEROS, ""),
      ),
      created_at_time: [],
      expected_allowance: [],
      expires_at: [
        {
          timestamp_nanos: BigInt(1739927395042000000), //TODO
        },
      ],
    }

    return await actorICRC2.icrc2_approve(icrc2_approve_args)
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

      return this.buildShroff()
    } catch (e) {
      console.error("Error:", e)
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
