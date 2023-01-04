export const bigIntMillisecondsToSeconds = (date: bigint) => {
  return Math.floor(Number(date) / 10 ** 6)
}
