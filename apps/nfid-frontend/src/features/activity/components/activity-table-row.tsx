import { format } from "date-fns"

import {
  IconCmpArrow,
  IconCmpStatusSuccess,
  IconCmpTinyBTC,
  IconCmpTinyETH,
  IconCmpTinyIC,
} from "@nfid-frontend/ui"

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
  return (
    <tr
      id={id}
      className="items-center text-sm transition-all border-b border-gray-200 hover:bg-gray-100"
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
          <p>${asset.amountUSD}</p>
          <p className="text-gray-400">
            {asset.amount} {asset.currency}
          </p>
        </td>
      ) : (
        <td className="flex leading-5">
          <img src={asset.preview} className="object-cover w-10 h-10" />
          <div>
            <p>{asset.name}</p>
            <p className="text-gray-400">{asset.collectionName}</p>
          </div>
        </td>
      )}
      <td>{from}</td>
      <td>{to}</td>
    </tr>
  )
}
