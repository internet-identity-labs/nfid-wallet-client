import { format } from "date-fns"

import { IActivityRow } from "../types"

export const groupActivityRowsByDate = (
  rows: IActivityRow[],
): { date: string; row: IActivityRow }[] => {
  const groups = rows.reduce<{ [date: string]: IActivityRow[] }>((acc, row) => {
    const dateObject = new Date(Number(row.timestamp))
    const date = format(dateObject, "MMMM d, yyyy")

    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(row)
    return acc
  }, {})

  const flattenedData: { date: string; row: IActivityRow }[] = []

  Object.entries(groups)
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    .forEach(([date, rows]) => {
      rows
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .forEach((row) => {
          flattenedData.push({ date, row })
        })
    })

  return flattenedData
}
