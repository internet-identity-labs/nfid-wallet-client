import { useMachine } from "@xstate/react"
import React, { useEffect } from "react"

import { ThirdPartyAuthSession } from "@nfid/integration"

import { AuthorizationRequest } from "frontend/state/authorization"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import AuthenticationCoordinator from "../root/coordinator"
import { AuthenticationMachineActor } from "../root/root-machine"
import { AuthChooseAccount } from "./choose-account"
import ThirdPartyAuthMachine from "./third-party-machine"

export default function ThirdPartyAuthCoordinator({
  onEnd,
}: {
  onEnd?: () => void
}) {
  const [state, send] = useMachine(ThirdPartyAuthMachine)

  React.useEffect(
    () =>
      console.debug("ThirdPartyAuthCoordinator", {
        context: state?.context,
        state: state.value,
      }),
    [state.value, state.context],
  )

  useEffect(() => {
    if (!onEnd) return
    if (state.matches("End")) onEnd()
  }, [onEnd, state])

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
          authRequest={state.context.authRequest as AuthorizationRequest}
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
