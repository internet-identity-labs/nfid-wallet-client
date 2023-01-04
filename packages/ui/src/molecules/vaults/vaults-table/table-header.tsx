import { TableCell, TableRow } from "@nfid-frontend/ui"

export const VaultsTableHeader = () => {
  return (
    <TableRow className="font-bold border-black">
      <TableCell isLeft className="w-auto">
        Name
      </TableCell>
      <TableCell centered>Wallets</TableCell>
      <TableCell centered>Members</TableCell>
      <TableCell className="w-52">Last activity</TableCell>
      <TableCell isRight />
    </TableRow>
  )
}
