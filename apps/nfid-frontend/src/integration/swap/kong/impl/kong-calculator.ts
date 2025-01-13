import {CalculatorAbstract, WIDGET_FEE} from "src/integration/swap/calculator/calculator-abstract";
import BigNumber from "bignumber.js"

export class KongCalculator extends CalculatorAbstract {
  calculateSourceSwapAmount(): bigint {
    return this.userInputAmount -
      this.sourceFee -
      this.widgetFee -
      this.sourceFee
  }

  calculateWidgetFee(): bigint {
    return BigInt(
      BigNumber(Number(this.userInputAmount - this.sourceFee - this.sourceFee))
        .multipliedBy(WIDGET_FEE)
        .toFixed(0),
    )
  }
}
