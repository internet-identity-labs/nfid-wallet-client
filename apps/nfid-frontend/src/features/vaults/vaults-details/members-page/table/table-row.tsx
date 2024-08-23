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
  CenterEllipsis,
} from "@nfid-frontend/ui"

export interface VaultsMembersTableRowProps {
  name: string
  address: string
  role: string
  index: number
  isArchived: boolean
  onEdit?: () => void
  onArchive?: () => void
  isAdmin?: boolean
}

export const VaultsMembersTableRow: React.FC<VaultsMembersTableRowProps> = ({
  name,
  address,
  role,
  index,
  onEdit,
  onArchive,
  isArchived,
  isAdmin,
}: VaultsMembersTableRowProps) => {
  return (
    <TableRow
      className={clsx(isArchived && "text-secondary pointer-events-none")}
      id={`member_${name}`}
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
            <IconCmpDots
              className={clsx("w-full", (isArchived || !isAdmin) && "hidden")}
            />
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
