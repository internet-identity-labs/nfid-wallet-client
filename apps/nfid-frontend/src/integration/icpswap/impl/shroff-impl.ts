import * as Agent from "@dfinity/agent"
import { SignIdentity } from "@dfinity/agent"
import { SubAccount } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import { idlFactory as SwapPoolIDL } from "src/integration/icpswap/idl/SwapPool"
import { SourceInputCalculator } from "src/integration/icpswap/impl/calculator"
import { errorTypes } from "src/integration/icpswap/impl/constants"
import { QuoteImpl } from "src/integration/icpswap/impl/quote-impl"
import { SwapTransactionImpl } from "src/integration/icpswap/impl/swap-transaction-impl"
import { Quote } from "src/integration/icpswap/quote"
import {
  icpSwapService,
  SWAP_FACTORY_CANISTER,
} from "src/integration/icpswap/service/icpswap-service"
import { swapTransactionService } from "src/integration/icpswap/service/transaction-service"
import { Shroff } from "src/integration/icpswap/shroff"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"

import {
  actorBuilder,
  exchangeRateService,
  hasOwnProperty,
  ICRC1TypeOracle,
  replaceActorIdentity,
  TransferArg,
} from "@nfid/integration"
import { TRIM_ZEROS } from "@nfid/integration/token/constants"
import { transferICRC1 } from "@nfid/integration/token/icrc1"
import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"

import {
  DepositError,
  LiquidityError,
  ServiceUnavailableError,
  SlippageQuoteError,
  SlippageSwapError,
  SwapError,
  WithdrawError,
} from "../errors"
import { PoolData } from "./../idl/SwapFactory.d"
import {
  _SERVICE as SwapPool,
  DepositArgs,
  Result,
  SwapArgs,
  WithdrawArgs,
} from "./../idl/SwapPool.d"

export class ShroffImpl implements Shroff {
  private readonly zeroForOne: boolean
  private readonly poolData: PoolData
  protected readonly swapPoolActor: Agent.ActorSubclass<SwapPool>
  protected readonly source: ICRC1TypeOracle
  protected readonly target: ICRC1TypeOracle
  protected swapTransaction: SwapTransaction | undefined
  protected requestedQuote: Quote | undefined
  protected delegationIdentity: SignIdentity | undefined

  constructor(
    poolData: PoolData,
    zeroForOne: boolean,
    source: ICRC1TypeOracle,
    target: ICRC1TypeOracle,
  ) {
    this.poolData = poolData
    this.zeroForOne = zeroForOne
    this.swapPoolActor = actorBuilder<SwapPool>(
      poolData.canisterId,
      SwapPoolIDL,
    )
    this.source = source
    this.target = target
  }

  setQuote(quote: Quote) {
    this.requestedQuote = quote
  }

  setTransaction(trs: SwapTransaction) {
    this.swapTransaction = trs
  }

  getSwapTransaction(): SwapTransaction | undefined {
    return this.swapTransaction
  }

  static getStaticTargets(): string[] {
    return [
      exchangeRateService.getNodeCanister(),
      SWAP_TRS_STORAGE,
      SWAP_FACTORY_CANISTER,
    ]
  }

  getTargets(): string[] {
    return [
      this.source.ledger,
      this.target.ledger,
      this.poolData.canisterId.toText(),
      ...ShroffImpl.getStaticTargets(),
    ]
  }

  async getQuote(amount: string): Promise<Quote> {
    const amountInDecimals = new BigNumber(amount).multipliedBy(
      10 ** this.source.decimals,
    )
    console.debug("Amount in decimals: " + amountInDecimals.toFixed())
    const preCalculation = new SourceInputCalculator(
      BigInt(amountInDecimals.toFixed()),
      this.source.fee,
    )

    const args: SwapArgs = {
      amountIn: preCalculation.getSourceSwapAmount().toString(),
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

    const [targetUSDPrice, sourceUSDPrice, quote] = await Promise.allSettled([
      targetUSDPricePromise,
      sourceUSDPricePromise,
      quotePromise,
    ])
    if (quote.status === "fulfilled" && hasOwnProperty(quote.value, "ok")) {
      this.requestedQuote = new QuoteImpl(
        amount,
        preCalculation,
        quote.value.ok as bigint,
        this.source,
        this.target,
        targetUSDPrice.status === "fulfilled"
          ? targetUSDPrice.value
          : undefined,
        sourceUSDPrice.status === "fulfilled"
          ? sourceUSDPrice.value
          : undefined,
      )
      if ((quote.value.ok as bigint) <= this.target.fee) {
        console.error("Not enough amount to pay fee")
        throw new LiquidityError()
      }
      return this.requestedQuote
    }

    if (
      quote.status === "rejected" &&
      errorTypes.some((errorType) =>
        hasOwnProperty(quote.reason.err, errorType),
      )
    ) {
      console.error("Error in quote", quote.reason.err)
      throw new LiquidityError()
    }

    throw new Error("Something went wrong")
  }

  async swap(delegationIdentity: SignIdentity): Promise<SwapTransaction> {
    if (!this.requestedQuote) {
      throw new Error("Request quote first")
    }
    this.delegationIdentity = delegationIdentity
    this.swapTransaction = new SwapTransactionImpl(
      this.target.ledger,
      this.source.ledger,
      this.requestedQuote.getTargetAmount().toNumber(),
      BigInt(this.requestedQuote.getSourceUserInputAmount().toNumber()),
    )
    try {
      await replaceActorIdentity(this.swapPoolActor, delegationIdentity)
      await this.transferToSwap()
      this.restoreTransaction()
      console.debug("Transfer to swap done")
      await this.deposit()
      this.restoreTransaction()
      console.debug("Deposit done")
      await this.swapOnExchange()
      this.restoreTransaction()
      console.debug("Swap done")
      await this.withdraw()
      console.debug("Withdraw done")
      this.restoreTransaction()
      await this.transferToNFID()
      console.debug("Transfer to NFID done")
      await this.restoreTransaction()
      console.debug("Transaction stored")
      return this.swapTransaction
    } catch (e) {
      this.swapTransaction.setError((e as Error).message)
      await this.restoreTransaction()
      throw e
    }
  }

  async validateQuote(): Promise<Quote> {
    const legacyQuote = this.requestedQuote

    if (!this.requestedQuote) {
      throw new Error("Quote is required")
    }

    console.debug(
      "Requested quote: " +
        JSON.stringify(
          this.requestedQuote?.getSourceUserInputAmount().toFixed(),
        ),
    )

    const updatedQuote = await this.getQuote(
      this.requestedQuote?.getSourceAmountPrettified(),
    )
    if (!legacyQuote?.getTargetAmount().eq(updatedQuote.getTargetAmount())) {
      const error = new SlippageQuoteError()
      console.error("Slippage error: " + error.message)
      throw error
    }
    return updatedQuote
  }

  protected async deposit(): Promise<bigint> {
    if (!this.requestedQuote) {
      throw new Error("Quote is required")
    }

    try {
      const amountDecimals = this.requestedQuote
        .getSourceSwapAmount()
        .plus(Number(this.source.fee))
      const args: DepositArgs = {
        fee: this.source.fee,
        token: this.source.ledger,
        amount: BigInt(amountDecimals.toFixed()),
      }
      console.debug("Amount decimals: " + BigInt(amountDecimals.toFixed()))

      const result = await this.swapPoolActor.deposit(args)

      if (hasOwnProperty(result, "ok")) {
        const id = result.ok as bigint
        this.swapTransaction!.setDeposit(id)
        return id
      }
      console.error("Deposit error: " + JSON.stringify(result.err))
      throw new DepositError(JSON.stringify(result.err))
    } catch (e) {
      console.error("Deposit error: " + e)
      throw new DepositError("Deposit error: " + e)
    }
  }

  protected async transfer(): Promise<void> {
    if (!this.delegationIdentity) {
      throw new Error("Delegation identity is required")
    }
    if (!this.requestedQuote) {
      throw new Error("Quote is required")
    }
  }

  protected async transferToSwap() {
    try {
      const amountDecimals = this.requestedQuote!.getSourceSwapAmount().plus(
        Number(this.source.fee),
      )

      console.debug("Amount decimals: " + BigInt(amountDecimals.toFixed()))

      const transferArgs: TransferArg = {
        amount: BigInt(amountDecimals.toFixed()),
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
      }
      console.error("Transfer to ICPSwap failed: " + JSON.stringify(result.Err))
      throw new DepositError(JSON.stringify(result.Err))
    } catch (e) {
      console.error("Deposit error: " + e)
      throw new DepositError(e as Error)
    }
  }

  protected async transferToNFID() {
    try {
      const amountDecimals = this.requestedQuote!.getWidgetFeeAmount()

      const transferArgs: TransferArg = {
        amount: amountDecimals,
        created_at_time: [],
        fee: [],
        from_subaccount: [],
        memo: [],
        to: {
          subaccount: [],
          owner: Principal.fromText(NFID_WALLET_CANISTER),
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
      }
      console.error("NFID transfer error: " + JSON.stringify(result.Err))
      throw new WithdrawError(JSON.stringify(result.Err))
    } catch (e) {
      console.error("NFID transfer error: " + e)
      throw new WithdrawError("NFID transfer error: " + e)
    }
  }

  protected async swapOnExchange(): Promise<bigint> {
    try {
      const args: SwapArgs = {
        amountIn: this.requestedQuote!.getSourceSwapAmount().toFixed(),
        zeroForOne: this.zeroForOne,
        amountOutMinimum: this.requestedQuote!.getTargetAmount()
          .toFixed(this.target.decimals)
          .replace(TRIM_ZEROS, ""),
      }

      console.log("Swap args: " + JSON.stringify(args))

      return this.swapPoolActor.swap(args).then((result) => {
        if (hasOwnProperty(result, "ok")) {
          const response = result.ok as bigint
          this.swapTransaction!.setSwap(response)
          return response
        }

        console.error("Swap on exchange error: " + JSON.stringify(result.err))

        if (
          hasOwnProperty(result.err, "InternalError") &&
          (result.err.InternalError as string)
            .toLocaleLowerCase()
            .includes("slippage")
        ) {
          throw new SlippageSwapError(JSON.stringify(result.err))
        }
        throw new SwapError(JSON.stringify(result.err))
      })
    } catch (e) {
      console.error("Swap error: " + e)
      throw new SwapError("Swap error: " + e)
    }
  }

  protected async withdraw(): Promise<bigint> {
    try {
      const args: WithdrawArgs = {
        amount: BigInt(
          this.requestedQuote!.getTargetAmount()
            .toFixed(this.target.decimals)
            .replace(TRIM_ZEROS, ""),
        ),
        token: this.target.ledger,
        fee: this.target.fee,
      }

      console.debug("Withdraw args: " + JSON.stringify(args))
      return this.swapPoolActor.withdraw(args).then((result) => {
        if (hasOwnProperty(result, "ok")) {
          const id = result.ok as bigint
          this.swapTransaction!.setWithdraw(id)
          return id
        }
        console.error("Withdraw error: " + JSON.stringify(result.err))
        throw new WithdrawError(JSON.stringify(result.err))
      })
    } catch (e) {
      console.error("Withdraw error: " + e)
      throw new WithdrawError("Withdraw error: " + e)
    }
  }

  protected async restoreTransaction() {
    try {
      return swapTransactionService.storeTransaction(
        this.swapTransaction!.toCandid(),
      )
    } catch (e) {
      console.error("Restore transaction error: " + e)
      console.log("Retrying to restore transaction")
      return swapTransactionService.storeTransaction(
        this.swapTransaction!.toCandid(),
      )
    }
  }
}

export class ShroffBuilder {
  private source: string | undefined
  private target: string | undefined
  protected poolData: PoolData | undefined
  protected sourceOracle: ICRC1TypeOracle | undefined
  protected targetOracle: ICRC1TypeOracle | undefined
  protected zeroForOne: boolean | undefined

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

    try {
      const [poolData, icrc1canisters]: [PoolData, ICRC1TypeOracle[]] =
        await Promise.all([
          icpSwapService.getPoolFactory(this.source, this.target),
          icrc1OracleService.getICRC1Canisters(),
        ])

      this.poolData = poolData

      const st: ICRC1TypeOracle[] = icrc1canisters.filter(
        (icrc1) => icrc1.ledger === this.source || icrc1.ledger === this.target,
      )

      this.sourceOracle = st.find((icrc1) => icrc1.ledger === this.source)
      this.targetOracle = st.find((icrc1) => icrc1.ledger === this.target)

      if (!this.sourceOracle || !this.targetOracle) {
        throw new Error("ICRC1 not found")
      }

      this.zeroForOne = this.poolData.token0.address === this.source

      return this.buildShroff()
    } catch (e) {
      console.error("Error:", e)
      if (e instanceof LiquidityError) {
        throw e
      }
      throw new ServiceUnavailableError()
    }
  }

  protected buildShroff(): Shroff {
    return new ShroffImpl(
      this.poolData!,
      this.zeroForOne!,
      this.sourceOracle!,
      this.targetOracle!,
    )
  }
}
