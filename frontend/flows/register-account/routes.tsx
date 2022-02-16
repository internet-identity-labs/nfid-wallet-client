import React from "react"
import { Outlet, Route } from "react-router-dom"
import { RegisterAccountCaptcha } from "./captcha"
import { RegisterAccountCopyRecoveryPhrase } from "./copy-recovery-phrase"
import { RegisterAccountIntro } from "./intro"

export const RegisterAccountConstants = {
  base: "/register-account",
  account: "intro",
  captcha: "captcha",
  copyRecoveryPhrase: "copy-recovery-phrase",
}

export const RegisterAccountRoutes = (
  <Route path={RegisterAccountConstants.base} element={<Outlet />}>
    <Route
      path={RegisterAccountConstants.account}
      element={<RegisterAccountIntro />}
    />
    <Route
      path={RegisterAccountConstants.captcha}
      element={<RegisterAccountCaptcha />}
    />
    <Route
      path={RegisterAccountConstants.copyRecoveryPhrase}
      element={<RegisterAccountCopyRecoveryPhrase />}
    />
  </Route>
)
