import { useMachine } from "@xstate/react"
import { ModalComponent } from "@nfid-frontend/ui"
import { useMemo } from "react"

import { BlurredLoader, ScreenResponsive } from "@nfid-frontend/ui"

import AuthenticationCoordinator from "../authentication/root/coordinator"
import { AuthenticationMachineActor } from "../authentication/root/root-machine"
import { NFIDEmbedMachineV2 } from "./machine-v2"
import { ProcedureApprovalCoordinator } from "./procedure-approval-coordinator"
import { PageError } from "./ui/error"

export default function NFIDEmbedCoordinator() {
  const [state, send] = useMachine(NFIDEmbedMachineV2)
  console.debug("NFIDEmbedCoordinator")

  const Component = useMemo(() => {
    switch (true) {
      case state.matches("HANDLE_PROCEDURE.EXECUTE_PROCEDURE"):
      case state.matches("AUTH.CheckAppMeta"):
      case state.matches("AUTH.CheckAuthentication"):
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

      case state.matches("AUTH.Authenticate"):
        return (
          <AuthenticationCoordinator
            isEmbed
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
      case state.matches("HANDLE_PROCEDURE.ERROR"):
        return (
          <PageError
            error={state.context.error}
            onCancel={() => send({ type: "CANCEL_ERROR" })}
            onRetry={() => send({ type: "RETRY" })}
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
