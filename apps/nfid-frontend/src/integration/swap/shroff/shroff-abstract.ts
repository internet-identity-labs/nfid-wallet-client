import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import { DepositError, WithdrawError } from "src/integration/swap/errors/types"
import { SWAP_FACTORY_CANISTER } from "src/integration/swap/icpswap/service/icpswap-service"
import { Account } from "src/integration/swap/kong/idl/icrc1.d"
import { Quote } from "src/integration/swap/quote"
import { Shroff } from "src/integration/swap/shroff"
import { SwapTransaction } from "src/integration/swap/swap-transaction"
import { swapTransactionService } from "src/integration/swap/transaction/transaction-service"
import { userPrefService } from "src/integration/user-preferences/user-pref-service"

import {
  exchangeRateService,
  hasOwnProperty,
  ICRC1TypeOracle,
  TransferArg,
} from "@nfid/integration"
import { transferICRC1 } from "@nfid/integration/token/icrc1"

import { FT } from "frontend/integration/ft/ft"

import { SwapName } from "../types/enums"

export abstract class ShroffAbstract implements Shroff {
  protected readonly source: ICRC1TypeOracle
  protected readonly target: ICRC1TypeOracle
  protected swapTransaction: SwapTransaction | undefined
  protected requestedQuote: Quote | undefined
  protected delegationIdentity: SignIdentity | undefined

  protected constructor(source: ICRC1TypeOracle, target: ICRC1TypeOracle) {
    this.source = source
    this.target = target
  }

  abstract getSwapName(): SwapName

  abstract getTargets(): string[]

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

  abstract getQuote(amount: string): Promise<Quote>

  abstract swap(delegationIdentity: SignIdentity): Promise<SwapTransaction>

  protected async transferToSwap() {
    try {
      const amountDecimals = this.requestedQuote!.getTransferToSwapAmount()

      console.debug("Amount decimals: " + BigInt(amountDecimals.toFixed()))

      const transferArgs: TransferArg = {
        amount: BigInt(amountDecimals.toFixed()),
        created_at_time: [],
        fee: [],
        from_subaccount: [],
        memo: [],
        to: this.getSwapAccount(),
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
      console.error(
        "Transfer to " + this.getSwapName() + ": " + JSON.stringify(result.Err),
      )
      throw new DepositError(JSON.stringify(result.Err))
    } catch (e) {
      console.error("Deposit error: " + e)
      throw new DepositError(e as Error)
    }
  }

  abstract getSwapAccount(): Account

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
      this.swapTransaction?.setError((e as Error).message)
      throw new WithdrawError("NFID transfer error: " + e)
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

  protected getAmountInDecimals(amount: string): BigNumber {
    return new BigNumber(amount).multipliedBy(10 ** this.source.decimals)
  }

  protected abstract getCalculator(
    amountInDecimals: BigNumber,
  ): SourceInputCalculator

  protected async getSlippage(): Promise<number> {
    return await userPrefService.getUserPreferences().then((prefs) => {
      return prefs.getSlippage()
    })
  }
}
