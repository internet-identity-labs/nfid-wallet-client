import { SignIdentity } from "@dfinity/agent"
import {
  ShroffBuilder,
  ShroffImpl,
} from "src/integration/icpswap/impl/shroff-impl"
import { Shroff } from "src/integration/icpswap/shroff"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"

import { replaceActorIdentity } from "@nfid/integration"

export class ShroffNfidErrorHandler extends ShroffImpl {
  async swap(delegationIdentity: SignIdentity): Promise<SwapTransaction> {
    this.delegationIdentity = delegationIdentity
    if (!this.swapTransaction) {
      throw new Error("Swap transaction not set")
    }
    try {
      console.log("ReSwap NFID started")

      const balance = await this.swapPoolActor.getUserUnusedBalance(
        this.delegationIdentity!.getPrincipal(),
      )
      console.debug("Balance: " + JSON.stringify(balance))

      await replaceActorIdentity(this.swapPoolActor, delegationIdentity)
      if (this.swapTransaction.getErrors().length === 0) {
        console.debug("Swap timeout error")
        this.swapTransaction.setCompleted()
        return this.swapTransaction
      }
      await this.transferToNFID()
      await this.restoreTransaction()
      console.debug("Transaction stored")
      return this.swapTransaction
    } catch (e) {
      console.error("NFID transfer retry error: ", e)
      this.swapTransaction.setError("NFID transfer retry error: " + e)
      await this.restoreTransaction()
      throw e
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
