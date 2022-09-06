import React from "react"
import { Route, Outlet } from "react-router-dom"

import ApplicationsIcon from "frontend/ui/organisms/profile-sidebar/assets/applications.svg"
import AssetsIcon from "frontend/ui/organisms/profile-sidebar/assets/assets.svg"
import CredentialsIcon from "frontend/ui/organisms/profile-sidebar/assets/credentials.svg"
import SecurityIcon from "frontend/ui/organisms/profile-sidebar/assets/security.svg"
import { AuthWrapper } from "frontend/ui/pages/auth-wrapper"

import ProfileApplications from "./applications"
import ProfileAssets from "./assets"
import CopyRecoveryPhrase from "./copy-recovery-phrase"
import ProfileCredentials from "./credentials"
import ProfilePhone from "./credentials/phone-number"
import ProfileSMS from "./credentials/phone-sms"
import ProfileSecurity from "./security"
import ProfileTransactions from "./transactions"

export const ProfileConstants = {
  base: "/profile",
  assets: "assets",
  security: "security",
  credentials: "credentials",
  transactions: "transactions",
  applications: "applications",
  copyRecoveryPhrase: "copy-recovery-phrase",
  addPhoneNumber: "add-phone-number",
  verifySMS: "verify-sms",
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
    {/* <Route
      path={ProfileConstants.authenticate}
      element={
        // TODO: redirect to general register flow
        <AuthWrapper>
          <NFIDProfile />
        </AuthWrapper>
      }
    />
    <Route
      path={ProfileConstants.edit}
      element={
        <AuthWrapper>
          <NFIDProfileEdit />
        </AuthWrapper>
      }
    />
    <Route
      path={ProfileConstants.addPhoneNumber}
      element={
        <AuthWrapper>
          <AddPhoneNumber />
        </AuthWrapper>
      }
    />
    <Route
      path={ProfileConstants.verifySMSToken}
      element={
        <AuthWrapper>
          <VerifySMSToken />
        </AuthWrapper>
      }
    />
    */}
  </Route>
)

export const profileSidebarItems = [
  {
    icon: AssetsIcon,
    title: "Assets",
    link: `${ProfileConstants.base}/${ProfileConstants.assets}`,
  },
  {
    icon: ApplicationsIcon,
    title: "Applications",
    link: `${ProfileConstants.base}/${ProfileConstants.applications}`,
  },
  {
    icon: CredentialsIcon,
    title: "Credentials",
    link: `${ProfileConstants.base}/${ProfileConstants.credentials}`,
  },
  {
    icon: SecurityIcon,
    title: "Security",
    link: `${ProfileConstants.base}/${ProfileConstants.security}`,
  },
]
