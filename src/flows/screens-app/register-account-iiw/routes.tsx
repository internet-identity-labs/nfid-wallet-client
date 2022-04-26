import React from "react"
import { Outlet, Route } from "react-router-dom"

import { Captcha } from "frontend/screens/captcha"

import { ProofOfAttendencyCopyRecoveryPhrase } from "../proof-of-attendancy/copy-recovery-phrase"
import { RegisterAccountIntro } from "./register-account-intro"

export const RegisterAccountConstantsIIW = {
  base: "/register-account/iiw/:secret",
  intro: "intro",
  captcha: "captcha",
  copyRecoveryPhrase: "copy-recovery-phrase",
}

export const RegisterAccountRoutesIIW = (
  <Route path={RegisterAccountConstantsIIW.base} element={<Outlet />}>
    <Route
      path={RegisterAccountConstantsIIW.intro}
      element={<RegisterAccountIntro />}
    />
    <Route
      path={RegisterAccountConstantsIIW.captcha}
      element={
        <Captcha
          successPath={`${RegisterAccountConstantsIIW.base}/${RegisterAccountConstantsIIW.copyRecoveryPhrase}`}
        />
      }
    />
    <Route
      path={RegisterAccountConstantsIIW.copyRecoveryPhrase}
      element={<ProofOfAttendencyCopyRecoveryPhrase />}
    />
  </Route>
)
