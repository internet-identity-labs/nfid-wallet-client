import { AbstractErrorHandler } from "src/integration/icpswap/error-handler/handler/abstract-error-handler"
import { DepositErrorShroffBuilder } from "src/integration/icpswap/error-handler/shroff/deposit-shroff"
import { Shroff } from "src/integration/icpswap/shroff"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"

export class DepositHandler extends AbstractErrorHandler {
  protected async buildShroff(trs: SwapTransaction): Promise<Shroff> {
    return await new DepositErrorShroffBuilder()
      .withTarget(trs.getTargetLedger())
      .withSource(trs.getSourceLedger())
      .build()
  }
}
