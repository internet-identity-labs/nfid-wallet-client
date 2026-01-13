import clsx from "clsx"
import React from "react"

import { TableCell, TableRow } from "@nfid/ui"

export interface VaultsPoliciesTableRowProps {
  id: bigint
  number: number
  source: string
  greaterThan: string
  approvers: string
  isArchived?: boolean
}

export const VaultsPoliciesTableRow: React.FC<VaultsPoliciesTableRowProps> = ({
  number,
  source,
  greaterThan,
  approvers,
  isArchived,
}: VaultsPoliciesTableRowProps) => {
  return (
    <TableRow
      className={clsx(isArchived && "text-secondary pointer-events-none")}
      id={`policy_row`}
    >
      <TableCell isLeft>{number}</TableCell>
      <TableCell>{source}</TableCell>
      <TableCell>{greaterThan}</TableCell>
      <TableCell centered>{approvers}</TableCell>
    </TableRow>
  )
}
