import { useMachine } from "@xstate/react"
import { ModalComponent } from "@nfid-frontend/ui"
import { useEffect, useMemo } from "react"

import { BlurredLoader, ScreenResponsive } from "@nfid-frontend/ui"

import AuthenticationCoordinator from "../authentication/root/coordinator"
import { AuthenticationMachineActor } from "../authentication/root/root-machine"
import { NFIDEmbedMachine } from "./machine"
import { ProcedureApprovalCoordinator } from "./procedure-approval-coordinator"
import { PageError } from "./ui/error"

export default function NFIDEmbedCoordinator() {
  const [state, send] = useMachine(NFIDEmbedMachine)

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug("[/embed] NFIDEmbedMachine state", {
      value: state.value,
      method: state.context.rpcMessage?.method,
      origin: state.context.rpcMessage?.origin,
      hasAuthSession: !!state.context.authSession,
      hasAppMeta: !!state.context.appMeta,
      hasAuthRequest: !!state.context.authRequest,
      error: state.context.error?.message,
    })
  }, [state.value])

  useEffect(() => {
    const s = state as any
    const uiBranch = s.matches("AUTH.Authenticate")
      ? "AUTH.Authenticate → AuthenticationCoordinator"
      : s.matches("HANDLE_PROCEDURE.AWAIT_PROCEDURE_APPROVAL")
        ? "AWAIT_PROCEDURE_APPROVAL → ProcedureApproval"
        : s.matches("HANDLE_PROCEDURE.ERROR")
          ? "HANDLE_PROCEDURE.ERROR"
          : s.matches("HANDLE_PROCEDURE.EXECUTE_PROCEDURE") ||
              s.matches("AUTH.CheckAppMeta") ||
              s.matches("AUTH.CheckAuthentication") ||
              s.matches("AUTH.Authenticated")
            ? "loader (busy / authenticated-wait)"
            : "default-loader"
    // eslint-disable-next-line no-console
    console.debug("[/embed] NFIDEmbedCoordinator UI branch", {
      uiBranch,
      value: state.value,
    })
  }, [state])

  const Component = useMemo(() => {
    switch (true) {
      case (state as any).matches("AUTH.CheckAppMeta"):
      case (state as any).matches("AUTH.CheckAuthentication"):
        return (
          <BlurredLoader
            isLoading
            loadingMessage={
              state.context.rpcMessage?.method === "eth_accounts" &&
              "Requesting account..."
            }
          />
        )
      case (state as any).matches("AUTH.Authenticate"):
        return (
          <AuthenticationCoordinator
            isEmbed
            actor={
              (state.children as any)
                .AuthenticationMachine as AuthenticationMachineActor
            }
          />
        )
      case (state as any).matches("HANDLE_PROCEDURE.AWAIT_PROCEDURE_APPROVAL"):
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
      case (state as any).matches("HANDLE_PROCEDURE.ERROR"):
        return (
          <PageError
            error={state.context.error}
            onCancel={() => send({ type: "CANCEL_ERROR" })}
            onRetry={() => send({ type: "RETRY" })}
          />
        )
      case (state as any).matches("HANDLE_PROCEDURE.EXECUTE_PROCEDURE"):
      case (state as any).matches("AUTH.CheckAppMeta"):
      case (state as any).matches("AUTH.CheckAuthentication"):
      case (state as any).matches("AUTH.Authenticated"):
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
        // eslint-disable-next-line no-console
        console.debug("[/embed] user closed modal")
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
