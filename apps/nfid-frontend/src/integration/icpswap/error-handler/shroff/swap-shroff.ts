import { SignIdentity } from "@dfinity/agent"
import { ShroffDepositErrorHandler } from "src/integration/icpswap/error-handler/shroff/deposit-shroff"
import { ShroffBuilder } from "src/integration/icpswap/impl/shroff-impl"
import { Shroff } from "src/integration/icpswap/shroff"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"

import { replaceActorIdentity } from "@nfid/integration"

import { ExchangeError } from "../../errors"

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
      this.swapTransaction.setCompleted()
      await this.restoreTransaction()
      console.debug("Transaction stored")
      return this.swapTransaction
    } catch (e) {
      console.error("Swap error:", e)
      if (!this.swapTransaction.getError()) {
        this.swapTransaction.setError((e as ExchangeError).message)
      }
      await this.restoreTransaction()
      throw e
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
