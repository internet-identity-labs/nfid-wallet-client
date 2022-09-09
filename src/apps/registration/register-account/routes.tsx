import React from "react"
import { Outlet, Route } from "react-router-dom"

import { useChallenge } from "frontend/ui/pages/captcha/hook"

import { RegisterAccountCaptcha } from "./captcha"
import { RouteRegisterAccountIntro } from "./intro"

const ChallengeLoader = () => {
  // NOTE: this will start loading the challenge
  useChallenge()

  return <Outlet />
}

export const RemoteRegisterAccountConstants = {
  base: "/register-account/:secret/:scope",
  intro: "intro",
  captcha: "captcha",
  copyRecoveryPhrase: "copy-recovery-phrase",
}

export const RemoteRegisterAccountRoutes = (
  <Route
    path={RemoteRegisterAccountConstants.base}
    element={<ChallengeLoader />}
  >
    <Route
      path={RemoteRegisterAccountConstants.intro}
      element={
        <RouteRegisterAccountIntro
          isRemoteRegister
          captchaPath={`${RemoteRegisterAccountConstants.base}/${RemoteRegisterAccountConstants.captcha}`}
          pathOnAuthenticated={"/rdp/:secret/:scope"}
        />
      }
    />
    <Route
      path={RemoteRegisterAccountConstants.captcha}
      element={<RegisterAccountCaptcha isRemoteRegister />}
    />
  </Route>
)

export const NFIDRegisterAccountConstants = {
  base: "/register-nfid-account",
  account: "intro",
  captcha: "captcha",
}

export const NFIDRegisterAccountRoutes = (
  <Route path={NFIDRegisterAccountConstants.base} element={<ChallengeLoader />}>
    <Route
      path={NFIDRegisterAccountConstants.account}
      element={
        <RouteRegisterAccountIntro
          isNFID
          captchaPath={`${NFIDRegisterAccountConstants.base}/${NFIDRegisterAccountConstants.captcha}`}
          pathOnAuthenticated={"/profile/security"}
        />
      }
    />
    <Route
      path={NFIDRegisterAccountConstants.captcha}
      element={<RegisterAccountCaptcha />}
    />
  </Route>
)
