import React from "react"

import {
  IconCmpArchive,
  IconCmpDots,
  IconCmpPencil,
  Popover,
  PopoverTools,
  TableCell,
  TableRow,
} from "@nfid-frontend/ui"

export interface VaultsMembersTableRowProps {
  id: string | number
  number: number
  name: string
  address: number
  role: string
}

export const VaultsMembersTableRow: React.FC<VaultsMembersTableRowProps> = ({
  number,
  name,
  address,
  role,
}: VaultsMembersTableRowProps) => {
  return (
    <TableRow>
      <TableCell isLeft>{number}</TableCell>
      <TableCell>{name}</TableCell>
      <TableCell>{address}</TableCell>
      <TableCell>{role}</TableCell>
      <TableCell isRight className="px-0">
        <Popover
          align="end"
          trigger={<IconCmpDots className="w-full text-gray-400" />}
        >
          <PopoverTools
            items={[
              {
                icon: <IconCmpPencil />,
                text: "Edit",
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
