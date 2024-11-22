import {WIDGET_FEE} from "src/integration/icpswap/impl/quote-impl";
import BigNumber from "bignumber.js"

export class SourceInputCalculator {
  private widgetFee: bigint
  private sourceFee: bigint
  private sourceSwapAmount: bigint
  private userInputAmount: bigint

  constructor(userInputAmount: bigint, sourceFee: bigint) {
    this.userInputAmount = userInputAmount
    this.sourceFee = sourceFee
    //userInput - sourceFeeToTransferToSwap - sourceFeeToTransferWidgetFeeToUser - widgetFee
    this.widgetFee = BigInt(BigNumber(Number(userInputAmount - sourceFee - sourceFee - sourceFee))
      .multipliedBy(WIDGET_FEE)
      .toFixed(0))
    this.sourceSwapAmount = userInputAmount - this.sourceFee - this.widgetFee - this.sourceFee - this.sourceFee
  }

  getSourceSwapAmount(): bigint {
    return this.sourceSwapAmount
  }

  getWidgetFee(): bigint {
    return this.widgetFee
  }

  getSourceFee(): bigint {
    return this.sourceFee
  }

  getUserInputAmount(): bigint {
    return this.userInputAmount
  }
}
