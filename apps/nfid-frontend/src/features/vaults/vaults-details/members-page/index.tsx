import React, { useCallback, useMemo, useState } from "react"

import { EmptyCard, IconCmpMembers } from "@nfid-frontend/ui"
import { VaultMember } from "@nfid/integration"

import { VaultActionBar } from "../../action-bar"
import { useVault } from "../../hooks/use-vault"
import { VaultAddMember } from "./modal-add-member"
import { VaultsMembersTable } from "./table"

interface VaultsMembersPageProps {}

export const VaultsMembersPage: React.FC<VaultsMembersPageProps> = () => {
  const [searchFilter, setSearchFilter] = useState("")
  const { vault, isFetching } = useVault()

  const filteredMembers: VaultMember[] = useMemo(() => {
    if (!vault?.members) return []

    return vault?.members
      .filter((member) => !member.name || member.name?.includes(searchFilter))
      .sort((a, b) => a.state.localeCompare(b.state))
      .sort((a, b) => a.role.localeCompare(b.role))
  }, [searchFilter, vault?.members])

  const onFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchFilter(e.target.value)
    },
    [],
  )

  return (
    <div className="border border-gray-200 rounded-xl mt-[30px]">
      <VaultActionBar
        onInputChange={onFilterChange}
        actionButtons={<VaultAddMember />}
      />
      <div className="w-full px-5 overflow-x-auto">
        <VaultsMembersTable members={filteredMembers} />
        {!filteredMembers.length && !isFetching && (
          <EmptyCard
            className="h-64"
            icon={<IconCmpMembers />}
            description="Add and manage team member permissions and roles."
          />
        )}
      </div>
    </div>
  )
}
