export const WIDGET_FEE = 0.00875

export abstract class CalculatorAbstract implements SourceInputCalculator {
  protected widgetFee: bigint
  protected sourceFee: bigint
  protected sourceSwapAmount: bigint
  protected userInputAmount: bigint

  constructor(userInputAmount: bigint, sourceFee: bigint) {
    this.userInputAmount = userInputAmount
    this.sourceFee = sourceFee
    this.widgetFee = this.calculateWidgetFee()
    this.sourceSwapAmount = this.calculateSourceSwapAmount()
  }

  abstract calculateWidgetFee(): bigint

  abstract calculateSourceSwapAmount(): bigint

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
