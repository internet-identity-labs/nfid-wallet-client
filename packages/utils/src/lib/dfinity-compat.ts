import { HttpAgent, type Identity } from "@icp-sdk/core/agent"

export const nonNullish = <T>(value: T): value is NonNullable<T> =>
  value !== null && value !== undefined

export const toNullable = <T>(value: T | undefined): [] | [T] =>
  value === undefined ? [] : [value]

export const nowInBigIntNanoSeconds = (): bigint =>
  BigInt(Date.now()) * BigInt(1_000_000)

export const createAgent = async ({
  identity,
  host,
}: {
  identity: Identity
  host: string
}): Promise<HttpAgent> => {
  return HttpAgent.create({ identity, host })
}

export const hexStringToUint8Array = (hexString: string): Uint8Array => {
  return new Uint8Array(
    hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
  )
}

export const uint8ArrayToHexString = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

export function debounce<T extends unknown[]>(
  func: (...args: T) => void,
  wait: number,
): (...args: T) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: T) => {
    if (timeout !== null) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
