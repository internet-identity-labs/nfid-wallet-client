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

export class ShroffSwapErrorHandler extends ShroffDepositErrorHandler {
  async swap(delegationIdentity: SignIdentity): Promise<SwapTransaction> {
    if (!this.swapTransaction) {
      throw new Error("Swap transaction not set")
    }
    try {
      await replaceActorIdentity(this.swapPoolActor, delegationIdentity)
      console.debug("Transaction restarted")
      await this.withdraw()
      console.debug("Withdraw done")
      //maybe not async
      this.swapTransaction.setCompleted()
      this.restoreTransaction()
      console.debug("Transaction stored")
      return this.swapTransaction
    } catch (e) {
      console.error("Swap error:", e)
      if (!this.swapTransaction.getError()) {
        this.swapTransaction.setError(`Swap error: ${e}`)
      }
      await this.restoreTransaction()
      //TODO @vitaly to change according to the new error handling logic
      throw new SwapError()
    }
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
