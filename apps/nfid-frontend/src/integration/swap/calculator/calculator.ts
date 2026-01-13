// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface SourceInputCalculator {
  getSourceSwapAmount(): bigint

  getWidgetFee(): bigint

  getSourceFee(): bigint

  getUserInputAmount(): bigint
}
