import React, { useCallback, useMemo, useState } from "react"

import { EmptyCard, IconCmpWallet } from "@nfid-frontend/ui"
import { Wallet, vaultsTracking } from "@nfid/integration"
import { E8S } from "@nfid/integration/token/constants"

import { VaultActionBar } from "../../action-bar"
import { useVault } from "../../hooks/use-vault"
import { useVaultWallets } from "../../hooks/use-vault-wallets"
import { VaultAddWallet } from "./modal-add-wallet"
import { VaultsWalletsTable } from "./table"

interface VaultsWalletsPageProps {}

export const VaultsWalletsPage: React.FC<VaultsWalletsPageProps> = () => {
  const [searchFilter, setSearchFilter] = useState("")
  const { vaultId, wallets, isFetching } = useVaultWallets()
  const { isAdmin } = useVault()

  React.useEffect(() => {
    if (!isFetching && vaultId && wallets) {
      console.debug("VaultsWalletsPage", { wallets, isFetching })

      const totalICPBalance = wallets.reduce(
        (acc, { balance }) => acc + (balance ? balance.ICP : BigInt(0)),
        BigInt(0),
      )

      vaultsTracking.walletsLoaded({
        vaultId,
        totalAccounts: wallets.length,
        totalICPBalance: Number(totalICPBalance / BigInt(E8S)),
      })
    }
  }, [wallets, isFetching, vaultId])

  const filteredWallets: Wallet[] = useMemo(() => {
    if (!wallets) return []

    return wallets
      .filter((wallet) => wallet.name?.includes(searchFilter))
      .sort((a, b) => a.state.localeCompare(b.state))
  }, [searchFilter, wallets])

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
        actionButtons={isAdmin ? <VaultAddWallet /> : <div />}
      />
      <div className="w-full px-5 overflow-x-auto">
        <VaultsWalletsTable wallets={filteredWallets} />
        {!filteredWallets.length && !isFetching && (
          <EmptyCard
            className="h-64"
            icon={<IconCmpWallet />}
            description="Each vault can have as many wallets as you’d like, each with its own transfer policy permissions."
          />
        )}
      </div>
    </div>
  )
}
