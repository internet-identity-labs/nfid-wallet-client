import { useMachine } from "@xstate/react"
import { ModalComponent } from "@nfid-frontend/ui"
import { useMemo } from "react"

import { BlurredLoader, ScreenResponsive } from "@nfid-frontend/ui"

import AuthenticationCoordinator from "../authentication/root/coordinator"
import { AuthenticationMachineActor } from "../authentication/root/root-machine"
import { NFIDEmbedMachine } from "./machine"
import { ProcedureApprovalCoordinator } from "./procedure-approval-coordinator"
import { PageError } from "./ui/error"

type EmbedStateValue = {
  RPC_RECEIVER: string
  AUTH: string
  HANDLE_PROCEDURE: string
}

export default function NFIDEmbedCoordinator() {
  const [state, send] = useMachine(NFIDEmbedMachine)
  console.debug("NFIDEmbedCoordinator")

  const Component = useMemo(() => {
    const sv = state.value as EmbedStateValue

    switch (true) {
      case sv.AUTH === "Authenticate":
        return (
          <AuthenticationCoordinator
            isEmbed
            actor={
              state.children[
                "NFIDEmbedMachine.AUTH.Authenticate:invocation[0]"
              ] as AuthenticationMachineActor
            }
          />
        )
      case sv.HANDLE_PROCEDURE === "AWAIT_PROCEDURE_APPROVAL":
        if (!state.context.rpcMessage) throw new Error("missing rpcMessage")
        if (!state.context.authSession) throw new Error("missing authSession")

        return (
          <ProcedureApprovalCoordinator
            appMeta={state.context.appMeta}
            authSession={state.context.authSession}
            authRequest={state.context.authRequest}
            rpcMessage={state.context.rpcMessage}
            onConfirm={(data) => {
              console.debug("onConfirm", { data })
              send({ type: "APPROVE", data })
            }}
            onRequestICDelegation={(data) => {
              send({
                type: "APPROVE_IC_GET_DELEGATION",
                data: data,
              })
            }}
            onRequestICTransfer={(data) => {
              console.debug("ProcedureApprovalCoordinator.requestTransfer", {
                data,
              })
              send({
                type: "APPROVE_IC_REQUEST_TRANSFER",
                data: data,
              })
            }}
            onReset={() => send({ type: "RESET" })}
            onReject={() => send({ type: "CANCEL" })}
          />
        )
      case sv.HANDLE_PROCEDURE === "ERROR":
        return (
          <PageError
            error={state.context.error}
            onCancel={() => send({ type: "CANCEL_ERROR" })}
            onRetry={() => send({ type: "RETRY" })}
          />
        )
      default:
        return (
          <BlurredLoader
            isLoading
            loadingMessage={
              state.context.rpcMessage?.method === "eth_accounts" &&
              "Requesting account..."
            }
          />
        )
    }
  }, [send, state])

  return (
    <ModalComponent
      onClose={() => send({ type: "CANCEL" })}
      isVisible
      className="w-full !relative sm:!fixed"
    >
      <ScreenResponsive modalClassName="sm:!h-[630px]">
        {Component}
      </ScreenResponsive>
    </ModalComponent>
  )
}
