import React from "react"
import { Route, Outlet } from "react-router-dom"

import {
  KnowledgeIcon,
  SecurityIcon,
  VaultsIcon,
  WalletIcon,
} from "@nfid-frontend/ui"

import { AuthWrapper } from "frontend/ui/pages/auth-wrapper"
import { VaultGuard } from "frontend/ui/pages/vault-guard"

const ProfileAssets = React.lazy(() => import("./assets"))
const ProfileSecurity = React.lazy(() => import("../../../features/security"))
const CopyRecoveryPhrase = React.lazy(() => import("./copy-recovery-phrase"))
const ActivityPage = React.lazy(() => import("../../../features/activity"))
const ProfileNFTDetails = React.lazy(() => import("./nft-details"))
const VaultsListPage = React.lazy(
  () => import("frontend/features/vaults/vaults-list-page"),
)
const VaultsDetailsCoordinator = React.lazy(
  () => import("frontend/features/vaults/vaults-details"),
)
const VaultTransactionsDetailsPage = React.lazy(
  () =>
    import("frontend/features/vaults/vaults-details/transactions-details-page"),
)
const ProfileCollectiblesPage = React.lazy(
  () => import("../../../features/collectibles"),
)

export const ProfileConstants = {
  base: "/wallet",
  nftDetails: ":tokenId",
  tokens: "tokens",
  nfts: "nfts",
  activity: "activity",
  security: "/security",
  transactions: "/transactions",
  copyRecoveryPhrase: "copy-recovery-phrase",
  addPhoneNumber: "add-phone-number",
  verifySMS: "verify-sms",
  vaults: "vaults",
  vault: ":vaultId",
  vaultTransaction: ":transactionId",
}

export const navigationPopupLinks = [
  {
    icon: VaultsIcon,
    title: "Vaults",
    link: `${ProfileConstants.base}/${ProfileConstants.vaults}`,
    id: "nav-vaults",
    separator: true,
  },
  {
    icon: WalletIcon,
    title: "Wallet",
    link: `${ProfileConstants.base}/${ProfileConstants.tokens}`,
    id: "nav-assets",
    separator: true,
  },
  {
    icon: SecurityIcon,
    title: "Security",
    link: `${ProfileConstants.base}/${ProfileConstants.security}`,
    id: "nav-security",
  },
  {
    icon: KnowledgeIcon,
    title: "Knowledge base",
    link: `https://learn.nfid.one/`,
    id: "nav-knowledge-base",
    separator: true,
  },
]
