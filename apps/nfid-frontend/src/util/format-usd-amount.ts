import BigNumber from "bignumber.js"

export function formatUsdAmount(
  amount: BigNumber,
  formatLowAmountToFixed = true,
) {
  if (formatLowAmountToFixed || amount.gte(0.01))
    return `${amount.toFixed(2)} USD`
  return `${BigNumber(amount.toExponential(0)).toFixed()} USD`
}
