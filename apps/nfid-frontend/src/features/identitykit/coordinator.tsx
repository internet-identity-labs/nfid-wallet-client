import { useMachine } from "@xstate/react"
import React, { useMemo } from "react"

import { BlurredLoader, ScreenResponsive } from "@nfid-frontend/ui"

import { ModalComponent } from "frontend/ui/molecules/modal/index-v0"

import AuthenticationCoordinator from "../authentication/root/coordinator"
import { AuthenticationMachineActor } from "../authentication/root/root-machine"
import { RPCComponent, RPCComponentsUI } from "./components/methods/method"
import { IdentityKitRPCMachine } from "./machine"

export default function IdentityKitRPCCoordinator() {
  const [state, send] = useMachine(IdentityKitRPCMachine)
  console.debug("IdentityKitRPCCoordinator")

  React.useEffect(
    () =>
      console.log("IdentityKitRPCCoordinator", {
        context: state.context,
        state: state.value,
        children: state.children,
      }),
    [state.value, state.context, state.children],
  )

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
      default:
        return (
          <BlurredLoader
            isLoading
            loadingMessage={`Making crypto magic happen...`}
          />
        )
    }
  }, [send, state])

  return (
    <ModalComponent
      onClose={() => send({ type: "ON_CANCEL" })}
      isVisible
      className="w-full sm:w-[450px] h-auto"
    >
      <ScreenResponsive className="min-h-full">{Component}</ScreenResponsive>
    </ModalComponent>
  )
}
