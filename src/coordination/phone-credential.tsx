import { useMachine } from "@xstate/react"

import { AuthenticationActor } from "frontend/state/machines/authentication/authentication"
import PhoneCredentialMachine, {
  PhoneCredentialType,
} from "frontend/state/machines/credentials/phone-credential"
import { Button } from "frontend/ui/atoms/button"
import { CredentialRequesterNotVerified } from "frontend/ui/pages/credential-requester/not-verified"
import { CredentialRequesterSMSVerify } from "frontend/ui/pages/credential-requester/sms-verify"
import { CredentialRequesterVerified } from "frontend/ui/pages/credential-requester/verified"
import { ScreenResponsive } from "frontend/ui/templates/screen-responsive"

import { AuthenticationCoordinator } from "./authentication"

interface Props {
  machine?: PhoneCredentialType
  successPath?: string
}

export default function PhoneCredentialCoordinator({ machine }: Props) {
  const [state, send] = useMachine(machine || PhoneCredentialMachine)

  switch (true) {
    case state.matches("Ready"):
      return (
        <ScreenResponsive
          isLoading
          loadingMessage={`Connecting to ${
            state.context.appMeta?.name ?? "the application"
          }`}
        />
      )
    case state.matches("Authenticate"):
      return (
        <AuthenticationCoordinator
          actor={state.children.AuthenticationMachine as AuthenticationActor}
        />
      )
    case state.matches("DevClearData"):
      return (
        <ScreenResponsive>
          Would you like to wipe this account for testing purposes?
          <Button onClick={() => send("CLEAR_DATA")}>Yes</Button>
          <Button onClick={() => send("END")}>No</Button>
        </ScreenResponsive>
      )
    case state.matches("GetPhoneNumber.PresentCredential"):
      return (
        <CredentialRequesterVerified
          applicationLogo={state.context.appMeta?.logo}
          applicationName={state.context.appMeta?.name}
          onPresent={() => send("PRESENT")}
          onSkip={() => send("SKIP")}
        />
      )
    case state.matches("GetPhoneNumber.GetExistingPhoneNumber"):
    case state.matches("GetPhoneNumber.VerifyPhoneNumber"):
    case state.matches("GetPhoneNumber.EnterPhoneNumber"):
      return (
        <CredentialRequesterNotVerified
          onSubmit={(e) => send({ type: "ENTER_PHONE_NUMBER", data: e.phone })}
          isLoading={
            state.matches("GetPhoneNumber.GetExistingPhoneNumber") ||
            state.matches("GetPhoneNumber.VerifyPhoneNumber")
          }
          loadingMessage={
            state.matches("GetPhoneNumber.VerifyPhoneNumber")
              ? "Generating SMS token"
              : state.matches("GetPhoneNumber.GetExistingPhoneNumber")
              ? "Checking for phone number"
              : ""
          }
          error={
            // TODO: Fix horrible type handling
            "data" in state.event &&
            typeof state.event.data === "object" &&
            "error" in state.event.data
              ? state.event.data.error
              : undefined
          }
          phoneNumber={state.context.phone}
        />
      )
    case state.matches("GetPhoneNumber.EnterSMSToken"):
    case state.matches("GetPhoneNumber.ValidateSMSToken"):
      return (
        <CredentialRequesterSMSVerify
          onSubmit={(val) =>
            send({ type: "ENTER_SMS_TOKEN", data: val }) as any
          }
          onChangePhone={() => send("CHANGE_PHONE_NUMBER") as any}
          // @ts-ignore
          onResendCode={() => send("RESEND", state.event.data)}
          phone={state.context.phone}
          responseError={
            // TODO: Fix horrible type handling
            "data" in state.event &&
            typeof state.event.data === "object" &&
            "error" in state.event.data
              ? state.event.data.error
              : undefined
          }
          isLoading={state.matches("GetPhoneNumber.ValidateSMSToken")}
          loadingMessage="Validating token"
        />
      )
    case state.matches("GenerateCredential"):
      return (
        <ScreenResponsive
          isLoading
          loadingMessage="Creating verifiable credential"
        />
      )
    default:
      console.debug(
        `PhoneCredentialCoordinator rendering loader, unknown state: ${JSON.stringify(
          state.value,
        )}`,
      )
      return <ScreenResponsive isLoading />
  }
}
