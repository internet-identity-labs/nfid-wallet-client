import { E8S, MAX_DECIMAL_LENGTH } from "./constants"

export const toPresentation = (value = BigInt(0)) => Number(value) / E8S

export const toPresentationIcrc1 = (
  value = BigInt(0),
  decimals: number = 8,
) => {
  return (Number(value) / 10 ** decimals)
    .toFixed(MAX_DECIMAL_LENGTH)
    .replace(/(\.\d*?[1-9])0+|\.0*$/, "$1")
}
