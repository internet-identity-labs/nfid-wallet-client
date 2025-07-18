import clsx from "clsx"
import { useCallback } from "react"

import {
  IActivityRow,
  IActivityRowGroup,
} from "frontend/features/activity/types"
import { FT } from "frontend/integration/ft/ft"

import { ActivityTableRow } from "./activity-table-row"

interface IActivityTableGroup extends IActivityRowGroup {
  groupIndex: number
  token?: FT
}

export const ActivityTableGroup = ({
  date,
  rows,
  groupIndex,
  token,
}: IActivityTableGroup) => {
  const getRowId = useCallback((row: IActivityRow) => {
    if (row.asset.type === "ft")
      return `tx-${row.action}-${row.asset.currency}-${row.asset.type}-${
        row.asset.amount
      }-${row.asset.currency}-${row.timestamp.getTime()}-${row.from}-${
        row.to
      }`.replace(".", "_")
    else
      return `tx-${row.action}-${row.asset.type}-${
        row.asset.name
      }-${row.timestamp.getTime()}-${row.from}-${row.to}`.replace(".", "_")
  }, [])

  return (
    <>
      <tr id={`group_${groupIndex}`}>
        <td
          className={clsx(
            "pb-[10px] text-sm font-bold text-gray-400",
            "px-0 sm:px-[30px]",
            groupIndex === 0 ? "pt-0" : "pt-[30px]",
          )}
        >
          {date}
        </td>
      </tr>
      {rows.map((row, i) => (
        <ActivityTableRow
          {...row}
          id={getRowId(row)}
          key={`group_${groupIndex}_activity_${i}`}
          token={token}
        />
      ))}
    </>
  )
}
