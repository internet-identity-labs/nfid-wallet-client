import { useAtom } from "jotai"
import React from "react"

import { useAccount } from "frontend/services/identity-manager/account/hooks"

import { VerifyPhoneNumberMachine } from "./state"

// MOCKING
// https://github.com/garbles/react-facade
// https://storybook.js.org/addons/msw-storybook-addon
// const { account } = useAccount()

// ROUTE SYNC
// ???

const ScreenMap: { [key: string]: React.FC } = {
  Authenticate: () => <div>Authenticate</div>,
  RemoteAuthenticate: () => <div>RemoteAuthenticate</div>,
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
          },
        },
      }),
    [account],
  )

  const [{ value, ...rest }] = useAtom(machine)
  console.log(">> ", { machine, value, rest })
  const componentState = React.useMemo(() => getComponentState(value), [value])

  const Screen = React.useMemo(
    () => ScreenMap[componentState as string],
    [componentState],
  )
  return Screen ? <Screen /> : <>Unknown State: {componentState}</>
}
