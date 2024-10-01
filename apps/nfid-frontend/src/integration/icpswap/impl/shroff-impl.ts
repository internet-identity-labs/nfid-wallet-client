import * as Agent from "@dfinity/agent"
import { SignIdentity } from "@dfinity/agent"
import { SubAccount } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import { idlFactory as SwapPoolIDL } from "src/integration/icpswap/idl/SwapPool"
import { errorTypes, NFID_WALLET } from "src/integration/icpswap/impl/constants"
import {
  calculateWidgetFee,
  QuoteImpl,
} from "src/integration/icpswap/impl/quote-impl"
import { SwapTransactionImpl } from "src/integration/icpswap/impl/swap-transaction-impl"
import { Quote } from "src/integration/icpswap/quote"
import { icpSwapService } from "src/integration/icpswap/service/icpswap-service"
import { Shroff } from "src/integration/icpswap/shroff"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"

import {
  actor,
  exchangeRateService,
  hasOwnProperty,
  ICRC1TypeOracle,
  replaceActorIdentity,
  TransferArg,
} from "@nfid/integration"
import { transferICRC1 } from "@nfid/integration/token/icrc1"
import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"

import { LiquidityError, SlippageError } from "../errors"
import { SwapError } from "../errors/swap-error"
import { PoolData } from "./../idl/SwapFactory.d"
import {
  _SERVICE as SwapPool,
  DepositArgs,
  Error as ErrorSwap,
  Result,
  SwapArgs,
  WithdrawArgs,
} from "./../idl/SwapPool.d"

class ShroffImpl implements Shroff {
  private readonly zeroForOne: boolean
  private readonly poolData: PoolData
  private readonly swapPoolActor: Agent.ActorSubclass<SwapPool>
  private readonly source: ICRC1TypeOracle
  private readonly target: ICRC1TypeOracle
  private swapTransaction: SwapTransactionImpl | undefined
  private requestedQuote: Quote | undefined
  private delegationIdentity: SignIdentity | undefined

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
      this.requestedQuote = new QuoteImpl(
        amount,
        quote.ok as bigint,
        this.source,
        this.target,
        targetUSDPrice,
        sourceUSDPrice,
      )
      return this.requestedQuote
    }

    if (errorTypes.some((errorType) => hasOwnProperty(quote.err, errorType))) {
      throw new LiquidityError()
    }

    throw new Error("Something went wrong")
  }

  getSwapTransaction(): SwapTransaction | undefined {
    return this.swapTransaction
  }

  async swap(delegationIdentity: SignIdentity): Promise<SwapTransactionImpl> {
    if (!this.requestedQuote) {
      throw new Error("Request quote first")
    }
    this.delegationIdentity = delegationIdentity
    this.swapTransaction = new SwapTransactionImpl()
    try {
      await replaceActorIdentity(this.swapPoolActor, delegationIdentity)
      await this.transfer()
      console.debug("Transfer done")
      await this.deposit()
      console.debug("Deposit done")
      await this.swapOnExchange()
      console.debug("Swap done")
      await this.withdraw()
      console.debug("Withdraw done")
      return this.swapTransaction
    } catch (e) {
      console.error("Swap error:", e)
      throw new SwapError()
    }
  }

  async validateQuote(): Promise<Quote> {
    const legacyQuote = this.requestedQuote
    const updatedQuote = await this.getQuote(
      Number(this.requestedQuote?.getSourceAmountPrettified()),
    )

    if (
      legacyQuote?.getTargetAmountPrettified() !==
      updatedQuote.getTargetAmountPrettified()
    ) {
      throw new SlippageError()
    }
    return updatedQuote
  }

  getTargets(): string[] {
    return [
      this.source.ledger,
      this.target.ledger,
      this.poolData.canisterId.toText(),
      exchangeRateService.getNodeCanister(),
    ]
  }

  private async deposit(): Promise<bigint> {
    if (!this.requestedQuote) {
      throw new Error("Quote is required")
    }
    const amountDecimals = this.requestedQuote.getAmountWithoutWidgetFee()
    const args: DepositArgs = {
      fee: this.source.fee,
      token: this.source.ledger,
      amount: BigInt(amountDecimals.toNumber()),
    }

    const result = await this.swapPoolActor.deposit(args)

    if (hasOwnProperty(result, "ok")) {
      const id = result.ok as bigint
      this.swapTransaction!.setDeposit(id)
      return id
    }
    this.swapTransaction?.setError(result.err)
    throw new Error("Deposit error: " + JSON.stringify(result.err))
  }

  private async transfer(): Promise<void> {
    if (!this.delegationIdentity) {
      throw new Error("Delegation identity is required")
    }
    if (!this.requestedQuote) {
      throw new Error("Quote is required")
    }
    await Promise.all([this.transferToSwap(), this.transferToNFID()])
  }

  private async transferToSwap() {
    const amountDecimals = this.requestedQuote!.getAmountWithoutWidgetFee()

    const transferArgs: TransferArg = {
      amount: BigInt(amountDecimals.toNumber()),
      created_at_time: [],
      fee: [],
      from_subaccount: [],
      memo: [],
      to: {
        subaccount: [
          SubAccount.fromPrincipal(
            this.delegationIdentity!.getPrincipal(),
          ).toUint8Array(),
        ],
        owner: this.poolData.canisterId,
      },
    }

    const result = await transferICRC1(
      this.delegationIdentity!,
      this.source.ledger,
      transferArgs,
    )
    if (hasOwnProperty(result, "Ok")) {
      const id = result.Ok as bigint
      this.swapTransaction!.setTransferId(id)
      return id
    } else {
      this.swapTransaction!.setError(result.Err)
      throw new Error(
        "Transfer to ICPSwap failed: " + JSON.stringify(result.Err),
      )
    }
  }

  private async transferToNFID() {
    const amountDecimals = this.requestedQuote!.getWidgetFeeAmount()

    const transferArgs: TransferArg = {
      amount: BigInt(amountDecimals.toNumber()),
      created_at_time: [],
      fee: [],
      from_subaccount: [],
      memo: [],
      to: {
        subaccount: [],
        owner: Principal.fromText(NFID_WALLET),
      },
    }

    const result = await transferICRC1(
      this.delegationIdentity!,
      this.source.ledger,
      transferArgs,
    )
    if (hasOwnProperty(result, "Ok")) {
      const id = result.Ok as bigint
      this.swapTransaction!.setNFIDTransferId(id)
      return id
    } else {
      this.swapTransaction!.setError(result.Err)
      throw new Error("Transfer to NFID failed: " + JSON.stringify(result.Err))
    }
  }

  private async swapOnExchange(): Promise<bigint> {
    const args: SwapArgs = {
      amountIn: this.requestedQuote!.getAmountWithoutWidgetFee().toString(),
      zeroForOne: this.zeroForOne,
      amountOutMinimum: this.requestedQuote!.getTargetAmount().toString(),
    }
    return this.swapPoolActor.swap(args).then((result) => {
      if (hasOwnProperty(result, "ok")) {
        const response = result.ok as bigint
        this.swapTransaction!.setSwap(response)
        return response
      }

      this.swapTransaction?.setError(result.err as ErrorSwap)

      throw new Error("Swap error: " + JSON.stringify(result.err))
    })
  }

  private async withdraw(): Promise<bigint> {
    const args: WithdrawArgs = {
      amount: BigInt(this.requestedQuote!.getTargetAmount().toNumber()),
      token: this.target.ledger,
      fee: this.target.fee,
    }

    return this.swapPoolActor.withdraw(args).then((result) => {
      if (hasOwnProperty(result, "ok")) {
        const id = result.ok as bigint
        this.swapTransaction!.setWithdraw(id)
        return id
      }

      throw new Error("Withdraw error: " + JSON.stringify(result.err))
    })
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
