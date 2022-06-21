import React from "react"
import { Outlet, Route } from "react-router-dom"

import { useChallenge } from "frontend/screens/captcha/hook"

import { RegisterAccountCaptcha } from "./captcha"
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
          pathAuthorizeApp={"/rdp/:secret/:scope"}
        />
      }
    />
    <Route
      path={RemoteRegisterAccountConstants.captcha}
      element={<RegisterAccountCaptcha />}
    />
  </Route>
)
