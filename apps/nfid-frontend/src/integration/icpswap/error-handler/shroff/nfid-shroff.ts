import { SignIdentity } from "@dfinity/agent"
import { SwapError } from "src/integration/icpswap/errors/swap-error"
import {
  ShroffBuilder,
  ShroffImpl,
} from "src/integration/icpswap/impl/shroff-impl"
import { Shroff } from "src/integration/icpswap/shroff"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"

import { hasOwnProperty, replaceActorIdentity } from "@nfid/integration"

import { WithdrawArgs } from "../../idl/SwapPool.d"
import {ShroffDepositErrorHandler} from "src/integration/icpswap/error-handler/shroff/deposit-shroff";
import {WithdrawError} from "src/integration/icpswap/errors/withdraw-error";

export class ShroffNfidErrorHandler extends ShroffImpl {
  async swap(delegationIdentity: SignIdentity): Promise<SwapTransaction> {
    if (!this.swapTransaction) {
      throw new Error("Swap transaction not set")
    }
    try {
      console.log("ReSwap NFID started")
      await replaceActorIdentity(this.swapPoolActor, delegationIdentity)
      this.delegationIdentity = delegationIdentity
      await this.transferToNFID()
      await this.restoreTransaction()
      console.debug("Transaction stored")
      return this.swapTransaction
    } catch (e) {
      console.error("Swap error:", e)
      if (!this.swapTransaction.getError()) {
        this.swapTransaction.setError(`Swap error: ${e}`)
      }
      await this.restoreTransaction()
      throw new WithdrawError()
    }
  }
}

export class SwapNfidShroffBuilder extends ShroffBuilder {
  protected buildShroff(): Shroff {
    return new ShroffNfidErrorHandler(
      this.poolData!,
      this.zeroForOne!,
      this.sourceOracle!,
      this.targetOracle!,
    )
  }
}
