import { useActor } from "@xstate/react"
import React from "react"

import { Loader } from "@nfid-frontend/ui"

import { RegistrationActor } from "frontend/state/machines/authentication/registration"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"
import { Captcha } from "frontend/ui/pages/captcha"

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
    case state.matches("ExistingAnchor"):
    case state.matches("AuthenticateSameDevice"):
      return (
        <Loader
          isLoading={true}
          fullscreen={false}
          imageClasses="w-20 m-auto"
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
    default:
      return <BlurredLoader isLoading loadingMessage="Registered successful" />
  }
}
