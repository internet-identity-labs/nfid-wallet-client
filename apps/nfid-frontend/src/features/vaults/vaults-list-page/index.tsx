import React, { useCallback, useMemo, useState } from "react"

import { EmptyCard, IconCmpVault, Loader } from "@nfid-frontend/ui"
import { useSWR } from "@nfid/swr"

import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import { VaultActionBar } from "../action-bar"
import { getAllVaults } from "../services"
import { VaultAddressBar } from "./address-bar"
import { VaultsTable } from "./table"

export interface VaultsListPageProps {}

export const VaultsListPage: React.FC<VaultsListPageProps> = () => {
  const [searchFilter, setSearchFilter] = useState("")

  const {
    data: vaults,
    isLoading,
    isValidating,
  } = useSWR(["vaults"], getAllVaults)

  const filteredVaults = useMemo(() => {
    if (!vaults) return []
    return vaults.filter((vault) => vault.name.includes(searchFilter))
  }, [searchFilter, vaults])

  React.useEffect(() => {
    if (!isLoading) {
      console.debug("VaultsListPage", { vaults, isLoading })
    }
  }, [vaults, isLoading])

  const onFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchFilter(e.target.value)
    },
    [],
  )

  return (
    <ProfileTemplate pageTitle="Vaults">
      <VaultAddressBar />
      <div className="border border-gray-200 rounded-xl mt-[30px]">
        <VaultActionBar onInputChange={onFilterChange} />
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
export default VaultsListPage
