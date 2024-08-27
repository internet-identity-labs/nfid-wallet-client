import { useMachine } from "@xstate/react"
import { useMemo } from "react"

import { BlurredLoader } from "@nfid-frontend/ui"
import { authState } from "@nfid/integration"

import AuthenticationCoordinator from "../authentication/root/coordinator"
import { AuthenticationMachineActor } from "../authentication/root/root-machine"
import { RPCComponentError } from "./components/error"
import { RPCComponent, RPCComponentsUI } from "./components/methods/method"
import { RPCTemplate } from "./components/templates/template"
import "./index.css"
import { IdentityKitRPCMachine } from "./machine"

export default function IdentityKitRPCCoordinator() {
  const [state, send] = useMachine(IdentityKitRPCMachine)
  console.debug("IdentityKitRPCCoordinator", { state })
  const isApproveRequestInProgress =
    state.context.activeRequest?.data.method === "icrc49_call_canister"

  const Component = useMemo(() => {
    switch (true) {
      case state.matches("Main.Authentication.CheckAuthentication"):
        return (
          <BlurredLoader
            isLoading
            loadingMessage={`Loading your digital fortress...`}
          />
        )
      case state.matches("Main.Authentication.Authenticate"):
        return (
          <AuthenticationCoordinator
            isIdentityKit
            actor={
              state.children[
                "IdentityKitRPCMachine.Main.Authentication.Authenticate:invocation[0]"
              ] as AuthenticationMachineActor
            }
          />
        )
      case state.matches("Main.InteractiveRequest.PromptInteractiveRequest"):
        return (
          <RPCComponent
            method={
              String(
                state.context.activeRequest?.data.method,
              ) as RPCComponentsUI
            }
            props={{
              onApprove: (data: any) =>
                send({ type: "ON_APPROVE", data: data }),
              onReject: () => send({ type: "ON_CANCEL" }),
              onBack: async () => {
                await authState.logout(false)
                send({ type: "ON_BACK" })
              },
              request: state.context.activeRequest,
              ...state.context.componentData,
            }}
          />
        )
      case state.matches("Main.InteractiveRequest.PrepareComponentData"):
        return (
          <BlurredLoader
            isLoading
            loadingMessage={`Fetching your crypto coordinates...`}
          />
        )
      case state.matches("Main.InteractiveRequest.Error"):
        return (
          <RPCComponentError
            onRetry={() => send({ type: "TRY_AGAIN" })}
            onCancel={() => send({ type: "ON_CANCEL" })}
            args={state.context.componentData?.args}
            error={state.context.error}
            request={state.context.activeRequest}
          />
        )
      default:
        return (
          <BlurredLoader
            isLoading
            loadingMessage={`Making crypto magic happen...`}
          />
        )
    }
  }, [send, state])

  if (!state.context.activeRequestMetadata)
    return (
      <BlurredLoader
        isLoading={true}
        loadingMessage="Waiting for incoming request..."
      />
    )

  return (
    <RPCTemplate isApproveRequestInProgress={isApproveRequestInProgress}>
      {Component}
    </RPCTemplate>
  )
}
