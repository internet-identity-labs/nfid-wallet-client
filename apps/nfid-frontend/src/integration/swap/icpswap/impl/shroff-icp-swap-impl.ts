import * as Agent from "@dfinity/agent"
import { HttpAgent, SignIdentity } from "@dfinity/agent"
import { Account, SubAccount } from "@dfinity/ledger-icp"
import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import { idlFactory as SwapPoolIDL } from "src/integration/swap/icpswap/idl/SwapPool"
import { SourceInputCalculatorIcpSwap } from "src/integration/swap/icpswap/impl/icp-swap-calculator"
import { IcpSwapQuoteImpl } from "src/integration/swap/icpswap/impl/icp-swap-quote-impl"
import { IcpSwapTransactionImpl } from "src/integration/swap/icpswap/impl/icp-swap-transaction-impl"
import { icpSwapService } from "src/integration/swap/icpswap/service/icpswap-service"
import { idlFactory as icrc1IDL } from "src/integration/swap/kong/idl/icrc1"
import { _SERVICE as ICRC1ServiceIDL } from "src/integration/swap/kong/idl/icrc1.d"
import { Quote } from "src/integration/swap/quote"
import { Shroff } from "src/integration/swap/shroff"
import { ShroffAbstract } from "src/integration/swap/shroff/shroff-abstract"
import { SwapTransaction } from "src/integration/swap/swap-transaction"
import { swapTransactionService } from "src/integration/swap/transaction/transaction-service"

import {
  actorBuilder,
  agentBaseConfig,
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
  SlippageSwapError,
  SwapError,
  WithdrawError,
} from "../../errors/types"
import { ContactSupportError } from "../../errors/types/contact-support-error"
import { SwapName } from "../../types/enums"
import { PoolData } from "../idl/SwapFactory.d"
import {
  _SERVICE as SwapPool,
  DepositArgs,
  Result,
  SwapArgs,
  WithdrawArgs,
  DepositAndSwapArgs,
} from "../idl/SwapPool.d"

const POOL_CANISTER = "dwahc-eyaaa-aaaag-qcgnq-cai"

export class ShroffIcpSwapImpl extends ShroffAbstract {
  private readonly zeroForOne: boolean
  private readonly poolData: PoolData
  protected readonly swapPoolActor: Agent.ActorSubclass<SwapPool>

  constructor(
    poolData: PoolData,
    zeroForOne: boolean,
    source: ICRC1TypeOracle,
    target: ICRC1TypeOracle,
  ) {
    super(source, target)
    this.poolData = poolData
    this.zeroForOne = zeroForOne
    this.swapPoolActor = actorBuilder<SwapPool>(
      poolData.canisterId,
      SwapPoolIDL,
    )
  }

  getSwapName(): SwapName {
    return SwapName.ICPSwap
  }

  setQuote(quote: Quote) {
    this.requestedQuote = quote
  }

  setTransaction(trs: SwapTransaction) {
    this.swapTransaction = trs
  }

  static async getAvailablePools(source: string): Promise<string[]> {
    try {
      const result = await icpSwapService.getPools()

      if (!("ok" in result)) return []

      const allPools: string[] = []

      result.ok.forEach((pool) => {
        if (pool.token0.address === source) {
          allPools.push(pool.token1.address)
        }
        if (pool.token1.address === source) {
          allPools.push(pool.token0.address)
        }
      })

      return allPools
    } catch (e) {
      console.error("Get Pools error: ", e)
      return []
    }
  }

  getSwapTransaction(): SwapTransaction | undefined {
    return this.swapTransaction
  }

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

    const slippage = await this.getSlippage()

    const args: SwapArgs = {
      amountIn: preCalculation.getSourceSwapAmount().toString(),
      zeroForOne: this.zeroForOne,
      amountOutMinimum: slippage.toString(),
    }

    const quotePromise = this.swapPoolActor.quote(args) as Promise<Result>

    const [targetUSDPrice, sourceUSDPrice, quote] = await Promise.all([
      targetUSDPricePromise,
      sourceUSDPricePromise,
      quotePromise,
    ])

    if (hasOwnProperty(quote, "ok")) {
      this.requestedQuote = new IcpSwapQuoteImpl(
        amount,
        preCalculation,
        quote.ok as bigint,
        this.source,
        this.target,
        slippage,
        targetUSDPrice?.value,
        sourceUSDPrice?.value,
      )
      return this.requestedQuote
    }

    throw new LiquidityError()
  }

  protected getICRCActor() {
    return actorBuilder<ICRC1ServiceIDL>(this.source.ledger, icrc1IDL, {
      agent: new HttpAgent({
        ...agentBaseConfig,
        identity: this.delegationIdentity,
      }),
    })
  }

  async swap(delegationIdentity: SignIdentity): Promise<SwapTransaction> {
    if (!this.requestedQuote) {
      throw new Error("Request quote first")
    }
    this.delegationIdentity = delegationIdentity
    this.swapTransaction = new IcpSwapTransactionImpl(
      this.target.ledger,
      this.source.ledger,
      this.requestedQuote.getTargetAmount().toNumber(),
      BigInt(this.requestedQuote.getSourceUserInputAmount().toNumber()),
    )
    try {
      await replaceActorIdentity(this.swapPoolActor, delegationIdentity)

      const icrc2supported = await this.icrc2supported()

      let icrcTransferId

      if (icrc2supported) {
        icrcTransferId = await this.icrc2approve(
          this.poolData.canisterId.toString(),
        )
        this.swapTransaction.setTransferId(icrcTransferId)
        console.debug("ICRC2 approve response", JSON.stringify(icrcTransferId))
        this.restoreTransaction()
        const amountDecimals = this.requestedQuote
          .getSourceSwapAmount()
          .plus(Number(this.source.fee))
        const args: DepositAndSwapArgs = {
          tokenInFee: this.source.fee,
          amountIn: this.requestedQuote!.getSourceSwapAmount().toFixed(),
          zeroForOne: this.zeroForOne,
          amountOutMinimum: this.requestedQuote!.getTargetAmount()
            .toFixed(this.target.decimals)
            .replace(TRIM_ZEROS, ""),
          tokenOutFee: this.target.fee,
        }
        console.debug("Amount decimals: " + BigInt(amountDecimals.toFixed()))
        const result = await this.swapPoolActor.depositFromAndSwap(args)
        if (hasOwnProperty(result, "ok")) {
          const id = result.ok as bigint
          this.swapTransaction!.setSwap(id)
        } else {
          let err = JSON.stringify(
            "Deposit and swap error: " + JSON.stringify(result.err),
          )
          console.error(err)
          throw new DepositError(err)
        }
      } else {
        try {
          await this.transferToSwap()
          console.log(
            "ICRC21 transfer response",
            JSON.stringify(icrcTransferId),
          )
        } catch (e) {
          throw new ContactSupportError("Deposit error: " + e)
        }
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
      }
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

  getSwapAccount(): Account {
    return {
      subaccount: [
        SubAccount.fromPrincipal(
          this.delegationIdentity!.getPrincipal(),
        ).toUint8Array(),
      ],
      owner: this.poolData.canisterId,
    }
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
      await replaceActorIdentity(this.swapPoolActor, this.delegationIdentity!)
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

  protected getCalculator(amountInDecimals: BigNumber): SourceInputCalculator {
    return new SourceInputCalculatorIcpSwap(
      BigInt(amountInDecimals.toFixed()),
      this.source.fee,
    )
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

export class IcpSwapShroffBuilder {
  private source: string | undefined
  private target: string | undefined
  protected poolData: PoolData | undefined
  protected sourceOracle: ICRC1TypeOracle | undefined
  protected targetOracle: ICRC1TypeOracle | undefined
  protected zeroForOne: boolean | undefined

  public withSource(source: string): IcpSwapShroffBuilder {
    this.source = source
    return this
  }

  public withTarget(target: string): IcpSwapShroffBuilder {
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
      if (e instanceof LiquidityError) {
        throw e
      }
      throw new ServiceUnavailableError()
    }
  }

  protected buildShroff(): Shroff {
    return new ShroffIcpSwapImpl(
      this.poolData!,
      this.zeroForOne!,
      this.sourceOracle!,
      this.targetOracle!,
    )
  }
}
