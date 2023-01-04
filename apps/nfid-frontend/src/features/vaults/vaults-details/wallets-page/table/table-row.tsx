import clsx from "clsx"
import React from "react"

import {
  IconCmpArchive,
  IconCmpDots,
  IconCmpTransfer,
  Popover,
  PopoverTools,
  TableCell,
  TableRow,
} from "@nfid-frontend/ui"

export interface VaultsWalletsTableRowProps {
  uid?: string
  id: number
  number: number
  name: string
  tokenBalance: number
  USDBalance: number
  onArchive: () => void
  isArchived?: boolean
}

export const VaultsWalletsTableRow: React.FC<VaultsWalletsTableRowProps> = ({
  number,
  name,
  tokenBalance,
  USDBalance,
  onArchive,
  isArchived,
}: VaultsWalletsTableRowProps) => {
  return (
    <TableRow
      className={clsx(isArchived && "text-gray-400 pointer-events-none")}
    >
      <TableCell isLeft>{number}</TableCell>
      <TableCell>{name}</TableCell>
      <TableCell>{tokenBalance} ICP</TableCell>
      <TableCell>${USDBalance}</TableCell>
      <TableCell isRight className="px-0">
        <Popover
          align="end"
          trigger={
            <IconCmpDots
              className={clsx("w-full text-gray-400", isArchived && "hidden")}
            />
          }
        >
          <PopoverTools
            items={[
              {
                icon: <IconCmpTransfer />,
                text: "Send",
                onClick: () => [],
              },
              {
                icon: <IconCmpTransfer className="rotate-180" />,
                text: "Receive",
                onClick: () => [],
              },
              {
                icon: <IconCmpArchive />,
                text: "Archive",
                onClick: onArchive,
              },
            ]}
          />
        </Popover>
      </TableCell>
    </TableRow>
  )
}
