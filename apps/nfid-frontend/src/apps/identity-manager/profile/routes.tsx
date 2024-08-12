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
const ProfileCollectiblesPage = React.lazy(() => import("./collectibles"))

export const ProfileConstants = {
  base: "/profile",
  nftDetails: ":tokenId",
  assets: "assets",
  collectibles: "collectibles",
  security: "security",
  transactions: "transactions",
  copyRecoveryPhrase: "copy-recovery-phrase",
  addPhoneNumber: "add-phone-number",
  verifySMS: "verify-sms",
  vaults: "vaults",
  vault: ":vaultId",
  vaultTransaction: ":transactionId",
}

export const ProfileRoutes = (
  <Route path={ProfileConstants.base} element={<Outlet />}>
    <Route
      path={ProfileConstants.assets}
      element={
        <AuthWrapper>
          <ProfileAssets />
        </AuthWrapper>
      }
    />
    <Route
      path={ProfileConstants.collectibles}
      element={
        <AuthWrapper>
          <ProfileCollectiblesPage />
        </AuthWrapper>
      }
    />
    <Route
      path={ProfileConstants.transactions}
      element={
        <AuthWrapper>
          <ActivityPage />
        </AuthWrapper>
      }
    />
    <Route
      path={ProfileConstants.security}
      element={
        <AuthWrapper>
          <ProfileSecurity />
        </AuthWrapper>
      }
    />
    <Route
      path={ProfileConstants.copyRecoveryPhrase}
      element={
        <AuthWrapper>
          <CopyRecoveryPhrase />
        </AuthWrapper>
      }
    />
    <Route
      path={`${ProfileConstants.collectibles}/${ProfileConstants.nftDetails}`}
      element={
        <AuthWrapper>
          <ProfileNFTDetails />
        </AuthWrapper>
      }
    />
    <Route
      path={`${ProfileConstants.vaults}`}
      element={
        <AuthWrapper>
          <VaultGuard>
            <VaultsListPage />
          </VaultGuard>
        </AuthWrapper>
      }
    />
    <Route
      path={`${ProfileConstants.vaults}/${ProfileConstants.vault}`}
      element={
        <AuthWrapper>
          <VaultsDetailsCoordinator />
        </AuthWrapper>
      }
    />
    <Route
      path={`${ProfileConstants.vaults}/transactions/${ProfileConstants.vaultTransaction}`}
      element={
        <AuthWrapper>
          <VaultTransactionsDetailsPage />
        </AuthWrapper>
      }
    />
  </Route>
)

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
    link: `${ProfileConstants.base}/${ProfileConstants.assets}`,
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
