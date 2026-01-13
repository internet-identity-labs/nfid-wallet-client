import React from "react"

import { Tabs } from "@nfid/ui"
import ProfileTemplate from "@nfid/ui/templates/profile-template/Template"

import { NFIDTheme } from "frontend/App"

import { useVault } from "../hooks/use-vault"

import { tabs } from "./tabs"

interface VaultsDetailsCoordinatorProps {
  walletTheme: NFIDTheme
  setWalletTheme: (theme: NFIDTheme) => void
}

export const VaultsDetailsCoordinator: React.FC<
  VaultsDetailsCoordinatorProps
> = ({ walletTheme, setWalletTheme }) => {
  const { vault, isFetching } = useVault()

  return (
    <ProfileTemplate
      pageTitle={vault?.name}
      isLoading={isFetching}
      showBackButton
      walletTheme={walletTheme}
      setWalletTheme={setWalletTheme}
    >
      <p className="mb-5 text-sm">{vault?.description}</p>
      <Tabs tabs={tabs} defaultValue="wallets" />
    </ProfileTemplate>
  )
}

export default VaultsDetailsCoordinator
