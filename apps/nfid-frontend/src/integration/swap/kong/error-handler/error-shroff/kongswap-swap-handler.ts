import { SignIdentity } from "@icp-sdk/core/agent"
import { AbstractErrorHandler } from "src/integration/swap/errors/impl/abstract-error-handler"
import { ContactSupportError } from "src/integration/swap/errors/types/contact-support-error"
import { Shroff } from "src/integration/swap/shroff"
import { SwapTransaction } from "src/integration/swap/swap-transaction"

export class KongswapSwapHandler extends AbstractErrorHandler {
  completeTransaction(delegation: SignIdentity): Promise<SwapTransaction> {
    throw new ContactSupportError("KongSwap provider error")
  }

  protected buildShroff(_trs: SwapTransaction): Promise<Shroff> {
    throw new ContactSupportError("KongSwap provider error")
  }
}
