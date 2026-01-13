import { SignIdentity } from "@dfinity/agent"

import { AbstractErrorHandler } from "src/integration/swap/errors/impl/abstract-error-handler"
import { ContactSupportError } from "src/integration/swap/errors/types/contact-support-error"
import { KongShroffBuilder } from "src/integration/swap/kong/impl/kong-swap-shroff"
import { Shroff } from "src/integration/swap/shroff"
import { SwapTransaction } from "src/integration/swap/swap-transaction"

export class KongswapSwapHandler extends AbstractErrorHandler {
  completeTransaction(_delegation: SignIdentity): Promise<SwapTransaction> {
    throw new ContactSupportError("KongSwap provider error")
  }

  protected buildShroff(trs: SwapTransaction): Promise<Shroff> {
    return new KongShroffBuilder()
      .withTarget(trs.getTargetLedger())
      .withSource(trs.getSourceLedger())
      .build()
  }
}
