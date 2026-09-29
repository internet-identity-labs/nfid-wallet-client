import clsx from "clsx"
import { format } from "date-fns"

import { IconCmpArrow, IconCmpSettings } from "@nfid-frontend/ui"

import { useDarkTheme } from "frontend/hooks"

import { getNetworkIcon } from "packages/ui/src/utils/network-icon"
import { IVaultRow } from "../types"
import { TransactionType } from "@nfid/vaults"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"

export const getActionMarkup = (action: TransactionType) => {
  switch (action) {
    case TransactionType.VaultNamingUpdate:
      return {
        bg: "bg-indigo-50 dark:bg-indigo-900",
        icon: <IconCmpSettings className="rotate-[135deg] text-red-600" />,
      }
    default:
      return {
        bg: "bg-gray-100",
        icon: null,
      }
  }
}

interface IVaultTableRow extends IVaultRow {
  nodeId: string
}

export const VaultTableRow2 = ({
  action,
  from,
  timestamp,
  to,
  nodeId,
}: IVaultTableRow) => {
  const isDarkTheme = useDarkTheme()
  const actionMarkup = getActionMarkup(action)

  return (
    <tr
      id={nodeId}
      className="relative items-center text-sm activity-row hover:bg-gray-50 dark:hover:bg-zinc-800"
    >
      <td className="flex items-center sm:pl-[30px] w-[156px] min-w-[156px] sm:w-[20vw]">
        <div
          className={clsx(
            "w-10 min-w-10 h-10 rounded-[12px] flex items-center justify-center relative",
            actionMarkup.bg,
          )}
        >
          {actionMarkup.icon}
          <div className="absolute bottom-[-5px] right-[-5px] sm:bottom-0 sm:right-0 w-[18px] h-[18px] rounded-[6px] bg-white dark:bg-zinc-800">
            {getNetworkIcon(ChainId.ICP, isDarkTheme)}
          </div>
        </div>
        <div className="ml-2.5 mb-[11px] mt-[11px] shrink-0">
          <p
            id={"activity-table-row-action"}
            className="font-semibold text-sm leading-[20px] dark:text-white"
          >
            {action}
          </p>
          <p
            id={"activity-table-row-date"}
            className="text-xs text-gray-400 dark:text-zinc-500 leading-[20px]"
          >
            {/* {format(new Date(timestamp), "HH:mm:ss aaa")} */}
          </p>
        </div>
      </td>
      <td className="leading-5 pr-5 sm:pr-[30px] min-w-[60%] sm:min-w-auto sm:w-[15%] text-left sm:text-center">
        <div className="flex items-center text-left">
          <div className="flex flex-col">789</div>
        </div>
      </td>
      <td className="hidden sm:table-cell pr-[16px] w-[15%]">10</td>
      <td className="sm:hidden">11</td>
    </tr>
  )
}
