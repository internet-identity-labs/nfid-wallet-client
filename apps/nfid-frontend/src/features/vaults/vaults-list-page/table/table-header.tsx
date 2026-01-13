import { TableCell, TableRow } from "@nfid/ui"

export const VaultsTableHeader = () => {
  return (
    <TableRow header>
      <TableCell isLeft className="w-auto">
        Name
      </TableCell>
      <TableCell centered className="w-32">
        Wallets
      </TableCell>
      <TableCell centered className="w-32">
        Members
      </TableCell>
      <TableCell className="w-56">Last activity</TableCell>
      <TableCell isRight className="w-10" />
    </TableRow>
  )
}
