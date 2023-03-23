import { useMachine } from "@xstate/react"
import React from "react"

import { BlurredLoader } from "@nfid-frontend/ui"

import { AuthenticationCoordinator } from "frontend/coordination/authentication"
import { TrustDeviceCoordinator } from "frontend/coordination/trust-device"
import { AuthenticationActor } from "frontend/state/machines/authentication/authentication"
import { TrustDeviceActor } from "frontend/state/machines/authentication/trust-device"

import { ProcedureApprovalCoordinator } from "./components/procedure-approval-coordinator"
import { NFIDEmbedMachineV2 } from "./machine-v2"

export default function NFIDEmbedCoordinator() {
  const [state, send] = useMachine(NFIDEmbedMachineV2)
  console.debug("NFIDEmbedCoordinator")

  React.useEffect(
    () =>
      console.log("NFIDEmbedCoordinator", {
        context: state.context,
        state: state.value,
      }),
    [state.value, state.context],
  )

  switch (true) {
    case state.matches("AUTH.Authenticate"):
      return (
        <AuthenticationCoordinator
          actor={
            state.children[
              "NFIDEmbedMachineV2.AUTH.Authenticate:invocation[0]"
            ] as AuthenticationActor
          }
        />
      )
    case state.matches("AUTH.TrustDevice"):
      return (
        <TrustDeviceCoordinator
          actor={
            state.children[
              "NFIDEmbedMachineV2.AUTH.TrustDevice:invocation[0]"
            ] as TrustDeviceActor
          }
        />
      )
    case state.matches("HANDLE_PROCEDURE.AWAIT_PROCEDURE_APPROVAL"):
      if (!state.context.rpcMessage) throw new Error("missing rpcMessage")
      if (!state.context.authSession) throw new Error("missing authSession")

      return (
        <ProcedureApprovalCoordinator
          appMeta={state.context.appMeta}
          authSession={state.context.authSession}
          rpcMessage={state.context.rpcMessage}
          rpcMessageDecoded={state.context.rpcMessageDecoded}
          onConfirm={(data) => {
            console.debug("onConfirm", { data })
            send({ type: "APPROVE", data })
          }}
        />
      )
    case state.matches("HANDLE_PROCEDURE.EXECUTE_PROCEDURE"):
      return <BlurredLoader isLoading />
    default:
      return <div>NFIDEmbedCoordinator</div>
  }
}
