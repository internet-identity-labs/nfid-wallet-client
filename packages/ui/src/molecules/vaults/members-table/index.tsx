import React, { useMemo } from "react"

import Table from "../../table"
import { VaultsMembersTableHeader } from "./table-header"
import { VaultsMembersTableRow, VaultsMembersTableRowProps } from "./table-row"

export interface VaultsMembersTableProps {
  members: any[]
}

export const VaultsMembersTable: React.FC<VaultsMembersTableProps> = ({
  members,
}) => {
  const membersToRows = useMemo(() => {
    return members.map(
      (member, index) =>
        ({
          id: member.id,
          number: index,
          name: member.name,
          address: member.address,
          role: member.role,
        } as VaultsMembersTableRowProps),
    )
  }, [members])

  return (
    <Table tableHeader={<VaultsMembersTableHeader />}>
      {membersToRows.map((member) => (
        <VaultsMembersTableRow {...member} key={`vault_${member.id}`} />
      ))}
    </Table>
  )
}
