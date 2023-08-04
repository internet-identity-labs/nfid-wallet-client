import { format } from "date-fns"

import { IActivityRow, IActivityRowGroup } from "../types"

export const groupActivityRowsByDate = (
  rows: IActivityRow[],
): IActivityRowGroup[] => {
  const groups = rows.reduce<{ [date: string]: IActivityRow[] }>((acc, row) => {
    const dateObject = new Date(Number(row.timestamp))

    const date = format(dateObject, "MMMM d, yyyy")
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(row)
    return acc
  }, {})

  const groupedByDate = Object.entries(groups).map(([date, rows]) => ({
    date,
    rows: rows.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
  }))

  return groupedByDate.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}
