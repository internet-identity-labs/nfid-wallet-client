import React from "react"
import { Outlet, Route } from "react-router-dom"

import { RegisterAccountCaptcha } from "./captcha"
import { RegisterAccountCopyRecoveryPhrase } from "./copy-recovery-phrase"
import { RegisterAccountIntro } from "./intro"

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
      element={<RegisterAccountCaptcha />}
    />
    <Route
      path={RegisterAccountConstantsIIW.copyRecoveryPhrase}
      element={<RegisterAccountCopyRecoveryPhrase />}
    />
  </Route>
)
