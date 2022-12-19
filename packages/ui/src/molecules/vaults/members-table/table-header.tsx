import { TableCell, TableRow } from "@nfid-frontend/ui"

export const VaultsMembersTableHeader = () => {
  return (
    <TableRow className="font-bold border-black">
      <TableCell isLeft className="w-2">
        #
      </TableCell>
      <TableCell className="w-auto">Name</TableCell>
      <TableCell className="w-56">NFID address</TableCell>
      <TableCell className="w-40">Role</TableCell>
      <TableCell isRight className="w-10" />
    </TableRow>
  )
}
