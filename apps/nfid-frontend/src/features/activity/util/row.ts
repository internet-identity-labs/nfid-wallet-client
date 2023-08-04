import { format } from "date-fns"

import { IActivityRow, IActivityRowGroup } from "../types"

export const groupActivityRowsByDate = (
  rows: IActivityRow[],
): IActivityRowGroup[] => {
  const groups = rows.reduce<{ [date: string]: IActivityRow[] }>((acc, row) => {
    const dateObject = new Date(row.timestamp)
    const date = format(dateObject, "MMMM d, yyyy")
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(row)
    return acc
  }, {})

  return Object.entries(groups).map(([date, rows]) => ({ date, rows }))
}
