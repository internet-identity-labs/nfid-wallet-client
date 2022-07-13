import React from "react"
import { Outlet, Route } from "react-router-dom"

import { useChallenge } from "frontend/design-system/pages/captcha/hook"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"

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
          isRemoteRegiser
          captchaPath={`${RemoteRegisterAccountConstants.base}/${RemoteRegisterAccountConstants.captcha}`}
          pathOnAuthenticated={"/rdp/:secret/:scope"}
        />
      }
    />
    <Route
      path={RemoteRegisterAccountConstants.captcha}
      element={
        <RegisterAccountCaptcha
          isRemoteRegiser
          successPath={"/profile/authenticate"}
        />
      }
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
          pathOnAuthenticated={"/profile/authenticate"}
        />
      }
    />
    <Route
      path={NFIDRegisterAccountConstants.captcha}
      element={
        <RegisterAccountCaptcha
          isNFIDProp
          successPath={"/profile/authenticate"}
        />
      }
    />
  </Route>
)
