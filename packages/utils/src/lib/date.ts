import { isAfter, isBefore } from "date-fns"
import { compareDesc, parse } from "date-fns"

export const bigIntMillisecondsToSeconds = (date: bigint) => {
  return Math.floor(Number(date / BigInt(10 ** 6)))
}

/**
 * Check if date is between to other dates
 * @param date Date
 * @param from Date
 * @param to Date
 * @returns boolean
 */
export const isDateBetween = (date: Date, from?: Date, to?: Date) => {
  if (from && !to) return isAfter(date, from)
  else if (!from && to) return isBefore(date, to)
  else if (from && to) return isAfter(date, from) && isBefore(date, to)
  return true
}

export const sortByDate = <T extends { date: Date | string }>(
  arr: T[],
  dateFormat?: string,
): T[] => {
  return arr.sort((a, b) => {
    const dateA = dateFormat
      ? parse(a.date as string, dateFormat, new Date())
      : (a.date as Date)
    const dateB = dateFormat
      ? parse(b.date as string, dateFormat, new Date())
      : (b.date as Date)
    return compareDesc(dateA, dateB)
  })
}
