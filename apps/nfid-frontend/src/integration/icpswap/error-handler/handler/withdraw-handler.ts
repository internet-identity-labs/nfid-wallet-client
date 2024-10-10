import { SignIdentity } from "@dfinity/agent"
import { AbstractErrorHandler } from "src/integration/icpswap/error-handler/handler/abstract-error-handler"
import { SwapErrorShroffBuilder } from "src/integration/icpswap/error-handler/shroff/withdraw-shroff"
import { Shroff } from "src/integration/icpswap/shroff"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"
import { CompleteType } from "src/integration/icpswap/types/enums"

export class WithdrawHandler extends AbstractErrorHandler {
  completeTransaction(delegation: SignIdentity): Promise<SwapTransaction> {
    if (this.getCompleteType() === CompleteType.Complete) {
      return super.completeTransaction(delegation)
    } else {
      throw Error("Contact Swap support")
    }
  }
  getCompleteType(): CompleteType {
    return CompleteType.Complete
  }

  protected buildShroff(trs: SwapTransaction): Promise<Shroff> {
    return new SwapErrorShroffBuilder()
      .withTarget(trs.getTargetLedger())
      .withSource(trs.getSourceLedger())
      .build()
  }
}
