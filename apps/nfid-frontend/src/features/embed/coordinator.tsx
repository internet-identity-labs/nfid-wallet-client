import { useMachine } from "@xstate/react"
import { ModalComponent } from "@nfid-frontend/ui"
import { useMemo } from "react"

import { BlurredLoader, ScreenResponsive } from "@nfid-frontend/ui"

import AuthenticationCoordinator from "../authentication/root/coordinator"
import { AuthenticationMachineActor } from "../authentication/root/root-machine"
import { NFIDEmbedMachine } from "./machine"
import { ProcedureApprovalCoordinator } from "./procedure-approval-coordinator"
import { PageError } from "./ui/error"

export default function NFIDEmbedCoordinator() {
  const [state, send] = useMachine(NFIDEmbedMachine)
  const matches = (value: string) =>
    (state as unknown as { matches: (v: string) => boolean }).matches(value)
  const children = (state as unknown as { children: Record<string, unknown> })
    .children

  const Component = useMemo(() => {
    switch (true) {
      case matches("AUTH.CheckAppMeta"):
      case matches("AUTH.CheckAuthentication"):
        return (
          <BlurredLoader
            isLoading
            loadingMessage={
              state.context.rpcMessage?.method === "eth_accounts" &&
              "Requesting account..."
            }
          />
        )
      case matches("AUTH.Authenticate"):
        return (
          <AuthenticationCoordinator
            isEmbed
            actor={
              (children.AuthenticationMachine ??
                children[
                  "AuthenticationMachine"
                ]) as unknown as AuthenticationMachineActor
            }
          />
        )
      case matches("HANDLE_PROCEDURE.AWAIT_PROCEDURE_APPROVAL"):
        if (!state.context.rpcMessage) throw new Error("missing rpcMessage")
        if (!state.context.authSession) {
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

        return (
          <ProcedureApprovalCoordinator
            appMeta={state.context.appMeta}
            authSession={state.context.authSession}
            authRequest={state.context.authRequest}
            rpcMessage={state.context.rpcMessage}
            onConfirm={(data) => {
              send({ type: "APPROVE", data })
            }}
            onRequestICDelegation={(data) => {
              send({
                type: "APPROVE_IC_GET_DELEGATION",
                data: data,
              })
            }}
            onRequestICTransfer={(data) => {
              send({
                type: "APPROVE_IC_REQUEST_TRANSFER",
                data: data,
              })
            }}
            onReset={() => send({ type: "RESET" })}
            onReject={() => send({ type: "CANCEL" })}
          />
        )
      case matches("HANDLE_PROCEDURE.ERROR"):
        return (
          <PageError
            error={state.context.error}
            onCancel={() => send({ type: "CANCEL_ERROR" })}
            onRetry={() => send({ type: "RETRY" })}
          />
        )
      case matches("HANDLE_PROCEDURE.EXECUTE_PROCEDURE"):
      case matches("AUTH.CheckAppMeta"):
      case matches("AUTH.CheckAuthentication"):
      case matches("AUTH.Authenticated"):
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
      onClose={() => {
        send({ type: "CANCEL" })
      }}
      isVisible
      className="w-full !relative sm:!fixed"
    >
      <ScreenResponsive modalClassName="sm:!h-[630px]">
        {Component}
      </ScreenResponsive>
    </ModalComponent>
  )
}
