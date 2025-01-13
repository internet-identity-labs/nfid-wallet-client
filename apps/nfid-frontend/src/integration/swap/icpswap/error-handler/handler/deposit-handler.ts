import { AbstractErrorHandler } from "src/integration/swap/icpswap/error-handler/handler/abstract-error-handler"
import { DepositErrorShroffBuilder } from "src/integration/swap/icpswap/error-handler/shroff/deposit-shroff"
import { Shroff } from "src/integration/swap/shroff"
import { SwapTransaction } from "src/integration/swap/swap-transaction"

export class DepositHandler extends AbstractErrorHandler {
  protected async buildShroff(trs: SwapTransaction): Promise<Shroff> {
    return await new DepositErrorShroffBuilder()
      .withTarget(trs.getTargetLedger())
      .withSource(trs.getSourceLedger())
      .build()
  }
}
