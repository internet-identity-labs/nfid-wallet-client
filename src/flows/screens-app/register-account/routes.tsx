import React from "react"
import { Outlet, Route } from "react-router-dom"

import { Captcha } from "frontend/screens/captcha"

import { RegisterAccountCopyRecoveryPhrase } from "./copy-recovery-phrase"
import { RegisterAccountIntro } from "./intro"

export const RemoteRegisterAccountConstants = {
  base: "/register-account/:secret/:scope",
  account: "intro",
  captcha: "captcha",
  copyRecoveryPhrase: "copy-recovery-phrase",
}

export const RemoteRegisterAccountRoutes = (
  <Route path={RemoteRegisterAccountConstants.base} element={<Outlet />}>
    <Route
      path={RemoteRegisterAccountConstants.account}
      element={<RegisterAccountIntro />}
    />
    <Route
      path={RemoteRegisterAccountConstants.captcha}
      element={
        <Captcha
          successPath={`${RemoteRegisterAccountConstants.base}/${RemoteRegisterAccountConstants.copyRecoveryPhrase}`}
        />
      }
    />
    <Route
      path={RemoteRegisterAccountConstants.copyRecoveryPhrase}
      element={<RegisterAccountCopyRecoveryPhrase />}
    />
  </Route>
)

export const NFIDRegisterAccountConstants = {
  base: "/register-account",
  account: "intro",
  captcha: "captcha",
  copyRecoveryPhrase: "copy-recovery-phrase",
}

export const NFIDRegisterAccountRoutes = (
  <Route path={NFIDRegisterAccountConstants.base} element={<Outlet />}>
    <Route
      path={NFIDRegisterAccountConstants.account}
      element={<RegisterAccountIntro />}
    />
    <Route
      path={NFIDRegisterAccountConstants.captcha}
      element={
        <Captcha
          successPath={`${RemoteRegisterAccountConstants.base}/${RemoteRegisterAccountConstants.copyRecoveryPhrase}`}
        />
      }
    />
    <Route
      path={NFIDRegisterAccountConstants.copyRecoveryPhrase}
      element={<RegisterAccountCopyRecoveryPhrase />}
    />
  </Route>
)
