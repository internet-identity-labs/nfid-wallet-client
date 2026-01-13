import { SignIdentity } from "@dfinity/agent"

import { IcpSwapShroffBuilder } from "src/integration/swap/icpswap/impl/shroff-icp-swap-impl"
import { KongSwapShroffImpl } from "src/integration/swap/kong/impl/kong-swap-shroff"
import { Shroff } from "src/integration/swap/shroff"
import { SwapTransaction } from "src/integration/swap/swap-transaction"

export class ErrorKongNfidShroff extends KongSwapShroffImpl {
  async swap(delegationIdentity: SignIdentity): Promise<SwapTransaction> {
    this.delegationIdentity = delegationIdentity
    if (!this.swapTransaction) {
      throw new Error("Swap transaction not set")
    }
    try {
      console.log("ReSwap NFID started")
      this.swapTransaction.setCompleted()
      await this.restoreTransaction()
      return this.swapTransaction
    } catch (e) {
      console.error("NFID transfer retry error: ", e)
      this.swapTransaction.setError(`NFID transfer retry error: ${e}`)
      await this.restoreTransaction()
      throw e
    }
  }
}

export class KongSwapNfidShroffBuilder extends IcpSwapShroffBuilder {
  protected buildShroff(): Shroff {
    return new ErrorKongNfidShroff(this.sourceOracle!, this.targetOracle!)
  }
}
