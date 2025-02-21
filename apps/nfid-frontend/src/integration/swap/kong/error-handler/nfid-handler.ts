import { AbstractErrorHandler } from "src/integration/swap/errors/impl/abstract-error-handler"
import { KongSwapNfidShroffBuilder } from "src/integration/swap/kong/error-handler/error-shroff/kong-nfid-error-handler"
import { Shroff } from "src/integration/swap/shroff"
import { SwapTransaction } from "src/integration/swap/swap-transaction"

export class KongSwapTransferNfidHandler extends AbstractErrorHandler {
  protected buildShroff(trs: SwapTransaction): Promise<Shroff> {
    return new KongSwapNfidShroffBuilder()
      .withTarget(trs.getTargetLedger())
      .withSource(trs.getSourceLedger())
      .build()
  }
}
