import { TableCell, TableRow } from "@nfid/ui"

export const VaultsTransactionsTableHeader = () => {
  return (
    <TableRow header>
      <TableCell isLeft className="w-2">
        #
      </TableCell>
      <TableCell className="w-auto">Initiated</TableCell>
      <TableCell className="w-32">From</TableCell>
      <TableCell className="w-32">To</TableCell>
      <TableCell className="w-36">Tokens</TableCell>
      <TableCell className="w-36">Status</TableCell>
      <TableCell isRight className="w-10" />
    </TableRow>
  )
}
