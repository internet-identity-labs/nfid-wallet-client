import { SignIdentity } from "@dfinity/agent"
import {
  ShroffBuilder,
  ShroffImpl,
} from "src/integration/icpswap/impl/shroff-impl"
import { Shroff } from "src/integration/icpswap/shroff"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"

import { hasOwnProperty, replaceActorIdentity } from "@nfid/integration"

import { ContactSupportError } from "../../errors/contact-support-error"
import { WithdrawErrorLog } from "../../idl/SwapPool.d"

export class ShroffWithdrawErrorHandler extends ShroffImpl {
  async swap(delegationIdentity: SignIdentity): Promise<SwapTransaction> {
    if (!this.swapTransaction) {
      throw new Error("Swap transaction not set")
    }
    try {
      await replaceActorIdentity(this.swapPoolActor, delegationIdentity)
      this.delegationIdentity = delegationIdentity
      console.debug("Transaction restarted")
      if (this.swapTransaction.getError() === undefined) {
        return this.handleWithdrawTimeoutError()
      }
      await this.withdraw()
      console.debug("Withdraw done")
      await this.transferToNFID()
      await this.restoreTransaction()
      console.debug("Transaction stored")
      return this.swapTransaction
    } catch (e) {
      console.error("Swap error:", e)
      this.swapPoolActor.getWithdrawErrorLog().then((log) => {
        if (hasOwnProperty(log, "ok")) {
          const withdrawLogs = log.ok as Array<[bigint, WithdrawErrorLog]>
          if (withdrawLogs.length > 0) {
            throw new ContactSupportError("Withdraw logs are empty")
          }
        }
      })
      await this.restoreTransaction()
      throw e
    }
  }

  private async handleWithdrawTimeoutError(): Promise<SwapTransaction> {
    await this.transferToNFID()
    await this.restoreTransaction()
    console.debug("Transaction stored")
    return this.swapTransaction!
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
