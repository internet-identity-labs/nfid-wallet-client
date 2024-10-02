import { ShroffDepositErrorHandler } from "src/integration/icpswap/error-handler/shroff/deposit-shroff"
import { Shroff } from "src/integration/icpswap/shroff"
import { ShroffBuilder } from "src/integration/icpswap/shroff-builder"

export class DepositErrorShroffBuilder extends ShroffBuilder {
  protected buildShroff(): Shroff {
    return new ShroffDepositErrorHandler(
      this.poolData!,
      this.zeroForOne!,
      this.sourceOracle!,
      this.targetOracle!,
    )
  }
}
