import { TableCell, TableRow } from "@nfid/ui"

export const VaultsPoliciesTableHeader = () => {
  return (
    <TableRow header>
      <TableCell isLeft className="w-2">
        #
      </TableCell>
      <TableCell className="w-auto">Source</TableCell>
      <TableCell className="w-44">Greater than</TableCell>
      <TableCell centered className="w-44">
        Approvers
      </TableCell>
    </TableRow>
  )
}
