import { useCallback } from "react"

import { IActivityRow, IActivityRowGroup } from "../types"
import { ActivityTableRow } from "./activity-table-row"

interface IActivityTableGroup extends IActivityRowGroup {
  groupIndex: number
}

export const ActivityTableGroup = ({
  date,
  rows,
  groupIndex,
}: IActivityTableGroup) => {
  const getRowId = useCallback((row: IActivityRow) => {
    if (row.asset.type === "ft")
      return `tx-${row.action}-${row.network}-${row.asset.currency}-${
        row.asset.type
      }-${row.asset.amount}-${row.asset.currency}-${row.timestamp.getTime()}-${
        row.from
      }-${row.to}`.replace(".", "_")
    else
      return `tx-${row.action}-${row.network}-${row.asset.type}-${
        row.asset.name
      }-${row.timestamp.getTime()}-${row.from}-${row.to}`.replace(".", "_")
  }, [])

  return (
    <>
      <tr id={`group_${groupIndex}`}>
        <td className="pt-5 text-sm font-bold text-gray-400">{date}</td>
      </tr>
      {rows.map((row, i) => (
        <ActivityTableRow
          {...row}
          id={getRowId(row)}
          key={`group_${groupIndex}_activity_${i}`}
        />
      ))}
    </>
  )
}
