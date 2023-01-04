import React, { useCallback, useMemo, useState } from "react"

import { Table } from "@nfid-frontend/ui"
import { ObjectState, VaultMember } from "@nfid/integration"

import { VaultArchiveMember } from "../modal-archive-member"
import { VaultEditMember } from "../modal-edit-member"
import { VaultsMembersTableHeader } from "./table-header"
import { VaultsMembersTableRow, VaultsMembersTableRowProps } from "./table-row"

export interface VaultsMembersTableProps {
  members: VaultMember[]
}

export const VaultsMembersTable: React.FC<VaultsMembersTableProps> = ({
  members,
}) => {
  const [isEditModal, setIsEditModal] = useState(false)
  const [isArchiveModal, setIsArchiveModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<VaultMember>()

  const membersRows: VaultsMembersTableRowProps[] = useMemo(() => {
    return members.map((member, index) => ({
      name: member.name ?? "Unknown user",
      address: member.userId,
      role: member.role,
      index: index + 1,
      isArchived: member.state === ObjectState.ARCHIVED,
    }))
  }, [members])

  const onModalOpen = useCallback(
    (type: "edit" | "archive", memberId: string) => {
      const member = members.find((member) => member.userId === memberId)
      setSelectedMember(member)

      if (type === "edit") setIsEditModal(true)
      if (type === "archive") setIsArchiveModal(true)
    },
    [members],
  )

  return (
    <>
      <Table tableHeader={<VaultsMembersTableHeader />}>
        {membersRows.map((member) => (
          <VaultsMembersTableRow
            {...member}
            key={`vault_${member.address}`}
            onEdit={() => onModalOpen("edit", member.address)}
            onArchive={() => onModalOpen("archive", member.address)}
          />
        ))}
      </Table>
      <VaultEditMember
        isModalOpen={isEditModal}
        setIsModalOpen={setIsEditModal}
        selectedMember={selectedMember}
      />
      <VaultArchiveMember
        selectedMember={selectedMember}
        isModalOpen={isArchiveModal}
        setIsModalOpen={setIsArchiveModal}
      />
    </>
  )
}
