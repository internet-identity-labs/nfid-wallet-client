import React, { useCallback, useMemo, useState } from "react"

import { EmptyCard, IconCmpPolicy } from "@nfid-frontend/ui"
import { Policy } from "@nfid/integration"

import { VaultActionBar } from "../../action-bar"
import { useVaultPolicies } from "../../hooks/use-vault-policies"
import { VaultPolicyInfoTooltip } from "./info-tooltip"
import { VaultAddPolicy } from "./modal-add-policy"
import { VaultsPoliciesTable } from "./table"

interface VaultsPoliciesPageProps {}

export const VaultsPoliciesPage: React.FC<VaultsPoliciesPageProps> = () => {
  const [searchFilter, setSearchFilter] = useState("")
  const { policies, isFetching } = useVaultPolicies()

  const filteredPolicies: Policy[] = useMemo(() => {
    if (!policies) return []

    return policies
      .filter((policies) => policies?.walletName?.includes(searchFilter))
      .sort((a, b) => Number(a.createdDate) - Number(b.createdDate))
  }, [policies, searchFilter])

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
        actionButtons={
          <div className="flex space-x-5">
            <VaultAddPolicy />
            <VaultPolicyInfoTooltip />
          </div>
        }
      />
      <div className="w-full px-5 overflow-x-auto">
        <VaultsPoliciesTable policies={filteredPolicies} />
        {!filteredPolicies.length && !isFetching && (
          <EmptyCard
            className="h-64"
            icon={<IconCmpPolicy />}
            description="Manage the policies for wallets in your vault."
          />
        )}
      </div>
    </div>
  )
}
