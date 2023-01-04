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

export interface VaultsPoliciesTableRowProps {
  id: bigint
  number: number
  source: string
  greaterThan: string
  approvers: string
  onArchive?: () => void
  onEdit?: () => void
  isArchived?: boolean
}

export const VaultsPoliciesTableRow: React.FC<VaultsPoliciesTableRowProps> = ({
  number,
  source,
  greaterThan,
  approvers,
  onArchive,
  onEdit,
  isArchived,
}: VaultsPoliciesTableRowProps) => {
  return (
    <TableRow
      className={clsx(isArchived && "text-gray-400 pointer-events-none")}
    >
      <TableCell isLeft>{number}</TableCell>
      <TableCell>{source}</TableCell>
      <TableCell>{greaterThan}</TableCell>
      <TableCell centered>{approvers}</TableCell>
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
