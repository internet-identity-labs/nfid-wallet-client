import { useMachine } from "@xstate/react"
import React, { useEffect } from "react"

import { AuthorizationRequest } from "frontend/state/authorization"
import { BlurredLoader } from "@nfid-frontend/ui"

import AuthenticationCoordinator from "../root/coordinator"
import { AuthenticationMachineActor } from "../root/root-machine"
import { AuthChooseAccount } from "./choose-account"
import { ApproveIcGetDelegationSdkResponse } from "./choose-account/types"
import ThirdPartyAuthMachine from "./third-party-machine"

export default function ThirdPartyAuthCoordinator({
  onEnd,
}: {
  onEnd?: () => void
}) {
  const [state, send] = useMachine(ThirdPartyAuthMachine)

  useEffect(() => {
    if (!onEnd) return
    if (state.value === "End") onEnd()
  }, [onEnd, state])

  switch (true) {
    case state.value === "AuthenticationMachine":
      return (
        <AuthenticationCoordinator
          actor={
            state.children
              .AuthenticationMachine as unknown as AuthenticationMachineActor
          }
        />
      )
    case state.value === "Authorization":
      return (
        <AuthChooseAccount
          onReset={() => send({ type: "RESET" })}
          authRequest={state.context.authRequest as AuthorizationRequest}
          appMeta={state.context.appMeta}
          handleSelectAccount={(
            authSession: ApproveIcGetDelegationSdkResponse,
          ) => send({ type: "CHOOSE_ACCOUNT", data: authSession })}
        />
      )
    default:
      return <BlurredLoader isLoading />
  }
}
