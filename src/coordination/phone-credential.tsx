import { useMachine } from "@xstate/react"
import { useSearchParams } from "react-router-dom"

import { AuthenticationActor } from "frontend/state/machines/authentication/authentication"
import PhoneCredentialMachine, {
  PhoneCredentialType,
} from "frontend/state/machines/credentials/phone-credential"
import { Button } from "frontend/ui/atoms/button"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"
import { CredentialRequesterNotVerified } from "frontend/ui/pages/credential-requester/not-verified"
import { CredentialRequesterSMSVerify } from "frontend/ui/pages/credential-requester/sms-verify"
import { CredentialRequesterVerified } from "frontend/ui/pages/credential-requester/verified"

import { AuthenticationCoordinator } from "./authentication"

interface Props {
  machine?: PhoneCredentialType
  successPath?: string
}

export default function PhoneCredentialCoordinator({ machine }: Props) {
  const [state, send] = useMachine(machine || PhoneCredentialMachine)
  const [searchParams] = useSearchParams()

  switch (true) {
    case state.matches("Ready"):
      return (
        <BlurredLoader
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
        <>
          Would you like to wipe this account for testing purposes?
          <Button onClick={() => send("CLEAR_DATA")}>Yes</Button>
          <Button onClick={() => send("END")}>No</Button>
        </>
      )
    case state.matches("Consent"):
      const error =
        state.event.type === "error.platform.generateCredential"
          ? "There was a problem generating your credential. Please try again."
          : undefined
      console.log(state.event.type)
      return (
        <CredentialRequesterVerified
          onPresent={() => send("CONSENT")}
          onSkip={() => send("REJECT")}
          error={error}
          applicationName={searchParams.get("applicationName") ?? ""}
          applicationLogo={searchParams.get("applicationLogo") ?? ""}
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
          applicationName={searchParams.get("applicationName") ?? ""}
          applicationLogo={searchParams.get("applicationLogo") ?? ""}
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
          applicationName={searchParams.get("applicationName") ?? ""}
          applicationLogo={searchParams.get("applicationLogo") ?? ""}
        />
      )
    case state.matches("GenerateCredential"):
      return (
        <BlurredLoader
          isLoading
          loadingMessage={"Creating verifiable credential"}
        />
      )
    default:
      console.debug(
        `PhoneCredentialCoordinator rendering loader, unknown state: ${JSON.stringify(
          state.value,
        )}`,
      )
      return <BlurredLoader isLoading />
  }
}
