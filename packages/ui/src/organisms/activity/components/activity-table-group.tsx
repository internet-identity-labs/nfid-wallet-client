import clsx from "clsx"
import { TableSkeleton } from "packages/ui/src/atoms/skeleton/table-skeleton"
import { useCallback } from "react"

import {
  IActivityRow,
  IActivityRowGroup,
} from "frontend/features/activity/types"

import { ActivityTableRow } from "./activity-table-row"

interface IActivityTableGroup extends IActivityRowGroup {
  groupIndex: number
  isLoading: boolean
}

export const ActivityTableGroup = ({
  date,
  rows,
  groupIndex,
  isLoading,
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
        <td
          className={clsx(
            "pb-[10px] text-sm font-bold text-gray-400",
            "px-5 sm:px-[30px]",
            groupIndex === 0 ? "pt-0" : "pt-[30px]",
          )}
        >
          {date}
        </td>
      </tr>
      {true ? (
        <TableSkeleton tableRowsAmount={5} tableCellAmount={4} />
      ) : (
        rows.map((row, i) => (
          <ActivityTableRow
            {...row}
            id={getRowId(row)}
            key={`group_${groupIndex}_activity_${i}`}
          />
        ))
      )}
    </>
  )
}
