import React, { useMemo } from "react"

import { Table } from "@nfid-frontend/ui"
import { ObjectState, VaultMember } from "@nfid/integration"

import { useVault } from "frontend/features/vaults/hooks/use-vault"

import { VaultsMembersTableHeader } from "./table-header"
import { VaultsMembersTableRow, VaultsMembersTableRowProps } from "./table-row"

export interface VaultsMembersTableProps {
  members: VaultMember[]
}

export const VaultsMembersTable: React.FC<VaultsMembersTableProps> = ({
  members,
}) => {
  const { isAdmin } = useVault()

  const membersRows: VaultsMembersTableRowProps[] = useMemo(() => {
    return members.map((member, index) => ({
      name: member.name ?? "Unknown user",
      address: member.userId,
      role: member.role,
      index: index + 1,
      isArchived: member.state === ObjectState.ARCHIVED,
      isAdmin: isAdmin,
    }))
  }, [isAdmin, members])

  return (
    <>
      <Table tableHeader={<VaultsMembersTableHeader />}>
        {membersRows.map((member) => (
          <VaultsMembersTableRow {...member} key={`vault_${member.address}`} />
        ))}
      </Table>
    </>
  )
}
