import BigNumber from "bignumber.js"

interface Validation {
  min?: number
  max?: number
  toLowError?: string
  toBigError?: string
}
export const minMax =
  ({
    min,
    max,
    toLowError = "value is too small",
    toBigError = "value is too big",
  }: Validation) =>
  (value: number) => {
    if (min !== undefined && Number(value) < min) return toLowError
    if (max !== undefined && Number(value) > max) return toBigError
    return true
  }

export const isHex = (h: string) => {
  const re = /[0-9A-Fa-f]{6}/g
  return re.test(h)
}

export const validateTransferAmountField =
  (
    balance: bigint | undefined,
    fee: bigint,
    decimals: number | undefined,
    minAmount?: number,
    symbol?: string,
  ) =>
  (value: string) => {
    if (!decimals || !balance) return "Insufficient funds"
    const balanceNum = BigNumber(balance.toString()).div(10 ** decimals)
    const feeNum = new BigNumber(fee.toString()).div(10 ** decimals)
    const valueNum = new BigNumber(value)

    if (valueNum.isNaN()) return "Invalid input"
    if (valueNum.isLessThan(0)) return "Transfer amount can't be negative value"
    if (valueNum.isGreaterThanOrEqualTo(new BigNumber("1e20")))
      return "The transferred sum cannot be excessively large."
    if (valueNum.isEqualTo(0)) return "You can't send 0"

    if (balanceNum.minus(feeNum).isLessThan(valueNum))
      return "Insufficient funds"
    if (minAmount !== undefined && valueNum.isLessThan(minAmount)) {
      return `Minimum amount to stake ${symbol} is ${minAmount}`
    }
    return true
  }
