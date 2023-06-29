import { useMachine } from "@xstate/react"
import React from "react"

import IDPMachine, {
  IDPMachineType,
} from "frontend/features/authentication/idp"
import { AuthenticationActor } from "frontend/state/machines/authentication/authentication"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"
import { ErrorBanner } from "frontend/ui/molecules/error-banner"

import { AuthenticationCoordinator } from "./authentication"

interface Props {
  machine?: IDPMachineType
  successPath?: string
}

export default function IDPCoordinator({ machine }: Props) {
  const [state, send] = useMachine(machine || IDPMachine)

  React.useEffect(
    () =>
      console.debug("IDPCoordinator", {
        context: state.context,
        state: state.value,
      }),
    [state.value, state.context],
  )

  switch (true) {
    case state.matches("Start.Handshake.Error"):
      return (
        <ErrorBanner
          errorMessage={state.context.error?.message}
          onRetry={() => send("RETRY")}
        />
      )
    case state.matches("AuthenticationMachine"):
      return (
        <AuthenticationCoordinator
          actor={state.children.authenticate as AuthenticationActor}
        />
      )
    // case state.matches("AuthorizationMachine"):
    //   return (
    //     <AuthorizationCoordinator
    //       actor={state.children.authorize as AuthorizationActor}
    //     />
    //   )
    case state.matches("End"):
    case state.matches("Start"):
    default:
      return <BlurredLoader isLoading />
  }
}
