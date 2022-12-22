import React from "react"

import { Tabs } from "@nfid-frontend/ui"

import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import { useVault } from "../hooks/use-vault"
import { tabs } from "./tabs"

interface VaultsDetailsCoordinatorProps {}

export const VaultsDetailsCoordinator: React.FC<
  VaultsDetailsCoordinatorProps
> = () => {
  const { vault, isFetching } = useVault()

  return (
    <ProfileTemplate
      pageTitle={vault?.name}
      isLoading={isFetching}
      showBackButton
    >
      <p className="mb-5 text-sm">{vault?.description}</p>
      <Tabs tabs={tabs} defaultValue="wallets" />
    </ProfileTemplate>
  )
}
