import { useMachine } from "@xstate/react"
import { useEffect, useMemo, useState } from "react"
import { Helmet } from "react-helmet-async"

import { BlurredLoader } from "@nfid-frontend/ui"
import { authState } from "@nfid/integration"

import AuthenticationCoordinator from "../authentication/root/coordinator"
import { AuthenticationMachineActor } from "../authentication/root/root-machine"
import { RPCComponentError } from "./components/error"
import { RPCComponent, RPCComponentsUI } from "./components/methods/method"
import { RPCTemplate } from "./components/templates/template"
import "./index.css"
import { IdentityKitRPCMachine } from "./machine"

const LOADING_MESSAGES = [
  "Fetching your crypto coordinates...",
  "Logging in like a boss...",
  "Making crypto magic happen...",
  "Loading your digital fortress...",
]

function getRandomLoadingMessage() {
  return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
}

export default function IdentityKitRPCCoordinator() {
  const [state, send] = useMachine(IdentityKitRPCMachine)
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug("[/rpc] IdentityKitRPCMachine state", {
      value: state.value,
      method: state.context.activeRequest?.data?.method,
      origin: state.context.activeRequest?.origin,
      hasMetadata: !!state.context.activeRequestMetadata,
      hasComponentData: !!state.context.componentData,
      error: state.context.error?.message,
    })
  }, [state.value])
  const isApproveRequestInProgress =
    state.context.activeRequest?.data.method === "icrc49_call_canister"

  const [isFirstRender, setIsFirstRender] = useState(true)

  useEffect(() => {
    setIsFirstRender(false)
  }, [state])

  const Component = useMemo(() => {
    switch (true) {
      case (state as any).matches("Main.Authentication.Authenticate"):
        return (
          <AuthenticationCoordinator
            isIdentityKit
            actor={
              (state.children as any)
                .AuthenticationMachine as AuthenticationMachineActor
            }
            loader={
              <BlurredLoader
                isLoading
                loadingMessage={getRandomLoadingMessage()}
              />
            }
          />
        )
      case (state as any).matches(
        "Main.InteractiveRequest.PromptInteractiveRequest",
      ):
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
      case (state as any).matches("Main.InteractiveRequest.Error"):
        return (
          <RPCComponentError
            onRetry={() => send({ type: "TRY_AGAIN" })}
            onCancel={() => send({ type: "ON_CANCEL" })}
            args={state.context.componentData?.args}
            consentMessage={state.context.componentData?.consentMessage}
            error={state.context.error}
            request={state.context.activeRequest}
          />
        )
      default:
        return (
          <BlurredLoader isLoading loadingMessage={getRandomLoadingMessage()} />
        )
    }
  }, [send, state])

  if (!state.context.activeRequestMetadata && isFirstRender)
    return (
      <BlurredLoader
        isLoading={true}
        loadingMessage="Waiting for incoming request..."
      />
    )

  return (
    <RPCTemplate isApproveRequestInProgress={isApproveRequestInProgress}>
      <Helmet>
        <meta name="theme-color" content="#043E36" />
      </Helmet>
      {Component}
    </RPCTemplate>
  )
}
