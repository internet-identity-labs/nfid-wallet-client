import React from "react"
import { Route, Outlet } from "react-router-dom"

import ApplicationsIcon from "frontend/ui/organisms/profile-sidebar/assets/applications.svg"
import AssetsIcon from "frontend/ui/organisms/profile-sidebar/assets/assets.svg"
import CollectiblesIcon from "frontend/ui/organisms/profile-sidebar/assets/collectibles.svg"
import CredentialsIcon from "frontend/ui/organisms/profile-sidebar/assets/credentials.svg"
import SecurityIcon from "frontend/ui/organisms/profile-sidebar/assets/security.svg"
import VaultsIcon from "frontend/ui/organisms/profile-sidebar/assets/vault.svg"
import { AuthWrapper } from "frontend/ui/pages/auth-wrapper"

const ProfileTokenWalletsDetailPage = React.lazy(
  () => import("./internet-computer-wallets"),
)
const ProfileAssets = React.lazy(() => import("./assets"))
const ProfileCredentials = React.lazy(() => import("./credentials"))
const ProfileSecurity = React.lazy(() => import("../../../features/security"))
const ProfileApplications = React.lazy(() => import("./applications"))
const CopyRecoveryPhrase = React.lazy(() => import("./copy-recovery-phrase"))
const ProfileTransactions = React.lazy(() => import("./transactions"))
const ProfilePhone = React.lazy(() => import("./credentials/phone-number"))
const ProfileSMS = React.lazy(() => import("./credentials/phone-sms"))
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
  wallet: ":token/wallet/:chain",
  security: "security",
  credentials: "credentials",
  transactions: "transactions",
  applications: "applications",
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
      path={ProfileConstants.wallet}
      element={
        <AuthWrapper>
          <ProfileTokenWalletsDetailPage />
        </AuthWrapper>
      }
    />
    <Route
      path={ProfileConstants.transactions}
      element={
        <AuthWrapper>
          <ProfileTransactions />
        </AuthWrapper>
      }
    />
    <Route
      path={ProfileConstants.credentials}
      element={
        <AuthWrapper>
          <ProfileCredentials />
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
      path={ProfileConstants.applications}
      element={
        <AuthWrapper>
          <ProfileApplications />
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
      path={`${ProfileConstants.credentials}/${ProfileConstants.addPhoneNumber}`}
      element={
        <AuthWrapper>
          <ProfilePhone />
        </AuthWrapper>
      }
    />
    <Route
      path={`${ProfileConstants.credentials}/${ProfileConstants.verifySMS}`}
      element={
        <AuthWrapper>
          <ProfileSMS />
        </AuthWrapper>
      }
    />
    <Route
      path={`${ProfileConstants.assets}/${ProfileConstants.nftDetails}`}
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
          <VaultsListPage />
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

export const profileSidebarItems = [
  {
    icon: AssetsIcon,
    title: "Assets",
    link: `${ProfileConstants.base}/${ProfileConstants.assets}`,
    id: "profile-assets",
  },
  {
    icon: CollectiblesIcon,
    title: "Collectibles",
    link: `${ProfileConstants.base}/${ProfileConstants.collectibles}`,
    id: "profile-collectibles",
  },
  {
    icon: VaultsIcon,
    title: "Vaults",
    link: `${ProfileConstants.base}/${ProfileConstants.vaults}`,
    id: "profile-vaults",
  },
  {
    icon: ApplicationsIcon,
    title: "Applications",
    link: `${ProfileConstants.base}/${ProfileConstants.applications}`,
    id: "profile-applications",
  },
  {
    icon: CredentialsIcon,
    title: "Credentials",
    link: `${ProfileConstants.base}/${ProfileConstants.credentials}`,
    id: "profile-credentials",
  },
  {
    icon: SecurityIcon,
    title: "Security",
    link: `${ProfileConstants.base}/${ProfileConstants.security}`,
    id: "profile-security",
  },
]
