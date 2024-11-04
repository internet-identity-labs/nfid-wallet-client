import {SignIdentity} from "@dfinity/agent"
import {ShroffBuilder, ShroffImpl} from "src/integration/icpswap/impl/shroff-impl"
import {Shroff} from "src/integration/icpswap/shroff"
import {SwapTransaction} from "src/integration/icpswap/swap-transaction"

import {replaceActorIdentity} from "@nfid/integration"

export class ShroffSwapErrorHandler extends ShroffImpl {
  async swap(delegationIdentity: SignIdentity): Promise<SwapTransaction> {
    if (!this.swapTransaction) {
      throw new Error("Swap transaction not set")
    }
    try {
      await replaceActorIdentity(this.swapPoolActor, delegationIdentity)
      this.delegationIdentity = delegationIdentity
      console.debug("Transaction restarted")
      if (this.swapTransaction.getError() === undefined) {
        console.debug("Swap timeout error")
        return this.handleSwapTimeoutError()
      } else {
        await this.withdraw()
        console.debug("Withdraw done")
        this.swapTransaction!.setCompleted()
        await this.restoreTransaction()
        console.debug("Transaction stored")
        return this.swapTransaction!
      }
    } catch (e) {
      console.error("Swap error:", e)
      if (!this.swapTransaction.getError()) {
        this.swapTransaction.setError((e as Error).message)
      }
      await this.restoreTransaction()
      throw e
    }
  }

  private async handleSwapTimeoutError(): Promise<SwapTransaction> {
    await super.withdraw()
    console.debug("Withdraw done")
    this.swapTransaction!.setCompleted()
    await this.restoreTransaction()
    console.debug("Transaction stored")
    return this.swapTransaction!
  }
}

export class SwapErrorShroffBuilder extends ShroffBuilder {
  protected buildShroff(): Shroff {
    return new ShroffSwapErrorHandler(
      this.poolData!,
      this.zeroForOne!,
      this.sourceOracle!,
      this.targetOracle!,
    )
  }
}
