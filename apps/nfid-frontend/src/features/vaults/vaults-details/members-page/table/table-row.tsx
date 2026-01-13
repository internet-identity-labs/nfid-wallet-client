import clsx from "clsx"
import React from "react"

import { TableCell, TableRow, CenterEllipsis } from "@nfid/ui"

export interface VaultsMembersTableRowProps {
  name: string
  address: string
  role: string
  index: number
  isArchived: boolean
}

export const VaultsMembersTableRow: React.FC<VaultsMembersTableRowProps> = ({
  name,
  address,
  role,
  index,
  isArchived,
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
    </TableRow>
  )
}
