import { useMachine } from "@xstate/react"

import { Loader } from "@internet-identity-labs/nfid-sdk-react"

import { AuthenticationActor } from "frontend/state/machines/authentication/authentication"
import PhoneCredentialMachine, {
  PhoneCredentialType,
} from "frontend/state/machines/credentials/phone-credential"
import { CredentialRequesterNotVerified } from "frontend/ui/pages/credential-requester/not-verified"
import { CredentialRequesterSMSVerify } from "frontend/ui/pages/credential-requester/sms-verify"
import { NFIDLogin } from "frontend/ui/pages/nfid-login"

import { AuthenticationCoordinator } from "./authentication"

interface Props {
  machine?: PhoneCredentialType
  successPath?: string
}

export default function PhoneCredentialCoordinator({ machine }: Props) {
  const [state, send] = useMachine(machine || PhoneCredentialMachine)

  switch (true) {
    case state.matches("Authenticate"):
      return (
        <AuthenticationCoordinator
          actor={state.children.AuthenticationMachine as AuthenticationActor}
        />
      )
    case state.matches("GetPhoneNumber.EnterPhoneNumber"):
      return (
        <CredentialRequesterNotVerified
          onSubmit={(e) => send({ type: "ENTER_PHONE_NUMBER", data: e.phone })}
        />
      )
    case state.matches("GetPhoneNumber.EnterSMSToken"):
      return (
        <CredentialRequesterSMSVerify
          onSubmit={(val) =>
            send({ type: "ENTER_SMS_TOKEN", data: val }) as any
          }
          onChangePhone={() => send("CHANGE_PHONE_NUMBER") as any}
          onResendCode={() => send("RESEND")}
          phone={state.context.phone}
          responseError={state.context.error}
        />
      )
    default:
      console.debug(
        `PhoneCredentialCoordinator rendering loader, unknown state: ${JSON.stringify(
          state.value,
        )}`,
      )
      return <Loader isLoading />
  }
}
