import React from 'react';
import { useMachine } from '@xstate/react'
import machine from './machine';
import { NFIDLogin } from 'frontend/design-system/pages/nfid-login';
import { CredentialRequesterNotVerified } from 'frontend/design-system/pages/credential-requester/not-verified';
import { CredentialRequesterSMSVerify } from 'frontend/design-system/pages/credential-requester/sms-verify';
import { Loader } from '@internet-identity-labs/nfid-sdk-react';

export default function PhoneCredentialFlow() {

  const [state, send] = useMachine(machine)

  if (state.matches('AuthenticateUser')) {
    return <NFIDLogin
      onLoginSuccess={() => send('LOGIN_COMPLETE')}
    />
  } else if (state.matches('GetPhoneNumber.EnterPhoneNumber')) {
    return <CredentialRequesterNotVerified
      onSubmit={(e) => send({ type: "ENTER_PHONE_NUMBER", data: e.phone })}
    />
  } else if (state.matches('GetPhoneNumber.EnterSMSToken')) {
    return <CredentialRequesterSMSVerify
      onSubmit={(val) => send({ type: "ENTER_SMS_TOKEN", data: val }) as any}
      onChangePhone={() => send("CHANGE_PHONE_NUMBER") as any}
      onResendCode={() => send("RESEND")}
      phone={state.context.phone}
      responseError={state.context.error}
    />
  }

  console.info(`Unknown state: ${JSON.stringify(state.value)}`)
  return <Loader isLoading />
}