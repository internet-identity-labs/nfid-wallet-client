import { SignIdentity } from "@dfinity/agent"

import { replaceActorIdentity } from "@nfid/integration"

import {
  IcpSwapShroffBuilder,
  ShroffIcpSwapImpl,
} from "src/integration/swap/icpswap/impl/shroff-icp-swap-impl"
import { Shroff } from "src/integration/swap/shroff"
import { SwapTransaction } from "src/integration/swap/swap-transaction"

export class ShroffWithdrawErrorHandler extends ShroffIcpSwapImpl {
  async swap(delegationIdentity: SignIdentity): Promise<SwapTransaction> {
    if (!this.swapTransaction) {
      throw new Error("Swap transaction not set")
    }
    try {
      this.delegationIdentity = delegationIdentity
      await replaceActorIdentity(this.swapPoolActor, delegationIdentity)
      const balance = await this.swapPoolActor.getUserUnusedBalance(
        this.delegationIdentity.getPrincipal(),
      )
      console.debug(`Balance: ${JSON.stringify(balance)}`)
      console.debug("Transaction restarted")
      await this.withdraw()
      console.debug("Withdraw done")
      await this.transferToNFID()
      await this.restoreTransaction()
      console.debug("Transaction stored")
      return this.swapTransaction
    } catch (e: any) {
      if (e.message.contains("InsufficientFunds")) {
        if (this.swapTransaction.getErrors().length === 0) {
          return this.handleWithdrawTimeoutError()
        } else {
          this.swapTransaction.setCompleted()
          await this.restoreTransaction()
          return this.swapTransaction
        }
      }
      console.error("Swap error:", e)
      this.swapTransaction.setError(`Withdraw retry error: ${e}`)
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

export class SwapErrorShroffBuilder extends IcpSwapShroffBuilder {
  protected buildShroff(): Shroff {
    return new ShroffWithdrawErrorHandler(
      this.poolData!,
      this.zeroForOne!,
      this.sourceOracle!,
      this.targetOracle!,
    )
  }
}
