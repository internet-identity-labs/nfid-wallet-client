import { AbstractErrorHandler } from "src/integration/swap/errors/impl/abstract-error-handler"
import { SwapErrorShroffBuilder } from "src/integration/swap/icpswap/error-handler/shroff/swap-shroff"
import { Shroff } from "src/integration/swap/shroff"
import { SwapTransaction } from "src/integration/swap/swap-transaction"

export class IcpSwapSwapHandler extends AbstractErrorHandler {
  protected async buildShroff(trs: SwapTransaction): Promise<Shroff> {
    return await new SwapErrorShroffBuilder()
      .withTarget(trs.getTargetLedger())
      .withSource(trs.getSourceLedger())
      .build()
  }
}
