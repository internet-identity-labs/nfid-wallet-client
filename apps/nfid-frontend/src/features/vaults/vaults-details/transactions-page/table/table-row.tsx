import React from "react"

import { IconCmpArrowRight, TableCell, TableRow } from "@nfid-frontend/ui"
import { TransactionState } from "@nfid/integration"

export interface VaultsTransactionsTableRowProps {
  id: bigint
  number: number
  initiatorName: string
  from: string
  to: string
  token?: any
  status?: TransactionState
}

export const VaultsTransactionsTableRow: React.FC<
  VaultsTransactionsTableRowProps
> = ({
  number,
  initiatorName,
  from,
  to,
  token,
  status,
}: VaultsTransactionsTableRowProps) => {
  return (
    <TableRow>
      <TableCell isLeft>{number}</TableCell>
      <TableCell>{initiatorName}</TableCell>
      <TableCell>{from}</TableCell>
      <TableCell>{to}</TableCell>
      <TableCell></TableCell>
      <TableCell>{status}</TableCell>
      <TableCell isRight>
        <IconCmpArrowRight className="ml-auto text-gray-400" />
      </TableCell>
    </TableRow>
  )
}
