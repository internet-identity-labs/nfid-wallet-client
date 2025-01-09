import BigNumber from "bignumber.js"

import { WIDGET_FEE } from "../impl/icp-swap-quote-impl"

export const getMaxAmountFee = (
  sourceAmount: bigint,
  sourceFee: bigint,
): bigint => {
  const tokenFee = new BigNumber(sourceFee.toString()).multipliedBy(3)
  const amount = new BigNumber(sourceAmount.toString())
  const widgetFee = new BigNumber(WIDGET_FEE)
  const divisor = new BigNumber(1).plus(widgetFee)
  const fee = amount.minus(tokenFee).dividedBy(divisor)

  return BigInt(amount.minus(fee).toFixed(0))
}
