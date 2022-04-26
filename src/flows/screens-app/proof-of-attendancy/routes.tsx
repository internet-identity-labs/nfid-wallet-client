import React from "react"
import { Outlet, Route } from "react-router-dom"

import { Captcha } from "frontend/screens/captcha"
import { ProofOfAttendencyAward } from "frontend/screens/proof-of-attendency-award"

import { ProofOfAttendencyCopyRecoveryPhrase } from "./copy-recovery-phrase"
import { RegisterAccountIntro } from "./register-account-intro"
import { ClaimAttendency } from "./register-or-claim"

export const AppScreenProofOfAttendencyConstants = {
  base: "/poa/:secret",
  register: "register-account/intro",
  captcha: "register-account/captcha",
  copyRecoveryPhrase: "register-account/copy-recovery-phrase",
  award: "award",
}

export const AppScreenProofOfAttendencyRoutes = (redirectTo: string) => (
  <Route path={AppScreenProofOfAttendencyConstants.base} element={<Outlet />}>
    <Route
      path={AppScreenProofOfAttendencyConstants.base}
      element={<ClaimAttendency />}
    />
    <Route
      path={AppScreenProofOfAttendencyConstants.register}
      element={<RegisterAccountIntro />}
    />
    <Route
      path={AppScreenProofOfAttendencyConstants.captcha}
      element={
        <Captcha
          successPath={AppScreenProofOfAttendencyConstants.copyRecoveryPhrase}
        />
      }
    />
    <Route
      path={AppScreenProofOfAttendencyConstants.copyRecoveryPhrase}
      element={<ProofOfAttendencyCopyRecoveryPhrase />}
    />
    <Route
      path={AppScreenProofOfAttendencyConstants.award}
      element={<ProofOfAttendencyAward />}
    />
  </Route>
)
