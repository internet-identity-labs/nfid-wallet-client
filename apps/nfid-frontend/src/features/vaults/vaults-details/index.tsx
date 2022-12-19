import React from "react"

import { ITab, Tabs } from "@nfid-frontend/ui"

import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

import { useVault } from "../hooks/use-vault"
import { VaultsMembersPage } from "./members-page"

interface VaultsDetailsCoordinatorProps {}

export const VaultsDetailsCoordinator: React.FC<
  VaultsDetailsCoordinatorProps
> = () => {
  const { vault, isFetching } = useVault()

  const tabs: ITab[] = [
    {
      label: "Wallets",
      content: <div>wallets</div>,
      value: "wallets",
    },
    {
      label: "Members",
      content: <VaultsMembersPage />,
      value: "members",
    },
    {
      label: "Policies",
      content: <div>policies</div>,
      value: "policies",
    },
    {
      label: "Transactions",
      content: <div>transactions</div>,
      value: "transactions",
    },
  ]

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
