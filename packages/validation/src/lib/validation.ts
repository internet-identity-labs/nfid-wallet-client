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
    console.log(">> minMax", { value, eval: min && Number(value) < min })

    if (min !== undefined && Number(value) < min) return toLowError
    if (max !== undefined && Number(value) > max) return toBigError
    return true
  }
