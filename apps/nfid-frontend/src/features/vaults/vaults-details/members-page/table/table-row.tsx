import clsx from "clsx"
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

import { CenterEllipsis } from "frontend/ui/atoms/center-ellipsis"

export interface VaultsMembersTableRowProps {
  name: string
  address: string
  role: string
  index: number
  isArchived: boolean
  onEdit?: () => void
  onArchive?: () => void
}

export const VaultsMembersTableRow: React.FC<VaultsMembersTableRowProps> = ({
  name,
  address,
  role,
  index,
  onEdit,
  onArchive,
  isArchived,
}: VaultsMembersTableRowProps) => {
  return (
    <TableRow
      className={clsx(isArchived && "text-gray-400 pointer-events-none")}
    >
      <TableCell isLeft>{index}</TableCell>
      <TableCell>{name}</TableCell>
      <TableCell centered>
        <CenterEllipsis value={address} leadingChars={9} trailingChars={3} />
      </TableCell>
      <TableCell centered>{role}</TableCell>
      <TableCell isRight className="px-0">
        <Popover
          align="end"
          trigger={
            <IconCmpDots className={clsx("w-full", isArchived && "hidden")} />
          }
        >
          <PopoverTools
            items={[
              {
                icon: <IconCmpPencil />,
                text: "Edit",
                onClick: onEdit,
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
