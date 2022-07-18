import { CredentialResult } from "@nfid/credentials"
import { useAtom, WritableAtom } from "jotai"
import React from "react"
import { State, TypegenDisabled } from "xstate"

import { Loader } from "@internet-identity-labs/nfid-sdk-react"

import { useAccount } from "frontend/comm/services/identity-manager/account/hooks"

import { Authenticate } from "./authenticate"
import { EnterPhoneNumber } from "./enter-phone-number"
import { EnterSMSToken } from "./enter-sms-token"
import { RemoteAuthenticate } from "./remote-authenticate"
import {
  VerifyPhoneNumberMachine,
  VerifyPhoneNumberMachineContext,
} from "./state"

// MOCKING
// https://github.com/garbles/react-facade
// https://storybook.js.org/addons/msw-storybook-addon
// const { account } = useAccount()

// ROUTE SYNC
// ???

let credentialResult: CredentialResult

// registerPhoneNumberCredentialHandler(function () {
//   return new Promise((resolve) => {
//     setInterval(() => credentialResult && resolve(credentialResult), 1000)
//   })
// })

const ScreenMap: {
  [key: string]: React.FC<{
    machine: WritableAtom<
      State<
        VerifyPhoneNumberMachineContext,
        any,
        any,
        {
          value: any
          context: VerifyPhoneNumberMachineContext
        },
        TypegenDisabled
      >,
      any,
      void
    >
  }>
} = {
  Authenticate,
  RemoteAuthenticate,
  EnterPhoneNumber,
  EnterSMSToken,
  PresentCredential() {
    return <Loader isLoading={true} />
    // Redirect somewhere
  },
}

const getComponentState = (value: string | object) => {
  return typeof value === "string" ? value : Object.keys(value)[0]
}

export const VerifyPhoneNumberRoute: React.FC = () => {
  const { account } = useAccount()

  const machine = React.useMemo(
    () =>
      VerifyPhoneNumberMachine({
        serviceMap: {
          guards: {
            isRegisteredDevice: (context, event) => {
              console.log(">> ", { context, event })

              return !!account
            },
            hasCredential: (context, event) => {
              console.log(">> ", { context, event })
              return false
            },
          },
          actions: {
            presentCredential() {
              // Retrieve credential from react state?
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              credentialResult = {
                result: true,
                credential: "asdf",
              }
            },
          },
        },
      }),
    [account],
  )

  const [{ value, ...rest }] = useAtom(machine)
  const currentValue = React.useMemo(() => {
    function stringOrRecurse(value: object | string): object | string {
      if (typeof value === "string") {
        return value
      } else {
        return stringOrRecurse(Object.values(value)[0])
      }
    }
    return stringOrRecurse(value)
  }, [value])
  console.log(">> ", { machine, value, rest })
  const componentState = React.useMemo(
    () => getComponentState(currentValue),
    [currentValue],
  )

  const Screen = React.useMemo(
    () => ScreenMap[componentState as string],
    [componentState],
  )
  return Screen ? (
    <Screen machine={machine} />
  ) : (
    <>Unknown State: {componentState}</>
  )
}
