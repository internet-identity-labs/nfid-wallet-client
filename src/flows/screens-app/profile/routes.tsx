import React from "react"
import { Outlet, Route } from "react-router-dom"

import { AuthWrapper } from "frontend/screens/auth-wrapper"

import { NFIDProfile } from "."
import { AddPhoneNumber } from "./add-phone-number"
import { CopyRecoveryPhrase } from "./copy-recovery-phrase"
import { NFIDProfileEdit } from "./edit"
import { NFIDPersonalize } from "./personalize"

export const ProfileConstants = {
  base: "/profile",
  edit: "edit",
  addPhoneNumber: "add-phone-number",
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
        <AuthWrapper redirectTo="/">
          <NFIDProfile />
        </AuthWrapper>
      }
    />
    <Route path={ProfileConstants.personalize} element={<NFIDPersonalize />} />
    <Route
      path={ProfileConstants.edit}
      element={
        <AuthWrapper redirectTo="/">
          <NFIDProfileEdit />
        </AuthWrapper>
      }
    />
    <Route
      path={ProfileConstants.addPhoneNumber}
      element={
        <AuthWrapper redirectTo="/">
          <AddPhoneNumber />
        </AuthWrapper>
      }
    />
    <Route
      path={ProfileConstants.copyRecoveryPhrase}
      element={<CopyRecoveryPhrase />}
    />
  </Route>
)
