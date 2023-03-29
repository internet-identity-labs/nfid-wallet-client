/**
 * Transform javascript date as milliseconds to dfinity date format.
 */
export function reverseMapDate(number: number): bigint {
  return BigInt(number * 10 ** 6)
}

export function mapOptional<T>(value: [T] | []): T | undefined {
  if (value.length) return value[0]
}

export function reverseMapOptional<T>(value?: T): [] | [T] {
  if (value) return [value]
  return []
}
