import { E8S, MAX_DECIMAL_LENGTH } from "./constants"

export const toPresentation = (
  value = BigInt(0),
  _?: number,
  scaling?: boolean,
) => Number(value) / E8S / (scaling ? 10 ** MAX_DECIMAL_LENGTH : 1)

export const toPresentationIcrc1 = (
  value = BigInt(0),
  decimals: number = 8,
  isUSD?: boolean,
  scaling?: boolean,
) => {
  return (
    Number(value) /
    10 ** decimals /
    (scaling ? 10 ** MAX_DECIMAL_LENGTH : 1)
  )
    .toFixed(isUSD ? 2 : MAX_DECIMAL_LENGTH)
    .replace(/(\.\d*?[1-9])0+|\.0*$/, "$1")
}
