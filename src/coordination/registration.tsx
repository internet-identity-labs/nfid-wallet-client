import { useActor } from "@xstate/react"

import { RegistrationActor } from "frontend/state/machines/authentication/registration"
import { CredentialResponse } from "frontend/ui/atoms/button/signin-with-google/types"
import { Captcha } from "frontend/ui/pages/captcha"
import { RegisterAccountIntro } from "frontend/ui/pages/register-account-intro/screen-app"

export function RegistrationCoordinator({ actor }: Actor<RegistrationActor>) {
  const [state, send] = useActor(actor)

  switch (true) {
    case state.matches("Start.Register.InitialChallenge"):
      return (
        <RegisterAccountIntro
          onRegister={() => send("CREATE_IDENTITY")}
          onSelectGoogleAuthorization={function ({
            credential,
          }: CredentialResponse): void {
            throw new Error("Function not implemented.")
          }}
          isLoading={false}
        />
      )
    case state.matches("Start.Register.Captcha"):
    case state.matches("Start.Register.Register"):
      return (
        <Captcha
          loadingMessage={"Registering NFID"}
          isLoading={state.matches("Start.Register.Register")}
          isChallengeLoading={state.matches("Start.Challenge.Wait")}
          onRegisterAnchor={async () => send("SUBMIT_CAPTCHA")}
          onRequestNewCaptcha={function (): void {
            throw new Error("Function not implemented.")
          }}
        />
      )
    default:
      return <div>RegistrationCoordinator</div>
  }
}
