export const bigIntMillisecondsToSeconds = (date: bigint) => {
  return Math.floor(Number(date / BigInt(10 ** 6)))
}
