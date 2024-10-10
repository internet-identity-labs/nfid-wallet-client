import {SwapTransaction} from "src/integration/icpswap/swap-transaction"
import {CompleteType} from "src/integration/icpswap/types/enums"
import {AbstractErrorHandler} from "src/integration/icpswap/error-handler/handler/abstract-error-handler";
import {Shroff} from "src/integration/icpswap/shroff";
import {SwapNfidShroffBuilder} from "src/integration/icpswap/error-handler/shroff/nfid-shroff";

export class TransferNfidHandler extends AbstractErrorHandler {
  getCompleteType(): CompleteType {
    return CompleteType.Complete
  }

  protected buildShroff(trs: SwapTransaction): Promise<Shroff> {
    return new SwapNfidShroffBuilder()
      .withTarget(trs.getTargetLedger())
      .withSource(trs.getSourceLedger())
      .build()
  }
}
