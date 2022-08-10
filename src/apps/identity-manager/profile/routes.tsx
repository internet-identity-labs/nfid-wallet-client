import React from "react"
import { Outlet, Route } from "react-router-dom"

import { AuthWrapper } from "frontend/ui/pages/auth-wrapper"

import { NFIDProfile } from "."
import { AddPhoneNumber } from "./add-phone-number"
import { CopyRecoveryPhrase } from "./copy-recovery-phrase"
import { NFIDProfileEdit } from "./edit"
import { VerifySMSToken } from "./verify-sms-token"

export const ProfileConstants = {
  base: "/profile",
  edit: "edit",
  addPhoneNumber: "add-phone-number",
  verifySMSToken: "verify-sms-token",
  authenticate: "authenticate",
  personalize: "personalize",
  copyRecoveryPhrase: "copy-recovery-phrase",
}

export const ProfileRoutes = (
  <Route path={ProfileConstants.base} element={<Outlet />}>
    <Route
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
    <Route
      path={ProfileConstants.copyRecoveryPhrase}
      element={<CopyRecoveryPhrase />}
    />
  </Route>
)
