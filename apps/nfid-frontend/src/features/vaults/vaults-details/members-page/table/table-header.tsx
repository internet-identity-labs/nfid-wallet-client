import { TableCell, TableRow } from "@nfid/ui"

export const VaultsMembersTableHeader = () => {
  return (
    <TableRow header>
      <TableCell isLeft className="w-10">
        #
      </TableCell>
      <TableCell isLeft className="w-auto">
        Name
      </TableCell>
      <TableCell centered className="w-32">
        NFID address
      </TableCell>
      <TableCell centered className="w-32">
        Role
      </TableCell>
    </TableRow>
  )
}
