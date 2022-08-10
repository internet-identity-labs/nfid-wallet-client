import { useActor } from "@xstate/react"
import React from "react"

import { RegistrationActor } from "frontend/state/machines/authentication/registration"
import { Captcha } from "frontend/ui/pages/captcha"
import { RegisterAccountIntro } from "frontend/ui/pages/register-account-intro/screen-app"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"

export function RegistrationCoordinator({ actor }: Actor<RegistrationActor>) {
  const [state, send] = useActor(actor)

  React.useEffect(() => {
    console.debug("RegistrationCoordinator", {
      state: state.value,
      context: state.context,
    })
  }, [state.value, state.context])

  switch (true) {
    case state.matches("Start.Register.CheckAuth"):
    case state.matches("Start.Register.InitialChallenge"):
    case state.matches("Start.Register.CreateIdentity"):
    case state.matches("AuthWithGoogle"):
      return (
        <RegisterAccountIntro
          isLoading={
            state.matches("Start.Register.CheckAuth") ||
            state.matches("Start.Register.CreateIdentity") ||
            state.matches("AuthWithGoogle")
          }
          applicationName={state.context.appMeta?.name}
          applicationLogo={state.context.appMeta?.logo}
          onRegister={() => send("CREATE_IDENTITY")}
          onSelectGoogleAuthorization={({ credential }) => {
            console.debug(
              "RegistrationCoordinator onSelectGoogleAuthorization",
              { credential },
            )
            send({
              type: "AUTH_WITH_GOOGLE",
              to: "auth-unknown-device",
              data: { jwt: credential },
            })
          }}
          onSelectSecurityKeyAuthorization={function (
            userNumber: number,
          ): void | Promise<void> {
            throw new Error(
              "onSelectSecurityKeyAuthorization Function not implemented.",
            )
          }}
          onSelectSameDeviceAuthorization={function (
            userNumber: number,
          ): void | Promise<void> {
            throw new Error(
              "onSelectSameDeviceAuthorization Function not implemented.",
            )
          }}
        />
      )
    case state.matches("Start.Register.Captcha"):
    case state.matches("Start.Register.Register"):
      return (
        <Captcha
          loadingMessage={"Registering NFID"}
          isLoading={state.matches("Start.Register.Register")}
          isChallengeLoading={state.matches("Start.Challenge.Fetch")}
          applicationLogo={state.context.appMeta?.logo}
          applicationName={state.context.appMeta?.name}
          onRegisterAnchor={async ({ captcha }) =>
            send({ type: "SUBMIT_CAPTCHA", data: captcha })
          }
          onRequestNewCaptcha={() => send("FETCH_CAPTCHA")}
          errorString={state.context.error}
          challengeBase64={state.context.challenge?.pngBase64}
        />
      )
    case state.matches("End"):
      return (
        <ScreenResponsive isLoading loadingMessage="Registered successful" />
      )
    default:
      return <></>
  }
}
