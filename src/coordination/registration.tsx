import { useActor } from "@xstate/react"

import { RegistrationActor } from "frontend/state/machines/authentication/registration"
import { Captcha } from "frontend/ui/pages/captcha"
import { RegisterAccountIntro } from "frontend/ui/pages/register-account-intro/screen-app"

export function RegistrationCoordinator({ actor }: Actor<RegistrationActor>) {
  const [state, send] = useActor(actor)

  switch (true) {
    case state.matches("Start.Register.CheckAuth"):
    case state.matches("Start.Register.InitialChallenge"):
    case state.matches("Start.Register.CreateIdentity"):
      return (
        <RegisterAccountIntro
          isLoading={
            state.matches("Start.Register.CheckAuth") ||
            state.matches("Start.Register.CreateIdentity")
          }
          applicationName={state.context.appMeta?.name}
          applicationLogo={state.context.appMeta?.logo}
          onRegister={() => send("CREATE_IDENTITY")}
          onSelectGoogleAuthorization={() => console.error("NOT IMPLEMENTED")}
        />
      )
    case state.matches("Start.Register.Captcha"):
    case state.matches("Start.Register.Register"):
      return (
        <Captcha
          loadingMessage={"Registering NFID"}
          isLoading={state.matches("Start.Register.Register")}
          isChallengeLoading={state.matches("Start.Challenge.Fetch")}
          applicationLogo={state.context.appMeta?.name}
          applicationName={state.context.appMeta?.logo}
          onRegisterAnchor={async ({ captcha }) =>
            send({ type: "SUBMIT_CAPTCHA", data: captcha })
          }
          onRequestNewCaptcha={() => send("FETCH_CAPTCHA")}
          errorString={state.context.error}
          challengeBase64={state.context.challenge?.pngBase64}
        />
      )
    default:
      return <div>RegistrationCoordinator</div>
  }
}
