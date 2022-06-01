import React from "react"
import { Outlet, Route } from "react-router-dom"

import { Captcha } from "frontend/screens/captcha"
import { useChallenge } from "frontend/screens/captcha/hook"

import { RegisterAccountCopyRecoveryPhrase } from "./copy-recovery-phrase"
import { RouteRegisterAccountIntro } from "./intro"

const ChallengeLoader = () => {
  // NOTE: the `getChallenge` gets called twice whithout this ref.
  const loaderRef = React.useRef(false)

  const { challenge, getChallenge } = useChallenge()
  React.useEffect(() => {
    if (!loaderRef.current && !challenge) {
      loaderRef.current = true
      getChallenge()
    }
  }, [challenge, getChallenge])
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
          captchaPath={`${RemoteRegisterAccountConstants.base}/${RemoteRegisterAccountConstants.captcha}`}
        />
      }
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
      element={<RegisterAccountCopyRecoveryPhrase isRemoteRegistration />}
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
  <Route path={NFIDRegisterAccountConstants.base} element={<ChallengeLoader />}>
    <Route
      path={NFIDRegisterAccountConstants.account}
      element={
        <RouteRegisterAccountIntro
          captchaPath={`${NFIDRegisterAccountConstants.base}/${NFIDRegisterAccountConstants.captcha}`}
        />
      }
    />
    <Route
      path={NFIDRegisterAccountConstants.captcha}
      element={
        <Captcha
          successPath={`${NFIDRegisterAccountConstants.base}/${NFIDRegisterAccountConstants.copyRecoveryPhrase}`}
        />
      }
    />
    <Route
      path={NFIDRegisterAccountConstants.copyRecoveryPhrase}
      element={
        <RegisterAccountCopyRecoveryPhrase continueButtonText="Continue to NFID" />
      }
    />
  </Route>
)
