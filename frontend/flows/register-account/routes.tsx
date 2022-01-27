import React from "react"
import { Outlet, Route } from "react-router-dom"
import { RegisterAccountCaptcha } from "./captcha"
import { RegisterAccountCopyRecoveryPhrase } from "./copy-recovery-phrase"
import { RegisterAccountCreateNFIDProfile } from "./create-nfid-profile"
import { RegisterAccountIntro } from "./intro"
import { RegisterAccountSMSVerification } from "./sms"

export const RegisterAccountConstants = {
  base: "/register-account",
  account: "", // renders Intro on /register-account,
  createNFIDProfile: "create-nfid-profile",
  smsVerification: "sms",
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
      path={RegisterAccountConstants.createNFIDProfile}
      element={<RegisterAccountCreateNFIDProfile />}
    />
    <Route
      path={RegisterAccountConstants.smsVerification}
      element={<RegisterAccountSMSVerification />}
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
