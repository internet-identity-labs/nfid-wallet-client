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
