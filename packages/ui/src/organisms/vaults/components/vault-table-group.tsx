import { SignIdentity } from "@icp-sdk/core/agent"
import clsx from "clsx"
import { useCallback } from "react"

import {
  IActivityRow,
  IActivityRowGroup,
} from "frontend/features/activity/types"
import { FT } from "frontend/integration/ft/ft"

import { VaultTableRow } from "./vault-table-row"
import {
  SearchRequest,
  UserAddressPreview,
} from "frontend/integration/address-book"
import { IVaultRowGroup } from "../types"

interface IVaultTableGroup extends IVaultRowGroup {
  groupIndex: number
  token?: FT
  identity?: SignIdentity
}

export const VaultTableGroup2 = ({
  date,
  rows,
  groupIndex,
}: IVaultTableGroup) => {
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
        <VaultTableRow
          {...row}
          nodeId={row.id}
          key={`group_${groupIndex}_vault_${i}`}
        />
      ))}
    </>
  )
}
