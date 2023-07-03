import { useMachine } from "@xstate/react"
import React from "react"

import { ThirdPartyAuthSession } from "@nfid/integration"

import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import { AuthChooseAccount } from "../choose-account"
import AuthenticationCoordinator from "../root/coordinator"
import { AuthenticationMachineActor } from "../root/root-machine"
import ThirdPartyAuthMachine from "./third-party-machine"

export default function ThirdPartyAuthCoordinator() {
  const [state, send] = useMachine(ThirdPartyAuthMachine)

  React.useEffect(
    () =>
      console.debug("ThirdPartyAuthCoordinator", {
        context: state?.context,
        state: state.value,
      }),
    [state.value, state.context],
  )

  switch (true) {
    case state.matches("AuthenticationMachine"):
      return (
        <AuthenticationCoordinator
          actor={
            state.children.AuthenticationMachine as AuthenticationMachineActor
          }
        />
      )
    case state.matches("Authorization"):
      return (
        <AuthChooseAccount
          appMeta={state.context.appMeta}
          handleSelectAccount={(authSession: ThirdPartyAuthSession) =>
            send({ type: "CHOOSE_ACCOUNT", data: authSession })
          }
        />
      )
    default:
      return <BlurredLoader isLoading />
  }
}
