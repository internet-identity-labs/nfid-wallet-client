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
const ProfileTransactions = React.lazy(() => import("./transactions"))
const ProfileCredentials = React.lazy(() => import("./credentials"))
const ProfileSecurity = React.lazy(() => import("./security"))
const ProfileApplications = React.lazy(() => import("./applications"))
const CopyRecoveryPhrase = React.lazy(() => import("./copy-recovery-phrase"))
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
  wallet: ":token/wallet",
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
          <React.Suspense fallback={<div>Loading...</div>}>
            <ProfileAssets />
          </React.Suspense>
        </AuthWrapper>
      }
    />
    <Route
      path={ProfileConstants.collectibles}
      element={
        <AuthWrapper>
          <React.Suspense fallback={<div>Loading...</div>}>
            <ProfileCollectiblesPage />
          </React.Suspense>
        </AuthWrapper>
      }
    />
    <Route
      path={ProfileConstants.wallet}
      element={
        <AuthWrapper>
          <React.Suspense fallback={<div>Loading...</div>}>
            <ProfileTokenWalletsDetailPage />
          </React.Suspense>
        </AuthWrapper>
      }
    />
    <Route
      path={ProfileConstants.transactions}
      element={
        <AuthWrapper>
          <React.Suspense fallback={<div>Loading...</div>}>
            <ProfileTransactions />
          </React.Suspense>
        </AuthWrapper>
      }
    />
    <Route
      path={ProfileConstants.credentials}
      element={
        <AuthWrapper>
          <React.Suspense fallback={<div>Loading...</div>}>
            <ProfileCredentials />
          </React.Suspense>
        </AuthWrapper>
      }
    />
    <Route
      path={ProfileConstants.security}
      element={
        <AuthWrapper>
          <React.Suspense fallback={<div>Loading...</div>}>
            <ProfileSecurity />
          </React.Suspense>
        </AuthWrapper>
      }
    />
    <Route
      path={ProfileConstants.applications}
      element={
        <AuthWrapper>
          <React.Suspense fallback={<div>Loading...</div>}>
            <ProfileApplications />
          </React.Suspense>
        </AuthWrapper>
      }
    />
    <Route
      path={ProfileConstants.copyRecoveryPhrase}
      element={
        <AuthWrapper>
          <React.Suspense fallback={<div>Loading...</div>}>
            <CopyRecoveryPhrase />
          </React.Suspense>
        </AuthWrapper>
      }
    />
    <Route
      path={`${ProfileConstants.credentials}/${ProfileConstants.addPhoneNumber}`}
      element={
        <AuthWrapper>
          <React.Suspense fallback={<div>Loading...</div>}>
            <ProfilePhone />
          </React.Suspense>
        </AuthWrapper>
      }
    />
    <Route
      path={`${ProfileConstants.credentials}/${ProfileConstants.verifySMS}`}
      element={
        <AuthWrapper>
          <React.Suspense fallback={<div>Loading...</div>}>
            <ProfileSMS />
          </React.Suspense>
        </AuthWrapper>
      }
    />
    <Route
      path={`${ProfileConstants.assets}/${ProfileConstants.nftDetails}`}
      element={
        <AuthWrapper>
          <React.Suspense fallback={<div>Loading...</div>}>
            <ProfileNFTDetails />
          </React.Suspense>
        </AuthWrapper>
      }
    />
    <Route
      path={`${ProfileConstants.vaults}`}
      element={
        <AuthWrapper>
          <React.Suspense fallback={<div>Loading...</div>}>
            <VaultsListPage />
          </React.Suspense>
        </AuthWrapper>
      }
    />
    <Route
      path={`${ProfileConstants.vaults}/${ProfileConstants.vault}`}
      element={
        <AuthWrapper>
          <React.Suspense fallback={<div>Loading...</div>}>
            <VaultsDetailsCoordinator />
          </React.Suspense>
        </AuthWrapper>
      }
    />
    <Route
      path={`${ProfileConstants.vaults}/transactions/${ProfileConstants.vaultTransaction}`}
      element={
        <AuthWrapper>
          <React.Suspense fallback={<div>Loading...</div>}>
            <VaultTransactionsDetailsPage />
          </React.Suspense>
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
