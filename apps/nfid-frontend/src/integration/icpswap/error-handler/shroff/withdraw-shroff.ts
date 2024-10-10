import {SignIdentity} from "@dfinity/agent"
import {ShroffBuilder, ShroffImpl,} from "src/integration/icpswap/impl/shroff-impl"
import {Shroff} from "src/integration/icpswap/shroff"
import {SwapTransaction} from "src/integration/icpswap/swap-transaction"

import {hasOwnProperty, replaceActorIdentity} from "@nfid/integration"

import {WithdrawErrorLog} from "../../idl/SwapPool.d"
import {WithdrawError} from "src/integration/icpswap/errors/withdraw-error";
import {SwapError} from "src/integration/icpswap/errors/swap-error";

export class ShroffWithdrawErrorHandler extends ShroffImpl {
  async swap(delegationIdentity: SignIdentity): Promise<SwapTransaction> {
    if (!this.swapTransaction) {
      throw new Error("Swap transaction not set")
    }
    try {
      await replaceActorIdentity(this.swapPoolActor, delegationIdentity)
      console.debug("Transaction restarted")
      await this.withdraw()
      console.debug("Withdraw done")
      await this.transferToNFID()
      //maybe not async
      await this.restoreTransaction()
      console.debug("Transaction stored")
      return this.swapTransaction
    } catch (e) {
      console.error("Swap error:", e)
      this.swapPoolActor.getWithdrawErrorLog().then((log) => {
        if (hasOwnProperty(log, "ok")) {
          const withdrawLogs = log.ok as Array<[bigint, WithdrawErrorLog]>
          if (withdrawLogs.length > 0) {
            throw new WithdrawError()
          }
        }
      })
      if (!this.swapTransaction.getError()) {
        this.swapTransaction.setError(`Swap error: ${e}`)
      }
      await this.restoreTransaction()
      throw new SwapError()
    }
  }
}

export class SwapErrorShroffBuilder extends ShroffBuilder {
  protected buildShroff(): Shroff {
    return new ShroffWithdrawErrorHandler(
      this.poolData!,
      this.zeroForOne!,
      this.sourceOracle!,
      this.targetOracle!,
    )
  }
}
