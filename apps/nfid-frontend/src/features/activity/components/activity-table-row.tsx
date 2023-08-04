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
  chain,
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
      className="items-center text-sm transition-all border-b border-gray-200 hover:bg-gray-100 activity-row"
    >
      <td className="flex items-center py-2.5">
        <div className="w-10 h-10 rounded-[9px] bg-gray-50 flex items-center justify-center relative">
          <IconCmpArrow className="rotate-[135deg] text-gray-400" />
          <div className="absolute w-[18px] h-[18px] right-0 bottom-0">
            {ChainIcons[chain]}
          </div>
        </div>
        <div className="ml-2.5">
          <p className="font-bold">{action}</p>
          <p className="text-xs text-gray-400">
            {format(new Date(timestamp), "HH:mm:ss aaa")}
          </p>
        </div>
      </td>
      {asset?.type === "ft" ? (
        <td className="leading-5">
          <p className="font-medium">
            {asset.amount} {asset.currency}
          </p>
        </td>
      ) : (
        <td className="leading-5">
          <div className="flex items-center">
            <img src={asset.preview} className="object-cover w-10 h-10" />
            <p className="ml-2.5 font-semibold">{asset.name}</p>
          </div>
        </td>
      )}
      <td
        className="transition-opacity cursor-pointer hover:opacity-50"
        onClick={() => onCopy(from)}
      >
        {truncateString(from, 6, 4)}
      </td>
      <td
        className="transition-opacity cursor-pointer hover:opacity-50"
        onClick={() => onCopy(to)}
      >
        {truncateString(to, 6, 4)}
      </td>
    </tr>
  )
}