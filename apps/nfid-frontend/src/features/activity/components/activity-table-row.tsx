import clsx from "clsx"
import { format } from "date-fns"
import { useCallback } from "react"
import { toast } from "react-toastify"

import {
  IconCmpArrow,
  IconCmpStatusSuccess,
  IconCmpTinyBTC,
  IconCmpTinyETH,
  IconCmpTinyIC,
} from "@nfid-frontend/ui"
import { truncateString } from "@nfid-frontend/utils"

import { IActivityRow } from "../types"

interface IActivityTableRow extends IActivityRow {
  id: string
}

export const ChainIcons = {
  BTC: <IconCmpTinyBTC />,
  ETH: <IconCmpTinyETH />,
  IC: <IconCmpTinyIC />,
}

export const StatusIcons = {
  Success: <IconCmpStatusSuccess />,
}

export const ActivityTableRow = ({
  action,
  asset,
  from,
  timestamp,
  to,
  id,
}: IActivityTableRow) => {
  const onCopy = useCallback((text: string) => {
    toast.success("Address copied to clipboard")
    navigator.clipboard.writeText(text)
  }, [])

  return (
    <tr
      id={id}
      className="items-center text-sm border-b border-gray-200 activity-row last:border-none"
    >
      <td className="flex items-center py-2.5">
        <div className="w-10 h-10 rounded-[9px] bg-gray-50 flex items-center justify-center relative">
          <IconCmpArrow
            className={clsx(
              "text-gray-400",
              action === "Sent" ? "rotate-[135deg]" : "rotate-[-45deg]",
            )}
          />
        </div>
        <div className="ml-2.5">
          <p className="font-bold">{action}</p>
          <p className="text-xs text-gray-400">
            {format(new Date(timestamp), "HH:mm:ss aaa")}
          </p>
        </div>
      </td>
      {asset?.type === "ft" ? (
        <td className="leading-5 text-right sm:text-left">
          <p className="font-medium">
            {asset.amount} {asset.currency}
          </p>
          <p className="text-gray-400 text-xs">{asset.amountUSD}</p>
        </td>
      ) : (
        <td className="leading-5 text-right sm:text-left">
          <div className="flex items-center">
            <img src={asset.preview} className="object-cover w-10 h-10" />
            <p className="ml-2.5 font-semibold">{asset.name}</p>
          </div>
        </td>
      )}
      <td
        className="transition-opacity cursor-pointer hover:opacity-50 hidden sm:table-cell"
        onClick={() => onCopy(from)}
      >
        {truncateString(from, 6, 4)}
      </td>
      <td
        className="transition-opacity cursor-pointer hover:opacity-50 hidden sm:table-cell"
        onClick={() => onCopy(to)}
      >
        {truncateString(to, 6, 4)}
      </td>
    </tr>
  )
}
