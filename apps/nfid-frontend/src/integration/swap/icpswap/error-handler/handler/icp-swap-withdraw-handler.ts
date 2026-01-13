import { SignIdentity } from "@dfinity/agent"

import { AbstractErrorHandler } from "src/integration/swap/errors/impl/abstract-error-handler"
import { SwapErrorShroffBuilder } from "src/integration/swap/icpswap/error-handler/shroff/withdraw-shroff"
import { Shroff } from "src/integration/swap/shroff"
import { SwapTransaction } from "src/integration/swap/swap-transaction"

export class IcpSwapWithdrawHandler extends AbstractErrorHandler {
  completeTransaction(delegation: SignIdentity): Promise<SwapTransaction> {
    return super.completeTransaction(delegation)
  }

  protected buildShroff(trs: SwapTransaction): Promise<Shroff> {
    return new SwapErrorShroffBuilder()
      .withTarget(trs.getTargetLedger())
      .withSource(trs.getSourceLedger())
      .build()
  }
}
