import React, { useCallback, useMemo, useState } from "react"

import { Policy } from "@nfid/integration"
import { EmptyCard, IconCmpPolicy } from "@nfid/ui"

import { VaultActionBar } from "../../action-bar"
import { useVault } from "../../hooks/use-vault"
import { useVaultPolicies } from "../../hooks/use-vault-policies"

import { VaultsPoliciesTable } from "./table"

interface VaultsPoliciesPageProps {}

export const VaultsPoliciesPage: React.FC<VaultsPoliciesPageProps> = () => {
  const [searchFilter, setSearchFilter] = useState("")
  const { policies, isFetching } = useVaultPolicies()
  const { vault } = useVault()

  React.useEffect(() => {
    if (vault && policies) {
      console.debug("VaultsPoliciesPage", { vault, policies, isFetching })
    }
  }, [isFetching, policies, vault])

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
      <VaultActionBar onInputChange={onFilterChange} />
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
