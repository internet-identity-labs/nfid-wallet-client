import { nonNullish } from "@dfinity/utils"

export const isNode = (): boolean =>
  typeof process !== "undefined" && nonNullish(process.versions?.node)

/**
 *
 * console.debug with time prefix (e.g. "[15:22:55.438] message text")
 */
export const logWithTimestamp = (...args: Array<unknown>): void => {
  if (isNode() === true) return

  const time = `[${new Date().toISOString().split("T")[1].replace("Z", "")}]`
  console.log.call(console, ...[time, ...args])
}

// Insecure but fast
// https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
const seed = Math.round(Math.random() * 1e6)
export const hashCode = (value: string | bigint | number): string =>
  (
    Array.from(`${value}`).reduce(
      (s, c) => (Math.imul(31, s) + c.charCodeAt(0)) | 0,
      0,
    ) + seed
  )
    .toString(36)
    .toUpperCase()

export const nowInBigIntNanoSeconds = (): bigint =>
  BigInt(Date.now()) * BigInt(1e6)
