import React from "react"
import { Route, Outlet } from "react-router-dom"

import { ProfileVaultsPage } from "frontend/features/vaults"
import ApplicationsIcon from "frontend/ui/organisms/profile-sidebar/assets/applications.svg"
import AssetsIcon from "frontend/ui/organisms/profile-sidebar/assets/assets.svg"
import CredentialsIcon from "frontend/ui/organisms/profile-sidebar/assets/credentials.svg"
import SecurityIcon from "frontend/ui/organisms/profile-sidebar/assets/security.svg"
import VaultsIcon from "frontend/ui/organisms/profile-sidebar/assets/vault.svg"
import { AuthWrapper } from "frontend/ui/pages/auth-wrapper"

import ProfileApplications from "./applications"
import ProfileAssets from "./assets"
import CopyRecoveryPhrase from "./copy-recovery-phrase"
import ProfileCredentials from "./credentials"
import ProfilePhone from "./credentials/phone-number"
import ProfileSMS from "./credentials/phone-sms"
import ProfileInternetComputerWallets from "./internet-computer-wallets"
import ProfileNFTDetails from "./nft-details"
import ProfileNFTs from "./nfts"
import ProfileSecurity from "./security"
import ProfileTransactions from "./transactions"

export const ProfileConstants = {
  base: "/profile",
  nftDetails: ":tokenId",
  assets: "assets",
  wallet: ":token/wallet",
  nfts: "nfts",
  security: "security",
  credentials: "credentials",
  transactions: "transactions",
  applications: "applications",
  copyRecoveryPhrase: "copy-recovery-phrase",
  addPhoneNumber: "add-phone-number",
  verifySMS: "verify-sms",
  vaults: "vaults",
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
      path={ProfileConstants.wallet}
      element={
        <AuthWrapper>
          <ProfileInternetComputerWallets />
        </AuthWrapper>
      }
    />
    <Route
      path={ProfileConstants.nfts}
      element={
        <AuthWrapper>
          <ProfileNFTs />
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
          <ProfileVaultsPage />
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
