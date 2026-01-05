import { SignIdentity } from "@dfinity/agent"
import clsx from "clsx"
import { useCallback } from "react"

import {
  IActivityRow,
  IActivityRowGroup,
} from "frontend/features/activity/types"
import { FT } from "frontend/integration/ft/ft"

import { ActivityTableRow } from "./activity-table-row"
import {
  SearchRequest,
  UserAddressPreview,
} from "frontend/integration/address-book"

interface IActivityTableGroup extends IActivityRowGroup {
  groupIndex: number
  token?: FT
  identity?: SignIdentity
  searchAddress: (req: SearchRequest) => Promise<UserAddressPreview[]>
}

export const ActivityTableGroup = ({
  date,
  rows,
  groupIndex,
  searchAddress,
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
            "pb-[10px] text-sm font-bold text-gray-400 dark:text-zinc-500",
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
          nodeId={getRowId(row)}
          key={`group_${groupIndex}_activity_${i}`}
          searchAddress={searchAddress}
        />
      ))}
    </>
  )
}
