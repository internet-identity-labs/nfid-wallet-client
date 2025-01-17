import { AbstractErrorHandler } from "src/integration/swap/errors/impl/abstract-error-handler"
import { SwapNfidShroffBuilder } from "src/integration/swap/icpswap/error-handler/shroff/nfid-shroff"
import { Shroff } from "src/integration/swap/shroff"
import { SwapTransaction } from "src/integration/swap/swap-transaction"

export class IcpSwapTransferNfidHandler extends AbstractErrorHandler {
  protected buildShroff(trs: SwapTransaction): Promise<Shroff> {
    return new SwapNfidShroffBuilder()
      .withTarget(trs.getTargetLedger())
      .withSource(trs.getSourceLedger())
      .build()
  }
}
