import { useMachine } from "@xstate/react"
import React from "react"

import { Loader } from "@internet-identity-labs/nfid-sdk-react"

import { CredentialRequesterNotVerified } from "frontend/ui/pages/credential-requester/not-verified"
import { CredentialRequesterSMSVerify } from "frontend/ui/pages/credential-requester/sms-verify"
import { NFIDLogin } from "frontend/ui/pages/nfid-login"

import machine from "./machine"

export default function PhoneCredentialFlow() {
  // @ts-ignore: second param is supposed to optional
  const [state, send] = useMachine(machine)

  if (state.matches("AuthenticateUser")) {
    return <NFIDLogin onLogin={() => send("LOGIN_COMPLETE")} />
  } else if (state.matches("GetPhoneNumber.EnterPhoneNumber")) {
    return (
      <CredentialRequesterNotVerified
        onSubmit={(e) => send({ type: "ENTER_PHONE_NUMBER", data: e.phone })}
      />
    )
  } else if (state.matches("GetPhoneNumber.EnterSMSToken")) {
    return (
      <CredentialRequesterSMSVerify
        onSubmit={(val) => send({ type: "ENTER_SMS_TOKEN", data: val }) as any}
        onChangePhone={() => send("CHANGE_PHONE_NUMBER") as any}
        onResendCode={() => send("RESEND")}
        phone={state.context.phone}
        responseError={state.context.error}
      />
    )
  }

  console.info(`Unknown state: ${JSON.stringify(state.value)}`)
  return <Loader isLoading />
}
