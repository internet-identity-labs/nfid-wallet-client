import React from "react"

import {
  IconCmpArchive,
  IconCmpDots,
  IconCmpPencil,
  IconCmpTransfer,
  Popover,
  PopoverTools,
  TableCell,
  TableRow,
} from "@nfid-frontend/ui"

export interface VaultsWalletsTableRowProps {
  id: bigint
  number: number
  name: string
  tokenBalance: number
  USDBalance: number
}

export const VaultsWalletsTableRow: React.FC<VaultsWalletsTableRowProps> = ({
  number,
  name,
  tokenBalance,
  USDBalance,
}: VaultsWalletsTableRowProps) => {
  return (
    <TableRow>
      <TableCell isLeft>{number}</TableCell>
      <TableCell>{name}</TableCell>
      <TableCell>{tokenBalance} ICP</TableCell>
      <TableCell>${USDBalance}</TableCell>
      <TableCell isRight className="px-0">
        <Popover
          align="end"
          trigger={<IconCmpDots className="w-full text-gray-400" />}
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
                onClick: () => [],
              },
            ]}
          />
        </Popover>
      </TableCell>
    </TableRow>
  )
}
