import { TableCell, TableRow } from "@nfid-frontend/ui"

export const VaultsWalletsTableHeader = () => {
  return (
    <TableRow className="font-bold border-black">
      <TableCell isLeft className="w-2">
        #
      </TableCell>
      <TableCell className="w-auto">Name</TableCell>
      <TableCell className="w-44">Token balance</TableCell>
      <TableCell className="w-44">USD balance</TableCell>
      <TableCell isRight className="w-10" />
    </TableRow>
  )
}
