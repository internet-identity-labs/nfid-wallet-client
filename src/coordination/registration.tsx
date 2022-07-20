import { useActor } from "@xstate/react"

import { RegistrationActor } from "frontend/state/machines/authentication/registration"
import { CredentialResponse } from "frontend/ui/atoms/button/signin-with-google/types"
import { RegisterAccountIntro } from "frontend/ui/pages/register-account-intro/screen-app"

export function RegistrationCoordinator({ actor }: Actor<RegistrationActor>) {
  const [state, send] = useActor(actor)

  switch (true) {
    case state.matches("Start"):
      return (
        <RegisterAccountIntro
          onRegister={function (): void {
            throw new Error("Function not implemented.")
          }}
          onSelectGoogleAuthorization={function ({
            credential,
          }: CredentialResponse): void {
            throw new Error("Function not implemented.")
          }}
          isLoading={false}
        />
      )
    default:
      return <div>RegistrationCoordinator</div>
  }
}
