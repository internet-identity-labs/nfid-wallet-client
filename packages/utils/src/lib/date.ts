export const BigIntMillisecondsToSeconds = (date: bigint) => {
  return Math.floor(Number(date) / 10 ** 6)
}

// TODO Vaults - add unit test
