import { useMachine } from "@xstate/react"
import React from "react"

import { BlurredLoader } from "@nfid-frontend/ui"

import AuthenticationCoordinator from "../authentication/root/coordinator"
import { AuthenticationMachineActor } from "../authentication/root/root-machine"
import { NFIDEmbedMachineV2 } from "./machine-v2"
import { ProcedureApprovalCoordinator } from "./procedure-approval-coordinator"
import { PageError } from "./ui/error"

export default function NFIDEmbedCoordinator() {
  const [state, send] = useMachine(NFIDEmbedMachineV2)
  console.debug("NFIDEmbedCoordinator")

  React.useEffect(
    () =>
      console.log("NFIDEmbedCoordinator", {
        context: state.context,
        state: state.value,
        children: state.children,
      }),
    [state.value, state.context, state.children],
  )

  switch (true) {
    case state.matches("HANDLE_PROCEDURE.EXECUTE_PROCEDURE"):
    case state.matches("AUTH.CheckAppMeta"):
    case state.matches("AUTH.CheckAuthentication"):
    default:
      return <BlurredLoader isLoading />

    case state.matches("AUTH.Authenticate"):
      return (
        <AuthenticationCoordinator
          actor={
            state.children[
              "NFIDEmbedMachineV2.AUTH.Authenticate:invocation[0]"
            ] as AuthenticationMachineActor
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
          onReject={() => send({ type: "CANCEL" })}
        />
      )
    case state.matches("HANDLE_PROCEDURE.ERROR"):
      return (
        <PageError
          error={state.context.error}
          onCancel={() => send({ type: "CANCEL_ERROR" })}
          onRetry={() => send({ type: "RETRY" })}
        />
      )
  }
}
