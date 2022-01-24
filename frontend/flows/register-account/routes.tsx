import React from "react"
import { Outlet } from "react-router"
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

export const RegisterAccountRoutes = {
  path: RegisterAccountConstants.base,
  element: <Outlet />,
  children: [
    {
      path: RegisterAccountConstants.account,
      element: <RegisterAccountIntro />,
    },
    {
      path: RegisterAccountConstants.createNFIDProfile,
      element: <RegisterAccountCreateNFIDProfile />,
    },
    {
      path: RegisterAccountConstants.smsVerification,
      element: <RegisterAccountSMSVerification />,
    },
    {
      path: RegisterAccountConstants.captcha,
      element: <RegisterAccountCaptcha />,
    },
    {
      path: RegisterAccountConstants.copyRecoveryPhrase,
      element: <RegisterAccountCopyRecoveryPhrase />,
    },
  ],
}
