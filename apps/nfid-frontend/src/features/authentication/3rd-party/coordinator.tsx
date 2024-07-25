import { useMachine } from "@xstate/react"
import React, { useEffect } from "react"

import { authenticationTracking } from "@nfid/integration"

import { AuthorizationRequest } from "frontend/state/authorization"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

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

  const handleTrackAuthModalOpened = React.useCallback(() => {
    if (
      state.context.appMeta &&
      state.context.authRequest &&
      state.matches("AuthenticationMachine")
    ) {
      const authTarget = state.context.appMeta.name
        ? `${state.context.appMeta.name} - ${state.context.authRequest.hostname}`
        : state.context.authRequest.hostname

      authenticationTracking.authModalOpened({
        authTarget,
      })
    }
  }, [state])

  React.useEffect(() => {
    handleTrackAuthModalOpened()
  }, [handleTrackAuthModalOpened])

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
          onReset={() => send("RESET")}
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
