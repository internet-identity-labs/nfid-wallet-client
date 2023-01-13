import React, { useCallback, useMemo, useState } from "react"
import useSWR from "swr"

import { EmptyCard, IconCmpVault, Loader } from "@nfid-frontend/ui"
import { getVaults } from "@nfid/integration"

import { useWalletDelegation } from "frontend/integration/wallet/hooks/use-wallet-delegation"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import { VaultActionBar } from "../action-bar"
import { useVaultMember } from "../hooks/use-vault-member"
import { VaultAddressBar } from "./address-bar"
import { VaultModalCreate } from "./modal-add-vault"
import { VaultsTable } from "./table"

export interface VaultsListPageProps {}

export const VaultsListPage: React.FC<VaultsListPageProps> = () => {
  const [searchFilter, setSearchFilter] = useState("")
  const { isReady, anchor } = useVaultMember()
  // NOTE: I've left this call there - to always have root identity in vault actor
  // I'll take a look for more flexible solution after vaults release
  // It's not causing any issues with re-renders, etc. now.
  useWalletDelegation(anchor)

  const {
    data: vaults,
    mutate,
    isLoading,
    isValidating,
  } = useSWR([isReady ? "vaults" : null], getVaults)

  const filteredVaults = useMemo(() => {
    if (!vaults) return []
    return vaults.filter((vault) => vault.name.includes(searchFilter))
  }, [searchFilter, vaults])

  const onFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchFilter(e.target.value)
    },
    [],
  )

  return (
    <ProfileTemplate pageTitle="Vaults" isLoading={!isReady}>
      <VaultAddressBar />
      <div className="border border-gray-200 rounded-xl mt-[30px]">
        <VaultActionBar
          onInputChange={onFilterChange}
          actionButtons={<VaultModalCreate refetchVaults={() => mutate()} />}
        />
        <div className="w-full px-5 overflow-x-auto">
          <VaultsTable vaults={filteredVaults} />
          {!filteredVaults.length && !isLoading && !isValidating && (
            <EmptyCard
              className="h-64"
              icon={<IconCmpVault />}
              description="Create flexible policies and multi-approver workflows to ensure control over transactions and transfers."
            />
          )}
          <Loader
            isLoading={isLoading || isValidating}
            fullscreen={false}
            imageClasses="w-16 mx-auto my-4"
          />
        </div>
      </div>
    </ProfileTemplate>
  )
}
