import React from "react"
import { Route, Outlet } from "react-router-dom"

import AssetsIcon from "frontend/ui/organisms/profile-sidebar/assets/assets.svg"
import CollectiblesIcon from "frontend/ui/organisms/profile-sidebar/assets/collectibles.svg"
import SecurityIcon from "frontend/ui/organisms/profile-sidebar/assets/security.svg"
import VaultsIcon from "frontend/ui/organisms/profile-sidebar/assets/vault.svg"
import { AuthWrapper } from "frontend/ui/pages/auth-wrapper"
import Profile from "frontend/ui/pages/new-profile/profile"
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
  nftDetails: ":tokenId",
  tokens: "/tokens",
  nfts: "/nfts",
  activity: "/activity",
  security: "/security",
  transactions: "/transactions",
  copyRecoveryPhrase: "copy-recovery-phrase",
  addPhoneNumber: "add-phone-number",
  verifySMS: "verify-sms",
  vaults: "vaults",
  vault: ":vaultId",
  vaultTransaction: ":transactionId",
}

export const ProfileRoutes = (
  // <Route path={ProfileConstants.tokens} element={<Outlet />}>
  <>
    <Route
      path={ProfileConstants.tokens}
      element={
        <AuthWrapper>
          <Profile />
          {/* <Profile tab="tokens" /> */}
        </AuthWrapper>
      }
    />
    <Route
      path={ProfileConstants.nfts}
      element={
        <AuthWrapper>
          <Profile />
          {/* <Profile tab="nfts" /> */}
        </AuthWrapper>
      }
    />
    <Route
      path={ProfileConstants.activity}
      element={
        <AuthWrapper>
          <Profile />
          {/* <Profile tab="activity" /> */}
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
      path={`${ProfileConstants.nfts}/${ProfileConstants.nftDetails}`}
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
  </>
)

export const profileSidebarItems = [
  {
    icon: AssetsIcon,
    title: "Assets",
    link: ProfileConstants.tokens,
    id: "profile-assets",
  },
  {
    icon: CollectiblesIcon,
    title: "Collectibles",
    link: ProfileConstants.nfts,
    id: "profile-collectibles",
  },
  {
    icon: VaultsIcon,
    title: "Vaults",
    link: ProfileConstants.vaults,
    id: "profile-vaults",
  },
  {
    icon: SecurityIcon,
    title: "Security",
    link: ProfileConstants.security,
    id: "profile-security",
  },
]
