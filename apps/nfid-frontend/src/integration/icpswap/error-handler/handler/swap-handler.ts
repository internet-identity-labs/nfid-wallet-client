import { AbstractErrorHandler } from "src/integration/icpswap/error-handler/handler/abstract-error-handler"
import { SwapErrorShroffBuilder } from "src/integration/icpswap/error-handler/shroff/swap-shroff"
import { Shroff } from "src/integration/icpswap/shroff"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"

export class SwapHandler extends AbstractErrorHandler {
  protected async buildShroff(trs: SwapTransaction): Promise<Shroff> {
    return await new SwapErrorShroffBuilder()
      .withTarget(trs.getTargetLedger())
      .withSource(trs.getSourceLedger())
      .build()
  }
}
