import { AbstractErrorHandler } from "src/integration/icpswap/error-handler/handler/abstract-error-handler"
import { SwapNfidShroffBuilder } from "src/integration/icpswap/error-handler/shroff/nfid-shroff"
import { Shroff } from "src/integration/icpswap/shroff"
import { SwapTransaction } from "src/integration/icpswap/swap-transaction"

export class TransferNfidHandler extends AbstractErrorHandler {
  protected buildShroff(trs: SwapTransaction): Promise<Shroff> {
    return new SwapNfidShroffBuilder()
      .withTarget(trs.getTargetLedger())
      .withSource(trs.getSourceLedger())
      .build()
  }
}
